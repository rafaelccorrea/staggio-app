import styled from 'styled-components';

/** Wrapper: fundo adaptado ao tema (light/dark). */
export const PageLightBg = styled.div`
  min-height: 100%;
  background: ${(props: { theme?: { mode?: string; colors?: { background?: string } } }) =>
    props.theme?.mode === 'dark' ? props.theme?.colors?.background ?? '#121212' : props.theme?.colors?.backgroundSecondary ?? '#f8fafc'};
`;

// Container padrão para todas as páginas (fundo adaptado ao tema).
// Margem horizontal vem do MainScrollArea; aqui só padding vertical para alinhar com as margens.
export const PageContainer = styled.div`
  padding: 24px 0 32px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  min-height: calc(100vh - 70px);
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};

  @media (max-width: 768px) {
    padding: 20px 0 28px;
  }

  @media (max-width: 480px) {
    padding: 16px 0 24px;
  }
`;

/** Container para páginas de visitas (mobile first: padding lateral em telas pequenas). */
export const VisitPageContainer = styled.div`
  padding: 16px 16px 24px;
  width: 100%;
  min-height: calc(100vh - 70px);
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};

  @media (min-width: 600px) {
    padding: 20px 20px 28px;
  }

  @media (min-width: 768px) {
    padding: 24px 24px 32px;
  }
`;

/** Mesmo padrão do Dashboard de Locações: padding lateral consistente e max-width 1400px */
export const RentalStylePageContainer = styled.div`
  padding: 20px 24px 32px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  min-height: 100%;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};

  @media (min-width: 768px) {
    padding: 24px 28px 32px;
  }

  @media (min-width: 1024px) {
    padding: 24px 32px 32px;
  }
`;

// Header padrão para páginas
export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

// Título padrão para páginas (mobile first)
export const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  @media (min-width: 600px) { font-size: 2rem; }
  @media (min-width: 768px) { font-size: 2.5rem; }
`;

// Container para título + subtítulo da página
export const PageTitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

// Subtítulo padrão para páginas
export const PageSubtitle = styled.p`
  font-size: 1.125rem;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
  font-weight: 400;
`;

// Botão Voltar padrão para headers de página (mobile first: touch 44px)
export const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  min-height: 44px;
  background: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.hover};
    transform: translateX(-2px);
  }

  svg {
    font-size: 18px;
  }

  @media (min-width: 768px) {
    padding: 14px 24px;
    min-height: auto;
  }
`;

// Card padrão para conteúdo (adaptado ao tema)
export const ContentCard = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  padding: 24px;
  box-shadow: ${props => props.theme.colors.shadow};
  border: 1px solid ${props => props.theme.colors.border};
  margin-bottom: 24px;
`;

// Container para formulários (adaptado ao tema)
export const FormContainer = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 16px;
  padding: 24px;
  box-shadow: ${props => props.theme.colors.shadow};
  border: 1px solid ${props => props.theme.colors.border};
`;

// Container para campos de formulário
export const FieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
`;

// Label padrão para campos
export const FieldLabel = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

// Tipos de input que aceitam maxLength (campo aberto de texto)
const TEXT_LIKE_TYPES = ['text', 'search', 'email', 'url', 'tel', 'password'];

// Input padrão – limite de caracteres para campos de texto (default 500)
export const FieldInput = styled.input.attrs<{ type?: string; maxLength?: number }>(props => {
  const type = (props.type || 'text').toLowerCase();
  const textLike = TEXT_LIKE_TYPES.includes(type);
  return textLike ? { maxLength: props.maxLength ?? 500 } : {};
})`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Poppins', sans-serif;
  transition: all 0.2s ease;
  background: ${props => props.theme.colors.cardBackground};
  color: ${props => props.theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => `${props.theme.colors.primary}20`};
  }

  &:hover {
    border-color: ${props => props.theme.colors.borderLight};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: ${props => props.theme.colors.backgroundSecondary};
  }

  &::placeholder {
    color: ${props => props.theme.colors.textLight};
  }

  /* Estilos específicos para inputs de data – área clicável à direita para abrir o calendário */
  &[type='date'],
  &[type='time'],
  &[type='datetime-local'],
  &[type='month'],
  &[type='week'] {
    position: relative;
    cursor: pointer;
    padding-right: 2.75rem;

    &::-webkit-calendar-picker-indicator {
      cursor: pointer;
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 2.75rem;
      margin: 0;
      padding: 0;
      opacity: 1;

      &:hover {
        background-color: ${props => `${props.theme.colors.primary}15`};
      }
    }
  }
`;

// Textarea padrão (adaptado ao tema) – limite de caracteres default 5000
export const FieldTextarea = styled.textarea.attrs<{ maxLength?: number }>(props => ({
  maxLength: props.maxLength ?? 5000,
}))`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  min-height: 120px;
  resize: vertical;
  background: ${props => props.theme.colors.cardBackground};
  color: ${props => props.theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => `${props.theme.colors.primary}1A`};
  }

  &::placeholder {
    color: ${props => props.theme.colors.textLight};
  }
`;

// Select padrão (adaptado ao tema)
export const FieldSelect = styled.select`
  width: 100%;
  padding: 12px 48px 12px 16px;
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Poppins', sans-serif;
  transition: all 0.2s ease;
  background: ${props => props.theme.colors.cardBackground};
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 20px;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
  }

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => `${props.theme.colors.primary}1A`};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: ${props => props.theme.colors.backgroundSecondary};
  }

  option {
    padding: 12px;
    font-size: 1rem;
  }

  &::-ms-expand {
    display: none;
  }
`;

// Container para campos em linha
export const RowContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0;
  }
`;

// Botão padrão
export const Button = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cpath d='M1 1 L1 15 L7 9 L10 17 L13 15 L10 7 L17 7 L1 1 Z' fill='%23A63126'/%3E%3C/svg%3E")
      1 1,
    pointer !important;
  transition: all 0.2s ease;
  border: 2px solid;

  &.primary {
    background: ${props => props.theme.colors.primary};
    color: white;
    border-color: ${props => props.theme.colors.primary};

    &:hover {
      background: ${props => props.theme.colors.primaryHover};
      cursor:
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cpath d='M1 1 L1 15 L7 9 L10 17 L13 15 L10 7 L17 7 L1 1 Z' fill='%23A63126'/%3E%3C/svg%3E")
          1 1,
        pointer !important;
    }
  }

  &.secondary {
    background: ${props => props.theme.colors.cardBackground};
    color: ${props => props.theme.colors.textSecondary};
    border-color: ${props => props.theme.colors.border};

    &:hover {
      background: ${props => props.theme.colors.hover};
      cursor:
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cpath d='M1 1 L1 15 L7 9 L10 17 L13 15 L10 7 L17 7 L1 1 Z' fill='%23A63126'/%3E%3C/svg%3E")
          1 1,
        pointer !important;
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor:
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cpath d='M1 1 L1 15 L7 9 L10 17 L13 15 L10 7 L17 7 L1 1 Z' fill='%23A63126' opacity='0.5'/%3E%3Cline x1='2' y1='2' x2='18' y2='18' stroke='%23A63126' stroke-width='2'/%3E%3C/svg%3E")
        1 1,
      not-allowed !important;
  }
`;

// Indicador de campo obrigatório (adaptado ao tema)
export const RequiredIndicator = styled.span`
  color: ${props => props.theme.colors.error};
  font-weight: bold;
`;

// Estado vazio padrão (adaptado ao tema)
export const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.border};
`;

export const EmptyTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 8px;
`;

export const EmptyMessage = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 24px;
`;
