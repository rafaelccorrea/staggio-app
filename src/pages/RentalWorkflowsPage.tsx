import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Layout } from '../components/layout/Layout';
import { RentalWorkflowsShimmer } from '../components/shimmer/RentalWorkflowsShimmer';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import { toast } from 'react-toastify';
import rentalWorkflowsService, { type RentalWorkflow } from '../services/rentalWorkflowsService';
import { MdAdd, MdEdit, MdDelete, MdAccountTree, MdChevronRight } from 'react-icons/md';

const MAX_STEPS_PREVIEW = 3;

const RentalWorkflowsPage: React.FC = () => {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<RentalWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    workflow: RentalWorkflow | null;
    isDeleting: boolean;
  }>({ isOpen: false, workflow: null, isDeleting: false });

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const data = await rentalWorkflowsService.getAll();
      setWorkflows(data);
    } catch {
      toast.error('Erro ao carregar fluxos');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (workflow: RentalWorkflow) => {
    setDeleteModal({ isOpen: true, workflow, isDeleting: false });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.workflow) return;
    setDeleteModal(prev => ({ ...prev, isDeleting: true }));
    try {
      await rentalWorkflowsService.delete(deleteModal.workflow.id);
      toast.success('Fluxo excluído com sucesso');
      setDeleteModal({ isOpen: false, workflow: null, isDeleting: false });
      loadWorkflows();
    } catch {
      toast.error('Erro ao excluir fluxo');
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  if (loading) {
    return <RentalWorkflowsShimmer />;
  }

  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <HeaderContent>
            <HeaderIcon>
              <MdAccountTree size={28} />
            </HeaderIcon>
            <HeaderText>
              <PageTitle>Fluxos de Locação</PageTitle>
              <PageSubtitle>
                Defina as etapas que devem ser concluídas em cada locação (vistoria, documentação, etc.)
              </PageSubtitle>
            </HeaderText>
          </HeaderContent>
          <HeaderActions>
            <PrimaryButton onClick={() => navigate('/settings/rental-workflows/new')}>
              <MdAdd size={20} />
              Novo fluxo
            </PrimaryButton>
          </HeaderActions>
        </PageHeader>

        <ContentArea>
          {workflows.length === 0 ? (
            <EmptyState>
              <EmptyIcon>
                <MdAccountTree size={48} />
              </EmptyIcon>
              <EmptyTitle>Nenhum fluxo cadastrado</EmptyTitle>
              <EmptyMessage>
                Crie um fluxo para definir as etapas obrigatórias de cada locação.
              </EmptyMessage>
              <EmptyButton onClick={() => navigate('/settings/rental-workflows/new')}>
                <MdAdd size={20} />
                Criar primeiro fluxo
              </EmptyButton>
            </EmptyState>
          ) : (
            <CardsGrid>
              {workflows.map(workflow => (
                <WorkflowCard
                  key={workflow.id}
                  $inactive={!workflow.isActive}
                  onClick={() => navigate(`/settings/rental-workflows/${workflow.id}/edit`)}
                >
                  <CardAccent $isDefault={!!workflow.isDefault} />
                  <CardBody>
                    <CardHeader>
                      <CardTitleRow>
                        <CardTitle>{workflow.name}</CardTitle>
                        <Badges>
                          {workflow.isDefault && <Badge $variant="primary">Padrão</Badge>}
                          {!workflow.isActive && <Badge $variant="muted">Inativo</Badge>}
                        </Badges>
                      </CardTitleRow>
                      {workflow.description && (
                        <CardDescription>{workflow.description}</CardDescription>
                      )}
                    </CardHeader>
                    <StepsSection>
                      <StepsLabel>
                        {workflow.steps.length} {workflow.steps.length === 1 ? 'etapa' : 'etapas'}
                      </StepsLabel>
                      <StepsList>
                        {workflow.steps
                          .slice(0, MAX_STEPS_PREVIEW)
                          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                          .map((step, i) => (
                            <StepItem key={step.id || i}>
                              <StepNumber>{i + 1}</StepNumber>
                              <StepName>{step.name}</StepName>
                            </StepItem>
                          ))}
                        {workflow.steps.length > MAX_STEPS_PREVIEW && (
                          <StepItem $more>
                            <StepName>+{workflow.steps.length - MAX_STEPS_PREVIEW} mais</StepName>
                          </StepItem>
                        )}
                      </StepsList>
                    </StepsSection>
                    <CardFooter onClick={e => e.stopPropagation()}>
                      <EditButton
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/settings/rental-workflows/${workflow.id}/edit`);
                        }}
                      >
                        <MdEdit size={18} />
                        Editar
                      </EditButton>
                      <DeleteButton
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteClick(workflow);
                        }}
                        title="Excluir fluxo"
                      >
                        <MdDelete size={18} />
                        Excluir
                      </DeleteButton>
                    </CardFooter>
                  </CardBody>
                  <CardArrow>
                    <MdChevronRight size={24} />
                  </CardArrow>
                </WorkflowCard>
              ))}
            </CardsGrid>
          )}
        </ContentArea>
      </PageContainer>

      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, workflow: null, isDeleting: false })}
        onConfirm={handleConfirmDelete}
        title="Excluir fluxo de locação"
        message="Tem certeza que deseja excluir este fluxo? As locações que usam este fluxo não serão excluídas, mas o fluxo deixará de estar disponível."
        itemName={deleteModal.workflow?.name}
        isLoading={deleteModal.isDeleting}
        confirmLabel="Excluir"
        loadingLabel="Excluindo..."
      />
    </Layout>
  );
};

// --- Styles ---

const PageContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  min-height: 100%;

  @media (min-width: 768px) {
    padding: 28px 32px;
  }

  @media (min-width: 1024px) {
    padding: 32px 40px;
  }
`;

const PageHeader = styled.header`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 32px;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
`;

const HeaderIcon = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, ${p => p.theme.colors.primary}22 0%, ${p => p.theme.colors.primary}11 100%);
  color: ${p => p.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const HeaderText = styled.div`
  min-width: 0;
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${p => p.theme.colors.text};
  margin: 0 0 4px 0;
  letter-spacing: -0.02em;
  line-height: 1.2;

  @media (min-width: 768px) {
    font-size: 2rem;
  }
`;

const PageSubtitle = styled.p`
  font-size: 0.9375rem;
  color: ${p => p.theme.colors.textSecondary};
  margin: 0;
  line-height: 1.45;
  max-width: 480px;
`;

const HeaderActions = styled.div`
  flex-shrink: 0;
`;

const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: ${p => p.theme.colors.primary};
  color: #fff;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px ${p => (p.theme.colors.primary || '#6366f1')}40;
  }

  &:active {
    transform: translateY(0);
  }
`;

const ContentArea = styled.div`
  min-height: 200px;
`;

const CardsGrid = styled.div`
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    gap: 24px;
  }
`;

const WorkflowCard = styled.article<{ $inactive?: boolean }>`
  position: relative;
  display: flex;
  align-items: stretch;
  min-height: 140px;
  background: ${p => p.theme.colors.cardBackground};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  opacity: ${p => (p.$inactive ? 0.85 : 1)};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px ${p => (p.theme.colors.shadow || 'rgba(0,0,0,0.08)')};
    border-color: ${p => p.theme.colors.primary}40;
  }

  @media (max-width: 639px) {
    min-height: 120px;
  }
`;

const CardAccent = styled.div<{ $isDefault: boolean }>`
  width: 4px;
  flex-shrink: 0;
  background: ${p =>
    p.$isDefault ? p.theme.colors.primary : p.theme.colors.border};
`;

const CardBody = styled.div`
  flex: 1;
  min-width: 0;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CardHeader = styled.div`
  min-width: 0;
`;

const CardTitleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const CardTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${p => p.theme.colors.text};
  margin: 0;
  line-height: 1.3;
`;

const Badges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const Badge = styled.span<{ $variant: 'primary' | 'muted' }>`
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 3px 8px;
  border-radius: 6px;
  ${p =>
    p.$variant === 'primary'
      ? `
    background: ${p.theme.colors.primary}22;
    color: ${p.theme.colors.primary};
  `
      : `
    background: ${p.theme.colors.backgroundSecondary};
    color: ${p.theme.colors.textSecondary};
  `}
`;

const CardDescription = styled.p`
  font-size: 0.875rem;
  color: ${p => p.theme.colors.textSecondary};
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const StepsSection = styled.div`
  flex: 1;
  min-height: 0;
`;

const StepsLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${p => p.theme.colors.textSecondary};
  display: block;
  margin-bottom: 6px;
`;

const StepsList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StepItem = styled.li<{ $more?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8125rem;
  color: ${p => (p.$more ? p.theme.colors.textSecondary : p.theme.colors.text)};
`;

const StepNumber = styled.span`
  width: 20px;
  height: 20px;
  border-radius: 6px;
  background: ${p => p.theme.colors.backgroundSecondary};
  color: ${p => p.theme.colors.textSecondary};
  font-size: 0.6875rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const StepName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid ${p => p.theme.colors.border};
`;

const CardArrow = styled.div`
  display: flex;
  align-items: center;
  padding: 0 12px;
  color: ${p => p.theme.colors.textSecondary};
  opacity: 0.6;
  flex-shrink: 0;

  @media (max-width: 480px) {
    display: none;
  }
`;

const EditButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 500;
  border: 1px solid ${p => p.theme.colors.border};
  background: ${p => p.theme.colors.background};
  color: ${p => p.theme.colors.text};
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;

  &:hover {
    background: ${p => p.theme.colors.primary}12;
    border-color: ${p => p.theme.colors.primary};
    color: ${p => p.theme.colors.primary};
  }
`;

const DeleteButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 500;
  border: 1px solid transparent;
  background: transparent;
  color: ${p => p.theme.colors.textSecondary};
  cursor: pointer;
  transition: background 0.2s, color 0.2s;

  &:hover {
    background: ${p => (p.theme.colors.error || '#ef4444')}15;
    color: ${p => p.theme.colors.error || '#ef4444'};
  }
`;

// Empty state
const EmptyState = styled.div`
  text-align: center;
  padding: 56px 24px;
  background: ${p => p.theme.colors.cardBackground};
  border: 1px dashed ${p => p.theme.colors.border};
  border-radius: 20px;
`;

const EmptyIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  border-radius: 20px;
  background: ${p => p.theme.colors.backgroundSecondary};
  color: ${p => p.theme.colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EmptyTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${p => p.theme.colors.text};
  margin: 0 0 8px 0;
`;

const EmptyMessage = styled.p`
  font-size: 0.9375rem;
  color: ${p => p.theme.colors.textSecondary};
  margin: 0 0 24px 0;
  max-width: 320px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.5;
`;

const EmptyButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: ${p => p.theme.colors.primary};
  color: #fff;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px ${p => (p.theme.colors.primary || '#6366f1')}40;
  }
`;

export default RentalWorkflowsPage;
