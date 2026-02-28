import { useState, useEffect, useCallback, useRef } from 'react';
import { chatApi } from '../services/chatApi';
import { chatSocketService } from '../services/chatSocketService';
import type {
  ChatRoom,
  ChatMessage,
  ChatParticipant,
  CreateRoomRequest,
  SendMessageRequest,
} from '../types/chat';
import { useCompanyContext } from './useCompanyContext';
import { useAuth } from './useAuth';

interface UseChatReturn {
  // Estado
  rooms: ChatRoom[];
  archivedRooms: ChatRoom[];
  messages: Record<string, ChatMessage[]>;
  currentRoom: string | null;
  loading: boolean;
  loadingMessages: Record<string, boolean>; // Loading por sala
  error: string | null;
  connected: boolean;

  // Ações
  loadRooms: () => Promise<void>;
  createOrGetRoom: (data: CreateRoomRequest) => Promise<ChatRoom>;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: (roomId: string) => Promise<void>;
  sendMessage: (roomId: string, content: string, file?: File) => Promise<void>;
  markAsRead: (roomId: string) => Promise<void>;
  loadMoreMessages: (roomId: string) => Promise<void>;
  addParticipants: (roomId: string, userIds: string[]) => Promise<void>;
  removeParticipant: (roomId: string, userId: string) => Promise<void>;
  updateRoom: (
    roomId: string,
    name?: string,
    imageUrl?: string
  ) => Promise<ChatRoom>;
  uploadGroupImage: (roomId: string, imageFile: File) => Promise<ChatRoom>;
  promoteToAdmin: (roomId: string, userIds: string[]) => Promise<ChatRoom>;
  removeAdmin: (roomId: string, userIds: string[]) => Promise<ChatRoom>;
  archiveRoom: (roomId: string) => Promise<void>;
  unarchiveRoom: (roomId: string) => Promise<void>;
  setCurrentRoom: (roomId: string | null) => void;
  editMessage: (messageId: string, content: string) => Promise<ChatMessage>;
  deleteMessage: (messageId: string) => Promise<void>;
  getRoomHistory: (roomId: string) => Promise<ChatRoomHistory>;
}

// Cache global compartilhado entre todas as instâncias do hook
// Isso evita múltiplas chamadas quando vários componentes usam useChat
const globalRoomsCache = {
  companyId: null as string | null,
  rooms: [] as ChatRoom[],
  timestamp: 0,
  loading: false,
};

const CACHE_DURATION = 5000; // 5 segundos de cache

export const useChat = (): UseChatReturn => {
  const { selectedCompany } = useCompanyContext();
  const { getToken, getCurrentUser } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [archivedRooms, setArchivedRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState<
    Record<string, boolean>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [messageOffsets, setMessageOffsets] = useState<Record<string, number>>(
    {}
  );
  const wsInitialized = useRef(false);
  const tempMessageCounter = useRef(0);
  const messageTimeouts = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {}
  );
  const currentRoomRef = useRef<string | null>(null);
  const handleNewMessageRef = useRef<
    | ((data: {
        message: ChatMessage;
        timestamp: string;
        isPending?: boolean;
      }) => void)
    | null
  >(null);
  const markingAsReadRef = useRef<Set<string>>(new Set()); // Evitar múltiplas chamadas simultâneas de markAsRead
  const loadingRoomsRef = useRef(false); // Evitar múltiplas chamadas simultâneas de loadRooms
  const roomsLoadedRef = useRef<string | null>(null); // Rastrear qual company já carregou as salas
  const getCurrentUserRef = useRef(getCurrentUser); // Ref para getCurrentUser para evitar loops

  // Refs estáveis para handlers do WebSocket: mesma referência para on/off, evita acúmulo e loop de listeners
  const handlersRef = useRef<Record<string, (...args: any[]) => void>>({});
  const stableListenersRef = useRef({
    chat_connected: () => {
      handlersRef.current.handleConnected?.().catch(() => {});
    },
    disconnect: (data: any) => {
      handlersRef.current.handleDisconnected?.(data);
    },
    new_message: (data: any) => {
      handlersRef.current.handleNewMessageWrapper?.(data);
    },
    message_sent: (data: any) => handlersRef.current.handleMessageSent?.(data),
    messages_read: (data: any) => handlersRef.current.handleMessagesRead?.(data),
    message_status_update: (data: any) =>
      handlersRef.current.handleMessageStatusUpdate?.(data),
    message_edited: (data: any) => handlersRef.current.handleMessageEdited?.(data),
    message_deleted: (data: any) => handlersRef.current.handleMessageDeleted?.(data),
    room_joined: (data: any) => handlersRef.current.handleRoomJoined?.(data),
    participant_left: (data: any) => handlersRef.current.handleParticipantLeft?.(data),
    error: (data: any) => handlersRef.current.handleError?.(data),
  });

  /**
   * Marcar mensagens como lidas
   */
  const markAsRead = useCallback(
    async (roomId: string) => {
      // Evitar múltiplas chamadas simultâneas para a mesma sala
      if (markingAsReadRef.current.has(roomId)) {
        return;
      }

      // Verificar se já está tudo lido antes de chamar
      const roomMessages = messages[roomId] || [];
      const currentUser = getCurrentUser();
      const hasUnread = roomMessages.some(
        msg =>
          msg.senderId !== currentUser?.id &&
          msg.status !== 'read' &&
          !msg.isDeleted
      );

      if (!hasUnread) {
        return;
      }

      markingAsReadRef.current.add(roomId);

      try {
        // Marcar via WebSocket
        chatSocketService.markAsRead(roomId);

        // Também marcar via API para garantir
        await chatApi.markAsRead(roomId);

        // NÃO atualizar estado localmente aqui - deixar o servidor atualizar via messages_read
        // Isso evita loops infinitos
      } catch (err: any) {
        console.error('Erro ao marcar como lida:', err);
      } finally {
        // Remover da lista após um delay para evitar chamadas muito rápidas
        setTimeout(() => {
          markingAsReadRef.current.delete(roomId);
        }, 2000); // Aumentar delay para 2 segundos
      }
    },
    [messages, getCurrentUser]
  );

  /**
   * Handler para novas mensagens (usando useCallback para manter referência estável)
   */
  const handleNewMessage = useCallback(
    (data: {
      message: ChatMessage;
      timestamp: string;
      isPending?: boolean;
    }) => {
      const { message, isPending } = data;
      const currentUser = getCurrentUser();
      const isOwnMessage = message.senderId === currentUser?.id;


      if (isPending) {
      }

      setMessages(prev => {
        const roomMessages = prev[message.roomId] || [];

        // Verificar se a mensagem já existe (evitar duplicatas)
        const messageExists = roomMessages.some(m => m.id === message.id);
        if (messageExists) {
          return prev;
        }

        // Se for nossa própria mensagem, pode ser uma confirmação de uma mensagem otimista
        if (isOwnMessage) {
          // Procurar mensagem temporária e remover
          const filteredMessages = roomMessages.filter(m => {
            // Remover mensagens temporárias que correspondem à mensagem recebida
            if (m.tempId) {
              // Se tem tempId e o conteúdo corresponde (ou ambos têm imagem)
              const contentMatches =
                m.content === message.content ||
                (m.content === '📷' && message.imageUrl) ||
                (message.content === '📷' && m.imageUrl);
              return !contentMatches;
            }
            return true;
          });

          // Limpar preview de blob se existir
          roomMessages.forEach(m => {
            if (m.tempId && m.imageUrl?.startsWith('blob:')) {
              URL.revokeObjectURL(m.imageUrl);
            }
          });

          // Verificar se a mensagem já existe (pelo ID real)
          const exists = filteredMessages.some(m => m.id === message.id);
          if (exists) {
            // Atualizar status se necessário
            return {
              ...prev,
              [message.roomId]: filteredMessages.map(m =>
                m.id === message.id
                  ? { ...m, ...message, status: message.status }
                  : m
              ),
            };
          }

          // Limpar timeouts de mensagens temporárias removidas
          filteredMessages.forEach(m => {
            if (m.tempId && messageTimeouts.current[m.tempId]) {
              clearTimeout(messageTimeouts.current[m.tempId]);
              delete messageTimeouts.current[m.tempId];
            }
          });

          // Adicionar a mensagem confirmada (substituindo a otimista)
          const confirmedMessage = {
            ...message,
            status: message.status || 'sent',
          };
          return {
            ...prev,
            [message.roomId]: [...filteredMessages, confirmedMessage],
          };
        } else {
          // Mensagem de outro usuário - verificar se já existe
          const exists = roomMessages.some(m => m.id === message.id);
          if (exists) {
            return prev;
          }

          // Se for mensagem pendente, inserir na posição correta (ordem cronológica)
          // Se for mensagem nova, adicionar ao final
          if (isPending) {
            // Inserir mantendo ordem cronológica (mais antigas primeiro)
            const messageWithPending = {
              ...message,
              status: message.status || 'delivered',
              isPending: true,
            };
            const sortedMessages = [...roomMessages, messageWithPending].sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            );
            return {
              ...prev,
              [message.roomId]: sortedMessages,
            };
          } else {
            // Mensagem nova, adicionar ao final
            return {
              ...prev,
              [message.roomId]: [
                ...roomMessages,
                { ...message, status: message.status || 'sent' },
              ],
            };
          }
        }
      });

      // Atualizar última mensagem na lista de salas
      // Para mensagens pendentes, atualizar apenas se for mais recente que a última
      // Para mensagens novas, sempre atualizar
      setRooms(prev => {
        let room = prev.find(r => r.id === message.roomId);

        // Se a sala não existe, buscar os detalhes da sala e adicionar à lista
        if (!room) {
          console.warn(
            '⚠️ [useChat] Sala não encontrada na lista, buscando detalhes:',
            message.roomId
          );
          // Buscar detalhes da sala de forma assíncrona
          chatApi
            .getRoom(message.roomId)
            .then(roomData => {
              setRooms(currentRooms => {
                const exists = currentRooms.some(r => r.id === roomData.id);
                if (!exists) {
                  return [roomData, ...currentRooms];
                }
                return currentRooms.map(r =>
                  r.id === roomData.id ? roomData : r
                );
              });
            })
            .catch(err => {
              console.error(
                '❌ [useChat] Erro ao buscar detalhes da sala:',
                err
              );
            });
          return prev;
        }

        // Verificar se realmente precisa atualizar
        // Garantir que lastMessageAt seja um Date antes de usar getTime()
        const lastMessageAtDate = room.lastMessageAt
          ? room.lastMessageAt instanceof Date
            ? room.lastMessageAt
            : new Date(room.lastMessageAt)
          : null;
        const lastMessageTime = lastMessageAtDate?.getTime() || 0;
        const newMessageTime = new Date(message.createdAt).getTime();

        // Para mensagens pendentes, só atualizar se for mais recente
        // Para mensagens novas, sempre atualizar
        if (isPending && newMessageTime <= lastMessageTime) {
          return prev;
        }

        if (!isPending || newMessageTime > lastMessageTime) {

          return prev.map(r =>
            r.id === message.roomId
              ? {
                  ...r,
                  lastMessage:
                    message.content || (message.imageUrl ? '🖼️ Imagem' : ''),
                  lastMessageAt: new Date(message.createdAt),
                }
              : r
          );
        }

        return prev;
      });

      // Se for a sala atual e não for nossa própria mensagem, marcar como lida automaticamente
      // IMPORTANTE: Não marcar como lida se for mensagem pendente (usuário precisa visualizar primeiro)
      // IMPORTANTE: Verificar se já não está marcando para evitar loop
      if (
        !isOwnMessage &&
        !isPending &&
        currentRoomRef.current === message.roomId &&
        !markingAsReadRef.current.has(message.roomId)
      ) {
        // Usar um timeout maior e verificar novamente antes de chamar
        setTimeout(() => {
          // Verificar novamente se ainda precisa marcar como lida
          if (!markingAsReadRef.current.has(message.roomId)) {
            markAsRead(message.roomId).catch(err => {
              console.error('Erro ao marcar como lida:', err);
            });
          }
        }, 500); // Aumentar delay para evitar chamadas muito rápidas
      }

      // Abrir chat automaticamente e mostrar notificação quando mensagem chegar de outro usuário
      // Não fazer nada se:
      // - For nossa própria mensagem
      // NOTA: Mensagens pendentes também devem abrir o chat se ele estiver fechado
      if (!isOwnMessage) {
        const isChatOpen = currentRoomRef.current === message.roomId;
        const isOnChatPage =
          window.location.pathname === '/chat' ||
          window.location.pathname.startsWith('/chat/');


        // Verificar se o chat flutuante está aberto
        // Usar um pequeno delay para garantir que o DOM foi atualizado
        let isFloatingChatOpen = false;
        try {
          const chatWindowElement = document.querySelector(
            `[data-chat-room-id="${message.roomId}"]`
          ) as HTMLElement;
          isFloatingChatOpen =
            !!chatWindowElement && chatWindowElement.offsetParent !== null;
        } catch (error) {
          console.warn(
            '⚠️ [useChat] Erro ao verificar se chat está aberto:',
            error
          );
        }

        // Verificar se está em foco (não minimizado e é o último aberto)
        // Um chat está em foco se:
        // - Está na página de chat E é a sala atual OU
        // - É um chat flutuante não minimizado E tem o maior z-index (está por cima)
        let isFloatingChatFocused = false;
        if (isFloatingChatOpen) {
          try {
            const chatWindowElement = document.querySelector(
              `[data-chat-room-id="${message.roomId}"]`
            ) as HTMLElement;
            if (chatWindowElement) {
              const isNotMinimized = chatWindowElement.offsetHeight > 100;
              if (isNotMinimized) {
                // Verificar se é o chat com maior z-index (está por cima)
                const allChatWindows = document.querySelectorAll(
                  '[data-chat-room-id]'
                ) as NodeListOf<HTMLElement>;
                let maxZIndex = 0;
                let focusedRoomId: string | null = null;
                allChatWindows.forEach(el => {
                  const zIndex =
                    parseInt(window.getComputedStyle(el).zIndex) || 0;
                  if (zIndex > maxZIndex && el.offsetHeight > 100) {
                    maxZIndex = zIndex;
                    focusedRoomId = el.getAttribute('data-chat-room-id');
                  }
                });
                isFloatingChatFocused = focusedRoomId === message.roomId;
              }
            }
          } catch (error) {
            console.warn('⚠️ [useChat] Erro ao verificar foco do chat:', error);
          }
        }

        // Abrir chat automaticamente se não estiver aberto (respeitando limite de 3)
        // IMPORTANTE: Abrir mesmo para mensagens pendentes se o chat estiver fechado
        // porque o usuário pode não ter visto essas mensagens ainda
        if (!isFloatingChatOpen && !isOnChatPage) {
          // Disparar evento para abrir o chat
          // Usar setTimeout para garantir que o evento seja processado após o ciclo de renderização
          setTimeout(() => {
            const event = new CustomEvent('open-chat', {
              detail: { roomId: message.roomId, forceOpen: false },
            });
            window.dispatchEvent(event);
          }, 100);
        } else {
        }

        // Não mostrar toasts - apenas abrir chat automaticamente se necessário
      }
    },
    [getCurrentUser, markAsRead, rooms]
  );

  // Atualizar ref sempre que handleNewMessage mudar
  useEffect(() => {
    handleNewMessageRef.current = handleNewMessage;
  }, [handleNewMessage]);

  // Wrapper para o handler que usa a ref (criado uma única vez com useCallback)
  const handleNewMessageWrapper = useCallback(
    (data: {
      message: ChatMessage;
      timestamp: string;
      isPending?: boolean;
    }) => {

      if (handleNewMessageRef.current) {
        handleNewMessageRef.current(data);
      } else {
        console.warn(
          '⚠️ [useChat] handleNewMessageRef.current é null! Handler não disponível.'
        );
      }
    },
    []
  );

  /**
   * Inicializa a conexão WebSocket
   */
  useEffect(() => {
    if (!selectedCompany?.id) {
      return;
    }

    const token = getToken();
    if (!token) {
      return;
    }

    // Verificar se já está conectado antes de tentar conectar novamente
    const isAlreadyConnected = chatSocketService.isConnected();

    // Se já está inicializado E conectado, não fazer nada
    if (wsInitialized.current && isAlreadyConnected) {
      setConnected(true);
      return;
    }

    // Se está inicializado mas não conectado, resetar para tentar reconectar
    if (wsInitialized.current && !isAlreadyConnected) {
      wsInitialized.current = false;
    }

    // Conectar ao WebSocket (proteção contra concorrência já no chatSocketService)
    chatSocketService.connect(selectedCompany.id);
    wsInitialized.current = true;

    let cancelled = false;
    const t = setTimeout(() => {
      if (!cancelled && chatSocketService.isConnected()) {
        setConnected(true);
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(t);
      wsInitialized.current = false;
    };
  }, [selectedCompany?.id, getToken]);

  // Atualizar ref quando getCurrentUser mudar
  useEffect(() => {
    getCurrentUserRef.current = getCurrentUser;
  }, [getCurrentUser]);

  /**
   * Registrar listeners do WebSocket.
   * Usa callbacks estáveis (stableListenersRef) para que o cleanup remova apenas
   * os listeners desta instância, evitando acúmulo e eventos duplicados.
   * Deps apenas [selectedCompany?.id] para evitar re-registro a cada mudança de handler.
   */
  useEffect(() => {
    if (!selectedCompany?.id) {
      return;
    }

    // Handlers de eventos
    const handleConnected = async () => {
      setConnected(true);
      setError(null);

      // Registrar automaticamente em todas as salas ao conectar
      // Isso garante que o usuário receba mensagens mesmo sem ter o chat aberto
      const registerInRooms = async () => {
        try {

          // Obter salas do estado atual
          let roomsToJoin: ChatRoom[] = [];

          setRooms(currentRooms => {
            roomsToJoin = currentRooms;
            return currentRooms;
          });

          // Se não há salas no estado, verificar cache global primeiro
          if (roomsToJoin.length === 0) {

            // Verificar cache global
            if (
              globalRoomsCache.companyId === selectedCompany?.id &&
              globalRoomsCache.rooms.length > 0
            ) {
              setRooms(globalRoomsCache.rooms);
              roomsToJoin = globalRoomsCache.rooms;
            } else {
              // Se não há cache, tentar carregar (mas só se não estiver carregando)
              if (!globalRoomsCache.loading && !loadingRoomsRef.current) {
                try {
                  const loadedRooms = await chatApi.getRooms();
                  if (loadedRooms.length > 0) {
                    // Atualizar cache global
                    globalRoomsCache.companyId = selectedCompany?.id || null;
                    globalRoomsCache.rooms = loadedRooms;
                    globalRoomsCache.timestamp = Date.now();
                    globalRoomsCache.loading = false;
                    setRooms(loadedRooms);
                    roomsToJoin = loadedRooms;
                  } else {
                    return;
                  }
                } catch (error) {
                  console.error(
                    '❌ [useChat] Erro ao carregar salas para registro:',
                    error
                  );
                  return;
                }
              } else {
                return;
              }
            }
          }


          // Entrar em todas as salas de forma assíncrona (não bloqueia)
          roomsToJoin.forEach(room => {
            if (chatSocketService.isConnected()) {
              chatSocketService.joinRoom(room.id);
            }
          });
        } catch (error) {
          console.error(
            '❌ [useChat] Erro ao registrar em salas automaticamente:',
            error
          );
        }
      };

      // Executar registro de forma assíncrona
      registerInRooms();
    };

    const handleDisconnected = () => {
      setConnected(false);
    };

    const handleMessagesRead = (data: {
      roomId: string;
      userId: string;
      timestamp: string;
    }) => {
      // Atualizar status das mensagens para 'read'
      // IMPORTANTE: Não chamar markAsRead aqui para evitar loop
      setMessages(prev => {
        const roomMessages = prev[data.roomId] || [];
        const currentUser = getCurrentUserRef.current();

        // Verificar se há mensagens não lidas antes de atualizar
        const hasUnread = roomMessages.some(
          msg =>
            msg.senderId !== currentUser?.id &&
            msg.status !== 'read' &&
            !msg.isDeleted
        );

        if (!hasUnread) {
          return prev; // Já está tudo lido, não precisa atualizar
        }

        // Atualizar apenas as mensagens que realmente precisam ser marcadas como lidas
        return {
          ...prev,
          [data.roomId]: roomMessages.map(msg =>
            msg.status !== 'read' && msg.senderId !== currentUser?.id
              ? { ...msg, status: 'read' as const }
              : msg
          ),
        };
      });
    };

    const handleMessageStatusUpdate = (data: {
      messageId: string;
      status: 'sent' | 'delivered' | 'read';
      timestamp: string;
    }) => {
      // Atualizar status de uma mensagem específica
      setMessages(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(roomId => {
          updated[roomId] = updated[roomId].map(msg =>
            msg.id === data.messageId ? { ...msg, status: data.status } : msg
          );
        });
        return updated;
      });
    };

    const handleMessageEdited = (data: {
      roomId: string;
      originalMessageId: string;
      newMessage: ChatMessage;
      timestamp: string;
    }) => {
      setMessages(prev => {
        const roomMessages = prev[data.roomId] || [];
        // Remover mensagem original e adicionar nova
        const filtered = roomMessages.filter(
          msg => msg.id !== data.originalMessageId
        );
        return {
          ...prev,
          [data.roomId]: [...filtered, data.newMessage],
        };
      });
    };

    const handleMessageDeleted = (data: {
      roomId: string;
      messageId: string;
      timestamp: string;
      deletedBy?: {
        userId: string;
        userName: string;
      };
    }) => {
      setMessages(prev => {
        const roomMessages = prev[data.roomId] || [];
        // Remover mensagem deletada
        return {
          ...prev,
          [data.roomId]: roomMessages.filter(msg => msg.id !== data.messageId),
        };
      });
    };

    const handleError = (data: { message: string; error?: string }) => {
      console.error('Erro no chat:', data);
      setError(data.message || 'Erro na conexão com o chat');
    };

    // Handler para confirmação de envio
    const handleMessageSent = (data: {
      messageId: string;
      timestamp: string;
    }) => {
      // A mensagem já foi adicionada como otimista, apenas atualizar status quando receber new_message
      // Este handler pode ser usado para garantir que a mensagem foi enviada
    };

    // Handler para quando entra na sala
    const handleRoomJoined = (data: { roomId: string; timestamp: string }) => {
    };

    // Handler para quando um participante sai do grupo
    const handleParticipantLeft = (data: {
      roomId: string;
      userId: string;
      userName: string;
      leftAt: string;
      timestamp: string;
      removedBy?: string;
      removedByName?: string;
      isRemoved?: boolean;
    }) => {

      // Atualizar a lista de participantes do room
      setRooms(prev =>
        prev.map(room => {
          if (room.id === data.roomId) {
            // Remover o participante da lista
            const updatedParticipants = room.participants.filter(
              p => p.userId !== data.userId
            );
            return {
              ...room,
              participants: updatedParticipants,
            };
          }
          return room;
        })
      );

      // Criar mensagem do sistema diferenciando entre saída e remoção
      const isRemoved = data.isRemoved || !!data.removedBy;
      const systemMessage: ChatMessage = {
        id: `system-${data.roomId}-${data.userId}-${isRemoved ? 'removed' : 'left'}-${Date.now()}`,
        roomId: data.roomId,
        senderId: 'system',
        senderName: 'Sistema',
        content: isRemoved
          ? `${data.userName} foi removido do grupo${data.removedByName ? ` por ${data.removedByName}` : ''}`
          : `${data.userName} saiu do grupo`,
        status: 'sent',
        isEdited: false,
        isDeleted: false,
        createdAt: new Date(data.leftAt || Date.now()),
        updatedAt: new Date(data.leftAt || Date.now()),
        isSystemMessage: true,
        systemEventType: isRemoved ? 'participant_removed' : 'participant_left',
      };

      // Adicionar mensagem do sistema ao chat
      setMessages(prev => {
        const roomMessages = prev[data.roomId] || [];
        return {
          ...prev,
          [data.roomId]: [...roomMessages, systemMessage],
        };
      });
    };

    // Handler para quando um participante é adicionado (evento WebSocket)
    const handleParticipantAdded = (data: {
      roomId: string;
      userId: string;
      userName: string;
      userAvatar?: string;
      addedBy?: string;
      addedByName?: string;
      timestamp: string;
    }) => {

      // Atualizar a lista de participantes do room
      setRooms(prev =>
        prev.map(room => {
          if (room.id === data.roomId) {
            // Verificar se o participante já existe
            const participantExists = room.participants.some(
              p => p.userId === data.userId
            );
            if (participantExists) {
              return room; // Já existe, não duplicar
            }

            // Adicionar novo participante
            const newParticipant: ChatParticipant = {
              id: `${room.id}-${data.userId}`,
              userId: data.userId,
              userName: data.userName,
              userAvatar: data.userAvatar,
              isActive: true,
              joinedAt: new Date(data.timestamp),
            };

            return {
              ...room,
              participants: [...room.participants, newParticipant],
            };
          }
          return room;
        })
      );

      // Criar mensagem do sistema para entrada no chat
      const systemMessage: ChatMessage = {
        id: `system-${data.roomId}-${data.userId}-joined-${Date.now()}-${Math.random()}`,
        roomId: data.roomId,
        senderId: 'system',
        senderName: 'Sistema',
        content:
          data.addedBy && data.addedByName
            ? `${data.userName} foi adicionado ao grupo por ${data.addedByName}`
            : `${data.userName} entrou no grupo`,
        status: 'sent',
        isEdited: false,
        isDeleted: false,
        createdAt: new Date(data.timestamp || Date.now()),
        updatedAt: new Date(data.timestamp || Date.now()),
        isSystemMessage: true,
        systemEventType: 'participant_joined',
      };

      // Adicionar mensagem do sistema ao chat
      setMessages(prev => {
        const roomMessages = prev[data.roomId] || [];
        return {
          ...prev,
          [data.roomId]: [...roomMessages, systemMessage],
        };
      });
    };

    // Handler para quando um participante é removido (evento específico)
    const handleParticipantRemoved = (data: {
      roomId: string;
      userId: string;
      userName: string;
      removedBy: string;
      removedByName: string;
      timestamp: string;
    }) => {

      // Atualizar a lista de participantes do room
      setRooms(prev =>
        prev.map(room => {
          if (room.id === data.roomId) {
            const updatedParticipants = room.participants.filter(
              p => p.userId !== data.userId
            );
            return {
              ...room,
              participants: updatedParticipants,
            };
          }
          return room;
        })
      );

      // Criar mensagem do sistema
      const systemMessage: ChatMessage = {
        id: `system-${data.roomId}-${data.userId}-removed-${Date.now()}`,
        roomId: data.roomId,
        senderId: 'system',
        senderName: 'Sistema',
        content: `${data.userName} foi removido do grupo por ${data.removedByName}`,
        status: 'sent',
        isEdited: false,
        isDeleted: false,
        createdAt: new Date(data.timestamp || Date.now()),
        updatedAt: new Date(data.timestamp || Date.now()),
        isSystemMessage: true,
        systemEventType: 'participant_removed',
      };

      // Adicionar mensagem do sistema ao chat
      setMessages(prev => {
        const roomMessages = prev[data.roomId] || [];
        return {
          ...prev,
          [data.roomId]: [...roomMessages, systemMessage],
        };
      });
    };

    // Handler para quando uma sala é atualizada (nome, imagem, etc)
    const handleRoomUpdated = (data: {
      roomId: string;
      name?: string;
      imageUrl?: string;
      updatedBy?: string;
      updatedByName?: string;
      timestamp: string;
    }) => {

      // Atualizar informações da sala
      setRooms(prev =>
        prev.map(room => {
          if (room.id === data.roomId) {
            return {
              ...room,
              ...(data.name !== undefined && { name: data.name }),
              ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
              updatedAt: new Date(data.timestamp || Date.now()),
            };
          }
          return room;
        })
      );
    };

    // Atualizar ref com handlers atuais (chamados pelos estáveis no momento do evento)
    handlersRef.current = {
      handleConnected,
      handleDisconnected,
      handleNewMessageWrapper,
      handleMessageSent,
      handleMessagesRead,
      handleMessageStatusUpdate,
      handleMessageEdited,
      handleMessageDeleted,
      handleRoomJoined,
      handleParticipantLeft,
      handleError,
    };

    const stable = stableListenersRef.current;
    chatSocketService.on('chat_connected', stable.chat_connected);
    chatSocketService.on('disconnect', stable.disconnect);
    chatSocketService.on('new_message', stable.new_message);
    chatSocketService.on('message_sent', stable.message_sent);
    chatSocketService.on('messages_read', stable.messages_read);
    chatSocketService.on('message_status_update', stable.message_status_update);
    chatSocketService.on('message_edited', stable.message_edited);
    chatSocketService.on('message_deleted', stable.message_deleted);
    chatSocketService.on('room_joined', stable.room_joined);
    chatSocketService.on('participant_left', stable.participant_left);
    chatSocketService.on('error', stable.error);

    return () => {
      chatSocketService.off('chat_connected', stable.chat_connected);
      chatSocketService.off('disconnect', stable.disconnect);
      chatSocketService.off('new_message', stable.new_message);
      chatSocketService.off('message_sent', stable.message_sent);
      chatSocketService.off('messages_read', stable.messages_read);
      chatSocketService.off('message_status_update', stable.message_status_update);
      chatSocketService.off('message_edited', stable.message_edited);
      chatSocketService.off('message_deleted', stable.message_deleted);
      chatSocketService.off('room_joined', stable.room_joined);
      chatSocketService.off('participant_left', stable.participant_left);
      chatSocketService.off('error', stable.error);
      handlersRef.current = {};
    };
  }, [selectedCompany?.id]);

  /**
   * Atualizar company ID no WebSocket quando mudar
   * NOTA: A reconexão automática agora é gerenciada pelo chatSocketService
   */
  useEffect(() => {
    if (!selectedCompany?.id) {
      return;
    }

    // Apenas atualizar company ID se o socket já estiver conectado
    // A reconexão automática é gerenciada pelo chatSocketService com cooldown
    if (chatSocketService.isConnected()) {
      chatSocketService.updateCompanyId(selectedCompany.id);
    }
  }, [selectedCompany?.id]);

  /**
   * Carregar salas de chat
   */
  const loadRooms = useCallback(async () => {
    if (!selectedCompany?.id) {
      return;
    }

    // Verificar cache global primeiro
    const now = Date.now();
    if (
      globalRoomsCache.companyId === selectedCompany.id &&
      globalRoomsCache.rooms.length > 0 &&
      now - globalRoomsCache.timestamp < CACHE_DURATION
    ) {
      setRooms(globalRoomsCache.rooms);
      roomsLoadedRef.current = selectedCompany.id;
      return;
    }

    // Evitar múltiplas chamadas simultâneas (verificar cache global também)
    if (loadingRoomsRef.current || globalRoomsCache.loading) {
      // Aguardar um pouco e tentar usar o cache se disponível
      setTimeout(() => {
        if (
          globalRoomsCache.companyId === selectedCompany.id &&
          globalRoomsCache.rooms.length > 0
        ) {
          setRooms(globalRoomsCache.rooms);
          roomsLoadedRef.current = selectedCompany.id;
        }
      }, 500);
      return;
    }

    // Verificar se já carregou para esta company (local)
    if (roomsLoadedRef.current === selectedCompany.id) {
      return;
    }

    // Marcar como carregando globalmente
    loadingRoomsRef.current = true;
    globalRoomsCache.loading = true;

    try {
      setLoading(true);
      setError(null);
      const data = await chatApi.getRooms();

      // Atualizar cache global
      globalRoomsCache.companyId = selectedCompany.id;
      globalRoomsCache.rooms = data;
      globalRoomsCache.timestamp = now;
      globalRoomsCache.loading = false;

      setRooms(data);
      roomsLoadedRef.current = selectedCompany.id; // Marcar que carregou para esta company
    } catch (err: any) {
      console.error('Erro ao carregar salas:', err);
      setError(err.message || 'Erro ao carregar salas de chat');
      roomsLoadedRef.current = null; // Resetar em caso de erro para permitir nova tentativa
      globalRoomsCache.loading = false;
    } finally {
      setLoading(false);
      loadingRoomsRef.current = false;
    }
  }, [selectedCompany?.id]);

  /**
   * Carregar salas automaticamente quando o módulo de chat estiver disponível
   */
  useEffect(() => {
    if (!selectedCompany?.id) {
      roomsLoadedRef.current = null;
      // Limpar cache se não há company
      if (globalRoomsCache.companyId) {
        globalRoomsCache.companyId = null;
        globalRoomsCache.rooms = [];
        globalRoomsCache.timestamp = 0;
      }
      return;
    }

    // Se a company mudou, limpar cache local
    if (
      roomsLoadedRef.current &&
      roomsLoadedRef.current !== selectedCompany.id
    ) {
      roomsLoadedRef.current = null;
    }

    // Verificar cache global primeiro
    const now = Date.now();
    if (
      globalRoomsCache.companyId === selectedCompany.id &&
      globalRoomsCache.rooms.length > 0 &&
      now - globalRoomsCache.timestamp < CACHE_DURATION
    ) {
      // Usar cache se disponível e válido
      setRooms(globalRoomsCache.rooms);
      roomsLoadedRef.current = selectedCompany.id;
      return;
    }

    // Se o cache é de outra company, limpar
    if (
      globalRoomsCache.companyId &&
      globalRoomsCache.companyId !== selectedCompany.id
    ) {
      globalRoomsCache.companyId = null;
      globalRoomsCache.rooms = [];
      globalRoomsCache.timestamp = 0;
      globalRoomsCache.loading = false;
    }

    // Carregar apenas se ainda não carregou para esta company e não está carregando (global ou local)
    if (
      roomsLoadedRef.current !== selectedCompany.id &&
      !loadingRoomsRef.current &&
      !globalRoomsCache.loading
    ) {
      loadRooms();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompany?.id]); // Removido loadRooms das dependências para evitar loop

  /**
   * Criar ou obter uma sala
   */
  const createOrGetRoom = useCallback(
    async (data: CreateRoomRequest): Promise<ChatRoom> => {
      try {
        setError(null);
        const room = await chatApi.createOrGetRoom(data);

        // Adicionar à lista se não existir
        setRooms(prev => {
          const exists = prev.some(r => r.id === room.id);
          if (exists) {
            return prev.map(r => (r.id === room.id ? room : r));
          }
          return [room, ...prev];
        });

        return room;
      } catch (err: any) {
        console.error('Erro ao criar/obter sala:', err);
        setError(err.message || 'Erro ao criar sala de chat');
        throw err;
      }
    },
    []
  );

  /**
   * Entrar em uma sala
   */
  const joinRoom = useCallback(
    async (roomId: string) => {
      try {
        setError(null);


        // DEFINIR SALA ATUAL IMEDIATAMENTE (abre o chat instantaneamente)
        setCurrentRoom(roomId);
        currentRoomRef.current = roomId;

        // Entrar via WebSocket (não bloqueia)
        if (!chatSocketService.isConnected()) {
          console.warn(
            '⚠️ [useChat] WebSocket não conectado, tentando conectar...'
          );
          if (selectedCompany?.id) {
            chatSocketService.connect(selectedCompany.id);
            // Não aguardar - conectar em background
          }
        }

        // Entrar na sala via WebSocket (não bloqueia)
        if (chatSocketService.isConnected()) {
          chatSocketService.joinRoom(roomId);
        }

        // Carregar mensagens em background (não bloqueia a abertura do chat)
        // IMPORTANTE: Sempre carregar mensagens via API para garantir que todas estejam presentes
        // Mesmo que já existam mensagens no estado (que chegaram via WebSocket), precisamos
        // carregar as mensagens antigas que podem não ter chegado via WebSocket

        // Marcar como carregando
        setLoadingMessages(prev => ({ ...prev, [roomId]: true }));

        // Carregar mensagens de forma assíncrona (não bloqueia)
        chatApi
          .getMessages(roomId, { limit: 50, offset: 0 })
          .then(roomMessages => {

            // Fazer merge inteligente: manter mensagens que chegaram via WebSocket
            // e adicionar mensagens da API que não existem no estado
            setMessages(prev => {
              const existingMessages = prev[roomId] || [];
              const existingMessageIds = new Set(
                existingMessages.map(m => m.id)
              );

              // Adicionar mensagens da API que não existem no estado
              const newMessagesFromApi = roomMessages.filter(
                m => !existingMessageIds.has(m.id)
              );

              // Combinar: mensagens existentes (que podem ter chegado via WebSocket) + novas da API
              // Ordenar por data para garantir ordem cronológica
              const allMessages = [
                ...existingMessages,
                ...newMessagesFromApi,
              ].sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
              );


              return {
                ...prev,
                [roomId]: allMessages,
              };
            });

            setMessageOffsets(prev => ({
              ...prev,
              [roomId]: roomMessages.length,
            }));
          })
          .catch(err => {
            console.error('❌ [useChat] Erro ao carregar mensagens:', err);
            setError('Erro ao carregar mensagens');
          })
          .finally(() => {
            // Remover estado de loading
            setLoadingMessages(prev => {
              const updated = { ...prev };
              delete updated[roomId];
              return updated;
            });
          });

        // Marcar como lido em background (não bloqueia)
        markAsRead(roomId).catch(err => {
          console.error('❌ [useChat] Erro ao marcar como lido:', err);
        });
      } catch (err: any) {
        console.error('❌ [useChat] Erro ao entrar na sala:', err);
        setError(err.message || 'Erro ao entrar na sala');
      }
    },
    [messages, selectedCompany?.id, markAsRead]
  );

  /**
   * Sair de uma sala
   */
  const leaveRoom = useCallback(
    async (roomId: string) => {
      try {
        chatSocketService.leaveRoom(roomId);
        await chatApi.leaveRoom(roomId);

        // Remover da lista de salas
        setRooms(prev => prev.filter(r => r.id !== roomId));

        // Limpar mensagens
        setMessages(prev => {
          const updated = { ...prev };
          delete updated[roomId];
          return updated;
        });

        if (currentRoom === roomId) {
          setCurrentRoom(null);
          currentRoomRef.current = null;
        }
      } catch (err: any) {
        console.error('Erro ao sair da sala:', err);
        setError(err.message || 'Erro ao sair da sala');
      }
    },
    [currentRoom]
  );

  /**
   * Enviar mensagem
   */
  const sendMessage = useCallback(
    async (roomId: string, content: string, file?: File) => {
      // Converter file único para array files para compatibilidade com backend
      const files = file ? [file] : undefined;
      let tempId: string | undefined;
      let tempFileUrl: string | undefined;
      let tempFileName: string | undefined;
      let tempFileType: string | undefined;

      try {
        // Validar: deve ter conteúdo OU arquivo
        if (!content.trim() && !file) {
          console.warn('⚠️ [useChat] Tentativa de enviar mensagem vazia');
          return;
        }

        // Validar tamanho máximo do conteúdo
        if (content.length > 5000) {
          setError('Mensagem muito longa. Máximo de 5000 caracteres.');
          return;
        }

        setError(null);

        const currentUser = getCurrentUser();
        if (!currentUser) {
          setError('Usuário não autenticado');
          return;
        }

        const trimmedContent = content.trim() || '';

        // IMPORTANTE: Garantir que está na sala antes de enviar mensagem
        // Segundo a documentação, você DEVE estar na sala (join_room) antes de enviar
        if (!selectedCompany?.id) {
          setError('Empresa não selecionada');
          return;
        }

        if (!chatSocketService.isConnected()) {
          console.warn(
            '⚠️ [useChat] WebSocket não conectado, tentando conectar...'
          );
          chatSocketService.connect(selectedCompany.id);
          // Aguardar conexão
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Garantir que está na sala
        if (chatSocketService.isConnected()) {
          chatSocketService.joinRoom(roomId);
          // Aguardar um pouco para garantir que entrou na sala
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Validar arquivo se houver
        if (file) {
          // Validar tipo de arquivo: PDF, PNG, CSV, XLSX, JPG, XML, DOC, DOCX, TXT
          const validTypes = [
            'application/pdf', // PDF
            'image/png', // PNG
            'text/csv', // CSV
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
            'application/vnd.ms-excel', // XLS
            'image/jpeg', // JPG
            'image/jpg', // JPG
            'application/xml', // XML
            'text/xml', // XML
            'application/msword', // DOC
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
            'text/plain', // TXT
          ];

          // Também validar por extensão (caso o tipo MIME não seja detectado corretamente)
          const fileName = file.name.toLowerCase();
          const validExtensions = [
            '.pdf',
            '.png',
            '.csv',
            '.xlsx',
            '.xls',
            '.jpg',
            '.jpeg',
            '.xml',
            '.doc',
            '.docx',
            '.txt',
          ];
          const hasValidExtension = validExtensions.some(ext =>
            fileName.endsWith(ext)
          );

          // Se o tipo MIME estiver vazio ou for genérico, confiar apenas na extensão
          const isEmptyOrGenericType =
            !file.type ||
            file.type === 'application/octet-stream' ||
            file.type === '';

          if (
            !isEmptyOrGenericType &&
            !validTypes.includes(file.type) &&
            !hasValidExtension
          ) {
            setError(
              'Tipo de arquivo inválido. Apenas PDF, PNG, CSV, XLSX, XML, DOC, DOCX, TXT e JPG são permitidos.'
            );
            return;
          }

          // Se o tipo MIME estiver vazio mas a extensão for válida, permitir
          if (isEmptyOrGenericType && !hasValidExtension) {
            setError(
              'Tipo de arquivo inválido. Apenas PDF, PNG, CSV, XLSX, XML, DOC, DOCX, TXT e JPG são permitidos.'
            );
            return;
          }

          // Validar tamanho (10MB)
          const maxSize = 10 * 1024 * 1024; // 10MB
          if (file.size > maxSize) {
            setError('Arquivo muito grande. Tamanho máximo: 10MB.');
            return;
          }

          // Criar preview se for imagem
          if (file.type.startsWith('image/')) {
            tempFileUrl = URL.createObjectURL(file);
          }
          tempFileName = file.name;
          tempFileType = file.type;
        }

        // Criar mensagem otimista (aparece imediatamente)
        tempId = `temp-${Date.now()}-${tempMessageCounter.current++}`;
        const optimisticMessage: ChatMessage = {
          id: tempId,
          roomId,
          senderId: currentUser.id,
          senderName: currentUser.name || 'Você',
          senderAvatar: currentUser.avatar,
          content: trimmedContent || (file ? '📎' : ''),
          fileUrl: tempFileUrl, // Preview local até receber URL do servidor
          fileName: tempFileName,
          fileType: tempFileType,
          imageUrl: tempFileUrl, // Compatibilidade: manter imageUrl se for imagem
          status: 'sending',
          isEdited: false,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          tempId,
        };

        // Adicionar mensagem otimista ao estado
        setMessages(prev => {
          const roomMessages = prev[roomId] || [];
          return {
            ...prev,
            [roomId]: [...roomMessages, optimisticMessage],
          };
        });

        // Atualizar última mensagem na lista de salas
        setRooms(prev =>
          prev.map(room =>
            room.id === roomId
              ? {
                  ...room,
                  lastMessage:
                    trimmedContent ||
                    (file
                      ? file.type.startsWith('image/')
                        ? '🖼️ Imagem'
                        : '📎 Arquivo'
                      : ''),
                  lastMessageAt: new Date(),
                }
              : room
          )
        );

        // Estratégia de envio conforme documentação:
        // - Mensagens COM arquivo: sempre via REST API (FormData)
        // - Mensagens SEM arquivo: tentar WebSocket primeiro, fallback para REST API
        let messageSent = false;

        if (file) {
          // Arquivo sempre via REST API (WebSocket não suporta FormData)
        } else if (chatSocketService.isConnected() && trimmedContent) {
          // Sem imagem e WebSocket conectado: tentar WebSocket primeiro
          messageSent = chatSocketService.sendMessage(roomId, trimmedContent);

          if (!messageSent) {
            console.warn(
              '⚠️ [useChat] Falha ao enviar via WebSocket, tentando API REST'
            );
          } else {
          }
        } else {
          console.warn(
            '⚠️ [useChat] WebSocket não conectado ou conteúdo vazio, enviando via API REST'
          );
        }

        // Enviar via API REST se:
        // - Tem imagem (sempre REST para FormData)
        // - WebSocket não funcionou
        // - WebSocket não está conectado
        if (!messageSent || file) {
          try {
            const savedMessage = await chatApi.sendMessage({
              roomId,
              content: trimmedContent,
              files: files, // Usar files array
            });

            // Atualizar mensagem otimista com a mensagem salva
            setMessages(prev => {
              const roomMessages = prev[roomId] || [];
              return {
                ...prev,
                [roomId]: roomMessages.map(m => {
                  if (m.tempId === tempId) {
                    // Limpar preview local se existir
                    if (m.imageUrl && m.imageUrl.startsWith('blob:')) {
                      URL.revokeObjectURL(m.imageUrl);
                    }
                    return {
                      ...savedMessage,
                      status: savedMessage.status || 'sent',
                    };
                  }
                  return m;
                }),
              };
            });

          } catch (apiError: any) {
            console.error(
              '❌ [useChat] Erro ao enviar via API REST:',
              apiError
            );
            throw new Error(apiError.message || 'Erro ao enviar mensagem');
          }
        }

        // Timeout para rollback se não receber confirmação em 10 segundos
        if (tempId) {
          const timeoutId = setTimeout(() => {
            setMessages(prev => {
              const roomMessages = prev[roomId] || [];
              const messageExists = roomMessages.find(m => m.tempId === tempId);
              if (messageExists && messageExists.status === 'sending') {
                console.warn(
                  '⚠️ [useChat] Timeout ao enviar mensagem, fazendo rollback'
                );
                setError('Falha ao enviar mensagem. Tente novamente.');
                // Limpar preview local se existir
                if (
                  messageExists.imageUrl &&
                  messageExists.imageUrl.startsWith('blob:')
                ) {
                  URL.revokeObjectURL(messageExists.imageUrl);
                }
                return {
                  ...prev,
                  [roomId]: roomMessages.filter(m => m.tempId !== tempId),
                };
              }
              return prev;
            });

            // Reverter última mensagem na lista de salas
            setRooms(prev =>
              prev.map(room => {
                if (room.id === roomId) {
                  const roomMessages = messages[roomId] || [];
                  const previousMessage = roomMessages[roomMessages.length - 2];
                  return {
                    ...room,
                    lastMessage: previousMessage?.content || room.lastMessage,
                    lastMessageAt:
                      previousMessage?.createdAt || room.lastMessageAt,
                  };
                }
                return room;
              })
            );

            // Limpar timeout
            if (messageTimeouts.current[tempId]) {
              delete messageTimeouts.current[tempId];
            }
          }, 10000);

          messageTimeouts.current[tempId] = timeoutId;
        }
      } catch (err: any) {
        console.error('❌ [useChat] Erro ao enviar mensagem:', err);
        setError(err.message || 'Erro ao enviar mensagem');

        // Rollback: Remover mensagem otimista em caso de erro
        if (tempId) {

          // Limpar timeout se existir
          if (messageTimeouts.current[tempId]) {
            clearTimeout(messageTimeouts.current[tempId]);
            delete messageTimeouts.current[tempId];
          }

          setMessages(prev => {
            const roomMessages = prev[roomId] || [];
            const messageToRemove = roomMessages.find(m => m.tempId === tempId);
            // Limpar preview local se existir
            if (
              messageToRemove?.fileUrl &&
              messageToRemove.fileUrl.startsWith('blob:')
            ) {
              URL.revokeObjectURL(messageToRemove.fileUrl);
            }
            if (
              messageToRemove?.imageUrl &&
              messageToRemove.imageUrl.startsWith('blob:')
            ) {
              URL.revokeObjectURL(messageToRemove.imageUrl);
            }
            return {
              ...prev,
              [roomId]: roomMessages.filter(
                m => !m.tempId || m.tempId !== tempId
              ),
            };
          });

          // Reverter última mensagem na lista de salas
          setRooms(prev =>
            prev.map(room => {
              if (room.id === roomId) {
                const roomMessages = messages[roomId] || [];
                const previousMessage = roomMessages[roomMessages.length - 2];
                return {
                  ...room,
                  lastMessage: previousMessage?.content || room.lastMessage,
                  lastMessageAt:
                    previousMessage?.createdAt || room.lastMessageAt,
                };
              }
              return room;
            })
          );
        }
      }
    },
    [getCurrentUser, messages, selectedCompany?.id]
  );

  /**
   * Carregar mais mensagens (paginação)
   */
  const loadMoreMessages = useCallback(
    async (roomId: string) => {
      try {
        const offset = messageOffsets[roomId] || 0;
        const newMessages = await chatApi.getMessages(roomId, {
          limit: 50,
          offset,
        });

        if (newMessages.length > 0) {
          setMessages(prev => ({
            ...prev,
            [roomId]: [...newMessages, ...(prev[roomId] || [])],
          }));
          setMessageOffsets(prev => ({
            ...prev,
            [roomId]: offset + newMessages.length,
          }));
        }
      } catch (err: any) {
        console.error('Erro ao carregar mais mensagens:', err);
        setError(err.message || 'Erro ao carregar mensagens');
      }
    },
    [messageOffsets]
  );

  /**
   * Adicionar participantes a um grupo
   */
  const addParticipants = useCallback(
    async (roomId: string, userIds: string[]) => {
      try {
        setError(null);
        const updatedRoom = await chatApi.addParticipants(roomId, { userIds });
        setRooms(prev => prev.map(r => (r.id === roomId ? updatedRoom : r)));

        // Nota: As mensagens do sistema serão criadas pelo evento WebSocket 'participant_added'
        // Isso garante que todos os usuários vejam a atualização em tempo real
      } catch (err: any) {
        console.error('Erro ao adicionar participantes:', err);
        setError(err.message || 'Erro ao adicionar participantes');
        throw err;
      }
    },
    []
  );

  /**
   * Remover participante de um grupo
   */
  const removeParticipant = useCallback(
    async (roomId: string, userId: string) => {
      try {
        setError(null);
        await chatApi.removeParticipant(roomId, { userId });

        // Atualizar lista de participantes localmente
        setRooms(prev =>
          prev.map(r =>
            r.id === roomId
              ? {
                  ...r,
                  participants: r.participants.filter(p => p.userId !== userId),
                }
              : r
          )
        );

        // Nota: A mensagem do sistema será criada pelo evento WebSocket 'participant_removed'
        // Isso garante que todos os usuários vejam a atualização em tempo real
      } catch (err: any) {
        console.error('Erro ao remover participante:', err);
        setError(err.message || 'Erro ao remover participante');
        throw err;
      }
    },
    []
  );

  /**
   * Editar mensagem
   */
  const editMessage = useCallback(
    async (messageId: string, content: string) => {
      try {
        setError(null);

        if (!content.trim()) {
          setError('Mensagem não pode estar vazia');
          return;
        }

        if (content.length > 5000) {
          setError('Mensagem muito longa. Máximo de 5000 caracteres.');
          return;
        }

        const newMessage = await chatApi.editMessage({
          messageId,
          content: content.trim(),
        });

        // A mensagem será atualizada via WebSocket (message_edited)
        // Mas podemos atualizar localmente também
        setMessages(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(roomId => {
            updated[roomId] = updated[roomId]
              .filter(msg => msg.id !== messageId)
              .concat(newMessage);
          });
          return updated;
        });

        return newMessage;
      } catch (err: any) {
        console.error('❌ [useChat] Erro ao editar mensagem:', err);
        setError(err.message || 'Erro ao editar mensagem');
        throw err;
      }
    },
    []
  );

  /**
   * Atualizar grupo (nome e imageUrl)
   */
  const updateRoom = useCallback(
    async (roomId: string, name?: string, imageUrl?: string) => {
      try {
        setError(null);
        const updatedRoom = await chatApi.updateRoom(roomId, {
          name,
          imageUrl,
        });

        // Atualizar lista de salas
        setRooms(prev => prev.map(r => (r.id === roomId ? updatedRoom : r)));

        return updatedRoom;
      } catch (err: any) {
        console.error('❌ [useChat] Erro ao atualizar grupo:', err);
        setError(err.message || 'Erro ao atualizar grupo');
        throw err;
      }
    },
    []
  );

  /**
   * Fazer upload de imagem do grupo
   */
  const uploadGroupImage = useCallback(
    async (roomId: string, imageFile: File) => {
      try {
        setError(null);
        const updatedRoom = await chatApi.uploadGroupImage(roomId, imageFile);

        // Atualizar lista de salas
        setRooms(prev => prev.map(r => (r.id === roomId ? updatedRoom : r)));

        return updatedRoom;
      } catch (err: any) {
        console.error(
          '❌ [useChat] Erro ao fazer upload de imagem do grupo:',
          err
        );
        setError(err.message || 'Erro ao fazer upload de imagem');
        throw err;
      }
    },
    []
  );

  /**
   * Promover usuários a administrador
   */
  const promoteToAdmin = useCallback(
    async (roomId: string, userIds: string[]) => {
      try {
        setError(null);
        const updatedRoom = await chatApi.promoteToAdmin(roomId, { userIds });

        // Atualizar lista de salas
        setRooms(prev => prev.map(r => (r.id === roomId ? updatedRoom : r)));

        return updatedRoom;
      } catch (err: any) {
        console.error(
          '❌ [useChat] Erro ao promover usuários a administrador:',
          err
        );
        setError(err.message || 'Erro ao promover usuários');
        throw err;
      }
    },
    []
  );

  /**
   * Remover status de administrador
   */
  const removeAdmin = useCallback(async (roomId: string, userIds: string[]) => {
    try {
      setError(null);
      const updatedRoom = await chatApi.removeAdmin(roomId, { userIds });

      // Atualizar lista de salas
      setRooms(prev => prev.map(r => (r.id === roomId ? updatedRoom : r)));

      return updatedRoom;
    } catch (err: any) {
      console.error(
        '❌ [useChat] Erro ao remover status de administrador:',
        err
      );
      setError(err.message || 'Erro ao remover status de administrador');
      throw err;
    }
  }, []);

  /**
   * Arquivar conversa
   */
  const archiveRoom = useCallback(
    async (roomId: string) => {
      try {
        setError(null);

        // Encontrar a sala antes de remover
        const roomToArchive = rooms.find(r => r.id === roomId);

        await chatApi.archiveRoom(roomId);

        // Mover para lista de arquivadas
        if (roomToArchive) {
          setArchivedRooms(prev => [...prev, roomToArchive]);
        }

        // Remover da lista de salas ativas
        setRooms(prev => prev.filter(r => r.id !== roomId));

        // Se estiver na sala arquivada, limpar currentRoom
        if (currentRoom === roomId) {
          setCurrentRoom(null);
        }
      } catch (err: any) {
        console.error('❌ [useChat] Erro ao arquivar conversa:', err);
        setError(err.message || 'Erro ao arquivar conversa');
        throw err;
      }
    },
    [currentRoom, rooms]
  );

  /**
   * Desarquivar conversa
   */
  const unarchiveRoom = useCallback(
    async (roomId: string) => {
      try {
        setError(null);

        // Encontrar a sala arquivada
        const roomToUnarchive = archivedRooms.find(r => r.id === roomId);

        await chatApi.unarchiveRoom(roomId);

        // Mover de volta para lista de salas ativas
        if (roomToUnarchive) {
          setRooms(prev => [...prev, roomToUnarchive]);
        }

        // Remover da lista de arquivadas
        setArchivedRooms(prev => prev.filter(r => r.id !== roomId));
      } catch (err: any) {
        console.error('❌ [useChat] Erro ao desarquivar conversa:', err);
        setError(err.message || 'Erro ao desarquivar conversa');
        throw err;
      }
    },
    [archivedRooms]
  );

  /**
   * Deletar mensagem
   * Só pode deletar mensagens com até 5 minutos de criação
   */
  const deleteMessage = useCallback(
    async (messageId: string) => {
      try {
        setError(null);

        // Buscar a mensagem para validar o tempo
        let messageToDelete: ChatMessage | null = null;
        Object.keys(messages).forEach(roomId => {
          const msg = messages[roomId].find(m => m.id === messageId);
          if (msg) {
            messageToDelete = msg;
          }
        });

        if (!messageToDelete) {
          throw new Error('Mensagem não encontrada');
        }

        // Validar se a mensagem tem menos de 5 minutos
        const messageDate = new Date(messageToDelete.createdAt);
        const now = new Date();
        const diffInMinutes =
          (now.getTime() - messageDate.getTime()) / (1000 * 60);

        if (diffInMinutes > 5) {
          setError(
            'Mensagens só podem ser deletadas dentro de 5 minutos após o envio'
          );
          throw new Error(
            'Mensagens só podem ser deletadas dentro de 5 minutos após o envio'
          );
        }

        await chatApi.deleteMessage({ messageId });

        // A mensagem será removida via WebSocket (message_deleted)
        // Mas podemos remover localmente também para atualização imediata
        setMessages(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(roomId => {
            updated[roomId] = updated[roomId].filter(
              msg => msg.id !== messageId
            );
          });
          return updated;
        });

        // Atualizar última mensagem na lista de salas se necessário
        setRooms(prev =>
          prev.map(room => {
            if (room.id === messageToDelete!.roomId) {
              const roomMessages = messages[messageToDelete!.roomId] || [];
              const remainingMessages = roomMessages.filter(
                m => m.id !== messageId
              );
              const lastMessage =
                remainingMessages[remainingMessages.length - 1];
              return {
                ...room,
                lastMessage: lastMessage?.content || undefined,
                lastMessageAt: lastMessage?.createdAt || room.lastMessageAt,
              };
            }
            return room;
          })
        );
      } catch (err: any) {
        console.error('❌ [useChat] Erro ao deletar mensagem:', err);
        if (!err.message?.includes('5 minutos')) {
          setError(err.message || 'Erro ao deletar mensagem');
        }
        throw err;
      }
    },
    [messages]
  );

  /**
   * Obter histórico de atividades do grupo
   */
  const getRoomHistory = useCallback(
    async (roomId: string): Promise<ChatRoomHistory> => {
      try {
        setError(null);
        const history = await chatApi.getRoomHistory(roomId);
        return history;
      } catch (err: any) {
        console.error('❌ [useChat] Erro ao obter histórico do grupo:', err);
        setError(err.message || 'Erro ao obter histórico do grupo');
        throw err;
      }
    },
    []
  );

  return {
    rooms,
    archivedRooms,
    messages,
    currentRoom,
    loading,
    loadingMessages,
    error,
    connected,
    loadRooms,
    createOrGetRoom,
    joinRoom,
    leaveRoom,
    sendMessage,
    markAsRead,
    loadMoreMessages,
    addParticipants,
    removeParticipant,
    updateRoom,
    uploadGroupImage,
    promoteToAdmin,
    removeAdmin,
    archiveRoom,
    unarchiveRoom,
    setCurrentRoom,
    editMessage,
    deleteMessage,
    getRoomHistory,
  };
};
