import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useOwner } from './useOwner';
import { subscriptionService } from '../services/subscriptionService';

export interface InitializationState {
  isLoading: boolean;
  isCheckingSubscription: boolean;
  hasActiveSubscription: boolean | null;
  error: string | null;
}

export const useInitializationFlow = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getCurrentUser } = useAuth();
  const { isOwner } = useOwner();
  const [state, setState] = useState<InitializationState>({
    isLoading: true,
    isCheckingSubscription: false,
    hasActiveSubscription: null,
    error: null,
  });

  // Refs para evitar loops
  const isInitializingRef = useRef(false);
  const hasExecutedRef = useRef(false); // Flag para executar apenas uma vez
  const processedPathsRef = useRef<Set<string>>(new Set()); // Rastrear rotas já processadas
  const isNavigatingRef = useRef(false); // Flag para evitar execuções durante navegação
  const lastNavigationTimeRef = useRef<number>(0); // Timestamp da última navegação

  const checkSubscriptionStatus = async () => {
    try {
      setState(prev => ({
        ...prev,
        isCheckingSubscription: true,
        error: null,
      }));

      const selectedCompanyId = localStorage.getItem(
        'dream_keys_selected_company_id'
      );

      // Verificar se o usuário é owner antes de chamar APIs de assinatura
      const user = getCurrentUser();
      if (!user || user.owner !== true) {
        // Usuário não é owner, não deve acessar APIs de assinatura
        setState(prev => ({
          ...prev,
          hasActiveSubscription: null,
          isLoading: false,
        }));

        // Se não tem Company ID, SEMPRE ir para criar primeira empresa
        if (!selectedCompanyId) {
          if (
            location.pathname !== '/verifying-access' &&
            location.pathname !== '/create-first-company'
          ) {
            navigate('/verifying-access', { replace: true });
          }
        } else {
          // CORREÇÃO: Não redirecionar se já está em uma rota válida (kanban, tasks, etc)
          const currentPath = location.pathname;
          const isKanbanRoute = currentPath.startsWith('/kanban');
          const isTaskDetailsRoute = currentPath.startsWith('/kanban/tasks/');

          if (!isKanbanRoute && !isTaskDetailsRoute) {
            // Tem Company ID, verificar role do usuário para redirecionar
            const user = getCurrentUser();
            const targetPath = user?.role === 'user' ? '/kanban' : '/dashboard';
            if (currentPath !== targetPath) {
              navigate(targetPath, { replace: true });
            }
          } else {
          }
        }
        return;
      }

      // Primeiro, usar /subscriptions/my-usage para validar assinatura
      try {
        const usage = await subscriptionService.getMySubscriptionUsage();
        if (usage) {
          setState(prev => ({ ...prev, hasActiveSubscription: true }));

          // Só navegar se não estiver já na rota correta
          if (
            !selectedCompanyId &&
            location.pathname !== '/verifying-access' &&
            location.pathname !== '/create-first-company'
          ) {
            navigate('/verifying-access', { replace: true });
          } else if (selectedCompanyId) {
            // CORREÇÃO: Não redirecionar se já está em uma rota válida (kanban, tasks, etc)
            const currentPath = location.pathname;
            const isKanbanRoute = currentPath.startsWith('/kanban');
            const isTaskDetailsRoute = currentPath.startsWith('/kanban/tasks/');

            if (!isKanbanRoute && !isTaskDetailsRoute) {
              const user = getCurrentUser();
              const targetPath =
                user?.role === 'user' ? '/kanban' : '/dashboard';
              if (currentPath !== targetPath) {
                navigate(targetPath, { replace: true });
              }
            } else {
            }
          }
          return;
        }
      } catch (usageError: any) {
        const usageStatus = usageError?.response?.status;
        const usageMessage = (
          usageError?.response?.data?.message ?? ''
        ).toLowerCase();

        if (usageStatus === 404) {
          if (usageMessage.includes('empresa')) {
            setState(prev => ({ ...prev, hasActiveSubscription: true }));
            if (
              location.pathname !== '/verifying-access' &&
              location.pathname !== '/create-first-company'
            ) {
              navigate('/verifying-access', { replace: true });
            }
            return;
          }

          if (
            usageMessage.includes('assinatura') ||
            usageMessage.includes('subscription')
          ) {
            setState(prev => ({ ...prev, hasActiveSubscription: false }));
            if (location.pathname !== '/subscription-plans') {
              navigate('/subscription-plans', { replace: true });
            }
            return;
          }
        }

        if (usageStatus === 401) {
          setState(prev => ({ ...prev, hasActiveSubscription: null }));
          if (location.pathname !== '/subscription-management') {
            navigate('/subscription-management', { replace: true });
          }
          return;
        }
      }

      // Fallback: usar /subscriptions/check-access para estados especiais
      const accessInfo = await subscriptionService.checkSubscriptionAccess();



      // CORREÇÃO CRÍTICA: SEMPRE verificar hasAccess PRIMEIRO antes de qualquer outra coisa
      if (!accessInfo.hasAccess) {
        // Não tem acesso - verificar o motivo
        const status = accessInfo.status as string;


        setState(prev => ({ ...prev, hasActiveSubscription: false }));

        // Se status é "none" (sem assinatura), SEMPRE ir para planos, independente de ter empresa
        if (status === 'none') {
          if (location.pathname !== '/subscription-plans') {
            navigate('/subscription-plans', { replace: true });
          }
          return;
        }

        // Para outros status (expired, suspended, etc), ir para gestão de assinatura
        if (location.pathname !== '/subscription-management') {
          navigate('/subscription-management', { replace: true });
        }
        return;
      }

      // Se chegou aqui, tem acesso (hasAccess === true)

      // Agora sim verificar empresas
      setState(prev => ({ ...prev, hasActiveSubscription: true }));

      const missingCompanyAssociation =
        !selectedCompanyId &&
        typeof accessInfo.reason === 'string' &&
        accessInfo.reason.toLowerCase().includes('empresa');


      // Se tem assinatura mas não tem empresa, redirecionar para criar primeira empresa
      if (!selectedCompanyId || missingCompanyAssociation) {
        if (
          location.pathname !== '/verifying-access' &&
          location.pathname !== '/create-first-company'
        ) {
          navigate('/verifying-access', { replace: true });
        }
      } else {
        // CORREÇÃO: Não redirecionar se já está em uma rota válida (kanban, tasks, etc)
        const currentPath = location.pathname;
        const isKanbanRoute = currentPath.startsWith('/kanban');
        const isTaskDetailsRoute = currentPath.startsWith('/kanban/tasks/');

        if (!isKanbanRoute && !isTaskDetailsRoute) {
          if (currentPath !== '/dashboard') {
            navigate('/dashboard', { replace: true });
          }
        } else {
        }
      }
    } catch (error) {
      console.error('❌ Erro ao verificar status da assinatura:', error);
      setState(prev => ({
        ...prev,
        error: 'Erro ao verificar status da assinatura',
        hasActiveSubscription: prev.hasActiveSubscription,
      }));
      // Em caso de erro, direcionar para gerenciamento para evitar confundir usuários com assinatura ativa
      navigate('/subscription-management');
    } finally {
      setState(prev => ({
        ...prev,
        isCheckingSubscription: false,
        isLoading: false,
      }));
    }
  };

  const initializeUserFlow = async () => {
    const currentPath = location.pathname;

    // Evitar múltiplas execuções simultâneas
    if (isInitializingRef.current) {
      return;
    }

    // Se já processou esta rota, não executar novamente
    if (processedPathsRef.current.has(currentPath)) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    isInitializingRef.current = true;
    processedPathsRef.current.add(currentPath);

    const user = getCurrentUser();

    if (!user) {
      setState(prev => ({ ...prev, isLoading: false }));
      isInitializingRef.current = false;
      return;
    }

    // CORREÇÃO: Não executar se já estamos em uma rota de assinatura (já foi redirecionado pelo useAuth)
    const subscriptionRoutes = [
      '/subscription-plans',
      '/subscription-management',
      '/my-subscription',
      '/verifying-access',
      '/create-first-company',
      '/system-unavailable',
      '/commission-config',
    ];

    // CORREÇÃO: Rotas públicas que não devem ser redirecionadas
    const publicRoutes = [
      '/',
      '/login',
      '/register',
      '/forgot-password',
      '/reset-password',
    ];
    const isPublicRoute =
      publicRoutes.includes(location.pathname) ||
      location.pathname.startsWith('/public/') ||
      location.pathname.startsWith('/forgot-password') ||
      location.pathname.startsWith('/reset-password');

    const isOnSubscriptionRoute = subscriptionRoutes.some(
      route =>
        location.pathname === route || location.pathname.startsWith(route + '/')
    );

    if (isOnSubscriptionRoute) {
      setState(prev => ({ ...prev, isLoading: false }));
      isInitializingRef.current = false;
      return;
    }

    // CORREÇÃO: Não redirecionar se estiver em rota pública (como landing page)
    if (isPublicRoute) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    // CORREÇÃO: Não chamar API de companies aqui - isso já é feito no useAuth
    // Apenas verificar se já tem Company ID definido
    const selectedCompanyId = localStorage.getItem(
      'dream_keys_selected_company_id'
    );


    if (selectedCompanyId) {
      setState(prev => ({ ...prev, isLoading: false }));

      const redirectablePaths = ['/login', '/register'];
      if (redirectablePaths.includes(location.pathname)) {
        const user = getCurrentUser();
        const targetPath = user?.role === 'user' ? '/kanban' : '/dashboard';
        navigate(targetPath, { replace: true });
      }
      isInitializingRef.current = false;
      return;
    }

    // Se não tem Company ID, verificar se é usuário master/admin sem empresas
    // CORREÇÃO: Só verificar assinatura se NÃO estiver em rota de assinatura E for owner
    if (
      (user.role === 'admin' || user.role === 'master' || isOwner) &&
      !isOnSubscriptionRoute &&
      isOwner
    ) {
      await checkSubscriptionStatus();
    } else {
      // Usuário não é owner ou já está em rota de assinatura
      // Se não tem Company ID e não é owner, ir para criar primeira empresa
      if (!selectedCompanyId && !isOwner) {
        setState(prev => ({ ...prev, isLoading: false }));
        processedPathsRef.current.add('/verifying-access');
        processedPathsRef.current.add('/create-first-company');
        processedPathsRef.current.add(currentPath);
        if (
          location.pathname !== '/verifying-access' &&
          location.pathname !== '/create-first-company'
        ) {
          navigate('/verifying-access', { replace: true });
        }
      } else {
        // CORREÇÃO: Não redirecionar se estamos navegando devido a erro de validação do kanban
        const isKanbanValidationNavigation =
          sessionStorage.getItem('_kanban_validation_navigation') === 'true';
        if (isKanbanValidationNavigation) {
          setState(prev => ({ ...prev, isLoading: false }));
          return;
        }

        // Tem Company ID ou é owner, verificar role para redirecionar
        const currentPath = location.pathname;
        const isKanbanRoute = currentPath.startsWith('/kanban');

        if (!isKanbanRoute && !isOnSubscriptionRoute) {
          const user = getCurrentUser();
          const targetPath = user?.role === 'user' ? '/kanban' : '/dashboard';
          setState(prev => ({ ...prev, isLoading: false }));
          if (currentPath !== targetPath) {
            navigate(targetPath, { replace: true });
          }
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      }
    }

    isInitializingRef.current = false;
  };

  useEffect(() => {
    const currentPath = location.pathname;
    const selectedCompanyId = localStorage.getItem(
      'dream_keys_selected_company_id'
    );

    // CORREÇÃO: Se está navegando, aguardar um pouco antes de executar novamente
    const now = Date.now();
    if (isNavigatingRef.current && now - lastNavigationTimeRef.current < 2000) {
      return;
    }

    // CORREÇÃO: Não executar se estamos navegando devido a erro de validação do kanban
    const isKanbanValidationNavigation =
      sessionStorage.getItem('_kanban_validation_navigation') === 'true';
    const validationTarget = sessionStorage.getItem(
      '_kanban_validation_target'
    );
    const isOnValidationTarget =
      validationTarget &&
      currentPath.includes(validationTarget.replace('/sistema', ''));

    if (isKanbanValidationNavigation || isOnValidationTarget) {
      setState(prev => ({ ...prev, isLoading: false }));
      // Marcar rota como processada para evitar execuções futuras
      processedPathsRef.current.add(currentPath);
      return;
    }

    // CORREÇÃO: Debounce - evitar execuções muito frequentes (máximo 1 vez por segundo)
    const lastExecutionTime = (window as any).__lastInitFlowExecution || 0;
    if (now - lastExecutionTime < 1000) {
      return;
    }
    (window as any).__lastInitFlowExecution = now;

    // CORREÇÃO CRÍTICA: Se já está em /verifying-access ou /create-first-company, não executar NADA
    if (
      currentPath === '/verifying-access' ||
      currentPath === '/create-first-company'
    ) {
      setState(prev => ({ ...prev, isLoading: false }));
      processedPathsRef.current.add(currentPath);
      isNavigatingRef.current = false;
      return;
    }

    // CORREÇÃO: Rotas públicas que não precisam de inicialização
    const publicRoutes = [
      '/',
      '/login',
      '/register',
      '/forgot-password',
      '/reset-password',
      '/verify-email',
      '/confirm-email',
    ];

    const excludedPaths = [
      '/commission-config',
      ...publicRoutes,
      '/system-unavailable',
      '/subscription-plans',
      '/subscription-management',
      '/my-subscription',
      '/verifying-access',
      '/create-first-company',
      '/kanban',
    ];

    // Verificar se é rota pública (incluindo rotas que começam com /public/)
    const isPublicRoute =
      publicRoutes.includes(currentPath) ||
      currentPath.startsWith('/public/') ||
      currentPath.startsWith('/forgot-password') ||
      currentPath.startsWith('/reset-password') ||
      currentPath.startsWith('/verify-email') ||
      currentPath.startsWith('/confirm-email');

    const isExcludedPath = excludedPaths.some(
      path => currentPath === path || currentPath.startsWith(path + '/')
    );

    const needsInitialization = !isExcludedPath && !isPublicRoute;


    // CORREÇÃO: Não executar inicialização em rotas públicas
    if (isPublicRoute) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    // CORREÇÃO CRÍTICA: Se está em /dashboard sem Company ID e não é owner,
    // SEMPRE navegar para /verifying-access
    if (currentPath === '/dashboard' && !selectedCompanyId && !isOwner) {
      if (
        processedPathsRef.current.has('/verifying-access') &&
        now - lastNavigationTimeRef.current < 3000
      ) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      setState(prev => ({ ...prev, isLoading: false }));
      processedPathsRef.current.add(currentPath);
      processedPathsRef.current.add('/verifying-access');
      isNavigatingRef.current = true;
      lastNavigationTimeRef.current = now;
      navigate('/verifying-access', { replace: true });
      // Resetar flag após um delay maior para evitar loops
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 3000);
      return;
    }

    // CORREÇÃO: Se já está em uma rota de destino, não executar novamente
    if (isExcludedPath) {
      setState(prev => ({ ...prev, isLoading: false }));
      // Marcar como processada para evitar loops
      processedPathsRef.current.add(currentPath);
      return;
    }

    // CORREÇÃO: Se já processou esta rota, não executar novamente
    if (processedPathsRef.current.has(currentPath)) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    // Executar apenas se precisa de inicialização
    if (needsInitialization) {
      initializeUserFlow();
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [location.pathname, isOwner]); // Removido navigate das dependências para evitar loops

  return {
    ...state,
    checkSubscriptionStatus,
  };
};
