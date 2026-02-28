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

const Container = styled.div`
  padding: 1rem 1.25rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 1rem;
  }
  @media (max-width: 480px) {
    padding: 0.75rem;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const ShimmerBack = styled(ShimmerBase)`
  width: 80px;
  height: 20px;
  margin-bottom: 1rem;
`;

const ShimmerPageTitle = styled(ShimmerBase)`
  width: 200px;
  height: 28px;
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ShimmerLabel = styled(ShimmerBase)`
  width: 140px;
  height: 16px;
  margin-bottom: 0.5rem;
`;

const ShimmerInput = styled(ShimmerBase)`
  width: 100%;
  height: 44px;
`;

const ShimmerTextarea = styled(ShimmerBase)`
  width: 100%;
  height: 80px;
`;

const CheckboxRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const ShimmerCheckbox = styled(ShimmerBase)`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  flex-shrink: 0;
`;

const ShimmerCheckboxLabel = styled(ShimmerBase)`
  width: 120px;
  height: 18px;
`;

const StepsSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const StepsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ShimmerStepsLabel = styled(ShimmerBase)`
  width: 140px;
  height: 18px;
`;

const ShimmerAddButton = styled(ShimmerBase)`
  width: 160px;
  height: 38px;
  border-radius: 8px;
`;

const StepCard = styled.div`
  background: ${p => p.theme.colors.background};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const StepHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const ShimmerStepIcon = styled(ShimmerBase)`
  width: 20px;
  height: 20px;
  border-radius: 4px;
`;

const ShimmerStepNumber = styled(ShimmerBase)`
  width: 70px;
  height: 18px;
  flex: 1;
`;

const ShimmerStepDelete = styled(ShimmerBase)`
  width: 28px;
  height: 28px;
  border-radius: 4px;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${p => p.theme.colors.border};
`;

const ShimmerFooterBtn = styled(ShimmerBase)`
  width: 100px;
  height: 44px;
  border-radius: 8px;
`;

export const RentalWorkflowFormShimmer: React.FC = () => {
  return (
    <Layout>
      <Container>
        <PageHeader>
          <ShimmerBack />
          <ShimmerPageTitle />
        </PageHeader>

        <Form>
          <Section>
            <FormGroup>
              <ShimmerLabel />
              <ShimmerInput />
            </FormGroup>
            <FormGroup>
              <ShimmerLabel />
              <ShimmerTextarea />
            </FormGroup>
            <CheckboxRow>
              <ShimmerCheckbox />
              <ShimmerCheckboxLabel />
            </CheckboxRow>
            <CheckboxRow>
              <ShimmerCheckbox />
              <ShimmerCheckboxLabel $width="180px" />
            </CheckboxRow>
          </Section>

          <StepsSection>
            <StepsHeader>
              <ShimmerStepsLabel />
              <ShimmerAddButton />
            </StepsHeader>
            <StepCard>
              <StepHeader>
                <ShimmerStepIcon />
                <ShimmerStepNumber />
                <ShimmerStepDelete />
              </StepHeader>
              <FormGroup>
                <ShimmerLabel $width="100px" />
                <ShimmerInput />
              </FormGroup>
              <FormGroup>
                <ShimmerLabel $width="110px" />
                <ShimmerInput />
              </FormGroup>
              <FormGroup>
                <ShimmerLabel $width="80px" />
                <ShimmerInput />
              </FormGroup>
              <CheckboxRow>
                <ShimmerCheckbox />
                <ShimmerCheckboxLabel $width="130px" />
              </CheckboxRow>
            </StepCard>
            <StepCard>
              <StepHeader>
                <ShimmerStepIcon />
                <ShimmerStepNumber />
                <ShimmerStepDelete />
              </StepHeader>
              <FormGroup>
                <ShimmerLabel $width="100px" />
                <ShimmerInput />
              </FormGroup>
              <FormGroup>
                <ShimmerLabel $width="110px" />
                <ShimmerInput />
              </FormGroup>
            </StepCard>
          </StepsSection>

          <Footer>
            <ShimmerFooterBtn />
            <ShimmerFooterBtn $width="120px" />
          </Footer>
        </Form>
      </Container>
    </Layout>
  );
};

export default RentalWorkflowFormShimmer;
