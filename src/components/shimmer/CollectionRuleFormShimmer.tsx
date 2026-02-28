import React from 'react';
import { Layout } from '@/components/layout/Layout';
import {
  RentalStylePageContainer,
  PageHeader,
  PageTitleContainer,
  ContentCard,
} from '@/styles/components/PageStyles';
import { ShimmerBase } from '@/components/common/Shimmer';
import styled from 'styled-components';

const TitleShimmer = styled(ShimmerBase)`
  width: 220px;
  height: 36px;
  border-radius: 8px;
`;

const SubtitleShimmer = styled(ShimmerBase)`
  width: 320px;
  height: 20px;
  border-radius: 6px;
  margin-top: 8px;
`;

const ButtonShimmer = styled(ShimmerBase)`
  width: 100px;
  height: 40px;
  border-radius: 8px;
`;

const FormFieldShimmer = styled.div`
  margin-bottom: 20px;
`;

const LabelShimmer = styled(ShimmerBase)`
  width: 120px;
  height: 16px;
  border-radius: 4px;
  margin-bottom: 8px;
`;

const InputShimmer = styled(ShimmerBase)`
  width: 100%;
  height: 44px;
  border-radius: 8px;
`;

export const CollectionRuleFormShimmer: React.FC = () => {
  return (
    <Layout>
      <RentalStylePageContainer>
        <PageHeader>
          <PageTitleContainer>
            <TitleShimmer />
            <SubtitleShimmer />
          </PageTitleContainer>
          <div style={{ display: 'flex', gap: 12 }}>
            <ButtonShimmer />
            <ButtonShimmer $width="120px" />
          </div>
        </PageHeader>

        <ContentCard>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <FormFieldShimmer key={i}>
              <LabelShimmer />
              <InputShimmer />
            </FormFieldShimmer>
          ))}
        </ContentCard>
      </RentalStylePageContainer>
    </Layout>
  );
};
