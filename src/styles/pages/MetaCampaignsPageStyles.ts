import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const PageContainer = styled.div`
  padding: 12px;
  min-height: 100vh;
  min-height: 100dvh; /* fallback para Safari/iPad */
  background: ${props => props.theme.colors.background};
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  @media (min-width: 480px) {
    padding: 16px;
  }
  @media (min-width: 600px) {
    padding: 20px;
  }
  @media (min-width: 768px) {
    padding: 20px 24px;
    padding-left: max(24px, env(safe-area-inset-left, 0px));
    padding-right: max(24px, env(safe-area-inset-right, 0px));
    padding-bottom: max(20px, env(safe-area-inset-bottom, 0px));
  }
  @media (min-width: 960px) {
    padding: 24px 28px;
    padding-left: max(28px, env(safe-area-inset-left, 0px));
    padding-right: max(28px, env(safe-area-inset-right, 0px));
    max-width: none;
    margin: 0;
  }
  @media (min-width: 1024px) {
    padding: 24px 32px;
    padding-left: max(32px, env(safe-area-inset-left, 0px));
    padding-right: max(32px, env(safe-area-inset-right, 0px));
  }
`;

export const BackButton = styled.button`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  padding: 10px 16px;
  min-height: 44px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 16px;
  @media (max-width: 480px) {
    padding: 12px 14px;
    min-height: 48px;
    margin-bottom: 12px;
  }
  &:hover {
    background: ${props => props.theme.colors.primary};
    color: white;
    border-color: ${props => props.theme.colors.primary};
  }
`;

export const HeaderRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
  @media (min-width: 768px) {
    gap: 20px;
    margin-bottom: 24px;
  }
  @media (min-width: 1024px) {
    margin-bottom: 28px;
  }
  @media (max-width: 480px) {
    gap: 12px;
    margin-bottom: 16px;
  }
`;

export const Title = styled.h1`
  font-size: 1.35rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  @media (min-width: 480px) {
    font-size: 1.5rem;
    gap: 10px;
  }
  @media (min-width: 768px) {
    font-size: 1.75rem;
    gap: 12px;
  }
  @media (min-width: 1024px) {
    font-size: 2rem;
    gap: 12px;
  }
`;

export const Subtitle = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0 0 12px 0;
  line-height: 1.45;
  max-width: 560px;
  @media (min-width: 480px) {
    font-size: 0.9375rem;
    margin: 0 0 16px 0;
  }
  @media (min-width: 600px) {
    font-size: 1rem;
    margin: 0 0 24px 0;
  }
`;

export const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  width: 100%;
  @media (min-width: 768px) {
    gap: 10px 12px;
  }
  @media (min-width: 1024px) {
    gap: 12px;
  }
`;

export const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 0.875rem;
  background: ${props => props.theme.colors.cardBackground};
  color: ${props => props.theme.colors.text};
  height: 44px;
  min-width: 0;
  box-sizing: border-box;
  @media (max-width: 600px) {
    width: 100%;
  }
  @media (min-width: 768px) {
    min-width: 120px;
  }
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

export const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  min-height: 44px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  background: ${props => props.theme.colors.cardBackground};
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;
  cursor: pointer;
  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 0.8125rem;
    gap: 6px;
  }
  &:hover {
    background: ${props => props.theme.colors.backgroundSecondary};
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
  }
`;

export const CreateCampaignBtn = styled(IconButton)`
  background: ${props => props.theme.colors.primary};
  color: white;
  border-color: ${props => props.theme.colors.primary};
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryDark};
    border-color: ${props => props.theme.colors.primaryDark};
    color: white;
  }
`;

/** Link para a página de criação de campanha (mesmo visual do CreateCampaignBtn) */
export const CreateCampaignLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  min-height: 44px;
  border: 1px solid ${props => props.theme.colors.primary};
  border-radius: 8px;
  background: ${props => props.theme.colors.primary};
  color: white;
  font-size: 0.875rem;
  text-decoration: none;
  cursor: pointer;
  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 0.8125rem;
  }
  &:hover {
    background: ${props => props.theme.colors.primaryDark ?? props.theme.colors.primary};
    border-color: ${props => props.theme.colors.primaryDark ?? props.theme.colors.primary};
    color: white;
  }
`;

export const ConfigLink = styled(IconButton)`
  text-decoration: none;
  border-color: rgba(24, 119, 242, 0.3);
  color: #1877f2;
  &:hover {
    background: rgba(24, 119, 242, 0.08);
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  @media (min-width: 768px) {
    padding: 24px;
  }
`;

export const ModalBox = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  padding: 24px;
  max-width: 440px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  @media (min-width: 768px) {
    max-width: min(440px, 90vw);
    padding: 28px;
  }
  @media (min-width: 1024px) {
    max-width: 440px;
  }
`;

export const ModalTitle = styled.h3`
  margin: 0 0 20px 0;
  font-size: 1.125rem;
  color: ${props => props.theme.colors.text};
`;

export const ModalField = styled.div`
  margin-bottom: 16px;
  label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: ${props => props.theme.colors.text};
    margin-bottom: 6px;
  }
  select,
  input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid ${props => props.theme.colors.border};
    border-radius: 8px;
    font-size: 0.875rem;
    background: ${props => props.theme.colors.cardBackground};
    color: ${props => props.theme.colors.text};
  }
`;

export const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

/** Modal de detalhes do anúncio: mais largo para mídia */
export const AdDetailModalBox = styled(ModalBox)`
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  @media (min-width: 768px) {
    max-width: min(560px, 92vw);
  }
`;

export const AdDetailMedia = styled.div`
  width: 100%;
  margin-bottom: 16px;
  border-radius: 12px;
  overflow: hidden;
  background: ${props => props.theme.colors.backgroundTertiary};
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
`;

export const AdDetailMediaImg = styled.img`
  max-width: 100%;
  max-height: 360px;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
`;

export const AdDetailVideo = styled.video`
  max-width: 100%;
  max-height: 360px;
  width: auto;
  height: auto;
  display: block;
`;

export const AdDetailMediaLabel = styled.span`
  font-size: 0.8125rem;
  color: ${props => props.theme.colors.textSecondary};
  padding: 12px;
`;

export const AdDetailName = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 8px;
`;

export const AdDetailMeta = styled.div`
  font-size: 0.8125rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 12px;
`;

export const AdDetailBlock = styled.div`
  margin-bottom: 12px;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text};
  line-height: 1.5;
  & strong {
    display: block;
    font-size: 0.8125rem;
    color: ${props => props.theme.colors.textSecondary};
    margin-bottom: 4px;
  }
`;

export const VerDetalhesBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: ${props => props.theme.colors.primary};
  background: ${props => props.theme.colors.primary}14;
  border: 1px solid ${props => props.theme.colors.primary}40;
  border-radius: 8px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s, border-color 0.2s;
  &:hover {
    background: ${props => props.theme.colors.primary}22;
    border-color: ${props => props.theme.colors.primary};
  }
  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary}40;
  }
`;

export const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 24px;
  align-items: stretch;
  @media (min-width: 480px) {
    gap: 16px;
  }
  @media (min-width: 768px) {
    gap: 18px;
    margin-bottom: 28px;
  }
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 20px;
  }
`;

export const MetricsGridSecondary = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 28px;
  align-items: stretch;
  @media (min-width: 768px) {
    gap: 18px;
  }
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 20px;
  }
`;

export const SummaryStripTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0 0 10px 0;
`;

export const SummaryStrip = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 24px;
  padding: 16px 20px;
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  margin-bottom: 24px;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  @media (min-width: 768px) {
    padding: 18px 22px;
    gap: 14px 26px;
    margin-bottom: 28px;
  }
  @media (max-width: 480px) {
    padding: 12px 14px;
    gap: 8px 16px;
    margin-bottom: 20px;
    font-size: 0.8125rem;
  }
`;

export const StatusBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 20px;
  padding: 12px 16px;
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 10px;
  margin-bottom: 20px;
  font-size: 0.8125rem;
  color: ${props => props.theme.colors.textSecondary};
  .up { color: ${props => props.theme.colors.success || '#10B981'}; }
  .down { color: ${props => props.theme.colors.error || '#E05A5A'}; }
`;

export const ComparisonStrip = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 22px;
  padding: 14px 18px;
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  margin-bottom: 24px;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  strong {
    color: ${props => props.theme.colors.text};
    font-weight: 600;
  }
  .up {
    color: ${props => props.theme.colors.success || '#10B981'};
  }
  .down {
    color: ${props => props.theme.colors.error || '#E05A5A'};
  }
  @media (min-width: 768px) {
    padding: 16px 20px;
    gap: 14px 24px;
    margin-bottom: 28px;
  }
  @media (max-width: 480px) {
    padding: 12px 14px;
    gap: 8px 14px;
    margin-bottom: 16px;
    font-size: 0.8125rem;
  }
`;

export const SummaryItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  strong {
    color: ${props => props.theme.colors.text};
    font-weight: 600;
  }
`;

export const SectionSubtitle = styled.p`
  font-size: 0.8125rem;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0 0 12px 0;
`;

export const MetricCard = styled.div`
  padding: 18px 16px;
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  min-height: 76px;
  box-sizing: border-box;
  @media (min-width: 768px) {
    padding: 20px 18px;
    gap: 16px;
    min-height: 84px;
  }
  @media (min-width: 1024px) {
    padding: 22px 20px;
    min-height: 88px;
  }
`;

export const MetricIcon = styled.div<{ $color: string }>`
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: ${p => p.$color}18;
  color: ${p => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  @media (min-width: 768px) {
    width: 46px;
    height: 46px;
  }
  @media (min-width: 1024px) {
    width: 48px;
    height: 48px;
  }
`;

export const MetricContent = styled.div`
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
`;

export const MetricLabel = styled.div`
  font-size: 0.8125rem;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const MetricLabelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`;

export const MetricValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  line-height: 1.25;
  letter-spacing: -0.02em;
  word-break: break-all;
  @media (min-width: 768px) {
    font-size: 1.375rem;
  }
  @media (min-width: 1024px) {
    font-size: 1.4375rem;
  }
`;

export const SectionCard = styled.section`
  margin-bottom: 28px;
  padding: 0;
  @media (min-width: 768px) {
    margin-bottom: 32px;
  }
  @media (min-width: 1024px) {
    margin-bottom: 36px;
  }
`;

export const SectionTitle = styled.h2`
  font-size: 1rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin: 0 0 16px 0;
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  gap: 8px;
  @media (min-width: 768px) {
    font-size: 1.0625rem;
    margin-bottom: 18px;
  }
  @media (min-width: 1024px) {
    font-size: 1.125rem;
    margin-bottom: 20px;
  }
`;

export const SectionTitleIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: ${props => props.theme.colors.primary}18;
  color: ${props => props.theme.colors.primary};
  @media (min-width: 600px) {
    width: 32px;
    height: 32px;
  }
`;

export const InfoBox = styled.p`
  font-size: 0.8125rem;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0 0 20px 0;
  line-height: 1.45;
  @media (max-width: 480px) {
    font-size: 0.75rem;
    margin-bottom: 16px;
  }
`;

export const TableScrollHint = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  @media (min-width: 768px) {
    font-size: 0.8125rem;
    margin-bottom: 10px;
  }
  @media (max-width: 480px) {
    font-size: 0.6875rem;
    margin-bottom: 6px;
  }
  @media (min-width: 1024px) {
    display: none;
  }
`;

export const TableWrap = styled.div<{ $isGrabbing?: boolean }>`
  overflow-x: auto;
  overflow-y: visible;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  background: ${props => props.theme.colors.cardBackground};
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x pan-y;
  cursor: ${p => (p.$isGrabbing ? 'grabbing' : 'grab')};
  user-select: ${p => (p.$isGrabbing ? 'none' : 'auto')};
  ${p => (p.$isGrabbing ? '&, & * { user-select: none !important; }' : '')}
  scrollbar-width: thin;
  scrollbar-color: ${props => props.theme.colors.border}
    ${props => props.theme.colors.cardBackground};
  &::-webkit-scrollbar {
    height: 8px;
  }
  @media (min-width: 768px) {
    &::-webkit-scrollbar {
      height: 10px;
    }
  }
  @media (min-width: 768px) and (max-width: 1024px) {
    min-height: 280px;
  }
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.cardBackground};
    border-radius: 0 0 12px 12px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border};
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.colors.textSecondary};
  }
`;

export const Table = styled.table`
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
  font-size: 0.8125rem;
  @media (min-width: 768px) {
    font-size: 0.875rem;
    min-width: 860px;
  }
  @media (min-width: 1024px) {
    min-width: 900px;
  }
`;

export const Th = styled.th`
  text-align: left;
  padding: 14px 16px;
  font-weight: 600;
  font-size: 0.8125rem;
  color: ${props => props.theme.colors.text};
  border-bottom: 2px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.cardBackground};
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 1;
  vertical-align: middle;
  @media (min-width: 768px) {
    font-size: 0.875rem;
    padding: 14px 18px;
  }
`;

export const ThSticky = styled(Th)`
  left: 0;
  z-index: 2;
  min-width: 160px;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
  @media (min-width: 768px) {
    min-width: 140px;
  }
  @media (min-width: 1024px) {
    min-width: 160px;
  }
  @media (max-width: 480px) {
    min-width: 120px;
  }
`;

export const Td = styled.td`
  padding: 12px 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.text};
  vertical-align: middle;
  font-size: 0.8125rem;
  @media (min-width: 768px) {
    padding: 12px 16px;
    font-size: 0.875rem;
  }
  @media (min-width: 1024px) {
    padding: 14px 18px;
  }
`;

export const TdSticky = styled(Td)`
  position: sticky;
  left: 0;
  background: ${props => props.theme.colors.cardBackground};
  z-index: 1;
  min-width: 160px;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
  font-weight: 500;
  @media (min-width: 768px) {
    min-width: 140px;
    padding: 12px 14px;
  }
  @media (min-width: 1024px) {
    min-width: 160px;
    padding: 14px 18px;
  }
  @media (max-width: 480px) {
    min-width: 120px;
    padding: 10px 12px;
    font-size: 0.75rem;
  }
`;

export const SelectCell = styled(Select)`
  min-width: 160px;
  width: 100%;
  padding: 8px 12px;
  @media (min-width: 768px) {
    min-width: 140px;
    padding: 10px 12px;
  }
  @media (min-width: 1024px) {
    min-width: 160px;
  }
`;

export const SaveBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  &:hover:not(:disabled) {
    opacity: 0.9;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const StatusBadge = styled.span<{ $status?: string }>`
  display: inline-block;
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  background: ${p =>
    p.$status === 'ACTIVE'
      ? '#10B98118'
      : p.$status === 'PAUSED'
        ? '#F59E0B18'
        : p.theme.colors.backgroundTertiary || '#F5F5F5'};
  color: ${p =>
    p.$status === 'ACTIVE'
      ? '#0d9668'
      : p.$status === 'PAUSED'
        ? '#b45309'
        : p.theme.colors.textSecondary || '#6B7280'};
`;

export const ExpandBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background: ${props => props.theme.colors.cardBackground};
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  &:hover {
    background: ${props => props.theme.colors.primary};
    color: white;
    border-color: ${props => props.theme.colors.primary};
  }
`;

export const DetailCell = styled.td`
  padding: 18px 18px !important;
  background: ${props => props.theme.colors.cardBackground};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  vertical-align: top;
  @media (min-width: 768px) {
    padding: 20px 22px !important;
  }
`;

export const DetailWrap = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text};
`;

export const AdSetsSectionTitle = styled.div`
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 12px;
  color: ${props => props.theme.colors.text};
`;

export const AdSetBlock = styled.div`
  margin-bottom: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 10px;
  overflow: hidden;
`;

export const AdSetHeader = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: ${props => props.theme.colors.cardBackground};
  border: none;
  cursor: pointer;
  text-align: left;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text};
  @media (min-width: 768px) {
    padding: 14px 18px;
    gap: 12px;
  }
  &:hover {
    background: ${props =>
      props.theme.colors.hover || props.theme.colors.backgroundTertiary};
  }
`;

export const AdList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 10px 14px 10px 32px;
  background: ${props => props.theme.colors.cardBackground};
  border-top: 1px solid ${props => props.theme.colors.border};
`;

export const AdItem = styled.li`
  padding: 8px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
`;

export const NumCell = styled.span`
  font-variant-numeric: tabular-nums;
`;

export const EmptyState = styled.p`
  padding: 32px 16px;
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
`;

export const FiltersSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
  padding: 18px 20px;
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  @media (min-width: 768px) {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px 20px;
    padding: 20px 24px;
    margin-bottom: 28px;
  }
  @media (min-width: 1024px) {
    gap: 18px 24px;
  }
  @media (max-width: 480px) {
    padding: 14px 12px;
    margin-bottom: 20px;
    gap: 14px;
  }
`;

export const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px 24px;
  width: 100%;
  @media (min-width: 768px) {
    gap: 16px 26px;
  }
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
`;

export const FilterLabel = styled.span`
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  flex-shrink: 0;
  min-width: 100px;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  @media (max-width: 600px) {
    min-width: 0;
    margin-bottom: 2px;
  }
`;

export const FilterGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    min-width: 0;
  }
`;

export const AccountChipsWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  &::-webkit-scrollbar {
    height: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border};
    border-radius: 3px;
  }
`;

export const AccountChip = styled.button<{ $selected?: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8125rem;
  font-weight: 500;
  border: 1px solid
    ${p => (p.$selected ? p.theme.colors.primary : p.theme.colors.border)};
  background: ${p =>
    p.$selected ? 'rgba(24, 119, 242, 0.12)' : p.theme.colors.background};
  color: ${p => (p.$selected ? p.theme.colors.primary : p.theme.colors.text)};
  cursor: pointer;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 0;
  &:hover {
    border-color: ${p => p.theme.colors.primary};
    background: ${p =>
      p.$selected
        ? 'rgba(24, 119, 242, 0.18)'
        : p.theme.colors.backgroundSecondary};
  }
  @media (min-width: 480px) {
    max-width: 220px;
  }
  @media (min-width: 768px) {
    padding: 8px 14px;
    font-size: 0.875rem;
    max-width: 240px;
  }
`;

export const SearchInput = styled.input`
  padding: 10px 14px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 0.875rem;
  background: ${props => props.theme.colors.cardBackground};
  color: ${props => props.theme.colors.text};
  height: 44px;
  width: 100%;
  min-width: 0;
  max-width: 280px;
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
  @media (min-width: 768px) {
    min-width: 220px;
    width: 220px;
    max-width: 260px;
  }
  @media (min-width: 1024px) {
    min-width: 240px;
    width: 240px;
    max-width: 280px;
  }
  @media (max-width: 600px) {
    max-width: none;
    height: 44px;
  }
  @media (min-width: 480px) and (max-width: 767px) {
    min-width: 200px;
    width: 200px;
  }
`;

export const FilteredCount = styled.span`
  font-size: 0.8125rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-left: 0;
  width: 100%;
  display: inline-flex;
  align-items: center;
  @media (min-width: 768px) {
    margin-left: auto;
    width: auto;
  }
`;

export const ChartsSection = styled.section`
  margin-bottom: 32px;
  @media (min-width: 768px) {
    margin-bottom: 36px;
  }
  @media (max-width: 480px) {
    margin-bottom: 24px;
  }
`;

export const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  align-items: start;
  @media (min-width: 768px) {
    gap: 22px;
  }
  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
  @media (max-width: 480px) {
    gap: 16px;
  }
`;

export const ChartCard = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  padding: 24px;
  min-height: 340px;
  box-sizing: border-box;
  @media (min-width: 768px) {
    padding: 20px 22px;
    min-height: 300px;
  }
  @media (min-width: 1024px) {
    padding: 24px;
    min-height: 340px;
  }
  @media (max-width: 480px) {
    padding: 16px;
    min-height: 280px;
  }
`;

export const ChartTitle = styled.h3`
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0 0 16px 0;
  letter-spacing: -0.01em;
  line-height: 1.3;
  @media (min-width: 768px) {
    font-size: 1rem;
    margin-bottom: 18px;
  }
  @media (min-width: 480px) and (max-width: 767px) {
    font-size: 1rem;
  }
`;

export const ChartTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
  & > ${ChartTitle} {
    margin-bottom: 0;
  }
`;

export const TabsWrap = styled.nav`
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  border-bottom: 2px solid ${props => props.theme.colors.border};
  @media (min-width: 768px) {
    margin-bottom: 24px;
    gap: 6px;
  }
  @media (max-width: 480px) {
    margin-bottom: 16px;
  }
`;

export const TabButton = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${props =>
    props.$active ? props.theme.colors.primary : props.theme.colors.textSecondary};
  background: none;
  border: none;
  border-bottom: 3px solid
    ${props => (props.$active ? props.theme.colors.primary : 'transparent')};
  margin-bottom: -2px;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
  &:hover {
    color: ${props => props.theme.colors.primary};
  }
  @media (min-width: 768px) {
    padding: 14px 22px;
    font-size: 1rem;
  }
  @media (max-width: 480px) {
    padding: 10px 14px;
    font-size: 0.875rem;
  }
`;

/** Campanhas agendadas: grid de cards com paginação */
export const ScheduledCardGrid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  @media (min-width: 768px) {
    gap: 20px;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
`;

export const ScheduledCard = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  overflow: visible;
  transition: box-shadow 0.2s, border-color 0.2s;
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    border-color: ${props => props.theme.colors.borderLight};
  }
`;

export const ScheduledCardImage = styled.div<{ $hasImage?: boolean }>`
  width: 100%;
  aspect-ratio: 1.91 / 1;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
  background: ${props => (props.$hasImage ? 'transparent' : `linear-gradient(135deg, ${props.theme.colors.primary}18 0%, ${props.theme.colors.primary}08 100%)`)};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.primary};
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const ScheduledCardBody = styled.div`
  padding: 14px 16px;
`;

export const ScheduledCardTitle = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 6px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const ScheduledCardMeta = styled.div`
  font-size: 0.8125rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 8px;
  line-height: 1.4;
`;

export const ScheduledCardActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

/** Thumbnail (reutilizado quando necessário) */
export const ScheduledThumb = styled.div<{ $hasImage?: boolean }>`
  width: 56px;
  height: 56px;
  min-width: 56px;
  min-height: 56px;
  border-radius: 8px;
  overflow: hidden;
  background: ${props => (props.$hasImage ? 'transparent' : `linear-gradient(135deg, ${props.theme.colors.primary}18 0%, ${props.theme.colors.primary}08 100%)`)};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.primary};
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

/** Wrap do menu 3 pontos */
export const ScheduledMenuWrap = styled.div`
  position: relative;
`;

export const ScheduledMenuButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  scroll-margin: 8px;
  &:hover {
    background: ${props => props.theme.colors.backgroundTertiary};
    color: ${props => props.theme.colors.text};
  }
  &:focus {
    outline: none;
  }
`;

export const ScheduledMenuDropdown = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 4px;
  min-width: 160px;
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  overflow: hidden;
`;

export const ScheduledPaginationWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

export const ScheduledPaginationBtn = styled.button`
  padding: 8px 14px;
  font-size: 0.875rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  background: ${props => props.theme.colors.cardBackground};
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.backgroundTertiary};
    border-color: ${props => props.theme.colors.primary};
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ScheduledPaginationInfo = styled.span`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
`;

export const ScheduledMenuItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text};
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s;
  &:hover {
    background: ${props => props.theme.colors.backgroundTertiary};
  }
  &:not(:last-child) {
    border-bottom: 1px solid ${props => props.theme.colors.border};
  }
`;

// Helpers usados pela página
export function formatNumber(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}k`;
  return n.toLocaleString('pt-BR');
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function escapeCsvCell(s: string): string {
  const str = String(s ?? '');
  if (str.includes('"') || str.includes(',') || str.includes('\n'))
    return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Ativa',
  PAUSED: 'Pausada',
  ARCHIVED: 'Arquivada',
  DELETED: 'Excluída',
  PENDING_REVIEW: 'Em análise',
  DISAPPROVED: 'Reprovada',
  PREPAUSED: 'Pré-pausada',
  PENDING_BILLING_INFO: 'Pendente faturamento',
  CAMPAIGN_PAUSED: 'Campanha pausada',
  ADSET_PAUSED: 'Conjunto pausado',
};

export function getStatusLabel(status: string | undefined): string {
  if (!status) return '—';
  const key = status.toUpperCase();
  return STATUS_LABELS[key] ?? status;
}
