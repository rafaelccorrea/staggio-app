import { useState, useEffect, useCallback, useRef } from 'react';
import { whatsappApi } from '../services/whatsappApi';
import { usePermissionsContextOptional } from '../contexts/PermissionsContext';
import type {
  WhatsAppMessage,
  WhatsAppMessagesQueryParams,
  SendMessageRequest,
  SendTemplateRequest,
  CreateTaskFromMessageRequest,
  AnalyzeMessageRequest,
} from '../types/whatsapp';

const DEFAULT_PAGE_LIMIT = 100;

interface UseWhatsAppOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // em milissegundos
}

export const useWhatsApp = (options: UseWhatsAppOptions = {}) => {
  const { autoRefresh = false, refreshInterval = 15000 } = options; // 15s para evitar muitas chamadas à API
  const permissionsContext = usePermissionsContextOptional();

  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  /** Últimos params usados em loadMessages – usados no auto-refresh e no reload após enviar/criar tarefa */
  const lastParamsRef = useRef<WhatsAppMessagesQueryParams | undefined>(
    undefined
  );
  /** Cancela a requisição anterior quando uma nova é disparada */
  const abortControllerRef = useRef<AbortController | null>(null);

  // Verificar permissões (não chamar APIs WhatsApp até permissões carregarem)
  const permissionsLoading = permissionsContext?.isLoading ?? true;
  const hasViewMessagesPermission =
    !permissionsLoading &&
    (permissionsContext?.hasPermission('whatsapp:view_messages') ?? false);
  const hasSendPermission =
    permissionsContext?.hasPermission('whatsapp:send') ?? false;
  const hasCreateTaskPermission =
    permissionsContext?.hasPermission('whatsapp:create_task') ?? false;
  const hasViewPermission =
    permissionsContext?.hasPermission('whatsapp:view') ?? false;

  /**
   * Carregar mensagens. Sempre usa paginação (limit); se não passar params, reutiliza os últimos ou default.
   * @param append - se true, adiciona ao final em vez de substituir (para "Carregar mais")
   */
  const loadMessages = useCallback(
    async (
      params?: WhatsAppMessagesQueryParams,
      options?: { append?: boolean }
    ) => {
      // Verificar permissão antes de chamar API
      if (!hasViewMessagesPermission) {
        setError(
          new Error('Você não tem permissão para visualizar mensagens WhatsApp')
        );
        setLoading(false);
        return;
      }

      const effectiveParams: WhatsAppMessagesQueryParams = params
        ? {
            limit: params.limit ?? DEFAULT_PAGE_LIMIT,
            offset: params.offset ?? 0,
            ...params,
          }
        : lastParamsRef.current ?? {
            limit: DEFAULT_PAGE_LIMIT,
            offset: 0,
          };
      if (!options?.append) lastParamsRef.current = effectiveParams;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      setLoading(true);
      setError(null);

      try {
        const response = await whatsappApi.getMessages(effectiveParams, {
          signal,
        });
        if (options?.append) {
          setMessages(prev => [...prev, ...response.messages]);
        } else {
          setMessages(response.messages);
        }
        setTotal(response.total);
      } catch (err: any) {
        if (err?.name === 'AbortError' || err?.code === 'ERR_CANCELED') {
          return; // Requisição cancelada (nova carga ou refresh)
        }
        setError(err);
        if (err.response?.status !== 403) {
          console.error('Erro ao carregar mensagens WhatsApp:', err);
        }
      } finally {
        setLoading(false);
      }
    },
    [hasViewMessagesPermission]
  );

  /**
   * Carregar contagem de não lidas (só chama API se tiver permissão e permissões já carregaram)
   */
  const loadUnreadCount = useCallback(async () => {
    if (permissionsLoading || !hasViewMessagesPermission) {
      setUnreadCount(0);
      return;
    }
    try {
      const count = await whatsappApi.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      setUnreadCount(0);
    }
  }, [permissionsLoading, hasViewMessagesPermission]);

  /**
   * Enviar mensagem
   */
  const sendMessage = useCallback(
    async (data: SendMessageRequest) => {
      // Verificar permissão antes de chamar API
      if (!hasSendPermission) {
        throw new Error(
          'Você não tem permissão para enviar mensagens WhatsApp'
        );
      }

      try {
        const response = await whatsappApi.sendMessage(data);
        // Recarregar mensagens após enviar
        await loadMessages();
        return response;
      } catch (err: any) {
        throw err;
      }
    },
    [loadMessages, hasSendPermission]
  );

  /**
   * Enviar template
   */
  const sendTemplate = useCallback(
    async (data: SendTemplateRequest) => {
      // Verificar permissão antes de chamar API
      if (!hasSendPermission) {
        throw new Error(
          'Você não tem permissão para enviar mensagens WhatsApp'
        );
      }

      try {
        const response = await whatsappApi.sendTemplate(data);
        // Recarregar mensagens após enviar
        await loadMessages();
        return response;
      } catch (err: any) {
        throw err;
      }
    },
    [loadMessages, hasSendPermission]
  );

  /**
   * Criar tarefa a partir de mensagem
   */
  const createTaskFromMessage = useCallback(
    async (messageId: string, data: CreateTaskFromMessageRequest) => {
      // Verificar permissão antes de chamar API
      if (!hasCreateTaskPermission) {
        throw new Error(
          'Você não tem permissão para criar tarefas a partir de mensagens WhatsApp'
        );
      }

      try {
        const response = await whatsappApi.createTaskFromMessage(
          messageId,
          data
        );
        // Recarregar mensagens para atualizar kanbanTaskId
        await loadMessages();
        return response;
      } catch (err: any) {
        throw err;
      }
    },
    [loadMessages, hasCreateTaskPermission]
  );

  /**
   * Analisar mensagem com IA
   */
  const analyzeMessage = useCallback(
    async (data: AnalyzeMessageRequest) => {
      // Verificar permissão antes de chamar API
      if (!hasViewPermission) {
        throw new Error(
          'Você não tem permissão para analisar mensagens WhatsApp'
        );
      }

      try {
        return await whatsappApi.analyzeMessage(data);
      } catch (err: any) {
        throw err;
      }
    },
    [hasViewPermission]
  );

  /**
   * Marcar mensagem como lida
   */
  const markAsRead = useCallback(
    async (messageId: string) => {
      // Verificar permissão antes de chamar API
      if (!hasViewMessagesPermission) {
        return; // Silenciosamente retornar se não tiver permissão
      }

      try {
        await whatsappApi.markAsRead(messageId);
        // Atualizar mensagem localmente
        setMessages(prev =>
          prev.map(msg =>
            msg.id === messageId ? { ...msg, readAt: new Date() } : msg
          )
        );
        // Atualizar contagem de não lidas
        await loadUnreadCount();
      } catch (err: any) {
        throw err;
      }
    },
    [loadUnreadCount, hasViewMessagesPermission]
  );

  /**
   * Obter mensagem específica
   */
  const getMessage = useCallback(
    async (messageId: string) => {
      // Verificar permissão antes de chamar API
      if (!hasViewMessagesPermission) {
        throw new Error(
          'Você não tem permissão para visualizar mensagens WhatsApp'
        );
      }

      try {
        return await whatsappApi.getMessage(messageId);
      } catch (err: any) {
        throw err;
      }
    },
    [hasViewMessagesPermission]
  );

  // Auto-refresh se habilitado - atualização silenciosa apenas quando a página está visível
  useEffect(() => {
    if (!autoRefresh) return;

    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    const refreshMessages = async () => {
      if (!isMounted || document.hidden) return; // Não atualizar se a página estiver oculta

      // Verificar permissão antes de chamar API
      if (!hasViewMessagesPermission) {
        return; // Não atualizar se não tiver permissão
      }

      try {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        const refreshParams =
          lastParamsRef.current ?? { limit: DEFAULT_PAGE_LIMIT, offset: 0 };
        const response = await whatsappApi.getMessages(refreshParams, {
          signal: abortControllerRef.current.signal,
        });

        if (!isMounted) return;

        setMessages(prev => {
          // Verificar se há novas mensagens comparando IDs
          const prevIds = new Set(prev.map(m => m.id));
          const newMessages = response.messages.filter(m => !prevIds.has(m.id));

          if (newMessages.length > 0) {
            // Adicionar novas mensagens de forma sutil
            return [...response.messages];
          }

          // Atualizar mensagens existentes se houver mudanças
          return response.messages;
        });
        setTotal(response.total);
        // Removido loadUnreadCount() do auto-refresh para reduzir chamadas
      } catch (err: any) {
        if (err?.name === 'AbortError' || err?.code === 'ERR_CANCELED') return;
        if (isMounted) console.error('Erro ao atualizar mensagens:', err);
      }
    };

    // Atualizar quando a página volta a ficar visível
    const handleVisibilityChange = () => {
      if (!document.hidden && isMounted) {
        refreshMessages();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Intervalo reduzido (5 segundos por padrão) e apenas quando visível para atualizações mais rápidas
    intervalId = setInterval(() => {
      if (!document.hidden) {
        refreshMessages();
      }
    }, refreshInterval);

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [autoRefresh, refreshInterval, hasViewMessagesPermission]);

  // Carregar contagem de não lidas só quando tiver permissão (evita 403 para quem não tem whatsapp:view_messages)
  useEffect(() => {
    if (!hasViewMessagesPermission) {
      setUnreadCount(0);
      return;
    }
    loadUnreadCount();
  }, [hasViewMessagesPermission, loadUnreadCount]);

  return {
    messages,
    loading,
    error,
    total,
    unreadCount,
    loadMessages,
    loadUnreadCount,
    sendMessage,
    sendTemplate,
    createTaskFromMessage,
    analyzeMessage,
    markAsRead,
    getMessage,
  };
};
