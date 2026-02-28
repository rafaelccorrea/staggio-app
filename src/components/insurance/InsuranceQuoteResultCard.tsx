import React from 'react';
import { Card, Descriptions, Tag, Button, Space, Divider } from 'antd';
import {
  SafetyOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { InsuranceQuote } from '../../services/insuranceService';

interface InsuranceQuoteResultCardProps {
  quote: InsuranceQuote;
  onSelectQuote?: (quote: InsuranceQuote) => void;
  showActions?: boolean;
}

const InsuranceQuoteResultCard: React.FC<InsuranceQuoteResultCardProps> = ({
  quote,
  onSelectQuote,
  showActions = true,
}) => {
  const getProviderName = (provider: string) => {
    const providers: Record<string, string> = {
      POTTENCIAL: 'Pottencial Seguros',
      JUNTO_SEGUROS: 'Junto Seguros',
      TOKIO_MARINE: 'Tokio Marine',
      PORTO_SEGURO: 'Porto Seguro',
    };
    return providers[provider] || provider;
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      PENDING: { color: 'processing', text: 'Processando' },
      COMPLETED: { color: 'success', text: 'Concluída' },
      EXPIRED: { color: 'default', text: 'Expirada' },
      ERROR: { color: 'error', text: 'Erro' },
    };
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const isExpired = quote.expiresAt
    ? dayjs(quote.expiresAt).isBefore(dayjs())
    : false;

  return (
    <Card
      style={{ marginBottom: 16 }}
      title={
        <Space>
          <SafetyOutlined />
          {getProviderName(quote.provider)}
        </Space>
      }
      extra={getStatusTag(quote.status)}
    >
      <Descriptions column={2} size="small">
        <Descriptions.Item label="Prêmio Mensal" span={2}>
          <span style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
            {formatCurrency(quote.monthlyPremium || 0)}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="Cobertura">
          {formatCurrency(quote.coverageAmount || 0)}
        </Descriptions.Item>
        <Descriptions.Item label="Data da Cotação">
          {dayjs(quote.createdAt).format('DD/MM/YYYY HH:mm')}
        </Descriptions.Item>
        {quote.expiresAt && (
          <Descriptions.Item label="Validade" span={2}>
            <Space>
              {isExpired ? (
                <Tag color="error">Expirada</Tag>
              ) : (
                <Tag color="success">
                  Válida até {dayjs(quote.expiresAt).format('DD/MM/YYYY')}
                </Tag>
              )}
            </Space>
          </Descriptions.Item>
        )}
      </Descriptions>

      {quote.resultData?.coverages && quote.resultData.coverages.length > 0 && (
        <>
          <Divider orientation="left">Coberturas Incluídas</Divider>
          <ul style={{ paddingLeft: 20 }}>
            {quote.resultData.coverages.map((coverage: any, index: number) => (
              <li key={index}>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                {coverage.name || coverage.description}
              </li>
            ))}
          </ul>
        </>
      )}

      {showActions && quote.status === 'COMPLETED' && !isExpired && (
        <div style={{ marginTop: 16 }}>
          <Button
            type="primary"
            size="large"
            block
            onClick={() => onSelectQuote && onSelectQuote(quote)}
            icon={<DollarOutlined />}
          >
            Contratar este Seguro
          </Button>
        </div>
      )}

      {isExpired && (
        <div style={{ marginTop: 16 }}>
          <Tag color="warning" icon={<ClockCircleOutlined />}>
            Esta cotação expirou. Solicite uma nova cotação.
          </Tag>
        </div>
      )}
    </Card>
  );
};

export default InsuranceQuoteResultCard;
