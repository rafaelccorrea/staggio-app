import { getPermissionLabel } from './permissionCategoryMapping';

/**
 * Mapeia permissões técnicas para descrições amigáveis.
 * Nunca exibe o nome técnico do DB (ex.: rental:manage_payments).
 */
export const getPermissionDescription = (permissionName: string): string => {
  const permissionMap: Record<string, string> = {
    // Gestão de Equipes
    'team:view': 'Visualizar equipes',
    'team:create': 'Criar equipes',
    'team:update': 'Editar equipes',
    'team:delete': 'Excluir equipes',

    // Gestão de Usuários
    'user:view': 'Visualizar usuários',
    'user:create': 'Criar usuários',
    'user:update': 'Editar usuários',
    'user:delete': 'Excluir usuários',

    // Gestão de Clientes
    'client:view': 'Visualizar clientes',
    'client:create': 'Criar clientes',
    'client:update': 'Editar clientes',
    'client:delete': 'Excluir clientes',

    // Gestão de Imóveis
    'property:view': 'Visualizar imóveis',
    'property:create': 'Criar imóveis',
    'property:update': 'Editar imóveis',
    'property:delete': 'Excluir imóveis',
    'property:import': 'Importar imóveis em lote',
    'property:export': 'Exportar imóveis em lote',
    'property:approve_availability': 'Aprovar disponibilidade de imóveis',
    'property:reject_availability': 'Rejeitar disponibilidade de imóveis',
    'property:approve_publication': 'Aprovar publicação de imóveis no site',
    'property:reject_publication': 'Rejeitar publicação de imóveis no site',
    'property:manage_approval_settings': 'Gerenciar configurações de aprovação de imóveis',

    // Gestão de Vistorias
    'inspection:view': 'Visualizar vistorias',
    'inspection:create': 'Criar vistorias',
    'inspection:update': 'Editar vistorias',
    'inspection:delete': 'Excluir vistorias',

    // Gestão de Chaves
    'key:view': 'Visualizar chaves',
    'key:create': 'Criar chaves',
    'key:update': 'Editar chaves',
    'key:delete': 'Excluir chaves',

    // Gestão de Locações / Aluguéis
    'rental:view': 'Visualizar locações e contratos',
    'rental:create': 'Criar locações',
    'rental:update': 'Editar locações',
    'rental:delete': 'Excluir locações',
    'rental:approve': 'Aprovar locações e contratos',
    'rental:reject': 'Rejeitar locações e contratos',
    'rental:read': 'Consultar dados de locações',
    'rental:manage': 'Gerenciar locações',
    'rental:checkout': 'Registrar retirada de chaves (locação)',
    'rental:return': 'Registrar devolução de chaves (locação)',
    'rental:manage_payments': 'Gerenciar pagamentos de locações',
    'rental:manage_workflows': 'Gerenciar fluxos de trabalho (locações)',
    'rental:view_dashboard': 'Visualizar painel de locações',
    'rental:view_financials': 'Visualizar dados financeiros das locações',

    // Gestão Financeira
    'financial:view': 'Visualizar registros financeiros',
    'financial:create': 'Criar registros financeiros',
    'financial:update': 'Editar registros financeiros',
    'financial:delete': 'Excluir registros financeiros',

    // Kanban
    'kanban:view': 'Visualizar quadros Kanban',
    'kanban:create': 'Criar quadros Kanban',
    'kanban:update': 'Editar quadros Kanban',
    'kanban:delete': 'Excluir quadros Kanban',
    'kanban:view_history': 'Visualizar histórico do Kanban',
    'kanban:manage_validations_actions':
      'Gerenciar validações e ações do Kanban',
    'kanban:project:create': 'Criar projetos Kanban',
    'kanban:view_analytics':
      'Visualizar métricas e analytics do Funil de Vendas',

    // Relatório de Visita
    'visit:view': 'Visualizar relatórios de visita (próprios)',
    'visit:create': 'Criar relatórios de visita',
    'visit:update': 'Editar relatórios de visita e gerar link de assinatura',
    'visit:delete': 'Excluir relatórios de visita',
    'visit:manage': 'Gestão de visitas (ver todos os relatórios da empresa)',

    // Gamificação
    'gamification:view': 'Visualizar gamificação',
    'gamification:create': 'Criar gamificação',
    'gamification:update': 'Editar gamificação',
    'gamification:delete': 'Excluir gamificação',

    // Competições
    'competition:view': 'Visualizar competições',
    'competition:create': 'Criar competições',
    'competition:edit': 'Editar competições',
    'competition:delete': 'Excluir competições',
    'competition:manage': 'Gerenciar competições',

    // Prêmios
    'prize:view': 'Visualizar prêmios',
    'prize:create': 'Criar prêmios',
    'prize:edit': 'Editar prêmios',
    'prize:delete': 'Excluir prêmios',
    'prize:deliver': 'Marcar prêmio como entregue',

    // Sistema de Resgates (Rewards)
    'reward:view': 'Visualizar prêmios para resgate',
    'reward:create': 'Criar prêmios para resgate',
    'reward:update': 'Editar prêmios para resgate',
    'reward:delete': 'Excluir prêmios para resgate',
    'reward:redeem': 'Solicitar resgate de prêmios',
    'reward:approve': 'Aprovar/Rejeitar resgates',
    'reward:deliver': 'Marcar resgate como entregue',

    // Notas
    'note:view': 'Visualizar notas',
    'note:create': 'Criar notas',
    'note:update': 'Editar notas',
    'note:delete': 'Excluir notas',
    'note:share': 'Compartilhar notas',

    // Comissões
    'commission:view': 'Visualizar comissões',
    'commission:create': 'Criar comissões',
    'commission:update': 'Editar comissões',
    'commission:delete': 'Excluir comissões',

    // Sessões
    'session:view': 'Visualizar sessões',
    'session:create': 'Criar sessões',
    'session:update': 'Editar sessões',
    'session:delete': 'Excluir sessões',

    // Assinaturas
    'subscriptions:view': 'Visualizar assinaturas',
    'subscriptions:create': 'Criar assinaturas',
    'subscriptions:update': 'Editar assinaturas',
    'subscriptions:delete': 'Excluir assinaturas',

    // Análise de Crédito
    'credit_analysis:view': 'Visualizar análises de crédito',
    'credit_analysis:create': 'Criar análises de crédito',
    'credit_analysis:review': 'Revisar análises de crédito',

    // Régua de Cobrança
    'collection:view': 'Visualizar régua de cobrança',
    'collection:manage': 'Gerenciar régua de cobrança',

    // Performance
    'performance:view': 'Visualizar performance própria',
    'performance:compare':
      'Comparar performance (inclui visualização própria, de equipe e da empresa)',
    'performance:view_team': 'Visualizar performance da equipe',
    'performance:view_company': 'Visualizar performance da empresa',
  };

  const mapped = permissionMap[permissionName];
  if (mapped) return mapped;

  // Fallback: nunca mostrar o nome técnico do DB; usar rótulo derivado (categoria + ação).
  const trimmed = permissionName?.trim() || '';
  if (trimmed.includes(':')) {
    return getPermissionLabel({
      name: trimmed,
      category: trimmed.split(':')[0],
    });
  }
  return 'Permissão';
};

/**
 * Obtém uma descrição amigável para uma lista de permissões
 */
export const getPermissionsDescription = (permissions: string[]): string => {
  if (permissions.length === 0) return '';
  if (permissions.length === 1) return getPermissionDescription(permissions[0]);
  if (permissions.length === 2) {
    return `${getPermissionDescription(permissions[0])} e ${getPermissionDescription(permissions[1])}`;
  }

  const lastPermission = getPermissionDescription(
    permissions[permissions.length - 1]
  );
  const otherPermissions = permissions
    .slice(0, -1)
    .map(getPermissionDescription)
    .join(', ');

  return `${otherPermissions} e ${lastPermission}`;
};
