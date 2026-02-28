'use client';
import { api } from './api';
import type {
  MetaCampaignConfig,
  MetaCampaignAiSuggestions,
  CreateMetaCampaignConfigRequest,
  UpdateMetaCampaignConfigRequest,
  MetaCampaignItem,
  MetaCampaignRedirectConfig,
  UpsertMetaCampaignRedirectRequest,
  MetaCrmLeadsStats,
  MetaLeadsListResponse,
  MetaLeadgenFormItem,
  MetaRoasItem,
  MetaAdSetItem,
  MetaAdItem,
  MetaLeadWebhookLogResponse,
  ScheduledMetaCampaignItem,
} from '../types/metaCampaign';

class MetaCampaignApiService {
  private baseUrl = '/integrations/meta-campaign';

  async getConfig(): Promise<MetaCampaignConfig | null> {
    try {
      const response = await api.get<MetaCampaignConfig>(
        `${this.baseUrl}/config`
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      console.error('❌ [MetaCampaignApi] Erro ao obter configuração:', error);
      throw this.handleError(error);
    }
  }

  async createOrUpdateConfig(
    data: CreateMetaCampaignConfigRequest
  ): Promise<MetaCampaignConfig> {
    try {
      const response = await api.put<MetaCampaignConfig>(
        `${this.baseUrl}/config`,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ [MetaCampaignApi] Erro ao salvar configuração:', error);
      throw this.handleError(error);
    }
  }

  async updateConfig(
    data: UpdateMetaCampaignConfigRequest
  ): Promise<MetaCampaignConfig> {
    try {
      const response = await api.patch<MetaCampaignConfig>(
        `${this.baseUrl}/config`,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error(
        '❌ [MetaCampaignApi] Erro ao atualizar configuração:',
        error
      );
      throw this.handleError(error);
    }
  }

  async getPages(): Promise<Array<{ id: string; name: string }>> {
    try {
      const response = await api.get<Array<{ id: string; name: string }>>(
        `${this.baseUrl}/pages`
      );
      return response.data ?? [];
    } catch (error: any) {
      console.error('❌ [MetaCampaignApi] Erro ao listar páginas:', error);
      return [];
    }
  }

  /** Sugestões de otimização para nova campanha com base em campanhas anteriores (IA). */
  async getOptimizationSuggestions(
    adAccountId?: string
  ): Promise<MetaCampaignAiSuggestions> {
    try {
      const params = new URLSearchParams();
      if (adAccountId) params.set('ad_account_id', adAccountId);
      const url = params.toString()
        ? `${this.baseUrl}/ai-optimize-suggestions?${params.toString()}`
        : `${this.baseUrl}/ai-optimize-suggestions`;
      const response = await api.get<MetaCampaignAiSuggestions>(url);
      return response.data ?? {};
    } catch {
      return {};
    }
  }

  /** Upload de imagem ou vídeo para S3. Retorna URL para usar no criativo. */
  async uploadCreativeMedia(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ url: string }>(
      `${this.baseUrl}/upload-creative-media`,
      formData,
      {
        maxBodyLength: 160 * 1024 * 1024,
        maxContentLength: 160 * 1024 * 1024,
        timeout: 120000,
      }
    );
    return response.data;
  }

  async createCampaign(payload: {
    adAccountId: string;
    name: string;
    objective: string;
    status?: string;
    special_ad_categories?: string;
    /** Responsável pelos leads desta campanha (opcional). Senão usa o da configuração de campanhas. */
    responsible_user_id?: string;
    scheduled_start_at?: string;
    campaign_start_at?: string;
    campaign_end_at?: string;
    create_ad_set?: boolean;
    ad_set_name?: string;
    daily_budget_reais?: number;
    creative_type?: 'image' | 'video';
    creative_page_id?: string;
    creative_image_url?: string;
    creative_video_url?: string;
    creative_message?: string;
    creative_headline?: string;
    creative_link?: string;
    creative_call_to_action?: string;
  }): Promise<
    | { id: string; adSetId?: string; creativeId?: string; adId?: string }
    | { scheduled: true; run_at: string }
  > {
    try {
      const response = await api.post<
        | { id: string; adSetId?: string; creativeId?: string; adId?: string }
        | { scheduled: true; run_at: string }
      >(`${this.baseUrl}/campaigns`, payload);
      return response.data;
    } catch (error: any) {
      console.error('❌ [MetaCampaignApi] Erro ao criar campanha:', error);
      throw this.handleError(error);
    }
  }

  async getScheduledCampaigns(params?: {
    status?: 'all' | 'pending' | 'processed' | 'failed';
  }): Promise<ScheduledMetaCampaignItem[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.status && params.status !== 'all')
        searchParams.set('status', params.status);
      const qs = searchParams.toString();
      const url = qs
        ? `${this.baseUrl}/scheduled-campaigns?${qs}`
        : `${this.baseUrl}/scheduled-campaigns`;
      const response = await api.get<ScheduledMetaCampaignItem[]>(url);
      return response.data ?? [];
    } catch (error: any) {
      console.error(
        '❌ [MetaCampaignApi] Erro ao listar campanhas agendadas:',
        error
      );
      return [];
    }
  }

  async deleteScheduledCampaign(id: string): Promise<void> {
    await api.delete(
      `${this.baseUrl}/scheduled-campaigns/${encodeURIComponent(id)}`
    );
  }

  async updateScheduledCampaign(
    id: string,
    data: {
      name?: string;
      objective?: string;
      status?: string;
      specialAdCategories?: string;
      runAt?: string;
      runEndAt?: string | null;
      dailyBudgetReais?: number | null;
      creativeImageUrl?: string | null;
      creativeVideoUrl?: string | null;
    }
  ): Promise<ScheduledMetaCampaignItem> {
    const response = await api.patch<ScheduledMetaCampaignItem>(
      `${this.baseUrl}/scheduled-campaigns/${encodeURIComponent(id)}`,
      data
    );
    return response.data;
  }

  async updateCampaign(
    campaignId: string,
    payload: { status?: string; name?: string }
  ): Promise<{ ok: boolean }> {
    try {
      const response = await api.patch<{ ok: boolean }>(
        `${this.baseUrl}/campaigns/${encodeURIComponent(campaignId)}`,
        payload
      );
      return response.data ?? { ok: true };
    } catch (error: any) {
      console.error('❌ [MetaCampaignApi] Erro ao atualizar campanha:', error);
      throw this.handleError(error);
    }
  }

  async getCampaigns(params?: {
    insights?: boolean;
    date_preset?: string;
  }): Promise<MetaCampaignItem[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.insights) searchParams.set('insights', '1');
      if (params?.date_preset)
        searchParams.set('date_preset', params.date_preset);
      const qs = searchParams.toString();
      const url = qs
        ? `${this.baseUrl}/campaigns?${qs}`
        : `${this.baseUrl}/campaigns`;
      const response = await api.get<{ data: MetaCampaignItem[] }>(url);
      return response.data?.data ?? [];
    } catch (error: any) {
      console.error('❌ [MetaCampaignApi] Erro ao listar campanhas:', error);
      throw this.handleError(error);
    }
  }

  async getPreviousTotals(
    datePreset?: string
  ): Promise<{
    impressions: number;
    clicks: number;
    spend: number;
    leads: number;
  }> {
    try {
      const params = datePreset
        ? `?date_preset=${encodeURIComponent(datePreset)}`
        : '';
      const response = await api.get<{
        impressions: number;
        clicks: number;
        spend: number;
        leads: number;
      }>(`${this.baseUrl}/campaigns/previous-totals${params}`);
      return response.data ?? { impressions: 0, clicks: 0, spend: 0, leads: 0 };
    } catch {
      return { impressions: 0, clicks: 0, spend: 0, leads: 0 };
    }
  }

  async getDailyInsights(
    datePreset?: string
  ): Promise<{
    daily: Array<{
      date: string;
      impressions: number;
      clicks: number;
      spend: number;
      leads: number;
    }>;
  }> {
    try {
      const params = datePreset
        ? `?date_preset=${encodeURIComponent(datePreset)}`
        : '';
      const response = await api.get<{
        daily: Array<{
          date: string;
          impressions: number;
          clicks: number;
          spend: number;
          leads: number;
        }>;
      }>(`${this.baseUrl}/campaigns/daily${params}`);
      return response.data ?? { daily: [] };
    } catch {
      return { daily: [] };
    }
  }

  async getRedirectConfig(): Promise<MetaCampaignRedirectConfig[]> {
    try {
      const response = await api.get<MetaCampaignRedirectConfig[]>(
        `${this.baseUrl}/redirect-config`
      );
      return response.data ?? [];
    } catch (error: any) {
      console.error(
        '❌ [MetaCampaignApi] Erro ao obter redirecionamentos:',
        error
      );
      throw this.handleError(error);
    }
  }

  async regenerateWebhookToken(): Promise<{ webhookToken: string }> {
    try {
      const response = await api.post<{ webhookToken: string }>(
        `${this.baseUrl}/regenerate-webhook-token`
      );
      return response.data;
    } catch (error: any) {
      console.error(
        '❌ [MetaCampaignApi] Erro ao regenerar token do webhook:',
        error
      );
      throw this.handleError(error);
    }
  }

  async getIntegrationStatus(): Promise<{
    tokenValid: boolean;
    syncLeads: boolean;
    hasRedirects: boolean;
    campaignsCount?: number;
  }> {
    try {
      const response = await api.get<{
        tokenValid: boolean;
        syncLeads: boolean;
        hasRedirects: boolean;
        campaignsCount?: number;
      }>(`${this.baseUrl}/integration-status`);
      return (
        response.data ?? {
          tokenValid: false,
          syncLeads: false,
          hasRedirects: false,
        }
      );
    } catch {
      return { tokenValid: false, syncLeads: false, hasRedirects: false };
    }
  }

  async getCrmLeadsStats(datePreset?: string): Promise<MetaCrmLeadsStats> {
    try {
      const params = datePreset
        ? `?date_preset=${encodeURIComponent(datePreset)}`
        : '';
      const response = await api.get<MetaCrmLeadsStats>(
        `${this.baseUrl}/crm-leads-stats${params}`
      );
      return response.data ?? { total: 0, byCampaign: [], byMonth: [] };
    } catch (error: any) {
      console.error(
        '❌ [MetaCampaignApi] Erro ao obter estatísticas de leads no CRM:',
        error
      );
      return { total: 0, byCampaign: [], byMonth: [] };
    }
  }

  async getLeads(params?: {
    page?: number;
    limit?: number;
    meta_campaign_id?: string;
  }): Promise<MetaLeadsListResponse> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.page != null) searchParams.set('page', String(params.page));
      if (params?.limit != null)
        searchParams.set('limit', String(params.limit));
      if (params?.meta_campaign_id)
        searchParams.set('meta_campaign_id', params.meta_campaign_id);
      const qs = searchParams.toString();
      const url = qs ? `${this.baseUrl}/leads?${qs}` : `${this.baseUrl}/leads`;
      const response = await api.get<MetaLeadsListResponse>(url);
      return (
        response.data ?? {
          data: [],
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
        }
      );
    } catch (error: any) {
      console.error('❌ [MetaCampaignApi] Erro ao listar leads:', error);
      throw this.handleError(error);
    }
  }

  async getWebhookLeadsLog(params?: {
    page?: number;
    limit?: number;
    meta_campaign_id?: string;
    status?: string;
  }): Promise<MetaLeadWebhookLogResponse> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.page != null) searchParams.set('page', String(params.page));
      if (params?.limit != null)
        searchParams.set('limit', String(params.limit));
      if (params?.meta_campaign_id)
        searchParams.set('meta_campaign_id', params.meta_campaign_id);
      if (params?.status) searchParams.set('status', params.status);
      const qs = searchParams.toString();
      const url = qs
        ? `${this.baseUrl}/webhook-leads-log?${qs}`
        : `${this.baseUrl}/webhook-leads-log`;
      const response = await api.get<MetaLeadWebhookLogResponse>(url);
      return (
        response.data ?? { data: [], total: 0, page: 1, limit: 20 }
      );
    } catch (error: any) {
      console.error(
        '❌ [MetaCampaignApi] Erro ao listar log de webhook de leads:',
        error
      );
      throw this.handleError(error);
    }
  }

  async getLeadgenForms(
    datePreset?: string
  ): Promise<{ data: MetaLeadgenFormItem[] }> {
    try {
      const params = datePreset
        ? `?date_preset=${encodeURIComponent(datePreset)}`
        : '';
      const response = await api.get<{ data: MetaLeadgenFormItem[] }>(
        `${this.baseUrl}/leadgen-forms${params}`
      );
      return response.data ?? { data: [] };
    } catch {
      return { data: [] };
    }
  }

  async getRoas(datePreset?: string): Promise<{ data: MetaRoasItem[] }> {
    try {
      const params = datePreset
        ? `?date_preset=${encodeURIComponent(datePreset)}`
        : '';
      const response = await api.get<{ data: MetaRoasItem[] }>(
        `${this.baseUrl}/campaigns/roas${params}`
      );
      return response.data ?? { data: [] };
    } catch {
      return { data: [] };
    }
  }

  async getCampaignAdSets(
    campaignId: string
  ): Promise<{ data: MetaAdSetItem[] }> {
    try {
      const response = await api.get<{ data: MetaAdSetItem[] }>(
        `${this.baseUrl}/campaigns/${encodeURIComponent(campaignId)}/adsets`
      );
      return response.data ?? { data: [] };
    } catch {
      return { data: [] };
    }
  }

  async getAdSetAds(adSetId: string): Promise<{ data: MetaAdItem[] }> {
    try {
      const response = await api.get<{ data: MetaAdItem[] }>(
        `${this.baseUrl}/ad-sets/${encodeURIComponent(adSetId)}/ads`
      );
      return response.data ?? { data: [] };
    } catch {
      return { data: [] };
    }
  }

  /** URL de reprodução do vídeo (criativo Meta). Retorna null se não disponível. */
  async getVideoSourceUrl(
    videoId: string
  ): Promise<{ url: string | null }> {
    try {
      const response = await api.get<{ url: string | null }>(
        `${this.baseUrl}/video-source?video_id=${encodeURIComponent(videoId)}`
      );
      return response.data ?? { url: null };
    } catch {
      return { url: null };
    }
  }

  async putRedirectConfig(
    data: UpsertMetaCampaignRedirectRequest
  ): Promise<MetaCampaignRedirectConfig> {
    try {
      const response = await api.put<MetaCampaignRedirectConfig>(
        `${this.baseUrl}/redirect-config`,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error(
        '❌ [MetaCampaignApi] Erro ao salvar redirecionamento:',
        error
      );
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    if (error.message) return new Error(error.message);
    return new Error(
      'Erro ao processar solicitação da integração Meta Campanhas'
    );
  }
}

export const metaCampaignApi = new MetaCampaignApiService();
