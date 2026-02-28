import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { MdArrowBack, MdSend, MdSmartToy, MdMenu, MdAdd, MdMoreVert, MdEdit, MdDelete, MdExpandMore, MdExpandLess } from 'react-icons/md';
import { Layout } from '../components/layout/Layout';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import { ShimmerBase } from '../components/common/Shimmer';
import { zezinApi } from '../services/zezinApi';
import { showError } from '../utils/notifications';
import type { ZezinSuggestedQuestion, ZezinHistoryItem, ZezinThreadSummary } from '../types/zezin';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// --- Helpers ---
function historyToMessages(history: ZezinHistoryItem[]): ChatMessage[] {
  const list: ChatMessage[] = [];
  (history || []).forEach(item => {
    list.push({ id: `user-${item.id}`, role: 'user', content: item?.message ?? '' });
    list.push({ id: `assistant-${item.id}`, role: 'assistant', content: item?.answer ?? '' });
  });
  return list;
}

const truncate = (text: string, max: number) =>
  (text || '').trim().length <= max ? (text || '').trim() : (text || '').trim().slice(0, max) + '…';

/** Gera título para o histórico a partir da pergunta do usuário (primeira frase ou até max caracteres). */
function getConversationTitle(userMessage: string, maxLength: number = 48): string {
  const trimmed = (userMessage || '').trim();
  if (!trimmed) return '';
  const firstLine = trimmed.split(/\n/)[0].trim();
  const firstSentence = (firstLine.split(/[.!?]/)[0] || firstLine).trim() || firstLine;
  if (firstSentence.length <= maxLength) return firstSentence;
  const cut = firstSentence.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  const end = lastSpace > maxLength * 0.6 ? lastSpace : maxLength;
  return cut.slice(0, end).trim() + '…';
}

/** Gera resumo curto da pergunta para título (mesma lógica do backend). */
function shortTitleFromMessage(message: string, maxLen: number = 42): string {
  const t = (message || '').trim();
  if (!t) return 'Conversa';
  if (t.length <= maxLen) return t;
  const cut = t.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  const end = lastSpace > 28 ? lastSpace : maxLen;
  return cut.slice(0, end).trim() + '…';
}

/** Título exibido no item do histórico: título salvo (resumo) ou fallback. */
function getHistoryItemTitle(item: ZezinHistoryItem): string {
  if (item.title && item.title.trim()) return item.title.trim();
  const fromMessage = shortTitleFromMessage(item.message || '');
  if (fromMessage && fromMessage !== 'Conversa') return fromMessage;
  const fromAnswer = (item.answer || '').trim();
  if (fromAnswer) return truncate(fromAnswer, 48);
  return 'Conversa';
}

/** Formata data/hora para exibir no item do histórico (ex: "Hoje 14:30", "19 fev"). */
function formatConversationDate(createdAt: string): string {
  if (!createdAt) return '';
  const d = new Date(createdAt);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  if (isToday) return `Hoje ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Ontem';
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
}

const isNoApiConfiguredAnswer = (answer: string): boolean =>
  answer.includes('chave de IA') ||
  answer.includes('OPENAI_API_KEY') ||
  answer.includes('não estou pronto para responder') ||
  answer.includes('administrador do sistema precisa configurar') ||
  answer.includes('Configure OPENAI_API_KEY');

const ZezinIcon = () => <span style={{ fontSize: '1.25rem' }} title="Zezin">🤖</span>;

// --- Layout: sidebar + main ---
const PageContainer = styled.div`
  height: calc(100vh - 72px - 48px);
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: ${props => props.theme.colors?.background || '#f8fafc'};
  @media (max-width: 768px) {
    height: calc(100vh - 62px - 32px);
  }
`;

const ZezinLayout = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;
  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

const Sidebar = styled.aside<{ $open: boolean }>`
  width: 280px;
  min-width: 280px;
  min-height: 0;
  border-right: 1px solid ${props => props.theme.colors?.border || '#e2e8f0'};
  background: ${props => props.theme.colors?.cardBackground || '#fff'};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  @media (max-width: 900px) {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 100;
    transform: translateX(${p => (p.$open ? '0' : '-100%')});
    transition: transform 0.25s ease;
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.08);
  }
`;

const SidebarHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${props => props.theme.colors?.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const NewChatBtn = styled.button.attrs({ type: 'button' })`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  width: 100%;
  border: 1px dashed ${props => props.theme.colors?.border};
  border-radius: 12px;
  background: transparent;
  color: ${props => props.theme.colors?.text};
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    border-color: #8b5cf6;
    background: rgba(139, 92, 246, 0.06);
    color: #8b5cf6;
  }
  &:focus {
    outline: none;
    border-color: #8b5cf6;
  }
`;

const SidebarTitle = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${props => props.theme.colors?.textSecondary};
  padding: 12px 16px 6px;
`;

const ConversationList = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 8px 12px 24px;
`;

const HistoryItemWrap = styled.div`
  display: flex;
  align-items: stretch;
  gap: 4px;
  margin-bottom: 4px;
  position: relative;
`;

const ConversationItem = styled.button<{ $active?: boolean }>`
  flex: 1;
  min-width: 0;
  text-align: left;
  padding: 12px 14px;
  border: none;
  border-radius: 12px;
  background: ${p => (p.$active ? 'rgba(139, 92, 246, 0.12)' : 'transparent')};
  color: ${props => props.theme.colors?.text};
  font-size: 0.875rem;
  line-height: 1.4;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${p => (p.$active ? 'rgba(139, 92, 246, 0.18)' : 'rgba(0,0,0,0.04)')};
  }
`;

const MenuBtn = styled.button.attrs({ type: 'button' })`
  flex-shrink: 0;
  padding: 8px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: ${props => props.theme.colors?.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(0, 0, 0, 0.06);
    color: ${props => props.theme.colors?.text};
  }
`;

const Dropdown = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 4px;
  min-width: 160px;
  background: ${props => props.theme.colors?.cardBackground || '#fff'};
  border: 1px solid ${props => props.theme.colors?.border};
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 50;
  overflow: hidden;
`;

const DropdownItem = styled.button.attrs({ type: 'button' })`
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: none;
  color: ${props => props.theme.colors?.text};
  font-size: 0.875rem;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

const EditTitleOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const EditTitleBox = styled.div`
  background: ${props => props.theme.colors?.cardBackground || '#fff'};
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
`;

const EditTitleInput = styled.input`
  width: 100%;
  padding: 12px 14px;
  border: 1px solid ${props => props.theme.colors?.border};
  border-radius: 10px;
  font-size: 0.9375rem;
  margin-bottom: 16px;
  box-sizing: border-box;
`;

const EditTitleActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const EditTitleBtn = styled.button.attrs({ type: 'button' })<{ $primary?: boolean }>`
  padding: 10px 18px;
  border-radius: 10px;
  border: none;
  font-size: 0.9375rem;
  cursor: pointer;
  background: ${p => (p.$primary ? '#8b5cf6' : 'transparent')};
  color: ${p => (p.$primary ? '#fff' : p.theme.colors?.text)};

  &:hover {
    opacity: 0.9;
  }
`;

const ConversationItemTitle = styled.span`
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
  color: ${props => props.theme.colors?.text};
`;

const ConversationPreview = styled.span`
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${props => props.theme.colors?.textSecondary};
  font-size: 0.8125rem;
  margin-top: 2px;
`;

const VerMaisBtn = styled.button.attrs({ type: 'button' })`
  width: 100%;
  padding: 10px 14px;
  margin-top: 8px;
  border: 1px solid ${props => props.theme.colors?.border};
  border-radius: 12px;
  background: transparent;
  color: ${props => props.theme.colors?.textSecondary};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    border-color: #8b5cf6;
    color: #8b5cf6;
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const HistoryShimmerRow = styled.div`
  padding: 12px 14px;
  margin-bottom: 4px;
  border-radius: 12px;
`;

const HistoryShimmerTitle = styled(ShimmerBase)`
  height: 14px;
  border-radius: 6px;
  margin-bottom: 8px;
  width: 85%;
`;

const HistoryShimmerDate = styled(ShimmerBase)`
  height: 12px;
  border-radius: 4px;
  width: 45%;
`;

const MainArea = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: ${props => props.theme.colors?.background || '#f8fafc'};
`;

const MainHeader = styled.header`
  flex-shrink: 0;
  padding: 14px 20px;
  border-bottom: 1px solid ${props => props.theme.colors?.border};
  background: ${props => props.theme.colors?.cardBackground || '#fff'};
  display: flex;
  align-items: center;
  gap: 12px;
`;

const MenuButton = styled.button`
  display: none;
  padding: 8px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: ${props => props.theme.colors?.text};
  cursor: pointer;
  @media (max-width: 900px) {
    display: flex;
  }
`;

const HeaderTitle = styled.h1`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${props => props.theme.colors?.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BackButton = styled.button`
  margin-left: auto;
  flex-shrink: 0;
  padding: 8px 14px;
  border: 1px solid ${props => props.theme.colors?.border};
  border-radius: 10px;
  background: transparent;
  color: ${props => props.theme.colors?.text};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors?.primary};
    color: white;
    border-color: ${props => props.theme.colors?.primary};
  }
`;

const ChatScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 0;
`;

const MessageBubble = styled.div<{ $isUser?: boolean }>`
  max-width: 85%;
  align-self: ${p => (p.$isUser ? 'flex-end' : 'flex-start')};
  padding: 16px 20px;
  border-radius: 20px;
  font-size: 0.9375rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);

  ${p =>
    p.$isUser
      ? `
    background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
    color: white;
    border-bottom-right-radius: 6px;
  `
      : `
    background: ${p.theme.colors?.cardBackground || '#fff'};
    border: 1px solid ${p.theme.colors?.border || '#e2e8f0'};
    color: ${p.theme.colors?.text};
    border-bottom-left-radius: 6px;
  `}
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 0.8125rem;
`;

const Avatar = styled.div<{ $isUser?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  ${p =>
    p.$isUser
      ? 'background: rgba(255,255,255,0.35); color: white;'
      : 'background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); color: white;'}
`;

const bounce = keyframes`
  0%, 80%, 100% { transform: scale(0.75); opacity: 0.6; }
  40% { transform: scale(1); opacity: 1; }
`;

const LoadingDots = styled.span`
  display: inline-flex;
  gap: 5px;
  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    animation: ${bounce} 1s ease-in-out infinite both;
    &:nth-child(2) { animation-delay: 0.12s; }
    &:nth-child(3) { animation-delay: 0.24s; }
  }
`;

const TypewriterCursor = styled.span`
  display: inline-block;
  width: 2px;
  height: 1.1em;
  background: currentColor;
  margin-left: 1px;
  vertical-align: text-bottom;
  animation: blink 0.8s step-end infinite;
  @keyframes blink {
    50% { opacity: 0; }
  }
`;

const WelcomeCard = styled.div`
  max-width: 560px;
  padding: 24px 28px;
  border-radius: 20px;
  background: ${props => props.theme.colors?.cardBackground || '#fff'};
  border: 1px solid ${props => props.theme.colors?.border};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
`;

const WelcomeText = styled.p`
  margin: 0 0 20px;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: ${props => props.theme.colors?.text};
`;

const SuggestionsTitle = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${props => props.theme.colors?.textSecondary};
  margin-bottom: 12px;
`;

const SuggestionsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const SuggestionChip = styled.button`
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors?.border};
  background: ${props => props.theme.colors?.background};
  color: ${props => props.theme.colors?.text};
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    border-color: #7c3aed;
    background: rgba(124, 58, 237, 0.08);
    color: #7c3aed;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const InputArea = styled.div`
  flex-shrink: 0;
  padding: 16px 20px 24px;
  border-top: 1px solid ${props => props.theme.colors?.border};
  background: ${props => props.theme.colors?.cardBackground || '#fff'};
`;

const InputRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-end;
  max-width: 800px;
  margin: 0 auto;
`;

const TextArea = styled.textarea`
  flex: 1;
  min-height: 52px;
  max-height: 160px;
  padding: 14px 18px;
  border: 1px solid ${props => props.theme.colors?.border};
  border-radius: 16px;
  font-size: 1rem;
  font-family: inherit;
  background: ${props => props.theme.colors?.background};
  color: ${props => props.theme.colors?.text};
  resize: none;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: #7c3aed;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  &::placeholder {
    color: ${props => props.theme.colors?.textSecondary};
  }
`;

const ToggleSuggestionsIconBtn = styled.button.attrs({ type: 'button' })`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  min-height: 52px;
  border: 1px solid ${props => props.theme.colors?.border};
  border-radius: 16px;
  background: ${props => props.theme.colors?.background};
  color: ${props => props.theme.colors?.textSecondary};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #8b5cf6;
    color: #8b5cf6;
    background: rgba(139, 92, 246, 0.06);
  }
`;

const SendButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 22px;
  min-height: 52px;
  min-width: 110px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
  color: white;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(124, 58, 237, 0.35);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SuggestionsBlock = styled.div<{ $visible: boolean }>`
  max-width: 800px;
  margin: 12px auto 0;
  overflow: hidden;
  opacity: ${p => (p.$visible ? 1 : 0)};
  max-height: ${p => (p.$visible ? '120px' : '0')};
  pointer-events: ${p => (p.$visible ? 'auto' : 'none')};
  transition: opacity 0.25s ease, max-height 0.25s ease;
`;

const ToggleSuggestionsBtn = styled.button.attrs({ type: 'button' })<{ $variant: 'hide' | 'show' }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: ${p => (p.$variant === 'hide' ? '8px 14px' : '8px 12px')};
  margin-top: ${p => (p.$variant === 'hide' ? '16px' : '0')};
  border: 1px solid ${props => props.theme.colors?.border};
  border-radius: 20px;
  background: ${props => props.theme.colors?.background};
  color: ${props => props.theme.colors?.textSecondary};
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #8b5cf6;
    color: #8b5cf6;
    background: rgba(139, 92, 246, 0.06);
  }
`;

const ShowSuggestionsBar = styled.div`
  display: flex;
  justify-content: center;
  padding: 12px 0 8px;
`;

const SuggestionsLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${props => props.theme.colors?.textSecondary};
  display: block;
  margin-bottom: 8px;
`;

const ErrorMessage = styled.div`
  padding: 12px 16px;
  border-radius: 12px;
  background: ${props => (props.theme.colors?.error || '#dc2626')}15;
  border: 1px solid ${props => (props.theme.colors?.error || '#dc2626')}30;
  color: ${props => props.theme.colors?.error || '#dc2626'};
  font-size: 0.875rem;
  margin-top: 8px;
`;

const Overlay = styled.div<{ $show: boolean }>`
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 99;
  opacity: ${p => (p.$show ? 1 : 0)};
  pointer-events: ${p => (p.$show ? 'auto' : 'none')};
  transition: opacity 0.2s;
  @media (max-width: 900px) {
    display: block;
  }
`;

const TYPEWRITER_CHARS_PER_TICK = 2;
const TYPEWRITER_TICK_MS = 18;

const HISTORY_PAGE_SIZE = 10;
const ZEZIN_STORAGE_KEY = 'zezin_current_thread_id';

const ZezinAskPage: React.FC = () => {
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const streamingMessageIdRef = useRef<string | null>(null);
  const lastStreamingAnswerRef = useRef<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<ZezinSuggestedQuestion[]>([]);
  const [followUpSuggestions, setFollowUpSuggestions] = useState<ZezinSuggestedQuestion[]>([]);
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [availability, setAvailability] = useState<{ available: boolean } | null>(null);
  const [threads, setThreads] = useState<ZezinThreadSummary[]>([]);
  const [threadMessages, setThreadMessages] = useState<ZezinHistoryItem[]>([]);
  const [threadMessagesLoading, setThreadMessagesLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [sessionMessages, setSessionMessages] = useState<ChatMessage[]>([]);
  const [streamingDisplayedLength, setStreamingDisplayedLength] = useState(0);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [suggestionsVisible, setSuggestionsVisible] = useState(true);
  const [newConversationMode, setNewConversationMode] = useState(true);
  /** Id da seção/thread em que o usuário está (para o back saber de qual histórico pegar contexto e onde salvar). */
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const hasRestoredRef = useRef(false);
  /** Última mensagem enviada (para título otimista na sidebar sem refetch). */
  const lastSentMessageRef = useRef<string>('');

  // Restaurar thread salva (evita perder conversa e criar nova thread após remount)
  useEffect(() => {
    if (hasRestoredRef.current) return;
    hasRestoredRef.current = true;
    try {
      const saved = sessionStorage.getItem(ZEZIN_STORAGE_KEY);
      if (saved?.trim()) {
        setSelectedThreadId(saved);
        setCurrentSectionId(saved);
        setNewConversationMode(false);
        setThreadMessages([]);
        setSessionMessages([]);
      }
    } catch {
      // ignore
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const currentMessages = useMemo((): ChatMessage[] => {
    const fromThread = historyToMessages(threadMessages);
    return [...fromThread, ...sessionMessages];
  }, [threadMessages, sessionMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, scrollToBottom]);

  const loadingRef = useRef(loading);
  loadingRef.current = loading;

  useEffect(() => {
    const id = streamingMessageIdRef.current;
    if (!id) return;
    const msg = currentMessages.find(m => m.id === id);
    const targetLen = msg?.content?.length ?? 0;
    if (targetLen === 0) return;
    const timer = setInterval(() => {
      setStreamingDisplayedLength(prev => {
        const next = Math.min(prev + TYPEWRITER_CHARS_PER_TICK, targetLen);
        if (next >= targetLen && !loadingRef.current) {
          streamingMessageIdRef.current = null;
        }
        return next;
      });
    }, TYPEWRITER_TICK_MS);
    return () => clearInterval(timer);
  }, [currentMessages, loading]);

  const checkAvailability = useCallback(async () => {
    try {
      const data = await zezinApi.getAvailability();
      setAvailability(data);
    } catch {
      setAvailability({ available: false });
    }
  }, []);

  const loadSuggestions = useCallback(async () => {
    try {
      const data = await zezinApi.getSuggestedQuestions();
      setSuggestions(data.questions || []);
    } catch {
      setSuggestions([]);
    }
  }, []);

  const loadHistory = useCallback(async (options?: { limit?: number }) => {
    const limit = options?.limit ?? HISTORY_PAGE_SIZE;
    setHistoryLoading(true);
    try {
      const data = await zezinApi.getHistory(limit);
      setThreads(data?.threads ?? []);
    } catch (e: any) {
      console.error('[Zezin] Erro ao carregar histórico:', e);
      setThreads([]);
      showError(e?.message || 'Não foi possível carregar o histórico.');
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const loadThreadMessages = useCallback(async (threadId: string) => {
    setThreadMessagesLoading(true);
    try {
      const data = await zezinApi.getThreadMessages(threadId);
      setThreadMessages(data?.items ?? []);
    } catch (e: any) {
      console.error('[Zezin] Erro ao carregar mensagens da conversa:', e);
      setThreadMessages([]);
    } finally {
      setThreadMessagesLoading(false);
    }
  }, []);

  // Carregar mensagens da thread quando restauramos ou quando usuário escolhe conversa na sidebar
  useEffect(() => {
    if (!selectedThreadId || !availability?.available) return;
    loadThreadMessages(selectedThreadId);
  }, [selectedThreadId, availability?.available, loadThreadMessages]);

  const loadFollowUpSuggestions = useCallback(async () => {
    setFollowUpLoading(true);
    try {
      const data = await zezinApi.getSuggestedQuestionsFollowUp();
      setFollowUpSuggestions(data.questions || []);
    } catch {
      setFollowUpSuggestions([]);
    } finally {
      setFollowUpLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  useEffect(() => {
    if (availability?.available) {
      loadSuggestions();
      loadHistory();
    }
  }, [availability?.available, loadSuggestions]);

  // Atualizar lista do histórico só quando o usuário abre a sidebar (sem recarregar a cada mensagem)
  useEffect(() => {
    if (sidebarOpen && availability?.available) loadHistory();
  }, [sidebarOpen, availability?.available, loadHistory]);

  // Follow-up: só ao abrir uma thread com 2+ mensagens (não limpa para não dar flicker após enviar)
  useEffect(() => {
    if (!availability?.available || !selectedThreadId) return;
    if (threadMessages.length >= 2) loadFollowUpSuggestions();
  }, [availability?.available, selectedThreadId, threadMessages.length, loadFollowUpSuggestions]);

  const handleNewChat = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      sessionStorage.removeItem(ZEZIN_STORAGE_KEY);
    } catch {
      // ignore
    }
    setSelectedThreadId(null);
    setThreadMessages([]);
    setSessionMessages([]);
    setNewConversationMode(true);
    setCurrentSectionId(null);
    setSidebarOpen(false);
  }, []);

  const handleSelectConversation = useCallback((threadId: string) => {
    try {
      sessionStorage.setItem(ZEZIN_STORAGE_KEY, threadId);
    } catch {
      // ignore
    }
    setSelectedThreadId(threadId);
    setThreadMessages([]);
    setSessionMessages([]);
    setNewConversationMode(false);
    setCurrentSectionId(threadId);
    setSidebarOpen(false);
  }, []);

  const handleOpenEditTitle = useCallback((thread: ZezinThreadSummary) => {
    setOpenMenuId(null);
    setEditingTitleId(thread.threadId);
    setEditTitleValue(thread.title || '');
  }, []);

  const handleEditTitleSave = useCallback(async () => {
    if (!editingTitleId || !editTitleValue.trim()) return;
    const newTitle = editTitleValue.trim();
    try {
      await zezinApi.updateHistoryTitle(editingTitleId, newTitle);
      setThreads(prev =>
        prev.map(t => (t.threadId === editingTitleId ? { ...t, title: newTitle } : t)),
      );
      setEditingTitleId(null);
      setEditTitleValue('');
    } catch (e: any) {
      showError(e?.message || 'Não foi possível atualizar o título.');
    }
  }, [editingTitleId, editTitleValue]);

  const handleEditTitleClose = useCallback(() => {
    setEditingTitleId(null);
    setEditTitleValue('');
  }, []);

  const handleOpenDelete = useCallback((threadId: string) => {
    setOpenMenuId(null);
    setDeleteConfirmId(threadId);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteConfirmId) return;
    setDeleteLoading(true);
    try {
      await zezinApi.deleteThread(deleteConfirmId);
      setThreads(prev => prev.filter(t => t.threadId !== deleteConfirmId));
      if (selectedThreadId === deleteConfirmId) {
        try {
          sessionStorage.removeItem(ZEZIN_STORAGE_KEY);
        } catch {
          // ignore
        }
        setSelectedThreadId(null);
        setThreadMessages([]);
        setNewConversationMode(true);
        setCurrentSectionId(null);
      }
      setDeleteConfirmId(null);
    } catch (e: any) {
      showError(e?.message || 'Não foi possível excluir.');
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteConfirmId, selectedThreadId]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const handleSend = useCallback(
    async (text?: string) => {
      const toSend = (text ?? input).trim();
      if (!toSend || loading) return;
      setError(null);
      setInput('');
      lastSentMessageRef.current = toSend;
      const userMsgId = `user-${Date.now()}`;
      const assistantMsgId = `assistant-${Date.now()}`;
      streamingMessageIdRef.current = assistantMsgId;
      setStreamingDisplayedLength(0);
      setSessionMessages(prev => [
        ...prev,
        { id: userMsgId, role: 'user', content: toSend },
        { id: assistantMsgId, role: 'assistant', content: '' },
      ]);
      setLoading(true);

      lastStreamingAnswerRef.current = '';
      zezinApi.askStream(toSend, {
        onChunk: chunk => {
          lastStreamingAnswerRef.current += chunk;
          setSessionMessages(prev =>
            prev.map(m => (m.id === assistantMsgId ? { ...m, content: m.content + chunk } : m)),
          );
        },
        onDone: conversationId => {
          setLoading(false);
          if (conversationId) {
            try {
              sessionStorage.setItem(ZEZIN_STORAGE_KEY, conversationId);
            } catch {
              // ignore
            }
            setCurrentSectionId(conversationId);
            setSelectedThreadId(conversationId);
            setNewConversationMode(false);
            setThreads(prev => {
              const exists = prev.some(t => t.threadId === conversationId);
              if (exists) {
                return prev.map(t =>
                  t.threadId === conversationId
                    ? { ...t, updatedAt: new Date().toISOString(), messageCount: (t.messageCount ?? 1) + 1 }
                    : t,
                );
              }
              const title = getConversationTitle(lastSentMessageRef.current) || 'Conversa';
              return [
                { threadId: conversationId, title, updatedAt: new Date().toISOString(), messageCount: 1 },
                ...prev,
              ];
            });
            // Atualizar sidebar no próximo tick para não causar “reload” visual
          } else {
            setSessionMessages([]);
          }
          // Pequeno delay para o back ter commitado a conversa antes do findHistory (follow-up)
          setTimeout(() => loadFollowUpSuggestions(), 400);
        },
        onError: err => {
          const msg = err.message || 'Não foi possível obter resposta do Zezin.';
          setError(msg);
          showError(msg);
          setSessionMessages(prev =>
            prev.map(m =>
              m.id === assistantMsgId ? { ...m, content: `[Erro: ${msg}]` } : m,
            ),
          );
          setLoading(false);
        },
      }, currentSectionId);
    },
    [input, loading, currentSectionId, loadFollowUpSuggestions],
  );

  const handleSuggestionClick = (s: ZezinSuggestedQuestion) => {
    handleSend(s.message);
  };

  if (availability && !availability.available) {
    return (
      <Layout>
        <PageContainer>
          <MainHeader>
            <BackButton onClick={() => navigate('/integrations')}>
              <MdArrowBack size={18} />
              Voltar para Integrações
            </BackButton>
          </MainHeader>
          <ChatScroll>
            <ErrorMessage>
              O Zezin não está disponível para sua conta. É exclusivo para administradores no plano Pro com o módulo Assistente de IA.
            </ErrorMessage>
          </ChatScroll>
        </PageContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageContainer>
        <Overlay $show={sidebarOpen} onClick={() => setSidebarOpen(false)} aria-hidden="true" />
        <ZezinLayout>
          <Sidebar $open={sidebarOpen}>
            <SidebarHeader>
              <NewChatBtn type="button" onClick={handleNewChat}>
                <MdAdd size={20} />
                Nova conversa
              </NewChatBtn>
            </SidebarHeader>
            <SidebarTitle>Histórico</SidebarTitle>
            <ConversationList ref={menuRef}>
              {historyLoading && (
                <>
                  {[1, 2, 3, 4, 5].map(i => (
                    <HistoryShimmerRow key={i}>
                      <HistoryShimmerTitle $delay={i} />
                      <HistoryShimmerDate $delay={i + 1} />
                    </HistoryShimmerRow>
                  ))}
                </>
              )}
              {!historyLoading && threads.map(thread => (
                <HistoryItemWrap key={thread.threadId}>
                  <ConversationItem
                    type="button"
                    $active={selectedThreadId === thread.threadId}
                    onClick={() => handleSelectConversation(thread.threadId)}
                  >
                    <ConversationItemTitle>
                      {thread.title || 'Conversa'}
                    </ConversationItemTitle>
                    <ConversationPreview>
                      {formatConversationDate(thread.updatedAt || '')}
                      {thread.messageCount > 1 ? ` · ${thread.messageCount} mensagens` : ''}
                    </ConversationPreview>
                  </ConversationItem>
                  <MenuBtn
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      setOpenMenuId(prev => (prev === thread.threadId ? null : thread.threadId));
                    }}
                    aria-label="Opções"
                  >
                    <MdMoreVert size={20} />
                  </MenuBtn>
                  {openMenuId === thread.threadId && (
                    <Dropdown>
                      <DropdownItem type="button" onClick={() => handleOpenEditTitle(thread)}>
                        <MdEdit size={18} />
                        Editar título
                      </DropdownItem>
                      <DropdownItem type="button" onClick={() => handleOpenDelete(thread.threadId)}>
                        <MdDelete size={18} />
                        Excluir conversa
                      </DropdownItem>
                    </Dropdown>
                  )}
                </HistoryItemWrap>
              ))}
              {!historyLoading && threads.length === 0 && (
                <ConversationPreview style={{ padding: '8px 14px', fontStyle: 'italic' }}>
                  Nenhuma conversa anterior
                </ConversationPreview>
              )}
            </ConversationList>
            {editingTitleId && (
              <EditTitleOverlay onClick={handleEditTitleClose}>
                <EditTitleBox onClick={e => e.stopPropagation()}>
                  <ConversationItemTitle style={{ marginBottom: 12 }}>Editar título</ConversationItemTitle>
                  <EditTitleInput
                    value={editTitleValue}
                    onChange={e => setEditTitleValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleEditTitleSave();
                      if (e.key === 'Escape') handleEditTitleClose();
                    }}
                    placeholder="Título da conversa"
                    maxLength={200}
                    autoFocus
                  />
                  <EditTitleActions>
                    <EditTitleBtn onClick={handleEditTitleClose}>Cancelar</EditTitleBtn>
                    <EditTitleBtn $primary onClick={handleEditTitleSave}>
                      Salvar
                    </EditTitleBtn>
                  </EditTitleActions>
                </EditTitleBox>
              </EditTitleOverlay>
            )}
          </Sidebar>

          <ConfirmDeleteModal
            isOpen={!!deleteConfirmId}
            onClose={() => setDeleteConfirmId(null)}
            onConfirm={handleDeleteConfirm}
            title="Excluir chat"
            message="Tem certeza que deseja excluir esta conversa? Ela será removida do seu histórico."
            confirmLabel="Excluir"
            isLoading={deleteLoading}
          />

          <MainArea>
            <MainHeader>
              <MenuButton type="button" onClick={() => setSidebarOpen(true)} aria-label="Abrir histórico">
                <MdMenu size={24} />
              </MenuButton>
              <HeaderTitle>
                <ZezinIcon />
                Chat com o Zezin
              </HeaderTitle>
              <BackButton onClick={() => navigate('/integrations')}>
                <MdArrowBack size={18} />
                Voltar
              </BackButton>
            </MainHeader>

            <ChatScroll>
              {currentMessages.length === 0 && !loading && (
                <WelcomeCard>
                  <MessageHeader>
                    <Avatar>
                      <MdSmartToy size={18} />
                    </Avatar>
                    Zezin
                  </MessageHeader>
                  <WelcomeText>
                    Oi! Pode me perguntar o que quiser sobre vendas, metas, leads, imóveis ou clientes — eu uso os dados da empresa e respondo na hora. Se preferir, também atendo pelo WhatsApp no número que você configurou em Integrações.
                  </WelcomeText>
                </WelcomeCard>
              )}
              {currentMessages.map(msg => {
                const isStreamingAssistant =
                  msg.role === 'assistant' && msg.id === streamingMessageIdRef.current;
                const typewriterText =
                  isStreamingAssistant && msg.content.length > 0
                    ? msg.content.slice(0, streamingDisplayedLength)
                    : null;
                return (
                  <MessageBubble key={msg.id} $isUser={msg.role === 'user'}>
                    {msg.role === 'assistant' && (
                      <MessageHeader>
                        <Avatar>
                          <MdSmartToy size={16} />
                        </Avatar>
                        Zezin
                      </MessageHeader>
                    )}
                    {msg.role === 'assistant' && msg.content === '' && loading ? (
                      <LoadingDots>
                        <span />
                        <span />
                        <span />
                      </LoadingDots>
                    ) : msg.role === 'assistant' && isNoApiConfiguredAnswer(msg.content) ? (
                      <>
                        <strong style={{ color: '#b45309' }}>Configuração pendente no servidor</strong>
                        <br />
                        {msg.content}
                        <br />
                        <small style={{ opacity: 0.9 }}>
                          O administrador precisa configurar OPENAI_API_KEY no .env do servidor (platform.openai.com) e reiniciar o servidor.
                        </small>
                      </>
                    ) : typewriterText !== null ? (
                      <>
                        {typewriterText}
                        {streamingDisplayedLength < msg.content.length && <TypewriterCursor />}
                      </>
                    ) : (
                      msg.content
                    )}
                  </MessageBubble>
                );
              })}
              <div ref={chatEndRef} />
            </ChatScroll>

            <InputArea>
              {error && <ErrorMessage>{error}</ErrorMessage>}
              <InputRow>
                <TextArea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Pergunte algo ao Zezin..."
                  disabled={loading}
                  rows={1}
                />
                {(suggestions.length > 0 || (currentMessages.length >= 2 && (followUpSuggestions.length > 0 || followUpLoading))) && (
                  <ToggleSuggestionsIconBtn
                    type="button"
                    onClick={() => setSuggestionsVisible(prev => !prev)}
                    aria-label={suggestionsVisible ? 'Ocultar sugestões' : 'Mostrar sugestões'}
                    title={suggestionsVisible ? 'Ocultar sugestões para ganhar espaço' : 'Mostrar sugestões'}
                  >
                    {suggestionsVisible ? <MdExpandMore size={24} /> : <MdExpandLess size={24} />}
                  </ToggleSuggestionsIconBtn>
                )}
                <SendButton
                  type="button"
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim()}
                >
                  {loading ? (
                    <LoadingDots>
                      <span />
                      <span />
                      <span />
                    </LoadingDots>
                  ) : (
                    <>
                      <MdSend size={20} />
                      Enviar
                    </>
                  )}
                </SendButton>
              </InputRow>
              {(() => {
                const useFollowUp = currentMessages.length >= 2 && followUpSuggestions.length > 0;
                const list = useFollowUp ? followUpSuggestions : suggestions;
                const hasSuggestions = list.length > 0 || followUpLoading;
                const visible = !loading && hasSuggestions && suggestionsVisible;
                if (!hasSuggestions || !suggestionsVisible) return null;
                return (
                  <SuggestionsBlock $visible={visible}>
                    <SuggestionsRow style={{ marginTop: 12 }}>
                      {(followUpLoading && currentMessages.length >= 2 ? [] : list).slice(0, 8).map(s => (
                        <SuggestionChip
                          key={s.id}
                          type="button"
                          onClick={() => handleSuggestionClick(s)}
                          disabled={loading}
                        >
                          {s.label}
                        </SuggestionChip>
                      ))}
                    </SuggestionsRow>
                  </SuggestionsBlock>
                );
              })()}
            </InputArea>
          </MainArea>
        </ZezinLayout>
      </PageContainer>
    </Layout>
  );
};

export default ZezinAskPage;
