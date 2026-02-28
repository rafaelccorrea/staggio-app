import { api } from './api';
import type {
  PropertyOffer,
  UpdateOfferStatusRequest,
} from '../types/propertyOffer';

/**
 * Interface para filtros de ofertas
 */
export interface OfferFilters {
  propertyId?: string;
  status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'expired';
  type?: 'sale' | 'rental';
}

/**
 * API de ofertas de propriedades
 * Para uso por imobiliárias e responsáveis por propriedades
 */
class PropertyOffersApiService {
  private readonly baseUrl = '/properties/offers';

  /**
   * Listar ofertas de uma propriedade específica
   * GET /properties/offers/property/:propertyId
   */
  async getPropertyOffers(propertyId: string): Promise<PropertyOffer[]> {
    try {
      const response = await api.get(`${this.baseUrl}/property/${propertyId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar ofertas da propriedade:', error);
      throw new Error(
        error.response?.data?.message || 'Erro ao buscar ofertas da propriedade'
      );
    }
  }

  /**
   * Listar todas as ofertas da empresa com filtros opcionais
   * GET /properties/offers
   */
  async getAllOffers(filters?: OfferFilters): Promise<PropertyOffer[]> {
    try {
      // Limpar e validar filtros
      const cleanParams: Record<string, string> = {};

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          // Ignora valores undefined, null ou string vazia
          if (value === undefined || value === null || value === '') {
            return;
          }

          // Validação especial para propertyId - deve ser UUID válido
          if (key === 'propertyId') {
            const uuidRegex =
              /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            const valueStr = String(value).trim();
            if (uuidRegex.test(valueStr)) {
              cleanParams[key] = valueStr;
            } else {
              console.warn(`⚠️ propertyId inválido ignorado: ${valueStr}`);
            }
          } else if (key === 'status' || key === 'type') {
            // Para status e type, valida que não está vazio e não é 'all'
            const valueStr = String(value).trim();
            if (valueStr && valueStr !== 'all') {
              cleanParams[key] = valueStr;
            }
          }
        });
      }

      // Só adiciona params se houver filtros válidos
      const requestConfig =
        Object.keys(cleanParams).length > 0
          ? { params: cleanParams }
          : undefined;

      const finalUrl = requestConfig
        ? `${this.baseUrl}?${new URLSearchParams(cleanParams).toString()}`
        : this.baseUrl;


      const response = await api.get(finalUrl);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar ofertas:', error);
      console.error('📋 Detalhes do erro:', {
        message: error.response?.data?.message,
        status: error.response?.status,
        path: error.response?.data?.path,
        method: error.config?.method,
        url: error.config?.url,
        fullUrl: error.config?.baseURL + error.config?.url,
        params: error.config?.params,
        filters: filters,
      });
      throw new Error(
        error.response?.data?.message || 'Erro ao buscar ofertas'
      );
    }
  }

  /**
   * Buscar oferta por ID
   * GET /properties/offers/detail/:offerId
   */
  async getOfferById(offerId: string): Promise<PropertyOffer> {
    try {
      const response = await api.get(`${this.baseUrl}/detail/${offerId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar oferta:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar oferta');
    }
  }

  /**
   * Aceitar ou rejeitar uma oferta
   * PUT /properties/offers/detail/:offerId/status
   */
  async updateOfferStatus(
    offerId: string,
    data: UpdateOfferStatusRequest
  ): Promise<PropertyOffer> {
    try {
      const response = await api.put(
        `${this.baseUrl}/detail/${offerId}/status`,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao atualizar status da oferta:', error);
      throw new Error(
        error.response?.data?.message || 'Erro ao atualizar status da oferta'
      );
    }
  }
}

export const propertyOffersApi = new PropertyOffersApiService();
