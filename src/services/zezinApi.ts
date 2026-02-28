'use client';
import { api } from './api';
import { API_BASE_URL } from '../config/apiConfig';
import { authStorage } from './authStorage';
import type {
  ZezinAvailability,
  ZezinConfig,
  CreateZezinConfigRequest,
  UpdateZezinConfigRequest,
  ZezinAskRequest,
  ZezinAskResponse,
  ZezinSuggestedQuestionsResponse,
  ZezinSendSuggestionButtonsRequest,
  ZezinSendSuggestionButtonsResponse,
  ZezinHistoryResponse,
  ZezinThreadMessagesResponse,
} from '../types/zezin';

class ZezinApiService {
  private baseUrl = '/whatsapp/zezin';

  /**
   * Verificar se o Zezin está disponível para o usuário/empresa (admin + plano Pro + módulo AI).
   */
  async getAvailability(): Promise<ZezinAvailability> {
    try {
      const response = await api.get<ZezinAvailability>(`${this.baseUrl}/availability`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.status === 404) {
        return {
          available: false,
          assistantName: 'Zezin',
          configConfigured: false,
        };
      }
      console.error('❌ [ZezinApi] Erro ao verificar disponibilidade:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obter configuração do Zezin (número e token mascarado).
   */
  async getConfig(): Promise<ZezinConfig | null> {
    try {
      const response = await api.get<ZezinConfig | null>(`${this.baseUrl}/config`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      console.error('❌ [ZezinApi] Erro ao obter configuração:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Criar ou atualizar configuração do Zezin.
   */
  async createOrUpdateConfig(
    data: CreateZezinConfigRequest
  ): Promise<ZezinConfig> {
    try {
      const response = await api.post<ZezinConfig>(`${this.baseUrl}/config`, data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [ZezinApi] Erro ao salvar configuração:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Atualizar configuração parcial do Zezin.
   */
  async updateConfig(data: UpdateZezinConfigRequest): Promise<ZezinConfig> {
    try {
      const response = await api.put<ZezinConfig>(`${this.baseUrl}/config`, data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [ZezinApi] Erro ao atualizar configuração:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Perguntar ao Zezin com resposta em streaming (estilo ChatGPT).
   * sectionId: id da seção/thread em que a mensagem pertence (para contexto e não embaralhar com outras).
   * onDone recebe conversationId quando o back criar a conversa (use como sectionId na próxima mensagem).
   */
  async askStream(
    message: string,
    callbacks: {
      onChunk: (chunk: string) => void;
      onDone: (conversationId?: string) => void;
      onError: (err: Error) => void;
    },
    sectionId?: string | null,
  ): Promise<void> {
    const token = authStorage.getToken();
    const url = `${API_BASE_URL.replace(/\/$/, '')}${this.baseUrl}/ask-stream`;
    const body: { message: string; sectionId?: string } = { message: message.trim() };
    if (sectionId) body.sectionId = sectionId;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      callbacks.onError(
        new Error(data?.message || `Erro ${res.status}: ${res.statusText}`),
      );
      return;
    }
    const reader = res.body?.getReader();
    if (!reader) {
      callbacks.onError(new Error('Stream não disponível'));
      return;
    }
    const decoder = new TextDecoder();
    let buffer = '';
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const raw = line.slice(6).trim();
            if (!raw) continue;
            try {
              const data = JSON.parse(raw);
              if (typeof data.chunk === 'string') callbacks.onChunk(data.chunk);
              if (data.done === true) callbacks.onDone(data.conversationId);
              if (data.error) callbacks.onError(new Error(data.error));
            } catch {
              // ignore parse
            }
          }
        }
      }
      if (buffer.startsWith('data: ')) {
        const raw = buffer.slice(6).trim();
        if (raw) {
          try {
            const data = JSON.parse(raw);
            if (typeof data.chunk === 'string') callbacks.onChunk(data.chunk);
            if (data.done === true) callbacks.onDone(data.conversationId);
            if (data.error) callbacks.onError(new Error(data.error));
          } catch {
            // ignore
          }
        }
      }
      callbacks.onDone(undefined);
    } catch (err) {
      callbacks.onError(err instanceof Error ? err : new Error(String(err)));
    }
  }

  /**
   * Perguntar qualquer coisa ao Zezin (fluxo livre). A IA interpreta e responde com base nos dados do sistema.
   */
  async ask(data: ZezinAskRequest): Promise<ZezinAskResponse> {
    try {
      const response = await api.post<ZezinAskResponse>(`${this.baseUrl}/ask`, data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [ZezinApi] Erro ao perguntar ao Zezin:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Listar sugestões de perguntas fixas (atalhos com dados reais).
   */
  async getSuggestedQuestions(): Promise<ZezinSuggestedQuestionsResponse> {
    try {
      const response = await api.get<ZezinSuggestedQuestionsResponse>(
        `${this.baseUrl}/suggested-questions`
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ [ZezinApi] Erro ao listar sugestões:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Sugestões de follow-up geradas por IA com base no histórico da conversa.
   * Use quando o usuário já tiver trocado mensagens.
   */
  async getSuggestedQuestionsFollowUp(): Promise<ZezinSuggestedQuestionsResponse> {
    try {
      const response = await api.get<ZezinSuggestedQuestionsResponse>(
        `${this.baseUrl}/suggested-questions-follow-up`
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ [ZezinApi] Erro ao listar sugestões de follow-up:', error);
      return { questions: [] };
    }
  }

  /**
   * Lista de conversas (uma entrada por conversa). Mais recentes primeiro.
   */
  async getHistory(limit?: number): Promise<ZezinHistoryResponse> {
    try {
      const params = new URLSearchParams();
      if (limit != null) params.set('limit', String(limit));
      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await api.get<ZezinHistoryResponse>(`${this.baseUrl}/history${query}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ [ZezinApi] Erro ao obter histórico:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Mensagens de uma conversa (thread) para exibir no chat.
   */
  async getThreadMessages(threadId: string): Promise<ZezinThreadMessagesResponse> {
    const response = await api.get<ZezinThreadMessagesResponse>(
      `${this.baseUrl}/history/thread/${threadId}`,
    );
    return response.data;
  }

  /**
   * Excluir conversa inteira (thread) do histórico (soft delete).
   */
  async deleteThread(threadId: string): Promise<{ deleted: number }> {
    const response = await api.delete<{ deleted: number }>(
      `${this.baseUrl}/history/thread/${threadId}`,
    );
    return response.data;
  }

  /**
   * Excluir um item do histórico (soft delete) — uma troca apenas.
   */
  async deleteHistoryItem(id: string): Promise<{ deleted: boolean }> {
    const response = await api.delete<{ deleted: boolean }>(`${this.baseUrl}/history/${id}`);
    return response.data;
  }

  /**
   * Atualizar título de um item do histórico.
   */
  async updateHistoryTitle(id: string, title: string): Promise<{ id: string; title: string | null }> {
    const response = await api.patch<{ id: string; title: string | null }>(
      `${this.baseUrl}/history/${id}`,
      { title: title.trim().slice(0, 200) },
    );
    return response.data;
  }

  /**
   * Enviar mensagem com 3 botões de sugestão para um número no WhatsApp.
   * O admin deve ter iniciado a conversa antes.
   */
  async sendSuggestionButtons(
    data: ZezinSendSuggestionButtonsRequest
  ): Promise<ZezinSendSuggestionButtonsResponse> {
    try {
      const response = await api.post<ZezinSendSuggestionButtonsResponse>(
        `${this.baseUrl}/send-suggestion-buttons`,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ [ZezinApi] Erro ao enviar botões de sugestão:', error);
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Erro ao processar solicitação do Zezin';
    return new Error(message);
  }
}

export const zezinApi = new ZezinApiService();
