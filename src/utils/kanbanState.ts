/**
 * Utilitário para gerenciar o estado do Kanban no localStorage
 * Garante que sempre possamos voltar para o quadro Kanban correto
 * Salva o estado por usuário para manter o último projeto acessado após logout/login
 */

const KANBAN_STATE_KEY_PREFIX = 'kanban-last-state-';

export interface KanbanState {
  projectId?: string | null;
  teamId?: string | null;
  workspace?: string | null;
  userId?: string | null; // ID do usuário que salvou o estado
  timestamp?: number;
}

/**
 * Obtém a chave do localStorage baseada no userId
 */
const getStateKey = (userId?: string | null): string => {
  if (userId) {
    return `${KANBAN_STATE_KEY_PREFIX}${userId}`;
  }
  // Fallback para chave genérica se não tiver userId
  return `${KANBAN_STATE_KEY_PREFIX}default`;
};

/**
 * Salva o estado atual do Kanban no localStorage
 * O estado é salvo por usuário (usando userId como parte da chave)
 */
export const saveKanbanState = (state: KanbanState): void => {
  try {
    if (!state.userId) {
      console.warn('⚠️ [kanbanState] Tentando salvar estado sem userId');
      return;
    }

    const stateToSave: KanbanState = {
      ...state,
      userId: state.userId, // Garantir que userId está presente
      timestamp: Date.now(),
    };

    const key = getStateKey(state.userId);
    localStorage.setItem(key, JSON.stringify(stateToSave));
  } catch (error) {
    console.error('Erro ao salvar estado do kanban:', error);
  }
};

/**
 * Recupera o estado salvo do Kanban do localStorage para um usuário específico
 * @param userId - ID do usuário para recuperar o estado
 */
export const getKanbanState = (userId?: string | null): KanbanState | null => {
  try {
    if (!userId) {
      // Se não tiver userId, tentar buscar de todas as chaves possíveis
      // (para compatibilidade com estados antigos)
      const keys = Object.keys(localStorage);
      const kanbanKeys = keys.filter(key =>
        key.startsWith(KANBAN_STATE_KEY_PREFIX)
      );

      if (kanbanKeys.length > 0) {
        // Pegar o mais recente baseado no timestamp
        let latestState: KanbanState | null = null;
        let latestTimestamp = 0;

        for (const key of kanbanKeys) {
          try {
            const saved = localStorage.getItem(key);
            if (saved) {
              const state = JSON.parse(saved) as KanbanState;
              if (state.timestamp && state.timestamp > latestTimestamp) {
                latestTimestamp = state.timestamp;
                latestState = state;
              }
            }
          } catch (e) {
            // Ignorar erros de parse
          }
        }

        return latestState;
      }

      return null;
    }

    const key = getStateKey(userId);
    const saved = localStorage.getItem(key);
    if (saved) {
      const state = JSON.parse(saved) as KanbanState;
      return state;
    }
  } catch (error) {
    console.error('Erro ao recuperar estado do kanban:', error);
  }
  return null;
};

/**
 * Limpa o estado salvo do Kanban para um usuário específico
 * @param userId - ID do usuário para limpar o estado (opcional, se não fornecido limpa todos)
 */
export const clearKanbanState = (userId?: string | null): void => {
  try {
    if (userId) {
      const key = getStateKey(userId);
      localStorage.removeItem(key);
    } else {
      // Limpar todos os estados salvos
      const keys = Object.keys(localStorage);
      const kanbanKeys = keys.filter(key =>
        key.startsWith(KANBAN_STATE_KEY_PREFIX)
      );
      kanbanKeys.forEach(key => localStorage.removeItem(key));
    }
  } catch (error) {
    console.error('Erro ao limpar estado do kanban:', error);
  }
};

const KANBAN_FILTERS_KEY_PREFIX = 'kanban-filters-';

/**
 * Chave de sessionStorage para filtros do funil (por usuário, time e projeto)
 */
const getFiltersKey = (
  userId?: string | null,
  teamId?: string | null,
  projectId?: string | null
): string => {
  const u = userId || 'default';
  const t = teamId || 'all';
  const p = projectId ?? 'all';
  return `${KANBAN_FILTERS_KEY_PREFIX}${u}-${t}-${p}`;
};

/**
 * Salva os filtros do funil na sessão (persistem ao navegar para detalhes e voltar)
 */
export const saveKanbanFilters = (
  userId: string | undefined | null,
  teamId: string | undefined | null,
  projectId: string | undefined | null,
  filters: Record<string, unknown>
): void => {
  try {
    if (!teamId) return;
    const key = getFiltersKey(userId, teamId, projectId);
    const toSave = { ...filters };
    sessionStorage.setItem(key, JSON.stringify(toSave));
  } catch (e) {
    console.warn('Erro ao salvar filtros do kanban:', e);
  }
};

const DATE_KEYS = new Set([
  'dueDateFrom',
  'dueDateTo',
  'createdFrom',
  'createdTo',
  'updatedFrom',
  'updatedTo',
  'lastMovedAfter',
  'lastMovedBefore',
  'closingForecastBefore',
  'closingForecastAfter',
  'transferDateBefore',
  'transferDateAfter',
]);

function reviveDates(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (DATE_KEYS.has(k) && typeof v === 'string') {
      const d = new Date(v);
      out[k] = Number.isNaN(d.getTime()) ? v : d;
    } else if (k === 'timeInColumn' && v && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = v;
    } else {
      out[k] = v;
    }
  }
  return out;
}

/**
 * Remove todos os filtros do funil salvos na sessão.
 * Usado ao trocar de página (sair do funil); filtros só persistem ao entrar/sair dos detalhes.
 */
export const clearKanbanFiltersSession = (): void => {
  try {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(KANBAN_FILTERS_KEY_PREFIX)) keys.push(key);
    }
    keys.forEach(k => sessionStorage.removeItem(k));
  } catch (e) {
    console.warn('Erro ao limpar filtros do kanban:', e);
  }
};

/**
 * Recupera os filtros do funil da sessão (para restaurar ao voltar da página de detalhes)
 */
export const getKanbanFilters = (
  userId: string | undefined | null,
  teamId: string | undefined | null,
  projectId: string | undefined | null
): Record<string, unknown> => {
  try {
    if (!teamId) return {};
    const key = getFiltersKey(userId, teamId, projectId);
    const raw = sessionStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object') return {};
    return reviveDates(parsed);
  } catch {
    return {};
  }
};

/**
 * Constrói a URL do Kanban com base no estado fornecido ou salvo
 * Sempre retorna uma URL válida para o Kanban, nunca para seleção de projeto
 * @param state - Estado opcional para usar
 * @param userId - ID do usuário para recuperar estado salvo
 */
export const buildKanbanUrl = (
  state?: Partial<KanbanState>,
  userId?: string | null
): string => {
  const basePath = '/kanban';
  const queryParams = new URLSearchParams();

  // Priorizar estado fornecido, depois estado salvo do usuário
  const savedState = getKanbanState(userId);
  const finalState: KanbanState = {
    ...savedState,
    ...state,
  };

  // Adicionar projectId se existir
  if (
    finalState.projectId &&
    finalState.projectId !== 'undefined' &&
    finalState.projectId !== 'null'
  ) {
    queryParams.append('projectId', finalState.projectId);
  }

  // Adicionar workspace
  if (finalState.workspace === 'personal') {
    queryParams.append('workspace', 'personal');
  } else if (
    finalState.workspace &&
    finalState.workspace !== 'undefined' &&
    finalState.workspace !== 'null'
  ) {
    queryParams.append('workspace', finalState.workspace);
  }

  // Adicionar teamId se não for workspace pessoal
  if (
    finalState.teamId &&
    finalState.teamId !== 'undefined' &&
    finalState.teamId !== 'null' &&
    finalState.workspace !== 'personal'
  ) {
    queryParams.append('teamId', finalState.teamId);
  }

  // Sempre retornar URL do Kanban, mesmo sem parâmetros
  return queryParams.toString()
    ? `${basePath}?${queryParams.toString()}`
    : basePath;
};
