# Roadmap – Dashboard Resumo Executivo

Documento de referência: modelo de dashboard que prioriza **receita e oportunidades**. O foco é abrir com indicadores que importam: dinheiro, leads e previsão; gráficos vêm em seguida.

---

## Princípio central

- **Nunca abrir o dashboard com gráficos.** Abrir com:
  1. **DINHEIRO** (receita, previsão, ROI)
  2. **OPORTUNIDADES** (alertas, imóveis quentes, bairros que convertem)
  3. **ALERTAS** (ações sugeridas)
- Gráficos vêm depois, como apoio.

---

## Fase 1 — Autoridade de Receita (prioridade)

| Item | Descrição | Status |
|------|-----------|--------|
| **Resumo "Hoje"** | Logo ao entrar: Receita (período), Leads entrando agora; na tela Campanhas Meta: Campanhas ativas, CPL. | ✅ Feito |
| **Widget Receita Influenciada por Anúncios** | "R$ X gerados nos últimos 90 dias via campanhas" (Meta). Exibido na tela Campanhas Meta. | ✅ Feito |
| **Previsão de Receita** | "Mantendo o ritmo atual, você deve vender R$ X nos próximos 60 dias." Projeção simples. | ✅ Feito |
| **Radar de Oportunidades** | Card automático: "X imóveis com alta chance de venda se anunciados" ou "Bairro X está convertendo Y% mais". | 🟡 Placeholder feito; conteúdo automático em backlog |

---

## Fase 2 — Previsibilidade

| Item | Descrição | Status |
|------|-----------|--------|
| **Score de imóveis** | Índice de liquidez (demanda, região, cliques, leads). Ex.: Liquidez 92/100. | ⬜ Backlog |
| **Previsão de demanda** | Uso de dados históricos para demanda por região/tipo. | ⬜ Backlog |
| **Recomendações** | "Onde investir", "qual imóvel anunciar", "quando aumentar orçamento". | ⬜ Backlog |

---

## Fase 3 — ROI e dependência

| Item | Descrição | Status |
|------|-----------|--------|
| **ROI Fechado** | Conexão anúncio → lead → venda. "Se eu sair daqui, fico cego." | ✅ ROAS + bloco ROI na tela Campanhas Meta |
| **Motor de Oportunidades** | Sistema sugere o que fazer; vira conselheiro. | ⬜ Backlog |
| **Histórico de Inteligência** | Sazonalidade, bairros líquidos, perfil comprador. Lock-in natural. | ⬜ Backlog |

---

## Fase 4 — Diferenciação

| Item | Descrição | Status |
|------|-----------|--------|
| **Índice de Liquidez do Imóvel** | Nota por demanda, região, cliques, leads. | ⬜ Backlog |
| **Índice de Velocidade de Venda** | "Tempo médio para vender imóveis similares: X dias." | ⬜ Backlog |
| **Simulador de Investimento** | "Quero investir R$ X/mês" → leads esperados, visitas, vendas prováveis, comissão. | ⬜ Backlog |
| **Benchmark de Mercado** | "Sua imobiliária converte X% acima da média" / "Seu CPL está X% menor." | ⬜ Backlog |
| **Mapa de Calor da Cidade** | Regiões quentes/médias/frias (geodados). | ⬜ Backlog |

---

## Ordem de exibição no dashboard (Fase 1)

1. **Seção Resumo Executivo** – Receita (período), Leads entrando agora; na tela Campanhas Meta: + Campanhas ativas, CPL.
2. **Widget Receita Influenciada por Anúncios** – Na tela Campanhas Meta: card com R$ dos últimos 90 dias via campanhas.
3. **Previsão de Receita** – Card: "Mantendo o ritmo, você deve vender R$ X nos próximos 60 dias."
4. **Radar de Oportunidades** – Card (placeholder ou primeira versão).
5. **Cards de estatísticas** – Propriedades, usuários, vendas, receita, etc.
6. **Gráficos** – Vendas, tipos, regiões, origens.

---

## Próximos passos (prioridade)

| Prioridade | Item | Onde |
|------------|------|------|
| 1 | Radar de oportunidades com dados reais (imóveis/bairros) | Fase 1 |
| 2 | Score de imóveis / índice de liquidez | Fase 2 |
| 3 | Recomendações (onde investir, qual imóvel anunciar) | Fase 2 |
| 4 | Motor de oportunidades + histórico de inteligência | Fase 3 |
| 5 | Simulador de investimento, benchmark, mapa de calor | Fase 4 |

Ver também: [CONTINUIDADE_INTEGRACAO_ANUNCIOS](./CONTINUIDADE_INTEGRACAO_ANUNCIOS.md) (feito / em andamento / a fazer).

---

## Pergunta de produto

Para cada feature: **"Isso fica melhor quanto mais dados eu tiver?"**  
Se sim → faça. Se não → repense.

Cada tela deve responder: *"Como faço essa imobiliária faturar mais?"*
