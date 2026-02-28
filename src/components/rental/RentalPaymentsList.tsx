import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MdAdd, MdRefresh } from 'react-icons/md';
import { RentalPaymentCard } from './RentalPaymentCard';
import rentalPaymentsService from '../../services/rentalPaymentsService';
import { rentalService } from '../../services/rental.service';
import type { RentalPayment } from '@/types/rental.types';
import { toast } from 'react-toastify';
import { formatCurrencyValue, getNumericValue, maskCurrencyReais } from '@/utils/masks';

const PAYMENT_TYPE_OPTIONS = [
  { value: 'BOLETO', label: 'Boleto' },
  { value: 'PIX', label: 'PIX' },
] as const;

interface GenerateChargeModalInlineProps {
  onClose: () => void;
  onSubmit: (params: { dueDate: string; billingType: 'BOLETO' | 'PIX' }) => Promise<void>;
  isSubmitting: boolean;
}

const GenerateChargeModalInline: React.FC<GenerateChargeModalInlineProps> = ({
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [billingType, setBillingType] = useState<'BOLETO' | 'PIX'>('BOLETO');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ dueDate, billingType });
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalBox onClick={e => e.stopPropagation()}>
        <ModalTitle>Gerar cobrança</ModalTitle>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          Defina a data de vencimento e o tipo (Boleto ou PIX).
        </p>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <label>Data de vencimento</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              required
              style={{
                padding: '0.5rem',
                borderRadius: 4,
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
          </FormGroup>
          <FormGroup>
            <label>Tipo de cobrança</label>
            <select
              value={billingType}
              onChange={e => setBillingType(e.target.value as 'BOLETO' | 'PIX')}
              style={{
                padding: '0.5rem',
                borderRadius: 4,
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              {PAYMENT_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </FormGroup>
          <ModalButtons>
            <ActionButton type="button" onClick={onClose}>
              Cancelar
            </ActionButton>
            <ActionButton type="submit" disabled={isSubmitting} primary>
              {isSubmitting ? 'Gerando...' : 'Gerar cobrança'}
            </ActionButton>
          </ModalButtons>
        </form>
      </ModalBox>
    </ModalOverlay>
  );
};

interface EditChargeModalInlineProps {
  payment: RentalPayment;
  onClose: () => void;
  onSubmit: (params: { dueDate: string; value: number }) => Promise<void>;
  isSubmitting: boolean;
}

const EditChargeModalInline: React.FC<EditChargeModalInlineProps> = ({
  payment,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const dueDateStr =
    typeof payment.dueDate === 'string'
      ? payment.dueDate.slice(0, 10)
      : new Date(payment.dueDate).toISOString().slice(0, 10);
  const [dueDate, setDueDate] = useState(dueDateStr);
  const rawVal = payment.value;
  const [value, setValue] = useState(() =>
    rawVal != null && Number.isFinite(Number(rawVal))
      ? (Number(rawVal) === 0 ? '' : formatCurrencyValue(Number(rawVal)))
      : ''
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = getNumericValue(value);
    if (Number.isNaN(num) || num < 0) return;
    await onSubmit({ dueDate, value: num });
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalBox onClick={e => e.stopPropagation()}>
        <ModalTitle>Editar cobrança</ModalTitle>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          Altere a data de vencimento e/ou o valor. A cobrança no gateway será atualizada.
        </p>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <label>Data de vencimento</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              required
              style={{
                padding: '0.5rem',
                borderRadius: 4,
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
          </FormGroup>
          <FormGroup>
            <label>Valor</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="R$ 0,00"
              value={value}
              onChange={e => setValue(maskCurrencyReais(e.target.value))}
              required
              style={{
                padding: '0.5rem',
                borderRadius: 4,
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
          </FormGroup>
          <ModalButtons>
            <ActionButton type="button" onClick={onClose}>
              Cancelar
            </ActionButton>
            <ActionButton type="submit" disabled={isSubmitting} primary>
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </ActionButton>
          </ModalButtons>
        </form>
      </ModalBox>
    </ModalOverlay>
  );
};

interface RentalPaymentsListProps {
  rentalId: string;
  /** Chamado após gerar parcelas ou cobranças, para atualizar o histórico na página (ex.: loadRental) */
  onPaymentsGenerated?: () => void;
}

export const RentalPaymentsList: React.FC<RentalPaymentsListProps> = ({
  rentalId,
  onPaymentsGenerated,
}) => {
  const [payments, setPayments] = useState<RentalPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [editingChargePayment, setEditingChargePayment] = useState<RentalPayment | null>(null);
  const [updatingCharge, setUpdatingCharge] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    limit: 10,
  });

  useEffect(() => {
    loadPayments(1);
  }, [rentalId]);

  const loadPayments = async (pageNum: number = 1) => {
    setLoading(true);
    try {
      const res = await rentalPaymentsService.getRentalPaymentsPaginated(
        rentalId,
        pageNum,
        10,
      );
      setPayments(res.data);
      setPagination({
        total: res.total,
        totalPages: res.totalPages,
        limit: res.limit,
      });
      setPage(res.page);
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
      toast.error('Erro ao carregar pagamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePaymentsFirstTime = async () => {
    setGenerating(true);
    try {
      await rentalService.generatePayments(rentalId);
      toast.success('Parcelas geradas com sucesso.');
      await loadPayments(1);
      onPaymentsGenerated?.();
    } catch (error) {
      toast.error('Erro ao gerar parcelas.');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateChargeSubmit = async (params: {
    dueDate: string;
    billingType: 'BOLETO' | 'PIX';
  }) => {
    setGenerating(true);
    try {
      await rentalPaymentsService.generateCharge(rentalId, params);
      toast.success('Cobrança gerada com sucesso');
      setShowGenerateModal(false);
      await loadPayments(page);
      onPaymentsGenerated?.();
    } catch (error) {
      toast.error('Erro ao gerar cobrança');
      throw error;
    } finally {
      setGenerating(false);
    }
  };

  const handleCancelCharge = async (paymentId: string) => {
    if (!window.confirm('Deseja realmente excluir esta cobrança?')) {
      return;
    }

    try {
      await rentalPaymentsService.cancelCharge(paymentId);
      toast.success('Cobrança excluída com sucesso');
      await loadPayments(page);
      onPaymentsGenerated?.();
    } catch (error) {
      console.error('Erro ao excluir cobrança:', error);
      toast.error('Erro ao excluir cobrança');
    }
  };

  const handleEditChargeSubmit = async (params: { dueDate: string; value: number }) => {
    if (!editingChargePayment) return;
    setUpdatingCharge(true);
    try {
      await rentalPaymentsService.updateCharge(rentalId, editingChargePayment.id, params);
      toast.success('Cobrança atualizada com sucesso');
      setEditingChargePayment(null);
      await loadPayments(page);
      onPaymentsGenerated?.();
    } catch (error) {
      console.error('Erro ao editar cobrança:', error);
      toast.error('Erro ao editar cobrança');
      throw error;
    } finally {
      setUpdatingCharge(false);
    }
  };

  if (loading) {
    return <LoadingContainer>Carregando pagamentos...</LoadingContainer>;
  }

  return (
    <Container>
      <Header>
        <Title>Pagamentos</Title>
        <Actions>
          <ActionButton onClick={() => loadPayments(page)} disabled={loading}>
            <MdRefresh />
            <span>Atualizar</span>
          </ActionButton>
          {payments.length === 0 ? (
            <ActionButton
              onClick={handleGeneratePaymentsFirstTime}
              disabled={generating}
              primary
            >
              <MdAdd />
              <span>{generating ? 'Gerando...' : 'Gerar parcelas'}</span>
            </ActionButton>
          ) : (
            <ActionButton
              onClick={() => setShowGenerateModal(true)}
              disabled={generating}
              primary
            >
              <MdAdd />
              <span>Gerar cobrança</span>
            </ActionButton>
          )}
        </Actions>
      </Header>

      {payments.length === 0 ? (
        <EmptyState>
          <p>Nenhuma parcela gerada</p>
          <p>Clique em &quot;Gerar parcelas&quot; para criar as parcelas do contrato.</p>
        </EmptyState>
      ) : (
        <>
          <PaymentsList>
            {payments.map(payment => (
              <RentalPaymentCard
                key={payment.id}
                payment={payment}
                onCancelCharge={handleCancelCharge}
                onEditCharge={payment.asaasPaymentId ? () => setEditingChargePayment(payment) : undefined}
              />
            ))}
          </PaymentsList>
          {pagination.totalPages > 1 && (
            <PaginationWrap>
              <ActionButton
                disabled={page <= 1}
                onClick={() => loadPayments(page - 1)}
              >
                Anterior
              </ActionButton>
              <span>
                Página {page} de {pagination.totalPages} ({pagination.total} itens)
              </span>
              <ActionButton
                disabled={page >= pagination.totalPages}
                onClick={() => loadPayments(page + 1)}
              >
                Próxima
              </ActionButton>
            </PaginationWrap>
          )}
        </>
      )}

      {showGenerateModal && (
        <GenerateChargeModalInline
          onClose={() => setShowGenerateModal(false)}
          onSubmit={handleGenerateChargeSubmit}
          isSubmitting={generating}
        />
      )}
      {editingChargePayment && (
        <EditChargeModalInline
          payment={editingChargePayment}
          onClose={() => setEditingChargePayment(null)}
          onSubmit={handleEditChargeSubmit}
          isSubmitting={updatingCharge}
        />
      )}
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
`;

const ActionButton = styled.button<{ primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: ${props =>
    props.primary ? props.theme.colors.primary : props.theme.colors.backgroundSecondary};
  color: ${props =>
    props.primary ? '#fff' : props.theme.colors.text};
  border: ${props =>
    props.primary ? 'none' : `1px solid ${props.theme.colors.border}`};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background-color: ${props =>
      props.primary ? props.theme.colors.primaryHover ?? props.theme.colors.primaryDark : props.theme.colors.hover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  svg {
    font-size: 18px;
  }
`;

const PaymentsList = styled.div`
  display: flex;
  flex-direction: column;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  font-size: 16px;
  color: ${props => props.theme.colors.textSecondary};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  p {
    margin: 8px 0;
    color: ${props => props.theme.colors.textSecondary};
    font-size: 16px;

    &:first-child {
      font-weight: 600;
      font-size: 18px;
      color: ${props => props.theme.colors.text};
    }
  }
`;

const PaginationWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalBox = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

const ModalTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: ${props => props.theme.colors.text};
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;

  label {
    display: block;
    margin-bottom: 0.35rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: ${props => props.theme.colors.text};
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.25rem;
`;
