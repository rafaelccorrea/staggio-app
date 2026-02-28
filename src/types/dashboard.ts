/** Estatísticas de visão geral para dashboard / campanhas Meta (receita 90d, campanhas ativas, CPL). */
export interface MetaOverviewStats {
  revenueFromAds90d: number;
  activeCampaignsCount: number;
  cpl: number | null;
}
