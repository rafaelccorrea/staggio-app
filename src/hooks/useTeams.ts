import React, { useState, useEffect, useCallback } from 'react';
import { teamApi } from '../services/teamApi';
import { useAutoReloadOnCompanyChange } from './useCompanyMonitor';
import { usePermissionsContextOptional } from '../contexts/PermissionsContext';
import { authStorage } from '../services/authStorage';
import { getPermissionDescription } from '../utils/permissionDescriptions';
import type {
  Team,
  CreateTeamDto,
  UpdateTeamDto,
  AddTeamMemberDto,
  TeamMember,
} from '../services/teamApi';

export interface TeamFilters {
  teamName?: string;
  memberName?: string;
  tag?: string;
  status?: string;
  color?: string;
  dateRange?: string;
  search?: string;
  page?: string;
  limit?: string;
}

export interface PaginatedTeamsResponse {
  data: Team[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UseTeamsReturn {
  teams: Team[];
  selectedTeam: Team | null;
  loading: boolean;
  error: string | null;
  createTeam: (data: CreateTeamDto) => Promise<Team>;
  updateTeam: (teamId: string, data: UpdateTeamDto) => Promise<Team>;
  deleteTeam: (teamId: string) => Promise<void>;
  selectTeam: (team: Team | null) => void;
  refreshTeams: () => Promise<void>;
  reloadTeams: () => Promise<void>;
  getTeamsWithFilters: (
    filters: TeamFilters
  ) => Promise<PaginatedTeamsResponse>;
  getTeamMembers: (teamId: string) => Promise<TeamMember[]>;
  addTeamMember: (
    teamId: string,
    data: AddTeamMemberDto
  ) => Promise<TeamMember>;
  removeTeamMember: (teamId: string, userId: string) => Promise<void>;
  updateTeamMemberRole: (
    teamId: string,
    userId: string,
    role: 'admin' | 'member'
  ) => Promise<TeamMember>;
}

export const useTeams = (): UseTeamsReturn => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = React.useRef(false);
  const isInitializedRef = React.useRef(false);
  const permissionsContext = usePermissionsContextOptional();
  const hasPermission = permissionsContext?.hasPermission || (() => false);
  const permissionsLoading = permissionsContext?.isLoading || false;

  const fetchTeams = useCallback(async () => {
    // Evitar múltiplas requisições simultâneas
    if (isFetchingRef.current) {
      return;
    }

    // Aguardar carregamento das permissões antes de verificar
    if (permissionsLoading) {
      return;
    }

    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);

      // Verificar se o usuário tem permissão para visualizar teams
      const user = authStorage.getUserData();
      if (!user) {
        console.warn('⚠️ Usuário não autenticado, não carregando teams');
        setTeams([]);
        return;
      }

      // Se for usuário master, sempre permitir
      if (user.role === 'master') {
      } else {
        // Super admin Kanban (kanban:manage_users) pode ver todas as equipes; obrigatoriamente inclui ver equipes
        const hasSuperAdminKanban = hasPermission('kanban:manage_users');
        const canViewTeams =
          hasPermission('team:view') || hasSuperAdminKanban;
        if (!canViewTeams) {
          if (import.meta.env.DEV) {
            console.warn(
              '⚠️ Usuário sem permissão team:view - não carregando teams'
            );
          }
          setTeams([]);
          setError(
            `Você não tem permissão para ${getPermissionDescription('team:view').toLowerCase()}. Entre em contato com um administrador para solicitar esta permissão.`
          );
          return;
        }
      }

      // Verificar se há empresa selecionada
      const selectedCompanyId = localStorage.getItem(
        'dream_keys_selected_company_id'
      );
      const teamsData = await teamApi.getTeams();
      // Garantir que as equipes estão ordenadas da mais recente para a mais antiga
      const sortedTeams = teamsData.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Ordem decrescente (mais recente primeiro)
      });

      setTeams(sortedTeams);
      if (teamsData.length === 0) {
        console.warn(
          '⚠️ Nenhuma equipe encontrada. Verifique se há equipes cadastradas para esta empresa.'
        );
      }
    } catch (err: any) {
      console.error('❌ Erro ao carregar equipes:', err);
      console.error('❌ Detalhes do erro:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });

      // Se for erro 403, não mostrar como erro crítico
      if (err.response?.status === 403) {
        console.warn(
          '⚠️ Acesso negado a teams - usuário sem permissão ou módulo'
        );
        setTeams([]);
        setError(null); // Não mostrar erro para 403
      } else {
        setError(err.message || 'Erro ao carregar equipes');
      }
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, [hasPermission, permissionsLoading]);

  const createTeam = useCallback(async (data: CreateTeamDto): Promise<Team> => {
    try {
      const newTeam = await teamApi.createTeam(data);

      // Adicionar a nova equipe no início da lista (mais recente primeiro)
      setTeams(prev => [newTeam, ...prev]);
      return newTeam;
    } catch (err: any) {
      console.error('❌ Erro ao criar equipe:', err);
      throw err;
    }
  }, []);

  const updateTeam = useCallback(
    async (teamId: string, data: UpdateTeamDto): Promise<Team> => {
      try {
        const updatedTeam = await teamApi.updateTeam(teamId, data);

        setTeams(prev =>
          prev.map(team => (team.id === teamId ? updatedTeam : team))
        );

        // Atualizar equipe selecionada se for a mesma
        if (selectedTeam?.id === teamId) {
          setSelectedTeam(updatedTeam);
        }

        return updatedTeam;
      } catch (err: any) {
        console.error('❌ Erro ao atualizar equipe:', err);
        throw err;
      }
    },
    [selectedTeam]
  );

  const deleteTeam = useCallback(
    async (teamId: string): Promise<void> => {
      try {
        await teamApi.deleteTeam(teamId);

        setTeams(prev => prev.filter(team => team.id !== teamId));

        // Se a equipe excluída era a selecionada, limpar seleção
        if (selectedTeam?.id === teamId) {
          setSelectedTeam(null);
        }

      } catch (err: any) {
        console.error('❌ Erro ao excluir equipe:', err);
        throw err;
      }
    },
    [selectedTeam]
  );

  const selectTeam = useCallback((team: Team | null) => {
    setSelectedTeam(team);
  }, []);

  const refreshTeams = useCallback(async () => {
    await fetchTeams();
  }, [fetchTeams]);

  const getTeamsWithFilters = useCallback(
    async (filters: TeamFilters): Promise<PaginatedTeamsResponse> => {
      try {
        return await teamApi.getTeamsWithFilters(filters);
      } catch (err: any) {
        console.error('❌ Erro ao buscar equipes com filtros:', err);
        throw err;
      }
    },
    []
  );

  const getTeamMembers = useCallback(
    async (teamId: string): Promise<TeamMember[]> => {
      try {
        return await teamApi.getTeamMembers(teamId);
      } catch (err: any) {
        console.error('❌ Erro ao buscar membros:', err);
        throw err;
      }
    },
    []
  );

  const addTeamMember = useCallback(
    async (teamId: string, data: AddTeamMemberDto): Promise<TeamMember> => {
      try {
        return await teamApi.addTeamMember(teamId, data);
      } catch (err: any) {
        console.error('❌ Erro ao adicionar membro:', err);
        throw err;
      }
    },
    []
  );

  const removeTeamMember = useCallback(
    async (teamId: string, userId: string): Promise<void> => {
      try {
        await teamApi.removeTeamMember(teamId, userId);
      } catch (err: any) {
        console.error('❌ Erro ao remover membro:', err);
        throw err;
      }
    },
    []
  );

  const updateTeamMemberRole = useCallback(
    async (
      teamId: string,
      userId: string,
      role: 'admin' | 'member'
    ): Promise<TeamMember> => {
      try {
        return await teamApi.updateTeamMemberRole(teamId, userId, role);
      } catch (err: any) {
        console.error('❌ Erro ao atualizar role:', err);
        throw err;
      }
    },
    []
  );

  // Função estável para recarregar equipes (sem dependências para evitar loop)
  const reloadTeams = useCallback(async () => {
    // Evitar múltiplas requisições simultâneas
    if (isFetchingRef.current) {
      return;
    }

    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);

      // Verificar se o usuário tem permissão para visualizar teams
      const user = authStorage.getUserData();
      if (!user) {
        console.warn('⚠️ Usuário não autenticado, não recarregando teams');
        setTeams([]);
        return;
      }

      // Se for usuário master, sempre permitir
      if (user.role === 'master') {
      } else {
        // Verificar se tem permissão team:view
        const canViewTeams = hasPermission('team:view');
        if (!canViewTeams) {
          console.warn(
            '⚠️ Usuário sem permissão team:view - não recarregando teams'
          );
          setTeams([]);
          return;
        }
      }

      const teamsData = await teamApi.getTeams();
      // Garantir que as equipes estão ordenadas da mais recente para a mais antiga
      const sortedTeams = teamsData.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Ordem decrescente (mais recente primeiro)
      });

      setTeams(sortedTeams);
      if (teamsData.length === 0) {
        console.warn(
          '⚠️ Nenhuma equipe encontrada. Verifique se há equipes cadastradas para esta empresa.'
        );
      }
    } catch (err: any) {
      console.error(
        '❌ Erro ao recarregar equipes após mudança de empresa:',
        err
      );

      // Se for erro 403, não mostrar como erro crítico
      if (err.response?.status === 403) {
        console.warn(
          '⚠️ Acesso negado a teams - usuário sem permissão ou módulo'
        );
        setTeams([]);
        setError(null); // Não mostrar erro para 403
      } else {
        setError(err.response?.data?.message || 'Erro ao recarregar equipes');
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [hasPermission, permissionsLoading]); // Incluir hasPermission e permissionsLoading como dependências

  // OTIMIZAÇÃO: Só carregar teams quando realmente necessário
  useEffect(() => {
    const user = authStorage.getUserData();
    if (!user) return;

    // CORREÇÃO: Verificar se tem Company ID antes de carregar teams
    const selectedCompanyId = localStorage.getItem(
      'dream_keys_selected_company_id'
    );
    if (!selectedCompanyId) {
      return;
    }

    // Se já foi inicializado para este usuário, não recarregar
    const currentUserId = user.id;
    const lastUserId = localStorage.getItem('dream_keys_last_teams_user_id');

    if (
      isInitializedRef.current &&
      lastUserId === currentUserId &&
      teams.length > 0
    ) {
      return;
    }

    // Só carregar se não há permissões carregando e tem permissão
    if (!permissionsLoading && hasPermission('team:view')) {
      isInitializedRef.current = true;
      localStorage.setItem('dream_keys_last_teams_user_id', currentUserId);
      fetchTeams();
    }
  }, [hasPermission, permissionsLoading, fetchTeams, teams.length]);

  // Monitorar mudanças de empresa e recarregar equipes automaticamente
  useAutoReloadOnCompanyChange(reloadTeams);

  const returnValue = {
    teams,
    selectedTeam,
    loading,
    error,
    createTeam,
    updateTeam,
    deleteTeam,
    selectTeam,
    refreshTeams,
    reloadTeams,
    getTeamsWithFilters,
    getTeamMembers,
    addTeamMember,
    removeTeamMember,
    updateTeamMemberRole,
  };

  //   teamsLength: returnValue.teams.length,
  //   loading: returnValue.loading,
  //   error: returnValue.error
  // });

  return returnValue;
};
