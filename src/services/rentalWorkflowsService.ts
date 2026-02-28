import { api } from './api';

/** Formato usado no formulário (stepType, name) */
export interface RentalWorkflowStep {
  id?: string;
  stepType: string;
  name: string;
  description?: string;
  isRequired: boolean;
  order: number;
  config?: Record<string, any>;
}

/** Payload que a API espera para cada etapa (type, title) */
interface CreateRentalWorkflowStepPayload {
  type: string;
  title: string;
  description?: string;
  isRequired?: boolean;
  config?: Record<string, any>;
}

export interface RentalWorkflow {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  isDefault: boolean;
  steps: RentalWorkflowStep[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRentalWorkflowDto {
  name: string;
  description?: string;
  isActive: boolean;
  isDefault: boolean;
  steps: RentalWorkflowStep[];
}

/** Converte etapas do formulário para o formato da API */
function stepsToPayload(steps: RentalWorkflowStep[]): CreateRentalWorkflowStepPayload[] {
  return steps.map(({ stepType, name, description, isRequired, config }) => ({
    type: stepType,
    title: name,
    ...(description != null && description !== '' && { description }),
    ...(isRequired != null && { isRequired }),
    ...(config != null && { config }),
  }));
}

/** Normaliza etapa vinda da API para o formato do formulário */
function stepFromApi(step: { type?: string; title?: string; description?: string; isRequired?: boolean; order?: number; id?: string; config?: Record<string, any> }): RentalWorkflowStep {
  return {
    id: step.id,
    stepType: step.type ?? '',
    name: step.title ?? '',
    description: step.description,
    isRequired: step.isRequired ?? true,
    order: step.order ?? 0,
    config: step.config,
  };
}

export interface WorkflowStatus {
  id: string;
  rentalId: string;
  workflowId: string;
  stepId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  completedBy?: string;
  completedAt?: string;
  notes?: string;
  attachments?: any[];
  step: RentalWorkflowStep;
}

const rentalWorkflowsService = {
  async getAll(): Promise<RentalWorkflow[]> {
    const response = await api.get<RentalWorkflow[]>('/rental-workflows');
    return (response.data ?? []).map(w => ({
      ...w,
      isActive: w.isActive ?? true,
      steps: (w.steps ?? []).map((s: any, index: number) => ({
        ...stepFromApi(s),
        order: s.order ?? index,
      })),
    }));
  },

  async getById(id: string): Promise<RentalWorkflow> {
    const response = await api.get<RentalWorkflow>(`/rental-workflows/${id}`);
    const raw = response.data;
    return {
      ...raw,
      isActive: raw.isActive ?? true,
      steps: (raw.steps ?? []).map((s: any, index: number) => ({
        ...stepFromApi(s),
        order: s.order ?? index,
      })),
    };
  },

  async create(data: CreateRentalWorkflowDto): Promise<RentalWorkflow> {
    const payload = {
      name: data.name,
      ...(data.description != null && data.description !== '' && { description: data.description }),
      isDefault: data.isDefault ?? false,
      steps: stepsToPayload(data.steps),
    };
    const response = await api.post<RentalWorkflow>('/rental-workflows', payload);
    const raw = response.data;
    return {
      ...raw,
      isActive: raw.isActive ?? true,
      steps: (raw.steps ?? []).map((s: any, index: number) => ({
        ...stepFromApi(s),
        order: s.order ?? index,
      })),
    };
  },

  async update(id: string, data: Partial<CreateRentalWorkflowDto>): Promise<RentalWorkflow> {
    const payload: Record<string, unknown> = {};
    if (data.name != null) payload.name = data.name;
    if (data.description != null) payload.description = data.description;
    if (data.isDefault != null) payload.isDefault = data.isDefault;
    if (data.steps != null) payload.steps = stepsToPayload(data.steps);
    const response = await api.put<RentalWorkflow>(`/rental-workflows/${id}`, payload);
    const raw = response.data;
    return {
      ...raw,
      isActive: raw.isActive ?? true,
      steps: (raw.steps ?? []).map((s: any, index: number) => ({
        ...stepFromApi(s),
        order: s.order ?? index,
      })),
    };
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/rental-workflows/${id}`);
  },

  async getWorkflowStatus(rentalId: string): Promise<WorkflowStatus[]> {
    const response = await api.get<WorkflowStatus[]>(
      `/rental-workflows/rental/${rentalId}/status`
    );
    return response.data;
  },

  async completeStep(
    rentalId: string,
    stepId: string,
    data: { notes?: string; attachments?: any[] }
  ): Promise<WorkflowStatus> {
    const response = await api.post<WorkflowStatus>(
      `/rental-workflows/rental/${rentalId}/step/${stepId}/complete`,
      data
    );
    return response.data;
  },
};

export default rentalWorkflowsService;
