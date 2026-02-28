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
}>`
  background: linear-gradient(
    90deg,
    ${props => props.theme.colors.backgroundSecondary} 0%,
    ${props => props.theme.colors.border} 50%,
    ${props => props.theme.colors.backgroundSecondary} 100%
  );
  background-size: 200px 100%;
  animation: ${shimmer} 1.5s infinite;
  width: ${props => props.$width || '100%'};
  height: ${props => props.$height || '20px'};
  border-radius: ${props => props.$borderRadius || '8px'};
  margin: ${props => props.$margin || '0'};
`;

const PageContainer = styled.div`
  padding: 32px;
  width: 100%;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 28px;
`;

const FieldBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionCard = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 16px;
  padding: 24px;
  margin-top: 8px;
`;

const MemberRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  margin-bottom: 12px;
`;

const ColorPickerRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
`;

const ButtonsRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  flex-wrap: wrap;
  margin-top: 24px;
`;

export const EditTeamPageShimmer: React.FC = () => {
  return (
    <PageContainer>
      <Header>
        <HeaderLeft>
          <ShimmerBase $width="280px" $height="32px" $borderRadius="8px" />
          <ShimmerBase $width="340px" $height="18px" $borderRadius="4px" />
        </HeaderLeft>
        <ShimmerBase $width="100px" $height="44px" $borderRadius="10px" />
      </Header>

      <FormSection>
        <FieldBlock>
          <ShimmerBase $width="120px" $height="16px" $borderRadius="4px" $margin="0 0 8px 0" />
          <ShimmerBase $width="100%" $height="48px" $borderRadius="12px" />
        </FieldBlock>

        <FieldBlock>
          <ShimmerBase $width="80px" $height="16px" $borderRadius="4px" $margin="0 0 8px 0" />
          <ShimmerBase $width="100%" $height="96px" $borderRadius="12px" />
        </FieldBlock>

        <FieldBlock>
          <ShimmerBase $width="100px" $height="16px" $borderRadius="4px" $margin="0 0 8px 0" />
          <ColorPickerRow>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <ShimmerBase key={i} $width="48px" $height="48px" $borderRadius="12px" />
            ))}
          </ColorPickerRow>
        </FieldBlock>

        <FieldBlock>
          <ShimmerBase $width="160px" $height="16px" $borderRadius="4px" $margin="0 0 8px 0" />
          <SectionCard>
            <ShimmerBase $width="240px" $height="22px" $borderRadius="6px" $margin="0 0 20px 0" />
            {[1, 2, 3, 4].map(i => (
              <MemberRow key={i}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <ShimmerBase $width="40px" $height="40px" $borderRadius="50%" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <ShimmerBase $width="140px" $height="16px" $borderRadius="4px" />
                    <ShimmerBase $width="180px" $height="12px" $borderRadius="4px" />
                  </div>
                </div>
                <ShimmerBase $width="24px" $height="24px" $borderRadius="8px" />
              </MemberRow>
            ))}
            <ShimmerBase $width="140px" $height="16px" $borderRadius="4px" $margin="24px 0 12px 0" />
            <ShimmerBase $width="100%" $height="44px" $borderRadius="12px" $margin="0 0 12px 0" />
            <ShimmerBase $width="100%" $height="120px" $borderRadius="8px" />
          </SectionCard>
        </FieldBlock>
      </FormSection>

      <ButtonsRow>
        <ShimmerBase $width="100px" $height="44px" $borderRadius="12px" />
        <ShimmerBase $width="160px" $height="44px" $borderRadius="12px" />
      </ButtonsRow>
    </PageContainer>
  );
};

export default EditTeamPageShimmer;
