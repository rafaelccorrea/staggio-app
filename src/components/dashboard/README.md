# Componentes de Dashboard

## Reuso e continuidade

### Resumo Executivo

- **`DashboardResumoExecutivoSection`** – Seção reutilizável de resumo (receita, leads, previsão e, opcionalmente, dados de campanhas).
  - **Onde usar:** Dashboard inicial e tela Campanhas Meta (e futuras telas de integração que precisem do mesmo layout).
  - **Props:** `totalRevenue`, `leadsNow`, `metaStats`, `periodDays`, `showCampaignWidgets`.
  - **Dashboard inicial:** `showCampaignWidgets={false}` e `metaStats={null}` (dados de campanha só na tela Campanhas Meta).
  - **Campanhas Meta:** `showCampaignWidgets={true}` e `metaStats` preenchido com dados da página.

### Tipos compartilhados

- **`MetaOverviewStats`** – Em `src/types/dashboard.ts`. Use para calcular/typagem de receita por anúncios, campanhas ativas e CPL. Importar de `@/types/dashboard` ou `../../types/dashboard`.

### Estilos reutilizáveis

- **`ResumoExecutivoStyles.ts`** – Exporta `MetricStrip`, `MetricCard`, `MetricLabel`, `MetricValue`, `MetricIcon`, `ResumoBigCardsGrid`, `ResumoBigCard`, `ResumoBigCardTitle`, `ResumoBigCardValue`, `ResumoBigCardSub`. Use para novas seções de “resumo” ou métricas em destaque mantendo o mesmo visual.

### Boas práticas

1. Novos blocos de “resumo” ou KPIs em destaque devem preferir os estilos de `ResumoExecutivoStyles` para continuidade visual.
2. Tipos de dados do resumo (ex.: stats de outra integração) podem ser adicionados em `src/types/dashboard.ts` e reexportados pelo `index` de types.
3. Ao criar novas páginas de integração (ex.: outro canal de anúncios), reutilize `DashboardResumoExecutivoSection` com os dados da página e, se necessário, estenda as props de forma compatível (ex.: slot opcional para cards extras).
