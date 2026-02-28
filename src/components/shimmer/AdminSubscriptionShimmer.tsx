import React from 'react';
import styled, { keyframes } from 'styled-components';
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageTitleContainer,
} from '../../styles/pages/PropertiesPageStyles';
import * as S from '../../styles/pages/SubscriptionManagementPageStyles';

// Animação de shimmer moderna (suave e contínua)
const shimmerWave = keyframes`
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
`;

const ShimmerBlock = styled.div<{
  $width?: string;
  $height?: string;
  $radius?: string;
  $delay?: number;
}>`
  height: ${p => p.$height ?? '16px'};
  width: ${p => p.$width ?? '100%'};
  border-radius: ${p => p.$radius ?? '8px'};
  background: linear-gradient(
    90deg,
    ${p => p.theme.colors.backgroundSecondary} 0%,
    ${p => p.theme.colors.border} 20%,
    ${p => p.theme.colors.hover ?? p.theme.colors.border} 50%,
    ${p => p.theme.colors.border} 80%,
    ${p => p.theme.colors.backgroundSecondary} 100%
  );
  background-size: 200% 100%;
  animation: ${shimmerWave} 1.8s ease-in-out infinite
    ${p => (p.$delay ? `${p.$delay}ms` : '0ms')};
`;

const ShimmerTitle = styled(ShimmerBlock)`
  height: 32px;
  width: 320px;
  border-radius: 10px;
  max-width: 100%;
`;

const ShimmerSubtitle = styled(ShimmerBlock)`
  height: 20px;
  width: 240px;
  border-radius: 6px;
  margin-top: 8px;
`;

const ShimmerBackBtn = styled(ShimmerBlock)`
  height: 40px;
  width: 110px;
  border-radius: 10px;
  flex-shrink: 0;
`;

const TabsRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid ${p => p.theme.colors.border};
  padding-bottom: 0;
`;

const ShimmerTab = styled(ShimmerBlock)`
  height: 44px;
  width: 100px;
  border-radius: 8px 8px 0 0;
  flex-shrink: 0;
`;

const ShimmerStatCard = styled(S.StatCard)`
  min-height: 100px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ShimmerAlertBar = styled.div`
  height: 56px;
  width: 100%;
  border-radius: 12px;
  background: linear-gradient(
    90deg,
    ${p => p.theme.colors.backgroundSecondary} 0%,
    ${p => p.theme.colors.border} 25%,
    ${p => p.theme.colors.hover ?? p.theme.colors.border} 50%,
    ${p => p.theme.colors.border} 75%,
    ${p => p.theme.colors.backgroundSecondary} 100%
  );
  background-size: 200% 100%;
  animation: ${shimmerWave} 1.8s ease-in-out infinite 200ms;
`;

const ShimmerSectionTitle = styled(ShimmerBlock)`
  height: 24px;
  width: 200px;
  border-radius: 6px;
  margin-bottom: 16px;
`;

const ShimmerUsageCard = styled(S.UsageCard)`
  min-height: 64px;
`;

const ShimmerProgressTrack = styled.div`
  width: 100%;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  background: ${p => p.theme.colors.backgroundSecondary};
  margin-top: 12px;
`;

const ShimmerProgressFill = styled.div`
  height: 100%;
  width: 45%;
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    ${p => p.theme.colors.backgroundSecondary} 0%,
    ${p => p.theme.colors.border} 40%,
    ${p => p.theme.colors.hover ?? p.theme.colors.border} 100%
  );
  background-size: 200% 100%;
  animation: ${shimmerWave} 1.8s ease-in-out infinite 400ms;
`;

const AdminSubscriptionShimmer: React.FC = () => {
  return (
    <PageContainer>
      <PageContent>
        <PageHeader>
          <PageTitleContainer>
            <ShimmerTitle />
            <ShimmerSubtitle />
          </PageTitleContainer>
          <ShimmerBackBtn />
        </PageHeader>

        <TabsRow>
          <ShimmerTab $width="120px" />
          <ShimmerTab $width="100px" />
          <ShimmerTab $width="80px" />
          <ShimmerTab $width="120px" />
          <ShimmerTab $width="70px" />
        </TabsRow>

        <S.TabContent>
          <S.StatsGrid>
            {[1, 2, 3, 4].map(i => (
              <ShimmerStatCard key={i}>
                <ShimmerBlock $height="14px" $width="70%" $radius="6px" />
                <ShimmerBlock $height="28px" $width="85%" $radius="8px" />
                <ShimmerBlock
                  $height="14px"
                  $width="50%"
                  $radius="6px"
                  $delay={100}
                />
              </ShimmerStatCard>
            ))}
          </S.StatsGrid>

          <ShimmerAlertBar />

          <S.SectionContainer>
            <ShimmerSectionTitle />
            <S.UsageSection>
              {[1, 2, 3].map(i => (
                <ShimmerUsageCard key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <ShimmerBlock $height="14px" $width="100px" $radius="6px" />
                    <ShimmerBlock $height="14px" $width="60px" $radius="6px" $delay={150} />
                  </div>
                  <ShimmerProgressTrack>
                    <ShimmerProgressFill />
                  </ShimmerProgressTrack>
                </ShimmerUsageCard>
              ))}
            </S.UsageSection>
          </S.SectionContainer>
        </S.TabContent>
      </PageContent>
    </PageContainer>
  );
};

export default AdminSubscriptionShimmer;
