import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export const PageContainer = styled.div`
  width: 100%;
  padding: 16px 20px 32px;
  min-height: 100vh;
  min-height: 100dvh;
  box-sizing: border-box;
  padding-left: max(20px, env(safe-area-inset-left, 0px));
  padding-right: max(20px, env(safe-area-inset-right, 0px));
  padding-bottom: max(32px, env(safe-area-inset-bottom, 0px));

  @media (min-width: 600px) {
    padding: 20px 24px 40px;
    padding-left: max(24px, env(safe-area-inset-left, 0px));
    padding-right: max(24px, env(safe-area-inset-right, 0px));
  }

  @media (min-width: 768px) {
    padding: 24px 28px 48px;
    padding-left: max(28px, env(safe-area-inset-left, 0px));
    padding-right: max(28px, env(safe-area-inset-right, 0px));
  }
`;

export const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  min-height: 44px;
  background: ${props => props.theme.colors.cardBackground ?? props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.15s;
  margin-bottom: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.backgroundSecondary ?? props.theme.colors.cardBackground};
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:focus-visible {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}28;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const PageHeader = styled.header`
  margin-bottom: 28px;
`;

export const PageTitle = styled.h1`
  font-size: 1.625rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin: 0 0 6px 0;
  letter-spacing: -0.025em;
  line-height: 1.25;

  @media (min-width: 600px) {
    font-size: 1.75rem;
  }
`;

export const PageSubtitle = styled.p`
  font-size: 0.9375rem;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
  line-height: 1.5;
`;

export const IntroCard = styled.div`
  background: ${props => props.theme.colors.primary}12;
  border: 1px solid ${props => props.theme.colors.primary}30;
  border-radius: 12px;
  padding: 16px 18px;
  margin-bottom: 24px;
  font-size: 0.875rem;
  line-height: 1.55;
  color: ${props => props.theme.colors.text};

  strong {
    color: ${props => props.theme.colors.text};
  }
`;

export const NextStepsCard = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  padding: 20px;
  margin-top: 8px;
  margin-bottom: 24px;
`;

export const NextStepsTitle = styled.h3`
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const NextStepsList = styled.ul`
  margin: 0;
  padding-left: 20px;
  font-size: 0.8125rem;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.7;
`;

export const Section = styled.section`
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.2s;

  &:focus-within {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  @media (min-width: 600px) {
    padding: 24px;
    margin-bottom: 24px;
  }
`;

export const SectionIconWrap = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${props => props.theme.colors.primary}18;
  color: ${props => props.theme.colors.primary};
`;

export const SectionTitle = styled.h2`
  font-size: 1.0625rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const SectionDescription = styled.p`
  font-size: 0.8125rem;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0 0 18px 0;
  line-height: 1.5;
  padding-left: 48px;

  @media (max-width: 480px) {
    padding-left: 0;
  }
`;

export const FormGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const FieldLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

export const FieldHint = styled.span`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-top: 2px;
  line-height: 1.4;
`;

export const Input = styled.input`
  padding: 12px 14px;
  min-height: 44px;
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 10px;
  color: ${props => props.theme.colors.text};
  font-size: 0.9375rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}22;
  }

  &:focus-visible {
    outline: none;
  }

  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
    opacity: 0.7;
  }

  &[type='date'],
  &[type='time'] {
    min-width: 160px;
    width: auto;
  }

  &[type='datetime-local'] {
    min-width: 240px;
    width: auto;
  }
`;

export const Select = styled.select`
  padding: 12px 14px;
  min-height: 44px;
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 10px;
  color: ${props => props.theme.colors.text};
  font-size: 0.9375rem;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}22;
  }
`;

export const ScheduleRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
`;

export const CheckboxWrap = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 0.9375rem;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  user-select: none;

  input[type='checkbox'] {
    width: 20px;
    height: 20px;
    accent-color: ${props => props.theme.colors.primary};
    cursor: pointer;
  }

  &:has(input:disabled) {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

export const AdSetFieldsWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed ${props => props.theme.colors.border};
`;

export const FormActions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

export const ButtonSecondary = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  min-height: 48px;
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 10px;
  color: ${props => props.theme.colors.text};
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, transform 0.15s;

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.cardBackground};
    border-color: ${props => props.theme.colors.borderLight};
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:focus-visible {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}28;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const ButtonPrimary = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 24px;
  min-height: 48px;
  background: ${props => props.theme.colors.primary};
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  box-shadow: 0 2px 8px ${props => props.theme.colors.primary}40;

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryDark ?? props.theme.colors.primary};
    transform: translateY(-1px);
    box-shadow: 0 4px 14px ${props => props.theme.colors.primary}50;
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 6px ${props => props.theme.colors.primary}40;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}40;
  }

  &:disabled {
    opacity: 0.8;
    cursor: not-allowed;
    transform: none;
  }
`;

export const Spinner = styled.span`
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
  flex-shrink: 0;
`;

/** Área de upload de arquivo: botão estilizado + drag-and-drop */
export const FileInputHidden = styled.input.attrs({ type: 'file' })`
  position: absolute;
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  z-index: -1;
`;

export const FileUploadZone = styled.label<{ $isDragOver?: boolean; $disabled?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 120px;
  padding: 20px 24px;
  background: ${props =>
    props.$isDragOver
      ? (p => `${p.theme.colors.primary}14`)
      : props => props.theme.colors.background};
  border: 2px dashed
    ${props =>
      props.$isDragOver
        ? props.theme.colors.primary
        : props.theme.colors.border};
  border-radius: 12px;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  transition: border-color 0.2s, background 0.2s, transform 0.15s;
  opacity: ${props => (props.$disabled ? 0.7 : 1)};

  &:hover:not([data-disabled]) {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => `${props.theme.colors.primary}0a`};
  }

  &:active:not([data-disabled]) {
    transform: scale(0.99);
  }

  &:focus-within {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}22;
  }
`;

export const FileUploadIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: ${props => props.theme.colors.primary}18;
  color: ${props => props.theme.colors.primary};
  font-size: 1.5rem;
`;

export const FileUploadText = styled.span`
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  text-align: center;
`;

export const FileUploadHint = styled.span`
  font-size: 0.8125rem;
  color: ${props => props.theme.colors.textSecondary};
  text-align: center;
`;

export const FileUploadFileName = styled.span`
  font-size: 0.8125rem;
  color: ${props => props.theme.colors.primary};
  font-weight: 500;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/** Prévia do anúncio (estilo feed) */
export const PreviewSection = styled.section`
  margin-bottom: 24px;
`;

export const PreviewCard = styled.div`
  max-width: 400px;
  margin: 0 auto;
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
`;

export const PreviewMediaWrap = styled.div`
  width: 100%;
  aspect-ratio: 1.91 / 1;
  background: ${props => props.theme.colors.backgroundTertiary};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

export const PreviewMediaImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

export const PreviewMediaVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

export const PreviewMediaPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  padding: 24px;
  text-align: center;
`;

export const PreviewContent = styled.div`
  padding: 12px 14px 14px;
`;

export const PreviewSponsored = styled.span`
  font-size: 0.6875rem;
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: block;
  margin-bottom: 4px;
`;

export const PreviewHeadline = styled.div`
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 4px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const PreviewBody = styled.div`
  font-size: 0.8125rem;
  color: ${props => props.theme.colors.text};
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 10px;
`;

export const PreviewCtaButton = styled.div`
  display: inline-block;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  border: 1px solid ${props => props.theme.colors.primary};
  background: transparent;
`;
