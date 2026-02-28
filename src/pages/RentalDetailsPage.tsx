import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { rentalService } from '@/services/rental.service';
import type {
  Rental,
  RentalPayment,
  UpdatePaymentRequest,
  CreatePaymentRequest,
  RentalHistoryEntry,
  RentalCommentEntry,
} from '@/types/rental.types';
import {
  PaymentStatus,
  PaymentStatusLabels,
  PaymentStatusColors,
  PaymentStatusOptions,
  RentalStatusLabels,
  RentalStatusColors,
  PaymentMethodLabels as PMLabels,
} from '@/types/rental.types';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import {
  MdArrowBack,
  MdEdit,
  MdCheck,
  MdHome,
  MdContactMail,
  MdPhone,
  MdCalendarToday,
  MdDescription,
  MdLocationOn,
  MdBed,
  MdWc,
  MdDirectionsCar,
  MdSquareFoot,
  MdChecklist,
  MdAttachFile,
  MdOpenInNew,
  MdMoreVert,
  MdPercent,
  MdCancel,
  MdClose,
  MdAdd,
  MdQrCode2,
  MdLink,
  MdHighlightOff,
  MdDeleteSweep,
  MdDoneAll,
  MdHistory,
  MdComment,
} from 'react-icons/md';
import { FaPix } from 'react-icons/fa6';
import { RentalDetailsShimmer } from '@/components/shimmer/RentalDetailsShimmer';
import { maskCPF, maskCNPJ, maskPhone, formatCurrencyValue, getNumericValue, maskCurrencyReais } from '@/utils/masks';
import { PermissionButton } from '@/components/common/PermissionButton';
import { usePermissionsContext } from '@/contexts/PermissionsContext';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';
import RentalInsuranceSection from '@/components/insurance/RentalInsuranceSection';
import rentalPaymentsService from '@/services/rentalPaymentsService';
import { CustomDatePicker } from '@/components/common/CustomDatePicker';

const PAYMENT_TYPE_OPTIONS = [
  { value: 'BOLETO', label: 'Boleto' },
  { value: 'PIX', label: 'PIX' },
] as const;

const formatMonthShort = (referenceMonth: string) => {
  if (!referenceMonth) return '-';
  const [y, m] = String(referenceMonth).split('-');
  return m && y ? `${m.padStart(2, '0')}/${y}` : referenceMonth;
};

interface GenerateChargeModalProps {
  onClose: () => void;
  onSubmit: (params: { dueDate: string; billingType: 'BOLETO' | 'PIX'; paymentId?: string }) => Promise<void>;
  isSubmitting: boolean;
  /** Parcelas que ainda não têm cobrança (pendentes, sem asaasPaymentId). */
  availablePayments: RentalPayment[];
}

const GenerateChargeModal: React.FC<GenerateChargeModalProps> = ({
  onClose,
  onSubmit,
  isSubmitting,
  availablePayments,
}) => {
  const today = new Date().toISOString().slice(0, 10);
  const nextMonth = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().slice(0, 10);
  })();
  const [dueDate, setDueDate] = useState(nextMonth);
  const [billingType, setBillingType] = useState<'BOLETO' | 'PIX'>('BOLETO');
  const [paymentId, setPaymentId] = useState<string>(availablePayments[0]?.id ?? '');

  useEffect(() => {
    const first = availablePayments[0];
    const firstId = first?.id ?? '';
    setPaymentId(prev => (availablePayments.some(p => p.id === prev) ? prev : firstId));
    if (first?.dueDate) {
      const d = typeof first.dueDate === 'string' ? first.dueDate.slice(0, 10) : new Date(first.dueDate).toISOString().slice(0, 10);
      setDueDate(d);
    }
  }, [availablePayments]);

  const canSubmit = availablePayments.length > 0 && paymentId;
  const minDueDate = today;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const effectiveDue = dueDate < minDueDate ? minDueDate : dueDate;
    await onSubmit({ dueDate: effectiveDue, billingType, paymentId });
    onClose();
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalBox onClick={e => e.stopPropagation()}>
        <ModalTitle>Gerar cobrança</ModalTitle>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          Escolha a parcela, a data de vencimento e o tipo (Boleto ou PIX).
        </p>
        <form onSubmit={handleSubmit}>
          {availablePayments.length > 1 && (
            <FormGroup>
              <label>Parcela</label>
              <select
                value={paymentId}
                onChange={e => setPaymentId(e.target.value)}
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
              >
                {availablePayments.map(p => (
                  <option key={p.id} value={p.id}>
                    {formatMonthShort(p.referenceMonth || '')} — R$ {Number(p.value ?? 0).toFixed(2)}
                  </option>
                ))}
              </select>
            </FormGroup>
          )}
          {availablePayments.length === 0 && (
            <FormGroup>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                Não há parcelas pendentes sem cobrança.
              </p>
            </FormGroup>
          )}
          <FormGroup>
            <label>Data de vencimento</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              min={minDueDate}
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
          <ButtonGroup>
            <ModalButtonSecondary type="button" onClick={onClose}>
              Cancelar
            </ModalButtonSecondary>
            <ModalButton type="submit" disabled={isSubmitting || !canSubmit}>
              {isSubmitting ? 'Gerando...' : 'Gerar cobrança'}
            </ModalButton>
          </ButtonGroup>
        </form>
      </ModalBox>
    </ModalOverlay>
  );
};

interface AddPaymentModalProps {
  rental: Rental;
  onClose: () => void;
  onSubmit: (data: CreatePaymentRequest & { billingType: 'BOLETO' | 'PIX' }) => Promise<void>;
  isSubmitting: boolean;
}

const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
  rental,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const refMonth = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;
  const dueDay = rental?.dueDay ?? 10;
  const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  const day = Math.min(dueDay, lastDay);
  const defaultDue = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const minMonth = now.toISOString().slice(0, 7);

  const [referenceMonth, setReferenceMonth] = useState(refMonth);
  const [dueDate, setDueDate] = useState(defaultDue);
  const monthlyVal = rental?.monthlyValue ?? 0;
  const [value, setValue] = useState(() =>
    monthlyVal === 0 ? '' : formatCurrencyValue(monthlyVal)
  );
  const [observations, setObservations] = useState('');
  const [billingType, setBillingType] = useState<'BOLETO' | 'PIX'>('BOLETO');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = getNumericValue(value);
    if (Number.isNaN(num) || num < 0) return;
    if (referenceMonth < minMonth) return;
    if (!dueDate || !dueDate.trim()) return;
    await onSubmit({
      referenceMonth,
      dueDate,
      value: num,
      ...(observations.trim() ? { observations: observations.trim() } : {}),
      billingType,
    });
    onClose();
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalBoxWide onClick={e => e.stopPropagation()}>
        <ModalTitle>Criar parcela</ModalTitle>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          Cria a parcela no sistema e já gera a cobrança (boleto ou PIX).
        </p>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <label>Mês de referência</label>
            <input
              type="month"
              value={referenceMonth}
              onChange={e => setReferenceMonth(e.target.value)}
              min={minMonth}
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
            <label>Data de vencimento</label>
            <CustomDatePicker
              value={dueDate || null}
              onChange={date => setDueDate(date ? date.format('YYYY-MM-DD') : '')}
              placeholder="Selecione a data de vencimento"
              allowClear={false}
              format="DD/MM/YYYY"
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
          <FormGroup>
            <label>Observações (opcional)</label>
            <input
              type="text"
              value={observations}
              onChange={e => setObservations(e.target.value)}
              placeholder="Ex.: parcela de repasse"
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
              <option value="BOLETO">Boleto</option>
              <option value="PIX">PIX</option>
            </select>
          </FormGroup>
          <ButtonGroup>
            <ModalButtonSecondary type="button" onClick={onClose}>
              <MdClose size={18} /> Cancelar
            </ModalButtonSecondary>
            <ModalButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <> <MdAdd size={18} /> Criando... </>
              ) : (
                <> <MdAdd size={18} /> Criar parcela </>
              )}
            </ModalButton>
          </ButtonGroup>
        </form>
      </ModalBoxWide>
    </ModalOverlay>
  );
};

interface EditChargeModalProps {
  payment: RentalPayment;
  onClose: () => void;
  onSubmit: (params: { dueDate: string; value: number }) => Promise<void>;
  isSubmitting: boolean;
}

const EditChargeModal: React.FC<EditChargeModalProps> = ({
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
            <CustomDatePicker
              value={dueDate || null}
              onChange={date => setDueDate(date ? date.format('YYYY-MM-DD') : '')}
              placeholder="Selecione a data"
              allowClear={false}
              format="DD/MM/YYYY"
            />
          </FormGroup>
          <FormGroup>
            <Label>Valor</Label>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="R$ 0,00"
              value={value}
              onChange={e => setValue(maskCurrencyReais(e.target.value))}
              required
            />
          </FormGroup>
          <ButtonGroup>
            <ModalButtonSecondary type="button" onClick={onClose}>Cancelar</ModalButtonSecondary>
            <ModalButton type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar'}</ModalButton>
          </ButtonGroup>
        </form>
      </ModalBox>
    </ModalOverlay>
  );
};

interface ConfigFineModalProps {
  payment: RentalPayment;
  onClose: () => void;
  onSubmit: (params: {
    lateFeePercentOverride?: number;
    interestPerMonthPercentOverride?: number;
  }) => Promise<void>;
}

const ConfigFineModal: React.FC<ConfigFineModalProps> = ({
  payment,
  onClose,
  onSubmit,
}) => {
  const safeLate = payment.lateFeePercentOverride;
  const safeInterest = payment.interestPerMonthPercentOverride;
  const [lateFee, setLateFee] = useState(
    safeLate != null && Number.isFinite(Number(safeLate)) ? String(safeLate) : ''
  );
  const [interest, setInterest] = useState(
    safeInterest != null && Number.isFinite(Number(safeInterest)) ? String(safeInterest) : ''
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      lateFeePercentOverride: lateFee === '' ? undefined : parseFloat(lateFee) || 0,
      interestPerMonthPercentOverride: interest === '' ? undefined : parseFloat(interest) || 0,
    });
    onClose();
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalBox onClick={e => e.stopPropagation()}>
        <ModalTitle>Configurar multa e juros (parcela)</ModalTitle>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          Defina percentuais para esta parcela. Se vazio, usa o padrão do contrato. Aplica-se na geração da cobrança.
        </p>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Multa (% em atraso) – opcional</Label>
            <PercentInputWrap>
              <Input
                type="number"
                step="0.01"
                min={0}
                max={100}
                placeholder="Ex.: 2"
                value={lateFee === 'NaN' ? '' : lateFee}
                onChange={e => {
                  const v = e.target.value;
                  if (v === '') { setLateFee(''); return; }
                  const num = parseFloat(v);
                  if (!Number.isFinite(num)) return;
                  setLateFee(String(Math.min(100, Math.max(0, num))));
                }}
              />
              <PercentSuffix>%</PercentSuffix>
            </PercentInputWrap>
          </FormGroup>
          <FormGroup>
            <Label>Juros ao mês (% em atraso) – opcional</Label>
            <PercentInputWrap>
              <Input
                type="number"
                step="0.01"
                min={0}
                max={100}
                placeholder="Ex.: 1"
                value={interest === 'NaN' ? '' : interest}
                onChange={e => {
                  const v = e.target.value;
                  if (v === '') { setInterest(''); return; }
                  const num = parseFloat(v);
                  if (!Number.isFinite(num)) return;
                  setInterest(String(Math.min(100, Math.max(0, num))));
                }}
              />
              <PercentSuffix>%</PercentSuffix>
            </PercentInputWrap>
          </FormGroup>
          <ButtonGroup>
            <ModalButtonSecondary type="button" onClick={onClose}>Cancelar</ModalButtonSecondary>
            <ModalButton type="submit">Salvar</ModalButton>
          </ButtonGroup>
        </form>
      </ModalBox>
    </ModalOverlay>
  );
};

export const RentalDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { hasPermission } = usePermissionsContext();
  const canManagePayments = hasPermission('rental:manage_payments');
  const [rental, setRental] = useState<Rental | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayments, setProcessingPayments] = useState<Set<string>>(
    new Set()
  );
  const [generatingCharges, setGeneratingCharges] = useState(false);
  const [showGenerateChargeModal, setShowGenerateChargeModal] = useState(false);
  const [chargeModalAvailablePayments, setChargeModalAvailablePayments] = useState<RentalPayment[]>([]);
  const [loadingChargeModalPayments, setLoadingChargeModalPayments] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [addingPayment, setAddingPayment] = useState(false);
  const [editingChargePayment, setEditingChargePayment] = useState<RentalPayment | null>(null);
  const [updatingCharge, setUpdatingCharge] = useState(false);
  const [configFinePayment, setConfigFinePayment] = useState<RentalPayment | null>(null);
  const [pixModalPayment, setPixModalPayment] = useState<RentalPayment | null>(null);
  const [pixModalData, setPixModalData] = useState<{
    invoiceUrl?: string;
    pixQrCodeBase64?: string;
    pixCopyPaste?: string;
  } | null>(null);
  const [loadingPixModal, setLoadingPixModal] = useState(false);
  const [confirmIrreversible, setConfirmIrreversible] = useState<
    | { type: 'cancelCharge'; paymentId: string }
    | { type: 'markAsPaid'; payment: RentalPayment }
    | { type: 'batchCancel' }
    | { type: 'batchMarkPaid' }
    | null
  >(null);
  const [paymentsMenuOpenId, setPaymentsMenuOpenId] = useState<string | null>(null);
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<Set<string>>(new Set());
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [paymentsPagination, setPaymentsPagination] = useState<{
    data: RentalPayment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 });

  const [paymentFilters, setPaymentFilters] = useState<{
    status: string;
    hasCharge: '' | 'yes' | 'no';
    referenceMonthFrom: string;
    referenceMonthTo: string;
  }>({
    status: '',
    hasCharge: '',
    referenceMonthFrom: '',
    referenceMonthTo: '',
  });

  const HISTORY_PAGE_SIZE = 10;
  const COMMENTS_PAGE_SIZE = 10;

  const [history, setHistory] = useState<RentalHistoryEntry[]>([]);
  const [historyPagination, setHistoryPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: HISTORY_PAGE_SIZE,
  });
  const [comments, setComments] = useState<RentalCommentEntry[]>([]);
  const [commentsPagination, setCommentsPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: COMMENTS_PAGE_SIZE,
  });
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; deleting: boolean }>({ open: false, deleting: false });

  const loadHistory = async (page: number = 1) => {
    if (!id) return;
    setLoadingHistory(true);
    try {
      const data = await rentalService.getHistory(id, page, HISTORY_PAGE_SIZE);
      setHistory(data.items);
      setHistoryPagination({
        page: data.page,
        totalPages: data.totalPages,
        total: data.total,
        limit: data.limit,
      });
    } catch {
      setHistory([]);
      setHistoryPagination(prev => ({ ...prev, total: 0, totalPages: 1 }));
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadComments = async (page: number = 1) => {
    if (!id) return;
    setLoadingComments(true);
    try {
      const data = await rentalService.getComments(id, page, COMMENTS_PAGE_SIZE);
      setComments(data.items);
      setCommentsPagination({
        page: data.page,
        totalPages: data.totalPages,
        total: data.total,
        limit: data.limit,
      });
    } catch {
      setComments([]);
      setCommentsPagination(prev => ({ ...prev, total: 0, totalPages: 1 }));
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (id && rental) {
      loadHistory(1);
      loadComments(1);
    }
  }, [id, rental?.id]);

  const handleAddComment = async () => {
    if (!id || !commentText.trim()) return;
    setSubmittingComment(true);
    try {
      await rentalService.addComment(id, commentText.trim());
      setCommentText('');
      toast.success('Comentário adicionado.');
      await loadComments(1);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Erro ao adicionar comentário.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteRental = async () => {
    if (!id) return;
    setDeleteModal(prev => ({ ...prev, deleting: true }));
    try {
      await rentalService.delete(id);
      toast.success('Aluguel excluído.');
      navigate('/rentals');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Erro ao excluir.');
      setDeleteModal(prev => ({ ...prev, deleting: false }));
    }
  };

  const getHistoryActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      created: 'Locação criada',
      updated: 'Locação atualizada',
      approved: 'Locação aprovada',
      rejected: 'Locação rejeitada',
      cancelled: 'Locação excluída',
      status_changed: 'Status alterado',
      payment_added: 'Pagamento adicionado',
      payment_updated: 'Pagamento atualizado',
      payments_generated: 'Pagamentos gerados',
      charge_updated: 'Cobrança editada',
      charge_generated: 'Cobrança gerada',
      charge_cancelled: 'Cobrança cancelada',
      marked_paid: 'Marcado como pago',
      payment_deleted: 'Pagamento excluído',
      comment_added: 'Comentário adicionado',
    };
    return labels[action] || action;
  };

  const loadPayments = async (
    page: number = 1,
    filters?: {
      status?: string;
      hasCharge?: boolean;
      referenceMonthFrom?: string;
      referenceMonthTo?: string;
    },
  ) => {
    if (!id) return;
    const f = filters ?? {
      ...(paymentFilters.status && { status: paymentFilters.status }),
      ...(paymentFilters.hasCharge === 'yes' && { hasCharge: true }),
      ...(paymentFilters.hasCharge === 'no' && { hasCharge: false }),
      ...(paymentFilters.referenceMonthFrom && {
        referenceMonthFrom: paymentFilters.referenceMonthFrom,
      }),
      ...(paymentFilters.referenceMonthTo && {
        referenceMonthTo: paymentFilters.referenceMonthTo,
      }),
    };
    try {
      const res = await rentalPaymentsService.getRentalPaymentsPaginated(
        id,
        page,
        10,
        Object.keys(f).length ? f : undefined,
      );
      setPaymentsPagination(res);
    } catch {
      toast.error('Erro ao carregar pagamentos');
    }
  };

  const applyPaymentFilters = (
    next: Partial<{
      status: string;
      hasCharge: '' | 'yes' | 'no';
      referenceMonthFrom: string;
      referenceMonthTo: string;
    }>,
  ) => {
    const merged = { ...paymentFilters, ...next };
    setPaymentFilters(merged);
    const f = {
      ...(merged.status && { status: merged.status }),
      ...(merged.hasCharge === 'yes' && { hasCharge: true }),
      ...(merged.hasCharge === 'no' && { hasCharge: false }),
      ...(merged.referenceMonthFrom && { referenceMonthFrom: merged.referenceMonthFrom }),
      ...(merged.referenceMonthTo && { referenceMonthTo: merged.referenceMonthTo }),
    };
    loadPayments(1, Object.keys(f).length ? f : undefined);
  };

  const clearPaymentFilters = () => {
    setPaymentFilters({
      status: '',
      hasCharge: '',
      referenceMonthFrom: '',
      referenceMonthTo: '',
    });
    loadPayments(1, {});
  };

  const openPixModal = (payment: RentalPayment) => {
    setPaymentsMenuOpenId(null);
    setPixModalPayment(payment);
    setPixModalData(null);
    setLoadingPixModal(true);
    const fromPayment = {
      invoiceUrl: payment.asaasInvoiceUrl,
      pixQrCodeBase64: payment.asaasPixQrCode,
      pixCopyPaste: payment.asaasPixCopyPaste,
    };
    if (fromPayment.invoiceUrl || fromPayment.pixQrCodeBase64 || fromPayment.pixCopyPaste) {
      setPixModalData(fromPayment);
      setLoadingPixModal(false);
      return;
    }
    if (!id) {
      setLoadingPixModal(false);
      return;
    }
    const currentPage = paymentsPagination.page;
    rentalPaymentsService
      .getPixPaymentInfo(id, payment.id)
      .then(data => {
        setPixModalData(data);
        loadPayments(currentPage);
      })
      .catch(() => {
        toast.error('Erro ao carregar link e QR Code PIX');
      })
      .finally(() => setLoadingPixModal(false));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const downloadQrCode = (base64: string, referenceMonth: string) => {
    const safeName = referenceMonth.replace(/\D/g, '-') || 'pix-qrcode';
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64}`;
    link.download = `pix-${safeName}.png`;
    link.click();
  };

  const openGenerateChargeModal = async () => {
    if (!id) return;
    setLoadingChargeModalPayments(true);
    try {
      const all = await rentalPaymentsService.getRentalPayments(id);
      const pendingWithoutCharge = all.filter(
        p => (p.status === 'PENDING' || p.status === 'OVERDUE') && !p.asaasPaymentId
      );
      setChargeModalAvailablePayments(pendingWithoutCharge);
      setShowGenerateChargeModal(true);
    } catch {
      toast.error('Erro ao carregar parcelas');
    } finally {
      setLoadingChargeModalPayments(false);
    }
  };

  const handleAddPayment = async (data: CreatePaymentRequest & { billingType: 'BOLETO' | 'PIX' }) => {
    if (!id) return;
    setAddingPayment(true);
    try {
      await rentalPaymentsService.createPaymentAndCharge(id, {
        referenceMonth: data.referenceMonth,
        dueDate: data.dueDate,
        value: data.value,
        observations: data.observations,
        billingType: data.billingType,
      });
      toast.success('Parcela criada e cobrança gerada.');
      loadRental();
      loadPayments(1);
      setShowAddPaymentModal(false);
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      toast.error(msg || 'Erro ao criar parcela.');
    } finally {
      setAddingPayment(false);
    }
  };

  useEffect(() => {
    loadRental();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (loading || !rental || location.hash !== '#payments') return;
    const el = document.getElementById('payments');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [loading, rental, location.hash]);

  useEffect(() => {
    if (id && !loading) loadPayments(1);
  }, [id, loading]);

  useEffect(() => {
    if (!paymentsMenuOpenId) return;
    const close = () => setPaymentsMenuOpenId(null);
    const t = setTimeout(() => document.addEventListener('click', close), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener('click', close);
    };
  }, [paymentsMenuOpenId]);

  const loadRental = async () => {
    if (!id) return;
    try {
      const data = await rentalService.getById(id);
      setRental(data);
    } catch {
      toast.error('Erro ao carregar aluguel');
      navigate('/rentals');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentUpdate = async (
    paymentId: string,
    data: UpdatePaymentRequest
  ) => {
    if (!id) return;

    // Adicionar paymentId ao set de processamento
    setProcessingPayments(prev => new Set(prev).add(paymentId));

    try {
      await rentalService.updatePayment(id, paymentId, data);
      toast.success('Pagamento atualizado com sucesso');
      loadRental();
    } catch (err) {
      toast.error('Erro ao atualizar pagamento');
      throw err;
    } finally {
      // Remover paymentId do set de processamento
      setProcessingPayments(prev => {
        const newSet = new Set(prev);
        newSet.delete(paymentId);
        return newSet;
      });
    }
  };

  const handleMarkAsPaid = (payment: RentalPayment) => {
    handlePaymentUpdate(payment.id, {
      status: PaymentStatus.PAID,
      paymentDate: new Date().toISOString().split('T')[0],
      paidValue: payment.value,
    });
  };

  const canEditOrCancelCharge = (p: RentalPayment) => {
    if (!p.asaasPaymentId) return false;
    const s = (p.asaasStatus || p.status || '').toUpperCase();
    return s === 'PENDING' || s === 'OVERDUE';
  };

  const handleCancelCharge = async (paymentId: string) => {
    try {
      await rentalPaymentsService.cancelCharge(paymentId);
      toast.success('Cobrança excluída com sucesso');
      setConfirmIrreversible(null);
      loadRental();
      loadPayments(paymentsPagination.page);
    } catch {
      toast.error('Erro ao excluir cobrança');
    }
  };

  const handleEditChargeSubmit = async (params: { dueDate: string; value: number }) => {
    if (!id || !editingChargePayment) return;
    setUpdatingCharge(true);
    try {
      await rentalPaymentsService.updateCharge(id, editingChargePayment.id, params);
      toast.success('Cobrança atualizada com sucesso');
      setEditingChargePayment(null);
      loadRental();
      loadPayments(paymentsPagination.page);
    } catch {
      toast.error('Erro ao editar cobrança');
      throw new Error('edit charge failed');
    } finally {
      setUpdatingCharge(false);
    }
  };

  const handleConfigFineSubmit = async (params: {
    lateFeePercentOverride?: number;
    interestPerMonthPercentOverride?: number;
  }) => {
    if (!id || !configFinePayment) return;
    try {
      await rentalService.updatePayment(id, configFinePayment.id, params);
      toast.success('Multa e juros configurados para a parcela');
      setConfigFinePayment(null);
      loadPayments(paymentsPagination.page);
    } catch {
      toast.error('Erro ao salvar configuração');
      throw new Error('config fine failed');
    }
  };

  const togglePaymentSelection = (paymentId: string) => {
    setSelectedPaymentIds(prev => {
      const next = new Set(prev);
      if (next.has(paymentId)) next.delete(paymentId);
      else next.add(paymentId);
      return next;
    });
  };

  const toggleSelectAllPayments = () => {
    const ids = paymentsPagination.data.map(p => p.id);
    const allSelected = ids.length > 0 && ids.every(i => selectedPaymentIds.has(i));
    setSelectedPaymentIds(allSelected ? new Set() : new Set(ids));
  };

  const handleBatchCancel = async () => {
    if (!id || selectedPaymentIds.size === 0) return;
    setBatchProcessing(true);
    setConfirmIrreversible(null);
    try {
      const ids = Array.from(selectedPaymentIds);
      const result = await rentalPaymentsService.batchCancelCharges(id, ids);
      setSelectedPaymentIds(new Set());
      loadRental();
      loadPayments(paymentsPagination.page);
      const hasErrors = result.errors?.length > 0;
      const hasSkipped = (result.skipped ?? 0) > 0;
      if (hasErrors) {
        toast.warning(
          `${result.cancelled} excluída(s). ${result.skipped ?? 0} ignorada(s). Erros: ${result.errors!.slice(0, 3).join('; ')}`
        );
      } else if (hasSkipped) {
        toast.warning(
          `${result.cancelled} cobrança(s) excluída(s). ${result.skipped} ignorada(s) (sem cobrança no gateway ou já cancelada/paga).`
        );
      } else {
        toast.success(
          result.cancelled === 1
            ? '1 cobrança excluída com sucesso.'
            : `${result.cancelled} cobranças excluídas com sucesso.`
        );
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erro ao excluir cobranças em lote');
    } finally {
      setBatchProcessing(false);
    }
  };

  const handleBatchMarkPaid = async () => {
    if (!id || selectedPaymentIds.size === 0) return;
    const paymentDate = new Date().toISOString().slice(0, 10);
    setBatchProcessing(true);
    setConfirmIrreversible(null);
    try {
      const result = await rentalPaymentsService.batchMarkAsPaid(id, Array.from(selectedPaymentIds), paymentDate);
      setSelectedPaymentIds(new Set());
      loadRental();
      loadPayments(paymentsPagination.page);
      const hasErrors = result.errors?.length > 0;
      const hasSkipped = (result.skipped ?? 0) > 0;
      if (hasErrors) {
        toast.warning(
          `${result.marked} marcada(s). ${result.skipped ?? 0} ignorada(s). Erros: ${result.errors!.slice(0, 3).join('; ')}`
        );
      } else if (hasSkipped) {
        toast.warning(
          `${result.marked} cobrança(s) marcada(s) como pago. ${result.skipped} ignorada(s) (já pagas ou sem cobrança no gateway).`
        );
      } else {
        toast.success(
          result.marked === 1
            ? '1 cobrança marcada como pago.'
            : `${result.marked} cobranças marcadas como pago.`
        );
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erro ao marcar como pago em lote');
    } finally {
      setBatchProcessing(false);
    }
  };

  const onConfirmIrreversible = async () => {
    if (!confirmIrreversible) return;
    try {
      if (confirmIrreversible.type === 'cancelCharge') {
        await handleCancelCharge(confirmIrreversible.paymentId);
      } else if (confirmIrreversible.type === 'markAsPaid') {
        await handlePaymentUpdate(confirmIrreversible.payment.id, {
          status: PaymentStatus.PAID,
          paymentDate: new Date().toISOString().split('T')[0],
          paidValue: confirmIrreversible.payment.value,
        });
        setConfirmIrreversible(null);
        loadPayments(paymentsPagination.page);
      } else if (confirmIrreversible.type === 'batchCancel') {
        await handleBatchCancel();
      } else if (confirmIrreversible.type === 'batchMarkPaid') {
        await handleBatchMarkPaid();
      }
    } catch {
      // Mantém o modal aberto em caso de erro; toast já é exibido pelos handlers
    }
  };

  const getStatusLabel = (status: string) => {
    return (
      PaymentStatusLabels[status as keyof typeof PaymentStatusLabels] || status
    );
  };

  const getStatusColor = (status: string) => {
    return (
      PaymentStatusColors[status as keyof typeof PaymentStatusColors] ||
      undefined
    );
  };

  const getRentalStatusLabel = (status: string) => {
    return (
      RentalStatusLabels[status as keyof typeof RentalStatusLabels] || status
    );
  };

  const getRentalStatusColor = (status: string) => {
    return RentalStatusColors[status as keyof typeof RentalStatusColors] || undefined;
  };

  const handleGeneratePaymentsFirstTime = async () => {
    if (!id) return;
    setGeneratingCharges(true);
    try {
      await rentalService.generatePayments(id);
      toast.success('Parcelas geradas com sucesso.');
      await loadRental();
      await loadPayments(1);
    } catch (e) {
      toast.error('Erro ao gerar parcelas.');
    } finally {
      setGeneratingCharges(false);
    }
  };

  const formatPhone = (phone: string) => {
    if (!phone) return 'N/A';
    return maskPhone(phone);
  };

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatMonth = (referenceMonth: string) => {
    if (!referenceMonth) return 'N/A';
    const [year, month] = referenceMonth.split('-');
    const monthNames = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const formatDocument = (document: string) => {
    if (!document) return 'N/A';

    const cleaned = document.replace(/[^A-Za-z0-9]/g, '');
    const hasLetters = /[A-Za-z]/.test(cleaned);

    if (hasLetters) {
      return maskCNPJ(document);
    } else if (cleaned.length <= 11) {
      return maskCPF(document);
    } else {
      return maskCNPJ(document);
    }
  };

  if (loading)
    return (
      <Layout>
        <RentalDetailsShimmer />
      </Layout>
    );
  if (!rental)
    return (
      <Layout>
        <ErrorContainer>Aluguel não encontrado</ErrorContainer>
      </Layout>
    );

  return (
    <Layout>
      <Container>
        <Header>
          <BackButton onClick={() => navigate('/rentals')}>
            <MdArrowBack /> Voltar
          </BackButton>
          <HeaderActions>
            <PermissionButton
              permission='rental:update'
              onClick={() => navigate(`/rentals/${id}/edit`)}
              variant='primary'
              tooltip='Editar aluguel'
            >
              <MdEdit /> Editar
            </PermissionButton>
            <PermissionButton
              permission='rental:delete'
              onClick={() => setDeleteModal({ open: true, deleting: false })}
              variant='secondary'
              tooltip='Excluir aluguel'
            >
              <MdClose /> Excluir
            </PermissionButton>
          </HeaderActions>
        </Header>

        <ConfirmDeleteModal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, deleting: false })}
          onConfirm={handleDeleteRental}
          isLoading={deleteModal.deleting}
          title='Excluir aluguel'
          message='Esta ação não pode ser desfeita. O aluguel e os dados vinculados serão removidos.'
          itemName={rental.tenantName}
        />

        {/* Status Card */}
        <StatusCard>
          <StatusInfo>
            <StatusLabel>Status do Contrato</StatusLabel>
            <StatusBadge $color={getRentalStatusColor(rental.status)} $useThemeFallback>
              {getRentalStatusLabel(rental.status)}
            </StatusBadge>
          </StatusInfo>
          <StatusInfo>
            <StatusLabel>Geração Automática</StatusLabel>
            <StatusBadge
              $success={rental.autoGeneratePayments}
              $useThemeFallback
            >
              {rental.autoGeneratePayments ? 'Ativada' : 'Desativada'}
            </StatusBadge>
          </StatusInfo>
        </StatusCard>

        {/* Main Info Grid */}
        <MainGrid>
          {/* Tenant Information */}
          <Card>
            <CardTitle>
              <MdContactMail /> Informações do Inquilino
            </CardTitle>
            <InfoGrid>
              <InfoItem>
                <InfoLabel>Nome Completo</InfoLabel>
                <InfoValue>{rental.tenantName}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Documento</InfoLabel>
                <InfoValue>{formatDocument(rental.tenantDocument)}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>
                  <MdPhone /> Telefone
                </InfoLabel>
                <InfoValue>{formatPhone(rental.tenantPhone || '')}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>
                  <MdContactMail /> E-mail
                </InfoLabel>
                <InfoValue>{rental.tenantEmail || 'N/A'}</InfoValue>
              </InfoItem>
            </InfoGrid>
          </Card>

          {/* Contract Information */}
          <Card>
            <CardTitle>
              <MdCalendarToday /> Informações do Contrato
            </CardTitle>
            <InfoGrid>
              <InfoItem>
                <InfoLabel>Valor Mensal</InfoLabel>
                <InfoValueHighlight>
                  R$ {rental.monthlyValue.toFixed(2)}
                </InfoValueHighlight>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Valor do Depósito</InfoLabel>
                <InfoValue>
                  R$ {(rental.depositValue || 0).toFixed(2)}
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Data de Início</InfoLabel>
                <InfoValue>{formatDate(rental.startDate)}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Data de Término</InfoLabel>
                <InfoValue>{formatDate(rental.endDate)}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Dia de Vencimento</InfoLabel>
                <InfoValue>Dia {rental.dueDay}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Período</InfoLabel>
                <InfoValue>
                  {formatDate(rental.startDate)} até{' '}
                  {formatDate(rental.endDate)}
                </InfoValue>
              </InfoItem>
            </InfoGrid>
          </Card>
        </MainGrid>

        {/* Property Information */}
        {rental.property && (
          <Card>
            <CardTitle>
              <MdHome /> Informações da Propriedade
            </CardTitle>
            <PropertyContainer>
              {rental.property.mainImage && (
                <PropertyImage
                  src={rental.property.mainImage.fileUrl}
                  alt={rental.property.title}
                />
              )}
              <PropertyInfo>
                <InfoGrid>
                  <InfoItem>
                    <InfoLabel>Nome</InfoLabel>
                    <InfoValue>{rental.property.title}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Código</InfoLabel>
                    <InfoValue>{rental.property.code}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Tipo</InfoLabel>
                    <InfoValue>
                      {rental.property.type === 'house'
                        ? 'Casa'
                        : 'Apartamento'}
                    </InfoValue>
                  </InfoItem>
                  <InfoItem style={{ gridColumn: 'span 2' }}>
                    <InfoLabel>
                      <MdLocationOn /> Endereço
                    </InfoLabel>
                    <InfoValue>{rental.property.address}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Bairro</InfoLabel>
                    <InfoValue>{rental.property.neighborhood}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Cidade / UF</InfoLabel>
                    <InfoValue>
                      {rental.property.city} / {rental.property.state}
                    </InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>
                      <MdBed /> Quartos
                    </InfoLabel>
                    <InfoValue>{rental.property.bedrooms}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>
                      <MdWc /> Banheiros
                    </InfoLabel>
                    <InfoValue>{rental.property.bathrooms}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>
                      <MdDirectionsCar /> Vagas
                    </InfoLabel>
                    <InfoValue>{rental.property.parkingSpaces}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>
                      <MdSquareFoot /> Área Total
                    </InfoLabel>
                    <InfoValue>{rental.property.totalArea} m²</InfoValue>
                  </InfoItem>
                </InfoGrid>
              </PropertyInfo>
            </PropertyContainer>
          </Card>
        )}

        {/* Checklist vinculado */}
        {(rental.checklistId || rental.checklist) && (
          <Card>
            <CardTitle>
              <MdChecklist /> Checklist vinculado
            </CardTitle>
            <InfoGrid>
              <InfoItem>
                <InfoLabel>Status</InfoLabel>
                <InfoValue>
                  {rental.checklist?.status === 'pending'
                    ? 'Pendente'
                    : rental.checklist?.status === 'in_progress'
                      ? 'Em andamento'
                      : rental.checklist?.status === 'completed'
                        ? 'Concluído'
                        : rental.checklist?.status ?? '-'}
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Tipo</InfoLabel>
                <InfoValue>
                  {rental.checklist?.type === 'rental' ? 'Aluguel' : rental.checklist?.type === 'sale' ? 'Venda' : rental.checklist?.type ?? '-'}
                </InfoValue>
              </InfoItem>
              <InfoItem style={{ gridColumn: 'span 2' }}>
                <LinkToChecklist
                  as={Link}
                  to={`/checklists/${rental.checklistId ?? rental.checklist?.id}`}
                >
                  <MdOpenInNew /> Abrir checklist
                </LinkToChecklist>
              </InfoItem>
            </InfoGrid>
          </Card>
        )}

        {/* Documentos vinculados */}
        {rental.documents && rental.documents.length > 0 && (
          <Card>
            <CardTitle>
              <MdAttachFile /> Documentos da locação
            </CardTitle>
            <DocList>
              {rental.documents.map(doc => (
                <DocItem key={doc.id}>
                  <DocLink href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                    {doc.originalName || doc.fileName}
                  </DocLink>
                </DocItem>
              ))}
            </DocList>
          </Card>
        )}

        {/* Observations */}
        {rental.observations && (
          <Card>
            <CardTitle>
              <MdDescription /> Observações
            </CardTitle>
            <ObservationsText>{rental.observations}</ObservationsText>
          </Card>
        )}

        {/* Histórico */}
        <Card>
          <CardTitle>
            <MdHistory /> Histórico
            {historyPagination.total > 0 && (
              <HistoryCount>{historyPagination.total} registro(s)</HistoryCount>
            )}
          </CardTitle>
          {loadingHistory ? (
            <HistoryPlaceholder>Carregando histórico...</HistoryPlaceholder>
          ) : history.length === 0 ? (
            <HistoryPlaceholder>Nenhum registro no histórico.</HistoryPlaceholder>
          ) : (
            <>
              <HistoryList>
                {history.map(entry => (
                  <HistoryItem key={entry.id}>
                    <HistoryItemMeta>
                      <HistoryItemDate>
                        {new Date(entry.createdAt).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </HistoryItemDate>
                      {entry.userName && (
                        <HistoryItemUser>{entry.userName}</HistoryItemUser>
                      )}
                    </HistoryItemMeta>
                    <HistoryItemAction>{getHistoryActionLabel(entry.action)}</HistoryItemAction>
                    {entry.description && (
                      <HistoryItemDesc>{entry.description}</HistoryItemDesc>
                    )}
                  </HistoryItem>
                ))}
              </HistoryList>
              {historyPagination.totalPages > 1 && (
                <SectionPagination>
                  <SectionPaginationButton
                    type="button"
                    onClick={() => loadHistory(historyPagination.page - 1)}
                    disabled={historyPagination.page <= 1}
                  >
                    Anterior
                  </SectionPaginationButton>
                  <SectionPaginationInfo>
                    Página {historyPagination.page} de {historyPagination.totalPages}
                  </SectionPaginationInfo>
                  <SectionPaginationButton
                    type="button"
                    onClick={() => loadHistory(historyPagination.page + 1)}
                    disabled={historyPagination.page >= historyPagination.totalPages}
                  >
                    Próxima
                  </SectionPaginationButton>
                </SectionPagination>
              )}
            </>
          )}
        </Card>

        {/* Comentários */}
        <Card>
          <CardTitle>
            <MdComment /> Comentários
            {commentsPagination.total > 0 && (
              <HistoryCount>{commentsPagination.total} comentário(s)</HistoryCount>
            )}
          </CardTitle>
          <CommentForm>
            <CommentTextArea
              placeholder="Adicione um comentário..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              rows={3}
            />
            <CommentSubmitButton
              type="button"
              onClick={handleAddComment}
              disabled={!commentText.trim() || submittingComment}
            >
              {submittingComment ? 'Enviando...' : 'Enviar'}
            </CommentSubmitButton>
          </CommentForm>
          {loadingComments ? (
            <CommentsPlaceholder>Carregando comentários...</CommentsPlaceholder>
          ) : comments.length === 0 ? (
            <CommentsPlaceholder>Nenhum comentário ainda.</CommentsPlaceholder>
          ) : (
            <>
              <CommentsList>
                {comments.map(c => (
                  <CommentItem key={c.id}>
                    <CommentItemMeta>
                      <CommentItemUser>{c.userName || 'Usuário'}</CommentItemUser>
                      <CommentItemDate>
                        {new Date(c.createdAt).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </CommentItemDate>
                    </CommentItemMeta>
                    <CommentItemContent>{c.content}</CommentItemContent>
                  </CommentItem>
                ))}
              </CommentsList>
              {commentsPagination.totalPages > 1 && (
                <SectionPagination>
                  <SectionPaginationButton
                    type="button"
                    onClick={() => loadComments(commentsPagination.page - 1)}
                    disabled={commentsPagination.page <= 1}
                  >
                    Anterior
                  </SectionPaginationButton>
                  <SectionPaginationInfo>
                    Página {commentsPagination.page} de {commentsPagination.totalPages}
                  </SectionPaginationInfo>
                  <SectionPaginationButton
                    type="button"
                    onClick={() => loadComments(commentsPagination.page + 1)}
                    disabled={commentsPagination.page >= commentsPagination.totalPages}
                  >
                    Próxima
                  </SectionPaginationButton>
                </SectionPagination>
              )}
            </>
          )}
        </Card>

        <Card id="payments">
          <CardHeader>
            <CardTitle>Parcelas e cobranças</CardTitle>
            <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              {paymentsPagination.total === 0
                ? 'Parcelas = mensalidades do contrato. Crie todas de uma vez (do início ao fim do contrato).'
                : 'Criar parcela: adiciona uma nova parcela e já gera a cobrança (boleto ou PIX). Para parcelas já existentes sem cobrança, use "Gerar cobrança" no menu da linha.'}
            </p>
            {canManagePayments &&
              (paymentsPagination.total === 0 ? (
                <GenerateChargesButton
                  onClick={handleGeneratePaymentsFirstTime}
                  disabled={generatingCharges}
                >
                  {generatingCharges ? 'Criando...' : 'Criar parcelas do contrato'}
                </GenerateChargesButton>
              ) : (
                <GenerateChargesButton
                  type="button"
                  onClick={() => setShowAddPaymentModal(true)}
                  disabled={addingPayment}
                >
                  {addingPayment ? 'Criando...' : 'Criar parcela'}
                </GenerateChargesButton>
              ))}
          </CardHeader>

          {paymentsPagination.total > 0 && (
            <PaymentsFilterRow>
              <FilterLabel>Status</FilterLabel>
              <FilterSelect
                value={paymentFilters.status}
                onChange={e => applyPaymentFilters({ status: e.target.value })}
                aria-label="Filtrar por status"
              >
                <option value="">Todos</option>
                {PaymentStatusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </FilterSelect>
              <FilterLabel>Cobrança</FilterLabel>
              <FilterSelect
                value={paymentFilters.hasCharge}
                onChange={e =>
                  applyPaymentFilters({
                    hasCharge: e.target.value as '' | 'yes' | 'no',
                  })
                }
                aria-label="Filtrar por cobrança"
              >
                <option value="">Todos</option>
                <option value="yes">Com cobrança</option>
                <option value="no">Sem cobrança</option>
              </FilterSelect>
              <FilterLabel>Período (ref.)</FilterLabel>
              <FilterDatePickerWrap>
                <CustomDatePicker
                  key={`ref-from-${paymentFilters.referenceMonthFrom || 'empty'}`}
                  value={
                    paymentFilters.referenceMonthFrom
                      ? `${paymentFilters.referenceMonthFrom}-01`
                      : null
                  }
                  onChange={date =>
                    applyPaymentFilters({
                      referenceMonthFrom: date ? date.format('YYYY-MM') : '',
                    })
                  }
                  placeholder="De (data)"
                  format="DD/MM/YYYY"
                  allowClear={true}
                />
              </FilterDatePickerWrap>
              <span style={{ color: 'var(--color-text-secondary)' }}>até</span>
              <FilterDatePickerWrap>
                <CustomDatePicker
                  key={`ref-to-${paymentFilters.referenceMonthTo || 'empty'}`}
                  value={
                    paymentFilters.referenceMonthTo
                      ? `${paymentFilters.referenceMonthTo}-01`
                      : null
                  }
                  onChange={date =>
                    applyPaymentFilters({
                      referenceMonthTo: date ? date.format('YYYY-MM') : '',
                    })
                  }
                  placeholder="Até (data)"
                  format="DD/MM/YYYY"
                  allowClear={true}
                />
              </FilterDatePickerWrap>
              <FilterClearButton type="button" onClick={clearPaymentFilters}>
                Limpar filtros
              </FilterClearButton>
            </PaymentsFilterRow>
          )}

          {canManagePayments && selectedPaymentIds.size > 0 && paymentsPagination.data.length > 0 && (
            <BatchBar>
              <BatchBarLabel>
                <BatchBarCount>{selectedPaymentIds.size}</BatchBarCount>
                <span>
                  {selectedPaymentIds.size === 1
                    ? '1 cobrança selecionada'
                    : `${selectedPaymentIds.size} cobranças selecionadas`}
                </span>
              </BatchBarLabel>
              <BatchBarActions>
                <BatchBarButton
                  type="button"
                  $variant="default"
                  onClick={() => setSelectedPaymentIds(new Set())}
                  disabled={batchProcessing}
                  title="Desmarcar todas"
                >
                  <MdHighlightOff size={18} />
                  Desmarcar
                </BatchBarButton>
                <BatchBarButton
                  type="button"
                  $variant="danger"
                  onClick={() => setConfirmIrreversible({ type: 'batchCancel' })}
                  disabled={batchProcessing}
                  title="Excluir cobranças no gateway (abre confirmação)"
                >
                  <MdDeleteSweep size={18} />
                  Excluir cobranças
                </BatchBarButton>
                <BatchBarButton
                  type="button"
                  $variant="success"
                  onClick={() => setConfirmIrreversible({ type: 'batchMarkPaid' })}
                  disabled={batchProcessing}
                  title="Marcar como pago (abre confirmação)"
                >
                  <MdDoneAll size={18} />
                  Marcar como pago
                </BatchBarButton>
              </BatchBarActions>
            </BatchBar>
          )}

          <TableWrapper>
          <PaymentsTable>
            <thead>
              <tr>
                <th style={{ width: 44 }}>
                  {paymentsPagination.data.length > 0 && (
                    <input
                      type="checkbox"
                      checked={paymentsPagination.data.length > 0 && paymentsPagination.data.every(p => selectedPaymentIds.has(p.id))}
                      onChange={toggleSelectAllPayments}
                      aria-label="Selecionar todas"
                    />
                  )}
                </th>
                <th>Referência</th>
                <th>Vencimento</th>
                <th>Valor</th>
                <th>Valor Pago</th>
                <th>Método</th>
                <th>Data Pagamento</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {paymentsPagination.data.length > 0 ? (
                paymentsPagination.data.map(payment => (
                  <tr key={payment.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedPaymentIds.has(payment.id)}
                        onChange={() => togglePaymentSelection(payment.id)}
                        aria-label={`Selecionar parcela ${formatMonth(payment.referenceMonth)}`}
                      />
                    </td>
                    <td>{formatMonth(payment.referenceMonth)}</td>
                    <td>{formatDate(payment.dueDate)}</td>
                    <td>R$ {Number(payment.value ?? 0).toFixed(2)}</td>
                    <td>R$ {Number(payment.paidValue ?? 0).toFixed(2)}</td>
                    <td>
                      {payment.paymentMethod
                        ? PMLabels[payment.paymentMethod]
                        : '-'}
                    </td>
                    <td>{formatDate(payment.paymentDate || '')}</td>
                    <td>
                      <StatusBadge $color={getStatusColor(payment.status)} $useThemeFallback>
                        {getStatusLabel(payment.status)}
                      </StatusBadge>
                    </td>
                    <td>
                      <ActionsCell>
                        {canManagePayments && (
                        <PaymentsMenuWrap>
                          <PaymentsMenuButton
                            type="button"
                            onClick={() => setPaymentsMenuOpenId(prev => (prev === payment.id ? null : payment.id))}
                            title="Ações"
                            aria-expanded={paymentsMenuOpenId === payment.id}
                          >
                            <MdMoreVert size={20} />
                          </PaymentsMenuButton>
                          {paymentsMenuOpenId === payment.id && (
                            <PaymentsMenuDropdown onClick={e => e.stopPropagation()}>
                              <PaymentsMenuItem
                                type="button"
                                onClick={() => {
                                  setPaymentsMenuOpenId(null);
                                  setConfigFinePayment(payment);
                                }}
                              >
                                <MdPercent size={18} /> Multa/juros
                              </PaymentsMenuItem>
                              {payment.asaasPaymentId && (
                                <PaymentsMenuItem
                                  type="button"
                                  $variant="primary"
                                  onClick={() => openPixModal(payment)}
                                >
                                  <FaPix size={18} /> Link PIX / QR Code
                                </PaymentsMenuItem>
                              )}
                              {!payment.asaasPaymentId && (payment.status === 'pending' || payment.status === 'PENDING') && (
                                <PaymentsMenuItem
                                  type="button"
                                  $variant="primary"
                                  onClick={() => {
                                    setPaymentsMenuOpenId(null);
                                    setChargeModalAvailablePayments([payment]);
                                    setShowGenerateChargeModal(true);
                                  }}
                                >
                                  <MdDescription size={18} /> Gerar cobrança (boleto/PIX)
                                </PaymentsMenuItem>
                              )}
                              {canEditOrCancelCharge(payment) && (
                                <>
                                  <PaymentsMenuItem
                                    type="button"
                                    $variant="primary"
                                    onClick={() => {
                                      setPaymentsMenuOpenId(null);
                                      setEditingChargePayment(payment);
                                    }}
                                  >
                                    <MdEdit size={18} /> Editar cobrança
                                  </PaymentsMenuItem>
                                  <PaymentsMenuItem
                                    type="button"
                                    $variant="danger"
                                    onClick={() => {
                                      setPaymentsMenuOpenId(null);
                                      setConfirmIrreversible({ type: 'cancelCharge', paymentId: payment.id });
                                    }}
                                  >
                                    <MdCancel size={18} /> Excluir cobrança
                                  </PaymentsMenuItem>
                                </>
                              )}
                              {payment.status !== PaymentStatus.PAID && (
                                <PaymentsMenuItem
                                  type="button"
                                  $variant="success"
                                  onClick={() => {
                                    setPaymentsMenuOpenId(null);
                                    setConfirmIrreversible({ type: 'markAsPaid', payment });
                                  }}
                                  disabled={processingPayments.has(payment.id)}
                                >
                                  {processingPayments.has(payment.id) ? (
                                    <> <LoadingSpinner /> Processando... </>
                                  ) : (
                                    <> <MdCheck size={18} /> Marcar como Pago </>
                                  )}
                                </PaymentsMenuItem>
                              )}
                            </PaymentsMenuDropdown>
                          )}
                        </PaymentsMenuWrap>
                        )}
                      </ActionsCell>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9}>
                    <EmptyTableMessage>
                      Nenhum pagamento encontrado
                    </EmptyTableMessage>
                  </td>
                </tr>
              )}
            </tbody>
          </PaymentsTable>
        </TableWrapper>
        {paymentsPagination.totalPages > 1 && (
          <PaginationWrap>
            <PaginationButton
              type="button"
              disabled={paymentsPagination.page <= 1}
              onClick={() => loadPayments(paymentsPagination.page - 1)}
            >
              Anterior
            </PaginationButton>
            <span>
              Página {paymentsPagination.page} de {paymentsPagination.totalPages} ({paymentsPagination.total} itens)
            </span>
            <PaginationButton
              type="button"
              disabled={paymentsPagination.page >= paymentsPagination.totalPages}
              onClick={() => loadPayments(paymentsPagination.page + 1)}
            >
              Próxima
            </PaginationButton>
          </PaginationWrap>
        )}
        </Card>

        {showAddPaymentModal && rental && (
          <AddPaymentModal
            rental={rental}
            onClose={() => setShowAddPaymentModal(false)}
            isSubmitting={addingPayment}
            onSubmit={handleAddPayment}
          />
        )}

        {showGenerateChargeModal && (
          <GenerateChargeModal
            onClose={() => setShowGenerateChargeModal(false)}
            isSubmitting={generatingCharges}
            availablePayments={chargeModalAvailablePayments}
            onSubmit={async ({ dueDate, billingType, paymentId: selectedPaymentId }) => {
              if (!id) return;
              setGeneratingCharges(true);
              try {
                await rentalPaymentsService.generateCharge(id, {
                  dueDate,
                  billingType,
                  paymentId: selectedPaymentId,
                });
                toast.success('Cobrança gerada com sucesso');
                loadRental();
                loadPayments(paymentsPagination.page);
                setShowGenerateChargeModal(false);
              } catch (e: any) {
                const status = e?.response?.status;
                const msg = e?.response?.data?.message;
                if (status === 404) {
                  toast.error(msg || 'Locação não encontrada. Verifique se a empresa correta está selecionada.');
                } else if (status === 400 && msg) {
                  toast.error(msg);
                } else {
                  toast.error('Erro ao gerar cobrança. Tente novamente.');
                }
              } finally {
                setGeneratingCharges(false);
              }
            }}
          />
        )}

        {editingChargePayment && (
          <EditChargeModal
            payment={editingChargePayment}
            onClose={() => setEditingChargePayment(null)}
            onSubmit={handleEditChargeSubmit}
            isSubmitting={updatingCharge}
          />
        )}

        {configFinePayment && (
          <ConfigFineModal
            payment={configFinePayment}
            onClose={() => setConfigFinePayment(null)}
            onSubmit={handleConfigFineSubmit}
          />
        )}

        {confirmIrreversible && (
          <ModalOverlay onClick={() => setConfirmIrreversible(null)}>
            <ConfirmIrreversibleBox onClick={e => e.stopPropagation()}>
              <ConfirmIrreversibleTitle>
                {confirmIrreversible.type === 'cancelCharge' && 'Excluir cobrança'}
                {confirmIrreversible.type === 'markAsPaid' && 'Marcar como pago'}
                {confirmIrreversible.type === 'batchCancel' &&
                  `Excluir ${selectedPaymentIds.size} cobrança(s)`}
                {confirmIrreversible.type === 'batchMarkPaid' &&
                  `Marcar ${selectedPaymentIds.size} cobrança(s) como pago`}
              </ConfirmIrreversibleTitle>
              <ConfirmIrreversibleMessage>
                {confirmIrreversible.type === 'cancelCharge' &&
                  'A cobrança será excluída no gateway de pagamento e não poderá ser utilizada para pagamento.'}
                {confirmIrreversible.type === 'markAsPaid' &&
                  'Esta parcela será marcada como paga. O valor e a data de pagamento serão registrados.'}
                {confirmIrreversible.type === 'batchCancel' &&
                  'As cobranças selecionadas que possuem boleto/PIX gerado serão excluídas no gateway. Parcelas sem cobrança gerada serão ignoradas.'}
                {confirmIrreversible.type === 'batchMarkPaid' &&
                  'As parcelas selecionadas serão marcadas como pagas com a data de hoje.'}
              </ConfirmIrreversibleMessage>
              <ConfirmIrreversibleWarning>
                Esta ação não pode ser desfeita. Não será possível voltar atrás.
              </ConfirmIrreversibleWarning>
              <ButtonGroup style={{ marginTop: 24, justifyContent: 'flex-end', gap: '0.75rem' }}>
                <ModalButtonSecondary type="button" onClick={() => setConfirmIrreversible(null)}>
                  <MdClose size={18} /> Cancelar
                </ModalButtonSecondary>
                <ConfirmIrreversibleButton
                  type="button"
                  $variant={
                    confirmIrreversible.type === 'markAsPaid' ||
                    confirmIrreversible.type === 'batchMarkPaid'
                      ? 'success'
                      : 'danger'
                  }
                  onClick={onConfirmIrreversible}
                  disabled={
                    (confirmIrreversible.type === 'batchCancel' ||
                      confirmIrreversible.type === 'batchMarkPaid') &&
                    batchProcessing
                  }
                >
                  {(confirmIrreversible.type === 'batchCancel' ||
                    confirmIrreversible.type === 'batchMarkPaid') &&
                  batchProcessing
                    ? 'Processando...'
                    : confirmIrreversible.type === 'cancelCharge' || confirmIrreversible.type === 'batchCancel'
                      ? 'Excluir'
                      : 'Confirmar'}
                </ConfirmIrreversibleButton>
              </ButtonGroup>
            </ConfirmIrreversibleBox>
          </ModalOverlay>
        )}

        {pixModalPayment && (
          <ModalOverlay onClick={() => setPixModalPayment(null)}>
            <ModalBox
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: 440 }}
            >
              <ModalTitle>
                <FaPix size={22} style={{ marginRight: 8 }} />
                Link e QR Code PIX — {formatMonth(pixModalPayment.referenceMonth)}
              </ModalTitle>
              {loadingPixModal ? (
                <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                  <LoadingSpinner /> Carregando...
                </div>
              ) : (
                <PixModalContent>
                  {(pixModalData?.invoiceUrl || pixModalPayment.asaasInvoiceUrl) && (
                    <PixModalSection>
                      <PixSectionLabel>
                        <MdLink size={18} /> Link de pagamento
                      </PixSectionLabel>
                      <PixLinkUrl>
                        {pixModalData?.invoiceUrl || pixModalPayment.asaasInvoiceUrl}
                      </PixLinkUrl>
                      <ButtonGroup style={{ marginTop: 8, flexWrap: 'wrap' }}>
                        <ModalButton
                          type="button"
                          onClick={() =>
                            copyToClipboard(
                              pixModalData?.invoiceUrl || pixModalPayment.asaasInvoiceUrl || '',
                              'Link'
                            )
                          }
                        >
                          Copiar link
                        </ModalButton>
                        <ModalButtonSecondary
                          type="button"
                          onClick={() =>
                            window.open(
                              pixModalData?.invoiceUrl || pixModalPayment.asaasInvoiceUrl || '',
                              '_blank'
                            )
                          }
                        >
                          <MdOpenInNew size={18} /> Abrir link
                        </ModalButtonSecondary>
                      </ButtonGroup>
                    </PixModalSection>
                  )}
                  {(pixModalData?.pixQrCodeBase64 || pixModalPayment.asaasPixQrCode) && (
                    <PixModalSection>
                      <PixSectionLabel>
                        <MdQrCode2 size={18} /> QR Code (compartilhe a imagem)
                      </PixSectionLabel>
                      <PixQrWrap>
                        <img
                          src={`data:image/png;base64,${pixModalData?.pixQrCodeBase64 || pixModalPayment.asaasPixQrCode}`}
                          alt="QR Code PIX"
                          style={{ width: 200, height: 200, borderRadius: 8, border: '2px solid var(--color-border)' }}
                        />
                        <ModalButton
                          type="button"
                          onClick={() =>
                            downloadQrCode(
                              pixModalData?.pixQrCodeBase64 || pixModalPayment.asaasPixQrCode || '',
                              pixModalPayment.referenceMonth
                            )
                          }
                        >
                          Baixar QR Code
                        </ModalButton>
                      </PixQrWrap>
                    </PixModalSection>
                  )}
                  {(pixModalData?.pixCopyPaste || pixModalPayment.asaasPixCopyPaste) && (
                    <PixModalSection>
                      <PixSectionLabel>Código PIX (copia e cola)</PixSectionLabel>
                      <PixCodeBlock>
                        {pixModalData?.pixCopyPaste || pixModalPayment.asaasPixCopyPaste}
                      </PixCodeBlock>
                      <ModalButton
                        type="button"
                        style={{ marginTop: 8 }}
                        onClick={() =>
                          copyToClipboard(
                            pixModalData?.pixCopyPaste || pixModalPayment.asaasPixCopyPaste || '',
                            'Código PIX'
                          )
                        }
                      >
                        Copiar código
                      </ModalButton>
                    </PixModalSection>
                  )}
                  {!loadingPixModal &&
                    !pixModalData?.invoiceUrl &&
                    !pixModalData?.pixQrCodeBase64 &&
                    !pixModalData?.pixCopyPaste &&
                    !pixModalPayment.asaasInvoiceUrl &&
                    !pixModalPayment.asaasPixQrCode &&
                    !pixModalPayment.asaasPixCopyPaste && (
                      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                        Nenhum dado PIX disponível para esta cobrança.
                      </p>
                    )}
                </PixModalContent>
              )}
              <ButtonGroup style={{ marginTop: 16, justifyContent: 'flex-end' }}>
                <ModalButtonSecondary type="button" onClick={() => setPixModalPayment(null)}>
                  <MdClose size={18} /> Fechar
                </ModalButtonSecondary>
              </ButtonGroup>
            </ModalBox>
          </ModalOverlay>
        )}

        {/* Seção de Seguros */}
        <RentalInsuranceSection rentalId={id!} />
      </Container>
    </Layout>
  );
};

// Styled Components
const Container = styled.div`
  padding: 20px 24px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  min-height: 100%;
  box-sizing: border-box;

  @media (min-width: 768px) {
    padding: 24px 28px;
  }

  @media (min-width: 1024px) {
    padding: 24px 32px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    margin-bottom: 1rem;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.hover};
  }

  @media (max-width: 480px) {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
`;

const Card = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: ${props => props.theme.colors.shadow || '0 1px 3px rgba(0,0,0,0.08)'};
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 1.25rem;
    margin-bottom: 1.25rem;
  }

  @media (max-width: 480px) {
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 0.5rem;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const CardTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

const InfoItem = styled.div``;

const InfoLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 0.25rem;
`;

const InfoValue = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const InfoValueHighlight = styled(InfoValue)`
  font-size: 1.25rem;
  color: ${props => props.theme.colors.success};
`;

const PaymentsActionsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
`;

const PaymentsFilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: var(--color-background-secondary, #f0f4f8);
  border-radius: 0.5rem;
  font-size: 0.875rem;
`;

const FilterLabel = styled.span`
  color: var(--color-text-secondary);
  font-weight: 500;
  white-space: nowrap;
`;

const FilterSelect = styled.select`
  min-width: 120px;
  padding: 0.35rem 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.8125rem;
  cursor: pointer;
`;

const FilterInput = styled.input`
  padding: 0.35rem 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.8125rem;
  &[type='month'] {
    min-width: 140px;
  }
`;

const FilterDatePickerWrap = styled.div`
  min-width: 140px;
  max-width: 160px;
  .ant-picker {
    height: 36px !important;
    border-radius: 0.375rem;
    font-size: 0.8125rem;
  }
  .ant-picker-input > input {
    font-size: 0.8125rem !important;
  }
`;

const FilterClearButton = styled.button`
  padding: 0.35rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
  cursor: pointer;
  margin-left: auto;
  &:hover {
    background: var(--color-background-secondary);
    color: var(--color-text);
  }
`;

const BatchBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
  background: ${p => p.theme.colors.cardBackground};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 12px;
  font-size: 0.875rem;
  box-shadow: 0 2px 8px ${p => (p.theme.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.06)')};
`;

const BatchBarLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${p => p.theme.colors.text};
  font-weight: 500;
`;

const BatchBarCount = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 0.35rem;
  background: ${p => p.theme.colors.primary};
  color: #fff;
  font-weight: 700;
  font-size: 0.875rem;
  border-radius: 8px;
`;

const BatchBarActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
`;

const BatchBarButton = styled.button<{ $variant?: 'default' | 'danger' | 'success' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s ease;
  border: none;

  ${p => {
    if (p.$variant === 'danger') {
      return `
        background: ${p.theme.colors.error};
        color: #fff;
        &:hover:not(:disabled) {
          opacity: 0.92;
          box-shadow: 0 4px 12px ${p.theme.colors.error}40;
        }
      `;
    }
    if (p.$variant === 'success') {
      return `
        background: ${p.theme.colors.success};
        color: #fff;
        &:hover:not(:disabled) {
          opacity: 0.92;
          box-shadow: 0 4px 12px ${p.theme.colors.success}40;
        }
      `;
    }
    return `
      background: ${p.theme.colors.surface};
      color: ${p.theme.colors.text};
      border: 1px solid ${p.theme.colors.border};
      &:hover:not(:disabled) {
        background: ${p.theme.colors.backgroundSecondary};
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      }
    `;
  }}

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
`;

const GenerateChargesButton = styled.button<{ $variant?: 'secondary' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${p => (p.$variant === 'secondary' ? p.theme.colors.backgroundSecondary : p.theme.colors.primary)};
  color: ${p => (p.$variant === 'secondary' ? p.theme.colors.text : '#fff')};
  border: ${p => (p.$variant === 'secondary' ? `1px solid ${p.theme.colors.border}` : 'none')};
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    flex: 1;
    min-width: 140px;
    justify-content: center;
  }
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin: 0 -0.25rem;
`;

const PaymentsTable = styled.table`
  width: 100%;
  min-width: 640px;
  border-collapse: collapse;

  th,
  td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid ${props => props.theme.colors.border};
  }

  th {
    background: ${props => props.theme.colors.backgroundSecondary};
    color: ${props => props.theme.colors.text};
    font-weight: 600;
    font-size: 0.8125rem;
  }

  td {
    color: ${props => props.theme.colors.text};
    font-size: 0.875rem;
  }

  @media (max-width: 768px) {
    th, td {
      padding: 0.5rem 0.375rem;
      font-size: 0.8125rem;
    }
  }
`;

const EmptyTableMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${props => props.theme.colors.textSecondary};
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

const PaginationButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  font-size: 0.875rem;

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.backgroundSecondary};
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusBadge = styled.span<{
  $color?: string;
  $useThemeFallback?: boolean;
  $success?: boolean;
}>`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  ${props => {
    if (props.$success === true) {
      return `
        background: ${props.theme.colors.success}20;
        color: ${props.theme.colors.success};
      `;
    }
    if (props.$useThemeFallback && !props.$color) {
      return `
        background: ${props.theme.colors.backgroundTertiary || props.theme.colors.backgroundSecondary};
        color: ${props.theme.colors.textSecondary};
      `;
    }
    const color = props.$color || props.theme.colors.textSecondary;
    return `
      background: ${color}20;
      color: ${color};
    `;
  }}
`;

const SmallButton = styled.button<{ $isProcessing?: boolean; $danger?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.6rem;
  background: ${props =>
    props.$isProcessing
      ? props.theme.colors.textSecondary
      : props.$danger
        ? props.theme.colors.error
        : props.theme.colors.success};
  color: white;
  border: none;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  cursor: ${props => (props.$isProcessing ? 'not-allowed' : 'pointer')};
  transition: all 0.2s;
  opacity: ${props => (props.$isProcessing ? 0.7 : 1)};
  white-space: nowrap;

  &:hover:not(:disabled) {
    opacity: ${props => (props.$isProcessing ? 0.7 : 0.9)};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  @media (max-width: 768px) {
    padding: 0.3rem 0.5rem;
    font-size: 0.7rem;
  }
`;

const ActionsCell = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  align-items: center;
`;

const PaymentsMenuWrap = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
`;

const PaymentsMenuButton = styled.button`
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

const PaymentsMenuDropdown = styled.div`
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

const PaymentsMenuItem = styled.button<{ $variant?: 'primary' | 'danger' | 'success' }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  font-size: 0.875rem;
  color: ${p => {
    if (p.$variant === 'danger') return p.theme.colors.error || p.theme.colors.danger || '#dc2626';
    if (p.$variant === 'success') return p.theme.colors.success || '#16a34a';
    if (p.$variant === 'primary') return p.theme.colors.primary || '#2563eb';
    return p.theme.colors.text;
  }};
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: ${p => p.theme.colors.backgroundSecondary || p.theme.colors.hover};
  }
  &:not(:last-child) {
    border-bottom: 1px solid ${p => p.theme.colors.border};
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalBox = styled.div`
  background: ${p => p.theme.colors.cardBackground};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 0.75rem;
  padding: 1.5rem;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const ModalBoxWide = styled(ModalBox)`
  max-width: 560px;
`;

const ModalTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  color: ${p => p.theme.colors.text};
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;

  &:last-of-type {
    margin-bottom: 1.25rem;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 0.8125rem;
  font-weight: 500;
  color: ${p => p.theme.colors.textSecondary};
  margin-bottom: 0.35rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 0.5rem;
  font-size: 1rem;
  color: ${p => p.theme.colors.text};
  background: ${p => p.theme.colors.backgroundSecondary || p.theme.colors.cardBackground};
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${p => p.theme.colors.primary};
  }
`;

const PercentInputWrap = styled.div`
  display: flex;
  align-items: center;
  max-width: 140px;
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 0.5rem;
  background: ${p => p.theme.colors.backgroundSecondary || p.theme.colors.cardBackground};
  transition: border-color 0.2s;

  &:focus-within {
    border-color: ${p => p.theme.colors.primary};
  }

  input {
    flex: 1;
    min-width: 0;
    border: none;
    border-radius: 0.5rem 0 0 0.5rem;
    padding: 0.5rem 0.5rem 0.5rem 0.75rem;
    background: transparent;
    font-size: 1rem;
    color: ${p => p.theme.colors.text};
  }
`;

const PercentSuffix = styled.span`
  padding: 0.5rem 0.75rem 0.5rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${p => p.theme.colors.textSecondary};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
`;

const ModalButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${p => p.theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PixModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const PixModalSection = styled.div`
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-border);
  &:last-of-type {
    border-bottom: none;
  }
`;

const PixSectionLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--color-text);
  margin-bottom: 0.5rem;
`;

const PixLinkUrl = styled.div`
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  word-break: break-all;
`;

const PixQrWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
`;

const PixCodeBlock = styled.div`
  padding: 0.75rem;
  background: var(--color-background-secondary);
  border-radius: 0.5rem;
  font-family: monospace;
  font-size: 0.75rem;
  word-break: break-all;
  color: var(--color-text);
`;

const ConfirmIrreversibleBox = styled(ModalBox)`
  max-width: 420px;
`;

const ConfirmIrreversibleTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 1rem 0;
`;

const ConfirmIrreversibleMessage = styled.p`
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0 0 1rem 0;
`;

const ConfirmIrreversibleWarning = styled.p`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-error, #dc2626);
  background: ${p => `${p.theme?.colors?.error ?? '#dc2626'}18`};
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid ${p => `${p.theme?.colors?.error ?? '#dc2626'}40`};
  margin: 0;
`;

const ConfirmIrreversibleButton = styled.button<{ $variant?: 'danger' | 'success' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9375rem;
  cursor: pointer;
  background: ${p =>
    p.$variant === 'success'
      ? p.theme.colors.success || '#16a34a'
      : p.theme.colors.error || '#dc2626'};
  color: #fff;
  &:hover:not(:disabled) {
    opacity: 0.9;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ModalButtonSecondary = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${p => p.theme.colors.backgroundSecondary || '#e5e7eb'};
  color: ${p => p.theme.colors.text};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

const LoadingSpinner = styled.div`
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 3rem 1rem;
  color: ${props => props.theme.colors.error};
  min-height: 200px;
  align-items: center;
`;

const StatusCard = styled.div`
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: ${props => props.theme.colors.shadow || '0 1px 3px rgba(0,0,0,0.08)'};

  @media (max-width: 768px) {
    gap: 1.25rem;
    padding: 1.25rem;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
`;

const StatusInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const StatusLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  font-weight: 500;
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 1.5rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 480px) {
    gap: 1rem;
    margin-bottom: 1rem;
  }
`;

const PropertyContainer = styled.div`
  display: flex;
  gap: 1.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const PropertyImage = styled.img`
  width: 200px;
  height: 150px;
  object-fit: cover;
  border-radius: 0.5rem;
  border: 1px solid ${props => props.theme.colors.border};
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    height: 200px;
  }

  @media (max-width: 480px) {
    height: 180px;
  }
`;

const PropertyInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ObservationsText = styled.div`
  color: ${props => props.theme.colors.text};
  line-height: 1.6;
  white-space: pre-wrap;
  font-size: 0.9375rem;
`;

const HistoryCount = styled.span`
  font-size: 0.8125rem;
  font-weight: 400;
  color: var(--color-text-secondary);
  margin-left: 0.5rem;
`;

const SectionPagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const SectionPaginationButton = styled.button`
  padding: 0.5rem 1rem;
  background: var(--color-surface, #f3f4f6);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  &:hover:not(:disabled) {
    background: var(--color-hover, #e5e7eb);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SectionPaginationInfo = styled.span`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
`;

const HistoryPlaceholder = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const HistoryItem = styled.div`
  padding: 0.75rem;
  background: var(--color-surface);
  border-radius: 8px;
  border-left: 3px solid var(--color-primary);
`;

const HistoryItemMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
`;

const HistoryItemDate = styled.span`
  font-size: 0.75rem;
  color: var(--color-text-secondary);
`;

const HistoryItemUser = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text);
`;

const HistoryItemAction = styled.div`
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--color-text);
`;

const HistoryItemDesc = styled.div`
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  margin-top: 0.25rem;
`;

const CommentForm = styled.div`
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const CommentTextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.9375rem;
  resize: vertical;
  min-height: 80px;
  background: var(--color-surface);
  color: var(--color-text);
  &::placeholder {
    color: var(--color-text-secondary);
  }
`;

const CommentSubmitButton = styled.button`
  align-self: flex-start;
  padding: 0.5rem 1rem;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  &:hover:not(:disabled) {
    opacity: 0.9;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CommentsPlaceholder = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
`;

const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const CommentItem = styled.div`
  padding: 0.75rem;
  background: var(--color-surface);
  border-radius: 8px;
  border: 1px solid var(--color-border);
`;

const CommentItemMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
`;

const CommentItemUser = styled.span`
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--color-text);
`;

const CommentItemDate = styled.span`
  font-size: 0.75rem;
  color: var(--color-text-secondary);
`;

const CommentItemContent = styled.div`
  font-size: 0.9375rem;
  color: var(--color-text);
  white-space: pre-wrap;
`;

const LinkToChecklist = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  font-weight: 500;
  &:hover {
    text-decoration: underline;
  }
`;

const DocList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const DocItem = styled.li``;

const DocLink = styled.a`
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

export default RentalDetailsPage;
