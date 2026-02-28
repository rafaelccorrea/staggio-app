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
  $margin?: string;
}>`
  background: linear-gradient(
    90deg,
    ${props => props.theme.colors.backgroundSecondary} 25%,
    ${props => props.theme.colors.border} 50%,
    ${props => props.theme.colors.backgroundSecondary} 75%
  );
  background-size: 200px 100%;
  animation: ${shimmer} 1.5s infinite;
  width: ${props => props.$width || '100%'};
  height: ${props => props.$height || '20px'};
  border-radius: ${props => props.$radius || '8px'};
  margin: ${props => props.$margin || '0'};
`;

const Container = styled.div`
  width: 100%;
  box-sizing: border-box;
`;

const BackBtn = styled(ShimmerBase)`
  width: 100px;
  height: 44px;
  margin-bottom: 20px;
  border-radius: 10px;
`;

const Header = styled.div`
  margin-bottom: 28px;
`;

const Title = styled(ShimmerBase)`
  width: 280px;
  height: 32px;
  margin-bottom: 8px;
  border-radius: 6px;

  @media (min-width: 600px) {
    height: 36px;
  }
`;

const Subtitle = styled(ShimmerBase)`
  width: 90%;
  max-width: 420px;
  height: 20px;
  border-radius: 6px;
`;

const Section = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;

  @media (min-width: 600px) {
    padding: 24px;
    margin-bottom: 24px;
  }
`;

const SectionTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
`;

const SectionIcon = styled(ShimmerBase)`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  flex-shrink: 0;
`;

const SectionTitle = styled(ShimmerBase)`
  width: 160px;
  height: 22px;
  border-radius: 6px;
`;

const FormGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const FieldLabel = styled(ShimmerBase)`
  width: 140px;
  height: 18px;
  margin-bottom: 6px;
  border-radius: 4px;
`;

const FieldInput = styled(ShimmerBase)`
  width: 100%;
  height: 44px;
  border-radius: 10px;
`;

const ScheduleRow = styled.div`
  display: flex;
  gap: 12px;
`;

const CheckboxRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CheckboxBox = styled(ShimmerBase)`
  width: 20px;
  height: 20px;
  border-radius: 4px;
`;

const CheckboxLabel = styled(ShimmerBase)`
  width: 280px;
  height: 20px;
  border-radius: 4px;
`;

const FormActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const BtnSecondary = styled(ShimmerBase)`
  width: 120px;
  height: 48px;
  border-radius: 10px;
`;

const BtnPrimary = styled(ShimmerBase)`
  width: 180px;
  height: 48px;
  border-radius: 10px;
`;

export const CreateMetaCampaignShimmer: React.FC = () => (
  <Container>
    <BackBtn />

    <Header>
      <Title />
      <Subtitle />
    </Header>

    <Section>
      <SectionTitleRow>
        <SectionIcon />
        <SectionTitle />
      </SectionTitleRow>
      <FormGrid>
        <div>
          <FieldLabel />
          <FieldInput />
        </div>
        <div>
          <FieldLabel $width="160px" />
          <FieldInput />
        </div>
      </FormGrid>
    </Section>

    <Section>
      <SectionTitleRow>
        <SectionIcon />
        <SectionTitle $width="180px" />
      </SectionTitleRow>
      <FormGrid>
        <div>
          <FieldLabel $width="80px" />
          <FieldInput />
        </div>
        <div>
          <FieldLabel $width="140px" />
          <FieldInput />
        </div>
        <div>
          <FieldLabel $width="100px" />
          <FieldInput />
        </div>
      </FormGrid>
    </Section>

    <Section>
      <SectionTitleRow>
        <SectionIcon />
        <SectionTitle $width="220px" />
      </SectionTitleRow>
      <FormGrid>
        <CheckboxRow>
          <CheckboxBox />
          <CheckboxLabel />
        </CheckboxRow>
      </FormGrid>
    </Section>

    <Section>
      <SectionTitleRow>
        <SectionIcon />
        <SectionTitle $width="180px" />
      </SectionTitleRow>
      <FormGrid>
        <div>
          <FieldLabel $width="180px" />
          <ScheduleRow>
            <FieldInput $width="140px" />
            <FieldInput $width="100px" />
          </ScheduleRow>
        </div>
      </FormGrid>
    </Section>

    <FormActions>
      <BtnSecondary />
      <BtnPrimary />
    </FormActions>
  </Container>
);

export default CreateMetaCampaignShimmer;
