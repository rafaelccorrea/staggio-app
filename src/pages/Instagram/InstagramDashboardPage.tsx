import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { ensureChartRegistration } from '../../components/charts/chartConfig';
import { SafeChartWrapper } from '../../components/charts/ChartProvider';
import {
  TrendingUp,
  MessageSquare,
  Users,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import instagramApi from '../../services/instagramApi';
import type { InstagramInteractionLog } from '../../types/instagram';
import { InstagramNavTabs } from './InstagramNavTabs';

ensureChartRegistration();

// ========== Styled Components (theme dark/light) ==========
const PageContainer = styled.div`
  padding: 12px 16px;
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  max-width: 100%;
  margin: 0 auto;

  @media (min-width: 768px) {
    padding: 16px 24px;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Subtitle = styled.p`
  font-size: 0.9375rem;
  color: ${props => props.theme.colors.textSecondary};
  margin: 6px 0 0 0;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
`;

const SelectNative = styled.select`
  padding: 10px 14px;
  font-size: 0.9375rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  background: ${props => props.theme.colors.cardBackground};
  color: ${props => props.theme.colors.text};
  min-width: 180px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const RefreshButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  background: ${props => props.theme.colors.cardBackground};
  color: ${props => props.theme.colors.text};
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primary};
    color: white;
    border-color: ${props => props.theme.colors.primary};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ErrorAlert = styled.div`
  padding: 12px 16px;
  margin-bottom: 16px;
  border-radius: 8px;
  background: ${props => props.theme.colors.errorBackground};
  border: 1px solid ${props => props.theme.colors.errorBorder};
  color: ${props => props.theme.colors.errorText};
  font-size: 0.9375rem;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 28px;

  @media (min-width: 600px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const StatCard = styled.div`
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.cardBackground};
  padding: 20px;
  box-shadow: ${props => props.theme.colors.shadow};
`;

const StatTitle = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 12px;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ChartCard = styled.div`
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.cardBackground};
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: ${props => props.theme.colors.shadow};
`;

const ChartTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;

  @media (min-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ChartPlaceholder = styled.div`
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9375rem;
  padding: 20px;
`;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6B6B', '#8884D8'];

interface DashboardStats {
  totalLeads: number;
  totalComments: number;
  totalAutomations: number;
  successRate: number;
  leadsLastWeek: Array<{ date: string; count: number }>;
  automationPerformance: Array<{ name: string; leads: number; comments: number }>;
  statusDistribution: Array<{ name: string; value: number }>;
}

export const InstagramDashboardPageV2: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  useEffect(() => {
    loadDashboardStats();
  }, [timeRange]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const automationsResponse = await instagramApi.listAutomations(1, 100);
      const logsResponse = await instagramApi.listInteractionLogs(1, 1000);

      const totalLeads = automationsResponse.data.reduce((sum, a) => sum + a.leadsCreated, 0);
      const totalComments = automationsResponse.data.reduce((sum, a) => sum + a.commentsProcessed, 0);
      const totalAutomations = automationsResponse.total;

      const successCount = logsResponse.data.filter(log => log.status === 'lead_created').length;
      const successRate = logsResponse.total > 0 ? (successCount / logsResponse.total) * 100 : 0;

      const leadsLastWeek = generateTimeSeriesData(logsResponse.data, timeRange);

      const automationPerformance = automationsResponse.data
        .sort((a, b) => b.leadsCreated - a.leadsCreated)
        .slice(0, 5)
        .map(a => ({
          name: a.postCaption?.substring(0, 20) || `Post ${a.instagramPostId?.slice(0, 8) || '?'}`,
          leads: a.leadsCreated,
          comments: a.commentsProcessed,
        }));

      const statusCounts: Record<string, number> = {
        comment_received: 0,
        keyword_matched: 0,
        lead_created: 0,
        failed: 0,
      };

      logsResponse.data.forEach(log => {
        if (log.status in statusCounts) {
          statusCounts[log.status]++;
        }
      });

      const statusDistribution = Object.entries(statusCounts)
        .filter(([, count]) => count > 0)
        .map(([name, value]) => ({
          name: formatStatusName(name),
          value,
        }));

      setStats({
        totalLeads,
        totalComments,
        totalAutomations,
        successRate,
        leadsLastWeek,
        automationPerformance,
        statusDistribution,
      });
    } catch (err) {
      setError('Erro ao carregar estatísticas do dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSeriesData = (
    logs: InstagramInteractionLog[],
    range: 'week' | 'month',
  ) => {
    const now = new Date();
    const days = range === 'week' ? 7 : 30;
    const data: Array<{ date: string; count: number }> = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });

      const count = logs.filter(log => {
        const logDate = new Date(log.createdAt);
        return logDate.toDateString() === date.toDateString() && log.status === 'lead_created';
      }).length;

      data.push({ date: dateStr, count });
    }

    return data;
  };

  const formatStatusName = (status: string): string => {
    const statusMap: Record<string, string> = {
      comment_received: 'Comentários Recebidos',
      keyword_matched: 'Palavras-chave Detectadas',
      lead_created: 'Leads Criados',
      failed: 'Falhas',
    };
    return statusMap[status] || status;
  };

  return (
    <PageContainer>
      <InstagramNavTabs />

      <PageHeader>
        <div>
          <Title>
            <TrendingUp size={28} />
            Dashboard de Leads
          </Title>
          <Subtitle>Acompanhe o desempenho das suas automações de Instagram em tempo real</Subtitle>
        </div>
        <FilterContainer>
          <SelectNative
            value={timeRange}
            onChange={e => setTimeRange(e.target.value as 'week' | 'month')}
          >
            <option value="week">Última Semana</option>
            <option value="month">Último Mês</option>
          </SelectNative>
          <RefreshButton onClick={loadDashboardStats} disabled={loading}>
            <RefreshCw size={16} />
            {loading ? 'Atualizando...' : 'Atualizar'}
          </RefreshButton>
        </FilterContainer>
      </PageHeader>

      {error && <ErrorAlert>{error}</ErrorAlert>}

      <StatsContainer>
        <StatCard>
          <StatTitle>Total de Leads</StatTitle>
          <StatValue>
            <CheckCircle2 size={22} style={{ color: 'var(--color-success, #3FA66B)' }} />
            {stats?.totalLeads ?? 0}
          </StatValue>
        </StatCard>
        <StatCard>
          <StatTitle>Comentários Processados</StatTitle>
          <StatValue>
            <MessageSquare size={22} style={{ color: '#1890ff' }} />
            {stats?.totalComments ?? 0}
          </StatValue>
        </StatCard>
        <StatCard>
          <StatTitle>Automações Ativas</StatTitle>
          <StatValue>
            <Users size={22} style={{ color: '#722ed1' }} />
            {stats?.totalAutomations ?? 0}
          </StatValue>
        </StatCard>
        <StatCard>
          <StatTitle>Taxa de Sucesso</StatTitle>
          <StatValue>
            <AlertCircle size={22} style={{ color: 'var(--color-warning, #E6B84C)' }} />
            {(stats?.successRate ?? 0).toFixed(1)}%
          </StatValue>
        </StatCard>
      </StatsContainer>

      {loading && !stats ? (
        <ChartCard>
          <ChartPlaceholder>Carregando estatísticas...</ChartPlaceholder>
        </ChartCard>
      ) : (
        stats && (
          <>
            <ChartCard>
              <ChartTitle>Leads Capturados ({timeRange === 'week' ? 'Última Semana' : 'Último Mês'})</ChartTitle>
              {stats.leadsLastWeek.length > 0 ? (
                <div style={{ height: 300 }}>
                  <SafeChartWrapper fallback={<ChartPlaceholder>Carregando gráfico...</ChartPlaceholder>}>
                    <Line
                      data={{
                        labels: stats.leadsLastWeek.map(d => d.date),
                        datasets: [
                          {
                            label: 'Leads',
                            data: stats.leadsLastWeek.map(d => d.count),
                            borderColor: '#0088FE',
                            backgroundColor: 'rgba(0, 136, 254, 0.2)',
                            fill: true,
                            tension: 0.3,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                          y: { beginAtZero: true, ticks: { stepSize: 1 } },
                        },
                      }}
                    />
                  </SafeChartWrapper>
                </div>
              ) : (
                <ChartPlaceholder>Sem dados disponíveis</ChartPlaceholder>
              )}
            </ChartCard>

            <ChartsGrid>
              <ChartCard>
                <ChartTitle>Distribuição de Status</ChartTitle>
                {stats.statusDistribution.length > 0 ? (
                  <div style={{ height: 300 }}>
                    <SafeChartWrapper fallback={<ChartPlaceholder>Carregando...</ChartPlaceholder>}>
                      <Pie
                        data={{
                          labels: stats.statusDistribution.map(d => d.name),
                          datasets: [
                            {
                              data: stats.statusDistribution.map(d => d.value),
                              backgroundColor: stats.statusDistribution.map((_, i) => COLORS[i % COLORS.length]),
                              borderWidth: 2,
                              borderColor: 'transparent',
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { position: 'bottom' },
                            tooltip: {
                              callbacks: {
                                label: (ctx) => {
                                  const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
                                  const pct = total ? ((ctx.parsed / total) * 100).toFixed(0) : 0;
                                  return `${ctx.label}: ${ctx.parsed} (${pct}%)`;
                                },
                              },
                            },
                          },
                        }}
                      />
                    </SafeChartWrapper>
                  </div>
                ) : (
                  <ChartPlaceholder>Sem dados disponíveis</ChartPlaceholder>
                )}
              </ChartCard>

              <ChartCard>
                <ChartTitle>Performance das Automações (Top 5)</ChartTitle>
                {stats.automationPerformance.length > 0 ? (
                  <div style={{ height: 300 }}>
                    <SafeChartWrapper fallback={<ChartPlaceholder>Carregando...</ChartPlaceholder>}>
                      <Bar
                        data={{
                          labels: stats.automationPerformance.map(d => d.name),
                          datasets: [
                            { label: 'Leads Criados', data: stats.automationPerformance.map(d => d.leads), backgroundColor: '#0088FE' },
                            { label: 'Comentários Processados', data: stats.automationPerformance.map(d => d.comments), backgroundColor: '#00C49F' },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { position: 'top' } },
                          scales: {
                            y: { beginAtZero: true, ticks: { stepSize: 1 } },
                          },
                        }}
                      />
                    </SafeChartWrapper>
                  </div>
                ) : (
                  <ChartPlaceholder>Sem dados disponíveis</ChartPlaceholder>
                )}
              </ChartCard>
            </ChartsGrid>
          </>
        )
      )}
    </PageContainer>
  );
};

export default InstagramDashboardPageV2;
