import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { subscriptionService } from '../services/subscriptionService';
import type {
  LoginFormData,
  RegisterFormData,
  AuthResponse,
} from '../types/auth';
import { authStorage } from '../services/authStorage';
import { twoFactorAuthApi } from '../services/twoFactorAuthApi';
import type { CheckTwoFactorResponse } from '../services/twoFactorAuthApi';

// Cache simples para reduzir chamadas ao endpoint público de check-2fa
const check2FACache = new Map<
  string,
  { result: CheckTwoFactorResponse; timestamp: number }
>();
const CHECK_2FA_CACHE_TTL_MS = 60_000; // 1 minuto

interface UseAuthReturn {
  isLoading: boolean;
  alert: {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  } | null;
  emailConfirmationModal: {
    isOpen: boolean;
    email: string;
  };
  mfa: {
    required: boolean;
    error: string | null;
    open: () => void;
    close: () => void;
    verify: (code: string) => Promise<void>;
  };
  mfaSetup: {
    required: boolean;
    error: string | null;
    open: () => void;
    close: () => void;
    start: () => Promise<any>;
    verifyAndLogin: (code: string) => Promise<boolean>;
  };
  login: (data: LoginFormData & { rememberMe?: boolean }) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => void;
  logoutComplete: () => void;
  clearAlert: () => void;
  closeEmailConfirmationModal: () => void;
  getCurrentUser: () => any;
  getToken: () => string | null;
  isAuthenticated: () => boolean;
  hasCompany: () => boolean;
  refreshUser: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  } | null>(null);
  const [emailConfirmationModal, setEmailConfirmationModal] = useState({
    isOpen: false,
    email: '',
  });
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [tempTokenExpiresAt, setTempTokenExpiresAt] = useState<number | null>(
    null
  );
  const [pendingLogin, setPendingLogin] = useState<{
    email: string;
    password: string;
    remember: boolean;
  } | null>(null);
  const [setupRequired, setSetupRequired] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  // Verificar autenticação ao inicializar
  useEffect(() => {
    if (authStorage.isAuthenticated()) {
      // Usuário já autenticado
    }
  }, []);

  const isTempTokenValid = (
    token?: string | null,
    expiresAt?: number | null
  ) => {
    if (!token || !expiresAt) return false;
    return Date.now() < expiresAt;
  };

  const setTempTokenWithExpiry = (token: string | null) => {
    if (!token) {
      setTempToken(null);
      setTempTokenExpiresAt(null);
      return;
    }
    setTempToken(token);
    // 5 minutos de validade fornecidos pelo backend
    setTempTokenExpiresAt(Date.now() + 5 * 60 * 1000);
  };

  const checkTwoFactorStatusCached = async (email: string) => {
    const cached = check2FACache.get(email);
    if (cached && Date.now() - cached.timestamp < CHECK_2FA_CACHE_TTL_MS) {
      return cached.result;
    }
    const result = await twoFactorAuthApi.checkTwoFactorStatus(email);
    check2FACache.set(email, { result, timestamp: Date.now() });
    return result;
  };

  const clearAlert = () => setAlert(null);

  const closeEmailConfirmationModal = () => {
    setEmailConfirmationModal({
      isOpen: false,
      email: '',
    });
  };

  // Obter página inicial preferida do usuário
  const getHomePagePreference = (): string => {
    const STORAGE_KEY = 'user_home_page_preference';
    return localStorage.getItem(STORAGE_KEY) || '/dashboard';
  };

  const handleAuthSuccess = async (
    response: AuthResponse,
    successMessage: string,
    rememberMe: boolean = false
  ) => {
    // Observação: quando 2FA é necessário, o backend NÃO retorna tokens
    // portanto handleAuthSuccess só é chamado após autenticação completa.
    // Não abrir modal 2FA aqui, mesmo que exista flag local.

    // Salvar dados no localStorage usando o novo serviço
    authStorage.saveAuthData(response, rememberMe);

    setAlert({
      type: 'success',
      message: successMessage,
    });

    try {
      const user = response.user;
      const choosePreferredCompany = (companyList: any[] = []) => {
        if (!Array.isArray(companyList) || companyList.length === 0)
          return null;
        const matrixCompany = companyList.find(
          company =>
            company?.isMatrix === true ||
            company?.isMatrix === 'true' ||
            company?.isMatrix === 1 ||
            company?.isMatrix === '1'
        );
        return matrixCompany || companyList[0];
      };

      // NOVA LÓGICA: Verificar se é MASTER/ADMIN com owner=true para aplicar fluxo especial
      const isOwnerUser = user.owner === true || String(user.owner) === 'true';
      const isMasterOrAdmin = user.role === 'master' || user.role === 'admin';
      const shouldCheckSubscriptionFirst = isMasterOrAdmin && isOwnerUser;

      // FLUXO ESPECIAL: Para MASTER/ADMIN com owner=true, verificar assinatura ANTES de empresas
      if (shouldCheckSubscriptionFirst) {

        try {
          // ETAPA 1: Verificar assinatura primeiro
          const accessInfo =
            await subscriptionService.checkSubscriptionAccess();

          // CORREÇÃO: Se não tem assinatura (hasAccess === false), redirecionar para planos SEM verificar empresas
          if (!accessInfo.hasAccess) {
            // Verificar se o status é 'none' (sem assinatura) ou outro motivo
            const status = accessInfo.status as string;
            const reason = accessInfo.reason || '';

            // Se status é 'none' (sem assinatura), ir para planos
            if (status === 'none') {
              setTimeout(() => {
                setIsLoading(false);
                navigate('/subscription-plans', { replace: true });
              }, 1000);
              return;
            }

            // Para outros status (expired, suspended, etc), ir para gestão de assinatura
            setTimeout(() => {
              setIsLoading(false);
              navigate('/subscription-management', { replace: true });
            }, 1000);
            return;
          }

          // Se tem assinatura (hasAccess === true), verificar empresas
          if (accessInfo.hasAccess) {

            // ETAPA 2: Verificar empresas
            const { companyApi } = await import('../services/companyApi');
            const { withSelectiveRetry } = await import('../utils/retryUtils');

            let companies: any[] = [];
            let companiesError: any = null;

            try {
              companies = await withSelectiveRetry(
                () => companyApi.getCompanies(),
                {
                  maxRetries: 3,
                  baseDelay: 1000,
                  maxDelay: 5000,
                }
              );

            } catch (error: any) {
              companiesError = error;
              console.error('❌ [useAuth] Erro ao carregar companies:', {
                error,
                message: error?.message,
                response: error?.response,
                status: error?.response?.status,
                data: error?.response?.data,
              });

              const errorStatus = error?.response?.status;
              const errorMessage = error?.message?.toLowerCase() || '';
              const isBlockedError =
                errorMessage.includes('company id não encontrado') ||
                errorMessage.includes('requisição bloqueada');

              if (
                isBlockedError ||
                (!errorStatus && errorMessage.includes('bloqueado'))
              ) {
                console.warn(
                  '⚠️ [useAuth] Erro de bloqueio detectado - Aguardando e tentando novamente...'
                );
                await new Promise(resolve => setTimeout(resolve, 2000));

                try {
                  companies = await companyApi.getCompanies();
                  companiesError = null;
                } catch (retryError: any) {
                  console.error(
                    '❌ [useAuth] Erro persistente após retry:',
                    retryError
                  );
                }
              }

              if (!companies || companies.length === 0) {
                const isDefinitiveNoCompanies =
                  errorStatus === 404 ||
                  (errorStatus &&
                    errorStatus >= 400 &&
                    errorStatus < 500 &&
                    !isBlockedError);

                if (!isDefinitiveNoCompanies) {
                  const existingCompanyId = localStorage.getItem(
                    'dream_keys_selected_company_id'
                  );
                  if (existingCompanyId) {
                    companies = [{ id: existingCompanyId }] as any;
                  }
                }
              }
            }

            // ETAPA 3: Redirecionar baseado em ter ou não empresa

            if (companies && companies.length > 0) {
              // Tem empresa - redirecionar para dashboard
              const preferredCompany = choosePreferredCompany(companies);
              const preferredCompanyId = preferredCompany?.id;
              if (preferredCompanyId) {
                localStorage.setItem(
                  'dream_keys_selected_company_id',
                  preferredCompanyId
                );
              }

              setTimeout(() => {
                setIsLoading(false);
                navigate('/dashboard', { replace: true });
              }, 1000);
              return;
            } else {
              // Não tem empresa - redirecionar para criar primeira empresa
              if (companiesError) {
                const errorStatus = companiesError?.response?.status;
                if (errorStatus === 404) {
                  localStorage.removeItem('dream_keys_selected_company_id');
                }
              } else {
                localStorage.removeItem('dream_keys_selected_company_id');
              }

              setTimeout(() => {
                setIsLoading(false);
                navigate('/verifying-access', { replace: true });
              }, 1000);
              return;
            }
          } else {
            // Este else nunca deveria ser executado porque já retornamos antes se hasAccess === false
            console.error(
              '🚨 [useAuth] ERRO DE LÓGICA - Este código não deveria ser executado! hasAccess:',
              accessInfo.hasAccess
            );
            setTimeout(() => {
              setIsLoading(false);
              navigate('/subscription-management', { replace: true });
            }, 1000);
            return;
          }
        } catch (subscriptionError) {
          console.error('❌ Erro ao verificar assinatura:', subscriptionError);
          // Em caso de erro, redirecionar para gestão de assinatura
          setTimeout(() => {
            setIsLoading(false);
            navigate('/subscription-management');
          }, 1000);
          return;
        }
      }

      // FLUXO NORMAL: Para usuários comuns (não owner), seguir fluxo padrão

      // ETAPA OBRIGATÓRIA: Chamar API de companies PRIMEIRO para TODOS os usuários
      const { companyApi } = await import('../services/companyApi');
      const { withSelectiveRetry } = await import('../utils/retryUtils');

      // CORREÇÃO: Usar retry para API de companies
      let companies: any[] = [];
      let companiesError: any = null;

      try {
        companies = await withSelectiveRetry(() => companyApi.getCompanies(), {
          maxRetries: 3,
          baseDelay: 1000,
          maxDelay: 5000,
        });

      } catch (error: any) {
        companiesError = error;
        console.error('❌ ETAPA 1: Erro ao carregar companies:', error);
        console.error('❌ ETAPA 1: Error response:', error?.response);
        console.error('❌ ETAPA 1: Error status:', error?.response?.status);
        console.error('❌ ETAPA 1: Error message:', error?.message);

        // CORREÇÃO: Verificar se o erro é realmente porque não tem companies
        // ou se é um erro desconhecido (sem status) que pode ser temporário
        const errorStatus = error?.response?.status;
        const errorMessage = error?.message?.toLowerCase() || '';
        const isBlockedError =
          errorMessage.includes('company id não encontrado') ||
          errorMessage.includes('requisição bloqueada');

        // Se for erro de bloqueio (Company ID), pode ser que a API ainda esteja sendo carregada
        // Se for erro sem status ou desconhecido, aguardar um pouco e tentar novamente
        if (
          isBlockedError ||
          (!errorStatus && errorMessage.includes('bloqueado'))
        ) {
          console.warn(
            '⚠️ ETAPA 1: Erro de bloqueio detectado - pode ser verificação prematura. Aguardando...'
          );

          // Aguardar até 2 segundos e tentar novamente uma vez
          await new Promise(resolve => setTimeout(resolve, 2000));

          try {
            companies = await companyApi.getCompanies();
            companiesError = null; // Limpar erro após sucesso
          } catch (retryError: any) {
            console.error(
              '❌ ETAPA 1: Erro persistente após retry:',
              retryError
            );
            // Manter o erro original para análise
          }
        }

        // Se ainda não tem companies após retry, mas o erro não é claro sobre não ter empresas,
        // não assumir que o usuário não tem empresas
        if (!companies || companies.length === 0) {
          const isDefinitiveNoCompanies =
            errorStatus === 404 ||
            (errorStatus &&
              errorStatus >= 400 &&
              errorStatus < 500 &&
              !isBlockedError);

          if (!isDefinitiveNoCompanies) {
            // Erro desconhecido - não fazer assumptions sobre empresas
            console.warn(
              '⚠️ ETAPA 1: Erro desconhecido ao carregar companies. Não removendo Company ID existente.'
            );
            // Não remover Company ID se já existir
            const existingCompanyId = localStorage.getItem(
              'dream_keys_selected_company_id'
            );
            if (existingCompanyId) {
              companies = [{ id: existingCompanyId }] as any; // Usar Company ID existente como fallback
            }
          }
        }
      }

      if (companies && companies.length > 0) {
        // Usuário tem empresas - definir Company ID da primeira empresa
        const preferredCompany = choosePreferredCompany(companies);
        const preferredCompanyId = preferredCompany?.id;
        if (preferredCompanyId) {
          localStorage.setItem(
            'dream_keys_selected_company_id',
            preferredCompanyId
          );
        }

        // Se for usuário master/admin com empresas, ir direto para dashboard
        if (user.role === 'master' || user.role === 'admin') {
          setTimeout(() => {
            setIsLoading(false);
            navigate('/dashboard');
          }, 1000);
          return;
        }
      } else {
        // CORREÇÃO: Só remover Company ID se tiver certeza que não tem empresas
        // Se foi erro desconhecido, não remover
        if (companiesError) {
          const errorStatus = companiesError?.response?.status;
          const isDefinitiveNoCompanies = errorStatus === 404;

          if (isDefinitiveNoCompanies) {
            // Usuário realmente não tem empresas - limpar Company ID
            localStorage.removeItem('dream_keys_selected_company_id');
          } else {
            // Erro desconhecido - não remover Company ID
            console.warn(
              '⚠️ Erro desconhecido ao carregar companies. Mantendo Company ID existente se houver.'
            );
          }
        } else {
          // Sem erro mas sem companies - limpar Company ID
          localStorage.removeItem('dream_keys_selected_company_id');
        }

        // Se for usuário master/admin sem empresas, seguir fluxo de inicialização
        if (user.role === 'master' || user.role === 'admin') {
        }
      }

      // ETAPA CRÍTICA: Aguardar carregamento das permissões ANTES de qualquer redirecionamento
      // Importar o serviço de inicialização dinamicamente para evitar dependência circular
      const { initializationService } = await import(
        '../services/initializationService'
      );

      const initResult = await initializationService.initialize();

      if (!initResult.isInitialized) {
        console.error('❌ Falha na inicialização:', initResult.error);
        // Em caso de erro na inicialização, redirecionar para página de erro
        setTimeout(() => {
          setIsLoading(false);
          navigate('/system-unavailable');
        }, 2000);
        return;
      }

      // Se for usuário master, redirecionar direto para página inicial preferida
      if (user.role === 'master') {
        const homePage = getHomePagePreference();
        setTimeout(() => {
          setIsLoading(false);
          navigate(homePage);
        }, 1000); // Reduzir delay já que permissões já foram carregadas
        return;
      }

      // LÓGICA INTELIGENTE: Analisar permissões e redirecionar para página apropriada
      const { analyzeUserPermissions, hasValidPermissions } = await import(
        '../services/redirectService'
      );

      // Se for usuário do tipo "User", redirecionar direto para Funil de Vendas (Kanban)
      // Verificar se há um último projeto salvo para este usuário
      if (user.role === 'user') {

        // Tentar recuperar o último estado do Kanban para este usuário
        try {
          const { getKanbanState } = await import('../utils/kanbanState');
          const savedState = getKanbanState(user.id);

          if (
            savedState &&
            savedState.projectId &&
            savedState.userId === user.id
          ) {
            // Construir URL com o último projeto acessado
            const params = new URLSearchParams();
            if (savedState.projectId) {
              params.set('projectId', savedState.projectId);
            }
            if (
              savedState.teamId &&
              savedState.teamId !== 'undefined' &&
              savedState.teamId !== 'null'
            ) {
              params.set('teamId', savedState.teamId);
            }
            if (savedState.workspace === 'personal') {
              params.set('workspace', 'personal');
            }

            const kanbanUrl = params.toString()
              ? `/kanban?${params.toString()}`
              : '/kanban';
            setIsLoading(false);
            navigate(kanbanUrl);
          } else {
            setIsLoading(false);
            navigate('/kanban');
          }
        } catch (error) {
          console.error(
            '❌ [useAuth] Erro ao recuperar último projeto:',
            error
          );
          setIsLoading(false);
          navigate('/kanban');
        }
        return;
      }

      if (hasValidPermissions(initResult.userPermissions)) {
        // Usuário tem permissões válidas - redirecionar para página apropriada
        const suggestedPage = analyzeUserPermissions(
          initResult.userPermissions,
          user.role
        );
        // CORREÇÃO: Navegar imediatamente após análise de permissões
        // O SubscriptionContext já carrega a assinatura e o SubscriptionGuard lida com o estado
        setIsLoading(false);
        navigate(suggestedPage);
      } else {
        // Usuário não tem permissões válidas - redirecionar para welcome
        setTimeout(() => {
          setIsLoading(false);
          navigate('/dashboard');
        }, 500);
      }
    } catch (error) {
      console.error('❌ Erro durante inicialização após login:', error);
      // Em caso de erro, redirecionar baseado no role
      setTimeout(() => {
        setIsLoading(false);

        const user = response.user;
        if (user.role === 'admin') {
          navigate('/subscription-management');
        } else {
          const homePage = getHomePagePreference();
          navigate(homePage); // Fallback para página inicial preferida
        }
      }, 2000);
    }
  };

  const handleAuthError = (error: any, defaultMessage: string) => {
    console.error('Erro na autenticação:', error);

    let errorMessage = defaultMessage;
    const details = error?.response?.data?.details;

    if (error.response?.status === 401) {
      const reason = details?.reason || error?.response?.data?.message;
      const suggestion = details?.suggestion;
      errorMessage =
        [reason, suggestion].filter(Boolean).join('. ') ||
        'Email ou senha incorretos. Verifique e tente novamente.';
    } else if (error.response?.status === 409) {
      errorMessage =
        error.response.data?.message || 'Email ou CPF/CNPJ já está em uso.';
    } else if (error.response?.status === 400) {
      errorMessage = 'Dados inválidos. Verifique os campos.';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }

    setAlert({
      type: 'error',
      message: errorMessage,
    });
  };

  const login = async (data: LoginFormData & { rememberMe?: boolean }) => {
    setIsLoading(true);
    setAlert(null);
    setMfaError(null);
    // Fechar modal e limpar estados de MFA ao iniciar nova tentativa
    setMfaRequired(false);
    setTempTokenWithExpiry(null);
    try {
      // SEMPRE salvar credenciais temporariamente antes de verificar 2FA
      setPendingLogin({
        email: data.email,
        password: data.password,
        remember: !!data.rememberMe,
      });
      // Opção 1 (Otimizada): faz check-2fa (UX) e, se precisar, já tenta login para obter tempToken
      let requires2FA = false;
      let hasTwoFactorConfigured = false;
      try {
        const check: CheckTwoFactorResponse = await checkTwoFactorStatusCached(
          data.email
        );
        requires2FA = !!(check?.requires2FA && check?.emailExists);
        hasTwoFactorConfigured = !!check?.hasTwoFactorConfigured;
      } catch {
        // noop - se check falhar, seguimos com tentativa de login e fallback
      }

      if (requires2FA && hasTwoFactorConfigured) {
        // Abrir modal TOTP — Etapa 1 (/auth/login) será chamada no verify quando o usuário enviar o código
        setTempTokenWithExpiry(null);
        setMfaRequired(true);
        setIsLoading(false);
        return;
      } else if (requires2FA && !hasTwoFactorConfigured) {
        // Empresa exige, mas usuário não configurou → abrir modal de setup (pré-login)
        setSetupError(null);
        setSetupRequired(true);
        setIsLoading(false);
        return;
      } else {
        // Não requer 2FA → login direto
        setMfaRequired(false);
        const response = await authApi.login(data.email, data.password);
        await handleAuthSuccess(
          response,
          'Login realizado com sucesso! Redirecionando...',
          !!data.rememberMe
        );
        // Limpar credenciais temporárias após sucesso sem 2FA
        setPendingLogin(null);
        setIsLoading(false);
      }
    } catch (error: any) {
      // Fallback para o fluxo 2FA por 401 (em caso de corrida/alteração de política)
      const errData = error?.response?.data || {};
      if (
        error?.response?.status === 401 &&
        errData?.errorCode === '2FA_REQUIRED' &&
        errData?.tempToken
      ) {
        setTempTokenWithExpiry(errData.tempToken);
        setMfaRequired(true);
        setIsLoading(false);
        return;
      }
      if (
        error?.response?.status === 401 &&
        errData?.errorCode === '2FA_SETUP_REQUIRED'
      ) {
        setIsLoading(false);
        setAlert({
          type: 'warning',
          message:
            'Sua empresa exige 2FA. Configure-o em Configurações > Segurança para continuar.',
        });
        navigate('/settings');
        return;
      }
      // 401 credenciais inválidas (INVALID_CREDENTIALS): exibir mensagem do backend sem recarregar
      if (error?.response?.status === 401 && errData?.errorCode === 'INVALID_CREDENTIALS') {
        const details = errData?.details || {};
        const reason = details.reason || errData?.message;
        const suggestion = details.suggestion;
        const msg =
          [reason, suggestion].filter(Boolean).join('. ') ||
          'Email ou senha incorretos. Verifique suas credenciais e tente novamente.';
        setIsLoading(false);
        setAlert({ type: 'error', message: msg });
        return;
      }
      console.error('Erro no login:', error);
      handleAuthError(error, 'Erro interno do servidor. Tente novamente.');
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterFormData) => {
    setIsLoading(true);
    setAlert(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registerData } = data;
      await authApi.registerWithConfirmation(registerData);

      // Mostrar modal de confirmação de email
      setEmailConfirmationModal({
        isOpen: true,
        email: data.email,
      });

      setIsLoading(false);
    } catch (error: any) {
      handleAuthError(error, 'Erro interno do servidor. Tente novamente.');
      setIsLoading(false); // Parar loading apenas em caso de erro
    }
  };

  const logout = async () => {
    authStorage.clearAuthData();

    // Resetar serviço de inicialização
    try {
      const { initializationService } = await import(
        '../services/initializationService'
      );
      initializationService.reset();
    } catch (error) {
      console.error('Erro ao resetar serviço de inicialização:', error);
    }

    navigate('/login');
  };

  const logoutComplete = async () => {
    authStorage.clearAllAuthData();

    // Resetar serviço de inicialização
    try {
      const { initializationService } = await import(
        '../services/initializationService'
      );
      initializationService.reset();
    } catch (error) {
      console.error('Erro ao resetar serviço de inicialização:', error);
    }

    navigate('/login');
  };

  const getCurrentUser = () => {
    return authStorage.getUserData();
  };

  const getToken = () => {
    return authStorage.getToken();
  };

  const isAuthenticated = () => {
    return authStorage.isAuthenticated();
  };

  const hasCompany = () => {
    const user = authStorage.getUserData();
    const decodedToken = authStorage.getDecodedToken();
    return !!(user?.companyId || decodedToken?.companyId);
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        console.warn('⚠️ refreshUser: Nenhum usuário logado');
        return;
      }

      // Buscar dados atualizados do usuário
      const response = await authApi.getProfile();
      const userData = response.data || response;

      // Atualizar dados no storage
      const currentAuthData = authStorage.getAuthData();
      if (currentAuthData && currentAuthData.token) {
        // Construir AuthResponse válido para salvar
        const updatedAuthData = {
          access_token: currentAuthData.token,
          refresh_token: authStorage.getRefreshToken() || '',
          user: userData,
        };
        authStorage.saveAuthData(
          updatedAuthData,
          authStorage.shouldRememberUser()
        );

        // Disparar evento customizado para forçar re-render em todos os componentes
        window.dispatchEvent(
          new CustomEvent('user-data-updated', {
            detail: { user: userData },
          })
        );

      }
    } catch (error) {
      console.error('❌ Erro ao atualizar dados do usuário:', error);
    }
  };

  return {
    isLoading,
    alert,
    emailConfirmationModal,
    mfa: {
      required: mfaRequired,
      error: mfaError,
      open: () => setMfaRequired(true),
      close: () => setMfaRequired(false),
      verify: async (code: string) => {
        try {
          setMfaError(null);
          if (!pendingLogin) {
            setMfaError(
              'Credenciais não encontradas. Por favor, tente novamente.'
            );
            return;
          }
          // 1) Garantir tempToken válido
          let localToken = isTempTokenValid(tempToken, tempTokenExpiresAt)
            ? tempToken
            : null;
          if (!localToken) {
            try {
              // Etapa 1: chama /auth/login esperando 401 com 2FA_REQUIRED
              await authApi.login(pendingLogin.email, pendingLogin.password);
              // Caso improvável: login direto sem 2FA
              setMfaError('2FA não é mais necessário. Tente entrar novamente.');
              return;
            } catch (e: any) {
              const errData = e?.response?.data || {};
              if (
                e?.response?.status === 401 &&
                errData?.errorCode === '2FA_REQUIRED' &&
                errData?.tempToken
              ) {
                localToken = errData.tempToken;
                setTempTokenWithExpiry(localToken);
              } else if (
                e?.response?.status === 401 &&
                errData?.errorCode === '2FA_SETUP_REQUIRED'
              ) {
                setMfaError(
                  '2FA é obrigatório, mas não está configurado. Configure em Configurações > Segurança.'
                );
                return;
              } else {
                // Erro diferente do esperado; exibir mensagem padrão do backend
                setMfaError(
                  e?.response?.data?.message ||
                    e?.message ||
                    'Falha ao iniciar verificação 2FA.'
                );
                return;
              }
            }
          }
          if (!localToken) {
            setMfaError('Falha ao iniciar verificação 2FA. Tente novamente.');
            return;
          }
          // 2) Etapa 2: verificar TOTP com /auth/verify-2fa
          try {
            const verified = await twoFactorAuthApi.verifyLoginTwoFactor(
              localToken,
              code
            );
            await handleAuthSuccess(
              verified,
              'Login realizado com sucesso!',
              pendingLogin?.remember ?? authStorage.shouldRememberUser()
            );
            localStorage.setItem('two_factor_enabled', 'true');
            setPendingLogin(null);
            setTempTokenWithExpiry(null);
            setMfaRequired(false);
            return;
          } catch (e: any) {
            const errData = e?.response?.data || {};
            if (
              e?.response?.status === 401 &&
              errData?.errorCode === 'INVALID_2FA_CODE'
            ) {
              setMfaError('Código TOTP inválido. Tente novamente.');
              return;
            }
            if (
              e?.response?.status === 401 &&
              errData?.errorCode === 'INVALID_TOKEN'
            ) {
              setMfaError('Token temporário expirado. Gerando um novo...');
              // Forçar próximo ciclo a refazer a etapa 1
              setTempTokenWithExpiry(null);
              return;
            }
            setMfaError(
              e?.response?.data?.message ||
                e?.message ||
                'Falha ao verificar 2FA.'
            );
            return;
          }
        } catch (e: any) {
          setMfaError(e?.message || 'Falha ao verificar 2FA.');
        }
      },
    },
    mfaSetup: {
      required: setupRequired,
      error: setupError,
      open: () => setSetupRequired(true),
      close: () => setSetupRequired(false),
      start: async () => {
        if (!pendingLogin?.email || !pendingLogin?.password)
          throw new Error('Credenciais não encontradas.');
        try {
          return await twoFactorAuthApi.startPublicSetup(
            pendingLogin.email,
            pendingLogin.password
          );
        } catch (e: any) {
          const status = e?.response?.status;
          if (status === 404) {
            setSetupError(
              'Configuração pública de 2FA indisponível no servidor. Solicite ao administrador a ativação ou tente novamente mais tarde.'
            );
            throw new Error('Setup público de 2FA indisponível (404).');
          }
          throw e;
        }
      },
      verifyAndLogin: async (code: string): Promise<boolean> => {
        try {
          if (!pendingLogin?.email || !pendingLogin?.password)
            throw new Error('Credenciais não encontradas.');
          // Verifica e ativa 2FA
          const res = await twoFactorAuthApi.verifyPublicSetup(
            pendingLogin.email,
            pendingLogin.password,
            code
          );
          if (!res?.enabled) {
            setSetupError('Código inválido. Tente novamente.');
            return false;
          }
          // Após ativar, seguir fluxo de login automaticamente (sem abrir modal de verificação)
          setSetupRequired(false);
          setMfaRequired(false);
          // Garante tempToken
          let localToken: string | null = null;
          // Feedback visual global: impedir cliques no botão Entrar
          setIsLoading(true);
          try {
            await authApi.login(pendingLogin.email, pendingLogin.password);
          } catch (e: any) {
            const errData = e?.response?.data || {};
            if (
              e?.response?.status === 401 &&
              errData?.errorCode === '2FA_REQUIRED' &&
              errData?.tempToken
            ) {
              localToken = errData.tempToken;
              setTempTokenWithExpiry(localToken);
            } else {
              throw e;
            }
          }
          if (!localToken) {
            setSetupError('Falha ao iniciar verificação 2FA após ativação.');
            setIsLoading(false);
            return false;
          }
          const verified = await twoFactorAuthApi.verifyLoginTwoFactor(
            localToken,
            code
          );
          await handleAuthSuccess(
            verified,
            'Login realizado com sucesso!',
            pendingLogin?.remember ?? authStorage.shouldRememberUser()
          );
          setPendingLogin(null);
          setTempTokenWithExpiry(null);
          setMfaRequired(false);
          setIsLoading(false);
          return true;
        } catch (e: any) {
          setSetupError(e?.message || 'Falha ao concluir configuração de 2FA.');
          setIsLoading(false);
          return false;
        }
      },
    },
    login,
    register,
    logout,
    logoutComplete,
    clearAlert,
    closeEmailConfirmationModal,
    getCurrentUser,
    getToken,
    isAuthenticated,
    hasCompany,
    refreshUser,
  };
};
