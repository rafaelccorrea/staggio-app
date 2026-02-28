import React, { useEffect, useState } from 'react';
import { MdSecurity, MdAdd } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import insuranceService from '../../services/insuranceService';
import type { InsurancePolicy } from '../../services/insuranceService';
import InsurancePolicyDetails from './InsurancePolicyDetails';

interface RentalInsuranceSectionProps {
  rentalId: string;
}

const RentalInsuranceSection: React.FC<RentalInsuranceSectionProps> = ({
  rentalId,
}) => {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPolicies();
  }, [rentalId]);

  const loadPolicies = async () => {
    setLoading(true);
    try {
      const data = await insuranceService.listPolicies(rentalId);
      setPolicies(data);
    } catch {
      toast.error('Erro ao carregar apólices de seguro');
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteInsurance = () => {
    navigate(`/insurance/quote?rentalId=${rentalId}`);
  };

  const handlePolicyCancelled = () => {
    loadPolicies();
  };

  return (
    <SectionCard>
      <SectionTitle>
        <MdSecurity /> Seguro Fiança Locatícia
      </SectionTitle>

      {loading ? (
        <LoadingWrap>
          <Spinner />
          <span>Carregando apólices...</span>
        </LoadingWrap>
      ) : policies.length === 0 ? (
        <EmptyWrap>
          <EmptyText>Nenhum seguro contratado para esta locação</EmptyText>
          <PrimaryButton onClick={handleQuoteInsurance}>
            <MdAdd /> Cotar Seguro Fiança
          </PrimaryButton>
        </EmptyWrap>
      ) : (
        <>
          {policies.map((policy) => (
            <PolicyItem key={policy.id}>
              <InsurancePolicyDetails
                policy={policy}
                onPolicyCancelled={handlePolicyCancelled}
              />
            </PolicyItem>
          ))}
          <ActionsWrap>
            <SecondaryButton onClick={handleQuoteInsurance}>
              <MdAdd /> Adicionar Novo Seguro
            </SecondaryButton>
          </ActionsWrap>
        </>
      )}
    </SectionCard>
  );
};

export default RentalInsuranceSection;

const SectionCard = styled.div`
  background: ${(p) => p.theme.colors.cardBackground};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: ${(p) => p.theme.colors.shadow || '0 1px 3px rgba(0,0,0,0.08)'};
  box-sizing: border-box;

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

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${(p) => p.theme.colors.text};
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const LoadingWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  color: ${(p) => p.theme.colors.textSecondary};
  font-size: 0.9375rem;
`;

const Spinner = styled.div`
  width: 24px;
  height: 24px;
  border: 2px solid ${(p) => p.theme.colors.border};
  border-top-color: ${(p) => p.theme.colors.primary};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const EmptyWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  text-align: center;
`;

const EmptyText = styled.p`
  margin: 0 0 1rem 0;
  color: ${(p) => p.theme.colors.textSecondary};
  font-size: 0.9375rem;
`;

const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${(p) => p.theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(p) => p.theme.colors.primaryHover ?? p.theme.colors.primaryDark};
    opacity: 0.95;
  }

  svg {
    font-size: 1.125rem;
  }
`;

const SecondaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${(p) => p.theme.colors.backgroundSecondary};
  color: ${(p) => p.theme.colors.text};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(p) => p.theme.colors.hover};
  }

  svg {
    font-size: 1.125rem;
  }
`;

const PolicyItem = styled.div`
  margin-bottom: 1rem;

  &:last-of-type {
    margin-bottom: 0;
  }
`;

const ActionsWrap = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${(p) => p.theme.colors.border};
`;
