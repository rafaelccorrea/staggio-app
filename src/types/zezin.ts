/**
 * Tipos para integração do assistente Zezin (IA + WhatsApp).
 * Zezin é exclusivo para administradores no plano Pro com módulo Assistente de IA.
 */

export interface ZezinAvailability {
  available: boolean;
  assistantName: string;
  configConfigured: boolean;
}

export interface ZezinConfig {
  id: string;
  companyId: string;
  phoneNumberId: string;
  phoneNumber?: string;
  apiToken?: string; // mascarado quando retornado (ex: ************5678)
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateZezinConfigRequest {
  phoneNumberId: string;
  apiToken: string;
  phoneNumber?: string;
  isActive?: boolean;
}

export interface UpdateZezinConfigRequest {
  phoneNumberId?: string;
  apiToken?: string;
  phoneNumber?: string;
  isActive?: boolean;
}

export interface ZezinAskRequest {
  message: string;
}

export interface ZezinAskResponse {
  answer: string;
}

export interface ZezinSuggestedQuestion {
  id: string;
  label: string;
  message: string;
}

export interface ZezinSuggestedQuestionsResponse {
  questions: ZezinSuggestedQuestion[];
}

export interface ZezinSendSuggestionButtonsRequest {
  to: string;
}

export interface ZezinSendSuggestionButtonsResponse {
  messageId: string;
  status: string;
}

/** Item do histórico de conversas com o Zezin (pergunta + resposta). */
export interface ZezinHistoryItem {
  id: string;
  message: string;
  answer: string;
  /** Resumo da pergunta para exibir como título no histórico (gerado no backend). */
  title?: string;
  createdAt: string;
  /** Id da thread: use para continuar a mesma conversa (sectionId). */
  threadId?: string;
}

/** Uma conversa (thread) no histórico — uma entrada por conversa na sidebar. */
export interface ZezinThreadSummary {
  threadId: string;
  title: string;
  updatedAt: string;
  messageCount: number;
}

/** Resposta do GET zezin/history: lista de conversas (uma por thread). */
export interface ZezinHistoryResponse {
  threads: ZezinThreadSummary[];
}

/** Resposta do GET zezin/history/thread/:threadId: mensagens da conversa. */
export interface ZezinThreadMessagesResponse {
  items: ZezinHistoryItem[];
}
