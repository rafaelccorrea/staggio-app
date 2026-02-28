import React from 'react';
import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const ShimmerBase = styled.div`
  background: linear-gradient(
    90deg,
    ${props => props.theme.colors.backgroundSecondary} 0%,
    ${props => props.theme.colors.hover} 50%,
    ${props => props.theme.colors.backgroundSecondary} 100%
  );
  background-size: 1000px 100%;
  animation: ${shimmer} 2s infinite linear;
  border-radius: 8px;
`;

const Container = styled.div`
  width: 100%;
  padding: 24px 0 32px;
  min-height: calc(100vh - 70px);

  @media (max-width: 768px) {
    padding: 20px 0 28px;
  }

  @media (max-width: 480px) {
    padding: 16px 0 24px;
  }
`;

const HeaderShimmer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const TitleShimmer = styled(ShimmerBase)`
  width: 320px;
  height: 40px;
  max-width: 100%;
`;

const ButtonsShimmer = styled.div`
  display: flex;
  gap: 12px;
`;

const ButtonShimmer = styled(ShimmerBase)`
  width: 160px;
  height: 44px;
`;

const CardShimmer = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
`;

const SectionTitleShimmer = styled(ShimmerBase)`
  width: 240px;
  height: 24px;
  margin-bottom: 20px;
`;

const RowShimmer = styled.div`
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid ${props => props.theme.colors.border}40;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const LabelShimmer = styled(ShimmerBase)`
  width: 280px;
  height: 24px;
  margin-bottom: 8px;
`;

const DescriptionShimmer = styled(ShimmerBase)`
  width: 100%;
  max-width: 480px;
  height: 16px;
  margin-left: 30px;
`;

export const SDRSettingsShimmer: React.FC = () => {
  return (
    <Container>
      <HeaderShimmer>
        <TitleShimmer />
        <ButtonsShimmer>
          <ButtonShimmer />
          <ButtonShimmer />
        </ButtonsShimmer>
      </HeaderShimmer>

      {[1, 2, 3, 4, 5, 6].map(i => (
        <CardShimmer key={i}>
          <SectionTitleShimmer />
          <RowShimmer>
            <LabelShimmer />
            <DescriptionShimmer />
          </RowShimmer>
          <RowShimmer>
            <LabelShimmer />
            <DescriptionShimmer />
          </RowShimmer>
          <RowShimmer>
            <LabelShimmer />
            <DescriptionShimmer />
          </RowShimmer>
        </CardShimmer>
      ))}
    </Container>
  );
};
