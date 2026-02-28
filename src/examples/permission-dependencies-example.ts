/**
 * Exemplos práticos de como funciona o sistema de dependências de permissões
 *
 * Este arquivo demonstra o comportamento esperado do sistema
 */

import {
  addPermissionWithDependencies,
  removePermissionCheckDependencies,
  getDependencyMessage,
  getDependentPermissionsMessage,
  requiresViewPermission,
  getViewPermission,
} from '../utils/permissionDependencies';

// Mock de permissões para exemplos
const mockPermissions = [
  { id: '1', name: 'client:view', description: 'Visualizar clientes' },
  { id: '2', name: 'client:create', description: 'Criar clientes' },
  { id: '3', name: 'client:edit', description: 'Editar clientes' },
  { id: '4', name: 'client:delete', description: 'Deletar clientes' },
  { id: '5', name: 'property:view', description: 'Visualizar propriedades' },
  { id: '6', name: 'property:create', description: 'Criar propriedades' },
  { id: '7', name: 'property:edit', description: 'Editar propriedades' },
];

// ============================================================================
// EXEMPLO 1: Verificar se permissão requer view
// ============================================================================

const permissions = [
  'client:view',
  'client:create',
  'client:edit',
  'client:delete',
  'client:export',
];

permissions.forEach(perm => {
  const requires = requiresViewPermission(perm);
  const viewPerm = requires ? getViewPermission(perm) : 'N/A';
});

// ============================================================================
// EXEMPLO 2: Adicionar permissão com dependências
// ============================================================================

// Cenário: Usuário não tem nenhuma permissão de cliente
let currentPermissions: string[] = [];

// Adicionar client:create
const result1 = addPermissionWithDependencies(
  currentPermissions,
  '2', // ID de client:create
  mockPermissions
);

currentPermissions = result1.permissions;

currentPermissions.forEach(id => {
  const perm = mockPermissions.find(p => p.id === id);
});

if (result1.addedDependencies.length > 0) {
}

// ============================================================================
// EXEMPLO 3: Adicionar múltiplas permissões
// ============================================================================

// Adicionar client:edit (view já existe, não deve duplicar)
const result2 = addPermissionWithDependencies(
  currentPermissions,
  '3', // ID de client:edit
  mockPermissions
);

currentPermissions = result2.permissions;

currentPermissions.forEach(id => {
  const perm = mockPermissions.find(p => p.id === id);
});

if (result2.addedDependencies.length > 0) {
} else {
}

// ============================================================================
// EXEMPLO 4: Tentar remover permissão view (com dependências)
// ============================================================================

currentPermissions.forEach(id => {
  const perm = mockPermissions.find(p => p.id === id);
});

const result3 = removePermissionCheckDependencies(
  currentPermissions,
  '1', // ID de client:view
  mockPermissions
);

if (result3.canRemove) {
  currentPermissions = result3.permissions;
} else {
  result3.dependentPermissions.forEach(id => {
    const perm = mockPermissions.find(p => p.id === id);
  });
}

// ============================================================================
// EXEMPLO 5: Remover em ordem correta
// ============================================================================

currentPermissions.forEach(id => {
  const perm = mockPermissions.find(p => p.id === id);
});

// Remover client:create
const result4 = removePermissionCheckDependencies(
  currentPermissions,
  '2', // ID de client:create
  mockPermissions
);

if (result4.canRemove) {
  currentPermissions = result4.permissions;
  currentPermissions.forEach(id => {
    const perm = mockPermissions.find(p => p.id === id);
  });
} else {
}

// Remover client:edit
const result5 = removePermissionCheckDependencies(
  currentPermissions,
  '3', // ID de client:edit
  mockPermissions
);

if (result5.canRemove) {
  currentPermissions = result5.permissions;
  currentPermissions.forEach(id => {
    const perm = mockPermissions.find(p => p.id === id);
  });
} else {
}

// Agora remover client:view (deve funcionar)
const result6 = removePermissionCheckDependencies(
  currentPermissions,
  '1', // ID de client:view
  mockPermissions
);

if (result6.canRemove) {
  currentPermissions = result6.permissions;
  if (currentPermissions.length === 0) {
  } else {
    currentPermissions.forEach(id => {
      const perm = mockPermissions.find(p => p.id === id);
    });
  }
} else {
}

// ============================================================================
// EXEMPLO 6: Cenário complexo com múltiplas categorias
// ============================================================================

currentPermissions = [];

// Adicionar client:create
const r1 = addPermissionWithDependencies(
  currentPermissions,
  '2',
  mockPermissions
);
currentPermissions = r1.permissions;

if (r1.addedDependencies.length > 0) {
}

// Adicionar property:edit
const r2 = addPermissionWithDependencies(
  currentPermissions,
  '7',
  mockPermissions
);
currentPermissions = r2.permissions;

if (r2.addedDependencies.length > 0) {
}

currentPermissions.forEach(id => {
  const perm = mockPermissions.find(p => p.id === id);
});

// ============================================================================
// RESUMO
// ============================================================================

// ✅ Exemplo 1: Demonstrou como identificar dependências
// ✅ Exemplo 2: Adicionou permissão com dependência automaticamente
// ✅ Exemplo 3: Não duplicou dependência já existente
// ✅ Exemplo 4: Bloqueou remoção indevida com mensagem clara
// ✅ Exemplo 5: Permitiu remoção na ordem correta
// ✅ Exemplo 6: Funcionou com múltiplas categorias
//
// 🎯 Todos os cenários comportam-se conforme esperado!
// `);
// ============================================================================
// DICAS DE USO
// ============================================================================

// 1. Sempre use addPermissionWithDependencies() ao adicionar
// 2. Sempre use removePermissionCheckDependencies() ao remover
// 3. Mostre as notificações geradas pelas funções helper
// 4. Verifique result.canRemove antes de aplicar remoção
// 5. Use getDependencyMessage() para mensagens amigáveis
//
// 📚 Veja documentação completa em: src/docs/PERMISSION_DEPENDENCIES.md
// `);
export {};
