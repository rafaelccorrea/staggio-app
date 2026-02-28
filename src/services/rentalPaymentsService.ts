import { api } from './api';

export interface RentalPayment {
  id: string;
  rentalId: string;
  dueDate: string;
  paymentDate?: string;
  value: number;
  paidValue?: number;
  discountValue?: number;
  interestValue?: number;
  fineValue?: number;
  status: string;
  paymentMethod?: string;
  observations?: string;
  receiptUrl?: string;
  referenceMonth?: string;
  asaasPaymentId?: string;
  asaasInvoiceUrl?: string;
  asaasBankSlipUrl?: string;
  asaasPixQrCode?: string;
  asaasPixCopyPaste?: string;
  asaasStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AsaasChargeDetails {
  id: string;
  customer: string;
  value: number;
  dueDate: string;
  description: string;
  billingType: string;
  status: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
}

class RentalPaymentsService {
  /**
   * Listar pagamentos da locação (paginado), com filtros opcionais.
   */
  async getRentalPaymentsPaginated(
    rentalId: string,
    page: number = 1,
    limit: number = 10,
    filters?: {
      status?: string;
      hasCharge?: boolean;
      referenceMonthFrom?: string;
      referenceMonthTo?: string;
    },
  ): Promise<{
    data: RentalPayment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const params: Record<string, string | number> = { page, limit };
    if (filters?.status) params.status = filters.status;
    if (filters?.hasCharge === true) params.hasCharge = 'true';
    if (filters?.hasCharge === false) params.hasCharge = 'false';
    if (filters?.referenceMonthFrom) params.referenceMonthFrom = filters.referenceMonthFrom;
    if (filters?.referenceMonthTo) params.referenceMonthTo = filters.referenceMonthTo;
    const response = await api.get(`/rental/${rentalId}/payments`, { params });
    return response.data;
  }

  /**
   * Criar parcela no sistema e gerar cobrança (boleto/PIX)
   */
  async createPaymentAndCharge(
    rentalId: string,
    params: {
      referenceMonth: string;
      dueDate: string;
      value: number;
      observations?: string;
      billingType: 'BOLETO' | 'PIX';
    },
  ): Promise<{ message: string }> {
    const response = await api.post(
      `/rental/payments/${rentalId}/create-and-charge`,
      params,
    );
    return response.data;
  }

  /**
   * Gerar cobrança para uma parcela já existente (data de vencimento e tipo: Boleto ou PIX)
   */
  async generateCharge(
    rentalId: string,
    params: { dueDate: string; billingType: 'BOLETO' | 'PIX'; paymentId?: string },
  ): Promise<{ paymentId: string; message: string }> {
    const response = await api.post(
      `/rental/payments/${rentalId}/generate-charge`,
      params,
    );
    return response.data;
  }

  /**
   * Gerar cobranças para todos os pagamentos pendentes de uma locação
   */
  async generateAllCharges(rentalId: string): Promise<{ count: number; message: string }> {
    const response = await api.post(`/rental/payments/${rentalId}/generate-asaas-charges`);
    return response.data;
  }

  /**
   * Buscar detalhes de uma cobrança
   */
  async getChargeDetails(asaasPaymentId: string): Promise<AsaasChargeDetails> {
    const response = await api.get(`/rental/payments/asaas/${asaasPaymentId}`);
    return response.data;
  }

  /**
   * Cancelar/Excluir cobrança
   */
  async cancelCharge(paymentId: string): Promise<{ message: string }> {
    const response = await api.post(`/rental/payments/cancel/${paymentId}`);
    return response.data;
  }

  /**
   * Editar cobrança (data de vencimento e/ou valor). Apenas cobranças aguardando pagamento ou vencidas.
   */
  async updateCharge(
    rentalId: string,
    paymentId: string,
    params: { dueDate?: string; value?: number },
  ): Promise<{ message: string }> {
    const response = await api.put(
      `/rental/payments/${rentalId}/charge/${paymentId}`,
      params,
    );
    return response.data;
  }

  /**
   * Cancelar várias cobranças (ação em lote). Retorna { cancelled, skipped, errors }.
   */
  async batchCancelCharges(
    rentalId: string,
    paymentIds: string[],
  ): Promise<{ cancelled: number; skipped: number; errors: string[] }> {
    const response = await api.post('/rental/payments/batch/cancel', {
      rentalId,
      paymentIds,
    });
    return response.data;
  }

  /**
   * Marcar várias cobranças como pago (ação em lote). Retorna { marked, skipped, errors }.
   */
  async batchMarkAsPaid(
    rentalId: string,
    paymentIds: string[],
    paymentDate?: string,
  ): Promise<{ marked: number; skipped: number; errors: string[] }> {
    const response = await api.post('/rental/payments/batch/mark-paid', {
      rentalId,
      paymentIds,
      paymentDate,
    });
    return response.data;
  }

  /**
   * Obter link de pagamento e dados PIX (QR Code e código copia e cola).
   * Se não estiverem no pagamento, o backend busca no gateway e retorna.
   */
  async getPixPaymentInfo(
    rentalId: string,
    paymentId: string,
  ): Promise<{
    invoiceUrl?: string;
    pixQrCodeBase64?: string;
    pixCopyPaste?: string;
  }> {
    const response = await api.get<{
      invoiceUrl?: string;
      pixQrCodeBase64?: string;
      pixCopyPaste?: string;
    }>(`/rental/${rentalId}/payments/${paymentId}/pix-info`);
    return response.data;
  }

  /**
   * Buscar pagamentos de uma locação (primeira página, até 500 itens)
   */
  async getRentalPayments(rentalId: string): Promise<RentalPayment[]> {
    const response = await api.get(`/rental/${rentalId}/payments`, {
      params: { page: 1, limit: 500 },
    });
    return response.data?.data ?? response.data ?? [];
  }
}

export default new RentalPaymentsService();
