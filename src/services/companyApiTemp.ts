import { api } from './api';

export interface CreateCompanyData {
  name: string;
  cnpj: string;
  corporateName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  corporateName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  logo?: string;
  logoUrl?: string; // Backend pode retornar logoUrl
  description?: string;
  website?: string;
  isActive: boolean;
  planType: string;
  maxCompanies: number;
  subscriptionPrice: number;
  availableModules: string[];
  planFeatures: Record<string, any>;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  subscriptionStatus: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

class CompanyApiService {
  async createCompany(data: CreateCompanyData): Promise<Company> {
    try {
      const response = await api.post('/companies', data);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar empresa:', error);
      throw error;
    }
  }

  async getCompanies(): Promise<Company[]> {
    try {
      const response = await api.get('/companies');

      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar empresas:', error);
      console.error('❌ Status do erro:', error.response?.status);
      console.error('❌ Dados do erro:', error.response?.data);
      console.error('❌ Mensagem do erro:', error.message);
      throw error;
    }
  }

  async getCompanyById(id: string): Promise<Company> {
    try {
      const response = await api.get(`/companies/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar empresa:', error);
      throw error;
    }
  }

  async updateCompany(
    id: string,
    data: Partial<CreateCompanyData>
  ): Promise<Company> {
    try {
      const response = await api.put(`/companies/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao atualizar empresa:', error);
      throw error;
    }
  }

  async deleteCompany(id: string): Promise<void> {
    try {
      await api.delete(`/companies/${id}`);
    } catch (error: any) {
      console.error('Erro ao deletar empresa:', error);
      throw error;
    }
  }
}

export const companyApi = new CompanyApiService();
