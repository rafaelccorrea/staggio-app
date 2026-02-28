import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  Card,
  Table,
  Button,
  Modal,
  Input,
  Alert,
  Spin,
  Tag,
  Pagination,
  Space,
  Empty,
  Drawer,
  Divider,
  Row,
  Col,
  Statistic,
  Select,
  Badge,
  ConfigProvider,
  theme as antdTheme,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye,
  Download,
} from 'lucide-react';
import instagramApi from '../../services/instagramApi';
import type { InstagramInteractionLog } from '../../types/instagram';
import { InstagramNavTabs } from './InstagramNavTabs';
import { useTheme } from '../../contexts/ThemeContext';
import { getTheme } from '../../styles/theme';

// ========== Styled Components ==========
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
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin: 0 0 6px 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Subtitle = styled.p`
  font-size: 0.9375rem;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  align-items: center;
`;

const FilterInput = styled(Input)`
  max-width: 280px;
`;

const FilterSelect = styled(Select)`
  min-width: 180px;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  margin-bottom: 28px;

  @media (min-width: 600px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const StatCard = styled(Card)`
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.cardBackground};
  
  .ant-statistic-title {
    font-size: 0.875rem;
    color: ${props => props.theme.colors.textSecondary};
  }
  
  .ant-statistic-content {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${props => props.theme.colors.primary};
  }
`;

const TableContainer = styled(Card)`
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.cardBackground};
  box-shadow: ${props => props.theme.colors.shadow};
  overflow: hidden;
`;

const StatusBadge = styled(Badge)`
  margin-right: 8px;
`;

const DetailDrawer = styled(Drawer)`
  .ant-drawer-content-wrapper {
    background: ${props => props.theme.colors.cardBackground};
  }
`;

const DetailSection = styled.div`
  margin-bottom: 24px;
`;

const DetailSectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const DetailItem = styled.div`
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 16px;
  margin-bottom: 12px;
  padding: 8px 0;
`;

const DetailLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DetailValue = styled.span`
  font-size: 0.9375rem;
  color: ${props => props.theme.colors.text};
  word-break: break-word;
  font-family: monospace;
  background: ${props => props.theme.colors.backgroundSecondary};
  padding: 6px 8px;
  border-radius: 4px;
`;

const ErrorMessage = styled.div`
  padding: 12px;
  background: ${props => props.theme.colors.errorBackground};
  border: 1px solid ${props => props.theme.colors.errorBorder};
  border-radius: 8px;
  color: ${props => props.theme.colors.errorText};
  font-size: 0.875rem;
  margin-top: 8px;
`;

const getStatusColor = (status: string) => {
  switch (status) {
    case 'comment_received':
      return 'blue';
    case 'keyword_matched':
      return 'cyan';
    case 'lead_created':
      return 'green';
    case 'failed':
      return 'red';
    default:
      return 'default';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'comment_received':
      return <MessageSquare size={16} />;
    case 'keyword_matched':
      return <AlertCircle size={16} />;
    case 'lead_created':
      return <CheckCircle2 size={16} />;
    case 'failed':
      return <XCircle size={16} />;
    default:
      return null;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'comment_received':
      return 'Comentário Recebido';
    case 'keyword_matched':
      return 'Palavra-chave Detectada';
    case 'lead_created':
      return 'Lead Criado';
    case 'failed':
      return 'Falha';
    default:
      return status;
  }
};

export const InstagramLogsPageV2: React.FC = () => {
  const [logs, setLogs] = useState<InstagramInteractionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);

  const [filterPostId, setFilterPostId] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<InstagramInteractionLog | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    loadLogs();
  }, [page, filterPostId, filterStatus]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await instagramApi.listInteractionLogs(page, limit, {
        postId: filterPostId || undefined,
        status: filterStatus || undefined,
      });
      setLogs(data.data);
      setTotal(data.total);
    } catch (err) {
      setError('Erro ao carregar logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (log: InstagramInteractionLog) => {
    setSelectedLog(log);
    setDrawerOpen(true);
  };

  const handleExportLogs = () => {
    const csv = [
      ['ID', 'Post ID', 'Usuário', 'Status', 'Palavra-chave', 'Data'].join(','),
      ...logs.map(log =>
        [
          log.id,
          log.instagramPostId,
          log.instagramUsername,
          log.status,
          log.matchedKeyword || '-',
          new Date(log.createdAt).toLocaleString(),
        ].join(','),
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `instagram-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const { theme: currentTheme } = useTheme();
  const themeColors = getTheme(currentTheme).rawColors;
  const antdThemeConfig = {
    token: {
      colorPrimary: themeColors.primary,
      colorBgContainer: themeColors.cardBackground,
      colorBorder: themeColors.border,
      colorText: themeColors.text,
      colorTextSecondary: themeColors.textSecondary,
      borderRadius: 8,
    },
    algorithm: currentTheme === 'dark' ? antdTheme.darkAlgorithm : undefined,
  };

  const successCount = logs.filter(l => l.status === 'lead_created').length;
  const failureCount = logs.filter(l => l.status === 'failed').length;
  const successRate = logs.length > 0 ? ((successCount / logs.length) * 100).toFixed(1) : '0';

  const columns: ColumnsType<InstagramInteractionLog> = [
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: string) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {getStatusLabel(status)}
        </Tag>
      ),
    },
    {
      title: 'Usuário',
      dataIndex: 'instagramUsername',
      key: 'instagramUsername',
      width: 150,
      render: (username: string) => (
        <span>@{username}</span>
      ),
    },
    {
      title: 'Post ID',
      dataIndex: 'instagramPostId',
      key: 'instagramPostId',
      width: 150,
      render: (postId: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.85em' }}>
          {postId.slice(0, 12)}...
        </span>
      ),
    },
    {
      title: 'Palavra-chave',
      dataIndex: 'matchedKeyword',
      key: 'matchedKeyword',
      width: 120,
      render: (keyword: string | null) =>
        keyword ? <Tag color="blue">{keyword}</Tag> : <span style={{ color: 'var(--color-text-secondary)' }}>-</span>,
    },
    {
      title: 'Data',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => new Date(date).toLocaleString('pt-BR'),
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          icon={<Eye size={16} />}
          onClick={() => handleViewDetails(record)}
        >
          Detalhes
        </Button>
      ),
    },
  ];

  return (
    <PageContainer>
      <InstagramNavTabs />
      <ConfigProvider theme={antdThemeConfig}>
      {/* Header */}
      <PageHeader>
        <Title>
          <MessageSquare size={28} />
          Logs de Interação
        </Title>
        <Subtitle>Acompanhe todos os comentários processados e leads criados</Subtitle>
      </PageHeader>

      {/* Alerts */}
      {error && <Alert message={error} type="error" closable style={{ marginBottom: 16 }} />}

      {/* Statistics */}
      <StatsContainer>
        <StatCard>
          <Statistic
            title="Total de Interações"
            value={total}
            prefix={<MessageSquare size={18} style={{ marginRight: 8 }} />}
          />
        </StatCard>
        <StatCard>
          <Statistic
            title="Leads Criados"
            value={successCount}
            prefix={<CheckCircle2 size={18} style={{ marginRight: 8 }} />}
          />
        </StatCard>
        <StatCard>
          <Statistic
            title="Falhas"
            value={failureCount}
            prefix={<XCircle size={18} style={{ marginRight: 8 }} />}
          />
        </StatCard>
        <StatCard>
          <Statistic
            title="Taxa de Sucesso"
            value={parseFloat(successRate)}
            suffix="%"
            prefix={<AlertCircle size={18} style={{ marginRight: 8 }} />}
          />
        </StatCard>
      </StatsContainer>

      {/* Filters */}
      <FiltersContainer>
        <FilterInput
          placeholder="Filtrar por Post ID"
          value={filterPostId}
          onChange={e => {
            setFilterPostId(e.target.value);
            setPage(1);
          }}
          allowClear
        />
        <FilterSelect
          placeholder="Filtrar por Status"
          value={filterStatus || undefined}
          onChange={value => {
            setFilterStatus(value || '');
            setPage(1);
          }}
          allowClear
          options={[
            { label: 'Comentário Recebido', value: 'comment_received' },
            { label: 'Palavra-chave Detectada', value: 'keyword_matched' },
            { label: 'Lead Criado', value: 'lead_created' },
            { label: 'Falha', value: 'failed' },
          ]}
        />
        <Button
          icon={<Download size={16} />}
          onClick={handleExportLogs}
          disabled={logs.length === 0}
        >
          Exportar CSV
        </Button>
      </FiltersContainer>

      {/* Table */}
      <TableContainer>
        <Spin spinning={loading}>
          {logs.length === 0 ? (
            <Empty
              description="Nenhum log encontrado"
              style={{ padding: '60px 20px' }}
            />
          ) : (
            <>
              <Table
                columns={columns}
                dataSource={logs}
                rowKey="id"
                pagination={false}
                scroll={{ x: 1000 }}
              />
              <Divider style={{ margin: '16px 0' }} />
              <div style={{ textAlign: 'center' }}>
                <Pagination
                  current={page}
                  pageSize={limit}
                  total={total}
                  onChange={setPage}
                  showSizeChanger={false}
                />
              </div>
            </>
          )}
        </Spin>
      </TableContainer>

      {/* Detail Drawer */}
      <DetailDrawer
        title="Detalhes da Interação"
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={500}
      >
        {selectedLog && (
          <>
            <DetailSection>
              <DetailSectionTitle>Status</DetailSectionTitle>
              <Tag
                color={getStatusColor(selectedLog.status)}
                icon={getStatusIcon(selectedLog.status)}
              >
                {getStatusLabel(selectedLog.status)}
              </Tag>
            </DetailSection>

            <DetailSection>
              <DetailSectionTitle>Informações do Usuário</DetailSectionTitle>
              <DetailItem>
                <DetailLabel>Usuário</DetailLabel>
                <DetailValue>@{selectedLog.instagramUsername}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>ID do Usuário</DetailLabel>
                <DetailValue>{selectedLog.instagramUserId}</DetailValue>
              </DetailItem>
            </DetailSection>

            <DetailSection>
              <DetailSectionTitle>Informações do Comentário</DetailSectionTitle>
              <DetailItem>
                <DetailLabel>Comentário</DetailLabel>
                <DetailValue>{selectedLog.commentText}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Post ID</DetailLabel>
                <DetailValue>{selectedLog.instagramPostId}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Comentário ID</DetailLabel>
                <DetailValue>{selectedLog.instagramCommentId}</DetailValue>
              </DetailItem>
            </DetailSection>

            {selectedLog.matchedKeyword && (
              <DetailSection>
                <DetailSectionTitle>Palavra-chave Detectada</DetailSectionTitle>
                <Tag color="blue">{selectedLog.matchedKeyword}</Tag>
              </DetailSection>
            )}

            {selectedLog.kanbanTaskId && (
              <DetailSection>
                <DetailSectionTitle>Lead Criado</DetailSectionTitle>
                <DetailItem>
                  <DetailLabel>Task ID</DetailLabel>
                  <DetailValue>{selectedLog.kanbanTaskId}</DetailValue>
                </DetailItem>
              </DetailSection>
            )}

            {selectedLog.errorMessage && (
              <DetailSection>
                <DetailSectionTitle>Erro</DetailSectionTitle>
                <ErrorMessage>{selectedLog.errorMessage}</ErrorMessage>
              </DetailSection>
            )}

            <DetailSection>
              <DetailSectionTitle>Metadados</DetailSectionTitle>
              <DetailItem>
                <DetailLabel>Data</DetailLabel>
                <DetailValue>{new Date(selectedLog.createdAt).toLocaleString('pt-BR')}</DetailValue>
              </DetailItem>
            </DetailSection>
          </>
        )}
      </DetailDrawer>
      </ConfigProvider>
    </PageContainer>
  );
};

export default InstagramLogsPageV2;
