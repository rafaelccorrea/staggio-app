import React from 'react';
import { Layout } from '@/components/layout/Layout';
import {
  RentalStylePageContainer,
  PageHeader,
  PageTitleContainer,
  ContentCard,
} from '@/styles/components/PageStyles';
import { ShimmerBase } from '@/components/common/Shimmer';
import styled, { keyframes } from 'styled-components';

// Shimmer neutro (cinza) — sem tom azul
const shimmerNeutral = keyframes`
  0% { background-position: -160px 0; }
  100% { background-position: calc(160px + 100%) 0; }
`;

const NeutralShimmer = styled(ShimmerBase).attrs(() => ({}))`
  --shimmer-base: ${props =>
    props.theme?.mode === 'dark' ? '#3a3a3a' : '#e5e7eb'};
  --shimmer-mid: ${props =>
    props.theme?.mode === 'dark' ? '#4a4a4a' : '#d1d5db'};
  background: linear-gradient(
    90deg,
    var(--shimmer-base) 0%,
    var(--shimmer-base) 35%,
    var(--shimmer-mid) 50%,
    var(--shimmer-base) 65%,
    var(--shimmer-base) 100%
  ) !important;
  background-size: 160px 100% !important;
  animation: ${shimmerNeutral} 2s ease-in-out infinite;
`;

const TitleShimmer = styled(NeutralShimmer)`
  width: 420px;
  height: 36px;
  border-radius: 8px;
`;

const SubtitleShimmer = styled(NeutralShimmer)`
  width: 380px;
  height: 20px;
  border-radius: 6px;
  margin-top: 8px;
`;

const HeaderActionsShimmer = styled.div`
  display: flex;
  gap: 12px;
`;

const ButtonShimmer = styled(NeutralShimmer)`
  width: 160px;
  height: 40px;
  border-radius: 8px;
`;

const SectionTitleShimmer = styled(NeutralShimmer)`
  width: 280px;
  height: 22px;
  border-radius: 6px;
  margin-bottom: 8px;
`;

const SectionDescShimmer = styled(NeutralShimmer)`
  width: 100%;
  max-width: 500px;
  height: 16px;
  border-radius: 4px;
  margin-bottom: 24px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
`;

const FormFieldShimmer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LabelShimmer = styled(NeutralShimmer)`
  width: 140px;
  height: 16px;
  border-radius: 4px;
`;

const InputShimmer = styled(NeutralShimmer)`
  width: 100%;
  height: 44px;
  border-radius: 8px;
`;

const HintShimmer = styled(NeutralShimmer)`
  width: 80%;
  height: 12px;
  border-radius: 4px;
`;

const InfoBoxShimmer = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px;
  background: ${props => props.theme.colors.infoBackground};
  border: 1px solid ${props => props.theme.colors.infoBorder};
  border-radius: 12px;
  margin-top: 16px;
`;

export const CreditAnalysisSettingsShimmer: React.FC = () => {
  return (
    <Layout>
      <RentalStylePageContainer>
        <PageHeader>
          <PageTitleContainer>
            <TitleShimmer />
            <SubtitleShimmer />
          </PageTitleContainer>
          <HeaderActionsShimmer>
            <ButtonShimmer />
            <ButtonShimmer $width="100px" />
          </HeaderActionsShimmer>
        </PageHeader>

        <ContentCard>
          <SectionTitleShimmer />
          <SectionDescShimmer />
          <FormGrid>
            {[1, 2, 3, 4, 5].map(i => (
              <FormFieldShimmer key={i}>
                <LabelShimmer />
                <InputShimmer />
                <HintShimmer />
              </FormFieldShimmer>
            ))}
          </FormGrid>
        </ContentCard>

        <ContentCard>
          <SectionTitleShimmer $width="260px" />
          <SectionDescShimmer $width="90%" />
          <InfoBoxShimmer>
            <NeutralShimmer $width="24px" $height="24px" $borderRadius="4px" />
            <NeutralShimmer $width="100%" $height="40px" $borderRadius="6px" />
          </InfoBoxShimmer>
        </ContentCard>
      </RentalStylePageContainer>
    </Layout>
  );
};
