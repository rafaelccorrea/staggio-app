import React, {
  useEffect,
  useState,
  lazy,
  Suspense,
  memo,
  useMemo,
  useCallback,
  useRef,
} from 'react';
// IMPORTANT: Ensure Chart.js scales are registered before any chart component renders
import { ensureChartRegistration } from '../components/charts/chartConfig';
ensureChartRegistration();
import { ConnectionError } from '../components';
import { OptimizedLoading } from '../components/common/OptimizedLoading';
import AdminDashboardShimmer from '../components/shimmer/AdminDashboardShimmer';
import { useDashboard } from '../hooks/useDashboard';
import { useAutoReloadOnCompanyChange } from '../hooks/useCompanyMonitor';
import { useCompanyLoader } from '../hooks/useCompanyLoader';
import { InfoConfiguracao } from '../components/common/InfoConfiguracao';
import { InfoTooltip } from '../components/common/InfoTooltip';
import { OwnerConditional, OwnerIndicator } from '../components';
import { formatCurrency, formatCurrencyCompact } from '../utils/formatNumbers';
import { useAuth } from '../hooks/useAuth';
import dayjs from 'dayjs';

// Direct imports for charts to avoid dynamic import issues
import PropertyTypeChart from '../components/charts/PropertyTypeChart';
import SalesChart from '../components/charts/SalesChart';
import LocationChart from '../components/charts/LocationChart';
import LeadSourcesChart from '../components/charts/LeadSourcesChart';
const DashboardConfig = lazy(
  () => import('../components/dashboard/DashboardConfig')
);
const DashboardFilters = lazy(
  () => import('../components/dashboard/DashboardFilters')
);
const TopPerformersWidget = lazy(
  () => import('../components/dashboard/TopPerformersWidget')
);
const TasksWidget = lazy(() => import('../components/dashboard/TasksWidget'));
const RecentLeadsWidget = lazy(
  () => import('../components/dashboard/RecentLeadsWidget')
);

// Componente memoizado para cards de estatísticas
const StatCardMemo = memo(
  ({
    icon: Icon,
    color,
    value,
    label,
    growth,
    tooltip,
    tooltipDirection = 'down',
  }: {
    icon: React.ComponentType;
    color: string;
    value: string | number;
    label: string;
    growth?: number;
    tooltip?: string;
    tooltipDirection?: 'up' | 'down' | 'top-right';
  }) => (
    <StatCard>
      <StatHeader>
        <StatIcon color={color}>
          <Icon />
        </StatIcon>
        <HeaderRight>
          {growth !== undefined && growth !== 0 && (
            <StatTrend $positive={growth > 0}>
              {growth > 0 ? <MdTrendingUp /> : <MdTrendingDown />}
              {Math.abs(growth).toFixed(1)}%
            </StatTrend>
          )}
          {tooltip && (
            <InfoTooltip content={tooltip} direction={tooltipDirection} />
          )}
        </HeaderRight>
      </StatHeader>
      <StatValue>{value}</StatValue>
      <StatLabel>{label}</StatLabel>
    </StatCard>
  )
);

StatCardMemo.displayName = 'StatCardMemo';

// Tipos para componentes lazy
type DashboardCard = {
  id: string;
  label: string;
  category: 'stats' | 'charts' | 'widgets' | 'activities';
  enabled: boolean;
  order: number;
};

type DashboardFiltersData = {
  dateRange: 'today' | '7d' | '30d' | '90d' | '1y' | 'custom';
  compareWith?: 'none' | 'previous_period' | 'previous_year';
  teamMember?: string;
  metric?: 'all' | 'sales' | 'revenue' | 'leads' | 'conversions';
  companyIds?: string[];
  startDate?: string;
  endDate?: string;
};

import {
  PageContainer,
  PageHeader,
  PageTitle,
  PageSubtitle,
  StatsGrid,
  StatCard,
  StatHeader,
  HeaderRight,
  StatIcon,
  StatTrend,
  StatValue,
  StatLabel,
  ChartsGrid,
  ChartCard,
  ChartTitle,
  ChartContent,
  ActivityCard,
  ActivityTitle,
  ActivityList,
  ActivityItem,
  ActivityIcon,
  ActivityContent,
  ActivityItemTitle,
  ActivityDescription,
  ActivityTime,
  QuickActions,
  FilterButton,
  FilterBadge,
  ModernPerformanceGrid,
  ModernTeamCard,
  ModernBusinessCard,
  ModernCardHeader,
  ModernCardIcon,
  ModernCardTitle,
  ModernCardSubtitle,
  ModernCardContent,
  ModernTeamStats,
  ModernTeamStatItem,
  ModernTeamStatIcon,
  ModernTeamStatContent,
  ModernTeamStatValue,
  ModernTeamStatLabel,
  ModernBusinessMetrics,
  ModernBusinessMetric,
  ModernBusinessMetricLabel,
  ModernBusinessMetricValue,
  ModernBusinessMetricTrend,
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  WidgetsGrid,
} from '../styles/pages/DashboardPageStyles';
import { PageLightBg } from '../styles/components/PageStyles';
import { getTheme } from '../styles/theme';
import {
  MdApartment,
  MdGroup,
  MdAttachMoney,
  MdTrendingUp,
  MdTrendingDown,
  MdBarChart,
  MdPieChart,
  MdEvent,
  MdLocationOn,
  MdStar,
  MdTimer,
  MdHomeWork,
  MdCheckCircle,
  MdSchedule,
  MdSettings,
  MdDescription,
  MdContactPhone,
  MdAccountBalance,
  MdFilterList,
} from 'react-icons/md';

// Configuração padrão dos cards do Dashboard
const DEFAULT_DASHBOARD_CARDS: DashboardCard[] = [
  {
    id: 'properties',
    label: 'Propriedades',
    category: 'stats',
    enabled: true,
    order: 1,
  },
  {
    id: 'users',
    label: 'Usuários',
    category: 'stats',
    enabled: true,
    order: 2,
  },
  {
    id: 'sales',
    label: 'Vendas Totais',
    category: 'stats',
    enabled: true,
    order: 3,
  },
  {
    id: 'rating',
    label: 'Avaliação Média',
    category: 'stats',
    enabled: true,
    order: 4,
  },
  {
    id: 'revenue',
    label: 'Receita Total',
    category: 'stats',
    enabled: true,
    order: 5,
  },
  {
    id: 'clients',
    label: 'Clientes Ativos',
    category: 'stats',
    enabled: true,
    order: 6,
  },
  {
    id: 'conversion',
    label: 'Taxa de Conversão',
    category: 'stats',
    enabled: true,
    order: 7,
  },
  {
    id: 'leads',
    label: 'Leads Totais',
    category: 'stats',
    enabled: true,
    order: 8,
  },
  {
    id: 'appointments',
    label: 'Agendamentos',
    category: 'stats',
    enabled: true,
    order: 9,
  },
  {
    id: 'documents',
    label: 'Documentos Pendentes',
    category: 'stats',
    enabled: true,
    order: 10,
  },
  {
    id: 'sales-chart',
    label: 'Vendas por Mês',
    category: 'charts',
    enabled: true,
    order: 11,
  },
  {
    id: 'property-types',
    label: 'Tipos de Propriedade',
    category: 'charts',
    enabled: true,
    order: 12,
  },
  {
    id: 'location-chart',
    label: 'Distribuição por Região',
    category: 'charts',
    enabled: true,
    order: 13,
  },
  {
    id: 'lead-sources',
    label: 'Origem dos Clientes',
    category: 'charts',
    enabled: true,
    order: 14,
  },
  {
    id: 'top-performers',
    label: 'Top Performers',
    category: 'widgets',
    enabled: true,
    order: 15,
  },
  {
    id: 'tasks',
    label: 'Tarefas Urgentes',
    category: 'widgets',
    enabled: true,
    order: 21,
  },
  {
    id: 'recent-leads',
    label: 'Leads Recentes',
    category: 'widgets',
    enabled: true,
    order: 22,
  },
  {
    id: 'team-performance',
    label: 'Performance da Equipe',
    category: 'widgets',
    enabled: true,
    order: 23,
  },
  {
    id: 'business-analysis',
    label: 'Análise de Negócios',
    category: 'widgets',
    enabled: true,
    order: 24,
  },
  {
    id: 'activities',
    label: 'Atividades Recentes',
    category: 'activities',
    enabled: true,
    order: 25,
  },
];

// Paleta fixa da marca (evita dependência de ThemeContext e garante que o dashboard carregue)
const DASHBOARD_PALETTE = (() => {
  const raw = getTheme('light').rawColors ?? {};
  return {
    primary: raw.primary ?? '#A63126',
    secondary: raw.secondary ?? '#592722',
    success: raw.success ?? '#3FA66B',
    warning: raw.warning ?? '#E6B84C',
    info: raw.info ?? '#4A90E2',
    error: raw.error ?? '#E05A5A',
    purple: raw.purple ?? '#8B5CF6',
    textLight: raw.textLight ?? '#6B7280',
  };
})();

const DashboardPage: React.FC = () => {
  const palette = DASHBOARD_PALETTE;
  const {
    data: dashboardData,
    loading,
    error,
    filters: apiFilters,
    updateFilters,
    refresh,
    clearCache,
  } = useDashboard();
  const { getCurrentUser } = useAuth();
  const [showConfig, setShowConfig] = useState(false);

  // Garantir que as companies sejam carregadas quando o dashboard for acessado
  useCompanyLoader();
  const [showFilters, setShowFilters] = useState(false);

  // Garantir que sempre renderize algo durante o carregamento inicial
  // Evitar tela branca quando o componente é montado
  // IMPORTANTE: hasRenderedOnce começa como false para garantir loading no primeiro render
  const [hasRenderedOnce, setHasRenderedOnce] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Marcar que já renderizou pelo menos uma vez após o primeiro render
    // Usar um pequeno delay para garantir que o loading seja mostrado durante o carregamento inicial
    const timer = setTimeout(() => {
      setHasRenderedOnce(true);
      setIsInitialLoad(false);
    }, 300); // 300ms para garantir que o loading seja visível

    return () => clearTimeout(timer);
  }, []);

  // Função para converter filtros da API para o formato local
  const convertApiFilters = useCallback(
    (filters: any): DashboardFiltersData => {
      const user = getCurrentUser();
      const isAdminOrMaster = user?.role === 'admin' || user?.role === 'master';

      // Se for admin/master e não houver filtros definidos, usar período custom com datas padrão
      if (isAdminOrMaster) {
        // Se não tiver dateRange definido, ou se for custom sem datas, inicializar com padrão
        if (
          !filters.dateRange ||
          (filters.dateRange === 'custom' &&
            (!filters.startDate || !filters.endDate))
        ) {
          const firstDayOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
          const today = dayjs().format('YYYY-MM-DD');
          return {
            dateRange: 'custom',
            startDate: filters.startDate || firstDayOfMonth,
            endDate: filters.endDate || today,
            compareWith: filters.compareWith || 'none',
            teamMember: filters.teamMember,
            metric: filters.metric || 'all',
            companyIds: filters.companyIds,
          };
        }

        // Se já for custom com datas, apenas retornar
        if (filters.dateRange === 'custom') {
          return {
            dateRange: 'custom',
            startDate: filters.startDate,
            endDate: filters.endDate,
            compareWith: filters.compareWith || 'none',
            teamMember: filters.teamMember,
            metric: filters.metric || 'all',
            companyIds: filters.companyIds,
          };
        }
      }

      return {
        dateRange: filters.dateRange || '30d',
        compareWith: filters.compareWith || 'none',
        teamMember: filters.teamMember,
        metric: filters.metric || 'all',
        companyIds: filters.companyIds,
        startDate: filters.startDate,
        endDate: filters.endDate,
      };
    },
    [getCurrentUser]
  );

  const [tempFilters, setTempFilters] = useState<DashboardFiltersData>(() =>
    convertApiFilters(apiFilters)
  );

  // Configuração de cards visíveis
  const [dashboardCards, setDashboardCards] = useState<DashboardCard[]>(
    DEFAULT_DASHBOARD_CARDS
  );

  // Callback estável para recarregar quando trocar de empresa
  // Usando useCallback para evitar que a função seja recriada a cada render
  const handleCompanyChange = useCallback(() => {
    // Limpar todos os caches de dashboard
    clearCache();
    // Limpar filtro de empresas ao trocar no header
    setTempFilters(prev => ({ ...prev, companyIds: undefined }));
    // Atualizar filtros e recarregar - usando refresh diretamente que já limpa cache
    refresh();
  }, [clearCache, refresh]);

  // Auto-recarregar quando trocar de empresa
  useAutoReloadOnCompanyChange(handleCompanyChange);

  // Sincronizar filtros temporários com filtros da API quando mudarem externamente
  // Usar useRef para evitar loop infinito comparando valores anteriores
  const prevFiltersRef = useRef<string>('');

  // Memoizar a string dos filtros para usar como dependência
  const apiFiltersStr = useMemo(() => {
    return JSON.stringify({
      dateRange: apiFilters.dateRange,
      compareWith: apiFilters.compareWith,
      teamMember: apiFilters.teamMember,
      metric: apiFilters.metric,
      companyIds: apiFilters.companyIds,
      startDate: apiFilters.startDate,
      endDate: apiFilters.endDate,
    });
  }, [
    apiFilters.dateRange,
    apiFilters.compareWith,
    apiFilters.teamMember,
    apiFilters.metric,
    apiFilters.companyIds,
    apiFilters.startDate,
    apiFilters.endDate,
  ]);

  useEffect(() => {
    const newFilters = convertApiFilters(apiFilters);
    const newFiltersStr = JSON.stringify(newFilters);

    // Só atualizar se os valores realmente mudaram
    if (prevFiltersRef.current !== newFiltersStr) {
      prevFiltersRef.current = newFiltersStr;
      setTempFilters(newFilters);
    }
  }, [apiFiltersStr, apiFilters, convertApiFilters]);

  // Persistência de configurações de cards - carregar apenas uma vez no mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('dashboardConfig');
    if (savedConfig) {
      try {
        const parsed: DashboardCard[] = JSON.parse(savedConfig);

        // Criar um mapa dos cards salvos para manter suas configurações (enabled, order customizado)
        const savedCardsMap = new Map(parsed.map(c => [c.id, c]));

        // Mesclar: usar configuração salva se existir, senão usar a padrão
        const merged = DEFAULT_DASHBOARD_CARDS.map(defaultCard => {
          const savedCard = savedCardsMap.get(defaultCard.id);
          if (savedCard) {
            // Manter a configuração salva (enabled, order), mas garantir que category e label estejam atualizados
            return {
              ...savedCard,
              category: defaultCard.category,
              label: defaultCard.label,
            };
          }
          // Se não existe na configuração salva, usar o padrão
          return defaultCard;
        });

        // Normalizar orders ao carregar, mantendo a ordem de categorias
        const normalized = [...merged]
          .sort((a, b) => {
            if (a.category !== b.category) {
              const categoryOrder = [
                'stats',
                'charts',
                'widgets',
                'activities',
              ];
              return (
                categoryOrder.indexOf(a.category) -
                categoryOrder.indexOf(b.category)
              );
            }
            return a.order - b.order;
          })
          .map((card, index) => ({ ...card, order: index + 1 }));

        setDashboardCards(normalized);
        // Salvar a configuração mesclada de volta no localStorage
        localStorage.setItem('dashboardConfig', JSON.stringify(normalized));
      } catch (error) {
        console.error('Erro ao carregar configuração do dashboard:', error);
        // Se houver erro, usar a configuração padrão
        setDashboardCards(DEFAULT_DASHBOARD_CARDS);
      }
    } else {
      // Se não houver configuração salva, usar a padrão
      setDashboardCards(DEFAULT_DASHBOARD_CARDS);
    }
  }, []);

  // Memoizar dados computados para evitar recálculos desnecessários
  const stats = useMemo(
    () => dashboardData?.statistics,
    [dashboardData?.statistics]
  );
  const charts = useMemo(() => dashboardData?.charts, [dashboardData?.charts]);
  const goals = useMemo(() => dashboardData?.goals, [dashboardData?.goals]);
  const performance = useMemo(
    () => dashboardData?.performance,
    [dashboardData?.performance]
  );

  const handleSaveConfig = useCallback((cards: DashboardCard[]) => {
    // Normalizar orders antes de salvar
    const normalized = [...cards]
      .sort((a, b) => {
        // Ordenar primeiro por categoria, depois por order
        if (a.category !== b.category) {
          const categoryOrder = ['stats', 'charts', 'widgets', 'activities'];
          return (
            categoryOrder.indexOf(a.category) -
            categoryOrder.indexOf(b.category)
          );
        }
        return a.order - b.order;
      })
      .map((card, index) => ({ ...card, order: index + 1 }));

    setDashboardCards(normalized);
    localStorage.setItem('dashboardConfig', JSON.stringify(normalized));
  }, []);

  const isCardEnabled = useCallback(
    (cardId: string) => {
      const card = dashboardCards.find(c => c.id === cardId);
      // Se o card não existe na configuração, assumir que está habilitado (comportamento padrão)
      // Se existe, usar o valor de enabled
      if (!card) return true;
      return card.enabled;
    },
    [dashboardCards]
  );

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'property':
        return MdApartment;
      case 'user':
        return MdGroup;
      case 'sale':
        return MdAttachMoney;
      case 'rental':
        return MdHomeWork;
      case 'client':
        return MdGroup;
      default:
        return MdEvent;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'property':
        return palette.primary;
      case 'user':
        return palette.success;
      case 'sale':
        return palette.warning;
      case 'rental':
        return palette.purple;
      case 'client':
        return palette.info;
      default:
        return palette.textLight;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `há ${diffMins}min`;
    if (diffHours < 24) return `há ${diffHours}h`;
    if (diffDays === 1) return 'ontem';
    if (diffDays < 7) return `há ${diffDays} dias`;

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const formatActivityDescription = (description: string): string => {
    // Verifica se a descrição já contém valores formatados com R$
    if (description.includes('R$')) {
      // Se já tem R$, formatar os números após R$ para o padrão brasileiro
      return description.replace(/R\$\s*(\d+(?:\.\d{2})?)/g, (match, value) => {
        const num = parseFloat(value);
        if (!isNaN(num)) {
          return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(num);
        }
        return match;
      });
    }

    // Se não tem R$, tenta detectar valores monetários sem formatação
    return description.replace(/\b(\d{3,}(?:\.\d{2})?)\b/g, match => {
      const num = parseFloat(match);
      // Se for um número válido e maior que 100, considera como valor monetário
      if (!isNaN(num) && num > 100) {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(num);
      }
      return match;
    });
  };

  // Verificações de estado centralizadas
  // SEMPRE renderizar algo - nunca retornar null ou undefined

  // Mostrar loading se:
  // 1. Está carregando dados
  // 2. Não tem dados E não tem erro (aguardando carregamento)
  const shouldShowLoading = loading || (!dashboardData && !error);
  const isInitialLoading = isInitialLoad || !hasRenderedOnce;

  // Shimmer fiel ao layout do dashboard durante o carregamento
  if (shouldShowLoading || isInitialLoading) {
    return (
      <PageLightBg>
        <AdminDashboardShimmer />
      </PageLightBg>
    );
  }

  if (error) {
    return <ConnectionError error={error} onRetry={refresh} />;
  }

  if (!dashboardData) {
    return <ConnectionError error='Nenhum dado disponível' onRetry={refresh} />;
  }

  return (
    <PageLightBg>
      <PageContainer>
        <PageHeader>
          <div>
            <PageTitle>
              Dashboard
              <OwnerIndicator size='small' showText={false} />
            </PageTitle>
            <PageSubtitle>
              <OwnerConditional
                ownerContent='Visão completa do seu negócio imobiliário - Painel do Proprietário'
                adminContent='Visão geral do seu negócio imobiliário'
              />
            </PageSubtitle>
          </div>

          <QuickActions>
            <FilterButton onClick={() => setShowFilters(true)}>
              <MdFilterList size={20} />
              Filtros
              {(apiFilters.dateRange !== '30d' ||
                apiFilters.compareWith !== 'none' ||
                apiFilters.teamMember ||
                apiFilters.metric !== 'all') && (
                <FilterBadge>
                  {
                    [
                      apiFilters.dateRange !== '30d',
                      apiFilters.compareWith !== 'none',
                      apiFilters.teamMember,
                      apiFilters.metric !== 'all',
                    ].filter(Boolean).length
                  }
                </FilterBadge>
              )}
            </FilterButton>

            <FilterButton onClick={() => setShowConfig(true)}>
              <MdSettings size={20} />
              Configurar
            </FilterButton>
          </QuickActions>
        </PageHeader>

        {/* Informação sobre Configuração de Comissões */}
        <InfoConfiguracao />

        {/* Cards de Estatísticas */}
        <StatsGrid>
          {isCardEnabled('properties') && stats && (
            <StatCardMemo
              icon={MdApartment}
              color={palette.primary}
              value={stats.totalProperties || 0}
              label='Propriedades'
              growth={stats.propertiesGrowth || 0}
              tooltip='Total de imóveis cadastrados no sistema, incluindo apartamentos, casas, terrenos e imóveis comerciais.'
              tooltipDirection='top-right'
            />
          )}

          {isCardEnabled('users') && stats && (
            <StatCardMemo
              icon={MdGroup}
              color={palette.success}
              value={stats.totalUsers || 0}
              label='Usuários'
              growth={stats.usersGrowth || 0}
              tooltip='Total de usuários ativos no sistema, incluindo corretores, administradores e demais funcionários da imobiliária.'
              tooltipDirection='top-right'
            />
          )}

          {isCardEnabled('sales') && stats && (
            <StatCardMemo
              icon={MdAttachMoney}
              color={palette.warning}
              value={formatCurrency(stats.totalSales || 0)}
              label='Vendas Totais'
              growth={stats.salesGrowth || 0}
              tooltip='Valor total das vendas realizadas no período selecionado, incluindo imóveis vendidos e comissões geradas.'
              tooltipDirection='top-right'
            />
          )}

          {isCardEnabled('rating') && stats && stats.averageRating !== null && (
            <StatCard>
              <StatHeader>
                <StatIcon color={palette.purple}>
                  <MdStar />
                </StatIcon>
                <HeaderRight>
                  {stats.ratingGrowth !== null && stats.ratingGrowth !== 0 && (
                    <StatTrend $positive={stats.ratingGrowth > 0}>
                      <MdTrendingUp />
                      {Math.abs(stats.ratingGrowth).toFixed(1)}%
                    </StatTrend>
                  )}
                  <InfoTooltip
                    content='Avaliação média dos clientes baseada em feedback, avaliações e satisfação geral com os serviços prestados.'
                    direction='top-right'
                  />
                </HeaderRight>
              </StatHeader>
              <StatValue>{stats.averageRating}</StatValue>
              <StatLabel>Avaliação Média</StatLabel>
            </StatCard>
          )}

          {isCardEnabled('revenue') && stats && (
            <StatCard>
              <StatHeader>
                <StatIcon color={palette.secondary}>
                  <MdAccountBalance />
                </StatIcon>
                <HeaderRight>
                  {stats.revenueGrowth !== 0 && (
                    <StatTrend $positive={stats.revenueGrowth > 0}>
                      {stats.revenueGrowth > 0 ? (
                        <MdTrendingUp />
                      ) : (
                        <MdTrendingDown />
                      )}
                      {Math.abs(stats.revenueGrowth).toFixed(1)}%
                    </StatTrend>
                  )}
                  <InfoTooltip
                    content='Receita total gerada pela imobiliária, incluindo comissões de vendas, aluguéis e demais serviços oferecidos.'
                    direction='top-right'
                  />
                </HeaderRight>
              </StatHeader>
              <StatValue>{formatCurrency(stats.totalRevenue || 0)}</StatValue>
              <StatLabel>Receita Total</StatLabel>
            </StatCard>
          )}

          {isCardEnabled('clients') && stats && (
            <StatCard>
              <StatHeader>
                <StatIcon color={palette.success}>
                  <MdGroup />
                </StatIcon>
                <HeaderRight>
                  {stats.clientsGrowth !== 0 && (
                    <StatTrend $positive={stats.clientsGrowth > 0}>
                      {stats.clientsGrowth > 0 ? (
                        <MdTrendingUp />
                      ) : (
                        <MdTrendingDown />
                      )}
                      {Math.abs(stats.clientsGrowth).toFixed(1)}%
                    </StatTrend>
                  )}
                  <InfoTooltip
                    content='Número de clientes que estão ativamente buscando imóveis ou que têm negociações em andamento.'
                    direction='down'
                  />
                </HeaderRight>
              </StatHeader>
              <StatValue>{stats.activeClients || 0}</StatValue>
              <StatLabel>Clientes Ativos</StatLabel>
            </StatCard>
          )}

          {isCardEnabled('conversion') && stats && (
            <StatCard>
              <StatHeader>
                <StatIcon color={palette.warning}>
                  <MdBarChart />
                </StatIcon>
                <HeaderRight>
                  {stats.conversionGrowth !== 0 && (
                    <StatTrend $positive={stats.conversionGrowth > 0}>
                      {stats.conversionGrowth > 0 ? (
                        <MdTrendingUp />
                      ) : (
                        <MdTrendingDown />
                      )}
                      {Math.abs(stats.conversionGrowth).toFixed(1)}%
                    </StatTrend>
                  )}
                  <InfoTooltip
                    content='Percentual de leads que se converteram em vendas ou aluguéis efetivados, indicando a eficácia da equipe de vendas.'
                    direction='down'
                  />
                </HeaderRight>
              </StatHeader>
              <StatValue>{(stats.conversionRate || 0).toFixed(1)}%</StatValue>
              <StatLabel>Taxa de Conversão</StatLabel>
            </StatCard>
          )}

          {isCardEnabled('leads') && stats && (
            <StatCard>
              <StatHeader>
                <StatIcon color={palette.info}>
                  <MdContactPhone />
                </StatIcon>
                <HeaderRight>
                  {stats.leadsGrowth !== 0 && (
                    <StatTrend $positive={stats.leadsGrowth > 0}>
                      {stats.leadsGrowth > 0 ? (
                        <MdTrendingUp />
                      ) : (
                        <MdTrendingDown />
                      )}
                      {Math.abs(stats.leadsGrowth).toFixed(1)}%
                    </StatTrend>
                  )}
                  <InfoTooltip
                    content='Total de potenciais clientes que demonstraram interesse em imóveis, incluindo visitas, contatos e consultas.'
                    direction='down'
                  />
                </HeaderRight>
              </StatHeader>
              <StatValue>{stats.totalLeads || 0}</StatValue>
              <StatLabel>Leads Totais</StatLabel>
            </StatCard>
          )}

          {isCardEnabled('appointments') && stats && (
            <StatCard>
              <StatHeader>
                <StatIcon color={palette.purple}>
                  <MdEvent />
                </StatIcon>
                <HeaderRight>
                  {stats.appointmentsGrowth !== 0 && (
                    <StatTrend $positive={stats.appointmentsGrowth > 0}>
                      {stats.appointmentsGrowth > 0 ? (
                        <MdTrendingUp />
                      ) : (
                        <MdTrendingDown />
                      )}
                      {Math.abs(stats.appointmentsGrowth).toFixed(1)}%
                    </StatTrend>
                  )}
                  <InfoTooltip
                    content='Número total de visitas e reuniões agendadas com clientes para visualização de imóveis ou negociações.'
                    direction='down'
                  />
                </HeaderRight>
              </StatHeader>
              <StatValue>{stats.appointments || 0}</StatValue>
              <StatLabel>Agendamentos</StatLabel>
            </StatCard>
          )}

          {isCardEnabled('documents') && stats && (
            <StatCard>
              <StatHeader>
                <StatIcon color={palette.error}>
                  <MdDescription />
                </StatIcon>
                <HeaderRight>
                  {stats.documentsGrowth !== 0 && (
                    <StatTrend $positive={stats.documentsGrowth < 0}>
                      {stats.documentsGrowth < 0 ? (
                        <MdTrendingDown />
                      ) : (
                        <MdTrendingUp />
                      )}
                      {Math.abs(stats.documentsGrowth).toFixed(1)}%
                    </StatTrend>
                  )}
                  <InfoTooltip
                    content='Documentos que precisam ser analisados, assinados ou finalizados para completar transações imobiliárias.'
                    direction='down'
                  />
                </HeaderRight>
              </StatHeader>
              <StatValue>{stats.pendingDocuments || 0}</StatValue>
              <StatLabel>Documentos Pendentes</StatLabel>
            </StatCard>
          )}
        </StatsGrid>

        {/* Card Especial para Proprietários */}

        {/* Novos Widgets */}
        <WidgetsGrid>
          {isCardEnabled('top-performers') && (
            <Suspense fallback={<OptimizedLoading type='widget' />}>
              <TopPerformersWidget
                performers={dashboardData.topPerformers.performers}
              />
            </Suspense>
          )}
          {isCardEnabled('tasks') && (
            <Suspense fallback={<OptimizedLoading type='widget' />}>
              <TasksWidget tasks={dashboardData.tasks.tasks} />
            </Suspense>
          )}
          {isCardEnabled('recent-leads') && (
            <Suspense fallback={<OptimizedLoading type='widget' />}>
              <RecentLeadsWidget leads={dashboardData.leads.leads} />
            </Suspense>
          )}
        </WidgetsGrid>

        {/* Seção de Metas e Performance - Layout Moderno */}
        {(isCardEnabled('team-performance') ||
          isCardEnabled('business-analysis')) && (
          <ModernPerformanceGrid>
            {/* Performance da Equipe */}
            {isCardEnabled('team-performance') && (
              <ModernTeamCard>
                <ModernCardHeader>
                  <ModernCardIcon $color={palette.primary}>
                    <MdTimer />
                  </ModernCardIcon>
                  <div>
                    <ModernCardTitle>Performance da Equipe</ModernCardTitle>
                    <ModernCardSubtitle>Produtividade atual</ModernCardSubtitle>
                  </div>
                  <InfoTooltip
                    content='Acompanhe tarefas concluídas, pendentes, performance geral e tempo médio de resposta da equipe'
                    direction='down'
                  />
                </ModernCardHeader>

                <ModernCardContent>
                  <ModernTeamStats>
                    <ModernTeamStatItem>
                      <ModernTeamStatIcon $color={palette.success}>
                        <MdCheckCircle />
                      </ModernTeamStatIcon>
                      <ModernTeamStatContent>
                        <ModernTeamStatValue>
                          {performance?.team?.completedTasks || 0}
                        </ModernTeamStatValue>
                        <ModernTeamStatLabel>Concluídas</ModernTeamStatLabel>
                      </ModernTeamStatContent>
                    </ModernTeamStatItem>

                    <ModernTeamStatItem>
                      <ModernTeamStatIcon $color={palette.warning}>
                        <MdSchedule />
                      </ModernTeamStatIcon>
                      <ModernTeamStatContent>
                        <ModernTeamStatValue>
                          {performance?.team?.pendingTasks || 0}
                        </ModernTeamStatValue>
                        <ModernTeamStatLabel>Pendentes</ModernTeamStatLabel>
                      </ModernTeamStatContent>
                    </ModernTeamStatItem>

                    <ModernTeamStatItem>
                      <ModernTeamStatIcon $color={palette.purple}>
                        <MdBarChart />
                      </ModernTeamStatIcon>
                      <ModernTeamStatContent>
                        <ModernTeamStatValue>
                          {performance?.team?.teamPerformance || 0}%
                        </ModernTeamStatValue>
                        <ModernTeamStatLabel>Performance</ModernTeamStatLabel>
                      </ModernTeamStatContent>
                    </ModernTeamStatItem>
                  </ModernTeamStats>
                </ModernCardContent>
              </ModernTeamCard>
            )}

            {/* Análise de Negócios */}
            {isCardEnabled('business-analysis') && (
              <ModernBusinessCard>
                <ModernCardHeader>
                  <ModernCardIcon $color={palette.warning}>
                    <MdAttachMoney />
                  </ModernCardIcon>
                  <div>
                    <ModernCardTitle>Análise de Negócios</ModernCardTitle>
                    <ModernCardSubtitle>
                      Métricas importantes
                    </ModernCardSubtitle>
                  </div>
                  <InfoTooltip
                    content='Métricas de performance dos negócios: tamanho médio de deals, taxa de ocupação e tempos médios de venda/aluguel'
                    direction='down'
                  />
                </ModernCardHeader>

                <ModernCardContent>
                  <ModernBusinessMetrics>
                    <ModernBusinessMetric>
                      <ModernBusinessMetricLabel>
                        Ticket Médio
                      </ModernBusinessMetricLabel>
                      <ModernBusinessMetricValue>
                        {formatCurrencyCompact(
                          performance?.business?.averageDealSize || 0
                        )}
                      </ModernBusinessMetricValue>
                      {performance?.business?.dealSizeGrowth !== 0 && (
                        <ModernBusinessMetricTrend
                          $positive={
                            (performance?.business?.dealSizeGrowth || 0) > 0
                          }
                        >
                          {(performance?.business?.dealSizeGrowth || 0) > 0 ? (
                            <MdTrendingUp />
                          ) : (
                            <MdTrendingDown />
                          )}
                          {Math.abs(
                            performance?.business?.dealSizeGrowth || 0
                          ).toFixed(1)}
                          %
                        </ModernBusinessMetricTrend>
                      )}
                    </ModernBusinessMetric>

                    <ModernBusinessMetric>
                      <ModernBusinessMetricLabel>
                        Taxa de Ocupação
                      </ModernBusinessMetricLabel>
                      <ModernBusinessMetricValue>
                        {(performance?.business?.occupancyRate || 0).toFixed(1)}
                        %
                      </ModernBusinessMetricValue>
                      {performance?.business?.occupancyGrowth !== 0 && (
                        <ModernBusinessMetricTrend
                          $positive={
                            (performance?.business?.occupancyGrowth || 0) > 0
                          }
                        >
                          {(performance?.business?.occupancyGrowth || 0) > 0 ? (
                            <MdTrendingUp />
                          ) : (
                            <MdTrendingDown />
                          )}
                          {Math.abs(
                            performance?.business?.occupancyGrowth || 0
                          ).toFixed(1)}
                          %
                        </ModernBusinessMetricTrend>
                      )}
                    </ModernBusinessMetric>

                    {performance?.business?.averageSaleTime !== null && (
                      <ModernBusinessMetric>
                        <ModernBusinessMetricLabel>
                          Tempo Médio Venda
                        </ModernBusinessMetricLabel>
                        <ModernBusinessMetricValue>
                          {performance?.business?.averageSaleTime || 0} dias
                        </ModernBusinessMetricValue>
                        {performance?.business?.saleTimeChange !== null &&
                          performance?.business?.saleTimeChange !== 0 && (
                            <ModernBusinessMetricTrend
                              $positive={
                                (performance?.business?.saleTimeChange || 0) < 0
                              }
                            >
                              {(performance?.business?.saleTimeChange || 0) <
                              0 ? (
                                <MdTrendingDown />
                              ) : (
                                <MdTrendingUp />
                              )}
                              {Math.abs(
                                performance?.business?.saleTimeChange || 0
                              ).toFixed(1)}
                              %
                            </ModernBusinessMetricTrend>
                          )}
                      </ModernBusinessMetric>
                    )}
                  </ModernBusinessMetrics>
                </ModernCardContent>
              </ModernBusinessCard>
            )}
          </ModernPerformanceGrid>
        )}

        {/* Gráficos */}
        <ChartsGrid>
          {isCardEnabled('sales-chart') && (
            <ChartCard>
              <ChartTitle>
                <MdBarChart />
                Vendas por Mês
                <InfoTooltip
                  content='Gráfico mostrando a evolução das vendas ao longo dos meses, permitindo identificar tendências e sazonalidade.'
                  direction='down'
                />
              </ChartTitle>
              <ChartContent>
                <Suspense fallback={<OptimizedLoading type='chart' />}>
                  <SalesChart
                    data={charts?.sales || { labels: [], values: [] }}
                  />
                </Suspense>
              </ChartContent>
            </ChartCard>
          )}

          {isCardEnabled('property-types') && (
            <ChartCard>
              <ChartTitle>
                <MdPieChart />
                Tipos de Propriedade
                <InfoTooltip
                  content='Distribuição percentual dos tipos de imóveis no portfólio, mostrando apartamentos, casas, terrenos e comerciais.'
                  direction='down'
                />
              </ChartTitle>
              <ChartContent>
                <Suspense fallback={<OptimizedLoading type='chart' />}>
                  <PropertyTypeChart
                    data={
                      charts?.propertyTypes || {
                        forSale: 0,
                        forRent: 0,
                        total: 0,
                        distribution: {
                          apartment: 0,
                          house: 0,
                          commercial: 0,
                          land: 0,
                          rural: 0,
                        },
                      }
                    }
                  />
                </Suspense>
              </ChartContent>
            </ChartCard>
          )}

          {isCardEnabled('location-chart') && (
            <ChartCard>
              <ChartTitle>
                <MdLocationOn />
                Distribuição por Região
                <InfoTooltip
                  content='Mapa ou gráfico mostrando onde estão localizados os imóveis, ajudando a identificar as regiões com maior concentração de propriedades.'
                  direction='down'
                />
              </ChartTitle>
              <ChartContent>
                <Suspense fallback={<OptimizedLoading type='chart' />}>
                  <LocationChart
                    data={
                      charts?.locations || {
                        labels: [],
                        values: [],
                        percentages: [],
                      }
                    }
                  />
                </Suspense>
              </ChartContent>
            </ChartCard>
          )}

          {isCardEnabled('lead-sources') && dashboardData.leadSources && (
            <ChartCard>
              <ChartTitle>
                <MdGroup />
                Origem dos Clientes
                <InfoTooltip
                  content='Distribuição das fontes de origem dos clientes, mostrando de onde eles estão vindo (WhatsApp, telefone, redes sociais, portais, etc.).'
                  direction='down'
                />
              </ChartTitle>
              <ChartContent>
                <Suspense fallback={<OptimizedLoading type='chart' />}>
                  <LeadSourcesChart data={dashboardData.leadSources} />
                </Suspense>
              </ChartContent>
            </ChartCard>
          )}
        </ChartsGrid>

        {/* Feed de Atividades */}
        {isCardEnabled('activities') && dashboardData.activities && (
          <ActivityCard>
            <ActivityTitle>
              <MdEvent />
              Atividades Recentes
              <InfoTooltip
                content='Timeline das últimas atividades realizadas no sistema, incluindo vendas, cadastros, visitas e outras ações importantes.'
                direction='down'
              />
            </ActivityTitle>
            <ActivityList>
              {dashboardData.activities.activities.length === 0 ? (
                <EmptyState>
                  <EmptyStateIcon>📋</EmptyStateIcon>
                  <EmptyStateTitle>Nenhuma atividade recente</EmptyStateTitle>
                  <EmptyStateDescription>
                    As atividades do sistema aparecerão aqui
                  </EmptyStateDescription>
                </EmptyState>
              ) : (
                dashboardData.activities.activities.map(activity => {
                  const ActivityIconComponent = getActivityIcon(activity.type);
                  const activityColor = getActivityColor(activity.type);

                  return (
                    <ActivityItem key={activity.id}>
                      <ActivityIcon color={activityColor}>
                        <ActivityIconComponent />
                      </ActivityIcon>
                      <ActivityContent>
                        <ActivityItemTitle>{activity.title}</ActivityItemTitle>
                        <ActivityDescription>
                          {formatActivityDescription(activity.description)}
                        </ActivityDescription>
                        <ActivityTime>
                          {formatTimeAgo(activity.createdAt)}
                        </ActivityTime>
                      </ActivityContent>
                    </ActivityItem>
                  );
                })
              )}
            </ActivityList>
          </ActivityCard>
        )}

        {/* Drawer de Filtros */}
        <Suspense
          fallback={
            <div
              style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Carregando filtros...
            </div>
          }
        >
          <DashboardFilters
            isOpen={showFilters}
            onClose={() => {
              // Não aplicar filtros automaticamente ao fechar, apenas fechar o drawer
              setShowFilters(false);
            }}
            filters={tempFilters}
            onFilterChange={filters => setTempFilters(filters)}
            onApply={filters => {
              // Aplicar filtros apenas quando clicar em "Aplicar Filtros"
              updateFilters(filters);
              setShowFilters(false);
            }}
          />
        </Suspense>

        {/* Modal de Configuração */}
        <Suspense
          fallback={
            <div
              style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Carregando configuração...
            </div>
          }
        >
          <DashboardConfig
            isOpen={showConfig}
            onClose={() => setShowConfig(false)}
            cards={dashboardCards}
            onSave={handleSaveConfig}
            defaultCards={DEFAULT_DASHBOARD_CARDS}
          />
        </Suspense>
      </PageContainer>
    </PageLightBg>
  );
};

export default DashboardPage;
