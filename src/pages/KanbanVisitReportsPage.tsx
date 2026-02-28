import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { MdArrowBack, MdAdd, MdEdit, MdLink, MdDelete, MdContentCopy, MdClose, MdAssignment, MdFilterList, MdMoreVert } from 'react-icons/md';
import { Layout } from '../components/layout/Layout';
import { visitReportApi } from '../services/visitReportApi';
import type { VisitReport } from '../types/visitReport';
import { ClientSearchSelect } from '../components/visit-report/ClientSearchSelect';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import { toast } from 'react-toastify';
import { usePermissionsContextOptional } from '../contexts/PermissionsContext';

const PageContainer = styled.div`
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0 16px 24px;
  box-sizing: border-box;
  @media (min-width: 600px) { padding: 0 20px 28px; }
  @media (min-width: 1440px) { padding: 0 24px 32px; }
`;

const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 0 -16px 0;
  padding: 16px 16px 20px;
  border-bottom: 1px solid ${p => p.theme.colors?.border ?? '#e5e7eb'};
  @media (min-width: 600px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    padding: 20px 16px 24px;
  }
  @media (min-width: 1440px) {
    margin: 0 -24px 0;
    padding: 24px 24px 28px;
  }
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 0;
  min-height: 44px;
  margin-bottom: 4px;
  background: none;
  border: none;
  color: ${p => p.theme.colors?.textSecondary ?? '#6b7280'};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  &:hover { color: ${p => p.theme.colors?.text}; }
  @media (min-width: 768px) { min-height: auto; padding: 6px 0; }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  color: ${p => p.theme.colors?.text ?? '#111'};
  @media (min-width: 600px) { font-size: 1.5rem; }
`;

const Subtitle = styled.p`
  margin: 4px 0 0 0;
  font-size: 0.875rem;
  color: ${p => p.theme.colors?.textSecondary ?? '#6b7280'};
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
  background: ${p => p.theme.colors?.primary};
  color: #fff;
  font-weight: 500;
  font-size: 0.9375rem;
  cursor: pointer;
  width: 100%;
  &:hover:not(:disabled) { opacity: 0.9; }
  &:disabled { opacity: 0.7; cursor: not-allowed; }
  @media (min-width: 600px) { width: auto; min-height: auto; padding: 10px 18px; }
`;

const FiltersCard = styled.div`
  background: ${p => p.theme.colors?.cardBackground ?? '#fff'};
  border: 1px solid ${p => p.theme.colors?.border ?? '#e5e7eb'};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
`;

const FilterRow = styled.div`
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
  font-weight: 500;
  color: ${p => p.theme.colors?.textSecondary ?? '#6b7280'};
`;

const FilterInput = styled.input`
  padding: 10px 12px;
  min-height: 44px;
  border: 1px solid ${p => p.theme.colors?.border ?? '#e5e7eb'};
  border-radius: 8px;
  font-size: 16px;
  background: ${p => p.theme.colors?.background};
  color: ${p => p.theme.colors?.text};
  @media (min-width: 600px) { font-size: 0.875rem; min-height: auto; padding: 8px 12px; }
`;

const SelectWrap = styled.div`
  width: 100%;
  min-width: 0;
  @media (min-width: 600px) { min-width: 220px; max-width: 280px; width: auto; }
`;

const TableWrap = styled.div`
  background: ${p => p.theme.colors?.cardBackground ?? '#fff'};
  border: 1px solid ${p => p.theme.colors?.border ?? '#e5e7eb'};
  border-radius: 12px;
  overflow: visible;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  display: none;
  @media (min-width: 768px) { display: table; }
  th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid ${p => p.theme.colors?.border ?? '#e5e7eb'}; }
  th { font-size: 0.75rem; text-transform: uppercase; color: ${p => p.theme.colors?.textSecondary ?? '#6b7280'}; font-weight: 600; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: ${p => p.theme.colors?.backgroundSecondary ?? '#f9fafb'}; }
`;

const CardList = styled.div`
  display: block;
  padding: 8px;
  @media (min-width: 768px) { display: none; }
`;

const ReportCard = styled.div`
  padding: 16px;
  margin-bottom: 12px;
  background: ${p => p.theme.colors?.background};
  border: 1px solid ${p => p.theme.colors?.border};
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
  color: ${p => p.theme.colors?.textSecondary};
  text-transform: uppercase;
`;

const ReportCardActions = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${p => p.theme.colors?.border};
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
  color: ${p => p.theme.colors?.textSecondary ?? '#6b7280'};
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  &:hover { color: ${p => p.theme.colors?.primary}; background: ${p => p.theme.colors?.backgroundSecondary}; }
  @media (min-width: 768px) { min-width: 36px; min-height: 36px; padding: 6px; }
`;
const DropdownMenu = styled.div<{ $open: boolean }>`
  display: ${p => (p.$open ? 'block' : 'none')};
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 4px;
  min-width: 180px;
  background: ${p => p.theme.colors?.cardBackground ?? '#fff'};
  border: 1px solid ${p => p.theme.colors?.border ?? '#e5e7eb'};
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
  color: ${p => p.theme.colors?.text ?? '#111'};
  font-size: 0.875rem;
  text-align: left;
  cursor: pointer;
  &:hover:not(:disabled) { background: ${p => p.theme.colors?.backgroundSecondary ?? '#f9fafb'}; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
  & + & { border-top: 1px solid ${p => p.theme.colors?.border ?? '#e5e7eb'}; }
`;
const ModalCloseBtn = styled.button`
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
  color: ${p => p.theme.colors?.textSecondary ?? '#6b7280'};
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  &:hover { color: ${p => p.theme.colors?.text}; background: ${p => p.theme.colors?.backgroundSecondary}; }
`;

const Spinner = styled.span`
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid ${p => p.theme.colors?.border ?? '#e5e7eb'};
  border-top-color: ${p => p.theme.colors?.primary};
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: ${p => p.theme.colors?.textSecondary ?? '#6b7280'};
`;

const LinkModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: ${p => `${p.theme.colors?.text ?? '#111'}40`};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
`;

const LinkModal = styled.div`
  background: ${p => p.theme.colors?.cardBackground ?? '#fff'};
  border-radius: 12px;
  padding: 20px;
  max-width: 480px;
  width: calc(100% - 32px);
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  margin: 20px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  @media (min-width: 480px) { padding: 24px; width: 90%; margin: auto; }
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
  border: 1px solid ${p => p.theme.colors?.border};
  border-radius: 8px;
  font-size: 0.875rem;
  background: ${p => p.theme.colors?.background};
  color: ${p => p.theme.colors?.text};
`;

const BtnCopy = styled.button`
  padding: 12px 16px;
  min-height: 44px;
  border-radius: 8px;
  border: none;
  background: ${p => p.theme.colors?.primary};
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 0.9375rem;
  &:hover:not(:disabled) { opacity: 0.9; }
  &:disabled { opacity: 0.7; cursor: not-allowed; }
`;

const signatureStatusLabel: Record<string, string> = {
  pending: 'Aguardando assinatura',
  signed: 'Assinado',
  expired: 'Expirado',
};

const hasActiveLink = (r: VisitReport): boolean =>
  r.signatureStatus === 'pending' &&
  !!r.signatureExpiresAt &&
  new Date(r.signatureExpiresAt) > new Date();

export const KanbanVisitReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const permissionsContext = usePermissionsContextOptional();
  const hasVisitManage = permissionsContext?.hasPermission?.('visit:manage') ?? false;
  const [reports, setReports] = useState<VisitReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterClientId, setFilterClientId] = useState('');
  const [filterClientLabel, setFilterClientLabel] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [filterProperty, setFilterProperty] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; report: VisitReport | null }>({ open: false, report: null });
  const [deleting, setDeleting] = useState(false);
  const [linkModal, setLinkModal] = useState<{ url: string; report: VisitReport } | null>(null);
  const [generatingLink, setGeneratingLink] = useState<string | null>(null);
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

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const list = await visitReportApi.list({
        scope: hasVisitManage ? 'all' : 'mine',
        clientId: filterClientId || undefined,
        fromDate: filterFromDate || undefined,
        toDate: filterToDate || undefined,
      });
      setReports(list);
    } catch (e) {
      toast.error('Erro ao carregar relatórios.');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [hasVisitManage, filterClientId, filterFromDate, filterToDate]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const propertySearchLower = filterProperty.trim().toLowerCase();
  const filteredReports = propertySearchLower
    ? reports.filter(r =>
        r.properties?.some(
          p =>
            (p.address && p.address.toLowerCase().includes(propertySearchLower)) ||
            (p.reference && p.reference.toLowerCase().includes(propertySearchLower)) ||
            (p.propertyCode && p.propertyCode.toLowerCase().includes(propertySearchLower))
        )
      )
    : reports;

  const formatDate = (d: string) => {
    try {
      return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR');
    } catch {
      return d;
    }
  };

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

  return (
    <Layout>
      <PageContainer>
        <Header>
          <div>
            <BackButton type="button" onClick={() => navigate('/kanban')}>
              <MdArrowBack size={18} /> Voltar ao Kanban
            </BackButton>
            <Title>Relatórios de visita</Title>
            <Subtitle>
              Todos os relatórios da empresa. Filtre por cliente, data ou imóvel.
            </Subtitle>
          </div>
          <BtnPrimary onClick={() => navigate('/visit-reports/create')} title="Criar novo relatório de visita">
            <MdAdd size={20} /> Novo relatório
          </BtnPrimary>
        </Header>

        <FiltersCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
            <MdFilterList size={20} /> Filtros
          </div>
          <FilterRow>
            <SelectWrap>
              <FilterLabel>Cliente</FilterLabel>
              <ClientSearchSelect
                value={filterClientId}
                displayLabel={filterClientLabel}
                onSelect={(id, client) => {
                  setFilterClientId(id);
                  setFilterClientLabel(client?.name ?? '');
                }}
                placeholder="Todos os clientes"
              />
            </SelectWrap>
            <FilterGroup>
              <FilterLabel>Data da visita (de)</FilterLabel>
              <FilterInput
                type="date"
                value={filterFromDate}
                onChange={e => setFilterFromDate(e.target.value)}
              />
            </FilterGroup>
            <FilterGroup>
              <FilterLabel>Data da visita (até)</FilterLabel>
              <FilterInput
                type="date"
                value={filterToDate}
                onChange={e => setFilterToDate(e.target.value)}
              />
            </FilterGroup>
            <FilterGroup style={{ minWidth: 180 }}>
              <FilterLabel>Imóvel (endereço ou código)</FilterLabel>
              <FilterInput
                type="text"
                placeholder="Buscar por imóvel..."
                value={filterProperty}
                onChange={e => setFilterProperty(e.target.value)}
              />
            </FilterGroup>
          </FilterRow>
        </FiltersCard>

        <TableWrap>
          {loading ? (
            <EmptyState>Carregando...</EmptyState>
          ) : filteredReports.length === 0 ? (
            <EmptyState>
              <MdAssignment size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
              <p>Nenhum relatório encontrado.</p>
              <BtnPrimary onClick={() => navigate('/visit-reports/create')} style={{ marginTop: 16 }}>
                <MdAdd size={20} /> Criar relatório
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
                  {filteredReports.map(r => (
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
                          <DropdownItem type="button" onClick={() => { setOpenMenuId(null); navigate(`/visit-reports/edit/${r.id}`); }}>
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
                {filteredReports.map(r => (
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
                          <DropdownItem type="button" onClick={() => { setOpenMenuId(null); navigate(`/visit-reports/edit/${r.id}`); }}>
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
                <strong style={{ color: 'var(--color-text)' }}>Link de assinatura</strong>
                <ModalCloseBtn type="button" onClick={() => setLinkModal(null)} title="Fechar"><MdClose size={20} /></ModalCloseBtn>
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: 14, color: 'var(--color-text-secondary)' }}>
                Envie este link ao cliente para assinatura.
              </p>
              <LinkInputRow>
                <LinkInput readOnly value={linkModal.url} />
                <BtnCopy onClick={copyLink} title="Copiar link">
                  <MdContentCopy size={18} /> Copiar
                </BtnCopy>
              </LinkInputRow>
            </LinkModal>
          </LinkModalOverlay>
        )}
      </PageContainer>
    </Layout>
  );
};

export default KanbanVisitReportsPage;
