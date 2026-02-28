/**
 * Estilos reutilizáveis para a seção Resumo Executivo (dashboard e telas de integração).
 * Continuidade: mesmo layout e tokens em Dashboard inicial e Campanhas Meta.
 */
import styled from 'styled-components';

/** Grid de cards de métricas (2 ou 4 colunas conforme breakpoint) */
export const MetricStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 20px;
  }
`;

export const MetricCard = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  padding: 18px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

export const MetricLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 6px;
`;

export const MetricValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  line-height: 1.2;

  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

export const MetricIcon = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${p => `${p.$color}18`};
  color: ${p => p.$color};
  margin-bottom: 8px;
`;

/** Grid para os cards grandes (Receita anúncios + Previsão) */
export const ResumoBigCardsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 20px;
  }
`;

export const ResumoBigCard = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
`;

export const ResumoBigCardTitle = styled.div`
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 8px;
`;

export const ResumoBigCardValue = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: ${props => props.theme.colors.text};
  line-height: 1.2;

  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

export const ResumoBigCardSub = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-top: 6px;
`;
