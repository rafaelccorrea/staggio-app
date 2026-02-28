import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Layout } from '../components/layout/Layout';
import { RentalWorkflowFormShimmer } from '../components/shimmer/RentalWorkflowFormShimmer';
import { toast } from 'react-toastify';
import rentalWorkflowsService, {
  type RentalWorkflowStep,
  type CreateRentalWorkflowDto,
} from '../services/rentalWorkflowsService';
import { MdAdd, MdArrowBack, MdDelete, MdDragIndicator, MdSave } from 'react-icons/md';

/** Valores devem coincidir com o enum do backend (RentalWorkflowStepType) */
const STEP_TYPES = [
  { value: 'PAYMENT_RESERVATION_FEE', label: 'Pagamento de Taxa de Reserva' },
  { value: 'UPLOAD_PROOF_OF_PAYMENT', label: 'Upload de Comprovante de Pagamento' },
  { value: 'INSURANCE_HIRE', label: 'Contratação de Seguro' },
  { value: 'CREDIT_ANALYSIS', label: 'Análise de Crédito' },
  { value: 'DOCUMENTATION_UPLOAD', label: 'Upload de Documentação' },
  { value: 'INITIAL_INSPECTION', label: 'Vistoria Inicial' },
  { value: 'CONTRACT_SIGNATURE', label: 'Assinatura de Contrato' },
];

const RentalWorkflowFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CreateRentalWorkflowDto>({
    name: '',
    description: '',
    isActive: true,
    isDefault: false,
    steps: [],
  });

  useEffect(() => {
    if (id) {
      loadWorkflow();
    }
  }, [id]);

  const loadWorkflow = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const workflow = await rentalWorkflowsService.getById(id);
      setFormData({
        name: workflow.name,
        description: workflow.description || '',
        isActive: workflow.isActive,
        isDefault: workflow.isDefault,
        steps: workflow.steps,
      });
    } catch {
      toast.error('Erro ao carregar fluxo');
      navigate('/settings/rental-workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStep = () => {
    const newStep: RentalWorkflowStep = {
      stepType: 'PAYMENT_RESERVATION_FEE',
      name: 'Nova Etapa',
      description: '',
      isRequired: true,
      order: formData.steps.length,
    };
    setFormData({ ...formData, steps: [...formData.steps, newStep] });
  };

  const handleRemoveStep = (index: number) => {
    const newSteps = formData.steps.filter((_, i) => i !== index);
    setFormData({ ...formData, steps: newSteps });
  };

  const handleStepChange = (index: number, field: string, value: unknown) => {
    const newSteps = [...formData.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setFormData({ ...formData, steps: newSteps });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Nome do fluxo é obrigatório');
      return;
    }
    if (formData.steps.length === 0) {
      toast.error('Adicione pelo menos uma etapa');
      return;
    }

    try {
      setSaving(true);
      if (isEdit && id) {
        await rentalWorkflowsService.update(id, formData);
        toast.success('Fluxo atualizado com sucesso');
      } else {
        await rentalWorkflowsService.create(formData);
        toast.success('Fluxo criado com sucesso');
      }
      navigate('/settings/rental-workflows');
    } catch {
      toast.error('Erro ao salvar fluxo');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <RentalWorkflowFormShimmer />;
  }

  return (
    <Layout>
      <Container>
        <PageHeader>
          <BackButton type="button" onClick={() => navigate('/settings/rental-workflows')}>
            <MdArrowBack /> Voltar
          </BackButton>
          <Title>{isEdit ? 'Editar Fluxo' : 'Novo Fluxo'}</Title>
        </PageHeader>

        <Form onSubmit={handleSubmit}>
          <Section>
            <FormGroup>
              <Label>Nome do Fluxo *</Label>
              <Input
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Fluxo Padrão de Locação"
              />
            </FormGroup>

            <FormGroup>
              <Label>Descrição</Label>
              <TextArea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o propósito deste fluxo"
                rows={3}
              />
            </FormGroup>

            <CheckboxGroup>
              <Checkbox
                type="checkbox"
                checked={formData.isActive}
                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <Label>Fluxo ativo</Label>
            </CheckboxGroup>

            <CheckboxGroup>
              <Checkbox
                type="checkbox"
                checked={formData.isDefault}
                onChange={e => setFormData({ ...formData, isDefault: e.target.checked })}
              />
              <Label>Definir como fluxo padrão</Label>
            </CheckboxGroup>
          </Section>

          <StepsSection>
            <StepsHeader>
              <Label>Etapas do Fluxo</Label>
              <SmallButton type="button" onClick={handleAddStep}>
                <MdAdd /> Adicionar Etapa
              </SmallButton>
            </StepsHeader>

            {formData.steps.map((step, index) => (
              <StepCard key={index}>
                <StepHeader>
                  <MdDragIndicator />
                  <StepNumber>Etapa {index + 1}</StepNumber>
                  <IconButton type="button" onClick={() => handleRemoveStep(index)}>
                    <MdDelete />
                  </IconButton>
                </StepHeader>

                <FormGroup>
                  <Label>Tipo de Etapa</Label>
                  <Select
                    value={step.stepType}
                    onChange={e => handleStepChange(index, 'stepType', e.target.value)}
                  >
                    {STEP_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>Nome da Etapa</Label>
                  <Input
                    value={step.name}
                    onChange={e => handleStepChange(index, 'name', e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Descrição</Label>
                  <Input
                    value={step.description || ''}
                    onChange={e => handleStepChange(index, 'description', e.target.value)}
                  />
                </FormGroup>

                <CheckboxGroup>
                  <Checkbox
                    type="checkbox"
                    checked={step.isRequired}
                    onChange={e => handleStepChange(index, 'isRequired', e.target.checked)}
                  />
                  <Label>Etapa obrigatória</Label>
                </CheckboxGroup>
              </StepCard>
            ))}
          </StepsSection>

          <Footer>
            <Button type="button" secondary onClick={() => navigate('/settings/rental-workflows')}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              <MdSave /> {saving ? 'Salvando...' : 'Salvar Fluxo'}
            </Button>
          </Footer>
        </Form>
      </Container>
    </Layout>
  );
};

// Styled Components - mesmo layout do dashboard de locações
const Container = styled.div`
  padding: 20px 24px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  min-height: 100%;
  box-sizing: border-box;

  @media (min-width: 768px) {
    padding: 24px 28px;
  }
  @media (min-width: 1024px) {
    padding: 24px 32px;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: ${p => p.theme.colors.primary};
  font-size: 0.9375rem;
  cursor: pointer;
  margin-bottom: 1rem;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

const Title = styled.h1`
  font-size: 1.75rem;
  color: ${p => p.theme.colors.text};
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: ${p => p.theme.colors.text};
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 8px;
  background: ${p => p.theme.colors.background};
  color: ${p => p.theme.colors.text};
  font-size: 1rem;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${p => p.theme.colors.primary};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 8px;
  background: ${p => p.theme.colors.background};
  color: ${p => p.theme.colors.text};
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${p => p.theme.colors.primary};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 8px;
  background: ${p => p.theme.colors.background};
  color: ${p => p.theme.colors.text};
  font-size: 1rem;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${p => p.theme.colors.primary};
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
`;

const StepsSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const StepsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const SmallButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${p => p.theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

const StepCard = styled.div`
  background: ${p => p.theme.colors.cardBackground};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 8px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const StepHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: ${p => p.theme.colors.textSecondary};
`;

const StepNumber = styled.span`
  font-weight: 600;
  color: ${p => p.theme.colors.text};
  flex: 1;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${p => p.theme.colors.textSecondary};
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.35rem;
  border-radius: 4px;

  &:hover {
    background: ${p => p.theme.colors.border};
    color: ${p => p.theme.colors.text};
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  margin-top: 0.5rem;
  border-top: 1px solid ${p => p.theme.colors.border};
`;

const Button = styled.button<{ secondary?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${p => (p.secondary ? 'transparent' : p.theme.colors.primary)};
  color: ${p => (p.secondary ? p.theme.colors.text : '#fff')};
  border: ${p =>
    p.secondary ? `2px solid ${p.theme.colors.border}` : 'none'};
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default RentalWorkflowFormPage;
