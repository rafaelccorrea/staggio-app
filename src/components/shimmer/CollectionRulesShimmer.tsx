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
  width: 380px;
  height: 36px;
  border-radius: 8px;
`;

const SubtitleShimmer = styled(ShimmerBase)`
  width: 400px;
  height: 20px;
  border-radius: 6px;
  margin-top: 8px;
`;

const HeaderActionsShimmer = styled.div`
  display: flex;
  gap: 12px;
`;

const ButtonShimmer = styled(ShimmerBase)`
  width: 160px;
  height: 40px;
  border-radius: 8px;
`;

const TableHeaderShimmer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 80px 80px 100px 140px;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  margin-bottom: 8px;
`;

const TableRowShimmer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 80px 80px 100px 140px;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const CellShimmer = styled(ShimmerBase)`
  height: 18px;
  border-radius: 4px;
`;

export const CollectionRulesShimmer: React.FC = () => {
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
            <ButtonShimmer $width="120px" />
          </HeaderActionsShimmer>
        </PageHeader>

        <ContentCard>
          <TableHeaderShimmer>
            <CellShimmer $width="80px" />
            <CellShimmer $width="70px" />
            <CellShimmer $width="60px" />
            <CellShimmer $width="50px" />
            <CellShimmer $width="50px" />
            <CellShimmer $width="60px" />
            <CellShimmer $width="80px" />
          </TableHeaderShimmer>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <TableRowShimmer key={i}>
              <div>
                <CellShimmer $width="70%" style={{ marginBottom: 6 }} />
                <CellShimmer $width="50%" />
              </div>
              <CellShimmer />
              <CellShimmer />
              <CellShimmer />
              <CellShimmer />
              <CellShimmer />
              <div style={{ display: 'flex', gap: 8 }}>
                <ShimmerBase $width="32px" $height="32px" $borderRadius="8px" />
                <ShimmerBase $width="32px" $height="32px" $borderRadius="8px" />
                <ShimmerBase $width="32px" $height="32px" $borderRadius="8px" />
              </div>
            </TableRowShimmer>
          ))}
        </ContentCard>
      </RentalStylePageContainer>
    </Layout>
  );
};
