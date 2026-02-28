import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  MdEmail,
  MdSms,
  MdCheckCircle,
  MdError,
  MdSchedule,
  MdSend,
  MdRefresh,
  MdDone,
  MdDoneAll,
  MdAttachMoney,
  MdSettings,
} from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';
import { Layout } from '@/components/layout/Layout';
import { PermissionButton } from '@/components/common/PermissionButton';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';
import { CollectionShimmer } from '@/components/shimmer/CollectionShimmer';
import {
  getCollectionMessages,
  getCollectionStatistics,
  processCollections,
  type CollectionMessage,
  type CollectionStatistics,
} from '../services/collectionService';
import styled from 'styled-components';
import {
  RentalStylePageContainer,
  PageHeader,
  PageTitle,
  PageTitleContainer,
  PageSubtitle,
  ContentCard,
} from '@/styles/components/PageStyles';

const CollectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<CollectionMessage[]>([]);
  const [statistics, setStatistics] = useState<CollectionStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [processConfirmOpen, setProcessConfirmOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [messagesData, statsData] = await Promise.all([
        getCollectionMessages(),
        getCollectionStatistics(),
      ]);
      setMessages(messagesData);
      setStatistics(statsData);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar dados da régua de cobrança.');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessCollections = async () => {
    setProcessConfirmOpen(true);
  };

  const onConfirmProcessCollections = async () => {
    try {
      setProcessing(true);
      const result = await processCollections();
      toast.success(`${result.processed} cobranças processadas com sucesso!`);
      setProcessConfirmOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao processar cobranças');
    } finally {
      setProcessing(false);
    }
  };

  const getChannelIcon = (channel: string) => {
    const icons: Record<string, any> = {
      EMAIL: <MdEmail size={18} />,
      WHATSAPP: <FaWhatsapp size={18} />,
      SMS: <MdSms size={18} />,
    };
    return icons[channel] || <MdEmail size={18} />;
  };

  const getChannelLabel = (channel: string) => {
    const labels: Record<string, string> = {
      EMAIL: 'Email',
      WHATSAPP: 'WhatsApp',
      SMS: 'SMS',
    };
    return labels[channel] || channel;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Pendente',
      SENT: 'Enviada',
      DELIVERED: 'Entregue',
      READ: 'Lida',
      FAILED: 'Falhou',
    };
    return labels[status] || status;
  };

  const formatDateTime = (date: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('pt-BR');
  };

  if (loading && !statistics && messages.length === 0) {
    return <CollectionShimmer />;
  }

  return (
    <Layout>
      <ConfirmDeleteModal
        isOpen={processConfirmOpen}
        onClose={() => setProcessConfirmOpen(false)}
        onConfirm={onConfirmProcessCollections}
        title="Processar cobranças"
        message="Deseja processar as cobranças manualmente? Isso enviará mensagens para todos os pagamentos pendentes."
        confirmLabel="Processar"
        cancelLabel="Cancelar"
        isLoading={processing}
        loadingLabel="Processando..."
        variant="mark-as-sold"
      />
      <RentalStylePageContainer>
        <PageHeader>
          <PageTitleContainer>
            <PageTitle>
              <MdAttachMoney size={32} />
              Régua de Cobrança
            </PageTitle>
            <PageSubtitle>Acompanhe o envio automático de cobranças</PageSubtitle>
          </PageTitleContainer>
          <HeaderActions>
            <PermissionButton
              permission='collection:manage'
              onClick={() => navigate('/collection/rules')}
              variant='secondary'
              title='Configurações da régua de cobrança'
            >
              <MdSettings size={20} />
              Config. Régua de Cobrança
            </PermissionButton>
            <RefreshButton onClick={fetchData}>
              <MdRefresh size={20} />
              Atualizar
            </RefreshButton>
            <PermissionButton
              permission='collection:manage'
              onClick={handleProcessCollections}
              disabled={processing}
            >
              {processing ? (
                <>
                  <LoadingSpinnerSmall />
                  Processando...
                </>
              ) : (
                <>
                  <MdSend size={20} />
                  Processar Cobranças
                </>
              )}
            </PermissionButton>
          </HeaderActions>
        </PageHeader>

        <InfoAlert>
          <MdSchedule size={20} />
          As cobranças são processadas automaticamente todos os dias às 8h da manhã.
          Você também pode processar manualmente clicando no botão acima.
        </InfoAlert>

        {/* Estatísticas */}
        {statistics && (
          <>
            <StatsGrid>
              <StatCard>
                <StatIcon>
                  <MdSend size={24} />
                </StatIcon>
                <StatContent>
                  <StatValue>{statistics.total ?? 0}</StatValue>
                  <StatLabel>Total de Mensagens</StatLabel>
                </StatContent>
              </StatCard>
              <StatCard>
                <StatIcon $color='success'>
                  <MdCheckCircle size={24} />
                </StatIcon>
                <StatContent>
                  <StatValue>
                    {(
                      (Number(statistics.successRate) ?? 0) * 100
                    ).toFixed(1)}
                    %
                  </StatValue>
                  <StatLabel>Taxa de Sucesso</StatLabel>
                </StatContent>
              </StatCard>
              <StatCard>
                <StatIcon $color='info'>
                  <MdDoneAll size={24} />
                </StatIcon>
                <StatContent>
                  <StatValue>{statistics.read ?? 0}</StatValue>
                  <StatLabel>Mensagens Lidas</StatLabel>
                </StatContent>
              </StatCard>
              <StatCard>
                <StatIcon $color='error'>
                  <MdError size={24} />
                </StatIcon>
                <StatContent>
                  <StatValue>{statistics.failed ?? 0}</StatValue>
                  <StatLabel>Falhas</StatLabel>
                </StatContent>
              </StatCard>
            </StatsGrid>

            {/* Distribuição por Canal */}
            <ContentCard>
              <CardTitle>Distribuição por Canal</CardTitle>
              <ChannelGrid>
                <ChannelItem>
                  <ChannelIcon $color='primary'>
                    <MdEmail size={20} />
                  </ChannelIcon>
                  <ChannelLabel>Email</ChannelLabel>
                  <ChannelValue>{statistics.byChannel?.email ?? 0}</ChannelValue>
                </ChannelItem>
                <ChannelItem>
                  <ChannelIcon $color='success'>
                    <FaWhatsapp size={20} />
                  </ChannelIcon>
                  <ChannelLabel>WhatsApp</ChannelLabel>
                  <ChannelValue>{statistics.byChannel?.whatsapp ?? 0}</ChannelValue>
                </ChannelItem>
                <ChannelItem>
                  <ChannelIcon $color='info'>
                    <MdSms size={20} />
                  </ChannelIcon>
                  <ChannelLabel>SMS</ChannelLabel>
                  <ChannelValue>{statistics.byChannel?.sms ?? 0}</ChannelValue>
                </ChannelItem>
              </ChannelGrid>
            </ContentCard>
          </>
        )}

        {/* Tabela de Mensagens */}
        <ContentCard>
          <CardTitle>Histórico de Mensagens</CardTitle>
          {loading ? (
            <LoadingContainer>
              <LoadingSpinner />
              <LoadingText>Carregando mensagens...</LoadingText>
            </LoadingContainer>
          ) : (
            <TableContainer>
              <Table>
                <thead>
                  <tr>
                    <Th>Canal</Th>
                    <Th>Destinatário</Th>
                    <Th>Contato</Th>
                    <Th>Mensagem</Th>
                    <Th>Status</Th>
                    <Th>Enviada em</Th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((message) => (
                    <Tr key={message.id}>
                      <Td>
                        <ChannelBadge>
                          {getChannelIcon(message.channel)}
                          <span>{getChannelLabel(message.channel)}</span>
                        </ChannelBadge>
                      </Td>
                      <Td>{message.recipientName}</Td>
                      <Td>
                        {message.channel === 'EMAIL'
                          ? message.recipientEmail
                          : message.recipientPhone}
                      </Td>
                      <Td>
                        {message.subject ? (
                          <>
                            <MessageSubject>{message.subject}</MessageSubject>
                            <MessagePreview>{message.message}</MessagePreview>
                          </>
                        ) : (
                          <MessagePreview>{message.message}</MessagePreview>
                        )}
                      </Td>
                      <Td>
                        <Badge
                          $variant={getStatusBadgeVariant(message.status)}
                          title={message.errorMessage || ''}
                        >
                          {getStatusIcon(message.status)}
                          {getStatusLabel(message.status)}
                        </Badge>
                      </Td>
                      <Td>{formatDateTime(message.sentAt)}</Td>
                    </Tr>
                  ))}
                  {messages.length === 0 && (
                    <Tr>
                      <Td colSpan={6}>
                        <EmptyState>
                          <MdSend size={48} />
                          <EmptyStateText>Nenhuma mensagem enviada ainda</EmptyStateText>
                        </EmptyState>
                      </Td>
                    </Tr>
                  )}
                </tbody>
              </Table>
            </TableContainer>
          )}
        </ContentCard>
      </RentalStylePageContainer>
    </Layout>
  );
};

// Helper functions
const getStatusBadgeVariant = (status: string) => {
  const variants: Record<string, string> = {
    PENDING: 'default',
    SENT: 'info',
    DELIVERED: 'success',
    READ: 'success',
    FAILED: 'error',
  };
  return variants[status] || 'default';
};

const getStatusIcon = (status: string) => {
  const icons: Record<string, any> = {
    PENDING: <MdSchedule size={14} />,
    SENT: <MdSend size={14} />,
    DELIVERED: <MdDone size={14} />,
    READ: <MdDoneAll size={14} />,
    FAILED: <MdError size={14} />,
  };
  return icons[status] || <MdSchedule size={14} />;
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

const InfoAlert = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: ${props => props.theme.colors.infoBackground};
  border: 1px solid ${props => props.theme.colors.infoBorder};
  border-radius: 12px;
  color: ${props => props.theme.colors.infoText};
  font-size: 14px;
  margin-bottom: 24px;
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
    if (props.$color === 'error') return props.theme.colors.errorBackground;
    if (props.$color === 'info') return props.theme.colors.infoBackground;
    return props.theme.colors.backgroundSecondary;
  }};
  color: ${props => {
    if (props.$color === 'success') return props.theme.colors.success;
    if (props.$color === 'error') return props.theme.colors.error;
    if (props.$color === 'info') return props.theme.colors.info;
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

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0 0 20px 0;
`;

const ChannelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const ChannelItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: ${props => props.theme.colors.backgroundSecondary};
  border-radius: 12px;
`;

const ChannelIcon = styled.div<{ $color?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => {
    if (props.$color === 'primary') return props.theme.colors.infoBackground;
    if (props.$color === 'success') return props.theme.colors.successBackground;
    if (props.$color === 'info') return props.theme.colors.infoBackground;
    return props.theme.colors.backgroundSecondary;
  }};
  color: ${props => {
    if (props.$color === 'primary') return props.theme.colors.info;
    if (props.$color === 'success') return props.theme.colors.success;
    if (props.$color === 'info') return props.theme.colors.info;
    return props.theme.colors.primary;
  }};
`;

const ChannelLabel = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
`;

const ChannelValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin-left: auto;
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

const LoadingSpinnerSmall = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;

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

const ChannelBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.theme.colors.text};
`;

const MessageSubject = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
  color: ${props => props.theme.colors.text};
`;

const MessagePreview = styled.div`
  font-size: 13px;
  color: ${props => props.theme.colors.textSecondary};
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Badge = styled.span<{ $variant?: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
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

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: ${props => props.theme.colors.textLight};
`;

const EmptyStateText = styled.div`
  margin-top: 16px;
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
`;

export default CollectionPage;
