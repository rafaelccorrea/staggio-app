import { api } from './api';

export interface InsuranceQuoteRequest {
  provider: 'POTTENCIAL' | 'JUNTO_SEGUROS' | 'TOKIO_MARINE' | 'PORTO_SEGURO';
  propertyAddress: string;
  propertyValue: number;
  monthlyRent: number;
  tenantName: string;
  tenantDocument: string;
  tenantEmail?: string;
  tenantPhone?: string;
  rentalStartDate: string;
  rentalEndDate: string;
  coverageType?: string;
  rentalId?: string;
}

export interface InsuranceQuote {
  id: string;
  provider: string;
  monthlyPremium: number;
  coverageAmount: number;
  status: string;
  quoteData: any;
  resultData: any;
  createdAt: string;
  expiresAt?: string;
}

export interface InsurancePolicyRequest {
  quoteId: string;
  rentalId: string;
  additionalData?: any;
  observations?: string;
}

export interface InsurancePolicy {
  id: string;
  provider: string;
  policyNumber: string;
  externalPolicyId: string;
  startDate: string;
  endDate: string;
  monthlyPremium: number;
  coverageAmount: number;
  status: string;
  policyDetails: any;
  createdAt: string;
}

class InsuranceService {
  /**
   * Cria uma cotação de seguro
   */
  async createQuote(data: InsuranceQuoteRequest): Promise<InsuranceQuote> {
    const response = await api.post('/insurance/quote', data);
    return response.data;
  }

  /**
   * Cria cotações em TODAS as seguradoras simultaneamente
   */
  async createQuoteAll(data: Omit<InsuranceQuoteRequest, 'provider'>): Promise<InsuranceQuote[]> {
    const response = await api.post('/insurance/quote-all', data);
    return response.data;
  }

  /**
   * Busca uma cotação específica
   */
  async getQuote(quoteId: string): Promise<InsuranceQuote> {
    const response = await api.get(`/insurance/quote/${quoteId}`);
    return response.data;
  }

  /**
   * Lista cotações
   */
  async listQuotes(rentalId?: string): Promise<InsuranceQuote[]> {
    const params = rentalId ? { rentalId } : {};
    const response = await api.get('/insurance/quotes', { params });
    return response.data;
  }

  /**
   * Cria uma apólice a partir de uma cotação
   */
  async createPolicy(data: InsurancePolicyRequest): Promise<InsurancePolicy> {
    const response = await api.post('/insurance/policy', data);
    return response.data;
  }

  /**
   * Busca uma apólice específica
   */
  async getPolicy(policyId: string): Promise<InsurancePolicy> {
    const response = await api.get(`/insurance/policy/${policyId}`);
    return response.data;
  }

  /**
   * Lista apólices
   */
  async listPolicies(rentalId?: string): Promise<InsurancePolicy[]> {
    const params = rentalId ? { rentalId } : {};
    const response = await api.get('/insurance/policies', { params });
    return response.data;
  }

  /**
   * Cancela uma apólice
   */
  async cancelPolicy(policyId: string): Promise<InsurancePolicy> {
    const response = await api.delete(`/insurance/policy/${policyId}`);
    return response.data;
  }
}

export default new InsuranceService();
