import { api } from './api';
import type { TeamFilters } from '../types/filters';

export interface Team {
  id: string;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  companyId: string;
  createdById?: string;
  memberCount?: number;
  members?: TeamMember[];
}

export interface TeamMember {
  id: string;
  userId?: string;
  teamId?: string;
  role: 'admin' | 'member';
  isActive?: boolean;
  joinedAt?: string;
  createdAt?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role?: string;
    avatar?: string;
  };
}

export interface CreateTeamDto {
  name: string;
  description?: string;
  color: string;
  userIds: string[];
}

export interface UpdateTeamDto {
  name?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
  userIds?: string[];
}

export interface AddTeamMemberDto {
  userId: string;
  role: 'admin' | 'member';
}

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
  onlyMyData?: boolean;
}

export interface PaginatedTeamsResponse {
  data: Team[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class TeamApiService {
  private baseUrl = '/teams';

  /**
   * Equipes para o seletor de funis no Kanban.
   * Usa GET /kanban/teams (só exige kanban_management, não team_management).
   */
  async getKanbanTeams(params?: { onlyWithProjects?: boolean }): Promise<Team[]> {
    const response = await api.get('/kanban/teams', {
      params: params?.onlyWithProjects ? { onlyWithProjects: 'true' } : undefined,
    });
    return Array.isArray(response.data) ? response.data : [];
  }

  async getTeams(params?: { onlyWithProjects?: boolean }): Promise<Team[]> {
    try {
      const response = await api.get(this.baseUrl, {
        params: params?.onlyWithProjects ? { onlyWithProjects: 'true' } : undefined,
      });
      // Garantir que retornamos um array
      const teamsData = Array.isArray(response.data) ? response.data : [];
      return teamsData;
    } catch (error: any) {
      console.error('❌ Erro ao buscar equipes:', error);
      console.error('❌ Status do erro:', error.response?.status);
      console.error('❌ Dados do erro:', error.response?.data);
      console.error('❌ Headers do erro:', error.response?.headers);
      throw this.handleError(error);
    }
  }

  async getTeamsWithFilters(
    filters: TeamFilters
  ): Promise<PaginatedTeamsResponse> {
    try {
      const params = new URLSearchParams();

      // Adicionar apenas parâmetros que têm valor
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(
        `${this.baseUrl}/filtered?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar equipes com filtros:', error);
      throw this.handleError(error);
    }
  }

  async getTeam(teamId: string): Promise<Team> {
    try {
      const response = await api.get(`${this.baseUrl}/${teamId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar equipe:', error);
      throw this.handleError(error);
    }
  }

  async createTeam(data: CreateTeamDto): Promise<Team> {
    try {
      const response = await api.post(this.baseUrl, data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao criar equipe:', error);
      throw this.handleError(error);
    }
  }

  async updateTeam(teamId: string, data: UpdateTeamDto): Promise<Team> {
    try {
      const response = await api.put(`${this.baseUrl}/${teamId}`, data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao atualizar equipe:', error);
      throw this.handleError(error);
    }
  }

  async getTeamProjectCount(teamId: string): Promise<{ count: number }> {
    try {
      const response = await api.get(`${this.baseUrl}/${teamId}/project-count`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar quantidade de funis da equipe:', error);
      throw this.handleError(error);
    }
  }

  async deleteTeam(teamId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${teamId}`);
    } catch (error: any) {
      console.error('❌ Erro ao excluir equipe:', error);
      throw this.handleError(error);
    }
  }

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${teamId}/members`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar membros:', error);
      throw this.handleError(error);
    }
  }

  async addTeamMember(
    teamId: string,
    data: AddTeamMemberDto
  ): Promise<TeamMember> {
    try {
      const response = await api.post(
        `${this.baseUrl}/${teamId}/members`,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao adicionar membro:', error);
      throw this.handleError(error);
    }
  }

  async removeTeamMember(teamId: string, userId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${teamId}/members/${userId}`);
    } catch (error: any) {
      console.error('❌ Erro ao remover membro:', error);
      throw this.handleError(error);
    }
  }

  async updateTeamMemberRole(
    teamId: string,
    userId: string,
    role: 'admin' | 'member'
  ): Promise<TeamMember> {
    try {
      const response = await api.put(
        `${this.baseUrl}/${teamId}/members/${userId}`,
        { role }
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao atualizar role:', error);
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }

    if (error.message) {
      return new Error(error.message);
    }

    return new Error('Erro interno do servidor');
  }
}

export const teamApi = new TeamApiService();
