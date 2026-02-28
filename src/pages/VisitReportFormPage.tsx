import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MdArrowBack, MdAdd, MdDelete, MdClose, MdSave } from 'react-icons/md';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import {
  VisitPageContainer,
  PageHeader,
  PageTitle,
  PageTitleContainer,
  PageSubtitle,
  BackButton,
  FieldContainer,
  FieldLabel,
  FieldInput,
  FieldTextarea,
  Button,
} from '../styles/components/PageStyles';

// Alias para compatibilidade (evita "BackBtn is not defined" em cache/hot reload)
const BackBtn = BackButton;

import { useClients } from '../hooks/useClients';
import { visitReportApi } from '../services/visitReportApi';
import { PropertySearchSelect } from '../components/visit-report/PropertySearchSelect';
import { ClientSearchSelect } from '../components/visit-report/ClientSearchSelect';
import type {
  VisitReport,
  CreateVisitReportDto,
  CreateVisitReportPropertyDto,
} from '../types/visitReport';

const PropertyRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
  align-items: stretch;
  & > div:first-child,
  & input { width: 100%; min-width: 0; }
  & input[style*="maxWidth"] { max-width: 100%; }
  @media (min-width: 600px) {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
    & input { flex: 1; min-width: 120px; }
  }
`;
const BtnAdd = styled.button`
  padding: 12px 16px;
  min-height: 44px;
  border-radius: 8px;
  border: none;
  font-size: 0.9375rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 8px;
  background: ${p => p.theme.colors.primary};
  color: #fff;
  &:hover:not(:disabled) { opacity: 0.9; }
  &:disabled { opacity: 0.7; cursor: not-allowed; }
  @media (min-width: 600px) { min-height: auto; padding: 8px 12px; font-size: 0.875rem; }
`;
const BtnRemove = styled.button`
  background: transparent;
  border: none;
  color: ${p => p.theme.colors.textSecondary};
  padding: 12px;
  min-width: 44px;
  min-height: 44px;
  cursor: pointer;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  &:hover { color: ${p => p.theme.colors.error}; background: ${p => `${p.theme.colors.error}15`}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
  @media (min-width: 600px) { min-width: auto; min-height: auto; padding: 6px; }
`;
const FormActions = styled.div`
  display: flex;
  flex-direction: column-reverse;
  gap: 12px;
  margin-top: 24px;
  & button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 44px;
    padding: 12px 20px;
    font-size: 0.9375rem;
  }
  & button:disabled { opacity: 0.8; cursor: not-allowed; }
  @media (min-width: 480px) {
    flex-direction: row;
    & button { min-height: auto; padding: 12px 24px; font-size: 1rem; }
  }
`;
const ErrorText = styled.p`
  color: ${p => p.theme.colors.error || '#c62828'};
  font-size: 14px;
  margin-top: 8px;
`;
const FormContent = styled.form`
  width: 100%;
`;
const SpinnerSmall = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid ${p => p.theme.colors.border};
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const emptyProperty = (): CreateVisitReportPropertyDto => ({
  address: '',
  reference: '',
  displayOrder: 0,
});

function getListPath(pathname: string): string {
  return pathname.includes('visit-reports') ? '/visit-reports' : '/visits';
}

export const VisitReportFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const listPath = getListPath(location.pathname);
  const isEdit = Boolean(id);

  const { fetchClients } = useClients();
  const [initialReport, setInitialReport] = useState<VisitReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(isEdit);
  const [clientId, setClientId] = useState('');
  const [clientDisplayName, setClientDisplayName] = useState('');
  const [visitDate, setVisitDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [properties, setProperties] = useState<CreateVisitReportPropertyDto[]>([
    { ...emptyProperty(), displayOrder: 0 },
  ]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    if (!isEdit || !id) {
      setLoadingReport(false);
      return;
    }
    setLoadingReport(true);
    visitReportApi
      .getById(id)
      .then(report => {
        setInitialReport(report);
        setClientId(report.clientId);
        setClientDisplayName(report.clientName || '');
        setVisitDate(report.visitDate.slice(0, 10));
        setNotes(report.notes || '');
        if (report.properties?.length) {
          setProperties(
            report.properties
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((p, i) => ({
                propertyId: p.propertyId,
                address: p.address,
                reference: p.reference || '',
                displayOrder: i,
              }))
          );
        }
      })
      .catch(() => setError('Relatório não encontrado.'))
      .finally(() => setLoadingReport(false));
  }, [isEdit, id]);

  const addProperty = () => {
    setProperties(prev => [
      ...prev,
      { ...emptyProperty(), displayOrder: prev.length },
    ]);
  };

  const removeProperty = (index: number) => {
    if (properties.length <= 1) return;
    setProperties(prev => prev.filter((_, i) => i !== index));
  };

  const updateProperty = (
    index: number,
    field: 'address' | 'reference',
    value: string
  ) => {
    setProperties(prev =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  const onPropertySelect = (
    index: number,
    propertyId: string | undefined,
    prop?: { address?: string; code?: string }
  ) => {
    setProperties(prev =>
      prev.map((p, i) =>
        i === index
          ? {
              ...p,
              propertyId,
              address: prop?.address ?? '',
              reference: prop?.code ? `Ref. ${prop.code}` : '',
            }
          : p
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!clientId) {
      setError('Selecione o cliente.');
      return;
    }
    const validProperties = properties
      .map((p, i) => ({
        ...p,
        propertyId: p.propertyId,
        address: p.address.trim(),
        displayOrder: i,
      }))
      .filter(p => p.address.length > 0);
    if (validProperties.length === 0) {
      setError('Informe ao menos um imóvel (endereço).');
      return;
    }
    setSaving(true);
    try {
      if (initialReport) {
        await visitReportApi.update(initialReport.id, {
          visitDate,
          properties: validProperties,
          notes: notes.trim() || undefined,
          kanbanTaskId: initialReport.kanbanTaskId ?? undefined,
        });
      } else {
        await visitReportApi.create({
          clientId,
          visitDate,
          properties: validProperties,
          notes: notes.trim() || undefined,
        });
      }
      navigate(listPath);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => navigate(listPath);

  if (loadingReport) {
    return (
      <Layout>
        <VisitPageContainer>
          <PageHeader>
            <PageTitleContainer>
              <PageTitle>Carregando...</PageTitle>
            </PageTitleContainer>
          </PageHeader>
        </VisitPageContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <VisitPageContainer>
        <PageHeader>
          <PageTitleContainer>
            <PageTitle>
              {isEdit ? 'Editar relatório de visita' : 'Novo relatório de visita'}
            </PageTitle>
            <PageSubtitle>
              {isEdit
                ? 'Altere os dados da visita e dos imóveis.'
                : 'Registre a visita, selecione o cliente e os imóveis visitados.'}
            </PageSubtitle>
          </PageTitleContainer>
          <BackButton type="button" onClick={goBack}>
            <MdArrowBack size={20} /> Voltar
          </BackButton>
        </PageHeader>

        <FormContent onSubmit={handleSubmit}>
            <FieldContainer>
              <FieldLabel>Cliente *</FieldLabel>
              <ClientSearchSelect
                value={clientId}
                displayLabel={clientDisplayName}
                onSelect={(id, client) => {
                  setClientId(id);
                  setClientDisplayName(client?.name ?? '');
                }}
                disabled={isEdit}
                placeholder="Buscar por nome ou CPF..."
              />
            </FieldContainer>
            <FieldContainer>
              <FieldLabel>Data da visita *</FieldLabel>
              <FieldInput
                type="date"
                value={visitDate}
                onChange={e => setVisitDate(e.target.value)}
                required
              />
            </FieldContainer>
            <FieldContainer>
              <FieldLabel>Imóveis visitados (busque por nome, código ou CEP ou digite endereço) *</FieldLabel>
              {properties.map((p, i) => (
                <PropertyRow key={i}>
                  <PropertySearchSelect
                    value={p.propertyId}
                    displayLabel={p.address ? (p.reference ? `${p.reference} – ${p.address}` : p.address) : undefined}
                    onSelect={(propertyId, prop) => onPropertySelect(i, propertyId, prop)}
                    placeholder="Buscar por nome, código ou CEP..."
                  />
                  <FieldInput
                    placeholder="Endereço"
                    value={p.address}
                    onChange={e => updateProperty(i, 'address', e.target.value)}
                  />
                  <FieldInput
                    placeholder="Ref."
                    value={p.reference || ''}
                    onChange={e => updateProperty(i, 'reference', e.target.value)}
                    style={{ maxWidth: 120 }}
                  />
                  <BtnRemove
                    type="button"
                    onClick={() => removeProperty(i)}
                    title="Remover"
                  >
                    <MdDelete size={18} />
                  </BtnRemove>
                </PropertyRow>
              ))}
              <BtnAdd type="button" onClick={addProperty}>
                <MdAdd size={18} /> Adicionar imóvel
              </BtnAdd>
            </FieldContainer>
            <FieldContainer>
              <FieldLabel>Observações</FieldLabel>
              <FieldTextarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Opcional"
              />
            </FieldContainer>
            {error && <ErrorText>{error}</ErrorText>}
            <FormActions>
              <Button type="button" className="secondary" onClick={goBack} disabled={saving} title="Cancelar e voltar">
                <MdClose size={18} /> Cancelar
              </Button>
              <Button type="submit" className="primary" disabled={saving} title={saving ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar relatório'}>
                {saving ? (
                  <>
                    <SpinnerSmall />
                    Salvando...
                  </>
                ) : (
                  <>
                    <MdSave size={18} />
                    {isEdit ? 'Salvar' : 'Criar'}
                  </>
                )}
              </Button>
            </FormActions>
        </FormContent>
      </VisitPageContainer>
    </Layout>
  );
};

export default VisitReportFormPage;
