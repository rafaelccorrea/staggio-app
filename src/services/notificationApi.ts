import { api } from './api';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../config/apiConfig';

export interface Notification {
  id: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  read: boolean;
  readAt: Date | null;
  actionUrl: string | null;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, any> | null;
  userId: string;
  companyId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount: number;
}

export interface NotificationQueryParams {
  read?: boolean;
  type?: string;
  companyId?: string;
  page?: number;
  limit?: number;
}

class NotificationApiService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private baseReconnectDelay = 1000;
  private maxReconnectDelay = 30000;
  private listeners: Map<string, Set<Function>> = new Map();
  private listenersSetup = false;
  private currentToken: string | null = null;
  private currentUserId: string | undefined;

  /**
   * Conecta ao WebSocket de notificações
   */
  connect(token: string, userId?: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.currentToken = token;
    this.currentUserId = userId;

    const notificationsUrl = `${API_BASE_URL}/notifications`;


    this.socket = io(notificationsUrl, {
      auth: { token },
      // CORREÇÃO: Usar apenas websocket para evitar polling infinito
      transports: ['websocket'],
      reconnection: false, // Desabilitar reconexão automática do socket.io
    });

    this.setupEventHandlers(userId);

    // Configurar listeners globais apenas uma vez
    if (!this.listenersSetup) {
      this.setupVisibilityListener();
      this.setupOnlineListener();
      this.listenersSetup = true;
    }
  }

  /**
   * Configura os handlers de eventos do WebSocket
   */
  private setupEventHandlers(userId?: string): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.reconnectAttempts = 0;

      // Emitir evento 'join' conforme documentação WebSocket
      if (userId) {
        this.socket?.emit('join', userId);
      }

      this.emit('connected', { connected: true });
    });

    this.socket.on('notifications_connected', data => {
    });

    this.socket.on('disconnect', reason => {
      this.emit('disconnected', { connected: false, reason });
    });

    this.socket.on('connect_error', error => {
      console.error('[NotificationService] ❌ Erro de conexão:', error);
      console.error('[NotificationService] 📋 Detalhes do erro:', {
        message: error.message,
        type: error.name,
        stack: error.stack,
      });
      this.handleReconnect();
    });

    // Evento 'notification' conforme documentação WebSocket
    this.socket.on('notification', data => {
      this.emit('new_notification', data);
    });

    // Evento 'badge_update' conforme documentação WebSocket
    this.socket.on('badge_update', data => {
      this.emit('badge_update', data.unreadCount);
    });

    // Evento 'notification_read' conforme documentação WebSocket
    this.socket.on('notification_read', data => {
      this.emit('notification_read', data.notificationId);
    });

    this.socket.on('company_subscribed', data => {
    });

    this.socket.on('company_unsubscribed', data => {
    });

    this.socket.on('error', error => {
      console.error('[NotificationService] Erro do WebSocket:', error);
      this.emit('error', error);
    });
  }

  /**
   * Reconexão inteligente com exponential backoff
   */
  private handleReconnect(): void {
    this.reconnectAttempts++;

    // Calcular delay com exponential backoff
    const exponentialDelay =
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    const delay = Math.min(exponentialDelay, this.maxReconnectDelay);

    setTimeout(() => {
      // Verificar se ainda tem token válido
      if (!this.currentToken) {
        return;
      }

      // Desconectar socket antigo se existir
      if (this.socket) {
        this.socket.removeAllListeners();
        this.socket.disconnect();
        this.socket = null;
      }

      this.connect(this.currentToken, this.currentUserId);
    }, delay);
  }

  /**
   * Listener para quando o usuário volta à aba
   */
  private setupVisibilityListener(): void {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && !this.socket?.connected && this.currentToken) {
        // Resetar tentativas e reconectar
        this.reconnectAttempts = 0;

        setTimeout(() => {
          if (!this.socket?.connected && this.currentToken) {
            this.connect(this.currentToken, this.currentUserId);
          }
        }, 1000);
      }
    });
  }

  /**
   * Listener para quando a conexão de internet voltar
   */
  private setupOnlineListener(): void {
    window.addEventListener('online', () => {
      if (!this.socket?.connected && this.currentToken) {
        // Resetar tentativas e reconectar
        this.reconnectAttempts = 0;

        setTimeout(() => {
          if (this.currentToken) {
            this.connect(this.currentToken, this.currentUserId);
          }
        }, 2000);
      }
    });
  }

  /**
   * Desconecta do WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }

    this.currentToken = null;
    this.currentUserId = undefined;
    this.reconnectAttempts = 0;
  }

  /**
   * Inscreve-se para receber notificações de uma empresa
   */
  subscribeToCompany(companyId: string): void {
    if (!this.socket?.connected) {
      console.warn('[NotificationService] Socket não conectado');
      return;
    }

    this.socket.emit('subscribe_company', { companyId });
  }

  /**
   * Cancela inscrição de notificações de uma empresa
   */
  unsubscribeFromCompany(companyId: string): void {
    if (!this.socket?.connected) {
      console.warn('[NotificationService] Socket não conectado');
      return;
    }

    this.socket.emit('unsubscribe_company', { companyId });
  }

  /**
   * Adiciona um listener para um evento
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  /**
   * Remove um listener de um evento
   */
  off(event: string, callback: Function): void {
    this.listeners.get(event)?.delete(callback);
  }

  /**
   * Emite um evento para os listeners
   */
  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(
            `[NotificationService] Erro ao executar callback para ${event}:`,
            error
          );
        }
      });
    }
  }

  /**
   * Verifica se está conectado
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // ===== API REST =====

  /**
   * Busca notificações com paginação e filtros
   * Endpoint: GET /notifications
   */
  async getNotifications(
    params?: NotificationQueryParams
  ): Promise<NotificationListResponse> {
    const response = await api.get('/notifications', { params });
    return response.data;
  }

  /**
   * Busca apenas notificações não lidas
   * Endpoint: GET /notifications/unread/list
   */
  async getUnreadNotifications(params?: {
    page?: number;
    limit?: number;
    companyId?: string;
  }): Promise<NotificationListResponse> {
    const response = await api.get('/notifications/unread/list', { params });
    return response.data;
  }

  /**
   * Busca uma notificação específica
   */
  async getNotification(id: string): Promise<Notification> {
    const response = await api.get(`/notifications/${id}`);
    return response.data;
  }

  /**
   * Obtém contagem de notificações não lidas
   */
  async getUnreadCount(companyId?: string): Promise<number> {
    const params = companyId ? { companyId } : {};
    const response = await api.get('/notifications/unread-count', { params });
    return response.data.count;
  }

  /**
   * Obtém contagem de notificações não lidas por empresa
   */
  async getUnreadCountByCompany(): Promise<Record<string, number>> {
    const response = await api.get('/notifications/unread-count-by-company');
    return response.data.countByCompany;
  }

  /**
   * Marca uma notificação como lida
   * Endpoint: PATCH /notifications/:id/read
   */
  async markAsRead(id: string): Promise<Notification> {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  }

  /**
   * Marca uma notificação como não lida
   * Endpoint: PATCH /notifications/:id/unread
   */
  async markAsUnread(id: string): Promise<Notification> {
    const response = await api.patch(`/notifications/${id}/unread`);
    return response.data;
  }

  /**
   * Marca múltiplas notificações como lidas
   */
  async markManyAsRead(
    notificationIds: string[]
  ): Promise<{ affected: number; unreadCount: number }> {
    const response = await api.patch('/notifications/read/bulk', {
      notificationIds,
    });
    return response.data;
  }

  /**
   * Marca todas as notificações como lidas
   * Endpoint: PATCH /notifications/read/all
   */
  async markAllAsRead(
    companyId?: string
  ): Promise<{ affected: number; unreadCount: number }> {
    const response = await api.patch('/notifications/read/all', { companyId });
    return response.data;
  }

  /**
   * Remove uma notificação
   */
  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  }
}

export const notificationApi = new NotificationApiService();
export default notificationApi;

// Re-exportar tipos para garantir disponibilidade
export type { Notification, NotificationListResponse, NotificationQueryParams };
