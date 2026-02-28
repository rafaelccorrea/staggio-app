import styled from 'styled-components';

/** Container sem overflow para o dropdown do menu ficar visível fora da lista */
export const RentalsListContainer = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  overflow: visible;
  box-shadow: ${props => props.theme.colors.shadow || '0 2px 8px rgba(0, 0, 0, 0.1)'};

  @media (max-width: 768px) {
    border-radius: 10px;
  }

  @media (max-width: 480px) {
    border-radius: 8px;
  }
`;

/** Cabeçalhos com alinhamento */
const gridCols = '80px minmax(160px, 2fr) 1.5fr 1fr 1fr 0.9fr 100px';
const gridColsTablet = '64px minmax(140px, 2fr) 1fr 1fr 90px';
const gridColsMobile = '56px 1fr 72px';

export const ListHeader = styled.div`
  display: grid;
  grid-template-columns: ${gridCols};
  gap: 16px;
  padding: 14px 20px;
  background: ${props => props.theme.colors.backgroundSecondary};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  font-weight: 600;
  font-size: 13px;
  color: ${props => props.theme.colors.text};
  align-items: center;

  @media (max-width: 1024px) {
    grid-template-columns: ${gridColsTablet};
    gap: 12px;
  }

  @media (max-width: 768px) {
    grid-template-columns: ${gridColsMobile};
    gap: 10px;
    padding: 12px 14px;
    font-size: 12px;
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 11px;
  }
`;

export const HeaderCellLeft = styled.div`
  text-align: left;
`;
export const HeaderCellRight = styled.div`
  text-align: right;
`;
export const HeaderCellCenter = styled.div`
  text-align: center;
`;

/** Texto secundário (ex.: dia de vencimento) */
export const DueDayText = styled.span`
  font-size: 13px;
  color: ${props => props.theme.colors.textSecondary};
`;

export const RentalRow = styled.div`
  display: grid;
  grid-template-columns: ${gridCols};
  gap: 16px;
  padding: 14px 20px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  transition: background-color 0.2s ease;
  align-items: center;

  &:hover {
    background: ${props => props.theme.colors.backgroundSecondary};
  }

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 1024px) {
    grid-template-columns: ${gridColsTablet};
    gap: 12px;
  }

  @media (max-width: 768px) {
    grid-template-columns: ${gridColsMobile};
    gap: 10px;
    padding: 12px 14px;
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
  }
`;

/** Células com alinhamento (para alinhar com o header) */
export const CellLeft = styled.div`
  text-align: left;
`;
export const CellRight = styled.div`
  text-align: right;
`;
export const CellCenter = styled.div`
  text-align: center;
`;

/** Thumbnail do imóvel - primeira coluna (clicável para ver detalhes) */
export const RentalThumbWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: ${props => props.theme.colors.backgroundSecondary};
  border: 1px solid ${props => props.theme.colors.border};
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    width: 52px;
    height: 52px;
  }

  @media (max-width: 480px) {
    width: 44px;
    height: 44px;
    border-radius: 6px;
  }
`;

export const RentalThumb = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const RentalThumbPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1.25rem;
`;

export const RentalInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

export const RentalProperty = styled.div`
  font-weight: 600;
  font-size: 15px;
  color: ${props => props.theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;

  &:hover {
    color: ${props => props.theme.colors.primary};
  }

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

export const RentalTenant = styled.div`
  font-size: 13px;
  color: ${props => props.theme.colors.textSecondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

export const RentalDates = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 13px;
  color: ${props => props.theme.colors.textSecondary};

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

export const DateLabel = styled.span`
  font-size: 11px;
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const DateValue = styled.span`
  font-weight: 500;
  color: ${props => props.theme.colors.text};
`;

export const RentalPrice = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

export const RentalStatus = styled.div<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;

  ${props => {
    const statusColors: Record<string, { bg: string; color: string }> = {
      active: {
        bg: props.theme.mode === 'dark' ? '#10B98120' : '#D1FAE5',
        color: props.theme.mode === 'dark' ? '#10B981' : '#065F46',
      },
      pending: {
        bg: props.theme.mode === 'dark' ? '#F59E0B20' : '#FEF3C7',
        color: props.theme.mode === 'dark' ? '#F59E0B' : '#92400E',
      },
      pending_approval: {
        bg: props.theme.mode === 'dark' ? '#F59E0B20' : '#FEF3C7',
        color: props.theme.mode === 'dark' ? '#F59E0B' : '#92400E',
      },
      expired: {
        bg: props.theme.mode === 'dark' ? '#EF444420' : '#FEE2E2',
        color: props.theme.mode === 'dark' ? '#EF4444' : '#991B1B',
      },
      cancelled: {
        bg: props.theme.mode === 'dark' ? '#6B728020' : '#F3F4F6',
        color: props.theme.mode === 'dark' ? '#6B7280' : '#374151',
      },
    };

    const colors = statusColors[props.$status] || statusColors.pending;

    return `
      background: ${colors.bg};
      color: ${colors.color};
    `;
  }}

  @media (max-width: 768px) {
    font-size: 11px;
    padding: 4px 8px;
  }
`;

export const RowActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 4px;
  }

  @media (max-width: 480px) {
    gap: 3px;
  }
`;

export const ActionButton = styled.button<{
  $variant?: 'primary' | 'secondary' | 'danger';
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 16px;

  @media (max-width: 480px) {
    width: 28px;
    height: 28px;
    font-size: 14px;
    border-radius: 5px;
  }

  ${props => {
    if (props.$variant === 'danger') {
      return `
        background: ${props.theme.mode === 'dark' ? '#7f1d1d' : '#fee2e2'};
        color: ${props.theme.mode === 'dark' ? '#fca5a5' : '#991b1b'};
        
        &:hover {
          background: ${props.theme.mode === 'dark' ? '#991b1b' : '#fecaca'};
          transform: translateY(-1px);
        }
      `;
    } else if (props.$variant === 'primary') {
      return `
        background: ${props.theme.colors.primary};
        color: white;
        
        &:hover {
          background: ${props.theme.colors.primaryDark};
          transform: translateY(-1px);
        }
      `;
    } else {
      return `
        background: ${props.theme.colors.backgroundSecondary};
        color: ${props.theme.colors.textSecondary};
        
        &:hover {
          background: ${props.theme.colors.background};
          color: ${props.theme.colors.text};
          transform: translateY(-1px);
        }
      `;
    }
  }}

  &:active {
    transform: scale(0.95);
  }
`;

export const MobileHidden = styled.div`
  @media (max-width: 1024px) {
    display: none;
  }
`;

export const TabletHidden = styled.div`
  @media (max-width: 768px) {
    display: none;
  }
`;

export const MobileOnly = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`;

export const MobileRentalDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
  padding: 12px;
  background: ${props => props.theme.colors.backgroundSecondary};
  border-radius: 8px;
`;

export const MobileDetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
`;

export const MobileDetailLabel = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  font-weight: 500;
`;

export const MobileDetailValue = styled.span`
  color: ${props => props.theme.colors.text};
  font-weight: 600;
`;

/** Menu de ações (3 pontos) - lista moderna */
export const ActionsMenuWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

export const ActionsMenuButton = styled.button`
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

  &:hover {
    background: ${props => props.theme.colors.backgroundSecondary || props.theme.colors.hover};
    color: ${props => props.theme.colors.text};
  }
  &:focus {
    outline: none;
  }
`;

/** Dropdown fora da lista: z-index alto para ficar acima de tudo */
export const ActionsMenuDropdown = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 4px;
  min-width: 180px;
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 1100;
  overflow: hidden;
`;

export const ActionsMenuItem = styled.button`
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
    background: ${props => props.theme.colors.backgroundSecondary || props.theme.colors.hover};
  }
  &:not(:last-child) {
    border-bottom: 1px solid ${props => props.theme.colors.border};
  }

  &[data-danger='true'] {
    color: ${props => props.theme.colors.error || props.theme.colors.danger};
  }
  &[data-danger='true']:hover {
    background: ${props => props.theme.mode === 'dark' ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.08)'};
  }
`;
