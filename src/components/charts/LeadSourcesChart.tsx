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

interface LeadSource {
  source: string;
  label: string;
  count: number;
  percentage: number;
}

interface LeadSourcesChartProps {
  data: {
    sources: LeadSource[];
    total: number;
    withoutSource: number;
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

const LEAD_SOURCES_CHART_PALETTE = (() => {
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

const LeadSourcesChart: React.FC<LeadSourcesChartProps> = ({
  data,
  loading = false,
}) => {
  const chartData = useMemo(() => {
    if (!data.sources || data.sources.length === 0) {
      return { labels: [], values: [] };
    }

    // Ordenar por count (maior primeiro) e pegar os top 8
    const sortedSources = [...data.sources]
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return {
      labels: sortedSources.map(s => s.label),
      values: sortedSources.map(s => s.count),
      percentages: sortedSources.map(s => s.percentage),
    };
  }, [data]);

  if (loading) {
    return (
      <ChartContainer>
        <EmptyState>
          <h4>Carregando...</h4>
          <p>Preparando dados de origem</p>
        </EmptyState>
      </ChartContainer>
    );
  }

  if (
    !data.sources ||
    data.sources.length === 0 ||
    chartData.values.length === 0
  ) {
    return (
      <ChartContainer>
        <EmptyState>
          <h4>👥 Nenhum dado de origem</h4>
          <p>
            Os gráficos aparecerão quando houver leads com origem registrada
          </p>
        </EmptyState>
      </ChartContainer>
    );
  }

  const colors = LEAD_SOURCES_CHART_PALETTE.slice(0, chartData.labels.length).map(h => hexToRgba(h, 0.8));
  const borderColors = LEAD_SOURCES_CHART_PALETTE.slice(0, chartData.labels.length).map(h => hexToRgba(h, 1));

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
            const percentage =
              chartData.percentages && chartData.percentages[context.dataIndex]
                ? chartData.percentages[context.dataIndex].toFixed(1)
                : '0';
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

export default LeadSourcesChart;
