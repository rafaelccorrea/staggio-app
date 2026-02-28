import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  MdNotifications,
  MdNotificationsActive,
  MdClose,
  MdWarning,
  MdError,
  MdCheckCircle,
  MdComment,
  MdPerson,
} from 'react-icons/md';
import type { KanbanTask } from '../../types/kanban';
import { useDeadlineAlerts } from '../../hooks/useDeadlineAlerts';
import { useNotifications } from '../../hooks/useNotifications';
import {
  getNotificationNavigationUrl,
  NOTIFICATION_TYPE_LABELS,
} from '../../utils/notificationNavigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const KANBAN_NOTIFICATION_TYPES = [
  'task_assigned',
  'task_due',
  'task_overdue',
  'task_comment_mention',
];

interface KanbanNotificationsProps {
  tasks: KanbanTask[];
  className?: string;
}

const NotificationsContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const NotificationButton = styled.button<{ $hasAlerts: boolean }>`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  position: relative;
  color: ${props =>
    props.$hasAlerts
      ? props.theme.colors.error
      : props.theme.colors.textSecondary};
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.border};
    color: ${props => props.theme.colors.text};
  }
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: 2px;
  right: 2px;
  background: ${props => props.theme.colors.error};
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  border: 2px solid ${props => props.theme.colors.surface};
`;

const NotificationActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  flex: 1 1 100%;
  justify-content: flex-end;
  min-width: 0;

  @media (min-width: 480px) {
    flex: 0 0 auto;
  }
`;

const NotificationDropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  min-width: 280px;
  max-width: min(400px, calc(100vw - 24px));
  width: min(400px, calc(100vw - 24px));
  max-height: 70vh;
  overflow-y: auto;
  z-index: 1000;
  display: ${props => (props.$isOpen ? 'block' : 'none')};
  margin-top: 8px;

  @media (min-width: 480px) {
    width: auto;
    max-height: 400px;
  }
`;

const NotificationHeader = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
`;

const NotificationTitle = styled.h3`
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
  flex: 1 1 100%;
  word-break: break-word;
  min-width: 0;

  @media (min-width: 480px) {
    flex: 1 1 auto;
    font-size: 1rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.border};
    color: ${props => props.theme.colors.text};
  }
`;

const NotificationList = styled.div`
  max-height: min(300px, 50vh);
  overflow-y: auto;

  @media (min-width: 480px) {
    max-height: 300px;
  }
`;

const NotificationItem = styled.div<{ type: 'warning' | 'overdue' }>`
  padding: 12px 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: flex-start;
  gap: 12px;
  transition: background-color 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.background};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const NotificationIcon = styled.div<{ type: 'warning' | 'overdue' }>`
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props =>
    props.type === 'overdue'
      ? props.theme.colors.error
      : props.theme.colors.warning};
  color: ${props => props.theme.colors.cardBackground};
`;

const NotificationContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const NotificationTaskTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 4px;
  word-break: break-word;
`;

const NotificationMessage = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 4px;
`;

const NotificationDate = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const EmptyState = styled.div`
  padding: 24px 16px;
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.875rem;
`;

const ClearAllButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => `${props.theme.colors.primary}20`};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const MarkAsReadButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 6px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  .mark-read-label {
    white-space: nowrap;
  }

  @media (max-width: 380px) {
    .mark-read-label {
      display: none;
    }
    padding: 6px 8px;
  }

  @media (min-width: 381px) and (max-width: 479px) {
    font-size: 0.7rem;
    padding: 6px 6px;
    .mark-read-label {
      white-space: normal;
      max-width: 120px;
      line-height: 1.2;
    }
  }

  &:hover {
    background: ${props => `${props.theme.colors.primary}20`};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NotificationItemActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const MarkItemAsReadButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background: ${props => `${props.theme.colors.primary}20`};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NotificationItemRead = styled.div<{ $isRead: boolean }>`
  opacity: ${props => (props.$isRead ? 0.6 : 1)};
  position: relative;

  ${props =>
    props.$isRead &&
    `
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: ${props.theme.colors.background};
      opacity: 0.3;
      pointer-events: none;
    }
  `}
`;

const SectionTitle = styled.div`
  font-size: 0.7rem;
  font-weight: 600;
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 10px 16px 6px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const ApiNotificationItem = styled.div<{ $isRead: boolean }>`
  padding: 12px 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  opacity: ${props => (props.$isRead ? 0.7 : 1)};

  &:hover {
    background: ${props => props.theme.colors.background};
  }
`;

const ApiNotificationIcon = styled.div`
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.primary}20;
  color: ${props => props.theme.colors.primary};
`;

export const KanbanNotifications: React.FC<KanbanNotificationsProps> = ({
  tasks,
  className,
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { alerts, unreadCount, markAsRead, markAllAsRead, refreshAlerts } =
    useDeadlineAlerts();
  const {
    notifications,
    markAsRead: markNotificationAsRead,
    markAllAsRead: markAllNotificationsAsRead,
    isMarkingAllAsRead,
  } = useNotifications();

  const apiNotifications = useMemo(
    () =>
      notifications.filter(n => KANBAN_NOTIFICATION_TYPES.includes(n.type)),
    [notifications]
  );
  const apiUnreadCount = useMemo(
    () => apiNotifications.filter(n => !n.read).length,
    [apiNotifications]
  );
  const totalUnread = apiUnreadCount + unreadCount;

  useEffect(() => {
    refreshAlerts(tasks);
  }, [tasks, refreshAlerts]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    markAllAsRead(); // atualiza estado local dos alertas de prazo
    await markAllNotificationsAsRead(); // chama API para marcar notificações como lidas no servidor
  };

  const handleMarkAsRead = async (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    markAsRead(alertId);
    // Marcar também a notificação correspondente na API (task_due/task_overdue) para a contagem atualizar
    if (alert) {
      const toMark = apiNotifications.filter(
        n => !n.read && n.entityId === alert.taskId
      );
      for (const n of toMark) {
        await markNotificationAsRead(n.id);
      }
    }
  };

  const handleApiNotificationClick = (notification: {
    id: string;
    read: boolean;
    entityId: string | null;
    entityType: string | null;
    actionUrl: string | null;
    metadata: Record<string, any> | null;
    type: string;
  }) => {
    const url =
      getNotificationNavigationUrl(notification as any) ||
      (notification.entityId
        ? `/kanban/task/${notification.entityId}`
        : null);
    if (url) {
      navigate(url);
      if (!notification.read) {
        markNotificationAsRead(notification.id);
      }
      handleClose();
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <NotificationsContainer className={className}>
      <NotificationButton $hasAlerts={totalUnread > 0} onClick={handleToggle}>
        {totalUnread > 0 ? (
          <MdNotificationsActive size={24} />
        ) : (
          <MdNotifications size={24} />
        )}
        {totalUnread > 0 && (
          <NotificationBadge>
            {totalUnread > 99 ? '99+' : totalUnread}
          </NotificationBadge>
        )}
      </NotificationButton>

      <NotificationDropdown $isOpen={isOpen}>
        <NotificationHeader>
          <NotificationTitle>
            Notificações do funil ({totalUnread} não lidas)
          </NotificationTitle>
          <NotificationActions>
            {totalUnread > 0 && (
              <>
                {apiUnreadCount > 0 && (
                  <MarkAsReadButton
                    onClick={() => markAllNotificationsAsRead()}
                    title="Marcar notificações como lidas"
                    disabled={isMarkingAllAsRead}
                  >
                    <MdCheckCircle size={14} />
                    <span className="mark-read-label">
                      {isMarkingAllAsRead ? 'Salvando...' : 'Marcar notificações como lidas'}
                    </span>
                  </MarkAsReadButton>
                )}
                {unreadCount > 0 && (
                  <MarkAsReadButton
                    onClick={() => handleMarkAllAsRead()}
                    title="Marcar alertas como lidos"
                    disabled={isMarkingAllAsRead}
                  >
                    <MdCheckCircle size={14} />
                    <span className="mark-read-label">
                      {isMarkingAllAsRead ? 'Salvando...' : 'Marcar alertas como lidos'}
                    </span>
                  </MarkAsReadButton>
                )}
              </>
            )}
            <CloseButton onClick={handleClose}>
              <MdClose size={16} />
            </CloseButton>
          </NotificationActions>
        </NotificationHeader>

        <NotificationList>
          {apiNotifications.length > 0 && (
            <>
              <SectionTitle>Notificações</SectionTitle>
              {apiNotifications.map(notification => (
                <ApiNotificationItem
                  key={notification.id}
                  $isRead={notification.read}
                  onClick={() => handleApiNotificationClick(notification)}
                >
                  <ApiNotificationIcon>
                    {notification.type === 'task_comment_mention' ? (
                      <MdComment size={16} />
                    ) : (
                      <MdPerson size={16} />
                    )}
                  </ApiNotificationIcon>
                  <NotificationContent>
                    <NotificationTaskTitle>
                      {NOTIFICATION_TYPE_LABELS[notification.type] ||
                        notification.title}
                    </NotificationTaskTitle>
                    <NotificationMessage>
                      {notification.message}
                    </NotificationMessage>
                    <NotificationDate>
                      {notification.createdAt
                        ? format(
                            new Date(notification.createdAt),
                            "dd/MM/yyyy 'às' HH:mm",
                            { locale: ptBR }
                          )
                        : ''}
                    </NotificationDate>
                  </NotificationContent>
                </ApiNotificationItem>
              ))}
            </>
          )}

          {alerts.length > 0 && (
            <>
              <SectionTitle>Alertas de prazo</SectionTitle>
              {alerts.map(alert => (
                <NotificationItem
                  key={alert.id}
                  type={alert.type}
                  as={NotificationItemRead}
                  $isRead={alert.isRead}
                >
                  <NotificationIcon type={alert.type}>
                    {alert.type === 'overdue' ? (
                      <MdError size={16} />
                    ) : (
                      <MdWarning size={16} />
                    )}
                  </NotificationIcon>
                  <NotificationContent>
                    <NotificationTaskTitle>
                      {alert.taskTitle}
                    </NotificationTaskTitle>
                    <NotificationMessage>{alert.message}</NotificationMessage>
                    <NotificationDate>
                      Vence em: {formatDate(alert.dueDate)}
                    </NotificationDate>
                    {!alert.isRead && (
                      <NotificationItemActions>
                        <MarkItemAsReadButton
                          onClick={() => handleMarkAsRead(alert.id)}
                        >
                          <MdCheckCircle size={14} />
                          Marcar como lida
                        </MarkItemAsReadButton>
                      </NotificationItemActions>
                    )}
                  </NotificationContent>
                </NotificationItem>
              ))}
            </>
          )}

          {apiNotifications.length === 0 && alerts.length === 0 && (
            <EmptyState>Nenhuma notificação do funil no momento</EmptyState>
          )}
        </NotificationList>
      </NotificationDropdown>
    </NotificationsContainer>
  );
};

export default KanbanNotifications;
