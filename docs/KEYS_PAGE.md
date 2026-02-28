# 🔑 Documentação - Controle de Chaves

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Estruturas de Dados](#-estruturas-de-dados)
3. [API Endpoints](#-api-endpoints)
4. [Páginas Frontend](#-páginas-frontend)
5. [Componentes](#-componentes)
6. [Hooks](#-hooks)
7. [Status e Tipos](#-status-e-tipos)
8. [Validações](#-validações)
9. [Permissões](#-permissões)
10. [Fluxos Principais](#-fluxos-principais)
11. [Histórico](#-histórico)
12. [Estatísticas](#-estatísticas)
13. [Integrações](#-integrações)
14. [Notas Técnicas](#-notas-técnicas)

---

## 🎯 Visão Geral

O sistema de **Controle de Chaves** permite o gerenciamento completo de chaves físicas vinculadas a propriedades, incluindo controle de empréstimo, devolução, histórico de movimentações e estatísticas.

### Funcionalidades Principais

- ✅ Cadastro e gerenciamento de chaves
- ✅ Controle de empréstimo (checkout) e devolução (return) de chaves
- ✅ Histórico completo de movimentações
- ✅ Estatísticas e relatórios
- ✅ Alertas de chaves em atraso
- ✅ Controle por usuário (minhas chaves)
- ✅ Filtros avançados
- ✅ Integração com propriedades
- ✅ Rastreamento de responsáveis

---

## 📊 Estruturas de Dados

### Key (Chave)

```typescript
interface Key {
  id: string;
  name: string;                    // Nome/identificação da chave
  description?: string;             // Descrição adicional
  type: 'main' | 'backup' | 'emergency' | 'garage' | 'mailbox' | 'other';
  status: 'available' | 'in_use' | 'lost' | 'damaged' | 'maintenance';
  location?: string;                // Localização física da chave
  notes?: string;                   // Observações gerais
  isActive: boolean;                // Se a chave está ativa
  companyId: string;                // ID da empresa
  propertyId: string;               // ID da propriedade vinculada
  property?: {                      // Dados da propriedade (populado quando disponível)
    id: string;
    title: string;
    address: string;
  };
  keyControls?: KeyControl[];       // Controles de empréstimo/devolução
  createdAt: string;                // Data de criação (ISO 8601)
  updatedAt: string;                // Data de atualização (ISO 8601)
}
```

### KeyControl (Controle de Chave)

```typescript
interface KeyControl {
  id: string;
  type: 'showing' | 'maintenance' | 'inspection' | 'cleaning' | 'other';
  status: 'checked_out' | 'returned' | 'overdue' | 'lost';
  checkoutDate: string;             // Data/hora da retirada (ISO 8601)
  expectedReturnDate?: string;      // Data prevista de devolução (ISO 8601)
  actualReturnDate?: string;        // Data real de devolução (ISO 8601)
  reason: string;                   // Motivo da retirada (obrigatório)
  notes?: string;                   // Observações na retirada
  returnNotes?: string;             // Observações na devolução
  companyId: string;                // ID da empresa
  keyId: string;                    // ID da chave
  userId: string;                   // ID do usuário que retirou
  returnedByUserId?: string;        // ID do usuário que devolveu
  key?: Key;                        // Dados da chave (populado quando disponível)
  user?: {                          // Dados do usuário que retirou
    id: string;
    name: string;
    email: string;
  };
  returnedByUser?: {                // Dados do usuário que devolveu
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;                // Data de criação (ISO 8601)
  updatedAt: string;                // Data de atualização (ISO 8601)
}
```

### CreateKeyData (Dados para Criação)

```typescript
interface CreateKeyData {
  name: string;                     // Obrigatório
  description?: string;
  type: 'main' | 'backup' | 'emergency' | 'garage' | 'mailbox' | 'other';
  status: 'available' | 'in_use' | 'lost' | 'damaged' | 'maintenance';
  location?: string;
  notes?: string;
  propertyId: string;               // Obrigatório
}
```

### UpdateKeyData (Dados para Atualização)

```typescript
interface UpdateKeyData {
  name?: string;
  description?: string;
  type?: 'main' | 'backup' | 'emergency' | 'garage' | 'mailbox' | 'other';
  status?: 'available' | 'in_use' | 'lost' | 'damaged' | 'maintenance';
  location?: string;
  notes?: string;
  isActive?: boolean;
}
```

### CreateKeyControlData (Dados para Retirada de Chave)

```typescript
interface CreateKeyControlData {
  type: 'showing' | 'maintenance' | 'inspection' | 'cleaning' | 'other';
  expectedReturnDate?: string;      // ISO 8601
  reason: string;                   // Obrigatório
  notes?: string;
  keyId: string;                    // Obrigatório
}
```

### ReturnKeyData (Dados para Devolução)

```typescript
interface ReturnKeyData {
  returnNotes?: string;             // Observações da devolução
}
```

### KeyStatistics (Estatísticas)

```typescript
interface KeyStatistics {
  totalKeys: number;                // Total de chaves cadastradas
  availableKeys: number;            // Chaves disponíveis
  inUseKeys: number;                // Chaves em uso
  overdueCount: number;             // Quantidade de chaves em atraso
  overdueKeys: KeyControl[];        // Lista de controles em atraso
}
```

### KeyFilters (Filtros)

```typescript
interface KeyFilters {
  status?: string;                  // Filtrar por status
  propertyId?: string;              // Filtrar por propriedade
  search?: string;                  // Busca textual
  onlyMyData?: boolean;             // Apenas dados do usuário logado
}
```

### KeyHistoryRecord (Registro de Histórico)

```typescript
interface KeyHistoryRecord {
  id: string;
  keyId: string;
  userId?: string;
  keyControlId?: string;
  action: string;                   // Tipo de ação (create, checkout, return, update, delete)
  description: string;              // Descrição da ação
  previousData?: any;               // Dados anteriores (se aplicável)
  newData?: any;                    // Dados novos (se aplicável)
  metadata?: any;                   // Metadados adicionais
  createdAt: string;                // Data/hora do registro (ISO 8601)
  user?: {                          // Usuário que executou a ação
    id: string;
    name: string;
    email: string;
  };
  key?: {                           // Dados da chave relacionada
    id: string;
    name: string;
    property?: {
      title: string;
    };
  };
  keyControl?: {                    // Dados do controle relacionado
    id: string;
    type: string;
    checkoutDate: string;
    expectedReturnDate?: string;
    actualReturnDate?: string;
    reason: string;
    user?: {
      name: string;
    };
  };
}
```

### KeyHistoryStatistics (Estatísticas de Histórico)

```typescript
interface KeyHistoryStatistics {
  totalRecords: number;             // Total de registros
  actionStats: Array<{              // Estatísticas por tipo de ação
    action: string;
    count: number;
  }>;
  recentActivity: KeyHistoryRecord[]; // Atividades recentes
}
```

---

## 🔌 API Endpoints

### Base URL
```
/keys
```

**Autenticação:** Requer token JWT no header `Authorization` e header `X-Company-ID`

### Índice de Endpoints (13 rotas)

#### Chaves

1. **GET** `/keys` - Listar chaves com filtros
2. **POST** `/keys` - Criar nova chave
3. **GET** `/keys/:id` - Buscar chave por ID
4. **PATCH** `/keys/:id` - Atualizar chave
5. **DELETE** `/keys/:id` - Excluir chave
6. **GET** `/keys/statistics` - Obter estatísticas

#### Controle de Chaves (Checkout/Return)

7. **POST** `/keys/checkout` - Retirar chave (checkout)
8. **POST** `/keys/return/:keyControlId` - Devolver chave (return)
9. **GET** `/keys/controls/all` - Listar todos os controles
10. **GET** `/keys/controls/overdue` - Listar chaves em atraso
11. **GET** `/keys/controls/user` - Listar controles do usuário logado
12. **GET** `/keys/controls/:id` - Buscar controle por ID

#### Histórico

13. **GET** `/key-history/key/:keyId` - Histórico de uma chave específica
14. **GET** `/key-history/user/:userId` - Histórico de um usuário
15. **GET** `/key-history/my-history` - Histórico do usuário logado
16. **GET** `/key-history/statistics` - Estatísticas do histórico

---

### Endpoints Detalhados

#### 1. Listar Chaves

```http
GET /keys
```

**Query Parameters:**
- `propertyId` (string, opcional): Filtrar por propriedade
- `status` (string, opcional): Filtrar por status
- `search` (string, opcional): Busca textual
- `onlyMyData` (boolean, opcional): Apenas dados do usuário

**Resposta (200 OK):**
```json
[
  {
    "id": "uuid",
    "name": "Chave Principal",
    "description": "Chave da porta principal",
    "type": "main",
    "status": "available",
    "location": "Escritório - Gaveta 1",
    "notes": "Chave reserva",
    "isActive": true,
    "companyId": "uuid",
    "propertyId": "uuid",
    "property": {
      "id": "uuid",
      "title": "Apartamento Centro",
      "address": "Rua Exemplo, 123"
    },
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
]
```

---

#### 2. Criar Chave

```http
POST /keys
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Chave Principal",
  "description": "Chave da porta principal",
  "type": "main",
  "status": "available",
  "location": "Escritório - Gaveta 1",
  "notes": "Chave reserva",
  "propertyId": "uuid-da-propriedade"
}
```

**Campos Obrigatórios:**
- `name` (string): Nome da chave
- `propertyId` (string): ID da propriedade
- `type` (string): Tipo da chave
- `status` (string): Status inicial

**Resposta (201 Created):**
```json
{
  "id": "uuid",
  "name": "Chave Principal",
  "description": "Chave da porta principal",
  "type": "main",
  "status": "available",
  "location": "Escritório - Gaveta 1",
  "notes": "Chave reserva",
  "isActive": true,
  "companyId": "uuid",
  "propertyId": "uuid-da-propriedade",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

**Erros:**
- `400 Bad Request`: Dados inválidos
- `401 Unauthorized`: Token inválido ou expirado
- `403 Forbidden`: Sem permissão `key:create`
- `404 Not Found`: Propriedade não encontrada
- `409 Conflict`: Nome duplicado ou conflito

---

#### 3. Buscar Chave por ID

```http
GET /keys/:id
```

**Resposta (200 OK):**
```json
{
  "id": "uuid",
  "name": "Chave Principal",
  "description": "Chave da porta principal",
  "type": "main",
  "status": "available",
  "location": "Escritório - Gaveta 1",
  "notes": "Chave reserva",
  "isActive": true,
  "companyId": "uuid",
  "propertyId": "uuid",
  "property": {
    "id": "uuid",
    "title": "Apartamento Centro",
    "address": "Rua Exemplo, 123"
  },
  "keyControls": [
    {
      "id": "uuid",
      "type": "showing",
      "status": "returned",
      "checkoutDate": "2024-01-10T09:00:00Z",
      "expectedReturnDate": "2024-01-12T18:00:00Z",
      "actualReturnDate": "2024-01-12T17:30:00Z",
      "reason": "Visita de cliente",
      "userId": "uuid",
      "user": {
        "id": "uuid",
        "name": "João Silva",
        "email": "joao@example.com"
      }
    }
  ],
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

**Erros:**
- `404 Not Found`: Chave não encontrada
- `401 Unauthorized`: Token inválido
- `403 Forbidden`: Sem permissão `key:view`

---

#### 4. Atualizar Chave

```http
PATCH /keys/:id
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Chave Principal Atualizada",
  "status": "maintenance",
  "location": "Escritório - Gaveta 2",
  "notes": "Chave em manutenção"
}
```

**Todos os campos são opcionais.** Apenas os campos fornecidos serão atualizados.

**Resposta (200 OK):**
```json
{
  "id": "uuid",
  "name": "Chave Principal Atualizada",
  "status": "maintenance",
  "location": "Escritório - Gaveta 2",
  "notes": "Chave em manutenção",
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

**Erros:**
- `400 Bad Request`: Dados inválidos
- `401 Unauthorized`: Token inválido
- `403 Forbidden`: Sem permissão `key:update`
- `404 Not Found`: Chave não encontrada

---

#### 5. Excluir Chave

```http
DELETE /keys/:id
```

**Resposta (204 No Content):**

**Erros:**
- `401 Unauthorized`: Token inválido
- `403 Forbidden`: Sem permissão `key:delete`
- `404 Not Found`: Chave não encontrada
- `409 Conflict`: Chave em uso (não pode ser excluída se tiver controle ativo)

---

#### 6. Obter Estatísticas

```http
GET /keys/statistics
```

**Resposta (200 OK):**
```json
{
  "totalKeys": 150,
  "availableKeys": 120,
  "inUseKeys": 25,
  "overdueCount": 5,
  "overdueKeys": [
    {
      "id": "uuid",
      "type": "showing",
      "status": "overdue",
      "checkoutDate": "2024-01-10T09:00:00Z",
      "expectedReturnDate": "2024-01-12T18:00:00Z",
      "reason": "Visita de cliente",
      "key": {
        "id": "uuid",
        "name": "Chave Principal",
        "property": {
          "title": "Apartamento Centro"
        }
      },
      "user": {
        "id": "uuid",
        "name": "João Silva",
        "email": "joao@example.com"
      }
    }
  ]
}
```

---

#### 7. Retirar Chave (Checkout)

```http
POST /keys/checkout
Content-Type: application/json
```

**Request Body:**
```json
{
  "keyId": "uuid-da-chave",
  "type": "showing",
  "expectedReturnDate": "2024-01-20T18:00:00Z",
  "reason": "Visita de cliente interessado",
  "notes": "Cliente: Maria Santos"
}
```

**Campos Obrigatórios:**
- `keyId` (string): ID da chave
- `type` (string): Tipo de uso
- `reason` (string): Motivo da retirada

**Campos Opcionais:**
- `expectedReturnDate` (string): Data prevista de devolução (ISO 8601)
- `notes` (string): Observações

**Resposta (201 Created):**
```json
{
  "id": "uuid",
  "type": "showing",
  "status": "checked_out",
  "checkoutDate": "2024-01-15T10:00:00Z",
  "expectedReturnDate": "2024-01-20T18:00:00Z",
  "reason": "Visita de cliente interessado",
  "notes": "Cliente: Maria Santos",
  "keyId": "uuid-da-chave",
  "userId": "uuid-do-usuario-logado",
  "companyId": "uuid",
  "key": {
    "id": "uuid",
    "name": "Chave Principal",
    "status": "in_use"
  },
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@example.com"
  },
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

**Validações:**
- Chave deve estar disponível (`status === 'available'`)
- Chave deve estar ativa (`isActive === true`)
- Usuário deve ter permissão `key:checkout`

**Erros:**
- `400 Bad Request`: Chave não disponível, dados inválidos
- `401 Unauthorized`: Token inválido
- `403 Forbidden`: Sem permissão `key:checkout`
- `404 Not Found`: Chave não encontrada

---

#### 8. Devolver Chave (Return)

```http
POST /keys/return/:keyControlId
Content-Type: application/json
```

**Request Body:**
```json
{
  "returnNotes": "Chave devolvida em perfeito estado"
}
```

**Campos Opcionais:**
- `returnNotes` (string): Observações da devolução

**Resposta (200 OK):**
```json
{
  "id": "uuid",
  "type": "showing",
  "status": "returned",
  "checkoutDate": "2024-01-15T10:00:00Z",
  "expectedReturnDate": "2024-01-20T18:00:00Z",
  "actualReturnDate": "2024-01-18T14:30:00Z",
  "reason": "Visita de cliente interessado",
  "notes": "Cliente: Maria Santos",
  "returnNotes": "Chave devolvida em perfeito estado",
  "keyId": "uuid-da-chave",
  "userId": "uuid-do-usuario",
  "returnedByUserId": "uuid-do-usuario-logado",
  "companyId": "uuid",
  "key": {
    "id": "uuid",
    "name": "Chave Principal",
    "status": "available"
  },
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@example.com"
  },
  "returnedByUser": {
    "id": "uuid",
    "name": "Maria Admin",
    "email": "maria@example.com"
  },
  "updatedAt": "2024-01-18T14:30:00Z"
}
```

**Validações:**
- Controle deve estar com status `checked_out`
- Usuário deve ter permissão `key:return`

**Erros:**
- `400 Bad Request`: Controle já foi devolvido, dados inválidos
- `401 Unauthorized`: Token inválido
- `403 Forbidden`: Sem permissão `key:return`
- `404 Not Found`: Controle não encontrado

---

#### 9. Listar Todos os Controles

```http
GET /keys/controls/all
```

**Query Parameters:**
- `status` (string, opcional): Filtrar por status (`checked_out`, `returned`, `overdue`, `lost`)

**Resposta (200 OK):**
```json
[
  {
    "id": "uuid",
    "type": "showing",
    "status": "checked_out",
    "checkoutDate": "2024-01-15T10:00:00Z",
    "expectedReturnDate": "2024-01-20T18:00:00Z",
    "reason": "Visita de cliente",
    "keyId": "uuid",
    "userId": "uuid",
    "key": {
      "id": "uuid",
      "name": "Chave Principal",
      "property": {
        "title": "Apartamento Centro"
      }
    },
    "user": {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao@example.com"
    }
  }
]
```

---

#### 10. Listar Chaves em Atraso

```http
GET /keys/controls/overdue
```

**Resposta (200 OK):**
```json
[
  {
    "id": "uuid",
    "type": "showing",
    "status": "overdue",
    "checkoutDate": "2024-01-10T09:00:00Z",
    "expectedReturnDate": "2024-01-12T18:00:00Z",
    "reason": "Visita de cliente",
    "key": {
      "id": "uuid",
      "name": "Chave Principal",
      "property": {
        "title": "Apartamento Centro"
      }
    },
    "user": {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao@example.com"
    }
  }
]
```

---

#### 11. Listar Controles do Usuário Logado

```http
GET /keys/controls/user
```

**Query Parameters:**
- `status` (string, opcional): Filtrar por status

**Resposta (200 OK):**
```json
[
  {
    "id": "uuid",
    "type": "showing",
    "status": "checked_out",
    "checkoutDate": "2024-01-15T10:00:00Z",
    "expectedReturnDate": "2024-01-20T18:00:00Z",
    "reason": "Visita de cliente",
    "keyId": "uuid",
    "key": {
      "id": "uuid",
      "name": "Chave Principal",
      "property": {
        "title": "Apartamento Centro"
      }
    }
  }
]
```

---

#### 12. Buscar Controle por ID

```http
GET /keys/controls/:id
```

**Resposta (200 OK):**
```json
{
  "id": "uuid",
  "type": "showing",
  "status": "returned",
  "checkoutDate": "2024-01-15T10:00:00Z",
  "expectedReturnDate": "2024-01-20T18:00:00Z",
  "actualReturnDate": "2024-01-18T14:30:00Z",
  "reason": "Visita de cliente",
  "notes": "Cliente interessado",
  "returnNotes": "Devolvida em perfeito estado",
  "keyId": "uuid",
  "userId": "uuid",
  "returnedByUserId": "uuid",
  "key": {
    "id": "uuid",
    "name": "Chave Principal"
  },
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@example.com"
  },
  "returnedByUser": {
    "id": "uuid",
    "name": "Maria Admin",
    "email": "maria@example.com"
  }
}
```

---

#### 13. Histórico de uma Chave

```http
GET /key-history/key/:keyId?limit=50
```

**Query Parameters:**
- `limit` (number, opcional): Limite de registros (padrão: 50)

**Resposta (200 OK):**
```json
[
  {
    "id": "uuid",
    "keyId": "uuid",
    "userId": "uuid",
    "keyControlId": "uuid",
    "action": "checkout",
    "description": "Chave retirada por João Silva para: Visita de cliente",
    "previousData": {
      "status": "available"
    },
    "newData": {
      "status": "in_use"
    },
    "createdAt": "2024-01-15T10:00:00Z",
    "user": {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao@example.com"
    },
    "key": {
      "id": "uuid",
      "name": "Chave Principal",
      "property": {
        "title": "Apartamento Centro"
      }
    },
    "keyControl": {
      "id": "uuid",
      "type": "showing",
      "checkoutDate": "2024-01-15T10:00:00Z",
      "expectedReturnDate": "2024-01-20T18:00:00Z",
      "reason": "Visita de cliente",
      "user": {
        "name": "João Silva"
      }
    }
  }
]
```

---

#### 14. Histórico de um Usuário

```http
GET /key-history/user/:userId?limit=50
```

**Query Parameters:**
- `limit` (number, opcional): Limite de registros

**Resposta (200 OK):**
```json
[
  {
    "id": "uuid",
    "keyId": "uuid",
    "userId": "uuid",
    "action": "checkout",
    "description": "Chave retirada",
    "createdAt": "2024-01-15T10:00:00Z",
    "key": {
      "id": "uuid",
      "name": "Chave Principal",
      "property": {
        "title": "Apartamento Centro"
      }
    }
  }
]
```

---

#### 15. Histórico do Usuário Logado

```http
GET /key-history/my-history?limit=50
```

**Query Parameters:**
- `limit` (number, opcional): Limite de registros

**Resposta (200 OK):**
```json
[
  {
    "id": "uuid",
    "keyId": "uuid",
    "userId": "uuid",
    "action": "checkout",
    "description": "Chave retirada",
    "createdAt": "2024-01-15T10:00:00Z",
    "key": {
      "id": "uuid",
      "name": "Chave Principal",
      "property": {
        "title": "Apartamento Centro"
      }
    }
  }
]
```

---

#### 16. Estatísticas do Histórico

```http
GET /key-history/statistics?keyId=uuid&userId=uuid
```

**Query Parameters:**
- `keyId` (string, opcional): Filtrar por chave
- `userId` (string, opcional): Filtrar por usuário

**Resposta (200 OK):**
```json
{
  "totalRecords": 150,
  "actionStats": [
    {
      "action": "checkout",
      "count": 75
    },
    {
      "action": "return",
      "count": 70
    },
    {
      "action": "create",
      "count": 5
    }
  ],
  "recentActivity": [
    {
      "id": "uuid",
      "action": "checkout",
      "description": "Chave retirada",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

## 📄 Páginas Frontend

### KeysPage (`/keys`)

**Rota:** `/keys`

**Componente:** `KeysPage`

**Permissão:** `key:view`

**Funcionalidades:**
- Listagem de todas as chaves
- Listagem de controles de chave (todos os controles)
- Listagem de chaves do usuário logado (minhas chaves)
- Estatísticas gerais
- Alertas de chaves em atraso
- Filtros avançados
- Busca textual
- Ações: criar, editar, excluir, checkout, return
- Visualização de histórico

**Tabs:**
1. **Todas as Chaves**: Lista todas as chaves cadastradas
2. **Controles de Chave**: Lista todos os controles (retiradas/devoluções)
3. **Minhas Chaves**: Lista controles do usuário logado

**Filtros:**
- Propriedade
- Status da chave
- Busca textual (nome, descrição)
- Disponibilidade (disponível/emprestada)
- Escopo de dados (meus dados/todos)

---

### CreateKeyPage (`/keys/create`)

**Rota:** `/keys/create`

**Componente:** `CreateKeyPage`

**Permissão:** `key:create`

**Funcionalidades:**
- Formulário de criação de chave
- Seleção de propriedade
- Campos: nome, tipo, status, localização, descrição, observações
- Validações frontend
- Redirecionamento automático se não houver propriedades

**Validações Frontend:**
- `name`: Obrigatório
- `propertyId`: Obrigatório

**Fluxo:**
1. Verifica se há propriedades disponíveis
2. Se não houver, redireciona para criação de propriedade
3. Exibe formulário
4. Valida dados
5. Envia para API
6. Redireciona para `/keys`

---

## 🧩 Componentes

### KeyPermissionGuard

**Arquivo:** `src/components/keys/KeyPermissionGuard.tsx`

**Descrição:** Componente para proteger funcionalidades baseado em permissões de chaves.

**Props:**
```typescript
interface KeyPermissionGuardProps {
  children: React.ReactNode;
  permission: string;              // Permissão necessária
  fallback?: React.ReactNode;      // Conteúdo alternativo se não tiver permissão
  showMessage?: boolean;           // Mostrar mensagem de acesso negado (padrão: true)
}
```

**Uso:**
```tsx
<KeyPermissionGuard permission="key:create">
  <Button>Criar Chave</Button>
</KeyPermissionGuard>
```

---

### KeyPermissionAlert

**Arquivo:** `src/components/keys/KeyPermissionGuard.tsx`

**Descrição:** Componente para exibir alerta quando não há permissão.

**Props:**
```typescript
interface KeyPermissionAlertProps {
  permission: string;              // Permissão necessária
  message?: string;                // Mensagem personalizada
}
```

**Uso:**
```tsx
<KeyPermissionAlert permission="key:update" message="Você não pode editar chaves" />
```

---

### KeyHistoryModal

**Arquivo:** `src/components/key/KeyHistoryModal.tsx`

**Descrição:** Modal para exibir histórico completo de uma chave.

**Props:**
```typescript
interface KeyHistoryModalProps {
  open: boolean;
  onClose: () => void;
  keyId: string;
  keyName: string;
}
```

**Funcionalidades:**
- Exibe histórico completo de ações
- Filtros por tipo de ação
- Informações detalhadas de cada registro
- Formatação de datas

---

## 🎣 Hooks

### useKeys

**Arquivo:** `src/hooks/useKeys.ts`

**Descrição:** Hook principal para gerenciar chaves.

**Uso:**
```typescript
const { keys, loading, error, refetch, createKey, updateKey, deleteKey, updateKeyStatus } = useKeys(propertyId?);
```

**Parâmetros:**
- `propertyId` (string, opcional): Filtrar chaves por propriedade

**Retorno:**
```typescript
{
  keys: Key[];                     // Lista de chaves
  loading: boolean;                // Estado de carregamento
  error: string | null;            // Erro (se houver)
  refetch: () => Promise<void>;    // Recarregar chaves
  createKey: (data: CreateKeyData) => Promise<Key>;
  updateKey: (id: string, data: UpdateKeyData) => Promise<Key>;
  deleteKey: (id: string) => Promise<void>;
  updateKeyStatus: (keyId: string, newStatus: 'available' | 'in_use') => void;
}
```

**Características:**
- Carrega automaticamente ao montar
- Atualiza status local após checkout/return
- Tratamento de erros com toast
- Recarrega automaticamente ao mudar empresa (useAutoReloadOnCompanyChange)

---

### useKeyControls

**Arquivo:** `src/hooks/useKeys.ts`

**Descrição:** Hook para gerenciar controles de chave (todos os controles da empresa).

**Uso:**
```typescript
const { keyControls, loading, error, refetch, checkoutKey, returnKey } = useKeyControls(status?);
```

**Parâmetros:**
- `status` (string, opcional): Filtrar por status (`checked_out`, `returned`, `overdue`, `lost`)

**Retorno:**
```typescript
{
  keyControls: KeyControl[];       // Lista de controles
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  checkoutKey: (data: CreateKeyControlData) => Promise<KeyControl>;
  returnKey: (keyControlId: string, data: ReturnKeyData) => Promise<KeyControl>;
}
```

---

### useUserKeyControls

**Arquivo:** `src/hooks/useKeys.ts`

**Descrição:** Hook para gerenciar controles de chave do usuário logado.

**Uso:**
```typescript
const { keyControls, loading, error, refetch, checkoutKey, returnKey } = useUserKeyControls(status?);
```

**Parâmetros:**
- `status` (string, opcional): Filtrar por status

**Retorno:** Mesmo formato de `useKeyControls`

**Características:**
- Retorna apenas controles do usuário logado
- Usa endpoint `/keys/controls/user`

---

### useKeyStatistics

**Arquivo:** `src/hooks/useKeys.ts`

**Descrição:** Hook para obter estatísticas de chaves.

**Uso:**
```typescript
const { statistics, loading, error, refetch } = useKeyStatistics();
```

**Retorno:**
```typescript
{
  statistics: KeyStatistics | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```

---

### useOverdueKeys

**Arquivo:** `src/hooks/useKeys.ts`

**Descrição:** Hook para obter chaves em atraso.

**Uso:**
```typescript
const { overdueKeys, loading, error, refetch } = useOverdueKeys();
```

**Retorno:**
```typescript
{
  overdueKeys: KeyControl[];       // Lista de controles em atraso
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```

---

### useKeyHistory

**Arquivo:** `src/hooks/useKeyHistory.ts`

**Descrição:** Hook para gerenciar histórico de chaves.

**Uso:**
```typescript
const { 
  history, 
  statistics, 
  isLoading, 
  error, 
  getKeyHistory, 
  getUserHistory, 
  getMyHistory, 
  getHistoryStatistics,
  clearError 
} = useKeyHistory();
```

**Retorno:**
```typescript
{
  history: KeyHistoryRecord[];     // Lista de registros
  statistics: KeyHistoryStatistics | null;
  isLoading: boolean;
  error: string | null;
  getKeyHistory: (keyId: string, limit?: number) => Promise<void>;
  getUserHistory: (userId: string, limit?: number) => Promise<void>;
  getMyHistory: (limit?: number) => Promise<void>;
  getHistoryStatistics: (keyId?: string, userId?: string) => Promise<void>;
  clearError: () => void;
}
```

**Características:**
- Métodos para buscar histórico de chave, usuário ou próprio histórico
- Estatísticas do histórico
- Limite configurável de registros (padrão: 50)
- Tratamento de erros 500 (backend) sem travar UI

---

## 🏷️ Status e Tipos

### Tipos de Chave (`Key.type`)

| Valor | Label | Descrição |
|-------|-------|-----------|
| `main` | Principal | Chave principal da propriedade |
| `backup` | Reserva | Chave reserva |
| `emergency` | Emergência | Chave de emergência |
| `garage` | Garagem | Chave da garagem |
| `mailbox` | Caixa de Correio | Chave da caixa de correio |
| `other` | Outro | Outro tipo |

**Função Helper:**
```typescript
const getKeyTypeLabel = (type: string): string => {
  const types = {
    main: 'Principal',
    backup: 'Reserva',
    emergency: 'Emergência',
    garage: 'Garagem',
    mailbox: 'Caixa de Correio',
    other: 'Outro',
  };
  return types[type as keyof typeof types] || type;
};
```

---

### Status de Chave (`Key.status`)

| Valor | Label | Descrição | Cor |
|-------|-------|-----------|-----|
| `available` | Disponível | Chave disponível para retirada | Verde |
| `in_use` | Em Uso | Chave atualmente emprestada | Laranja |
| `lost` | Perdida | Chave perdida | Vermelho |
| `damaged` | Danificada | Chave danificada | Vermelho |
| `maintenance` | Manutenção | Chave em manutenção | Azul |

**Função Helper:**
```typescript
const getKeyStatusLabel = (status: string): string => {
  const labels = {
    available: 'Disponível',
    in_use: 'Em Uso',
    lost: 'Perdida',
    damaged: 'Danificada',
    maintenance: 'Manutenção',
  };
  return labels[status as keyof typeof labels] || status;
};
```

**Regras de Negócio:**
- Ao fazer checkout, status muda para `in_use`
- Ao fazer return, status volta para `available`
- Status `lost` ou `damaged` impede checkout

---

### Tipos de Controle (`KeyControl.type`)

| Valor | Label | Descrição |
|-------|-------|-----------|
| `showing` | Visita | Visita de cliente/prospect |
| `maintenance` | Manutenção | Manutenção do imóvel |
| `inspection` | Vistoria | Vistoria técnica |
| `cleaning` | Limpeza | Limpeza do imóvel |
| `other` | Outro | Outro motivo |

**Função Helper:**
```typescript
const getControlTypeLabel = (type: string): string => {
  const types = {
    showing: 'Visita',
    maintenance: 'Manutenção',
    inspection: 'Vistoria',
    cleaning: 'Limpeza',
    other: 'Outro',
  };
  return types[type as keyof typeof types] || type;
};
```

---

### Status de Controle (`KeyControl.status`)

| Valor | Label | Descrição | Cor |
|-------|-------|-----------|-----|
| `checked_out` | Retirada | Chave retirada, ainda não devolvida | Laranja |
| `returned` | Devolvida | Chave devolvida | Verde |
| `overdue` | Em Atraso | Chave não devolvida na data prevista | Vermelho |
| `lost` | Perdida | Chave perdida durante o empréstimo | Vermelho |

**Função Helper:**
```typescript
const getControlStatusLabel = (status: string): string => {
  const labels = {
    checked_out: 'Retirada',
    returned: 'Devolvida',
    overdue: 'Em Atraso',
    lost: 'Perdida',
  };
  return labels[status as keyof typeof labels] || status;
};
```

**Regras de Negócio:**
- Status `overdue` é calculado automaticamente quando `expectedReturnDate` passou e status ainda é `checked_out`
- Status `lost` é definido manualmente (pode requerer permissão especial)

---

## ✅ Validações

### Validações Frontend (CreateKeyPage)

#### Campos Obrigatórios

**Nome (`name`)**
- **Obrigatório:** ✅ Sim
- **Tipo:** string
- **Mensagem de erro:** "Nome é obrigatório"
- **Validação:** Não pode estar vazio (trim)

**Propriedade (`propertyId`)**
- **Obrigatório:** ✅ Sim
- **Tipo:** string (UUID)
- **Mensagem de erro:** "Propriedade é obrigatória"
- **Validação:** Deve ser um ID válido

---

### Validações Backend

#### Criação de Chave (POST /keys)

**Campos Obrigatórios:**
- `name` (string): Não vazio, máximo 255 caracteres
- `propertyId` (string): UUID válido, propriedade deve existir
- `type` (string): Deve ser um dos valores válidos
- `status` (string): Deve ser um dos valores válidos

**Validações de Regras de Negócio:**
- Propriedade deve pertencer à empresa do usuário
- Nome deve ser único (ou único por propriedade, dependendo da regra de negócio)
- Usuário deve ter permissão `key:create`
- Para vincular chave à propriedade, requer também `property:view` (dependência contextual)

---

#### Atualização de Chave (PATCH /keys/:id)

**Validações:**
- Chave deve existir
- Chave deve pertencer à empresa do usuário
- Usuário deve ter permissão `key:update`
- Todos os campos fornecidos devem ser válidos (mesmas validações da criação)

**Regras de Negócio:**
- Não pode alterar propriedade se chave estiver em uso (status `in_use`)
- Status `lost` ou `damaged` deve ter justificativa (se aplicável)

---

#### Exclusão de Chave (DELETE /keys/:id)

**Validações:**
- Chave deve existir
- Chave deve pertencer à empresa do usuário
- Usuário deve ter permissão `key:delete`

**Regras de Negócio:**
- **Não pode excluir** se houver controle ativo (status `checked_out`)
- Pode excluir se todos os controles estiverem `returned` ou `lost`

---

#### Checkout de Chave (POST /keys/checkout)

**Campos Obrigatórios:**
- `keyId` (string): UUID válido
- `type` (string): Tipo válido
- `reason` (string): Não vazio, máximo 500 caracteres

**Validações de Regras de Negócio:**
- Chave deve existir
- Chave deve estar disponível (`status === 'available'`)
- Chave deve estar ativa (`isActive === true`)
- Usuário deve ter permissão `key:checkout`
- Se `expectedReturnDate` fornecido, deve ser no futuro

**Erros Comuns:**
- `400 Bad Request`: "Chave não está disponível para retirada"
- `400 Bad Request`: "Chave está inativa"

---

#### Return de Chave (POST /keys/return/:keyControlId)

**Validações:**
- Controle deve existir
- Controle deve estar com status `checked_out`
- Usuário deve ter permissão `key:return`

**Regras de Negócio:**
- Não pode devolver controle já devolvido
- `actualReturnDate` é definido automaticamente pelo backend
- Status da chave volta para `available` após devolução

**Erros Comuns:**
- `400 Bad Request`: "Controle já foi devolvido"
- `404 Not Found`: "Controle não encontrado"

---

## 🔐 Permissões

### Permissões de Chaves

| Permissão | Descrição | Endpoints Relacionados |
|-----------|-----------|------------------------|
| `key:view` | Visualizar chaves | GET /keys, GET /keys/:id, GET /keys/statistics, GET /keys/controls/* |
| `key:create` | Criar chaves | POST /keys |
| `key:update` | Editar chaves | PATCH /keys/:id |
| `key:delete` | Excluir chaves | DELETE /keys/:id |
| `key:checkout` | Retirar chave | POST /keys/checkout |
| `key:return` | Devolver chave | POST /keys/return/:keyControlId |

---

### Dependências Contextuais

As permissões de chaves têm dependências contextuais que podem exigir outras permissões:

#### Vincular Chave a Propriedade

**Funcionalidade:** `vincular_chave_propriedade`

**Requer:**
- `key:create` OU `key:update`
- `property:view` (para visualizar propriedades disponíveis)

**Usado em:**
- Criação de chave (CreateKeyPage)
- Edição de chave

---

#### Alterar Propriedade da Chave

**Funcionalidade:** `alterar_propriedade_chave`

**Requer:**
- `key:update`
- `property:view` (para visualizar propriedades disponíveis)

**Usado em:**
- Edição de chave

---

### Permissões para Intellisys App

As seguintes permissões são necessárias para acesso ao aplicativo Intellisys:

- `key:view`
- `key:create`
- `key:update`
- `key:delete`
- `key:checkout`
- `key:return`

Todas as permissões de chaves devem estar presentes para que o usuário tenha acesso ao app móvel.

---

## 🔄 Fluxos Principais

### 1. Criar Chave

**Passos:**
1. Usuário acessa `/keys/create` (requer `key:create`)
2. Sistema verifica se há propriedades disponíveis
3. Se não houver, redireciona para `/properties/create`
4. Usuário preenche formulário:
   - Nome (obrigatório)
   - Propriedade (obrigatório)
   - Tipo (seleção)
   - Status (seleção)
   - Localização (opcional)
   - Descrição (opcional)
   - Observações (opcional)
5. Validações frontend
6. Envio para API: `POST /keys`
7. Validações backend
8. Chave criada
9. Redirecionamento para `/keys`
10. Toast de sucesso

**Validações:**
- Nome obrigatório
- Propriedade obrigatória
- Permissão `key:create`
- Permissão `property:view` (para vincular)

---

### 2. Retirar Chave (Checkout)

**Passos:**
1. Usuário visualiza lista de chaves (`/keys`)
2. Usuário clica em "Retirar" em uma chave disponível (requer `key:checkout`)
3. Modal de checkout é aberto
4. Usuário preenche:
   - Tipo de uso (obrigatório)
   - Motivo (obrigatório)
   - Data prevista de devolução (opcional)
   - Observações (opcional)
5. Validações frontend
6. Envio para API: `POST /keys/checkout`
7. Validações backend:
   - Chave deve estar disponível
   - Chave deve estar ativa
8. Controle criado
9. Status da chave muda para `in_use`
10. Modal fechado
11. Lista atualizada
12. Toast de sucesso

**Validações:**
- Chave disponível (`status === 'available'`)
- Chave ativa (`isActive === true`)
- Tipo obrigatório
- Motivo obrigatório
- Permissão `key:checkout`

---

### 3. Devolver Chave (Return)

**Passos:**
1. Usuário visualiza controles de chave (`/keys`, tab "Controles de Chave" ou "Minhas Chaves")
2. Usuário identifica controle com status `checked_out`
3. Usuário clica em "Devolver" (requer `key:return`)
4. Modal de devolução é aberto
5. Usuário pode adicionar observações (opcional)
6. Envio para API: `POST /keys/return/:keyControlId`
7. Validações backend:
   - Controle deve estar `checked_out`
8. Controle atualizado:
   - Status muda para `returned`
   - `actualReturnDate` definido
   - `returnedByUserId` definido
9. Status da chave volta para `available`
10. Modal fechado
11. Lista atualizada
12. Toast de sucesso

**Validações:**
- Controle com status `checked_out`
- Permissão `key:return`

---

### 4. Editar Chave

**Passos:**
1. Usuário visualiza lista de chaves (`/keys`)
2. Usuário clica em "Editar" (requer `key:update`)
3. Modal de edição é aberto
4. Usuário modifica campos (todos opcionais)
5. Validações frontend (se aplicável)
6. Envio para API: `PATCH /keys/:id`
7. Validações backend
8. Chave atualizada
9. Modal fechado
10. Lista atualizada
11. Toast de sucesso

**Validações:**
- Permissão `key:update`
- Campos fornecidos devem ser válidos
- Não pode alterar propriedade se chave em uso

---

### 5. Excluir Chave

**Passos:**
1. Usuário visualiza lista de chaves (`/keys`)
2. Usuário clica em "Excluir" (requer `key:delete`)
3. Confirmação é solicitada
4. Usuário confirma
5. Envio para API: `DELETE /keys/:id`
6. Validações backend:
   - Chave não pode estar em uso
7. Chave excluída
8. Lista atualizada
9. Toast de sucesso

**Validações:**
- Permissão `key:delete`
- Chave não pode ter controle ativo (`checked_out`)

---

### 6. Visualizar Histórico

**Passos:**
1. Usuário visualiza lista de chaves (`/keys`)
2. Usuário clica em "Histórico" em uma chave
3. Modal de histórico é aberto
4. Hook `useKeyHistory` é usado
5. Busca histórico: `GET /key-history/key/:keyId`
6. Histórico exibido com:
   - Lista de ações
   - Data/hora
   - Usuário responsável
   - Descrição
   - Dados anteriores/novos (se aplicável)
7. Usuário pode filtrar por tipo de ação
8. Modal pode ser fechado

---

### 7. Filtrar Chaves

**Passos:**
1. Usuário acessa `/keys`
2. Usuário clica em ícone de filtro
3. Drawer de filtros é aberto
4. Usuário seleciona filtros:
   - Propriedade
   - Status
   - Busca textual
   - Disponibilidade
   - Escopo de dados
5. Usuário aplica filtros
6. Lista é filtrada (frontend) ou busca é feita na API com parâmetros
7. Resultados filtrados são exibidos

---

## 📜 Histórico

### Sistema de Histórico

O sistema mantém um histórico completo de todas as ações relacionadas a chaves:

**Tipos de Ação:**
- `create`: Criação de chave
- `update`: Atualização de chave
- `delete`: Exclusão de chave
- `checkout`: Retirada de chave
- `return`: Devolução de chave
- `status_change`: Mudança de status

**Informações Registradas:**
- ID da chave
- ID do usuário que executou a ação
- ID do controle (se aplicável)
- Tipo de ação
- Descrição da ação
- Dados anteriores (se aplicável)
- Dados novos (se aplicável)
- Metadados adicionais
- Data/hora do registro

**Endpoints de Histórico:**
- `GET /key-history/key/:keyId` - Histórico de uma chave
- `GET /key-history/user/:userId` - Histórico de um usuário
- `GET /key-history/my-history` - Histórico do usuário logado
- `GET /key-history/statistics` - Estatísticas do histórico

**Hook:** `useKeyHistory`

**Componente:** `KeyHistoryModal`

---

## 📊 Estatísticas

### Estatísticas Gerais

O sistema fornece estatísticas agregadas sobre chaves:

**Métricas:**
- **Total de Chaves**: Número total de chaves cadastradas
- **Chaves Disponíveis**: Número de chaves disponíveis para retirada
- **Chaves em Uso**: Número de chaves atualmente emprestadas
- **Chaves em Atraso**: Número de controles com status `overdue`

**Endpoint:** `GET /keys/statistics`

**Hook:** `useKeyStatistics`

**Exibição:**
- Cards de estatísticas na página principal (`KeysPage`)
- Alertas de chaves em atraso
- Integração com dashboard (se aplicável)

---

### Estatísticas de Histórico

**Métricas:**
- Total de registros
- Estatísticas por tipo de ação (contagem)
- Atividades recentes

**Endpoint:** `GET /key-history/statistics`

**Hook:** `useKeyHistory().getHistoryStatistics()`

---

## 🔗 Integrações

### Propriedades

**Integração:**
- Chaves são vinculadas a propriedades (`propertyId`)
- Ao visualizar propriedade, pode ver status das chaves
- Ao criar chave, deve selecionar propriedade
- Permissão `property:view` necessária para vincular

**Componentes Relacionados:**
- `PropertyDetailsPage`: Exibe status da chave
- `PropertyInfoPanel`: Seção de chaves

**APIs Relacionadas:**
- `GET /properties/:id` - Retorna dados da propriedade (pode incluir chaves)

---

### Usuários

**Integração:**
- Controles de chave rastreiam usuário que retirou (`userId`)
- Controles de chave rastreiam usuário que devolveu (`returnedByUserId`)
- Histórico rastreia usuário que executou cada ação
- Filtro "Minhas Chaves" mostra apenas controles do usuário logado

---

### Permissões

**Integração:**
- Sistema de permissões controla acesso a todas as funcionalidades
- Dependências contextuais com outras permissões (`property:view`)
- Guard de permissões protege componentes e rotas

**Componentes:**
- `KeyPermissionGuard`: Protege funcionalidades
- `PermissionButton`: Botões com verificação de permissão
- `PermissionRoute`: Rotas protegidas

---

### Intellisys App

**Integração:**
- Todas as permissões de chaves são necessárias para acesso ao app
- Funcionalidades de chaves disponíveis no app móvel

**Permissões Necessárias:**
- `key:view`
- `key:create`
- `key:update`
- `key:delete`
- `key:checkout`
- `key:return`

---

### Notificações (Futuro)

**Integrações Potenciais:**
- Notificações de chaves em atraso
- Notificações de devolução próxima
- Alertas de chaves perdidas

---

### Dashboard (Futuro)

**Integrações Potenciais:**
- Widget de chaves disponíveis
- Widget de chaves em atraso
- Gráficos de uso de chaves
- Estatísticas de movimentação

---

## 📝 Notas Técnicas

### Tratamento de Erros

**Erros Comuns:**

**401 Unauthorized:**
- Token expirado ou inválido
- Solução: Fazer login novamente

**403 Forbidden:**
- Sem permissão para acessar funcionalidade
- Solução: Solicitar permissão ao administrador

**404 Not Found:**
- Chave ou controle não encontrado
- Solução: Verificar se o ID está correto

**400 Bad Request:**
- Dados inválidos
- Chave não disponível (no checkout)
- Controle já devolvido (no return)
- Solução: Verificar dados fornecidos e estado da chave

**409 Conflict:**
- Nome duplicado
- Chave em uso (tentativa de exclusão)
- Solução: Usar nome diferente ou aguardar devolução

---

### Recarregamento Automático

**Monitoramento de Mudança de Empresa:**
- Todos os hooks utilizam `useAutoReloadOnCompanyChange`
- Ao mudar de empresa, dados são recarregados automaticamente
- Evita exibir dados da empresa anterior

---

### Garantia de Arrays

**Proteção contra Erros:**
- Hooks garantem que dados sejam sempre arrays
- Fallback para array vazio em caso de erro
- Tratamento de respostas inesperadas da API

**Exemplo:**
```typescript
const keysArray = Array.isArray(data) ? data : (data?.keys && Array.isArray(data.keys) ? data.keys : []);
```

---

### Formatação de Datas

**Biblioteca:** `date-fns`

**Locale:** `ptBR`

**Formato Comum:**
```typescript
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
```

---

### Filtros e Busca

**Filtros Frontend:**
- Filtros locais para busca rápida
- Filtros persistentes no estado
- Drawer de filtros avançados

**Filtros Backend:**
- Parâmetros de query string
- Filtros por propriedade, status, busca textual
- Escopo de dados (meus dados/todos)

---

### Performance

**Otimizações:**
- Hooks com `useCallback` para evitar re-renderizações
- Estados de loading separados por funcionalidade
- Cache implícito via estado do React

**Limitações:**
- Histórico limitado a 50 registros por padrão (configurável)
- Lista de chaves carregada completamente (sem paginação, se aplicável)

---

### Compatibilidade

**Navegadores Suportados:**
- Chrome (últimas versões)
- Firefox (últimas versões)
- Safari (últimas versões)
- Edge (últimas versões)

**Dependências:**
- React 18+
- TypeScript 4.5+
- date-fns 2.29+

---

## 🎯 Resumo

O sistema de **Controle de Chaves** é uma solução completa para gerenciamento de chaves físicas em imobiliárias, oferecendo:

- ✅ **Gerenciamento Completo**: Criação, edição, exclusão de chaves
- ✅ **Controle de Empréstimo**: Checkout e return com rastreamento completo
- ✅ **Histórico Detalhado**: Registro de todas as ações
- ✅ **Estatísticas**: Métricas e relatórios
- ✅ **Permissões Granulares**: Controle de acesso por funcionalidade
- ✅ **Integração com Propriedades**: Vinculação direta com imóveis
- ✅ **Interface Intuitiva**: Páginas e componentes bem estruturados
- ✅ **Hooks Reutilizáveis**: Lógica encapsulada e reutilizável
- ✅ **Validações Completas**: Frontend e backend
- ✅ **Tratamento de Erros**: Mensagens claras e tratamento adequado

---

**Última Atualização:** Janeiro 2024












