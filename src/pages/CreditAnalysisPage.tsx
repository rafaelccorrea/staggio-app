import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MdSearch, MdRefresh, MdVisibility, MdTrendingUp, MdTrendingDown, MdAssessment, MdMoreVert, MdReplay, MdHome, MdSettings } from 'react-icons/md';
import { Layout } from '@/components/layout/Layout';
import { PermissionButton } from '@/components/common/PermissionButton';
import { CreditAnalysisShimmer } from '@/components/shimmer/CreditAnalysisShimmer';
import {
  getCreditAnalyses,
  getCreditAnalysisById,
  createCreditAnalysis,
  getCreditAnalysisStatistics,
  type CreditAnalysis,
  type CreditAnalysisStatistics,
} from '../services/creditAnalysisService';
import styled from 'styled-components';
import {
  RentalStylePageContainer,
  PageHeader,
  PageTitle,
  PageTitleContainer,
  PageSubtitle,
  ContentCard,
} from '@/styles/components/PageStyles';

const CreditAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<CreditAnalysis[]>([]);
  const [statistics, setStatistics] = useState<CreditAnalysisStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<CreditAnalysis | null>(null);
  const [cpf, setCpf] = useState('');
  const [name, setName] = useState('');
  const [actionsMenuOpenId, setActionsMenuOpenId] = useState<string | null>(null);
  const [redoingId, setRedoingId] = useState<string | null>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analysesData, statsData] = await Promise.all([
        getCreditAnalyses(),
        getCreditAnalysisStatistics(),
      ]);
      setAnalyses(analysesData);
      setStatistics(statsData);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar análises de crédito.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!cpf) {
      toast.warning('Por favor, informe o CPF');
      return;
    }

    try {
      setCreating(true);
      const analysis = await createCreditAnalysis({
        analyzedCpf: cpf,
        analyzedName: name,
      });
      if (analysis.status === 'ERROR') {
        toast.error(analysis.errorMessage || 'Não foi possível consultar o crédito. Tente novamente.');
      } else {
        toast.success('Análise de crédito concluída com sucesso!');
      }
      setOpenDialog(false);
      setCpf('');
      setName('');
      fetchData();
    } catch (error: any) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Erro ao criar análise';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setCreating(false);
    }
  };

  const handleViewDetails = async (id: string) => {
    setActionsMenuOpenId(null);
    try {
      const analysis = await getCreditAnalysisById(id);
      setSelectedAnalysis(analysis);
      setOpenDetailDialog(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao buscar detalhes');
    }
  };

  /** Refazer análise: só permitido se passaram pelo menos 15 dias da última análise (desta linha). */
  const canRedoAnalysis = (analysis: CreditAnalysis): boolean => {
    const created = new Date(analysis.createdAt).getTime();
    const daysSince = (Date.now() - created) / (1000 * 60 * 60 * 24);
    return daysSince >= 15;
  };

  const handleRedoAnalysis = async (analysis: CreditAnalysis) => {
    setActionsMenuOpenId(null);
    try {
      setRedoingId(analysis.id);
      const result = await createCreditAnalysis({
        analyzedCpf: analysis.analyzedCpf,
        analyzedName: analysis.analyzedName || undefined,
      });
      if (result.status === 'ERROR') {
        toast.error(result.errorMessage || 'Não foi possível consultar o crédito. Tente novamente.');
      } else {
        toast.success('Nova análise de crédito concluída com sucesso!');
      }
      fetchData();
    } catch (error: any) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Erro ao refazer análise';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setRedoingId(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(target)) {
        setActionsMenuOpenId(null);
      }
    };
    if (actionsMenuOpenId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [actionsMenuOpenId]);

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Pendente',
      PROCESSING: 'Processando',
      APPROVED: 'Aprovado',
      REJECTED: 'Reprovado',
      COMPLETED: 'Concluída',
      ERROR: 'Erro na consulta',
      FAILED: 'Falhou',
      MANUAL_REVIEW: 'Revisão Manual',
    };
    return labels[status] || status;
  };

  const getRecommendationLabel = (recommendation: string) => {
    const labels: Record<string, string> = {
      APPROVE: 'Aprovar',
      REJECT: 'Rejeitar',
      MANUAL_REVIEW: 'Revisar Manualmente',
    };
    return labels[recommendation] || recommendation;
  };

  const getRiskLevelLabel = (riskLevel: string) => {
    const labels: Record<string, string> = {
      VERY_LOW: 'Muito Baixo',
      LOW: 'Baixo',
      MEDIUM: 'Médio',
      HIGH: 'Alto',
      VERY_HIGH: 'Muito Alto',
    };
    return labels[riskLevel] || riskLevel;
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  if (loading && analyses.length === 0 && !statistics) {
    return <CreditAnalysisShimmer />;
  }

  return (
    <Layout>
      <RentalStylePageContainer>
        <PageHeader>
          <PageTitleContainer>
            <PageTitle>
              <MdAssessment size={32} />
              Análise de Crédito
            </PageTitle>
            <PageSubtitle>Consulte e analise o crédito de inquilinos</PageSubtitle>
          </PageTitleContainer>
          <HeaderActions>
            <PermissionButton
              permission='credit_analysis:review'
              onClick={() => navigate('/credit-analysis/settings')}
              variant='secondary'
              title='Configurações de análise de crédito'
            >
              <MdSettings size={20} />
              Config. Análise de Crédito
            </PermissionButton>
            <RefreshButton onClick={fetchData}>
              <MdRefresh size={20} />
              Atualizar
            </RefreshButton>
            <PermissionButton
              permission='credit_analysis:create'
              onClick={() => setOpenDialog(true)}
            >
              <MdSearch size={20} />
              Nova Análise
            </PermissionButton>
          </HeaderActions>
        </PageHeader>

        {/* Estatísticas */}
        {statistics && (
          <StatsGrid>
            <StatCard>
              <StatIcon>
                <MdAssessment size={24} />
              </StatIcon>
              <StatContent>
                <StatValue>{statistics.total ?? 0}</StatValue>
                <StatLabel>Total de Análises</StatLabel>
              </StatContent>
            </StatCard>
            <StatCard>
              <StatIcon $color='success'>
                <MdTrendingUp size={24} />
              </StatIcon>
              <StatContent>
                <StatValue>{(() => {
                  const score = Number(statistics.averageScore);
                  return Number.isFinite(score) ? score.toFixed(0) : '0';
                })()}</StatValue>
                <StatLabel>Score Médio</StatLabel>
              </StatContent>
            </StatCard>
            <StatCard>
              <StatIcon $color='success'>
                <MdTrendingUp size={24} />
              </StatIcon>
              <StatContent>
                <StatValue>{(() => {
                  const rate = Number(statistics.approvalRate);
                  const pct = Number.isFinite(rate) ? rate * 100 : 0;
                  return `${pct.toFixed(1)}%`;
                })()}</StatValue>
                <StatLabel>Taxa de Aprovação</StatLabel>
              </StatContent>
            </StatCard>
            <StatCard>
              <StatIcon $color='warning'>
                <MdAssessment size={24} />
              </StatIcon>
              <StatContent>
                <StatValue>{statistics.manualReview ?? 0}</StatValue>
                <StatLabel>Aguardando Revisão</StatLabel>
              </StatContent>
            </StatCard>
          </StatsGrid>
        )}

        {/* Tabela de Análises */}
        <ContentCard>
          {loading ? (
            <LoadingContainer>
              <LoadingSpinner />
              <LoadingText>Carregando análises...</LoadingText>
            </LoadingContainer>
          ) : (
            <TableContainer>
              <Table>
                <thead>
                  <tr>
                    <Th>CPF</Th>
                    <Th>Nome</Th>
                    <Th>Score</Th>
                    <Th>Risco</Th>
                    <Th>Recomendação</Th>
                    <Th>Status</Th>
                    <Th>Aluguel</Th>
                    <Th>Data</Th>
                    <Th>Ações</Th>
                  </tr>
                </thead>
                <tbody>
                  {analyses.map((analysis) => (
                    <Tr key={analysis.id}>
                      <Td>{formatCPF(analysis.analyzedCpf)}</Td>
                      <Td>{analysis.analyzedName || '-'}</Td>
                      <Td>
                        <ScoreContainer>
                          <ScoreValue>{analysis.creditScore || '-'}</ScoreValue>
                          {analysis.creditScore >= 700 ? (
                            <MdTrendingUp size={16} color='#3FA66B' />
                          ) : (
                            <MdTrendingDown size={16} color='#E05A5A' />
                          )}
                        </ScoreContainer>
                      </Td>
                      <Td>
                        {analysis.riskLevel ? (
                          <Badge $variant={getRiskBadgeVariant(analysis.riskLevel)}>
                            {getRiskLevelLabel(analysis.riskLevel)}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </Td>
                      <Td>
                        {analysis.recommendation ? (
                          <Badge $variant={getRecommendationBadgeVariant(analysis.recommendation)}>
                            {getRecommendationLabel(analysis.recommendation)}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </Td>
                      <Td>
                        <Badge $variant={getStatusBadgeVariant(analysis.status)}>
                          {getStatusLabel(analysis.status)}
                        </Badge>
                      </Td>
                      <Td>
                        {analysis.rental ? (
                          <RentalLink
                            onClick={(e) => { e.stopPropagation(); navigate(`/rentals/${analysis.rental!.id}`); }}
                            title="Ver aluguel"
                          >
                            {analysis.rental.tenantName || analysis.rental.id}
                            <MdHome size={14} style={{ marginLeft: 4 }} />
                          </RentalLink>
                        ) : (
                          '-'
                        )}
                      </Td>
                      <Td>{formatDate(analysis.createdAt)}</Td>
                      <Td>
                        <ActionsMenuWrap ref={actionsMenuOpenId === analysis.id ? actionsMenuRef : undefined}>
                          <ActionsMenuButton
                            type="button"
                            onClick={() => setActionsMenuOpenId(prev => (prev === analysis.id ? null : analysis.id))}
                            aria-expanded={actionsMenuOpenId === analysis.id}
                            aria-haspopup="true"
                          >
                            <MdMoreVert size={20} />
                          </ActionsMenuButton>
                          {actionsMenuOpenId === analysis.id && (
                            <ActionsMenuDropdown onClick={e => e.stopPropagation()}>
                              <ActionsMenuItem onClick={() => handleViewDetails(analysis.id)}>
                                <MdVisibility size={18} style={{ marginRight: 8 }} />
                                Ver detalhes
                              </ActionsMenuItem>
                              <ActionsMenuItem
                                as="button"
                                type="button"
                                disabled={!canRedoAnalysis(analysis)}
                                title={!canRedoAnalysis(analysis) ? 'É possível refazer a análise após 15 dias da última.' : undefined}
                                onClick={() => canRedoAnalysis(analysis) && handleRedoAnalysis(analysis)}
                                $disabled={!canRedoAnalysis(analysis)}
                              >
                                <MdReplay size={18} style={{ marginRight: 8 }} />
                                {redoingId === analysis.id ? 'Analisando...' : 'Refazer análise'}
                              </ActionsMenuItem>
                            </ActionsMenuDropdown>
                          )}
                        </ActionsMenuWrap>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableContainer>
          )}
        </ContentCard>

        {/* Dialog de Nova Análise */}
        {openDialog && (
          <DialogOverlay onClick={() => setOpenDialog(false)}>
            <DialogContainer onClick={(e) => e.stopPropagation()}>
              <DialogHeader>
                <DialogTitle>Nova Análise de Crédito</DialogTitle>
                <CloseButton onClick={() => setOpenDialog(false)}>×</CloseButton>
              </DialogHeader>
              <DialogContent>
                <FormField>
                  <FormLabel>CPF *</FormLabel>
                  <FormInput
                    type='text'
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder='000.000.000-00'
                  />
                </FormField>
                <FormField>
                  <FormLabel>Nome (Opcional)</FormLabel>
                  <FormInput
                    type='text'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder='Nome completo'
                  />
                </FormField>
              </DialogContent>
              <DialogFooter>
                <SecondaryButton onClick={() => setOpenDialog(false)}>
                  Cancelar
                </SecondaryButton>
                <PrimaryButton onClick={handleCreate} disabled={creating}>
                  {creating ? 'Analisando...' : 'Analisar'}
                </PrimaryButton>
              </DialogFooter>
            </DialogContainer>
          </DialogOverlay>
        )}

        {/* Dialog de Detalhes */}
        {openDetailDialog && selectedAnalysis && (
          <DialogOverlay onClick={() => setOpenDetailDialog(false)}>
            <DetailDialogContainer onClick={(e) => e.stopPropagation()}>
              <DialogHeader>
                <DialogTitle>Detalhes da Análise de Crédito</DialogTitle>
                <CloseButton onClick={() => setOpenDetailDialog(false)}>×</CloseButton>
              </DialogHeader>
              <DialogContent>
                {selectedAnalysis.status === 'ERROR' && selectedAnalysis.errorMessage && (
                  <div style={{ marginBottom: 16, padding: 12, background: '#fff3cd', borderRadius: 8, color: '#856404' }}>
                    {selectedAnalysis.errorMessage}
                  </div>
                )}
                {selectedAnalysis.rental && (
                  <FormField style={{ marginBottom: 20 }}>
                    <DetailLabel>Aluguel vinculado</DetailLabel>
                    <DetailValue>
                      <RentalLink
                        type="button"
                        onClick={() => { setOpenDetailDialog(false); navigate(`/rentals/${selectedAnalysis.rental!.id}`); }}
                      >
                        {selectedAnalysis.rental.tenantName || selectedAnalysis.rental.id}
                        <MdHome size={14} style={{ marginLeft: 4 }} />
                      </RentalLink>
                    </DetailValue>
                  </FormField>
                )}
                <DetailsGrid>
                  <DetailItem>
                    <DetailLabel>CPF</DetailLabel>
                    <DetailValue>{formatCPF(selectedAnalysis.analyzedCpf)}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Nome</DetailLabel>
                    <DetailValue>{selectedAnalysis.analyzedName || '-'}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Score de Crédito</DetailLabel>
                    <DetailValue>{selectedAnalysis.creditScore || '-'}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Nível de Risco</DetailLabel>
                    <DetailValue>
                      <Badge $variant={getRiskBadgeVariant(selectedAnalysis.riskLevel)}>
                        {getRiskLevelLabel(selectedAnalysis.riskLevel)}
                      </Badge>
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Restrições</DetailLabel>
                    <DetailValue>
                      {selectedAnalysis.hasRestrictions
                        ? `Sim (${selectedAnalysis.restrictionsCount})`
                        : 'Não'}
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Dívidas</DetailLabel>
                    <DetailValue>{formatCurrency(selectedAnalysis.totalDebt)}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Protestos</DetailLabel>
                    <DetailValue>
                      {selectedAnalysis.hasProtests
                        ? `Sim (${selectedAnalysis.protestsCount})`
                        : 'Não'}
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Ações Judiciais</DetailLabel>
                    <DetailValue>
                      {selectedAnalysis.hasLawsuits
                        ? `Sim (${selectedAnalysis.lawsuitsCount})`
                        : 'Não'}
                    </DetailValue>
                  </DetailItem>
                  <DetailItem $fullWidth>
                    <DetailLabel>Recomendação</DetailLabel>
                    <DetailValue>
                      <Badge $variant={getRecommendationBadgeVariant(selectedAnalysis.recommendation)}>
                        {getRecommendationLabel(selectedAnalysis.recommendation)}
                      </Badge>
                    </DetailValue>
                  </DetailItem>
                  {selectedAnalysis.notes && (
                    <DetailItem $fullWidth>
                      <DetailLabel>Observações</DetailLabel>
                      <DetailValue>{selectedAnalysis.notes}</DetailValue>
                    </DetailItem>
                  )}
                </DetailsGrid>
              </DialogContent>
              <DialogFooter>
                <PrimaryButton onClick={() => setOpenDetailDialog(false)}>
                  Fechar
                </PrimaryButton>
              </DialogFooter>
            </DetailDialogContainer>
          </DialogOverlay>
        )}
      </RentalStylePageContainer>
    </Layout>
  );
};

// Helper functions
const getRiskBadgeVariant = (riskLevel: string) => {
  const variants: Record<string, string> = {
    VERY_LOW: 'success',
    LOW: 'info',
    MEDIUM: 'warning',
    HIGH: 'error',
    VERY_HIGH: 'error',
  };
  return variants[riskLevel] || 'default';
};

const getRecommendationBadgeVariant = (recommendation: string) => {
  const variants: Record<string, string> = {
    APPROVE: 'success',
    REJECT: 'error',
    MANUAL_REVIEW: 'warning',
  };
  return variants[recommendation] || 'default';
};

const getStatusBadgeVariant = (status: string) => {
  const variants: Record<string, string> = {
    PENDING: 'default',
    PROCESSING: 'info',
    APPROVED: 'success',
    REJECTED: 'error',
    COMPLETED: 'success',
    ERROR: 'error',
    FAILED: 'error',
    MANUAL_REVIEW: 'warning',
  };
  return variants[status] || 'default';
};

// Styled Components
const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.hover};
    border-color: ${props => props.theme.colors.primary};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StatIcon = styled.div<{ $color?: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => {
    if (props.$color === 'success') return props.theme.colors.successBackground;
    if (props.$color === 'warning') return props.theme.colors.warningBackground;
    return props.theme.colors.backgroundSecondary;
  }};
  color: ${props => {
    if (props.$color === 'success') return props.theme.colors.success;
    if (props.$color === 'warning') return props.theme.colors.warning;
    return props.theme.colors.primary;
  }};
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${props => props.theme.colors.border};
  border-top-color: ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.div`
  margin-top: 16px;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 14px;
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.theme.colors.textSecondary};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  white-space: nowrap;
`;

const Tr = styled.tr`
  &:hover {
    background: ${props => props.theme.colors.hover};
  }
`;

const Td = styled.td`
  padding: 16px;
  font-size: 14px;
  color: ${props => props.theme.colors.text};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const ScoreContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ScoreValue = styled.span`
  font-weight: 600;
`;

const Badge = styled.span<{ $variant?: string }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;

  ${props => {
    switch (props.$variant) {
      case 'success':
        return `
          background: ${props.theme.colors.successBackground};
          color: ${props.theme.colors.successText};
          border: 1px solid ${props.theme.colors.successBorder};
        `;
      case 'error':
        return `
          background: ${props.theme.colors.errorBackground};
          color: ${props.theme.colors.errorText};
          border: 1px solid ${props.theme.colors.errorBorder};
        `;
      case 'warning':
        return `
          background: ${props.theme.colors.warningBackground};
          color: ${props.theme.colors.warningText};
          border: 1px solid ${props.theme.colors.warningBorder};
        `;
      case 'info':
        return `
          background: ${props.theme.colors.infoBackground};
          color: ${props.theme.colors.infoText};
          border: 1px solid ${props.theme.colors.infoBorder};
        `;
      default:
        return `
          background: ${props.theme.colors.backgroundSecondary};
          color: ${props.theme.colors.textSecondary};
          border: 1px solid ${props.theme.colors.border};
        `;
    }
  }}
`;

const ActionButton = styled.button`
  padding: 8px;
  background: transparent;
  color: ${props => props.theme.colors.primary};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.hover};
  }
`;

const ActionsMenuWrap = styled.div`
  position: relative;
  display: inline-flex;
`;

const ActionsMenuButton = styled.button`
  padding: 8px;
  background: transparent;
  color: ${props => props.theme.colors.textSecondary};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.hover};
    color: ${props => props.theme.colors.text};
  }
`;

const ActionsMenuDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  min-width: 180px;
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  overflow: hidden;
`;

const ActionsMenuItem = styled.button<{ $disabled?: boolean }>`
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: none;
  font-size: 14px;
  color: ${props => props.theme.colors.text};
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  align-items: center;
  text-align: left;
  opacity: ${props => (props.$disabled ? 0.6 : 1)};

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.hover};
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const DialogContainer = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

/** Modal de detalhes mais largo para exibir melhor os dados da análise */
const DetailDialogContainer = styled(DialogContainer)`
  max-width: 900px;
`;

const DialogHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const DialogTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: ${props => props.theme.colors.hover};
  color: ${props => props.theme.colors.textSecondary};
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.hoverDark};
    color: ${props => props.theme.colors.text};
  }
`;

const DialogContent = styled.div`
  padding: 24px;
`;

const DialogFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const FormField = styled.div`
  margin-bottom: 20px;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  margin-bottom: 8px;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  color: ${props => props.theme.colors.text};
  background: ${props => props.theme.colors.inputBackground};
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => `${props.theme.colors.primary}20`};
  }

  &::placeholder {
    color: ${props => props.theme.colors.textLight};
  }
`;

const RentalLink = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

const PrimaryButton = styled.button`
  padding: 10px 24px;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  padding: 10px 24px;
  background: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.hover};
    border-color: ${props => props.theme.colors.primary};
  }
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DetailItem = styled.div<{ $fullWidth?: boolean }>`
  ${props => props.$fullWidth && 'grid-column: 1 / -1;'}
`;

const DetailLabel = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 6px;
`;

const DetailValue = styled.div`
  font-size: 15px;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
`;

export default CreditAnalysisPage;
