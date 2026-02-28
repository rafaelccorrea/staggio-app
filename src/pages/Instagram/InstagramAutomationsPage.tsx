import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Alert,
  Spin,
  Tag,
  Pagination,
  Space,
  Empty,
  Tooltip,
  Divider,
  Row,
  Col,
  Statistic,
  Badge,
  ConfigProvider,
  theme as antdTheme,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Plus,
  Edit2,
  Trash2,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import instagramApi from '../../services/instagramApi';
import { projectsApi } from '../../services/projectsApi';
import { userApi } from '../../services/userApi';
import type { InstagramPostAutomation } from '../../types/instagram';
import type { KanbanProjectResponseDto } from '../../types/kanban';
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
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 28px;

  @media (min-width: 600px) {
    grid-template-columns: repeat(3, 1fr);
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
    font-size: 1.75rem;
    font-weight: 700;
    color: ${props => props.theme.colors.primary};
  }
`;

const AutomationCard = styled(Card)`
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.cardBackground};
  margin-bottom: 16px;
  transition: all 0.2s ease;
  box-shadow: ${props => props.theme.colors.shadow};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: ${props => props.theme.colors.shadow};
  }
`;

const AutomationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const AutomationTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AutomationBadge = styled(Badge)`
  margin-left: 8px;
`;

const AutomationDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px;
  background: ${props => props.theme.colors.backgroundSecondary};
  border-radius: 8px;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DetailLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: ${props => props.theme.colors.textSecondary};
  letter-spacing: 0.5px;
`;

const DetailValue = styled.span`
  font-size: 0.9375rem;
  color: ${props => props.theme.colors.text};
  font-weight: 500;
  word-break: break-all;
`;

const KeywordTag = styled(Tag)`
  margin: 2px;
`;

const ActionButtons = styled(Space)`
  display: flex;
  gap: 8px;
`;

const PrimaryButton = styled(Button)`
  background: ${props => props.theme.colors.primary};
  border-color: ${props => props.theme.colors.primary};
  color: white;
  
  &:hover {
    opacity: 0.9;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  margin-top: 24px;
`;

const EmptyStateText = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 24px;
  font-size: 0.9375rem;
`;

export const InstagramAutomationsPageV2: React.FC = () => {
  const [automations, setAutomations] = useState<InstagramPostAutomation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const [projects, setProjects] = useState<KanbanProjectResponseDto[]>([]);
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string; cpf?: string }>>([]);

  useEffect(() => {
    loadAutomations();
  }, [page]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [projectsRes, usersRes] = await Promise.all([
          projectsApi.getProjectsByCompany().catch(() => []),
          userApi.getUsersByCompany().catch(() => []),
        ]);
        setProjects(Array.isArray(projectsRes) ? projectsRes : []);
        setUsers(
          (usersRes || []).map((u: { id: string; name: string; email: string; document?: string; cpf?: string }) => ({
            id: u.id,
            name: u.name || u.email || 'Sem nome',
            email: u.email || '',
            cpf: (u as { document?: string }).document || u.cpf || '',
          }))
        );
      } catch {
        setProjects([]);
        setUsers([]);
      }
    };
    loadOptions();
  }, []);

  const loadAutomations = async () => {
    try {
      setLoading(true);
      const data = await instagramApi.listAutomations(page, limit);
      setAutomations(data.data);
      setTotal(data.total);
    } catch (err) {
      setError('Erro ao carregar automações');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (automation?: InstagramPostAutomation) => {
    if (automation) {
      setEditingId(automation.id);
      form.setFieldsValue({
        instagramPostId: automation.instagramPostId,
        postUrl: automation.postUrl || '',
        postCaption: automation.postCaption || '',
        triggerKeywords: automation.triggerKeywords,
        autoReplyMessage: automation.autoReplyMessage,
        kanbanProjectId: automation.kanbanProjectId || '',
        postLeadTagIds: automation.postLeadTagIds || '',
        postLeadNote: automation.postLeadNote || '',
        responsibleUserId: automation.responsibleUserId || '',
      });
    } else {
      setEditingId(null);
      form.resetFields();
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingId(null);
    form.resetFields();
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setError(null);
      setSuccess(null);
      setSaving(true);

      if (editingId) {
        await instagramApi.updateAutomation(editingId, values);
        setSuccess('Automação atualizada com sucesso!');
      } else {
        await instagramApi.createAutomation(values);
        setSuccess('Automação criada com sucesso!');
      }

      handleCloseModal();
      await loadAutomations();
    } catch (err) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      setError('Erro ao salvar automação');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Deletar Automação',
      content: 'Tem certeza que deseja deletar esta automação? Esta ação não pode ser desfeita.',
      okText: 'Deletar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await instagramApi.deleteAutomation(id);
          setSuccess('Automação deletada com sucesso!');
          await loadAutomations();
        } catch (err) {
          setError('Erro ao deletar automação');
          console.error(err);
        }
      },
    });
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

  const totalLeads = automations.reduce((sum, a) => sum + a.leadsCreated, 0);
  const totalComments = automations.reduce((sum, a) => sum + a.commentsProcessed, 0);
  const activeAutomations = automations.filter(a => a.isActive).length;

  return (
    <PageContainer>
      <InstagramNavTabs />
      <ConfigProvider theme={antdThemeConfig}>
      {/* Header */}
      <PageHeader>
        <div>
          <Title>
            <MessageSquare size={28} />
            Automações de Posts
          </Title>
          <Subtitle>Gerencie as regras de automação para capturar leads dos comentários</Subtitle>
        </div>
        <PrimaryButton
          type="primary"
          icon={<Plus size={18} />}
          size="large"
          onClick={() => handleOpenModal()}
        >
          Nova Automação
        </PrimaryButton>
      </PageHeader>

      {/* Alerts */}
      {error && <Alert message={error} type="error" closable style={{ marginBottom: 16 }} />}
      {success && <Alert message={success} type="success" closable style={{ marginBottom: 16 }} />}

      {/* Statistics */}
      <StatsContainer>
        <StatCard>
          <Statistic
            title="Total de Leads"
            value={totalLeads}
            prefix={<CheckCircle2 size={18} style={{ marginRight: 8 }} />}
          />
        </StatCard>
        <StatCard>
          <Statistic
            title="Comentários Processados"
            value={totalComments}
            prefix={<MessageSquare size={18} style={{ marginRight: 8 }} />}
          />
        </StatCard>
        <StatCard>
          <Statistic
            title="Automações Ativas"
            value={activeAutomations}
            suffix={`/ ${automations.length}`}
            prefix={<TrendingUp size={18} style={{ marginRight: 8 }} />}
          />
        </StatCard>
      </StatsContainer>

      {/* Automations List */}
      <Spin spinning={loading}>
        {automations.length === 0 ? (
          <EmptyState>
            <Empty
              description="Nenhuma automação configurada"
              style={{ marginBottom: 24 }}
            />
            <EmptyStateText>
              Crie uma nova automação para começar a capturar leads dos comentários
            </EmptyStateText>
            <PrimaryButton
              type="primary"
              icon={<Plus size={18} />}
              size="large"
              onClick={() => handleOpenModal()}
            >
              Criar Primeira Automação
            </PrimaryButton>
          </EmptyState>
        ) : (
          <>
            {automations.map(automation => (
              <AutomationCard key={automation.id}>
                <AutomationHeader>
                  <div style={{ flex: 1 }}>
                    <AutomationTitle>
                      Post {automation.instagramPostId.slice(0, 12)}...
                      <AutomationBadge
                        status={automation.isActive ? 'success' : 'default'}
                        text={automation.isActive ? 'Ativa' : 'Inativa'}
                      />
                    </AutomationTitle>
                    {automation.postCaption && (
                      <Subtitle>{automation.postCaption.slice(0, 100)}...</Subtitle>
                    )}
                  </div>
                </AutomationHeader>

                <AutomationDetails>
                  <DetailItem>
                    <DetailLabel>Palavras-chave</DetailLabel>
                    <div>
                      {automation.triggerKeywords.split(',').map((keyword, idx) => (
                        <KeywordTag key={idx} color="blue">
                          {keyword.trim()}
                        </KeywordTag>
                      ))}
                    </div>
                  </DetailItem>

                  <DetailItem>
                    <DetailLabel>Leads Criados</DetailLabel>
                    <DetailValue>{automation.leadsCreated}</DetailValue>
                  </DetailItem>

                  <DetailItem>
                    <DetailLabel>Comentários Processados</DetailLabel>
                    <DetailValue>{automation.commentsProcessed}</DetailValue>
                  </DetailItem>

                  {automation.postLeadNote && (
                    <DetailItem>
                      <DetailLabel>Nota para Lead</DetailLabel>
                      <DetailValue>{automation.postLeadNote}</DetailValue>
                    </DetailItem>
                  )}
                </AutomationDetails>

                <Divider style={{ margin: '12px 0' }} />

                <ActionButtons>
                  <Button
                    type="primary"
                    ghost
                    icon={<Edit2 size={16} />}
                    onClick={() => handleOpenModal(automation)}
                  >
                    Editar
                  </Button>
                  <Button
                    danger
                    ghost
                    icon={<Trash2 size={16} />}
                    onClick={() => handleDelete(automation.id)}
                  >
                    Deletar
                  </Button>
                </ActionButtons>
              </AutomationCard>
            ))}

            {/* Pagination */}
            <div style={{ textAlign: 'center', marginTop: 24 }}>
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

      {/* Modal */}
      <Modal
        title={editingId ? 'Editar Automação' : 'Nova Automação'}
        open={modalOpen}
        onCancel={handleCloseModal}
        footer={[
          <Button key="cancel" onClick={handleCloseModal}>
            Cancelar
          </Button>,
          <PrimaryButton
            key="submit"
            type="primary"
            loading={saving}
            onClick={handleSave}
          >
            {editingId ? 'Atualizar' : 'Criar'}
          </PrimaryButton>,
        ]}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="ID do Post do Instagram"
            name="instagramPostId"
            rules={[{ required: true, message: 'ID do post é obrigatório' }]}
          >
            <Input placeholder="Ex: 17999999999999999" />
          </Form.Item>

          <Form.Item
            label="Palavras-chave (separadas por vírgula)"
            name="triggerKeywords"
            rules={[{ required: true, message: 'Palavras-chave são obrigatórias' }]}
          >
            <Input.TextArea
              placeholder="Ex: quero, valor, preço, informação"
              rows={3}
            />
          </Form.Item>

          <Form.Item
            label="Funil (Projeto Kanban)"
            name="kanbanProjectId"
            rules={[{ required: true, message: 'Selecione o funil' }]}
          >
            <Select
              placeholder="Selecione o funil"
              allowClear
              showSearch
              optionFilterProp="label"
              options={projects.map(p => ({
                value: p.id,
                label: p.name || p.id?.slice(0, 8) || 'Funil',
              }))}
              filterOption={(input, opt) =>
                (opt?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            label="Usuário responsável"
            name="responsibleUserId"
          >
            <Select
              placeholder="Selecione o usuário (busque por nome ou CPF)"
              allowClear
              showSearch
              optionFilterProp="label"
              options={[
                { value: '', label: 'Nenhum' },
                ...users.map(u => {
                  const label = [u.name, u.email, u.cpf].filter(Boolean).join(' · ');
                  return { value: u.id, label };
                }),
              ]}
              filterOption={(input, opt) =>
                (opt?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            label="Nota para o Lead"
            name="postLeadNote"
          >
            <Input.TextArea
              placeholder="Nota que será adicionada ao lead criado"
              rows={2}
            />
          </Form.Item>
        </Form>
      </Modal>
      </ConfigProvider>
    </PageContainer>
  );
};

export default InstagramAutomationsPageV2;
