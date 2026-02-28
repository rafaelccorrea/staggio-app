import { useState, useEffect, useCallback } from 'react';
import { teamApi } from '../services/teamApi';
import type { Team } from '../services/teamApi';

/**
 * Equipes para o seletor de funis no Kanban (GET /kanban/teams).
 * Não exige módulo team_management nem permissão team:view.
 * @param onlyWithProjects - Se true, retorna apenas equipes que têm funis vinculados.
 */
export function useKanbanTeams(onlyWithProjects = false) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await teamApi.getKanbanTeams(onlyWithProjects ? { onlyWithProjects: true } : undefined);
      setTeams(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.warn('[useKanbanTeams] Erro ao carregar equipes:', err?.response?.status, err?.message);
      setTeams([]);
      setError(err?.message ?? 'Erro ao carregar equipes');
    } finally {
      setLoading(false);
    }
  }, [onlyWithProjects]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return { teams, loading, error, refreshTeams: fetchTeams };
}
