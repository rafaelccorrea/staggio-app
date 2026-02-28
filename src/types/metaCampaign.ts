/**
 * Tipos TypeScript para integração Campanha META (Facebook/Instagram)
 */

/** Sugestões de otimização para nova campanha (IA com base em campanhas anteriores) */
export interface MetaCampaignAiSuggestions {
  objective?: string;
  dailyBudgetReais?: number;
  headlineSuggestion?: string;
  messageSuggestion?: string;
  cta?: string;
  specialAdCategory?: string;
  summary?: string;
}

export interface MetaCampaignConfig {
  id?: string;
  companyId?: string;
  isActive: boolean;
  /** Token de acesso da API de Marketing da Meta */
  accessToken?: string;
  /** ID da conta de anúncios (act_XXXXX) - legado, preferir adAccounts */
  adAccountId?: string;
  /** Múltiplas contas de anúncios (id + nome) */
  adAccounts?: { id: string; name?: string }[];
  /** Nome da página/conta conectada */
  businessName?: string;
  /** Sincronizar leads das campanhas com o CRM */
  syncLeads?: boolean;
  /** Funil padrão para leads */
  kanbanProjectId?: string | null;
  /** Responsável padrão para leads */
  responsibleUserId?: string | null;
  /** Token para validar acesso à URL do webhook de leads (único por empresa) */
  webhookToken?: string | null;
  /** Token de verificação do webhook na Meta (cada empresa define o seu; campo "Verify token" na Meta) */
  webhookVerifyToken?: string | null;
  /** E-mail para receber notificação quando uma campanha agendada for criada na Meta (opcional) */
  scheduledCampaignNotifyEmail?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMetaCampaignConfigRequest {
  accessToken?: string;
  adAccountId?: string;
  /** Múltiplas contas de anúncios (id + nome). Enviar este campo para salvar várias contas. */
  adAccounts?: { id: string; name?: string }[];
  businessName?: string;
  syncLeads?: boolean;
  isActive?: boolean;
  kanbanProjectId?: string | null;
  responsibleUserId?: string | null;
  /** Token de verificação do webhook na Meta (campo "Verify token"). Cada empresa pode definir o seu. */
  webhookVerifyToken?: string | null;
  /** E-mail para receber notificação quando uma campanha agendada for criada na Meta (opcional). */
  scheduledCampaignNotifyEmail?: string | null;
}

export interface UpdateMetaCampaignConfigRequest {
  accessToken?: string;
  adAccountId?: string;
  adAccounts?: { id: string; name?: string }[];
  businessName?: string;
  syncLeads?: boolean;
  isActive?: boolean;
  kanbanProjectId?: string | null;
  responsibleUserId?: string | null;
  webhookVerifyToken?: string | null;
  scheduledCampaignNotifyEmail?: string | null;
}

/** Item da lista de campanhas agendadas (criadas pelo sistema, pendentes ou com erro) */
export interface ScheduledMetaCampaignItem {
  id: string;
  adAccountId: string;
  name: string;
  objective: string;
  status: string;
  specialAdCategories: string;
  runAt: string;
  /** Data/hora de fim da veiculação na Meta (opcional) */
  runEndAt?: string | null;
  /** Orçamento diário em reais (para cálculo de total e ao processar) */
  dailyBudgetReais?: number | null;
  createdAt: string;
  processedAt: string | null;
  metaCampaignId: string | null;
  errorMessage: string | null;
  /** URL da imagem do criativo (S3) para exibição na lista */
  creativeImageUrl?: string | null;
  /** URL do vídeo do criativo (S3) para exibição na lista */
  creativeVideoUrl?: string | null;
}

/** Campanha retornada pela API Meta (com conta de origem e métricas quando solicitado) */
export interface MetaCampaignItem {
  id: string;
  name: string;
  status?: string;
  effective_status?: string;
  objective?: string;
  created_time?: string;
  special_ad_categories?: string[];
  buying_type?: string;
  /** ID da conta de anúncios (act_XXXXX) de onde veio a campanha */
  adAccountId?: string;
  /** Nome da conta de anúncios */
  adAccountName?: string;
  /** Métricas (quando solicitado com ?insights=1) */
  impressions?: number;
  reach?: number;
  clicks?: number;
  spend?: number;
  leads?: number;
}

/** Configuração de redirecionamento: campanha → funil + responsável */
export interface MetaCampaignRedirectConfig {
  id: string;
  metaCampaignId: string;
  metaCampaignName?: string;
  adAccountId?: string;
  kanbanProjectId: string;
  kanbanProject?: { id: string; name: string } | null;
  responsibleUserId?: string | null;
  responsibleUser?: { id: string; name: string; email: string } | null;
  /** IDs das tags a aplicar à tarefa ao criar lead (automação pós-lead) */
  postLeadTagIds?: string[] | null;
  /** Nota ou mensagem automática na descrição da tarefa ao criar lead */
  postLeadNote?: string | null;
}

export interface UpsertMetaCampaignRedirectRequest {
  metaCampaignId: string;
  metaCampaignName?: string;
  adAccountId?: string;
  kanbanProjectId: string;
  responsibleUserId?: string | null;
  postLeadTagIds?: string[] | null;
  postLeadNote?: string | null;
}

/** Estatísticas de leads capturados no CRM (origem Meta) */
export interface MetaCrmLeadsStats {
  total: number;
  byCampaign: { metaCampaignId: string; campaignName: string; count: number }[];
  byMonth: { year: number; month: number; monthLabel: string; count: number }[];
}

/** Lead da Meta (tarefa no CRM com metaCampaignId) */
export interface MetaLeadItem {
  id: string;
  title: string;
  metaCampaignId: string | null;
  campaign: string | null;
  source: string | null;
  createdAt: string;
  projectId: string | null;
  projectName: string | null;
  columnId: string;
}

export interface MetaLeadsListResponse {
  data: MetaLeadItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MetaLeadgenFormItem {
  formId: string;
  leadCount: number;
}

export interface MetaRoasItem {
  metaCampaignId: string;
  campaignName: string;
  spend: number;
  revenue: number;
  roas: number;
}

export interface MetaAdSetItem {
  id: string;
  name: string;
  status?: string;
  effective_status?: string;
}

/** Criativo do anúncio (imagem, texto, título) vindo da Meta */
export interface MetaAdCreative {
  id: string;
  name?: string;
  body?: string;
  title?: string;
  thumbnail_url?: string;
  image_url?: string;
  /** URL do vídeo para reprodução (quando disponível) */
  video_url?: string;
  /** Especificação do story (permite detectar anúncio em vídeo) */
  object_story_spec?: { video_data?: { video_id?: string } };
}

export interface MetaAdItem {
  id: string;
  name: string;
  status?: string;
  effective_status?: string;
  creative?: MetaAdCreative;
}

/** Registro de lead recebido via webhook (log para admin/SDR) */
export interface MetaLeadWebhookLogItem {
  id: string;
  companyId: string;
  leadgenId: string;
  metaCampaignId: string;
  metaCampaignName: string | null;
  metaFormId: string | null;
  leadTitle: string | null;
  leadEmail: string | null;
  leadPhone: string | null;
  kanbanTaskId: string | null;
  status: 'task_created' | 'no_redirect' | 'task_failed' | 'no_details';
  metaCreatedTime: number | null;
  createdAt: string;
}

export interface MetaLeadWebhookLogResponse {
  data: MetaLeadWebhookLogItem[];
  total: number;
  page: number;
  limit: number;
}
