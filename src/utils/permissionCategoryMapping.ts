/**
 * Utilitário centralizado para mapeamento de categorias de permissões
 * Garante que todas as categorias tenham nomes legíveis, nunca retornando "Outros"
 */

/**
 * Mapeamento completo de categorias de permissões para nomes legíveis
 */
const CATEGORY_LABELS: Record<string, string> = {
  // Mapeamentos por código (singular)
  user: 'Gestão de Usuários',
  property: 'Gestão de Propriedades',
  inspection: 'Gestão de Vistorias',
  financial: 'Gestão Financeira',
  reports: 'Relatórios',
  settings: 'Configurações',
  company: 'Gestão de Empresas',
  gallery: 'Galeria',
  session: 'Gestão de Sessões',
  team: 'Gestão de Times',
  kanban: 'Funil de Vendas',
  CRM: 'Funil de Vendas',
  client: 'Gestão de Clientes',
  key: 'Gestão de Chaves',
  gamification: 'Gamificação',
  rental: 'Gestão de Aluguéis',
  calendar: 'Calendário e Agendamentos',
  commission: 'Gestão de Comissões',
  note: 'Gestão de Notas',
  document: 'Gestão de Documentos',
  visit: 'Relatório de Visita',
  performance: 'Painel de Performance',
  reward: 'Gestão de Prêmios',
  asset: 'Gestão Patrimonial',
  mcmv: 'Minha Casa Minha Vida (MCMV)',
  audit: 'Auditoria',
  checklist: 'Gestão de Checklists',
  match: 'Sistema de Matches',
  subscription: 'Gestão de Assinaturas',
  notification: 'Notificações',
  public: 'Site Público',
  automation: 'Automação',
  workflow: 'Automação de Workflows',
  integration: 'Integrações',
  api: 'API e Integrações',
  system: 'Sistema',
  bi: 'Inteligência de Negócios',
  'business-intelligence': 'Inteligência de Negócios',
  marketing: 'Marketing',
  'custom-field': 'Campos Personalizados',
  appointment: 'Agendamentos',
  competition: 'Competições',
  prize: 'Prêmios',
  public_analytics: 'Análises do Site Público',
  'public-analytics': 'Análises do Site Público',
  analytics: 'Análises e Relatórios',
  condominium: 'Gestão de Condomínios',
  whatsapp: 'WhatsApp',
  integrations: 'Integrações',
  insurance: 'Gestão de Seguros',
  credit_analysis: 'Análise de Crédito',
  collection: 'Gestão de Cobranças',

  // Categorias em maiúsculas (backend)
  CREDIT_ANALYSIS: 'Análise de Crédito',
  COLLECTION: 'Gestão de Cobranças',

  // Mapeamentos por código (plural) - variações comuns
  users: 'Gestão de Usuários',
  properties: 'Gestão de Propriedades',
  teams: 'Gestão de Times',
  clients: 'Gestão de Clientes',
  keys: 'Gestão de Chaves',
  documents: 'Gestão de Documentos',
  notes: 'Gestão de Notas',
  assets: 'Gestão Patrimonial',
  commissions: 'Gestão de Comissões',
  rewards: 'Gestão de Prêmios',
  condominiums: 'Gestão de Condomínios',

  // Mapeamentos por nome legível (mantém o mesmo)
  Calendário: 'Calendário e Agendamentos',
  'Calendário e Agendamentos': 'Calendário e Agendamentos',
  'Gestão de Aluguéis': 'Gestão de Aluguéis',
  'Gestão de Chaves': 'Gestão de Chaves',
  'Gestão de Clientes': 'Gestão de Clientes',
  'Gestão de Empresas': 'Gestão de Empresas',
  'Gestão de Galeria': 'Galeria',
  'Gestão de Gamificação': 'Gamificação',
  'Gestão de Kanban': 'Funil de Vendas',
  'Gestão de Propriedades': 'Gestão de Propriedades',
  'Gestão de Sessões': 'Gestão de Sessões',
  'Gestão de Times': 'Gestão de Times',
  'Gestão de Usuários': 'Gestão de Usuários',
  'Gestão de Vistorias': 'Gestão de Vistorias',
  'Gestão Financeira': 'Gestão Financeira',
  'Gestão de Comissões': 'Gestão de Comissões',
  'Gestão de Notas': 'Gestão de Notas',
  'Gestão de Documentos': 'Gestão de Documentos',
  'Dashboard de Performance': 'Painel de Performance',
  'Painel de Performance': 'Painel de Performance',
  'Gestão de Prêmios': 'Gestão de Prêmios',
  'Gestão Patrimonial': 'Gestão Patrimonial',
  'Minha Casa Minha Vida': 'Minha Casa Minha Vida (MCMV)',
  MCMV: 'Minha Casa Minha Vida (MCMV)',
  Auditoria: 'Auditoria',
  'Analytics do Site Público': 'Análises do Site Público',
  'Análises do Site Público': 'Análises do Site Público',
  'Analytics e Relatórios': 'Análises e Relatórios',
  'Análises e Relatórios': 'Análises e Relatórios',
  'Business Intelligence': 'Inteligência de Negócios',
  'Inteligência de Negócios': 'Inteligência de Negócios',
  'Site Público': 'Site Público',

  // Mapeamentos legados para compatibilidade
  'Client Management': 'Gestão de Clientes',
  'Controle de Chaves': 'Gestão de Chaves',
  'Key Control': 'Gestão de Chaves',
  key_control: 'Gestão de Chaves',
  other: 'Permissões Gerais',
  null: 'Permissões Gerais',
  undefined: 'Permissões Gerais',
};

/**
 * Ícones para cada categoria
 */
const CATEGORY_ICONS: Record<string, string> = {
  // Mapeamentos por código
  user: '👥',
  property: '🏠',
  inspection: '📋',
  financial: '💰',
  reports: '📊',
  settings: '⚙️',
  company: '🏢',
  gallery: '🖼️',
  session: '🔐',
  team: '👥',
  kanban: '📋',
  client: '👤',
  key: '🔑',
  gamification: '🏆',
  rental: '🏠',
  calendar: '📅',
  commission: '💸',
  note: '📝',
  document: '📄',
  performance: '📊',
  reward: '🎁',
  asset: '🏛️',
  mcmv: '🏡',
  audit: '🔍',
  checklist: '✅',
  match: '🎯',
  subscription: '💳',
  notification: '🔔',
  public: '🌐',
  automation: '🤖',
  workflow: '⚡',
  integration: '🔌',
  api: '🔗',
  system: '⚙️',
  bi: '📈',
  'business-intelligence': '📈',
  marketing: '📢',
  'custom-field': '🏷️',
  appointment: '📅',
  competition: '🏅',
  prize: '🎁',
  condominium: '🏢',
  whatsapp: '💬',
  integrations: '🔌',
  insurance: '🛡️',
  credit_analysis: '📋',
  collection: '💳',
  CREDIT_ANALYSIS: '📋',
  COLLECTION: '💳',
};

/**
 * Converte uma categoria para um nome legível
 * Tenta derivar um nome se a categoria não estiver mapeada
 * @param category - Categoria da permissão
 * @param permissionName - Nome da permissão (opcional, usado para derivar categoria)
 * @returns Nome legível da categoria, nunca retorna "Outros"
 */
export function getCategoryLabel(
  category: string | null | undefined,
  permissionName?: string
): string {
  // SEMPRE tentar derivar do nome da permissão primeiro se disponível
  if (permissionName) {
    // Tentar extrair categoria do nome da permissão (formato: "category:action")
    const match = permissionName.match(/^([^:]+):/);
    if (match) {
      const derivedCategory = match[1];
      // Tentar com a categoria derivada primeiro
      if (CATEGORY_LABELS[derivedCategory]) {
        return CATEGORY_LABELS[derivedCategory];
      }
      // Tentar variações comuns
      const variations = [
        derivedCategory,
        derivedCategory.toLowerCase(),
        derivedCategory.replace(/_/g, '-'),
        derivedCategory.replace(/-/g, '_'),
      ];
      for (const variation of variations) {
        if (CATEGORY_LABELS[variation]) {
          return CATEGORY_LABELS[variation];
        }
      }
      // Formatar a categoria derivada
      return formatCategoryName(derivedCategory);
    }
  }

  // Se a categoria está vazia, null ou "other", tentar derivar do nome da permissão
  if (
    !category ||
    category === 'other' ||
    category === 'null' ||
    category === 'undefined' ||
    category.trim() === ''
  ) {
    if (permissionName) {
      // Tentar extrair categoria do nome da permissão (formato: "category:action")
      const match = permissionName.match(/^([^:]+):/);
      if (match) {
        const derivedCategory = match[1];
        // Tentar novamente com a categoria derivada
        if (CATEGORY_LABELS[derivedCategory]) {
          return CATEGORY_LABELS[derivedCategory];
        }
        // Formatar a categoria derivada
        return formatCategoryName(derivedCategory);
      }
    }
    // Se não conseguir derivar, usar um nome genérico (NUNCA "Outros")
    return 'Permissões Gerais';
  }

  // Verificar se a categoria está no mapeamento
  if (CATEGORY_LABELS[category]) {
    return CATEGORY_LABELS[category];
  }

  // Tentar variações da categoria
  const variations = [
    category.toLowerCase(),
    category.replace(/_/g, '-'),
    category.replace(/-/g, '_'),
  ];
  for (const variation of variations) {
    if (CATEGORY_LABELS[variation]) {
      return CATEGORY_LABELS[variation];
    }
  }

  // Tentar derivar um nome legível da categoria
  return formatCategoryName(category);
}

/**
 * Formata o nome de uma categoria para torná-lo legível
 * @param category - Categoria a ser formatada
 * @returns Nome formatado
 */
function formatCategoryName(category: string): string {
  // Normalizar categoria removendo espaços extras
  const normalized = category.trim();

  // Se já estiver formatada corretamente, retornar
  if (
    normalized.toLowerCase().startsWith('gestão de') ||
    normalized.toLowerCase().startsWith('painel') ||
    normalized.toLowerCase().startsWith('dashboard') ||
    normalized.toLowerCase().startsWith('sistema') ||
    normalized.toLowerCase().startsWith('relatórios') ||
    normalized.toLowerCase().startsWith('configurações') ||
    normalized.toLowerCase().startsWith('auditoria') ||
    normalized.toLowerCase().startsWith('notificações') ||
    normalized.toLowerCase().startsWith('análises') ||
    normalized.toLowerCase().startsWith('analytics') ||
    normalized.toLowerCase().startsWith('gamificação')
  ) {
    return normalized;
  }

  // Remover caracteres especiais e separar por hífen/underscore
  const cleaned = normalized
    .replace(/[_-]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase();

  // Capitalizar primeira letra de cada palavra
  const words = cleaned.split(' ').filter(word => word.length > 0);
  const formatted = words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Casos especiais - verificar antes de formatar
  const lowerFormatted = formatted.toLowerCase();

  if (
    lowerFormatted.includes('analytics') ||
    lowerFormatted.includes('analítica') ||
    lowerFormatted.includes('análises')
  ) {
    if (
      lowerFormatted.includes('public') ||
      lowerFormatted.includes('público')
    ) {
      return 'Análises do Site Público';
    }
    return 'Análises e Relatórios';
  }

  if (lowerFormatted.includes('public') || lowerFormatted.includes('público')) {
    return 'Site Público';
  }

  if (
    lowerFormatted.includes('business intelligence') ||
    lowerFormatted.includes('bi')
  ) {
    return 'Inteligência de Negócios';
  }

  // Mapeamentos específicos por palavra-chave
  if (
    lowerFormatted.includes('asset') ||
    lowerFormatted.includes('patrimônio') ||
    lowerFormatted.includes('patrimonial')
  ) {
    return 'Gestão Patrimonial';
  }

  if (
    lowerFormatted.includes('commission') ||
    lowerFormatted.includes('comissão')
  ) {
    return 'Gestão de Comissões';
  }

  if (lowerFormatted.includes('reward') || lowerFormatted.includes('prêmio')) {
    return 'Gestão de Prêmios';
  }

  // Se começar com "Gestão de", manter como está
  if (lowerFormatted.startsWith('gestão de')) {
    return formatted;
  }

  // Adicionar "Gestão de" se não começar com um substantivo comum
  const commonNouns = [
    'gestão',
    'dashboard',
    'painel',
    'sistema',
    'relatórios',
    'configurações',
    'auditoria',
    'analytics',
    'análises',
    'notificações',
    'marketing',
    'api',
    'integração',
    'gamificação',
    'competição',
    'competições',
  ];
  const firstWord = words[0]?.toLowerCase() || '';

  if (firstWord && !commonNouns.includes(firstWord)) {
    return `Gestão de ${formatted}`;
  }

  return formatted;
}

/**
 * Obtém o ícone para uma categoria
 * @param category - Categoria da permissão
 * @returns Ícone emoji para a categoria
 */
export function getCategoryIcon(category: string | null | undefined): string {
  if (!category) return '📋';

  // Tentar obter ícone do mapeamento
  if (CATEGORY_ICONS[category]) {
    return CATEGORY_ICONS[category];
  }

  // Fallback: tentar derivar da categoria (sem formatação)
  const normalized = category.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (CATEGORY_ICONS[normalized]) {
    return CATEGORY_ICONS[normalized];
  }

  // Fallback padrão
  return '📋';
}

/**
 * Obtém a cor para uma categoria (opcional, para uso futuro)
 * @param category - Categoria da permissão
 * @returns Cor hexadecimal para a categoria
 */
export function getCategoryColor(category: string | null | undefined): string {
  // Implementação futura se necessário
  return '#6b7280';
}

/**
 * Mapeamento de ações (parte após ":") para rótulos em português.
 * Garante que títulos e descrições de permissões nunca apareçam em inglês.
 */
const ACTION_LABELS: Record<string, string> = {
  view: 'Visualizar',
  create: 'Criar',
  update: 'Editar',
  delete: 'Excluir',
  read: 'Consultar',
  approve: 'Aprovar',
  reject: 'Rejeitar',
  import: 'Importar',
  export: 'Exportar',
  manage: 'Gerenciar',
  manage_permissions: 'Gerenciar permissões',
  manage_visibility: 'Gerenciar visibilidade',
  manage_members: 'Gerenciar membros',
  manage_validations_actions: 'Gerenciar validações e ações',
  manage_users: 'Gerenciar usuários',
  view_history: 'Visualizar histórico',
  view_analytics: 'Visualizar análises',
  project: 'Projeto',
  checkout: 'Registrar retirada',
  return: 'Registrar devolução',
  share: 'Compartilhar',
  download: 'Baixar',
  approve_documents: 'Aprovar ou rejeitar documentos',
  calculate: 'Calcular',
  redeem: 'Solicitar resgate',
  deliver: 'Marcar como entregue',
  link: 'Vincular',
  transfer: 'Transferir',
  manage_status: 'Gerenciar status',
  view_team: 'Visualizar por equipe',
  view_company: 'Visualizar da empresa',
  compare: 'Comparar performance',
  lead: 'Lead',
  lead_view: 'Visualizar leads',
  lead_capture: 'Capturar leads',
  lead_update: 'Editar leads',
  lead_assign: 'Atribuir leads',
  lead_rate: 'Avaliar leads',
  lead_convert: 'Converter leads em clientes',
  blocklist_view: 'Visualizar lista de bloqueio',
  blocklist_manage: 'Gerenciar lista de bloqueio',
  template_view: 'Visualizar modelos',
  project_create: 'Criar projetos',
  quote: 'Cotação',
  policy: 'Apólice',
  cancel: 'Cancelar',
  configure: 'Configurar',
  distribute: 'Distribuir',
  manage_config: 'Gerenciar configuração',
  cancel_policy: 'Cancelar apólices',
  create_quote: 'Criar cotações',
  create_policy: 'Contratar apólices',
  create_task: 'Criar tarefas',
  view_messages: 'Visualizar mensagens',
  send: 'Enviar mensagens',
  receive: 'Receber mensagens',
  assign_property: 'Vincular a propriedades',
  assign: 'Vincular',
  review: 'Revisar',
  template_manage: 'Gerenciar modelos',
  blacklist_view: 'Visualizar lista de bloqueio',
  blacklist_manage: 'Gerenciar lista de bloqueio',
  manage_payments: 'Gerenciar pagamentos',
  manage_workflows: 'Gerenciar fluxos de trabalho',
  view_dashboard: 'Visualizar painel',
  view_financials: 'Visualizar dados financeiros',
};

/**
 * Traduz a parte "ação" do nome da permissão para português.
 * Ex.: "view" -> "Visualizar", "lead:view" -> "Visualizar leads"
 */
function getActionLabel(action: string): string {
  const normalized = action.toLowerCase().replace(/-/g, '_').replace(/:/g, '_');
  if (ACTION_LABELS[normalized]) return ACTION_LABELS[normalized];
  // Se for composto (ex.: lead:view), tentar só a última parte
  const lastPart = action.split(/[:]/).pop() || action;
  const lastNormalized = lastPart.toLowerCase().replace(/-/g, '_');
  if (ACTION_LABELS[lastNormalized]) return ACTION_LABELS[lastNormalized];
  // Fallback: evitar inglês; usar "Ação" genérico se uma palavra conhecida
  const ptWords: Record<string, string> = {
    view: 'Visualizar',
    create: 'Criar',
    update: 'Editar',
    delete: 'Excluir',
    manage: 'Gerenciar',
  };
  if (ptWords[lastNormalized]) return ptWords[lastNormalized];
  return 'Acessar';
}

/**
 * Retorna o rótulo da permissão em português para exibição (título/descrição).
 * Nunca exibe texto em inglês: usa categoria e ação traduzidos.
 */
export function getPermissionLabel(permission: {
  name: string;
  description?: string | null;
  category?: string | null;
}): string {
  const name = permission.name?.trim() || '';
  const parts = name.split(':');
  const categoryPart = parts[0] || '';
  const actionPart = parts.slice(1).join(':') || 'view';

  const categoryLabel = getCategoryLabel(
    permission.category || categoryPart,
    name
  );
  const actionLabel = getActionLabel(actionPart);

  if (actionLabel === 'Visualizar' && parts.length === 2) {
    return `${categoryLabel} - Visualizar`;
  }
  return `${categoryLabel} - ${actionLabel}`;
}
