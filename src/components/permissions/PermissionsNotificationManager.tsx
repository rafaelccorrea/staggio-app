import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PermissionsNotification } from '../notifications/PermissionsNotification';
import { usePermissionsSocket } from '../../hooks/usePermissionsSocket';
import { authStorage } from '../../services/authStorage';
import { showForceLogoutNotification } from '../../utils/notifications';

/**
 * Componente que gerencia as notificações de mudanças de permissões em tempo real
 * Deve ser incluído no layout principal da aplicação
 */
export const PermissionsNotificationManager: React.FC = () => {
  const navigate = useNavigate();
  const token = authStorage.getToken();
  const [notification, setNotification] = useState<{
    isVisible: boolean;
    type: 'success' | 'info';
    title: string;
    message: string;
  }>({
    isVisible: false,
    type: 'success',
    title: '',
    message: '',
  });

  const handlePermissionsChanged = (event: any) => {
    let title = 'Permissões Atualizadas';
    const message = event.message || 'Suas permissões foram atualizadas';
    let type: 'success' | 'info' = 'success';

    switch (event.action) {
      case 'added':
        title = '✅ Nova Permissão';
        type = 'success';
        break;
      case 'removed':
        title = '⚠️ Permissão Removida';
        type = 'info';
        break;
      case 'updated':
        title = '🔄 Permissões Atualizadas';
        type = 'info';
        break;
    }

    setNotification({
      isVisible: true,
      type,
      title,
      message,
    });
  };

  const handleRoleChanged = (event: any) => {
    setNotification({
      isVisible: true,
      type: 'info',
      title: '👤 Perfil Alterado',
      message: event.message || `Seu perfil foi alterado para ${event.newRole}`,
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({
      ...prev,
      isVisible: false,
    }));
  };

  // Conectar ao WebSocket para receber notificações
  const { socket } = usePermissionsSocket(
    token,
    handlePermissionsChanged,
    handleRoleChanged
  );

  // Adicionar listener para force-logout conforme documentação
  useEffect(() => {
    if (!socket) return;

    const handleForceLogout = (data: any) => {
      // Verificar se o logout foi causado por refresh de token
      const isTokenRefresh =
        data.reason === 'token_refresh' ||
        data.message?.includes('token') ||
        data.message?.includes('refresh');

      if (isTokenRefresh) {
        return;
      }

      // Limpar dados de autenticação
      authStorage.clearAllAuthData();

      // Mostrar notificação
      const message = data.message || 'Você foi desconectado do sistema';
      showForceLogoutNotification(
        `${message}\n\nVocê será redirecionado para a tela de login.`
      );

      // Redirecionar após delay
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    };

    socket.on('force-logout', handleForceLogout);

    return () => {
      socket.off('force-logout', handleForceLogout);
    };
  }, [socket, navigate]);

  return (
    <PermissionsNotification
      isVisible={notification.isVisible}
      onClose={handleCloseNotification}
      type={notification.type}
      title={notification.title}
      message={notification.message}
      autoClose={true}
      autoCloseDelay={6000}
    />
  );
};
