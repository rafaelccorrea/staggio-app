import React from 'react';
import { Link } from 'react-router-dom';
import { MdAttachMoney, MdTrendingUp, MdCampaign, MdPeople, MdHome, MdAdsClick } from 'react-icons/md';
import { formatCurrency } from '../../utils/formatNumbers';
import type { MetaOverviewStats } from '../../types/dashboard';
import { InfoTooltip } from '../common/InfoTooltip';
import {
  MetricStrip,
  MetricCard,
  MetricLabel,
  MetricValue,
  MetricIcon,
  ResumoBigCardsGrid,
  ResumoBigCard,
  ResumoBigCardTitle,
  ResumoBigCardValue,
  ResumoBigCardSub,
} from './ResumoExecutivoStyles';
import styled from 'styled-components';

const LabelWithTooltip = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const RevenueInfluencedCard = styled(ResumoBigCard)`
  border-left: 4px solid ${props => props.theme.colors.primary};
`;

const RevenueForecastCard = styled(ResumoBigCard)`
  border-left: 4px solid #10b981;
`;

const OpportunityPlaceholder = styled(ResumoBigCard)`
  border-left: 4px solid #8b5cf6;
  margin-bottom: 24px;
`;

const RadarActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 14px;
`;

const RadarLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${p => p.theme.colors.primary};
  text-decoration: none;
  padding: 8px 14px;
  border-radius: 8px;
  background: ${p => p.theme.colors.primary}14;
  transition: background 0.2s, color 0.2s;
  &:hover {
    background: ${p => p.theme.colors.primary}22;
    color: ${p => p.theme.colors.primary};
  }
`;

export type { MetaOverviewStats };

export interface DashboardResumoExecutivoSectionProps {
  /** Receita total do período (usado no card "Receita" e na previsão) */
  totalRevenue: number;
  /** Leads que entram "agora" (ex.: novos hoje) */
  leadsNow: number;
  /** Estatísticas opcionais da Meta (Receita 90d, campanhas ativas, CPL) — usar na tela Campanhas Meta */
  metaStats: MetaOverviewStats | null;
  /** Número de dias do período selecionado (para previsão: (totalRevenue/days)*60) */
  periodDays: number;
  /** Exibir cards de campanhas (Campanhas ativas, CPL, Receita por anúncios). false = dashboard inicial; true = tela Campanhas Meta */
  showCampaignWidgets?: boolean;
  /** Número de imóveis em destaque (para o Radar). Quando definido, o card mostra o número e links acionáveis. */
  radarFeaturedCount?: number;
  /** Meta já conectada (token/config). Quando true e receita 0, mostra mensagem de "nenhuma venda vinculada" em vez de "Conecte a Meta". */
  metaConnected?: boolean;
}

export const DashboardResumoExecutivoSection: React.FC<DashboardResumoExecutivoSectionProps> = ({
  totalRevenue,
  leadsNow,
  metaStats,
  periodDays,
  showCampaignWidgets = true,
  radarFeaturedCount,
  metaConnected = false,
}) => {
  const forecast60d =
    periodDays > 0 ? (totalRevenue / periodDays) * 60 : 0;
  const hasFeaturedData = typeof radarFeaturedCount === 'number';

  return (
    <>
      <MetricStrip>
        <MetricCard title="Receita total do período selecionado (vendas fechadas)">
          <MetricIcon $color="#10b981">
            <MdAttachMoney size={20} />
          </MetricIcon>
          <LabelWithTooltip>
            <MetricLabel>Receita (período)</MetricLabel>
            <InfoTooltip content="Receita total do período selecionado (vendas fechadas)" direction="top-right" />
          </LabelWithTooltip>
          <MetricValue>{formatCurrency(totalRevenue)}</MetricValue>
        </MetricCard>
        <MetricCard title="Leads novos que entraram recentemente (ex.: hoje)">
          <MetricIcon $color="#3B82F6">
            <MdPeople size={20} />
          </MetricIcon>
          <LabelWithTooltip>
            <MetricLabel>Leads entrando agora</MetricLabel>
            <InfoTooltip content="Leads novos que entraram recentemente (ex.: hoje)" direction="top-right" />
          </LabelWithTooltip>
          <MetricValue>{leadsNow}</MetricValue>
        </MetricCard>
        {showCampaignWidgets && (
          <>
            <MetricCard title="Quantidade de campanhas ativas na Meta no momento">
              <MetricIcon $color="#F59E0B">
                <MdCampaign size={20} />
              </MetricIcon>
              <LabelWithTooltip>
                <MetricLabel>Campanhas ativas</MetricLabel>
                <InfoTooltip content="Quantidade de campanhas ativas na Meta no momento" direction="top-right" />
              </LabelWithTooltip>
              <MetricValue>
                {metaStats != null ? metaStats.activeCampaignsCount : '—'}
              </MetricValue>
            </MetricCard>
            <MetricCard title="Custo médio por lead na Meta (gasto ÷ leads)">
              <MetricIcon $color="#8B5CF6">
                <MdTrendingUp size={20} />
              </MetricIcon>
              <LabelWithTooltip>
                <MetricLabel>CPL (custo por lead)</MetricLabel>
                <InfoTooltip content="Custo médio por lead na Meta (gasto ÷ leads)" direction="top-right" />
              </LabelWithTooltip>
              <MetricValue>
                {metaStats?.cpl != null
                  ? formatCurrency(metaStats.cpl)
                  : '—'}
              </MetricValue>
            </MetricCard>
          </>
        )}
      </MetricStrip>

      <ResumoBigCardsGrid>
        {showCampaignWidgets && (
          <RevenueInfluencedCard title="Receita gerada por vendas vinculadas às campanhas da Meta (últimos 90 dias)">
            <LabelWithTooltip>
              <ResumoBigCardTitle>💸 Receita influenciada por anúncios</ResumoBigCardTitle>
              <InfoTooltip content="Receita gerada por vendas vinculadas às campanhas da Meta (últimos 90 dias)" direction="top-right" />
            </LabelWithTooltip>
            <ResumoBigCardValue>
              {metaStats != null && metaStats.revenueFromAds90d > 0
                ? formatCurrency(metaStats.revenueFromAds90d)
                : '—'}
            </ResumoBigCardValue>
            <ResumoBigCardSub>
              {metaStats != null && metaStats.revenueFromAds90d > 0
                ? 'Gerados nos últimos 90 dias via campanhas (Meta)'
                : metaConnected
                  ? 'Nenhuma venda fechada vinculada às campanhas no período. Feche tarefas do funil como "venda ganha" com valor para ver aqui.'
                  : 'Conecte a Meta em Integrações para ver o impacto das campanhas'}
            </ResumoBigCardSub>
          </RevenueInfluencedCard>
        )}
        <RevenueForecastCard title="Projeção de receita nos próximos 60 dias mantendo o ritmo atual">
          <LabelWithTooltip>
            <ResumoBigCardTitle>📈 Previsão de receita</ResumoBigCardTitle>
            <InfoTooltip content="Projeção de receita nos próximos 60 dias mantendo o ritmo atual" direction="top-right" />
          </LabelWithTooltip>
          <ResumoBigCardValue>{formatCurrency(forecast60d)}</ResumoBigCardValue>
          <ResumoBigCardSub>
            Mantendo o ritmo atual, você deve vender esse valor nos próximos 60 dias
          </ResumoBigCardSub>
        </RevenueForecastCard>
      </ResumoBigCardsGrid>

      <OpportunityPlaceholder title="Imóveis em destaque para usar em campanhas">
        <LabelWithTooltip>
          <ResumoBigCardTitle>🎯 Radar de oportunidades</ResumoBigCardTitle>
          <InfoTooltip content="Imóveis em destaque para usar em campanhas na Meta" direction="top-right" />
        </LabelWithTooltip>
        {hasFeaturedData ? (
          <>
            <ResumoBigCardValue style={{ fontSize: '1.75rem', marginBottom: 4 }}>
              {radarFeaturedCount === 0
                ? 'Nenhum imóvel em destaque'
                : radarFeaturedCount === 1
                  ? '1 imóvel em destaque'
                  : `${radarFeaturedCount} imóveis em destaque`}
            </ResumoBigCardValue>
            <ResumoBigCardSub>
              Imóveis marcados como destaque são bons candidatos para campanhas. Veja a lista ou crie campanhas na Meta.
            </ResumoBigCardSub>
            <RadarActions>
              <RadarLink to="/properties">
                <MdHome size={18} />
                Ver imóveis
              </RadarLink>
              <RadarLink to="/integrations/meta-campaign/campaigns">
                <MdAdsClick size={18} />
                Campanhas Meta
              </RadarLink>
            </RadarActions>
          </>
        ) : (
          <>
            <ResumoBigCardSub>
              Imóveis em destaque e bairros que convertem: use os links abaixo para ver imóveis e criar campanhas.
            </ResumoBigCardSub>
            <RadarActions>
              <RadarLink to="/properties">
                <MdHome size={18} />
                Ver imóveis
              </RadarLink>
              <RadarLink to="/integrations/meta-campaign/campaigns">
                <MdAdsClick size={18} />
                Campanhas Meta
              </RadarLink>
            </RadarActions>
          </>
        )}
      </OpportunityPlaceholder>
    </>
  );
};

export default DashboardResumoExecutivoSection;
