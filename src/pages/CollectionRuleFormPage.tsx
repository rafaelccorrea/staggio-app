import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MdSave, MdArrowBack } from 'react-icons/md';
import { Layout } from '@/components/layout/Layout';
import {
  getCollectionRule,
  createCollectionRule,
  updateCollectionRule,
  type CollectionRule,
} from '../services/collectionService';
import { normalizeTime, validateTime, formatTimeForInput } from '../utils/masks';
import styled from 'styled-components';
import {
  RentalStylePageContainer,
  PageHeader,
  PageTitle,
  PageTitleContainer,
  PageSubtitle,
  ContentCard,
} from '@/styles/components/PageStyles';
import { CollectionRuleFormShimmer } from '@/components/shimmer/CollectionRuleFormShimmer';

const BackButton = styled.button`
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

  &:hover {
    background: ${props => props.theme.colors.hover};
    border-color: ${props => props.theme.colors.primary};
  }
`;

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

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FormField = styled.div`
  margin-bottom: 20px;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  margin-bottom: 8px;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  color: ${props => props.theme.colors.text};
  background: ${props => props.theme.colors.inputBackground};
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => `${props.theme.colors.primary}20`};
  }

  &::placeholder {
    color: ${props => props.theme.colors.textLight};
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  color: ${props => props.theme.colors.text};
  background: ${props => props.theme.colors.inputBackground};
  cursor: pointer;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => `${props.theme.colors.primary}20`};
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  color: ${props => props.theme.colors.text};
  background: ${props => props.theme.colors.inputBackground};
  resize: vertical;
  font-family: inherit;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => `${props.theme.colors.primary}20`};
  }

  &::placeholder {
    color: ${props => props.theme.colors.textLight};
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`;

const FormHint = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.textLight};
  margin-top: 6px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const defaultFormData: Partial<CollectionRule> = {
  name: '',
  description: '',
  trigger: 'DAYS_BEFORE_DUE',
  triggerDays: 1,
  channel: 'EMAIL',
  messageTemplate: '',
  subjectTemplate: '',
  isActive: true,
  priority: 1,
  sendTime: '09:00:00',
};

const CollectionRuleFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = id && id !== 'new';
  const [formData, setFormData] = useState<Partial<CollectionRule>>(defaultFormData);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      getCollectionRule(id)
        .then(rule => setFormData(rule))
        .catch(() => {
          toast.error('Erro ao carregar régua.');
          navigate('/collection/rules');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, navigate]);

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      toast.warning('Informe o nome da régua.');
      return;
    }
    if (!formData.messageTemplate?.trim()) {
      toast.warning('Informe a mensagem.');
      return;
    }
    if (formData.channel === 'EMAIL' && !formData.subjectTemplate?.trim()) {
      toast.warning('Informe o assunto do e-mail.');
      return;
    }
    const normalizedTime = normalizeTime(formData.sendTime ?? '');
    if (!normalizedTime || !validateTime(formData.sendTime ?? '')) {
      toast.warning('Informe um horário de envio válido (entre 00:00 e 23:59).');
      return;
    }

    const payload = { ...formData, sendTime: normalizedTime };

    try {
      setSaving(true);
      if (isEdit && id) {
        await updateCollectionRule(id, payload);
        toast.success('Régua atualizada com sucesso!');
      } else {
        await createCollectionRule(payload as any);
        toast.success('Régua criada com sucesso!');
      }
      navigate('/collection/rules');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao salvar régua');
    } finally {
      setSaving(false);
    }
  };

  if (loading && isEdit) {
    return <CollectionRuleFormShimmer />;
  }

  return (
    <Layout>
      <RentalStylePageContainer>
        <PageHeader>
          <PageTitleContainer>
            <PageTitle>
              {isEdit ? 'Editar Régua' : 'Nova Régua'}
            </PageTitle>
            <PageSubtitle>
              {isEdit
                ? 'Altere os dados da régua de cobrança'
                : 'Preencha os dados para criar uma nova régua de cobrança'}
            </PageSubtitle>
          </PageTitleContainer>
          <HeaderActions>
            <BackButton type="button" onClick={() => navigate('/collection/rules')}>
              <MdArrowBack size={20} />
              Voltar
            </BackButton>
            <PrimaryButton type="button" onClick={handleSave} disabled={saving}>
              <MdSave size={20} />
              {saving ? 'Salvando...' : isEdit ? 'Atualizar' : 'Criar'}
            </PrimaryButton>
          </HeaderActions>
        </PageHeader>

        <ContentCard>
          <FormField>
            <FormLabel>Nome *</FormLabel>
            <FormInput
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Lembrete 3 dias antes"
            />
          </FormField>

          <FormField>
            <FormLabel>Descrição</FormLabel>
            <FormTextarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição opcional da régua"
              rows={2}
            />
          </FormField>

          <FormGrid>
            <FormField>
              <FormLabel>Gatilho *</FormLabel>
              <FormSelect
                value={formData.trigger}
                onChange={e => setFormData({ ...formData, trigger: e.target.value as any })}
              >
                <option value="DAYS_BEFORE_DUE">Dias Antes do Vencimento</option>
                <option value="ON_DUE_DATE">No Dia do Vencimento</option>
                <option value="DAYS_AFTER_DUE">Dias Após o Vencimento</option>
              </FormSelect>
            </FormField>

            {formData.trigger !== 'ON_DUE_DATE' && (
              <FormField>
                <FormLabel>Dias *</FormLabel>
                <FormInput
                  type="number"
                  min={1}
                  max={365}
                  step={1}
                  inputMode="numeric"
                  value={formData.triggerDays ?? 1}
                  onChange={e => {
                    const n = parseInt(e.target.value, 10);
                    const triggerDays = Number.isNaN(n) ? 1 : Math.min(365, Math.max(1, n));
                    setFormData({ ...formData, triggerDays });
                  }}
                />
              </FormField>
            )}

            <FormField>
              <FormLabel>Canal *</FormLabel>
              <FormSelect
                value={formData.channel}
                onChange={e => setFormData({ ...formData, channel: e.target.value as any })}
              >
                <option value="EMAIL">Email</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="SMS">SMS</option>
              </FormSelect>
            </FormField>

            <FormField>
              <FormLabel>Prioridade *</FormLabel>
              <FormInput
                type="number"
                min={1}
                max={999}
                step={1}
                inputMode="numeric"
                value={formData.priority ?? 1}
                onChange={e => {
                  const n = parseInt(e.target.value, 10);
                  const priority = Number.isNaN(n) ? 1 : Math.min(999, Math.max(1, n));
                  setFormData({ ...formData, priority });
                }}
              />
            </FormField>

            <FormField>
              <FormLabel>Horário de Envio *</FormLabel>
              <FormInput
                type="time"
                value={formData.sendTime ? formData.sendTime.substring(0, 5) : '09:00'}
                min="00:00"
                max="23:59"
                step="60"
                onChange={e => {
                  const v = e.target.value;
                  const normalized = v ? normalizeTime(v + ':00') : '09:00:00';
                  setFormData({ ...formData, sendTime: normalized });
                }}
              />
            </FormField>
          </FormGrid>

          {formData.channel === 'EMAIL' && (
            <FormField>
              <FormLabel>Assunto do Email *</FormLabel>
              <FormInput
                type="text"
                value={formData.subjectTemplate}
                onChange={e =>
                  setFormData({ ...formData, subjectTemplate: e.target.value })
                }
                placeholder="Ex: Lembrete de pagamento - {{nome}}"
              />
            </FormField>
          )}

          <FormField>
            <FormLabel>Mensagem *</FormLabel>
            <FormTextarea
              value={formData.messageTemplate}
              onChange={e =>
                setFormData({ ...formData, messageTemplate: e.target.value })
              }
              placeholder="Use variáveis: {{nome}}, {{valor}}, {{vencimento}}, {{diasAtraso}}"
              rows={6}
            />
            <FormHint>
              Variáveis disponíveis: {'{{'}nome{'}}'}, {'{{'}valor{'}}'}, {'{{'}
              vencimento{'}}'}, {'{{'}diasAtraso{'}}'}
            </FormHint>
          </FormField>

          <FormField>
            <CheckboxLabel>
              <Checkbox
                type="checkbox"
                checked={formData.isActive}
                onChange={e =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
              />
              Régua ativa
            </CheckboxLabel>
          </FormField>
        </ContentCard>
      </RentalStylePageContainer>
    </Layout>
  );
};

export default CollectionRuleFormPage;
