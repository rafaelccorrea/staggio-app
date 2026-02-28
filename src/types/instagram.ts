/**
 * Tipos da integração Instagram (automação de leads).
 * Separados do instagramApi para evitar que o Vite tente resolver exports nomeados em runtime.
 */
export interface InstagramConfig {
  id: string;
  companyId: string;
  accessToken?: string;
  instagramPageId?: string;
  instagramPageName?: string;
  webhookToken?: string;
  defaultKanbanProjectId?: string;
  responsibleUserId?: string;
  syncLeads: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InstagramPostAutomation {
  id: string;
  companyId: string;
  instagramPostId: string;
  postUrl?: string;
  postCaption?: string;
  triggerKeywords: string;
  autoReplyMessage: string;
  kanbanProjectId?: string;
  postLeadTagIds?: string;
  postLeadNote?: string;
  responsibleUserId?: string;
  isActive: boolean;
  commentsProcessed: number;
  leadsCreated: number;
  createdAt: string;
  updatedAt: string;
}

export interface InstagramInteractionLog {
  id: string;
  companyId: string;
  instagramPostId: string;
  instagramCommentId?: string;
  instagramUserId: string;
  instagramUsername?: string;
  commentText: string;
  matchedKeyword?: string;
  status: string;
  kanbanTaskId?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}
