import React, { useState, useEffect, useCallback } from 'react';
import {
  MdClose,
  MdSend,
  MdPerson,
  MdEmail,
  MdAdd,
  MdDelete,
  MdLink,
  MdCheckCircle,
  MdRefresh,
  MdMarkEmailRead,
} from 'react-icons/md';
import { showSuccess, showError, showInfo } from '../../utils/notifications';
import {
  listarAssinaturasFichaVenda,
  enviarFichaVendaParaAssinatura,
  obterLinkAssinaturaFichaVenda,
  buscarFichaVendaPorId,
  type SaleFormSignature,
  type AssinaturaSignerInput,
  type SendSaleFormSignaturesPayload,
} from '../../services/fichaVendaApi';
import styled, { keyframes } from 'styled-components';

const colors = {
  primary: '#A63126',
  primaryHover: '#8B251C',
  primaryLight: 'rgba(166, 49, 38, 0.08)',
  danger: '#dc3545',
  dangerHover: '#c82333',
  success: '#28a745',
  successBg: '#d4edda',
  warning: '#ffc107',
  warningBg: '#fff3cd',
  rejected: '#dc3545',
  rejectedBg: '#f8d7da',
  pending: '#6c757d',
  pendingBg: '#e9ecef',
  border: '#dee2e6',
  text: '#212529',
  textSecondary: '#6c757d',
  bg: '#fff',
  bgSecondary: '#f8f9fa',
};

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: ${p => (p.$isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 16px;
  animation: ${fadeIn} 0.2s ease-out;
  overflow-y: auto;
`;

const Container = styled.div`
  background: ${colors.bg};
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-width: 560px;
  width: 100%;
  max-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  animation: ${slideUp} 0.25s ease-out;
`;

const Header = styled.div`
  padding: 24px 24px 20px;
  border-bottom: 1px solid ${colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-shrink: 0;
`;

const Title = styled.h2`
  font-size: 1.375rem;
  font-weight: 700;
  color: ${colors.text};
  margin: 0;
`;

const CloseBtn = styled.button`
  width: 40px;
  height: 40px;
  min-width: 40px;
  border: none;
  background: ${colors.bgSecondary};
  color: ${colors.textSecondary};
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: ${colors.border};
    color: ${colors.text};
  }
`;

const Body = styled.div`
  padding: 24px;
  flex: 1;
  overflow-y: auto;
`;

const Footer = styled.div`
  padding: 20px 24px 24px;
  border-top: 1px solid ${colors.border};
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  flex-wrap: wrap;
  flex-shrink: 0;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${colors.text};
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  font-size: 1rem;
  border: 1px solid ${colors.border};
  border-radius: 12px;
  background: ${colors.bg};
  color: ${colors.text};
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px ${colors.primaryLight};
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  font-size: 1rem;
  border: 1px solid ${colors.border};
  border-radius: 12px;
  background: ${colors.bg};
  color: ${colors.text};
  resize: vertical;
  min-height: 80px;
  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }
`;

const Select = styled.select`
  padding: 12px 16px;
  font-size: 0.9375rem;
  border: 1px solid ${colors.border};
  border-radius: 12px;
  background: ${colors.bg};
  color: ${colors.text};
  min-height: 44px;
  cursor: pointer;
`;

const CheckboxRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px 24px;
  margin-bottom: 20px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 0.9375rem;
  color: ${colors.text};
  input {
    width: 20px;
    height: 20px;
    accent-color: ${colors.primary};
  }
`;

const HelperText = styled.p`
  font-size: 0.8125rem;
  color: ${colors.textSecondary};
  margin: 6px 0 0 0;
  line-height: 1.45;
`;

const SignerRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-end;
  margin-bottom: 12px;
  flex-wrap: wrap;
`;

const SignerFields = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const BtnPrimary = styled.button`
  padding: 12px 20px;
  font-size: 0.9375rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  background: ${colors.primary};
  color: white;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  &:hover:not(:disabled) {
    background: ${colors.primaryHover};
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const BtnSecondary = styled(BtnPrimary)`
  background: ${colors.bgSecondary};
  color: ${colors.text};
  &:hover:not(:disabled) {
    background: ${colors.border};
  }
`;

const BtnDanger = styled(BtnPrimary)`
  background: ${colors.danger};
  &:hover:not(:disabled) {
    background: ${colors.dangerHover};
  }
`;

const BtnAdd = styled(BtnSecondary)`
  margin-top: 8px;
  width: 100%;
  border: 2px dashed ${colors.border};
  &:hover {
    border-color: ${colors.primary};
    color: ${colors.primary};
  }
`;

const SignaturesList = styled.div`
  margin-top: 8px;
`;

const ListTitle = styled.p`
  font-size: 1rem;
  font-weight: 600;
  color: ${colors.text};
  margin: 0 0 8px 0;
`;

const ListHelper = styled.p`
  font-size: 0.8125rem;
  color: ${colors.textSecondary};
  margin: 0 0 16px 0;
  line-height: 1.5;
`;

const SignatureCard = styled.div`
  padding: 16px 18px;
  background: ${colors.bgSecondary};
  border: 1px solid ${colors.border};
  border-radius: 14px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  &:last-child {
    margin-bottom: 0;
  }
`;

const SignatureMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
`;

const SignatureName = styled.span`
  font-weight: 600;
  color: ${colors.text};
  font-size: 0.9375rem;
`;

const SignatureEmail = styled.span`
  font-size: 0.8125rem;
  color: ${colors.textSecondary};
`;

const StatusBadge = styled.span<{ $status: string }>`
  font-size: 0.6875rem;
  font-weight: 700;
  padding: 5px 10px;
  border-radius: 999px;
  text-transform: uppercase;
  background: ${p =>
    p.$status === 'signed'
      ? colors.successBg
      : p.$status === 'rejected'
        ? colors.rejectedBg
        : p.$status === 'viewed'
          ? colors.warningBg
          : colors.pendingBg};
  color: ${p =>
    p.$status === 'signed'
      ? '#155724'
      : p.$status === 'rejected'
        ? '#721c24'
        : p.$status === 'viewed'
          ? '#856404'
          : '#495057'};
`;

const SignatureDate = styled.span`
  font-size: 0.75rem;
  color: ${colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const BtnLink = styled.button`
  padding: 10px 16px;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  background: ${colors.primary};
  color: white;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  &:hover:not(:disabled) {
    background: ${colors.primaryHover};
  }
  &:disabled {
    opacity: 0.7;
    cursor: wait;
  }
`;

const EmailSentBadge = styled.span`
  padding: 8px 14px;
  font-size: 0.8125rem;
  font-weight: 600;
  border-radius: 10px;
  background: #e8f4fd;
  color: #1565c0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  border: 1px solid #90caf9;
`;

const LoadingWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: ${colors.textSecondary};
  font-size: 0.9375rem;
`;

const FixedSignersBlock = styled.div`
  background: #f0f4ff;
  border: 1.5px solid #b3c6f7;
  border-radius: 14px;
  padding: 14px 18px;
  margin-bottom: 20px;
`;

const FixedSignersTitle = styled.p`
  font-size: 0.8125rem;
  font-weight: 700;
  color: #1a3a8f;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  gap: 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const FixedSignerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #d0dcf8;
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const FixedSignerName = styled.span`
  font-weight: 600;
  font-size: 0.9375rem;
  color: #1a3a8f;
  flex: 1;
`;

const FixedSignerEmail = styled.span`
  font-size: 0.8125rem;
  color: #4a6ab5;
`;

const FixedBadge = styled.span`
  font-size: 0.6875rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 999px;
  background: #1a3a8f;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  flex-shrink: 0;
`;

export interface FichaVendaAssinaturasModalProps {
  isOpen: boolean;
  onClose: () => void;
  fichaId: string;
  formNumber: string;
  gestorCpf: string;
  onSent?: () => void;
}

const ACTIONS: { value: AssinaturaSignerInput['action']; label: string }[] = [
  { value: 'SIGN', label: 'Assinar' },
  { value: 'APPROVE', label: 'Aprovar' },
  { value: 'RECOGNIZE', label: 'Reconhecer' },
  { value: 'SIGN_AS_A_WITNESS', label: 'Testemunhar' },
];

export const FichaVendaAssinaturasModal: React.FC<
  FichaVendaAssinaturasModalProps
> = ({ isOpen, onClose, fichaId, formNumber, gestorCpf, onSent }) => {
  const [signatures, setSignatures] = useState<SaleFormSignature[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadingLinkId, setLoadingLinkId] = useState<string | null>(null);

  const [documentName, setDocumentName] = useState('');
  const [documentNameTouched, setDocumentNameTouched] = useState(false);
  const [documentMessage, setDocumentMessage] = useState('');
  const [refusable, setRefusable] = useState(true);
  const [sortable, setSortable] = useState(true);
  const [signers, setSigners] = useState<
    Array<{
      type: 'email' | 'name';
      email?: string;
      name?: string;
      action: AssinaturaSignerInput['action'];
    }>
  >([{ type: 'email', email: '', action: 'SIGN' }]);

  const loadSignatures = useCallback(async () => {
    if (!fichaId || !isOpen || !gestorCpf) return;
    setLoading(true);
    try {
      const list = await listarAssinaturasFichaVenda(fichaId, gestorCpf);
      setSignatures(list);
      if (list.length === 0) {
        setDocumentName(prev =>
          prev.trim() ? prev : `Ficha de Venda ${formNumber}`
        );
        setDocumentMessage(prev =>
          prev.trim()
            ? prev
            : 'Por favor, assine a ficha de venda conforme os dados informados.'
        );
        try {
          const data = await buscarFichaVendaPorId(fichaId);
          const signersFromFicha: Array<{
            type: 'email' | 'name';
            email?: string;
            name?: string;
            action: AssinaturaSignerInput['action'];
          }> = [];
          if (data?.comprador?.email?.trim()) {
            signersFromFicha.push({
              type: 'email',
              email: data.comprador.email.trim(),
              name: data.comprador.nome?.trim(),
              action: 'SIGN',
            });
          }
          if (data?.compradorConjuge?.email?.trim()) {
            signersFromFicha.push({
              type: 'email',
              email: data.compradorConjuge.email.trim(),
              name: data.compradorConjuge.nome?.trim(),
              action: 'SIGN',
            });
          }
          if (data?.vendedor?.email?.trim()) {
            signersFromFicha.push({
              type: 'email',
              email: data.vendedor.email.trim(),
              name: data.vendedor.nome?.trim(),
              action: 'SIGN',
            });
          }
          if (data?.vendedorConjuge?.email?.trim()) {
            signersFromFicha.push({
              type: 'email',
              email: data.vendedorConjuge.email.trim(),
              name: data.vendedorConjuge.nome?.trim(),
              action: 'SIGN',
            });
          }
          if (signersFromFicha.length > 0) {
            setSigners(signersFromFicha);
          }
        } catch {
          // mantém signatário padrão
        }
      }
    } catch (err: any) {
      showError(err?.message || 'Erro ao carregar assinaturas.');
      setSignatures([]);
    } finally {
      setLoading(false);
    }
  }, [fichaId, isOpen, formNumber, gestorCpf]);

  useEffect(() => {
    if (isOpen && fichaId) loadSignatures();
  }, [isOpen, fichaId, loadSignatures]);

  const addSigner = () => {
    setSigners(s => [...s, { type: 'email', email: '', action: 'SIGN' }]);
  };

  const removeSigner = (index: number) => {
    if (signers.length <= 1) return;
    setSigners(s => s.filter((_, i) => i !== index));
  };

  const updateSigner = (index: number, field: string, value: string) => {
    setSigners(s => {
      const next = [...s];
      if (field === 'type') {
        next[index] = {
          ...next[index],
          type: value as 'email' | 'name',
          email: undefined,
          name: undefined,
        };
      } else if (field === 'email') next[index] = { ...next[index], email: value };
      else if (field === 'name') next[index] = { ...next[index], name: value };
      else if (field === 'action')
        next[index] = {
          ...next[index],
          action: value as AssinaturaSignerInput['action'],
        };
      return next;
    });
  };

  const cpfDigits = String(gestorCpf ?? '').replace(/\D/g, '');
  const hasValidGestorCpf = cpfDigits.length === 11;

  const handleSend = async () => {
    if (!hasValidGestorCpf) {
      showError('CPF do gestor é obrigatório para enviar a ficha para assinatura.');
      return;
    }
    const nameTrim = documentName.trim();
    setDocumentNameTouched(true);
    if (!nameTrim) {
      showError('Nome do documento é obrigatório.');
      return;
    }
    const signersPayload: AssinaturaSignerInput[] = signers.flatMap(s => {
      if (s.type === 'email') {
        const email = (s.email || '').trim();
        if (!email) return [];
        return [{ email, action: s.action }];
      }
      const name = (s.name || '').trim();
      if (!name) return [];
      return [{ name, action: s.action }];
    });
    if (signersPayload.length === 0) {
      showError('Adicione ao menos um signatário (email ou nome).');
      return;
    }
    const payload: SendSaleFormSignaturesPayload = {
      document: {
        name: nameTrim,
        message: documentMessage.trim() || undefined,
        refusable,
        sortable,
      },
      signers: signersPayload,
    };
    setSending(true);
    try {
      await enviarFichaVendaParaAssinatura(fichaId, gestorCpf, payload);
      showSuccess('Ficha de venda enviada para assinatura.');
      onSent?.();
      await loadSignatures();
    } catch (err: any) {
      showError(err?.message || 'Erro ao enviar para assinatura.');
    } finally {
      setSending(false);
    }
  };

  const handleCopyLink = async (sig: SaleFormSignature) => {
    if (sig.signatureUrl) {
      await navigator.clipboard.writeText(sig.signatureUrl);
      showSuccess(
        'Link de assinatura copiado. Envie apenas ao signatário correspondente.'
      );
      return;
    }
    setLoadingLinkId(sig.id);
    try {
      const { short_link } = await obterLinkAssinaturaFichaVenda(
        fichaId,
        sig.id,
        gestorCpf
      );
      await navigator.clipboard.writeText(short_link);
      showSuccess(
        'Link de assinatura copiado. Envie apenas ao signatário correspondente.'
      );
    } catch (err: any) {
      showError(err?.message || 'Erro ao obter link.');
    } finally {
      setLoadingLinkId(null);
    }
  };

  const alreadySent = signatures.length > 0;
  const noneSigned =
    signatures.length === 0 ||
    signatures.every(s => s.status !== 'signed');
  const showSendForm =
    !alreadySent || (alreadySent && noneSigned);

  const handleClose = () => {
    if (!alreadySent) {
      showInfo(
        'Você pode reabrir pelo botão "Assinaturas" a qualquer momento para enviar para assinatura.',
        { autoClose: 4000 }
      );
    }
    onClose();
  };

  return (
    <Overlay $isOpen={isOpen} onClick={handleClose}>
      <Container onClick={e => e.stopPropagation()}>
        <Header>
          <Title>Assinaturas – Ficha de Venda {formNumber}</Title>
          <CloseBtn type="button" onClick={handleClose} aria-label="Fechar">
            <MdClose size={22} />
          </CloseBtn>
        </Header>
        <Body>
          {!gestorCpf || gestorCpf.replace(/\D/g, '').length !== 11 ? (
            <div
              style={{
                padding: '20px',
                background: colors.warningBg,
                border: `1px solid ${colors.warning}`,
                borderRadius: '12px',
                marginBottom: '16px',
                fontSize: '0.9375rem',
                color: colors.text,
              }}
            >
              <strong>Login necessário:</strong> para enviar a ficha para assinatura (Autentique) e colocar os e-mails dos signatários, faça login como <strong>gestor</strong> (CPF) no topo da página.
            </div>
          ) : null}
          {loading ? (
            <LoadingWrap>Carregando assinaturas...</LoadingWrap>
          ) : (
            <>
              {alreadySent && (
                <SignaturesList>
                  <FixedSignersBlock style={{ marginBottom: 16 }}>
                    <FixedSignersTitle>
                      🔒 Signatários obrigatórios (fixos)
                    </FixedSignersTitle>
                    <FixedSignerRow>
                      <MdEmail size={18} style={{ color: '#4a6ab5', flexShrink: 0 }} />
                      <FixedSignerName>Jeany Notari Gomes</FixedSignerName>
                      <FixedSignerEmail>jeany_notari@hotmail.com</FixedSignerEmail>
                      <FixedBadge>Assinar</FixedBadge>
                    </FixedSignerRow>
                    <FixedSignerRow>
                      <MdEmail size={18} style={{ color: '#4a6ab5', flexShrink: 0 }} />
                      <FixedSignerName>Imobiliária União</FixedSignerName>
                      <FixedSignerEmail>renataouros@uniaoImobiliaria99.onmicrosoft.com</FixedSignerEmail>
                      <FixedBadge>Assinar</FixedBadge>
                    </FixedSignerRow>
                  </FixedSignersBlock>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                      marginBottom: '8px',
                    }}
                  >
                    <ListTitle style={{ marginBottom: 0 }}>
                      Status das assinaturas
                    </ListTitle>
                    <BtnSecondary
                      type="button"
                      onClick={() => loadSignatures()}
                      disabled={loading}
                      style={{ padding: '8px 14px', fontSize: '0.875rem' }}
                    >
                      <MdRefresh size={18} /> Atualizar
                    </BtnSecondary>
                  </div>
                  <ListHelper>
                    Envie o link de assinatura apenas ao signatário
                    correspondente. Reabra este modal para ver o status.
                  </ListHelper>
                  {signatures.some(s => s.status === 'signed') && (
                    <SignatureCard
                      style={{
                        marginTop: 8,
                        background: colors.successBg,
                        borderColor: colors.success,
                      }}
                    >
                      <SignatureMeta>
                        <span
                          style={{
                            fontSize: '0.9375rem',
                            color: colors.text,
                          }}
                        >
                          <strong>Parte das assinaturas já foi realizada.</strong>{' '}
                          Envie os links pendentes aos respectivos signatários.
                        </span>
                      </SignatureMeta>
                    </SignatureCard>
                  )}
                  {signatures.map(sig => (
                    <SignatureCard key={sig.id}>
                      <SignatureMeta>
                        {sig.signerEmail ? (
                          <MdEmail
                            size={20}
                            style={{ color: colors.textSecondary }}
                          />
                        ) : (
                          <MdPerson
                            size={20}
                            style={{ color: colors.textSecondary }}
                          />
                        )}
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: '8px 12px',
                          }}
                        >
                          <SignatureName>
                            {sig.signerName || sig.signerEmail || '—'}
                          </SignatureName>
                          {sig.signerEmail && (
                            <SignatureEmail>({sig.signerEmail})</SignatureEmail>
                          )}
                          <StatusBadge $status={sig.status}>
                            {sig.status === 'signed'
                              ? 'Assinado'
                              : sig.status === 'rejected'
                                ? 'Rejeitado'
                                : sig.status === 'viewed'
                                  ? 'Visualizado'
                                  : 'Pendente'}
                          </StatusBadge>
                          {sig.status === 'signed' && sig.signedAt && (
                            <SignatureDate>
                              <MdCheckCircle size={14} />
                              {' Assinado em: '}
                              {new Date(sig.signedAt).toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </SignatureDate>
                          )}
                        </div>
                      </SignatureMeta>
                      {sig.status !== 'signed' && sig.status !== 'rejected' && (
                        sig.signatureUrl ? (
                          <BtnLink
                            type="button"
                            onClick={() => handleCopyLink(sig)}
                            disabled={loadingLinkId === sig.id}
                          >
                            {loadingLinkId === sig.id ? (
                              'Aguarde...'
                            ) : (
                              <>
                                <MdLink size={18} /> Copiar link
                              </>
                            )}
                          </BtnLink>
                        ) : sig.signerEmail ? (
                          <EmailSentBadge title="O link de assinatura foi enviado automaticamente para o e-mail do signatário">
                            <MdMarkEmailRead size={16} /> Link enviado por e-mail
                          </EmailSentBadge>
                        ) : (
                          <BtnLink
                            type="button"
                            onClick={() => handleCopyLink(sig)}
                            disabled={loadingLinkId === sig.id}
                          >
                            {loadingLinkId === sig.id ? (
                              'Aguarde...'
                            ) : (
                              <>
                                <MdLink size={18} /> Gerar link
                              </>
                            )}
                          </BtnLink>
                        )
                      )}
                    </SignatureCard>
                  ))}
                </SignaturesList>
              )}

              {showSendForm && (
                <>
                  {alreadySent && noneSigned && (
                    <div
                      style={{
                        padding: '12px 16px',
                        marginBottom: '16px',
                        background: colors.warningBg,
                        border: `1px solid ${colors.warning}`,
                        borderRadius: '12px',
                        fontSize: '0.875rem',
                        color: colors.text,
                      }}
                    >
                      <strong>Corrigir envio:</strong> Ninguém assinou ainda.
                      Corrija os dados abaixo e clique em &quot;Enviar para
                      assinatura&quot; — o envio anterior será substituído.
                    </div>
                  )}
                  <FormGroup>
                    <Label>
                      Nome do documento <span style={{ color: colors.primary }}>*</span>
                    </Label>
                    <Input
                      type="text"
                      value={documentName}
                      onChange={e => setDocumentName(e.target.value)}
                      onBlur={() => setDocumentNameTouched(true)}
                      placeholder="Ex: Ficha de Venda FV-2024-001"
                      style={{
                        borderColor:
                          documentNameTouched && !documentName.trim()
                            ? colors.danger
                            : undefined,
                      }}
                    />
                    {documentNameTouched && !documentName.trim() && (
                      <HelperText style={{ color: colors.danger, marginTop: 4 }}>
                        Nome do documento é obrigatório.
                      </HelperText>
                    )}
                  </FormGroup>
                  <FormGroup>
                    <Label>Mensagem ao signatário (opcional)</Label>
                    <Textarea
                      value={documentMessage}
                      onChange={e => setDocumentMessage(e.target.value)}
                      placeholder="Por favor, assine a ficha de venda."
                      rows={2}
                    />
                  </FormGroup>
                  <CheckboxRow>
                    <CheckboxLabel>
                      <input
                        type="checkbox"
                        checked={refusable}
                        onChange={e => setRefusable(e.target.checked)}
                      />
                      Permitir rejeitar
                    </CheckboxLabel>
                    <CheckboxLabel>
                      <input
                        type="checkbox"
                        checked={sortable}
                        onChange={e => setSortable(e.target.checked)}
                      />
                      Ordem de assinatura
                    </CheckboxLabel>
                  </CheckboxRow>

                  <FixedSignersBlock>
                    <FixedSignersTitle>
                      🔒 Signatários obrigatórios (fixos)
                    </FixedSignersTitle>
                    <FixedSignerRow>
                      <MdEmail size={18} style={{ color: '#4a6ab5', flexShrink: 0 }} />
                      <FixedSignerName>Jeany Notari Gomes</FixedSignerName>
                      <FixedSignerEmail>jeany_notari@hotmail.com</FixedSignerEmail>
                      <FixedBadge>Assinar</FixedBadge>
                    </FixedSignerRow>
                    <FixedSignerRow>
                      <MdEmail size={18} style={{ color: '#4a6ab5', flexShrink: 0 }} />
                      <FixedSignerName>Imobiliária União</FixedSignerName>
                      <FixedSignerEmail>renataouros@uniaoImobiliaria99.onmicrosoft.com</FixedSignerEmail>
                      <FixedBadge>Assinar</FixedBadge>
                    </FixedSignerRow>
                    <p style={{ fontSize: '0.75rem', color: '#4a6ab5', margin: '10px 0 0 0', lineHeight: 1.45 }}>
                      Estes signatários são adicionados automaticamente pelo sistema e não podem ser removidos.
                    </p>
                  </FixedSignersBlock>

                  <FormGroup>
                    <Label>Demais signatários</Label>
                    <HelperText>
                      Use e-mail para envio automático; use nome para gerar link
                      e enviar por WhatsApp.
                    </HelperText>
                    {signers.map((s, i) => (
                      <SignerRow key={i}>
                        <SignerFields>
                          <Select
                            value={s.type}
                            onChange={e =>
                              updateSigner(i, 'type', e.target.value)
                            }
                            style={{ minWidth: 100 }}
                          >
                            <option value="email">E-mail</option>
                            <option value="name">Nome</option>
                          </Select>
                          {s.type === 'email' ? (
                            <Input
                              type="email"
                              value={s.email || ''}
                              onChange={e =>
                                updateSigner(i, 'email', e.target.value)
                              }
                              placeholder="email@exemplo.com"
                              style={{ flex: 1, minWidth: 140 }}
                            />
                          ) : (
                            <Input
                              type="text"
                              value={s.name || ''}
                              onChange={e =>
                                updateSigner(i, 'name', e.target.value)
                              }
                              placeholder="Nome do signatário"
                              style={{ flex: 1, minWidth: 140 }}
                            />
                          )}
                          <Select
                            value={s.action}
                            onChange={e =>
                              updateSigner(i, 'action', e.target.value)
                            }
                            style={{ minWidth: 120 }}
                          >
                            {ACTIONS.map(a => (
                              <option key={a.value} value={a.value}>
                                {a.label}
                              </option>
                            ))}
                          </Select>
                        </SignerFields>
                        <BtnDanger
                          type="button"
                          onClick={() => removeSigner(i)}
                          disabled={signers.length <= 1}
                        >
                          <MdDelete size={18} /> Remover
                        </BtnDanger>
                      </SignerRow>
                    ))}
                    <BtnAdd type="button" onClick={addSigner}>
                      <MdAdd size={20} /> Adicionar signatário
                    </BtnAdd>
                  </FormGroup>
                </>
              )}
            </>
          )}
        </Body>
        <Footer>
          {showSendForm && !loading && (
            <BtnPrimary
              type="button"
              onClick={handleSend}
              disabled={sending || !hasValidGestorCpf}
            >
              {sending ? (
                'Enviando...'
              ) : (
                <>
                  <MdSend size={20} /> Enviar para assinatura
                </>
              )}
            </BtnPrimary>
          )}
          <BtnSecondary type="button" onClick={handleClose}>
            Fechar
          </BtnSecondary>
        </Footer>
      </Container>
    </Overlay>
  );
};

export default FichaVendaAssinaturasModal;
