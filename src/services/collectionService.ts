import { api } from './api';

export interface CollectionMessage {
  id: string;
  channel: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  subject: string;
  message: string;
  status: string;
  sentAt: string;
  deliveredAt: string;
  readAt: string;
  failedAt: string;
  errorMessage: string;
  createdAt: string;
}

export interface CollectionRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  triggerDays: number;
  channel: string;
  messageTemplate: string;
  subjectTemplate: string;
  isActive: boolean;
  priority: number;
  sendTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCollectionRuleDto {
  name: string;
  description?: string;
  trigger: string;
  triggerDays: number;
  channel: string;
  messageTemplate: string;
  subjectTemplate?: string;
  isActive?: boolean;
  priority?: number;
  sendTime?: string;
}

export interface UpdateCollectionRuleDto {
  name?: string;
  description?: string;
  trigger?: string;
  triggerDays?: number;
  channel?: string;
  messageTemplate?: string;
  subjectTemplate?: string;
  isActive?: boolean;
  priority?: number;
  sendTime?: string;
}

export interface CollectionStatistics {
  total: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  successRate: number;
  byChannel: {
    email: number;
    whatsapp: number;
    sms: number;
  };
}

/**
 * Busca todas as mensagens de cobrança
 */
export async function getCollectionMessages(): Promise<CollectionMessage[]> {
  const response = await api.get<CollectionMessage[]>('/collection');
  return response.data;
}

/**
 * Busca estatísticas de cobrança
 */
export async function getCollectionStatistics(): Promise<CollectionStatistics> {
  const response = await api.get<CollectionStatistics>(
    '/collection/statistics'
  );
  return response.data;
}

/**
 * Processa cobranças manualmente
 */
export async function processCollections(): Promise<{ processed: number }> {
  const response = await api.post<{ processed: number }>('/collection/process');
  return response.data;
}

/**
 * Busca todas as réguas de cobrança
 */
export async function getCollectionRules(): Promise<CollectionRule[]> {
  const response = await api.get<CollectionRule[]>('/collection/rules');
  return response.data;
}

/**
 * Busca uma régua de cobrança por ID
 */
export async function getCollectionRule(id: string): Promise<CollectionRule> {
  const response = await api.get<CollectionRule>(`/collection/rules/${id}`);
  return response.data;
}

/**
 * Cria uma nova régua de cobrança
 */
export async function createCollectionRule(
  data: CreateCollectionRuleDto
): Promise<CollectionRule> {
  const response = await api.post<CollectionRule>('/collection/rules', data);
  return response.data;
}

/**
 * Atualiza uma régua de cobrança
 */
export async function updateCollectionRule(
  id: string,
  data: UpdateCollectionRuleDto
): Promise<CollectionRule> {
  const response = await api.put<CollectionRule>(
    `/collection/rules/${id}`,
    data
  );
  return response.data;
}

/**
 * Ativa/desativa uma régua de cobrança
 */
export async function toggleCollectionRule(id: string): Promise<CollectionRule> {
  const response = await api.put<CollectionRule>(
    `/collection/rules/${id}/toggle`
  );
  return response.data;
}

/**
 * Deleta uma régua de cobrança
 */
export async function deleteCollectionRule(id: string): Promise<void> {
  await api.delete(`/collection/rules/${id}`);
}

/**
 * Cria réguas padrão
 */
export async function createDefaultCollectionRules(): Promise<
  CollectionRule[]
> {
  const response = await api.get<CollectionRule[]>('/collection/rules/default');
  return response.data;
}
