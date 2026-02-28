/**
 * Permissões obrigatórias para o bom funcionamento do sistema.
 *
 * Todo usuário interno deve ter essas permissões para acessar o sistema.
 * São sempre incluídas na criação/edição de usuário e não podem ser removidas
 * (ficam travadas como "obrigatório").
 */
export const SYSTEM_REQUIRED_PERMISSION_NAMES = [
  'user:view', // Visualizar usuários
  'team:view', // Visualizar equipes
  'kanban:project:create', // Criar projetos Kanban
  'kanban:update', // Editar quadros Kanban
  'kanban:view', // Visualizar quadros Kanban
  'kanban:create', // Criar quadros Kanban
  'kanban:view_history', // Visualizar histórico do Kanban
  'client:view', // Visualizar clientes
  'property:view', // Visualizar propriedades
] as const;

export type SystemRequiredPermissionName =
  (typeof SYSTEM_REQUIRED_PERMISSION_NAMES)[number];

/**
 * Verifica se um nome de permissão é obrigatório para o sistema.
 */
export function isSystemRequiredPermission(permissionName: string): boolean {
  return (
    SYSTEM_REQUIRED_PERMISSION_NAMES as readonly string[]
  ).includes(permissionName);
}

/**
 * Retorna os IDs das permissões obrigatórias do sistema com base na lista
 * de permissões disponíveis.
 */
export function getSystemRequiredPermissionIds(
  availablePermissions: Array<{ id: string; name: string }>
): string[] {
  return availablePermissions
    .filter(p => isSystemRequiredPermission(p.name))
    .map(p => p.id);
}
