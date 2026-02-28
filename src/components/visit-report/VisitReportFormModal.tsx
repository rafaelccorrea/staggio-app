import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MdClose, MdAdd, MdDelete } from 'react-icons/md';
import { useClients } from '../../hooks/useClients';
import { PropertySearchSelect } from './PropertySearchSelect';
import { ClientSearchSelect } from './ClientSearchSelect';
import type {
  VisitReport,
  CreateVisitReportDto,
  CreateVisitReportPropertyDto,
} from '../../types/visitReport';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
`;
const Modal = styled.div`
  background: ${p => p.theme.colors.cardBackground};
  border-radius: 12px;
  max-width: 560px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;
const Header = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid ${p => p.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
const Title = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  color: ${p => p.theme.colors.text};
`;
const CloseBtn = styled.button`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: ${p => p.theme.colors.textSecondary};
  &:hover { color: ${p => p.theme.colors.text}; }
`;
const Body = styled.div`
  padding: 20px;
  overflow-y: auto;
  flex: 1;
`;
const Field = styled.div`
  margin-bottom: 16px;
`;
const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${p => p.theme.colors.text};
  margin-bottom: 6px;
`;
const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 8px;
  font-size: 0.9375rem;
  background: ${p => p.theme.colors.background};
  color: ${p => p.theme.colors.text};
  box-sizing: border-box;
`;
const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 8px;
  font-size: 0.9375rem;
  min-height: 80px;
  resize: vertical;
  background: ${p => p.theme.colors.background};
  color: ${p => p.theme.colors.text};
  box-sizing: border-box;
`;
const PropertyRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
  align-items: flex-start;
  & input { flex: 1; min-width: 120px; }
  & select { min-width: 200px; }
`;
const BtnSmall = styled.button`
  padding: 8px 12px;
  border-radius: 6px;
  border: none;
  font-size: 0.875rem;
  cursor: pointer;
  flex-shrink: 0;
`;
const BtnAdd = styled(BtnSmall)`
  background: ${p => p.theme.colors.primary};
  color: #fff;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
`;
const BtnRemove = styled(BtnSmall)`
  background: transparent;
  color: ${p => p.theme.colors.textSecondary};
  padding: 6px;
  &:hover { color: #c62828; }
`;
const Footer = styled.div`
  padding: 16px 20px;
  border-top: 1px solid ${p => p.theme.colors.border};
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;
const BtnPrimary = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: ${p => p.theme.colors.primary};
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;
const BtnSecondary = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid ${p => p.theme.colors.border};
  background: transparent;
  color: ${p => p.theme.colors.text};
  cursor: pointer;
`;

interface VisitReportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialReport?: VisitReport | null;
  defaultClientId?: string;
  defaultKanbanTaskId?: string;
}

const emptyProperty = (): CreateVisitReportPropertyDto => ({
  address: '',
  reference: '',
  displayOrder: 0,
});

export const VisitReportFormModal: React.FC<VisitReportFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  initialReport,
  defaultClientId,
  defaultKanbanTaskId,
}) => {
  const { fetchClients } = useClients();
  const [clientId, setClientId] = useState(defaultClientId || '');
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
    if (isOpen) fetchClients();
  }, [isOpen, fetchClients]);

  useEffect(() => {
    if (!isOpen) return;
    setClientId(initialReport?.clientId || defaultClientId || '');
    setClientDisplayName(initialReport?.clientName || '');
    setVisitDate(
      initialReport?.visitDate
        ? initialReport.visitDate.slice(0, 10)
        : new Date().toISOString().slice(0, 10)
    );
    setNotes(initialReport?.notes || '');
    if (initialReport?.properties?.length) {
      setProperties(
        initialReport.properties
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((p, i) => ({
            propertyId: p.propertyId,
            address: p.address,
            reference: p.reference || '',
            displayOrder: i,
          }))
      );
    } else {
      setProperties([{ ...emptyProperty(), displayOrder: 0 }]);
    }
    setError(null);
  }, [
    isOpen,
    initialReport?.id,
    initialReport?.clientId,
    initialReport?.visitDate,
    initialReport?.notes,
    initialReport?.properties,
    defaultClientId,
  ]);

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

  const updateProperty = (index: number, field: 'address' | 'reference', value: string) => {
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
      const payload: CreateVisitReportDto = {
        clientId,
        visitDate,
        properties: validProperties,
        notes: notes.trim() || undefined,
      };
      if (defaultKanbanTaskId) payload.kanbanTaskId = defaultKanbanTaskId;
      if (initialReport) {
        const { visitReportApi } = await import('../../services/visitReportApi');
        await visitReportApi.update(initialReport.id, {
          visitDate,
          properties: validProperties,
          notes: notes.trim() || undefined,
          kanbanTaskId: defaultKanbanTaskId ?? initialReport.kanbanTaskId ?? undefined,
        });
      } else {
        const { visitReportApi } = await import('../../services/visitReportApi');
        await visitReportApi.create(payload);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <Header>
          <Title>
            {initialReport ? 'Editar relatório de visita' : 'Novo relatório de visita'}
          </Title>
          <CloseBtn onClick={onClose} type="button">
            <MdClose size={24} />
          </CloseBtn>
        </Header>
        <form onSubmit={handleSubmit}>
          <Body>
            <Field>
              <Label>Cliente *</Label>
              <ClientSearchSelect
                value={clientId}
                displayLabel={clientDisplayName}
                onSelect={(id, client) => {
                  setClientId(id);
                  setClientDisplayName(client?.name ?? '');
                }}
                disabled={!!initialReport}
                placeholder="Buscar por nome ou CPF..."
              />
            </Field>
            <Field>
              <Label>Data da visita *</Label>
              <Input
                type="date"
                value={visitDate}
                onChange={e => setVisitDate(e.target.value)}
                required
              />
            </Field>
            <Field>
              <Label>Imóveis visitados (busque por nome, código ou CEP ou digite endereço) *</Label>
              {properties.map((p, i) => (
                <PropertyRow key={i}>
                  <PropertySearchSelect
                    value={p.propertyId}
                    displayLabel={p.address ? (p.reference ? `${p.reference} – ${p.address}` : p.address) : undefined}
                    onSelect={(propertyId, prop) => onPropertySelect(i, propertyId, prop)}
                    placeholder="Buscar por nome, código ou CEP..."
                  />
                  <Input
                    placeholder="Endereço"
                    value={p.address}
                    onChange={e => updateProperty(i, 'address', e.target.value)}
                  />
                  <Input
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
            </Field>
            <Field>
              <Label>Observações</Label>
              <TextArea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Opcional"
              />
            </Field>
            {error && (
              <p style={{ color: '#c62828', fontSize: 14, marginTop: 8 }}>{error}</p>
            )}
          </Body>
          <Footer>
            <BtnSecondary type="button" onClick={onClose}>
              Cancelar
            </BtnSecondary>
            <BtnPrimary type="submit" disabled={saving}>
              {saving ? 'Salvando...' : initialReport ? 'Salvar' : 'Criar'}
            </BtnPrimary>
          </Footer>
        </form>
      </Modal>
    </Overlay>
  );
};
