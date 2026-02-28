import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled, { css } from 'styled-components';
import {
  MdArrowBack,
  MdFilterList,
  MdDateRange,
  MdAutoAwesome,
  MdOpenInNew,
} from 'react-icons/md';
import { Layout } from '../components/layout/Layout';
import { useTeams } from '../hooks/useTeams';
import { useProjects } from '../hooks/useProjects';
import { useUsers } from '../hooks/useUsers';
import { kanbanMetricsApi } from '../services/kanbanMetricsApi';
import type { FunnelInsights } from '../types/kanban';

// Lazy load dashboards para reduzir bundle inicial e melhorar performance
const TasksMetricsDashboard = lazy(
  () =>
    import('../components/kanban/TasksMetricsDashboard').then(m => ({
      default: m.TasksMetricsDashboard,
    }))
);
const SubtaskMetricsDashboard = lazy(
  () =>
    import('../components/kanban/SubtaskMetricsDashboard').then(m => ({
      default: m.SubtaskMetricsDashboard,
    }))
);
const ColumnValueAnalysisDashboard = lazy(
  () =>
    import('../components/kanban/ColumnValueAnalysisDashboard').then(m => ({
      default: m.ColumnValueAnalysisDashboard,
    }))
);

// Skeleton leve para conteúdo das abas (Suspense fallback)
const TabSkeleton = styled.div`
  min-height: 280px;
  background: ${p => p.theme.colors?.cardBackground ?? '#fff'};
  border: 1px solid ${p => p.theme.colors?.border ?? '#e5e7eb'};
  border-radius: 16px;
  padding: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${p => p.theme.colors?.textSecondary ?? '#6b7280'};
  font-size: 0.9rem;
`;

const PageContainer = styled.div`
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0 16px 24px;
  box-sizing: border-box;
  overflow-x: hidden;
  min-width: 0;

  @media (min-width: 1440px) {
    padding: 0 24px 32px;
  }

  @media (max-width: 768px) {
    padding: 0 12px 20px;
  }

  @media (max-width: 480px) {
    padding: 0 10px 16px;
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin: 0 -16px 0;
  padding: 20px 16px 24px;
  background: ${p => p.theme.colors?.surface ?? 'transparent'};
  border-bottom: 1px solid ${p => p.theme.colors?.border ?? '#e5e7eb'};
  min-width: 0;

  @media (min-width: 1440px) {
    margin: 0 -24px 0;
    padding: 24px 24px 28px;
  }

  @media (max-width: 768px) {
    margin: 0 -12px 0;
    padding: 16px 12px 20px;
    flex-direction: column-reverse;
    align-items: stretch;
  }

  @media (max-width: 480px) {
    margin: 0 -10px 0;
    padding: 14px 10px 18px;
  }
`;

const HeaderLeft = styled.div`
  flex: 1;
  min-width: 0;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 0;
  margin-bottom: 4px;
  background: none;
  border: none;
  color: ${p => p.theme.colors?.textSecondary ?? '#6b7280'};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.15s ease, transform 0.15s ease;
  flex-shrink: 0;
  border-radius: 6px;

  &:hover {
    color: ${p => p.theme.colors?.primary ?? '#a63126'};
  }

  @media (max-width: 480px) {
    font-size: 0.8125rem;
  }
`;

const Title = styled.h1`
  font-size: 1.625rem;
  font-weight: 700;
  color: ${p => p.theme.colors?.text ?? '#111827'};
  margin: 0 0 6px 0;
  letter-spacing: -0.025em;
  line-height: 1.25;

  @media (max-width: 768px) {
    font-size: 1.375rem;
  }

  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

const Subtitle = styled.p`
  font-size: 0.875rem;
  color: ${p => p.theme.colors?.textSecondary ?? '#6b7280'};
  margin: 0;
  line-height: 1.45;
`;

const FiltersCard = styled.div`
  background: ${p => p.theme.colors?.cardBackground ?? '#fff'};
  border: 1px solid ${p => p.theme.colors?.border ?? '#e5e7eb'};
  border-radius: 12px;
  padding: 18px 20px;
  margin: 20px 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  min-width: 0;

  @media (max-width: 768px) {
    padding: 14px 16px;
    margin: 16px 0;
    border-radius: 10px;
  }

  @media (max-width: 480px) {
    padding: 12px 14px;
    margin: 14px 0;
  }
`;

const FiltersHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const FiltersTitle = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${p => p.theme.colors?.textSecondary ?? '#6b7280'};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  align-items: end;
  min-width: 0;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  @media (max-width: 380px) {
    gap: 10px;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

const FilterLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 500;
  color: ${p => p.theme.colors?.text ?? '#374151'};
`;

const DateRow = styled.div`
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${p => p.theme.colors?.border ?? '#e5e7eb'};

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-top: 10px;
    padding-top: 10px;
  }
`;

const inputStyles = css`
  padding: 10px 12px;
  border: 1px solid ${p => p.theme.colors?.border ?? '#e5e7eb'};
  border-radius: 10px;
  font-size: 0.9rem;
  background: ${p => p.theme.colors?.surface ?? '#fafafa'};
  color: ${p => p.theme.colors?.text ?? '#111827'};
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${p => p.theme.colors?.primary ?? '#a63126'};
    box-shadow: 0 0 0 3px ${p => (p.theme.colors?.primary ?? '#a63126') + '20'};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  ${inputStyles}
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 10px center;
  background-repeat: no-repeat;
  background-size: 14px;
  padding-right: 36px;
  cursor: pointer;
`;

const DateInput = styled.input`
  ${inputStyles}
`;

const ClearFiltersButton = styled.button`
  margin-top: 12px;
  padding: 8px 16px;
  background: transparent;
  color: ${p => p.theme.colors?.textSecondary ?? '#6b7280'};
  border: 1px solid ${p => p.theme.colors?.border ?? '#e5e7eb'};
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${p => p.theme.colors?.backgroundSecondary ?? '#f3f4f6'};
    border-color: ${p => p.theme.colors?.primary ?? '#a63126'};
    color: ${p => p.theme.colors?.primary ?? '#a63126'};
  }
`;

const TabsWrap = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 18px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  min-width: 0;
  padding-bottom: 1px;
  border-bottom: 1px solid ${p => p.theme.colors?.border ?? '#e5e7eb'};

  @media (max-width: 480px) {
    margin-bottom: 14px;
    margin-left: -10px;
    margin-right: -10px;
    padding-left: 10px;
    padding-right: 10px;
  }
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 10px 16px;
  margin-bottom: -1px;
  border: none;
  border-bottom: 2px solid ${p => (p.$active ? (p.theme.colors?.primary ?? '#a63126') : 'transparent')};
  border-radius: 0;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease;
  flex-shrink: 0;
  white-space: nowrap;
  background: transparent;
  color: ${p =>
    p.$active ? p.theme.colors?.primary ?? '#a63126' : p.theme.colors?.textSecondary ?? '#6b7280'};

  &:hover {
    color: ${p => p.theme.colors?.primary ?? '#a63126'};
  }

  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 0.8125rem;
  }
`;

const InsightsCard = styled.div`
  background: ${p => p.theme.colors?.cardBackground ?? '#fff'};
  border: 1px solid ${p => p.theme.colors?.border ?? '#e5e7eb'};
  border-radius: 12px;
  padding: 18px 20px;
  margin-bottom: 18px;
  border-left: 4px solid ${p => p.theme.colors?.primary ?? '#a63126'};
  min-width: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    padding: 14px 16px;
    margin-bottom: 14px;
  }

  @media (max-width: 480px) {
    padding: 12px 14px;
    margin-bottom: 12px;
    border-radius: 10px;
  }
`;

const InsightsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
`;

const InsightsTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${p => p.theme.colors?.text ?? '#111827'};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InsightsText = styled.p`
  font-size: 0.9rem;
  color: ${p => p.theme.colors?.textSecondary ?? '#6b7280'};
  margin: 0;
  line-height: 1.5;
`;

const LinkToInsightsPage = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  color: ${p => p.theme.colors?.primary ?? '#a63126'};
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.85;
    text-decoration: underline;
  }
`;

const InsightsList = styled.ul`
  margin: 10px 0 0 0;
  padding-left: 20px;
  font-size: 0.9rem;
  color: ${p => p.theme.colors?.textSecondary ?? '#6b7280'};
  line-height: 1.5;
`;

const EmptyState = styled.div`
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
  text-align: center;
  color: ${p => p.theme.colors?.textSecondary ?? '#6b7280'};
  font-size: 0.875rem;
  background: ${p => p.theme.colors?.cardBackground ?? '#fff'};
  border: 1px solid ${p => p.theme.colors?.border ?? '#e5e7eb'};
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const TabContentArea = styled.div`
  min-width: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

const KanbanMetricsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { teams, refreshTeams } = useTeams();
  const { users, getUsers } = useUsers();

  const [funnelInsights, setFunnelInsights] = useState<
    FunnelInsights | undefined
  >(undefined);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [teamsUsersLoaded, setTeamsUsersLoaded] = useState(false);

  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    () => searchParams.get('teamId') || ''
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    () => searchParams.get('projectId') || ''
  );
  const [selectedUserId, setSelectedUserId] = useState<string>(
    () => searchParams.get('userId') || ''
  );
  const [startDate, setStartDate] = useState<string>(
    () => searchParams.get('startDate') || ''
  );
  const [endDate, setEndDate] = useState<string>(
    () => searchParams.get('endDate') || ''
  );
  const [activeTab, setActiveTab] = useState<
    'negotiations' | 'subtasks' | 'column-values'
  >(
    () =>
      (searchParams.get('tab') as
        | 'negotiations'
        | 'subtasks'
        | 'column-values') || 'negotiations'
  );

  const validTeamId =
    selectedTeamId && selectedTeamId !== '' ? selectedTeamId : undefined;
  const { projects } = useProjects(validTeamId);

  // Carregar equipes e usuários uma vez (não bloqueia render da página)
  useEffect(() => {
    let cancelled = false;
    Promise.all([refreshTeams(), getUsers({ limit: 100 })])
      .then(() => {
        if (!cancelled) setTeamsUsersLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setTeamsUsersLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshTeams, getUsers]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedTeamId) params.set('teamId', selectedTeamId);
    if (selectedProjectId) params.set('projectId', selectedProjectId);
    if (selectedUserId) params.set('userId', selectedUserId);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (activeTab) params.set('tab', activeTab);
    setSearchParams(params, { replace: true });
  }, [
    selectedTeamId,
    selectedProjectId,
    selectedUserId,
    startDate,
    endDate,
    activeTab,
    setSearchParams,
  ]);

  useEffect(() => {
    if (!selectedTeamId || !selectedProjectId) {
      setFunnelInsights(undefined);
      return;
    }
    let cancelled = false;
    setInsightsLoading(true);
    kanbanMetricsApi
      .getFunnelInsights(selectedTeamId, selectedProjectId)
      .then(data => {
        if (!cancelled) setFunnelInsights(data);
      })
      .catch(() => {
        if (!cancelled) setFunnelInsights(undefined);
      })
      .finally(() => {
        if (!cancelled) setInsightsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedTeamId, selectedProjectId]);

  const handleClearFilters = useCallback(() => {
    setSelectedTeamId('');
    setSelectedProjectId('');
    setSelectedUserId('');
    setStartDate('');
    setEndDate('');
  }, []);

  const handleBack = useCallback(() => {
    navigate('/kanban');
  }, [navigate]);

  const taskId = selectedProjectId || undefined;
  const hasFilters =
    !!selectedTeamId ||
    !!selectedProjectId ||
    !!selectedUserId ||
    !!startDate ||
    !!endDate;

  const renderTabContent = () => {
    if (activeTab === 'negotiations') {
      return (
        <Suspense
          fallback={<TabSkeleton>Carregando métricas de negociações...</TabSkeleton>}
        >
          <TasksMetricsDashboard
            teamId={selectedTeamId || undefined}
            projectId={selectedProjectId || undefined}
            userId={selectedUserId || undefined}
            startDate={startDate || undefined}
            endDate={endDate || undefined}
          />
        </Suspense>
      );
    }
    if (activeTab === 'subtasks') {
      return (
        <Suspense
          fallback={<TabSkeleton>Carregando métricas de subtarefas...</TabSkeleton>}
        >
          <SubtaskMetricsDashboard
            teamId={selectedTeamId || undefined}
            taskId={taskId}
            userId={selectedUserId || undefined}
            startDate={startDate || undefined}
            endDate={endDate || undefined}
          />
        </Suspense>
      );
    }
    if (selectedTeamId) {
      return (
        <Suspense
          fallback={
            <TabSkeleton>Carregando análise por coluna...</TabSkeleton>
          }
        >
          <ColumnValueAnalysisDashboard
            teamId={selectedTeamId}
            startDate={startDate || undefined}
            endDate={endDate || undefined}
          />
        </Suspense>
      );
    }
    return (
      <EmptyState>
        Selecione uma equipe para visualizar a análise de valores por coluna
      </EmptyState>
    );
  };

  return (
    <Layout>
      <PageContainer>
        <Header>
          <HeaderLeft>
            <BackButton onClick={handleBack} type="button">
              <MdArrowBack size={18} />
              Voltar
            </BackButton>
            <Title>Métricas e Analytics do Funil de Vendas</Title>
            <Subtitle>
              Analise o desempenho de negociações, subtarefas e corretores
            </Subtitle>
          </HeaderLeft>
        </Header>

        <FiltersCard>
          <FiltersHeader>
            <MdFilterList size={18} />
            <FiltersTitle>Filtros</FiltersTitle>
          </FiltersHeader>
          <FiltersGrid>
            <FilterGroup>
              <FilterLabel>Equipe</FilterLabel>
              <Select
                value={selectedTeamId}
                onChange={e => {
                  setSelectedTeamId(e.target.value);
                  setSelectedProjectId('');
                }}
                disabled={!teamsUsersLoaded}
              >
                <option value="">
                  {teamsUsersLoaded ? 'Todas as equipes' : 'Carregando...'}
                </option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </Select>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Projeto</FilterLabel>
              <Select
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
                disabled={!selectedTeamId}
              >
                <option value="">Todos os projetos</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Corretor</FilterLabel>
              <Select
                value={selectedUserId}
                onChange={e => setSelectedUserId(e.target.value)}
                disabled={!teamsUsersLoaded}
              >
                <option value="">
                  {teamsUsersLoaded ? 'Todos os corretores' : 'Carregando...'}
                </option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </Select>
            </FilterGroup>
          </FiltersGrid>

          <DateRow>
            <FilterGroup>
              <FilterLabel>
                <MdDateRange size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Data inicial
              </FilterLabel>
              <DateInput
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </FilterGroup>
            <FilterGroup>
              <FilterLabel>
                <MdDateRange size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Data final
              </FilterLabel>
              <DateInput
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                min={startDate}
              />
            </FilterGroup>
          </DateRow>

          {hasFilters && (
            <ClearFiltersButton onClick={handleClearFilters}>
              Limpar filtros
            </ClearFiltersButton>
          )}
        </FiltersCard>

        {selectedTeamId && selectedProjectId && (
          <InsightsCard>
            <InsightsHeader>
              <InsightsTitle>
                <MdAutoAwesome size={20} />
                Insights IA
              </InsightsTitle>
              <LinkToInsightsPage
                href={`/kanban/insights?teamId=${selectedTeamId}&projectId=${selectedProjectId}`}
                onClick={e => {
                  e.preventDefault();
                  navigate(
                    `/kanban/insights?teamId=${selectedTeamId}&projectId=${selectedProjectId}`
                  );
                }}
              >
                <MdOpenInNew size={16} />
                Ver tela completa
              </LinkToInsightsPage>
            </InsightsHeader>
            {insightsLoading ? (
              <InsightsText>Carregando insights do funil...</InsightsText>
            ) : funnelInsights ? (
              <>
                {funnelInsights.summaryText ? (
                  <InsightsText>{funnelInsights.summaryText}</InsightsText>
                ) : (
                  <InsightsText>
                    O funil tem{' '}
                    <strong>{funnelInsights.summary.totalOpenTasks}</strong>{' '}
                    negociação(ões) aberta(s).
                    {funnelInsights.summary.stuckCount > 0 && (
                      <>
                        {' '}
                        <strong>{funnelInsights.summary.stuckCount}</strong>{' '}
                        parada(s) há 7+ dias.
                      </>
                    )}
                    {funnelInsights.summary.needFollowUpCount > 0 && (
                      <>
                        {' '}
                        <strong>
                          {funnelInsights.summary.needFollowUpCount}
                        </strong>{' '}
                        precisam de follow-up.
                      </>
                    )}
                    {funnelInsights.summary.priorityCount > 0 && (
                      <>
                        {' '}
                        Sugestão: foque em{' '}
                        <strong>{funnelInsights.summary.priorityCount}</strong>{' '}
                        prioridade(s) hoje.
                      </>
                    )}
                    {funnelInsights.summary.totalOpenTasks === 0 &&
                      ' Nenhuma negociação aberta no momento.'}
                  </InsightsText>
                )}
                {funnelInsights.focusSuggestions &&
                  funnelInsights.focusSuggestions.length > 0 && (
                    <InsightsList>
                      {funnelInsights.focusSuggestions.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </InsightsList>
                  )}
              </>
            ) : (
              <InsightsText>
                Selecione equipe e projeto para ver os insights do funil.
              </InsightsText>
            )}
          </InsightsCard>
        )}

        <TabsWrap>
          <Tab
            $active={activeTab === 'negotiations'}
            onClick={() => setActiveTab('negotiations')}
          >
            Negociações
          </Tab>
          <Tab
            $active={activeTab === 'subtasks'}
            onClick={() => setActiveTab('subtasks')}
          >
            Subtarefas
          </Tab>
          <Tab
            $active={activeTab === 'column-values'}
            onClick={() => setActiveTab('column-values')}
          >
            Análise por coluna
          </Tab>
        </TabsWrap>

        <TabContentArea>{renderTabContent()}</TabContentArea>
      </PageContainer>
    </Layout>
  );
};

export default KanbanMetricsPage;
