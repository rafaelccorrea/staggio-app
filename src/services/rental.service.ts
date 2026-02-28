import { api } from './api';
import type {
  Rental,
  CreateRentalRequest,
  UpdateRentalRequest,
  RentalListResponse,
  RentalStatus,
  CreatePaymentRequest,
  UpdatePaymentRequest,
  RentalPayment,
  RentalHistoryEntry,
  RentalCommentEntry,
  RentalHistoryPaginated,
  RentalCommentsPaginated,
} from '../types/rental.types';
import type { RentalFilters } from '../types/filters';

export const rentalService = {
  // CRUD de Aluguéis
  async create(data: CreateRentalRequest): Promise<Rental> {
    const response = await api.post<Rental>('/rental', data);
    return response.data;
  },

  async getAll(filters?: RentalFilters): Promise<RentalListResponse> {
    const response = await api.get<RentalListResponse>('/rental', {
      params: filters,
    });
    return response.data;
  },

  async getById(id: string): Promise<Rental> {
    const response = await api.get<Rental>(`/rental/${id}`);
    return response.data;
  },

  async update(id: string, data: UpdateRentalRequest): Promise<Rental> {
    const response = await api.put<Rental>(`/rental/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/rental/${id}`);
  },

  async checkAvailability(
    propertyId: string,
    startDate: string,
    endDate: string,
    excludeRentalId?: string | null
  ): Promise<{ available: boolean }> {
    const params: Record<string, string> = {
      propertyId,
      startDate,
      endDate,
    };
    if (excludeRentalId) params.excludeRentalId = excludeRentalId;
    const response = await api.get<{ available: boolean }>(
      '/rental/check-availability',
      { params }
    );
    return response.data;
  },

  async updateStatus(id: string, status: RentalStatus): Promise<Rental> {
    const response = await api.put<Rental>(`/rental/${id}/status`, { status });
    return response.data;
  },

  // Configurações de aluguel (ex.: exigir aprovação para criar)
  async getSettings(): Promise<{ requireApprovalToCreateRental: boolean }> {
    const response = await api.get<{ requireApprovalToCreateRental: boolean }>('/rental/settings');
    return response.data;
  },

  async updateSettings(data: { requireApprovalToCreateRental?: boolean }): Promise<{ requireApprovalToCreateRental: boolean }> {
    const response = await api.put<{ requireApprovalToCreateRental: boolean }>('/rental/settings', data);
    return response.data;
  },

  async approveRental(id: string): Promise<Rental> {
    const response = await api.post<Rental>(`/rental/${id}/approve`);
    return response.data;
  },

  async rejectRental(id: string): Promise<Rental> {
    const response = await api.post<Rental>(`/rental/${id}/reject`);
    return response.data;
  },

  async getHistory(
    rentalId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<RentalHistoryPaginated> {
    const response = await api.get<RentalHistoryPaginated>(
      `/rental/${rentalId}/history`,
      { params: { page, limit } },
    );
    return response.data;
  },

  async getComments(
    rentalId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<RentalCommentsPaginated> {
    const response = await api.get<RentalCommentsPaginated>(
      `/rental/${rentalId}/comments`,
      { params: { page, limit } },
    );
    return response.data;
  },

  async addComment(rentalId: string, content: string): Promise<RentalCommentEntry> {
    const response = await api.post<RentalCommentEntry>(`/rental/${rentalId}/comments`, { content });
    return response.data;
  },

  // Gestão de Pagamentos
  async generatePayments(rentalId: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      `/rental/${rentalId}/payments/generate`
    );
    return response.data;
  },

  async getPayments(rentalId: string): Promise<RentalPayment[]> {
    const response = await api.get<RentalPayment[]>(
      `/rental/${rentalId}/payments`
    );
    return response.data;
  },

  async addPayment(
    rentalId: string,
    data: CreatePaymentRequest
  ): Promise<Rental> {
    const response = await api.post<Rental>(
      `/rental/${rentalId}/payments`,
      data
    );
    return response.data;
  },

  async updatePayment(
    rentalId: string,
    paymentId: string,
    data: UpdatePaymentRequest
  ): Promise<Rental> {
    const response = await api.put<Rental>(
      `/rental/${rentalId}/payments/${paymentId}`,
      data
    );
    return response.data;
  },

  async deletePayment(rentalId: string, paymentId: string): Promise<void> {
    await api.delete(`/rental/${rentalId}/payments/${paymentId}`);
  },
};
