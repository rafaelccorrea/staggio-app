import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../hooks/useAuth';
import { useCompany } from '../hooks/useCompany';
import { useTags } from '../hooks/useTags';
import type { Tag } from '../services/tagsApi';
import { usePublicVisibility } from '../hooks/usePublicVisibility';
import { useNavigate } from 'react-router-dom';
import { translateUserRole } from '../utils/roleTranslations';
import { authApi } from '../services/api';
import { companyApi } from '../services/companyApi';
import { formatPhoneDisplay } from '../utils/masks';
import { ProfilePageShimmer } from '../components/shimmer/ProfilePageShimmer';
import { SessionsModal } from '../components/modals/SessionsModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import ChangePasswordModal from '../components/modals/ChangePasswordModal';
import { toast } from 'react-toastify';
import { settingsApi } from '../services/settingsApi';
import {
  ProfilePageContainer,
  ProfileHero,
  HeroContent,
  HeroAvatarWrap,
  HeroAvatar,
  HeroAvatarImg,
  HeroAvatarPlaceholder,
  HeroMeta,
  HeroTitle,
  HeroSubtitle,
  HeroBadge,
  HeroActions,
  HeroEditButton,
  EditProfileButton,
  ProfileMainGrid,
  ProfileLeftColumn,
  ProfileRightColumn,
  StatsRow,
  ResponsiveStats,
  StatCard,
  StatIcon,
  StatContent,
  StatValue,
  StatLabel,
  InfoCard,
  CardHeader,
  CardTitle,
  InfoList,
  InfoItem,
  InfoIcon,
  InfoContent,
  InfoLabel,
  InfoValue,
  InfoAction,
  SectionBody,
  SearchContainer,
  SearchInputContainer,
  SearchInput,
  SearchIcon,
  CompanyCard,
  CompanyHeader,
  CompanyName,
  CompanyActions,
  CompanyActionButton,
  CompanyInfo,
  CompanyDetail,
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  LoadingText,
  HiddenFileInput,
  HeroTitleRow,
  HeroTagsWrap,
  HeroTagPill,
  HeroTagPillDot,
} from '../styles/pages/ProfilePageStyles';
import {
  MdPerson,
  MdEmail,
  MdPhone,
  MdBadge,
  MdCalendarToday,
  MdEdit,
  MdBusiness,
  MdAttachMoney,
  MdError,
  MdSecurity,
  MdLocationOn,
  MdSettings,
  MdHome,
  MdPeople,
  MdDevices,
  MdMoreVert,
  MdClose,
  MdSearch,
  MdLock,
} from 'react-icons/md';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { getCurrentUser, refreshUser } = useAuth();
  const { hasCompanies } = useCompany();
  const { getUserTags } = useTags();

  // Hook de visibilidade pública - só usar se o contexto de auth estiver pronto
  let publicVisibilityHook;
  try {
    publicVisibilityHook = usePublicVisibility();
  } catch (error) {
    console.warn('Erro ao inicializar hook de visibilidade pública:', error);
    publicVisibilityHook = {
      isVisible: false,
      isLoading: false,
      isUpdating: false,
      toggleVisibility: async () => {},
      error: null,
    };
  }

  const {
    isVisible,
    isLoading: visibilityLoading,
    isUpdating: visibilityUpdating,
    toggleVisibility,
  } = publicVisibilityHook;

  const [user, setUser] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [userTags, setUserTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companiesError, setCompaniesError] = useState<string | null>(null);
  const [company2FAState, setCompany2FAState] = useState<
    Record<string, boolean>
  >({});
  const [savingCompany2FA, setSavingCompany2FA] = useState<
    Record<string, boolean>
  >({});

  // Estados para modais
  // edição de empresa via página (não mais modal)
  const [isDeleteCompanyModalOpen, setIsDeleteCompanyModalOpen] =
    useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<any>(null);
  const [isDeletingCompany, setIsDeletingCompany] = useState(false);

  // Estados para sessões
  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false);

  // Estado para modal de alteração de senha
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);

  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [avatarImageError, setAvatarImageError] = useState(false);

  // Ref para o input de arquivo
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar dados do perfil da API
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setIsLoading(true);

        const userData = await getCurrentUser();
        setUser(userData);

        // Carregar empresas
        await loadCompanies();

        // Carregar tags do usuário
        if (userData?.id) {
          try {
            const tags = await getUserTags(userData.id);
            setUserTags(tags);
          } catch (tagError) {
            console.warn('Erro ao carregar tags:', tagError);
            // Não falha o carregamento principal se as tags falharem
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do perfil:', error);
        toast.error('Erro ao carregar dados do perfil');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, []); // Array vazio para executar apenas uma vez

  // Escutar evento de atualização de dados do usuário (ex.: após editar perfil)
  useEffect(() => {
    const handleUserDataUpdated = async () => {
      const updatedUser = getCurrentUser();
      setUser(updatedUser);
      // Re-fetch tags do usuário para exibir as atualizadas após salvar
      if (updatedUser?.id) {
        try {
          const tags = await getUserTags(updatedUser.id);
          setUserTags(tags);
        } catch (e) {
          console.warn('Erro ao recarregar tags do perfil:', e);
        }
      }
    };

    window.addEventListener('user-data-updated', handleUserDataUpdated);

    return () => {
      window.removeEventListener('user-data-updated', handleUserDataUpdated);
    };
  }, [getCurrentUser, getUserTags]);

  // Carregar empresas
  const loadCompanies = async () => {
    try {
      setCompaniesLoading(true);
      setCompaniesError(null);

      // Aguardar inicialização (permissões) antes de carregar empresas
      const { initializationService } = await import(
        '../services/initializationService'
      );
      await initializationService.waitForInitialization();

      const companies = await companyApi.getCompanies();
      setCompanies(companies || []);
      // Inicializar mapa de 2FA (fallback para false se não vier do backend)
      const initialMap: Record<string, boolean> = {};
      (companies || []).forEach((c: any) => {
        initialMap[c.id] = !!(
          c.requireTwoFactor ||
          c.require_2fa ||
          c.totpRequired
        );
      });
      setCompany2FAState(initialMap);
    } catch (error) {
      console.error('❌ Erro ao carregar empresas:', error);
      setCompaniesError('Erro ao carregar empresas');
    } finally {
      setCompaniesLoading(false);
    }
  };

  const toggleCompany2FA = async (companyId: string, next: boolean) => {
    setCompany2FAState(prev => ({ ...prev, [companyId]: next }));
    setSavingCompany2FA(prev => ({ ...prev, [companyId]: true }));
    try {
      await settingsApi.setCompanyRequire2FAFor(companyId, next);
      toast.success(
        `2FA obrigatório ${next ? 'ativado' : 'desativado'} para a empresa.`
      );
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao salvar 2FA da empresa.');
      // Reverter estado em caso de erro
      setCompany2FAState(prev => ({ ...prev, [companyId]: !next }));
    } finally {
      setSavingCompany2FA(prev => ({ ...prev, [companyId]: false }));
    }
  };

  // Função para obter iniciais do usuário
  const getUserInitials = (name: string) => {
    if (!name) return '??';
    const words = name.split(' ');
    if (words.length >= 2) {
      return words[0][0] + words[1][0];
    }
    return name.substring(0, 2);
  };

  // Função para obter cor baseada no nome
  const getUserColor = (name: string) => {
    const colors = [
      '#3B82F6', // Blue
      '#10B981', // Green
      '#F59E0B', // Yellow
      '#EF4444', // Red
      '#8B5CF6', // Purple
      '#06B6D4', // Cyan
      '#F97316', // Orange
      '#84CC16', // Lime
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Função para formatar data
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'Não informado';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  // Função para formatar dados opcionais
  const formatOptionalData = (
    data: string | undefined | null,
    fallback: string = 'Não informado'
  ) => {
    if (!data || data.trim() === '') return fallback;
    return data;
  };

  // Função para lidar com clique no avatar
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Função para lidar com mudança de arquivo
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await authApi.uploadAvatar(file);

      await refreshUser();
      const updatedUser = getCurrentUser();
      setUser(updatedUser);
      setAvatarImageError(false);

      toast.success('Avatar atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      toast.error('Erro ao fazer upload do avatar');
    }
  };

  // Função para editar empresa
  const handleEditCompany = (company: any) => {
    // CORREÇÃO: Apenas admin e master podem editar empresa
    if (user?.role !== 'admin' && user?.role !== 'master') {
      toast.info('Apenas administradores podem editar informações da empresa');
      return;
    }
    navigate(`/companies/${company.id}/edit`);
  };

  // Função para abrir modal de confirmação de exclusão
  const handleDeleteCompany = (company: any) => {
    // CORREÇÃO: Apenas admin e master podem excluir empresa
    if (user?.role !== 'admin' && user?.role !== 'master') {
      toast.info('Apenas administradores podem excluir empresas');
      return;
    }

    // Impedir exclusão da empresa Matrix
    const companyName = company?.name?.toLowerCase() || '';
    if (companyName === 'matrix') {
      toast.error('A empresa Matrix não pode ser excluída!');
      return;
    }

    setCompanyToDelete(company);
    setIsDeleteCompanyModalOpen(true);
  };

  // Função para confirmar e executar exclusão
  const confirmDeleteCompany = async () => {
    if (!companyToDelete) return;

    setIsDeletingCompany(true);
    try {
      await companyApi.deleteCompany(companyToDelete.id);
      await loadCompanies();
      toast.success('Empresa excluída com sucesso!');
      setIsDeleteCompanyModalOpen(false);
      setCompanyToDelete(null);
    } catch (error: any) {
      console.error('Erro ao excluir empresa:', error);
      const errorMessage =
        error.response?.data?.message || 'Erro ao excluir empresa';
      toast.error(errorMessage);
    } finally {
      setIsDeletingCompany(false);
    }
  };

  // Função para abrir modal de sessões
  const handleOpenSessions = () => {
    setIsSessionsModalOpen(true);
  };

  // Filtrar empresas baseado na busca
  const filteredCompanies = companies.filter(
    company =>
      company.name.toLowerCase().includes(companySearchTerm.toLowerCase()) ||
      company.cnpj?.toLowerCase().includes(companySearchTerm.toLowerCase())
  );

  // Calcular estatísticas
  const stats = [
    {
      icon: MdBusiness,
      value: companies.length,
      label: 'Empresas',
      color: '#3B82F6',
    },
    {
      icon: MdHome,
      value: 12, // Placeholder - substituir por dados reais
      label: 'Propriedades',
      color: '#10B981',
    },
    {
      icon: MdPeople,
      value: 8, // Placeholder - substituir por dados reais
      label: 'Clientes',
      color: '#F59E0B',
    },
    {
      icon: MdAttachMoney,
      value: 'R$ 150K', // Placeholder - substituir por dados reais
      label: 'Receita Mensal',
      color: '#8B5CF6',
    },
  ];

  if (isLoading) {
    return (
      <Layout>
        <ProfilePageShimmer />
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <ProfilePageContainer>
          <EmptyState>
            <EmptyStateIcon>
              <MdError size={64} />
            </EmptyStateIcon>
            <EmptyStateTitle>Erro ao carregar perfil</EmptyStateTitle>
            <EmptyStateDescription>
              Não foi possível carregar os dados do seu perfil. Tente novamente.
            </EmptyStateDescription>
          </EmptyState>
        </ProfilePageContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <ProfilePageContainer>
        {/* Hero: avatar, nome, cargo e botão editar */}
        <ProfileHero>
          <HeroContent>
            <HeroAvatarWrap>
              <HeroAvatar onClick={handleAvatarClick} title='Clique para alterar sua foto'>
                {user.avatar && !avatarImageError ? (
                  <HeroAvatarImg
                    src={`${user.avatar}?t=${Date.now()}`}
                    alt='Avatar'
                    onError={() => setAvatarImageError(true)}
                  />
                ) : (
                  <HeroAvatarPlaceholder>
                    {getUserInitials(user.name)}
                  </HeroAvatarPlaceholder>
                )}
              </HeroAvatar>
            </HeroAvatarWrap>
            <HeroMeta>
              <HeroTitleRow>
                <HeroTitle>{user.name}</HeroTitle>
                {userTags.length > 0 && (
                  <HeroTagsWrap>
                    {userTags.map(tag => (
                      <HeroTagPill key={tag.id} $color={tag.color || '#6B7280'}>
                        <HeroTagPillDot $color={tag.color || '#6B7280'} />
                        {tag.name}
                      </HeroTagPill>
                    ))}
                  </HeroTagsWrap>
                )}
              </HeroTitleRow>
              <HeroSubtitle>{user.email}</HeroSubtitle>
              <HeroBadge>{translateUserRole(user.role)}</HeroBadge>
            </HeroMeta>
            <HeroActions>
              <HeroEditButton onClick={() => navigate('/profile/edit')}>
                <MdEdit size={20} />
                Editar Perfil
              </HeroEditButton>
            </HeroActions>
          </HeroContent>
        </ProfileHero>

        {/* Estatísticas */}
        <StatsRow>
          <ResponsiveStats>
            {stats.map((stat, index) => (
              <StatCard key={index} $accentColor={stat.color}>
                <StatIcon color={stat.color}>
                  <stat.icon size={22} />
                </StatIcon>
                <StatContent>
                  <StatValue>{stat.value}</StatValue>
                  <StatLabel>{stat.label}</StatLabel>
                </StatContent>
              </StatCard>
            ))}
          </ResponsiveStats>
        </StatsRow>

        {/* Grid: coluna esquerda (perfil + segurança) | coluna direita (empresas) */}
        <ProfileMainGrid>
          <ProfileLeftColumn>
            {/* Card Informações Pessoais */}
            <InfoCard>
              <CardHeader>
                <CardTitle>
                  <MdPerson size={20} />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <InfoList>
                <InfoItem title={`Email: ${user.email}`}>
                  <InfoIcon>
                    <MdEmail />
                  </InfoIcon>
                  <InfoContent>
                    <InfoLabel>Email</InfoLabel>
                    <InfoValue>{user.email}</InfoValue>
                  </InfoContent>
                </InfoItem>
                <InfoItem
                  title={`Telefone: ${user.phone ? formatPhoneDisplay(user.phone) : 'Não informado'}`}
                >
                  <InfoIcon>
                    <MdPhone />
                  </InfoIcon>
                  <InfoContent>
                    <InfoLabel>Telefone</InfoLabel>
                    <InfoValue>
                      {user.phone
                        ? formatPhoneDisplay(user.phone)
                        : 'Não informado'}
                    </InfoValue>
                  </InfoContent>
                </InfoItem>
                <InfoItem title={`Cargo: ${translateUserRole(user.role)}`}>
                  <InfoIcon>
                    <MdBadge />
                  </InfoIcon>
                  <InfoContent>
                    <InfoLabel>Cargo</InfoLabel>
                    <InfoValue>{translateUserRole(user.role)}</InfoValue>
                  </InfoContent>
                </InfoItem>
                <InfoItem title={`Membro desde ${formatDate(user.created_at)}`}>
                  <InfoIcon>
                    <MdCalendarToday />
                  </InfoIcon>
                  <InfoContent>
                    <InfoLabel>Membro desde</InfoLabel>
                    <InfoValue>{formatDate(user.created_at)}</InfoValue>
                  </InfoContent>
                </InfoItem>
              </InfoList>
            </InfoCard>

            {/* Card Segurança */}
            <InfoCard>
              <CardHeader>
                <CardTitle>
                  <MdSecurity size={20} />
                  Segurança
                </CardTitle>
              </CardHeader>
              <InfoList>
                <InfoItem title='Veja e encerre sessões ativas'>
                  <InfoIcon>
                    <MdDevices />
                  </InfoIcon>
                  <InfoContent>
                    <InfoLabel>Sessões Ativas</InfoLabel>
                    <InfoValue>Gerenciar dispositivos</InfoValue>
                  </InfoContent>
                  <InfoAction onClick={handleOpenSessions}>
                    <MdMoreVert />
                  </InfoAction>
                </InfoItem>
                <InfoItem title='Alterar sua senha de acesso'>
                  <InfoIcon>
                    <MdLock />
                  </InfoIcon>
                  <InfoContent>
                    <InfoLabel>Alterar Senha</InfoLabel>
                    <InfoValue>Modificar senha de acesso</InfoValue>
                  </InfoContent>
                  <InfoAction
                    onClick={() => setIsChangePasswordModalOpen(true)}
                    style={{ cursor: 'pointer' }}
                  >
                    <MdSettings />
                  </InfoAction>
                </InfoItem>
                {false && (
                  <InfoItem
                    title={
                      isVisible
                        ? 'Perfil público habilitado'
                        : 'Perfil público desabilitado'
                    }
                  >
                    <InfoIcon>
                      <MdPeople />
                    </InfoIcon>
                    <InfoContent>
                      <InfoLabel>Visibilidade Pública</InfoLabel>
                      <InfoValue>
                        {isVisible
                          ? 'Habilitado na lista de corretores'
                          : 'Desabilitado'}
                      </InfoValue>
                    </InfoContent>
                    <InfoAction style={{ cursor: 'pointer' }}>
                      <span style={{ fontSize: '0.85rem' }}>
                        {isVisible ? 'Habilitado' : 'Desabilitado'}
                      </span>
                    </InfoAction>
                  </InfoItem>
                )}
              </InfoList>
            </InfoCard>
          </ProfileLeftColumn>

          {/* Coluna direita: Minhas Empresas */}
          <ProfileRightColumn>
            <InfoCard>
              <CardHeader>
                <CardTitle>
                  <MdBusiness size={20} />
                  Minhas Empresas
                </CardTitle>
              </CardHeader>
              <SectionBody>
                <SearchContainer style={{ marginBottom: 16 }}>
                  <SearchInputContainer>
                    <SearchInput
                      type='text'
                      placeholder='Buscar empresas...'
                      value={companySearchTerm}
                      onChange={e => setCompanySearchTerm(e.target.value)}
                    />
                    <SearchIcon size={20} />
                  </SearchInputContainer>
                </SearchContainer>

                {companiesLoading ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    border: '3px solid #e5e7eb',
                    borderTop: '3px solid #3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 16px auto',
                  }}
                />
                <LoadingText>Carregando empresas...</LoadingText>
              </div>
            ) : companiesError ? (
              <EmptyState>
                <EmptyStateIcon>
                  <MdError />
                </EmptyStateIcon>
                <EmptyStateTitle>Erro ao carregar empresas</EmptyStateTitle>
                <EmptyStateDescription>{companiesError}</EmptyStateDescription>
              </EmptyState>
            ) : filteredCompanies.length === 0 ? (
              <EmptyState>
                <EmptyStateIcon>
                  <MdBusiness />
                </EmptyStateIcon>
                <EmptyStateTitle>Nenhuma empresa encontrada</EmptyStateTitle>
                <EmptyStateDescription>
                  {companySearchTerm
                    ? 'Tente ajustar sua busca.'
                    : 'Você ainda não possui empresas cadastradas.'}
                </EmptyStateDescription>
              </EmptyState>
            ) : (
              filteredCompanies.map(company => (
                <CompanyCard key={company.id}>
                  <CompanyHeader>
                    <CompanyName>
                      <MdBusiness size={20} />
                      {company.name}
                    </CompanyName>
                    {(user?.role === 'admin' || user?.role === 'master') && (
                      <CompanyActions>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            marginRight: 8,
                          }}
                        >
                          <label
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              fontSize: 12,
                            }}
                          >
                            <input
                              type='checkbox'
                              checked={!!company2FAState[company.id]}
                              onChange={e =>
                                toggleCompany2FA(company.id, e.target.checked)
                              }
                              disabled={!!savingCompany2FA[company.id]}
                            />
                            TOTP obrigatório
                          </label>
                        </div>
                        <CompanyActionButton
                          onClick={() => handleEditCompany(company)}
                          title='Editar empresa'
                        >
                          <MdEdit />
                        </CompanyActionButton>
                        {company?.name?.toLowerCase() !== 'matrix' && (
                          <CompanyActionButton
                            onClick={() => handleDeleteCompany(company)}
                            title='Excluir empresa'
                          >
                            <MdClose />
                          </CompanyActionButton>
                        )}
                      </CompanyActions>
                    )}
                  </CompanyHeader>

                  <CompanyInfo>
                    <CompanyDetail>
                      <MdLocationOn size={16} />
                      {formatOptionalData(
                        company.address,
                        'Endereço não informado'
                      )}
                    </CompanyDetail>
                    <CompanyDetail>
                      <MdAttachMoney size={16} />
                      CNPJ: {formatOptionalData(company.cnpj)}
                    </CompanyDetail>
                    <CompanyDetail>
                      <MdCalendarToday size={16} />
                      Criada em: {formatDate(company.created_at)}
                    </CompanyDetail>
                  </CompanyInfo>
                </CompanyCard>
              ))
            )}
              </SectionBody>
            </InfoCard>
          </ProfileRightColumn>
        </ProfileMainGrid>

        {/* Input de arquivo oculto */}
        <HiddenFileInput
          ref={fileInputRef}
          type='file'
          accept='image/*'
          onChange={handleFileChange}
        />

        {/* Modais */}
        <SessionsModal
          isOpen={isSessionsModalOpen}
          onClose={() => setIsSessionsModalOpen(false)}
        />

        <ConfirmDeleteModal
          isOpen={isDeleteCompanyModalOpen}
          onClose={() => {
            setIsDeleteCompanyModalOpen(false);
            setCompanyToDelete(null);
          }}
          onConfirm={confirmDeleteCompany}
          title='Confirmar Exclusão de Empresa'
          message='Tem certeza que deseja excluir esta empresa? Esta ação é irreversível e todos os dados vinculados a esta empresa serão permanentemente removidos.'
          itemName={companyToDelete?.name}
          isLoading={isDeletingCompany}
          variant='delete'
          confirmLabel='Sim, Excluir Empresa'
          loadingLabel='Excluindo empresa...'
        />

        <ChangePasswordModal
          isOpen={isChangePasswordModalOpen}
          onClose={() => setIsChangePasswordModalOpen(false)}
        />
      </ProfilePageContainer>
    </Layout>
  );
};

export default ProfilePage;
