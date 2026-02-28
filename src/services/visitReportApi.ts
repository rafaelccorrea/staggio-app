import { api } from './api';
import type {
  VisitReport,
  CreateVisitReportDto,
  UpdateVisitReportDto,
  GenerateSignatureLinkResponse,
} from '../types/visitReport';

const base = '/visit-reports';

export const visitReportApi = {
  list: async (params?: {
    scope?: 'mine' | 'all';
    clientId?: string;
    kanbanTaskId?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<VisitReport[]> => {
    const { data } = await api.get<VisitReport[]>(base, { params });
    return data;
  },

  getById: async (id: string): Promise<VisitReport> => {
    const { data } = await api.get<VisitReport>(`${base}/${id}`);
    return data;
  },

  create: async (body: CreateVisitReportDto): Promise<VisitReport> => {
    const { data } = await api.post<VisitReport>(base, body);
    return data;
  },

  update: async (id: string, body: UpdateVisitReportDto): Promise<VisitReport> => {
    const { data } = await api.put<VisitReport>(`${base}/${id}`, body);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${base}/${id}`);
  },

  generateSignatureLink: async (
    id: string,
    expiresInDays: number = 7
  ): Promise<GenerateSignatureLinkResponse> => {
    const { data } = await api.post<GenerateSignatureLinkResponse>(
      `${base}/${id}/generate-signature-link`,
      {},
      { params: { expiresInDays } }
    );
    return data;
  },

  /** Retorna o link de assinatura já gerado (para copiar/listar). Falha se não houver link válido. */
  getSignatureLink: async (
    id: string
  ): Promise<{ signatureUrl: string; expiresAt: string }> => {
    const { data } = await api.get<{ signatureUrl: string; expiresAt: string }>(
      `${base}/${id}/signature-link`
    );
    return data;
  },
};
