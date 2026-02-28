import { api } from './api';
import type { InstagramConfig, InstagramPostAutomation, InstagramInteractionLog } from '../types/instagram';

const BASE_PATH = '/integrations/instagram';

class InstagramApi {
  /**
   * Obtém a configuração do Instagram
   */
  async getConfig(): Promise<InstagramConfig | null> {
    try {
      const response = await api.get<InstagramConfig>(`${BASE_PATH}/config`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter configuração do Instagram:', error);
      return null;
    }
  }

  /**
   * Cria ou atualiza a configuração do Instagram
   */
  async createOrUpdateConfig(data: Partial<InstagramConfig>): Promise<InstagramConfig> {
    const response = await api.post<InstagramConfig>(`${BASE_PATH}/config`, data);
    return response.data;
  }

  /**
   * Atualiza a configuração do Instagram
   */
  async updateConfig(data: Partial<InstagramConfig>): Promise<InstagramConfig> {
    const response = await api.put<InstagramConfig>(`${BASE_PATH}/config`, data);
    return response.data;
  }

  /**
   * Regenera o token do webhook
   */
  async regenerateWebhookToken(): Promise<{ webhookToken: string }> {
    const response = await api.post<{ webhookToken: string }>(
      `${BASE_PATH}/regenerate-webhook-token`,
    );
    return response.data;
  }

  /**
   * Lista automações de posts
   */
  async listAutomations(
    page = 1,
    limit = 20,
    isActive?: boolean,
  ): Promise<{
    data: InstagramPostAutomation[];
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await api.get<{
      data: InstagramPostAutomation[];
      total: number;
      page: number;
      limit: number;
    }>(`${BASE_PATH}/automations`, {
      params: { page, limit, isActive },
    });
    return response.data;
  }

  /**
   * Cria uma nova automação de post
   */
  async createAutomation(data: Partial<InstagramPostAutomation>): Promise<InstagramPostAutomation> {
    const response = await api.post<InstagramPostAutomation>(`${BASE_PATH}/automations`, data);
    return response.data;
  }

  /**
   * Obtém uma automação de post
   */
  async getAutomation(id: string): Promise<InstagramPostAutomation> {
    const response = await api.get<InstagramPostAutomation>(`${BASE_PATH}/automations/${id}`);
    return response.data;
  }

  /**
   * Atualiza uma automação de post
   */
  async updateAutomation(
    id: string,
    data: Partial<InstagramPostAutomation>,
  ): Promise<InstagramPostAutomation> {
    const response = await api.put<InstagramPostAutomation>(`${BASE_PATH}/automations/${id}`, data);
    return response.data;
  }

  /**
   * Deleta uma automação de post
   */
  async deleteAutomation(id: string): Promise<void> {
    await api.delete(`${BASE_PATH}/automations/${id}`);
  }

  /**
   * Lista logs de interação
   */
  async listInteractionLogs(
    page = 1,
    limit = 20,
    postId?: string,
    status?: string,
  ): Promise<{
    data: InstagramInteractionLog[];
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await api.get<{
      data: InstagramInteractionLog[];
      total: number;
      page: number;
      limit: number;
    }>(`${BASE_PATH}/interaction-logs`, {
      params: { page, limit, postId, status },
    });
    return response.data;
  }
}

export default new InstagramApi();
