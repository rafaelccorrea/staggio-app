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
    ${props => props.theme.colors.backgroundSecondary} 0%,
    ${props => props.theme.colors.backgroundSecondary} 36%,
    rgba(255, 255, 255, 0.15) 50%,
    ${props => props.theme.colors.backgroundSecondary} 64%,
    ${props => props.theme.colors.backgroundSecondary} 100%
  );
  background-size: 140px 100%;
  animation: ${shimmerWave} 2.2s ease-in-out infinite;
  animation-delay: ${props => (props.$delay ?? 0) * 0.06}s;
  width: ${props => props.$width || '100%'};
  height: ${props => props.$height || '20px'};
  border-radius: ${props => props.$radius || '8px'};
`;

/* Mesmo padding da página (PageContainer) */
const Container = styled.div`
  padding: 12px;
  width: 100%;
  box-sizing: border-box;
  @media (min-width: 480px) {
    padding: 16px;
  }
  @media (min-width: 600px) {
    padding: 20px;
  }
  @media (min-width: 768px) {
    padding: 20px 24px;
  }
  @media (min-width: 960px) {
    padding: 24px 28px;
  }
  @media (min-width: 1024px) {
    padding: 24px 32px;
  }
`;

const BackButtonShimmer = styled(ShimmerBase)`
  width: 120px;
  height: 44px;
  border-radius: 8px;
  margin-bottom: 16px;
  @media (min-width: 768px) {
    margin-bottom: 20px;
  }
`;

/* Header: sempre coluna — título em cima, botões embaixo */
const HeaderRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
  @media (min-width: 768px) {
    gap: 20px;
    margin-bottom: 24px;
  }
  @media (min-width: 1024px) {
    margin-bottom: 28px;
  }
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const ToolbarRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  width: 100%;
  @media (min-width: 768px) {
    gap: 10px 12px;
  }
  @media (min-width: 1024px) {
    gap: 12px;
  }
`;

const StatusBarShimmer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 20px;
  padding: 12px 16px;
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 10px;
  margin-bottom: 20px;
`;

const InfoBoxShimmer = styled.div`
  padding: 16px 0;
  margin-bottom: 24px;
`;

/* Abas: Campanhas | Análise */
const TabsWrapShimmer = styled.nav`
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  border-bottom: 2px solid ${props => props.theme.colors.border};
  @media (min-width: 768px) {
    margin-bottom: 24px;
  }
`;

const TabShimmer = styled(ShimmerBase)`
  width: 140px;
  height: 44px;
  border-radius: 0;
  margin-bottom: -2px;
  @media (min-width: 768px) {
    width: 160px;
    height: 48px;
  }
`;

/* Seção Filtros */
const SectionCard = styled.section`
  margin-bottom: 28px;
  @media (min-width: 768px) {
    margin-bottom: 32px;
  }
`;

const SectionTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  @media (min-width: 600px) {
    margin-bottom: 18px;
  }
`;

const FiltersSectionShimmer = styled.div`
  padding: 18px 20px;
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  @media (max-width: 480px) {
    padding: 14px 12px;
  }
  @media (min-width: 768px) {
    padding: 20px 24px;
  }
`;

const FilterRowShimmer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px 24px;
  width: 100%;
  @media (min-width: 768px) {
    gap: 16px 26px;
  }
`;

/* Resumo das campanhas */
const SummaryStripShimmer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 24px;
  padding: 16px 20px;
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  @media (min-width: 768px) {
    padding: 18px 22px;
    gap: 14px 26px;
  }
`;

/* Tabela */
const TableScrollHintShimmer = styled(ShimmerBase)`
  width: 280px;
  height: 14px;
  margin-bottom: 8px;
  @media (min-width: 768px) {
    margin-bottom: 10px;
  }
`;

const TableWrapShimmer = styled.div`
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  overflow: hidden;
  background: ${props => props.theme.colors.cardBackground};
`;

const Table = styled.table`
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
  font-size: 0.8125rem;
  @media (min-width: 768px) {
    font-size: 0.875rem;
  }
`;

const Th = styled.th`
  text-align: left;
  padding: 14px 16px;
  border-bottom: 2px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.backgroundSecondary};
  @media (min-width: 768px) {
    padding: 14px 18px;
  }
`;

const Td = styled.td`
  padding: 12px 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  @media (min-width: 768px) {
    padding: 14px 18px;
  }
`;

const tableColumns = [
  { w: '52px' },
  { w: '160px' },
  { w: '100px' },
  { w: '90px' },
  { w: '80px' },
  { w: '90px' },
  { w: '70px' },
  { w: '80px' },
  { w: '70px' },
  { w: '140px' },
  { w: '140px' },
  { w: '200px' },
  { w: '100px' },
  { w: '100px' },
];

export const MetaCampaignsShimmer: React.FC = () => {
  return (
    <Container>
      <BackButtonShimmer $delay={0} />

      <HeaderRow>
        <div>
          <TitleRow>
            <ShimmerBase
              $width='28px'
              $height='28px'
              $radius='8px'
              $delay={1}
            />
            <ShimmerBase $width='180px' $height='28px' $delay={2} />
          </TitleRow>
          <ShimmerBase
            $width='100%'
            $height='18px'
            $delay={3}
            style={{ maxWidth: 560, marginTop: 8 }}
          />
        </div>
        <ToolbarRow>
          <ShimmerBase $width='160px' $height='44px' $radius='8px' $delay={4} />
          <ShimmerBase $width='100px' $height='44px' $radius='8px' $delay={5} />
          <ShimmerBase $width='90px' $height='44px' $radius='8px' $delay={6} />
          <ShimmerBase $width='90px' $height='44px' $radius='8px' $delay={7} />
          <ShimmerBase $width='140px' $height='44px' $radius='8px' $delay={8} />
          <ShimmerBase $width='120px' $height='44px' $radius='8px' $delay={9} />
        </ToolbarRow>
      </HeaderRow>

      <StatusBarShimmer>
        <ShimmerBase $width='50px' $height='14px' $delay={10} />
        <ShimmerBase $height='14px' $width='80px' $delay={11} />
        <ShimmerBase $height='14px' $width='100px' $delay={12} />
      </StatusBarShimmer>

      <InfoBoxShimmer>
        <ShimmerBase $height='14px' $delay={13} style={{ marginBottom: 8 }} />
        <ShimmerBase $height='14px' $width='95%' $delay={14} style={{ marginBottom: 8 }} />
        <ShimmerBase $height='14px' $width='75%' $delay={15} />
      </InfoBoxShimmer>

      <TabsWrapShimmer>
        <TabShimmer $delay={16} />
        <TabShimmer $delay={17} />
      </TabsWrapShimmer>

      <SectionCard>
        <SectionTitleRow>
          <ShimmerBase $width='28px' $height='28px' $radius='8px' $delay={18} />
          <ShimmerBase $width='60px' $height='18px' $delay={19} />
        </SectionTitleRow>
        <FiltersSectionShimmer>
          <FilterRowShimmer>
            <ShimmerBase $width='70px' $height='20px' $delay={20} />
            <ShimmerBase $width='100px' $height='38px' $radius='20px' $delay={21} />
            <ShimmerBase $width='120px' $height='44px' $radius='8px' $delay={22} />
            <ShimmerBase $width='140px' $height='44px' $radius='8px' $delay={23} />
            <ShimmerBase $width='140px' $height='44px' $radius='8px' $delay={24} />
            <ShimmerBase $width='200px' $height='44px' $radius='8px' $delay={25} />
            <ShimmerBase $width='140px' $height='18px' $delay={26} style={{ marginLeft: 'auto' }} />
          </FilterRowShimmer>
        </FiltersSectionShimmer>
      </SectionCard>

      <SectionCard>
        <SectionTitleRow>
          <ShimmerBase $width='28px' $height='28px' $radius='8px' $delay={27} />
          <ShimmerBase $width='180px' $height='18px' $delay={28} />
        </SectionTitleRow>
        <SummaryStripShimmer>
          <ShimmerBase $height='16px' $width='120px' $delay={29} />
          <ShimmerBase $height='16px' $width='100px' $delay={30} />
          <ShimmerBase $height='16px' $width='90px' $delay={31} />
          <ShimmerBase $height='16px' $width='110px' $delay={32} />
        </SummaryStripShimmer>
      </SectionCard>

      <SectionCard>
        <SectionTitleRow>
          <ShimmerBase $width='28px' $height='28px' $radius='8px' $delay={33} />
          <ShimmerBase $width='160px' $height='18px' $delay={34} />
        </SectionTitleRow>
        <TableScrollHintShimmer $delay={35} />
        <TableWrapShimmer>
          <Table>
            <thead>
              <tr>
                {tableColumns.map((col, i) => (
                  <Th key={i} style={{ minWidth: col.w, width: col.w }}>
                    <ShimmerBase $height='14px' $width='100%' $delay={36 + i} />
                  </Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2, 3, 4, 5].map(row => (
                <tr key={row}>
                  <Td style={{ width: '52px' }}>
                    <ShimmerBase $height='32px' $width='32px' $radius='6px' $delay={50 + row * 6} />
                  </Td>
                  <Td style={{ minWidth: '160px' }}>
                    <ShimmerBase $height='18px' $width='85%' $delay={51 + row * 6} />
                  </Td>
                  <Td>
                    <ShimmerBase $height='16px' $width='70%' $delay={52 + row * 6} />
                  </Td>
                  <Td>
                    <ShimmerBase $height='16px' $width='50%' $delay={53 + row * 6} />
                  </Td>
                  <Td>
                    <ShimmerBase $height='24px' $width='70px' $radius='8px' $delay={54 + row * 6} />
                  </Td>
                  <Td>
                    <ShimmerBase $height='16px' $width='60%' $delay={55 + row * 6} />
                  </Td>
                  <Td>
                    <ShimmerBase $height='16px' $width='50%' $delay={56 + row * 6} />
                  </Td>
                  <Td>
                    <ShimmerBase $height='16px' $width='55%' $delay={57 + row * 6} />
                  </Td>
                  <Td>
                    <ShimmerBase $height='16px' $width='40%' $delay={58 + row * 6} />
                  </Td>
                  <Td>
                    <ShimmerBase $height='36px' $width='100%' $delay={59 + row * 6} />
                  </Td>
                  <Td>
                    <ShimmerBase $height='36px' $width='100%' $delay={60 + row * 6} />
                  </Td>
                  <Td style={{ minWidth: '200px' }}>
                    <ShimmerBase $height='36px' $width='100%' $delay={61 + row * 6} />
                  </Td>
                  <Td>
                    <ShimmerBase $height='36px' $width='70px' $delay={62 + row * 6} />
                  </Td>
                  <Td>
                    <ShimmerBase $height='36px' $width='70px' $delay={63 + row * 6} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrapShimmer>
      </SectionCard>
    </Container>
  );
};
