import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { MdAssignment, MdAdd, MdLink, MdContentCopy } from 'react-icons/md';
import { visitReportApi } from '../../services/visitReportApi';
import type { VisitReport } from '../../types/visitReport';
import { VisitReportFormModal } from './VisitReportFormModal';
import { ClientSearchSelect } from './ClientSearchSelect';
import { toast } from 'react-toastify';

const Section = styled.div`
  margin-bottom: 24px;
`;
const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;
const SectionIcon = styled.div`
  color: ${p => p.theme.colors.textSecondary};
`;
const SectionTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: ${p => p.theme.colors.text};
`;
const Box = styled.div`
  padding: 12px 16px;
  background: ${p => p.theme.colors.backgroundSecondary};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 8px;
`;
const Badge = styled.span<{ $status: string }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${p =>
    p.$status === 'signed'
      ? `${p.theme.colors.success}20`
      : p.$status === 'expired'
        ? `${p.theme.colors.textSecondary}30`
        : `${p.theme.colors.info || p.theme.colors.primary}20`};
  color: ${p =>
    p.$status === 'signed'
      ? p.theme.colors.success
      : p.$status === 'expired'
        ? p.theme.colors.textSecondary
        : p.theme.colors.info || p.theme.colors.primary};
`;
const Btn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 14px;
  min-height: 44px;
  margin-top: 10px;
  margin-right: 8px;
  border-radius: 8px;
  border: none;
  font-size: 0.9375rem;
  cursor: pointer;
  background: ${p => p.theme.colors.primary};
  color: #fff;
  &:hover:not(:disabled) { opacity: 0.9; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
  @media (min-width: 600px) { min-height: auto; padding: 8px 12px; font-size: 0.875rem; }
`;
const BtnSecondary = styled(Btn)`
  background: transparent;
  border: 1px solid ${p => p.theme.colors.border};
  color: ${p => p.theme.colors.text};
  &:hover:not(:disabled) { background: ${p => p.theme.colors.backgroundSecondary}; }
`;
const FilterRow = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: 10px;
  align-items: stretch;
  margin-bottom: 10px;
  @media (min-width: 600px) {
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }
`;
const SelectWrap = styled.div`
  width: 100%;
  min-width: 0;
  @media (min-width: 600px) { min-width: 200px; flex: 1; max-width: 280px; width: auto; }
`;
const SelectSmall = styled.select`
  width: 100%;
  padding: 10px 12px;
  min-height: 44px;
  border-radius: 8px;
  border: 1px solid ${p => p.theme.colors.border};
  font-size: 16px;
  background: ${p => p.theme.colors.background};
  color: ${p => p.theme.colors.text};
  @media (min-width: 600px) { width: auto; min-width: 120px; min-height: auto; padding: 6px 10px; font-size: 0.8125rem; }
`;
const LabelSmall = styled.span`
  font-size: 0.75rem;
  color: ${p => p.theme.colors.textSecondary};
  margin-right: 4px;
`;

const InputDate = styled.input.attrs({ type: 'date' })`
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid ${p => p.theme.colors.border};
  font-size: 0.8125rem;
  background: ${p => p.theme.colors.background};
  color: ${p => p.theme.colors.text};
  min-height: 40px;
  @media (min-width: 600px) {
    min-height: 36px;
    padding: 6px 10px;
  }
  &:focus {
    outline: none;
    border-color: ${p => p.theme.colors.primary};
    border-width: 2px;
  }
`;

const InputText = styled.input.attrs({ type: 'text' })`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid ${p => p.theme.colors.border};
  font-size: 0.8125rem;
  background: ${p => p.theme.colors.background};
  color: ${p => p.theme.colors.text};
  min-width: 140px;
  min-height: 40px;
  @media (min-width: 600px) {
    min-height: 36px;
    padding: 6px 10px;
  }
  &::placeholder {
    color: ${p => p.theme.colors.textSecondary};
  }
  &:focus {
    outline: none;
    border-color: ${p => p.theme.colors.primary};
    border-width: 2px;
  }
`;

const EmptyMessage = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: ${p => p.theme.colors.textSecondary};
`;

const DividerBlock = styled.div`
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid ${p => p.theme.colors.border};
`;

const SubsectionTitle = styled.p`
  margin: 0 0 10px 0;
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${p => p.theme.colors.text};
`;

const LinkedInfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const LinkedInfoText = styled.span`
  font-size: 0.875rem;
  color: ${p => p.theme.colors.text};
`;

const BtnOutline = styled(Btn)`
  background: transparent;
  color: ${p => p.theme.colors.primary};
  border: 1px solid ${p => p.theme.colors.primary};
  &:hover:not(:disabled) {
    background: ${p => p.theme.colors.primary}12;
  }
`;

const LinkHint = styled.div`
  margin-top: 8px;
  font-size: 0.75rem;
  color: ${p => p.theme.colors.textSecondary};
`;

const DateGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const LinkedReportsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 4px;
`;

const LinkedReportCard = styled.div`
  padding: 12px 14px;
  background: ${p => p.theme.colors.background};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 8px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const LinkedReportCardInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const LinkedReportCardActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const LinkedReportCardMeta = styled.div`
  font-size: 0.75rem;
  color: ${p => p.theme.colors.textSecondary};
  margin-top: 4px;
`;

const statusLabel: Record<string, string> = {
  pending: 'Aguardando assinatura',
  signed: 'Assinado',
  expired: 'Expirado',
};

interface VisitReportTaskSectionProps {
  taskId: string;
  clientId?: string | null;
  clientName?: string;
  onLinkGenerated?: (url: string) => void;
  /** Quando true, exibe apenas os dados vinculados (aba Visita) — sem vincular/criar/gerar link */
  viewOnly?: boolean;
  /** Chamado quando a lista de relatórios vinculados muda (ex.: para exibir a aba Visita) */
  onReportsChange?: (count: number) => void;
}

export const VisitReportTaskSection: React.FC<VisitReportTaskSectionProps> = ({
  taskId,
  clientId,
  clientName,
  onLinkGenerated,
  viewOnly = false,
  onReportsChange,
}) => {
  const [reports, setReports] = useState<VisitReport[]>([]);
  const [companyReports, setCompanyReports] = useState<VisitReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCompany, setLoadingCompany] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [linkModal, setLinkModal] = useState<string | null>(null);
  const [linkModalReportId, setLinkModalReportId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [linkReportId, setLinkReportId] = useState<string>('');
  const [linking, setLinking] = useState(false);
  const [filterClientId, setFilterClientId] = useState('');
  const [filterClientLabel, setFilterClientLabel] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [filterProperty, setFilterProperty] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await visitReportApi.list({ kanbanTaskId: taskId });
      setReports(list);
      onReportsChange?.(list.length);
    } catch {
      setReports([]);
      onReportsChange?.(0);
    } finally {
      setLoading(false);
    }
  }, [taskId, onReportsChange]);

  const loadCompanyReports = useCallback(async () => {
    setLoadingCompany(true);
    try {
      const list = await visitReportApi.list({
        scope: 'all',
        clientId: filterClientId || undefined,
        fromDate: filterFromDate || undefined,
        toDate: filterToDate || undefined,
      });
      setCompanyReports(list);
    } catch {
      setCompanyReports([]);
    } finally {
      setLoadingCompany(false);
    }
  }, [filterClientId, filterFromDate, filterToDate]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadCompanyReports();
  }, [loadCompanyReports]);

  const handleGenerateLink = async (report: VisitReport) => {
    if (report.signatureStatus === 'signed') return;
    setGenerating(true);
    try {
      const res = await visitReportApi.generateSignatureLink(report.id, 7);
      setLinkModal(res.signatureUrl);
      setLinkModalReportId(report.id);
      onLinkGenerated?.(res.signatureUrl);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erro ao gerar link.');
    } finally {
      setGenerating(false);
    }
  };

  const copyLink = async () => {
    if (!linkModal) return;
    try {
      await navigator.clipboard.writeText(linkModal);
      toast.success('Link copiado!');
    } catch {
      toast.error('Erro ao copiar.');
    }
  };

  const handleLinkExisting = async () => {
    if (!linkReportId) return;
    setLinking(true);
    try {
      await visitReportApi.update(linkReportId, { kanbanTaskId: taskId });
      toast.success('Relatório vinculado à negociação.');
      setLinkReportId('');
      load();
      loadCompanyReports();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erro ao vincular.');
    } finally {
      setLinking(false);
    }
  };

  const linkedIds = new Set(reports.map(r => r.id));
  const propertySearchLower = filterProperty.trim().toLowerCase();
  const selectableReports = companyReports.filter(r => {
    if (linkedIds.has(r.id)) return false;
    if (propertySearchLower && r.properties?.length) {
      const match = r.properties.some(
        p =>
          (p.address && p.address.toLowerCase().includes(propertySearchLower)) ||
          (p.reference && p.reference.toLowerCase().includes(propertySearchLower)) ||
          (p.propertyCode && p.propertyCode.toLowerCase().includes(propertySearchLower))
      );
      if (!match) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <Section>
        <SectionHeader>
          <SectionIcon><MdAssignment size={18} /></SectionIcon>
          <SectionTitle>Relatório de visita</SectionTitle>
        </SectionHeader>
        <Box><EmptyMessage>Carregando...</EmptyMessage></Box>
      </Section>
    );
  }

  return (
    <Section>
      <SectionHeader>
        <SectionIcon><MdAssignment size={18} /></SectionIcon>
        <SectionTitle>Relatório de visita</SectionTitle>
      </SectionHeader>
      <Box>
        {reports.length > 0 ? (
          <>
            <SubsectionTitle>
              {reports.length} relatório(s) vinculado(s)
            </SubsectionTitle>
            <LinkedReportsList>
              {reports.map(report => (
                <LinkedReportCard key={report.id}>
                  <LinkedReportCardInfo style={{ flex: 1, minWidth: 0 }}>
                    <div>
                      <LinkedInfoText>
                        Visita em {new Date(report.visitDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                        {report.clientName && ` · ${report.clientName}`}
                      </LinkedInfoText>
                      <Badge $status={report.signatureStatus}>
                        {statusLabel[report.signatureStatus] || report.signatureStatus}
                      </Badge>
                      {viewOnly && report.signatureStatus === 'signed' && report.signedAt && (
                        <LinkedReportCardMeta>
                          Assinado em {new Date(report.signedAt).toLocaleDateString('pt-BR')}
                          {report.signerName ? ` por ${report.signerName}` : ''}
                        </LinkedReportCardMeta>
                      )}
                      {viewOnly && report.signatureStatus === 'pending' && report.signatureExpiresAt && (
                        <LinkedReportCardMeta>
                          Link expira em {new Date(report.signatureExpiresAt).toLocaleDateString('pt-BR')}
                        </LinkedReportCardMeta>
                      )}
                    </div>
                  </LinkedReportCardInfo>
                  {!viewOnly && (
                    <LinkedReportCardActions>
                      <Btn
                        type="button"
                        onClick={() => handleGenerateLink(report)}
                        disabled={report.signatureStatus === 'signed' || generating}
                      >
                        <MdLink size={16} /> {report.signatureStatus === 'pending' ? 'Gerar link de assinatura' : 'Gerar novo link'}
                      </Btn>
                      {linkModal && linkModalReportId === report.id && (
                        <BtnSecondary type="button" onClick={copyLink}>
                          <MdContentCopy size={16} /> Copiar link
                        </BtnSecondary>
                      )}
                    </LinkedReportCardActions>
                  )}
                </LinkedReportCard>
              ))}
            </LinkedReportsList>
          </>
        ) : (
          <EmptyMessage>
            {viewOnly
              ? 'Nenhum relatório vinculado. Use o painel ao lado para vincular ou criar um relatório de visita.'
              : 'Nenhum relatório vinculado a esta negociação.'}
          </EmptyMessage>
        )}

        {!viewOnly && (
          <>
            <DividerBlock>
              <SubsectionTitle>Vincular relatório existente</SubsectionTitle>
              <FilterRow>
                <SelectWrap>
                  <ClientSearchSelect
                    value={filterClientId}
                    displayLabel={filterClientLabel}
                    onSelect={(id, client) => {
                      setFilterClientId(id);
                      setFilterClientLabel(client?.name ?? '');
                    }}
                    placeholder="Filtrar por cliente..."
                  />
                </SelectWrap>
                <DateGroup>
                  <LabelSmall>De</LabelSmall>
                  <InputDate
                    value={filterFromDate}
                    onChange={e => setFilterFromDate(e.target.value)}
                  />
                </DateGroup>
                <DateGroup>
                  <LabelSmall>Até</LabelSmall>
                  <InputDate
                    value={filterToDate}
                    onChange={e => setFilterToDate(e.target.value)}
                  />
                </DateGroup>
                <InputText
                  placeholder="Filtrar por imóvel..."
                  value={filterProperty}
                  onChange={e => setFilterProperty(e.target.value)}
                />
              </FilterRow>
              <FilterRow>
                <SelectSmall
                  value={linkReportId}
                  onChange={e => setLinkReportId(e.target.value)}
                  disabled={loadingCompany}
                >
                  <option value="">Selecione um relatório...</option>
                  {selectableReports.map(r => (
                    <option key={r.id} value={r.id}>
                      {new Date(r.visitDate + 'T12:00:00').toLocaleDateString('pt-BR')} · {r.clientName || r.clientId} · {r.properties?.length || 0} imóvel(is)
                    </option>
                  ))}
                </SelectSmall>
                <Btn
                  type="button"
                  onClick={handleLinkExisting}
                  disabled={!linkReportId || linking}
                >
                  {linking ? 'Vinculando...' : 'Vincular'}
                </Btn>
              </FilterRow>
            </DividerBlock>

            <BtnOutline
              type="button"
              onClick={() => setShowForm(true)}
              style={{ marginTop: 12 }}
            >
              <MdAdd size={16} /> {reports.length > 0 ? 'Criar outro relatório' : 'Criar relatório de visita'}
            </BtnOutline>
          </>
        )}
      </Box>

      <VisitReportFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSaved={() => { load(); setShowForm(false); }}
        defaultClientId={clientId || undefined}
        defaultKanbanTaskId={taskId}
      />

      {linkModal && (
        <LinkHint>
          Link gerado. Use o botão &quot;Copiar link&quot; para enviar ao cliente.
        </LinkHint>
      )}
    </Section>
  );
};
