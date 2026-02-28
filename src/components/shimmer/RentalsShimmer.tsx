import React from 'react';
import styled, { keyframes } from 'styled-components';
import {
  RentalsListContainer,
  ListHeader,
  TabletHidden,
  MobileHidden,
} from '@/pages/styles/RentalsListView.styles';

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

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 1.5rem;
  }
  @media (max-width: 480px) {
    margin-bottom: 1rem;
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 1rem;
  }
`;

const ShimmerRow = styled.div`
  display: grid;
  grid-template-columns: 80px minmax(160px, 2fr) 1.5fr 1fr 1fr 0.9fr 100px;
  gap: 16px;
  padding: 14px 20px;
  border-bottom: 1px solid ${(p) => p.theme.colors.border};
  align-items: center;

  @media (max-width: 1024px) {
    grid-template-columns: 64px minmax(140px, 2fr) 1fr 1fr 90px;
    gap: 12px;
  }
  @media (max-width: 768px) {
    grid-template-columns: 56px 1fr 72px;
    gap: 10px;
    padding: 12px 14px;
  }
  @media (max-width: 480px) {
    padding: 10px 12px;
  }
`;

const ShimmerHeaderRow = styled(ListHeader)`
  /* reutiliza o grid do ListHeader; células serão preenchidas com shimmer */
`;

const ShimmerCell = styled.div<{ $align?: 'left' | 'center' | 'right' }>`
  text-align: ${(p) => p.$align ?? 'left'};
  display: flex;
  justify-content: ${(p) =>
    p.$align === 'right' ? 'flex-end' : p.$align === 'center' ? 'center' : 'flex-start'};
  align-items: center;
`;

export const RentalsShimmer: React.FC = () => {
  return (
    <PageContainer>
      <PageHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <ShimmerBase $width="180px" $height="32px" $radius="8px" />
          <ShimmerBase $width="280px" $height="14px" $radius="6px" />
          <ShimmerBase $width="90px" $height="14px" $radius="6px" />
        </div>
        <ShimmerBase $width="140px" $height="44px" $radius="10px" />
      </PageHeader>

      <ControlsContainer>
        <ShimmerBase
          $height="48px"
          $radius="12px"
          style={{ flex: 1, minWidth: 200, maxWidth: 500 }}
        />
        <ShimmerBase $width="160px" $height="44px" $radius="10px" />
      </ControlsContainer>

      <RentalsListContainer>
        <ShimmerHeaderRow>
          <ShimmerCell $align="center">
            <ShimmerBase $width="52px" $height="12px" $radius="4px" />
          </ShimmerCell>
          <ShimmerCell $align="left">
            <ShimmerBase $width="56px" $height="12px" $radius="4px" />
          </ShimmerCell>
          <TabletHidden>
            <ShimmerCell $align="left">
              <ShimmerBase $width="48px" $height="12px" $radius="4px" />
            </ShimmerCell>
          </TabletHidden>
          <MobileHidden>
            <ShimmerCell $align="left">
              <ShimmerBase $width="44px" $height="12px" $radius="4px" />
            </ShimmerCell>
          </MobileHidden>
          <ShimmerCell $align="right">
            <ShimmerBase $width="40px" $height="12px" $radius="4px" />
          </ShimmerCell>
          <MobileHidden>
            <ShimmerCell $align="center">
              <ShimmerBase $width="36px" $height="12px" $radius="4px" />
            </ShimmerCell>
          </MobileHidden>
          <ShimmerCell $align="right">
            <ShimmerBase $width="44px" $height="12px" $radius="4px" />
          </ShimmerCell>
        </ShimmerHeaderRow>

        {[...Array(8)].map((_, i) => (
          <ShimmerRow key={i}>
            <ShimmerCell $align="center">
              <ShimmerBase $width="64px" $height="64px" $radius="8px" />
            </ShimmerCell>
            <ShimmerCell $align="left">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <ShimmerBase $width="85%" $height="16px" $radius="4px" />
                <ShimmerBase $width="70%" $height="14px" $radius="4px" />
              </div>
            </ShimmerCell>
            <TabletHidden>
              <ShimmerCell $align="left">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <ShimmerBase $width="90px" $height="12px" $radius="4px" />
                  <ShimmerBase $width="90px" $height="12px" $radius="4px" />
                </div>
              </ShimmerCell>
            </TabletHidden>
            <MobileHidden>
              <ShimmerCell $align="left">
                <ShimmerBase $width="72px" $height="22px" $radius="9999px" />
              </ShimmerCell>
            </MobileHidden>
            <ShimmerCell $align="right">
              <ShimmerBase $width="80px" $height="18px" $radius="4px" />
            </ShimmerCell>
            <MobileHidden>
              <ShimmerCell $align="center">
                <ShimmerBase $width="36px" $height="14px" $radius="4px" />
              </ShimmerCell>
            </MobileHidden>
            <ShimmerCell $align="right">
              <ShimmerBase $width="36px" $height="36px" $radius="8px" />
            </ShimmerCell>
          </ShimmerRow>
        ))}
      </RentalsListContainer>
    </PageContainer>
  );
};
