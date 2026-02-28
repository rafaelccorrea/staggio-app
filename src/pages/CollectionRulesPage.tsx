import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdPlayArrow,
  MdPause,
  MdSettings,
  MdAutoAwesome,
} from 'react-icons/md';
import { Layout } from '@/components/layout/Layout';
import { PermissionButton } from '@/components/common/PermissionButton';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';
import { CollectionRulesShimmer } from '@/components/shimmer/CollectionRulesShimmer';
import {
  getCollectionRules,
  toggleCollectionRule,
  deleteCollectionRule,
  createDefaultCollectionRules,
  type CollectionRule,
} from '../services/collectionService';
import styled from 'styled-components';
import {
  RentalStylePageContainer,
  PageHeader,
  PageTitle,
  PageTitleContainer,
  PageSubtitle,
} from '@/styles/components/PageStyles';

const CollectionRulesPage: React.FC = () => {
  const navigate = useNavigate();
  const [rules, setRules] = useState<CollectionRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [defaultRulesConfirmOpen, setDefaultRulesConfirmOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [ruleToDeleteId, setRuleToDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [creatingDefault, setCreatingDefault] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const data = await getCollectionRules();
      setRules(data);
    } catch (error) {
      console.error('Erro ao buscar réguas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDefaultRules = () => {
    if (rules.length > 0) {
      toast.info('Esta empresa já possui réguas. Não é possível criar réguas padrão novamente.');
      return;
    }
    setDefaultRulesConfirmOpen(true);
  };

  const onConfirmCreateDefaultRules = async () => {
    if (rules.length > 0) return;
    try {
      setCreatingDefault(true);
      await createDefaultCollectionRules();
      toast.success('Réguas padrão criadas com sucesso!');
      setDefaultRulesConfirmOpen(false);
      fetchRules();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Erro ao criar réguas padrão';
      toast.error(msg);
      if (error.response?.status === 409) setDefaultRulesConfirmOpen(false);
    } finally {
      setCreatingDefault(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleCollectionRule(id);
      fetchRules();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao alternar régua');
    }
  };

  const handleDeleteClick = (id: string) => {
    setRuleToDeleteId(id);
    setDeleteModalOpen(true);
  };

  const onConfirmDeleteRule = async () => {
    if (!ruleToDeleteId) return;
    try {
      setDeleting(true);
      await deleteCollectionRule(ruleToDeleteId);
      toast.success('Régua excluída com sucesso!');
      setDeleteModalOpen(false);
      setRuleToDeleteId(null);
      fetchRules();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao excluir régua');
    } finally {
      setDeleting(false);
    }
  };

  const getTriggerLabel = (trigger: string) => {
    const labels: Record<string, string> = {
      DAYS_BEFORE_DUE: 'Dias Antes do Vencimento',
      ON_DUE_DATE: 'No Dia do Vencimento',
      DAYS_AFTER_DUE: 'Dias Após o Vencimento',
    };
    return labels[trigger] || trigger;
  };

  const getChannelLabel = (channel: string) => {
    const labels: Record<string, string> = {
      EMAIL: 'Email',
      WHATSAPP: 'WhatsApp',
      SMS: 'SMS',
    };
    return labels[channel] || channel;
  };

  if (loading && rules.length === 0) {
    return <CollectionRulesShimmer />;
  }

  return (
    <Layout>
      <ConfirmDeleteModal
        isOpen={defaultRulesConfirmOpen}
        onClose={() => setDefaultRulesConfirmOpen(false)}
        onConfirm={onConfirmCreateDefaultRules}
        title="Criar réguas padrão"
        message="Deseja criar as réguas padrão? Isso adicionará 4 réguas pré-configuradas."
        confirmLabel="Criar réguas"
        cancelLabel="Cancelar"
        isLoading={creatingDefault}
        loadingLabel="Criando..."
        variant="mark-as-sold"
      />
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setRuleToDeleteId(null); }}
        onConfirm={onConfirmDeleteRule}
        title="Excluir régua"
        message="Deseja realmente excluir esta régua?"
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        isLoading={deleting}
        loadingLabel="Excluindo..."
        variant="delete"
      />
      <RentalStylePageContainer>
        <PageHeader>
          <PageTitleContainer>
            <PageTitle>
              <MdSettings size={32} />
              Configuração de Réguas de Cobrança
            </PageTitle>
            <PageSubtitle>
              Crie e gerencie réguas de cobrança personalizadas
            </PageSubtitle>
          </PageTitleContainer>
          <HeaderActions>
            <SecondaryButton
              onClick={handleCreateDefaultRules}
              disabled={rules.length > 0}
              title={rules.length > 0 ? 'Réguas padrão só podem ser criadas quando não há nenhuma régua' : 'Criar 4 réguas pré-configuradas'}
            >
              <MdAutoAwesome size={20} />
              Criar Réguas Padrão
            </SecondaryButton>
            <PermissionButton
              permission='collection:manage'
              onClick={() => navigate('/collection/rules/new')}
            >
              <MdAdd size={20} />
              Nova Régua
            </PermissionButton>
          </HeaderActions>
        </PageHeader>

        <ContentCardAligned>
          {loading ? (
            <LoadingContainer>
              <LoadingSpinner />
              <LoadingText>Carregando réguas...</LoadingText>
            </LoadingContainer>
          ) : (
            <TableContainer>
              <Table>
                <thead>
                  <tr>
                    <Th>Nome</Th>
                    <Th>Gatilho</Th>
                    <Th>Canal</Th>
                    <Th>Prioridade</Th>
                    <Th>Horário</Th>
                    <Th>Status</Th>
                    <Th>Ações</Th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule) => (
                    <Tr key={rule.id}>
                      <Td>
                        <RuleName>{rule.name}</RuleName>
                        {rule.description && (
                          <RuleDescription>{rule.description}</RuleDescription>
                        )}
                      </Td>
                      <Td>
                        <TriggerInfo>
                          {getTriggerLabel(rule.trigger)}
                          {rule.trigger !== 'ON_DUE_DATE' && (
                            <TriggerDays>({rule.triggerDays} dias)</TriggerDays>
                          )}
                        </TriggerInfo>
                      </Td>
                      <Td>
                        <Badge $variant='info'>{getChannelLabel(rule.channel)}</Badge>
                      </Td>
                      <Td>
                        <PriorityBadge $priority={rule.priority}>
                          {rule.priority}
                        </PriorityBadge>
                      </Td>
                      <Td>{rule.sendTime}</Td>
                      <Td>
                        <Badge $variant={rule.isActive ? 'success' : 'default'}>
                          {rule.isActive ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </Td>
                      <Td>
                        <ActionButtons>
                          <ActionButton
                            onClick={() => handleToggle(rule.id)}
                            title={rule.isActive ? 'Desativar' : 'Ativar'}
                          >
                            {rule.isActive ? (
                              <MdPause size={18} />
                            ) : (
                              <MdPlayArrow size={18} />
                            )}
                          </ActionButton>
                          <ActionButton
                            onClick={() => navigate(`/collection/rules/${rule.id}`)}
                            title='Editar'
                          >
                            <MdEdit size={18} />
                          </ActionButton>
                          <ActionButton
                            onClick={() => handleDeleteClick(rule.id)}
                            title='Excluir'
                            $variant='danger'
                          >
                            <MdDelete size={18} />
                          </ActionButton>
                        </ActionButtons>
                      </Td>
                    </Tr>
                  ))}
                  {rules.length === 0 && (
                    <Tr>
                      <Td colSpan={7}>
                        <EmptyState>
                          <MdSettings size={48} />
                          <EmptyStateText>
                            Nenhuma régua configurada ainda
                          </EmptyStateText>
                          <EmptyStateHint>
                            Clique em "Criar Réguas Padrão" para começar
                          </EmptyStateHint>
                        </EmptyState>
                      </Td>
                    </Tr>
                  )}
                </tbody>
              </Table>
            </TableContainer>
          )}
        </ContentCardAligned>
      </RentalStylePageContainer>
    </Layout>
  );
};

// Styled Components
const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
  }
`;

const SecondaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.hover};
    border-color: ${props => props.theme.colors.primary};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${props => props.theme.colors.border};
  border-top-color: ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.div`
  margin-top: 16px;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 14px;
`;

/** Card sem padding horizontal extra para alinhar à margem do MainScrollArea */
const ContentCardAligned = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  padding: 24px 0;
  box-shadow: ${props => props.theme.colors.shadow};
  border: 1px solid ${props => props.theme.colors.border};
  margin-bottom: 24px;
`;

const TableContainer = styled.div`
  overflow-x: auto;
  padding: 0 16px;
  @media (max-width: 768px) {
    padding: 0 12px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.theme.colors.textSecondary};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  white-space: nowrap;
`;

const Tr = styled.tr`
  &:hover {
    background: ${props => props.theme.colors.hover};
  }
`;

const Td = styled.td`
  padding: 16px;
  font-size: 14px;
  color: ${props => props.theme.colors.text};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const RuleName = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
`;

const RuleDescription = styled.div`
  font-size: 13px;
  color: ${props => props.theme.colors.textSecondary};
`;

const TriggerInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TriggerDays = styled.span`
  font-size: 12px;
  color: ${props => props.theme.colors.textLight};
`;

const Badge = styled.span<{ $variant?: string }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;

  ${props => {
    switch (props.$variant) {
      case 'success':
        return `
          background: ${props.theme.colors.successBackground};
          color: ${props.theme.colors.successText};
          border: 1px solid ${props.theme.colors.successBorder};
        `;
      case 'info':
        return `
          background: ${props.theme.colors.infoBackground};
          color: ${props.theme.colors.infoText};
          border: 1px solid ${props.theme.colors.infoBorder};
        `;
      default:
        return `
          background: ${props.theme.colors.backgroundSecondary};
          color: ${props.theme.colors.textSecondary};
          border: 1px solid ${props.theme.colors.border};
        `;
    }
  }}
`;

const PriorityBadge = styled.span<{ $priority: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  background: ${props => {
    if (props.$priority === 1) return props.theme.colors.errorBackground;
    if (props.$priority === 2) return props.theme.colors.warningBackground;
    return props.theme.colors.infoBackground;
  }};
  color: ${props => {
    if (props.$priority === 1) return props.theme.colors.errorText;
    if (props.$priority === 2) return props.theme.colors.warningText;
    return props.theme.colors.infoText;
  }};
  border: 1px solid
    ${props => {
      if (props.$priority === 1) return props.theme.colors.errorBorder;
      if (props.$priority === 2) return props.theme.colors.warningBorder;
      return props.theme.colors.infoBorder;
    }};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button<{ $variant?: string }>`
  padding: 8px;
  background: transparent;
  color: ${props =>
    props.$variant === 'danger'
      ? props.theme.colors.error
      : props.theme.colors.primary};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: ${props =>
      props.$variant === 'danger'
        ? props.theme.colors.errorBackground
        : props.theme.colors.hover};
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: ${props => props.theme.colors.textLight};
`;

const EmptyStateText = styled.div`
  margin-top: 16px;
  font-size: 16px;
  font-weight: 500;
  color: ${props => props.theme.colors.textSecondary};
`;

const EmptyStateHint = styled.div`
  margin-top: 8px;
  font-size: 14px;
  color: ${props => props.theme.colors.textLight};
`;

export default CollectionRulesPage;
