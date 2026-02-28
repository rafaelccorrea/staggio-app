export type VisitReportSignatureStatus = 'pending' | 'signed' | 'expired';

export interface VisitReportPropertyItem {
  id: string;
  propertyId?: string;
  propertyCode?: string;
  address: string;
  reference?: string;
  displayOrder: number;
}

export interface VisitReport {
  id: string;
  companyId: string;
  clientId: string;
  createdById?: string;
  visitDate: string;
  kanbanTaskId?: string;
  signatureStatus: VisitReportSignatureStatus;
  /** Data de expiração do link de assinatura (quando gerado). */
  signatureExpiresAt?: string;
  signedAt?: string;
  signerName?: string;
  notes?: string;
  properties: VisitReportPropertyItem[];
  createdAt: string;
  updatedAt: string;
  clientName?: string;
  kanbanTaskTitle?: string;
}

export interface CreateVisitReportPropertyDto {
  propertyId?: string;
  address: string;
  reference?: string;
  displayOrder?: number;
}

export interface CreateVisitReportDto {
  clientId: string;
  visitDate: string;
  kanbanTaskId?: string;
  properties: CreateVisitReportPropertyDto[];
  notes?: string;
}

export interface UpdateVisitReportDto {
  visitDate?: string;
  kanbanTaskId?: string;
  properties?: CreateVisitReportPropertyDto[];
  notes?: string;
}

export interface GenerateSignatureLinkResponse {
  signatureUrl: string;
  expiresAt: string;
  expiresInDays: number;
}
