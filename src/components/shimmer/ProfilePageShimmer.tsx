import React from 'react';
import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const ShimmerBase = styled.div<{
  $width?: string;
  $height?: string;
  $borderRadius?: string;
  $margin?: string;
  $variant?: 'primary' | 'secondary' | 'accent';
}>`
  background: ${props => {
    switch (props.$variant) {
      case 'accent':
        return `linear-gradient(90deg, ${props.theme.colors.primary}12 0%, ${props.theme.colors.primary}28 50%, ${props.theme.colors.primary}12 100%)`;
      default:
        return `linear-gradient(90deg, ${props.theme.colors.backgroundSecondary} 0%, ${props.theme.colors.border} 50%, ${props.theme.colors.backgroundSecondary} 100%)`;
    }
  }};
  background-size: 200px 100%;
  animation: ${shimmer} 1.5s infinite;
  width: ${props => props.$width || '100%'};
  height: ${props => props.$height || '20px'};
  border-radius: ${props => props.$borderRadius || '8px'};
  margin: ${props => props.$margin || '0'};
  will-change: background-position;
`;

/* Container alinhado à página real */
const Container = styled.div`
  padding: 0;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
`;

/* Hero neutro (igual à página) */
const Hero = styled.section`
  position: relative;
  padding: 40px 32px 56px;
  margin-bottom: -24px;
  border-radius: 0 0 28px 28px;
  background: linear-gradient(
    180deg,
    ${props => props.theme.colors.backgroundSecondary} 0%,
    ${props => props.theme.colors.background || props.theme.colors.cardBackground} 100%
  );
  border-bottom: 1px solid ${props => props.theme.colors.border};
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);

  @media (max-width: 768px) {
    padding: 32px 20px 48px;
    margin-bottom: -20px;
    border-radius: 0 0 20px 20px;
  }
`;

const HeroContent = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 28px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
`;

const HeroAvatarWrap = styled.div`
  flex-shrink: 0;
`;
const HeroAvatarShimmer = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 24px;
  overflow: hidden;
  background: ${props => props.theme.colors.backgroundSecondary};
  border: 3px solid ${props => props.theme.colors.border};
  @media (max-width: 768px) {
    width: 88px;
    height: 88px;
    border-radius: 20px;
  }
`;

const HeroMeta = styled.div`
  flex: 1;
  min-width: 0;
  padding-bottom: 4px;
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

const HeroActions = styled.div`
  padding-bottom: 4px;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

/* Stats row */
const StatsRow = styled.div`
  padding: 0 32px;
  margin-bottom: 28px;
  position: relative;
  z-index: 2;
  @media (max-width: 768px) {
    padding: 0 16px;
    margin-bottom: 20px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 768px) {
    gap: 12px;
  }
  @media (max-width: 400px) {
    grid-template-columns: 1fr;
  }
`;

const StatCardShimmer = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 16px;
  padding: 20px;
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${props => props.theme.colors.border};
    border-radius: 4px 0 0 4px;
  }
`;

/* Grid principal: 2 colunas */
const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.15fr;
  gap: 28px;
  padding: 0 32px 40px;
  align-items: start;
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    padding: 0 24px 32px;
  }
  @media (max-width: 768px) {
    gap: 20px;
    padding: 0 16px 24px;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const RightColumn = styled.div`
  min-width: 0;
`;

const InfoCardShimmer = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 20px;
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  overflow: hidden;
`;

const CardHeaderShimmer = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.backgroundSecondary};
`;

const CardBodyShimmer = styled.div`
  padding: 16px 24px 20px;
`;

const InfoItemShimmer = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 12px;
  border-radius: 12px;
`;

const SectionBodyShimmer = styled.div`
  padding: 20px 24px 24px;
`;

const CompanyCardShimmer = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 16px;
  border: 1px solid ${props => props.theme.colors.border};
  margin-bottom: 24px;
  overflow: hidden;
  &:last-child {
    margin-bottom: 0;
  }
`;

const CompanyHeaderShimmer = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const CompanyInfoShimmer = styled.div`
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ProfilePageShimmer: React.FC = () => {
  return (
    <Container>
      {/* Hero: avatar + meta + botão */}
      <Hero>
        <HeroContent>
          <HeroAvatarWrap>
            <HeroAvatarShimmer />
          </HeroAvatarWrap>
          <HeroMeta>
            <ShimmerBase $width='220px' $height='28px' $borderRadius='8px' $margin='0 0 8px 0' />
            <ShimmerBase $width='180px' $height='18px' $borderRadius='6px' $margin='0 0 16px 0' />
            <ShimmerBase $width='100px' $height='28px' $borderRadius='999px' />
          </HeroMeta>
          <HeroActions>
            <ShimmerBase $width='140px' $height='44px' $borderRadius='14px' />
          </HeroActions>
        </HeroContent>
      </Hero>

      {/* Estatísticas: 4 cards */}
      <StatsRow>
        <StatsGrid>
          {[1, 2, 3, 4].map(i => (
            <StatCardShimmer key={i}>
              <ShimmerBase $width='44px' $height='44px' $borderRadius='12px' $variant='accent' />
              <div style={{ flex: 1, minWidth: 0 }}>
                <ShimmerBase $width='48px' $height='24px' $borderRadius='6px' $margin='0 0 4px 0' />
                <ShimmerBase $width='70px' $height='14px' $borderRadius='4px' />
              </div>
            </StatCardShimmer>
          ))}
        </StatsGrid>
      </StatsRow>

      {/* Grid: esquerda (2 cards) | direita (empresas) */}
      <MainGrid>
        <LeftColumn>
          {/* Card Informações Pessoais */}
          <InfoCardShimmer>
            <CardHeaderShimmer>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShimmerBase $width='20px' $height='20px' $borderRadius='6px' />
                <ShimmerBase $width='160px' $height='20px' $borderRadius='6px' />
              </div>
            </CardHeaderShimmer>
            <CardBodyShimmer>
              {[1, 2, 3, 4].map(i => (
                <InfoItemShimmer key={i}>
                  <ShimmerBase $width='24px' $height='24px' $borderRadius='50%' />
                  <div style={{ flex: 1 }}>
                    <ShimmerBase $width='60px' $height='12px' $borderRadius='4px' $margin='0 0 6px 0' />
                    <ShimmerBase $width='85%' $height='16px' $borderRadius='4px' />
                  </div>
                </InfoItemShimmer>
              ))}
            </CardBodyShimmer>
          </InfoCardShimmer>

          {/* Card Segurança */}
          <InfoCardShimmer>
            <CardHeaderShimmer>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShimmerBase $width='20px' $height='20px' $borderRadius='6px' />
                <ShimmerBase $width='100px' $height='20px' $borderRadius='6px' />
              </div>
            </CardHeaderShimmer>
            <CardBodyShimmer>
              {[1, 2].map(i => (
                <InfoItemShimmer key={i}>
                  <ShimmerBase $width='24px' $height='24px' $borderRadius='50%' />
                  <div style={{ flex: 1 }}>
                    <ShimmerBase $width='100px' $height='12px' $borderRadius='4px' $margin='0 0 6px 0' />
                    <ShimmerBase $width='140px' $height='16px' $borderRadius='4px' />
                  </div>
                  <ShimmerBase $width='24px' $height='24px' $borderRadius='6px' />
                </InfoItemShimmer>
              ))}
            </CardBodyShimmer>
          </InfoCardShimmer>
        </LeftColumn>

        {/* Coluna direita: Minhas Empresas */}
        <RightColumn>
          <InfoCardShimmer>
            <CardHeaderShimmer>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShimmerBase $width='20px' $height='20px' $borderRadius='6px' />
                <ShimmerBase $width='140px' $height='20px' $borderRadius='6px' />
              </div>
            </CardHeaderShimmer>
            <SectionBodyShimmer>
              <ShimmerBase $width='100%' $height='44px' $borderRadius='12px' $margin='0 0 16px 0' />
              {[1, 2, 3].map(i => (
                <CompanyCardShimmer key={i}>
                  <CompanyHeaderShimmer>
                    <ShimmerBase $width='180px' $height='20px' $borderRadius='6px' />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <ShimmerBase $width='32px' $height='32px' $borderRadius='8px' />
                      <ShimmerBase $width='32px' $height='32px' $borderRadius='8px' />
                    </div>
                  </CompanyHeaderShimmer>
                  <CompanyInfoShimmer>
                    <ShimmerBase $width='90%' $height='14px' $borderRadius='4px' />
                    <ShimmerBase $width='70%' $height='14px' $borderRadius='4px' />
                    <ShimmerBase $width='50%' $height='14px' $borderRadius='4px' />
                  </CompanyInfoShimmer>
                </CompanyCardShimmer>
              ))}
            </SectionBodyShimmer>
          </InfoCardShimmer>
        </RightColumn>
      </MainGrid>
    </Container>
  );
};

export default ProfilePageShimmer;
