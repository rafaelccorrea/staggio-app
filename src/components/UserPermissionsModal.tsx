import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Form,
  Checkbox,
  Typography,
  Alert,
  Spin,
  Divider,
  Tag,
  Space,
  message,
} from 'antd';
import { usePermissions } from '../hooks/usePermissions';
import { permissionsApi } from '../services/permissionsApi';
import type { Permission } from '../services/permissionsApi';
import {
  addPermissionWithDependencies,
  removePermissionCheckDependencies,
  getDependencyMessage,
  getDependentPermissionsMessage,
  filterGalleryPermissions,
} from '../utils/permissionDependencies';
import { getCategoryLabel } from '../utils/permissionCategoryMapping';
import { getPermissionDescription } from '../utils/permissionDescriptions';

interface UserPermissionsModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  userEmail: string;
}

export const UserPermissionsModal: React.FC<UserPermissionsModalProps> = ({
  open,
  onClose,
  userId,
  userName,
  userEmail,
}) => {
  const { loading, updateUserPermissions } = usePermissions();
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ao abrir: carregar lista de permissões E permissões do usuário ALVO (sempre por userId).
  // Não usar estado global do usePermissions para evitar que permissões de outro usuário
  // (ex.: usuário logado) sobrescrevam as do usuário sendo editado.
  useEffect(() => {
    if (!open || !userId) return;
    let cancelled = false;
    setError(null);
    setLoadingPermissions(true);
    const load = async () => {
      try {
        const [permissionsList, userPerms] = await Promise.all([
          permissionsApi.getAll(),
          permissionsApi.getUserPermissionsById(userId),
        ]);
        if (cancelled) return;
        setAllPermissions(permissionsList);
        const ids =
          userPerms?.permissions?.map((p: Permission) => p.id) ??
          userPerms?.permissionNames
            ?.map(
              (name: string) =>
                permissionsList.find(pp => pp.name === name)?.id
            )
            .filter((id: string | undefined): id is string => id != null) ??
          [];
        setSelectedPermissions(ids);
      } catch (err) {
        if (!cancelled) {
          setError('Erro ao carregar permissões');
          console.error('Error loading permissions:', err);
        }
      } finally {
        if (!cancelled) setLoadingPermissions(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [open, userId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await updateUserPermissions(userId, selectedPermissions);
      onClose();
    } catch (err) {
      setError('Erro ao salvar permissões');
      console.error('Error saving permissions:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  // Group permissions by category (excluindo galeria)
  const permissionsByCategory = filterGalleryPermissions(allPermissions).reduce(
    (acc, permission) => {
      // Normalizar categoria: se for null, undefined ou "other", derivar do nome da permissão
      let category = permission.category;
      if (
        !category ||
        category === 'other' ||
        category === 'null' ||
        category === 'undefined' ||
        category.trim() === ''
      ) {
        // Tentar extrair categoria do nome da permissão (formato: "category:action")
        const match = permission.name.match(/^([^:]+):/);
        if (match) {
          category = match[1];
        } else {
          category = 'system';
        }
      }

      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(permission);
      return acc;
    },
    {} as Record<string, Permission[]>
  );

  return (
    <Modal
      title='Gerenciar Permissões'
      open={open}
      onCancel={handleCancel}
      width={800}
      footer={[
        <Button key='cancel' onClick={handleCancel} disabled={saving}>
          Cancelar
        </Button>,
        <Button
          key='save'
          type='primary'
          onClick={handleSave}
          disabled={saving || loading}
          loading={saving}
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Typography.Text type='secondary'>
          {userName} ({userEmail})
        </Typography.Text>
      </div>

      {error && (
        <Alert
          message='Erro'
          description={error}
          type='error'
          style={{ marginBottom: 16 }}
        />
      )}

      {loadingPermissions ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size='large' />
        </div>
      ) : (
        <div>
          <Typography.Text
            type='secondary'
            style={{ marginBottom: 16, display: 'block' }}
          >
            Selecione as permissões que este usuário deve ter:
          </Typography.Text>

          {Object.entries(permissionsByCategory).map(
            ([category, permissions]) => (
              <div key={category} style={{ marginBottom: 24 }}>
                <Typography.Title level={5} style={{ marginBottom: 12 }}>
                  {getCategoryLabel(category, permissions[0]?.name)}
                </Typography.Title>

                <Form.Item>
                  <Space direction='vertical' style={{ width: '100%' }}>
                    {permissions.map(permission => (
                      <div key={permission.id}>
                        <Checkbox
                          value={permission.id}
                          checked={selectedPermissions.includes(permission.id)}
                          disabled={loading || saving}
                          onChange={e => {
                            const checked = e.target.checked;
                            const permissionId = permission.id;

                            if (checked) {
                              // Adicionar permissão com dependências
                              const result = addPermissionWithDependencies(
                                selectedPermissions,
                                permissionId,
                                allPermissions
                              );
                              setSelectedPermissions(result.permissions);

                              // Mostrar notificação se dependências foram adicionadas
                              if (result.addedDependencies.length > 0) {
                                const msg = getDependencyMessage(
                                  result.addedDependencies,
                                  allPermissions
                                );
                                message.info(msg, 5);
                              }
                            } else {
                              // Remover permissão verificando dependências
                              const result = removePermissionCheckDependencies(
                                selectedPermissions,
                                permissionId,
                                allPermissions
                              );

                              if (!result.canRemove) {
                                // Não pode remover, mostrar aviso
                                const msg = getDependentPermissionsMessage(
                                  result.dependentPermissions,
                                  allPermissions
                                );
                                message.warning(msg, 7);
                              } else {
                                setSelectedPermissions(result.permissions);
                              }
                            }
                          }}
                        >
                          <div style={{ fontWeight: 500 }}>
                            {getPermissionDescription(permission.name)}
                          </div>
                        </Checkbox>
                      </div>
                    ))}
                  </Space>
                </Form.Item>

                <Divider />
              </div>
            )
          )}

          {selectedPermissions.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <Typography.Text
                type='secondary'
                style={{ marginBottom: 8, display: 'block' }}
              >
                Permissões selecionadas:
              </Typography.Text>
              <Space wrap>
                {selectedPermissions.map(permissionId => {
                  const permission = allPermissions.find(
                    p => p.id === permissionId
                  );
                  return permission ? (
                    <Tag key={permissionId} color='blue'>
                      {getPermissionDescription(permission.name)}
                    </Tag>
                  ) : null;
                })}
              </Space>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
