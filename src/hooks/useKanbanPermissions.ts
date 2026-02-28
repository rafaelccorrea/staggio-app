import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { usePermissions } from './usePermissions';

export interface KanbanPermissions {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canViewHistory: boolean;
  canManageValidationsActions: boolean;
  canViewAnalytics: boolean;
  canManageUsers: boolean;
  canCreateProject: boolean;
}

/**
 * Permissões do funil que são obrigatórias para todo usuário (padrão do sistema).
 * Alinhado com SYSTEM_REQUIRED_PERMISSION_NAMES em requiredPermissions.ts.
 */
export const KANBAN_OPERATIONAL_PERMISSIONS = [
  'kanban:view', // Visualizar quadros Kanban
  'kanban:create', // Criar quadros Kanban
  'kanban:update', // Editar quadros Kanban
  'kanban:project:create', // Criar projetos Kanban
  'kanban:view_history', // Visualizar histórico do Kanban
] as const;

/**
 * Permissões do funil que são ADMINISTRATIVAS: não vêm pré-definidas;
 * apenas usuários com permissão explícita (ex.: gerente, master) as possuem.
 * Não podem ser alteradas livremente na criação de usuário (são restritas).
 */
export const KANBAN_ADMINISTRATIVE_PERMISSIONS = [
  'kanban:delete',
  'kanban:manage_validations_actions',
  'kanban:view_analytics',
  'kanban:manage_users',
] as const;

/**
 * Hook com permissões do Kanban.
 * Todos os usuários autenticados têm acesso operacional ao funil (visualizar,
 * criar/editar quadros, criar projetos, ver histórico). Apenas a parte
 * administrativa (excluir, gerenciar validações, analytics, gerenciar usuários)
 * depende de permissão explícita.
 */
function roleToString(r: unknown): string {
  if (r == null) return '';
  if (typeof r === 'string') return r;
  if (typeof r === 'number' || typeof r === 'boolean') return String(r);
  return '';
}

export const useKanbanPermissions = (): KanbanPermissions => {
  const { getCurrentUser } = useAuth();
  const { hasPermission } = usePermissions();
  const user = getCurrentUser();

  return useMemo(() => {
    if (!user) {
      return {
        canView: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        canViewHistory: false,
        canManageValidationsActions: false,
        canViewAnalytics: false,
        canManageUsers: false,
        canCreateProject: false,
      };
    }

    const role = roleToString(user && typeof user === 'object' && 'role' in user ? (user as { role?: unknown }).role : '');
    if (role === 'master') {
      return {
        canView: true,
        canCreate: true,
        canUpdate: true,
        canDelete: true,
        canViewHistory: true,
        canManageValidationsActions: true,
        canViewAnalytics: true,
        canManageUsers: true,
        canCreateProject: true,
      };
    }

    // Criação/edição/exclusão de colunas e regras de cor exigem permissão explícita (kanban:create, kanban:update, kanban:delete).
    return {
      canView: true,
      canCreate: hasPermission('kanban:create'),
      canUpdate: hasPermission('kanban:update'),
      canViewHistory: true,
      canCreateProject: hasPermission('kanban:project:create') || hasPermission('kanban:create'),
      canDelete: hasPermission('kanban:delete'),
      canManageValidationsActions: hasPermission(
        'kanban:manage_validations_actions'
      ),
      canViewAnalytics: hasPermission('kanban:view_analytics'),
      canManageUsers: hasPermission('kanban:manage_users'),
    };
  }, [user, hasPermission]);
};
