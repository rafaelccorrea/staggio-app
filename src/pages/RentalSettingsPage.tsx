import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { MdSave, MdArrowBack } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { rentalService } from '@/services/rental.service';
import {
  RentalStylePageContainer,
  PageHeader,
  PageTitle,
  PageTitleContainer,
  PageSubtitle,
  ContentCard,
  BackButton,
} from '@/styles/components/PageStyles';
import { ShimmerBase } from '@/components/common/Shimmer';
import styled from 'styled-components';

const CheckboxRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;

  input[type='checkbox'] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
`;

const FormLabel = styled.label`
  font-weight: 500;
  cursor: pointer;
`;

const FormHint = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors?.textLight || '#6b7280'};
  margin-top: 6px;
  margin-left: 28px;
`;

const SaveButton = styled.button<{ disabled?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: ${p => (p.disabled ? '#9ca3af' : '#10b981')};
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: ${p => (p.disabled ? 'not-allowed' : 'pointer')};
  &:hover:not(:disabled) {
    background: ${p => (p.disabled ? '#9ca3af' : '#059669')};
  }
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: ${props => props.theme.colors?.text || '#111827'};
`;

const SectionDescription = styled.p`
  font-size: 14px;
  color: ${props => props.theme.colors?.textLight || '#6b7280'};
  margin: 0 0 16px 0;
`;

/* Shimmer */
const ShimmerTitle = styled(ShimmerBase)`
  width: 260px;
  height: 32px;
  border-radius: 8px;
`;
const ShimmerSubtitle = styled(ShimmerBase)`
  width: 280px;
  height: 18px;
  border-radius: 6px;
  margin-top: 8px;
`;
const ShimmerButton = styled(ShimmerBase)`
  width: 90px;
  height: 40px;
  border-radius: 8px;
`;
const ShimmerSectionTitle = styled(ShimmerBase)`
  width: 220px;
  height: 20px;
  border-radius: 6px;
  margin-bottom: 8px;
`;
const ShimmerSectionDesc = styled(ShimmerBase)`
  width: 100%;
  height: 40px;
  border-radius: 6px;
  margin-bottom: 16px;
`;
const ShimmerCheckboxRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
`;
const ShimmerCheckbox = styled(ShimmerBase)`
  width: 18px;
  height: 18px;
  border-radius: 4px;
`;
const ShimmerLabel = styled(ShimmerBase)`
  flex: 1;
  max-width: 320px;
  height: 18px;
  border-radius: 4px;
`;
const ShimmerHint = styled(ShimmerBase)`
  width: 90%;
  height: 14px;
  border-radius: 4px;
  margin-top: 6px;
  margin-left: 28px;
`;

export const RentalSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [requireApprovalToCreateRental, setRequireApprovalToCreateRental] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await rentalService.getSettings();
      setRequireApprovalToCreateRental(!!data.requireApprovalToCreateRental);
    } catch {
      toast.error('Erro ao carregar configurações.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await rentalService.updateSettings({ requireApprovalToCreateRental });
      toast.success('Configurações salvas com sucesso.');
    } catch {
      toast.error('Erro ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <RentalStylePageContainer>
          <PageHeader>
            <PageTitleContainer>
              <ShimmerTitle />
              <ShimmerSubtitle />
            </PageTitleContainer>
              <div style={{ display: 'flex', gap: 12 }}>
                <ShimmerButton />
                <ShimmerButton $width="100px" />
              </div>
          </PageHeader>
          <ContentCard style={{ padding: 24 }}>
            <ShimmerSectionTitle />
            <ShimmerSectionDesc />
            <ShimmerCheckboxRow>
              <ShimmerCheckbox />
              <ShimmerLabel />
            </ShimmerCheckboxRow>
            <ShimmerHint />
          </ContentCard>
        </RentalStylePageContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <RentalStylePageContainer>
        <PageHeader>
          <PageTitleContainer>
            <PageTitle>Configurações de Locação</PageTitle>
            <PageSubtitle>Defina regras para criação de aluguéis</PageSubtitle>
          </PageTitleContainer>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <BackButton type="button" onClick={() => navigate(-1)}>
              <MdArrowBack /> Voltar
            </BackButton>
            <SaveButton type="button" onClick={handleSave} disabled={saving}>
              <MdSave /> {saving ? 'Salvando...' : 'Salvar'}
            </SaveButton>
          </div>
        </PageHeader>

        <ContentCard>
          <SectionTitle>Aprovação para criar aluguel</SectionTitle>
          <SectionDescription>
            Quando ativo, novos aluguéis ficam &quot;Aguardando aprovação&quot; e só passam a valer após um usuário com permissão &quot;Gerenciar fluxos de locação&quot; aprovar.
          </SectionDescription>
          <CheckboxRow>
            <input
              type="checkbox"
              id="requireApprovalToCreateRental"
              checked={requireApprovalToCreateRental}
              onChange={e => setRequireApprovalToCreateRental(e.target.checked)}
            />
            <FormLabel htmlFor="requireApprovalToCreateRental">
              Exigir aprovação antes de efetivar a criação do aluguel
            </FormLabel>
          </CheckboxRow>
          <FormHint>
            Atribua a permissão &quot;Gerenciar fluxos de locação&quot; aos usuários que poderão aprovar (ex.: gestor, financeiro).
          </FormHint>
        </ContentCard>
      </RentalStylePageContainer>
    </Layout>
  );
};

export default RentalSettingsPage;
