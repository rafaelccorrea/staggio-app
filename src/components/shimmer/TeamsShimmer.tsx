import React from 'react';
import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const ShimmerBase = styled.div<{ $w?: string; $h?: string; $r?: string }>`
  background: linear-gradient(
    90deg,
    ${props => props.theme.colors.backgroundSecondary} 25%,
    ${props => props.theme.colors.border} 50%,
    ${props => props.theme.colors.backgroundSecondary} 75%
  );
  background-size: 200px 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: ${p => p.$r || '8px'};
  width: ${p => p.$w || '100%'};
  height: ${p => p.$h || '20px'};
`;

/* Mesmo padding da página */
const ShimmerContainer = styled.div`
  padding: 24px;
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  @media (max-width: 1024px) {
    padding: 20px;
  }
  @media (max-width: 768px) {
    padding: 16px 12px;
  }
`;

const ShimmerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  gap: 16px;
  flex-wrap: wrap;
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 16px;
    padding-bottom: 12px;
    gap: 12px;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

/* Barra de controles: busca + view + filtros */
const ShimmerControls = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  padding: 16px;
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 20px;
  border: 1px solid ${props => props.theme.colors.border};
  flex-wrap: wrap;
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    margin-bottom: 16px;
    padding: 12px;
    border-radius: 12px;
  }
`;

/* "Ver equipes do usuário" */
const UserLookupRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  @media (max-width: 768px) {
    margin-bottom: 16px;
  }
`;

/* Grid de estatísticas (4 cards) */
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 24px 0 32px 0;
  @media (max-width: 1024px) {
    gap: 16px;
    margin: 20px 0 24px 0;
  }
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin: 16px 0 20px 0;
  }
`;

const StatCardShimmer = styled.div`
  background: ${props => props.theme.colors.surface || props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  @media (max-width: 768px) {
    padding: 16px;
    gap: 12px;
    border-radius: 12px;
  }
`;

const ShimmerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  @media (max-width: 768px) {
    gap: 16px;
  }
`;

const ShimmerCard = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  padding: 20px;
  position: relative;
`;

const ShimmerCardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const ShimmerCardContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ShimmerColor = styled(ShimmerBase)`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-bottom: 12px;
`;

const ShimmerActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ShimmerActionBtn = styled(ShimmerBase)`
  width: 32px;
  height: 32px;
  border-radius: 6px;
`;

const ShimmerStats = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
`;

const ShimmerStat = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

interface TeamsShimmerProps {
  count?: number;
}

const TeamsShimmer: React.FC<TeamsShimmerProps> = ({ count = 6 }) => {
  return (
    <ShimmerContainer>
      <ShimmerHeader>
        <HeaderLeft>
          <ShimmerBase $w="140px" $h="40px" $r="8px" />
          <ShimmerBase $w="100px" $h="36px" $r="20px" />
        </HeaderLeft>
        <ShimmerBase $w="160px" $h="48px" $r="16px" />
      </ShimmerHeader>

      <ShimmerControls>
        <ShimmerBase $w="100%" $h="52px" $r="16px" style={{ flex: 1, minWidth: 200, maxWidth: 500 }} />
        <ShimmerBase $w="120px" $h="44px" $r="12px" />
        <ShimmerBase $w="100px" $h="44px" $r="16px" />
      </ShimmerControls>

      <UserLookupRow>
        <ShimmerBase $w="200px" $h="20px" $r="6px" />
        <ShimmerBase $w="280px" $h="44px" $r="12px" style={{ flex: 1, minWidth: 0 }} />
      </UserLookupRow>

      <StatsGrid>
        {[1, 2, 3, 4].map(i => (
          <StatCardShimmer key={i}>
            <ShimmerBase $w="56px" $h="56px" $r="14px" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <ShimmerBase $w="60px" $h="24px" $r="6px" style={{ marginBottom: 6 }} />
              <ShimmerBase $w="80px" $h="16px" $r="4px" />
            </div>
          </StatCardShimmer>
        ))}
      </StatsGrid>

      <ShimmerGrid>
        {Array.from({ length: count }).map((_, index) => (
          <ShimmerCard key={index}>
            <ShimmerCardHeader>
              <ShimmerCardContent>
                <ShimmerColor $w="16px" $h="16px" $r="50%" />
                <ShimmerBase $w="180px" $h="18px" $r="6px" style={{ marginBottom: 8 }} />
                <ShimmerBase $w="240px" $h="14px" $r="4px" />
              </ShimmerCardContent>
              <ShimmerActions>
                <ShimmerActionBtn $w="32px" $h="32px" $r="6px" />
                <ShimmerActionBtn $w="32px" $h="32px" $r="6px" />
              </ShimmerActions>
            </ShimmerCardHeader>
            <ShimmerStats>
              <ShimmerStat>
                <ShimmerBase $w="14px" $h="14px" $r="2px" />
                <ShimmerBase $w="60px" $h="12px" $r="4px" />
              </ShimmerStat>
              <ShimmerStat>
                <ShimmerBase $w="14px" $h="14px" $r="2px" />
                <ShimmerBase $w="60px" $h="12px" $r="4px" />
              </ShimmerStat>
            </ShimmerStats>
          </ShimmerCard>
        ))}
      </ShimmerGrid>
    </ShimmerContainer>
  );
};

export default TeamsShimmer;
