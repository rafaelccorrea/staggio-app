import { api } from './api';

export interface CreditAnalysisRental {
  id: string;
  tenantName?: string;
  tenantDocument?: string;
  startDate?: string;
  endDate?: string;
  monthlyValue?: number;
  status?: string;
  property?: { id: string; address?: string; title?: string };
}

export interface CreditAnalysis {
  id: string;
  analyzedCpf: string;
  analyzedName: string;
  provider: string;
  status: string;
  creditScore: number;
  riskLevel: string;
  hasRestrictions: boolean;
  restrictionsCount: number;
  totalDebt: number;
  hasLawsuits: boolean;
  lawsuitsCount: number;
  hasProtests: boolean;
  protestsCount: number;
  recommendation: string;
  notes: string;
  reviewedBy: string;
  reviewedAt: string;
  createdAt: string;
  updatedAt: string;
  /** Mensagem amigável quando status === 'ERROR' (ex.: CPF não encontrado na Serasa) */
  errorMessage?: string;
  /** Aluguel vinculado (quando existir) */
  rentalId?: string | null;
  rental?: CreditAnalysisRental | null;
}

export interface CreateCreditAnalysisDto {
  analyzedCpf: string;
  analyzedName?: string;
  /** Opcional: vincular a um aluguel ao criar */
  rentalId?: string | null;
}

export interface UpdateCreditAnalysisDto {
  recommendation?: string;
  notes?: string;
  /** Vincular ou desvincular a um aluguel (null para desvincular) */
  rentalId?: string | null;
}

export interface CreditAnalysisStatistics {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  approved: number;
  rejected: number;
  manualReview: number;
  averageScore: number;
  approvalRate: number;
  byRiskLevel: {
    veryLow: number;
    low: number;
    medium: number;
    high: number;
    veryHigh: number;
  };
}

/**
 * Busca todas as análises de crédito (opcional: filtrar por rentalId ou cpf)
 */
export async function getCreditAnalyses(params?: {
  rentalId?: string;
  cpf?: string;
  status?: string;
}): Promise<CreditAnalysis[]> {
  const response = await api.get<CreditAnalysis[]>('/credit-analysis', {
    params: params ?? {},
  });
  return response.data;
}

/**
 * Busca uma análise de crédito por ID
 */
export async function getCreditAnalysisById(
  id: string
): Promise<CreditAnalysis> {
  const response = await api.get<CreditAnalysis>(`/credit-analysis/${id}`);
  return response.data;
}

/**
 * Cria uma nova análise de crédito
 */
export async function createCreditAnalysis(
  data: CreateCreditAnalysisDto
): Promise<CreditAnalysis> {
  const response = await api.post<CreditAnalysis>('/credit-analysis', data);
  return response.data;
}

/**
 * Atualiza uma análise de crédito (revisão manual ou vínculo com aluguel)
 */
export async function updateCreditAnalysis(
  id: string,
  data: UpdateCreditAnalysisDto
): Promise<CreditAnalysis> {
  const response = await api.patch<CreditAnalysis>(
    `/credit-analysis/${id}`,
    data
  );
  return response.data;
}

/**
 * Busca estatísticas de análises de crédito
 */
export async function getCreditAnalysisStatistics(): Promise<CreditAnalysisStatistics> {
  const response = await api.get<CreditAnalysisStatistics>(
    '/credit-analysis/statistics'
  );
  return response.data;
}
