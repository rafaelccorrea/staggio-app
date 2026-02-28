import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  Form,
  Input,
  Button,
  Alert,
  Checkbox,
  Select,
  Spin,
  message as antdMessage,
  ConfigProvider,
  theme as antdTheme,
} from 'antd';
import { Copy, RefreshCw, Save, Camera, X } from 'lucide-react';
import instagramApi from '../../services/instagramApi';
import type { InstagramConfig } from '../../types/instagram';
import { getApiUrl } from '../../config/apiConfig';
import { useTheme } from '../../contexts/ThemeContext';
import { projectsApi } from '../../services/projectsApi';
import { userApi } from '../../services/userApi';
import type { KanbanProjectResponseDto } from '../../types/kanban';
import { getTheme } from '../../styles/theme';

const SectionWrapper = styled.section`
  margin-top: 24px;
  padding: 24px;
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 16px;
  box-shadow: ${props => props.theme.colors.shadow};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  flex-wrap: wrap;
  gap: 12px;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CloseBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  background: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.border};
    color: ${props => props.theme.colors.text};
  }
`;

const Card = styled.div`
  background: ${props => props.theme.colors.backgroundSecondary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;

  &:last-of-type {
    margin-bottom: 0;
  }
`;

const CardTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0 0 16px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const Helper = styled.p`
  font-size: 0.8125rem;
  color: ${props => props.theme.colors.textSecondary};
  margin: 6px 0 0 0;
  line-height: 1.4;
`;

const UrlRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
`;

const UrlInput = styled.input`
  flex: 1;
  padding: 10px 14px;
  font-size: 0.8125rem;
  font-family: monospace;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  background: ${props => props.theme.colors.cardBackground};
  color: ${props => props.theme.colors.text};

  &:read-only {
    cursor: default;
  }
`;

const CopyBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 14px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  background: ${props => props.theme.colors.cardBackground};
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.primary};
    color: white;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const SecondaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: transparent;
  color: ${props => props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.backgroundTertiary};
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FormRow = styled.div`
  margin-bottom: 16px;

  &:last-of-type {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 8px;
`;

const StatusGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StatusItem = styled.div`
  & > span:first-child {
    display: block;
    font-size: 0.8125rem;
    color: ${props => props.theme.colors.textSecondary};
    margin-bottom: 4px;
  }
`;

const Badge = styled.span<{ $active: boolean }>`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 500;
  background: ${props =>
    props.$active
      ? (props.theme.colors.successBackground || 'rgba(63, 166, 107, 0.15)')
      : props.theme.colors.backgroundTertiary};
  color: ${props =>
    props.$active
      ? (props.theme.colors.success || '#3FA66B')
      : props.theme.colors.textSecondary};
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${props => props.theme.colors.border};
  margin: 16px 0;
`;

const LoadingWrap = styled.div`
  padding: 40px 24px;
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
`;

interface InstagramConfigSectionProps {
  onClose: () => void;
  onSaved?: () => void;
}

export const InstagramConfigSection: React.FC<InstagramConfigSectionProps> = ({
  onClose,
  onSaved,
}) => {
  const { theme: currentTheme } = useTheme();
  const [config, setConfig] = useState<InstagramConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [projects, setProjects] = useState<KanbanProjectResponseDto[]>([]);
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string; cpf?: string }>>([]);
  const [form] = Form.useForm();

  const themeColors = getTheme(currentTheme).rawColors;

  useEffect(() => {
    loadConfig();
    loadProjectsAndUsers();
  }, []);

  const loadProjectsAndUsers = async () => {
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

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await instagramApi.getConfig();
      if (data) {
        setConfig(data);
        form.setFieldsValue({
          accessToken: data.accessToken || '',
          instagramPageId: data.instagramPageId || '',
          instagramPageName: data.instagramPageName || '',
          defaultKanbanProjectId: data.defaultKanbanProjectId || undefined,
          responsibleUserId: data.responsibleUserId || undefined,
          syncLeads: data.syncLeads,
          isActive: data.isActive,
        });
      }
    } catch (err) {
      setError('Erro ao carregar configuração');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      setError(null);
      setSuccess(null);
      const payload = {
        ...values,
        defaultKanbanProjectId: values.defaultKanbanProjectId || undefined,
        responsibleUserId: values.responsibleUserId || undefined,
      };
      if (config) {
        await instagramApi.updateConfig(payload);
      } else {
        await instagramApi.createOrUpdateConfig(payload);
      }
      setSuccess('Configuração salva com sucesso!');
      antdMessage.success('Configuração salva com sucesso!');
      await loadConfig();
      onSaved?.();
    } catch (err) {
      setError('Erro ao salvar configuração');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerateToken = async () => {
    try {
      setSaving(true);
      setError(null);
      const result = await instagramApi.regenerateWebhookToken();
      setConfig(prev => (prev ? { ...prev, webhookToken: result.webhookToken } : null));
      setSuccess('Token regenerado com sucesso!');
      antdMessage.success('Token regenerado com sucesso!');
    } catch (err) {
      setError('Erro ao regenerar token');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    antdMessage.success('Copiado para a área de transferência!');
    setSuccess('Copiado para a área de transferência!');
  };

  const getWebhookUrl = (): string => {
    if (!config?.webhookToken) return '';
    return `${getApiUrl('/integrations/instagram/webhook/comments')}?token=${config.webhookToken}`;
  };

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

  if (loading) {
    return (
      <SectionWrapper>
        <SectionHeader>
          <SectionTitle>
            <Camera size={22} strokeWidth={1.5} />
            Configuração do Instagram
          </SectionTitle>
          <CloseBtn type="button" onClick={onClose}>
            <X size={16} />
            Fechar
          </CloseBtn>
        </SectionHeader>
        <LoadingWrap>
          <Spin size="large" tip="Carregando..." />
        </LoadingWrap>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper>
      <SectionHeader>
        <SectionTitle>
          <Camera size={22} strokeWidth={1.5} />
          Configuração do Instagram
        </SectionTitle>
        <CloseBtn type="button" onClick={onClose}>
          <X size={16} />
          Fechar
        </CloseBtn>
      </SectionHeader>

      {error && (
        <Alert
          type="error"
          message={error}
          style={{ marginBottom: 16 }}
          showIcon
        />
      )}
      {success && (
        <Alert
          type="success"
          message={success}
          style={{ marginBottom: 16 }}
          showIcon
        />
      )}

      <ConfigProvider theme={antdThemeConfig}>
        <Card>
          <CardTitle>Credenciais da Meta</CardTitle>
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Form.Item
              name="accessToken"
              label="Token de Acesso da Meta"
              rules={[{ required: !config, message: 'Obrigatório na primeira configuração' }]}
            >
              <Input.Password
                placeholder="Cole seu token de acesso aqui"
                size="large"
                allowClear
              />
            </Form.Item>
            <Helper>
              Obtenha seu token em{' '}
              <a
                href="https://developers.facebook.com"
                target="_blank"
                rel="noreferrer"
                style={{ color: themeColors.primary }}
              >
                Meta for Developers
              </a>
            </Helper>

            <Form.Item name="instagramPageId" label="ID da Página do Instagram">
              <Input placeholder="Ex: 123456789" size="large" allowClear />
            </Form.Item>

            <Form.Item name="instagramPageName" label="Nome da Página">
              <Input placeholder="Ex: Minha Imobiliária" size="large" allowClear />
            </Form.Item>

            <Form.Item name="defaultKanbanProjectId" label="Funil padrão (destino dos leads)">
              <Select
                placeholder="Selecione o funil"
                size="large"
                allowClear
                showSearch
                optionFilterProp="label"
                options={[
                  { value: '', label: 'Nenhum' },
                  ...projects.map(p => ({
                    value: p.id,
                    label: p.name || p.id?.slice(0, 8) || 'Funil',
                  })),
                ]}
                filterOption={(input, opt) =>
                  (opt?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
            <Helper>Leads serão criados neste funil quando não houver automação específica no post.</Helper>

            <Form.Item name="responsibleUserId" label="Usuário responsável">
              <Select
                placeholder="Selecione o usuário (busque por nome ou CPF)"
                size="large"
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
            <Helper>Usuário que receberá notificações quando um novo lead for criado.</Helper>

            <Form.Item name="syncLeads" valuePropName="checked">
              <Checkbox>Sincronizar leads automaticamente</Checkbox>
            </Form.Item>

            <Form.Item name="isActive" valuePropName="checked">
              <Checkbox>Ativar integração</Checkbox>
            </Form.Item>

            <Form.Item style={{ marginTop: 20, marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={saving}
                size="large"
                icon={<Save size={18} />}
              >
                {saving ? 'Salvando...' : 'Salvar configuração'}
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {config?.webhookToken && (
          <Card>
            <CardTitle>Webhook</CardTitle>
            <FormRow>
              <Label>URL do Webhook</Label>
              <UrlRow>
                <UrlInput readOnly value={getWebhookUrl()} />
                <CopyBtn
                  type="button"
                  onClick={() => copyToClipboard(getWebhookUrl())}
                  title="Copiar URL"
                >
                  <Copy size={18} />
                </CopyBtn>
              </UrlRow>
              <Helper>Configure esta URL no app da Meta para receber comentários.</Helper>
            </FormRow>
            <FormRow>
              <Label>Token de verificação</Label>
              <UrlInput readOnly value="instagram-verify" style={{ maxWidth: 240 }} />
              <Helper>Use este valor como &quot;Verify Token&quot; na configuração do webhook na Meta.</Helper>
            </FormRow>
            <div style={{ marginTop: 12 }}>
              <SecondaryButton type="button" onClick={handleRegenerateToken} disabled={saving}>
                <RefreshCw size={18} />
                Regenerar token
              </SecondaryButton>
            </div>
          </Card>
        )}

        <Card>
          <CardTitle>Status</CardTitle>
          <StatusGrid>
            {config ? (
              <>
                <StatusItem>
                  <span>Integração</span>
                  <Badge $active={config.isActive}>{config.isActive ? 'Ativa' : 'Inativa'}</Badge>
                </StatusItem>
                <StatusItem>
                  <span>Sincronização de leads</span>
                  <Badge $active={config.syncLeads}>
                    {config.syncLeads ? 'Ativa' : 'Inativa'}
                  </Badge>
                </StatusItem>
                <StatusItem>
                  <span>Página conectada</span>
                  <span style={{ color: 'inherit', fontWeight: 500 }}>
                    {config.instagramPageName || config.instagramPageId || 'Não configurada'}
                  </span>
                </StatusItem>
                <Divider />
                <Helper style={{ margin: 0 }}>
                  Criado em {new Date(config.createdAt).toLocaleDateString('pt-BR')} · Atualizado em{' '}
                  {new Date(config.updatedAt).toLocaleDateString('pt-BR')}
                </Helper>
              </>
            ) : (
              <Helper>Nenhuma configuração encontrada. Preencha os dados e salve.</Helper>
            )}
          </StatusGrid>
        </Card>
      </ConfigProvider>
    </SectionWrapper>
  );
};

export default InstagramConfigSection;
