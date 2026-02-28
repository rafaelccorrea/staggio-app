import React, { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import styled from 'styled-components';
// Import chart registration utilities
import { ensureChartRegistration } from './chartConfig';
import { SafeChartWrapper } from './ChartProvider';
import { hexToRgba } from '../../utils/color';
import { getTheme } from '../../styles/theme';

// Ensure registration happens synchronously when module loads
ensureChartRegistration();

const ChartContainer = styled.div`
  width: 100%;
  height: 300px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EmptyState = styled.div`
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};

  h4 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
    color: ${props => props.theme.colors.text};
  }

  p {
    margin: 0;
    font-size: 14px;
    opacity: 0.8;
  }
`;

interface PropertyTypeChartProps {
  data: {
    forSale: number;
    forRent: number;
    total: number;
    distribution?: {
      apartment: number;
      house: number;
      commercial: number;
      land: number;
      rural: number;
    };
  };
  loading?: boolean;
}

const DASHBOARD_CHART_HEX = [
  '#A63126',
  '#592722',
  '#3FA66B',
  '#4A90E2',
  '#E6B84C',
  '#8B5CF6',
  '#E05A5A',
  '#6B1D15',
];

const PROPERTY_CHART_PALETTE = (() => {
  const raw = getTheme('light').rawColors ?? {};
  return [
    raw.primary ?? DASHBOARD_CHART_HEX[0],
    raw.secondary ?? DASHBOARD_CHART_HEX[1],
    raw.success ?? DASHBOARD_CHART_HEX[2],
    raw.info ?? DASHBOARD_CHART_HEX[3],
    raw.warning ?? DASHBOARD_CHART_HEX[4],
    raw.purple ?? DASHBOARD_CHART_HEX[5],
    raw.error ?? DASHBOARD_CHART_HEX[6],
    raw.primaryDarker ?? DASHBOARD_CHART_HEX[7],
  ];
})();

const PropertyTypeChart: React.FC<PropertyTypeChartProps> = ({
  data,
  loading = false,
}) => {
  const chartData = useMemo(() => {
    if (data.distribution) {
      const labels = ['Apartamento', 'Casa', 'Comercial', 'Terreno', 'Rural'];
      const values = [
        data.distribution.apartment,
        data.distribution.house,
        data.distribution.commercial,
        data.distribution.land,
        data.distribution.rural,
      ];

      // Filtrar apenas tipos com valores > 0
      const filteredData = labels
        .map((label, index) => ({ label, value: values[index] }))
        .filter(item => item.value > 0);

      return {
        labels: filteredData.map(item => item.label),
        values: filteredData.map(item => item.value),
      };
    }

    // Fallback para dados simples (venda/locação)
    return {
      labels: ['Para Venda', 'Para Locação'],
      values: [data.forSale, data.forRent],
    };
  }, [data]);

  if (loading) {
    return (
      <ChartContainer>
        <EmptyState>
          <h4>Carregando...</h4>
          <p>Preparando dados de propriedades</p>
        </EmptyState>
      </ChartContainer>
    );
  }

  // Se não há dados, mostrar mensagem
  if (chartData.values.every(v => v === 0)) {
    return (
      <ChartContainer>
        <EmptyState>
          <h4>🏠 Nenhum dado de propriedades</h4>
          <p>Os gráficos aparecerão quando houver propriedades cadastradas</p>
        </EmptyState>
      </ChartContainer>
    );
  }

  const colors = PROPERTY_CHART_PALETTE.slice(0, chartData.labels.length).map(h => hexToRgba(h, 0.8));
  const borderColors = PROPERTY_CHART_PALETTE.slice(0, chartData.labels.length).map(h => hexToRgba(h, 1));

  const chartDataConfig = {
    labels: chartData.labels,
    datasets: [
      {
        data: chartData.values,
        backgroundColor: colors.slice(0, chartData.labels.length),
        borderColor: borderColors.slice(0, chartData.labels.length),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function (context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage =
              total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <ChartContainer>
      <SafeChartWrapper
        fallback={
          <EmptyState>
            <h4>Carregando...</h4>
            <p>Preparando gráfico</p>
          </EmptyState>
        }
      >
        <Pie data={chartDataConfig} options={options} />
      </SafeChartWrapper>
    </ChartContainer>
  );
};

export default PropertyTypeChart;
