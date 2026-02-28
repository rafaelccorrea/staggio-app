import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Layout } from '@/components/layout/Layout';

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const ShimmerBase = styled.div<{
  $width?: string;
  $height?: string;
  $radius?: string;
}>`
  background: linear-gradient(
    90deg,
    ${p => p.theme.colors.backgroundSecondary} 25%,
    ${p => p.theme.colors.hover || p.theme.colors.border} 50%,
    ${p => p.theme.colors.backgroundSecondary} 75%
  );
  background-size: 200px 100%;
  animation: ${shimmer} 1.5s infinite;
  width: ${p => p.$width ?? '100%'};
  height: ${p => p.$height ?? '20px'};
  border-radius: ${p => p.$radius ?? '8px'};
`;

// Mesmo layout da página de Aluguéis e da RentalWorkflowsPage
const PageContainer = styled.div`
  padding: 2rem;
  width: 100%;
  @media (max-width: 1024px) {
    padding: 1.5rem;
  }
  @media (max-width: 768px) {
    padding: 1rem;
  }
  @media (max-width: 480px) {
    padding: 0.75rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
    gap: 0.75rem;
  }
  @media (max-width: 480px) {
    margin-bottom: 1rem;
  }
`;

const ShimmerTitle = styled(ShimmerBase)`
  width: 220px;
  height: 32px;
  border-radius: 4px;
`;

const ShimmerButton = styled(ShimmerBase)`
  width: 140px;
  height: 44px;
  border-radius: 8px;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
`;

const ShimmerHeaderIcon = styled(ShimmerBase)`
  width: 52px;
  height: 52px;
  border-radius: 14px;
`;

const ShimmerSubtitle = styled(ShimmerBase)`
  width: 320px;
  max-width: 100%;
  height: 18px;
  margin-top: 10px;
  border-radius: 6px;
`;

const WorkflowsList = styled.div`
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const Card = styled.div`
  display: flex;
  min-height: 140px;
  background: ${p => p.theme.colors.cardBackground};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 16px;
  overflow: hidden;
`;

const CardAccent = styled.div`
  width: 4px;
  background: ${p => p.theme.colors.border};
`;

const CardBody = styled.div`
  flex: 1;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CardHeader = styled.div`
  margin-bottom: 0;
`;

const CardTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
`;

const ShimmerCardTitle = styled(ShimmerBase)`
  width: 160px;
  height: 20px;
  border-radius: 6px;
`;

const ShimmerBadge = styled(ShimmerBase)`
  width: 52px;
  height: 18px;
  border-radius: 6px;
`;

const ShimmerDescription = styled(ShimmerBase)`
  width: 90%;
  height: 14px;
  border-radius: 6px;
`;

const ShimmerStepsLabel = styled(ShimmerBase)`
  width: 72px;
  height: 12px;
  border-radius: 4px;
`;

const ShimmerStepLine = styled(ShimmerBase)`
  width: 100%;
  height: 14px;
  border-radius: 4px;
`;

const ShimmerFooter = styled.div`
  display: flex;
  gap: 8px;
  margin-top: auto;
  padding-top: 12px;
`;

const ShimmerBtn = styled(ShimmerBase)`
  width: 72px;
  height: 36px;
  border-radius: 8px;
`;

export const RentalWorkflowsShimmer: React.FC = () => {
  return (
    <Layout>
      <PageContainer>
        <Header>
          <HeaderContent>
            <ShimmerHeaderIcon />
            <div>
              <ShimmerTitle />
              <ShimmerSubtitle />
            </div>
          </HeaderContent>
          <ShimmerButton />
        </Header>
        <WorkflowsList>
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardAccent />
              <CardBody>
                <CardHeader>
                  <CardTitleRow>
                    <ShimmerCardTitle />
                    <ShimmerBadge />
                  </CardTitleRow>
                  <ShimmerDescription />
                </CardHeader>
                <ShimmerStepsLabel />
                <ShimmerStepLine />
                <ShimmerStepLine $width="85%" />
                <ShimmerFooter>
                  <ShimmerBtn />
                  <ShimmerBtn />
                </ShimmerFooter>
              </CardBody>
            </Card>
          ))}
        </WorkflowsList>
      </PageContainer>
    </Layout>
  );
};

export default RentalWorkflowsShimmer;
