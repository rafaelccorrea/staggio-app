import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import { Layout } from '../components/layout/Layout';
import { KanbanBoardComponent } from '../components/kanban';
import { ProjectSelect } from '../components/projects/ProjectSelect';
import { LinkProjectsToTeamModal } from '../components/modals/LinkProjectsToTeamModal';
import { CreateProjectModal } from '../components/modals/CreateProjectModal';
import {
  getKanbanState,
  saveKanbanState,
  clearKanbanState,
} from '../utils/kanbanState';
import { usePersonalWorkspace } from '../hooks/usePersonalWorkspace';
import { useKanbanTeams } from '../hooks/useKanbanTeams';
import { useAuth } from '../hooks/useAuth';
import { usePermissionsContextOptional } from '../contexts/PermissionsContext';
import { projectsApi } from '../services/projectsApi';
import type { KanbanProjectResponseDto } from '../types/kanban';
import { LottieLoading } from '../components/common/LottieLoading';
import KanbanShimmer from '../components/shimmer/KanbanShimmer';
import styled from 'styled-components';
// import { useKanbanMonitoring } from '../hooks/useRealtimeMonitoring';

const EmptyStateWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 120px);
  padding: 24px;
`;

const EmptyFunnelCard = styled.div`
  max-width: 480px;
  width: 100%;
  padding: 48px 40px;
  text-align: center;
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
`;

const EmptyFunnelIcon = styled.div`
  font-size: 56px;
  margin-bottom: 20px;
  line-height: 1;
`;

const EmptyFunnelTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 1.375rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
`;

const EmptyFunnelText = styled.p`
  margin: 0 0 32px 0;
  font-size: 0.9375rem;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.6;
`;

const EmptyFunnelBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 600;
  background: ${props => `${props.theme.colors.primary || '#6366f1'}15`};
  color: ${props => props.theme.colors.primary || '#6366f1'};
  margin-bottom: 24px;
`;

const CreateFunnelButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: ${props => props.theme.colors.primary || '#6366f1'};
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px ${props => `${props.theme.colors.primary || '#6366f1'}45`};
  }
`;

const FunnelSelectRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

const KanbanPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getCurrentUser } = useAuth();
  const currentUser = getCurrentUser();
  const teamId = searchParams.get('teamId');
  const projectId = searchParams.get('projectId');
  const workspaceType = searchParams.get('workspace');
  const { workspace: personalWorkspace, loading: personalWorkspaceLoading } =
    usePersonalWorkspace();
  const { teams: kanbanTeams, loading: kanbanTeamsLoading } = useKanbanTeams();
  const permissionsContext = usePermissionsContextOptional();
  const hasPermission = permissionsContext?.hasPermission ?? (() => false);
  const canCreateFunnel =
    (hasPermission('kanban:project:create') || hasPermission('kanban:create')) &&
    kanbanTeams &&
    kanbanTeams.length > 0;
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [isInitializing, setIsInitializing] = useState(true);
  const [resolvedTeamId, setResolvedTeamId] = useState<string | null>(null);
  const [isValidatingProject, setIsValidatingProject] = useState(false);
  const [validatedProjectId, setValidatedProjectId] = useState<string | null>(
    null
  );
  const [validatedProjectData, setValidatedProjectData] = useState<{
    id: string;
    name: string;
    description?: string | null;
    teamId?: string;
    isPersonal?: boolean;
    [key: string]: any;
  } | null>(null);

  /** Funis sem equipe vinculada — modal obrigatório (não pode fechar) até vincular todos */
  const [projectsWithoutTeam, setProjectsWithoutTeam] = useState<
    KanbanProjectResponseDto[]
  >([]);
  const [loadingProjectsWithoutTeam, setLoadingProjectsWithoutTeam] =
    useState(true);

  /** Modal "Criar funil" exibido quando não há funis (ex.: após excluir o último) */
  const [showCreateFunnelModal, setShowCreateFunnelModal] = useState(false);

  // Validar se teamId não é "undefined" (string) ou null
  const isValidTeamId = teamId && teamId !== 'undefined' && teamId !== 'null';
  const isValidProjectId =
    projectId && projectId !== 'undefined' && projectId !== 'null';

  // Verificar se há estado salvo no localStorage para o usuário atual
  const savedState = getKanbanState(currentUser?.id);

  // Validar se o estado salvo pertence ao usuário atual
  const isValidSavedState =
    savedState &&
    currentUser &&
    savedState.userId === currentUser.id &&
    (savedState.projectId || savedState.teamId);

  // Se o estado salvo não pertence ao usuário atual, limpar apenas o desse usuário
  useEffect(() => {
    if (savedState && currentUser && savedState.userId !== currentUser.id) {
      clearKanbanState(savedState.userId);
    }
  }, [savedState, currentUser]);

  const hasSavedState = isValidSavedState;

  // Determinar o projectId final (prioridade: URL > estado salvo validado)
  const finalProjectId = isValidProjectId
    ? projectId
    : (isValidSavedState ? savedState?.projectId : null) || null;

  // Inicializar selectedProjectId com projeto da URL ou estado salvo
  const hasInitializedProjectId = useRef(false);

  useEffect(() => {
    // Só atualizar uma vez na inicialização
    if (hasInitializedProjectId.current) {
      return;
    }

    if (finalProjectId && selectedProjectId !== finalProjectId) {
      setSelectedProjectId(finalProjectId);
      hasInitializedProjectId.current = true;
    } else if (finalProjectId) {
      hasInitializedProjectId.current = true;
    }
  }, [finalProjectId]);

  // Inicializar com workspace pessoal se não houver projeto selecionado
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Evitar múltiplas inicializações
    if (hasInitialized.current) {
      return;
    }

    // Aguardar o carregamento do workspace pessoal
    if (personalWorkspaceLoading) {
      return;
    }

    // Se já tem projeto selecionado, apenas atualizar selectedProjectId se necessário
    if (finalProjectId || hasSavedState) {
      if (finalProjectId && selectedProjectId !== finalProjectId) {
        setSelectedProjectId(finalProjectId);
      }
      setIsInitializing(false);
      hasInitialized.current = true;
      return;
    }

    // Se tem workspace pessoal e não há projeto selecionado, inicializar com workspace pessoal
    if (personalWorkspace && !finalProjectId && !hasSavedState) {
      setSelectedProjectId(personalWorkspace.id);
      const newParams = new URLSearchParams();
      newParams.set('projectId', personalWorkspace.id);
      if (personalWorkspace.teamId) {
        newParams.set('teamId', personalWorkspace.teamId);
      }
      newParams.set('workspace', 'personal');
      const newSearch = newParams.toString();
      if (searchParams.toString() !== newSearch) {
        navigate(`/kanban?${newSearch}`, { replace: true });
      }
      saveKanbanState({
        projectId: personalWorkspace.id,
        teamId: personalWorkspace.teamId || undefined,
        workspace: 'personal',
        userId: currentUser?.id || undefined,
      });
      setIsInitializing(false);
      hasInitialized.current = true;
      return;
    }

    setIsInitializing(false);
    hasInitialized.current = true;
  }, [
    personalWorkspace,
    personalWorkspaceLoading,
    finalProjectId,
    hasSavedState,
  ]);

  // Verificar funis sem equipe (modal obrigatório — não pode fechar até vincular todos)
  useEffect(() => {
    if (!currentUser?.id) {
      setLoadingProjectsWithoutTeam(false);
      return;
    }
    setLoadingProjectsWithoutTeam(true);
    projectsApi
      .getProjectsWithoutTeam()
      .then((list: KanbanProjectResponseDto[]) => {
        setProjectsWithoutTeam(Array.isArray(list) ? list : []);
      })
      .catch(() => setProjectsWithoutTeam([]))
      .finally(() => setLoadingProjectsWithoutTeam(false));
  }, [currentUser?.id]);

  // Se a página foi aberta com projectId na URL, verificar se esse funil precisa de vínculo (e não está na lista)
  const checkedProjectIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (
      !currentUser?.id ||
      loadingProjectsWithoutTeam ||
      !finalProjectId ||
      checkedProjectIdRef.current === finalProjectId
    ) {
      return;
    }
    const projectId = finalProjectId;
    checkedProjectIdRef.current = projectId;
    projectsApi
      .getProjectNeedsTeamLink(projectId)
      .then(({ needsLink, project }) => {
        if (needsLink && project) {
          setProjectsWithoutTeam(prev =>
            prev.some(p => p.id === project.id) ? prev : [...prev, project]
          );
        }
      })
      .catch(() => {});
  }, [currentUser?.id, loadingProjectsWithoutTeam, finalProjectId]);

  // Se não tem workspace pessoal nem projeto na URL/salvo: selecionar automaticamente o primeiro funil de uma equipe do usuário
  const hasAutoSelectedTeam = useRef(false);
  useEffect(() => {
    if (
      hasInitialized.current &&
      !finalProjectId &&
      !hasSavedState &&
      !personalWorkspace &&
      !kanbanTeamsLoading &&
      kanbanTeams.length > 0 &&
      !hasAutoSelectedTeam.current &&
      currentUser?.id
    ) {
      hasAutoSelectedTeam.current = true;
      const firstTeam = kanbanTeams[0];
      projectsApi
        .getProjectsByTeam(firstTeam.id)
        .then(projects => {
          const firstProject = Array.isArray(projects) ? projects[0] : null;
          if (firstProject) {
            setSelectedProjectId(firstProject.id);
            const newParams = new URLSearchParams();
            newParams.set('teamId', firstTeam.id);
            newParams.set('projectId', firstProject.id);
            navigate(`/kanban?${newParams.toString()}`, { replace: true });
            saveKanbanState({
              projectId: firstProject.id,
              teamId: firstTeam.id,
              userId: currentUser.id,
            });
          }
        })
        .catch(() => {});
    }
  }, [
    finalProjectId,
    hasSavedState,
    personalWorkspace,
    kanbanTeamsLoading,
    kanbanTeams,
    currentUser?.id,
    navigate,
    saveKanbanState,
  ]);
  // Monitoramento em tempo real temporariamente desabilitado
  // const {
  //   data: monitoringData,
  //   loading: monitoringLoading,
  //   error: monitoringError,
  //   lastUpdate: monitoringLastUpdate,
  //   isConnected: monitoringConnected,
  //   refresh: refreshMonitoring,
  //   toggleMonitoring,
  //   broadcastUpdate,
  // } = useKanbanMonitoring({
  //   onDataUpdate: (data) => {
  //     // Aqui você pode processar as atualizações do Kanban
  //   },
  //   onError: (error) => {
  //     console.error('Erro no monitoramento do Kanban:', error);
  //   },
  // });

  // Usar estado salvo se não houver parâmetros na URL
  // Para workspace pessoal, usar teamId do workspace pessoal se não houver na URL
  const isPersonalWorkspace =
    workspaceType === 'personal' || savedState?.workspace === 'personal';

  // Determinar teamId final - prioridade: URL > estado salvo > resolvedTeamId > workspace pessoal
  const finalTeamId = useMemo(() => {
    let result: string | undefined;
    const isValidSavedTeamId =
      savedState?.teamId &&
      savedState.teamId !== 'undefined' &&
      savedState.teamId !== 'null' &&
      savedState.teamId.trim() !== '';

    if (isValidTeamId) {
      result = teamId || undefined;
    } else if (isValidSavedTeamId) {
      result = savedState.teamId || undefined;
    } else if (
      resolvedTeamId &&
      resolvedTeamId !== 'undefined' &&
      resolvedTeamId !== 'null'
    ) {
      result = (resolvedTeamId === null ? undefined : resolvedTeamId) as
        | string
        | undefined;
    } else if (isPersonalWorkspace && personalWorkspace?.teamId) {
      result = personalWorkspace.teamId;
    }
    return result;
  }, [
    isValidTeamId,
    teamId,
    savedState?.teamId,
    resolvedTeamId,
    isPersonalWorkspace,
    personalWorkspace?.teamId,
  ]);

  // Validar se o projeto pertence ao usuário atual e se ele tem acesso (allowlist) antes de carregar
  useEffect(() => {
    const validateProject = async () => {
      // Evitar validação duplicada do mesmo projeto
      if (
        !finalProjectId ||
        !currentUser ||
        isInitializing ||
        validatedProjectId === finalProjectId
      ) {
        return;
      }

      // Se já temos teamId válido e o projeto já foi validado, não precisa validar novamente
      const isValidFinalTeamId =
        finalTeamId &&
        finalTeamId !== 'undefined' &&
        finalTeamId !== 'null' &&
        finalTeamId.trim() !== '';

      if (isValidFinalTeamId && validatedProjectId === finalProjectId) {
        return;
      }

      setIsValidatingProject(true);
      const validationTimeoutId = setTimeout(() => {
        setIsValidatingProject(false);
      }, 12000);

      try {
        const { projectsApi } = await import('../services/projectsApi');
        const project = await projectsApi.getProjectById(finalProjectId);

        // Verificar se o projeto existe e obter o teamId
        if (!project) {
          clearTimeout(validationTimeoutId);
          clearKanbanState(currentUser.id);
          setSelectedProjectId(null);
          setValidatedProjectId(null);
          setValidatedProjectData(null);
          setIsValidatingProject(false);
          return;
        }

        // Workspace pessoal: validar diretamente sem verificar allowlist de equipe
        // (o workspace pessoal é obtido via endpoint próprio, não aparece em getProjectsByTeam)
        if (project.isPersonal) {
          clearTimeout(validationTimeoutId);
          setValidatedProjectId(finalProjectId);
          setValidatedProjectData(project);
          const currentTeamInUrl = searchParams.get('teamId');
          if (project.teamId && currentTeamInUrl !== project.teamId) {
            setResolvedTeamId(project.teamId);
            const newParams = new URLSearchParams(searchParams);
            newParams.set('teamId', project.teamId);
            newParams.set('projectId', finalProjectId);
            newParams.set('workspace', 'personal');
            navigate(`/kanban?${newParams.toString()}`, { replace: true });
          }
          saveKanbanState({
            projectId: finalProjectId,
            teamId: project.teamId || finalTeamId || undefined,
            workspace: 'personal',
            userId: currentUser.id,
          });
          setIsValidatingProject(false);
          return;
        }

        const teamIdForAllowlist = project.teamId || finalTeamId;
        if (!teamIdForAllowlist) {
          clearTimeout(validationTimeoutId);
          setValidatedProjectId(finalProjectId);
          setValidatedProjectData(project);
          setIsValidatingProject(false);
          return;
        }

        // Garantir que o usuário tem acesso a ESTE projeto nesta equipe (allowlist no backend)
        let allowedProjects: Array<{ id: string; isPersonal?: boolean }>;
        try {
          allowedProjects = await projectsApi.getProjectsByTeam(teamIdForAllowlist);
        } catch (_err) {
          clearTimeout(validationTimeoutId);
          clearKanbanState(currentUser.id);
          setSelectedProjectId(null);
          setValidatedProjectId(null);
          setValidatedProjectData(null);
          navigate('/kanban', { replace: true });
          setIsValidatingProject(false);
          return;
        }
        const allowedIds = allowedProjects.map((p: { id: string }) => p.id);
        if (!allowedIds.includes(finalProjectId)) {
          // Projeto da URL/estado não está na lista de permitidos → usar primeiro permitido
          clearTimeout(validationTimeoutId);
          const fallbackProjectId = allowedProjects[0]?.id ?? null;
          setSelectedProjectId(fallbackProjectId);
          setValidatedProjectId(fallbackProjectId);
          setValidatedProjectData(fallbackProjectId ? allowedProjects[0] : null);
          const newParams = new URLSearchParams();
          newParams.set('teamId', teamIdForAllowlist);
          if (fallbackProjectId) {
            newParams.set('projectId', fallbackProjectId);
            const first = allowedProjects[0] as { isPersonal?: boolean };
            if (first?.isPersonal) {
              newParams.set('workspace', 'personal');
            }
            saveKanbanState({
              projectId: fallbackProjectId,
              teamId: teamIdForAllowlist,
              workspace: first?.isPersonal ? 'personal' : undefined,
              userId: currentUser.id,
            });
          } else {
            saveKanbanState({
              projectId: undefined,
              teamId: teamIdForAllowlist,
              userId: currentUser.id,
            });
          }
          navigate(`/kanban?${newParams.toString()}`, { replace: true });
          setIsValidatingProject(false);
          return;
        }

        // Marcar projeto como validado e guardar dados para evitar nova chamada no KanbanBoard
        setValidatedProjectId(finalProjectId);
        setValidatedProjectData(project);

        // Sempre sincronizar URL com o teamId do projeto (funil pode estar em "Sem equipe" — URL pode ter outro teamId)
        const currentTeamInUrl = searchParams.get('teamId');
        if (project.teamId && currentTeamInUrl !== project.teamId) {
          setResolvedTeamId(project.teamId);
          const newParams = new URLSearchParams(searchParams);
          newParams.set('teamId', project.teamId);
          if (finalProjectId) {
            newParams.set('projectId', finalProjectId);
          }
          if (project.isPersonal) {
            newParams.set('workspace', 'personal');
          }
          navigate(`/kanban?${newParams.toString()}`, { replace: true });
        } else if (!isValidFinalTeamId && project.teamId) {
          setResolvedTeamId(project.teamId);
        }

        // Salvar estado com userId para validação futura
        saveKanbanState({
          projectId: finalProjectId,
          teamId: project.teamId || finalTeamId || undefined,
          workspace: project.isPersonal ? 'personal' : undefined,
          userId: currentUser.id,
        });
      } catch (error: any) {
        console.error('❌ [KanbanPage] Erro ao validar projeto:', error);
        // Se o projeto não existe ou não pertence ao usuário, limpar estado
        if (
          error?.response?.status === 404 ||
          error?.response?.status === 403
        ) {
          clearKanbanState(currentUser.id);
          setSelectedProjectId(null);
          setValidatedProjectId(null);
          setValidatedProjectData(null);
          // Limpar URL
          navigate('/kanban', { replace: true });
        }
      } finally {
        clearTimeout(validationTimeoutId);
        setIsValidatingProject(false);
      }
    };

    validateProject();
  }, [finalProjectId, currentUser?.id, isInitializing, validatedProjectId, finalTeamId]);

  // Limpar resolvedTeamId e validatedProjectId quando o projeto mudar
  useEffect(() => {
    if (!finalProjectId) {
      setResolvedTeamId(null);
      setValidatedProjectId(null);
      setValidatedProjectData(null);
    } else if (finalProjectId !== validatedProjectId) {
      // Se o projeto mudou, limpar validação anterior
      setValidatedProjectId(null);
      setValidatedProjectData(null);
    }
  }, [finalProjectId, validatedProjectId]);

  // Handler para quando um projeto é selecionado
  const handleProjectChange = async (projectId: string, teamId?: string) => {
    const isPersonal = personalWorkspace?.id === projectId;

    // Para workspace pessoal, usar teamId do workspace ou do projeto (pode ser null para "Sem equipe")
    let teamIdToUse = isPersonal ? teamId || personalWorkspace?.teamId : teamId;

    // Se ainda não temos teamId, buscar do projeto (e guardar dados para o board não chamar de novo)
    if (!teamIdToUse && projectId) {
      try {
        const { projectsApi } = await import('../services/projectsApi');
        const project = await projectsApi.getProjectById(projectId);
        teamIdToUse = project?.teamId || teamIdToUse;
        if (project) {
          setValidatedProjectData(project);
          setValidatedProjectId(projectId);
        }
      } catch (error) {
        console.error('Erro ao buscar projeto:', error);
      }
    }

    // Para workspace pessoal, permitir prosseguir mesmo sem teamId (projeto pode estar em "Sem equipe")
    const isPersonalWithoutTeam = isPersonal && !teamIdToUse;
    if (!teamIdToUse && !isPersonalWithoutTeam) {
      console.error(
        '❌ Não foi possível obter teamId para o projeto selecionado'
      );
      return;
    }

    // Atualizar estado local
    setSelectedProjectId(projectId);

    // Atualizar URL
    const newParams = new URLSearchParams();
    if (teamIdToUse) newParams.set('teamId', teamIdToUse);
    newParams.set('projectId', projectId);
    if (isPersonal) {
      newParams.set('workspace', 'personal');
    }

    navigate(`/kanban?${newParams.toString()}`, { replace: true });

    // Salvar estado com userId
    saveKanbanState({
      projectId: projectId,
      teamId: teamIdToUse || undefined,
      workspace: isPersonal ? 'personal' : undefined,
      userId: currentUser?.id || undefined,
    });
  };

  // Mostrar loading enquanto inicializa ou valida projeto
  const showLoading =
    isInitializing || personalWorkspaceLoading || isValidatingProject;

  if (showLoading) {
    return (
      <Layout>
        <div
          style={{
            padding: '24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
          }}
        >
          <LottieLoading />
        </div>
      </Layout>
    );
  }


  // Validar se finalTeamId é realmente válido para renderização
  const isValidFinalTeamIdForRender =
    finalTeamId &&
    finalTeamId !== 'undefined' &&
    finalTeamId !== 'null' &&
    finalTeamId.trim() !== '';

  // TeamId para o board: SEMPRE usar o teamId do projeto quando temos projeto validado (funil pode estar em "Sem equipe" com ID diferente da URL)
  const projectTeamIdValid =
    validatedProjectData?.id === finalProjectId &&
    validatedProjectData?.teamId &&
    validatedProjectData.teamId !== 'undefined' &&
    validatedProjectData.teamId !== 'null' &&
    String(validatedProjectData.teamId).trim() !== '';
  const effectiveTeamIdForBoard = projectTeamIdValid
    ? validatedProjectData!.teamId
    : isValidFinalTeamIdForRender
      ? finalTeamId
      : undefined;

  // Mostrar o board quando tiver projectId e (teamId válido OU workspace pessoal sem equipe)
  const isPersonalWorkspaceProject = personalWorkspace?.id === finalProjectId;
  const canShowBoard =
    !!finalProjectId &&
    (!!effectiveTeamIdForBoard || (isPersonalWorkspaceProject && !validatedProjectData?.teamId));

  const forceCreate = searchParams.get('forceCreate') === '1';

  const showLinkToTeamModal =
    !loadingProjectsWithoutTeam && projectsWithoutTeam.length > 0;

  return (
    <Layout>
      {showLinkToTeamModal && (
        <LinkProjectsToTeamModal
          isOpen={true}
          projects={projectsWithoutTeam}
          onComplete={() => setProjectsWithoutTeam([])}
        />
      )}
      {canShowBoard ? (
        <KanbanBoardComponent
          initialTeamId={effectiveTeamIdForBoard}
          initialProjectId={finalProjectId}
          initialProjectData={
            validatedProjectData?.id === finalProjectId
              ? validatedProjectData
              : undefined
          }
          isPersonalWorkspace={isPersonalWorkspace}
          selectedProjectId={selectedProjectId}
          onProjectChange={handleProjectChange}
          onRequestCreateFunnel={() => setShowCreateFunnelModal(true)}
          onProjectUpdated={project => {
            setValidatedProjectData(prev =>
              prev?.id === project.id ? { ...prev, ...project } : prev
            );
          }}
        />
      ) : (
        <EmptyStateWrapper>
          {(() => {
            const isLoading = kanbanTeamsLoading || personalWorkspaceLoading;
            const hasFunnels = kanbanTeams.length > 0 || !!personalWorkspace;

            // Ainda carregando
            if (isLoading) {
              return (
                <EmptyFunnelCard>
                  <EmptyFunnelIcon>⏳</EmptyFunnelIcon>
                  <EmptyFunnelTitle>Carregando funis...</EmptyFunnelTitle>
                  <EmptyFunnelText>
                    Aguarde enquanto buscamos seus funis disponíveis.
                  </EmptyFunnelText>
                </EmptyFunnelCard>
              );
            }

            // Tem funis disponíveis — mostrar seletor
            if (hasFunnels || forceCreate === false) {
              return (
                <EmptyFunnelCard>
                  <EmptyFunnelIcon>🗂️</EmptyFunnelIcon>
                  <EmptyFunnelTitle>Selecione um funil</EmptyFunnelTitle>
                  <EmptyFunnelText>
                    Escolha um funil para visualizar e gerenciar seus cards de vendas.
                  </EmptyFunnelText>
                  <FunnelSelectRow style={{ justifyContent: 'center', marginBottom: canCreateFunnel ? '16px' : '0' }}>
                    <ProjectSelect
                      selectedProjectId={selectedProjectId}
                      onProjectChange={handleProjectChange}
                      useKanbanTeams
                    />
                  </FunnelSelectRow>
                  {canCreateFunnel && (
                    <CreateFunnelButton
                      type='button'
                      onClick={() => setShowCreateFunnelModal(true)}
                    >
                      <MdAdd size={20} />
                      Criar novo funil
                    </CreateFunnelButton>
                  )}
                  {finalProjectId && !isValidFinalTeamIdForRender && (
                    <div style={{ marginTop: '24px' }}>
                      <KanbanShimmer columnCount={3} taskCountPerColumn={2} />
                    </div>
                  )}
                </EmptyFunnelCard>
              );
            }

            // Sem funis — verificar permissão para criar
            if (canCreateFunnel) {
              return (
                <EmptyFunnelCard>
                  <EmptyFunnelIcon>🚀</EmptyFunnelIcon>
                  <EmptyFunnelTitle>Nenhum funil encontrado</EmptyFunnelTitle>
                  <EmptyFunnelText>
                    Você ainda não tem nenhum funil de vendas. Crie o primeiro para
                    começar a organizar seus negócios.
                  </EmptyFunnelText>
                  <CreateFunnelButton
                    type='button'
                    onClick={() => setShowCreateFunnelModal(true)}
                  >
                    <MdAdd size={20} />
                    Criar novo funil
                  </CreateFunnelButton>
                </EmptyFunnelCard>
              );
            }

            // Sem funis e sem permissão para criar
            const userRole = (currentUser as any)?.role ?? '';
            const isAdminOrMaster = userRole === 'admin' || userRole === 'master';

            return (
              <EmptyFunnelCard>
                <EmptyFunnelIcon>🔒</EmptyFunnelIcon>
                <EmptyFunnelBadge>Acesso restrito</EmptyFunnelBadge>
                <EmptyFunnelTitle>Nenhum funil disponível</EmptyFunnelTitle>
                <EmptyFunnelText>
                  {isAdminOrMaster
                    ? 'Você ainda não tem nenhum funil de vendas configurado. Entre em contato com o suporte para criar um funil.'
                    : 'Você não tem acesso a nenhum funil no momento. Entre em contato com um administrador para solicitar acesso ou criação de um funil.'}
                </EmptyFunnelText>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    borderRadius: '10px',
                    background: 'var(--color-background-secondary, #f3f4f6)',
                    fontSize: '0.875rem',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  💬 Fale com um administrador
                </div>
              </EmptyFunnelCard>
            );
          })()}
        </EmptyStateWrapper>
      )}

      {showCreateFunnelModal && (
        <CreateProjectModal
          isOpen={showCreateFunnelModal}
          onClose={() => {
            setShowCreateFunnelModal(false);
            if (forceCreate) {
              const params = new URLSearchParams(searchParams);
              params.delete('forceCreate');
              navigate(`/kanban?${params.toString()}`, { replace: true });
            }
          }}
          teamId={teamId || undefined}
          onProjectCreated={project => {
            setShowCreateFunnelModal(false);
            setSelectedProjectId(project.id);
            setValidatedProjectId(project.id);
            setValidatedProjectData(project);
            const tid = project.teamId || teamId;
            const newParams = new URLSearchParams();
            if (tid) newParams.set('teamId', tid);
            newParams.set('projectId', project.id);
            navigate(`/kanban?${newParams.toString()}`, { replace: true });
            saveKanbanState({
              projectId: project.id,
              teamId: tid || undefined,
              userId: currentUser?.id,
            });
          }}
        />
      )}
    </Layout>
  );
};

export default KanbanPage;
