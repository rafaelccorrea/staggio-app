import React, {
  useState,
  memo,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { translateUserRole } from '../../utils/roleTranslations';
import { useCompanyContext } from '../../contexts';
import { useSubscriptionContext } from '../../contexts/SubscriptionContext';
import { useOwner } from '../../hooks/useOwner';
import { subscriptionService } from '../../services/subscriptionService';
import { toast } from 'react-toastify';
import {
  HeaderContainer,
  HeaderLeft,
  HeaderCenter,
  TrialBadge,
  TrialBadgePulse,
  TrialBadgeText,
  HeaderRight,
  Logo,
  LogoImage,
  CompanyAvatarContainer,
  CompanyAvatar,
  CompanyAvatarIcon,
  UserContainer,
  UserAvatar,
  UserInfo,
  UserName,
  UserRole,
  ThemeToggleButton,
  UserDropdownWrapper,
  UserDropdownChevron,
  UserDropdownOverlay,
  UserDropdownPanel,
  UserDropdownHeader,
  UserDropdownHeaderRow,
  UserDropdownAvatarActions,
  UserDropdownAvatarLink,
  UserDropdownAvatarRemoveBtn,
  UserDropdownBody,
  UserDropdownFooter,
  UserDropdownVerMaisButton,
  UserDropdownSairButton,
  ModalOverlay,
  ModalContainer,
  ModalIcon,
  ModalTitle,
  ModalDescription,
  ModalButtons,
  ModalButton,
  MobileMenuButton,
  ActionsToggleButton,
  ActionsBadge,
  ActionsOverlay,
  ActionsPanel,
  ActionsPanelHeader,
  ActionsUserInfo,
  ActionsUserName,
  ActionsUserRole,
  ActionsPanelBody,
  ActionsSection,
  ActionsSectionTitle,
  ActionsButton,
} from '../../styles/components/HeaderStyles';
import { CompanySelector } from '../CompanySelector';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { CompanyLogoModal } from '../modals/CompanyLogoModal';
import { getAssetPath } from '../../utils/pathUtils';
import { authApi } from '../../services/api';
import { IoMdClose } from 'react-icons/io';
import { IoBusiness, IoLogOutOutline } from 'react-icons/io5';
import {
  MdMenu,
  MdPerson,
  MdEdit,
  MdLogout,
  MdBolt,
  MdDarkMode,
  MdLightMode,
  MdArrowForward,
  MdExpandMore,
  MdDelete,
} from 'react-icons/md';

const MS_IN_DAY = 1000 * 60 * 60 * 24;

type TrialStatusState = {
  isActive: boolean;
  daysRemaining: number | null;
  endsAt: string | null;
  source: 'usage' | 'fallback';
};

interface HeaderProps {
  onToggleDrawer: () => void;
  isDrawerOpen: boolean;
}

export const Header: React.FC<HeaderProps> = memo(
  ({ onToggleDrawer, isDrawerOpen }) => {
    const { theme, toggleTheme } = useTheme();
    const { logout, getCurrentUser, refreshUser } = useAuth();
    const { selectedCompany, refreshCompanies } = useCompanyContext();
    const {
      subscriptionStatus,
      loading: subscriptionLoading,
      loadSubscriptionStatus,
      loadPlans,
    } = useSubscriptionContext();
    const { isOwner } = useOwner();
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showCompanyLogoModal, setShowCompanyLogoModal] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [userRefreshKey, setUserRefreshKey] = useState(0);
    const [companyRefreshKey, setCompanyRefreshKey] = useState(0);
    const hasLoadedSubscription = useRef(false);
    const lastCompanyIdRef = useRef<string | null>(null);

    // Estado para forçar atualização do user quando avatar for atualizado
    const [userUpdateTrigger, setUserUpdateTrigger] = useState(0);

    // Obter user atualizado quando userUpdateTrigger mudar
    const user = useMemo(() => {
      return getCurrentUser();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userUpdateTrigger]);

    const canAccessUsageData = !!(
      user &&
      (user.role === 'admin' || user.role === 'master' || user.owner === true)
    );
    const [isMobileView, setIsMobileView] = useState(() =>
      typeof window !== 'undefined' ? window.innerWidth <= 768 : false
    );
    const [isActionsOpen, setIsActionsOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [trialStatus, setTrialStatus] = useState<TrialStatusState | null>(
      null
    );

    // Verificar se está em modo BETA
    const isBeta = import.meta.env.VITE_IS_BETA === 'true';

    const fallbackTrial = useMemo<TrialStatusState | null>(() => {
      const trialEndsAt = subscriptionStatus?.subscription?.trialEndsAt;
      if (!trialEndsAt) {
        return null;
      }

      const parsedDate = new Date(trialEndsAt);
      if (Number.isNaN(parsedDate.getTime())) {
        return null;
      }

      const diff = parsedDate.getTime() - Date.now();
      if (diff < 0) {
        return null;
      }

      const daysRemaining = Math.max(0, Math.ceil(diff / MS_IN_DAY));
      return {
        isActive: true,
        daysRemaining,
        endsAt: trialEndsAt,
        source: 'fallback',
      };
    }, [subscriptionStatus?.subscription?.trialEndsAt]);

    useEffect(() => {
      if (fallbackTrial) {
        setTrialStatus(prev => {
          if (prev?.source === 'usage') {
            return prev;
          }
          return fallbackTrial;
        });
      } else {
        setTrialStatus(prev => (prev?.source === 'fallback' ? null : prev));
      }
    }, [fallbackTrial]);

    useEffect(() => {
      if (!user || !canAccessUsageData) {
        return;
      }

      const companyId =
        selectedCompany?.id ||
        localStorage.getItem('dream_keys_selected_company_id');
      if (!companyId) {
        return;
      }

      const usage = subscriptionService.getCachedSubscriptionUsage();
      if (!usage) {
        return;
      }

      const endsAt = usage.trialEndsAt ?? null;
      let normalizedDays: number | null = null;

      if (typeof usage.trialDaysRemaining === 'number') {
        normalizedDays = Math.max(0, usage.trialDaysRemaining);
      } else if (endsAt) {
        const endsDate = new Date(endsAt);
        if (!Number.isNaN(endsDate.getTime())) {
          normalizedDays = Math.max(
            0,
            Math.ceil((endsDate.getTime() - Date.now()) / MS_IN_DAY)
          );
        }
      }

      const nextTrialStatus: TrialStatusState = {
        isActive: Boolean(usage.isTrialActive),
        daysRemaining: usage.isTrialActive ? normalizedDays : null,
        endsAt: usage.isTrialActive ? endsAt : null,
        source: 'usage',
      };

      setTrialStatus(prev => {
        if (
          prev &&
          prev.source === nextTrialStatus.source &&
          prev.isActive === nextTrialStatus.isActive &&
          prev.daysRemaining === nextTrialStatus.daysRemaining &&
          prev.endsAt === nextTrialStatus.endsAt
        ) {
          return prev;
        }
        return nextTrialStatus;
      });
    }, [
      user,
      canAccessUsageData,
      selectedCompany?.id,
      subscriptionStatus?.subscription?.id,
    ]);

    const trialBadgeText = useMemo(() => {
      if (!trialStatus?.isActive) {
        return null;
      }

      if (typeof trialStatus.daysRemaining === 'number') {
        if (isMobileView) {
          return `Trial ${trialStatus.daysRemaining}d`;
        }
        return trialStatus.daysRemaining === 1
          ? '1 dia restante de teste'
          : `${trialStatus.daysRemaining} dias restantes de teste`;
      }

      if (trialStatus.endsAt) {
        const endsDate = new Date(trialStatus.endsAt);
        if (!Number.isNaN(endsDate.getTime())) {
          return isMobileView
            ? `Trial até ${endsDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`
            : `Teste ativo até ${endsDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}`;
        }
      }

      return isMobileView ? 'Trial ativo' : 'Teste gratuito ativo';
    }, [trialStatus, isMobileView]);

    const trialBadgeTitle = useMemo(() => {
      if (!trialStatus?.isActive) {
        return undefined;
      }

      const parts: string[] = ['Período de teste ativo'];

      if (typeof trialStatus.daysRemaining === 'number') {
        parts.push(
          trialStatus.daysRemaining === 1
            ? '1 dia restante'
            : `${trialStatus.daysRemaining} dias restantes`
        );
      }

      if (trialStatus.endsAt) {
        const endsDate = new Date(trialStatus.endsAt);
        if (!Number.isNaN(endsDate.getTime())) {
          parts.push(
            `Termina em ${endsDate.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}`
          );
        }
      }

      return parts.join(' · ');
    }, [trialStatus]);
    // Escutar evento de atualização de dados do usuário
    useEffect(() => {
      const handleUserDataUpdated = (event: Event) => {
        // Forçar atualização do user e incrementar chave de refresh
        setUserUpdateTrigger(prev => prev + 1);
        setUserRefreshKey(prev => prev + 1);
      };

      window.addEventListener('user-data-updated', handleUserDataUpdated);

      return () => {
        window.removeEventListener('user-data-updated', handleUserDataUpdated);
      };
    }, []);

    // Monitorar mudanças no Company ID para resetar flag quando necessário
    useEffect(() => {
      const currentCompanyId =
        selectedCompany?.id ||
        localStorage.getItem('dream_keys_selected_company_id');

      // Se o Company ID mudou (de null para um valor, ou de um valor para outro)
      if (currentCompanyId !== lastCompanyIdRef.current) {
        // Se o Company ID acabou de ficar disponível e não tem subscription ainda, resetar flag
        if (
          currentCompanyId &&
          !lastCompanyIdRef.current &&
          !subscriptionStatus?.plan
        ) {
          hasLoadedSubscription.current = false;
        }
        lastCompanyIdRef.current = currentCompanyId || null;
      }
    }, [selectedCompany, subscriptionStatus]);

    // Carregar status da assinatura e planos para usuários admin/master
    useEffect(() => {
      // Verificar se é admin/master
      if (!user || (user.role !== 'admin' && user.role !== 'master')) {
        return;
      }

      // Verificar se já tem subscription carregada
      if (subscriptionStatus?.plan) {
        return;
      }

      // Verificar se já está carregando
      if (subscriptionLoading) {
        return;
      }

      // CORREÇÃO: Verificar se tem Company ID antes de carregar subscription
      const selectedCompanyId =
        selectedCompany?.id ||
        localStorage.getItem('dream_keys_selected_company_id');

      if (!selectedCompanyId) {
        // Se não tem Company ID ainda, não marcar como carregado para tentar novamente depois
        return;
      }

      // Carregar subscription se ainda não tentou E tem Company ID disponível
      if (!hasLoadedSubscription.current) {
        hasLoadedSubscription.current = true;
        loadSubscriptionStatus().catch(err => {
          console.error('❌ Header: Erro ao carregar subscription:', err);
          // Resetar flag em caso de erro para permitir nova tentativa quando Company ID estiver disponível
          hasLoadedSubscription.current = false;
        });
        loadPlans().catch(err => {
          console.error('❌ Header: Erro ao carregar planos:', err);
        });
      }
    }, [
      user,
      selectedCompany,
      subscriptionStatus,
      subscriptionLoading,
      loadSubscriptionStatus,
      loadPlans,
    ]);

    // Garantir que as empresas sejam carregadas

    // Removido carregamento redundante - já é feito pelo SubscriptionProvider

    const closeUserDropdown = useCallback(() => {
      setIsUserDropdownOpen(false);
    }, []);

    const handleLogoutClick = useCallback(() => {
      closeUserDropdown();
      setShowLogoutModal(true);
    }, [closeUserDropdown]);

    const handleLogoClick = () => {
      // Se o usuário for do tipo "user", redirecionar para kanban
      if (user?.role === 'user') {
        navigate('/kanban');
        return;
      }

      // Para outros tipos de usuário, redirecionar para a página inicial preferida
      const STORAGE_KEY = 'user_home_page_preference';
      const homePage = localStorage.getItem(STORAGE_KEY) || '/dashboard';
      navigate(homePage);
    };

    const handleCompanyAvatarClick = (e: React.MouseEvent) => {
      e.stopPropagation();

      // CORREÇÃO: Apenas admin e master podem alterar logo da empresa
      if (user?.role !== 'admin' && user?.role !== 'master') {
        toast.info('Apenas administradores podem alterar a logo da empresa');
        return;
      }

      closeUserDropdown();
      setShowCompanyLogoModal(true);
    };

    const handleUserContainerClick = useCallback(() => {
      setIsUserDropdownOpen(prev => !prev);
    }, []);

    const closeActionsMenu = useCallback(() => {
      setIsActionsOpen(false);
    }, []);

    const handleAvatarFileChange = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
          toast.error('Selecione uma imagem válida (JPG, PNG, etc.)');
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error('A imagem deve ter no máximo 5MB');
          return;
        }
        e.target.value = '';
        setAvatarUploading(true);
        try {
          await authApi.uploadAvatar(file);
          await refreshUser();
          setUserUpdateTrigger(prev => prev + 1);
          setUserRefreshKey(prev => prev + 1);
          toast.success('Foto atualizada!');
          closeUserDropdown();
          closeActionsMenu();
        } catch (err: any) {
          toast.error(err?.message || 'Erro ao enviar foto');
        } finally {
          setAvatarUploading(false);
        }
      },
      [refreshUser, closeUserDropdown, closeActionsMenu]
    );

    const handleRemoveAvatar = useCallback(async () => {
      setAvatarUploading(true);
      try {
        await authApi.updateProfile({ avatar: null });
        await refreshUser();
        setUserUpdateTrigger(prev => prev + 1);
        setUserRefreshKey(prev => prev + 1);
        toast.success('Foto removida.');
        closeUserDropdown();
        closeActionsMenu();
      } catch (err: any) {
        toast.error(err?.message || 'Erro ao remover foto');
      } finally {
        setAvatarUploading(false);
      }
    }, [refreshUser, closeUserDropdown, closeActionsMenu]);

    const handleVerMaisClick = useCallback(() => {
      closeUserDropdown();
      navigate('/profile');
    }, [closeUserDropdown, navigate]);

    const handleCompanyLogoUpdated = async () => {
      // Atualizar apenas os dados da empresa sem recarregar a página
      await refreshCompanies();
      setCompanyRefreshKey(prev => prev + 1); // Forçar re-renderização
    };

    const handleConfirmLogout = () => {
      logout();
      setShowLogoutModal(false);
    };

    const handleCancelLogout = () => {
      setShowLogoutModal(false);
    };

    const getUserInitials = (name: string) => {
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    const handleToggleActionsMenu = useCallback(() => {
      setIsActionsOpen(prev => !prev);
    }, []);

    const handleProfileFromMenu = useCallback(() => {
      closeActionsMenu();
      navigate('/profile');
    }, [closeActionsMenu, navigate]);

    const triggerAvatarInput = useCallback(() => {
      avatarInputRef.current?.click();
    }, []);

    const handleLogoutFromMenu = useCallback(() => {
      closeActionsMenu();
      handleLogoutClick();
    }, [closeActionsMenu, handleLogoutClick]);

    // Recalcular avatar URL quando user ou userRefreshKey mudarem
    const userAvatarUrl = useMemo(() => {
      return user?.avatar ? `${user.avatar}?t=${userRefreshKey}` : undefined;
    }, [user?.avatar, userRefreshKey]);

    const userInitials = getUserInitials(user?.name || 'U');

    useEffect(() => {
      const handleResize = () => {
        setIsMobileView(window.innerWidth <= 768);
      };

      handleResize();
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, []);

    useEffect(() => {
      if (!isMobileView) {
        closeActionsMenu();
      } else {
        closeUserDropdown();
      }
    }, [isMobileView, closeActionsMenu, closeUserDropdown]);

    useEffect(() => {
      if (!isMobileView && !isUserDropdownOpen) return;
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          if (isUserDropdownOpen) closeUserDropdown();
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isMobileView, isUserDropdownOpen, closeUserDropdown]);

    useEffect(() => {
      if (!isActionsOpen) {
        return;
      }

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          closeActionsMenu();
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [isActionsOpen, closeActionsMenu]);

    return (
      <>
        <input
          ref={avatarInputRef}
          id='header-avatar-input'
          type='file'
          accept='image/*'
          onChange={handleAvatarFileChange}
          style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
          aria-hidden
        />
        <HeaderContainer data-fixed-header>
          <HeaderLeft>
            <MobileMenuButton
              type='button'
              aria-label={isDrawerOpen ? 'Fechar menu' : 'Abrir menu'}
              onClick={onToggleDrawer}
            >
              <MdMenu size={20} />
            </MobileMenuButton>
            <Logo onClick={handleLogoClick} title='Ir para Página Inicial'>
              <LogoImage
                key={theme}
                $isDark={theme === 'dark'}
                src={getAssetPath(
                  theme === 'dark' ? 'logo-dark.png' : 'logo.png'
                )}
                alt='Intellisys Logo'
              />
            </Logo>
          </HeaderLeft>

          <HeaderCenter>
            {/* Plano/trial apenas para usuários owner */}
            {isOwner && !isBeta && trialStatus?.isActive && trialBadgeText && (
              <TrialBadge
                $compact={isMobileView}
                title={trialBadgeTitle}
                role='status'
              >
                <TrialBadgePulse aria-hidden='true' />
                <MdBolt size={isMobileView ? 14 : 16} />
                <TrialBadgeText>{trialBadgeText}</TrialBadgeText>
              </TrialBadge>
            )}
            {selectedCompany && (
              <CompanyAvatarContainer>
                <CompanyAvatar
                  $hasLogo={!!(selectedCompany.logo || selectedCompany.logoUrl)}
                  onClick={
                    user?.role === 'admin' || user?.role === 'master'
                      ? handleCompanyAvatarClick
                      : undefined
                  }
                  title={
                    user?.role === 'admin' || user?.role === 'master'
                      ? selectedCompany.logo || selectedCompany.logoUrl
                        ? 'Editar logo da empresa'
                        : 'Adicionar logo da empresa'
                      : 'Logo da empresa'
                  }
                  style={{
                    cursor:
                      user?.role === 'admin' || user?.role === 'master'
                        ? 'pointer'
                        : 'default',
                  }}
                >
                  {selectedCompany.logo || selectedCompany.logoUrl ? (
                    <img
                      key={`company-logo-${companyRefreshKey}`}
                      src={`${selectedCompany.logo || selectedCompany.logoUrl}?t=${companyRefreshKey}`}
                      alt={selectedCompany.name}
                    />
                  ) : (
                    <CompanyAvatarIcon>
                      <IoBusiness />
                    </CompanyAvatarIcon>
                  )}
                </CompanyAvatar>
              </CompanyAvatarContainer>
            )}
            <CompanySelector />
          </HeaderCenter>

          <HeaderRight>
            {isMobileView ? (
              <>
                <ActionsToggleButton
                  type='button'
                  aria-label='Abrir menu de ações'
                  aria-expanded={isActionsOpen}
                  onClick={handleToggleActionsMenu}
                  title='Abrir menu do usuário'
                >
                  <UserAvatar $imageUrl={userAvatarUrl} title='Menu do usuário'>
                    {userAvatarUrl ? '' : userInitials}
                  </UserAvatar>
                  {unreadNotifications > 0 && (
                    <ActionsBadge>{unreadNotifications}</ActionsBadge>
                  )}
                </ActionsToggleButton>
              </>
            ) : (
              <>
                <UserDropdownWrapper>
                  <UserContainer
                    onClick={handleUserContainerClick}
                    title={isUserDropdownOpen ? 'Fechar menu' : 'Abrir menu do usuário'}
                    aria-expanded={isUserDropdownOpen}
                  >
                    <UserAvatar
                      $imageUrl={userAvatarUrl}
                      title='Abrir menu'
                      style={{ position: 'relative', zIndex: 1 }}
                    >
                      {userAvatarUrl ? '' : userInitials}
                    </UserAvatar>
                    <UserInfo>
                      <UserName>{user?.name || 'Usuário'}</UserName>
                      <UserRole>
                        {translateUserRole(user?.role || 'user', isOwner)}
                      </UserRole>
                    </UserInfo>
                    <UserDropdownChevron $isOpen={isUserDropdownOpen} aria-hidden>
                      <MdExpandMore size={20} />
                    </UserDropdownChevron>
                  </UserContainer>

                  {isUserDropdownOpen &&
                    createPortal(
                      <>
                        <UserDropdownOverlay
                          $isOpen
                          $portaled
                          onClick={closeUserDropdown}
                          aria-hidden='true'
                        />
                        <UserDropdownPanel
                          $isOpen
                          $portaled
                          onClick={e => e.stopPropagation()}
                        >
                          <UserDropdownHeader>
                            <UserDropdownHeaderRow>
                              <UserAvatar
                                $imageUrl={userAvatarUrl}
                                $large
                                title='Sua foto'
                              >
                                {userAvatarUrl ? '' : userInitials}
                              </UserAvatar>
                              <ActionsUserInfo>
                                <ActionsUserName>{user?.name || 'Usuário'}</ActionsUserName>
                                <ActionsUserRole>
                                  {translateUserRole(user?.role || 'user', isOwner)}
                                </ActionsUserRole>
                              </ActionsUserInfo>
                            </UserDropdownHeaderRow>
                            <UserDropdownAvatarActions>
                              <UserDropdownAvatarLink
                                htmlFor='header-avatar-input'
                                data-loading={avatarUploading}
                                style={{ pointerEvents: avatarUploading ? 'none' : undefined }}
                              >
                                {avatarUploading ? 'Enviando...' : 'Alterar foto'}
                              </UserDropdownAvatarLink>
                              {user?.avatar && (
                                <UserDropdownAvatarRemoveBtn
                                  type='button'
                                  onClick={handleRemoveAvatar}
                                  disabled={avatarUploading}
                                >
                                  Remover foto
                                </UserDropdownAvatarRemoveBtn>
                              )}
                            </UserDropdownAvatarActions>
                          </UserDropdownHeader>
                          <UserDropdownBody>
                            <ActionsSection>
                              <ActionsSectionTitle>Aparência</ActionsSectionTitle>
                              <ActionsButton
                                type='button'
                                onClick={() => {
                                  toggleTheme();
                                }}
                              >
                                {theme === 'dark' ? (
                                  <MdLightMode size={18} />
                                ) : (
                                  <MdDarkMode size={18} />
                                )}
                                {theme === 'dark' ? 'Usar tema claro' : 'Usar tema escuro'}
                              </ActionsButton>
                            </ActionsSection>
                          </UserDropdownBody>
                          <UserDropdownFooter>
                            <UserDropdownVerMaisButton
                              type='button'
                              onClick={handleVerMaisClick}
                            >
                              Ver mais
                              <MdArrowForward size={18} />
                            </UserDropdownVerMaisButton>
                            <UserDropdownSairButton
                              type='button'
                              onClick={handleLogoutClick}
                              title='Sair do sistema'
                            >
                              <MdLogout size={18} />
                              Sair
                            </UserDropdownSairButton>
                          </UserDropdownFooter>
                        </UserDropdownPanel>
                      </>,
                      document.body
                    )}
                </UserDropdownWrapper>

                <NotificationCenter
                  onUnreadCountChange={setUnreadNotifications}
                />
              </>
            )}
          </HeaderRight>
        </HeaderContainer>

        {isMobileView && (
          <>
            <ActionsOverlay
              $isOpen={isActionsOpen}
              onClick={closeActionsMenu}
            />
            <ActionsPanel
              $isOpen={isActionsOpen}
              onClick={event => event.stopPropagation()}
            >
              <ActionsPanelHeader>
                <UserAvatar
                  $imageUrl={userAvatarUrl}
                  $large
                  title='Perfil do usuário'
                >
                  {userAvatarUrl ? '' : userInitials}
                </UserAvatar>
                <ActionsUserInfo>
                  <ActionsUserName>{user?.name || 'Usuário'}</ActionsUserName>
                  <ActionsUserRole>
                    {translateUserRole(user?.role || 'user', isOwner)}
                  </ActionsUserRole>
                </ActionsUserInfo>
              </ActionsPanelHeader>

              <ActionsPanelBody>
                <ActionsSection>
                  <ActionsSectionTitle>Aparência</ActionsSectionTitle>
                  <ActionsButton
                    type='button'
                    onClick={() => {
                      toggleTheme();
                      closeActionsMenu();
                    }}
                  >
                    {theme === 'dark' ? (
                      <MdLightMode size={18} />
                    ) : (
                      <MdDarkMode size={18} />
                    )}
                    {theme === 'dark' ? 'Usar tema claro' : 'Usar tema escuro'}
                  </ActionsButton>
                </ActionsSection>

                <ActionsSection>
                  <ActionsSectionTitle>Empresa</ActionsSectionTitle>
                  <div
                    style={{
                      padding: '0',
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'stretch',
                    }}
                  >
                    <CompanySelector />
                  </div>
                </ActionsSection>

                <ActionsSection>
                  <ActionsSectionTitle>Minha conta</ActionsSectionTitle>
                  <ActionsButton type='button' onClick={handleProfileFromMenu}>
                    <MdPerson size={18} />
                    Ver meu perfil
                  </ActionsButton>
                  <ActionsButton
                    type='button'
                    onClick={triggerAvatarInput}
                    disabled={avatarUploading}
                  >
                    <MdEdit size={18} />
                    {avatarUploading ? 'Enviando...' : 'Alterar foto'}
                  </ActionsButton>
                  {user?.avatar && (
                    <ActionsButton
                      type='button'
                      onClick={handleRemoveAvatar}
                      disabled={avatarUploading}
                    >
                      <MdDelete size={18} />
                      Remover foto
                    </ActionsButton>
                  )}
                </ActionsSection>

                <ActionsSection>
                  <ActionsSectionTitle>Notificações</ActionsSectionTitle>
                  <NotificationCenter
                    embedded
                    isOpen={isActionsOpen}
                    onClose={closeActionsMenu}
                    onUnreadCountChange={setUnreadNotifications}
                  />
                </ActionsSection>

                <ActionsSection>
                  <ActionsSectionTitle>Sessão</ActionsSectionTitle>
                  <ActionsButton type='button' onClick={handleLogoutFromMenu}>
                    <MdLogout size={18} />
                    Sair do sistema
                  </ActionsButton>
                </ActionsSection>
              </ActionsPanelBody>
            </ActionsPanel>
          </>
        )}

        <ModalOverlay $isOpen={showLogoutModal} onClick={handleCancelLogout}>
          <ModalContainer
            $isOpen={showLogoutModal}
            onClick={e => e.stopPropagation()}
          >
            <ModalIcon>
              <MdLogout size={32} />
            </ModalIcon>
            <ModalTitle>Confirmar Saída</ModalTitle>
            <ModalDescription>
              Tem certeza que deseja sair do sistema? Você precisará fazer login
              novamente para acessar suas informações.
            </ModalDescription>
            <ModalButtons>
              <ModalButton $variant='secondary' onClick={handleCancelLogout}>
                <IoMdClose size={18} style={{ marginRight: '8px' }} />
                Cancelar
              </ModalButton>
              <ModalButton $variant='primary' onClick={handleConfirmLogout}>
                <IoLogOutOutline size={18} style={{ marginRight: '8px' }} />
                Sim, Sair
              </ModalButton>
            </ModalButtons>
          </ModalContainer>
        </ModalOverlay>

        {/* Modal de Edição de Logo da Empresa */}
        <CompanyLogoModal
          isOpen={showCompanyLogoModal}
          onClose={() => setShowCompanyLogoModal(false)}
          company={selectedCompany}
          onLogoUpdated={handleCompanyLogoUpdated}
        />
      </>
    );
  }
);
