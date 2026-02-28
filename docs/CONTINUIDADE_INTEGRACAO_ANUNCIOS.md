# Continuidade: Integração de Anúncios e Automação

Documento único de acompanhamento: **o que já foi feito**, **o que está em andamento** e **o que será feito**, alinhado às ideias de automação com integração de anúncios (Meta) e ao [Roadmap do Resumo Executivo](./ROADMAP_DASHBOARD_RESUMO_EXECUTIVO.md).

**Última atualização:** fevereiro/2026.

---

## Legenda de status

| Símbolo | Significado |
|--------|-------------|
| ✅ | Feito (implementado e em uso) |
| 🟡 | Em andamento ou parcial |
| ⬜ | Planejado / backlog |
| 🔶 | Depende de outra entrega |

---

## 1. O que já foi feito ✅

### 1.1 Integração Meta (configuração e campanhas)

| Item | Descrição |
|------|-----------|
| **Configuração da integração** | Conexão com contas de anúncios Meta (token, ad accounts), tela de config (`/integrations/meta-campaign/config`). |
| **CRUD de campanhas** | Criar, listar, pausar e editar campanhas via sistema; listagem com métricas (impressões, cliques, gasto, leads). |
| **Webhook de leads** | Endpoint GET/POST para Lead Ads; verificação por token por empresa; processamento de leadgen_id. |
| **Sincronização de leads no CRM** | Ao receber lead no webhook: busca detalhes na API Meta, localiza redirecionamento campanha→funil, **cria tarefa no Kanban** com `metaCampaignId`, origem e nome da campanha. |
| **Redirecionamento campanha → funil** | Configuração por campanha: escolha de funil (projeto Kanban), responsável, tags pós-lead e nota automática. |
| **Automação pós-lead** | Tags e nota configuráveis aplicadas à tarefa ao criar lead (postLeadTagIds, postLeadNote). |
| **Estatísticas de leads no CRM** | Total de leads Meta no CRM, por campanha e por mês (período 7d/30d/90d). |
| **ROAS (receita por campanha)** | Backend: gasto por campanha (Meta) vs receita (soma de `totalValue` de tarefas fechadas como venda com mesmo `metaCampaignId`). Endpoint `GET campaigns/roas`. |
| **Bloco ROI na tela Campanhas Meta** | Seção "ROI do período": faturamento gerado (vendas vinculadas), gasto em anúncios, ROAS (ratio), CPL. Dados do período selecionado. |
| **Tela Campanhas Meta** | Página dedicada: listagem de campanhas, filtros, métricas, gráficos, redirect por campanha, export CSV, criação de campanha. |
| **Resumo executivo na tela Campanhas Meta** | Seção com receita (período), leads, campanhas ativas, CPL, receita influenciada por anúncios (90d), previsão de receita (ver [ROADMAP_DASHBOARD_RESUMO_EXECUTIVO](./ROADMAP_DASHBOARD_RESUMO_EXECUTIVO.md)). |

### 1.2 Dashboard e resumo executivo

| Item | Descrição |
|------|-----------|
| **Resumo executivo no dashboard inicial** | Seção “Resumo Executivo”: receita (período), leads entrando agora, previsão de receita (60d), radar de oportunidades (placeholder). Sem dados de campanhas no dashboard inicial (ficam na tela Campanhas Meta). |
| **Componentes reutilizáveis** | `DashboardResumoExecutivoSection`, estilos em `ResumoExecutivoStyles.ts`, tipos em `types/dashboard.ts` (ex.: `MetaOverviewStats`). Documentação em `components/dashboard/README.md`. |

### 1.3 Infra e rastreabilidade

| Item | Descrição |
|------|-----------|
| **Log de webhook** | Tabela e registro de chamadas ao webhook de leads para auditoria. |
| **Token de webhook por empresa** | Cada empresa pode ter seu token na URL do webhook e token de verificação. |

---

## 2. O que está em andamento 🟡

| Item | Descrição | Observação |
|------|-----------|------------|
| **Radar de oportunidades** | Card existe como placeholder (“Em breve: imóveis com alta chance…”). Conteúdo real ainda não implementado. | Ver Fase 1 do [ROADMAP_DASHBOARD_RESUMO_EXECUTIVO](./ROADMAP_DASHBOARD_RESUMO_EXECUTIVO.md). |
| **Disparo WhatsApp ao receber lead** | Fluxo “criar tarefa + disparar WhatsApp” não está descrito como feito; depende de integração com canal WhatsApp. | Confirmar se já existe fluxo automático WhatsApp pós-lead; se não, manter como “em andamento” ou “a fazer”. |

---

## 3. O que será feito (planejado) ⬜

Ideias da doc “Automação com Integração de Anúncios” mapeadas em **feito / em andamento / a fazer**.

### 3.1 Criação e criativos

| # | Ideia | Status | Notas |
|---|--------|--------|--------|
| 1 | **Criação automática de campanhas a partir de imóvel em destaque** | ⬜ | Ao marcar imóvel como “destaque”: criar campanha, criativo (foto, preço, bairro, CTA), segmentação por localização. |
| 4 | **Geração de criativos dinâmicos** | ⬜ | Templates automáticos (headline, imagem), testes A/B, aprendizado de padrões que convertem. |

### 3.2 Otimização e score

| # | Ideia | Status | Notas |
|---|--------|--------|--------|
| 2 | **Otimizador inteligente de campanhas** | ⬜ | Worker/scheduler: analisar métricas e regras (ex.: CPA alto → pausar; CTR alto → aumentar orçamento; frequência alta → trocar criativo). |
| 3 | **Score de imóveis para investimento em ads (Ad Score)** | ⬜ | Algoritmo: taxa de cliques, leads, tempo no estoque, faixa de preço, região → sugerir “Este imóvel tem alto potencial — recomendamos anunciar.” Alinhado ao “Score de imóveis” e “Índice de Liquidez” do roadmap. |

### 3.3 Sincronização e ROI

| # | Ideia | Status | Notas |
|---|--------|--------|--------|
| 5 | **Sincronização total de leads** | 🟡 | Já: criar no CRM, vincular responsável, registrar origem. Pendente/confirmar: disparo WhatsApp automático e fluxo de follow-up. |
| 6 | **Dashboard de ROI** | ✅ | Bloco "ROI do período" na tela Campanhas Meta: faturamento gerado, gasto, ROAS, CPL. |

### 3.4 Multi-tenant e automações de estoque

| # | Ideia | Status | Notas |
|---|--------|--------|--------|
| 7 | **Multi-tenant Ads Manager (premium)** | ⬜ | Cada imobiliária com campanhas próprias, relatórios isolados, limites de orçamento, permissões. Possível plano “Growth — Gestão Inteligente de Anúncios”. |
| 8 | **Automação para imóveis parados** | ⬜ | Regra: imóvel parado 60/90 dias → sugerir campanha e orçamento; alerta “Deseja anunciar com orçamento sugerido R$ X?”. |

### 3.5 Previsão e diferencial

| # | Ideia | Status | Notas |
|---|--------|--------|--------|
| 9 | **Previsão de demanda** | ⬜ | Bairros com maior conversão, tipologias com mais procura, faixas de preço ideais; sugerir onde investir mídia. Alinhado à Fase 2 do roadmap (Previsibilidade). |
| — | **Campanhas autônomas** | ⬜ | Modo opcional: imobiliária define orçamento, regiões e tipo de imóvel; sistema gerencia o resto. |

### 3.6 Roadmap Resumo Executivo (cross-reference)

Itens do [ROADMAP_DASHBOARD_RESUMO_EXECUTIVO](./ROADMAP_DASHBOARD_RESUMO_EXECUTIVO.md) ainda não fechados:

- **Fase 1:** Radar de oportunidades (conteúdo real) — 🟡/⬜.
- **Fase 2:** Score de imóveis, previsão de demanda, recomendações — ⬜.
- **Fase 3:** Motor de oportunidades, histórico de inteligência — ⬜.
- **Fase 4:** Índice de liquidez, velocidade de venda, simulador de investimento, benchmark de mercado, mapa de calor — ⬜.

---

## 4. Recomendações técnicas (doc original)

Para quando implementar otimizador, criativos e campanhas autônomas:

- **Worker** para análise de métricas (fila).
- **Scheduler** para otimizações periódicas.
- **Serviço de refresh de token** (já existe camada de config; garantir renovação automática).
- **Camada de abstração da API** (já existe `MetaApiClient` / proxy no backend).
- **Logs detalhados** (webhook já tem log; estender para decisões de otimização).
- Módulos separados: `ads-integration`, `campaign-optimizer`, `lead-sync`, `creative-generator`, sem acoplar ao domínio principal do CRM.

---

## 5. Estratégia de produto (doc original)

- **Não vender como:** “Integração com anúncios”.
- **Vender como:** **Motor de geração de compradores.**

Isso aumenta valor percebido e margem para cobrança (ex.: plano Growth).

---

## 6. Como usar este doc

- **Feito:** use como checklist do que já está entregue e como referência para manutenção e testes.
- **Em andamento:** priorize o que falta fechar (ex.: Radar de oportunidades com dados reais).
- **A fazer:** use a numeração (#1–#9 e itens do roadmap) para planejar sprints e alinhar com o produto (ex.: “Motor de geração de compradores”).

Atualize este arquivo sempre que um item mudar de “em andamento” para “feito” ou quando novos itens forem priorizados.
