import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdArrowBack, MdCheck, MdClose, MdPersonAdd, MdRemoveCircle } from 'react-icons/md';
import { Layout } from '../components/layout/Layout';
import { useTeams } from '../hooks/useTeams';
import { useUsers } from '../hooks/useUsers';
import { teamApi } from '../services/teamApi';
import type { Team, TeamMember } from '../services/teamApi';
import { translateUserRole } from '../utils/roleTranslations';
import { EditTeamPageShimmer } from '../components/shimmer/EditTeamPageShimmer';
import styled from 'styled-components';
import {
  Input,
  TextArea,
  Button,
  ToastContainer,
  ToastIcon,
  ToastMessage,
} from '../styles/pages/NotesPageStyles';

const colors = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#06B6D4',
  '#84CC16',
  '#F97316',
  '#EC4899',
  '#6366F1',
  '#14B8A6',
  '#DC2626',
  '#059669',
  '#7C3AED',
  '#0891B2',
];

const SimplePageContainer = styled.div`
  padding: 32px;
  width: 100%;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const SimpleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
    align-items: stretch;
  }
`;

const SimpleTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin-bottom: 8px;
`;

const SimpleSubtitle = styled.p`
  font-size: 1rem;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

const SimpleBackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: transparent;
  color: ${props => props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: ${props => props.theme.colors.cardBackground};
    transform: translateX(4px);
  }
`;

const SimpleFormGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 28px;
`;

const FieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FieldLabel = styled.label`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const RequiredMark = styled.span`
  color: ${props => props.theme.colors.error};
`;

const ColorPicker = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
`;

const ColorOption = styled.button<{ $color: string; $isSelected: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.$color};
  border: 3px solid
    ${props => (props.$isSelected ? props.theme.colors.primary : 'transparent')};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${props =>
    props.$isSelected
      ? `0 0 0 3px ${props.theme.colors.primary}40`
      : '0 2px 8px rgba(0,0,0,0.1)'};

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

const SectionCard = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 16px;
  padding: 24px;
  margin-top: 8px;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MembersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MemberItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
`;

const MemberInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const MemberAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
`;

const MemberDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const MemberName = styled.span`
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const MemberEmail = styled.span`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const MemberRole = styled.span`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const RemoveMemberButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.error};
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => `${props.theme.colors.error}20`};
  }
`;

const UserSearchInput = styled(Input)`
  margin-bottom: 0;
`;

const UsersList = styled.div`
  max-height: 280px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.hover};
    border-color: ${props => props.theme.colors.primary};
  }
`;

const AddUserIcon = styled.div`
  color: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
`;

const EmptyMessage = styled.div`
  padding: 24px;
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.875rem;
  background: ${props => props.theme.colors.background};
  border-radius: 12px;
`;

const ButtonsRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  flex-wrap: wrap;
  margin-top: 24px;
`;

const LoadingSpinner = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid ${props => props.theme.colors.border};
  border-top-color: ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: spin 0.7s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const EditTeamPage: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { updateTeam, refreshTeams } = useTeams();
  const { users, getUsers } = useUsers();

  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: colors[0],
  });
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (!teamId) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      teamApi.getTeam(teamId),
      teamApi.getTeamMembers(teamId).catch(() => []),
      getUsers({ page: 1 }),
    ])
      .then(([teamData, membersData]) => {
        if (cancelled) return;
        setTeam(teamData);
        setMembers(Array.isArray(membersData) ? membersData : []);
        setFormData({
          name: teamData.name,
          description: teamData.description || '',
          color: teamData.color || colors[0],
        });
        const ids = (membersData as TeamMember[])
          .map(m => m.user?.id || m.userId)
          .filter(Boolean) as string[];
        setSelectedUserIds(ids);
      })
      .catch(err => {
        if (!cancelled) {
          setToastMessage(err?.message || 'Erro ao carregar equipe');
          setShowErrorToast(true);
          setTimeout(() => setShowErrorToast(false), 3000);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [teamId, getUsers]);

  const filteredUsers = useMemo(() => {
    const term = (userSearchTerm || '').trim().toLowerCase();
    return users.filter(
      user =>
        !selectedUserIds.includes(user.id) &&
        (term === '' ||
          user.name.toLowerCase().includes(term) ||
          (user.email && user.email.toLowerCase().includes(term)))
    );
  }, [users, userSearchTerm, selectedUserIds]);

  const selectedMembersData = useMemo(() => {
    return selectedUserIds
      .map(id => {
        const member = members.find(
          m => (m.user?.id || m.userId) === id
        );
        if (member?.user) return { id, ...member.user, role: member.role };
        const user = users.find(u => u.id === id);
        if (user) return { id: user.id, name: user.name, email: user.email, role: user.role };
        return null;
      })
      .filter(Boolean) as Array<{ id: string; name: string; email?: string; role?: string }>;
  }, [selectedUserIds, members, users]);

  const handleAddUser = (userId: string) => {
    setSelectedUserIds(prev => (prev.includes(userId) ? prev : [...prev, userId]));
    setUserSearchTerm('');
  };

  const handleRemoveMember = (userId: string) => {
    setSelectedUserIds(prev => prev.filter(id => id !== userId));
  };

  const handleSave = async () => {
    if (!teamId || !formData.name.trim()) {
      setToastMessage('Nome da equipe é obrigatório');
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      return;
    }
    if (selectedUserIds.length === 0) {
      setToastMessage('A equipe precisa ter pelo menos um membro');
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      return;
    }

    setSaving(true);
    try {
      await updateTeam(teamId, {
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        color: formData.color,
        userIds: selectedUserIds,
      });
      await refreshTeams();
      setToastMessage('Equipe atualizada com sucesso!');
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        navigate('/teams');
      }, 1500);
    } catch (error: any) {
      setToastMessage(error?.message || 'Erro ao atualizar equipe');
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !team) {
    return (
      <Layout>
        <EditTeamPageShimmer />
      </Layout>
    );
  }

  if (!teamId || (!loading && !team)) {
    return (
      <Layout>
        <SimplePageContainer>
          <EmptyMessage>Equipe não encontrada.</EmptyMessage>
          <SimpleBackButton onClick={() => navigate('/teams')} style={{ marginTop: 16 }}>
            <MdArrowBack size={20} />
            Voltar
          </SimpleBackButton>
        </SimplePageContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <SimplePageContainer>
        <SimpleHeader>
          <div>
            <SimpleTitle>Editar Equipe</SimpleTitle>
            <SimpleSubtitle>
              Altere os dados da equipe e gerencie os membros
            </SimpleSubtitle>
          </div>
          <SimpleBackButton onClick={() => navigate('/teams')}>
            <MdArrowBack size={20} />
            Voltar
          </SimpleBackButton>
        </SimpleHeader>

        <SimpleFormGrid>
          <FieldContainer>
            <FieldLabel>Nome da Equipe <RequiredMark>*</RequiredMark></FieldLabel>
            <Input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Digite o nome da equipe"
            />
          </FieldContainer>

          <FieldContainer>
            <FieldLabel>Descrição</FieldLabel>
            <TextArea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o propósito da equipe"
              rows={4}
            />
          </FieldContainer>

          <FieldContainer>
            <FieldLabel>Cor da Equipe</FieldLabel>
            <ColorPicker>
              {colors.map(color => (
                <ColorOption
                  key={color}
                  $color={color}
                  $isSelected={formData.color === color}
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                />
              ))}
            </ColorPicker>
          </FieldContainer>

          <FieldContainer>
            <FieldLabel>Membros da Equipe</FieldLabel>
            <SectionCard>
              <SectionTitle>👥 Todos os membros ({selectedMembersData.length})</SectionTitle>
              {selectedMembersData.length === 0 ? (
                <EmptyMessage>Nenhum membro na equipe. Adicione usuários abaixo.</EmptyMessage>
              ) : (
                <MembersList>
                  {selectedMembersData.map(user => (
                    <MemberItem key={user.id}>
                      <MemberInfo>
                        <MemberAvatar>
                          {(user.name || '?').charAt(0).toUpperCase()}
                        </MemberAvatar>
                        <MemberDetails>
                          <MemberName>{user.name}</MemberName>
                          {user.email && <MemberEmail>{user.email}</MemberEmail>}
                          <MemberRole>
                            {user.role ? translateUserRole(user.role) : 'Membro'}
                          </MemberRole>
                        </MemberDetails>
                      </MemberInfo>
                      <RemoveMemberButton
                        onClick={() => handleRemoveMember(user.id)}
                        title="Remover da equipe"
                      >
                        <MdRemoveCircle size={22} />
                      </RemoveMemberButton>
                    </MemberItem>
                  ))}
                </MembersList>
              )}

              <FieldLabel style={{ marginTop: 20 }}>Adicionar membros</FieldLabel>
              <UserSearchInput
                type="text"
                placeholder="Buscar usuários para adicionar..."
                value={userSearchTerm}
                onChange={e => setUserSearchTerm(e.target.value)}
              />
              <UsersList>
                {filteredUsers.length === 0 ? (
                  <EmptyMessage>
                    {userSearchTerm
                      ? 'Nenhum usuário encontrado'
                      : selectedUserIds.length === users.length
                        ? 'Todos os usuários já estão na equipe'
                        : 'Digite para buscar usuários'}
                  </EmptyMessage>
                ) : (
                  filteredUsers.map(user => (
                    <UserItem key={user.id} onClick={() => handleAddUser(user.id)}>
                      <MemberInfo>
                        <MemberAvatar>
                          {user.name.charAt(0).toUpperCase()}
                        </MemberAvatar>
                        <MemberDetails>
                          <MemberName>{user.name}</MemberName>
                          {user.email && <MemberEmail>{user.email}</MemberEmail>}
                          <MemberRole>{translateUserRole(user.role)}</MemberRole>
                        </MemberDetails>
                      </MemberInfo>
                      <AddUserIcon>
                        <MdPersonAdd size={20} />
                      </AddUserIcon>
                    </UserItem>
                  ))
                )}
              </UsersList>
            </SectionCard>
          </FieldContainer>
        </SimpleFormGrid>

        <ButtonsRow>
          <Button type="button" $variant="secondary" onClick={() => navigate('/teams')}>
            Cancelar
          </Button>
          <Button
            type="button"
            $variant="primary"
            onClick={handleSave}
            disabled={
              !formData.name.trim() || selectedUserIds.length === 0 || saving
            }
          >
            {saving ? (
              <>
                <LoadingSpinner />
                Salvando...
              </>
            ) : (
              <>
                <MdCheck size={18} />
                Salvar alterações
              </>
            )}
          </Button>
        </ButtonsRow>

        {showSuccessToast && (
          <ToastContainer $type="success">
            <ToastIcon>
              <MdCheck size={20} />
            </ToastIcon>
            <ToastMessage>{toastMessage}</ToastMessage>
          </ToastContainer>
        )}

        {showErrorToast && (
          <ToastContainer $type="error">
            <ToastIcon>
              <MdClose size={20} />
            </ToastIcon>
            <ToastMessage>{toastMessage}</ToastMessage>
          </ToastContainer>
        )}
      </SimplePageContainer>
    </Layout>
  );
};

export default EditTeamPage;
