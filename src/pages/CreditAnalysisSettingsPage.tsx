import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { MdSave, MdRefresh, MdSettings } from 'react-icons/md';
import { Layout } from '@/components/layout/Layout';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';
import { CreditAnalysisSettingsShimmer } from '@/components/shimmer/CreditAnalysisSettingsShimmer';
import {
  getCreditAnalysisSettings,
  updateCreditAnalysisSettings,
  type CreditAnalysisSettings,
} from '../services/creditAnalysisSettingsService';
import { formatCurrencyValue, getNumericValue } from '@/utils/masks';
import styled from 'styled-components';
import {
  RentalStylePageContainer,
  PageHeader,
  PageTitle,
  PageTitleContainer,
  PageSubtitle,
  ContentCard,
} from '@/styles/components/PageStyles';

const CreditAnalysisSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<CreditAnalysisSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await getCreditAnalysisSettings();
      setSettings(data);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      toast.error('Erro ao carregar configurações.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      await updateCreditAnalysisSettings(settings);
      toast.success('Configurações salvas com sucesso!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setResetConfirmOpen(true);
  };

  const onConfirmReset = () => {
    setResetConfirmOpen(false);
    fetchSettings();
    toast.success('Configurações restauradas.');
  };

  const handleChange = (field: keyof CreditAnalysisSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  if (loading && !settings) {
    return <CreditAnalysisSettingsShimmer />;
  }

  if (!settings) {
    return (
      <Layout>
        <RentalStylePageContainer>
          <ErrorAlert>Erro ao carregar configurações</ErrorAlert>
        </RentalStylePageContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <ConfirmDeleteModal
        isOpen={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onConfirm={onConfirmReset}
        title="Restaurar configurações"
        message="Deseja restaurar as configurações padrão?"
        confirmLabel="Restaurar"
        cancelLabel="Cancelar"
        variant="mark-as-sold"
      />
      <RentalStylePageContainer>
        <PageHeader>
          <PageTitleContainer>
            <PageTitle>
              <MdSettings size={32} />
              Configurações de Análise de Crédito
            </PageTitle>
            <PageSubtitle>
              Personalize os critérios de aprovação e rejeição automática
            </PageSubtitle>
          </PageTitleContainer>
          <HeaderActions>
            <SecondaryButton onClick={handleReset}>
              <MdRefresh size={20} />
              Restaurar Padrão
            </SecondaryButton>
            <PrimaryButton onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <LoadingSpinnerSmall />
                  Salvando...
                </>
              ) : (
                <>
                  <MdSave size={20} />
                  Salvar
                </>
              )}
            </PrimaryButton>
          </HeaderActions>
        </PageHeader>

        {/* Critérios de Aprovação Automática */}
        <ContentCard>
          <SectionTitle>Critérios de Aprovação Automática</SectionTitle>
          <SectionDescription>
            Defina os critérios para aprovar automaticamente uma análise de crédito
          </SectionDescription>

          <FormGrid>
            <FormField>
              <FormLabel>Score Mínimo</FormLabel>
              <FormInput
                type='number'
                value={settings.autoApproveMinScore}
                onChange={(e) =>
                  handleChange('autoApproveMinScore', parseInt(e.target.value))
                }
                min='0'
                max='1000'
              />
              <FormHint>Score mínimo para aprovação automática (0-1000)</FormHint>
            </FormField>

            <FormField>
              <FormLabel>Máximo de Restrições</FormLabel>
              <FormInput
                type='number'
                value={settings.autoApproveMaxRestrictions}
                onChange={(e) =>
                  handleChange('autoApproveMaxRestrictions', parseInt(e.target.value))
                }
                min='0'
              />
              <FormHint>Número máximo de restrições permitidas</FormHint>
            </FormField>

            <FormField>
              <FormLabel>Dívida Máxima</FormLabel>
              <FormInput
                type='text'
                inputMode='decimal'
                placeholder='R$ 0,00'
                value={
                  Number(settings.autoApproveMaxDebt ?? 0) === 0
                    ? ''
                    : formatCurrencyValue(Number(settings.autoApproveMaxDebt ?? 0))
                }
                onChange={(e) =>
                  handleChange('autoApproveMaxDebt', getNumericValue(e.target.value))
                }
              />
              <FormHint>Valor máximo de dívida permitida</FormHint>
            </FormField>

            <FormField>
              <FormLabel>Máximo de Protestos</FormLabel>
              <FormInput
                type='number'
                value={settings.autoApproveMaxProtests}
                onChange={(e) =>
                  handleChange('autoApproveMaxProtests', parseInt(e.target.value))
                }
                min='0'
              />
              <FormHint>Número máximo de protestos permitidos</FormHint>
            </FormField>

            <FormField>
              <FormLabel>Máximo de Ações Judiciais</FormLabel>
              <FormInput
                type='number'
                value={settings.autoApproveMaxLawsuits}
                onChange={(e) =>
                  handleChange('autoApproveMaxLawsuits', parseInt(e.target.value))
                }
                min='0'
              />
              <FormHint>Número máximo de ações judiciais permitidas</FormHint>
            </FormField>
          </FormGrid>
        </ContentCard>

        {/* Critérios de Rejeição Automática */}
        <ContentCard>
          <SectionTitle>Critérios de Rejeição Automática</SectionTitle>
          <SectionDescription>
            Defina os critérios para rejeitar automaticamente uma análise de crédito
          </SectionDescription>

          <FormGrid>
            <FormField>
              <FormLabel>Score Máximo</FormLabel>
              <FormInput
                type='number'
                value={settings.autoRejectMaxScore}
                onChange={(e) =>
                  handleChange('autoRejectMaxScore', parseInt(e.target.value))
                }
                min='0'
                max='1000'
              />
              <FormHint>Score abaixo deste valor será rejeitado (0-1000)</FormHint>
            </FormField>

            <FormField>
              <FormLabel>Mínimo de Restrições</FormLabel>
              <FormInput
                type='number'
                value={settings.autoRejectMinRestrictions}
                onChange={(e) =>
                  handleChange('autoRejectMinRestrictions', parseInt(e.target.value))
                }
                min='0'
              />
              <FormHint>Número mínimo de restrições para rejeitar</FormHint>
            </FormField>

            <FormField>
              <FormLabel>Dívida Mínima</FormLabel>
              <FormInput
                type='text'
                inputMode='decimal'
                placeholder='R$ 0,00'
                value={
                  Number(settings.autoRejectMinDebt ?? 0) === 0
                    ? ''
                    : formatCurrencyValue(Number(settings.autoRejectMinDebt ?? 0))
                }
                onChange={(e) =>
                  handleChange('autoRejectMinDebt', getNumericValue(e.target.value))
                }
              />
              <FormHint>Dívida acima deste valor será rejeitada</FormHint>
            </FormField>

            <FormField>
              <FormLabel>Mínimo de Protestos</FormLabel>
              <FormInput
                type='number'
                value={settings.autoRejectMinProtests}
                onChange={(e) =>
                  handleChange('autoRejectMinProtests', parseInt(e.target.value))
                }
                min='0'
              />
              <FormHint>Número mínimo de protestos para rejeitar</FormHint>
            </FormField>

            <FormField>
              <FormLabel>Mínimo de Ações Judiciais</FormLabel>
              <FormInput
                type='number'
                value={settings.autoRejectMinLawsuits}
                onChange={(e) =>
                  handleChange('autoRejectMinLawsuits', parseInt(e.target.value))
                }
                min='0'
              />
              <FormHint>Número mínimo de ações judiciais para rejeitar</FormHint>
            </FormField>
          </FormGrid>
        </ContentCard>

        {/* Regras para criação de aluguel */}
        <ContentCard>
          <SectionTitle>Regras para criação de aluguel</SectionTitle>
          <SectionDescription>
            Defina quando é permitido vincular uma análise de crédito a um aluguel (no momento da criação do aluguel). Isso ajuda a garantir que só se criem contratos com análise positiva ou score mínimo.
          </SectionDescription>

          <FormGrid>
            <FormField>
              <CheckboxRow>
                <input
                  type="checkbox"
                  id="requireCreditAnalysisToCreateRental"
                  checked={!!settings.requireCreditAnalysisToCreateRental}
                  onChange={(e) =>
                    handleChange('requireCreditAnalysisToCreateRental', e.target.checked)
                  }
                />
                <FormLabel htmlFor="requireCreditAnalysisToCreateRental" style={{ marginBottom: 0, cursor: 'pointer' }}>
                  Exigir análise de crédito vinculada para criar aluguel
                </FormLabel>
              </CheckboxRow>
              <FormHint>Se ativo, ao criar um aluguel será obrigatório selecionar uma análise de crédito para vincular.</FormHint>
            </FormField>

            <FormField>
              <CheckboxRow>
                <input
                  type="checkbox"
                  id="onlyAllowRentalIfAnalysisPositive"
                  checked={!!settings.onlyAllowRentalIfAnalysisPositive}
                  onChange={(e) =>
                    handleChange('onlyAllowRentalIfAnalysisPositive', e.target.checked)
                  }
                />
                <FormLabel htmlFor="onlyAllowRentalIfAnalysisPositive" style={{ marginBottom: 0, cursor: 'pointer' }}>
                  Só permitir criar aluguel se a análise for positiva
                </FormLabel>
              </CheckboxRow>
              <FormHint>Se ativo, só poderá vincular ao aluguel uma análise com recomendação &quot;Aprovar&quot;.</FormHint>
            </FormField>

            <FormField>
              <FormLabel>Score mínimo para permitir criar aluguel</FormLabel>
              <FormInput
                type="number"
                min="0"
                max="1000"
                placeholder="0 = não exige"
                value={settings.minScoreToAllowRental ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === '') {
                    handleChange('minScoreToAllowRental', null);
                    return;
                  }
                  const n = parseInt(v, 10);
                  handleChange('minScoreToAllowRental', Number.isNaN(n) ? null : n);
                }}
              />
              <FormHint>Score mínimo da análise para poder vincular ao aluguel. Deixe 0 ou vazio para não exibir score mínimo.</FormHint>
            </FormField>
          </FormGrid>
        </ContentCard>

        {/* Regras de Revisão Manual */}
        <ContentCard>
          <SectionTitle>Regras de Revisão Manual</SectionTitle>
          <SectionDescription>
            Casos que não se encaixam nos critérios acima serão enviados para revisão manual
          </SectionDescription>

          <InfoBox>
            <InfoIcon>ℹ️</InfoIcon>
            <InfoText>
              Análises que não atendem aos critérios de aprovação nem de rejeição
              automática serão marcadas para revisão manual. Um analista humano
              deverá avaliar esses casos individualmente.
            </InfoText>
          </InfoBox>
        </ContentCard>
      </RentalStylePageContainer>
    </Layout>
  );
};

// Styled Components
const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.hover};
    border-color: ${props => props.theme.colors.primary};
  }
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0 0 8px 0;
`;

const SectionDescription = styled.p`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0 0 24px 0;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
`;

const FormLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  margin-bottom: 8px;
`;

const FormInput = styled.input`
  padding: 12px 16px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  color: ${props => props.theme.colors.text};
  background: ${props => props.theme.colors.inputBackground};
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => `${props.theme.colors.primary}20`};
  }

  &::placeholder {
    color: ${props => props.theme.colors.textLight};
  }
`;

const FormHint = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.textLight};
  margin-top: 6px;
`;

const CheckboxRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  input[type='checkbox'] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
`;

const InfoBox = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px;
  background: ${props => props.theme.colors.infoBackground};
  border: 1px solid ${props => props.theme.colors.infoBorder};
  border-radius: 12px;
`;

const InfoIcon = styled.div`
  font-size: 20px;
  flex-shrink: 0;
`;

const InfoText = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.infoText};
  line-height: 1.5;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${props => props.theme.colors.border};
  border-top-color: ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingSpinnerSmall = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.div`
  margin-top: 16px;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 14px;
`;

const ErrorAlert = styled.div`
  padding: 16px;
  background: ${props => props.theme.colors.errorBackground};
  border: 1px solid ${props => props.theme.colors.errorBorder};
  border-radius: 12px;
  color: ${props => props.theme.colors.errorText};
  font-size: 14px;
`;

export default CreditAnalysisSettingsPage;
