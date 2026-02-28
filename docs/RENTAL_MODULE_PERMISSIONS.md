# Módulo de Locações – Permissões e Rotas

Revisão do permissionamento do módulo de locações (aluguéis), incluindo Drawer, rotas e páginas.

## Módulo da empresa

- **ID:** `rental_management` (aliases: `rentals`, `rental`)
- **Nome:** Gestão de Aluguéis
- Todas as rotas de locações e a rota de cotação de seguro (`/insurance/quote`) exigem que a **empresa** tenha o módulo `rental_management` (`ModuleRoute`).

## Regra no Drawer (view + ação)

Um item do menu só aparece se o usuário tiver:

1. **Permissão de visualização** do módulo (ex.: `rental:view`, `rental:view_dashboard`)
2. **Pelo menos uma permissão de ação** do mesmo módulo (ex.: `rental:create`, `rental:update`, `rental:manage_payments`)

Quem tem só `rental:view` (e nenhuma ação) **não** vê itens de Locações no Drawer.

## Permissões do módulo rental

| Permissão | Uso |
|-----------|-----|
| `rental:view` | Listar e ver detalhes de locações |
| `rental:view_dashboard` | Acessar dashboard de locações |
| `rental:view_financials` | Ver dados financeiros (dashboard e detalhes) |
| `rental:create` | Criar nova locação |
| `rental:update` | Editar locação |
| `rental:delete` | Excluir locação |
| `rental:manage_payments` | Criar parcelas, gerar cobranças, marcar como pago, cancelar cobranças |
| `rental:manage_workflows` | Aprovar/rejeitar locações e configurar fluxos |
| `rental:approve` | Aprovar criação de aluguéis |

## Itens do Drawer (menu Locações)

| Item | Rota | Permissão / Regra | Módulo empresa |
|------|------|-------------------|----------------|
| Dashboard | `/rentals/dashboard` | `rental:view_dashboard` + uma ação rental | rental_management |
| Gestão de Locações | `/rentals` | `rental:view` + uma ação rental | rental_management |
| Inquilinos | `/clients?type=renter` | **customPermission:** (rental:view OU view_dashboard OU view_financials) **e** (client:view ou read) **e** (pelo menos uma ação client) | rental_management |
| Seguros | `/insurance/quote` | `insurance:create_quote` (regra: insurance:view + uma ação insurance) | rental_management |
| Fluxos de Locação | `/settings/rental-workflows` | `rental:manage_workflows` + view rental | rental_management |
| Análise de Crédito | `/credit-analysis` | `credit_analysis:view` + ação | credit_and_collection |
| Régua de Cobrança | `/collection` | `collection:view` + ação | credit_and_collection |

## Rotas protegidas (App.tsx)

Todas exigem **módulo da empresa** (quando indicado) + **permissão**:

| Rota | Módulo | Permissão |
|------|--------|-----------|
| `/rentals` | rental_management | rental:view |
| `/rentals/new` | rental_management | rental:create |
| `/rentals/:id` | rental_management | rental:view |
| `/rentals/:id/edit` | rental_management | rental:update |
| `/rentals/dashboard` | rental_management | rental:view_dashboard |
| `/insurance/quote` | rental_management | insurance:create_quote |
| `/settings/rentals` | rental_management | rental:manage_workflows |
| `/settings/rental-workflows` | rental_management | rental:manage_workflows |
| `/settings/rental-workflows/new` | rental_management | rental:manage_workflows |
| `/settings/rental-workflows/:id/edit` | rental_management | rental:manage_workflows |
| `/credit-analysis` | credit_and_collection | credit_analysis:view |
| `/credit-analysis/settings` | credit_and_collection | credit_analysis:review |
| `/collection` | credit_and_collection | collection:view |
| `/collection/rules` | credit_and_collection | collection:manage |
| `/collection/rules/new` | credit_and_collection | collection:manage |
| `/collection/rules/:id` | credit_and_collection | collection:manage |

## Páginas – checagens internas

### RentalsPage

- Botões e links: `PermissionButton` com `rental:create`, `rental:manage_workflows`; `hasPermission('rental:manage_payments')`, `rental:update`, `rental:delete` nos itens da lista.
- Aprovar/rejeitar: `hasPermission('rental:manage_workflows')`.

### RentalDetailsPage

- Cabeçalho: `PermissionButton` para Editar (`rental:update`) e Excluir (`rental:delete`).
- Seção **Parcelas e cobranças:** botões "Criar parcelas" / "Criar parcela", barra de ações em lote e menu por linha (Gerar cobrança, Editar/Excluir cobrança, Marcar como pago) só são exibidos se `hasPermission('rental:manage_payments')`.

### RentalDashboardPage

- Blocos de dados financeiros: `hasPermission('rental:view_financials')`.
- Botão "Nova locação": `PermissionButton` com `rental:create`.

## Módulo Análise de Crédito e Cobrança

- **ID:** `credit_and_collection`
- Itens do Drawer (Análise de Crédito, Régua de Cobrança) e rotas acima só aparecem/acessam se a empresa tiver o módulo `credit_and_collection` e o usuário tiver a permissão correspondente (e, no Drawer, view + uma ação).
