import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { MdCheck, MdDescription, MdHourglassEmpty } from 'react-icons/md';
import { getApiUrl } from '../config/apiConfig';

interface PropertyItem {
  address: string;
  reference?: string;
  displayOrder: number;
}

interface ReportData {
  valid: boolean;
  message?: string;
  visitDate?: string;
  clientName?: string;
  properties?: PropertyItem[];
  alreadySigned?: boolean;
}

const PageWrap = styled.div<{ $narrow?: boolean }>`
  max-width: ${p => (p.$narrow ? 480 : 560)}px;
  margin: 0 auto;
  padding: 20px 16px 32px;
  padding-left: max(16px, env(safe-area-inset-left));
  padding-right: max(16px, env(safe-area-inset-right));
  padding-bottom: max(32px, env(safe-area-inset-bottom));
  text-align: ${p => (p.$narrow ? 'center' : 'left')};
  color: ${p => p.theme.colors.text};
  background: ${p => p.theme.colors.background};
  min-height: 100vh;
  box-sizing: border-box;
  @media (min-width: 600px) {
    margin: 40px auto;
    padding: 24px;
  }
`;

const Title = styled.h1`
  font-size: 1.35rem;
  margin-bottom: 8px;
  color: ${p => p.theme.colors.text};
  @media (min-width: 600px) { font-size: 22px; }
`;

const Text = styled.p<{ $success?: boolean }>`
  color: ${p => (p.$success ? p.theme.colors.success : p.theme.colors.textSecondary)};
  margin-bottom: ${p => (p.$success ? 0 : 24)}px;
`;

const PropertyList = styled.ul`
  list-style: none;
  padding: 0;
  margin-bottom: 24px;
`;

const PropertyItemLi = styled.li`
  padding: 12px 16px;
  margin-bottom: 8px;
  background: ${p => p.theme.colors.backgroundSecondary};
  border-radius: 8px;
  border: 1px solid ${p => p.theme.colors.border};
  color: ${p => p.theme.colors.text};
  strong { color: ${p => p.theme.colors.text}; }
`;

const PropertyRef = styled.span`
  display: block;
  font-size: 14px;
  color: ${p => p.theme.colors.textSecondary};
  margin-top: 4px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: ${p => p.theme.colors.text};
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 14px;
  min-height: 44px;
  margin-bottom: 16px;
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 8px;
  box-sizing: border-box;
  font-size: 16px;
  background: ${p => p.theme.colors.cardBackground};
  color: ${p => p.theme.colors.text};
  &:focus {
    outline: none;
    border-color: ${p => p.theme.colors.primary};
    box-shadow: 0 0 0 2px ${p => `${p.theme.colors.primary}20`};
  }
`;

const ErrorText = styled.p`
  color: ${p => p.theme.colors.error};
  margin-bottom: 12px;
  font-size: 14px;
`;

const BtnSubmit = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 44px;
  padding: 14px 24px;
  background: ${p => p.theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover:not(:disabled) { opacity: 0.9; }
  &:disabled { opacity: 0.7; cursor: not-allowed; }
  @media (min-width: 480px) { width: auto; }
`;

const Spinner = styled.span`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid ${p => p.theme.colors.border};
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const SuccessIconWrap = styled.span`
  display: block;
  margin-bottom: 12px;
  color: ${p => p.theme.colors.success};
`;

const VisitReportSignPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [signerName, setSignerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [signed, setSigned] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setData({ valid: false, message: 'Link inválido.' });
      setLoading(false);
      return;
    }
    const apiUrl = getApiUrl(`public/visit-report-sign/${token}`);
    fetch(apiUrl)
      .then((res) => res.json())
      .then((body: ReportData) => {
        setData(body);
        if (body.alreadySigned) setSigned(true);
      })
      .catch(() => setData({ valid: false, message: 'Erro ao carregar o relatório.' }))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !data?.valid || !signerName.trim()) return;
    setSubmitting(true);
    setError(null);
    const apiUrl = getApiUrl(`public/visit-report-sign/${token}/sign`);
    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signerName: signerName.trim() }),
    })
      .then((res) => {
        if (!res.ok) return res.json().then((err) => Promise.reject(err));
        return res.json();
      })
      .then(() => setSigned(true))
      .catch((err) => setError(err?.message || 'Erro ao registrar assinatura.'))
      .finally(() => setSubmitting(false));
  };

  if (loading) {
    return (
      <PageWrap $narrow>
        <MdHourglassEmpty size={32} style={{ marginBottom: 12, opacity: 0.6 }} />
        <Text>Carregando relatório...</Text>
      </PageWrap>
    );
  }

  if (!data) {
    return (
      <PageWrap $narrow>
        <Text>Não foi possível carregar os dados.</Text>
      </PageWrap>
    );
  }

  if (!data.valid) {
    return (
      <PageWrap $narrow>
        <Title>Relatório de visita</Title>
        <Text>{data.message || 'Este link não é válido ou expirou.'}</Text>
      </PageWrap>
    );
  }

  if (signed) {
    return (
      <PageWrap $narrow>
        <SuccessIconWrap>
          <MdCheck size={40} />
        </SuccessIconWrap>
        <Title>Assinatura registrada</Title>
        <Text $success>
          Obrigado! Sua concordância com o relatório de visita foi registrada com sucesso.
        </Text>
      </PageWrap>
    );
  }

  const properties = (data.properties || []).sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <PageWrap>
      <Title>
        <MdDescription size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
        Relatório de visita
      </Title>
      <Text>
        Confirme os imóveis que você visitou no dia{' '}
        {data.visitDate
          ? new Date(data.visitDate + 'T12:00:00').toLocaleDateString('pt-BR')
          : ''}
        {data.clientName ? ` (cliente: ${data.clientName})` : ''}.
      </Text>
      <PropertyList>
        {properties.map((p, i) => (
          <PropertyItemLi key={i}>
            <strong>{p.address}</strong>
            {p.reference && <PropertyRef>{p.reference}</PropertyRef>}
          </PropertyItemLi>
        ))}
      </PropertyList>
      <form onSubmit={handleSubmit}>
        <Label>Nome completo (quem está assinando)</Label>
        <Input
          type="text"
          value={signerName}
          onChange={(e) => setSignerName(e.target.value)}
          placeholder="Digite seu nome"
          required
          disabled={submitting}
        />
        {error && <ErrorText>{error}</ErrorText>}
        <BtnSubmit type="submit" disabled={submitting} title={submitting ? 'Enviando...' : 'Concordo e assino'}>
          {submitting ? (
            <>
              <Spinner />
              Enviando...
            </>
          ) : (
            <>
              <MdCheck size={20} />
              Concordo e assino
            </>
          )}
        </BtnSubmit>
      </form>
    </PageWrap>
  );
};

export default VisitReportSignPage;
