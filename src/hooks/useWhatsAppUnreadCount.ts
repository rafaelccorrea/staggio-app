import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { whatsappApi } from '../services/whatsappApi';
import { usePermissionsContextOptional } from '../contexts/PermissionsContext';

const UNREAD_COUNT_INTERVAL_MS = 60000; // 1 minuto – badge não precisa ser em tempo real
const UNREAD_COUNT_THROTTLE_MS = 45000; // Não chamar de novo antes de 45s (evita múltiplos mounts/visibility)

/** True apenas quando o usuário está na página de WhatsApp (API unread-count só é chamada aí). */
function isOnWhatsAppPage(pathname: string): boolean {
  return pathname === '/whatsapp' || pathname.startsWith('/whatsapp/');
}

/**
 * Hook para obter o contador de mensagens não lidas do WhatsApp.
 * Chama a API de unread-count SOMENTE quando o usuário está na página de WhatsApp
 * (evita 403 em outras páginas e reduz chamadas desnecessárias).
 */
export const useWhatsAppUnreadCount = (): number => {
  const { pathname } = useLocation();
  const permissionsContext = usePermissionsContextOptional();
  const [unreadCount, setUnreadCount] = useState(0);
  const lastFetchRef = useRef<number>(0);

  const onWhatsAppPage = isOnWhatsAppPage(pathname);
  const permissionsLoading = permissionsContext?.isLoading ?? true;
  const hasViewMessagesPermission =
    !permissionsLoading &&
    (permissionsContext?.hasPermission('whatsapp:view_messages') ?? false);
  const hasCompanyId = !!localStorage.getItem('dream_keys_selected_company_id');

  const canFetch = onWhatsAppPage && hasViewMessagesPermission && hasCompanyId;

  const loadUnreadCount = useCallback(
    async (force = false) => {
      if (!canFetch) {
        setUnreadCount(0);
        return;
      }
      if (permissionsLoading) {
        setUnreadCount(0);
        return;
      }

      const now = Date.now();
      if (!force && now - lastFetchRef.current < UNREAD_COUNT_THROTTLE_MS) {
        return;
      }
      lastFetchRef.current = now;

      try {
        const count = await whatsappApi.getUnreadCount();
        setUnreadCount(count);
      } catch (err) {
        setUnreadCount(0);
      }
    },
    [canFetch, permissionsLoading, hasViewMessagesPermission, hasCompanyId]
  );

  // Fora da página WhatsApp: nunca chamar API, badge 0
  useEffect(() => {
    if (!onWhatsAppPage) {
      setUnreadCount(0);
      return;
    }
    if (!hasViewMessagesPermission) {
      setUnreadCount(0);
      return;
    }
    loadUnreadCount(true);
  }, [onWhatsAppPage, hasViewMessagesPermission, loadUnreadCount]);

  // Intervalo e visibility: só ativos quando está na página WhatsApp
  useEffect(() => {
    if (!onWhatsAppPage) return;

    let intervalId: NodeJS.Timeout | null = null;
    const handleVisibilityChange = () => {
      if (!document.hidden) setTimeout(() => loadUnreadCount(), 2000);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    intervalId = setInterval(() => {
      if (!document.hidden) loadUnreadCount();
    }, UNREAD_COUNT_INTERVAL_MS);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (intervalId) clearInterval(intervalId);
    };
  }, [onWhatsAppPage, loadUnreadCount]);

  return useMemo(() => unreadCount || 0, [unreadCount]);
};
