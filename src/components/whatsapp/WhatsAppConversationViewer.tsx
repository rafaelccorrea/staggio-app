import React, { useState, useEffect, useRef, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  MdSend,
  MdClose,
  MdArrowBack,
  MdSchedule,
  MdMoreVert,
  MdAssignment,
  MdInfo,
  MdAutoAwesome,
  MdImage,
  MdHome,
  MdPersonAdd,
} from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';
import { whatsappApi } from '../../services/whatsappApi';
import { useWhatsApp } from '../../hooks/useWhatsApp';
import {
  formatPhoneDisplay,
  formatMessageTime,
  handleWhatsAppTokenExpired,
} from '../../utils/whatsappUtils';
import { usePermissionsContextOptional } from '../../contexts/PermissionsContext';
import { companyMembersApi } from '../../services/companyMembersApi';
import { teamApi } from '../../services/teamApi';
import { Select } from '../ui/select';
import { toast } from 'react-toastify';
import { showSuccess, showError } from '../../utils/notifications';
import { EmojiPicker } from '../chat/EmojiPicker';
import { NumericFormat } from 'react-number-format';
import ConfirmDeleteModal from '../modals/ConfirmDeleteModal';
import { Tooltip } from '../ui/Tooltip';
import type { WhatsAppMessage } from '../../types/whatsapp';

/** Considera vazio: null, undefined, '', string "null" ou "undefined" */
function hasDisplayValue(value: unknown): value is string | number {
  if (value == null || value === '') return false;
  const s = String(value).trim().toLowerCase();
  return s !== 'null' && s !== 'undefined';
}

/** Substitui ocorrências de "null" e "undefined" no texto por "—" */
function sanitizeSummaryText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\bnull\b/gi, '—')
    .replace(/\bundefined\b/gi, '—');
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${props => props.theme.colors.background};
`;

const Header = styled.div`
  padding: 24px 20px 16px 20px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.cardBackground};
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;

  @media (max-width: 768px) {
    padding: 20px 16px 12px 16px;
  }

  @media (max-width: 480px) {
    padding: 16px 12px 10px 12px;
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  padding: 10px;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
  flex-shrink: 0;
  @media (max-width: 480px) {
    min-width: 48px;
    min-height: 48px;
  }
  &:hover {
    background: ${props => props.theme.colors.backgroundSecondary};
  }
`;

const ContactInfo = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ContactAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid ${props => props.theme.colors.border};
  flex-shrink: 0;
`;

const ContactName = styled.div`
  font-weight: 600;
  font-size: 1rem;
  color: ${props => props.theme.colors.text};
  margin-bottom: 4px;
`;

const PhoneNumber = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const LoadOlderButton = styled.button`
  align-self: center;
  padding: 10px 20px;
  margin-bottom: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  background: ${props => props.theme.colors.cardBackground};
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.backgroundSecondary};
    border-color: ${props => props.theme.colors.primary};
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  @media (max-width: 480px) {
    padding: 12px 10px;
    gap: 10px;
  }
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.backgroundSecondary};
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border};
    border-radius: 4px;

    &:hover {
      background: ${props => props.theme.colors.textSecondary};
    }
  }
`;

const MessageBubble = styled.div<{ $isOutbound: boolean }>`
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  @media (max-width: 480px) {
    max-width: 88%;
    padding: 10px 14px;
  }
  word-wrap: break-word;
  align-self: ${props => (props.$isOutbound ? 'flex-end' : 'flex-start')};
  background: ${props =>
    props.$isOutbound
      ? props.theme.colors.primary
      : props.theme.colors.cardBackground};
  color: ${props => (props.$isOutbound ? 'white' : props.theme.colors.text)};
  border: 1px solid
    ${props => (props.$isOutbound ? 'transparent' : props.theme.colors.border)};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const MessageText = styled.div`
  font-size: 0.9375rem;
  line-height: 1.5;
  margin-bottom: 4px;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue',
    Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
`;

const MessageTime = styled.div`
  font-size: 0.75rem;
  opacity: 0.7;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
`;

const MessageImage = styled.img`
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  object-fit: contain;
  margin-bottom: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.02);
  }
`;

const MessageMediaContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
`;

const MessageVideo = styled.video`
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  object-fit: contain;
  margin-bottom: 8px;
  cursor: pointer;
`;

const MessageAudio = styled.audio`
  width: 100%;
  margin-bottom: 8px;
`;

const MessageDocument = styled.a`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: ${props => props.theme.colors.backgroundSecondary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  text-decoration: none;
  color: ${props => props.theme.colors.text};
  transition: background-color 0.2s;
  margin-bottom: 8px;

  &:hover {
    background: ${props => props.theme.colors.background};
  }
`;

const DocumentIcon = styled.div`
  font-size: 2em;
  flex-shrink: 0;
`;

const DocumentInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const DocumentName = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DocumentType = styled.div`
  font-size: 0.85em;
  color: ${props => props.theme.colors.textSecondary};
`;

const StickerContainer = styled.div`
  position: relative;
  display: inline-block;
  margin-bottom: 8px;
`;

const MessageSticker = styled.img`
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  cursor: pointer;
  display: block;
`;

const StickerBadge = styled.span`
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75em;
  z-index: 1;
  pointer-events: none;
  white-space: nowrap;
`;

const LocationContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: ${props => props.theme.colors.backgroundSecondary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  margin-bottom: 8px;
`;

const LocationIcon = styled.div`
  font-size: 1.5em;
  flex-shrink: 0;
`;

const LocationInfo = styled.div`
  flex: 1;
`;

const LocationLabel = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
`;

const MapLink = styled.a`
  color: #1976d2;
  text-decoration: none;
  font-size: 0.875rem;

  &:hover {
    text-decoration: underline;
  }
`;

const ContactContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: ${props => props.theme.colors.backgroundSecondary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  margin-bottom: 8px;
`;

const ContactIcon = styled.div`
  font-size: 1.5em;
  flex-shrink: 0;
`;

const ContactDetails = styled.div`
  flex: 1;
`;

const ContactLabel = styled.div`
  font-weight: 500;
  margin-bottom: 8px;
`;

const ContactDetailItem = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 4px;
`;

const VoiceBadge = styled.span`
  display: inline-block;
  margin-top: 4px;
  padding: 4px 8px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 4px;
  font-size: 0.85em;
  color: #3b82f6;
`;

const MediaIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: ${props => props.theme.colors.backgroundSecondary};
  border-radius: 8px;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const ImageButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primary}15;
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ImagePreviewContainer = styled.div`
  padding: 12px;
  background: ${props => props.theme.colors.backgroundSecondary};
  border-radius: 8px;
  margin-bottom: 8px;
  position: relative;
`;

const ImagePreview = styled.img`
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  object-fit: contain;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: scale(1.1);
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const EmojiButtonWrapper = styled.div<{ $disabled?: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${props => props.theme.colors.backgroundSecondary};
  border: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  opacity: ${props => (props.$disabled ? 0.6 : 1)};

  &:hover {
    background: ${props =>
      props.$disabled
        ? props.theme.colors.backgroundSecondary
        : props.theme.colors.primary + '15'};
    border-color: ${props =>
      props.$disabled ? props.theme.colors.border : props.theme.colors.primary};
  }

  button {
    background: transparent !important;
    border: none !important;
    padding: 0 !important;
    width: 100% !important;
    height: 100% !important;
    min-width: unset !important;
    min-height: unset !important;
    border-radius: 50% !important;
    color: ${props => props.theme.colors.text} !important;
    cursor: ${props =>
      props.$disabled ? 'not-allowed' : 'pointer'} !important;

    &:hover {
      background: transparent !important;
      color: ${props => props.theme.colors.primary} !important;
    }

    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.textSecondary};
  padding: 40px;
  text-align: center;
`;

const EmptyStateIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const EmptyStateText = styled.p`
  font-size: 0.9375rem;
  margin: 0;
`;

// Animação de shimmer
const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const ShimmerBase = styled.div<{
  $width?: string;
  $height?: string;
  $radius?: string;
}>`
  background: linear-gradient(
    90deg,
    ${props => props.theme.colors.backgroundSecondary} 25%,
    ${props => props.theme.colors.hover || props.theme.colors.border} 50%,
    ${props => props.theme.colors.backgroundSecondary} 75%
  );
  background-size: 200px 100%;
  animation: ${shimmer} 1.5s infinite;
  width: ${props => props.$width || '100%'};
  height: ${props => props.$height || '20px'};
  border-radius: ${props => props.$radius || '8px'};
`;

const ConversationShimmerContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ConversationHeaderShimmer = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.cardBackground};
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BackButtonShimmer = styled(ShimmerBase)`
  width: 40px;
  height: 40px;
  border-radius: 8px;
`;

const ContactInfoShimmer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ContactNameShimmer = styled(ShimmerBase)`
  width: 150px;
  height: 20px;
`;

const PhoneShimmer = styled(ShimmerBase)`
  width: 120px;
  height: 16px;
`;

const MessagesShimmerContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MessageBubbleShimmer = styled.div<{ $isOutbound?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-self: ${props => (props.$isOutbound ? 'flex-end' : 'flex-start')};
  max-width: 70%;
`;

const MessageBubbleContentShimmer = styled(ShimmerBase)`
  padding: 12px 16px;
  border-radius: 16px;
`;

const MessageTimeShimmer = styled(ShimmerBase)`
  width: 60px;
  height: 12px;
  align-self: ${props => (props.$isOutbound ? 'flex-end' : 'flex-start')};
`;

const ConversationShimmer: React.FC = () => {
  return (
    <ConversationShimmerContainer>
      <ConversationHeaderShimmer>
        <BackButtonShimmer />
        <ContactInfoShimmer>
          <ContactNameShimmer />
          <PhoneShimmer />
        </ContactInfoShimmer>
      </ConversationHeaderShimmer>

      <MessagesShimmerContainer>
        {Array.from({ length: 6 }).map((_, index) => (
          <MessageBubbleShimmer key={index} $isOutbound={index % 3 === 0}>
            <MessageBubbleContentShimmer
              $width={index % 2 === 0 ? '200px' : '150px'}
              $height={index % 2 === 0 ? '60px' : '40px'}
            />
            <MessageTimeShimmer $isOutbound={index % 3 === 0} />
          </MessageBubbleShimmer>
        ))}
      </MessagesShimmerContainer>
    </ConversationShimmerContainer>
  );
};

const MenuButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
  margin-left: auto;

  &:hover {
    background: ${props => props.theme.colors.backgroundSecondary};
  }
`;

const MenuDropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  right: 20px;
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 1000;
  display: ${props => (props.$isOpen ? 'block' : 'none')};
  overflow: hidden;
`;

const MenuItem = styled.button`
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  text-align: left;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.9375rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.backgroundSecondary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const InputContainer = styled.div`
  padding: 12px 20px;
  border-top: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.cardBackground};
  display: flex;
  flex-direction: column;
  gap: 8px;
  @media (max-width: 480px) {
    padding: 10px 12px;
  }
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-end;
`;

const MessageInput = styled.textarea`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 24px;
  font-size: 0.9375rem;
  font-family: inherit;
  resize: none;
  min-height: 44px;
  max-height: 120px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  @media (max-width: 480px) {
    min-height: 48px;
    padding: 10px 14px;
    font-size: 0.875rem;
  }
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SendButton = styled.button<{ $disabled?: boolean }>`
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  border-radius: 50%;
  background: ${props => (props.$disabled ? '#9CA3AF' : '#25D366')};
  color: white;
  border: none;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  @media (max-width: 480px) {
    width: 48px;
    height: 48px;
    min-width: 48px;
    min-height: 48px;
  }
  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(37, 211, 102, 0.4);
  }
  &:disabled {
    opacity: 0.6;
  }
`;

const WarningMessage = styled.div`
  padding: 10px 16px;
  background: #f59e0b15;
  border: 1px solid #f59e0b30;
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.875rem;
  color: #f59e0b;
  line-height: 1.5;
`;

const MenuOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  display: ${props => (props.$isOpen ? 'block' : 'none')};
`;

/* Modal Enviar opções de imóveis — visual moderno */
const PropertyOptionsModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: ${props =>
    props.theme.mode === 'dark'
      ? 'rgba(0, 0, 0, 0.75)'
      : 'rgba(0, 0, 0, 0.5)'};
  backdrop-filter: blur(8px);
  display: ${props => (props.$isOpen ? 'flex' : 'none')};
  align-items: flex-start;
  justify-content: center;
  z-index: 10000;
  padding: 56px 24px 24px;
  overflow-y: auto;
  animation: fadeIn 0.2s ease;
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const PropertyOptionsModalCard = styled.div`
  width: 100%;
  max-width: 440px;
  margin-top: 0;
  flex-shrink: 0;
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 20px;
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: ${props =>
    props.theme.mode === 'dark'
      ? '0 24px 48px rgba(0,0,0,0.4)'
      : '0 24px 48px rgba(0,0,0,0.12)'};
  overflow: hidden;
  animation: slideUp 0.25s ease;
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const PropertyOptionsModalHeader = styled.div`
  padding: 20px 24px;
  background: ${props =>
    props.theme.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(37, 211, 102, 0.12) 0%, rgba(37, 211, 102, 0.04) 100%)'
      : 'linear-gradient(135deg, rgba(37, 211, 102, 0.08) 0%, rgba(37, 211, 102, 0.03) 100%)'};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PropertyOptionsModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PropertyOptionsModalCloseBtn = styled.button`
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 10px;
  background: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  &:hover {
    background: ${props => props.theme.colors.border};
    color: ${props => props.theme.colors.text};
  }
`;

const PropertyOptionsModalBody = styled.div`
  padding: 24px;
`;

const PropertyOptionsDescription = styled.p`
  margin: 0 0 20px 0;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: ${props => props.theme.colors.textSecondary};
`;

const PropertyOptionsFormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const PropertyOptionsField = styled.div`
  margin-bottom: 18px;
`;

const PropertyOptionsLabel = styled.label`
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 8px;
`;

const PropertyOptionsInput = styled.input`
  width: 100%;
  padding: 12px 14px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  font-size: 0.9375rem;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
    opacity: 0.7;
  }
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const PropertyOptionsInputAsInput = styled(PropertyOptionsInput)`
  margin-bottom: 0;
`;

const PropertyOptionsSelect = styled.select`
  width: 100%;
  padding: 12px 14px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  font-size: 0.9375rem;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const PropertyOptionsFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const PropertyOptionsButton = styled.button<{ $primary?: boolean }>`
  padding: 12px 22px;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: ${props =>
    props.$primary ? 'none' : `1px solid ${props.theme.colors.border}`};
  background: ${props =>
    props.$primary ? '#25d366' : props.theme.colors.background};
  color: ${props => (props.$primary ? 'white' : props.theme.colors.text)};
  &:hover:not(:disabled) {
    ${props => props.$primary && 'filter: brightness(1.05);'}
    ${props => !props.$primary && `background: ${props.theme.colors.backgroundSecondary};`}
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

/* Painel Insights da IA — adaptado a tema dark/light */
const InsightsPanelWrapper = styled.div`
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background: ${props =>
    props.theme.mode === 'dark'
      ? 'rgba(16, 185, 129, 0.08)'
      : 'rgba(16, 185, 129, 0.06)'};
  overflow: hidden;
`;

const InsightsPanelToggle = styled.button`
  width: 100%;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: none;
  border: none;
  cursor: pointer;
  color: ${props =>
    props.theme.mode === 'dark' ? '#34d399' : props.theme.colors.primary};
  font-weight: 600;
  font-size: 13px;
  transition: background 0.2s;

  &:hover {
    background: ${props =>
      props.theme.mode === 'dark'
        ? 'rgba(16, 185, 129, 0.12)'
        : 'rgba(16, 185, 129, 0.08)'};
  }
`;

const InsightsBadge = styled.span<{ $level?: string }>`
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  ${props => {
    const level = props.$level?.toLowerCase() ?? 'medio';
    if (level === 'alto') {
      return props.theme.mode === 'dark'
        ? 'background: rgba(16, 185, 129, 0.25); color: #6ee7b7;'
        : 'background: #dcfce7; color: #166534;';
    }
    if (level === 'medio') {
      return props.theme.mode === 'dark'
        ? 'background: rgba(245, 158, 11, 0.25); color: #fcd34d;'
        : 'background: #fef9c3; color: #854d0e;';
    }
    return props.theme.mode === 'dark'
      ? 'background: rgba(239, 68, 68, 0.25); color: #fca5a5;'
      : 'background: #fee2e2; color: #991b1b;';
  }}
`;

const InsightsContent = styled.div`
  padding: 0 16px 14px;
  font-size: 13px;
  color: ${props => props.theme.colors.text};
  max-height: 50vh;
  overflow-y: auto;
  min-height: 0;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.backgroundSecondary};
  }
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border};
    border-radius: 3px;
  }
`;

const InsightsBlock = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid
    ${props =>
      props.theme.mode === 'dark'
        ? 'rgba(16, 185, 129, 0.2)'
        : 'rgba(16, 185, 129, 0.25)'};
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 10px;
`;

const InsightsBlockTitle = styled.div`
  font-weight: 600;
  color: ${props =>
    props.theme.mode === 'dark' ? '#34d399' : props.theme.colors.primary};
  margin-bottom: 6px;
  font-size: 12px;
`;

const InsightsAttentionBlock = styled.div`
  background: ${props =>
    props.theme.mode === 'dark'
      ? 'rgba(245, 158, 11, 0.15)'
      : '#fef3c7'};
  border: 1px solid
    ${props =>
      props.theme.mode === 'dark'
        ? 'rgba(245, 158, 11, 0.3)'
        : '#fde68a'};
  border-radius: 8px;
  padding: 10px 12px;
`;

const InsightsAttentionTitle = styled.div`
  font-weight: 600;
  color: ${props =>
    props.theme.mode === 'dark' ? '#fcd34d' : '#92400e'};
  margin-bottom: 6px;
  font-size: 12px;
`;

const InsightsAttentionList = styled.ul`
  margin: 0;
  padding-left: 18px;
  line-height: 1.6;
  color: ${props =>
    props.theme.mode === 'dark'
      ? props.theme.colors.textSecondary
      : '#78350f'};
`;

const InsightsList = styled.ul`
  margin: 0;
  padding-left: 18px;
  line-height: 1.6;
  color: ${props => props.theme.colors.text};
`;

const InsightsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 16px;
  line-height: 1.6;
  color: ${props => props.theme.colors.text};
`;

const InsightsChevron = styled.span<{ $open: boolean }>`
  transform: ${props => (props.$open ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform 0.2s;
  font-size: 18px;
`;

interface WhatsAppConversationViewerProps {
  phoneNumber: string;
  contactName?: string;
  onBack?: () => void;
  onOpenMenu?: () => void;
  /** Se false, o botão "Criar Tarefa" fica desabilitado (é obrigatório ter funil configurado nas config do WhatsApp) */
  hasFunnelConfigured?: boolean;
}

export const WhatsAppConversationViewer: React.FC<
  WhatsAppConversationViewerProps
> = ({
  phoneNumber,
  contactName,
  onBack,
  onOpenMenu,
  hasFunnelConfigured = true,
}) => {
  const permissionsContext = usePermissionsContextOptional();
  const { loadMessages, markAsRead } = useWhatsApp();
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [conversationTotal, setConversationTotal] = useState(0);
  const [loadingMoreOlder, setLoadingMoreOlder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [is24HoursWindowOpen, setIs24HoursWindowOpen] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [pendingMessageId, setPendingMessageId] = useState<string | null>(null);
  const [isCreateTaskConfirmOpen, setIsCreateTaskConfirmOpen] = useState(false);
  const [messageIdToCreate, setMessageIdToCreate] = useState<string | null>(
    null
  );
  const [isCreateTaskSuccessOpen, setIsCreateTaskSuccessOpen] = useState(false);
  const [createTaskRedirect, setCreateTaskRedirect] = useState<{
    teamId: string;
    projectId: string;
  } | null>(null);
  const [isPropertyOptionsModalOpen, setIsPropertyOptionsModalOpen] =
    useState(false);
  const [propertyOptionsSending, setPropertyOptionsSending] = useState(false);
  const [propertyOptionsForm, setPropertyOptionsForm] = useState<{
    neighborhood: string;
    minValue: number | undefined;
    maxValue: number | undefined;
    operation: 'sale' | 'rent';
    limit: number;
  }>({
    neighborhood: '',
    minValue: undefined,
    maxValue: undefined,
    operation: 'sale',
    limit: 5,
  });
  const [isAssignToSdrModalOpen, setIsAssignToSdrModalOpen] = useState(false);
  const [assignToSdrUserId, setAssignToSdrUserId] = useState('');
  const [companyUsers, setCompanyUsers] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [loadingCompanyUsers, setLoadingCompanyUsers] = useState(false);
  const [assigningSdr, setAssigningSdr] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const currentPhoneNumberRef = useRef<string>(phoneNumber);
  const loadingRef = useRef<boolean>(false);
  const markedAsReadRef = useRef<Set<string>>(new Set()); // Evitar marcar a mesma mensagem múltiplas vezes
  const draftsRef = useRef<Map<string, string>>(new Map()); // Armazenar rascunhos por phoneNumber
  const draftSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Timeout para salvar rascunho com debounce

  // Buscar avatar do contato da primeira mensagem que tiver
  const contactAvatarUrl = useMemo(() => {
    return messages.find(m => m.contactAvatarUrl)?.contactAvatarUrl;
  }, [messages]);

  const canSendMessages =
    permissionsContext?.hasPermission('whatsapp:send') ?? false;
  const canCreateTask =
    permissionsContext?.hasPermission('whatsapp:create_task') ?? false;
  const canAssignChat =
    permissionsContext?.hasPermission('whatsapp:manage_config') ?? false;

  // Política: nunca enviamos a primeira mensagem (não temos template). Só respondemos após o cliente iniciar.
  const hasClientSentFirstMessage = useMemo(
    () => messages.some(m => m.direction === 'inbound'),
    [messages]
  );
  const canReply =
    canSendMessages && hasClientSentFirstMessage && is24HoursWindowOpen;

  // Buscar insights da IA na conversa (da mensagem de handoff mais recente)
  const conversationInsights = useMemo(() => {
    // Buscar a mensagem mais recente que tenha aiInsights
    const withInsights = [...messages]
      .reverse()
      .find(m => m.aiInsights);
    return withInsights?.aiInsights || null;
  }, [messages]);

  // Estado do painel de insights (aberto/fechado)
  const [isInsightsPanelOpen, setIsInsightsPanelOpen] = useState(false);

  useEffect(() => {
    // Salvar rascunho do phoneNumber anterior antes de mudar
    const previousPhoneNumber = currentPhoneNumberRef.current;
    if (previousPhoneNumber && previousPhoneNumber !== phoneNumber) {
      draftsRef.current.set(previousPhoneNumber, messageText);
    }

    // Atualizar ref do phoneNumber atual
    currentPhoneNumberRef.current = phoneNumber;

    // Limpar mensagens anteriores imediatamente para evitar mostrar mensagens erradas
    setMessages([]);
    setConversationTotal(0);
    setLoading(true);
    loadingRef.current = true;

    // Carregar rascunho do novo phoneNumber
    const draft = draftsRef.current.get(phoneNumber) || '';
    setMessageText(draft);

    loadConversation(phoneNumber);

    // Cleanup: marcar como não carregando se o phoneNumber mudar
    return () => {
      loadingRef.current = false;
    };
  }, [phoneNumber]);

  useEffect(() => {
    scrollToBottom();

    // Marcar mensagens recebidas não lidas como lidas quando a conversa é visualizada
    const unreadInboundMessages = messages.filter(
      msg =>
        msg.direction === 'inbound' &&
        !msg.readAt &&
        !markedAsReadRef.current.has(msg.id)
    );

    if (unreadInboundMessages.length > 0) {
      // Usar um pequeno delay para evitar múltiplas chamadas
      const timeoutId = setTimeout(() => {
        unreadInboundMessages.forEach(msg => {
          // Adicionar ao set antes de chamar para evitar duplicatas
          markedAsReadRef.current.add(msg.id);

          markAsRead(msg.id).catch(err => {
            console.error('Erro ao marcar mensagem como lida:', err);
            // Remover do set se falhar para tentar novamente depois
            markedAsReadRef.current.delete(msg.id);
          });
        });
      }, 1000); // Delay de 1 segundo para garantir que a conversa está carregada

      return () => clearTimeout(timeoutId);
    }
  }, [messages, markAsRead]);

  // Limpar o set quando mudar de conversa
  useEffect(() => {
    markedAsReadRef.current.clear();
  }, [phoneNumber]);

  // Auto-refresh da conversa quando está aberta - atualizar a cada 10 segundos (reduzido para evitar loops)
  useEffect(() => {
    if (!phoneNumber) return;

    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;
    let lastRefreshTime = 0;
    const MIN_REFRESH_INTERVAL = 10000; // Mínimo de 10 segundos entre refreshes

    const refreshConversation = async () => {
      if (!isMounted || document.hidden || loadingRef.current) return;

      // Evitar refreshes muito frequentes
      const now = Date.now();
      if (now - lastRefreshTime < MIN_REFRESH_INTERVAL) {
        return;
      }
      lastRefreshTime = now;

      try {
        // Carregar conversa silenciosamente (sem setLoading)
        await loadConversation(phoneNumber, true);
      } catch (err) {
        // Erro silencioso - não interromper a experiência
        if (isMounted) {
          console.error('Erro ao atualizar conversa:', err);
        }
      }
    };

    // Atualizar quando a página volta a ficar visível
    const handleVisibilityChange = () => {
      if (!document.hidden && isMounted) {
        refreshConversation();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Atualizar a cada 10 segundos quando a conversa está aberta (aumentado para reduzir carga)
    intervalId = setInterval(() => {
      if (!document.hidden && isMounted) {
        refreshConversation();
      }
    }, 10000);

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneNumber]); // Não incluir messages na dependência para evitar loops

  // Limpar timeout ao desmontar componente
  useEffect(() => {
    return () => {
      if (draftSaveTimeoutRef.current) {
        clearTimeout(draftSaveTimeoutRef.current);
      }
    };
  }, []);

  const CONVERSATION_PAGE_SIZE = 50;

  const loadConversation = async (
    targetPhoneNumber?: string,
    silent = false,
    options?: { loadOlder?: boolean; offset?: number }
  ) => {
    const phone = targetPhoneNumber || phoneNumber;
    const loadOlder = options?.loadOlder === true;
    const offset = options?.offset ?? 0;

    try {
      if (loadOlder) {
        setLoadingMoreOlder(true);
      } else if (!silent) {
        setLoading(true);
        loadingRef.current = true;
      }

      const response = await whatsappApi.getMessages({
        phoneNumber: targetPhoneNumber || phoneNumber,
        limit: CONVERSATION_PAGE_SIZE,
        offset,
      });

      // Verificar se o phoneNumber ainda é o mesmo antes de atualizar o estado
      if (
        currentPhoneNumberRef.current !== (targetPhoneNumber || phoneNumber)
      ) {
        return;
      }

      // Ordenar por data (mais antigas primeiro)
      const sorted = [...response.messages].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      // Verificar novamente antes de atualizar o estado (double-check)
      const currentPhone = targetPhoneNumber || phoneNumber;
      if (currentPhoneNumberRef.current === currentPhone) {
        // Carregar mensagens antigas (paginação): apenas prepend
        if (loadOlder) {
          setMessages(prev => [...sorted, ...prev]);
          setLoadingMoreOlder(false);
          return;
        }

        if (!loadOlder && offset === 0) {
          setConversationTotal(response.total);
        }

        // Em modo silencioso, verificar se há novas mensagens antes de atualizar
        if (silent) {
          setMessages(prev => {
            const prevIds = new Set(prev.map(m => m.id));
            const newMessages = sorted.filter(m => !prevIds.has(m.id));

            // Se não houver novas mensagens e o número de mensagens não mudou, não atualizar
            const prevRealMessages = prev.filter(
              m => !m.id.startsWith('temp-')
            );
            if (
              newMessages.length === 0 &&
              sorted.length === prevRealMessages.length
            ) {
              // Não verificar mudanças de URL de mídia para evitar loops
              // URLs assinadas são renovadas automaticamente pelo backend quando necessário
              return prev; // Não atualizar se não houver mudanças
            }

            // Scroll automático apenas se houver novas mensagens
            if (newMessages.length > 0) {
              setTimeout(() => scrollToBottom(), 100);
            }

            // Preservar mensagens temporárias (pending) e recém-enviadas (sent) que ainda não vieram do servidor
            const serverWaIds = new Set(
              sorted.map(m => m.whatsappMessageId).filter(Boolean)
            );
            const messagesToPreserve = prev.filter(
              msg =>
                (msg.status === 'pending' && msg.id.startsWith('temp-')) ||
                (msg.status === 'sent' &&
                  msg.whatsappMessageId &&
                  !serverWaIds.has(msg.whatsappMessageId))
            );
            const combined = [...messagesToPreserve, ...sorted];
            // Remover duplicatas baseado no ID (priorizando mensagens do servidor)
            // Priorizar contactName do servidor (backend busca e salva automaticamente v1.10)
            // Usar contactName da prop apenas como fallback se servidor não retornar
            const unique = combined.reduce((acc, msg) => {
              const existing = acc.find(
                m =>
                  m.id === msg.id ||
                  (msg.whatsappMessageId &&
                    m.whatsappMessageId === msg.whatsappMessageId)
              );
              if (!existing) {
                if (!msg.contactName && contactName) msg.contactName = contactName;
                acc.push(msg);
              } else {
                // Se a mensagem que está chegando é do servidor (id real), substituir a otimista
                if (!msg.id.startsWith('temp-')) {
                  const idx = acc.findIndex(
                    m =>
                      m.id === existing.id ||
                      (msg.whatsappMessageId &&
                        m.whatsappMessageId === msg.whatsappMessageId)
                  );
                  if (idx >= 0)
                    acc[idx] = {
                      ...msg,
                      contactName:
                        msg.contactName ||
                        existing.contactName ||
                        contactName,
                    };
                } else {
                  if (msg.contactName) existing.contactName = msg.contactName;
                  else if (!existing.contactName && contactName)
                    existing.contactName = contactName;
                }
              }
              return acc;
            }, [] as WhatsAppMessage[]);
            return unique.sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            );
          });
        } else {
          // Modo normal: atualizar sempre
          setMessages(prev => {
            // Preservar mensagens temporárias (pending) e recém-enviadas (sent) que ainda não vieram do servidor
            const serverWaIds = new Set(
              sorted.map(m => m.whatsappMessageId).filter(Boolean)
            );
            const messagesToPreserve = prev.filter(
              msg =>
                (msg.status === 'pending' && msg.id.startsWith('temp-')) ||
                (msg.status === 'sent' &&
                  msg.whatsappMessageId &&
                  !serverWaIds.has(msg.whatsappMessageId))
            );
            const combined = [...messagesToPreserve, ...sorted];
            // Remover duplicatas baseado no ID (priorizando mensagens do servidor)
            // Priorizar contactName do servidor (backend busca e salva automaticamente v1.10)
            // Usar contactName da prop apenas como fallback se servidor não retornar
            const unique = combined.reduce((acc, msg) => {
              const existing = acc.find(
                m =>
                  m.id === msg.id ||
                  (msg.whatsappMessageId &&
                    m.whatsappMessageId === msg.whatsappMessageId)
              );
              if (!existing) {
                if (!msg.contactName && contactName) msg.contactName = contactName;
                acc.push(msg);
              } else {
                if (!msg.id.startsWith('temp-')) {
                  const idx = acc.findIndex(
                    m =>
                      m.id === existing.id ||
                      (msg.whatsappMessageId &&
                        m.whatsappMessageId === msg.whatsappMessageId)
                  );
                  if (idx >= 0)
                    acc[idx] = {
                      ...msg,
                      contactName:
                        msg.contactName ||
                        existing.contactName ||
                        contactName,
                    };
                } else {
                  if (msg.contactName) existing.contactName = msg.contactName;
                  else if (!existing.contactName && contactName)
                    existing.contactName = contactName;
                }
              }
              return acc;
            }, [] as WhatsAppMessage[]);
            return unique.sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            );
          });

          if (loadingRef.current) {
            // Verificar janela de 24 horas apenas no modo normal
            check24HoursWindow(sorted);

            // Marcar mensagens recebidas não lidas como lidas (apenas no modo normal)
            const unreadInboundMessages = sorted.filter(
              msg => msg.direction === 'inbound' && !msg.readAt
            );

            // Marcar cada mensagem não lida como lida
            if (unreadInboundMessages.length > 0) {
              unreadInboundMessages.forEach(msg => {
                markAsRead(msg.id).catch(err => {
                  console.error('Erro ao marcar mensagem como lida:', err);
                });
              });
            }
          }
        }
      }
    } catch (error: any) {
      // Só mostrar erro se ainda for a conversa atual
      if (currentPhoneNumberRef.current === phone) {
        console.error('Erro ao carregar conversa:', error);
      }
    } finally {
      if (currentPhoneNumberRef.current === phone) {
        if (loadOlder) setLoadingMoreOlder(false);
        else if (!silent) {
          setLoading(false);
          loadingRef.current = false;
        }
      }
    }
  };

  const check24HoursWindow = (msgs: WhatsAppMessage[]) => {
    // Encontrar última mensagem recebida (inbound)
    const lastInboundMessage = msgs
      .filter(m => m.direction === 'inbound')
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

    if (!lastInboundMessage) {
      // Se não há mensagens recebidas, janela está fechada
      setIs24HoursWindowOpen(false);
      return;
    }

    const lastMessageTime = new Date(lastInboundMessage.createdAt).getTime();
    const now = new Date().getTime();
    const hoursSinceLastMessage = (now - lastMessageTime) / (1000 * 60 * 60);

    // Janela de 24 horas está aberta se a última mensagem foi há menos de 24 horas
    setIs24HoursWindowOpen(hoursSinceLastMessage < 24);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const hasMoreOlderMessages = messages.length < conversationTotal;
  const loadMoreOlderMessages = () => {
    if (loadingMoreOlder || !hasMoreOlderMessages) return;
    loadConversation(phoneNumber, true, {
      loadOlder: true,
      offset: messages.length,
    });
  };

  const handleSendSuccess = () => {
    // Atualizar em modo silencioso para não perder mensagens antigas já carregadas
    loadConversation(phoneNumber, true);
    // Limpar rascunho e input após envio bem-sucedido
    setMessageText('');
    draftsRef.current.delete(phoneNumber);
    if (draftSaveTimeoutRef.current) {
      clearTimeout(draftSaveTimeoutRef.current);
      draftSaveTimeoutRef.current = null;
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        showError('Por favor, selecione apenas arquivos de imagem');
        return;
      }
      // Validar tamanho (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        showError('A imagem deve ter no máximo 5MB');
        return;
      }
      setSelectedImage(file);
      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const newText =
        messageText.substring(0, start) + emoji + messageText.substring(end);
      setMessageText(newText);

      // Focar no input e reposicionar o cursor após o emoji
      setTimeout(() => {
        input.focus();
        const newPosition = start + emoji.length;
        input.setSelectionRange(newPosition, newPosition);
      }, 0);
    } else {
      setMessageText(messageText + emoji);
    }
  };

  /**
   * Enviar mensagem WhatsApp
   *
   * NOTA v1.8: O sistema automaticamente:
   * - Salva a mensagem no histórico (mesmo sem clientId)
   * - Busca ou cria cliente pelo número de telefone se necessário
   * - Recupera via Message Echoes se o salvamento falhar
   * - Atualiza status via webhook (sent → delivered → read)
   */
  const handleSendMessage = async () => {
    if ((!messageText.trim() && !selectedImage) || !canReply) {
      return;
    }

    // Prevenir envios duplicados
    if (isSending) {
      return;
    }

    setIsSending(true);
    const tempMessageId = `temp-${Date.now()}`;

    // Criar mensagem temporária para exibição imediata
    const tempMessage: WhatsAppMessage = {
      id: tempMessageId,
      phoneNumber,
      contactName: contactName || undefined,
      messageType: selectedImage ? 'image' : 'text',
      direction: 'outbound',
      message: messageText.trim() || undefined,
      mediaUrl: imagePreview || undefined,
      status: 'pending',
      companyId: '', // Será preenchido pelo backend
      createdAt: new Date(),
    };

    // Adicionar mensagem temporária à lista
    setMessages(prev => [...prev, tempMessage]);
    setPendingMessageId(tempMessageId);

    // Salvar texto e imagem antes de limpar
    const savedText = messageText.trim();
    const savedImage = selectedImage;

    // Limpar inputs imediatamente
    setMessageText('');
    setSelectedImage(null);
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
    // Limpar rascunho após envio
    draftsRef.current.delete(phoneNumber);
    if (draftSaveTimeoutRef.current) {
      clearTimeout(draftSaveTimeoutRef.current);
      draftSaveTimeoutRef.current = null;
    }

    // Verificar permissão antes de chamar API
    if (!canSendMessages) {
      showError('Você não tem permissão para enviar mensagens WhatsApp.');
      setIsSending(false);
      return;
    }

    try {
      const response = await whatsappApi.sendMessage({
        to: phoneNumber,
        message: savedText || '',
        image: savedImage || undefined,
        // clientId não é necessário - sistema cria automaticamente se necessário (v1.8)
      });

      // Atualizar mensagem temporária: marcar como enviada mantendo id temp (evita sumir no reload)
      setMessages(prev =>
        prev.map(msg =>
          msg.id === tempMessageId
            ? {
                ...msg,
                whatsappMessageId: response.messageId,
                status: 'sent',
                createdAt: new Date(),
                contactName: contactName || msg.contactName,
              }
            : msg
        )
      );

      setPendingMessageId(null);

      // Recarregar conversa silenciosamente após um delay para garantir sincronização
      // (preserva mensagens pending e contactName durante o reload)
      // Usar modo silencioso para não interromper a experiência do usuário
      setTimeout(() => {
        loadConversation(phoneNumber, true);
      }, 2000); // Delay maior para evitar recarregamento muito rápido
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);

      // Tratar token expirado
      if (handleWhatsAppTokenExpired(error, showError)) {
        // Token expirado já foi tratado, apenas limpar estado
        setMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
        setPendingMessageId(null);
        setMessageText(savedText);
        if (savedImage) {
          setSelectedImage(savedImage);
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreview(reader.result as string);
          };
          reader.readAsDataURL(savedImage);
        }
        return;
      }

      // Remover mensagem temporária em caso de erro
      setMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
      setPendingMessageId(null);

      // Restaurar inputs em caso de erro
      setMessageText(savedText);
      if (savedImage) {
        setSelectedImage(savedImage);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(savedImage);
      }

      // Se erro for de 24 horas, atualizar estado
      if (
        error.message?.includes('janela de 24 horas') ||
        error.message?.includes('24 horas') ||
        error.message?.includes('24h') ||
        error.response?.data?.message?.includes('janela de 24 horas')
      ) {
        setIs24HoursWindowOpen(false);
      } else {
        // Mostrar erro genérico apenas se não for token expirado
        showError(
          error.response?.data?.message ||
            error.message ||
            'Erro ao enviar mensagem'
        );
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Criar tarefa a partir de mensagem WhatsApp
   *
   * ⚠️ IMPORTANTE (v1.8+):
   * - O sistema SEMPRE usa o projeto padrão configurado (defaultProjectId)
   * - O sistema SEMPRE usa a primeira coluna ativa do projeto (menor posição)
   * - Não é necessário fornecer projectId ou columnId - o backend faz isso automaticamente
   * - É OBRIGATÓRIO ter um projeto padrão configurado antes de criar tarefas
   * - Se não houver projeto padrão, retornará erro 400
   */
  const handleCreateTask = async () => {
    if (!messageIdToCreate) return;

    setIsCreateTaskConfirmOpen(false);
    setIsCreatingTask(true);
    const mid = messageIdToCreate;
    const promise = whatsappApi.createTaskFromMessage(mid, {}).then(res => {
      if (res.warning) showError(res.warning);
      return res;
    });
    let response:
      | Awaited<ReturnType<typeof whatsappApi.createTaskFromMessage>>
      | undefined;
    try {
      response = await toast.promise(
        promise,
        {
          pending: {
            render: () => 'Criando tarefa...',
            icon: true,
          },
          success: {
            render: () => 'Tarefa criada!',
            type: 'success',
            icon: '✓',
          },
          error: {
            render({ data }: { data?: any }) {
              const msg =
                data?.response?.data?.message ||
                data?.message ||
                'Erro ao criar tarefa';
              return msg;
            },
            type: 'error',
            icon: true,
          },
        },
        {
          position: 'top-right',
          hideProgressBar: false,
          autoClose: 3000,
        }
      );
    } catch (error: any) {
      console.error('Erro ao criar tarefa:', error);
      if (error.response?.status === 403) {
        showError('Você não tem permissão para realizar esta ação.');
      } else if (error.response?.status === 400) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Erro ao criar tarefa';
        showError(errorMessage);
      }
    } finally {
      setIsCreatingTask(false);
      setMessageIdToCreate(null);
    }
    if (response) {
      loadConversation(phoneNumber);
      if (response.teamId && response.projectId) {
        setCreateTaskRedirect({
          teamId: response.teamId,
          projectId: response.projectId,
        });
        setIsCreateTaskSuccessOpen(true);
      }
    }
  };

  const handleGoToFunnel = () => {
    if (createTaskRedirect) {
      window.location.href = `/sistema/kanban?teamId=${createTaskRedirect.teamId}&projectId=${createTaskRedirect.projectId}`;
    }
    setIsCreateTaskSuccessOpen(false);
    setCreateTaskRedirect(null);
  };

  const handleOpenPropertyOptionsModal = () => {
    setIsMenuOpen(false);
    setPropertyOptionsForm({
      neighborhood: '',
      minValue: undefined,
      maxValue: undefined,
      operation: 'sale',
      limit: 5,
    });
    setIsPropertyOptionsModalOpen(true);
  };

  const handleOpenAssignToSdrModal = () => {
    setIsMenuOpen(false);
    setAssignToSdrUserId('');
    setLoadingCompanyUsers(true);
    setIsAssignToSdrModalOpen(true);
    whatsappApi
      .getConfig()
      .then(whatsappConfig => {
        // No WhatsApp só usamos equipe (obrigatório); usuário específico é só para campanhas.
        if (whatsappConfig.responsibleTeamId) {
          return teamApi
            .getTeamMembers(whatsappConfig.responsibleTeamId!)
            .then(members =>
              members.map(m => ({
                id: m.user?.id ?? (m as any).userId ?? '',
                name: m.user?.name ?? 'Usuário',
              }))
            );
        }
        return Promise.resolve([]);
      })
      .then(users => {
        setCompanyUsers(users.filter(u => u.id));
        setLoadingCompanyUsers(false);
      })
      .catch(() => {
        showError('Erro ao carregar lista de SDRs.');
        setLoadingCompanyUsers(false);
      });
  };

  const handleAssignToSdr = async () => {
    if (!assignToSdrUserId || messages.length === 0) return;
    setAssigningSdr(true);
    try {
      const lastMsg = messages[messages.length - 1];
      await whatsappApi.assignMessage(lastMsg.id, {
        sdrUserId: assignToSdrUserId,
      });
      showSuccess('Conversa alocada com sucesso.');
      setIsAssignToSdrModalOpen(false);
      setAssignToSdrUserId('');
      await loadConversation(phoneNumber);
    } catch (err: any) {
      showError(err?.message || 'Erro ao alocar conversa.');
    } finally {
      setAssigningSdr(false);
    }
  };

  const handleSendPropertyOptions = async () => {
    if (!canSendMessages || propertyOptionsSending) return;
    setPropertyOptionsSending(true);
    try {
      const res = await whatsappApi.sendPropertyOptions({
        phoneNumber,
        neighborhood: propertyOptionsForm.neighborhood.trim() || undefined,
        minValue: propertyOptionsForm.minValue ?? undefined,
        maxValue: propertyOptionsForm.maxValue ?? undefined,
        operation: propertyOptionsForm.operation,
        limit: propertyOptionsForm.limit,
      });
      if (res.sent > 0) {
        showSuccess(
          `${res.sent} opção(ões) de imóveis enviada(s) com sucesso!`
        );
        setIsPropertyOptionsModalOpen(false);
        loadConversation(phoneNumber);
      } else if (res.message) {
        showError(res.message);
      }
    } catch (error: any) {
      showError(error.message || 'Erro ao enviar opções de imóveis.');
    } finally {
      setPropertyOptionsSending(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <ConversationShimmer />
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        {onBack && (
          <BackButton onClick={onBack}>
            <MdArrowBack size={24} />
          </BackButton>
        )}
        {onOpenMenu && !onBack && (
          <BackButton onClick={onOpenMenu}>
            <MdArrowBack size={24} />
          </BackButton>
        )}
        <ContactInfo>
          {/* Avatar do contato (se disponível) */}
          {contactAvatarUrl && (
            <ContactAvatar
              src={contactAvatarUrl}
              alt={contactName || 'Contato'}
              onError={e => {
                // Ocultar avatar se não carregar
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <div style={{ flex: 1 }}>
            <ContactName>{contactName || 'Sem nome'}</ContactName>
            <PhoneNumber>
              <FaWhatsapp size={14} color='#25D366' />
              {formatPhoneDisplay(phoneNumber)}
            </PhoneNumber>
          </div>
        </ContactInfo>
        <div style={{ position: 'relative' }} ref={menuRef}>
          <MenuButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <MdMoreVert size={24} />
          </MenuButton>
          <MenuDropdown $isOpen={isMenuOpen}>
            {canSendMessages && hasClientSentFirstMessage && (
              <MenuItem onClick={handleOpenPropertyOptionsModal}>
                <MdHome size={20} />
                Enviar opções de imóveis
              </MenuItem>
            )}
            {canCreateTask &&
              (() => {
                // Encontrar a última mensagem recebida (inbound) para criar tarefa
                const lastInboundMessage = messages
                  .filter(m => m.direction === 'inbound')
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  )[0];
                const hasInboundForTask = messages.some(
                  m => m.direction === 'inbound'
                );
                const canCreateTaskNow =
                  hasFunnelConfigured && hasInboundForTask && !isCreatingTask;

                const menuItem = (
                  <MenuItem
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (!hasFunnelConfigured) return;
                      if (lastInboundMessage) {
                        setMessageIdToCreate(lastInboundMessage.id);
                        setIsCreateTaskConfirmOpen(true);
                      } else {
                        showError(
                          'Nenhuma mensagem recebida encontrada para criar tarefa.'
                        );
                      }
                    }}
                    disabled={!canCreateTaskNow}
                  >
                    <MdAssignment size={20} />
                    Criar Tarefa
                  </MenuItem>
                );

                return !hasFunnelConfigured ? (
                  <Tooltip
                    key='create-task-disabled'
                    content='Configure um funil de vendas nas configurações do WhatsApp (Integrações) para poder criar tarefas a partir das mensagens.'
                    placement='left'
                  >
                    <span style={{ display: 'flex', width: '100%' }}>
                      {menuItem}
                    </span>
                  </Tooltip>
                ) : (
                  menuItem
                );
              })()}
            {canAssignChat && messages.length > 0 && (
              <MenuItem onClick={handleOpenAssignToSdrModal}>
                <MdPersonAdd size={20} />
                Alocar para SDR
              </MenuItem>
            )}
          </MenuDropdown>
        </div>
        <MenuOverlay
          $isOpen={isMenuOpen}
          onClick={() => setIsMenuOpen(false)}
        />
      </Header>

      {/* Painel de Insights da IA para o SDR — adaptado a tema dark/light */}
      {conversationInsights && (
        <InsightsPanelWrapper>
          <InsightsPanelToggle
            type="button"
            onClick={() => setIsInsightsPanelOpen(!isInsightsPanelOpen)}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MdAutoAwesome size={18} />
              Insights da IA — {conversationInsights.leadProfile}
              <InsightsBadge $level={conversationInsights.engagementLevel}>
                Engajamento {conversationInsights.engagementLevel}
              </InsightsBadge>
            </span>
            <InsightsChevron $open={isInsightsPanelOpen}>▼</InsightsChevron>
          </InsightsPanelToggle>

          {isInsightsPanelOpen && (
            <InsightsContent>
              <InsightsBlock>
                <InsightsBlockTitle>📋 Resumo da Conversa</InsightsBlockTitle>
                <div style={{ lineHeight: 1.5 }}>
                  {sanitizeSummaryText(conversationInsights.conversationSummary ?? '')}
                </div>
              </InsightsBlock>

              <InsightsBlock>
                <InsightsBlockTitle>📊 Dados Coletados</InsightsBlockTitle>
                <InsightsGrid>
                  {hasDisplayValue(conversationInsights.collectedData?.name) && (
                    <span><strong>Nome:</strong> {String(conversationInsights.collectedData.name).trim()}</span>
                  )}
                  {hasDisplayValue(conversationInsights.collectedData?.phone) && (
                    <span><strong>Telefone:</strong> {formatPhoneDisplay(String(conversationInsights.collectedData.phone))}</span>
                  )}
                  {hasDisplayValue(conversationInsights.collectedData?.email) && (
                    <span><strong>Email:</strong> {String(conversationInsights.collectedData.email).trim()}</span>
                  )}
                  {hasDisplayValue(conversationInsights.intent) && (
                    <span><strong>Intenção:</strong> {String(conversationInsights.intent).trim()}</span>
                  )}
                  {hasDisplayValue(conversationInsights.collectedData?.propertyType) && (
                    <span><strong>Tipo:</strong> {String(conversationInsights.collectedData.propertyType).trim()}</span>
                  )}
                  {hasDisplayValue(conversationInsights.collectedData?.location) && (
                    <span><strong>Local:</strong> {String(conversationInsights.collectedData.location).trim()}</span>
                  )}
                  {typeof conversationInsights.collectedData?.budget === 'number' && conversationInsights.collectedData.budget > 0 && (
                    <span><strong>Orçamento:</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(conversationInsights.collectedData.budget)}</span>
                  )}
                  {hasDisplayValue(conversationInsights.collectedData?.notes) && (
                    <span style={{ gridColumn: '1 / -1' }}><strong>Obs:</strong> {String(conversationInsights.collectedData.notes).trim()}</span>
                  )}
                </InsightsGrid>
              </InsightsBlock>

              {conversationInsights.suggestions.length > 0 && (
                <InsightsBlock>
                  <InsightsBlockTitle>💡 Sugestões para o SDR</InsightsBlockTitle>
                  <InsightsList>
                    {conversationInsights.suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </InsightsList>
                </InsightsBlock>
              )}

              {conversationInsights.attentionPoints.length > 0 && (
                <InsightsAttentionBlock>
                  <InsightsAttentionTitle>⚠️ Pontos de Atenção</InsightsAttentionTitle>
                  <InsightsAttentionList>
                    {conversationInsights.attentionPoints.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </InsightsAttentionList>
                </InsightsAttentionBlock>
              )}
            </InsightsContent>
          )}
        </InsightsPanelWrapper>
      )}

      <MessagesContainer>
        {messages.length === 0 ? (
          <EmptyState>
            <EmptyStateIcon>
              <FaWhatsapp size={48} />
            </EmptyStateIcon>
            <EmptyStateText>
              Aguardando o cliente enviar a primeira mensagem.
              <br />
              Não enviamos a primeira mensagem ao cliente (não utilizamos
              template). A conversa só é mantida quando o cliente iniciar o
              contato.
            </EmptyStateText>
          </EmptyState>
        ) : (
          <>
            {hasMoreOlderMessages && (
              <LoadOlderButton
                type="button"
                onClick={loadMoreOlderMessages}
                disabled={loadingMoreOlder || loading}
              >
                {loadingMoreOlder
                  ? 'Carregando...'
                  : `Carregar mensagens antigas (${messages.length} de ${conversationTotal})`}
              </LoadOlderButton>
            )}
            {messages.map(message => (
              <MessageBubble
                key={message.id}
                $isOutbound={message.direction === 'outbound'}
              >
                {/* Mensagem de Texto */}
                {message.messageType === 'text' && message.message && (
                  <MessageText>{message.message}</MessageText>
                )}

                {/* Mensagem de Imagem */}
                {message.messageType === 'image' && message.mediaUrl && (
                  <>
                    <MessageImage
                      src={message.mediaUrl}
                      alt='Imagem'
                      onClick={() => window.open(message.mediaUrl, '_blank')}
                      loading='lazy'
                      onError={async e => {
                        // Tentar recarregar mensagem para obter nova URL assinada (v1.11)
                        const img = e.target as HTMLImageElement;
                        if (!img.dataset.errorHandled) {
                          img.dataset.errorHandled = 'true';

                          // Verificar permissão antes de chamar API
                          const canViewMessages =
                            permissionsContext?.hasPermission(
                              'whatsapp:view_messages'
                            ) ?? false;
                          if (!canViewMessages) {
                            img.style.display = 'none';
                            return;
                          }

                          try {
                            // Recarregar mensagem para obter nova URL assinada
                            const updatedMessage = await whatsappApi.getMessage(
                              message.id
                            );
                            if (
                              updatedMessage.mediaUrl &&
                              updatedMessage.mediaUrl !== message.mediaUrl
                            ) {
                              // Nova URL obtida, atualizar src
                              img.src = updatedMessage.mediaUrl;
                              img.dataset.errorHandled = 'false'; // Permitir nova tentativa
                              // Atualizar mensagem no estado
                              setMessages(prev =>
                                prev.map(m =>
                                  m.id === message.id
                                    ? {
                                        ...m,
                                        mediaUrl: updatedMessage.mediaUrl,
                                      }
                                    : m
                                )
                              );
                            } else {
                              // Não conseguiu nova URL, ocultar
                              img.style.display = 'none';
                            }
                          } catch (error) {
                            // Erro ao recarregar, ocultar imagem
                            console.error(
                              'Erro ao recarregar URL da imagem:',
                              error
                            );
                            img.style.display = 'none';
                          }
                        }
                      }}
                    />
                    {message.message && (
                      <MessageText style={{ marginTop: '8px' }}>
                        {message.message}
                      </MessageText>
                    )}
                  </>
                )}

                {/* Mensagem de Vídeo */}
                {message.messageType === 'video' && message.mediaUrl && (
                  <>
                    <MessageVideo
                      src={message.mediaUrl}
                      controls
                      preload='metadata'
                      onClick={() => window.open(message.mediaUrl, '_blank')}
                      onError={async e => {
                        // Tentar recarregar mensagem para obter nova URL assinada (v1.11)
                        const video = e.target as HTMLVideoElement;
                        if (!video.dataset.errorHandled) {
                          video.dataset.errorHandled = 'true';

                          // Verificar permissão antes de chamar API
                          const canViewMessages =
                            permissionsContext?.hasPermission(
                              'whatsapp:view_messages'
                            ) ?? false;
                          if (!canViewMessages) {
                            video.style.display = 'none';
                            return;
                          }

                          try {
                            // Recarregar mensagem para obter nova URL assinada
                            const updatedMessage = await whatsappApi.getMessage(
                              message.id
                            );
                            if (
                              updatedMessage.mediaUrl &&
                              updatedMessage.mediaUrl !== message.mediaUrl
                            ) {
                              // Nova URL obtida, atualizar src
                              video.src = updatedMessage.mediaUrl;
                              video.dataset.errorHandled = 'false'; // Permitir nova tentativa
                              // Atualizar mensagem no estado
                              setMessages(prev =>
                                prev.map(m =>
                                  m.id === message.id
                                    ? {
                                        ...m,
                                        mediaUrl: updatedMessage.mediaUrl,
                                      }
                                    : m
                                )
                              );
                            } else {
                              // Não conseguiu nova URL, ocultar
                              video.style.display = 'none';
                            }
                          } catch (error) {
                            // Erro ao recarregar, ocultar vídeo
                            console.error(
                              'Erro ao recarregar URL do vídeo:',
                              error
                            );
                            video.style.display = 'none';
                          }
                        }
                      }}
                    >
                      Seu navegador não suporta o elemento de vídeo.
                      <a href={message.mediaUrl} download>
                        Baixar vídeo
                      </a>
                    </MessageVideo>
                    {message.message && (
                      <MessageText style={{ marginTop: '8px' }}>
                        {message.message}
                      </MessageText>
                    )}
                  </>
                )}

                {/* Mensagem de Áudio */}
                {message.messageType === 'audio' && message.mediaUrl && (
                  <MessageMediaContainer>
                    <MessageAudio
                      src={message.mediaUrl}
                      controls
                      preload='metadata'
                      onError={e => {
                        // Ocultar áudio se não carregar - evita loops
                        const audio = e.target as HTMLAudioElement;
                        if (!audio.dataset.errorHandled) {
                          audio.dataset.errorHandled = 'true';
                          audio.style.display = 'none';
                        }
                      }}
                    >
                      Seu navegador não suporta o elemento de áudio.
                      <a href={message.mediaUrl} download>
                        Baixar áudio
                      </a>
                    </MessageAudio>
                    {message.mediaMimeType && (
                      <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                        {message.mediaMimeType}
                      </span>
                    )}
                  </MessageMediaContainer>
                )}

                {/* Mensagem de Voz (Voice Note) */}
                {message.messageType === 'voice' && message.mediaUrl && (
                  <MessageMediaContainer>
                    <MessageAudio
                      src={message.mediaUrl}
                      controls
                      preload='metadata'
                      onError={async e => {
                        // Tentar recarregar mensagem para obter nova URL assinada (v1.11)
                        const audio = e.target as HTMLAudioElement;
                        if (!audio.dataset.errorHandled) {
                          audio.dataset.errorHandled = 'true';

                          // Verificar permissão antes de chamar API
                          const canViewMessages =
                            permissionsContext?.hasPermission(
                              'whatsapp:view_messages'
                            ) ?? false;
                          if (!canViewMessages) {
                            audio.style.display = 'none';
                            return;
                          }

                          try {
                            // Recarregar mensagem para obter nova URL assinada
                            const updatedMessage = await whatsappApi.getMessage(
                              message.id
                            );
                            if (
                              updatedMessage.mediaUrl &&
                              updatedMessage.mediaUrl !== message.mediaUrl
                            ) {
                              // Nova URL obtida, atualizar src
                              audio.src = updatedMessage.mediaUrl;
                              audio.dataset.errorHandled = 'false'; // Permitir nova tentativa
                              // Atualizar mensagem no estado
                              setMessages(prev =>
                                prev.map(m =>
                                  m.id === message.id
                                    ? {
                                        ...m,
                                        mediaUrl: updatedMessage.mediaUrl,
                                      }
                                    : m
                                )
                              );
                            } else {
                              // Não conseguiu nova URL, ocultar
                              audio.style.display = 'none';
                            }
                          } catch (error) {
                            // Erro ao recarregar, ocultar áudio
                            console.error(
                              'Erro ao recarregar URL do áudio:',
                              error
                            );
                            audio.style.display = 'none';
                          }
                        }
                      }}
                    >
                      Seu navegador não suporta o elemento de áudio.
                      <a href={message.mediaUrl} download>
                        Baixar nota de voz
                      </a>
                    </MessageAudio>
                    <VoiceBadge>🎤 Nota de voz</VoiceBadge>
                  </MessageMediaContainer>
                )}

                {/* Mensagem de Documento */}
                {message.messageType === 'document' && message.mediaUrl && (
                  <>
                    <MessageDocument
                      href={message.mediaUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      download={message.mediaFileName}
                    >
                      <DocumentIcon>📄</DocumentIcon>
                      <DocumentInfo>
                        <DocumentName>
                          {message.mediaFileName || 'Documento'}
                        </DocumentName>
                        {message.mediaMimeType && (
                          <DocumentType>{message.mediaMimeType}</DocumentType>
                        )}
                      </DocumentInfo>
                      <div style={{ fontSize: '1.2em' }}>⬇️</div>
                    </MessageDocument>
                    {message.message && (
                      <MessageText style={{ marginTop: '8px' }}>
                        {message.message}
                      </MessageText>
                    )}
                  </>
                )}

                {/* Mensagem de Sticker */}
                {message.messageType === 'sticker' && message.mediaUrl && (
                  <StickerContainer>
                    <MessageSticker
                      src={message.mediaUrl}
                      alt='Sticker'
                      loading='lazy'
                      onClick={() => window.open(message.mediaUrl, '_blank')}
                      onError={async e => {
                        // Tentar recarregar mensagem para obter nova URL assinada (v1.11)
                        const img = e.target as HTMLImageElement;
                        if (!img.dataset.errorHandled) {
                          img.dataset.errorHandled = 'true';

                          // Verificar permissão antes de chamar API
                          const canViewMessages =
                            permissionsContext?.hasPermission(
                              'whatsapp:view_messages'
                            ) ?? false;
                          if (!canViewMessages) {
                            img.style.display = 'none';
                            return;
                          }

                          try {
                            // Recarregar mensagem para obter nova URL assinada
                            const updatedMessage = await whatsappApi.getMessage(
                              message.id
                            );
                            if (
                              updatedMessage.mediaUrl &&
                              updatedMessage.mediaUrl !== message.mediaUrl
                            ) {
                              // Nova URL obtida, atualizar src
                              img.src = updatedMessage.mediaUrl;
                              img.dataset.errorHandled = 'false'; // Permitir nova tentativa
                              // Atualizar mensagem no estado
                              setMessages(prev =>
                                prev.map(m =>
                                  m.id === message.id
                                    ? {
                                        ...m,
                                        mediaUrl: updatedMessage.mediaUrl,
                                      }
                                    : m
                                )
                              );
                            } else {
                              // Não conseguiu nova URL, ocultar
                              img.style.display = 'none';
                              const container = img.parentElement;
                              if (container) {
                                container.style.display = 'none';
                              }
                            }
                          } catch (error) {
                            // Erro ao recarregar, ocultar sticker
                            console.error(
                              'Erro ao recarregar URL do sticker:',
                              error
                            );
                            img.style.display = 'none';
                            const container = img.parentElement;
                            if (container) {
                              container.style.display = 'none';
                            }
                          }
                        }
                      }}
                    />
                  </StickerContainer>
                )}

                {/* Mensagem de Localização */}
                {message.messageType === 'location' && (
                  <LocationContainer>
                    <LocationIcon>📍</LocationIcon>
                    <LocationInfo>
                      <LocationLabel>Localização compartilhada</LocationLabel>
                      {message.webhookData?.latitude &&
                        message.webhookData?.longitude && (
                          <MapLink
                            href={`https://www.google.com/maps?q=${message.webhookData.latitude},${message.webhookData.longitude}`}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            Ver no Google Maps
                          </MapLink>
                        )}
                      {message.webhookData?.address && (
                        <div
                          style={{
                            fontSize: '0.875rem',
                            color: '#666',
                            marginTop: '4px',
                          }}
                        >
                          {message.webhookData.address}
                        </div>
                      )}
                    </LocationInfo>
                  </LocationContainer>
                )}

                {/* Mensagem de Contato */}
                {message.messageType === 'contact' && (
                  <ContactContainer>
                    <ContactIcon>👤</ContactIcon>
                    <ContactDetails>
                      <ContactLabel>Contato compartilhado</ContactLabel>
                      {message.webhookData?.contact && (
                        <>
                          {message.webhookData.contact.name && (
                            <ContactDetailItem>
                              <strong>Nome:</strong>{' '}
                              {message.webhookData.contact.name}
                            </ContactDetailItem>
                          )}
                          {message.webhookData.contact.phone && (
                            <ContactDetailItem>
                              <strong>Telefone:</strong>{' '}
                              {message.webhookData.contact.phone}
                            </ContactDetailItem>
                          )}
                          {message.webhookData.contact.email && (
                            <ContactDetailItem>
                              <strong>Email:</strong>{' '}
                              {message.webhookData.contact.email}
                            </ContactDetailItem>
                          )}
                        </>
                      )}
                    </ContactDetails>
                  </ContactContainer>
                )}
                <MessageTime>
                  <MdSchedule size={12} />
                  {formatMessageTime(message.createdAt)}
                  {message.direction === 'outbound' && message.status && (
                    <span
                      style={{
                        marginLeft: '8px',
                        fontSize: '0.75rem',
                        opacity: message.status === 'pending' ? 0.6 : 1,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                      }}
                    >
                      {message.status === 'pending' && (
                        <span style={{ color: '#6B7280', opacity: 0.6 }}>
                          Enviando...
                        </span>
                      )}
                      {message.status === 'read' && (
                        <>
                          <span style={{ color: '#3B82F6' }}>✓</span>
                          <span
                            style={{ color: '#3B82F6', marginLeft: '-2px' }}
                          >
                            ✓
                          </span>
                        </>
                      )}
                      {message.status === 'delivered' && (
                        <span style={{ color: '#3B82F6' }}>✓</span>
                      )}
                      {message.status === 'sent' && (
                        <span style={{ color: '#6B7280' }}>✓</span>
                      )}
                      {message.status === 'failed' && (
                        <span style={{ color: '#EF4444' }}>✗</span>
                      )}
                    </span>
                  )}
                  {message.direction === 'inbound' && (
                    <span
                      style={{
                        marginLeft: '8px',
                        fontSize: '0.75rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                      }}
                    >
                      {!message.readAt ? (
                        <span style={{ color: '#3B82F6' }}>✓</span>
                      ) : (
                        <span style={{ color: '#6B7280', opacity: 0.6 }}>
                          ✓
                        </span>
                      )}
                    </span>
                  )}
                </MessageTime>
              </MessageBubble>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </MessagesContainer>

      <InputContainer>
        {!hasClientSentFirstMessage && (
          <WarningMessage>
            <MdInfo size={18} />
            <div>
              <strong>Aguardando primeira mensagem do cliente</strong>
              <br />
              Não enviamos a primeira mensagem ao cliente (não utilizamos
              template). Você só pode responder quando o cliente enviar a
              primeira mensagem.
            </div>
          </WarningMessage>
        )}
        {imagePreview && (
          <ImagePreviewContainer>
            <ImagePreview src={imagePreview} alt='Preview' />
            <Tooltip content='Remover imagem' placement='right'>
              <RemoveImageButton onClick={handleRemoveImage}>
                <MdClose size={18} />
              </RemoveImageButton>
            </Tooltip>
          </ImagePreviewContainer>
        )}
        <InputWrapper>
          <HiddenFileInput
            ref={imageInputRef}
            type='file'
            accept='image/*'
            onChange={handleImageSelect}
            disabled={!canReply}
          />
          <EmojiButtonWrapper $disabled={!canReply}>
            <EmojiPicker
              onEmojiSelect={handleEmojiSelect}
              disabled={!canReply}
            />
          </EmojiButtonWrapper>
          <Tooltip content='Adicionar imagem' placement='right'>
            <ImageButton
              onClick={() => imageInputRef.current?.click()}
              disabled={!canReply}
            >
              <MdImage size={20} />
            </ImageButton>
          </Tooltip>
          <MessageInput
            ref={inputRef}
            value={messageText}
            onChange={e => {
              const newText = e.target.value;
              setMessageText(newText);

              // Salvar rascunho com debounce (500ms)
              if (draftSaveTimeoutRef.current) {
                clearTimeout(draftSaveTimeoutRef.current);
              }
              draftSaveTimeoutRef.current = setTimeout(() => {
                if (phoneNumber) {
                  draftsRef.current.set(phoneNumber, newText);
                }
              }, 500);
            }}
            onKeyPress={handleKeyPress}
            placeholder={
              !hasClientSentFirstMessage
                ? 'Aguarde o cliente enviar a primeira mensagem...'
                : is24HoursWindowOpen
                  ? 'Digite uma mensagem...'
                  : 'Não é possível enviar: a janela de 24 horas após o último contato expirou.'
            }
            disabled={!canReply}
            rows={1}
            style={{
              height: 'auto',
              overflow: 'hidden',
            }}
            onInput={e => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
            }}
          />
          <Tooltip
            content={
              !hasClientSentFirstMessage
                ? 'Aguarde o cliente enviar a primeira mensagem.'
                : !is24HoursWindowOpen
                  ? 'Não é possível enviar: janela de 24 horas expirada.'
                  : isSending
                    ? 'Enviando...'
                    : 'Enviar mensagem'
            }
            placement='right'
          >
            <SendButton
              onClick={handleSendMessage}
              disabled={
                !canReply ||
                (!messageText.trim() && !selectedImage) ||
                isSending
              }
            >
              <MdSend size={20} />
            </SendButton>
          </Tooltip>
        </InputWrapper>
      </InputContainer>

      {/* Modal Enviar opções de imóveis — moderno com máscaras */}
      {isPropertyOptionsModalOpen && (
        <PropertyOptionsModalOverlay
          $isOpen={isPropertyOptionsModalOpen}
          onClick={() =>
            !propertyOptionsSending && setIsPropertyOptionsModalOpen(false)
          }
        >
          <PropertyOptionsModalCard onClick={e => e.stopPropagation()}>
            <PropertyOptionsModalHeader>
              <PropertyOptionsModalTitle>
                <MdHome size={22} color="#25d366" />
                Enviar opções de imóveis
              </PropertyOptionsModalTitle>
              <PropertyOptionsModalCloseBtn
                onClick={() =>
                  !propertyOptionsSending &&
                  setIsPropertyOptionsModalOpen(false)
                }
                type="button"
              >
                <MdClose size={20} />
              </PropertyOptionsModalCloseBtn>
            </PropertyOptionsModalHeader>
            <PropertyOptionsModalBody>
              <PropertyOptionsDescription>
                Busque imóveis por bairro e valor e envie título, descrição,
                valor e fotos com link do site para o cliente.
              </PropertyOptionsDescription>

              <PropertyOptionsField>
                <PropertyOptionsLabel>Bairro (opcional)</PropertyOptionsLabel>
                <PropertyOptionsInput
                  type="text"
                  placeholder="Ex: Centro, Jardins"
                  value={propertyOptionsForm.neighborhood}
                  onChange={e =>
                    setPropertyOptionsForm(f => ({
                      ...f,
                      neighborhood: e.target.value,
                    }))
                  }
                />
              </PropertyOptionsField>

              <PropertyOptionsFormRow>
                <PropertyOptionsField>
                  <PropertyOptionsLabel>Valor mínimo (opcional)</PropertyOptionsLabel>
                  <NumericFormat
                    customInput={PropertyOptionsInputAsInput}
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    decimalScale={0}
                    allowNegative={false}
                    placeholder="R$ 0"
                    value={propertyOptionsForm.minValue ?? ''}
                    onValueChange={values =>
                      setPropertyOptionsForm(f => ({
                        ...f,
                        minValue: values.floatValue,
                      }))
                    }
                  />
                </PropertyOptionsField>
                <PropertyOptionsField>
                  <PropertyOptionsLabel>Valor máximo (opcional)</PropertyOptionsLabel>
                  <NumericFormat
                    customInput={PropertyOptionsInputAsInput}
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    decimalScale={0}
                    allowNegative={false}
                    placeholder="R$ 0"
                    value={propertyOptionsForm.maxValue ?? ''}
                    onValueChange={values =>
                      setPropertyOptionsForm(f => ({
                        ...f,
                        maxValue: values.floatValue,
                      }))
                    }
                  />
                </PropertyOptionsField>
              </PropertyOptionsFormRow>

              <PropertyOptionsField>
                <PropertyOptionsLabel>Operação</PropertyOptionsLabel>
                <PropertyOptionsSelect
                  value={propertyOptionsForm.operation}
                  onChange={e =>
                    setPropertyOptionsForm(f => ({
                      ...f,
                      operation: e.target.value as 'sale' | 'rent',
                    }))
                  }
                >
                  <option value="sale">Venda</option>
                  <option value="rent">Aluguel</option>
                </PropertyOptionsSelect>
              </PropertyOptionsField>

              <PropertyOptionsField>
                <PropertyOptionsLabel>Quantidade de imóveis (1 a 10)</PropertyOptionsLabel>
                <NumericFormat
                  customInput={PropertyOptionsInputAsInput}
                  allowLeadingZeros={false}
                  min={1}
                  max={10}
                  value={propertyOptionsForm.limit}
                  onValueChange={values => {
                    const n = values.floatValue ?? 5;
                    setPropertyOptionsForm(f => ({
                      ...f,
                      limit: Math.min(10, Math.max(1, Number.isFinite(n) ? n : 5)),
                    }));
                  }}
                  isAllowed={values => {
                    const v = values.floatValue;
                    if (v === undefined) return true;
                    return v >= 1 && v <= 10;
                  }}
                  placeholder="5"
                />
              </PropertyOptionsField>

              <PropertyOptionsFooter>
                <PropertyOptionsButton
                  type="button"
                  onClick={() =>
                    !propertyOptionsSending &&
                    setIsPropertyOptionsModalOpen(false)
                  }
                >
                  Cancelar
                </PropertyOptionsButton>
                <PropertyOptionsButton
                  $primary
                  type="button"
                  onClick={handleSendPropertyOptions}
                  disabled={propertyOptionsSending}
                >
                  {propertyOptionsSending ? 'Enviando...' : 'Enviar opções'}
                </PropertyOptionsButton>
              </PropertyOptionsFooter>
            </PropertyOptionsModalBody>
          </PropertyOptionsModalCard>
        </PropertyOptionsModalOverlay>
      )}

      {/* Modal Alocar conversa para SDR */}
      {isAssignToSdrModalOpen && (
        <PropertyOptionsModalOverlay
          $isOpen={isAssignToSdrModalOpen}
          onClick={() =>
            !assigningSdr && setIsAssignToSdrModalOpen(false)
          }
        >
          <PropertyOptionsModalCard onClick={e => e.stopPropagation()}>
            <PropertyOptionsModalHeader>
              <PropertyOptionsModalTitle>
                <MdPersonAdd size={22} />
                Alocar conversa para SDR
              </PropertyOptionsModalTitle>
              <PropertyOptionsModalCloseBtn
                type="button"
                onClick={() =>
                  !assigningSdr && setIsAssignToSdrModalOpen(false)
                }
              >
                <MdClose size={20} />
              </PropertyOptionsModalCloseBtn>
            </PropertyOptionsModalHeader>
            <PropertyOptionsModalBody>
              <PropertyOptionsDescription>
                Selecione o SDR que ficará responsável por esta conversa.
              </PropertyOptionsDescription>
              {loadingCompanyUsers ? (
                <div style={{ padding: '12px 0', color: 'var(--textSecondary)' }}>
                  Carregando usuários...
                </div>
              ) : companyUsers.length === 0 ? (
                <div style={{ padding: '12px 0', color: 'var(--textSecondary)' }}>
                  Configure uma equipe responsável na configuração do WhatsApp (Integrações) para poder alocar conversas.
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <Select
                      value={assignToSdrUserId}
                      onChange={e => setAssignToSdrUserId(e.target.value)}
                      disabled={assigningSdr}
                      style={{ width: '100%' }}
                    >
                      <option value="">Selecione um SDR</option>
                      {companyUsers.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <PropertyOptionsFooter>
                    <PropertyOptionsButton
                      type="button"
                      onClick={() =>
                        !assigningSdr && setIsAssignToSdrModalOpen(false)
                      }
                      disabled={assigningSdr}
                    >
                      Cancelar
                    </PropertyOptionsButton>
                    <PropertyOptionsButton
                      $primary
                      type="button"
                      onClick={handleAssignToSdr}
                      disabled={!assignToSdrUserId || assigningSdr}
                    >
                      {assigningSdr ? 'Alocando...' : 'Alocar'}
                    </PropertyOptionsButton>
                  </PropertyOptionsFooter>
                </>
              )}
            </PropertyOptionsModalBody>
          </PropertyOptionsModalCard>
        </PropertyOptionsModalOverlay>
      )}

      {canCreateTask && (
        <>
          <ConfirmDeleteModal
            isOpen={isCreateTaskConfirmOpen}
            onClose={() => {
              setIsCreateTaskConfirmOpen(false);
              setMessageIdToCreate(null);
            }}
            onConfirm={handleCreateTask}
            title='Criar Tarefa'
            message='Deseja criar uma tarefa no Kanban a partir desta mensagem do WhatsApp? A tarefa será criada no projeto padrão configurado.'
            isLoading={isCreatingTask}
            variant='mark-as-sold'
            confirmLabel='Criar Tarefa'
            loadingLabel='Criando...'
          />
          <ConfirmDeleteModal
            isOpen={isCreateTaskSuccessOpen}
            onClose={() => {
              setIsCreateTaskSuccessOpen(false);
              setCreateTaskRedirect(null);
            }}
            onConfirm={handleGoToFunnel}
            title='Tarefa criada!'
            message='A tarefa foi criada com sucesso. Deseja ir para o funil agora?'
            variant='mark-as-sold'
            confirmLabel='Sim, ir para o funil'
            cancelLabel='Ficar aqui'
          />
        </>
      )}
    </Container>
  );
};
