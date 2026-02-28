import { api } from './api';

export interface SDRSettings {
  id: string;
  companyId: string;
  
  // Configurações Gerais
  enabled: boolean;
  autoRespond: boolean;
  responseDelaySeconds: number;
  
  // Gestão de Leads
  canCreateLead: boolean;
  canUpdateLeadStatus: boolean;
  canAddLeadNote: boolean;
  canAssignLead: boolean;
  canAddToFunnel: boolean;
  
  // Gestão de Visitas
  canScheduleVisit: boolean;
  canRescheduleVisit: boolean;
  canCancelVisit: boolean;
  canAddVisitFeedback: boolean;
  requireVisitConfirmation: boolean;
  
  // Comunicação
  canSendWhatsapp: boolean;
  canSendEmail: boolean;
  canSendSms: boolean;
  canSendPropertyBrochure: boolean;
  
  // Documentação
  canGenerateProposal: boolean;
  canRequestDocuments: boolean;
  
  // Follow-ups e Lembretes
  canScheduleFollowup: boolean;
  canSendReminders: boolean;
  autoFollowupDays: number;
  
  // Inteligência de Negócio
  canRecommendProperties: boolean;
  canCalculateFinancing: boolean;
  canCompareProperties: boolean;
  canProvideNeighborhoodInfo: boolean;
  
  // Limites e Restrições
  maxPropertiesPerSearch: number;
  maxMessagesPerDay: number;
  maxVisitsPerDay: number;
  
  // Horários de Operação
  businessHoursStart: string;
  businessHoursEnd: string;
  workOnWeekends: boolean;
  
  // Personalização
  greetingMessage: string;
  signature: string;
  tone: string;

  // IA e permissões (líder vs atendente)
  aiContextHours: number;
  reengagementEnabled: boolean;
  reengagementHours: number;
  phraseBlacklist?: string[];
  requireHandoffConfirmation: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateSDRSettingsDto {
  enabled?: boolean;
  autoRespond?: boolean;
  responseDelaySeconds?: number;
  canCreateLead?: boolean;
  canUpdateLeadStatus?: boolean;
  canAddLeadNote?: boolean;
  canAssignLead?: boolean;
  canAddToFunnel?: boolean;
  canScheduleVisit?: boolean;
  canRescheduleVisit?: boolean;
  canCancelVisit?: boolean;
  canAddVisitFeedback?: boolean;
  requireVisitConfirmation?: boolean;
  canSendWhatsapp?: boolean;
  canSendEmail?: boolean;
  canSendSms?: boolean;
  canSendPropertyBrochure?: boolean;
  canGenerateProposal?: boolean;
  canRequestDocuments?: boolean;
  canScheduleFollowup?: boolean;
  canSendReminders?: boolean;
  autoFollowupDays?: number;
  canRecommendProperties?: boolean;
  canCalculateFinancing?: boolean;
  canCompareProperties?: boolean;
  canProvideNeighborhoodInfo?: boolean;
  maxPropertiesPerSearch?: number;
  maxMessagesPerDay?: number;
  maxVisitsPerDay?: number;
  businessHoursStart?: string;
  businessHoursEnd?: string;
  workOnWeekends?: boolean;
  greetingMessage?: string;
  signature?: string;
  tone?: string;
  aiContextHours?: number;
  reengagementEnabled?: boolean;
  reengagementHours?: number;
  phraseBlacklist?: string[];
  requireHandoffConfirmation?: boolean;
}

/**
 * Valores padrão das configurações do SDR: somente responder e ⚙️ O que o sistema pode fazer sozinho (ambas opções:
 * criar cliente e criar tarefa no funil); o resto vem desabilitado.
 */
export function getDefaultSDRSettings(overrides?: Partial<SDRSettings>): SDRSettings {
  const now = new Date();
  return {
    id: '',
    companyId: '',
    enabled: true,
    autoRespond: true,
    responseDelaySeconds: 8,
    canCreateLead: true,
    canUpdateLeadStatus: false,
    canAddLeadNote: false,
    canAssignLead: false,
    canAddToFunnel: true,
    canScheduleVisit: false,
    canRescheduleVisit: false,
    canCancelVisit: false,
    canAddVisitFeedback: false,
    requireVisitConfirmation: false,
    canSendWhatsapp: false,
    canSendEmail: false,
    canSendSms: false,
    canSendPropertyBrochure: false,
    canGenerateProposal: false,
    canRequestDocuments: false,
    canScheduleFollowup: false,
    canSendReminders: false,
    autoFollowupDays: 7,
    canRecommendProperties: false,
    canCalculateFinancing: false,
    canCompareProperties: false,
    canProvideNeighborhoodInfo: false,
    maxPropertiesPerSearch: 3,
    maxMessagesPerDay: 20,
    maxVisitsPerDay: 3,
    businessHoursStart: '08:00:00',
    businessHoursEnd: '18:00:00',
    workOnWeekends: false,
    greetingMessage: '',
    signature: '',
    tone: 'professional',
    aiContextHours: 24,
    reengagementEnabled: false,
    reengagementHours: 24,
    phraseBlacklist: [],
    requireHandoffConfirmation: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

const sdrSettingsService = {
  /**
   * Obter configurações do SDR
   */
  getSettings: async (): Promise<SDRSettings> => {
    const response = await api.get('/sdr-settings');
    return response.data;
  },

  /**
   * Atualizar configurações do SDR
   */
  updateSettings: async (data: UpdateSDRSettingsDto): Promise<SDRSettings> => {
    const response = await api.put('/sdr-settings', data);
    return response.data;
  },

  /**
   * Resetar configurações para padrão.
   * Backend retorna 403 se o usuário não for líder SDR nem admin/master/manager.
   */
  resetSettings: async (): Promise<SDRSettings> => {
    const response = await api.post('/sdr-settings/reset');
    return response.data;
  },
};

export default sdrSettingsService;
