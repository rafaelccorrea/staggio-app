import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MdWarning, MdSave } from 'react-icons/md';
import { projectsApi } from '../../services/projectsApi';
import { useTeams } from '../../hooks/useTeams';
import { showSuccess, showError } from '../../utils/notifications';
import {
  ModernModalOverlay,
  ModernModalContainer,
  ModernModalContent,
  ModernFormGroup,
  ModernErrorMessage,
  ModernButton,
  ModernLoadingSpinner,
} from '../../styles/components/ModernModalStyles';
import type { KanbanProjectResponseDto } from '../../types/kanban';

const StyledModalContainer = styled(ModernModalContainer)`
  border-radius: 16px;
  box-shadow: ${props =>
    props.theme.mode === 'dark'
      ? '0 20px 60px rgba(0, 0, 0, 0.5)'
      : '0 20px 60px rgba(0, 0, 0, 0.15)'};
  border: none;
  max-width: 560px;
  width: 90%;
`;

const Header = styled.div`
  padding: 24px 28px 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 8px;
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.theme.colors.warning}20;
  color: ${props => props.theme.colors.warning};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const Title = styled.h2`
  font-size: 1.35rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin: 0;
  line-height: 1.3;
`;

const Subtitle = styled.p`
  font-size: 0.9rem;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
  line-height: 1.5;
`;

const StyledContent = styled(ModernModalContent)`
  padding: 20px 28px 24px;
`;

const ProjectRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid ${props => props.theme.colors.border};

  &:last-of-type {
    border-bottom: none;
  }
`;

const ProjectName = styled.span`
  flex: 0 0 180px;
  font-size: 0.9rem;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledSelect = styled.select`
  flex: 1;
  min-width: 0;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1.5px solid ${props => props.theme.colors.border};
  font-size: 0.9rem;
  font-family: inherit;
  background: ${props => props.theme.colors.cardBackground};
  color: ${props => props.theme.colors.text};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
  margin-top: 16px;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const PrimaryButton = styled(ModernButton)`
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  min-width: 160px;
`;

export interface LinkProjectsToTeamModalProps {
  isOpen: boolean;
  projects: KanbanProjectResponseDto[];
  onComplete: () => void;
}

/**
 * Modal obrigatório (não pode ser fechado) para vincular funis sem equipe a uma equipe.
 * Exibido quando existem funis na equipe "Sem equipe" — o usuário deve vincular todos antes de continuar.
 */
export const LinkProjectsToTeamModal: React.FC<LinkProjectsToTeamModalProps> = ({
  isOpen,
  projects,
  onComplete,
}) => {
  const { teams } = useTeams();
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && projects.length > 0) {
      setSelections({});
      setErrors({});
    }
  }, [isOpen, projects.length]);

  const handleTeamChange = (projectId: string, teamId: string) => {
    setSelections(prev => ({ ...prev, [projectId]: teamId }));
    if (errors[projectId]) {
      setErrors(prev => ({ ...prev, [projectId]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    projects.forEach(p => {
      const teamId = selections[p.id];
      if (!teamId || !teamId.trim()) {
        newErrors[p.id] = 'Selecione uma equipe';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      for (const project of projects) {
        const teamId = selections[project.id];
        if (teamId) {
          await projectsApi.linkProjectToTeam(project.id, teamId);
        }
      }
      showSuccess('Todos os funis foram vinculados à equipe com sucesso.');
      onComplete();
    } catch (err: any) {
      showError(err?.message || 'Erro ao vincular funis. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const teamsExcludingNoTeam = teams.filter(
    t => (t.name || '').trim().toLowerCase() !== 'sem equipe',
  );

  return (
    <ModernModalOverlay
      $isOpen={isOpen}
      onClick={e => e.stopPropagation()}
      style={{ pointerEvents: 'auto', paddingTop: '60px' }}
    >
      <StyledModalContainer
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
      >
        <Header>
          <TitleRow>
            <IconWrapper>
              <MdWarning size={28} />
            </IconWrapper>
            <div>
              <Title>Funis sem equipe vinculada</Title>
              <Subtitle>
                Os funis abaixo precisam ser vinculados a uma equipe para
                padronizar o uso. Esta janela não pode ser fechada até que todos
                sejam vinculados.
              </Subtitle>
            </div>
          </TitleRow>
        </Header>

        <StyledContent style={{ overflowY: 'auto', flex: 1 }}>
          <form onSubmit={handleSubmit}>
            <FormContainer>
              {projects.map(project => (
                <FormGroup key={project.id}>
                  <ProjectRow>
                    <ProjectName title={project.name}>{project.name}</ProjectName>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <StyledSelect
                        value={selections[project.id] || ''}
                        onChange={e =>
                          handleTeamChange(project.id, e.target.value)
                        }
                        disabled={isSubmitting}
                        title="Selecione a equipe para este funil"
                      >
                        <option value="">
                          Selecione uma equipe
                        </option>
                        {teamsExcludingNoTeam.map(team => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </StyledSelect>
                      {errors[project.id] && (
                        <ModernErrorMessage>
                          {errors[project.id]}
                        </ModernErrorMessage>
                      )}
                    </div>
                  </ProjectRow>
                </FormGroup>
              ))}
            </FormContainer>

            <Footer>
              <PrimaryButton
                type="submit"
                $variant="primary"
                disabled={
                  isSubmitting ||
                  projects.some(p => !selections[p.id]?.trim()) ||
                  teamsExcludingNoTeam.length === 0
                }
              >
                {isSubmitting ? (
                  <>
                    <ModernLoadingSpinner
                      style={{ width: 18, height: 18, borderWidth: 2 }}
                    />
                    Vinculando...
                  </>
                ) : (
                  <>
                    <MdSave size={18} />
                    Vincular todos à equipe
                  </>
                )}
              </PrimaryButton>
            </Footer>
          </form>
        </StyledContent>
      </StyledModalContainer>
    </ModernModalOverlay>
  );
};

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const FormGroup = styled(ModernFormGroup)`
  margin-bottom: 0;
`;

export default LinkProjectsToTeamModal;
