import React, { useState } from 'react';
import styled from 'styled-components';
import {
  MdAttachMoney,
  MdCheckCircle,
  MdError,
  MdSchedule,
  MdQrCode2,
  MdDescription,
  MdCancel,
  MdEdit,
  MdMoreVert,
} from 'react-icons/md';
import { FaBarcode, FaPix } from 'react-icons/fa6';
import type { RentalPayment } from '@/types/rental.types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RentalPaymentCardProps {
  payment: RentalPayment;
  onCancelCharge?: (paymentId: string) => void;
  onEditCharge?: (payment: RentalPayment) => void;
  onViewDetails?: (payment: RentalPayment) => void;
}

const canEditOrCancel = (s: string) =>
  (s || '').toUpperCase() === 'PENDING' || (s || '').toUpperCase() === 'OVERDUE';

export const RentalPaymentCard: React.FC<RentalPaymentCardProps> = ({
  payment,
  onCancelCharge,
  onEditCharge,
  onViewDetails,
}) => {
  const [showPixQrCode, setShowPixQrCode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const normalizeStatus = (status: string | undefined) =>
    (status || '').toUpperCase();

  const getStatusIcon = (status: string) => {
    const s = normalizeStatus(status);
    switch (s) {
      case 'PAID':
      case 'RECEIVED':
      case 'CONFIRMED':
        return <MdCheckCircle />;
      case 'OVERDUE':
        return <MdError />;
      case 'CANCELLED':
        return <MdCancel />;
      default:
        return <MdSchedule />;
    }
  };

  const getStatusLabel = (status: string) => {
    const s = normalizeStatus(status);
    const labels: Record<string, string> = {
      PAID: 'Pago',
      PENDING: 'Pendente',
      OVERDUE: 'Vencido',
      CANCELLED: 'Cancelado',
      RECEIVED: 'Recebido',
      CONFIRMED: 'Confirmado',
    };
    return labels[s] || s || '—';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Código PIX copiado!');
  };

  const status = payment.asaasStatus || payment.status;

  return (
    <Card>
      <Header>
        <StatusBadge $status={status}>
          {getStatusIcon(status)}
          <span>{getStatusLabel(status)}</span>
        </StatusBadge>
        <Amount>{formatCurrency(payment.value)}</Amount>
      </Header>

      <Content>
        <InfoRow>
          <Label>Referência:</Label>
          <Value>{payment.referenceMonth || 'N/A'}</Value>
        </InfoRow>
        <InfoRow>
          <Label>Vencimento:</Label>
          <Value>
            {format(new Date(payment.dueDate), "dd 'de' MMMM 'de' yyyy", {
              locale: ptBR,
            })}
          </Value>
        </InfoRow>
        {payment.paymentDate && (
          <InfoRow>
            <Label>Data de Pagamento:</Label>
            <Value>
              {format(new Date(payment.paymentDate), "dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </Value>
          </InfoRow>
        )}
      </Content>

      {payment.asaasPaymentId && (
        <ChargeActions>
          <ActionsHeader>
            <ActionsTitle>Opções de Pagamento</ActionsTitle>
            <CardMenuWrap>
              <CardMenuButton
                type="button"
                onClick={() => setMenuOpen(prev => !prev)}
                title="Ações"
                aria-expanded={menuOpen}
              >
                <MdMoreVert size={20} />
              </CardMenuButton>
              {menuOpen && (
                <CardMenuDropdown onClick={e => e.stopPropagation()}>
                  {payment.asaasBankSlipUrl && (
                    <CardMenuItem
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        window.open(payment.asaasBankSlipUrl!, '_blank');
                      }}
                    >
                      <FaBarcode size={18} /> Ver Boleto
                    </CardMenuItem>
                  )}
                  {payment.asaasPixCopyPaste && (
                    <CardMenuItem
                      type="button"
                      $variant="primary"
                      onClick={() => {
                        setMenuOpen(false);
                        setShowPixQrCode(!showPixQrCode);
                      }}
                    >
                      <FaPix size={18} /> PIX
                    </CardMenuItem>
                  )}
                  {payment.asaasInvoiceUrl && (
                    <CardMenuItem
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        window.open(payment.asaasInvoiceUrl!, '_blank');
                      }}
                    >
                      <MdDescription size={18} /> Ver Fatura
                    </CardMenuItem>
                  )}
                  {canEditOrCancel(payment.asaasStatus || payment.status) && (
                    <>
                      {onEditCharge && (
                        <CardMenuItem
                          type="button"
                          $variant="primary"
                          onClick={() => {
                            setMenuOpen(false);
                            onEditCharge(payment);
                          }}
                        >
                          <MdEdit size={18} /> Editar cobrança
                        </CardMenuItem>
                      )}
                      {onCancelCharge && (
                        <CardMenuItem
                          type="button"
                          $variant="danger"
                          onClick={() => {
                            setMenuOpen(false);
                            onCancelCharge(payment.id);
                          }}
                        >
                          <MdCancel size={18} /> Excluir cobrança
                        </CardMenuItem>
                      )}
                    </>
                  )}
                </CardMenuDropdown>
              )}
            </CardMenuWrap>
          </ActionsHeader>

          {showPixQrCode && payment.asaasPixCopyPaste && (
            <PixContainer>
              {payment.asaasPixQrCode && (
                <QrCodeImage
                  src={`data:image/png;base64,${payment.asaasPixQrCode}`}
                  alt="QR Code PIX"
                />
              )}
              <PixCodeContainer>
                <PixCode>{payment.asaasPixCopyPaste}</PixCode>
                <CopyButton
                  onClick={() => copyToClipboard(payment.asaasPixCopyPaste!)}
                >
                  Copiar Código
                </CopyButton>
              </PixCodeContainer>
            </PixContainer>
          )}
        </ChargeActions>
      )}
    </Card>
  );
};

const Card = styled.div`
  background: ${p => p.theme.colors.cardBackground};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 8px;
  box-shadow: ${p => p.theme.colors.shadow || '0 2px 4px rgba(0,0,0,0.08)'};
  padding: 20px;
  margin-bottom: 16px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${p => p.theme.colors.border};
`;

const statusColorMap = (theme: { colors: Record<string, string> }, status: string) => {
  const s = (status || '').toUpperCase();
  if (['PAID', 'RECEIVED', 'CONFIRMED'].includes(s)) return theme.colors.success;
  if (s === 'PENDING') return theme.colors.warning;
  if (s === 'OVERDUE') return theme.colors.error;
  return theme.colors.textSecondary;
};

const StatusBadge = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 16px;
  background-color: ${p => `${statusColorMap(p.theme, p.$status)}20`};
  color: ${p => statusColorMap(p.theme, p.$status)};
  font-weight: 500;
  font-size: 14px;

  svg {
    font-size: 18px;
  }
`;

const Amount = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${p => p.theme.colors.primary};
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Label = styled.span`
  font-size: 14px;
  color: ${p => p.theme.colors.textSecondary};
`;

const Value = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${p => p.theme.colors.text};
`;

const ChargeActions = styled.div`
  border-top: 1px solid ${p => p.theme.colors.border};
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ActionsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
`;

const ActionsTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: ${p => p.theme.colors.text};
  margin: 0;
`;

const CardMenuWrap = styled.div`
  position: relative;
  display: inline-flex;
`;

const CardMenuButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: ${p => p.theme.colors.textSecondary};
  cursor: pointer;
  transition: background 0.2s, color 0.2s;

  &:hover {
    background: ${p => p.theme.colors.backgroundSecondary || p.theme.colors.hover};
    color: ${p => p.theme.colors.text};
  }
  &:focus {
    outline: none;
  }
`;

const CardMenuDropdown = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 4px;
  min-width: 200px;
  background: ${p => p.theme.colors.cardBackground};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 1100;
  overflow: hidden;
`;

const CardMenuItem = styled.button<{ $variant?: 'primary' | 'danger' }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  font-size: 0.875rem;
  color: ${p => {
    if (p.$variant === 'danger') return p.theme.colors.error || '#dc2626';
    if (p.$variant === 'primary') return p.theme.colors.primary || '#2563eb';
    return p.theme.colors.text;
  }};
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s;

  &:hover {
    background: ${p => p.theme.colors.backgroundSecondary || p.theme.colors.hover};
  }
  &:not(:last-child) {
    border-bottom: 1px solid ${p => p.theme.colors.border};
  }
`;

const PixContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: ${p => p.theme.colors.backgroundSecondary};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 8px;
  margin-top: 8px;
`;

const QrCodeImage = styled.img`
  width: 200px;
  height: 200px;
  border: 2px solid ${p => p.theme.colors.primary};
  border-radius: 8px;
`;

const PixCodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const PixCode = styled.div`
  padding: 12px;
  background-color: ${p => p.theme.colors.cardBackground};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  word-break: break-all;
  color: ${p => p.theme.colors.text};
`;

const CopyButton = styled.button`
  padding: 8px 16px;
  background-color: ${p => p.theme.colors.success};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;
