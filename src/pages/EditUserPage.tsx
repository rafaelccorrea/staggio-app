import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Layout } from '../components/layout/Layout';

// Styled components específicos para modo de permissões
const ModeButton = styled.button<{ $isActive: boolean }>`
  padding: 8px 16px;
  background-color: ${props =>
    props.$isActive
      ? props.theme.colors.primary
      : props.theme.colors.backgroundSecondary};
  color: ${props => (props.$isActive ? 'white' : props.theme.colors.text)};
  border: 1px solid
    ${props =>
      props.$isActive ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${props =>
      props.$isActive
        ? props.theme.colors.primaryDark
        : props.theme.colors.hover};
    border-color: ${props =>
      props.$isActive
        ? props.theme.colors.primaryDark
        : props.theme.colors.borderLight};
  }
`;

const CategoryCard = styled.div<{ $isSelected: boolean; $isLocked: boolean }>`
  padding: 16px;
  border: 2px solid
    ${props =>
      props.$isSelected
        ? props.theme.colors.success
        : props.theme.colors.border};
  border-radius: 8px;
  background-color: ${props => {
    if (props.$isLocked) return props.theme.colors.backgroundSecondary;
    if (props.$isSelected) return `${props.theme.colors.success}15`;
    return props.theme.colors.cardBackground;
  }};
  cursor: ${props => (props.$isLocked ? 'not-allowed' : 'pointer')};
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 12px;
  opacity: ${props => (props.$isLocked ? 0.7 : 1)};
  position: relative;

  &:hover {
    ${props =>
      !props.$isLocked &&
      `
      border-color: ${props.theme.colors.success};
      transform: translateY(-2px);
      box-shadow: 0 4px 12px ${props.theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'};
    `}
  }
`;

const CategoryCheckbox = styled.div<{
  $isSelected: boolean;
  $isLocked: boolean;
}>`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background-color: ${props =>
    props.$isSelected
      ? props.theme.colors.success
      : props.theme.colors.backgroundSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
  border: 2px solid
    ${props =>
      props.$isSelected
        ? props.theme.colors.success
        : props.theme.colors.border};
`;

const CategoryInfo = styled.div`
  flex: 1;
`;

const CategoryName = styled.div`
  font-weight: 600;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${props => props.theme.colors.text};
`;

const CategoryBadge = styled.span`
  font-size: 0.7rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const CategoryCount = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const CategoryDropdownBtn = styled.button<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid
    ${props =>
      props.$isOpen ? `${props.theme.colors.primary}40` : props.theme.colors.border};
  border-radius: 8px;
  background: ${props =>
    props.$isOpen
      ? `${props.theme.colors.primary}12`
      : props.theme.colors.cardBackground};
  color: ${props =>
    props.$isOpen ? props.theme.colors.primary : props.theme.colors.textSecondary};
  cursor: pointer;
  transition: transform 0.25s ease, background 0.2s, border-color 0.2s, color 0.2s;
  flex-shrink: 0;
  box-shadow: ${props =>
    props.theme.mode === 'dark'
      ? '0 1px 2px rgba(0,0,0,0.2)'
      : '0 1px 2px rgba(0,0,0,0.04)'};

  &:hover {
    background: ${props =>
      props.$isOpen
        ? `${props.theme.colors.primary}18`
        : props.theme.colors.hover};
    border-color: ${props =>
      props.$isOpen ? props.theme.colors.primary : props.theme.colors.borderLight};
    color: ${props =>
      props.$isOpen ? props.theme.colors.primary : props.theme.colors.text};
  }
  transform: ${props => (props.$isOpen ? 'rotate(180deg)' : 'rotate(0)')};
`;

const CategoryDropdownPanel = styled.div`
  margin-top: 12px;
  padding: 12px 14px 14px;
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 10px;
  margin-left: -14px;
  margin-right: -14px;
  margin-bottom: -14px;
  box-shadow: ${props =>
    props.theme.mode === 'dark'
      ? '0 4px 12px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.06)'
      : '0 4px 14px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)'};
`;

const PermissionLockBadge = styled.span`
  margin-left: 6px;
  font-size: 0.7rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const PermissionSummary = styled.div`
  margin-top: 24px;
  padding: 16px;
  background-color: ${props => props.theme.colors.backgroundSecondary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
`;

const SummaryTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: ${props => props.theme.colors.text};
`;

const SummaryText = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
`;

import { useUsers } from '../hooks/useUsers';
import { usePermissions } from '../hooks/usePermissions';
import { useTags } from '../hooks/useTags';
import { useModules } from '../hooks/useModules';
import { getRequiredModuleForPermission } from '../utils/permissionModuleMapping';
import { TagSelector } from '../components/TagSelector';
import { ManagerSelector } from '../components/common/ManagerSelector';
import { formatPhone, formatCPF, formatCNPJ } from '../utils/masks';
import { showSuccess, showError } from '../utils/notifications';
import { EditUserShimmer } from '../components/shimmer/EditUserShimmer';
import { ShimmerBase } from '../components/common/Shimmer';
import {
  userProfiles,
  convertPermissionNamesToIds,
} from '../utils/userProfiles';
import {
  addPermissionWithDependencies,
  removePermissionCheckDependencies,
  getDependencyMessage,
  getDependentPermissionsMessage,
  filterGalleryPermissions,
} from '../utils/permissionDependencies';
import {
  getCategoryLabel,
  getCategoryIcon,
} from '../utils/permissionCategoryMapping';
import { getPermissionDescription } from '../utils/permissionDescriptions';
import {
  hasIntellisysAppPermissionChanged,
  hasAllIntellisysAppPermissions,
} from '../utils/intellisysAppPermissions';
import type { UpdateUserData, User } from '../services/usersApi';
import { usersApi } from '../services/usersApi';
import type { Permission } from '../services/permissionsApi';
import { permissionsApi } from '../services/permissionsApi';
import { toast } from 'react-toastify';
import { KANBAN_OPERATIONAL_PERMISSIONS } from '../hooks/useKanbanPermissions';
import {
  getSystemRequiredPermissionIds,
  isSystemRequiredPermission,
} from '../utils/requiredPermissions';

/** Permissões operacionais do funil: todos os usuários têm por padrão. Não podem ser removidas. */
const BROKER_FIXED_PERMISSIONS = [...KANBAN_OPERATIONAL_PERMISSIONS] as readonly string[];
import {
  MdArrowBack,
  MdSave,
  MdPerson,
  MdEmail,
  MdPhone,
  MdBadge,
  MdSecurity,
  MdInfo,
  MdPeople,
} from 'react-icons/md';
import { useAuth } from '../hooks/useAuth';
import {
  AppAccessCard,
  AppAccessLabel,
  AppAccessDescription,
  AppAccessAlertBox,
  AppAccessAlertTitle,
  AppAccessAlertText,
  AppAccessSwitchTrack,
  AppAccessSwitchThumb,
} from '../styles/pages/CreateUserPageStyles';
import {
  PageContainer,
  PageHeader,
  HeaderLeft,
  BackButton,
  PageTitle,
  PageSubtitle,
  ContentGrid,
  LeftColumn,
  RightColumn,
  Card,
  CardHeader,
  CardTitle,
  CardIcon,
  FormGroup,
  Label,
  Input,
  Select,
  FormGrid,
  ErrorMessage,
  InfoBox,
  InfoText,
  ActionBar,
  ActionBarSummary,
  SaveButton,
} from '../styles/pages/EditUserPageStyles';

const PermissionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const PermissionCategory = styled.div`
  background: ${props => props.theme.colors.backgroundSecondary};
  border-radius: 12px;
  padding: 20px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const CategoryTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const CategoryIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${props => `${props.theme.colors.primary}10`};
  color: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
`;

const PermissionItem = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
  margin-bottom: 4px;

  &:hover {
    background: ${props => props.theme.colors.hover};
  }

  input[type='checkbox'] {
    margin: 0;
    width: 18px;
    height: 18px;
    accent-color: ${props => props.theme.colors.primary};
  }
`;

const PermissionInfo = styled.div`
  flex: 1;
`;

const PermissionName = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  margin-bottom: 4px;
`;

const PermissionDescription = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.4;
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const EditUserPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getUserById, updateUser, isLoading: usersLoading } = useUsers();
  const {
    permissions,
    loading: permissionsLoading,
    loadPermissions,
  } = usePermissions();
  const { getUserTags } = useTags();
  const { hasModule } = useModules();
  const { getCurrentUser } = useAuth();
  const currentUser = getCurrentUser();

  // Filtrar permissões baseado nos módulos disponíveis
  const availablePermissions = React.useMemo(() => {
    return permissions.filter(permission => {
      const requiredModule = getRequiredModuleForPermission(permission.name);

      // Se não requer módulo específico, está disponível
      if (!requiredModule) return true;

      // Se requer módulo, verificar se empresa tem acesso
      return hasModule(requiredModule);
    });
  }, [permissions, hasModule]);

  // Obter IDs das permissões fixas de corretor (Funil de Vendas)
  const getBrokerFixedPermissionIds = React.useCallback(() => {
    return availablePermissions
      .filter(p => BROKER_FIXED_PERMISSIONS.includes(p.name as any))
      .map(p => p.id);
  }, [availablePermissions]);

  /** Permissões fixas = Funil (corretor) + obrigatórias do sistema (user:view, team:view) */
  const getFixedPermissionIds = React.useCallback(() => {
    return [
      ...new Set([
        ...getBrokerFixedPermissionIds(),
        ...getSystemRequiredPermissionIds(availablePermissions),
      ]),
    ];
  }, [availablePermissions, getBrokerFixedPermissionIds]);

  // Verificar se uma permissão é fixa de corretor
  const isBrokerFixedPermission = React.useCallback(
    (permissionId: string) => {
      const permission = availablePermissions.find(p => p.id === permissionId);
      return permission
        ? BROKER_FIXED_PERMISSIONS.includes(permission.name as any)
        : false;
    },
    [availablePermissions]
  );

  // Função para obter o label da categoria (renomeando kanban para Funil de Vendas)
  const getCategoryDisplayLabel = (
    category: string,
    permissionName?: string
  ) => {
    const baseLabel = getCategoryLabel(category, permissionName);
    // Renomear kanban para Funil de Vendas
    if (category === 'kanban' || baseLabel.toLowerCase().includes('kanban')) {
      return baseLabel.replace(/kanban/gi, 'Funil de Vendas');
    }
    return baseLabel;
  };

  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UpdateUserData>({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    password: '',
    managerId: undefined,
    isAvailableForPublicSite: false,
    hasAppAccess: false,
  });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>('empty');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [validatingEmail, setValidatingEmail] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [previousPermissions, setPreviousPermissions] = useState<string[]>([]); // Para rastrear mudanças
  const [loadedUserPermissionNames, setLoadedUserPermissionNames] = useState<
    string[] | null
  >(null); // Nomes carregados do backend para resolver IDs pela lista disponível

  // Owner editando a si mesmo: não pode alterar suas permissões
  const isOwnerSelfPermissionLocked = Boolean(
    currentUser &&
      user &&
      currentUser.role === 'admin' &&
      (currentUser.owner === true || currentUser.owner === 'true') &&
      currentUser.id === user.id
  );
  // Usuário sendo editado é o proprietário (owner): só master pode alterar as permissões dele
  const isEditingOwner = Boolean(
    user && (user.owner === true || user.owner === 'true')
  );
  const isMaster = currentUser?.role === 'master';
  const isOwnerPermissionsLocked =
    (isOwnerSelfPermissionLocked || isEditingOwner) && !isMaster;

  // Carregar permissões disponíveis
  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  // Adicionar permissões de usuário automaticamente para manager e admin
  useEffect(() => {
    if (
      availablePermissions.length > 0 &&
      formData.role &&
      (formData.role === 'manager' || formData.role === 'admin')
    ) {
      // Obter todas as permissões da categoria 'user' ou que começam com 'user:'
      const userPermissions = availablePermissions.filter(
        p =>
          p.category === 'user' ||
          p.name.startsWith('user:') ||
          p.category === 'Gestão de Usuários'
      );

      const userPermissionIds = userPermissions.map(p => p.id);

      // Adicionar permissões de usuário se ainda não estiverem selecionadas
      setSelectedPermissions(prev => {
        const newPermissions = [...prev];
        userPermissionIds.forEach(id => {
          if (!newPermissions.includes(id)) {
            newPermissions.push(id);
          }
        });
        return newPermissions;
      });

    }
  }, [formData.role, availablePermissions]);

  // Carregar dados do usuário
  useEffect(() => {
    const loadUser = async () => {
      if (!id) return;

      try {
        const userData = await getUserById(id);
        setUser(userData);
        setFormData({
          name: userData.name,
          email: userData.email,
          phone: userData.phone || '',
          role: userData.role,
          password: '',
          managerId: userData.managerId,
          isAvailableForPublicSite: userData.isAvailableForPublicSite || false,
          hasAppAccess: userData.hasAppAccess || false,
        });

        // Carregar permissões do usuário: endpoint dedicado ou fallback do próprio user (getUserById com relations)
        try {
          const userPermsResponse = await permissionsApi.getUserPermissionsById(
            userData.id
          );
          let perms = userPermsResponse?.permissions ?? [];
          // Se o endpoint retornar vazio mas o user (getUserById) tiver permissions, usar do user
          if (
            perms.length === 0 &&
            userData.permissions &&
            userData.permissions.length > 0
          ) {
            perms = userData.permissions as Permission[];
          }
          const names = perms.map((p: Permission) => p.name);
          setLoadedUserPermissionNames(names);
          const permissionIds = perms.map((p: Permission) => String(p.id));
          setSelectedPermissions(permissionIds);
          setPreviousPermissions(permissionIds);
        } catch {
          // Fallback em erro: usar permissões vindas do próprio user (getUserById com relations)
          if (userData.permissions && userData.permissions.length > 0) {
            const perms = userData.permissions as Permission[];
            setLoadedUserPermissionNames(perms.map(p => p.name));
            const permissionIds = perms.map(p => String(p.id));
            setSelectedPermissions(permissionIds);
            setPreviousPermissions(permissionIds);
          } else {
            setLoadedUserPermissionNames([]);
            setSelectedPermissions([]);
            setPreviousPermissions([]);
          }
        }

        // Carregar tags do usuário
        try {
          const userTags = await getUserTags(userData.id);
          setSelectedTags(userTags.map(tag => tag.id));
        } catch {
          setSelectedTags([]);
        }
      } catch (error: any) {
        showError('Erro ao carregar dados do usuário: ' + error.message);
        navigate('/users');
      }
    };

    loadUser();
  }, [id, getUserById, navigate, getUserTags]);

  // Quando a lista de permissões disponíveis carregar, resolver as permissões do usuário por nome
  // para garantir que os IDs usados são os mesmos da lista (evita pré-seleção falhar por ID diferente).
  useEffect(() => {
    if (
      loadedUserPermissionNames !== null &&
      availablePermissions.length > 0
    ) {
      const idsFromNames = loadedUserPermissionNames
        .map(name => availablePermissions.find(p => p.name === name)?.id)
        .filter((id): id is string => id != null);
      const fixedIds = getFixedPermissionIds();
      const merged = [...new Set([...idsFromNames, ...fixedIds])];
      setSelectedPermissions(merged);
      setPreviousPermissions(merged);
      setLoadedUserPermissionNames(null); // Aplicado uma vez
    }
  }, [
    loadedUserPermissionNames,
    availablePermissions,
    getFixedPermissionIds,
  ]);

  // Garantir que permissões fixas (funil + obrigatórias do sistema) estejam sempre incluídas
  useEffect(() => {
    if (availablePermissions.length > 0 && selectedPermissions.length > 0) {
      const fixedPermissionIds = getFixedPermissionIds();
      if (fixedPermissionIds.length > 0) {
        setSelectedPermissions(prev => [
          ...new Set([...prev, ...fixedPermissionIds]),
        ]);
      }
    }
  }, [
    availablePermissions,
    getFixedPermissionIds,
    selectedPermissions.length,
  ]);

  const handleInputChange = (
    field: keyof UpdateUserData,
    value: string | boolean
  ) => {
    // Se for um campo booleano, aplicar diretamente sem formatação
    if (field === 'isAvailableForPublicSite' || field === 'hasAppAccess') {
      setFormData(prev => ({
        ...prev,
        [field]: value as boolean,
      }));

      // Limpar erro do campo
      if (errors[field]) {
        setErrors(prev => ({
          ...prev,
          [field]: '',
        }));
      }
      return;
    }

    // Para campos de texto, aplicar formatação
    let formattedValue = value as string;

    // Aplicar máscaras
    if (field === 'phone') {
      formattedValue = formatPhone(formattedValue);
    } else if (field === 'document') {
      // Detectar se é CPF ou CNPJ
      const alphanumericValue = formattedValue.replace(/[^A-Za-z0-9]/g, '');
      const hasLetters = /[A-Za-z]/.test(alphanumericValue);

      // Se tem letras, é CNPJ
      if (hasLetters) {
        formattedValue = formatCNPJ(formattedValue);
      } else if (alphanumericValue.length <= 11) {
        formattedValue = formatCPF(formattedValue);
      } else {
        formattedValue = formatCNPJ(formattedValue);
      }
    }

    // Bloquear promoção para 'admin' (Proprietário) se o usuário atual não for admin
    if (
      field === 'role' &&
      formattedValue === 'admin' &&
      user &&
      user.role !== 'admin'
    ) {
      showError('Não é permitido atualizar a função para Proprietário.');
      return;
    }

    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: formattedValue,
      };

      // Se o role mudou de 'user' para outro tipo, desativar acesso ao Intellisys
      if (field === 'role' && formattedValue !== 'user' && prev.hasAppAccess) {
        newData.hasAppAccess = false;
      }

      return newData;
    });

    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleValidateEmail = async () => {
    const email = formData.email?.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    if (!user?.id) return;
    setValidatingEmail(true);
    try {
      const { available } = await usersApi.validateEmail(email, user.id);
      setErrors(prev => ({
        ...prev,
        email: available ? '' : 'Email já está em uso',
      }));
    } catch {
      setErrors(prev => ({ ...prev, email: 'Erro ao verificar disponibilidade' }));
    } finally {
      setValidatingEmail(false);
    }
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (isOwnerPermissionsLocked) {
      toast.warning(
        isEditingOwner
          ? 'Apenas o usuário master pode alterar as permissões do proprietário.'
          : 'Por segurança, proprietários não podem alterar suas próprias permissões.'
      );
      return;
    }

    // Verificar se é uma permissão de usuário e se o role é manager ou admin
    const permission = availablePermissions.find(p => p.id === permissionId);
    if (
      permission &&
      formData.role &&
      (formData.role === 'manager' || formData.role === 'admin') &&
      (permission.category === 'user' ||
        permission.name.startsWith('user:') ||
        permission.category === 'Gestão de Usuários')
    ) {
      toast.warning(
        'Permissões de usuário são obrigatórias para este perfil e não podem ser editadas'
      );
      return;
    }

    // Verificar se é uma permissão fixa de corretor (Funil de Vendas) e tentar remover
    if (!checked && isBrokerFixedPermission(permissionId)) {
      toast.warning(
        'Permissões de Funil de Vendas são obrigatórias para corretores e não podem ser removidas'
      );
      return;
    }

    // Verificar se é uma permissão obrigatória do sistema (user:view, team:view)
    const perm = availablePermissions.find(p => p.id === permissionId);
    if (!checked && perm && isSystemRequiredPermission(perm.name)) {
      toast.warning(
        'Visualização de usuários e equipes é obrigatória para o funcionamento do sistema e não pode ser removida'
      );
      return;
    }

    setSelectedPermissions(prev => {
      let newPermissions: string[];

      if (checked) {
        // Adicionar permissão com dependências (usar lista completa para resolver ex.: team:view ao marcar kanban:manage_users)
        const result = addPermissionWithDependencies(
          prev,
          permissionId,
          permissions
        );
        newPermissions = result.permissions;

        // Mostrar notificação se dependências foram adicionadas
        if (result.addedDependencies.length > 0) {
          const message = getDependencyMessage(
            result.addedDependencies,
            permissions
          );
          toast.info(message, {
            autoClose: 5000,
          });
        }
      } else {
        // Remover permissão verificando dependências
        const result = removePermissionCheckDependencies(
          prev,
          permissionId,
          permissions
        );

        if (!result.canRemove) {
          // Não pode remover, mostrar aviso
          const message = getDependentPermissionsMessage(
            result.dependentPermissions,
            permissions
          );
          toast.warning(message, {
            autoClose: 7000,
          });
          return prev; // Não altera as permissões
        }

        newPermissions = result.permissions;
      }

      // Garantir que permissões fixas (funil + obrigatórias do sistema) estejam sempre incluídas
      const fixedPermissionIds = getFixedPermissionIds();
      const allPermissions = [
        ...new Set([...newPermissions, ...fixedPermissionIds]),
      ];

      newPermissions = allPermissions;

      // Verificar se alguma permissão do Intellisys App foi alterada
      if (formData.hasAppAccess && availablePermissions.length > 0) {
        const hasChanged = hasIntellisysAppPermissionChanged(
          previousPermissions,
          newPermissions,
          availablePermissions
        );

        if (hasChanged) {
          // Desativar flag e mostrar alerta
          setFormData(prevFormData => ({
            ...prevFormData,
            hasAppAccess: false,
          }));
          toast.warning(
            '⚠️ As permissões do aplicativo Intellisys foram alteradas. O acesso ao app foi desativado. Ative novamente se desejar manter o acesso.'
          );
        }
      }

      // Atualizar referência anterior
      setPreviousPermissions(newPermissions);

      return newPermissions;
    });
    // Se o usuário modificar manualmente, mudar para perfil personalizado
    setSelectedProfile('empty');
  };

  const handleProfileChange = (profileId: string) => {
    if (isOwnerPermissionsLocked) {
      toast.warning(
        isEditingOwner
          ? 'Apenas o usuário master pode alterar as permissões do proprietário.'
          : 'Por segurança, proprietários não podem alterar suas próprias permissões.'
      );
      return;
    }

    setSelectedProfile(profileId);

    // Se não for perfil personalizado, aplicar permissões do perfil
    if (profileId !== 'empty') {
      const profile = userProfiles.find(p => p.id === profileId);
      if (profile) {
        const permissionIds = convertPermissionNamesToIds(
          profile.permissionNames,
          availablePermissions
        );

        // Sempre incluir permissões fixas (funil + obrigatórias do sistema)
        const fixedIds = getFixedPermissionIds();
        const withFixed = [...new Set([...permissionIds, ...fixedIds])];

        // Se for Manager ou Admin, preservar permissões de usuário obrigatórias
        if (
          formData.role &&
          (formData.role === 'manager' || formData.role === 'admin')
        ) {
          const userPermissions = availablePermissions.filter(
            p =>
              p.category === 'user' ||
              p.name.startsWith('user:') ||
              p.category === 'Gestão de Usuários'
          );
          const userPermissionIds = userPermissions.map(p => p.id);
          const combinedPermissions = [
            ...new Set([...withFixed, ...userPermissionIds]),
          ];
          setSelectedPermissions(combinedPermissions);
        } else {
          setSelectedPermissions(withFixed);
        }

        toast.success(
          `Perfil "${profile.name}" aplicado com ${permissionIds.length} permissões`
        );
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    // Validar: apenas corretores (role: 'user') podem ter acesso ao app
    if (formData.hasAppAccess && formData.role !== 'user') {
      newErrors.hasAppAccess =
        'Apenas corretores podem ter acesso ao aplicativo móvel';
    }

    // Validar que todos os usuários tenham pelo menos 1 permissão
    if (selectedPermissions.length === 0) {
      newErrors.permissions = 'É obrigatório selecionar pelo menos 1 permissão';
      toast.error('É obrigatório selecionar pelo menos 1 permissão');
    }

    // Garantir que permissões fixas (funil + obrigatórias do sistema) estejam sempre incluídas
    const fixedPermissionIds = getFixedPermissionIds();
    const missingFixedPermissions = fixedPermissionIds.filter(
      id => !selectedPermissions.includes(id)
    );
    if (missingFixedPermissions.length > 0) {
      setSelectedPermissions(prev => [
        ...new Set([...prev, ...fixedPermissionIds]),
      ]);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !user) return;

    setIsSaving(true);
    try {
      // Guardar contra atualização indevida para Proprietário
      if (formData.role === 'admin' && user.role !== 'admin') {
        showError('Você não pode atualizar a função para Proprietário.');
        setIsSaving(false);
        return;
      }

      // Validar disponibilidade do email antes de salvar (exclui o próprio usuário)
      const { available } = await usersApi.validateEmail(
        formData.email?.trim() ?? '',
        user.id
      );
      if (!available) {
        setErrors(prev => ({ ...prev, email: 'Email já está em uso' }));
        setIsSaving(false);
        return;
      }

      // Garantir permissões fixas (funil + obrigatórias do sistema: user:view, team:view)
      // Se estiver editando o proprietário, manter permissões atuais (imutáveis)
      const fixedIds = getFixedPermissionIds();
      const finalPermissionsArray = isOwnerPermissionsLocked
        ? [...new Set([...previousPermissions, ...fixedIds])]
        : [...new Set([...selectedPermissions, ...fixedIds])];

      const updateData: UpdateUserData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        permissionIds: finalPermissionsArray,
        tagIds: selectedTags,
        isAvailableForPublicSite: formData.isAvailableForPublicSite,
        hasAppAccess: formData.hasAppAccess,
      };

      // Incluir senha apenas se foi fornecida
      if (formData.password) {
        updateData.password = formData.password;
      }

      const updatedUser = await updateUser(user.id, updateData);

      // Se a flag de acesso ao app foi alterada, chamar API específica
      // Verificar se o valor mudou comparando com o valor original do usuário
      const appAccessChanged =
        formData.hasAppAccess !== (user.hasAppAccess || false);

      if (appAccessChanged && updatedUser.id) {
        try {
          const { usersApi } = await import('../services/usersApi');
          await usersApi.updateUserAppAccess(
            updatedUser.id,
            formData.hasAppAccess || false
          );
        } catch (error: any) {
          // Se falhar, ainda consideramos o usuário atualizado, mas mostramos aviso
          console.error('Erro ao atualizar acesso ao aplicativo:', error);
          showError(
            'Usuário atualizado, mas houve um erro ao atualizar o acesso ao aplicativo. Tente novamente.'
          );
        }
      }

      showSuccess('Usuário atualizado com sucesso!');
      navigate('/users');
    } catch (error: any) {
      showError('Erro ao atualizar usuário: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Função para agrupar permissões por categoria
  const getPermissionsByCategory = () => {
    const filteredPermissions = filterGalleryPermissions(availablePermissions);
    return filteredPermissions.reduce(
      (acc, permission) => {
        // Normalizar categoria: se for null, undefined ou "other", derivar do nome da permissão
        let category = permission.category;
        if (
          !category ||
          category === 'other' ||
          category === 'null' ||
          category === 'undefined' ||
          category.trim() === ''
        ) {
          // Tentar extrair categoria do nome da permissão (formato: "category:action")
          const match = permission.name.match(/^([^:]+):/);
          if (match) {
            category = match[1];
          } else {
            category = 'system';
          }
        }
        // Agrupar pelo rótulo unificado para evitar seções duplicadas (ex.: "Gestão de Aluguéis" + "rental")
        const groupKey = getCategoryLabel(category, permission.name);

        if (!acc[groupKey]) {
          acc[groupKey] = [];
        }
        // Cast to Permission since availablePermissions contains full Permission objects
        acc[groupKey].push(permission as Permission);
        return acc;
      },
      {} as Record<string, Permission[]>
    );
  };

  // Função para obter todas as permissões de uma categoria
  const getCategoryPermissionIds = (category: string) => {
    const categoryPermissions = getPermissionsByCategory()[category] || [];
    return categoryPermissions.map(p => p.id);
  };

  // Função para verificar se uma categoria está selecionada
  const isCategorySelected = (category: string) => {
    const categoryPermissionIds = getCategoryPermissionIds(category);
    const isSelected = categoryPermissionIds.every(id =>
      selectedPermissions.includes(id)
    );

    // Log para debug
    if (categoryPermissionIds.length > 0) {
      const selectedCount = categoryPermissionIds.filter(id =>
        selectedPermissions.includes(id)
      ).length;
      if (selectedCount > 0 && selectedCount < categoryPermissionIds.length) {
      }
    }

    return isSelected;
  };

  // Função para selecionar/deselecionar categoria
  const toggleCategory = (category: string) => {
    if (isOwnerPermissionsLocked) {
      toast.warning(
        isEditingOwner
          ? 'Apenas o usuário master pode alterar as permissões do proprietário.'
          : 'Por segurança, proprietários não podem alterar suas próprias permissões.'
      );
      return;
    }

    // Impedir edição de permissões de usuário para manager e admin
    if (
      formData.role &&
      (formData.role === 'manager' || formData.role === 'admin') &&
      (category === 'user' || category === 'Gestão de Usuários')
    ) {
      toast.warning(
        'Permissões de usuário são obrigatórias para este perfil e não podem ser editadas'
      );
      return;
    }

    // Impedir remover categoria Funil de Vendas (kanban) — chave pode ser rótulo unificado
    if (category === 'kanban' || category === 'CRM' || category === 'Funil de Vendas') {
      toast.warning(
        'Permissões de Funil de Vendas são obrigatórias para corretores e não podem ser removidas'
      );
      return;
    }

    const categoryPermissionIds = getCategoryPermissionIds(category);
    const isSelected = isCategorySelected(category);

    if (isSelected) {
      // Remover apenas as que não são fixas (funil + obrigatórias do sistema)
      const fixedPermissionIds = getFixedPermissionIds();
      const removableIds = categoryPermissionIds.filter(
        id => !fixedPermissionIds.includes(id)
      );

      if (removableIds.length === 0) {
        toast.warning(
          'Esta categoria contém permissões obrigatórias do sistema e não podem ser removidas'
        );
        return;
      }
      setSelectedPermissions(prev =>
        prev.filter(id => !removableIds.includes(id))
      );
    } else {
      // Adicionar todas as permissões da categoria
      setSelectedPermissions(prev => {
        const newPermissions = [...prev];
        categoryPermissionIds.forEach(id => {
          if (!newPermissions.includes(id)) {
            newPermissions.push(id);
          }
        });
        return newPermissions;
      });
    }
  };

  if (usersLoading || !user) {
    return (
      <Layout>
        <EditUserShimmer />
      </Layout>
    );
  }

  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <HeaderLeft>
            <BackButton onClick={() => navigate('/users')}>
              <MdArrowBack size={20} />
              Voltar
            </BackButton>
            <div>
              <PageTitle>Editar Usuário</PageTitle>
              <PageSubtitle>
                {user?.name
                  ? `Editando ${user.name}`
                  : 'Atualize as informações e permissões'}
              </PageSubtitle>
            </div>
          </HeaderLeft>
        </PageHeader>

        <ContentGrid>
          <LeftColumn>
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardIcon>
                <MdPerson size={20} />
              </CardIcon>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>

            <FormGrid>
              <FormGroup>
                <Label>
                  <MdPerson size={16} />
                  Nome Completo
                </Label>
                <Input
                  type='text'
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  placeholder='Digite o nome completo'
                />
                {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label>
                  <MdEmail size={16} />
                  Email
                  {validatingEmail && (
                    <span style={{ fontWeight: 400, fontSize: '0.8rem', marginLeft: 6 }}>
                      Verificando...
                    </span>
                  )}
                </Label>
                <Input
                  type='email'
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  onBlur={handleValidateEmail}
                  placeholder='email@exemplo.com'
                />
                {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label>
                  <MdPhone size={16} />
                  Telefone
                </Label>
                <Input
                  type='text'
                  value={formData.phone}
                  onChange={e => handleInputChange('phone', e.target.value)}
                  placeholder='(00) 00000-0000'
                  maxLength={15}
                />
              </FormGroup>

              <FormGroup>
                <Label>
                  <MdBadge size={16} />
                  Função
                </Label>
                <Select
                  value={formData.role}
                  onChange={e => handleInputChange('role', e.target.value)}
                >
                  <option value='user'>Colaborador</option>
                  <option value='manager'>Gestor</option>
                  <option value='admin'>Proprietário</option>
                </Select>
              </FormGroup>

              {/* Visibilidade Pública - oculto por enquanto */}
              {false && (
                <FormGroup style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      background: 'var(--color-background-secondary)',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <Label style={{ marginBottom: '4px', display: 'block' }}>
                        <MdPeople size={16} style={{ marginRight: '8px' }} />
                        Visibilidade Pública
                      </Label>
                      <InfoText>
                        {formData.isAvailableForPublicSite
                          ? 'Este corretor aparece na lista pública de corretores do site'
                          : 'Este corretor não aparece na lista pública de corretores'}
                      </InfoText>
                    </div>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        gap: '12px',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          position: 'relative',
                          width: '48px',
                          height: '24px',
                          background: formData.isAvailableForPublicSite
                            ? 'var(--color-primary)'
                            : 'var(--color-border)',
                          borderRadius: '12px',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type='checkbox'
                          checked={formData.isAvailableForPublicSite || false}
                          onChange={e =>
                            handleInputChange(
                              'isAvailableForPublicSite',
                              e.target.checked
                            )
                          }
                          style={{
                            position: 'absolute',
                            opacity: 0,
                            width: '100%',
                            height: '100%',
                            margin: 0,
                            cursor: 'pointer',
                          }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            top: '2px',
                            left: formData.isAvailableForPublicSite
                              ? '26px'
                              : '2px',
                            width: '20px',
                            height: '20px',
                            background: 'var(--color-card-background)',
                            borderRadius: '50%',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          }}
                        />
                      </div>
                    </label>
                  </div>
                </FormGroup>
              )}

              {/* Acesso ao Aplicativo Intellisys - oculto por enquanto */}
              {false && formData.role === 'user' && (
                <>
                  <FormGroup style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                    <AppAccessCard $active={formData.hasAppAccess}>
                      <div style={{ flex: 1 }}>
                        <AppAccessLabel
                          as='div'
                          style={{ marginBottom: '4px', display: 'block' }}
                        >
                          📱 Acesso ao aplicativo Intellisys
                        </AppAccessLabel>
                        <AppAccessDescription>
                          {formData.hasAppAccess
                            ? 'O usuário tem acesso ao aplicativo móvel'
                            : 'Ative para conceder acesso ao aplicativo móvel'}
                        </AppAccessDescription>
                      </div>
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                          flexShrink: 0,
                          position: 'relative',
                        }}
                      >
                        <input
                          type='checkbox'
                          checked={formData.hasAppAccess || false}
                          onChange={e => {
                            const shouldEnable = e.target.checked;
                            setFormData(prev => ({
                              ...prev,
                              hasAppAccess: shouldEnable,
                            }));
                          }}
                          style={{
                            position: 'absolute',
                            opacity: 0,
                            width: '48px',
                            height: '24px',
                            margin: 0,
                            cursor: 'pointer',
                            zIndex: 1,
                          }}
                        />
                        <AppAccessSwitchTrack $active={formData.hasAppAccess}>
                          <AppAccessSwitchThumb $active={formData.hasAppAccess} />
                        </AppAccessSwitchTrack>
                      </label>
                    </AppAccessCard>
                  </FormGroup>

                  {!formData.hasAppAccess &&
                    availablePermissions.length > 0 &&
                    selectedPermissions.length > 0 &&
                    hasAllIntellisysAppPermissions(
                      selectedPermissions,
                      availablePermissions
                    ) && (
                      <FormGroup
                        style={{ gridColumn: '1 / -1', marginTop: '8px' }}
                      >
                        <AppAccessAlertBox>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '12px',
                            }}
                          >
                            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                            <div style={{ flex: 1 }}>
                              <AppAccessAlertTitle>
                                Acesso ao aplicativo Intellisys desativado
                              </AppAccessAlertTitle>
                              <AppAccessAlertText>
                                O usuário possui todas as permissões necessárias
                                para o aplicativo Intellisys, mas o acesso está
                                desativado. Ative a opção acima para conceder
                                acesso ao app.
                              </AppAccessAlertText>
                            </div>
                          </div>
                        </AppAccessAlertBox>
                      </FormGroup>
                    )}
                </>
              )}
            </FormGrid>

            {/* Gestor Responsável - apenas para usuários (com espaço para o bloco) */}
            {formData.role === 'user' && (
              <FormGroup style={{ marginTop: '24px' }}>
                <ManagerSelector
                  value={formData.managerId ?? null}
                  onChange={managerId =>
                    setFormData(prev => ({
                      ...prev,
                      managerId: managerId ?? undefined,
                    }))
                  }
                  userRole={
                    formData.role as 'user' | 'admin' | 'master' | 'manager'
                  }
                />
              </FormGroup>
            )}

            <FormGroup style={{ marginTop: '20px' }}>
              <Label>
                <MdSecurity size={16} />
                Nova Senha (opcional)
              </Label>
              <Input
                type='password'
                value={formData.password}
                onChange={e => handleInputChange('password', e.target.value)}
                placeholder='Deixe em branco para manter a senha atual'
              />
              {errors.password && (
                <ErrorMessage>{errors.password}</ErrorMessage>
              )}
            </FormGroup>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardIcon>🏷️</CardIcon>
              <CardTitle>Tags</CardTitle>
            </CardHeader>

            <FormGroup>
              <Label>Tags do Usuário</Label>
              <TagSelector
                selectedTagIds={selectedTags}
                onTagChange={setSelectedTags}
                maxTags={10}
              />
            </FormGroup>
          </Card>
          </LeftColumn>

          <RightColumn>
          {/* Permissões */}
          <Card>
            <CardHeader>
              <CardIcon>
                <MdSecurity size={20} />
              </CardIcon>
              <CardTitle>Permissões</CardTitle>
            </CardHeader>

            <InfoBox>
              <MdInfo size={20} />
              <InfoText>
                {isOwnerPermissionsLocked
                  ? isEditingOwner
                    ? 'Apenas o usuário master pode alterar as permissões do proprietário.'
                    : 'Por segurança, proprietários não podem alterar suas próprias permissões.'
                  : 'Selecione as permissões que este usuário terá acesso no sistema'}
              </InfoText>
            </InfoBox>

            {/* Perfil de Usuário */}
            <FormGroup>
              <Label>Perfil de Usuário</Label>
              <Select
                value={selectedProfile}
                onChange={e => handleProfileChange(e.target.value)}
              >
                {userProfiles.map(profile => (
                  <option key={profile.id} value={profile.id}>
                    {profile.icon} {profile.name} - {profile.description}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Selecionar por Categoria</Label>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', marginBottom: '12px' }}>
                Clique no card para marcar ou desmarcar a categoria. Use o botão ▼ para abrir e ver/editar permissões específicas.
              </p>
              {formData.role &&
                (formData.role === 'manager' ||
                  formData.role === 'admin') && (
                  <InfoBox
                    style={{ marginTop: '12px', marginBottom: '12px' }}
                  >
                    <MdInfo size={20} />
                    <InfoText>
                      Permissões de usuário são obrigatórias para este perfil
                      e já estão incluídas automaticamente
                    </InfoText>
                  </InfoBox>
                )}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '12px',
                  marginTop: '12px',
                }}
              >
                {Object.entries(getPermissionsByCategory()).map(
                  ([category, categoryPermissions]) => {
                    const isUserCategory =
                      category === 'user' ||
                      category === 'Gestão de Usuários';
                    const isKanbanCategory =
                      category === 'kanban' ||
                      category === 'Funil de Vendas';
                    const isLocked =
                      (formData.role &&
                        (formData.role === 'manager' ||
                          formData.role === 'admin') &&
                        isUserCategory) ||
                      isKanbanCategory;
                    const isSelfLocked = isOwnerPermissionsLocked;
                    const cardLocked = isLocked || isSelfLocked;
                    const isSelected = isCategorySelected(category);
                    const isExpanded = expandedCategory === category;

                    return (
                      <div key={category} style={{ position: 'relative' }}>
                        <CategoryCard
                          onClick={() =>
                            !cardLocked && toggleCategory(category)
                          }
                          $isSelected={isSelected}
                          $isLocked={cardLocked}
                          style={{
                            borderRadius: isExpanded ? '8px 8px 0 0' : '8px',
                          }}
                        >
                          <CategoryCheckbox
                            $isSelected={isSelected}
                            $isLocked={cardLocked}
                          >
                            {cardLocked ? '🔒' : isSelected ? '✓' : ''}
                          </CategoryCheckbox>
                          <CategoryInfo>
                            <CategoryName>
                              {getCategoryDisplayLabel(
                                category,
                                categoryPermissions[0]?.name
                              )}
                              {isLocked && (
                                <CategoryBadge>(obrigatório)</CategoryBadge>
                              )}
                              {isSelfLocked && !isLocked && (
                                <CategoryBadge>(bloqueado)</CategoryBadge>
                              )}
                            </CategoryName>
                            <CategoryCount>
                              {categoryPermissions.length} permissões
                            </CategoryCount>
                          </CategoryInfo>
                          <CategoryDropdownBtn
                            type='button'
                            $isOpen={isExpanded}
                            onClick={e => {
                              e.stopPropagation();
                              setExpandedCategory(c =>
                                c === category ? null : category
                              );
                            }}
                            title={isExpanded ? 'Fechar' : 'Ver permissões'}
                          >
                            ▼
                          </CategoryDropdownBtn>
                        </CategoryCard>
                        {isExpanded && (
                          <CategoryDropdownPanel>
                            {categoryPermissions.map(permission => {
                              const isUserPermission =
                                permission.category === 'user' ||
                                permission.name.startsWith('user:') ||
                                permission.category === 'Gestão de Usuários';
                              const isRequiredPermission =
                                isBrokerFixedPermission(permission.id) ||
                                isSystemRequiredPermission(permission.name) ||
                                ((formData.role === 'manager' ||
                                  formData.role === 'admin') &&
                                  isUserPermission);
                              const isSelfLockedPerm = isOwnerPermissionsLocked;

                              return (
                                <PermissionItem
                                  key={permission.id}
                                  style={{
                                    opacity: isRequiredPermission || isSelfLockedPerm ? 0.6 : 1,
                                  }}
                                  onClick={e => e.stopPropagation()}
                                >
                                  <input
                                    type='checkbox'
                                    checked={
                                      isRequiredPermission
                                        ? true
                                        : selectedPermissions.includes(
                                            permission.id
                                          )
                                    }
                                    disabled={isRequiredPermission || isSelfLockedPerm}
                                    onChange={e =>
                                      handlePermissionChange(
                                        permission.id,
                                        e.target.checked
                                      )
                                    }
                                    style={{
                                      cursor: isRequiredPermission || isSelfLockedPerm
                                        ? 'not-allowed'
                                        : 'pointer',
                                    }}
                                  />
                                  <PermissionInfo>
                                    <PermissionName>
                                      {getPermissionDescription(permission.name)}
                                      {isRequiredPermission && (
                                        <PermissionLockBadge>
                                          🔒 (obrigatório)
                                        </PermissionLockBadge>
                                      )}
                                      {isSelfLockedPerm && !isRequiredPermission && (
                                        <PermissionLockBadge>
                                          🔒 (bloqueado)
                                        </PermissionLockBadge>
                                      )}
                                    </PermissionName>
                                  </PermissionInfo>
                                </PermissionItem>
                              );
                            })}
                          </CategoryDropdownPanel>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </FormGroup>

            {/* Resumo */}
            <PermissionSummary>
              <SummaryTitle>Resumo das Permissões</SummaryTitle>
              <SummaryText>
                {selectedPermissions.length} permissões selecionadas
                <span style={{ marginLeft: '8px' }}>
                  •{' '}
                  {
                    Object.keys(getPermissionsByCategory()).filter(cat =>
                      isCategorySelected(cat)
                    ).length
                  }{' '}
                  categorias
                </span>
              </SummaryText>
            </PermissionSummary>
          </Card>
          </RightColumn>
        </ContentGrid>

        <ActionBar>
          <ActionBarSummary>
            <MdInfo size={20} />
            <span>
              {selectedPermissions.length} permissões e {selectedTags.length}{' '}
              tags selecionadas
            </span>
          </ActionBarSummary>

          <SaveButton onClick={handleSave} disabled={isSaving}>
            {isSaving ? <LoadingSpinner /> : <MdSave size={20} />}
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </SaveButton>
        </ActionBar>
      </PageContainer>
    </Layout>
  );
};

export default EditUserPage;
