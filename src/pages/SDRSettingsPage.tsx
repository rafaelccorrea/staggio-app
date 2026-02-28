import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MdSave, MdRestore } from 'react-icons/md';
import { createPortal } from 'react-dom';
import { Layout } from '../components/layout/Layout';
import {
  PageHeader,
  PageTitle,
  PageTitleContainer,
  ContentCard,
  FieldInput,
  FieldSelect,
  FieldTextarea,
  FieldContainer,
  Button,
} from '../styles/components/PageStyles';
import sdrSettingsService, { getDefaultSDRSettings } from '../services/sdrSettingsService';
import type { SDRSettings, UpdateSDRSettingsDto } from '../services/sdrSettingsService';
import { SDRSettingsShimmer } from '../components/shimmer/SDRSettingsShimmer';
import styled from 'styled-components';

/** Container que ocupa toda a largura até as margens do MainScrollArea (sem max-width). */
const SDRPageContainer = styled.div`
  width: 100%;
  padding: 24px 0 32px;
  min-height: calc(100vh - 70px);
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};

  @media (max-width: 768px) {
    padding: 20px 0 28px;
  }

  @media (max-width: 480px) {
    padding: 16px 0 24px;
  }
`;

const clamp = (n: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, n));

const SDRSettingsPage = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<SDRSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await sdrSettingsService.getSettings();
      const validTones = ['professional', 'friendly', 'casual'];
      const normalizedTone = validTones.includes(data.tone) ? data.tone : 'professional';
      const normalized = {
        ...data,
        responseDelaySeconds: Math.max(8, data.responseDelaySeconds ?? 8),
        maxPropertiesPerSearch: Math.min(12, Math.max(1, data.maxPropertiesPerSearch ?? 3)),
        maxMessagesPerDay: Math.min(50, Math.max(1, data.maxMessagesPerDay ?? 20)),
        maxVisitsPerDay: Math.min(10, Math.max(1, data.maxVisitsPerDay ?? 3)),
        autoFollowupDays: Math.min(30, Math.max(1, data.autoFollowupDays ?? 7)),
        tone: normalizedTone,
        aiContextHours: Math.min(168, Math.max(1, data.aiContextHours ?? 24)),
        reengagementEnabled: data.reengagementEnabled ?? false,
        reengagementHours: Math.min(168, Math.max(1, data.reengagementHours ?? 24)),
        phraseBlacklist: Array.isArray(data.phraseBlacklist) ? data.phraseBlacklist : [],
        requireHandoffConfirmation: data.requireHandoffConfirmation ?? false,
      };
      setSettings(normalized);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setSettings(getDefaultSDRSettings());
      } else {
        console.error('Erro ao carregar configurações:', error);
        toast.error(error.response?.data?.message || 'Erro ao carregar configurações do SDR');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const updateDto: UpdateSDRSettingsDto = {
        enabled: settings.enabled,
        autoRespond: settings.autoRespond,
        responseDelaySeconds: settings.responseDelaySeconds,
        canCreateLead: settings.canCreateLead,
        canUpdateLeadStatus: settings.canUpdateLeadStatus,
        canAddLeadNote: settings.canAddLeadNote,
        canAssignLead: settings.canAssignLead,
        canAddToFunnel: settings.canAddToFunnel,
        canScheduleVisit: settings.canScheduleVisit,
        canRescheduleVisit: settings.canRescheduleVisit,
        canCancelVisit: settings.canCancelVisit,
        canAddVisitFeedback: settings.canAddVisitFeedback,
        requireVisitConfirmation: settings.requireVisitConfirmation,
        canSendWhatsapp: settings.canSendWhatsapp,
        canSendEmail: settings.canSendEmail,
        canSendSms: settings.canSendSms,
        canSendPropertyBrochure: settings.canSendPropertyBrochure,
        canGenerateProposal: settings.canGenerateProposal,
        canRequestDocuments: settings.canRequestDocuments,
        canScheduleFollowup: settings.canScheduleFollowup,
        canSendReminders: settings.canSendReminders,
        autoFollowupDays: settings.autoFollowupDays,
        canRecommendProperties: settings.canRecommendProperties,
        canCalculateFinancing: settings.canCalculateFinancing,
        canCompareProperties: settings.canCompareProperties,
        canProvideNeighborhoodInfo: settings.canProvideNeighborhoodInfo,
        maxPropertiesPerSearch: settings.maxPropertiesPerSearch,
        maxMessagesPerDay: settings.maxMessagesPerDay,
        maxVisitsPerDay: settings.maxVisitsPerDay,
        businessHoursStart: settings.businessHoursStart,
        businessHoursEnd: settings.businessHoursEnd,
        workOnWeekends: settings.workOnWeekends,
        greetingMessage: settings.greetingMessage,
        signature: settings.signature,
        tone: settings.tone,
        aiContextHours: settings.aiContextHours,
        reengagementEnabled: settings.reengagementEnabled,
        reengagementHours: settings.reengagementHours,
        phraseBlacklist: settings.phraseBlacklist,
        requireHandoffConfirmation: settings.requireHandoffConfirmation,
      };

      const updated = await sdrSettingsService.updateSettings(updateDto);
      setSettings(updated);
      toast.success('Configurações salvas com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error);
      const msg =
        error.response?.data?.message ||
        (error.response?.status === 403
          ? 'Apenas o líder SDR ou administrador pode alterar as configurações do SDR.'
          : 'Erro ao salvar configurações do SDR');
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleResetClick = () => setShowResetConfirm(true);

  const handleResetConfirm = async () => {
    setShowResetConfirm(false);
    const defaultSettings = getDefaultSDRSettings();
    try {
      setSaving(true);
      const updateDto: UpdateSDRSettingsDto = {
        enabled: defaultSettings.enabled,
        autoRespond: defaultSettings.autoRespond,
        responseDelaySeconds: defaultSettings.responseDelaySeconds,
        canCreateLead: defaultSettings.canCreateLead,
        canUpdateLeadStatus: defaultSettings.canUpdateLeadStatus,
        canAddLeadNote: defaultSettings.canAddLeadNote,
        canAssignLead: defaultSettings.canAssignLead,
        canAddToFunnel: defaultSettings.canAddToFunnel,
        canScheduleVisit: defaultSettings.canScheduleVisit,
        canRescheduleVisit: defaultSettings.canRescheduleVisit,
        canCancelVisit: defaultSettings.canCancelVisit,
        canAddVisitFeedback: defaultSettings.canAddVisitFeedback,
        requireVisitConfirmation: defaultSettings.requireVisitConfirmation,
        canSendWhatsapp: defaultSettings.canSendWhatsapp,
        canSendEmail: defaultSettings.canSendEmail,
        canSendSms: defaultSettings.canSendSms,
        canSendPropertyBrochure: defaultSettings.canSendPropertyBrochure,
        canGenerateProposal: defaultSettings.canGenerateProposal,
        canRequestDocuments: defaultSettings.canRequestDocuments,
        canScheduleFollowup: defaultSettings.canScheduleFollowup,
        canSendReminders: defaultSettings.canSendReminders,
        autoFollowupDays: defaultSettings.autoFollowupDays,
        canRecommendProperties: defaultSettings.canRecommendProperties,
        canCalculateFinancing: defaultSettings.canCalculateFinancing,
        canCompareProperties: defaultSettings.canCompareProperties,
        canProvideNeighborhoodInfo: defaultSettings.canProvideNeighborhoodInfo,
        maxPropertiesPerSearch: defaultSettings.maxPropertiesPerSearch,
        maxMessagesPerDay: defaultSettings.maxMessagesPerDay,
        maxVisitsPerDay: defaultSettings.maxVisitsPerDay,
        businessHoursStart: defaultSettings.businessHoursStart,
        businessHoursEnd: defaultSettings.businessHoursEnd,
        workOnWeekends: defaultSettings.workOnWeekends,
        greetingMessage: defaultSettings.greetingMessage,
        signature: defaultSettings.signature,
        tone: defaultSettings.tone,
        aiContextHours: defaultSettings.aiContextHours,
        reengagementEnabled: defaultSettings.reengagementEnabled,
        reengagementHours: defaultSettings.reengagementHours,
        phraseBlacklist: defaultSettings.phraseBlacklist,
        requireHandoffConfirmation: defaultSettings.requireHandoffConfirmation,
      };
      const updated = await sdrSettingsService.updateSettings(updateDto);
      setSettings(updated);
      toast.success('Configurações resetadas para os valores padrão!');
    } catch (error: any) {
      console.error('Erro ao resetar configurações:', error);
      const msg =
        error.response?.data?.message ||
        (error.response?.status === 403
          ? 'Apenas o líder SDR ou administrador pode resetar as configurações.'
          : 'Erro ao resetar configurações do SDR');
      toast.error(msg);
      setSettings(defaultSettings);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof SDRSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  const updateNumberField = (
    field: keyof SDRSettings,
    value: number,
    min: number,
    max: number
  ) => {
    if (!settings) return;
    const clamped = clamp(value, min, max);
    if (Number.isNaN(clamped)) return;
    setSettings({ ...settings, [field]: clamped });
  };

  if (loading) {
    return (
      <Layout>
        <SDRPageContainer>
          <SDRSettingsShimmer />
        </SDRPageContainer>
      </Layout>
    );
  }

  if (!settings) {
    return (
      <Layout>
        <SDRPageContainer>
          <PageHeader>
            <PageTitle>Configurações do SDR com IA</PageTitle>
          </PageHeader>
          <ContentCard>
            <p style={{ marginBottom: 16 }}>Erro ao carregar configurações.</p>
            <Button className="primary" onClick={() => loadSettings()} disabled={loading}>
              Tentar novamente
            </Button>
          </ContentCard>
        </SDRPageContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <SDRPageContainer>
        <PageHeader>
          <PageTitleContainer>
            <PageTitle>Configurações do SDR com IA</PageTitle>
            <PageSubtitle>
              Defina o que o assistente com IA pode fazer no atendimento ao lead: resposta automática, criação de cliente ou tarefa, gestão de leads e visitas, comunicação, limites de uso e tom de voz.
            </PageSubtitle>
          </PageTitleContainer>
          <ButtonGroup>
            <Button className="secondary" onClick={handleResetClick} disabled={saving}>
              <MdRestore size={20} />
              Resetar Padrão
            </Button>
            <Button className="primary" onClick={handleSave} disabled={saving}>
              <MdSave size={20} />
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </ButtonGroup>
        </PageHeader>

        {/* Configurações Gerais */}
        <SectionCard>
          <SectionTitle>⚙️ Configurações Gerais</SectionTitle>
          <SectionSubtitle>Ative ou desative o SDR e defina se ele pode responder automaticamente e com qual atraso mínimo entre respostas.</SectionSubtitle>
          <SettingRow>
            <SettingLabel>
              <CheckboxInput
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => updateField('enabled', e.target.checked)}
              />
              <span>SDR Ativado</span>
            </SettingLabel>
            <SettingDescription>
              Ativa ou desativa completamente o SDR com IA
            </SettingDescription>
          </SettingRow>

          <SettingRow>
            <SettingLabel>
              <CheckboxInput
                type="checkbox"
                checked={settings.autoRespond}
                onChange={(e) => updateField('autoRespond', e.target.checked)}
                disabled={!settings.enabled}
              />
              <span>Resposta Automática</span>
            </SettingLabel>
            <SettingDescription>
              Permite que o SDR responda automaticamente as mensagens
            </SettingDescription>
          </SettingRow>

          <SettingRow>
            <FieldContainer>
              <SettingLabel as="div" style={{ marginBottom: 8 }}>
                <span>Atraso de Resposta (segundos)</span>
              </SettingLabel>
              <FieldInput
                type="number"
                min={8}
                max={60}
                value={settings.responseDelaySeconds}
                onChange={(e) =>
                  updateNumberField(
                    'responseDelaySeconds',
                    parseInt(e.target.value, 10) || 8,
                    8,
                    60
                  )
                }
                disabled={!settings.enabled}
                style={{ maxWidth: 120 }}
              />
            </FieldContainer>
            <SettingDescription>
              Tempo de espera antes de enviar a resposta (8–60 segundos). Mínimo 8s para evitar gargalos.
            </SettingDescription>
          </SettingRow>
        </SectionCard>

        {/* O que o sistema pode fazer sozinho */}
        <SectionCard>
          <SectionTitle>⚙️ O que o sistema pode fazer sozinho</SectionTitle>
          <SectionSubtitle>Ações que a IA executa sem intervenção humana: criar cliente ou tarefa no funil ao receber uma mensagem.</SectionSubtitle>
          <SettingRow>
            <SettingLabel>
              <CheckboxInput
                checked={settings.canCreateLead}
                onChange={(e) => updateField('canCreateLead', e.target.checked)}
                disabled={!settings.enabled}
              />
              <span>Criar cliente automaticamente</span>
            </SettingLabel>
            <SettingDescription>
              Se ativado, ao receber uma mensagem o sistema cria um cliente sozinho, usando os dados da conversa.
              Recomendado: deixar desativado para você decidir quando cadastrar cada cliente.
            </SettingDescription>
          </SettingRow>

          <SettingRow>
            <SettingLabel>
              <CheckboxInput
                checked={settings.canAddToFunnel}
                onChange={(e) => updateField('canAddToFunnel', e.target.checked)}
                disabled={!settings.enabled}
              />
              <span>Criar tarefa no funil automaticamente</span>
            </SettingLabel>
            <SettingDescription>
              Se ativado, ao receber uma mensagem o sistema cria uma tarefa no funil sozinho.
              Recomendado: deixar desativado para você decidir quando criar cada tarefa.
            </SettingDescription>
          </SettingRow>
        </SectionCard>

        {/* Gestão de Leads */}
        <SectionCard>
          <SectionTitle>👥 Gestão de Leads</SectionTitle>
          <SectionSubtitle>Permissões para o SDR alterar status, adicionar notas e atribuir leads a corretores.</SectionSubtitle>
          <SettingRow>
            <SettingLabel>
              <CheckboxInput
                checked={settings.canUpdateLeadStatus}
                onChange={(e) => updateField('canUpdateLeadStatus', e.target.checked)}
                disabled={!settings.enabled}
              />
              <span>Atualizar Status de Leads</span>
            </SettingLabel>
            <SettingDescription>
              Permite que o SDR atualize o status dos leads
            </SettingDescription>
          </SettingRow>

          <SettingRow>
            <SettingLabel>
              <CheckboxInput
                checked={settings.canAddLeadNote}
                onChange={(e) => updateField('canAddLeadNote', e.target.checked)}
                disabled={!settings.enabled}
              />
              <span>Adicionar Notas</span>
            </SettingLabel>
            <SettingDescription>
              Permite que o SDR adicione notas aos leads
            </SettingDescription>
          </SettingRow>

          <SettingRow>
            <SettingLabel>
              <CheckboxInput
                checked={settings.canAssignLead}
                onChange={(e) => updateField('canAssignLead', e.target.checked)}
                disabled={!settings.enabled}
              />
              <span>Atribuir Leads</span>
            </SettingLabel>
            <SettingDescription>
              Permite que o SDR atribua leads a corretores
            </SettingDescription>
          </SettingRow>
        </SectionCard>

        {/* Gestão de Visitas */}
        <SectionCard>
          <SectionTitle>📅 Gestão de Visitas</SectionTitle>
          <SectionSubtitle>O que o SDR pode fazer em relação a agendamento, reagendamento, cancelamento e feedback de visitas.</SectionSubtitle>
          <SettingRow>
            <SettingLabel>
              <CheckboxInput
                checked={settings.canScheduleVisit}
                onChange={(e) => updateField('canScheduleVisit', e.target.checked)}
                disabled={!settings.enabled}
              />
              <span>Agendar Visitas</span>
            </SettingLabel>
            <SettingDescription>
              Permite que o SDR agende visitas aos imóveis
            </SettingDescription>
          </SettingRow>

          <SettingRow>
            <SettingLabel>
              <CheckboxInput
                checked={settings.canRescheduleVisit}
                onChange={(e) => updateField('canRescheduleVisit', e.target.checked)}
                disabled={!settings.enabled}
              />
              <span>Reagendar Visitas</span>
            </SettingLabel>
            <SettingDescription>
              Permite que o SDR reagende visitas existentes
            </SettingDescription>
          </SettingRow>

          <SettingRow>
            <SettingLabel>
              <CheckboxInput
                checked={settings.canCancelVisit}
                onChange={(e) => updateField('canCancelVisit', e.target.checked)}
                disabled={!settings.enabled}
              />
              <span>Cancelar Visitas</span>
            </SettingLabel>
            <SettingDescription>
              Permite que o SDR cancele visitas
            </SettingDescription>
          </SettingRow>

          <SettingRow>
            <SettingLabel>
              <CheckboxInput
                checked={settings.requireVisitConfirmation}
                onChange={(e) => updateField('requireVisitConfirmation', e.target.checked)}
                disabled={!settings.enabled}
              />
              <span>Exigir Confirmação</span>
            </SettingLabel>
            <SettingDescription>
              Exige confirmação do cliente antes de agendar visita
            </SettingDescription>
          </SettingRow>
        </SectionCard>

        {/* Comunicação */}
        <SectionCard>
          <SectionTitle>💬 Comunicação</SectionTitle>
          <SectionSubtitle>Canais e tipos de mensagem que o SDR pode enviar: WhatsApp, e-mail, SMS e folhetos de imóveis.</SectionSubtitle>
          <SettingRow>
            <SettingLabel>
              <CheckboxInput
                checked={settings.canSendWhatsapp}
                onChange={(e) => updateField('canSendWhatsapp', e.target.checked)}
                disabled={!settings.enabled}
              />
              <span>Enviar WhatsApp</span>
            </SettingLabel>
            <SettingDescription>
              Permite que o SDR envie mensagens via WhatsApp
            </SettingDescription>
          </SettingRow>

          <SettingRow>
            <SettingLabel>
              <CheckboxInput
                checked={settings.canSendEmail}
                onChange={(e) => updateField('canSendEmail', e.target.checked)}
                disabled={!settings.enabled}
              />
              <span>Enviar Email</span>
            </SettingLabel>
            <SettingDescription>
              Permite que o SDR envie emails
            </SettingDescription>
          </SettingRow>

          <SettingRow>
            <SettingLabel>
              <CheckboxInput
                checked={settings.canSendSms}
                onChange={(e) => updateField('canSendSms', e.target.checked)}
                disabled={!settings.enabled}
              />
              <span>Enviar SMS</span>
            </SettingLabel>
            <SettingDescription>
              Permite que o SDR envie SMS
            </SettingDescription>
          </SettingRow>

          <SettingRow>
            <SettingLabel>
              <CheckboxInput
                checked={settings.canSendPropertyBrochure}
                onChange={(e) => updateField('canSendPropertyBrochure', e.target.checked)}
                disabled={!settings.enabled}
              />
              <span>Enviar Folhetos de Imóveis</span>
            </SettingLabel>
            <SettingDescription>
              Permite que o SDR envie folhetos de imóveis
            </SettingDescription>
          </SettingRow>
        </SectionCard>

        {/* Follow-ups e Lembretes */}
        <SectionCard>
          <SectionTitle>🔔 Follow-ups e Lembretes</SectionTitle>
          <SectionSubtitle>Follow-ups automáticos e lembretes que o SDR pode agendar e enviar, e em quantos dias após o último contato.</SectionSubtitle>
          <SettingRow>
            <SettingLabel>
              <CheckboxInput
                checked={settings.canScheduleFollowup}
                onChange={(e) => updateField('canScheduleFollowup', e.target.checked)}
                disabled={!settings.enabled}
              />
              <span>Agendar Follow-ups</span>
            </SettingLabel>
            <SettingDescription>
              Permite que o SDR agende follow-ups automáticos
            </SettingDescription>
          </SettingRow>

          <SettingRow>
            <SettingLabel>
              <CheckboxInput
                checked={settings.canSendReminders}
                onChange={(e) => updateField('canSendReminders', e.target.checked)}
                disabled={!settings.enabled}
              />
              <span>Enviar Lembretes</span>
            </SettingLabel>
            <SettingDescription>
              Permite que o SDR envie lembretes automáticos
            </SettingDescription>
          </SettingRow>

          <SettingRow>
            <FieldContainer>
              <SettingLabel as="div" style={{ marginBottom: 8 }}>
                <span>Dias para Follow-up Automático</span>
              </SettingLabel>
              <FieldInput
                type="number"
                min={1}
                max={30}
                value={settings.autoFollowupDays}
                onChange={(e) =>
                  updateNumberField(
                    'autoFollowupDays',
                    parseInt(e.target.value, 10) || 1,
                    1,
                    30
                  )
                }
                disabled={!settings.enabled}
                style={{ maxWidth: 120 }}
              />
            </FieldContainer>
            <SettingDescription>
              Número de dias após o último contato (1–30)
            </SettingDescription>
          </SettingRow>
        </SectionCard>

        {/* Inteligência de Negócio */}
        <SectionCard>
          <SectionTitle>🧠 Inteligência de Negócio</SectionTitle>
          <SectionSubtitle>Recursos de recomendação de imóveis, simulação de financiamento, comparação de imóveis e informações sobre bairros.</SectionSubtitle>
          <SettingRow>
            <SettingLabel>
              <CheckboxInput
                checked={settings.canRecommendProperties}
                onChange={(e) => updateField('canRecommendProperties', e.target.checked)}
                disabled={!settings.enabled}
              />
              <span>Recomendar Imóveis</span>
            </SettingLabel>
            <SettingDescription>
              Permite que o SDR recomende imóveis baseado no perfil do cliente
            </SettingDescription>
          </SettingRow>

          <SettingRow>
            <SettingLabel>
              <CheckboxInput
                checked={settings.canCalculateFinancing}
                onChange={(e) => updateField('canCalculateFinancing', e.target.checked)}
                disabled={!settings.enabled}
              />
              <span>Calcular Financiamento</span>
            </SettingLabel>
            <SettingDescription>
              Permite que o SDR calcule simulações de financiamento
            </SettingDescription>
          </SettingRow>

          <SettingRow>
            <SettingLabel>
              <CheckboxInput
                checked={settings.canCompareProperties}
                onChange={(e) => updateField('canCompareProperties', e.target.checked)}
                disabled={!settings.enabled}
              />
              <span>Comparar Imóveis</span>
            </SettingLabel>
            <SettingDescription>
              Permite que o SDR compare diferentes imóveis
            </SettingDescription>
          </SettingRow>

          <SettingRow>
            <SettingLabel>
              <CheckboxInput
                checked={settings.canProvideNeighborhoodInfo}
                onChange={(e) => updateField('canProvideNeighborhoodInfo', e.target.checked)}
                disabled={!settings.enabled}
              />
              <span>Informações de Bairro</span>
            </SettingLabel>
            <SettingDescription>
              Permite que o SDR forneça informações sobre bairros
            </SettingDescription>
          </SettingRow>
        </SectionCard>

        {/* Limites e Restrições */}
        <SectionCard>
          <SectionTitle>⚠️ Limites e Restrições</SectionTitle>
          <SectionSubtitle>Teto de imóveis por busca, mensagens por dia e visitas por dia para evitar uso excessivo e gargalos.</SectionSubtitle>
          <SettingRow>
            <FieldContainer>
              <SettingLabel as="div" style={{ marginBottom: 8 }}>
                <span>Máximo de Imóveis por Busca</span>
              </SettingLabel>
              <FieldInput
                type="number"
                min={1}
                max={12}
                value={settings.maxPropertiesPerSearch}
                onChange={(e) =>
                  updateNumberField(
                    'maxPropertiesPerSearch',
                    parseInt(e.target.value, 10) || 1,
                    1,
                    12
                  )
                }
                disabled={!settings.enabled}
                style={{ maxWidth: 120 }}
              />
            </FieldContainer>
            <SettingDescription>Entre 1 e 12</SettingDescription>
          </SettingRow>

          <SettingRow>
            <FieldContainer>
              <SettingLabel as="div" style={{ marginBottom: 8 }}>
                <span>Máximo de Mensagens por Dia</span>
              </SettingLabel>
              <FieldInput
                type="number"
                min={1}
                max={50}
                value={settings.maxMessagesPerDay}
                onChange={(e) =>
                  updateNumberField(
                    'maxMessagesPerDay',
                    parseInt(e.target.value, 10) || 1,
                    1,
                    50
                  )
                }
                disabled={!settings.enabled}
                style={{ maxWidth: 120 }}
              />
            </FieldContainer>
            <SettingDescription>Entre 1 e 50</SettingDescription>
          </SettingRow>

          <SettingRow>
            <FieldContainer>
              <SettingLabel as="div" style={{ marginBottom: 8 }}>
                <span>Máximo de Visitas por Dia</span>
              </SettingLabel>
              <FieldInput
                type="number"
                min={1}
                max={10}
                value={settings.maxVisitsPerDay}
                onChange={(e) =>
                  updateNumberField(
                    'maxVisitsPerDay',
                    parseInt(e.target.value, 10) || 1,
                    1,
                    10
                  )
                }
                disabled={!settings.enabled}
                style={{ maxWidth: 120 }}
              />
            </FieldContainer>
            <SettingDescription>Entre 1 e 10</SettingDescription>
          </SettingRow>
        </SectionCard>

        {/* Personalização */}
        <SectionCard>
          <SectionTitle>🎨 Personalização</SectionTitle>
          <SectionSubtitle>Mensagem de saudação, assinatura e tom de voz do assistente (profissional, amigável ou casual).</SectionSubtitle>
          <SettingRow>
            <FieldContainer>
              <SettingLabel as="div" style={{ marginBottom: 8 }}>
                <span>Mensagem de Saudação</span>
              </SettingLabel>
              <FieldTextarea
                value={settings.greetingMessage || ''}
                onChange={(e) => updateField('greetingMessage', e.target.value.slice(0, 500))}
                disabled={!settings.enabled}
                placeholder="Ex: Olá! Sou o assistente virtual da Intellisys. Como posso ajudar você hoje?"
                rows={3}
                maxLength={500}
              />
            </FieldContainer>
          </SettingRow>

          <SettingRow>
            <FieldContainer>
              <SettingLabel as="div" style={{ marginBottom: 8 }}>
                <span>Assinatura</span>
              </SettingLabel>
              <FieldTextarea
                value={settings.signature || ''}
                onChange={(e) => updateField('signature', e.target.value.slice(0, 200))}
                disabled={!settings.enabled}
                placeholder="Ex: Atenciosamente, Equipe Intellisys"
                rows={2}
                maxLength={200}
              />
            </FieldContainer>
          </SettingRow>

          <SettingRow>
            <FieldContainer>
              <SettingLabel as="div" style={{ marginBottom: 8 }}>
                <span>Tom de Voz</span>
              </SettingLabel>
              <FieldSelect
                value={settings.tone || 'professional'}
                onChange={(e) => updateField('tone', e.target.value)}
                disabled={!settings.enabled}
                style={{ maxWidth: 240 }}
              >
                <option value="professional">Profissional</option>
                <option value="friendly">Amigável</option>
                <option value="casual">Casual</option>
              </FieldSelect>
            </FieldContainer>
          </SettingRow>
        </SectionCard>

        {/* IA e contexto */}
        <SectionCard>
          <SectionTitle>🤖 IA e contexto</SectionTitle>
          <SectionSubtitle>Janela de contexto da conversa, reengajamento, blacklist de frases e confirmação antes de passar para atendente.</SectionSubtitle>
          <SettingRow>
            <FieldContainer>
              <SettingLabel as="div" style={{ marginBottom: 8 }}>
                <span>Janela de contexto (horas)</span>
              </SettingLabel>
              <FieldInput
                type="number"
                min={1}
                max={168}
                value={settings.aiContextHours}
                onChange={(e) =>
                  updateNumberField(
                    'aiContextHours',
                    parseInt(e.target.value, 10) || 24,
                    1,
                    168
                  )
                }
                disabled={!settings.enabled}
                style={{ maxWidth: 120 }}
              />
            </FieldContainer>
            <SettingDescription>
              Quantas horas da conversa a IA usa como contexto (1–168). Após esse tempo, trata como novo atendimento.
            </SettingDescription>
          </SettingRow>

          <SettingRow>
            <SettingLabel>
              <CheckboxInput
                type="checkbox"
                checked={settings.reengagementEnabled}
                onChange={(e) => updateField('reengagementEnabled', e.target.checked)}
                disabled={!settings.enabled}
              />
              <span>Reengajamento automático</span>
            </SettingLabel>
            <SettingDescription>
              Se ativado, mensagens de reengajamento podem ser enviadas após inatividade (quando implementado).
            </SettingDescription>
          </SettingRow>

          <SettingRow>
            <FieldContainer>
              <SettingLabel as="div" style={{ marginBottom: 8 }}>
                <span>Horas para reengajamento</span>
              </SettingLabel>
              <FieldInput
                type="number"
                min={1}
                max={168}
                value={settings.reengagementHours}
                onChange={(e) =>
                  updateNumberField(
                    'reengagementHours',
                    parseInt(e.target.value, 10) || 24,
                    1,
                    168
                  )
                }
                disabled={!settings.enabled || !settings.reengagementEnabled}
                style={{ maxWidth: 120 }}
              />
            </FieldContainer>
            <SettingDescription>
              Após quantas horas de inatividade considerar reengajamento (1–168).
            </SettingDescription>
          </SettingRow>

          <SettingRow>
            <FieldContainer>
              <SettingLabel as="div" style={{ marginBottom: 8 }}>
                <span>Blacklist de frases</span>
              </SettingLabel>
              <FieldTextarea
                value={(settings.phraseBlacklist || []).join('\n')}
                onChange={(e) => {
                  const lines = e.target.value.split('\n').map(s => s.trim()).filter(Boolean);
                  updateField('phraseBlacklist', lines);
                }}
                disabled={!settings.enabled}
                placeholder="Uma frase por linha. Mensagens da IA que contenham alguma delas serão bloqueadas."
                rows={3}
              />
            </FieldContainer>
            <SettingDescription>
              Frases que a IA não pode usar na resposta (uma por linha). Deixe vazio para não bloquear.
            </SettingDescription>
          </SettingRow>

          <SettingRow>
            <SettingLabel>
              <CheckboxInput
                type="checkbox"
                checked={settings.requireHandoffConfirmation}
                onChange={(e) => updateField('requireHandoffConfirmation', e.target.checked)}
                disabled={!settings.enabled}
              />
              <span>Exigir confirmação antes de passar para atendente</span>
            </SettingLabel>
            <SettingDescription>
              Se ativado, ao pedir atendente humano a IA pede confirmação antes de fazer o handoff (quando implementado).
            </SettingDescription>
          </SettingRow>
        </SectionCard>

        <ButtonGroup style={{ marginTop: '20px' }}>
          <Button className="secondary" onClick={handleResetClick} disabled={saving}>
            <MdRestore size={20} />
            Resetar Padrão
          </Button>
          <Button className="primary" onClick={handleSave} disabled={saving}>
            <MdSave size={20} />
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </ButtonGroup>

        {showResetConfirm &&
          createPortal(
            <ResetConfirmOverlay onClick={() => setShowResetConfirm(false)}>
              <ResetConfirmModal onClick={(e) => e.stopPropagation()}>
                <ResetConfirmIcon>
                  <MdRestore size={28} />
                </ResetConfirmIcon>
                <ResetConfirmTitle>Resetar configurações?</ResetConfirmTitle>
                <ResetConfirmMessage>
                  Todas as configurações do SDR serão restauradas para os valores padrão. Esta ação não pode ser desfeita.
                </ResetConfirmMessage>
                <ResetConfirmFooter>
                  <Button className="secondary" type="button" onClick={() => setShowResetConfirm(false)}>
                    Cancelar
                  </Button>
                  <Button className="primary" type="button" onClick={handleResetConfirm} disabled={saving}>
                    <MdRestore size={18} />
                    {saving ? 'Resetando...' : 'Resetar'}
                  </Button>
                </ResetConfirmFooter>
              </ResetConfirmModal>
            </ResetConfirmOverlay>,
            document.body
          )}
      </SDRPageContainer>
    </Layout>
  );
};

export default SDRSettingsPage;

// Styled Components
const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  & ${Button} {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
`;

const SectionCard = styled(ContentCard)`
  margin-bottom: 24px;
  background: ${(p) => p.theme.colors.cardBackground};
  border: 1px solid ${(p) => p.theme.colors.border};
  color: ${(p) => p.theme.colors.text};
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 6px;
  color: ${(p) => p.theme.colors.text};
  border-bottom: 2px solid ${(p) => p.theme.colors.border};
  padding-bottom: 10px;
`;

const SectionSubtitle = styled.p`
  font-size: 14px;
  color: ${(p) => p.theme.colors.textSecondary};
  margin: 0 0 20px 0;
  line-height: 1.5;
`;

const PageSubtitle = styled.p`
  font-size: 15px;
  color: ${(p) => p.theme.colors.textSecondary};
  margin: 8px 0 0 0;
  line-height: 1.5;
  max-width: 640px;
`;

const SettingRow = styled.div`
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid ${(p) => p.theme.colors.border};

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const SettingLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  color: ${(p) => p.theme.colors.text};
  margin-bottom: 8px;
  cursor: pointer;

  span {
    font-size: 16px;
  }
`;

const CheckboxInput = styled.input.attrs({ type: 'checkbox' })`
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: ${(p) => p.theme.colors.primary};
  background: ${(p) => p.theme.colors.cardBackground};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: 4px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SettingDescription = styled.p`
  font-size: 14px;
  color: ${(p) => p.theme.colors.textSecondary};
  margin: 4px 0 0 30px;
  line-height: 1.5;
`;

/* Modal de confirmação de reset */
const ResetConfirmOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: resetModalFade 0.2s ease;
  @keyframes resetModalFade {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ResetConfirmModal = styled.div`
  background: ${(p) => p.theme.colors.cardBackground};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: 16px;
  padding: 24px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.25);
  text-align: center;
  animation: resetModalSlide 0.25s ease;
  @keyframes resetModalSlide {
    from { opacity: 0; transform: scale(0.95) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
`;

const ResetConfirmIcon = styled.div`
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: ${(p) => p.theme.colors.primary}20;
  color: ${(p) => p.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ResetConfirmTitle = styled.h3`
  margin: 0 0 12px;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${(p) => p.theme.colors.text};
`;

const ResetConfirmMessage = styled.p`
  margin: 0 0 24px;
  font-size: 0.9375rem;
  color: ${(p) => p.theme.colors.textSecondary};
  line-height: 1.5;
`;

const ResetConfirmFooter = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;

  & ${Button} {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
`;
