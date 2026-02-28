import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdLink,
  MdContentCopy,
  MdClose,
  MdAssignment,
  MdFilterList,
  MdClear,
  MdMoreVert,
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { VisitPageContainer, PageHeader, PageTitle, PageSubtitle } from '../styles/components/PageStyles';
import { visitReportApi } from '../services/visitReportApi';
import type { VisitReport } from '../types/visitReport';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import { toast } from 'react-toastify';
import { ClientSearchSelect } from '../components/visit-report/ClientSearchSelect';

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
  @media (min-width: 600px) { width: auto; }
`;
const BtnPrimary = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 18px;
  min-height: 44px;
  border-radius: 8px;
  border: none;
  background: ${p => p.theme.colors.primary};
  color: #fff;
  font-weight: 500;
  font-size: 0.9375rem;
  cursor: pointer;
  &:hover:not(:disabled) { opacity: 0.9; }
  &:disabled { opacity: 0.7; cursor: not-allowed; }
  width: 100%;
  @media (min-width: 600px) { width: auto; }
`;
const BtnSecondary = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 14px;
  min-height: 44px;
  border-radius: 8px;
  border: 1px solid ${p => p.theme.colors.border};
  background: ${p => p.theme.colors.background};
  color: ${p => p.theme.colors.text};
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  &:hover { background: ${p => p.theme.colors.backgroundSecondary}; }
`;
const FiltersCard = styled.div`
  background: ${p => p.theme.colors.cardBackground};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
`;
const FiltersTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${p => p.theme.colors.textSecondary};
  margin-bottom: 12px;
`;
const FiltersRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
`;
const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  min-width: 0;
  @media (min-width: 600px) { width: auto; min-width: 140px; }
`;
const FilterLabel = styled.label`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${p => p.theme.colors.textSecondary};
`;
const FilterInput = styled.input`
  padding: 10px 12px;
  min-height: 44px;
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 8px;
  font-size: 16px;
  background: ${p => p.theme.colors.background};
  color: ${p => p.theme.colors.text};
  @media (min-width: 600px) { font-size: 0.875rem; min-height: auto; padding: 8px 12px; }
`;
const FilterSelect = styled.select`
  padding: 10px 12px;
  min-height: 44px;
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 8px;
  font-size: 16px;
  background: ${p => p.theme.colors.background};
  color: ${p => p.theme.colors.text};
  width: 100%;
  min-width: 0;
  @media (min-width: 600px) { font-size: 0.875rem; min-height: auto; min-width: 160px; width: auto; padding: 8px 12px; }
`;
const ClientFilterWrap = styled.div`
  width: 100%;
  min-width: 0;
  @media (min-width: 600px) { min-width: 220px; max-width: 280px; width: auto; }
`;
const TableWrap = styled.div`
  background: ${p => p.theme.colors.cardBackground};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 12px;
  overflow: visible;
`;
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  display: none;
  @media (min-width: 768px) { display: table; }
  th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid ${p => p.theme.colors.border}; }
  th { font-size: 0.75rem; text-transform: uppercase; color: ${p => p.theme.colors.textSecondary}; font-weight: 600; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: ${p => p.theme.colors.backgroundSecondary}; }
`;
const CardList = styled.div`
  display: block;
  padding: 8px;
  @media (min-width: 768px) { display: none; }
`;
const ReportCard = styled.div`
  padding: 16px;
  margin-bottom: 12px;
  background: ${p => p.theme.colors.background};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 12px;
  &:last-child { margin-bottom: 0; }
`;
const ReportCardRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
  &:last-child { margin-bottom: 0; }
`;
const ReportCardLabel = styled.span`
  font-size: 0.75rem;
  color: ${p => p.theme.colors.textSecondary};
  text-transform: uppercase;
`;
const ReportCardActions = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${p => p.theme.colors.border};
`;
const Badge = styled.span<{ $status: string }>`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
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
const ActionsMenuWrap = styled.div`
  position: relative;
  display: inline-flex;
`;
const BtnMenuTrigger = styled.button`
  background: none;
  border: none;
  padding: 8px;
  min-width: 44px;
  min-height: 44px;
  cursor: pointer;
  color: ${p => p.theme.colors.textSecondary};
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  &:hover { color: ${p => p.theme.colors.primary}; background: ${p => p.theme.colors.backgroundSecondary}; }
  @media (min-width: 768px) { min-width: 36px; min-height: 36px; padding: 6px; }
`;
const DropdownMenu = styled.div<{ $open: boolean }>`
  display: ${p => (p.$open ? 'block' : 'none')};
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 4px;
  min-width: 180px;
  background: ${p => p.theme.colors.cardBackground};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  z-index: 1100;
  overflow: hidden;
`;
const DropdownItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: none;
  background: none;
  color: ${p => p.theme.colors.text};
  font-size: 0.875rem;
  text-align: left;
  cursor: pointer;
  &:hover:not(:disabled) { background: ${p => p.theme.colors.backgroundSecondary}; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
  & + & { border-top: 1px solid ${p => p.theme.colors.border}; }
`;
const ModalCloseBtn = styled.button`
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
  color: ${p => p.theme.colors.textSecondary};
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  &:hover { color: ${p => p.theme.colors.text}; background: ${p => p.theme.colors.backgroundSecondary}; }
`;
const Spinner = styled.span`
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid ${p => p.theme.colors.border};
  border-top-color: ${p => p.theme.colors.primary};
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`;
const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: ${p => p.theme.colors.textSecondary};
`;
const LinkModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: ${p => p.theme.colors.text}40;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
`;
const LinkModal = styled.div`
  background: ${p => p.theme.colors.cardBackground};
  border-radius: 12px;
  padding: 20px;
  max-width: 480px;
  width: calc(100% - 32px);
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  margin: 20px;
  @media (min-width: 480px) { padding: 24px; width: 90%; margin: auto; }
`;
const LinkModalTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 1.125rem;
  color: ${p => p.theme.colors.text};
`;
const LinkModalDescription = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${p => p.theme.colors.textSecondary};
`;
const LinkInputRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
  @media (min-width: 400px) { flex-direction: row; }
`;
const LinkInput = styled.input`
  flex: 1;
  padding: 10px 12px;
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 8px;
  font-size: 0.875rem;
  background: ${p => p.theme.colors.background};
  color: ${p => p.theme.colors.text};
`;
const BtnCopy = styled.button`
  padding: 12px 16px;
  min-height: 44px;
  border-radius: 8px;
  border: none;
  background: ${p => p.theme.colors.primary};
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  white-space: nowrap;
  font-size: 0.9375rem;
  &:hover:not(:disabled) { opacity: 0.9; }
  &:disabled { opacity: 0.7; cursor: not-allowed; }
`;

const signatureStatusLabel: Record<string, string> = {
  pending: 'Aguardando assinatura',
  signed: 'Assinado',
  expired: 'Expirado',
};

/** Relatório tem link de assinatura ativo (pendente e não expirado). */
const hasActiveLink = (r: VisitReport): boolean =>
  r.signatureStatus === 'pending' &&
  !!r.signatureExpiresAt &&
  new Date(r.signatureExpiresAt) > new Date();

export interface VisitReportListPageProps {
  scope: 'mine' | 'all';
  pageTitle: string;
  pageSubtitle?: string;
}

const listPathByScope = (scope: 'mine' | 'all') =>
  scope === 'all' ? '/visit-reports' : '/visits';

export const VisitReportListPage: React.FC<VisitReportListPageProps> = ({
  scope,
  pageTitle,
  pageSubtitle = 'Registre os imóveis visitados pelo cliente e gere um link para assinatura.',
}) => {
  const navigate = useNavigate();
  const listPath = listPathByScope(scope);
  const [reports, setReports] = useState<VisitReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; report: VisitReport | null }>({
    open: false,
    report: null,
  });
  const [deleting, setDeleting] = useState(false);
  const [linkModal, setLinkModal] = useState<{ url: string; report: VisitReport } | null>(null);
  const [generatingLink, setGeneratingLink] = useState<string | null>(null);
  const [filterClientId, setFilterClientId] = useState<string | null>(null);
  const [filterClientLabel, setFilterClientLabel] = useState<string>('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null);
    };
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  const hasActiveFilters = !!(filterClientId || filterFromDate || filterToDate || filterStatus !== 'all');
  const clearFilters = () => {
    setFilterClientId(null);
    setFilterClientLabel('');
    setFilterFromDate('');
    setFilterToDate('');
    setFilterStatus('all');
  };

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const list = await visitReportApi.list({
        scope,
        clientId: filterClientId || undefined,
        fromDate: filterFromDate || undefined,
        toDate: filterToDate || undefined,
      });
      let filtered = list;
      if (filterStatus !== 'all') {
        filtered = list.filter(r => r.signatureStatus === filterStatus);
      }
      setReports(filtered);
    } catch (e) {
      toast.error('Erro ao carregar relatórios.');
    } finally {
      setLoading(false);
    }
  }, [scope, filterClientId, filterFromDate, filterToDate, filterStatus]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const openCreate = () => navigate(`${listPath}/create`);
  const openEdit = (r: VisitReport) => navigate(`${listPath}/edit/${r.id}`);

  const handleDelete = async () => {
    if (!deleteModal.report) return;
    setDeleting(true);
    try {
      await visitReportApi.delete(deleteModal.report.id);
      toast.success('Relatório excluído.');
      setDeleteModal({ open: false, report: null });
      loadReports();
    } catch (e) {
      toast.error('Erro ao excluir.');
    } finally {
      setDeleting(false);
    }
  };

  const handleGenerateLink = async (report: VisitReport) => {
    if (report.signatureStatus === 'signed') {
      toast.info('Este relatório já foi assinado.');
      return;
    }
    setGeneratingLink(report.id);
    const promise = visitReportApi
      .generateSignatureLink(report.id, 7)
      .then(res => {
        setLinkModal({ url: res.signatureUrl, report });
        loadReports();
        return res;
      })
      .finally(() => setGeneratingLink(null));
    toast.promise(promise, {
      pending: 'Gerando link de assinatura...',
      success: 'Link gerado! Envie ao cliente.',
      error: (e: any) => e?.response?.data?.message || 'Erro ao gerar link.',
    });
  };

  const handleCopyExistingLink = async (report: VisitReport) => {
    setOpenMenuId(null);
    try {
      const { signatureUrl } = await visitReportApi.getSignatureLink(report.id);
      await navigator.clipboard.writeText(signatureUrl);
      setLinkModal({ url: signatureUrl, report });
      toast.success('Link copiado!');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Link expirado ou não encontrado.');
    }
  };

  const copyLink = async () => {
    if (!linkModal?.url) return;
    try {
      await navigator.clipboard.writeText(linkModal.url);
      toast.success('Link copiado!');
    } catch {
      toast.error('Erro ao copiar.');
    }
  };

  const formatDate = (d: string) => {
    try {
      return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR');
    } catch {
      return d;
    }
  };

  return (
    <Layout>
      <VisitPageContainer>
        <PageHeader>
          <div>
            <PageTitle>{pageTitle}</PageTitle>
            <PageSubtitle style={{ margin: '4px 0 0 0' }}>{pageSubtitle}</PageSubtitle>
          </div>
          <HeaderActions>
            <BtnPrimary onClick={openCreate} title="Criar novo relatório de visita">
              <MdAdd size={20} /> Novo relatório
            </BtnPrimary>
          </HeaderActions>
        </PageHeader>

        <FiltersCard>
          <FiltersTitle>
            <MdFilterList size={20} /> Filtros
          </FiltersTitle>
          <FiltersRow>
            <ClientFilterWrap>
              <FilterLabel>Cliente</FilterLabel>
              <ClientSearchSelect
                value={filterClientId || ''}
                displayLabel={filterClientLabel}
                onSelect={(id, client) => {
                  setFilterClientId(id || null);
                  setFilterClientLabel(client?.name ?? '');
                }}
                placeholder="Todos os clientes"
              />
            </ClientFilterWrap>
            <FilterGroup>
              <FilterLabel>Data de</FilterLabel>
              <FilterInput
                type="date"
                value={filterFromDate}
                onChange={e => setFilterFromDate(e.target.value)}
              />
            </FilterGroup>
            <FilterGroup>
              <FilterLabel>Data até</FilterLabel>
              <FilterInput
                type="date"
                value={filterToDate}
                onChange={e => setFilterToDate(e.target.value)}
              />
            </FilterGroup>
            <FilterGroup>
              <FilterLabel>Status</FilterLabel>
              <FilterSelect
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="pending">Aguardando assinatura</option>
                <option value="signed">Assinado</option>
                <option value="expired">Expirado</option>
              </FilterSelect>
            </FilterGroup>
            {hasActiveFilters && (
              <BtnSecondary onClick={clearFilters} title="Limpar filtros">
                <MdClear size={18} /> Limpar filtros
              </BtnSecondary>
            )}
          </FiltersRow>
        </FiltersCard>

        <TableWrap>
          {loading ? (
            <EmptyState>Carregando...</EmptyState>
          ) : reports.length === 0 ? (
            <EmptyState>
              <MdAssignment size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
              <p>Nenhum relatório ainda.</p>
              <BtnPrimary onClick={openCreate} style={{ marginTop: 16 }}>
                <MdAdd size={20} /> Criar primeiro relatório
              </BtnPrimary>
            </EmptyState>
          ) : (
            <>
              <Table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Cliente</th>
                    <th>Imóveis</th>
                    <th>Status</th>
                    <th style={{ width: 120 }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map(r => (
                    <tr key={r.id}>
                      <td>{formatDate(r.visitDate)}</td>
                      <td>{r.clientName || r.clientId}</td>
                      <td>{r.properties?.length || 0} imóvel(is)</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <Badge $status={r.signatureStatus}>
                            {signatureStatusLabel[r.signatureStatus] || r.signatureStatus}
                          </Badge>
                          {hasActiveLink(r) && r.signatureExpiresAt && (
                            <span style={{ fontSize: 11, color: 'var(--color-text-secondary, #666)' }}>
                              Expira em {formatDate(r.signatureExpiresAt.slice(0, 10))}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <ActionsMenuWrap ref={openMenuId === r.id ? menuRef : undefined}>
                          <BtnMenuTrigger
                            type="button"
                            onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === r.id ? null : r.id); }}
                            title="Ações"
                            aria-haspopup="true"
                            aria-expanded={openMenuId === r.id}
                          >
                            <MdMoreVert size={20} />
                          </BtnMenuTrigger>
                          <DropdownMenu $open={openMenuId === r.id}>
                            <DropdownItem type="button" onClick={() => { setOpenMenuId(null); openEdit(r); }}>
                              <MdEdit size={18} /> Editar
                            </DropdownItem>
                            {hasActiveLink(r) && (
                              <DropdownItem type="button" onClick={() => handleCopyExistingLink(r)}>
                                <MdContentCopy size={18} /> Copiar link
                              </DropdownItem>
                            )}
                            <DropdownItem
                              type="button"
                              disabled={r.signatureStatus === 'signed' || generatingLink === r.id}
                              onClick={() => { setOpenMenuId(null); handleGenerateLink(r); }}
                            >
                              {generatingLink === r.id ? <Spinner /> : <MdLink size={18} />}
                              {generatingLink === r.id ? 'Gerando link...' : hasActiveLink(r) ? 'Gerar novo link' : 'Gerar link de assinatura'}
                            </DropdownItem>
                            <DropdownItem type="button" onClick={() => { setOpenMenuId(null); setDeleteModal({ open: true, report: r }); }}>
                              <MdDelete size={18} /> Excluir
                            </DropdownItem>
                          </DropdownMenu>
                        </ActionsMenuWrap>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <CardList>
                {reports.map(r => (
                  <ReportCard key={r.id}>
                    <ReportCardRow>
                      <ReportCardLabel>Data</ReportCardLabel>
                      <span>{formatDate(r.visitDate)}</span>
                    </ReportCardRow>
                    <ReportCardRow>
                      <ReportCardLabel>Cliente</ReportCardLabel>
                      <span>{r.clientName || r.clientId}</span>
                    </ReportCardRow>
                    <ReportCardRow>
                      <ReportCardLabel>Imóveis</ReportCardLabel>
                      <span>{r.properties?.length || 0} imóvel(is)</span>
                    </ReportCardRow>
                    <ReportCardRow>
                      <ReportCardLabel>Status</ReportCardLabel>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <Badge $status={r.signatureStatus}>
                          {signatureStatusLabel[r.signatureStatus] || r.signatureStatus}
                        </Badge>
                        {hasActiveLink(r) && r.signatureExpiresAt && (
                          <span style={{ fontSize: 11, color: 'var(--color-text-secondary, #666)' }}>
                            Expira em {formatDate(r.signatureExpiresAt.slice(0, 10))}
                          </span>
                        )}
                      </div>
                    </ReportCardRow>
                    <ReportCardActions>
                      <ActionsMenuWrap ref={openMenuId === r.id ? menuRef : undefined}>
                        <BtnMenuTrigger
                          type="button"
                          onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === r.id ? null : r.id); }}
                          title="Ações"
                          aria-haspopup="true"
                          aria-expanded={openMenuId === r.id}
                        >
                          <MdMoreVert size={22} /> Ações
                        </BtnMenuTrigger>
                        <DropdownMenu $open={openMenuId === r.id}>
                          <DropdownItem type="button" onClick={() => { setOpenMenuId(null); openEdit(r); }}>
                            <MdEdit size={18} /> Editar
                          </DropdownItem>
                          {hasActiveLink(r) && (
                            <DropdownItem type="button" onClick={() => handleCopyExistingLink(r)}>
                              <MdContentCopy size={18} /> Copiar link
                            </DropdownItem>
                          )}
                          <DropdownItem
                            type="button"
                            disabled={r.signatureStatus === 'signed' || generatingLink === r.id}
                            onClick={() => { setOpenMenuId(null); handleGenerateLink(r); }}
                          >
                            {generatingLink === r.id ? <Spinner /> : <MdLink size={18} />}
                            {generatingLink === r.id ? 'Gerando link...' : hasActiveLink(r) ? 'Gerar novo link' : 'Gerar link de assinatura'}
                          </DropdownItem>
                          <DropdownItem type="button" onClick={() => { setOpenMenuId(null); setDeleteModal({ open: true, report: r }); }}>
                            <MdDelete size={18} /> Excluir
                          </DropdownItem>
                        </DropdownMenu>
                      </ActionsMenuWrap>
                    </ReportCardActions>
                  </ReportCard>
                ))}
              </CardList>
            </>
          )}
        </TableWrap>

        <ConfirmDeleteModal
          isOpen={deleteModal.open}
          onClose={() => !deleting && setDeleteModal({ open: false, report: null })}
          onConfirm={handleDelete}
          title="Excluir relatório"
          message="O relatório de visita será excluído. Esta ação não pode ser desfeita."
          itemName={deleteModal.report?.clientName || 'Relatório'}
          isLoading={deleting}
        />

        {linkModal && (
          <LinkModalOverlay onClick={() => setLinkModal(null)}>
            <LinkModal onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <LinkModalTitle>Link de assinatura</LinkModalTitle>
                <ModalCloseBtn type="button" onClick={() => setLinkModal(null)} title="Fechar"><MdClose size={20} /></ModalCloseBtn>
              </div>
              <LinkModalDescription>
                Envie este link ao cliente para que ele confirme os imóveis visitados e assine.
              </LinkModalDescription>
              <LinkInputRow>
                <LinkInput readOnly value={linkModal.url} />
                <BtnCopy onClick={copyLink} title="Copiar link para a área de transferência">
                  <MdContentCopy size={18} /> Copiar
                </BtnCopy>
              </LinkInputRow>
            </LinkModal>
          </LinkModalOverlay>
        )}
      </VisitPageContainer>
    </Layout>
  );
};
