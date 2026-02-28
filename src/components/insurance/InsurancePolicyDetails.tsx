import React, { useState } from 'react';
import { MdDescription, MdCancel } from 'react-icons/md';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import dayjs from 'dayjs';
import type { InsurancePolicy } from '../../services/insuranceService';
import insuranceService from '../../services/insuranceService';

interface InsurancePolicyDetailsProps {
  policy: InsurancePolicy;
  onPolicyCancelled?: () => void;
}

const getProviderName = (provider: string) => {
  const providers: Record<string, string> = {
    POTTENCIAL: 'Pottencial Seguros',
    JUNTO_SEGUROS: 'Junto Seguros',
    TOKIO_MARINE: 'Tokio Marine',
    PORTO_SEGURO: 'Porto Seguro',
  };
  return providers[provider] || provider;
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING_ISSUANCE: 'Aguardando Emissão',
    ACTIVE: 'Ativa',
    CANCELLED: 'Cancelada',
    EXPIRED: 'Expirada',
    SUSPENDED: 'Suspensa',
  };
  return labels[status] || status;
};

const getStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'default' => {
  const map: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
    ACTIVE: 'success',
    PENDING_ISSUANCE: 'warning',
    SUSPENDED: 'warning',
    CANCELLED: 'error',
    EXPIRED: 'default',
  };
  return map[status] || 'default';
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const InsurancePolicyDetails: React.FC<InsurancePolicyDetailsProps> = ({
  policy,
  onPolicyCancelled,
}) => {
  const [cancelling, setCancelling] = useState(false);

  const handleCancelPolicy = () => {
    if (
      !window.confirm(
        'Tem certeza que deseja cancelar esta apólice? Esta ação não pode ser desfeita.'
      )
    ) {
      return;
    }
    setCancelling(true);
    insuranceService
      .cancelPolicy(policy.id)
      .then(() => {
        toast.success('Apólice cancelada com sucesso');
        if (onPolicyCancelled) onPolicyCancelled();
      })
      .catch(() => {
        toast.error('Erro ao cancelar apólice');
      })
      .finally(() => {
        setCancelling(false);
      });
  };

  const statusVariant = getStatusVariant(policy.status);

  return (
    <PolicyBlock>
      <BlockHeader>
        <BlockTitle>Apólice de Seguro Fiança</BlockTitle>
        <StatusBadge $variant={statusVariant}>{getStatusLabel(policy.status)}</StatusBadge>
      </BlockHeader>

      <InfoGrid>
        <InfoItem>
          <InfoLabel>Seguradora</InfoLabel>
          <InfoValue>{getProviderName(policy.provider)}</InfoValue>
        </InfoItem>
        <InfoItem>
          <InfoLabel>Número da Apólice</InfoLabel>
          <InfoValue>{policy.policyNumber}</InfoValue>
        </InfoItem>
        <InfoItem>
          <InfoLabel>Prêmio Mensal</InfoLabel>
          <InfoValueHighlight>{formatCurrency(policy.monthlyPremium)}</InfoValueHighlight>
        </InfoItem>
        <InfoItem>
          <InfoLabel>Cobertura</InfoLabel>
          <InfoValue>{formatCurrency(policy.coverageAmount)}</InfoValue>
        </InfoItem>
        <InfoItem>
          <InfoLabel>Início da Vigência</InfoLabel>
          <InfoValue>{dayjs(policy.startDate).format('DD/MM/YYYY')}</InfoValue>
        </InfoItem>
        <InfoItem>
          <InfoLabel>Fim da Vigência</InfoLabel>
          <InfoValue>{dayjs(policy.endDate).format('DD/MM/YYYY')}</InfoValue>
        </InfoItem>
        <InfoItem style={{ gridColumn: '1 / -1' }}>
          <InfoLabel>Data de Emissão</InfoLabel>
          <InfoValue>{dayjs(policy.createdAt).format('DD/MM/YYYY HH:mm')}</InfoValue>
        </InfoItem>
      </InfoGrid>

      {policy.policyDetails?.coverages && policy.policyDetails.coverages.length > 0 && (
        <CoveragesSection>
          <CoveragesTitle>Coberturas da Apólice</CoveragesTitle>
          <CoveragesList>
            {policy.policyDetails.coverages.map((coverage: any, index: number) => (
              <li key={index}>
                {coverage.name || coverage.description}
                {coverage.amount && ` - ${formatCurrency(coverage.amount)}`}
              </li>
            ))}
          </CoveragesList>
        </CoveragesSection>
      )}

      <ActionsRow>
        <SecondaryBtn type="button" disabled>
          <MdDescription /> Baixar Apólice (PDF)
        </SecondaryBtn>
        {policy.status === 'ACTIVE' && (
          <DangerBtn
            type="button"
            onClick={handleCancelPolicy}
            disabled={cancelling}
          >
            {cancelling ? (
              <Spinner />
            ) : (
              <>
                <MdCancel /> Cancelar Apólice
              </>
            )}
          </DangerBtn>
        )}
      </ActionsRow>
    </PolicyBlock>
  );
};

export default InsurancePolicyDetails;

const PolicyBlock = styled.div`
  background: ${(p) => p.theme.colors.backgroundSecondary};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: 0.5rem;
  padding: 1.25rem;
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const BlockHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const BlockTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${(p) => p.theme.colors.text};
  margin: 0;
`;

const StatusBadge = styled.span<{
  $variant: 'success' | 'warning' | 'error' | 'default';
}>`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  ${(p) => {
    const theme = p.theme.colors;
    if (p.$variant === 'success')
      return `background: ${theme.success}20; color: ${theme.success};`;
    if (p.$variant === 'warning')
      return `background: ${theme.warning}20; color: ${theme.warning};`;
    if (p.$variant === 'error')
      return `background: ${theme.error}20; color: ${theme.error};`;
    return `background: ${theme.backgroundTertiary}; color: ${theme.textSecondary};`;
  }}
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem 1.5rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const InfoItem = styled.div``;

const InfoLabel = styled.div`
  font-size: 0.8125rem;
  color: ${(p) => p.theme.colors.textSecondary};
  margin-bottom: 0.2rem;
`;

const InfoValue = styled.div`
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${(p) => p.theme.colors.text};
`;

const InfoValueHighlight = styled(InfoValue)`
  font-size: 1.125rem;
  color: ${(p) => p.theme.colors.primary};
`;

const CoveragesSection = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${(p) => p.theme.colors.border};
`;

const CoveragesTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${(p) => p.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const CoveragesList = styled.ul`
  margin: 0;
  padding-left: 1.25rem;
  color: ${(p) => p.theme.colors.text};
  font-size: 0.875rem;
  line-height: 1.6;

  li {
    margin-bottom: 0.25rem;
  }
`;

const ActionsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${(p) => p.theme.colors.border};
`;

const SecondaryBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${(p) => p.theme.colors.backgroundSecondary};
  color: ${(p) => p.theme.colors.text};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${(p) => p.theme.colors.hover};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const DangerBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${(p) => p.theme.colors.error};
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
