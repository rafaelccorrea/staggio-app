import { api } from './api';

export interface CreditAnalysisSettings {
  // Aprovação automática
  autoApproveEnabled: boolean;
  autoApproveMinScore: number;
  autoApproveMaxRestrictions: number;
  autoApproveMaxDebt: number;
  autoApproveAllowLawsuits: boolean;
  autoApproveAllowProtests: boolean;
  // Rejeição automática
  autoRejectEnabled: boolean;
  autoRejectMaxScore: number;
  autoRejectMinRestrictions: number;
  autoRejectMinDebt: number;
  autoRejectIfLawsuits: boolean;
  autoRejectIfProtests: boolean;
  // Revisão manual
  manualReviewScoreMin: number;
  manualReviewScoreMax: number;
  manualReviewIfRestrictions: boolean;
  manualReviewIfDebtAbove: number;
  // Outras
  requireIncomeVerification: boolean;
  minIncomeRatio: number;
  // Regras para criação de aluguel
  requireCreditAnalysisToCreateRental: boolean;
  onlyAllowRentalIfAnalysisPositive: boolean;
  minScoreToAllowRental: number | null;
}

/**
 * Busca as configurações de análise de crédito
 */
export async function getCreditAnalysisSettings(): Promise<CreditAnalysisSettings> {
  const response = await api.get<CreditAnalysisSettings>(
    '/credit-analysis/settings'
  );
  return response.data;
}

/**
 * Atualiza as configurações de análise de crédito
 */
export async function updateCreditAnalysisSettings(
  data: CreditAnalysisSettings
): Promise<CreditAnalysisSettings> {
  const response = await api.put<CreditAnalysisSettings>(
    '/credit-analysis/settings',
    data
  );
  return response.data;
}
