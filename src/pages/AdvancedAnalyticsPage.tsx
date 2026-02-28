import React, { useState, useEffect, Suspense, useCallback } from 'react';
import {
  useAdvancedAnalytics,
  EMPTY_ADVANCED_ANALYTICS_DATA,
} from '../hooks/useAdvancedAnalytics';
import { formatCurrency } from '../utils/formatNumbers';
import { InfoTooltip } from '../components/common/InfoTooltip';
import { LottieLoading } from '../components/common/LottieLoading';
import { getTypeText } from '../utils/propertyUtils';
import GoalSelector from '../components/dashboard/GoalSelector';
import { goalsApi } from '../services/goalsApi';
import type { Goal } from '../types/goal';
import { AdvancedAnalyticsFiltersDrawer } from '../components/analytics/AdvancedAnalyticsFiltersDrawer';
import { CacheInfoBanner } from '../components/analytics/CacheInfoBanner';
import {
  dashboardApi,
  type CapturesStatistics,
} from '../services/dashboardApi';
import { CACHE_KEYS } from '../utils/analyticsCache';
import {
  CategoryDistributionChart,
  FunnelChart,
  BarChart,
  LineChart,
  MultiLineChart,
  type CategoryData,
  type BarChartDataPoint,
  type LineChartDataPoint,
  type MultiLineDataset,
} from '../components/charts';
import {
  PageContainer,
  PageHeader,
  PageTitle,
  HeaderActions,
  FilterButton,
  FilterBadge,
  Section,
  SectionTitle,
  StatsGrid,
  StatCard,
  StatHeader,
  StatIcon,
  StatValue,
  StatLabel,
  TableCard,
  TableTitle,
  TableContainer,
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Badge,
  BrokersList,
  BrokerCard,
  BrokerHeader,
  BrokerInfo,
  BrokerName,
  BrokerBadges,
  BrokerStats,
  BrokerStatItem,
  BrokerStatLabel,
  BrokerStatValue,
  ChurnRiskCard,
  ChurnRiskHeader,
  ChurnRiskInfo,
  ChurnRiskName,
  ChurnRiskScore,
  ChurnRiskLabel,
  ChurnRiskValue,
  ChurnRiskDays,
  ChurnRiskSectionTitle,
  ChurnRiskFactors,
  ChurnRiskFactorList,
  ChurnRiskFactorItem,
  ChurnActionsList,
  ChurnActionItem,
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  LoadingContainer,
  SectionSkeleton,
  SectionSkeletonTitle,
  SectionSkeletonLine,
  SectionSkeletonGrid,
  SectionSkeletonCard,
  SectionSkeletonLabel,
  ErrorContainer,
  ErrorTitle,
  ErrorMessage,
  RetryButton,
  CompanyGoalCard,
  GoalHeader,
  GoalIcon,
  GoalTitle,
  GoalSubtitle,
  GoalContent,
  ProgressSection,
  ProgressValue,
  ProgressBar,
  ProgressFill,
  StatsRow,
  GoalStatItem,
  GoalStatLabel,
  GoalStatValue,
  StatusRow,
  StatusBadge,
  DaysLeft,
  FunnelSummary,
  FunnelAnalysisCard,
  FunnelAnalysisTitle,
  FunnelAnalysisText,
  FunnelList,
  FunnelListItem,
  FunnelInsightCard,
  FunnelInsightTitle,
  FunnelInsightDescription,
  FunnelInsightRecommendations,
  FunnelInsightRecommendation,
  FunnelScore,
  LoadMoreButton,
  LoadMoreButtonContent,
} from '../styles/pages/AdvancedAnalyticsPageStyles';
import {
  MdBarChart,
  MdTrendingUp,
  MdPeople,
  MdHome,
  MdTimer,
  MdWarning,
  MdCheckCircle,
  MdFilterList,
  MdRefresh,
  MdExpandMore,
} from 'react-icons/md';

const AdvancedAnalyticsPage: React.FC = () => {
  const {
    data,
    loading,
    error,
    filters,
    updateFilters,
    refresh,
    cacheInfo,
    conversionFunnelLoading,
    conversionFunnelError,
    performanceLoading,
    matchesLoading,
    brokersLoading,
    churnLoading,
  } = useAdvancedAnalytics();
  const safeData = data ?? EMPTY_ADVANCED_ANALYTICS_DATA;
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [loadingGoal, setLoadingGoal] = useState(false);
  const [brokersToShow, setBrokersToShow] = useState(3);
  const [churnToShow, setChurnToShow] = useState(3);

  // Estados para análise de captadores
  const [capturesStatistics, setCapturesStatistics] =
    useState<CapturesStatistics | null>(null);
  const [loadingCaptures, setLoadingCaptures] = useState(false);
  const [capturesError, setCapturesError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<
    'month' | 'quarter' | 'year'
  >('month');
  const [capturesRefreshTrigger, setCapturesRefreshTrigger] = useState(0);

  // Buscar meta selecionada quando selectedGoalId mudar
  useEffect(() => {
    if (selectedGoalId) {
      const fetchGoal = async () => {
        try {
          setLoadingGoal(true);
          const goal = await goalsApi.getGoalById(selectedGoalId);
          setSelectedGoal(goal);
        } catch (error) {
          console.error('Erro ao buscar meta:', error);
          setSelectedGoal(null);
        } finally {
          setLoadingGoal(false);
        }
      };
      fetchGoal();
    } else {
      setSelectedGoal(null);
    }
  }, [selectedGoalId]);

  // Carregar estatísticas de captadores - sincronizado com filtros principais e refresh
  useEffect(() => {
    const loadCapturesStatistics = async () => {
      setLoadingCaptures(true);
      setCapturesError(null);
      try {
        // Usar os mesmos filtros que o hook principal se disponíveis
        let startDate: Date | undefined;
        let endDate = new Date();

        // Se os filtros principais têm datas customizadas, usar elas
        if (filters.startDate && filters.endDate) {
          startDate = filters.startDate;
          endDate = filters.endDate;
        } else {
          // Caso contrário, usar o período selecionado
          switch (selectedPeriod) {
            case 'month':
              startDate = new Date();
              startDate.setMonth(startDate.getMonth() - 1);
              break;
            case 'quarter':
              startDate = new Date();
              startDate.setMonth(startDate.getMonth() - 3);
              break;
            case 'year':
              startDate = new Date();
              startDate.setFullYear(startDate.getFullYear() - 1);
              break;
          }
        }

        const stats = await dashboardApi.getCapturesStatistics(
          startDate,
          endDate
        );
        setCapturesStatistics(stats);
      } catch (error: any) {
        console.error(
          '❌ [AdvancedAnalyticsPage] Erro ao carregar estatísticas de captadores:',
          error
        );
        setCapturesError(
          error.message || 'Erro ao carregar estatísticas de captadores'
        );
      } finally {
        setLoadingCaptures(false);
      }
    };

    loadCapturesStatistics();
  }, [
    selectedPeriod,
    filters.startDate,
    filters.endDate,
    filters.period,
    capturesRefreshTrigger,
  ]);

  // Criar função de refresh personalizada que também atualiza captures
  const handleRefresh = useCallback(() => {
    refresh(); // Atualizar APIs do hook principal
    setCapturesRefreshTrigger(prev => prev + 1); // Forçar atualização de captures
  }, [refresh]);

  // Função helper para obter dados da meta
  const getGoalData = () => {
    if (selectedGoal && !loadingGoal) {
      return {
        target: selectedGoal.targetValue,
        current: selectedGoal.currentValue,
        progress: selectedGoal.progress,
        remaining: selectedGoal.remaining,
        daysLeft: selectedGoal.daysRemaining,
        dailyTarget: selectedGoal.dailyTarget,
        onTrack: selectedGoal.isOnTrack,
      };
    }
    return null;
  };

  const goalData = getGoalData();

  const getRiskLevelColor = (riskLevel: 'high' | 'medium' | 'low') => {
    switch (riskLevel) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getRiskLevelLabel = (riskLevel: 'high' | 'medium' | 'low') => {
    switch (riskLevel) {
      case 'high':
        return 'Alto';
      case 'medium':
        return 'Médio';
      case 'low':
        return 'Baixo';
      default:
        return 'Desconhecido';
    }
  };

  const activeFiltersCount = Object.values(filters).filter(
    v => v !== undefined && v !== 'none'
  ).length;

  // Funções helper para verificar se dados são vazios (usam safeData para render progressivo)
  const hasCompanyPerformanceData = () => !!safeData;
  const hasPendingMatchesData = () =>
    safeData?.pendingMatches !== undefined &&
    safeData?.pendingMatches !== null;
  const hasBrokersPerformanceData = () =>
    safeData?.brokersPerformance &&
    Array.isArray(safeData.brokersPerformance) &&
    safeData.brokersPerformance.length > 0;
  const hasChurnAnalysisData = () => {
    if (!safeData?.churnAnalysis) return false;
    const c = safeData.churnAnalysis;
    return (
      (c.atRiskClients?.length || 0) > 0 ||
      (c.totalClients || 0) > 0 ||
      (c.highRisk || 0) > 0 ||
      (c.mediumRisk || 0) > 0 ||
      (c.lowRisk || 0) > 0
    );
  };
  const hasConversionFunnelData = () => !!safeData?.conversionFunnel;

  const hasCapturesStatisticsData = () => {
    if (!capturesStatistics) return false;
    return (
      (capturesStatistics.totalProperties || 0) > 0 ||
      (capturesStatistics.totalClients || 0) > 0 ||
      (capturesStatistics.byCapturer?.length || 0) > 0
    );
  };

  // Verificar se há algum dado disponível
  const hasAnyData = () => {
    return (
      hasCompanyPerformanceData() ||
      hasPendingMatchesData() ||
      hasBrokersPerformanceData() ||
      hasChurnAnalysisData() ||
      hasConversionFunnelData() ||
      hasCapturesStatisticsData() ||
      (goalData && goalData.target > 0)
    );
  };

  // Erro crítico: só tela de erro se não tivermos nenhum dado
  if (error && !data) {
    return (
      <PageContainer>
        <ErrorContainer>
          <ErrorTitle>Erro ao carregar análise avançada</ErrorTitle>
          <ErrorMessage>{error}</ErrorMessage>
          <RetryButton onClick={handleRefresh}>
            <MdRefresh /> Tentar Novamente
          </RetryButton>
        </ErrorContainer>
      </PageContainer>
    );
  }

  // Bloco reutilizável de skeleton para seção (título + grid de cards)
  const renderSectionSkeleton = (label: string) => (
    <Section>
      <SectionSkeletonTitle />
      <SectionSkeletonLabel>{label}</SectionSkeletonLabel>
      <SectionSkeletonGrid>
        {[1, 2, 3, 4].map(i => (
          <SectionSkeletonCard key={i} />
        ))}
      </SectionSkeletonGrid>
    </Section>
  );

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>
          <MdBarChart />
          Análise Avançada
        </PageTitle>
        <HeaderActions>
          <FilterButton onClick={() => setShowFilters(!showFilters)}>
            <MdFilterList />
            Filtros
            {activeFiltersCount > 0 && (
              <FilterBadge>{activeFiltersCount}</FilterBadge>
            )}
          </FilterButton>
          <FilterButton onClick={handleRefresh}>
            <MdRefresh />
            Atualizar
          </FilterButton>
        </HeaderActions>
      </PageHeader>

      {/* Banner de Cache Global - se houver dados em cache */}
      {Object.keys(cacheInfo).some(key => cacheInfo[key]?.isFromCache) && (
        <CacheInfoBanner
          formattedTime={
            Object.values(cacheInfo).find(info => info?.isFromCache)
              ?.formattedTime
          }
          dataSource='dados de análise'
        />
      )}

      {/* Meta Geral da Empresa */}
      {goalData && goalData.target > 0 && (
        <Section>
          <CompanyGoalCard>
            <GoalHeader>
              <GoalIcon>
                <MdTrendingUp />
              </GoalIcon>
              <div style={{ flex: 1 }}>
                <GoalTitle>
                  🎯{' '}
                  {selectedGoal ? selectedGoal.title : 'Meta Geral da Empresa'}
                </GoalTitle>
                <GoalSubtitle>
                  {selectedGoal
                    ? selectedGoal.description || 'Meta mensal de vendas'
                    : 'Meta mensal de vendas'}
                </GoalSubtitle>
              </div>
              <InfoTooltip
                content='Acompanhamento do progresso da meta de vendas da empresa. Mostra o percentual alcançado, valores atuais e restantes, além de quantos dias faltam para o fim do período.'
                direction='down'
              />
            </GoalHeader>

            <GoalContent>
              {/* Seletor de Meta dentro do card */}
              <div style={{ marginBottom: '16px' }}>
                <GoalSelector
                  selectedGoalId={selectedGoalId}
                  onGoalChange={setSelectedGoalId}
                />
              </div>

              <ProgressSection>
                <ProgressValue>
                  {(goalData.progress != null && !isNaN(goalData.progress)
                    ? goalData.progress
                    : 0
                  ).toFixed(1)}
                  %
                </ProgressValue>
                <ProgressBar>
                  <ProgressFill
                    $progress={
                      goalData.progress != null && !isNaN(goalData.progress)
                        ? goalData.progress
                        : 0
                    }
                  />
                </ProgressBar>
              </ProgressSection>

              <StatsRow>
                <GoalStatItem>
                  <GoalStatLabel>
                    Meta
                    <InfoTooltip
                      content='Valor total da meta de vendas definida para o período.'
                      direction='down'
                    />
                  </GoalStatLabel>
                  <GoalStatValue>
                    {formatCurrency(goalData.target || 0)}
                  </GoalStatValue>
                </GoalStatItem>
                <GoalStatItem>
                  <GoalStatLabel>
                    Atual
                    <InfoTooltip
                      content='Valor atual já alcançado em relação à meta.'
                      direction='down'
                    />
                  </GoalStatLabel>
                  <GoalStatValue>
                    {formatCurrency(goalData.current || 0)}
                  </GoalStatValue>
                </GoalStatItem>
                <GoalStatItem>
                  <GoalStatLabel>
                    Restante
                    <InfoTooltip
                      content='Valor que ainda precisa ser alcançado para completar a meta.'
                      direction='down'
                    />
                  </GoalStatLabel>
                  <GoalStatValue>
                    {formatCurrency(goalData.remaining || 0)}
                  </GoalStatValue>
                </GoalStatItem>
              </StatsRow>

              <StatusRow>
                <StatusBadge $status={goalData.onTrack ? 'success' : 'warning'}>
                  {goalData.onTrack ? '🎯 No alvo!' : '⚡ Acelere!'}
                </StatusBadge>
                <DaysLeft>
                  {goalData.daysLeft != null && goalData.daysLeft > 0
                    ? `${goalData.daysLeft} dias restantes`
                    : 'Meta finalizada'}
                </DaysLeft>
              </StatusRow>
            </GoalContent>
          </CompanyGoalCard>
        </Section>
      )}

      {/* Seção 1: Performance da Empresa */}
      {performanceLoading && !safeData.companyPerformance
        ? renderSectionSkeleton('Carregando performance da empresa...')
        : hasCompanyPerformanceData() && (
        <Section>
          <SectionTitle>
            <MdBarChart />
            Performance da Empresa
            <InfoTooltip
              content='Métricas gerais de performance da empresa baseadas em matches, vendas e aluguéis.'
              direction='down'
            />
          </SectionTitle>
          {!safeData?.companyPerformance && (
            <div
              style={{
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: '#FEF3C7',
                borderRadius: '8px',
                color: '#92400E',
              }}
            >
              <strong>ℹ️</strong> Dados de performance ainda não disponíveis
              para o período selecionado.
            </div>
          )}
          <StatsGrid>
            <StatCard>
              <StatHeader>
                <StatIcon color='#3B82F6'>
                  <MdCheckCircle />
                </StatIcon>
              </StatHeader>
              <StatValue>
                {safeData?.companyPerformance?.companyStats?.totalMatches || 0}
              </StatValue>
              <StatLabel>
                Total de Matches
                <InfoTooltip
                  content='Número total de matches gerados no período selecionado, incluindo aceitos e pendentes.'
                  direction='down'
                />
              </StatLabel>
            </StatCard>

            <StatCard>
              <StatHeader>
                <StatIcon color='#10B981'>
                  <MdCheckCircle />
                </StatIcon>
              </StatHeader>
              <StatValue>
                {safeData?.companyPerformance?.companyStats?.acceptedMatches || 0}
              </StatValue>
              <StatLabel>
                Matches Aceitos
                <InfoTooltip
                  content='Quantidade de matches que foram aceitos pelos clientes ou corretores no período.'
                  direction='down'
                />
              </StatLabel>
            </StatCard>

            <StatCard>
              <StatHeader>
                <StatIcon color='#F59E0B'>
                  <MdBarChart />
                </StatIcon>
              </StatHeader>
              <StatValue>
                {(safeData?.companyPerformance?.companyStats?.avgAcceptanceRate &&
                !isNaN(safeData.companyPerformance.companyStats.avgAcceptanceRate)
                  ? safeData.companyPerformance.companyStats.avgAcceptanceRate
                  : 0
                ).toFixed(1)}
                %
              </StatValue>
              <StatLabel>
                Taxa Média de Aceitação
                <InfoTooltip
                  content='Percentual médio de matches que foram aceitos em relação ao total de matches gerados.'
                  direction='down'
                />
              </StatLabel>
            </StatCard>

            <StatCard>
              <StatHeader>
                <StatIcon color='#8B5CF6'>
                  <MdCheckCircle />
                </StatIcon>
              </StatHeader>
              <StatValue>
                {(safeData?.companyPerformance?.companyStats?.avgMatchScore &&
                !isNaN(safeData.companyPerformance.companyStats.avgMatchScore)
                  ? safeData.companyPerformance.companyStats.avgMatchScore
                  : 0
                ).toFixed(1)}
              </StatValue>
              <StatLabel>
                Score Médio de Matches
                <InfoTooltip
                  content='Pontuação média calculada para os matches baseada em critérios de compatibilidade entre propriedades e clientes.'
                  direction='down'
                />
              </StatLabel>
            </StatCard>

            <StatCard>
              <StatHeader>
                <StatIcon color='#EC4899'>
                  <MdCheckCircle />
                </StatIcon>
              </StatHeader>
              <StatValue>
                {safeData?.companyPerformance?.companyStats?.totalTasksCreated || 0}
              </StatValue>
              <StatLabel>
                Tarefas Criadas
                <InfoTooltip
                  content='Total de tarefas criadas no sistema durante o período selecionado.'
                  direction='down'
                />
              </StatLabel>
            </StatCard>

            <StatCard>
              <StatHeader>
                <StatIcon color='#10B981'>
                  <MdCheckCircle />
                </StatIcon>
              </StatHeader>
              <StatValue>
                {safeData?.companyPerformance?.companyStats?.totalTasksCompleted ||
                  0}
              </StatValue>
              <StatLabel>
                Tarefas Concluídas
                <InfoTooltip
                  content='Quantidade de tarefas que foram finalizadas com sucesso no período.'
                  direction='down'
                />
              </StatLabel>
            </StatCard>
          </StatsGrid>

          {/* Gráficos de Performance */}
          {safeData?.companyPerformance && (
            <StatsGrid style={{ marginTop: '24px' }}>
              <TableCard>
                <TableTitle>
                  <MdBarChart />
                  Visão Geral de Métricas
                </TableTitle>
                <div style={{ padding: '20px' }}>
                  <Suspense fallback={<LottieLoading />}>
                    <BarChart
                      data={[
                        {
                          label: 'Total Matches',
                          value:
                            safeData.companyPerformance?.companyStats
                              ?.totalMatches || 0,
                        },
                        {
                          label: 'Matches Aceitos',
                          value:
                            safeData.companyPerformance?.companyStats
                              ?.acceptedMatches || 0,
                        },
                        {
                          label: 'Tarefas Criadas',
                          value:
                            safeData.companyPerformance?.companyStats
                              ?.totalTasksCreated || 0,
                        },
                        {
                          label: 'Tarefas Concluídas',
                          value:
                            safeData.companyPerformance?.companyStats
                              ?.totalTasksCompleted || 0,
                        },
                      ]}
                      label='Quantidade'
                      color='#3B82F6'
                      emptyMessage='Nenhum dado de performance disponível'
                    />
                  </Suspense>
                </div>
              </TableCard>

              <TableCard>
                <TableTitle>
                  <MdTrendingUp />
                  Taxas e Scores
                </TableTitle>
                <div style={{ padding: '20px' }}>
                  <Suspense fallback={<LottieLoading />}>
                    <BarChart
                      data={[
                        {
                          label: 'Taxa Aceitação',
                          value:
                            safeData.companyPerformance?.companyStats
                              ?.avgAcceptanceRate || 0,
                        },
                        {
                          label: 'Score Médio',
                          value:
                            safeData.companyPerformance?.companyStats
                              ?.avgMatchScore || 0,
                        },
                      ]}
                      label='Valor'
                      color='#10B981'
                      emptyMessage='Nenhum dado de taxas disponível'
                    />
                  </Suspense>
                </div>
              </TableCard>
            </StatsGrid>
          )}
        </Section>
      )}

      {/* Seção 2: Matches Pendentes */}
      {matchesLoading && !safeData?.pendingMatches ? (
        renderSectionSkeleton('Carregando matches pendentes...')
      ) : hasPendingMatchesData() ? (
        <Section>
          <SectionTitle>
            <MdWarning />
            Matches Pendentes
            <InfoTooltip
              content='Lista de matches que ainda não foram aceitos ou processados. Matches pendentes há mais de 7 dias são considerados em atraso.'
              direction='down'
            />
          </SectionTitle>
          <StatsGrid>
            <StatCard>
              <StatHeader>
                <StatIcon color='#EF4444'>
                  <MdWarning />
                </StatIcon>
              </StatHeader>
              <StatValue>{safeData.pendingMatches?.total || 0}</StatValue>
              <StatLabel>
                Total de Matches Pendentes
                <InfoTooltip
                  content='Número total de matches que ainda estão aguardando resposta ou processamento.'
                  direction='down'
                />
              </StatLabel>
            </StatCard>
            <StatCard>
              <StatHeader>
                <StatIcon color='#DC2626'>
                  <MdWarning />
                </StatIcon>
              </StatHeader>
              <StatValue>{safeData?.pendingMatches?.overdue || 0}</StatValue>
              <StatLabel>
                Em Atraso (&gt;7 dias)
                <InfoTooltip
                  content='Matches pendentes há mais de 7 dias que requerem atenção urgente.'
                  direction='down'
                />
              </StatLabel>
            </StatCard>
            <StatCard>
              <StatHeader>
                <StatIcon color='#F59E0B'>
                  <MdWarning />
                </StatIcon>
              </StatHeader>
              <StatValue>{safeData?.pendingMatches?.warning || 0}</StatValue>
              <StatLabel>
                Atenção (&gt;3 dias)
                <InfoTooltip
                  content='Matches pendentes entre 3 e 7 dias que precisam de acompanhamento.'
                  direction='down'
                />
              </StatLabel>
            </StatCard>
          </StatsGrid>

          {safeData.pendingMatches?.matches &&
          safeData.pendingMatches.matches.length > 0 ? (
            <TableCard>
              <TableTitle>Lista de Matches Pendentes</TableTitle>
              <TableContainer>
                <Table>
                  <TableHeader>
                    <tr>
                      <TableHeaderCell>Cliente</TableHeaderCell>
                      <TableHeaderCell>Propriedade</TableHeaderCell>
                      <TableHeaderCell>Score</TableHeaderCell>
                      <TableHeaderCell>Dias Pendente</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {safeData.pendingMatches?.matches?.map(match => {
                      const createdAt = new Date(match.createdAt);
                      const now = new Date();
                      const daysSinceCreated = Math.floor(
                        (now.getTime() - createdAt.getTime()) /
                          (1000 * 60 * 60 * 24)
                      );
                      const clientName =
                        match.client?.name || 'Cliente não informado';
                      const propertyTitle =
                        match.property?.title || 'Propriedade não informada';
                      const matchScore = match.matchScore || 0;

                      return (
                        <TableRow key={match.id}>
                          <TableCell>{clientName}</TableCell>
                          <TableCell>{propertyTitle}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                matchScore >= 80
                                  ? 'success'
                                  : matchScore >= 60
                                    ? 'warning'
                                    : 'info'
                              }
                            >
                              {matchScore}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                daysSinceCreated > 7
                                  ? 'danger'
                                  : daysSinceCreated > 3
                                    ? 'warning'
                                    : 'info'
                              }
                            >
                              {daysSinceCreated} dias
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                daysSinceCreated > 7
                                  ? 'danger'
                                  : daysSinceCreated > 3
                                    ? 'warning'
                                    : 'info'
                              }
                            >
                              {daysSinceCreated > 7
                                ? 'Atrasado'
                                : daysSinceCreated > 3
                                  ? 'Atenção'
                                  : 'Pendente'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </TableCard>
          ) : null}
        </Section>
      ) : null}

      {/* Seção 3: Performance de Corretores */}
      {brokersLoading && !safeData?.brokersPerformance?.length ? (
        renderSectionSkeleton('Carregando performance de corretores...')
      ) : hasBrokersPerformanceData() ? (
        <Section>
          <SectionTitle>
            <MdPeople />
            Performance de Corretores
            <InfoTooltip
              content='Ranking de corretores baseado em vendas, aluguéis, receita, comissões e taxa de conversão. Ordenado por performance geral.'
              direction='down'
            />
          </SectionTitle>
          {cacheInfo[CACHE_KEYS.BROKERS_PERFORMANCE]?.isFromCache && (
            <CacheInfoBanner
              formattedTime={
                cacheInfo[CACHE_KEYS.BROKERS_PERFORMANCE]?.formattedTime
              }
              dataSource='dados de performance de corretores'
            />
          )}
          {safeData?.brokersPerformance && safeData.brokersPerformance.length > 0 ? (
            <>
              <TableCard>
                <TableTitle>Ranking de Performance</TableTitle>
                <TableContainer>
                  <Table>
                    <TableHeader>
                      <tr>
                        <TableHeaderCell style={{ width: '50px' }}>
                          #
                        </TableHeaderCell>
                        <TableHeaderCell>Corretor</TableHeaderCell>
                        <TableHeaderCell style={{ textAlign: 'center' }}>
                          Score
                          <InfoTooltip
                            content='Pontuação geral de performance do corretor (0-100).'
                            direction='down'
                          />
                        </TableHeaderCell>
                        <TableHeaderCell style={{ textAlign: 'center' }}>
                          Vendas
                          <InfoTooltip
                            content='Número total de vendas realizadas pelo corretor no período.'
                            direction='down'
                          />
                        </TableHeaderCell>
                        <TableHeaderCell style={{ textAlign: 'right' }}>
                          Valor Total
                          <InfoTooltip
                            content='Soma do valor de todas as vendas realizadas pelo corretor.'
                            direction='down'
                          />
                        </TableHeaderCell>
                        <TableHeaderCell style={{ textAlign: 'center' }}>
                          Taxa Conversão
                          <InfoTooltip
                            content='Percentual de leads que foram convertidos em vendas pelo corretor.'
                            direction='down'
                          />
                        </TableHeaderCell>
                        <TableHeaderCell style={{ textAlign: 'center' }}>
                          Tempo Médio
                          <InfoTooltip
                            content='Tempo médio em dias desde o primeiro contato até a conclusão da venda.'
                            direction='down'
                          />
                        </TableHeaderCell>
                        <TableHeaderCell style={{ textAlign: 'center' }}>
                          Leads
                          <InfoTooltip
                            content='Quantidade de leads (potenciais clientes) gerados pelo corretor.'
                            direction='down'
                          />
                        </TableHeaderCell>
                        <TableHeaderCell style={{ textAlign: 'center' }}>
                          Visitas
                          <InfoTooltip
                            content='Número total de visitas a propriedades realizadas pelo corretor.'
                            direction='down'
                          />
                        </TableHeaderCell>
                        <TableHeaderCell style={{ textAlign: 'center' }}>
                          Tendência
                        </TableHeaderCell>
                      </tr>
                    </TableHeader>
                    <TableBody>
                      {safeData.brokersPerformance
                        .slice(0, brokersToShow)
                        .map((broker, index) => {
                          const overallScore =
                            broker.overallScore != null &&
                            !isNaN(broker.overallScore)
                              ? broker.overallScore
                              : 0;
                          const conversionRate =
                            broker.conversionRate != null &&
                            !isNaN(broker.conversionRate)
                              ? broker.conversionRate
                              : 0;
                          const averageSaleTime =
                            broker.averageSaleTime != null &&
                            !isNaN(broker.averageSaleTime)
                              ? broker.averageSaleTime
                              : 0;

                          return (
                            <TableRow key={broker.brokerId}>
                              <TableCell>
                                <Badge
                                  color={
                                    index === 0
                                      ? '#F59E0B'
                                      : index === 1
                                        ? '#6B7280'
                                        : index === 2
                                          ? '#92400E'
                                          : '#E5E7EB'
                                  }
                                >
                                  {index + 1}º
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <strong>{broker.brokerName}</strong>
                              </TableCell>
                              <TableCell style={{ textAlign: 'center' }}>
                                <Badge
                                  variant={
                                    overallScore >= 80
                                      ? 'success'
                                      : overallScore >= 60
                                        ? 'warning'
                                        : 'info'
                                  }
                                >
                                  {overallScore.toFixed(1)}
                                </Badge>
                              </TableCell>
                              <TableCell style={{ textAlign: 'center' }}>
                                {broker.salesCount || 0}
                              </TableCell>
                              <TableCell style={{ textAlign: 'right' }}>
                                {formatCurrency(broker.totalSalesValue || 0)}
                              </TableCell>
                              <TableCell style={{ textAlign: 'center' }}>
                                {conversionRate.toFixed(1)}%
                              </TableCell>
                              <TableCell style={{ textAlign: 'center' }}>
                                {averageSaleTime > 0
                                  ? `${averageSaleTime} dias`
                                  : '-'}
                              </TableCell>
                              <TableCell style={{ textAlign: 'center' }}>
                                {broker.leadsGenerated || 0}
                              </TableCell>
                              <TableCell style={{ textAlign: 'center' }}>
                                {broker.visitsCompleted || 0}
                              </TableCell>
                              <TableCell style={{ textAlign: 'center' }}>
                                <Badge
                                  variant={
                                    broker.trend === 'improving'
                                      ? 'success'
                                      : broker.trend === 'stable'
                                        ? 'info'
                                        : 'warning'
                                  }
                                >
                                  {broker.trend === 'improving'
                                    ? '📈 Melhorando'
                                    : broker.trend === 'stable'
                                      ? '➡️ Estável'
                                      : '📉 Declinando'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>
                {safeData.brokersPerformance.length > brokersToShow && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      marginTop: '24px',
                    }}
                  >
                    <FilterButton
                      onClick={() =>
                        setBrokersToShow(prev =>
                          Math.min(prev + 5, safeData.brokersPerformance.length)
                        )
                      }
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        fontSize: '0.9375rem',
                      }}
                    >
                      <MdExpandMore size={20} />
                      Ver Mais (
                      {Math.min(
                        5,
                        safeData.brokersPerformance.length - brokersToShow
                      )}{' '}
                      de {safeData.brokersPerformance.length - brokersToShow}{' '}
                      restantes)
                    </FilterButton>
                  </div>
                )}
              </TableCard>

              {/* Gráficos de Performance de Corretores */}
              <StatsGrid style={{ marginTop: '24px' }}>
                <TableCard>
                  <TableTitle>
                    <MdBarChart />
                    Top 5 Corretores - Vendas
                  </TableTitle>
                  <div style={{ padding: '20px' }}>
                    <Suspense fallback={<LottieLoading />}>
                      <BarChart
                        data={safeData.brokersPerformance
                          .slice(0, 5)
                          .map(broker => ({
                            label:
                              broker.brokerName.length > 15
                                ? broker.brokerName.substring(0, 15) + '...'
                                : broker.brokerName,
                            value: broker.salesCount || 0,
                          }))}
                        label='Vendas'
                        color='#3B82F6'
                        horizontal={true}
                        emptyMessage='Nenhum dado de corretores disponível'
                      />
                    </Suspense>
                  </div>
                </TableCard>

                <TableCard>
                  <TableTitle>
                    <MdTrendingUp />
                    Top 5 Corretores - Taxa de Conversão
                  </TableTitle>
                  <div style={{ padding: '20px' }}>
                    <Suspense fallback={<LottieLoading />}>
                      <BarChart
                        data={safeData.brokersPerformance
                          .slice(0, 5)
                          .map(broker => ({
                            label:
                              broker.brokerName.length > 15
                                ? broker.brokerName.substring(0, 15) + '...'
                                : broker.brokerName,
                            value: broker.conversionRate || 0,
                          }))}
                        label='Taxa de Conversão (%)'
                        color='#10B981'
                        horizontal={true}
                        emptyMessage='Nenhum dado de conversão disponível'
                      />
                    </Suspense>
                  </div>
                </TableCard>

                <TableCard>
                  <TableTitle>
                    <MdPeople />
                    Top 5 Corretores - Score Geral
                  </TableTitle>
                  <div style={{ padding: '20px' }}>
                    <Suspense fallback={<LottieLoading />}>
                      <BarChart
                        data={safeData.brokersPerformance
                          .slice(0, 5)
                          .map(broker => ({
                            label:
                              broker.brokerName.length > 15
                                ? broker.brokerName.substring(0, 15) + '...'
                                : broker.brokerName,
                            value: broker.overallScore || 0,
                          }))}
                        label='Score'
                        color='#8B5CF6'
                        horizontal={true}
                        emptyMessage='Nenhum dado de score disponível'
                      />
                    </Suspense>
                  </div>
                </TableCard>
              </StatsGrid>
            </>
          ) : (
            <EmptyState>
              <EmptyStateIcon>👥</EmptyStateIcon>
              <EmptyStateTitle>Nenhum corretor encontrado</EmptyStateTitle>
              <EmptyStateDescription>
                Não há dados de performance de corretores disponíveis.
              </EmptyStateDescription>
            </EmptyState>
          )}
        </Section>
      ) : null}

      {/* Seção 4: Funil de Conversão */}
      {(hasConversionFunnelData() || conversionFunnelLoading) && (
        <Section>
          <SectionTitle>
            <MdBarChart />
            Funil de Conversão
            <InfoTooltip
              content='Visualização do processo de conversão de leads em vendas, mostrando cada etapa e taxa de conversão. Inclui análise automática com insights e recomendações.'
              direction='down'
            />
          </SectionTitle>
          {cacheInfo[CACHE_KEYS.CONVERSION_FUNNEL]?.isFromCache && (
            <CacheInfoBanner
              formattedTime={
                cacheInfo[CACHE_KEYS.CONVERSION_FUNNEL]?.formattedTime
              }
              dataSource='dados do funil de conversão'
            />
          )}
          {conversionFunnelLoading && !hasConversionFunnelData() && (
            <SectionSkeleton>
              <SectionSkeletonTitle />
              <SectionSkeletonLabel>Carregando funil de conversão...</SectionSkeletonLabel>
              <SectionSkeletonGrid>
                {[1, 2, 3, 4].map(i => (
                  <SectionSkeletonCard key={i} />
                ))}
              </SectionSkeletonGrid>
            </SectionSkeleton>
          )}
          {conversionFunnelError && !conversionFunnelLoading && (
            <ErrorContainer>
              <ErrorTitle>Erro ao carregar funil de conversão</ErrorTitle>
              <ErrorMessage>{conversionFunnelError}</ErrorMessage>
              <RetryButton onClick={refresh}>
                <MdRefresh /> Tentar Novamente
              </RetryButton>
            </ErrorContainer>
          )}
          {!conversionFunnelLoading &&
            !conversionFunnelError &&
            hasConversionFunnelData() && (
              <>
                <FunnelSummary>
                  <StatCard>
                    <StatHeader>
                      <StatIcon color='#3B82F6'>
                        <MdPeople />
                      </StatIcon>
                    </StatHeader>
                    <StatValue>
                      {safeData.conversionFunnel?.totalLeads || 0}
                    </StatValue>
                    <StatLabel>
                      Total de Leads
                      <InfoTooltip
                        content='Número total de leads (potenciais clientes) que entraram no funil de conversão.'
                        direction='down'
                      />
                    </StatLabel>
                  </StatCard>
                  <StatCard>
                    <StatHeader>
                      <StatIcon color='#10B981'>
                        <MdTrendingUp />
                      </StatIcon>
                    </StatHeader>
                    <StatValue>
                      {(safeData.conversionFunnel?.overallConversionRate != null &&
                      !isNaN(safeData.conversionFunnel.overallConversionRate)
                        ? safeData.conversionFunnel.overallConversionRate
                        : 0
                      ).toFixed(2)}
                      %
                    </StatValue>
                    <StatLabel>
                      Taxa de Conversão Geral
                      <InfoTooltip
                        content='Percentual geral de conversão de leads em vendas em todo o funil.'
                        direction='down'
                      />
                    </StatLabel>
                  </StatCard>
                  <StatCard>
                    <StatHeader>
                      <StatIcon color='#8B5CF6'>
                        <MdBarChart />
                      </StatIcon>
                    </StatHeader>
                    <StatValue>
                      <FunnelScore
                        $score={
                          safeData.conversionFunnel?.analysis?.overallScore || 0
                        }
                      >
                        {safeData.conversionFunnel?.analysis?.overallScore || 0}/100
                      </FunnelScore>
                    </StatValue>
                    <StatLabel>
                      Score Geral
                      <InfoTooltip
                        content='Pontuação geral do funil de conversão baseada na análise automática (0-100).'
                        direction='down'
                      />
                    </StatLabel>
                  </StatCard>
                  <StatCard>
                    <StatHeader>
                      <StatIcon color='#F59E0B'>
                        <MdTimer />
                      </StatIcon>
                    </StatHeader>
                    <StatValue style={{ fontSize: '0.875rem' }}>
                      {safeData.conversionFunnel?.period || '-'}
                    </StatValue>
                    <StatLabel>
                      Período
                      <InfoTooltip
                        content='Período de análise dos dados do funil de conversão.'
                        direction='down'
                      />
                    </StatLabel>
                  </StatCard>
                </FunnelSummary>

                {/* Funil Visual Moderno */}
                <TableCard style={{ marginTop: '24px' }}>
                  <TableTitle>
                    <MdBarChart />
                    Visualização do Funil de Conversão
                  </TableTitle>
                  <div style={{ padding: '20px' }}>
                    <Suspense fallback={<LottieLoading />}>
                      <FunnelChart
                        stages={safeData.conversionFunnel?.stages || []}
                        totalLeads={safeData.conversionFunnel?.totalLeads || 0}
                        loading={conversionFunnelLoading}
                        emptyMessage='Nenhum dado do funil disponível'
                      />
                    </Suspense>
                  </div>
                </TableCard>

                {/* Análise do Funil */}
                {safeData.conversionFunnel?.analysis && (
                  <FunnelAnalysisCard style={{ marginTop: '24px' }}>
                    <FunnelAnalysisTitle>
                      📊 Análise do Funil
                    </FunnelAnalysisTitle>
                    <FunnelAnalysisText>
                      {safeData.conversionFunnel.analysis.summary ||
                        'Nenhuma análise disponível.'}
                    </FunnelAnalysisText>

                    {safeData.conversionFunnel?.analysis?.strengths &&
                      safeData.conversionFunnel.analysis.strengths.length > 0 && (
                        <div style={{ marginTop: '20px' }}>
                          <FunnelAnalysisTitle
                            style={{ fontSize: '1rem', marginBottom: '12px' }}
                          >
                            ✅ Pontos Fortes
                          </FunnelAnalysisTitle>
                          <FunnelList>
                            {safeData.conversionFunnel?.analysis?.strengths?.map(
                              (strength, index) => (
                                <FunnelListItem key={index} $type='success'>
                                  {strength}
                                </FunnelListItem>
                              )
                            )}
                          </FunnelList>
                        </div>
                      )}

                    {safeData.conversionFunnel?.analysis?.bottlenecks &&
                      safeData.conversionFunnel.analysis.bottlenecks.length > 0 && (
                        <div style={{ marginTop: '20px' }}>
                          <FunnelAnalysisTitle
                            style={{ fontSize: '1rem', marginBottom: '12px' }}
                          >
                            ⚠️ Gargalos
                          </FunnelAnalysisTitle>
                          <FunnelList>
                            {safeData.conversionFunnel?.analysis?.bottlenecks?.map(
                              (bottleneck, index) => (
                                <FunnelListItem key={index} $type='warning'>
                                  {bottleneck}
                                </FunnelListItem>
                              )
                            )}
                          </FunnelList>
                        </div>
                      )}

                    {safeData.conversionFunnel?.analysis?.opportunities &&
                      safeData.conversionFunnel.analysis.opportunities.length >
                        0 && (
                        <div style={{ marginTop: '20px' }}>
                          <FunnelAnalysisTitle
                            style={{ fontSize: '1rem', marginBottom: '12px' }}
                          >
                            🎯 Oportunidades
                          </FunnelAnalysisTitle>
                          <FunnelList>
                            {safeData.conversionFunnel?.analysis?.opportunities?.map(
                              (opportunity, index) => (
                                <FunnelListItem key={index} $type='info'>
                                  {opportunity}
                                </FunnelListItem>
                              )
                            )}
                          </FunnelList>
                        </div>
                      )}
                  </FunnelAnalysisCard>
                )}

                {safeData.conversionFunnel?.analysis?.insights &&
                  safeData.conversionFunnel.analysis.insights.length > 0 && (
                    <div style={{ marginTop: '24px' }}>
                      <FunnelAnalysisTitle style={{ marginBottom: '20px' }}>
                        💡 Insights Detalhados
                      </FunnelAnalysisTitle>
                      {safeData.conversionFunnel?.analysis?.insights?.map(
                        (insight, index) => (
                          <FunnelInsightCard
                            key={index}
                            $type={insight?.type || 'info'}
                          >
                            <FunnelInsightTitle>
                              {insight?.title || 'Insight'}
                            </FunnelInsightTitle>
                            <FunnelInsightDescription>
                              {insight?.description || ''}
                            </FunnelInsightDescription>
                            {insight?.recommendations &&
                              Array.isArray(insight.recommendations) &&
                              insight.recommendations.length > 0 && (
                                <FunnelInsightRecommendations>
                                  {insight.recommendations.map(
                                    (recommendation, recIndex) => (
                                      <FunnelInsightRecommendation
                                        key={recIndex}
                                      >
                                        {recommendation}
                                      </FunnelInsightRecommendation>
                                    )
                                  )}
                                </FunnelInsightRecommendations>
                              )}
                          </FunnelInsightCard>
                        )
                      )}
                    </div>
                  )}
              </>
            )}
          {!conversionFunnelLoading &&
            !conversionFunnelError &&
            !hasConversionFunnelData() && (
              <EmptyState>
                <EmptyStateIcon>📊</EmptyStateIcon>
                <EmptyStateTitle>
                  Nenhum dado do funil disponível
                </EmptyStateTitle>
                <EmptyStateDescription>
                  Não há dados de conversão para o período selecionado. Tente
                  ajustar os filtros ou aguarde até que mais dados sejam
                  coletados.
                </EmptyStateDescription>
              </EmptyState>
            )}
        </Section>
      )}

      {/* Seção 5: Análise de Churn */}
      {churnLoading && !safeData?.churnAnalysis ? (
        renderSectionSkeleton('Carregando análise de churn...')
      ) : hasChurnAnalysisData() ? (
        <Section>
          <SectionTitle>
            <MdWarning />
            Análise de Churn
            <InfoTooltip
              content='Análise de risco de perda de clientes usando IA. Identifica clientes em risco de churn e fornece recomendações de ações para recuperação.'
              direction='down'
            />
          </SectionTitle>
          {cacheInfo[CACHE_KEYS.CHURN_ANALYSIS]?.isFromCache && (
            <CacheInfoBanner
              formattedTime={
                cacheInfo[CACHE_KEYS.CHURN_ANALYSIS]?.formattedTime
              }
              dataSource='dados de análise de churn'
            />
          )}
          <StatsGrid>
            <StatCard>
              <StatHeader>
                <StatIcon color='#3B82F6'>
                  <MdPeople />
                </StatIcon>
              </StatHeader>
              <StatValue>{safeData?.churnAnalysis?.totalClients || 0}</StatValue>
              <StatLabel>
                Total de Clientes Analisados
                <InfoTooltip
                  content='Número total de clientes que foram analisados para risco de churn.'
                  direction='down'
                />
              </StatLabel>
            </StatCard>
            <StatCard>
              <StatHeader>
                <StatIcon color='#EF4444'>
                  <MdWarning />
                </StatIcon>
              </StatHeader>
              <StatValue>{safeData?.churnAnalysis?.highRisk || 0}</StatValue>
              <StatLabel>
                Risco Alto
                <InfoTooltip
                  content='Clientes com alto risco de churn que requerem atenção imediata.'
                  direction='down'
                />
              </StatLabel>
            </StatCard>
            <StatCard>
              <StatHeader>
                <StatIcon color='#F59E0B'>
                  <MdWarning />
                </StatIcon>
              </StatHeader>
              <StatValue>{safeData?.churnAnalysis?.mediumRisk || 0}</StatValue>
              <StatLabel>
                Risco Médio
                <InfoTooltip
                  content='Clientes com risco médio de churn que precisam de acompanhamento.'
                  direction='down'
                />
              </StatLabel>
            </StatCard>
            <StatCard>
              <StatHeader>
                <StatIcon color='#10B981'>
                  <MdCheckCircle />
                </StatIcon>
              </StatHeader>
              <StatValue>{safeData?.churnAnalysis?.lowRisk || 0}</StatValue>
              <StatLabel>
                Risco Baixo
                <InfoTooltip
                  content='Clientes com baixo risco de churn, considerados estáveis.'
                  direction='down'
                />
              </StatLabel>
            </StatCard>
            <StatCard>
              <StatHeader>
                <StatIcon color='#8B5CF6'>
                  <MdBarChart />
                </StatIcon>
              </StatHeader>
              <StatValue>
                {(safeData?.churnAnalysis?.churnRate &&
                !isNaN(safeData.churnAnalysis.churnRate)
                  ? safeData.churnAnalysis.churnRate
                  : 0
                ).toFixed(1)}
                %
              </StatValue>
              <StatLabel>
                Taxa de Churn Estimada
                <InfoTooltip
                  content='Percentual estimado de clientes que podem deixar a empresa baseado na análise de risco.'
                  direction='down'
                />
              </StatLabel>
            </StatCard>
          </StatsGrid>

          {safeData?.churnAnalysis?.atRiskClients &&
          safeData.churnAnalysis.atRiskClients.length > 0 ? (
            <div>
              {safeData?.churnAnalysis?.atRiskClients
                ?.slice(0, churnToShow)
                .map(client => (
                  <ChurnRiskCard
                    key={client.clientId}
                    riskLevel={client.riskLevel}
                  >
                    <ChurnRiskHeader>
                      <ChurnRiskInfo>
                        <ChurnRiskName>{client.clientName}</ChurnRiskName>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            marginTop: '8px',
                            flexWrap: 'wrap',
                          }}
                        >
                          <div>
                            <ChurnRiskLabel>Score de Risco</ChurnRiskLabel>
                            <ChurnRiskScore
                              $riskColor={getRiskLevelColor(client.riskLevel)}
                            >
                              {client.churnRiskScore != null &&
                              !isNaN(client.churnRiskScore)
                                ? client.churnRiskScore
                                : 0}
                            </ChurnRiskScore>
                          </div>
                          <Badge
                            variant={
                              client.riskLevel === 'high'
                                ? 'danger'
                                : client.riskLevel === 'medium'
                                  ? 'warning'
                                  : 'success'
                            }
                          >
                            Risco {getRiskLevelLabel(client.riskLevel)}
                          </Badge>
                          <div>
                            <ChurnRiskLabel>Prob. Recuperação</ChurnRiskLabel>
                            <ChurnRiskValue>
                              {client.recoveryProbability != null &&
                              !isNaN(client.recoveryProbability)
                                ? client.recoveryProbability
                                : 0}
                              %
                            </ChurnRiskValue>
                          </div>
                        </div>
                        <ChurnRiskDays>
                          Sem contato há{' '}
                          {client.daysSinceLastContact != null &&
                          !isNaN(client.daysSinceLastContact)
                            ? client.daysSinceLastContact
                            : 0}{' '}
                          dias
                        </ChurnRiskDays>
                      </ChurnRiskInfo>
                    </ChurnRiskHeader>
                    <ChurnRiskFactors>
                      <ChurnRiskSectionTitle>
                        Fatores de Risco:
                      </ChurnRiskSectionTitle>
                      <ChurnRiskFactorList>
                        {client.riskFactors.map((factor, index) => (
                          <ChurnRiskFactorItem key={index}>
                            {factor}
                          </ChurnRiskFactorItem>
                        ))}
                      </ChurnRiskFactorList>
                      <ChurnRiskSectionTitle style={{ marginTop: '16px' }}>
                        Ações Recomendadas:
                      </ChurnRiskSectionTitle>
                      <ChurnActionsList>
                        {client.recommendedActions.map((action, index) => (
                          <ChurnActionItem key={index}>
                            {action}
                          </ChurnActionItem>
                        ))}
                      </ChurnActionsList>
                    </ChurnRiskFactors>
                  </ChurnRiskCard>
                ))}
              {safeData?.churnAnalysis?.atRiskClients &&
                safeData.churnAnalysis.atRiskClients.length > churnToShow && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      marginTop: '24px',
                    }}
                  >
                    <FilterButton
                      onClick={() =>
                        setChurnToShow(prev =>
                          Math.min(
                            prev + 5,
                            safeData.churnAnalysis?.atRiskClients?.length || 0
                          )
                        )
                      }
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        fontSize: '0.9375rem',
                      }}
                    >
                      <MdExpandMore size={20} />
                      Ver Mais (
                      {Math.min(
                        5,
                        (safeData.churnAnalysis?.atRiskClients?.length || 0) -
                          churnToShow
                      )}{' '}
                      de{' '}
                      {(safeData.churnAnalysis?.atRiskClients?.length || 0) -
                        churnToShow}{' '}
                      restantes)
                    </FilterButton>
                  </div>
                )}
            </div>
          ) : (
            <EmptyState>
              <EmptyStateIcon>✅</EmptyStateIcon>
              <EmptyStateTitle>Nenhum cliente em risco</EmptyStateTitle>
              <EmptyStateDescription>
                Todos os clientes estão com baixo risco de churn.
              </EmptyStateDescription>
            </EmptyState>
          )}
        </Section>
      ) : null}

      {/* Seção de Análise de Captadores */}
      {(hasCapturesStatisticsData() || loadingCaptures) && (
        <Section>
          <SectionTitle>
            <MdPeople />
            Análise de Captadores
            <InfoTooltip
              content='Estatísticas detalhadas sobre o desempenho dos captadores de propriedades e clientes'
              direction='down'
            />
          </SectionTitle>

          {/* Seletor de Período */}
          <div
            style={{
              marginBottom: '24px',
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
            }}
          >
            <label style={{ fontWeight: 500 }}>Período:</label>
            <select
              value={selectedPeriod}
              onChange={e =>
                setSelectedPeriod(
                  e.target.value as 'month' | 'quarter' | 'year'
                )
              }
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              <option value='month'>Último mês</option>
              <option value='quarter'>Último trimestre</option>
              <option value='year'>Último ano</option>
            </select>
          </div>

          {loadingCaptures && !capturesStatistics ? (
            <SectionSkeleton>
              <SectionSkeletonLabel>Carregando estatísticas de captadores...</SectionSkeletonLabel>
              <SectionSkeletonGrid>
                {[1, 2, 3, 4].map(i => (
                  <SectionSkeletonCard key={i} />
                ))}
              </SectionSkeletonGrid>
            </SectionSkeleton>
          ) : capturesError ? (
            <ErrorContainer>
              <ErrorTitle>Erro ao carregar estatísticas</ErrorTitle>
              <ErrorMessage>{capturesError}</ErrorMessage>
              <RetryButton onClick={() => setSelectedPeriod(selectedPeriod)}>
                Tentar novamente
              </RetryButton>
            </ErrorContainer>
          ) : capturesStatistics ? (
            <>
              {/* Resumo Geral */}
              <StatsGrid>
                <StatCard>
                  <StatHeader>
                    <StatIcon color='#3B82F6'>
                      <MdHome />
                    </StatIcon>
                  </StatHeader>
                  <StatValue>{capturesStatistics.totalProperties}</StatValue>
                  <StatLabel>
                    Total de Propriedades
                    <InfoTooltip
                      content='Número total de propriedades captadas pelos captadores no período.'
                      direction='down'
                    />
                  </StatLabel>
                </StatCard>
                <StatCard>
                  <StatHeader>
                    <StatIcon color='#10B981'>
                      <MdPeople />
                    </StatIcon>
                  </StatHeader>
                  <StatValue>{capturesStatistics.totalClients}</StatValue>
                  <StatLabel>
                    Total de Clientes
                    <InfoTooltip
                      content='Número total de clientes captados pelos captadores no período.'
                      direction='down'
                    />
                  </StatLabel>
                </StatCard>
                <StatCard>
                  <StatHeader>
                    <StatIcon color='#8B5CF6'>
                      <MdBarChart />
                    </StatIcon>
                  </StatHeader>
                  <StatValue>
                    {capturesStatistics.conversionRate.propertiesSoldRate.toFixed(
                      2
                    )}
                    %
                  </StatValue>
                  <StatLabel>
                    Taxa de Conversão - Propriedades
                    <InfoTooltip
                      content='Percentual de propriedades captadas que foram vendidas ou alugadas.'
                      direction='down'
                    />
                  </StatLabel>
                </StatCard>
                <StatCard>
                  <StatHeader>
                    <StatIcon color='#F59E0B'>
                      <MdTrendingUp />
                    </StatIcon>
                  </StatHeader>
                  <StatValue>
                    {capturesStatistics.conversionRate.clientsClosedRate.toFixed(
                      2
                    )}
                    %
                  </StatValue>
                  <StatLabel>
                    Taxa de Conversão - Clientes
                    <InfoTooltip
                      content='Percentual de clientes captados que fecharam negócio.'
                      direction='down'
                    />
                  </StatLabel>
                </StatCard>
              </StatsGrid>

              {/* Ranking de Captadores */}
              {capturesStatistics.byCapturer &&
                capturesStatistics.byCapturer.length > 0 && (
                  <TableCard style={{ marginTop: '24px' }}>
                    <TableTitle>
                      <MdPeople />
                      Ranking de Captadores
                    </TableTitle>
                    <TableContainer>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHeaderCell>Posição</TableHeaderCell>
                            <TableHeaderCell>Nome</TableHeaderCell>
                            <TableHeaderCell>Propriedades</TableHeaderCell>
                            <TableHeaderCell>Clientes</TableHeaderCell>
                            <TableHeaderCell>Total</TableHeaderCell>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {capturesStatistics.byCapturer.map(
                            (capturer, index) => (
                              <TableRow key={capturer.capturerId}>
                                <TableCell>
                                  <Badge
                                    color={
                                      index === 0
                                        ? '#F59E0B'
                                        : index === 1
                                          ? '#6B7280'
                                          : index === 2
                                            ? '#92400E'
                                            : '#E5E7EB'
                                    }
                                  >
                                    {index + 1}º
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <strong>{capturer.capturerName}</strong>
                                  <div
                                    style={{
                                      fontSize: '12px',
                                      color: '#6B7280',
                                      marginTop: '4px',
                                    }}
                                  >
                                    {capturer.capturerEmail}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {capturer.propertiesCount}
                                </TableCell>
                                <TableCell>{capturer.clientsCount}</TableCell>
                                <TableCell>
                                  <strong>{capturer.totalCaptures}</strong>
                                </TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </TableCard>
                )}

              {/* Estatísticas por Tipo */}
              <StatsGrid style={{ marginTop: '24px' }}>
                <TableCard>
                  <TableTitle>
                    <MdHome />
                    Por Tipo de Propriedade
                  </TableTitle>
                  <div style={{ padding: '20px' }}>
                    <Suspense fallback={<LottieLoading />}>
                      <CategoryDistributionChart
                        data={capturesStatistics.byPropertyType
                          .filter(
                            item =>
                              (item.propertyType || item.type) && item.count > 0
                          )
                          .map((item): CategoryData => {
                            const typeValue =
                              item.type || item.propertyType || '';
                            return {
                              label: typeValue
                                ? getTypeText(typeValue)
                                : 'Não especificado',
                              value: item.count || 0,
                            };
                          })}
                        loading={loadingCaptures}
                        emptyMessage='Nenhum dado de propriedade disponível'
                      />
                    </Suspense>
                  </div>
                </TableCard>

                <TableCard>
                  <TableTitle>
                    <MdPeople />
                    Por Tipo de Cliente
                  </TableTitle>
                  <div style={{ padding: '20px' }}>
                    <Suspense fallback={<LottieLoading />}>
                      <CategoryDistributionChart
                        data={capturesStatistics.byClientType
                          .filter(item => item.clientType && item.count > 0)
                          .map(
                            (item): CategoryData => ({
                              label: item.clientType || 'Não especificado',
                              value: item.count || 0,
                            })
                          )}
                        loading={loadingCaptures}
                        emptyMessage='Nenhum dado de cliente disponível'
                      />
                    </Suspense>
                  </div>
                </TableCard>
              </StatsGrid>
            </>
          ) : (
            <EmptyState>
              <EmptyStateIcon>
                <MdBarChart />
              </EmptyStateIcon>
              <EmptyStateTitle>Nenhum dado disponível</EmptyStateTitle>
              <EmptyStateDescription>
                Não há estatísticas de captadores disponíveis para o período
                selecionado.
              </EmptyStateDescription>
            </EmptyState>
          )}
        </Section>
      )}

      {/* Mensagem quando não há dados suficientes */}
      {!hasAnyData() && !loading && (
        <Section>
          <EmptyState>
            <EmptyStateIcon>📊</EmptyStateIcon>
            <EmptyStateTitle>
              Sem dados suficientes para análise
            </EmptyStateTitle>
            <EmptyStateDescription>
              Não há dados disponíveis no momento para exibir as análises. Tente
              ajustar os filtros ou aguarde até que mais dados sejam coletados.
            </EmptyStateDescription>
          </EmptyState>
        </Section>
      )}

      {/* Drawer de Filtros */}
      <AdvancedAnalyticsFiltersDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={newFilters => {
          updateFilters(newFilters);
        }}
        loading={loading}
      />
    </PageContainer>
  );
};

export default AdvancedAnalyticsPage;
