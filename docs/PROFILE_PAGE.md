# 👤 Documentação do Perfil do Usuário

## Índice

1. [Visão Geral](#-visão-geral)
2. [Estrutura de Dados](#-estrutura-de-dados)
3. [Endpoints da API](#-endpoints-da-api) (7 endpoints)
4. [Páginas](#-páginas)
5. [Componentes](#-componentes)
6. [Validações](#-validações)
7. [Funcionalidades](#-funcionalidades)
8. [Hooks Relacionados](#-hooks-relacionados)
9. [Próximas Melhorias](#-próximas-melhorias)

---

## 📋 Visão Geral

O sistema de Perfil do Usuário permite que corretores visualizem e gerenciem suas informações pessoais, segurança, empresas vinculadas e configurações do perfil.

### Funcionalidades Principais

- ✅ **Visualização de Perfil**: Ver informações pessoais, cargo, data de criação
- ✅ **Edição de Perfil**: Atualizar nome, telefone e tags
- ✅ **Upload de Avatar**: Alterar foto de perfil
- ✅ **Alteração de Senha**: Modificar senha de acesso
- ✅ **Gerenciamento de Sessões**: Ver e encerrar sessões ativas
- ✅ **Visibilidade Pública**: Controlar se o perfil aparece no site público
- ✅ **Gestão de Empresas**: Ver empresas vinculadas (com ações para admin/master)
- ✅ **Tags do Perfil**: Associar tags ao perfil
- ✅ **Estatísticas**: Visualizar estatísticas rápidas

---

## 📊 Estrutura de Dados

### User (Usuário)

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: string;                    // 'user' | 'admin' | 'master' | 'manager'
  owner: boolean;
  avatar?: string;                 // URL do avatar
  phone?: string;                  // Telefone (formato livre)
  document?: string;               // CPF/CNPJ
  companyId?: string;              // ID da empresa principal
  createdAt: string;               // ISO string
  updatedAt?: string;              // ISO string
  // Campos opcionais
  tagIds?: string[];               // IDs das tags associadas
  managerId?: string;              // ID do gerente (hierarquia)
  managedUserIds?: string[];       // IDs de usuários gerenciados
  isAvailableForPublicSite?: boolean; // Visibilidade no site público
}
```

### UpdateProfileData

```typescript
interface UpdateProfileData {
  name?: string;                   // Obrigatório na edição
  phone?: string;
  tagIds?: string[];               // IDs das tags
  avatar?: string | null;          // Para remover avatar (null)
}
```

### ChangePasswordRequest

```typescript
interface ChangePasswordRequest {
  currentPassword: string;         // Obrigatório
  newPassword: string;             // Obrigatório (mínimo 6 caracteres)
}
```

### Session (Sessão)

```typescript
interface Session {
  id: string;
  userId: string;
  device: string;                  // Nome do dispositivo
  browser: string;                 // Navegador
  operatingSystem?: string;        // Sistema operacional
  location?: string;               // Localização
  ipAddress: string;               // Endereço IP
  isCurrent: boolean;              // Se é a sessão atual
  lastActivity: string;            // ISO string
  createdAt: string;               // ISO string
}
```

---

## 🔌 Endpoints da API

### Base URL
```
/auth
```

### 1. Buscar Perfil

**Endpoint:**
```
GET /auth/profile
```

**Headers:**
```
Authorization: Bearer {token}
```

**Resposta:**
```typescript
User
```

**Exemplo:**
```typescript
GET /auth/profile
```

### 2. Atualizar Perfil

**Endpoint:**
```
PUT /auth/profile
```

**Body:**
```typescript
{
  name?: string;
  phone?: string;
  tagIds?: string[];
  avatar?: string | null;  // null para remover
}
```

**Resposta:**
```typescript
User
```

**Exemplo:**
```typescript
PUT /auth/profile
{
  "name": "João Silva",
  "phone": "(11) 98765-4321",
  "tagIds": ["tag-1", "tag-2"]
}
```

**Validações:**
- `name`: Obrigatório se fornecido (não pode ser vazio)
- `phone`: Opcional
- `tagIds`: Array de strings (IDs válidos)

### 3. Upload de Avatar

**Endpoint:**
```
POST /auth/avatar
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Body:**
```
FormData com campo 'avatar' (File)
```

**Resposta:**
```typescript
{
  avatarUrl: string;  // URL do avatar salvo
}
```

**Validações:**
- Tipo de arquivo: Apenas imagens (image/*)
- Tamanho máximo: 5MB
- Formatos aceitos: JPG, PNG, GIF, WebP
- Dimensões recomendadas: 400x400px (será redimensionado automaticamente)

**Exemplo:**
```typescript
const formData = new FormData();
formData.append('avatar', file);

POST /auth/avatar
Content-Type: multipart/form-data
Body: formData
```

### 4. Remover Avatar

**Endpoint:**
```
PUT /auth/profile
```

**Body:**
```typescript
{
  avatar: null
}
```

**Resposta:**
```typescript
User
```

### 5. Alterar Senha

**Endpoint:**
```
PUT /auth/change-password
```

**Body:**
```typescript
{
  currentPassword: string;
  newPassword: string;
}
```

**Resposta:**
```
204 No Content
```

**Validações:**
- `currentPassword`: Obrigatório, deve corresponder à senha atual
- `newPassword`: Obrigatório, mínimo 6 caracteres, deve ser diferente da senha atual

**Comportamento:**
- Após alterar a senha, todas as outras sessões são desconectadas automaticamente
- A sessão atual permanece ativa

**Exemplo:**
```typescript
PUT /auth/change-password
{
  "currentPassword": "senhaAtual123",
  "newPassword": "novaSenha456"
}
```

### 6. Listar Sessões

**Endpoint:**
```
GET /auth/sessions
```

**Resposta:**
```typescript
Session[]
```

**Exemplo:**
```typescript
GET /auth/sessions
```

**Resposta de Exemplo:**
```typescript
[
  {
    "id": "session-1",
    "userId": "user-123",
    "device": "Desktop",
    "browser": "Chrome 120.0",
    "operatingSystem": "Windows 10",
    "ipAddress": "192.168.1.1",
    "isCurrent": true,
    "lastActivity": "2024-01-15T14:30:00Z",
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

### 7. Encerrar Sessão

**Endpoint:**
```
DELETE /auth/sessions/:sessionId
```

**Resposta:**
```
204 No Content
```

**Exemplo:**
```typescript
DELETE /auth/sessions/session-123
```

**Nota:** Não é possível encerrar a sessão atual através desta API.

### 8. Encerrar Todas as Outras Sessões

**Endpoint:**
```
DELETE /auth/sessions/others
```

**Resposta:**
```
204 No Content
```

**Exemplo:**
```typescript
DELETE /auth/sessions/others
```

**Comportamento:**
- Encerra todas as sessões exceto a atual
- Útil para segurança quando há suspeita de acesso não autorizado

### 9. Atualizar Visibilidade Pública

**Endpoint:**
```
PATCH /auth/profile/public-visibility
```

**Body:**
```typescript
{
  isAvailableForPublicSite: boolean;
}
```

**Resposta:**
```typescript
{
  success: boolean;
  message: string;
  isAvailableForPublicSite: boolean;
}
```

**Exemplo:**
```typescript
PATCH /auth/profile/public-visibility
{
  "isAvailableForPublicSite": true
}
```

**Comportamento:**
- `true`: Perfil aparece na lista de corretores no site público
- `false`: Perfil não aparece no site público

---

## 📄 Páginas

### ProfilePage

**Localização:** `src/pages/ProfilePage.tsx`

**Rota:** `/profile`

**Funcionalidades:**
- Exibir informações pessoais do usuário
- Visualizar avatar (com opção de upload ao clicar)
- Mostrar cargo e data de criação
- Exibir lista de empresas vinculadas
- Gerenciar visibilidade pública (toggle)
- Acessar gerenciamento de sessões
- Alterar senha (via modal)
- Buscar empresas
- Filtros de empresas (estado básico)
- Estatísticas rápidas

**Seções:**
1. **Cabeçalho**: Título, contador de empresas, botão de editar
2. **Estatísticas**: Cards com estatísticas rápidas (empresas, propriedades, clientes, receita)
3. **Informações Pessoais**:
   - Avatar (clicável para upload)
   - Nome completo
   - Email
   - Telefone
   - Cargo
   - Data de criação (membro desde)
4. **Segurança**:
   - Sessões ativas (modal)
   - Alterar senha (modal)
   - Visibilidade pública (toggle)
5. **Empresas**: Lista de empresas vinculadas com:
   - Nome, CNPJ, endereço
   - Data de criação
   - Toggle TOTP obrigatório (admin/master)
   - Botões de editar/excluir (admin/master)
   - Link para ver no site Intellisys

**Permissões:**
- Editar/Excluir empresas: Apenas `admin` ou `master`
- Exclusão: Não permite excluir empresa "Matrix"

**Busca e Filtros:**
- Busca por nome de empresa ou CNPJ
- Filtros por status e tipo (estado básico, não totalmente funcional)

### EditProfilePage

**Localização:** `src/pages/EditProfilePage.tsx`

**Rota:** `/profile/edit`

**Funcionalidades:**
- Editar nome completo
- Editar telefone
- Gerenciar tags do perfil (TagSelector)
- Salvar alterações
- Cancelar e voltar

**Campos do Formulário:**
- **Nome Completo*** (obrigatório)
- **Telefone** (opcional)
- **Tags** (seletor de tags múltiplas)

**Validações:**
- Nome é obrigatório e não pode estar vazio
- Telefone é opcional
- Tags são opcionais (array de IDs)

**Comportamento:**
- Carrega dados do usuário atual ao montar
- Atualiza cache do usuário após salvar
- Navega para `/profile` após salvar com sucesso
- Exibe mensagens de erro/sucesso via toast

---

## 🧩 Componentes

### AvatarEditModal

**Localização:** `src/components/modals/AvatarEditModal.tsx`

**Props:**
```typescript
interface AvatarEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (avatarUrl: string | null) => void;
  currentAvatar?: string | null;
}
```

**Funcionalidades:**
- Preview do avatar atual
- Upload de nova imagem
- Remover avatar
- Validação de arquivo (tipo, tamanho)
- Preview antes de salvar
- Especificações de imagem exibidas

**Validações:**
- Tipo: Apenas imagens (`image/*`)
- Tamanho: Máximo 5MB
- Formatos: JPG, PNG, GIF, WebP
- Dimensões recomendadas: 400x400px

**Uso:**
```typescript
<AvatarEditModal
  isOpen={showAvatarModal}
  onClose={() => setShowAvatarModal(false)}
  onSave={(avatarUrl) => {
    // Atualizar avatar no estado
    setUser(prev => ({ ...prev, avatar: avatarUrl }));
  }}
  currentAvatar={user?.avatar}
/>
```

### ChangePasswordModal

**Localização:** `src/components/modals/ChangePasswordModal.tsx`

**Props:**
```typescript
interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Funcionalidades:**
- Formulário de alteração de senha
- Campos: senha atual, nova senha, confirmar senha
- Mostrar/ocultar senha (toggle)
- Validações em tempo real
- Tratamento de erros específicos

**Validações:**
- Senha atual: Obrigatória
- Nova senha: Obrigatória, mínimo 6 caracteres, diferente da atual
- Confirmar senha: Obrigatória, deve coincidir com nova senha

**Comportamento:**
- Após alterar, todas as outras sessões são desconectadas
- Exibe mensagem de sucesso explicando desconexão
- Trata erros específicos (senha incorreta, etc.)

**Uso:**
```typescript
<ChangePasswordModal
  isOpen={showPasswordModal}
  onClose={() => setShowPasswordModal(false)}
/>
```

### SessionsModal

**Localização:** `src/components/modals/SessionsModal.tsx`

**Props:**
```typescript
interface SessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Funcionalidades:**
- Listar todas as sessões ativas
- Identificar sessão atual
- Encerrar sessões individuais
- Exibir informações: dispositivo, navegador, OS, IP, última atividade
- Ícones por tipo de dispositivo (desktop, mobile, tablet)

**Informações Exibidas:**
- Tipo de dispositivo (desktop/mobile/tablet)
- Nome do dispositivo
- Navegador
- Sistema operacional
- Endereço IP
- Última atividade
- Badge "Sessão Atual" para sessão corrente

**Ações:**
- Encerrar sessão (botão por sessão, exceto atual)
- Fechar modal

**Uso:**
```typescript
<SessionsModal
  isOpen={showSessionsModal}
  onClose={() => setShowSessionsModal(false)}
/>
```

---

## ✅ Validações

### Validações de Perfil

#### Campos Obrigatórios
- ✅ `name`: Obrigatório quando atualizando (não pode ser vazio)

#### Regras de Negócio

1. **Nome:**
   - Deve ter pelo menos 1 caractere após trim
   - Não pode ser apenas espaços

2. **Telefone:**
   - Opcional
   - Aceita qualquer formato (formatação é visual apenas)

3. **Tags:**
   - Array de IDs válidos
   - Tags devem existir no sistema

### Validações de Avatar

1. **Tipo de Arquivo:**
   - Apenas imagens (`image/*`)
   - Formatos aceitos: JPG, PNG, GIF, WebP

2. **Tamanho:**
   - Máximo: 5MB
   - Validação no frontend antes do upload

3. **Dimensões:**
   - Recomendado: 400x400px
   - Redimensionamento automático no backend

### Validações de Senha

1. **Senha Atual:**
   - Obrigatória
   - Deve corresponder à senha atual do usuário

2. **Nova Senha:**
   - Obrigatória
   - Mínimo 6 caracteres
   - Deve ser diferente da senha atual

3. **Confirmar Senha:**
   - Obrigatória
   - Deve ser idêntica à nova senha

**Mensagens de Erro:**
- Senha atual incorreta
- Nova senha deve ter pelo menos 6 caracteres
- As senhas não coincidem
- A nova senha deve ser diferente da senha atual

---

## 🎯 Funcionalidades

### 1. Upload de Avatar

**Fluxo:**
1. Usuário clica no avatar na página de perfil
2. Input file é acionado
3. Arquivo é selecionado
4. Validações são executadas (tipo, tamanho)
5. Upload via API
6. Avatar é atualizado no perfil
7. Cache do usuário é atualizado
8. Toast de sucesso é exibido

**Alternativa via Modal:**
- Modal `AvatarEditModal` oferece interface mais rica
- Preview antes de salvar
- Opção de remover avatar
- Especificações de imagem exibidas

### 2. Alteração de Senha

**Fluxo:**
1. Usuário abre modal de alteração de senha
2. Preenche senha atual, nova senha e confirmação
3. Validações são executadas
4. Requisição é enviada para API
5. Se bem-sucedido:
   - Todas as outras sessões são desconectadas
   - Toast de sucesso é exibido
   - Modal é fechado
6. Se houver erro, mensagem específica é exibida

**Segurança:**
- Senhas não são armazenadas localmente
- Validação de senha atual no backend
- Outras sessões são desconectadas automaticamente
- Sessão atual permanece ativa

### 3. Gerenciamento de Sessões

**Funcionalidades:**
- Listar todas as sessões ativas
- Identificar sessão atual
- Encerrar sessões individuais
- Ver informações detalhadas de cada sessão

**Informações Exibidas:**
- Tipo de dispositivo (ícone)
- Nome do dispositivo
- Navegador
- Sistema operacional
- Endereço IP
- Última atividade (formatada)

**Ações:**
- Encerrar sessão (botão por sessão)
- Não é possível encerrar sessão atual

### 4. Visibilidade Pública

**Funcionalidade:**
- Toggle para controlar se o perfil aparece no site público Intellisys
- Estado é salvo imediatamente ao alterar
- Feedback visual com toggle animado

**Comportamento:**
- `true`: Perfil visível na lista de corretores do site público
- `false`: Perfil oculto do site público
- Mudança é persistida no backend imediatamente
- Cache do usuário é atualizado

**Hook:**
- Usa `usePublicVisibility` para gerenciar estado
- Atualiza cache após mudança
- Trata erros de API

### 5. Gestão de Empresas

**Visualização:**
- Lista todas as empresas vinculadas ao usuário
- Exibe nome, CNPJ, endereço, data de criação
- Link para ver empresa no site Intellisys

**Ações para Admin/Master:**
- **Editar**: Navega para página de edição (`/companies/:id/edit`)
- **Excluir**: Abre modal de confirmação, exclui empresa
- **Toggle TOTP**: Ativa/desativa 2FA obrigatório para a empresa

**Restrições:**
- Editar/Excluir: Apenas `admin` ou `master`
- Exclusão: Empresa "Matrix" não pode ser excluída
- Toggle TOTP: Apenas `admin` ou `master`

**Busca:**
- Busca por nome de empresa ou CNPJ
- Filtro em tempo real na lista

### 6. Tags do Perfil

**Funcionalidade:**
- Associar tags ao perfil do usuário
- Usa componente `TagSelector` para seleção múltipla
- Tags são salvas junto com outras informações do perfil

**Uso:**
- Disponível na página de edição (`EditProfilePage`)
- Seleção múltipla
- Tags disponíveis são carregadas do sistema

---

## 🎣 Hooks Relacionados

### useAuth

**Localização:** `src/hooks/useAuth.ts`

**Métodos Utilizados:**
- `getCurrentUser()`: Retorna usuário atual do cache
- `refreshUser()`: Recarrega dados do usuário do backend

**Uso:**
```typescript
const { getCurrentUser, refreshUser } = useAuth();

// Obter usuário atual
const user = getCurrentUser();

// Recarregar dados do usuário
await refreshUser();
```

### usePublicVisibility

**Localização:** `src/hooks/usePublicVisibility.ts`

**Interface:**
```typescript
interface UsePublicVisibilityReturn {
  isVisible: boolean;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  toggleVisibility: () => Promise<void>;
}
```

**Funcionalidades:**
- Carregar estado de visibilidade do usuário
- Alternar visibilidade pública
- Gerenciar estados de loading e erro

**Uso:**
```typescript
const { isVisible, toggleVisibility, isUpdating } = usePublicVisibility();

// Alternar visibilidade
await toggleVisibility();
```

### useTags

**Localização:** `src/hooks/useTags.ts`

**Métodos Utilizados:**
- `tags`: Lista de tags disponíveis
- `getUserTags(userId)`: Obter tags de um usuário específico

**Uso:**
```typescript
const { tags, getUserTags } = useTags();

// Obter tags do usuário
const userTags = await getUserTags(userId);
```

### useCompany

**Localização:** `src/hooks/useCompany.ts`

**Métodos Utilizados:**
- `hasCompanies`: Verifica se usuário tem empresas

**Uso:**
```typescript
const { hasCompanies } = useCompany();
```

---

## 🔄 Fluxos Principais

### Fluxo de Edição de Perfil

```
1. Usuário acessa /profile
   ↓
2. Clica em "Editar Perfil"
   ↓
3. Navega para /profile/edit
   ↓
4. Página carrega dados do usuário atual
   ↓
5. Usuário edita campos (nome, telefone, tags)
   ↓
6. Clica em "Salvar Alterações"
   ↓
7. Validações são executadas
   ↓
8. API PUT /auth/profile é chamada
   ↓
9. Cache do usuário é atualizado (refreshUser)
   ↓
10. Navega para /profile
    ↓
11. Toast de sucesso é exibido
```

### Fluxo de Upload de Avatar

```
1. Usuário clica no avatar
   ↓
2. Input file é acionado
   ↓
3. Arquivo é selecionado
   ↓
4. Validações (tipo, tamanho)
   ↓
5. FormData é criado
   ↓
6. API POST /auth/avatar é chamada
   ↓
7. Avatar é atualizado no backend
   ↓
8. Cache do usuário é atualizado (refreshUser)
   ↓
9. Avatar é atualizado na interface
   ↓
10. Toast de sucesso é exibido
```

### Fluxo de Alteração de Senha

```
1. Usuário clica em "Alterar Senha"
   ↓
2. Modal ChangePasswordModal é aberto
   ↓
3. Usuário preenche formulário
   ↓
4. Validações são executadas (frontend)
   ↓
5. API PUT /auth/change-password é chamada
   ↓
6. Backend valida senha atual
   ↓
7. Senha é atualizada
   ↓
8. Todas as outras sessões são desconectadas
   ↓
9. Toast de sucesso é exibido
   ↓
10. Modal é fechado
```

### Fluxo de Visibilidade Pública

```
1. Usuário altera toggle de visibilidade
   ↓
2. Hook usePublicVisibility.toggleVisibility é chamado
   ↓
3. API PATCH /auth/profile/public-visibility é chamada
   ↓
4. Estado é atualizado no backend
   ↓
5. Cache do usuário é atualizado (refreshUser)
   ↓
6. Estado local é atualizado
   ↓
7. Interface reflete nova visibilidade
```

---

## 🔐 Permissões e Restrições

### Permissões Gerais

| Ação | Permissão Necessária |
|------|---------------------|
| Ver perfil próprio | Autenticação |
| Editar perfil próprio | Autenticação |
| Upload de avatar | Autenticação |
| Alterar senha própria | Autenticação |
| Ver sessões próprias | Autenticação |
| Encerrar sessões próprias | Autenticação |

### Permissões de Empresas

| Ação | Permissão Necessária |
|------|---------------------|
| Ver empresas vinculadas | Autenticação |
| Editar empresa | `admin` ou `master` |
| Excluir empresa | `admin` ou `master` |
| Toggle TOTP empresa | `admin` ou `master` |

### Restrições Especiais

1. **Empresa Matrix**: Não pode ser excluída (proteção do sistema)
2. **Sessão Atual**: Não pode ser encerrada via interface (segurança)
3. **Email**: Não pode ser alterado via perfil (requer processo separado)

---

## 📱 Responsividade

### Desktop
- Layout em grid com múltiplas colunas
- Cards amplos com informações completas
- Estatísticas em grid horizontal

### Tablet
- Layout adaptado com menos colunas
- Cards continuam legíveis
- Modais com largura otimizada

### Mobile
- Layout em coluna única
- Cards empilhados verticalmente
- Modais com largura total
- Botões em coluna

---

## 🚀 Próximas Melhorias

- [ ] Edição de email (com verificação)
- [ ] Upload de avatar com crop/edit
- [ ] Histórico de alterações do perfil
- [ ] Notificações de segurança (login suspeito)
- [ ] Backup de dados do perfil
- [ ] Exportação de dados pessoais (LGPD)
- [ ] Configurações de privacidade avançadas
- [ ] Integração com redes sociais
- [ ] Assinatura digital para documentos
- [ ] Preferências de notificação por empresa
- [ ] Temas personalizados por empresa
- [ ] Atalhos e preferências de navegação

---

## 📝 Notas Técnicas

### Cache de Usuário

- Dados do usuário são armazenados em `authStorage`
- Após atualizações, cache é atualizado via `refreshUser()`
- Evento `user-data-updated` é disparado após atualizações
- Componentes escutam eventos para atualizar UI

### Formatação de Dados

- **Telefone**: Formatação visual via `formatPhoneDisplay()`
- **Data**: Formatação pt-BR via `toLocaleDateString()`
- **Avatar**: URLs com timestamp para evitar cache

### Segurança

- Senhas nunca são armazenadas no frontend
- Validação de senha atual sempre no backend
- Sessões são encerradas após alteração de senha
- Upload de avatar com validações rigorosas
- CSRF protection via tokens JWT

### Performance

- Lazy loading de modais
- Cache de dados do usuário
- Debounce em buscas (futuro)
- Otimização de imagens (backend)

---

**Última atualização:** Janeiro 2025


