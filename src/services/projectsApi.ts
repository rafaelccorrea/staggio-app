import { api } from './api';
import type {
  // KanbanProject,
  CreateKanbanProjectDto,
  UpdateKanbanProjectDto,
  KanbanProjectResponseDto,
  PaginatedKanbanProjectsResponseDto,
  ProjectFiltersDto,
} from '../types/kanban';

export const projectsApi = {
  // Criar projeto
  async createProject(
    data: CreateKanbanProjectDto
  ): Promise<KanbanProjectResponseDto> {
    const response = await api.post('/kanban/projects', data);
    return response.data;
  },

  // Listar projetos por equipe
  async getProjectsByTeam(teamId: string): Promise<KanbanProjectResponseDto[]> {
    if (!teamId || teamId === 'undefined' || teamId === 'null') {
      throw new Error('ID da equipe é obrigatório');
    }
    const response = await api.get(`/kanban/projects/team/${teamId}`);
    return response.data;
  },

  /**
   * Listar projetos de várias equipes em uma única chamada.
   * Query: GET /kanban/projects/teams?teamIds=uuid1,uuid2,uuid3
   */
  async getProjectsByTeams(
    teamIds: string[],
  ): Promise<KanbanProjectResponseDto[]> {
    const ids = (teamIds || []).filter(
      id =>
        id &&
        id !== 'undefined' &&
        id !== 'null' &&
        id !== 'personal' &&
        id !== 'me',
    );
    if (ids.length === 0) return [];
    const response = await api.get('/kanban/projects/teams', {
      params: { teamIds: ids.join(',') },
    });
    return response.data ?? [];
  },

  // Obter workspace pessoal (criado automaticamente na primeira chamada)
  async getPersonalWorkspace(): Promise<KanbanProjectResponseDto[]> {
    const response = await api.get('/kanban/projects/team/personal');
    return response.data;
  },

  // Listar projetos com filtros
  async getFilteredProjects(
    filters: ProjectFiltersDto
  ): Promise<PaginatedKanbanProjectsResponseDto> {
    const response = await api.get('/kanban/projects/filtered', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Lista todos os funis (projetos) da empresa.
   * Usado no modal "Transferir Tarefa para Outro Funil".
   */
  async getProjectsByCompany(): Promise<KanbanProjectResponseDto[]> {
    const response = await api.get('/kanban/projects/company');
    return response.data;
  },

  /**
   * Lista funis que precisam ser vinculados a uma equipe (Sem equipe ou equipe inativa).
   * Usado para exibir o modal obrigatório de vínculo (não pode fechar até concluir).
   */
  async getProjectsWithoutTeam(): Promise<KanbanProjectResponseDto[]> {
    const response = await api.get('/kanban/projects/without-team');
    return response.data;
  },

  /**
   * Verifica se um projeto específico precisa vincular a uma equipe.
   * Usado quando a página é aberta com projectId na URL.
   */
  async getProjectNeedsTeamLink(
    projectId: string
  ): Promise<{ needsLink: boolean; project?: KanbanProjectResponseDto }> {
    const response = await api.get(
      `/kanban/projects/${projectId}/needs-team-link`
    );
    return response.data;
  },

  /**
   * Vincula um funil (projeto) que está em "Sem equipe" a uma equipe real.
   */
  async linkProjectToTeam(
    projectId: string,
    teamId: string,
  ): Promise<KanbanProjectResponseDto> {
    const response = await api.patch(`/kanban/projects/${projectId}/link-team`, {
      teamId,
    });
    return response.data;
  },

  // Obter projeto por ID
  async getProjectById(id: string): Promise<KanbanProjectResponseDto> {
    const response = await api.get(`/kanban/projects/${id}`);
    return response.data;
  },

  // Atualizar projeto
  async updateProject(
    id: string,
    data: UpdateKanbanProjectDto
  ): Promise<KanbanProjectResponseDto> {
    const response = await api.put(`/kanban/projects/${id}`, data);
    return response.data;
  },

  // Excluir projeto
  async deleteProject(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/kanban/projects/${id}`);
    return response.data;
  },

  // Finalizar projeto
  async finalizeProject(id: string): Promise<KanbanProjectResponseDto> {
    const response = await api.post(`/kanban/projects/${id}/finalize`);
    return response.data;
  },

  // Obter histórico de projetos da equipe
  async getProjectsHistory(
    teamId: string
  ): Promise<KanbanProjectResponseDto[]> {
    if (!teamId || teamId === 'undefined' || teamId === 'null') {
      throw new Error('ID da equipe é obrigatório');
    }
    const response = await api.get(`/kanban/projects/team/${teamId}/history`);
    return response.data;
  },

  // Obter histórico do projeto
  async getProjectHistory(id: string): Promise<any[]> {
    const response = await api.get(`/kanban/projects/${id}/history`);
    return response.data;
  },

  // Obter limites de projetos kanban
  async getProjectLimits(): Promise<{
    limit: number;
    current: number;
    remaining: number;
    percentUsed: number;
    isNearLimit: boolean;
    canCreate: boolean;
    message: string;
  }> {
    const response = await api.get('/kanban/projects/limits');
    return response.data;
  },
};
