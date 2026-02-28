import React from 'react';
import styled, { keyframes } from 'styled-components';

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
    ${(p) => p.theme.colors.backgroundSecondary} 25%,
    ${(p) => p.theme.colors.hover} 50%,
    ${(p) => p.theme.colors.backgroundSecondary} 75%
  );
  background-size: 200px 100%;
  animation: ${shimmer} 1.5s infinite;
  width: ${(p) => p.$width ?? '100%'};
  height: ${(p) => p.$height ?? '20px'};
  border-radius: ${(p) => p.$radius ?? '8px'};
`;

const Container = styled.div`
  padding: 20px 24px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  min-height: 100%;
  box-sizing: border-box;

  @media (min-width: 768px) {
    padding: 24px 28px;
  }
  @media (min-width: 1024px) {
    padding: 24px 32px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const StatusCard = styled.div`
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  background: ${(p) => p.theme.colors.cardBackground};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: ${(p) => p.theme.colors.shadow || '0 1px 3px rgba(0,0,0,0.08)'};

  @media (max-width: 480px) {
    gap: 1rem;
    padding: 1rem;
  }
`;

const StatusInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 1.5rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: ${(p) => p.theme.colors.cardBackground};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: ${(p) => p.theme.colors.shadow || '0 1px 3px rgba(0,0,0,0.08)'};

  @media (max-width: 768px) {
    padding: 1.25rem;
    margin-bottom: 1.25rem;
  }
  @media (max-width: 480px) {
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 0.5rem;
  }
`;

const CardTitle = styled.div`
  margin-bottom: 1rem;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const PropertyContainer = styled.div`
  display: flex;
  gap: 1.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const PropertyImagePlaceholder = styled(ShimmerBase)`
  width: 200px;
  height: 150px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    height: 200px;
  }
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  min-width: 640px;
  border-collapse: collapse;

  th,
  td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid ${(p) => p.theme.colors.border};
  }
  th {
    background: ${(p) => p.theme.colors.backgroundSecondary};
  }
`;

const PaymentsListPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PaymentRowPlaceholder = styled.div`
  padding: 12px;
  background: ${(p) => p.theme.colors.backgroundSecondary};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: 8px;
`;

export const RentalDetailsShimmer: React.FC = () => {
  return (
    <Container>
      <Header>
        <ShimmerBase $width="120px" $height="40px" $radius="8px" />
        <ShimmerBase $width="100px" $height="40px" $radius="8px" />
      </Header>

      <StatusCard>
        <StatusInfo>
          <ShimmerBase $width="140px" $height="14px" $radius="4px" />
          <ShimmerBase $width="100px" $height="28px" $radius="9999px" />
        </StatusInfo>
        <StatusInfo>
          <ShimmerBase $width="160px" $height="14px" $radius="4px" />
          <ShimmerBase $width="90px" $height="28px" $radius="9999px" />
        </StatusInfo>
      </StatusCard>

      <MainGrid>
        <Card>
          <CardTitle>
            <ShimmerBase $width="220px" $height="24px" $radius="6px" />
          </CardTitle>
          <InfoGrid>
            {[1, 2, 3, 4].map((i) => (
              <InfoItem key={i}>
                <ShimmerBase $width="80px" $height="14px" $radius="4px" />
                <ShimmerBase $width="90%" $height="18px" $radius="4px" />
              </InfoItem>
            ))}
          </InfoGrid>
        </Card>
        <Card>
          <CardTitle>
            <ShimmerBase $width="200px" $height="24px" $radius="6px" />
          </CardTitle>
          <InfoGrid>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <InfoItem key={i}>
                <ShimmerBase $width="70px" $height="14px" $radius="4px" />
                <ShimmerBase $width="85%" $height="18px" $radius="4px" />
              </InfoItem>
            ))}
          </InfoGrid>
        </Card>
      </MainGrid>

      <Card>
        <CardTitle>
          <ShimmerBase $width="260px" $height="24px" $radius="6px" />
        </CardTitle>
        <PropertyContainer>
          <PropertyImagePlaceholder />
          <div style={{ flex: 1, minWidth: 0 }}>
            <InfoGrid>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <InfoItem key={i}>
                  <ShimmerBase $width="60px" $height="14px" $radius="4px" />
                  <ShimmerBase $width="80%" $height="18px" $radius="4px" />
                </InfoItem>
              ))}
            </InfoGrid>
          </div>
        </PropertyContainer>
      </Card>

      <Card>
        <CardHeader>
          <ShimmerBase $width="200px" $height="24px" $radius="6px" />
          <ShimmerBase $width="160px" $height="36px" $radius="8px" />
        </CardHeader>
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <th key={i}>
                    <ShimmerBase $height="14px" $radius="4px" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4].map((row) => (
                <tr key={row}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <td key={i}>
                      <ShimmerBase
                        $height="16px"
                        $radius="4px"
                        $width={i === 8 ? '60px' : '90%'}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      </Card>

      <Card>
        <CardHeader>
          <ShimmerBase $width="140px" $height="24px" $radius="6px" />
          <div style={{ display: 'flex', gap: 12 }}>
            <ShimmerBase $width="100px" $height="40px" $radius="8px" />
            <ShimmerBase $width="140px" $height="40px" $radius="8px" />
          </div>
        </CardHeader>
        <PaymentsListPlaceholder>
          {[1, 2, 3].map((i) => (
            <PaymentRowPlaceholder key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <ShimmerBase $width="120px" $height="18px" $radius="4px" />
                <ShimmerBase $width="80px" $height="20px" $radius="4px" />
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <ShimmerBase $width="100px" $height="14px" $radius="4px" />
                <ShimmerBase $width="100px" $height="14px" $radius="4px" />
                <ShimmerBase $width="100px" $height="14px" $radius="4px" />
              </div>
            </PaymentRowPlaceholder>
          ))}
        </PaymentsListPlaceholder>
      </Card>

      <Card>
        <CardTitle>
          <ShimmerBase $width="220px" $height="24px" $radius="6px" />
        </CardTitle>
        <div style={{ padding: '24px 0', textAlign: 'center' }}>
          <ShimmerBase $width="280px" $height="16px" $radius="4px" style={{ margin: '0 auto 16px' }} />
          <ShimmerBase $width="160px" $height="40px" $radius="8px" style={{ margin: '0 auto' }} />
        </div>
      </Card>
    </Container>
  );
};
