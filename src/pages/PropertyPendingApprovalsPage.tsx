import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { MdCheckCircle, MdCancel } from 'react-icons/md';
import { Layout } from '../components/layout/Layout';
import { usePermissionsContextOptional } from '../contexts/PermissionsContext';
import { useAuth } from '../hooks/useAuth';
import { useRoleAccess } from '../hooks/useRoleAccess';
import { propertyApi } from '../services/propertyApi';
import type { Property } from '../types/property';
import { toast } from 'react-toastify';
import {
  PageHeader,
  PageTitleContainer,
  PageTitle,
  PageSubtitle,
} from '../styles/components/PageStyles';
import { PageContainer, PageContent } from '../styles/pages/PropertiesPageStyles';
import { createPortal } from 'react-dom';

const TabsWrap = styled.div`
  display: flex;
  gap: 0;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid ${(p) => p.theme.colors?.border ?? '#e5e7eb'};
  flex-wrap: wrap;
`;

const Tab = styled.button<{ $active?: boolean }>`
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  color: ${(p) =>
    p.$active ? p.theme.colors?.primary ?? '#2563eb' : p.theme.colors?.textSecondary ?? '#6b7280'};
  background: none;
  border: none;
  border-bottom: 2px solid
    ${(p) => (p.$active ? p.theme.colors?.primary ?? '#2563eb' : 'transparent')};
  margin-bottom: -1px;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;

  &:hover {
    color: ${(p) => p.theme.colors?.primary ?? '#2563eb'};
  }
`;

const ListCard = styled.div`
  background: ${(p) => p.theme.colors?.cardBackground ?? '#fff'};
  border: 1px solid ${(p) => p.theme.colors?.border ?? '#e5e7eb'};
  border-radius: 12px;
  overflow: hidden;
`;

// Shimmer – mesma grade da lista, animação de luz passando
const shimmerSweep = keyframes`
  0% { background-position: -280px 0; }
  100% { background-position: calc(280px + 100%) 0; }
`;

const ShimmerBox = styled.div<{ $w?: string; $h?: string }>`
  height: ${(p) => p.$h ?? '14px'};
  width: ${(p) => p.$w ?? '100%'};
  max-width: 100%;
  border-radius: 6px;
  overflow: hidden;
  background: linear-gradient(
    90deg,
    ${(p) => p.theme.colors?.backgroundSecondary ?? '#eaeaea'} 0%,
    ${(p) => p.theme.colors?.backgroundSecondary ?? '#eaeaea'} 30%,
    rgba(255, 255, 255, 0.7) 50%,
    ${(p) => p.theme.colors?.backgroundSecondary ?? '#eaeaea'} 70%,
    ${(p) => p.theme.colors?.backgroundSecondary ?? '#eaeaea'} 100%
  );
  background-size: 280px 100%;
  background-repeat: no-repeat;
  animation: ${shimmerSweep} 1.6s ease-in-out infinite;
`;

const ShimmerRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 100px 120px 140px minmax(100px, 1fr);
  gap: 12px;
  padding: 14px 16px;
  align-items: center;
  border-bottom: 1px solid ${(p) => p.theme.colors?.border ?? '#e5e7eb'};

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr 80px;
    gap: 8px;
  }
`;

const ShimmerRowActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ListHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 100px 120px 140px minmax(100px, 1fr);
  gap: 12px;
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  color: ${(p) => p.theme.colors?.textSecondary ?? '#6b7280'};
  text-transform: uppercase;
  background: ${(p) => p.theme.colors?.backgroundSecondary ?? '#f9fafb'};
  border-bottom: 1px solid ${(p) => p.theme.colors?.border ?? '#e5e7eb'};

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr 80px;
  }
`;

const ListRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 100px 120px 140px minmax(100px, 1fr);
  gap: 12px;
  padding: 14px 16px;
  align-items: center;
  border-bottom: 1px solid ${(p) => p.theme.colors?.border ?? '#e5e7eb'};
  transition: background 0.15s;

  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background: ${(p) => p.theme.colors?.hover ?? 'rgba(0,0,0,0.02)'};
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr 80px;
    gap: 8px;
  }
`;

const PropertyLink = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  font-weight: 600;
  color: ${(p) => p.theme.colors?.primary ?? '#2563eb'};
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

const Cell = styled.span`
  font-size: 14px;
  color: ${(p) => p.theme.colors?.text ?? '#111'};

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const CellSecondary = styled(Cell)`
  color: ${(p) => p.theme.colors?.textSecondary ?? '#6b7280'};
`;

const ActionBtn = styled.button<{ $variant?: 'approve' | 'reject' }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 8px;
  border: 1px solid
    ${(p) =>
      p.$variant === 'reject'
        ? p.theme.colors?.error ?? '#dc2626'
        : p.theme.colors?.primary ?? '#2563eb'};
  background: ${(p) =>
    p.$variant === 'reject'
      ? 'transparent'
      : p.theme.colors?.primary ?? '#2563eb'};
  color: ${(p) =>
    p.$variant === 'reject'
      ? p.theme.colors?.error ?? '#dc2626'
      : '#fff'};
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ActionsCell = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: ${(p) => p.theme.colors?.textSecondary ?? '#6b7280'};
`;

const ConfigSection = styled.div`
  max-width: 480px;
  background: ${(p) => p.theme.colors?.cardBackground ?? '#fff'};
  border: 1px solid ${(p) => p.theme.colors?.border ?? '#e5e7eb'};
  border-radius: 12px;
  padding: 24px;
`;

const ConfigRow = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  margin-bottom: 16px;

  input {
    width: 18px;
    height: 18px;
  }
  span {
    font-size: 15px;
    color: ${(p) => p.theme.colors?.text ?? '#111'};
  }
`;

const ConfigSave = styled.button`
  margin-top: 8px;
  padding: 10px 20px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  background: ${(p) => p.theme.colors?.primary ?? '#2563eb'};
  color: #fff;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Modal de motivo da recusa
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: 20px;
`;

const ModalBox = styled.div`
  background: ${(p) => p.theme.colors?.cardBackground ?? '#fff'};
  border-radius: 16px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 440px;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid ${(p) => p.theme.colors?.border ?? '#e5e7eb'};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  color: ${(p) => p.theme.colors?.text ?? '#111'};
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const ReasonTextarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px;
  font-size: 14px;
  border: 1px solid ${(p) => p.theme.colors?.border ?? '#e5e7eb'};
  border-radius: 8px;
  resize: vertical;
  color: ${(p) => p.theme.colors?.text ?? '#111'};
  background: ${(p) => p.theme.colors?.background ?? '#fff'};

  &::placeholder {
    color: ${(p) => p.theme.colors?.textSecondary ?? '#9ca3af'};
  }
`;

const ModalFooter = styled.div`
  padding: 16px 24px;
  border-top: 1px solid ${(p) => p.theme.colors?.border ?? '#e5e7eb'};
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '-';
  }
};

type TabId = 'mine' | 'availability' | 'publication' | 'settings';

const PropertyPendingApprovalsPage: React.FC = () => {
  const navigate = useNavigate();
  const permissions = usePermissionsContextOptional();
  const { getCurrentUser } = useAuth();
  const { isMaster } = useRoleAccess();
  const currentUser = getCurrentUser();
  const isAdminOrMaster =
    currentUser?.role === 'admin' || currentUser?.role === 'master' || (typeof isMaster === 'function' && isMaster());
  const permissionsLoaded = !permissions?.isLoading;
  const hasView = isAdminOrMaster || (permissions?.hasPermission('property:view') ?? false);
  const canApproveAvailability = isAdminOrMaster || (permissions?.hasPermission('property:approve_availability') ?? false);
  const canApprovePublication = isAdminOrMaster || (permissions?.hasPermission('property:approve_publication') ?? false);
  const canManageSettings =
    isAdminOrMaster || (permissionsLoaded && (permissions?.hasPermission('property:manage_approval_settings') ?? false));

  const [activeTab, setActiveTab] = useState<TabId>('mine');
  const [myPending, setMyPending] = useState<{
    pendingAvailability: Property[];
    pendingPublication: Property[];
  }>({ pendingAvailability: [], pendingPublication: [] });
  const [pendingAvailabilityList, setPendingAvailabilityList] = useState<Property[]>([]);
  const [pendingPublicationList, setPendingPublicationList] = useState<Property[]>([]);
  const [settings, setSettings] = useState<{
    requireApprovalToBeAvailable: boolean;
    requireApprovalToPublishOnSite: boolean;
    applyWatermarkToImages: boolean;
  }>({
    requireApprovalToBeAvailable: false,
    requireApprovalToPublishOnSite: false,
    applyWatermarkToImages: true,
  });
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [rejectModal, setRejectModal] = useState<{
    open: boolean;
    type: 'availability' | 'publication';
    propertyId: string;
    propertyTitle: string;
  }>({ open: false, type: 'availability', propertyId: '', propertyTitle: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [rejectSubmitting, setRejectSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [approveModal, setApproveModal] = useState<{
    open: boolean;
    type: 'availability' | 'publication';
    propertyId: string;
    propertyTitle: string;
  }>({ open: false, type: 'availability', propertyId: '', propertyTitle: '' });
  const [approveApplyWatermark, setApproveApplyWatermark] = useState(true);

  const loadMyPending = useCallback(async () => {
    if (!hasView) return;
    try {
      const data = await propertyApi.getMyPending();
      setMyPending(data);
    } catch {
      toast.error('Erro ao carregar seus pendentes.');
    } finally {
      setLoading(false);
    }
  }, [hasView]);

  const loadPendingAvailability = useCallback(async () => {
    if (!canApproveAvailability) return;
    try {
      const list = await propertyApi.getPendingApproval();
      setPendingAvailabilityList(list);
    } catch {
      toast.error('Erro ao carregar pendentes de disponibilidade.');
    } finally {
      setLoading(false);
    }
  }, [canApproveAvailability]);

  const loadPendingPublication = useCallback(async () => {
    if (!canApprovePublication) return;
    try {
      const list = await propertyApi.getPendingPublication();
      setPendingPublicationList(list);
    } catch {
      toast.error('Erro ao carregar fila de publicação.');
    } finally {
      setLoading(false);
    }
  }, [canApprovePublication]);

  const loadSettings = useCallback(async () => {
    if (!canManageSettings) return;
    try {
      const data = await propertyApi.getApprovalSettings();
      setSettings({
        requireApprovalToBeAvailable: data.requireApprovalToBeAvailable ?? false,
        requireApprovalToPublishOnSite: data.requireApprovalToPublishOnSite ?? false,
        applyWatermarkToImages: data.applyWatermarkToImages ?? true,
      });
    } catch {
      toast.error('Erro ao carregar configurações de aprovação.');
    } finally {
      setLoading(false);
    }
  }, [canManageSettings]);

  useEffect(() => {
    setLoading(true);
    if (activeTab === 'mine') loadMyPending();
    else if (activeTab === 'availability') {
      if (canApproveAvailability) {
        Promise.all([loadPendingAvailability(), loadSettings()]).finally(() =>
          setLoading(false),
        );
      } else {
        loadPendingAvailability();
      }
    } else if (activeTab === 'publication') {
      if (canApprovePublication) {
        Promise.all([loadPendingPublication(), loadSettings()]).finally(() =>
          setLoading(false),
        );
      } else {
        loadPendingPublication();
      }
    } else if (activeTab === 'settings') loadSettings();
    else setLoading(false);
  }, [
    activeTab,
    loadMyPending,
    loadPendingAvailability,
    loadPendingPublication,
    loadSettings,
    canApproveAvailability,
    canApprovePublication,
  ]);

  const handleApproveAvailability = async (
    id: string,
    applyWatermark?: boolean,
  ) => {
    setActionLoadingId(id);
    try {
      await propertyApi.approveAvailability(id, {
        applyWatermark:
          settings.applyWatermarkToImages ? applyWatermark : undefined,
      });
      toast.success('Disponibilidade aprovada.');
      setApproveModal((m) => ({ ...m, open: false }));
      loadPendingAvailability();
      loadMyPending();
    } catch {
      toast.error('Erro ao aprovar disponibilidade.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectAvailability = async () => {
    if (!rejectModal.propertyId || !rejectReason.trim()) {
      toast.error('Informe o motivo da recusa.');
      return;
    }
    setRejectSubmitting(true);
    try {
      await propertyApi.rejectAvailability(rejectModal.propertyId, rejectReason.trim());
      toast.success('Disponibilidade recusada.');
      setRejectModal({ open: false, type: 'availability', propertyId: '', propertyTitle: '' });
      setRejectReason('');
      loadPendingAvailability();
      loadMyPending();
    } catch {
      toast.error('Erro ao recusar disponibilidade.');
    } finally {
      setRejectSubmitting(false);
    }
  };

  const handleApprovePublication = async (
    id: string,
    applyWatermark?: boolean,
  ) => {
    setActionLoadingId(id);
    try {
      await propertyApi.approvePublication(id, {
        applyWatermark:
          settings.applyWatermarkToImages ? applyWatermark : undefined,
      });
      toast.success('Publicação aprovada.');
      setApproveModal((m) => ({ ...m, open: false }));
      loadPendingPublication();
      loadMyPending();
    } catch {
      toast.error('Erro ao aprovar publicação.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectPublication = async () => {
    if (!rejectModal.propertyId || !rejectReason.trim()) {
      toast.error('Informe o motivo da recusa.');
      return;
    }
    setRejectSubmitting(true);
    try {
      await propertyApi.rejectPublication(rejectModal.propertyId, rejectReason.trim());
      toast.success('Publicação recusada.');
      setRejectModal({ open: false, type: 'publication', propertyId: '', propertyTitle: '' });
      setRejectReason('');
      loadPendingPublication();
      loadMyPending();
    } catch {
      toast.error('Erro ao recusar publicação.');
    } finally {
      setRejectSubmitting(false);
    }
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      await propertyApi.updateApprovalSettings(settings);
      toast.success('Configurações salvas.');
    } catch {
      toast.error('Erro ao salvar configurações.');
    } finally {
      setSavingSettings(false);
    }
  };

  const openRejectModal = (type: 'availability' | 'publication', prop: Property) => {
    setRejectModal({
      open: true,
      type,
      propertyId: prop.id,
      propertyTitle: prop.title || prop.code || prop.id,
    });
    setRejectReason('');
  };

  const openApproveModal = (type: 'availability' | 'publication', prop: Property) => {
    setApproveModal({
      open: true,
      type,
      propertyId: prop.id,
      propertyTitle: prop.title || prop.code || prop.id,
    });
    setApproveApplyWatermark(true);
  };

  const confirmApproveModal = () => {
    if (!approveModal.propertyId) return;
    if (approveModal.type === 'availability') {
      handleApproveAvailability(approveModal.propertyId, approveApplyWatermark);
    } else {
      handleApprovePublication(approveModal.propertyId, approveApplyWatermark);
    }
  };

  const tabs: { id: TabId; label: string; show: boolean }[] = [
    { id: 'mine', label: 'Meus pendentes', show: hasView },
    { id: 'availability', label: 'Aguardando disponibilidade', show: canApproveAvailability },
    { id: 'publication', label: 'Fila de publicação', show: canApprovePublication },
    { id: 'settings', label: 'Configuração', show: canManageSettings },
  ].filter((t) => t.show);

  const defaultTab = tabs[0]?.id ?? 'mine';
  const effectiveTab = tabs.some((t) => t.id === activeTab) ? activeTab : defaultTab;

  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <PageTitleContainer>
            <PageTitle>Aprovações de imóveis</PageTitle>
            <PageSubtitle>
              {canManageSettings
                ? 'Pendências de disponibilidade, publicação no site e configurações.'
                : 'Pendências de disponibilidade e publicação no site.'}
            </PageSubtitle>
          </PageTitleContainer>
        </PageHeader>

        {tabs.length > 0 && (
          <TabsWrap>
            {tabs.map((t) => (
              <Tab
                key={t.id}
                type="button"
                $active={effectiveTab === t.id}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </Tab>
            ))}
          </TabsWrap>
        )}

        <PageContent>
          {loading && effectiveTab !== 'settings' && (
            <ListCard>
              <ListHeader>
                <span>Imóvel</span>
                <span>Código</span>
                <span>Responsável</span>
                <span>Data</span>
                <span>{effectiveTab === 'mine' ? '' : 'Ações'}</span>
              </ListHeader>
              {[1, 2, 3, 4, 5].map((i) => (
                <ShimmerRow key={i}>
                  <ShimmerBox $w="70%" $h="16px" />
                  <ShimmerBox $w="60px" $h="14px" />
                  <ShimmerBox $w="80px" $h="14px" />
                  <ShimmerBox $w="72px" $h="14px" />
                  {effectiveTab !== 'mine' && (
                    <ShimmerRowActions>
                      <ShimmerBox $w="72px" $h="32px" />
                      <ShimmerBox $w="68px" $h="32px" />
                    </ShimmerRowActions>
                  )}
                </ShimmerRow>
              ))}
            </ListCard>
          )}

          {loading && effectiveTab === 'settings' && (
            <ConfigSection>
              <ShimmerBox $h="24px" style={{ marginBottom: 16 }} />
              <ShimmerBox $h="24px" style={{ marginBottom: 16 }} />
              <ShimmerBox $w="80px" $h="40px" style={{ marginTop: 8 }} />
            </ConfigSection>
          )}

          {!loading && effectiveTab === 'mine' && (
            <>
              <SectionBlock
                title="Aguardando aprovação de disponibilidade"
                list={myPending.pendingAvailability}
                onOpenProperty={(id) => navigate(`/properties/${id}`)}
              />
              <SectionBlock
                title="Aguardando aprovação de publicação no site"
                list={myPending.pendingPublication}
                onOpenProperty={(id) => navigate(`/properties/${id}`)}
              />
              {myPending.pendingAvailability.length === 0 &&
                myPending.pendingPublication.length === 0 && (
                  <EmptyState>Nenhum imóvel seu pendente de aprovação.</EmptyState>
                )}
            </>
          )}

          {!loading && effectiveTab === 'availability' && (
            <ListCard>
              <ListHeader>
                <span>Imóvel</span>
                <span>Código</span>
                <span>Responsável</span>
                <span>Data</span>
                <span>Ações</span>
              </ListHeader>
              {pendingAvailabilityList.length === 0 ? (
                <EmptyState>Nenhum imóvel aguardando aprovação de disponibilidade.</EmptyState>
              ) : (
                pendingAvailabilityList.map((prop) => (
                  <ListRow key={prop.id}>
                    <Cell>
                      <PropertyLink type="button" onClick={() => navigate(`/properties/${prop.id}`)}>
                        {prop.title || prop.code || 'Sem título'}
                      </PropertyLink>
                    </Cell>
                    <CellSecondary>{prop.code ?? '-'}</CellSecondary>
                    <CellSecondary>
                      {(prop as any).responsibleUser?.name ?? (prop as any).capturedBy?.name ?? '-'}
                    </CellSecondary>
                    <CellSecondary>{formatDate(prop.updatedAt)}</CellSecondary>
                    <ActionsCell>
                      <ActionBtn
                        $variant="approve"
                        onClick={() =>
                          settings.applyWatermarkToImages
                            ? openApproveModal('availability', prop)
                            : handleApproveAvailability(prop.id)
                        }
                        disabled={actionLoadingId === prop.id}
                      >
                        <MdCheckCircle />
                        Aprovar
                      </ActionBtn>
                      <ActionBtn
                        $variant="reject"
                        onClick={() => openRejectModal('availability', prop)}
                        disabled={actionLoadingId === prop.id}
                      >
                        <MdCancel />
                        Recusar
                      </ActionBtn>
                    </ActionsCell>
                  </ListRow>
                ))
              )}
            </ListCard>
          )}

          {!loading && effectiveTab === 'publication' && (
            <ListCard>
              <ListHeader>
                <span>Imóvel</span>
                <span>Código</span>
                <span>Responsável</span>
                <span>Data</span>
                <span>Ações</span>
              </ListHeader>
              {pendingPublicationList.length === 0 ? (
                <EmptyState>Nenhum imóvel na fila de publicação.</EmptyState>
              ) : (
                pendingPublicationList.map((prop) => (
                  <ListRow key={prop.id}>
                    <Cell>
                      <PropertyLink type="button" onClick={() => navigate(`/properties/${prop.id}`)}>
                        {prop.title || prop.code || 'Sem título'}
                      </PropertyLink>
                    </Cell>
                    <CellSecondary>{prop.code ?? '-'}</CellSecondary>
                    <CellSecondary>
                      {(prop as any).responsibleUser?.name ?? (prop as any).capturedBy?.name ?? '-'}
                    </CellSecondary>
                    <CellSecondary>{formatDate(prop.updatedAt)}</CellSecondary>
                    <ActionsCell>
                      <ActionBtn
                        $variant="approve"
                        onClick={() =>
                          settings.applyWatermarkToImages
                            ? openApproveModal('publication', prop)
                            : handleApprovePublication(prop.id)
                        }
                        disabled={actionLoadingId === prop.id}
                      >
                        <MdCheckCircle />
                        Aprovar
                      </ActionBtn>
                      <ActionBtn
                        $variant="reject"
                        onClick={() => openRejectModal('publication', prop)}
                        disabled={actionLoadingId === prop.id}
                      >
                        <MdCancel />
                        Recusar
                      </ActionBtn>
                    </ActionsCell>
                  </ListRow>
                ))
              )}
            </ListCard>
          )}

          {!loading && canManageSettings && effectiveTab === 'settings' && (
            <ConfigSection>
              <ConfigRow>
                <input
                  type="checkbox"
                  checked={settings.requireApprovalToBeAvailable}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, requireApprovalToBeAvailable: e.target.checked }))
                  }
                />
                <span>Exigir aprovação para imóvel ficar disponível</span>
              </ConfigRow>
              <ConfigRow>
                <input
                  type="checkbox"
                  checked={settings.requireApprovalToPublishOnSite}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, requireApprovalToPublishOnSite: e.target.checked }))
                  }
                />
                <span>Exigir aprovação para publicar no site</span>
              </ConfigRow>
              <ConfigRow>
                <input
                  type="checkbox"
                  checked={settings.applyWatermarkToImages}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, applyWatermarkToImages: e.target.checked }))
                  }
                />
                <span>Aplicar marca d&apos;água nas imagens dos imóveis</span>
              </ConfigRow>
              <ConfigSave onClick={saveSettings} disabled={savingSettings}>
                {savingSettings ? 'Salvando...' : 'Salvar'}
              </ConfigSave>
            </ConfigSection>
          )}
        </PageContent>
      </PageContainer>

      {approveModal.open &&
        createPortal(
          <ModalOverlay
            onClick={() =>
              actionLoadingId !== approveModal.propertyId &&
              setApproveModal((m) => ({ ...m, open: false }))
            }
          >
            <ModalBox onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>
                  Aprovar{' '}
                  {approveModal.type === 'availability'
                    ? 'disponibilidade'
                    : 'publicação'}{' '}
                  – {approveModal.propertyTitle}
                </ModalTitle>
              </ModalHeader>
              <ModalBody>
                <ConfigRow
                  as="label"
                  style={{ marginBottom: 0, cursor: 'pointer' }}
                >
                  <input
                    type="checkbox"
                    checked={approveApplyWatermark}
                    onChange={(e) => setApproveApplyWatermark(e.target.checked)}
                  />
                  <span>Aplicar marca d&apos;água nas imagens</span>
                </ConfigRow>
              </ModalBody>
              <ModalFooter>
                <ActionBtn
                  $variant="approve"
                  onClick={confirmApproveModal}
                  disabled={actionLoadingId === approveModal.propertyId}
                >
                  {actionLoadingId === approveModal.propertyId
                    ? 'Aprovando...'
                    : 'Confirmar aprovação'}
                </ActionBtn>
                <ActionBtn
                  type="button"
                  onClick={() =>
                    actionLoadingId !== approveModal.propertyId &&
                    setApproveModal((m) => ({ ...m, open: false }))
                  }
                  disabled={actionLoadingId === approveModal.propertyId}
                >
                  Cancelar
                </ActionBtn>
              </ModalFooter>
            </ModalBox>
          </ModalOverlay>,
          document.body
        )}

      {rejectModal.open &&
        createPortal(
          <ModalOverlay onClick={() => !rejectSubmitting && setRejectModal((m) => ({ ...m, open: false }))}>
            <ModalBox onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>
                  Recusar {rejectModal.type === 'availability' ? 'disponibilidade' : 'publicação'} –{' '}
                  {rejectModal.propertyTitle}
                </ModalTitle>
              </ModalHeader>
              <ModalBody>
                <ReasonTextarea
                  placeholder="Motivo da recusa (obrigatório)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </ModalBody>
              <ModalFooter>
                <ActionBtn
                  $variant="reject"
                  onClick={() =>
                    rejectModal.type === 'availability'
                      ? handleRejectAvailability()
                      : handleRejectPublication()
                  }
                  disabled={!rejectReason.trim() || rejectSubmitting}
                >
                  {rejectSubmitting ? 'Enviando...' : 'Confirmar recusa'}
                </ActionBtn>
                <ActionBtn
                  type="button"
                  onClick={() =>
                    !rejectSubmitting && setRejectModal((m) => ({ ...m, open: false }))
                  }
                  disabled={rejectSubmitting}
                >
                  Cancelar
                </ActionBtn>
              </ModalFooter>
            </ModalBox>
          </ModalOverlay>,
          document.body
        )}
    </Layout>
  );
};

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${(p) => p.theme.colors?.text ?? '#111'};
  margin: 0 0 12px 0;
`;

const SectionBlock: React.FC<{
  title: string;
  list: Property[];
  onOpenProperty: (id: string) => void;
}> = ({ title, list, onOpenProperty }) => {
  if (list.length === 0) return null;
  return (
    <div style={{ marginBottom: 24 }}>
      <SectionTitle>{title}</SectionTitle>
      <ListCard>
        <ListHeader>
          <span>Imóvel</span>
          <span>Código</span>
          <span>Responsável</span>
          <span>Data</span>
        </ListHeader>
        {list.map((prop) => (
          <ListRow key={prop.id}>
            <Cell>
              <PropertyLink type="button" onClick={() => onOpenProperty(prop.id)}>
                {prop.title || prop.code || 'Sem título'}
              </PropertyLink>
            </Cell>
            <CellSecondary>{prop.code ?? '-'}</CellSecondary>
            <CellSecondary>
              {(prop as any).responsibleUser?.name ?? (prop as any).capturedBy?.name ?? '-'}
            </CellSecondary>
            <CellSecondary>{formatDate(prop.updatedAt)}</CellSecondary>
          </ListRow>
        ))}
      </ListCard>
    </div>
  );
};

export default PropertyPendingApprovalsPage;
