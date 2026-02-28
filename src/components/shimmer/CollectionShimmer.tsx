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
  width: 280px;
  height: 36px;
  border-radius: 8px;
`;

const SubtitleShimmer = styled(ShimmerBase)`
  width: 340px;
  height: 20px;
  border-radius: 6px;
  margin-top: 8px;
`;

const HeaderActionsShimmer = styled.div`
  display: flex;
  gap: 12px;
`;

const ButtonShimmer = styled(ShimmerBase)`
  width: 120px;
  height: 40px;
  border-radius: 8px;
`;

const AlertShimmer = styled(ShimmerBase)`
  width: 100%;
  height: 56px;
  border-radius: 12px;
  margin-bottom: 24px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCardShimmer = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StatIconShimmer = styled(ShimmerBase)`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  flex-shrink: 0;
`;

const StatContentShimmer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CardTitleShimmer = styled(ShimmerBase)`
  width: 200px;
  height: 22px;
  border-radius: 6px;
  margin-bottom: 20px;
`;

const ChannelGridShimmer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const ChannelItemShimmer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
`;

const TableHeaderShimmer = styled.div`
  display: grid;
  grid-template-columns: 80px 120px 100px 1fr 100px 140px;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  margin-bottom: 8px;
`;

const TableRowShimmer = styled.div`
  display: grid;
  grid-template-columns: 80px 120px 100px 1fr 100px 140px;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const CellShimmer = styled(ShimmerBase)`
  height: 18px;
  border-radius: 4px;
`;

export const CollectionShimmer: React.FC = () => {
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
            <ButtonShimmer $width="180px" />
          </HeaderActionsShimmer>
        </PageHeader>

        <AlertShimmer />

        <StatsGrid>
          {[1, 2, 3, 4].map(i => (
            <StatCardShimmer key={i}>
              <StatIconShimmer />
              <StatContentShimmer>
                <ShimmerBase $height="28px" $width="60px" />
                <ShimmerBase $height="14px" $width="100px" />
              </StatContentShimmer>
            </StatCardShimmer>
          ))}
        </StatsGrid>

        <ContentCard>
          <CardTitleShimmer />
          <ChannelGridShimmer>
            {[1, 2, 3].map(i => (
              <ChannelItemShimmer key={i}>
                <StatIconShimmer $width="40px" $height="40px" />
                <div style={{ flex: 1 }}>
                  <CellShimmer $width="80px" style={{ marginBottom: 6 }} />
                  <CellShimmer $width="50px" />
                </div>
              </ChannelItemShimmer>
            ))}
          </ChannelGridShimmer>
        </ContentCard>

        <ContentCard>
          <CardTitleShimmer $width="220px" />
          <TableHeaderShimmer>
            <CellShimmer $width="60px" />
            <CellShimmer $width="90px" />
            <CellShimmer $width="70px" />
            <CellShimmer />
            <CellShimmer $width="70px" />
            <CellShimmer $width="100px" />
          </TableHeaderShimmer>
          {[1, 2, 3, 4, 5].map(i => (
            <TableRowShimmer key={i}>
              <CellShimmer />
              <CellShimmer />
              <CellShimmer />
              <CellShimmer />
              <CellShimmer />
              <CellShimmer />
            </TableRowShimmer>
          ))}
        </ContentCard>
      </RentalStylePageContainer>
    </Layout>
  );
};
