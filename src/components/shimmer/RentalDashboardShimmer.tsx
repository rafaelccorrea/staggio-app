import React from 'react';
import styled, { keyframes } from 'styled-components';

const shimmerWave = keyframes`
  0% { background-position: -140px 0; }
  100% { background-position: calc(140px + 100%) 0; }
`;

const ShimmerBase = styled.div<{
  $width?: string;
  $height?: string;
  $radius?: string;
  $delay?: number;
}>`
  background: linear-gradient(
    105deg,
    ${(p) => p.theme.colors.backgroundSecondary} 0%,
    ${(p) => p.theme.colors.backgroundSecondary} 36%,
    rgba(255, 255, 255, 0.12) 50%,
    ${(p) => p.theme.colors.backgroundSecondary} 64%,
    ${(p) => p.theme.colors.backgroundSecondary} 100%
  );
  background-size: 140px 100%;
  animation: ${shimmerWave} 2.2s ease-in-out infinite;
  animation-delay: ${(p) => ((p.$delay ?? 0) * 0.06)}s;
  width: ${(p) => p.$width ?? '100%'};
  height: ${(p) => p.$height ?? '20px'};
  border-radius: ${(p) => p.$radius ?? '8px'};
`;

const Container = styled.div`
  padding: 20px 24px;
  max-width: 1400px;
  margin: 0 auto;
  @media (min-width: 768px) {
    padding: 24px 28px;
  }
  @media (min-width: 1024px) {
    padding: 24px 32px;
  }
`;

const Header = styled.div`
  margin-bottom: 24px;
  @media (min-width: 768px) {
    margin-bottom: 32px;
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  @media (min-width: 768px) {
    gap: 20px;
    margin-bottom: 32px;
  }
`;

const MetricCard = styled.div`
  background: ${(p) => p.theme.colors.cardBackground};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border-left: 4px solid ${(p) => p.theme.colors.primary};
  @media (min-width: 768px) {
    padding: 24px;
  }
`;

const Section = styled.section`
  background: ${(p) => p.theme.colors.cardBackground};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  @media (min-width: 768px) {
    padding: 24px;
  }
`;

const SectionTitle = styled.div`
  margin-bottom: 16px;
  @media (min-width: 768px) {
    margin-bottom: 20px;
  }
`;

const PaymentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  @media (min-width: 768px) {
    gap: 16px;
  }
`;

const PaymentCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: ${(p) => p.theme.colors.backgroundSecondary};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: 8px;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin-bottom: 24px;
  @media (min-width: 968px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const ChartContainer = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 200px;
  gap: 8px;
  margin-bottom: 16px;
`;

const StatusList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: ${(p) => p.theme.colors.backgroundSecondary};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: 8px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px;
  background: ${(p) => p.theme.colors.backgroundSecondary};
  border-bottom: 2px solid ${(p) => p.theme.colors.border};
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid ${(p) => p.theme.colors.border};
`;

export const RentalDashboardShimmer: React.FC = () => {
  return (
    <Container>
      <Header>
        <ShimmerBase $width="280px" $height="28px" $radius="8px" $delay={0} style={{ marginBottom: 8 }} />
        <ShimmerBase $width="320px" $height="14px" $delay={1} />
      </Header>

      {/* 4 cards de métricas */}
      <MetricsGrid>
        {[0, 1, 2, 3].map((i) => (
          <MetricCard key={i}>
            <ShimmerBase $width="40px" $height="40px" $radius="8px" $delay={2 + i * 4} />
            <div style={{ flex: 1 }}>
              <ShimmerBase $height="14px" $width="70%" $delay={3 + i * 4} style={{ marginBottom: 8 }} />
              <ShimmerBase $height="28px" $width="50%" $delay={4 + i * 4} style={{ marginBottom: 8 }} />
              <ShimmerBase $height="12px" $width="90%" $delay={5 + i * 4} />
            </div>
          </MetricCard>
        ))}
      </MetricsGrid>

      {/* Pagamentos do mês */}
      <Section>
        <SectionTitle>
          <ShimmerBase $width="220px" $height="18px" $delay={18} />
        </SectionTitle>
        <PaymentsGrid>
          {[0, 1, 2].map((i) => (
            <PaymentCard key={i}>
              <ShimmerBase $width="32px" $height="32px" $radius="8px" $delay={19 + i * 2} />
              <div style={{ flex: 1 }}>
                <ShimmerBase $height="13px" $width="60%" $delay={20 + i * 2} style={{ marginBottom: 8 }} />
                <ShimmerBase $height="20px" $width="80%" $delay={21 + i * 2} />
              </div>
            </PaymentCard>
          ))}
        </PaymentsGrid>
      </Section>

      {/* Gráfico + Pagamentos por status */}
      <GridContainer>
        <Section style={{ marginBottom: 0 }}>
          <SectionTitle>
            <ShimmerBase $width="240px" $height="18px" $delay={25} />
          </SectionTitle>
          <ChartContainer>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: '100%', justifyContent: 'center' }}>
                  <ShimmerBase
                    $width="20px"
                    $height={`${30 + (i % 3) * 25}%`}
                    $radius="4px"
                    $delay={26 + i}
                  />
                  <ShimmerBase
                    $width="20px"
                    $height={`${20 + (i % 2) * 30}%`}
                    $radius="4px"
                    $delay={32 + i}
                  />
                </div>
                <ShimmerBase $width="100%" $height="11px" $delay={38 + i} />
              </div>
            ))}
          </ChartContainer>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <ShimmerBase $width="60px" $height="16px" $delay={44} />
            <ShimmerBase $width="70px" $height="16px" $delay={45} />
          </div>
        </Section>

        <Section style={{ marginBottom: 0 }}>
          <SectionTitle>
            <ShimmerBase $width="180px" $height="18px" $delay={46} />
          </SectionTitle>
          <StatusList>
            {[0, 1, 2, 3].map((i) => (
              <StatusItem key={i}>
                <ShimmerBase $width="24px" $height="24px" $radius="6px" $delay={47 + i * 3} />
                <div style={{ flex: 1 }}>
                  <ShimmerBase $height="14px" $width="60%" $delay={48 + i * 3} style={{ marginBottom: 6 }} />
                  <ShimmerBase $height="12px" $width="40%" $delay={49 + i * 3} />
                </div>
                <ShimmerBase $width="70px" $height="16px" $delay={50 + i * 3} />
              </StatusItem>
            ))}
          </StatusList>
        </Section>
      </GridContainer>

      {/* Locações recentes - tabela */}
      <Section>
        <SectionTitle>
          <ShimmerBase $width="180px" $height="18px" $delay={60} />
        </SectionTitle>
        <Table>
          <thead>
            <tr>
              <Th><ShimmerBase $height="13px" $width="80%" $delay={61} /></Th>
              <Th><ShimmerBase $height="13px" $width="70%" $delay={62} /></Th>
              <Th><ShimmerBase $height="13px" $width="60%" $delay={63} /></Th>
              <Th><ShimmerBase $height="13px" $width="50%" $delay={64} /></Th>
              <Th><ShimmerBase $height="13px" $width="40%" $delay={65} /></Th>
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3, 4].map((row) => (
              <tr key={row}>
                <Td><ShimmerBase $height="14px" $width="90%" $delay={66 + row * 5} /></Td>
                <Td><ShimmerBase $height="14px" $width="75%" $delay={67 + row * 5} /></Td>
                <Td><ShimmerBase $height="14px" $width="50%" $delay={68 + row * 5} /></Td>
                <Td><ShimmerBase $height="14px" $width="45%" $delay={69 + row * 5} /></Td>
                <Td><ShimmerBase $height="24px" $width="70px" $radius="12px" $delay={70 + row * 5} /></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Section>
    </Container>
  );
};
