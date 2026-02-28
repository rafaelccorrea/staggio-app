/**
 * Regras para exibir itens no Drawer: só mostrar quando o usuário tiver
 * permissão de VIEW e pelo menos UMA permissão de AÇÃO do mesmo módulo.
 * Evita expor telas para quem só tem visualização sem nenhuma ação.
 */

export type DrawerPermissionChecker = {
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
};

/**
 * Por categoria (módulo): permissões de visualização e de ação.
 * Quem tem só view sem nenhuma ação não deve ver o item no menu.
 */
export const MODULE_VIEW_AND_ACTIONS: Record<
  string,
  { view: string[]; actions: string[] }
> = {
  asset: {
    view: ['asset:view'],
    actions: [
      'asset:create',
      'asset:update',
      'asset:delete',
      'asset:assign',
      'asset:transfer',
      'asset:manage_status',
    ],
  },
  audit: {
    view: ['audit:view'],
    actions: [], // só view; mostrar se tiver view
  },
  calendar: {
    view: ['calendar:view'],
    actions: [
      'calendar:create',
      'calendar:update',
      'calendar:delete',
      'calendar:manage_visibility',
    ],
  },
  client: {
    view: ['client:view', 'client:read'],
    actions: [
      'client:create',
      'client:update',
      'client:delete',
      'client:assign_property',
      'client:transfer',
      'client:export',
    ],
  },
  commission: {
    view: ['commission:view'],
    actions: [
      'commission:create',
      'commission:update',
      'commission:delete',
      'commission:calculate',
    ],
  },
  company: {
    view: ['company:view'],
    actions: ['company:create', 'company:update', 'company:delete'],
  },
  condominium: {
    view: ['condominium:view'],
    actions: [
      'condominium:create',
      'condominium:update',
      'condominium:delete',
    ],
  },
  document: {
    view: ['document:read'],
    actions: [
      'document:create',
      'document:update',
      'document:delete',
      'document:approve',
      'document:download',
    ],
  },
  financial: {
    view: ['financial:view'],
    actions: [
      'financial:create',
      'financial:update',
      'financial:delete',
      'financial:approve',
    ],
  },
  gallery: {
    view: ['gallery:view'],
    actions: [
      'gallery:create',
      'gallery:update',
      'gallery:delete',
    ],
  },
  inspection: {
    view: ['inspection:view'],
    actions: [
      'inspection:create',
      'inspection:update',
      'inspection:delete',
    ],
  },
  meta_campaign: {
    view: ['meta_campaign:view'],
    actions: ['meta_campaign:manage_config'],
  },
  grupo_zap: {
    view: ['grupo_zap:view'],
    actions: ['grupo_zap:manage_config'],
  },
  instagram: {
    view: ['instagram:view', 'instagram:manage_config'],
    actions: [], // ver menu com view ou manage_config
  },
  lead_distribution: {
    view: ['lead_distribution:view'],
    actions: ['lead_distribution:manage_config'],
  },
  kanban: {
    view: ['kanban:view'],
    actions: [
      'kanban:create',
      'kanban:update',
      'kanban:delete',
      'kanban:view_history',
      'kanban:manage_validations_actions',
      'kanban:project:create',
      'kanban:view_analytics',
      'kanban:manage_users',
    ],
  },
  key: {
    view: ['key:view'],
    actions: [
      'key:create',
      'key:update',
      'key:delete',
      'key:return',
      'key:checkout',
    ],
  },
  mcmv: {
    view: ['mcmv:view'],
    actions: [
      'mcmv:lead:view',
      'mcmv:lead:capture',
      'mcmv:lead:update',
      'mcmv:lead:assign',
      'mcmv:lead:rate',
      'mcmv:lead:convert',
      'mcmv:blacklist:view',
      'mcmv:blacklist:manage',
      'mcmv:template:view',
      'mcmv:template:manage',
    ],
  },
  note: {
    view: ['note:view'],
    actions: ['note:create', 'note:update', 'note:delete', 'note:share'],
  },
  insurance: {
    view: ['insurance:view'],
    actions: [
      'insurance:create_quote',
      'insurance:create_policy',
      'insurance:cancel_policy',
      'insurance:manage_config',
    ],
  },
  collection: {
    view: ['collection:view'],
    actions: ['collection:manage'],
  },
  credit_analysis: {
    view: ['credit_analysis:view'],
    actions: ['credit_analysis:create', 'credit_analysis:review'],
  },
  performance: {
    view: ['performance:view', 'performance:view_team', 'performance:view_company'],
    actions: ['performance:compare'],
  },
  property: {
    view: ['property:view'],
    actions: [
      'property:create',
      'property:update',
      'property:delete',
      'property:import',
      'property:export',
      'property:approve_availability',
      'property:reject_availability',
      'property:approve_publication',
      'property:reject_publication',
      'property:manage_approval_settings',
    ],
  },
  public_analytics: {
    view: ['public_analytics:view'],
    actions: ['public_analytics:compare'],
  },
  rental: {
    view: [
      'rental:view',
      'rental:view_dashboard',
      'rental:view_financials',
    ],
    actions: [
      'rental:create',
      'rental:update',
      'rental:delete',
      'rental:manage_payments',
      'rental:manage_workflows',
      'rental:approve',
    ],
  },
  reward: {
    view: ['reward:view'],
    actions: [
      'reward:create',
      'reward:update',
      'reward:delete',
      'reward:redeem',
      'reward:approve',
      'reward:reject',
      'reward:deliver',
    ],
  },
  session: {
    view: ['session:view'],
    actions: ['session:manage'],
  },
  team: {
    view: ['team:view'],
    actions: [
      'team:create',
      'team:update',
      'team:delete',
      'team:manage_members',
    ],
  },
  user: {
    view: ['user:view'],
    actions: [
      'user:create',
      'user:update',
      'user:delete',
      'user:manage_permissions',
    ],
  },
  visit: {
    view: ['visit:view', 'visit:manage'],
    actions: [
      'visit:create',
      'visit:update',
      'visit:delete',
      'visit:manage',
    ],
  },
  whatsapp: {
    view: ['whatsapp:view', 'whatsapp:view_messages'],
    actions: [
      'whatsapp:send',
      'whatsapp:receive',
      'whatsapp:manage_config',
      'whatsapp:create_task',
    ],
  },
};

/**
 * Extrai a categoria (módulo) do nome da permissão.
 * Ex.: "asset:view" -> "asset", "mcmv:lead:view" -> "mcmv"
 */
export function getCategoryFromPermission(permissionName: string): string {
  const firstColon = permissionName.indexOf(':');
  if (firstColon === -1) return permissionName;
  return permissionName.slice(0, firstColon);
}

/**
 * Verifica se o usuário pode ver o item no Drawer: deve ter permissão de
 * visualização E pelo menos uma permissão de ação do módulo (exceto quando
 * o módulo não tem ações definidas, ex.: audit).
 */
export function canShowDrawerItem(
  permissionName: string,
  check: DrawerPermissionChecker
): boolean {
  const category = getCategoryFromPermission(permissionName);
  const rule = MODULE_VIEW_AND_ACTIONS[category];
  if (!rule) {
    // Módulo não mapeado: fallback para só a permissão informada
    return check.hasPermission(permissionName);
  }
  const hasView = check.hasAnyPermission(rule.view);
  if (!hasView) return false;
  if (rule.actions.length === 0) return true;
  return check.hasAnyPermission(rule.actions);
}
