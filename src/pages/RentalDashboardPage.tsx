import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Layout } from '../components/layout/Layout';
import { RentalDashboardShimmer } from '../components/shimmer/RentalDashboardShimmer';
import { toast } from 'react-toastify';
import rentalDashboardService, {
  type RentalDashboardData,
  type RentalDashboardFilters,
} from '../services/rentalDashboardService';
import {
  MdHome,
  MdAttachMoney,
  MdTrendingUp,
  MdWarning,
  MdCheckCircle,
  MdPending,
  MdCancel,
  MdAdd,
  MdList,
  MdFilterList,
} from 'react-icons/md';
import { usePermissionsContext } from '../contexts/PermissionsContext';
import { useProperties } from '../hooks/useProperties';
import { PermissionButton } from '../components/common/PermissionButton';

const RentalDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissionsContext();
  const { properties, getProperties } = useProperties();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RentalDashboardData | null>(null);
  const [filters, setFilters] = useState<RentalDashboardFilters>({
    periodMonths: 12,
    status: undefined,
    propertyId: undefined,
  });

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const dashboardData = await rentalDashboardService.getDashboard(filters);
      setData(dashboardData);
    } catch (error: any) {
      console.error('Erro ao carregar dashboard:', error);
      toast.error('Erro ao carregar dashboard de locações');
    } finally {
      setLoading(false);
    }
  }, [filters.periodMonths, filters.status, filters.propertyId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    getProperties({}, { page: 1, limit: 500 });
  }, [getProperties]);

  const handleFilterChange = (key: keyof RentalDashboardFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value === '' || value === 'all' ? undefined : value }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    const s = String(status || '').toUpperCase();
    switch (s) {
      case 'ACTIVE':
        return '#10b981';
      case 'PENDING':
        return '#f59e0b';
      case 'EXPIRED':
        return '#ef4444';
      case 'PAID':
        return '#10b981';
      case 'OVERDUE':
        return '#ef4444';
      case 'CANCELLED':
        return '#6b7280';
      case 'PARTIAL':
        return '#f59e0b';
      case 'REFUNDED':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    const s = String(status || '').toUpperCase();
    switch (s) {
      case 'ACTIVE':
        return 'Ativo';
      case 'PENDING':
        return 'Pendente';
      case 'EXPIRED':
        return 'Expirado';
      case 'CANCELLED':
        return 'Cancelado';
      case 'PAID':
        return 'Pago';
      case 'OVERDUE':
        return 'Atrasado';
      case 'PARTIAL':
        return 'Parcial';
      case 'REFUNDED':
        return 'Reembolsado';
      default:
        return status || '—';
    }
  };

  if (loading) {
    return (
      <Layout>
        <RentalDashboardShimmer />
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <Container>
          <ErrorMessage>Erro ao carregar dados do dashboard</ErrorMessage>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container>
        <Header>
          <HeaderTop>
            <div>
              <Title>Dashboard de Locações</Title>
              <Subtitle>Visão geral das locações e pagamentos</Subtitle>
            </div>
            <QuickActions>
              <PermissionButton
                permission="rental:create"
                onClick={() => navigate('/rentals/new')}
                variant="primary"
                tooltip="Nova locação"
              >
                <MdAdd /> Nova locação
              </PermissionButton>
              <QuickActionButton type="button" onClick={() => navigate('/rentals')}>
                <MdList /> Ver todas
              </QuickActionButton>
            </QuickActions>
          </HeaderTop>
        </Header>

        {/* Filtros */}
        <FilterBar>
          <FilterGroup>
            <FilterLabel>
              <MdFilterList size={18} /> Filtros
            </FilterLabel>
            <FilterRow>
              <FilterField>
                <label>Período do gráfico</label>
                <Select
                  value={filters.periodMonths ?? 12}
                  onChange={e => handleFilterChange('periodMonths', Number(e.target.value) as 6 | 12)}
                >
                  <option value={6}>Últimos 6 meses</option>
                  <option value={12}>Últimos 12 meses</option>
                </Select>
              </FilterField>
              <FilterField>
                <label>Status da locação</label>
                <Select
                  value={filters.status ?? 'all'}
                  onChange={e => handleFilterChange('status', e.target.value === 'all' ? undefined : e.target.value)}
                >
                  <option value="all">Todos</option>
                  <option value="active">Ativo</option>
                  <option value="pending">Pendente</option>
                  <option value="expired">Expirado</option>
                  <option value="cancelled">Cancelado</option>
                </Select>
              </FilterField>
              <FilterField>
                <label>Propriedade</label>
                <Select
                  value={filters.propertyId ?? 'all'}
                  onChange={e => handleFilterChange('propertyId', e.target.value === 'all' ? undefined : e.target.value)}
                >
                  <option value="all">Todas</option>
                  {properties?.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title || p.code || p.id}
                    </option>
                  ))}
                </Select>
              </FilterField>
            </FilterRow>
          </FilterGroup>
        </FilterBar>

        {/* Cards de Métricas Principais */}
        <MetricsGrid>
          <MetricCard $accent="#3b82f6">
            <MetricIcon>
              <MdHome size={32} />
            </MetricIcon>
            <MetricContent>
              <MetricLabel>Total de Locações</MetricLabel>
              <MetricValue>{data.totalRentals}</MetricValue>
              <MetricSubtext>
                {data.activeRentals} ativas • {data.expiredRentals} expiradas
              </MetricSubtext>
            </MetricContent>
          </MetricCard>

          {hasPermission('rental:view_financials') && (
            <MetricCard $accent="#10b981">
              <MetricIcon>
                <MdAttachMoney size={32} />
              </MetricIcon>
              <MetricContent>
                <MetricLabel>Receita Mensal</MetricLabel>
                <MetricValue>{formatCurrency(data.totalMonthlyRevenue)}</MetricValue>
                <MetricSubtext>
                  Média: {formatCurrency(data.averageRentalValue)}
                </MetricSubtext>
              </MetricContent>
            </MetricCard>
          )}

          <MetricCard $accent="#f59e0b">
            <MetricIcon>
              <MdTrendingUp size={32} />
            </MetricIcon>
            <MetricContent>
              <MetricLabel>Taxa de Ocupação</MetricLabel>
              <MetricValue>{data.occupancyRate.toFixed(1)}%</MetricValue>
              <MetricSubtext>
                {data.activeRentals} de {data.totalRentals} imóveis
              </MetricSubtext>
            </MetricContent>
          </MetricCard>

          <MetricCard
            $accent="#ef4444"
            $clickable
            onClick={() => data.overduePayments > 0 && navigate('/rentals')}
          >
            <MetricIcon>
              <MdWarning size={32} />
            </MetricIcon>
            <MetricContent>
              <MetricLabel>Pagamentos Atrasados</MetricLabel>
              <MetricValue>{data.overduePayments}</MetricValue>
              <MetricSubtext>
                {data.expiringContracts} contratos vencendo em 30 dias
              </MetricSubtext>
            </MetricContent>
          </MetricCard>
        </MetricsGrid>

        {/* Alertas / Ações rápidas por contexto */}
        {(data.overduePayments > 0 || data.expiringContracts > 0) && (
          <AlertBar>
            {data.overduePayments > 0 && (
              <AlertItem $type="error">
                <MdWarning />
                {data.overduePayments} pagamento(s) atrasado(s).{' '}
                <AlertLink onClick={() => navigate('/rentals')}>Ver locações</AlertLink>
              </AlertItem>
            )}
            {data.expiringContracts > 0 && (
              <AlertItem $type="warning">
                <MdPending />
                {data.expiringContracts} contrato(s) vencendo em 30 dias.{' '}
                <AlertLink onClick={() => navigate('/rentals')}>Ver locações</AlertLink>
              </AlertItem>
            )}
          </AlertBar>
        )}

        {/* Pagamentos do Mês */}
        {hasPermission('rental:view_financials') && (
          <Section>
            <SectionTitle>Pagamentos do Mês Atual</SectionTitle>
          <PaymentsGrid>
            <PaymentCard>
              <PaymentIcon $color="#10b981">
                <MdCheckCircle size={24} />
              </PaymentIcon>
              <PaymentContent>
                <PaymentLabel>Recebido</PaymentLabel>
                <PaymentValue>{formatCurrency(data.paidThisMonth)}</PaymentValue>
              </PaymentContent>
            </PaymentCard>

            <PaymentCard>
              <PaymentIcon $color="#f59e0b">
                <MdPending size={24} />
              </PaymentIcon>
              <PaymentContent>
                <PaymentLabel>Pendente</PaymentLabel>
                <PaymentValue>{formatCurrency(data.pendingThisMonth)}</PaymentValue>
              </PaymentContent>
            </PaymentCard>

            <PaymentCard>
              <PaymentIcon $color="#3b82f6">
                <MdAttachMoney size={24} />
              </PaymentIcon>
              <PaymentContent>
                <PaymentLabel>Total Esperado</PaymentLabel>
                <PaymentValue>
                  {formatCurrency(data.paidThisMonth + data.pendingThisMonth)}
                </PaymentValue>
              </PaymentContent>
            </PaymentCard>
          </PaymentsGrid>
          </Section>
        )}

        {/* Gráfico de Receita Mensal (full width) */}
        {hasPermission('rental:view_financials') && (
          <Section>
            <SectionTitle>Receita dos Últimos {filters.periodMonths === 6 ? 6 : 12} Meses</SectionTitle>
            <ChartContainer>
              {data.monthlyRevenueChart.map((item, index) => {
                const maxRevenue = Math.max(1, ...data.monthlyRevenueChart.map(i => i.revenue));
                return (
                  <ChartBar key={index}>
                    <BarGroup>
                      <Bar
                        $height={(item.paid / maxRevenue) * 100}
                        $color="#10b981"
                        title={`Pago: ${formatCurrency(item.paid)}`}
                      />
                      <Bar
                        $height={(item.pending / maxRevenue) * 100}
                        $color="#f59e0b"
                        title={`Pendente: ${formatCurrency(item.pending)}`}
                      />
                    </BarGroup>
                    <BarLabel>{item.month}</BarLabel>
                  </ChartBar>
                );
              })}
            </ChartContainer>
            <ChartLegend>
              <LegendItem>
                <LegendColor $color="#10b981" />
                <span>Pago</span>
              </LegendItem>
              <LegendItem>
                <LegendColor $color="#f59e0b" />
                <span>Pendente</span>
              </LegendItem>
            </ChartLegend>
          </Section>
        )}

        {/* Pagamentos por Status (full width) */}
        <Section>
          <SectionTitle>Pagamentos por Status</SectionTitle>
          <StatusGrid>
            {data.paymentsByStatus.map((item, index) => {
              const statusKey = String(item.status || '').toUpperCase();
              return (
                <StatusItem key={index}>
                  <StatusIcon $status={statusKey}>
                    {statusKey === 'PAID' && <MdCheckCircle size={20} />}
                    {statusKey === 'PENDING' && <MdPending size={20} />}
                    {statusKey === 'OVERDUE' && <MdWarning size={20} />}
                    {statusKey === 'CANCELLED' && <MdCancel size={20} />}
                    {statusKey === 'PARTIAL' && <MdPending size={20} />}
                    {statusKey === 'REFUNDED' && <MdCancel size={20} />}
                  </StatusIcon>
                  <StatusContent>
                    <StatusLabel>{getStatusLabel(item.status)}</StatusLabel>
                    <StatusCount>{item.count} pagamentos</StatusCount>
                  </StatusContent>
                  <StatusValue>{formatCurrency(item.totalValue)}</StatusValue>
                </StatusItem>
              );
            })}
          </StatusGrid>
        </Section>

        {/* Locações Recentes */}
        <Section>
          <SectionTitle>Locações Recentes</SectionTitle>
          <Table>
            <thead>
              <tr>
                <Th>Inquilino</Th>
                <Th>Imóvel</Th>
                <Th>Valor Mensal</Th>
                <Th>Data de Início</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {data.recentRentals.map((rental) => (
                <TableBodyRow
                  key={rental.id}
                  onClick={() => navigate(`/rentals/${rental.id}`)}
                  title="Ver detalhes"
                >
                  <Td>{rental.tenantName}</Td>
                  <Td>{rental.propertyAddress}</Td>
                  <Td>{formatCurrency(rental.monthlyValue)}</Td>
                  <Td>{formatDate(rental.startDate)}</Td>
                  <Td>
                    <StatusBadge $color={getStatusColor(rental.status)}>
                      {getStatusLabel(rental.status)}
                    </StatusBadge>
                  </Td>
                </TableBodyRow>
              ))}
            </tbody>
          </Table>
        </Section>
      </Container>
    </Layout>
  );
};

// Styled Components – uso de theme.colors para dark/light
const Container = styled.div`
  padding: 20px 24px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100%;
  @media (min-width: 768px) {
    padding: 24px 28px;
  }
  @media (min-width: 1024px) {
    padding: 24px 32px;
  }
`;

const Header = styled.div`
  margin-bottom: 20px;
  @media (min-width: 768px) {
    margin-bottom: 24px;
  }
`;

const HeaderTop = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
`;

const QuickActions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const QuickActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: ${p => p.theme.colors.backgroundSecondary};
  color: ${p => p.theme.colors.text};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: ${p => p.theme.colors.hover};
  }
`;

const FilterBar = styled.div`
  background: ${p => p.theme.colors.cardBackground};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 24px;
  box-shadow: ${p => p.theme.colors.shadow || '0 2px 8px rgba(0,0,0,0.08)'};
`;

const FilterGroup = styled.div``;

const FilterLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: ${p => p.theme.colors.text};
  margin-bottom: 12px;
`;

const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
`;

const FilterField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 160px;
  label {
    font-size: 12px;
    color: ${p => p.theme.colors.textSecondary};
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 8px;
  background: ${p => p.theme.colors.background};
  color: ${p => p.theme.colors.text};
  font-size: 14px;
`;

const AlertBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
`;

const AlertItem = styled.div<{ $type: 'error' | 'warning' }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  background: ${p => (p.$type === 'error' ? '#fef2f2' : '#fffbeb')};
  color: ${p => (p.$type === 'error' ? '#991b1b' : '#92400e')};
  border: 1px solid ${p => (p.$type === 'error' ? '#fecaca' : '#fde68a')};
  [data-theme='dark'] & {
    background: ${p => (p.$type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)')};
    border-color: ${p => (p.$type === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.4)')};
  }
`;

const AlertLink = styled.button`
  background: none;
  border: none;
  text-decoration: underline;
  cursor: pointer;
  font-weight: 600;
  color: inherit;
  padding: 0;
  margin-left: 4px;
`;

const Title = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: ${p => p.theme.colors.text};
  margin: 0 0 8px 0;
  @media (min-width: 768px) {
    font-size: 28px;
  }
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: ${p => p.theme.colors.textSecondary};
  margin: 0;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  @media (min-width: 768px) {
    gap: 20px;
    margin-bottom: 32px;
  }
`;

const MetricCard = styled.div<{ $accent: string; $clickable?: boolean }>`
  background: ${p => p.theme.colors.cardBackground};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: ${p => p.theme.colors.shadow || '0 2px 8px rgba(0,0,0,0.08)'};
  border-left: 4px solid ${p => p.$accent};
  ${p => p.$clickable && `
    cursor: pointer;
    transition: opacity 0.2s;
    &:hover { opacity: 0.9; }
  `}
  @media (min-width: 768px) {
    padding: 24px;
  }
`;

const MetricIcon = styled.div`
  color: ${p => p.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MetricContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const MetricLabel = styled.div`
  font-size: 13px;
  color: ${p => p.theme.colors.textSecondary};
  margin-bottom: 4px;
`;

const MetricValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${p => p.theme.colors.text};
  margin-bottom: 4px;
  @media (min-width: 768px) {
    font-size: 28px;
  }
`;

const MetricSubtext = styled.div`
  font-size: 12px;
  color: ${p => p.theme.colors.textSecondary};
`;

const Section = styled.section`
  background: ${p => p.theme.colors.cardBackground};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: ${p => p.theme.colors.shadow || '0 2px 8px rgba(0,0,0,0.08)'};
  @media (min-width: 768px) {
    padding: 24px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: ${p => p.theme.colors.text};
  margin: 0 0 16px 0;
  @media (min-width: 768px) {
    font-size: 18px;
    margin-bottom: 20px;
  }
`;

const PaymentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  @media (min-width: 768px) {
    gap: 16px;
  }
`;

const PaymentCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: ${p => p.theme.colors.backgroundSecondary};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 8px;
`;

const PaymentIcon = styled.div<{ $color: string }>`
  color: ${p => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PaymentContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const PaymentLabel = styled.div`
  font-size: 13px;
  color: ${p => p.theme.colors.textSecondary};
  margin-bottom: 4px;
`;

const PaymentValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${p => p.theme.colors.text};
  @media (min-width: 768px) {
    font-size: 20px;
  }
`;

const ChartContainer = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 200px;
  gap: 8px;
  margin-bottom: 16px;
`;

const ChartBar = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const BarGroup = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 100%;
  width: 100%;
  justify-content: center;
`;

const Bar = styled.div<{ $height: number; $color: string }>`
  width: 20px;
  height: ${p => p.$height}%;
  background: ${p => p.$color};
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
  cursor: pointer;
  &:hover {
    opacity: 0.85;
  }
`;

const BarLabel = styled.div`
  font-size: 11px;
  color: ${p => p.theme.colors.textSecondary};
  text-align: center;
`;

const ChartLegend = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: ${p => p.theme.colors.textSecondary};
`;

const LegendColor = styled.div<{ $color: string }>`
  width: 16px;
  height: 16px;
  background: ${p => p.$color};
  border-radius: 4px;
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
  @media (min-width: 768px) {
    gap: 16px;
  }
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: ${p => p.theme.colors.backgroundSecondary};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 8px;
`;

const StatusIcon = styled.div<{ $status: string }>`
  color: ${p => {
    switch (p.$status) {
      case 'PAID': return p.theme.colors.success;
      case 'PENDING': return p.theme.colors.warning;
      case 'OVERDUE': return p.theme.colors.error;
      case 'CANCELLED': return p.theme.colors.textSecondary;
      case 'PARTIAL': return p.theme.colors.warning;
      case 'REFUNDED': return p.theme.colors.textSecondary;
      default: return p.theme.colors.textSecondary;
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatusContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const StatusLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${p => p.theme.colors.text};
  margin-bottom: 2px;
`;

const StatusCount = styled.div`
  font-size: 12px;
  color: ${p => p.theme.colors.textSecondary};
`;

const StatusValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${p => p.theme.colors.text};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px;
  font-size: 13px;
  font-weight: 600;
  color: ${p => p.theme.colors.textSecondary};
  border-bottom: 2px solid ${p => p.theme.colors.border};
  background: ${p => p.theme.colors.backgroundSecondary};
`;

const Td = styled.td`
  padding: 12px;
  font-size: 14px;
  color: ${p => p.theme.colors.text};
  border-bottom: 1px solid ${p => p.theme.colors.border};
`;

const TableBodyRow = styled.tr`
  cursor: pointer;
  transition: background 0.15s;
  &:hover {
    background: ${p => p.theme.colors.backgroundSecondary};
  }
`;

const StatusBadge = styled.span<{ $color: string }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${p => p.$color}20;
  color: ${p => p.$color};
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 48px;
  font-size: 16px;
  color: ${p => p.theme.colors.error};
`;

export default RentalDashboardPage;
