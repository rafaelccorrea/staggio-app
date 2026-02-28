# 🏠 Documentação - Página de Propriedades

Documentação completa da página de propriedades, incluindo CRUD completo, listagem, filtros, e todos os componentes relacionados.

---

## 📋 Índice
1. [Visão Geral](#-visão-geral)
2. [Listagem de Propriedades](#-listagem-de-propriedades)
3. [Criação de Propriedade](#-criação-de-propriedade)
4. [Edição de Propriedade](#-edição-de-propriedade)
5. [Detalhes da Propriedade](#-detalhes-da-propriedade)
6. [Exclusão de Propriedade](#-exclusão-de-propriedade)
7. [Filtros e Busca](#-filtros-e-busca)
8. [Tipos e Status](#-tipos-e-status)
9. [Estrutura de Dados](#-estrutura-de-dados)
10. [Endpoints da API](#-endpoints-da-api) (26 endpoints)
11. [Fluxos Principais](#-fluxos-principais)
12. [Componentes Relacionados](#-componentes-relacionados)
13. [Tratamento de Erros](#-tratamento-de-erros)
14. [Validações Completas](#-validações-completas)
15. [Chaves Vinculadas à Propriedade](#-chaves-vinculadas-à-propriedade)
16. [Clientes Vinculados à Propriedade](#-clientes-vinculados-à-propriedade)
17. [Despesas do Imóvel](#-despesas-do-imóvel)
18. [Checklists Vinculados à Propriedade](#-checklists-vinculados-à-propriedade)
19. [Documentos Vinculados à Propriedade](#-documentos-vinculados-à-propriedade)
20. [APIs Relacionadas à Propriedade (Usadas na Página de Detalhes)](#-apis-relacionadas-à-propriedade-usadas-na-página-de-detalhes)
21. [Publicação no Site Intellisys](#-publicação-no-site-intellisys)
22. [Exportação e Importação](#-exportação-e-importação)
23. [APIs de Galeria (Imagens)](#️-apis-de-galeria-imagens)
24. [Sistema de Ofertas (Negociação)](#-sistema-de-ofertas-negociação)
25. [Geração de Descrições com IA](#-geração-de-descrições-com-ia)
26. [Otimização de Portfólio com IA](#-otimização-de-portfólio-com-ia)
27. [Análise Preditiva de Vendas (IA)](#-análise-preditiva-de-vendas-ia)
28. [Próximas Melhorias](#-próximas-melhorias)

---

## 🎯 Visão Geral

A página de propriedades é o centro de gerenciamento de imóveis no sistema. Permite visualizar, criar, editar e excluir propriedades, além de oferecer recursos avançados de busca, filtros e gestão.

### Funcionalidades Principais
- ✅ Listagem paginada de propriedades
- ✅ Criação de novas propriedades (formulário multi-etapas)
- ✅ Edição de propriedades existentes
- ✅ Visualização detalhada de propriedades
- ✅ Exclusão de propriedades
- ✅ Filtros avançados
- ✅ Busca inteligente
- ✅ Upload de imagens
- ✅ Gestão de clientes associados
- ✅ Controle de visibilidade (público/privado)
- ✅ Marcar como vendido/alugado
- ✅ Gerenciamento de chaves vinculadas
- ✅ Gestão de despesas do imóvel
- ✅ Checklists de venda/aluguel
- ✅ Documentos vinculados com assinatura digital

### Permissões Necessárias
- `property:view` - Visualizar propriedades
- `property:create` - Criar propriedades
- `property:update` - Editar propriedades
- `property:delete` - Excluir propriedades

---

## 📋 Listagem de Propriedades

### Rota
```
/properties
```

### Componente
`PropertiesPage.tsx`

### Funcionalidades da Listagem

#### 1. Modos de Visualização
- **Cards (Grid)**: Visualização em cards com imagens
- **Lista**: Visualização em tabela/listagem

#### 2. Informações Exibidas nos Cards

Cada card de propriedade exibe:
- **Imagem Principal**: Primeira imagem da galeria ou placeholder
- **Código**: Código da propriedade (se existir)
- **Título**: Título da propriedade
- **Preço**: Preço de venda ou aluguel formatado
- **Localização**: Cidade, bairro
- **Características**:
  - Quartos (bedrooms)
  - Banheiros (bathrooms)
  - Vagas de garagem (parkingSpaces)
  - Área total (totalArea)
- **Status**: Badge com status (Disponível, Vendido, Alugado, etc.)
- **Visibilidade**: Ícone indicando se está público ou privado
- **Ações**: Menu de ações (Editar, Excluir, Ver detalhes)

#### 3. Informações Exibidas na Lista

A visualização em lista exibe:
- **Imagens**: Stack de imagens com contador
- **Título e Código**
- **Tipo**: Badge com tipo de propriedade
- **Localização**: Endereço completo
- **Preço**: Preço formatado
- **Especificações**: Quartos, banheiros, área, vagas
- **Status**: Badge de status
- **Ações**: Menu de ações rápido

#### 4. Barra de Ações

- **Botão Criar**: Cria nova propriedade
- **Busca**: Campo de busca por título, código ou endereço
- **Filtros**: Abre drawer de filtros
- **Busca Inteligente**: Busca avançada com algoritmo de matching
- **Toggle de Visualização**: Alterna entre cards e lista
- **Análise Preditiva**: Análise IA de propriedades

#### 5. Paginação

- Controle de paginação na parte inferior
- Navegação entre páginas
- Indicador de página atual
- Total de páginas

---

## ➕ Criação de Propriedade

### Rota
```
/properties/create
```

### Componente
`CreatePropertyPage.tsx`

### Formulário Multi-Etapas

O formulário de criação está dividido em 6 etapas principais:

#### Etapa 1: Informações Básicas 📝

**Campos Obrigatórios:**
- `title` (string): Título da propriedade
- `type` (PropertyType): Tipo de propriedade
  - `house` - Casa
  - `apartment` - Apartamento
  - `commercial` - Comercial
  - `land` - Terreno
  - `rural` - Rural
- `status` (PropertyStatus): Status inicial
  - `draft` - Rascunho
  - `available` - Disponível
  - `rented` - Alugado
  - `sold` - Vendido
  - `maintenance` - Em Manutenção
- `description` (string): Descrição detalhada

**Campos Opcionais:**
- `code` (string): Código único da propriedade

#### Etapa 2: Localização 📍

**Campos Obrigatórios:**
- `street` (string): Rua
- `number` (string): Número
- `city` (string): Cidade
- `state` (string): Estado (UF)
- `zipCode` (string): CEP (formato: 00000-000)
- `neighborhood` (string): Bairro

**Campos Opcionais:**
- `complement` (string): Complemento do endereço

**Recursos:**
- Busca automática de CEP (via API)
- Sugestão de cidades baseada no estado
- Validação de CEP

#### Etapa 3: Características 🏗️

**Campos Obrigatórios:**
- `totalArea` (number): Área total em m²

**Campos Opcionais:**
- `builtArea` (number): Área construída em m²
- `bedrooms` (number): Número de quartos
- `bathrooms` (number): Número de banheiros
- `parkingSpaces` (number): Vagas de garagem

**Recursos:**
- Validação de áreas (área construída não pode ser maior que área total)
- Campos numéricos formatados

#### Etapa 4: Valores 💰

**Campos Opcionais:**
- `salePrice` (number): Preço de venda
- `rentPrice` (number): Preço de aluguel
- `condominiumFee` (number): Taxa de condomínio
- `iptu` (number): IPTU

**Recursos:**
- Formatação automática em Real (R$)
- Validação de valores mínimos

**Campos de Negociação:**
- `acceptsNegotiation` (boolean): Aceita negociação
- `minSalePrice` (number): Preço mínimo de venda
- `minRentPrice` (number): Preço mínimo de aluguel
- `offerBelowMinSaleAction` (string): Ação para ofertas abaixo do mínimo (reject | pending | notify)
- `offerBelowMinRentAction` (string): Ação para ofertas abaixo do mínimo (reject | pending | notify)

#### Etapa 5: Galeria 📸

**Recursos:**
- Upload múltiplo de imagens
- Preview das imagens
- Reordenamento (drag and drop)
- Definir imagem principal
- Remover imagens
- Categorização de imagens

**Tipos de Imagens:**
- Geral
- Fachada
- Interna
- Externa
- Planta

**Validações:**
- Formatos aceitos: JPG, PNG, WebP
- Tamanho máximo por arquivo: 10MB
- Quantidade máxima: 50 imagens

#### Etapa 6: Clientes e Proprietário 👥

**Campos do Proprietário (Obrigatórios):**
- `ownerName` (string): Nome do proprietário
- `ownerEmail` (string): Email do proprietário
- `ownerPhone` (string): Telefone do proprietário
- `ownerDocument` (string): CPF/CNPJ
- `ownerAddress` (string): Endereço do proprietário

**Clientes Associados:**
- Seletor de clientes existentes
- Associar clientes à propriedade
- Definir tipo de relação (comprador/interessado)

**Outros Campos:**
- `capturedById` (string): ID do captador (obrigatório)
- `responsibleUserId` (string): ID do corretor responsável
- `features` (string[]): Lista de características/comodidades

**Características Disponíveis:**
- Ar condicionado
- Aquecimento
- Elevador
- Portaria 24h
- Segurança 24h
- Piscina
- Academia
- Playground
- Churrasqueira
- Área gourmet
- Jardim
- Terraço
- Varanda
- Sacada
- Vista para o mar
- Vista para a montanha
- Próximo ao metrô
- Próximo a escolas
- Próximo a hospitais
- Próximo a shopping
- Garagem coberta
- Garagem descoberta
- Depósito
- Lavanderia
- Closet
- Home office
- Lareira
- Sistema de alarme
- Câmeras de segurança
- Interfone
- Antena parabólica
- TV a cabo
- Internet
- Gás encanado
- Água quente
- Energia solar
- Mobiliado
- Semi-mobiliado
- Pronto para morar
- Em construção
- Novo
- Usado

### Recursos Adicionais

#### Geração de Descrição com IA
- Botão para gerar descrição automaticamente
- Edição da descrição gerada

#### Validações
- Validação em tempo real
- Mensagens de erro específicas
- Indicadores visuais de campos obrigatórios

#### Indicador de Progresso
- Barra de progresso mostrando etapa atual
- Navegação entre etapas
- Validação antes de avançar

---

## ✏️ Edição de Propriedade

### Rota
```
/properties/edit/:id
```

### Componente
`CreatePropertyPage.tsx` (modo edição)

### Funcionalidades

#### Carregamento de Dados
- Busca dados da propriedade existente
- Preenche formulário com dados atuais
- Carrega imagens da galeria

#### Diferenças em Relação à Criação
- Título da página: "Editar Propriedade"
- Botão de ação: "Atualizar" (ao invés de "Criar")
- Mantém ID da propriedade
- Atualização parcial (apenas campos alterados)

#### Validações
- Mesmas validações da criação
- Validação de campos obrigatórios mantidos

---

## 👁️ Detalhes da Propriedade

### Rota
```
/properties/:propertyId
```

### Componente
`PropertyDetailsPage.tsx`

### Seções da Página de Detalhes

#### 1. Cabeçalho

- **Título e Código**: Nome e código da propriedade
- **Endereço Completo**: Endereço formatado
- **Status**: Badge com status atual
- **Botões de Ação**:
  - Editar propriedade
  - Voltar para lista
  - Toggle público/privado
  - Marcar como vendido/alugado

#### 2. Galeria de Imagens

- Carrossel de imagens
- Visualização em tela cheia
- Navegação entre imagens
- Contador de imagens

#### 3. Características Principais

Grid com informações:
- Tipo de propriedade
- Área total
- Área construída
- Quartos
- Banheiros
- Vagas de garagem
- Preço de venda
- Preço de aluguel
- Taxa de condomínio
- IPTU

#### 4. Descrição

- Texto completo da descrição
- Formatação preservada

#### 5. Localização no Mapa

- Mapa interativo (Google Maps/OpenStreetMap)
- Marcador na localização exata
- Endereço completo

#### 6. Status da Chave 🔑

- Status atual da chave (Disponível, Em uso, Sem chave)
- Botão para gerenciar chaves ou criar nova chave
- Link direto para página de chaves filtrada por propriedade
- Ver seção [Chaves Vinculadas à Propriedade](#-chaves-vinculadas-à-propriedade) para mais detalhes

#### 7. Clientes Vinculados 👥

- Lista completa de clientes vinculados à propriedade
- Tipo de interesse (Interessado, Comprador, Locatário, etc.)
- Informações de contato
- Data de vinculação e notas
- Ações: Adicionar cliente, Remover vínculo, Ver detalhes
- Ver seção [Clientes Vinculados à Propriedade](#-clientes-vinculados-à-propriedade) para mais detalhes

#### 8. Despesas do Imóvel 💰

- Resumo estatístico (Pendentes, Vencidas, Pagas, Valores)
- Lista completa de despesas com filtros
- Tipos: IPTU, Condomínio, Seguro, Manutenção, etc.
- Controle de vencimento e status de pagamento
- Recorrência configurável
- Ver seção [Despesas do Imóvel](#-despesas-do-imóvel) para mais detalhes

#### 9. Checklists 📋

- Lista de checklists de venda/aluguel vinculados
- Progresso de cada checklist (percentual de conclusão)
- Status geral e por item
- Informações do cliente vinculado
- Templates pré-definidos
- Ver seção [Checklists Vinculados à Propriedade](#-checklists-vinculados-à-propriedade) para mais detalhes

#### 10. Documentos 📄

- Lista completa de documentos vinculados à propriedade
- Upload de novos documentos
- Organização por tipo, tags e status
- Controle de vencimento
- Assinatura digital
- Download e visualização
- Ver seção [Documentos Vinculados à Propriedade](#-documentos-vinculados-à-propriedade) para mais detalhes

#### 11. Matches (se disponível)

- Clientes compatíveis
- Score de compatibilidade
- Razões do match

#### 12. Ofertas (se disponível)

- Ofertas recebidas
- Status das ofertas
- Ações (aceitar, rejeitar)

---

## 🗑️ Exclusão de Propriedade

### Funcionalidade

#### Modal de Confirmação
- Confirmação antes de excluir
- Exibição do título da propriedade
- Aviso sobre ação irreversível

#### Processo de Exclusão
1. Usuário clica em "Excluir"
2. Modal de confirmação é exibido
3. Usuário confirma exclusão
4. Requisição DELETE é enviada
5. Propriedade é removida
6. Lista é atualizada
7. Mensagem de sucesso é exibida

#### Permissão
- Requer permissão `property:delete`

---

## 🔍 Filtros e Busca

### Filtros Disponíveis

#### Filtros Básicos
- **Tipo**: Filtrar por tipo de propriedade
- **Status**: Filtrar por status
- **Cidade**: Filtrar por cidade
- **Estado**: Filtrar por estado
- **Bairro**: Filtrar por bairro

#### Filtros de Valores
- **Preço Mínimo**: Valor mínimo
- **Preço Máximo**: Valor máximo

#### Filtros de Características
- **Área Mínima**: Área mínima em m²
- **Área Máxima**: Área máxima em m²
- **Quartos**: Número mínimo de quartos
- **Banheiros**: Número mínimo de banheiros
- **Vagas**: Número mínimo de vagas

#### Filtros de Visibilidade
- **Apenas Ativas**: Mostrar apenas propriedades ativas
- **Apenas Destaques**: Mostrar apenas propriedades em destaque
- **Apenas Minhas**: Mostrar apenas minhas propriedades

#### Filtros Avançados
- **Características**: Filtrar por características/comodidades
- **Corretor Responsável**: Filtrar por corretor
- **Imobiliária**: Filtrar por imobiliária

### Busca Simples

- Campo de busca textual
- Busca em: título, código, endereço
- Busca em tempo real
- Highlight dos termos encontrados

### Busca Inteligente

Busca avançada com algoritmo de matching que considera:
- Perfil do cliente (se fornecido)
- Preferências de busca
- Score de compatibilidade
- Localização
- Características
- Valores

---

## 📊 Tipos e Status

### Tipos de Propriedade (PropertyType)

| Valor | Label | Descrição |
|-------|-------|-----------|
| `house` | Casa | Casa residencial |
| `apartment` | Apartamento | Apartamento |
| `commercial` | Comercial | Imóvel comercial |
| `land` | Terreno | Terreno |
| `rural` | Rural | Propriedade rural |

### Status de Propriedade (PropertyStatus)

| Valor | Label | Descrição |
|-------|-------|-----------|
| `draft` | Rascunho | Propriedade em rascunho (não publicada) |
| `available` | Disponível | Disponível para venda/aluguel |
| `rented` | Alugado | Propriedade alugada |
| `sold` | Vendido | Propriedade vendida |
| `maintenance` | Manutenção | Em manutenção (temporariamente indisponível) |

---

## 📦 Estrutura de Dados

### Interface Property

```typescript
interface Property {
  id: string;                    // ID único
  code?: string;                 // Código da propriedade
  title: string;                 // Título
  description: string;           // Descrição
  type: PropertyType;            // Tipo
  status: PropertyStatus;        // Status
  address: string;               // Endereço completo
  street: string;                // Rua
  number: string;                // Número
  complement?: string;           // Complemento
  city: string;                  // Cidade
  state: string;                 // Estado (UF)
  zipCode: string;               // CEP
  neighborhood: string;          // Bairro
  totalArea: number;             // Área total (m²)
  builtArea?: number;            // Área construída (m²)
  bedrooms?: number;             // Quartos
  bathrooms?: number;            // Banheiros
  parkingSpaces?: number;        // Vagas de garagem
  salePrice?: number;            // Preço de venda
  rentPrice?: number;            // Preço de aluguel
  condominiumFee?: number;       // Taxa de condomínio
  iptu?: number;                 // IPTU
  features: string[];            // Características/comodidades
  isActive: boolean;             // Ativa
  isFeatured: boolean;           // Em destaque
  isAvailableForSite?: boolean;  // Disponível no site público
  companyId: string;             // ID da empresa
  responsibleUserId: string;     // ID do corretor responsável
  capturedById?: string;         // ID do captador
  capturedBy?: {                 // Dados do captador
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  createdAt: string;             // Data de criação
  updatedAt: string;             // Data de atualização
  imageCount?: number;           // Número de imagens
  images?: Array<{               // Imagens
    id: string;
    url: string;
    thumbnailUrl?: string;
    category: string;
    isMain: boolean;
    createdAt: string;
  }>;
  mainImage?: {                  // Imagem principal
    id: string;
    url: string;
    thumbnailUrl?: string;
  };
  clients?: Array<{              // Clientes associados
    id: string;
    name: string;
    email: string;
    phone: string;
    type: string;
    status: string;
    interestType: string;
    notes?: string;
    contactedAt?: string;
    createdAt: string;
    responsibleUserName: string;
  }>;
  clientCount?: number;          // Número de clientes
  owner?: {                      // Proprietário
    name?: string;
    email?: string;
    phone?: string;
    document?: string;
    address?: string;
  };
  // Campos MCMV (se disponível)
  mcmvEligible?: boolean;
  mcmvIncomeRange?: 'faixa1' | 'faixa2' | 'faixa3' | null;
  mcmvMaxValue?: number | null;
  mcmvSubsidy?: number | null;
  mcmvDocumentation?: string[];
  mcmvNotes?: string | null;
  // Campos de negociação
  acceptsNegotiation?: boolean;
  minSalePrice?: number;
  minRentPrice?: number;
  offerBelowMinSaleAction?: 'reject' | 'pending' | 'notify';
  offerBelowMinRentAction?: 'reject' | 'pending' | 'notify';
  // Informações de ofertas
  totalOffersCount?: number;
  pendingOffersCount?: number;
  acceptedOffersCount?: number;
  rejectedOffersCount?: number;
  hasPendingOffers?: boolean;
}
```

### Interface CreatePropertyData

```typescript
interface CreatePropertyData {
  title: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;
  address: string;
  street: string;
  number: string;
  complement?: string;
  city: string;
  state: string;
  zipCode: string;
  neighborhood: string;
  totalArea: number;
  builtArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  salePrice?: number;
  rentPrice?: number;
  condominiumFee?: number;
  iptu?: number;
  features?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  isAvailableForSite?: boolean;
  capturedById: string;          // Obrigatório
  responsibleUserId?: string;
  // Proprietário (obrigatórios na criação)
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerDocument: string;
  ownerAddress: string;
  // Campos MCMV
  mcmvEligible?: boolean;
  mcmvIncomeRange?: 'faixa1' | 'faixa2' | 'faixa3' | null;
  mcmvMaxValue?: number | null;
  mcmvSubsidy?: number | null;
  mcmvDocumentation?: string[];
  mcmvNotes?: string | null;
  // Campos de negociação
  acceptsNegotiation?: boolean;
  minSalePrice?: number;
  minRentPrice?: number;
  offerBelowMinSaleAction?: 'reject' | 'pending' | 'notify';
  offerBelowMinRentAction?: 'reject' | 'pending' | 'notify';
}
```

### Interface PropertyFilters

```typescript
interface PropertyFilters {
  type?: PropertyType;
  status?: PropertyStatus;
  city?: string;
  state?: string;
  neighborhood?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  features?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  companyId?: string;
  responsibleUserId?: string;
  search?: string;
  onlyMyData?: boolean;
  companyName?: string;
  responsibleUserName?: string;
}
```

---

## 🌐 Endpoints da API

### 1. Listar Propriedades

**Endpoint:**
```
GET /properties
```

**Query Parameters:**
- `page` (number): Página (padrão: 1)
- `limit` (number): Itens por página (padrão: 50)
- `type` (string): Tipo de propriedade
- `status` (string): Status
- `city` (string): Cidade
- `state` (string): Estado
- `neighborhood` (string): Bairro
- `minPrice` (number): Preço mínimo
- `maxPrice` (number): Preço máximo
- `minArea` (number): Área mínima
- `maxArea` (number): Área máxima
- `bedrooms` (number): Quartos
- `bathrooms` (number): Banheiros
- `parkingSpaces` (number): Vagas
- `features` (string[]): Características
- `isActive` (boolean): Apenas ativas
- `isFeatured` (boolean): Apenas destaques
- `onlyMyData` (boolean): Apenas minhas
- `search` (string): Busca textual

**Resposta:**
```typescript
{
  data: Property[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

### 2. Buscar Propriedade por ID

**Endpoint:**
```
GET /properties/:id
```

**Resposta:**
```typescript
Property
```

### 3. Criar Propriedade

**Endpoint:**
```
POST /properties
```

**Body:**
```typescript
CreatePropertyData
```

**Resposta:**
```typescript
Property
```

### 4. Criar Propriedade com Imagens

**Endpoint:**
```
POST /properties/with-images
Content-Type: multipart/form-data
```

**Body (FormData):**
- Dados da propriedade (JSON stringificado ou campos individuais)
- `images`: Array de arquivos de imagem

**Resposta:**
```typescript
Property
```

### 5. Atualizar Propriedade

**Endpoint:**
```
PATCH /properties/:id
```

**Body:**
```typescript
UpdatePropertyData (Partial<CreatePropertyData>)
```

**Resposta:**
```typescript
Property
```

### 6. Excluir Propriedade

**Endpoint:**
```
DELETE /properties/:id
```

**Resposta:**
```
204 No Content
```

### 7. Ativar Propriedade

**Endpoint:**
```
PATCH /properties/:id/activate
```

**Resposta:**
```typescript
Property
```

### 8. Desativar Propriedade

**Endpoint:**
```
PATCH /properties/:id/deactivate
```

**Resposta:**
```typescript
Property
```

### 9. Marcar como Vendido

**Endpoint:**
```
PATCH /properties/:id/mark-as-sold
```

**Body:**
```typescript
{
  notes?: string;
}
```

**Resposta:**
```typescript
Property
```

### 10. Marcar como Alugado

**Endpoint:**
```
PATCH /properties/:id/mark-as-rented
```

**Body:**
```typescript
{
  notes?: string;
}
```

**Resposta:**
```typescript
Property
```

### 11. Busca Inteligente

**Endpoint:**
```
GET /properties/search/intelligent
```

**Query Parameters:**
```typescript
IntelligentSearchFilters {
  clientId?: string;
  type?: PropertyType;
  operation?: 'rent' | 'sale';
  city?: string;
  state?: string;
  neighborhood?: string;
  minValue?: number;
  maxValue?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  minParkingSpaces?: number;
  minArea?: number;
  maxArea?: number;
  features?: string[];
  onlyMyProperties?: boolean;
  searchInGroupCompanies?: boolean;
  includeOtherBrokers?: boolean;
  page?: number;
  limit?: number;
}
```

**Resposta:**
```typescript
{
  results: Array<{
    property: Property;
    matchScore: number;
    matchReasons: string[];
    responsibleBroker: {
      id: string;
      name: string;
      email: string;
    };
    company: {
      id: string;
      name: string;
    };
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  searchStats: {
    totalFound: number;
    fromMyProperties: number;
    fromOtherBrokers: number;
    fromGroupCompanies: number;
  };
}
```

### 12. Estatísticas de Propriedades

**Endpoint:**
```
GET /properties/stats
```

**Resposta:**
```typescript
{
  total: number;
  available: number;
  rented: number;
  sold: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}
```

### 13. Buscar Propriedades por Empresa

**Endpoint:**
```
GET /properties/company/:companyId
```

**Query Parameters:**
- `page`: `number` (padrão: 1)
- `limit`: `number` (padrão: 50)

**Resposta:**
```typescript
PropertyResponse
```

### 14. Buscar Propriedades por Usuário Responsável

**Endpoint:**
```
GET /properties/user/:userId
```

**Query Parameters:**
- `page`: `number` (padrão: 1)
- `limit`: `number` (padrão: 50)

**Resposta:**
```typescript
PropertyResponse
```

### 15. Buscar Propriedades Destacadas

**Endpoint:**
```
GET /properties/featured
```

**Query Parameters:**
- `page`: `number` (padrão: 1)
- `limit`: `number` (padrão: 50)

**Resposta:**
```typescript
PropertyResponse
```

### 16. Buscar Propriedades por Localização

**Endpoint:**
```
GET /properties/location/:state/:city
```

**Query Parameters:**
- `page`: `number` (padrão: 1)
- `limit`: `number` (padrão: 50)

**Resposta:**
```typescript
PropertyResponse
```

### 17. Exportar Propriedades

**Endpoint:**
```
POST /properties/export?format={format}
```

**Query Parameters:**
- `format`: `'csv' | 'xlsx'` (padrão: 'xlsx')
- `type`: `string` (opcional) - Filtrar por tipo
- `status`: `string` (opcional) - Filtrar por status

**Resposta:**
```
Blob (arquivo Excel ou CSV)
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet (xlsx)
Content-Type: text/csv (csv)
```

**Exemplo de Uso:**
```typescript
const blob = await propertyApi.exportProperties('xlsx', { type: 'apartment' });
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = 'propriedades.xlsx';
link.click();
URL.revokeObjectURL(url);
```

### 18. Importar Propriedades

**Endpoint:**
```
POST /properties/import
Content-Type: multipart/form-data
```

**Body (FormData):**
```
file: File (arquivo Excel ou CSV)
format: string (opcional)
```

**Resposta:**
```typescript
{
  total: number;              // Total de propriedades no arquivo
  success: number;            // Propriedades importadas com sucesso
  failed: number;             // Propriedades que falharam
  properties: Property[];     // Propriedades importadas
  errors: Array<{
    row: number;              // Número da linha no arquivo
    property: string;         // Identificação da propriedade (título/código)
    errors: string[];         // Lista de erros de validação
  }>;
  hasErrorFile?: boolean;     // Se foi gerado arquivo de erros
  errorSpreadsheetBase64?: string;  // Base64 do arquivo de erros (se houver)
}
```

**Exemplo de Uso:**
```typescript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const result = await propertyApi.importProperties(fileInput.files[0]);
console.log(`Importadas ${result.success} de ${result.total} propriedades`);

if (result.errors.length > 0) {
  // Tratar erros
  result.errors.forEach(error => {
    console.error(`Linha ${error.row}: ${error.errors.join(', ')}`);
  });
}
```

### 19. Atualizar Publicação no Site

**Endpoint:**
```
PATCH /properties/:id
```

**Body:**
```typescript
{
  isAvailableForSite: boolean;
  // ... outros campos opcionais
}
```

**Validações no Backend:**
- Propriedade deve estar ativa (`isActive === true`)
- Status deve ser `'available'`
- Deve ter pelo menos 5 imagens válidas
- Plano deve permitir publicação (se aplicável)
- Limite de propriedades públicas não excedido (se aplicável)

**Resposta de Erro (403 Forbidden):**
```json
{
  "message": "Seu plano não permite disponibilizar propriedades no site Intellisys.",
  "statusCode": 403
}
```

ou

```json
{
  "message": "Limite de propriedades no site Intellisys atingido.",
  "statusCode": 403
}
```

**Resposta de Sucesso:**
```typescript
Property  // Propriedade atualizada
```

---

## 🔑 APIs Relacionadas à Propriedade (Usadas na Página de Detalhes)

As seguintes APIs são utilizadas na página de detalhes da propriedade (`/properties/:propertyId`) para exibir e gerenciar informações relacionadas:

### 📋 APIs de Checklist

Checklists vinculados à propriedade são exibidos na seção de Checklists da página de detalhes.

#### Listar Checklists de uma Propriedade

**Endpoint:**
```
GET /api/sale-checklists?propertyId={propertyId}
```

**Query Parameters:**
- `propertyId` (string, obrigatório): ID da propriedade
- `type` (string, opcional): Filtrar por tipo (`'sale'` ou `'rental'`)
- `status` (string, opcional): Filtrar por status (`'pending'`, `'in_progress'`, `'completed'`, `'skipped'`)
- `page` (number, opcional): Número da página (padrão: 1)
- `limit` (number, opcional): Itens por página (padrão: 20)

**Resposta (200 OK):**
```typescript
Array<{
  id: string;
  propertyId: string;
  clientId: string;
  type: 'sale' | 'rental';
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  items: ChecklistItem[];
  statistics: {
    totalItems: number;
    completedItems: number;
    completionPercentage: number;
  };
  property?: {
    id: string;
    title: string;
  };
  client?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}>
```

**Uso na Página de Detalhes:**
- Componente: `ChecklistSection`
- Hook: `useChecklists()` com filtro `propertyId`
- Exibição: Lista de checklists vinculados à propriedade com progresso e ações

**Documentação Completa:** Ver `docs/CHECKLIST_API.md`

---

### 🔑 APIs de Controle de Chaves

O status das chaves da propriedade é exibido no painel lateral (`PropertyInfoPanel`) e permite gerenciar chaves vinculadas.

#### Listar Chaves de uma Propriedade

**Endpoint:**
```
GET /keys?propertyId={propertyId}
```

**Query Parameters:**
- `propertyId` (string, obrigatório): ID da propriedade
- `status` (string, opcional): Filtrar por status (`'available'`, `'in_use'`, `'lost'`, `'damaged'`, `'maintenance'`)

**Resposta (200 OK):**
```typescript
Array<{
  id: string;
  name: string;
  description?: string;
  type: 'main' | 'backup' | 'emergency' | 'garage' | 'mailbox' | 'other';
  status: 'available' | 'in_use' | 'lost' | 'damaged' | 'maintenance';
  location?: string;
  notes?: string;
  isActive: boolean;
  propertyId: string;
  createdAt: string;
  updatedAt: string;
}>
```

**Uso na Página de Detalhes:**
- Componente: `PropertyInfoPanel` (seção "Status da Chave")
- API: `keyApi.getKeysByProperty(propertyId)`
- Exibição: Status disponível/indisponível e botões de ação (Gerenciar Chaves / Criar Chave)

#### Criar Chave para Propriedade

**Endpoint:**
```
POST /keys
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Chave Principal",
  "propertyId": "uuid-da-propriedade",
  "type": "main",
  "status": "available",
  "location": "Escritório",
  "description": "Chave da porta principal"
}
```

**Permissões Necessárias:**
- `key:create` - Criar chaves
- `property:view` - Para vincular chave a propriedade (dependência contextual)

**Uso na Página de Detalhes:**
- Botão "Criar Chave" redireciona para `/keys/create?propertyId={propertyId}`
- Permite criar chave diretamente vinculada à propriedade

**Documentação Completa:** Ver `docs/KEYS_PAGE.md`

---

### 💰 APIs de Despesas do Imóvel

A seção de despesas exibe um resumo estatístico e lista completa de despesas vinculadas à propriedade.

#### Listar Despesas de uma Propriedade

**Endpoint:**
```
GET /properties/{propertyId}/expenses
```

**Query Parameters:**
- `status` (string, opcional): Filtrar por status (`'pending'`, `'paid'`, `'overdue'`, `'cancelled'`)
- `type` (string, opcional): Filtrar por tipo (`'iptu'`, `'condominium'`, `'insurance'`, `'maintenance'`, `'utilities'`, `'other'`)
- `startDate` (string, opcional): Data inicial (ISO 8601)
- `endDate` (string, opcional): Data final (ISO 8601)
- `page` (number, opcional): Número da página (padrão: 1)
- `limit` (number, opcional): Itens por página (padrão: 20)

**Resposta (200 OK):**
```typescript
{
  data: Array<{
    id: string;
    title: string;
    description?: string;
    type: 'iptu' | 'condominium' | 'insurance' | 'maintenance' | 'utilities' | 'other';
    amount: number;
    dueDate: string;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled';
    paidDate?: string;
    isRecurring: boolean;
    recurrenceConfig?: {
      frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
      interval: number;
    };
    propertyId: string;
    createdAt: string;
    updatedAt: string;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

#### Obter Resumo de Despesas

**Endpoint:**
```
GET /properties/{propertyId}/expenses/summary
```

**Resposta (200 OK):**
```typescript
{
  totalPending: number;        // Total de despesas pendentes
  totalOverdue: number;        // Total de despesas vencidas
  totalPaid: number;           // Total de despesas pagas
  totalAmount: number;         // Valor total de todas as despesas
  pendingAmount: number;       // Valor total pendente
  overdueAmount: number;       // Valor total vencido
  paidAmount: number;          // Valor total pago
  byType: {                    // Agrupado por tipo
    [key: string]: {
      count: number;
      amount: number;
    };
  };
}
```

#### Criar Despesa

**Endpoint:**
```
POST /properties/{propertyId}/expenses
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "IPTU 2024",
  "description": "Imposto Predial e Territorial Urbano",
  "type": "iptu",
  "amount": 1500.00,
  "dueDate": "2024-03-31T00:00:00Z",
  "isRecurring": true,
  "recurrenceConfig": {
    "frequency": "yearly",
    "interval": 1
  },
  "enableNotification": true,
  "notificationAdvanceDays": 7,
  "createFinancialPending": true
}
```

#### Atualizar Despesa

**Endpoint:**
```
PUT /properties/{propertyId}/expenses/{expenseId}
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "IPTU 2024 Atualizado",
  "amount": 1600.00,
  "status": "paid",
  "paidDate": "2024-03-15T00:00:00Z"
}
```

#### Marcar Despesa como Paga

**Endpoint:**
```
PUT /properties/{propertyId}/expenses/{expenseId}/mark-as-paid
Content-Type: application/json
```

**Request Body:**
```json
{
  "paidDate": "2024-03-15T00:00:00Z"  // Opcional, usa data atual se não informado
}
```

#### Excluir Despesa

**Endpoint:**
```
DELETE /properties/{propertyId}/expenses/{expenseId}
```

**Resposta:** `204 No Content`

**Uso na Página de Detalhes:**
- Componente: `PropertyExpensesSection`
- Hook: `usePropertyExpenses(propertyId)`
- Exibição:
  - Resumo estatístico (cards com totais)
  - Lista completa de despesas com filtros
  - Ações: criar, editar, marcar como paga, excluir

**Permissões Necessárias:**
- `property:view` - Visualizar propriedade (necessário para ver despesas)
- `property:update` - Editar propriedade (necessário para criar/editar/excluir despesas)

---

**Nota:** Todas essas APIs requerem autenticação (token JWT no header `Authorization`) e header `X-Company-ID` para identificar a empresa.

---

## 🔄 Fluxos Principais

### Fluxo de Criação

1. Usuário acessa `/properties/create`
2. Preenche formulário multi-etapas
3. Upload de imagens (opcional)
4. Associa clientes (opcional)
5. Define proprietário (obrigatório)
6. Submete formulário
7. Propriedade é criada
8. Redirecionamento para lista ou detalhes

### Fluxo de Edição

1. Usuário acessa `/properties/edit/:id`
2. Dados são carregados
3. Formulário é preenchido com dados existentes
4. Usuário faz alterações
5. Submete alterações
6. Propriedade é atualizada
7. Redirecionamento para detalhes

### Fluxo de Exclusão

1. Usuário clica em "Excluir" na lista ou detalhes
2. Modal de confirmação é exibido
3. Usuário confirma exclusão
4. Requisição DELETE é enviada
5. Propriedade é excluída
6. Lista é atualizada
7. Mensagem de sucesso é exibida

---

## 🎨 Componentes Relacionados

### Componentes Principais
- `PropertiesPage.tsx` - Página de listagem
- `CreatePropertyPage.tsx` - Página de criação/edição
- `PropertyDetailsPage.tsx` - Página de detalhes
- `PropertyForm.tsx` - Formulário de propriedade
- `PropertyFields.tsx` - Campos do formulário
- `PropertyCard.tsx` - Card de propriedade
- `PropertyFiltersDrawer.tsx` - Drawer de filtros
- `IntelligentSearchModal.tsx` - Modal de busca inteligente

### Componentes Auxiliares
- `PropertyImageCarousel.tsx` - Carrossel de imagens
- `PropertyMap.tsx` - Mapa de localização
- `PropertyClientsManager.tsx` - Gestão de clientes vinculados
- `PropertyExpensesSection.tsx` - Seção de despesas do imóvel
- `PropertyPublicToggle.tsx` - Toggle público/privado
- `PropertyActiveToggle.tsx` - Toggle ativo/inativo
- `PropertyInfoPanel.tsx` - Painel lateral com informações e status da chave
- `EntityDocumentsList.tsx` - Lista de documentos vinculados à propriedade
- `ChecklistSection.tsx` - Seção de checklists vinculados

---

## 🐛 Tratamento de Erros

### Erros Comuns

#### 400 Bad Request
- Dados inválidos
- Campos obrigatórios faltando
- Valores fora do range aceito

#### 401 Unauthorized
- Token expirado ou inválido
- Sem permissão para acessar

#### 403 Forbidden
- Sem permissão para realizar ação
- Propriedade não pertence à empresa

#### 404 Not Found
- Propriedade não encontrada
- ID inválido

#### 409 Conflict
- Código já existe
- Duplicação de dados

#### 422 Unprocessable Entity
- Validação falhou
- Dados inválidos para processamento

---

## 📝 Validações Completas

### Schema de Validação (Yup)

Todas as validações são feitas usando Yup schema (`createPropertySchema`). Abaixo está o detalhamento completo:

### Validações de Campos Obrigatórios

#### Informações Básicas

**Título (`title`)**
- **Obrigatório:** ✅ Sim
- **Tipo:** string
- **Mínimo:** 3 caracteres
- **Máximo:** 255 caracteres
- **Mensagem de erro:** "Título deve ter pelo menos 3 caracteres" / "Título deve ter no máximo 255 caracteres"

**Descrição (`description`)**
- **Obrigatório:** ✅ Sim
- **Tipo:** string
- **Mínimo:** 10 caracteres
- **Máximo:** 5000 caracteres
- **Mensagem de erro:** "Descrição deve ter pelo menos 10 caracteres" / "Descrição deve ter no máximo 5000 caracteres"

**Tipo (`type`)**
- **Obrigatório:** ✅ Sim
- **Tipo:** PropertyType
- **Valores aceitos:** `'house' | 'apartment' | 'commercial' | 'land' | 'rural'`
- **Mensagem de erro:** "Tipo de propriedade inválido"

**Status (`status`)**
- **Obrigatório:** ✅ Sim
- **Tipo:** PropertyStatus
- **Valores aceitos:** `'draft' | 'available' | 'rented' | 'sold' | 'maintenance'`
- **Padrão:** `'draft'`
- **Mensagem de erro:** "Status inválido"

**Código (`code`)**
- **Obrigatório:** ❌ Não
- **Tipo:** string
- **Observação:** Opcional, mas se fornecido deve ser único

#### Localização

**Endereço (`address`)**
- **Obrigatório:** ✅ Sim
- **Tipo:** string
- **Mínimo:** 10 caracteres
- **Máximo:** 500 caracteres
- **Mensagem de erro:** "Endereço deve ter pelo menos 10 caracteres" / "Endereço deve ter no máximo 500 caracteres"

**Rua (`street`)**
- **Obrigatório:** ✅ Sim (implícito no código)
- **Tipo:** string

**Número (`number`)**
- **Obrigatório:** ✅ Sim (implícito no código)
- **Tipo:** string

**Complemento (`complement`)**
- **Obrigatório:** ❌ Não
- **Tipo:** string (opcional)

**Cidade (`city`)**
- **Obrigatório:** ✅ Sim
- **Tipo:** string
- **Mínimo:** 2 caracteres
- **Máximo:** 100 caracteres
- **Mensagem de erro:** "Cidade deve ter pelo menos 2 caracteres" / "Cidade deve ter no máximo 100 caracteres"

**Estado (`state`)**
- **Obrigatório:** ✅ Sim
- **Tipo:** string
- **Tamanho exato:** 2 caracteres (UF)
- **Formato:** Apenas letras maiúsculas (A-Z)
- **Regex:** `/^[A-Z]{2}$/`
- **Mensagem de erro:** "Estado deve ter 2 caracteres" / "Estado deve ser uma sigla válida"

**CEP (`zipCode`)**
- **Obrigatório:** ✅ Sim
- **Tipo:** string
- **Formato:** `00000-000` ou `00000000`
- **Regex:** `/^\d{5}-?\d{3}$/`
- **Mensagem de erro:** "CEP deve estar no formato 00000-000"
- **Observação:** Aceita com ou sem hífen

**Bairro (`neighborhood`)**
- **Obrigatório:** ✅ Sim
- **Tipo:** string
- **Mínimo:** 2 caracteres
- **Máximo:** 100 caracteres
- **Mensagem de erro:** "Bairro deve ter pelo menos 2 caracteres" / "Bairro deve ter no máximo 100 caracteres"

#### Características

**Área Total (`totalArea`)**
- **Obrigatório:** ✅ Sim
- **Tipo:** number
- **Valor mínimo:** > 0 (deve ser positivo)
- **Valor máximo:** 999999.99 m² (menor que 1.000.000 m²)
- **Mensagem de erro:** "Área total deve ser positiva" / "Área total deve ser menor que 1.000.000 m²"

**Área Construída (`builtArea`)**
- **Obrigatório:** ❌ Não
- **Tipo:** number (nullable/optional)
- **Valor mínimo:** > 0 (se fornecido, deve ser positivo)
- **Valor máximo:** 999999.99 m² (se fornecido)
- **Validação adicional:** Não pode ser maior que área total (validação no frontend)
- **Mensagem de erro:** "Área construída deve ser positiva" / "Área construída deve ser menor que 1.000.000 m²"

**Quartos (`bedrooms`)**
- **Obrigatório:** ❌ Não
- **Tipo:** number (integer, nullable/optional)
- **Valor mínimo:** 0
- **Valor máximo:** 50
- **Mensagem de erro:** "Número de quartos deve ser inteiro" / "Número de quartos não pode ser negativo" / "Número de quartos deve ser menor que 50"

**Banheiros (`bathrooms`)**
- **Obrigatório:** ❌ Não
- **Tipo:** number (integer, nullable/optional)
- **Valor mínimo:** 0
- **Valor máximo:** 20
- **Mensagem de erro:** "Número de banheiros deve ser inteiro" / "Número de banheiros não pode ser negativo" / "Número de banheiros deve ser menor que 20"

**Vagas de Garagem (`parkingSpaces`)**
- **Obrigatório:** ❌ Não
- **Tipo:** number (integer, nullable/optional)
- **Valor mínimo:** 0
- **Valor máximo:** 20
- **Mensagem de erro:** "Número de vagas deve ser inteiro" / "Número de vagas não pode ser negativo" / "Número de vagas deve ser menor que 20"

#### Valores

**Preço de Venda (`salePrice`)**
- **Obrigatório:** ❌ Não (mas recomendado ter pelo menos um: venda ou aluguel)
- **Tipo:** number (nullable/optional)
- **Valor mínimo:** > 0 (deve ser positivo se fornecido)
- **Valor máximo:** 999999999.99 (menor que R$ 1 bilhão)
- **Mensagem de erro:** "Preço de venda deve ser positivo" / "Preço de venda deve ser menor que R$ 1 bilhão"

**Preço de Aluguel (`rentPrice`)**
- **Obrigatório:** ❌ Não (mas recomendado ter pelo menos um: venda ou aluguel)
- **Tipo:** number (nullable/optional)
- **Valor mínimo:** > 0 (deve ser positivo se fornecido)
- **Valor máximo:** 999999.99 (menor que R$ 1 milhão)
- **Mensagem de erro:** "Preço de aluguel deve ser positivo" / "Preço de aluguel deve ser menor que R$ 1 milhão"

**Taxa de Condomínio (`condominiumFee`)**
- **Obrigatório:** ❌ Não
- **Tipo:** number (nullable/optional)
- **Valor mínimo:** > 0 (deve ser positivo se fornecido)
- **Valor máximo:** 99999.99 (menor que R$ 100 mil)
- **Mensagem de erro:** "Valor do condomínio deve ser positivo" / "Valor do condomínio deve ser menor que R$ 100 mil"

**IPTU (`iptu`)**
- **Obrigatório:** ❌ Não
- **Tipo:** number (nullable/optional)
- **Valor mínimo:** > 0 (deve ser positivo se fornecido)
- **Valor máximo:** 99999.99 (menor que R$ 100 mil)
- **Mensagem de erro:** "IPTU deve ser positivo" / "IPTU deve ser menor que R$ 100 mil"

#### Configurações

**Características/Comodidades (`features`)**
- **Obrigatório:** ❌ Não
- **Tipo:** string[] (array de strings)
- **Padrão:** `[]` (array vazio)
- **Validação:** Array de strings válidas

**Ativa (`isActive`)**
- **Obrigatório:** ❌ Não
- **Tipo:** boolean
- **Padrão:** `true`

**Destaque (`isFeatured`)**
- **Obrigatório:** ❌ Não
- **Tipo:** boolean
- **Padrão:** `false`

**Disponível no Site (`isAvailableForSite`)**
- **Obrigatório:** ❌ Não
- **Tipo:** boolean
- **Padrão:** `false`
- **Observação:** Requer validações adicionais para ativar (ver seção de Publicação)

**Captador (`capturedById`)**
- **Obrigatório:** ✅ Sim
- **Tipo:** string (UUID)
- **Observação:** ID do usuário captador da propriedade

**Corretor Responsável (`responsibleUserId`)**
- **Obrigatório:** ❌ Não
- **Tipo:** string (UUID, optional)

#### Proprietário (Obrigatórios na Criação)

**Nome do Proprietário (`ownerName`)**
- **Obrigatório:** ✅ Sim
- **Tipo:** string
- **Mínimo:** 3 caracteres
- **Máximo:** 255 caracteres
- **Mensagem de erro:** "Nome do proprietário deve ter pelo menos 3 caracteres" / "Nome do proprietário deve ter no máximo 255 caracteres"

**Email do Proprietário (`ownerEmail`)**
- **Obrigatório:** ✅ Sim
- **Tipo:** string
- **Formato:** Email válido
- **Máximo:** 255 caracteres
- **Mensagem de erro:** "Email do proprietário deve ter um formato válido" / "Email do proprietário deve ter no máximo 255 caracteres"

**Telefone do Proprietário (`ownerPhone`)**
- **Obrigatório:** ✅ Sim
- **Tipo:** string
- **Mínimo:** 10 caracteres
- **Máximo:** 20 caracteres
- **Mensagem de erro:** "Telefone do proprietário deve ter pelo menos 10 caracteres" / "Telefone do proprietário deve ter no máximo 20 caracteres"

**CPF/CNPJ do Proprietário (`ownerDocument`)**
- **Obrigatório:** ✅ Sim
- **Tipo:** string
- **Mínimo:** 11 caracteres
- **Máximo:** 18 caracteres
- **Mensagem de erro:** "CPF/CNPJ do proprietário deve ter pelo menos 11 caracteres" / "CPF/CNPJ do proprietário deve ter no máximo 18 caracteres"

**Endereço do Proprietário (`ownerAddress`)**
- **Obrigatório:** ✅ Sim
- **Tipo:** string
- **Mínimo:** 10 caracteres
- **Mensagem de erro:** "Endereço do proprietário deve ter pelo menos 10 caracteres"

#### Negociação e Ofertas

**Aceita Negociação (`acceptsNegotiation`)**
- **Obrigatório:** ❌ Não
- **Tipo:** boolean
- **Padrão:** `false`
- **Observação:** Define se a propriedade aceita ofertas/negociação

**Valor Mínimo de Venda (`minSalePrice`)**
- **Obrigatório:** ❌ Não (mas recomendado se `acceptsNegotiation = true`)
- **Tipo:** number (opcional)
- **Valor mínimo:** > 0 (deve ser positivo se fornecido)
- **Validação adicional:** Deve ser menor que `salePrice` (validado no frontend)
- **Observação:** Valor mínimo aceito para ofertas de venda

**Valor Mínimo de Aluguel (`minRentPrice`)**
- **Obrigatório:** ❌ Não (mas recomendado se `acceptsNegotiation = true`)
- **Tipo:** number (opcional)
- **Valor mínimo:** > 0 (deve ser positivo se fornecido)
- **Validação adicional:** Deve ser menor que `rentPrice` (validado no frontend)
- **Observação:** Valor mínimo aceito para ofertas de aluguel

**Ação para Ofertas Abaixo do Mínimo - Venda (`offerBelowMinSaleAction`)**
- **Obrigatório:** ❌ Não
- **Tipo:** `'reject' | 'pending' | 'notify'`
- **Padrão:** `'reject'`
- **Observação:** Define comportamento quando oferta de venda está abaixo do mínimo

**Ação para Ofertas Abaixo do Mínimo - Aluguel (`offerBelowMinRentAction`)**
- **Obrigatório:** ❌ Não
- **Tipo:** `'reject' | 'pending' | 'notify'`
- **Padrão:** `'reject'`
- **Observação:** Define comportamento quando oferta de aluguel está abaixo do mínimo

### Validações de Regras de Negócio

#### Validações Adicionais no Frontend

1. **Área Construída vs Área Total:**
   - Se `builtArea` fornecida, não pode ser maior que `totalArea`
   - Validação realizada antes do envio

2. **Preço de Venda ou Aluguel:**
   - Recomendado ter pelo menos um: `salePrice` ou `rentPrice`
   - Validação de negócio (não bloqueia, mas avisa)

3. **Campos Opcionais:**
   - Campos numéricos opcionais convertidos para `undefined` se vazios
   - Arrays convertidos para `[]` se não fornecidos

### Validação para Publicação no Site

Para publicar uma propriedade no site (`isAvailableForSite = true`), são necessários:

1. **Propriedade Ativa:**
   - `isActive === true`
   - **Mensagem:** "Apenas propriedades ativas podem ser publicadas no site Intellisys."

2. **Status Disponível:**
   - `status === 'available'`
   - **Mensagem:** "Apenas propriedades com status 'Disponível' podem ser publicadas no site Intellisys."

3. **Mínimo de Imagens:**
   - Pelo menos 5 imagens válidas (com URL não vazia)
   - **Mensagem:** "A propriedade precisa ter no mínimo 5 imagens válidas para ser publicada no site. Atualmente possui X imagem(ns)."

4. **Limites de Plano:**
   - Plano Basic pode ter limite de propriedades públicas
   - Plano Professional permite mais propriedades
   - Plano Custom permite ilimitado
   - **Erro 403:** "Seu plano não permite disponibilizar propriedades no site Intellisys."
   - **Erro 403:** "Limite de propriedades no site Intellisys atingido."

### Schema de Atualização

O schema de atualização (`updatePropertySchema`) é uma versão parcial do schema de criação:
- Todos os campos são opcionais
- Mesmas validações se o campo for fornecido
- Permite atualização parcial da propriedade

---

## 🔑 Chaves Vinculadas à Propriedade

### Visão Geral

O sistema permite gerenciar chaves físicas vinculadas a propriedades, permitindo controle de empréstimo e devolução de chaves para corretores, clientes e outros usuários.

### Funcionalidades

- ✅ Visualizar status da chave da propriedade
- ✅ Criar chaves para propriedades
- ✅ Gerenciar empréstimo e devolução de chaves
- ✅ Histórico de movimentações
- ✅ Indicadores visuais de disponibilidade
- ✅ Integração com página de detalhes da propriedade

### Exibição na Página de Detalhes

Na página de detalhes da propriedade (`PropertyDetailsPage`), há uma seção dedicada ao **Status da Chave** que exibe:

- **Status Disponível**: Exibe "✅ Chave Disponível" quando há chave cadastrada e disponível
- **Status Indisponível**: Exibe "❌ Sem Chave" quando não há chave cadastrada
- **Botão de Ação**: 
  - Se há chave: "🔑 Gerenciar Chaves" - redireciona para `/keys?propertyId={propertyId}`
  - Se não há chave: "Criar Chave" - redireciona para `/keys/create?propertyId={propertyId}`

### Componente PropertyInfoPanel

O componente `PropertyInfoPanel` também exibe o status da chave no sidebar da página de detalhes:

```typescript
<InfoSection>
  <SectionTitle>🔑 Status da Chave</SectionTitle>
  <KeyStatus $hasKey={!!keyStatus}>
    {/* Exibe status e botão de ação */}
  </KeyStatus>
</InfoSection>
```

### Estrutura de Dados da Chave

```typescript
interface Key {
  id: string;
  name: string;
  propertyId: string;
  type: 'main' | 'duplicate' | 'extra';
  status: 'available' | 'checked_out' | 'lost';
  location?: string;
  description?: string;
  notes?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  property?: {
    id: string;
    title: string;
    address: string;
  };
}
```

### API de Chaves

#### Buscar Chaves de uma Propriedade

```http
GET /keys?propertyId={propertyId}
```

**Resposta:** Array de objetos `Key[]`

#### Buscar Status da Chave

```http
GET /keys/status?propertyId={propertyId}
```

**Resposta:**
```typescript
{
  status: 'available' | 'checked_out' | 'no_key';
  keyId?: string;
  key?: Key;
}
```

#### Criar Chave

```http
POST /keys
Content-Type: application/json

{
  "name": "Chave Principal",
  "propertyId": "uuid-da-propriedade",
  "type": "main",
  "status": "available",
  "location": "Escritório",
  "description": "Chave da porta principal"
}
```

### Permissões Necessárias

- **`key:view`** - Visualizar chaves
- **`key:create`** - Criar chaves (requer também `vincular_chave_propriedade`)
- **`key:update`** - Editar chaves
- **`key:delete`** - Excluir chaves
- **`key:checkout`** - Emprestar chave
- **`key:return`** - Devolver chave

### Dependências Contextuais

- **`vincular_chave_propriedade`**: Requer permissão `property:view` para vincular chave a propriedade
- **`alterar_propriedade_chave`**: Requer permissão `property:view` para alterar propriedade da chave

### Fluxo de Uso

1. **Visualizar Status**: Usuário acessa página de detalhes da propriedade e vê o status da chave
2. **Criar Chave** (se não existir): Clica em "Criar Chave" ou navega para `/keys/create?propertyId={id}`
3. **Gerenciar Chaves**: Clica em "Gerenciar Chaves" para acessar página de chaves filtrada por propriedade
4. **Empréstimo/Devolução**: Na página de chaves, pode realizar checkout/return da chave

### Integração

- **Hook**: `useKeys(propertyId)` - Hook para gerenciar chaves de uma propriedade
- **API**: `keyApi.getKeysByProperty(propertyId)` - Busca chaves de uma propriedade
- **Serviço**: `keyService.getAllKeys(propertyId)` - Serviço de chaves

### Documentação Relacionada

Para mais detalhes sobre o sistema completo de chaves, consulte:
- Página de gerenciamento de chaves: `/keys`
- Documentação de API de chaves (se disponível)

---

## 👥 Clientes Vinculados à Propriedade

### Visão Geral

O sistema permite vincular clientes a propriedades para rastrear interesse, relacionar clientes a imóveis específicos e gerenciar o processo de negociação.

### Funcionalidades

- ✅ Visualizar lista de clientes vinculados à propriedade
- ✅ Vincular clientes existentes à propriedade
- ✅ Remover vínculo de clientes
- ✅ Visualizar tipo de interesse (comprador, locatário, etc.)
- ✅ Gerenciar informações de contato
- ✅ Rastrear histórico de interações

### Exibição na Página de Detalhes

Na página de detalhes da propriedade, há uma seção dedicada **Clientes Vinculados** que exibe:

- Lista de clientes vinculados com:
  - Nome e informações de contato
  - Tipo de interesse (Interessado, Comprador, Locatário, etc.)
  - Data de vinculação
  - Notas sobre o interesse
- Botão "Adicionar Cliente" para vincular novos clientes
- Ações para cada cliente (ver detalhes, remover vínculo)

### Componente PropertyClientsManager

**Localização**: `src/components/property/PropertyClientsManager.tsx`

**Props:**
```typescript
interface PropertyClientsManagerProps {
  propertyId: string;
  propertyTitle: string;
  onClientsChange?: (count: number) => void;
}
```

**Funcionalidades:**
- Carrega clientes vinculados automaticamente
- Permite adicionar clientes via seletor
- Permite remover vínculo de clientes
- Exibe informações formatadas

### Estrutura de Dados

#### ClientAssociation (Vínculo Cliente-Propriedade)

```typescript
interface ClientAssociation {
  client: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    type: 'buyer' | 'seller' | 'renter' | 'lessor' | 'investor' | 'general';
    responsibleUser?: {
      id: string;
      name: string;
    };
    responsibleUserId?: string;
  };
  interestType: 'interested' | 'viewing' | 'offer' | 'negotiation' | 'closed';
  notes?: string;
  contactedAt?: string;
  createdAt: string;
}
```

### API de Vínculo Cliente-Propriedade

#### Listar Clientes de uma Propriedade

```http
GET /properties/{propertyId}
```

**Resposta:** Propriedade completa inclui array `clients`:

```typescript
{
  id: string;
  // ... outros campos da propriedade
  clients: Array<{
    id: string;
    name: string;
    email?: string;
    phone?: string;
    type: string;
    interestType: string;
    notes?: string;
    contactedAt?: string;
    createdAt: string;
    responsibleUserId?: string;
    responsibleUserName?: string;
  }>;
}
```

#### Vincular Cliente à Propriedade

```http
POST /clients/{clientId}/properties/{propertyId}
Content-Type: application/json

{
  "interestType": "interested",
  "notes": "Cliente interessado na compra"
}
```

**Resposta:** Status 201 (Created)

#### Remover Vínculo Cliente-Propriedade

```http
DELETE /clients/{clientId}/properties/{propertyId}
```

**Resposta:** Status 204 (No Content)

### Tipos de Interesse

| Tipo | Valor | Descrição |
|------|-------|-----------|
| Interessado | `interested` | Cliente demonstrou interesse |
| Agendando Visita | `viewing` | Cliente agendou ou realizou visita |
| Fez Oferta | `offer` | Cliente fez uma oferta |
| Em Negociação | `negotiation` | Negociação em andamento |
| Fechado | `closed` | Negócio fechado |

### Tipos de Cliente

| Tipo | Valor | Descrição |
|------|-------|-----------|
| Comprador | `buyer` | Cliente interessado em comprar |
| Vendedor | `seller` | Cliente que está vendendo |
| Locatário | `renter` | Cliente interessado em alugar |
| Locador | `lessor` | Cliente que está alugando |
| Investidor | `investor` | Cliente investidor |
| Geral | `general` | Tipo geral |

### Permissões Necessárias

- **`property:view`** - Visualizar propriedade (necessário para ver clientes vinculados)
- **`client:view`** - Visualizar clientes
- **`client:create`** - Criar clientes (para vincular novos clientes)
- Permissões contextuais:
  - **`vincular_documento_cliente`**: Para vincular documentos (requer `property:view`)

### Hook usePropertyClients

**Localização**: `src/hooks/usePropertyClients.ts`

**Uso:**
```typescript
const {
  propertyClients,
  availableClients,
  loading,
  error,
  fetchPropertyClients,
  fetchAvailableClients,
  assignClientsToProperty,
  removeClientFromProperty,
} = usePropertyClients();

// Carregar clientes da propriedade
await fetchPropertyClients(propertyId);

// Vincular clientes
await assignClientsToProperty(propertyId, [clientId1, clientId2]);

// Remover vínculo
await removeClientFromProperty(propertyId, clientId);
```

### Fluxo de Uso

1. **Visualizar Clientes**: Usuário acessa página de detalhes e vê lista de clientes vinculados
2. **Adicionar Cliente**: Clica em "Adicionar Cliente", seleciona cliente(s) e confirma
3. **Gerenciar Interesse**: Pode atualizar tipo de interesse e adicionar notas
4. **Remover Vínculo**: Pode remover vínculo se necessário

### Integração na Criação/Edição

Na página de criação/edição de propriedade (`CreatePropertyPage`), há uma etapa específica (Etapa 6) para:

- Selecionar clientes existentes para vincular
- Vincular múltiplos clientes de uma vez
- Definir tipo de interesse inicial

### Integração com Matches

Clientes vinculados a propriedades podem gerar **matches automáticos** baseados em:
- Compatibilidade de perfil do cliente com características da propriedade
- Preferências do cliente vs características do imóvel
- Histórico de interações

---

## 💰 Despesas do Imóvel

### Visão Geral

O sistema permite gerenciar despesas recorrentes e únicas relacionadas a propriedades, como IPTU, condomínio, seguro, manutenção, etc. Inclui controle de vencimento, status de pagamento e notificações.

### Funcionalidades

- ✅ Cadastro de despesas (recorrentes e únicas)
- ✅ Controle de vencimento
- ✅ Status de pagamento (Pendente, Paga, Vencida, Cancelada)
- ✅ Resumo estatístico (pendentes, vencidas, pagas)
- ✅ Filtros por status, tipo e período
- ✅ Notificações de vencimento
- ✅ Criação automática de pendências financeiras
- ✅ Recorrência configurável (mensal, anual, etc.)

### Exibição na Página de Detalhes

Na página de detalhes da propriedade, há uma seção completa **💰 Despesas da Propriedade** (`PropertyExpensesSection`) que exibe:

#### Resumo Estatístico

Cards com estatísticas:
- **Pendentes**: Total de despesas pendentes
- **Vencidas**: Total de despesas vencidas (destacadas em vermelho)
- **Pagas**: Total de despesas pagas
- **Total Pendente**: Valor total em dinheiro pendente
- **Total Vencido**: Valor total vencido (destacado)

#### Filtros

- Filtro por **Status** (Pendente, Paga, Vencida, Cancelada)
- Filtro por **Tipo** (IPTU, Condomínio, Seguro, Manutenção, etc.)
- Filtro por **Período** (Data inicial e final)

#### Lista de Despesas

- Tabela/cards com despesas
- Indicadores visuais de status e urgência
- Ações rápidas:
  - Marcar como paga
  - Editar despesa
  - Excluir despesa
- Botão "Adicionar Despesa"

### Componente PropertyExpensesSection

**Localização**: `src/components/property/PropertyExpensesSection.tsx`

**Props:**
```typescript
interface PropertyExpensesSectionProps {
  propertyId: string;
  propertyTitle?: string;
}
```

**Funcionalidades:**
- Carrega despesas automaticamente
- Exibe resumo estatístico
- Permite criar, editar, marcar como paga e excluir despesas
- Filtros interativos

### Estrutura de Dados

#### PropertyExpense

```typescript
interface PropertyExpense {
  id: string;
  title: string;
  description?: string;
  type: PropertyExpenseType;  // 'iptu' | 'condominium' | 'insurance' | 'maintenance' | 'utilities' | 'tax' | 'other'
  amount: number;
  dueDate: string;  // ISO 8601
  status: PropertyExpenseStatus;  // 'pending' | 'paid' | 'overdue' | 'cancelled'
  paidDate?: string;  // ISO 8601
  isRecurring: boolean;
  recurrenceConfig?: {
    frequency: 'monthly' | 'quarterly' | 'yearly';
    interval: number;  // A cada X meses/trimestres/anos
    maxOccurrences?: number;
  };
  enableNotification: boolean;
  notificationAdvanceDays?: 1 | 3 | 7 | 15 | 30;
  lastNotifiedAt?: string;
  createFinancialPending: boolean;
  financialPendingId?: string;
  propertyId: string;
  companyId: string;
  responsibleUserId: string;
  createdAt: string;
  updatedAt: string;
  property?: {
    id: string;
    title: string;
    address: string;
    code?: string;
  };
  responsibleUser?: {
    id: string;
    name: string;
    email: string;
  };
  financialPending?: {
    id: string;
    status: string;
  };
}
```

#### PropertyExpenseSummary

```typescript
interface PropertyExpenseSummary {
  totalPending: number;
  totalPaid: number;
  totalOverdue: number;
  totalCancelled: number;
  totalPendingAmount: number;
  totalPaidAmount: number;
  totalOverdueAmount: number;
  nextExpenses: PropertyExpense[];  // Próximas despesas (7 dias)
}
```

### Tipos de Despesa

| Tipo | Valor | Descrição |
|------|-------|-----------|
| IPTU | `iptu` | Imposto Predial e Territorial Urbano |
| Condomínio | `condominium` | Taxa de condomínio |
| Seguro | `insurance` | Seguro do imóvel |
| Manutenção | `maintenance` | Despesas de manutenção |
| Utilidades | `utilities` | Água, luz, gás, internet |
| Impostos | `tax` | Outros impostos |
| Outros | `other` | Outras despesas |

### Status de Despesa

| Status | Valor | Descrição |
|--------|-------|-----------|
| Pendente | `pending` | Despesa aguardando pagamento |
| Paga | `paid` | Despesa já foi paga |
| Vencida | `overdue` | Despesa passou da data de vencimento sem pagamento |
| Cancelada | `cancelled` | Despesa foi cancelada |

### API de Despesas

#### Listar Despesas de uma Propriedade

```http
GET /properties/{propertyId}/expenses?page=1&limit=20&status=pending&type=iptu
```

**Parâmetros de Query:**
- `status`: Filtrar por status
- `type`: Filtrar por tipo
- `startDate`: Data inicial (ISO 8601)
- `endDate`: Data final (ISO 8601)
- `page`: Número da página
- `limit`: Itens por página

**Resposta:**
```typescript
{
  data: PropertyExpense[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

#### Buscar Resumo de Despesas

```http
GET /properties/{propertyId}/expenses/summary
```

**Resposta:** Objeto `PropertyExpenseSummary`

#### Criar Despesa

```http
POST /properties/{propertyId}/expenses
Content-Type: application/json

{
  "title": "IPTU 2024",
  "description": "Imposto Predial e Territorial Urbano",
  "type": "iptu",
  "amount": 1500.00,
  "dueDate": "2024-03-31T00:00:00Z",
  "isRecurring": true,
  "recurrenceConfig": {
    "frequency": "yearly",
    "interval": 1
  },
  "enableNotification": true,
  "notificationAdvanceDays": 7,
  "createFinancialPending": true
}
```

#### Atualizar Despesa

```http
PUT /properties/{propertyId}/expenses/{expenseId}
Content-Type: application/json

{
  "status": "paid",
  "paidDate": "2024-03-15T00:00:00Z"
}
```

#### Marcar como Paga

```http
PUT /properties/{propertyId}/expenses/{expenseId}/mark-as-paid
Content-Type: application/json

{
  "paidDate": "2024-03-15T00:00:00Z"  // Opcional, usa data atual se não informado
}
```

#### Excluir Despesa

```http
DELETE /properties/{propertyId}/expenses/{expenseId}
```

### Permissões Necessárias

- **`property:view`** - Visualizar propriedade (necessário para ver despesas)
- **`property:update`** - Editar propriedade (necessário para criar/editar/excluir despesas)

### Hook usePropertyExpenses

**Localização**: `src/hooks/usePropertyExpenses.ts`

**Uso:**
```typescript
const {
  expenses,
  summary,
  loading,
  error,
  fetchExpenses,
  fetchSummary,
  createExpense,
  updateExpense,
  markAsPaid,
  deleteExpense,
  refreshExpenses,
} = usePropertyExpenses(propertyId);

// Carregar despesas
await fetchExpenses(propertyId, { status: 'pending' });

// Carregar resumo
await fetchSummary(propertyId);

// Criar despesa
await createExpense(propertyId, expenseData);

// Marcar como paga
await markAsPaid(propertyId, expenseId, { paidDate: new Date().toISOString() });
```

### Rotas Relacionadas

- **Criar Despesa**: `/properties/{propertyId}/expenses/create`
- **Editar Despesa**: `/properties/{propertyId}/expenses/{expenseId}/edit`

### Integração com Sistema Financeiro

Quando `createFinancialPending: true`:
- Cria automaticamente uma pendência financeira
- Vincula a despesa à pendência financeira
- Permite rastreamento integrado

### Notificações

- **Notificações de Vencimento**: Sistema envia notificações X dias antes do vencimento (configurável: 1, 3, 7, 15, 30 dias)
- **Notificações de Atraso**: Sistema envia notificações quando despesa está vencida

### Documentação Relacionada

Para mais detalhes, consulte:
- `docs/PROPERTY_EXPENSES_UI_PLACEMENT.md` - Documentação de implementação da UI

---

## ✅ Checklists Vinculados à Propriedade

### Visão Geral

O sistema permite criar e gerenciar checklists de vendas e aluguéis vinculados a propriedades e clientes. Os checklists ajudam a organizar e acompanhar o processo de venda/aluguel com tarefas pré-definidas.

### Funcionalidades

- ✅ Criar checklists de venda ou aluguel
- ✅ Templates pré-definidos por tipo
- ✅ Itens personalizáveis
- ✅ Acompanhamento de progresso
- ✅ Status por item (pendente, em andamento, concluído, pulado)
- ✅ Documentos necessários por item
- ✅ Prazos estimados
- ✅ Notas e observações

### Exibição na Página de Detalhes

Na página de detalhes da propriedade, há uma seção **Checklists** (`ChecklistSection`) que exibe:

- Lista de checklists vinculados à propriedade
- Progresso de cada checklist (percentual de conclusão)
- Status geral (Pendente, Em Andamento, Concluído)
- Informações do cliente vinculado
- Botão "Criar Checklist" para criar novo
- Limite configurável de exibição (padrão: 5 últimos)
- Link "Ver Todos" para ver todos os checklists

### Componente ChecklistSection

**Localização**: `src/components/checklists/ChecklistSection.tsx`

**Props:**
```typescript
interface ChecklistSectionProps {
  propertyId?: string;
  clientId?: string;
  showCreateButton?: boolean;
  limit?: number;
}
```

**Funcionalidades:**
- Carrega checklists automaticamente baseado em `propertyId` e/ou `clientId`
- Exibe lista de checklists com progresso
- Permite criar, visualizar, editar e excluir checklists
- Filtra automaticamente por propriedade/cliente

### Estrutura de Dados

#### ChecklistResponseDto

```typescript
interface ChecklistResponseDto {
  id: string;
  propertyId: string;
  clientId: string;
  companyId: string;
  responsibleUserId: string;
  type: 'sale' | 'rental';
  items: ChecklistItemResponseDto[];
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  startedAt: string;  // ISO 8601
  completedAt?: string;  // ISO 8601
  notes?: string;
  createdAt: string;
  updatedAt: string;
  property?: {
    id: string;
    title: string;
    code?: string;
  };
  client?: {
    id: string;
    name: string;
    email?: string;
    phone: string;
  };
  responsibleUser?: {
    id: string;
    name: string;
    email: string;
  };
  statistics: {
    totalItems: number;
    completedItems: number;
    pendingItems: number;
    inProgressItems: number;
    completionPercentage: number;  // 0-100
  };
}
```

#### ChecklistItemResponseDto

```typescript
interface ChecklistItemResponseDto {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  requiredDocuments?: string[];
  estimatedDays?: number;
  order: number;
  notes?: string;
  completedAt?: string;  // ISO 8601
  startedAt?: string;  // ISO 8601
}
```

### Tipos de Checklist

| Tipo | Valor | Descrição |
|------|-------|-----------|
| Venda | `sale` | Checklist para processo de venda |
| Aluguel | `rental` | Checklist para processo de aluguel |

### Status de Checklist

| Status | Valor | Descrição |
|--------|-------|-----------|
| Pendente | `pending` | Checklist criado mas não iniciado |
| Em Andamento | `in_progress` | Checklist em execução |
| Concluído | `completed` | Todos os itens foram concluídos ou pulados |
| Pulado | `skipped` | Checklist foi pulado/cancelado |

### Status de Item

| Status | Valor | Descrição |
|--------|-------|-----------|
| Pendente | `pending` | Item ainda não iniciado |
| Em Andamento | `in_progress` | Item em execução |
| Concluído | `completed` | Item finalizado |
| Pulado | `skipped` | Item foi pulado |

### Templates Padrão

O sistema possui templates pré-definidos para facilitar a criação:

#### Template de Venda
1. Avaliação da propriedade
2. Documentação da propriedade
3. Vistoria técnica
4. Divulgação e marketing
5. Negociação e proposta
6. Documentação do comprador
7. Assinatura do contrato
8. Entrega das chaves

#### Template de Aluguel
1. Vistoria de entrada
2. Documentação do locatário
3. Análise de garantias
4. Assinatura do contrato
5. Entrega das chaves

### API de Checklists

#### Listar Checklists

```http
GET /sale-checklists?propertyId={propertyId}&clientId={clientId}&page=1&limit=20
```

**Parâmetros de Query:**
- `propertyId`: Filtrar por propriedade
- `clientId`: Filtrar por cliente
- `type`: Filtrar por tipo (`sale` | `rental`)
- `status`: Filtrar por status
- `page`: Número da página
- `limit`: Itens por página

**Resposta:**
```typescript
{
  checklists: ChecklistResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

#### Criar Checklist

```http
POST /sale-checklists
Content-Type: application/json

{
  "propertyId": "uuid-da-propriedade",
  "clientId": "uuid-do-cliente",
  "type": "sale",
  "items": [
    {
      "title": "Avaliação da propriedade",
      "description": "Realizar avaliação técnica",
      "status": "pending",
      "estimatedDays": 3,
      "order": 1
    }
  ],
  "notes": "Checklist para processo de venda"
}
```

#### Atualizar Status de Item

```http
PUT /sale-checklists/{checklistId}/items/{itemId}
Content-Type: application/json

{
  "status": "completed",
  "notes": "Item concluído com sucesso"
}
```

### Permissões Necessárias

- **`checklist:view`** - Visualizar checklists
- **`checklist:create`** - Criar checklists
- **`checklist:update`** - Editar checklists
- **`checklist:delete`** - Excluir checklists

### Dependências Contextuais

- **`vincular_checklist_propriedade`**: Requer permissão `property:view` para vincular checklist a propriedade
- **`vincular_checklist_cliente`**: Requer permissão `client:view` para vincular checklist a cliente
- **`alterar_vinculo_propriedade_checklist`**: Requer permissão `property:view` para alterar propriedade do checklist
- **`alterar_vinculo_cliente_checklist`**: Requer permissão `client:view` para alterar cliente do checklist

### Hook useChecklists

**Localização**: `src/hooks/useChecklists.ts`

**Uso:**
```typescript
const {
  checklists,
  loading,
  error,
  fetchChecklists,
  createChecklist,
  updateChecklist,
  deleteChecklist,
  fetchChecklistById,
} = useChecklists();

// Carregar checklists
await fetchChecklists({ propertyId: 'uuid', clientId: 'uuid' });

// Criar checklist
await createChecklist(checklistData);
```

### Rotas Relacionadas

- **Listar Checklists**: `/checklists`
- **Criar Checklist**: `/checklists/new?propertyId={id}&clientId={id}`
- **Detalhes do Checklist**: `/checklists/{checklistId}`
- **Editar Checklist**: `/checklists/{checklistId}/edit`

### Módulo Necessário

- **`checklist_management`**: Módulo obrigatório para acessar funcionalidades de checklist

### Documentação Relacionada

Para mais detalhes sobre checklists, consulte:
- `docs/CHECKLIST_API.md` - Documentação completa da API de checklists

---

## 📄 Documentos Vinculados à Propriedade

### Visão Geral

O sistema permite gerenciar documentos vinculados a propriedades, incluindo upload, organização, assinatura digital e controle de vencimento. Documentos podem ser vinculados a propriedades OU clientes (mas não ambos simultaneamente).

### Funcionalidades

- ✅ Upload de documentos (PDF, DOC, XLS, imagens) até 50MB
- ✅ Vinculação à propriedade
- ✅ Organização por tipo, tags e status
- ✅ Assinatura digital (integração Assinafy)
- ✅ Controle de vencimento
- ✅ Aprovação/rejeição de documentos
- ✅ Download de documentos
- ✅ Criptografia opcional
- ✅ Busca e filtros avançados

### Exibição na Página de Detalhes

Na página de detalhes da propriedade, há uma seção **Documentos** (`EntityDocumentsList`) que exibe:

- Lista de documentos vinculados à propriedade
- Cards/tabela com informações de cada documento:
  - Tipo e título
  - Status (Ativo, Pendente, Expirado, etc.)
  - Data de upload e vencimento
  - Tags
  - Indicadores visuais
- Botão "Adicionar Documento" para upload
- Filtros e busca
- Ações rápidas (visualizar, editar, baixar, excluir)

### Componente EntityDocumentsList

**Localização**: `src/components/documents/EntityDocumentsList.tsx`

**Props:**
```typescript
interface EntityDocumentsListProps {
  entityId: string;
  entityType: 'client' | 'property';
  entityName?: string;
}
```

**Funcionalidades:**
- Carrega documentos automaticamente baseado em `entityId` e `entityType`
- Permite upload via drawer
- Permite visualizar, editar e excluir documentos
- Filtros e busca integrados

### Estrutura de Dados

#### DocumentModel

```typescript
interface DocumentModel {
  id: string;
  originalName: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  fileExtension: string;
  type: DocumentType;
  status: DocumentStatus;
  title?: string;
  description?: string;
  tags?: string[];
  notes?: string;
  expiryDate?: Date | string;
  companyId: string;
  uploadedById: string;
  clientId?: string;
  propertyId?: string;  // Vinculado à propriedade se este campo estiver preenchido
  isEncrypted: boolean;
  approvedAt?: Date | string;
  approvedById?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  isForSignature?: boolean;
  signatures?: DocumentSignaturesInfo;
  property?: {
    id: string;
    title: string;
    address: string;
    code?: string;
  };
}
```

### Tipos de Documento

Tipos comuns relacionados a propriedades:
- Contrato de Locação
- Contrato de Compra e Venda
- IPTU
- Matrícula do Imóvel
- Certidão de Débitos
- Habite-se
- Alvará de Funcionamento
- Seguro do Imóvel
- Laudo de Vistoria
- E outros tipos customizados

### Status de Documento

| Status | Valor | Descrição |
|--------|-------|-----------|
| Ativo | `active` | Documento ativo e válido |
| Pendente | `pending_review` | Aguardando aprovação |
| Aprovado | `approved` | Documento aprovado |
| Rejeitado | `rejected` | Documento rejeitado |
| Expirado | `expired` | Documento vencido |
| Arquivado | `archived` | Documento arquivado |

### API de Documentos

#### Listar Documentos de uma Propriedade

```http
GET /documents?propertyId={propertyId}&page=1&limit=20
```

**Parâmetros de Query:**
- `propertyId`: Filtrar por propriedade
- `status`: Filtrar por status
- `type`: Filtrar por tipo
- `tags`: Filtrar por tags (separadas por vírgula)
- `search`: Busca textual
- `page`: Número da página
- `limit`: Itens por página

**Resposta:**
```typescript
{
  documents: DocumentModel[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

#### Upload de Documento

```http
POST /documents/upload
Content-Type: multipart/form-data

file: [arquivo]
propertyId: "uuid-da-propriedade"
type: "contract"
title: "Contrato de Locação"
description: "Contrato de locação do imóvel"
tags: "contrato,locacao"
expiryDate: "2025-12-31T00:00:00Z"
isEncrypted: false
```

#### Atualizar Documento

```http
PUT /documents/{documentId}
Content-Type: application/json

{
  "title": "Novo título",
  "description": "Nova descrição",
  "tags": ["tag1", "tag2"],
  "propertyId": "uuid-da-propriedade"
}
```

#### Excluir Documento(s)

```http
DELETE /documents
Content-Type: application/json

{
  "documentIds": ["uuid1", "uuid2"]
}
```

#### Download de Documento

```http
GET /documents/{documentId}/download
```

### Permissões Necessárias

- **`document:read`** - Visualizar documentos
- **`document:create`** - Criar/upload de documentos
- **`document:update`** - Editar documentos
- **`document:delete`** - Excluir documentos
- **`document:approve`** - Aprovar/rejeitar documentos
- **`document:download`** - Baixar documentos

### Dependências Contextuais

- **`vincular_documento_propriedade`**: Requer permissão `property:view` para vincular documento a propriedade
- **`alterar_vinculo_propriedade`**: Requer permissão `property:view` para alterar vínculo com propriedade

### Hook useDocuments

**Localização**: `src/hooks/useDocuments.ts`

**Uso:**
```typescript
const {
  documents,
  loading,
  error,
  fetchDocuments,
  upload,
  update,
  deleteDocuments,
  fetchById,
} = useDocuments();

// Carregar documentos da propriedade
await fetchDocuments({ propertyId: 'uuid' });

// Upload de documento
await upload(file, {
  propertyId: 'uuid',
  type: DocumentType.CONTRACT,
  title: 'Contrato de Locação'
});
```

### Hook useDocumentsByEntity

**Localização**: `src/hooks/useDocumentsByEntity.ts`

**Uso:**
```typescript
const {
  documents,
  loading,
  error,
  fetchDocuments,
  uploadDocument,
  deleteDocuments,
} = useDocumentsByEntity('property', propertyId);

// Carregar documentos
await fetchDocuments();

// Upload
await uploadDocument(file, documentData);
```

### Rotas Relacionadas

- **Listar Documentos**: `/documents?propertyId={id}`
- **Criar Documento**: `/documents/create?propertyId={id}`
- **Detalhes do Documento**: `/documents/{documentId}`
- **Editar Documento**: `/documents/{documentId}/edit`

### Módulo Necessário

- **`document_management`**: Módulo obrigatório para acessar funcionalidades de documentos

### Integração com Assinatura Digital

- Documentos podem ser enviados para assinatura via Assinafy
- Status de assinatura é exibido na lista
- Múltiplos signatários suportados

### Documentação Relacionada

Para mais detalhes sobre documentos, consulte:
- `docs/DOCUMENTS_PAGE.md` - Documentação completa do sistema de documentos

---

## 🌐 Publicação no Site Intellisys

### Visão Geral

Propriedades podem ser publicadas no site público Intellisys para serem visualizadas por clientes. A publicação é controlada pelo campo `isAvailableForSite`.

### Componente PropertyPublicToggle

Componente usado para alternar a visibilidade da propriedade no site.

**Localização:** `src/components/properties/PropertyPublicToggle.tsx`

**Props:**
```typescript
interface PropertyPublicToggleProps {
  propertyId: string;
  initialValue: boolean;
  propertyStatus: PropertyStatus;
  isActive?: boolean;
  imageCount?: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}
```

**Funcionalidades:**
- Toggle visual para ativar/desativar publicação
- Validação automática antes de publicar
- Tooltip com informações sobre requisitos
- Mensagens de erro específicas
- Estados visuais (loading, error, disabled)

### Requisitos para Publicar

Para uma propriedade poder ser publicada no site, ela deve atender **TODOS** os seguintes requisitos:

#### 1. Propriedade Ativa
- `isActive === true`
- Propriedades inativas não podem ser publicadas

#### 2. Status Disponível
- `status === 'available'`
- Apenas propriedades disponíveis podem aparecer no site

#### 3. Mínimo de Imagens
- **Requisito:** Pelo menos 5 imagens válidas
- Imagens válidas: imagens com URL não vazia e válida
- Contagem inclui imagens existentes + novas imagens (ao editar)

#### 4. Limites de Plano
- **Plano Basic:** Pode ter limite de propriedades públicas (verificar no plano)
- **Plano Professional:** Permite mais propriedades públicas
- **Plano Custom:** Ilimitado

### Validação no Frontend

A validação é feita antes de enviar a requisição:

```typescript
const canPublishProperty = (property: Property): { 
  canPublish: boolean; 
  reason?: string 
} => {
  if (!property.isActive) {
    return { canPublish: false, reason: 'Propriedade deve estar ativa' };
  }
  if (property.status !== 'available') {
    return { canPublish: false, reason: 'Status deve ser "Disponível"' };
  }
  const validImages = property.images?.filter(
    (img) => img && img.url && img.url.trim() !== ''
  ) || [];
  if (validImages.length < 5) {
    return { 
      canPublish: false, 
      reason: `Necessário ter 5 imagens (atualmente: ${validImages.length})` 
    };
  }
  return { canPublish: true };
};
```

### Hook usePropertyPublicFlag

Hook para gerenciar o estado de publicação.

**Localização:** `src/hooks/usePropertyPublicFlag.ts`

**Uso:**
```typescript
const { 
  isPublic, 
  loading, 
  error, 
  togglePublic,
  setPublic 
} = usePropertyPublicFlag(propertyId, initialValue, propertyStatus);
```

**Funcionalidades:**
- Gerencia estado de publicação
- Valida requisitos antes de publicar
- Trata erros de plano e limites
- Dispara eventos customizados para modais de upgrade

### Fluxo de Publicação

1. Usuário clica no toggle para publicar
2. Frontend valida requisitos (ativo, disponível, imagens)
3. Se validação passar, envia `PATCH /properties/:id` com `isAvailableForSite: true`
4. Backend valida novamente e verifica plano/limites
5. Se sucesso, propriedade fica visível no site
6. Se erro, exibe mensagem apropriada

### Fluxo de Despublicação

1. Usuário clica no toggle para despublicar
2. Envia `PATCH /properties/:id` com `isAvailableForSite: false`
3. Propriedade é removida do site imediatamente
4. Nenhuma validação adicional necessária

### Erros Comuns

#### Erro 403: Plano não permite
```json
{
  "message": "Seu plano não permite disponibilizar propriedades no site Intellisys.",
  "statusCode": 403
}
```

**Ação:** Disparar modal de upgrade de plano

#### Erro 403: Limite atingido
```json
{
  "message": "Limite de propriedades no site Intellisys atingido.",
  "statusCode": 403
}
```

**Ação:** Sugerir remover outras propriedades ou fazer upgrade

#### Erro de Validação
- Propriedade não está ativa
- Status não é "Disponível"
- Não tem 5 imagens válidas

**Ação:** Mostrar mensagem específica no tooltip/erro

### Eventos Customizados

O hook dispara eventos customizados para modais:

**Evento: `property-public-upgrade-required`**
```typescript
window.dispatchEvent(new CustomEvent('property-public-upgrade-required', {
  detail: {
    title: 'Upgrade Necessário',
    message: 'Esta funcionalidade está disponível apenas no plano Professional.',
    errorMessage: '...'
  }
}));
```

**Evento: `property-public-limit-reached`**
```typescript
window.dispatchEvent(new CustomEvent('property-public-limit-reached', {
  detail: {
    title: 'Limite Atingido',
    message: 'Limite de propriedades públicas atingido.',
    suggestions: [
      'Remover algumas propriedades do site Intellisys',
      'Fazer upgrade para plano Custom (ilimitado)',
    ]
  }
}));
```

### Onde Usar

- **Página de Detalhes:** Toggle completo com informações
- **Lista de Propriedades:** Toggle rápido (ícone público/privado)
- **Formulário de Criação/Edição:** Checkbox opcional (com validação)

---

## 📤 Exportação e Importação

### Exportar Propriedades

#### Formato Excel (XLSX)
- Formato padrão
- Inclui todas as colunas da propriedade
- Preserva formatação

#### Formato CSV
- Formato alternativo
- Compatível com Excel e Google Sheets
- Menor tamanho de arquivo

#### Filtros Disponíveis
- Filtrar por tipo antes de exportar
- Filtrar por status antes de exportar

#### Uso
```typescript
// Exportar todas
const blob = await propertyApi.exportProperties('xlsx');

// Exportar apenas apartamentos
const blob = await propertyApi.exportProperties('xlsx', { 
  type: 'apartment' 
});

// Download
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = `propriedades_${new Date().toISOString()}.xlsx`;
link.click();
URL.revokeObjectURL(url);
```

### Importar Propriedades

#### Arquivos Suportados
- Excel (.xlsx, .xls)
- CSV (.csv)

#### Estrutura Esperada
O arquivo deve conter colunas com os seguintes nomes (ou variações):
- Título / Title
- Descrição / Description
- Tipo / Type
- Status
- Endereço / Address
- Cidade / City
- Estado / State
- CEP / ZipCode
- Bairro / Neighborhood
- Área Total / Total Area
- Quartos / Bedrooms
- Banheiros / Bathrooms
- Vagas / Parking Spaces
- Preço de Venda / Sale Price
- Preço de Aluguel / Rent Price
- ... (outros campos opcionais)

#### Processo de Importação

1. **Upload do arquivo**
2. **Validação linha por linha**
3. **Importação das válidas**
4. **Geração de relatório de erros** (se houver)

#### Resposta da Importação

```typescript
{
  total: 100,           // Total de linhas no arquivo
  success: 95,          // Propriedades importadas
  failed: 5,            // Propriedades que falharam
  properties: [...],    // Array de propriedades criadas
  errors: [
    {
      row: 10,          // Linha 10 do arquivo
      property: "Apartamento Centro",  // Identificação
      errors: [
        "CEP inválido",
        "Título é obrigatório"
      ]
    }
  ],
  hasErrorFile: true,   // Se foi gerado arquivo de erros
  errorSpreadsheetBase64: "..."  // Base64 do Excel com erros
}
```

#### Tratamento de Erros

- Erros são agrupados por linha
- Arquivo de erros pode ser gerado (Excel com coluna de erros)
- Propriedades válidas são importadas mesmo se outras falharem
- Relatório completo disponível após importação

---

## 🖼️ APIs de Galeria (Imagens)

### Endpoints Relacionados

#### 1. Listar Imagens da Propriedade

**Endpoint:**
```
GET /gallery/property/:propertyId
```

**Resposta:**
```typescript
GalleryImage[]
```

#### 2. Upload de Imagens

**Endpoint:**
```
POST /gallery/upload
Content-Type: multipart/form-data
```

**Body (FormData):**
```
images: File[] (múltiplos arquivos)
propertyId: string
category: string (padrão: 'general')
altText?: string
description?: string
tags?: string (JSON stringificado)
isPublic: boolean (padrão: true)
```

**Resposta:**
```typescript
GalleryImage[]
```

**Categorias:**
- `general` - Geral
- `facade` - Fachada
- `interior` - Interna
- `exterior` - Externa
- `floor_plan` - Planta

#### 3. Atualizar Imagem

**Endpoint:**
```
PATCH /gallery/:imageId
```

**Body:**
```typescript
{
  url?: string;
  alt?: string;
  isMain?: boolean;
  order?: number;
}
```

#### 4. Deletar Imagem

**Endpoint:**
```
DELETE /gallery/:imageId
```

**Resposta:**
```
204 No Content
```

#### 5. Definir Imagem Principal

**Endpoint:**
```
PATCH /gallery/:imageId/set-main
```

#### 6. Reordenar Imagens

**Endpoint:**
```
PATCH /gallery/reorder
```

**Body:**
```json
{
  "imageIds": ["id1", "id2", "id3"]
}
```

### Validações de Imagens

- **Formatos aceitos:** JPG, PNG, WebP
- **Tamanho máximo por arquivo:** 10MB
- **Quantidade máxima:** 50 imagens por propriedade
- **Imagens válidas:** URL não vazia e acessível

### Interface GalleryImage

```typescript
interface GalleryImage {
  id: string;
  propertyId: string;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  category: string;
  isMain: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}
```

---

## 💰 Sistema de Ofertas (Negociação)

### Visão Geral

O sistema de ofertas permite que **usuários públicos** (compradores/inquilinos) façam ofertas (lances) para propriedades que aceitam negociação. As **imobiliárias** podem visualizar e gerenciar essas ofertas através da interface privada.

### Configuração de Negociação na Propriedade

Para receber ofertas, a propriedade precisa estar configurada para aceitar negociação:

#### Campos Relacionados a Ofertas

**Aceita Negociação (`acceptsNegotiation`)**
- **Tipo:** `boolean`
- **Padrão:** `false`
- **Descrição:** Define se a propriedade aceita ofertas/negociação
- **Onde configurar:** Formulário de criação/edição de propriedade

**Valor Mínimo de Venda (`minSalePrice`)**
- **Tipo:** `number` (opcional)
- **Requisito:** Deve ser menor que `salePrice` se fornecido
- **Descrição:** Valor mínimo aceito para ofertas de venda
- **Validação:** `minSalePrice < salePrice`

**Valor Mínimo de Aluguel (`minRentPrice`)**
- **Tipo:** `number` (opcional)
- **Requisito:** Deve ser menor que `rentPrice` se fornecido
- **Descrição:** Valor mínimo aceito para ofertas de aluguel
- **Validação:** `minRentPrice < rentPrice`

**Ação para Ofertas Abaixo do Mínimo - Venda (`offerBelowMinSaleAction`)**
- **Tipo:** `'reject' | 'pending' | 'notify'`
- **Padrão:** `'reject'`
- **Descrição:** Define o comportamento quando uma oferta de venda está abaixo do valor mínimo
- **Opções:**
  - `'reject'` - Rejeitar automaticamente
  - `'pending'` - Manter pendente para análise
  - `'notify'` - Notificar e manter pendente

**Ação para Ofertas Abaixo do Mínimo - Aluguel (`offerBelowMinRentAction`)**
- **Tipo:** `'reject' | 'pending' | 'notify'`
- **Padrão:** `'reject'`
- **Descrição:** Define o comportamento quando uma oferta de aluguel está abaixo do valor mínimo
- **Opções:** (mesmas do `offerBelowMinSaleAction`)

#### Informações de Ofertas (Read-Only)

**Contadores de Ofertas:**
```typescript
{
  totalOffersCount?: number;        // Total de ofertas recebidas
  pendingOffersCount?: number;      // Ofertas pendentes
  acceptedOffersCount?: number;     // Ofertas aceitas
  rejectedOffersCount?: number;     // Ofertas rejeitadas
  hasPendingOffers?: boolean;       // Se tem ofertas pendentes
}
```

**Array de Ofertas (`offers`):**
```typescript
offers?: Array<{
  id: string;                       // ID da oferta
  propertyId: string;               // ID da propriedade
  publicUserId: string;             // ID do usuário público
  publicUser?: {                    // Dados do usuário público
    id: string;
    email: string;
    phone: string;
  };
  type: 'sale' | 'rental';         // Tipo: venda ou aluguel
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'expired';
  offeredValue: number;             // Valor oferecido
  message?: string;                 // Mensagem do ofertante
  responseMessage?: string;         // Resposta da imobiliária
  createdAt: string;                // Data de criação (ISO 8601)
  updatedAt: string;                // Data de atualização (ISO 8601)
  respondedAt?: string;             // Data de resposta (ISO 8601)
  respondedByUserId?: string;       // ID do usuário que respondeu
}>
```

### Validações de Negociação

#### No Formulário (Frontend)

1. **Se `acceptsNegotiation = true`:**
   - `minSalePrice` deve ser menor que `salePrice` (se ambos fornecidos)
   - `minRentPrice` deve ser menor que `rentPrice` (se ambos fornecidos)
   - Valores mínimos são opcionais, mas recomendados

2. **Valores Mínimos:**
   - Devem ser números positivos
   - Não podem ser iguais ou maiores que o preço correspondente
   - Mensagem de erro: "O valor mínimo deve ser menor que o preço de [venda/aluguel]"

3. **Ações para Ofertas Abaixo do Mínimo:**
   - Só aparecem se `acceptsNegotiation = true` e valor mínimo configurado
   - Valor padrão: `'reject'` (rejeitar automaticamente)

### Endpoints de Ofertas

#### 20. Listar Todas as Ofertas

**Endpoint:**
```
GET /properties/offers
```

**Query Parameters:**
```typescript
{
  propertyId?: string;              // Filtrar por propriedade (UUID)
  status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'expired';
  type?: 'sale' | 'rental';
}
```

**Resposta:**
```typescript
PropertyOffer[]
```

**Exemplo:**
```typescript
// Buscar todas as ofertas pendentes de venda
const offers = await propertyOffersApi.getAllOffers({
  status: 'pending',
  type: 'sale'
});
```

#### 21. Listar Ofertas de uma Propriedade

**Endpoint:**
```
GET /properties/offers/property/:propertyId
```

**Resposta:**
```typescript
PropertyOffer[]
```

**Exemplo:**
```typescript
const offers = await propertyOffersApi.getPropertyOffers(propertyId);
```

#### 22. Buscar Oferta por ID

**Endpoint:**
```
GET /properties/offers/detail/:offerId
```

**Resposta:**
```typescript
PropertyOffer
```

**Interface PropertyOffer:**
```typescript
interface PropertyOffer {
  id: string;
  propertyId: string;
  publicUserId: string;
  publicUser?: {
    id: string;
    email: string;
    phone: string;
  };
  type: 'sale' | 'rental';
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'expired';
  offeredValue: number;
  message?: string;
  responseMessage?: string;
  createdAt: string;
  updatedAt: string;
  respondedAt?: string;
  respondedByUserId?: string;
  property?: {
    id: string;
    title: string;
    salePrice?: number;
    rentPrice?: number;
    minSalePrice?: number;
    minRentPrice?: number;
  };
}
```

#### 23. Aceitar ou Rejeitar Oferta

**Endpoint:**
```
PUT /properties/offers/detail/:offerId/status
```

**Body:**
```typescript
{
  status: 'accepted' | 'rejected';
  responseMessage?: string;  // Mensagem opcional para o ofertante
}
```

**Resposta:**
```typescript
PropertyOffer  // Oferta atualizada
```

**Exemplo:**
```typescript
// Aceitar oferta
await propertyOffersApi.updateOfferStatus(offerId, {
  status: 'accepted',
  responseMessage: 'Oferta aceita! Entraremos em contato em breve.'
});

// Rejeitar oferta
await propertyOffersApi.updateOfferStatus(offerId, {
  status: 'rejected',
  responseMessage: 'Obrigado pelo interesse, mas esta oferta não atende nossos requisitos.'
});
```

### Status das Ofertas

| Status | Descrição | Ações Disponíveis |
|--------|-----------|-------------------|
| `pending` | Aguardando análise | ✅ Aceitar / ❌ Rejeitar |
| `accepted` | Oferta aceita | 👁️ Visualizar apenas |
| `rejected` | Oferta rejeitada | 👁️ Visualizar apenas |
| `withdrawn` | Oferta retirada pelo ofertante | 👁️ Visualizar apenas |
| `expired` | Oferta expirada | 👁️ Visualizar apenas |

### Ações Automáticas ao Aceitar Oferta

Quando uma oferta é aceita, o sistema executa automaticamente:

1. **Atualiza a Propriedade:**
   - Atualiza o preço com o valor da oferta aceita
   - Muda status para `SOLD` (venda) ou `RENTED` (aluguel)
   - Define data de venda/aluguel
   - Remove do site público (`isAvailableForSite = false`)

2. **Rejeita Outras Ofertas:**
   - Rejeita automaticamente todas as outras ofertas pendentes para a mesma propriedade
   - Status das outras ofertas: `rejected`

3. **Cria Solicitação Financeira:**
   - Cria automaticamente uma solicitação de aprovação financeira
   - O fluxo financeiro normal do sistema será executado (comissões, transações, etc.)

### Componentes Relacionados

#### Páginas

**PropertyOffersPage** (`src/pages/PropertyOffersPage.tsx`)
- Página principal para visualizar todas as ofertas
- Rota: `/properties/offers`
- Funcionalidades:
  - Lista todas as ofertas recebidas
  - Busca por propriedade, email ou telefone
  - Filtros por status (Pendente, Aceita, Rejeitada)
  - Filtro por tipo (Venda/Aluguel)

**OfferDetailsPage** (`src/pages/OfferDetailsPage.tsx`)
- Página de detalhes de uma oferta específica
- Rota: `/properties/offers/:offerId`
- Funcionalidades:
  - Visualizar detalhes completos da oferta
  - Aceitar ou rejeitar oferta
  - Incluir mensagem de resposta

#### Modais

**PropertyOffersModal** (`src/components/modals/PropertyOffersModal.tsx`)
- Modal para visualizar ofertas de uma propriedade específica
- Usado na página de detalhes da propriedade
- Mostra lista de ofertas e permite ações rápidas

**OfferActionModal** (`src/components/modals/OfferActionModal.tsx`)
- Modal para aceitar ou rejeitar uma oferta
- Permite incluir mensagem de resposta
- Exibe informações da oferta e da propriedade

#### Hook: usePropertyOffers

**Localização:** `src/hooks/usePropertyOffers.ts`

**Uso:**
```typescript
import { usePropertyOffers } from '../hooks/usePropertyOffers';

const {
  offers,              // Lista de ofertas
  loading,             // Estado de carregamento
  error,               // Erro (se houver)
  fetchAllOffers,      // Buscar todas as ofertas (com filtros)
  fetchPropertyOffers, // Buscar ofertas de uma propriedade específica
  fetchOfferById,      // Buscar oferta por ID
  acceptOffer,         // Aceitar uma oferta
  rejectOffer,         // Rejeitar uma oferta
  clearError,          // Limpar erro
} = usePropertyOffers(propertyId);  // propertyId opcional
```

#### API Service: propertyOffersApi

**Localização:** `src/services/propertyOffersApi.ts`

**Métodos Disponíveis:**
```typescript
// Listar todas as ofertas com filtros
propertyOffersApi.getAllOffers(filters?: OfferFilters): Promise<PropertyOffer[]>

// Listar ofertas de uma propriedade
propertyOffersApi.getPropertyOffers(propertyId: string): Promise<PropertyOffer[]>

// Buscar oferta por ID
propertyOffersApi.getOfferById(offerId: string): Promise<PropertyOffer>

// Aceitar ou rejeitar oferta
propertyOffersApi.updateOfferStatus(
  offerId: string, 
  data: UpdateOfferStatusRequest
): Promise<PropertyOffer>
```

### Integração na Página de Detalhes

Na página de detalhes da propriedade (`PropertyDetailsPage`):

1. **Seção de Ofertas:**
   - Botão "Ver Ofertas desta Propriedade"
   - Badge com contador de ofertas pendentes
   - Botão "Ver Todas as Ofertas da Empresa"
   - Modal `PropertyOffersModal` para visualizar ofertas

2. **Exibição de Contadores:**
   - `hasPendingOffers` - Exibe badge se houver ofertas pendentes
   - `pendingOffersCount` - Número de ofertas pendentes
   - Atualização automática após ações

### Validações Importantes

#### No Backend

- ✅ Valor oferecido deve estar entre `minPrice` e `price`
- ✅ Não é possível criar múltiplas ofertas pendentes para a mesma propriedade
- ✅ Apenas ofertas pendentes podem ser atualizadas
- ✅ Apenas o responsável pela propriedade pode aceitar/rejeitar
- ✅ Propriedade deve aceitar negociação (`acceptsNegotiation: true`)

#### No Frontend

- ✅ Validação visual dos valores mínimos no formulário
- ✅ Feedback claro sobre ações realizadas
- ✅ Mensagens de erro amigáveis
- ✅ Validação: `minSalePrice < salePrice` e `minRentPrice < rentPrice`

### Fluxo Completo

1. **Configuração (Imobiliária):**
   - Configura propriedade para aceitar negociação
   - Define valores mínimos (opcional)
   - Define ações para ofertas abaixo do mínimo

2. **Criação de Oferta (Usuário Público):**
   - Usuário público faz oferta via API pública
   - Sistema valida se propriedade aceita negociação
   - Sistema valida se valor está dentro dos limites
   - Oferta criada com status baseado na configuração

3. **Visualização (Imobiliária):**
   - Imobiliária visualiza ofertas na página `/properties/offers`
   - Ou visualiza ofertas específicas na página de detalhes da propriedade

4. **Ação (Imobiliária):**
   - Aceita ou rejeita oferta
   - Inclui mensagem de resposta (opcional)
   - Se aceita, sistema executa ações automáticas

### Notas Importantes

1. **Configuração Inicial:** Antes de receber ofertas, a propriedade deve ter `acceptsNegotiation: true` e valores mínimos configurados (recomendado).

2. **Ações Automáticas:** Quando uma oferta é aceita, várias ações são executadas automaticamente (mudança de status, rejeição de outras ofertas, criação de solicitação financeira).

3. **Valores Mínimos:** Os valores mínimos são **confidenciais** e não são retornados em APIs públicas - apenas em APIs privadas (imobiliárias). Eles servem como piso - ofertas abaixo dele podem ser rejeitadas automaticamente dependendo da configuração.

4. **Status da Propriedade:** Quando uma oferta é aceita, a propriedade muda automaticamente para `SOLD` (venda) ou `RENTED` (aluguel) e não aparece mais no site público.

5. **Validação:** Sempre valide os valores no frontend, mas lembre-se que a validação final é feita no backend.

### Documentação Relacionada

Para mais detalhes sobre o fluxo completo de ofertas, consulte:
- `docs/PROPERTY_OFFERS_FLOW.md` - Documentação detalhada do fluxo de ofertas

---

## 🤖 Geração de Descrições com IA

### Visão Geral

O sistema oferece geração automática de **títulos e descrições** para propriedades usando Inteligência Artificial. Essa funcionalidade ajuda os corretores a criar descrições atraentes e profissionais de forma rápida e eficiente.

### Funcionalidades

- ✅ Geração automática de título
- ✅ Geração automática de descrição
- ✅ Geração de destaques (highlights)
- ✅ Múltiplas variações (até 3 gerações)
- ✅ Preview antes de aplicar
- ✅ Edição manual após geração
- ✅ Auto-geração na etapa de revisão (opcional)

### Requisitos

**Módulo Necessário:**
- `ai_assistant` - Módulo de Assistente de IA deve estar habilitado para a empresa

**Campos Mínimos para Geração:**
- Tipo de propriedade (`type`)
- Cidade (`city`)
- Área total (`totalArea`)

**Campos Opcionais (melhoram a qualidade):**
- Bairro (`neighborhood`)
- Área construída (`builtArea`)
- Quartos (`bedrooms`)
- Banheiros (`bathrooms`)
- Vagas de garagem (`parkingSpaces`)
- Preço de venda (`salePrice`)
- Preço de aluguel (`rentPrice`)
- Taxa de condomínio (`condominiumFee`)
- IPTU (`iptu`)
- Características (`features`)
- Informações adicionais (`additionalInfo`)
- Campos MCMV (se aplicável)

### Endpoint da API

#### 24. Gerar Descrição de Propriedade com IA

**Endpoint:**
```
POST /api/ai/generate-property-description
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```typescript
{
  type: 'apartment' | 'house' | 'commercial' | 'land' | 'rural';
  city: string;
  neighborhood?: string;
  totalArea: number;
  builtArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  salePrice?: number;
  rentPrice?: number;
  condominiumFee?: number;
  iptu?: number;
  features?: string[];
  additionalInfo?: string;
  // Campos MCMV (opcional)
  mcmvEligible?: boolean;
  mcmvIncomeRange?: 'faixa1' | 'faixa2' | 'faixa3';
  mcmvMaxValue?: number;
  mcmvSubsidy?: number;
  mcmvNotes?: string;
}
```

**Exemplo de Requisição:**
```typescript
{
  type: 'apartment',
  city: 'São Paulo',
  neighborhood: 'Jardins',
  totalArea: 85,
  builtArea: 70,
  bedrooms: 2,
  bathrooms: 2,
  parkingSpaces: 1,
  salePrice: 450000,
  rentPrice: 2500,
  condominiumFee: 800,
  iptu: 350,
  features: ['Academia', 'Piscina', 'Portaria 24h'],
  additionalInfo: 'Apartamento reformado recentemente'
}
```

**Resposta:**
```typescript
{
  title: string;          // Título gerado
  description: string;    // Descrição gerada
  highlights: string[];   // Array de destaques
}
```

**Exemplo de Resposta:**
```typescript
{
  title: "Apartamento 2 Quartos nos Jardins - 70m² com Excelente Localização",
  description: "Descubra este encantador apartamento de 2 quartos localizado no prestigiado bairro dos Jardins, em São Paulo. Com 70m² de área construída em um total de 85m², este imóvel oferece conforto e praticidade em um dos endereços mais valorizados da cidade. O apartamento conta com 2 banheiros completos, 1 vaga de garagem coberta e está situado em um condomínio com academia, piscina e portaria 24 horas. Valor do condomínio: R$ 800,00 e IPTU: R$ 350,00. Imóvel recém reformado, pronto para morar!",
  highlights: [
    "Excelente localização no bairro dos Jardins",
    "Apartamento reformado recentemente",
    "Condomínio com academia e piscina",
    "Portaria 24 horas",
    "Vaga de garagem coberta"
  ]
}
```

### Hook: useGenerateDescription

**Localização:** `src/hooks/useGenerateDescription.ts`

**Interface:**
```typescript
interface UseGenerateDescriptionReturn {
  generate: (data: GenerateDescriptionRequest) => Promise<GeneratedDescription | null>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}
```

**Uso:**
```typescript
import { useGenerateDescription } from '../hooks/useGenerateDescription';

const { generate, loading, error, clearError } = useGenerateDescription();

// Gerar descrição
const result = await generate({
  type: 'apartment',
  city: 'São Paulo',
  neighborhood: 'Jardins',
  totalArea: 85,
  builtArea: 70,
  bedrooms: 2,
  bathrooms: 2,
  parkingSpaces: 1,
  salePrice: 450000,
  features: ['Academia', 'Piscina']
});

if (result) {
  console.log('Título:', result.title);
  console.log('Descrição:', result.description);
  console.log('Destaques:', result.highlights);
}
```

### API Service: aiApi

**Localização:** `src/services/aiApi.ts`

**Métodos:**
```typescript
class AiApiService {
  private readonly baseUrl = '/api/ai';

  async generatePropertyDescription(
    data: GenerateDescriptionRequest
  ): Promise<GeneratedDescription>;
}
```

**Uso:**
```typescript
import { aiApi } from '../services/aiApi';

try {
  const result = await aiApi.generatePropertyDescription({
    type: 'apartment',
    city: 'São Paulo',
    totalArea: 85,
    // ... outros campos
  });
  console.log(result);
} catch (error) {
  console.error('Erro ao gerar descrição:', error);
}
```

### Componente: PropertyAIDescriptionModal

**Localização:** `src/components/modals/PropertyAIDescriptionModal.tsx`

**Props:**
```typescript
interface PropertyAIDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  variants: GeneratedDescription[];  // Array de gerações (máximo 3)
  selectedIndex: number;              // Índice da variante selecionada
  onSelectIndex: (index: number) => void;  // Callback ao selecionar variante
  onAccept: (variant: GeneratedDescription) => void;  // Callback ao aceitar
}
```

**Funcionalidades:**
- Exibe até 3 variações geradas
- Preview de título e descrição
- Lista de destaques (highlights)
- Navegação entre variações
- Botão para aplicar descrição selecionada

### Fluxo de Uso no Formulário

#### 1. Geração Manual

1. Usuário preenche campos da propriedade
2. Clica em "Gerar Descrição com IA" (checkbox ou botão)
3. Sistema valida campos mínimos
4. Envia requisição para API
5. Recebe descrição gerada
6. Modal exibe preview
7. Usuário pode:
   - Ver outras variações (se gerar novamente)
   - Editar manualmente
   - Aplicar descrição ao formulário

#### 2. Auto-Geração na Revisão

1. Usuário chega na etapa de revisão
2. Se checkbox "Gerar Descrição com IA" estiver marcado
3. Sistema gera automaticamente (se campos mínimos preenchidos)
4. Preenche título e descrição silenciosamente
5. Usuário pode editar ou gerar novamente

### Limitações

- **Máximo de 3 gerações** por sessão de criação/edição
- Requer módulo `ai_assistant` habilitado
- Requer campos mínimos preenchidos (tipo, cidade, área total)
- Pode ter custos associados (depende do plano)

### Validações

**Frontend:**
- Verifica se módulo IA está habilitado
- Valida campos mínimos antes de gerar
- Limita a 3 gerações por sessão
- Trata erros de API graciosamente

**Backend:**
- Valida campos obrigatórios
- Verifica permissões/módulo
- Gera descrição usando modelo de IA
- Retorna erro se campos insuficientes

### Tratamento de Erros

**Erros Comuns:**

1. **Módulo não habilitado:**
   - Erro: "Módulo de IA não está disponível"
   - Solução: Habilitar módulo `ai_assistant` para a empresa

2. **Campos insuficientes:**
   - Erro: "Preencha os campos mínimos (tipo, cidade, área total)"
   - Solução: Preencher campos obrigatórios

3. **Limite de gerações:**
   - Erro: "Limite de 3 gerações atingido"
   - Solução: Editar manualmente ou usar uma das gerações já criadas

4. **Erro de API:**
   - Erro: "Erro ao gerar descrição. Tente novamente."
   - Solução: Verificar conexão e tentar novamente

### Integração no CreatePropertyPage

**Localização:** `src/pages/CreatePropertyPage.tsx`

**Estados Relacionados:**
```typescript
const [aiEnabled, setAiEnabled] = useState<boolean>(false);
const [generatedVariants, setGeneratedVariants] = useState<GeneratedDescription[]>([]);
const [showAIModal, setShowAIModal] = useState(false);
const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
const [hasAutoGeneratedOnReview, setHasAutoGeneratedOnReview] = useState<boolean>(false);
```

**Uso:**
- Checkbox para ativar/desativar geração automática
- Botão "Gerar Descrição" na etapa de informações básicas
- Modal para visualizar e selecionar variações
- Auto-geração na etapa de revisão (se habilitado)

### Tipos TypeScript

**GenerateDescriptionRequest:**
```typescript
export interface GenerateDescriptionRequest {
  type: 'apartment' | 'house' | 'commercial' | 'land' | 'rural';
  city: string;
  neighborhood?: string;
  totalArea: number;
  builtArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  salePrice?: number;
  rentPrice?: number;
  condominiumFee?: number;
  iptu?: number;
  features?: string[];
  additionalInfo?: string;
  mcmvEligible?: boolean;
  mcmvIncomeRange?: 'faixa1' | 'faixa2' | 'faixa3';
  mcmvMaxValue?: number;
  mcmvSubsidy?: number;
  mcmvNotes?: string;
}
```

**GeneratedDescription:**
```typescript
export interface GeneratedDescription {
  title: string;
  description: string;
  highlights: string[];
}
```

### Dicas de Uso

1. **Preencha o máximo de campos possível** - Quanto mais informações, melhor a qualidade da descrição gerada
2. **Use informações adicionais** - O campo `additionalInfo` pode incluir detalhes especiais
3. **Revise sempre** - A IA gera boas descrições, mas revise e ajuste conforme necessário
4. **Combine múltiplas gerações** - Gere até 3 variações e escolha a melhor ou combine elementos
5. **Edite após gerar** - Use a descrição gerada como base e personalize

---

## 📊 Otimização de Portfólio com IA

### Visão Geral

A otimização de portfólio utiliza Inteligência Artificial para analisar propriedades e sugerir ações estratégicas para melhorar a performance, priorizar vendas e otimizar preços.

### Funcionalidades

- ✅ Análise completa do portfólio
- ✅ Priorização de propriedades
- ✅ Sugestões de preços otimizados
- ✅ Recomendações de ações estratégicas
- ✅ Previsão de tempo de venda
- ✅ Análise de risco
- ✅ Focos personalizados (vendas rápidas, maximizar lucro, balanceado)

### Endpoint da API

#### 25. Otimizar Portfólio

**Endpoint:**
```
POST /ai-assistant/analytics/portfolio-optimization
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```typescript
{
  focus: 'sales_speed' | 'profitability' | 'market_coverage' | 'balanced';  // Foco da otimização (obrigatório)
  propertyId?: string;  // ID específico (opcional, se não fornecido analisa todo portfólio)
}
```

**Focos Disponíveis:**
- `sales_speed` - Priorizar vendas rápidas
- `profitability` - Maximizar lucro e rentabilidade
- `market_coverage` - Cobertura de mercado
- `balanced` - Balanceado (padrão)

**Resposta (Única Propriedade):**
```typescript
{
  propertyId: string;
  propertyTitle: string;
  priorityScore: number;              // Score de prioridade (0-100)
  currentStatus: string;              // Status atual da propriedade
  recommendedActions: string[];       // Array de ações recomendadas
  currentPrice: number;               // Preço atual
  suggestedPrice?: number;            // Preço sugerido pela IA
  expectedImpact?: string;            // Impacto esperado
  estimatedSaleTime: number;          // Tempo estimado para venda (dias)
  prioritizationReason: string;       // Razão da priorização
  riskLevel: 'low' | 'medium' | 'high';  // Nível de risco
}
```

**Resposta (Múltiplas Propriedades - Array):**
```typescript
Array<PortfolioOptimizationResponse>
```

**Exemplo de Requisição:**
```typescript
// Otimizar portfólio completo com foco em vendas rápidas
await aiAssistantApi.optimizePortfolio({
  focus: 'sales_speed'
});

// Otimizar propriedade específica
await aiAssistantApi.optimizePortfolio({
  propertyId: 'uuid-da-propriedade',
  focus: 'balanced'
});
```

**Exemplo de Resposta:**
```typescript
[
  {
    propertyId: "abc-123",
    propertyTitle: "Apartamento 2 Quartos - Jardins",
    priorityScore: 85,
    currentStatus: "available",
    recommendedActions: [
      "Reduzir preço em 5% para acelerar venda",
      "Adicionar mais fotos (atualmente 3, sugerido mínimo 5)",
      "Melhorar descrição destacando localização privilegiada",
      "Atualizar status para featured"
    ],
    currentPrice: 450000,
    suggestedPrice: 427500,
    expectedImpact: "Redução de 15-20 dias no tempo médio de venda",
    estimatedSaleTime: 45,
    prioritizationReason: "Propriedade bem localizada com potencial de venda rápida, mas precisa de ajustes de preço e marketing",
    riskLevel: "low"
  }
]
```

### Hook: usePortfolioOptimization

**Localização:** `src/hooks/usePortfolioOptimization.ts`

**Interface:**
```typescript
interface UsePortfolioOptimizationReturn {
  optimize: (
    data: PortfolioOptimizationRequest
  ) => Promise<PortfolioOptimizationResponse | PortfolioOptimizationResponse[] | null>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  canRetry: boolean;
}
```

**Uso:**
```typescript
import { usePortfolioOptimization } from '../hooks/usePortfolioOptimization';

const { optimize, loading, error, clearError } = usePortfolioOptimization();

// Otimizar portfólio
const result = await optimize({
  focus: 'sales_speed'
});

if (result) {
  if (Array.isArray(result)) {
    console.log(`Análise de ${result.length} propriedades`);
    result.forEach(property => {
      console.log(`${property.propertyTitle}: Score ${property.priorityScore}`);
    });
  } else {
    console.log(`Propriedade: ${result.propertyTitle}`);
    console.log(`Ações recomendadas: ${result.recommendedActions.join(', ')}`);
  }
}
```

### Componente: PropertyOptimizationModal

**Localização:** `src/components/modals/PropertyOptimizationModal.tsx`

**Props:**
```typescript
interface PropertyOptimizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId?: string;  // Opcional: se fornecido, analisa apenas esta propriedade
  defaultFocus?: 'sales_speed' | 'profitability' | 'market_coverage' | 'balanced';
}
```

**Funcionalidades:**
- Seleção de foco (vendas rápidas, maximizar lucro, balanceado)
- Cooldown de 60 segundos entre execuções (para evitar abuso)
- Exibição de resultados com scores de prioridade
- Lista de ações recomendadas
- Preços sugeridos
- Tempo estimado de venda
- Análise de risco

### Página: PortfolioOptimizationPage

**Localização:** `src/pages/PortfolioOptimizationPage.tsx`

**Rota:** `/portfolio-optimization`

**Funcionalidades:**
- Análise completa do portfólio
- Visualização de todas as propriedades otimizadas
- Filtros e ordenação por score
- Ações recomendadas
- Comparação de preços (atual vs sugerido)

### Limitações e Regras

- **Cooldown:** 60 segundos entre execuções (proteção contra abuso)
- **Módulo Necessário:** `ai_assistant` deve estar habilitado
- **Dados Necessários:** Propriedades precisam ter dados suficientes (preço, localização, características)
- **Custo:** Pode ter custos associados dependendo do plano

### Integração

**Onde é usado:**
- Modal na página de detalhes da propriedade
- Página dedicada de otimização de portfólio
- Dashboard de propriedades (insights)

**Fluxo:**
1. Usuário abre modal ou acessa página
2. Seleciona foco (opcional)
3. Clica em "Executar Otimização"
4. Sistema analisa propriedade(s)
5. Exibe recomendações e sugestões
6. Usuário pode aplicar ações sugeridas

---

## 🔮 Análise Preditiva de Vendas (IA)

### Visão Geral

Análise preditiva que estima o tempo de venda e probabilidade de venda de propriedades usando IA, ajudando corretores a tomar decisões estratégicas.

### Endpoint da API

#### 26. Análise Preditiva de Vendas

**Endpoint:**
```
POST /ai-assistant/predictive/sales
```

**Body:**
```typescript
{
  propertyId?: string;        // ID específico (opcional)
  analysisType?: 'single' | 'bulk';  // Tipo de análise
}
```

**Resposta (Única Propriedade):**
```typescript
{
  propertyId: string;
  propertyTitle: string;
  estimatedDaysToSale: number;        // Dias estimados até venda
  probability30Days: number;          // Probabilidade de venda em 30 dias (0-100)
  probability60Days: number;          // Probabilidade de venda em 60 dias (0-100)
  probability90Days: number;          // Probabilidade de venda em 90 dias (0-100)
  suggestedPrice?: number;            // Preço sugerido para otimizar venda
  priceImpact?: string;               // Impacto da mudança de preço
  influencingFactors: string[];       // Fatores que influenciam a venda
  recommendations: string[];          // Recomendações estratégicas
}
```

**Resposta (Múltiplas Propriedades):**
```typescript
Array<PredictiveSalesResponse>
```

### Hook: usePredictiveSales

**Localização:** `src/hooks/usePredictiveSales.ts`

**Uso:**
```typescript
import { usePredictiveSales } from '../hooks/usePredictiveSales';

const { predict, loading, error } = usePredictiveSales();

const result = await predict({
  propertyId: 'uuid-da-propriedade',
  analysisType: 'single'
});
```

---

## 🚀 Próximas Melhorias

### Funcionalidades Planejadas
- [x] ~~Importação em massa (Excel/CSV)~~ ✅ Implementado
- [x] ~~Exportação de propriedades~~ ✅ Implementado
- [ ] Templates de propriedades
- [ ] Histórico de alterações
- [ ] Versões de propriedade
- [ ] Compartilhamento de propriedades
- [ ] Agendamento de publicações
- [ ] Análise de preços comparativos
- [ ] Sugestões de preço baseadas em IA

---

**Versão**: 1.0.0  
**Última Atualização**: 2024-01-20

