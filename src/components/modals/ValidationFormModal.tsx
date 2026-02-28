import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button, Select, Input, ConfigProvider, theme } from 'antd';
import { toast } from 'react-toastify';
import { useTheme } from '../../contexts/ThemeContext';
import { useKanbanValidations } from '../../hooks/useKanbanValidations';
import { ValidationModalShimmer } from '../kanban/ValidationModalShimmer';
import type {
  ColumnValidation,
  CreateValidationDto,
  UpdateValidationDto,
  ValidationType,
  ValidationBehavior,
} from '../../types/kanbanValidations';
import { MAX_VALIDATIONS_PER_COLUMN } from '../../types/kanbanValidations';
import {
  CONDITION_FIELD_OPTIONS,
  getOperatorOptionsForField,
  getValueTypeForField,
  getValueOptionsForField,
  isDateField,
  isPriorityField,
  getAllowedOperatorsForField,
  OPERATORS_WITHOUT_VALUE,
  OPERATORS_REQUIRING_ARRAY,
  normalizeConditionValue,
} from '../../utils/customConditionConfig';

interface ValidationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  columnId: string;
  validation?: ColumnValidation | null;
  onSuccess: () => void;
  columns?: Array<{ id: string; title: string; position: number }>; // Colunas disponíveis para fromColumnId
  currentColumnTitle?: string; // Título da coluna atual para exibição
}

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(12px);
  display: ${props => (props.$isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 10002;
  padding: 20px;
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    padding: 16px;
    align-items: flex-start;
    padding-top: 40px;
  }
`;

const ModalContent = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 20px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 32px 64px -12px rgba(0, 0, 0, 0.5);
  border: 2px solid ${props => props.theme.colors.border};
  animation: modalSlideIn 0.3s ease-out;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 10003;

  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @media (max-width: 768px) {
    max-width: 100%;
    border-radius: 16px;
    max-height: 95vh;
  }
`;

const ModalHeader = styled.div`
  background: linear-gradient(
    135deg,
    ${props => props.theme.colors.background} 0%,
    ${props => props.theme.colors.backgroundSecondary} 100%
  );
  border-bottom: 1px solid ${props => props.theme.colors.border};
  padding: 24px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: ${props => props.theme.colors.text};

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const CloseButton = styled.button`
  background: ${props => props.theme.colors.background};
  border: 2px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${props => props.theme.colors.primary};
    border-color: ${props => props.theme.colors.primary};
    color: white;
  }
`;

const ModalBody = styled.div`
  padding: 32px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.backgroundSecondary};
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.primary};
    border-radius: 4px;
  }

  @media (max-width: 768px) {
    padding: 24px 16px;
  }
`;

const ModalFooter = styled.div`
  padding: 20px 32px;
  border-top: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.backgroundSecondary};
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-shrink: 0;

  .ant-btn {
    height: 40px;
    padding: 0 24px;
    font-weight: 600;
    border-radius: 10px;
  }

  @media (max-width: 768px) {
    padding: 16px;
    flex-direction: column-reverse;

    .ant-btn {
      width: 100%;
    }
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  .ant-select,
  .ant-input,
  .ant-input-number {
    border-radius: 10px;
    border: 2px solid ${props => props.theme.colors.border};
    transition: all 0.2s ease;

    &:hover {
      border-color: ${props => props.theme.colors.primary}60;
    }

    &:focus,
    &.ant-select-focused {
      border-color: ${props => props.theme.colors.primary};
      box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
    }
  }

  .ant-select-selector {
    border-radius: 10px !important;
    border: 2px solid ${props => props.theme.colors.border} !important;
    padding: 4px 12px !important;
    min-height: 40px !important;
  }
`;

const Label = styled.label`
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
`;

const HelpText = styled.small`
  display: block;
  font-weight: normal;
  color: ${props => props.theme.colors.textSecondary};
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.5;
`;

const InfoBox = styled.div`
  padding: 16px;
  background: ${props => props.theme.colors.infoBackground};
  border: 1px solid ${props => props.theme.colors.infoBorder};
  border-radius: 12px;
  color: ${props => props.theme.colors.infoText};
  font-size: 13px;
  line-height: 1.6;
  border-left: 4px solid ${props => props.theme.colors.primary};
`;

export const ValidationFormModal: React.FC<ValidationFormModalProps> = ({
  isOpen,
  onClose,
  columnId,
  validation,
  onSuccess,
  columns = [],
  currentColumnTitle = '',
}) => {
  const { theme: currentTheme } = useTheme();
  const { createValidation, updateValidation, loading, validations } =
    useKanbanValidations(columnId);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<CreateValidationDto>({
    type: 'required_field',
    config: {},
    behavior: 'block',
    message: '',
    fromColumnId: undefined,
    requireAdjacentPosition: false,
  });

  useEffect(() => {
    if (validation) {
      setFormData({
        type: validation.type,
        config: validation.config,
        behavior: validation.behavior,
        message: validation.message,
        fromColumnId: validation.fromColumnId,
        requireAdjacentPosition: validation.requireAdjacentPosition || false,
      });
    } else {
      // ✅ Ao criar nova validação, automaticamente definir como condicional
      // fromColumnId = coluna anterior (posição - 1)
      const currentColumn = columns.find(col => col.id === columnId);
      const previousColumn = currentColumn
        ? columns
            .filter(col => col.id !== columnId)
            .sort((a, b) => a.position - b.position)
            .find(col => col.position === currentColumn.position - 1)
        : undefined;

      // ✅ Se não houver coluna anterior (é a primeira coluna), não definir fromColumnId
      // Mas ainda definir requireAdjacentPosition como true
      setFormData({
        type: 'required_field',
        config: {},
        behavior: 'block',
        message: '',
        fromColumnId: previousColumn?.id, // ✅ Automaticamente da coluna anterior (se existir)
        requireAdjacentPosition: previousColumn ? true : false, // ✅ true se houver coluna anterior
      });
    }
  }, [validation, isOpen, columnId, columns]);

  const antdTheme = {
    token: {
      colorBgContainer: currentTheme === 'dark' ? '#1f2937' : '#ffffff',
      colorBgElevated: currentTheme === 'dark' ? '#1f2937' : '#ffffff',
      colorBorder: currentTheme === 'dark' ? '#374151' : '#e1e5e9',
      colorText: currentTheme === 'dark' ? '#f9fafb' : '#4B5563',
      colorTextSecondary: currentTheme === 'dark' ? '#ffffff' : '#6B7280',
      colorPrimary: currentTheme === 'dark' ? '#60a5fa' : '#1c4eff',
      zIndexPopupBase: 10004,
    },
    algorithm: currentTheme === 'dark' ? theme.darkAlgorithm : undefined,
  };

  const handleSubmit = async () => {
    if (!formData.message.trim()) {
      toast.error('A mensagem de erro é obrigatória.');
      return;
    }

    if (!validation && validations.length >= MAX_VALIDATIONS_PER_COLUMN) {
      toast.error(
        `Esta coluna já possui o máximo de ${MAX_VALIDATIONS_PER_COLUMN} validações. Exclua uma para criar outra.`
      );
      return;
    }

    if (formData.type === 'custom_condition') {
      const cond = formData.config?.condition;
      if (!cond?.field?.trim()) {
        toast.error('Selecione o campo da condição customizada.');
        return;
      }
      if (!cond?.operator) {
        toast.error('Selecione o operador da condição customizada.');
        return;
      }
      const needsValue = !['empty', 'not_empty'].includes(cond.operator);
      if (needsValue) {
        const isArrayOp = ['in', 'not_in'].includes(cond.operator);
        const hasValue = isArrayOp
          ? (Array.isArray(cond.value) && cond.value.length > 0) ||
            (typeof cond.value === 'string' && cond.value.trim().length > 0)
          : cond.value !== undefined &&
            cond.value !== null &&
            String(cond.value).trim() !== '';
        if (!hasValue) {
          if (isArrayOp) {
            toast.error(
              'Informe pelo menos um valor para o operador "em lista" / "não está em lista".'
            );
          } else {
            toast.error('Informe o valor de comparação da condição.');
          }
          return;
        }
      }
    }

    // Verificar se já existe uma validação duplicada na mesma coluna
    if (!validation) {
      const duplicateValidation = validations.find(v => {
        // Verificar se o tipo é o mesmo
        if (v.type !== formData.type) return false;

        // Para validações de campo obrigatório, verificar se o campo é o mesmo
        if (formData.type === 'required_field') {
          return v.config?.fieldName === formData.config?.fieldName;
        }

        // Para validações de documento, verificar tipo e status
        if (formData.type === 'required_document') {
          return (
            v.config?.documentType === formData.config?.documentType &&
            v.config?.documentStatus === formData.config?.documentStatus
          );
        }

        // Para validações de relacionamento, verificar o tipo de relacionamento
        if (formData.type === 'required_relationship') {
          return (
            v.config?.relationshipType === formData.config?.relationshipType
          );
        }

        // Para validações de checklist, verificar o checklistId
        if (formData.type === 'required_checklist') {
          return v.config?.checklistId === formData.config?.checklistId;
        }

        // Para condições customizadas, verificar a condição completa
        if (formData.type === 'custom_condition') {
          const vCondition = v.config?.condition;
          const fCondition = formData.config?.condition;
          return (
            vCondition?.field === fCondition?.field &&
            vCondition?.operator === fCondition?.operator &&
            JSON.stringify(vCondition?.value) ===
              JSON.stringify(fCondition?.value)
          );
        }

        return false;
      });

      if (duplicateValidation) {
        toast.error(
          'Já existe uma validação idêntica nesta coluna. Não é possível criar validações duplicadas.'
        );
        return;
      }
    }

    setIsSaving(true);
    try {
      let payload = formData;
      if (formData.type === 'custom_condition' && formData.config?.condition) {
        const cond = { ...formData.config.condition };
        const field = cond.field || 'priority';
        const allowedOps = getAllowedOperatorsForField(field);
        if (!allowedOps.includes(cond.operator as any)) {
          cond.operator = (allowedOps[0] || 'not_empty') as any;
        }
        const valueType = cond.valueType || getValueTypeForField(field);
        cond.valueType = valueType;
        cond.value = normalizeConditionValue(
          cond.value,
          valueType,
          cond.operator as any
        );
        payload = {
          ...formData,
          config: { ...formData.config, condition: cond },
        };
      }
      if (validation) {
        await updateValidation(validation.id, payload);
      } else {
        await createValidation(payload);
      }
      onSuccess();
      onClose();
    } catch (error) {
      // Erro já é tratado pelo hook
    } finally {
      setIsSaving(false);
    }
  };

  const modalContentRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const getPopupContainer = () => modalContentRef.current || document.body;

  const modalContent = (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent ref={modalContentRef} onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            {validation ? 'Editar Validação' : 'Nova Validação'}
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          {loading ? (
            <ValidationModalShimmer />
          ) : (
            <>
              {!validation && (
                <InfoBox>
                  <strong>💡 Dica:</strong> Configure validações para garantir
                  que tarefas atendam critérios específicos antes de serem
                  movidas para esta coluna.
                </InfoBox>
              )}

              <FormGroup>
                <Label>
                  Tipo de Validação
                  <HelpText>O que esta validação vai verificar?</HelpText>
                </Label>
                <Select
                  value={formData.type}
                  onChange={value => {
                    if (value === 'custom_condition') {
                      setFormData({
                        ...formData,
                        type: value,
                        config: {
                          condition: {
                            field: 'priority',
                            operator: 'not_empty',
                            value: null,
                            valueType: 'string',
                          },
                        },
                      });
                    } else {
                      setFormData({ ...formData, type: value, config: {} });
                    }
                  }}
                  getPopupContainer={getPopupContainer}
                  options={[
                    {
                      label: 'Campo Obrigatório',
                      value: 'required_field',
                    },
                    {
                      label: 'Checklist Obrigatório',
                      value: 'required_checklist',
                    },
                    {
                      label: 'Documento Obrigatório',
                      value: 'required_document',
                    },
                    {
                      label: 'Relacionamento Obrigatório',
                      value: 'required_relationship',
                    },
                    {
                      label: 'Condição Customizada',
                      value: 'custom_condition',
                    },
                  ]}
                />
              </FormGroup>

              <FormGroup>
                <Label>
                  O que acontece se a validação falhar?
                  <HelpText>
                    Escolha como o sistema deve reagir quando esta validação não
                    for atendida
                  </HelpText>
                </Label>
                <Select
                  value={formData.behavior}
                  onChange={value =>
                    setFormData({ ...formData, behavior: value })
                  }
                  getPopupContainer={getPopupContainer}
                  options={[
                    {
                      label: '🚫 Bloquear Movimento',
                      value: 'block',
                    },
                    {
                      label: '⚠️ Avisar (Permitir)',
                      value: 'warn',
                    },
                    {
                      label: '📝 Marcar como Incompleto',
                      value: 'mark_incomplete',
                    },
                  ]}
                />
              </FormGroup>

              <FormGroup>
                <Label>
                  Mensagem de Erro
                  <HelpText>
                    Esta mensagem será exibida ao usuário quando a validação
                    falhar
                  </HelpText>
                </Label>
                <Input.TextArea
                  value={formData.message}
                  onChange={e =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Ex: 'A tarefa deve ter um responsável atribuído antes de ser movida para esta coluna'"
                  rows={3}
                />
              </FormGroup>

              {formData.type === 'required_field' && (
                <FormGroup>
                  <Label>
                    Qual campo é obrigatório?
                    <HelpText>
                      Selecione o campo da tarefa que deve estar preenchido
                    </HelpText>
                  </Label>
                  <Select
                    value={formData.config?.fieldName || undefined}
                    onChange={value =>
                      setFormData({
                        ...formData,
                        config: { ...formData.config, fieldName: value },
                      })
                    }
                    getPopupContainer={getPopupContainer}
                    placeholder='Selecione um campo'
                    options={[
                      {
                        label: 'Valor da Negociação',
                        value: 'totalValue',
                      },
                      { label: 'Responsável', value: 'assignedToId' },
                      { label: 'Data de Vencimento', value: 'dueDate' },
                      { label: 'Prioridade', value: 'priority' },
                      { label: 'Descrição', value: 'description' },
                      { label: 'Projeto', value: 'projectId' },
                    ]}
                  />
                </FormGroup>
              )}

              {formData.type === 'required_document' && (
                <>
                  <FormGroup>
                    <Label>
                      Tipo de Documento
                      <HelpText>
                        Qual tipo de documento deve estar anexado?
                      </HelpText>
                    </Label>
                    <Select
                      value={formData.config?.documentType || undefined}
                      onChange={value =>
                        setFormData({
                          ...formData,
                          config: { ...formData.config, documentType: value },
                        })
                      }
                      getPopupContainer={getPopupContainer}
                      placeholder='Selecione o tipo de documento'
                      options={[
                        { label: 'Proposta', value: 'proposta' },
                        { label: 'Contrato', value: 'contrato' },
                        { label: 'CPF/CNPJ', value: 'cpf_cnpj' },
                        { label: 'Comprovante', value: 'comprovante' },
                        { label: 'Outro', value: 'outro' },
                      ]}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>
                      Status Exigido
                      <HelpText>Qual status o documento deve ter?</HelpText>
                    </Label>
                    <Select
                      value={formData.config?.documentStatus || 'any'}
                      onChange={value =>
                        setFormData({
                          ...formData,
                          config: { ...formData.config, documentStatus: value },
                        })
                      }
                      getPopupContainer={getPopupContainer}
                      options={[
                        {
                          label: 'Qualquer status (apenas anexado)',
                          value: 'any',
                        },
                        { label: 'Assinado', value: 'signed' },
                        { label: 'Aprovado', value: 'approved' },
                      ]}
                    />
                  </FormGroup>
                </>
              )}

              {formData.type === 'required_relationship' && (
                <FormGroup>
                  <Label>
                    Tipo de Relacionamento
                    <HelpText>
                      A tarefa deve estar vinculada a qual tipo de entidade?
                    </HelpText>
                  </Label>
                  <Select
                    value={formData.config?.relationshipType || 'client'}
                    onChange={value =>
                      setFormData({
                        ...formData,
                        config: { ...formData.config, relationshipType: value },
                      })
                    }
                    getPopupContainer={getPopupContainer}
                    options={[
                      { label: '👤 Cliente', value: 'client' },
                      { label: '🏠 Propriedade', value: 'property' },
                      { label: '📁 Projeto', value: 'project' },
                      { label: '🔑 Aluguel', value: 'rental' },
                    ]}
                  />
                </FormGroup>
              )}

              {formData.type === 'custom_condition' &&
                (() => {
                  const field = formData.config?.condition?.field || 'priority';
                  const operator =
                    formData.config?.condition?.operator || 'not_empty';
                  const valueType =
                    formData.config?.condition?.valueType ||
                    getValueTypeForField(field);
                  const needsValue = !OPERATORS_WITHOUT_VALUE.includes(
                    operator as any
                  );
                  const operatorOptions = getOperatorOptionsForField(field);
                  const priorityOptions = getValueOptionsForField(field);
                  const isArrayOp = OPERATORS_REQUIRING_ARRAY.includes(
                    operator as any
                  );
                  const displayValue = formData.config?.condition?.value;
                  const valueStr = Array.isArray(displayValue)
                    ? (displayValue as string[]).join(', ')
                    : displayValue != null && displayValue !== ''
                      ? typeof displayValue === 'string' &&
                        displayValue.length === 10 &&
                        /^\d{4}-\d{2}-\d{2}$/.test(displayValue)
                        ? displayValue
                        : String(displayValue)
                      : '';
                  return (
                    <>
                      <FormGroup>
                        <Label>
                          Campo da tarefa
                          <HelpText>
                            O tipo de comparação e o valor serão ajustados
                            conforme o campo
                          </HelpText>
                        </Label>
                        <Select
                          value={field}
                          onChange={newField => {
                            const newValueType = getValueTypeForField(newField);
                            const allowedOps =
                              getOperatorOptionsForField(newField);
                            const firstOp = allowedOps[0]?.value || 'not_empty';
                            setFormData({
                              ...formData,
                              config: {
                                ...formData.config,
                                condition: {
                                  field: newField,
                                  operator: firstOp,
                                  value: OPERATORS_WITHOUT_VALUE.includes(
                                    firstOp as any
                                  )
                                    ? null
                                    : (formData.config?.condition?.value ?? ''),
                                  valueType: newValueType,
                                },
                              },
                            });
                          }}
                          getPopupContainer={getPopupContainer}
                          options={CONDITION_FIELD_OPTIONS}
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label>
                          Operador
                          <HelpText>
                            Operadores permitidos para este campo (ex.: data usa
                            maior/menor, texto usa contém)
                          </HelpText>
                        </Label>
                        <Select
                          value={
                            operatorOptions.some(o => o.value === operator)
                              ? operator
                              : operatorOptions[0]?.value
                          }
                          onChange={newOp =>
                            setFormData({
                              ...formData,
                              config: {
                                ...formData.config,
                                condition: {
                                  ...formData.config?.condition,
                                  field,
                                  operator: newOp,
                                  value: OPERATORS_WITHOUT_VALUE.includes(
                                    newOp as any
                                  )
                                    ? null
                                    : formData.config?.condition?.value,
                                  valueType,
                                },
                              },
                            })
                          }
                          getPopupContainer={getPopupContainer}
                          options={operatorOptions}
                        />
                      </FormGroup>
                      {needsValue && (
                        <FormGroup>
                          <Label>
                            {isArrayOp
                              ? 'Valores (separados por vírgula)'
                              : isDateField(field)
                                ? 'Data'
                                : isPriorityField(field) && !isArrayOp
                                  ? 'Prioridade'
                                  : 'Valor'}
                            <HelpText>
                              {isDateField(field) && 'Formato: AAAA-MM-DD'}
                              {isPriorityField(field) &&
                                !isArrayOp &&
                                'Selecione uma prioridade'}
                              {isPriorityField(field) &&
                                isArrayOp &&
                                'Ex.: low, medium, high, urgent'}
                              {!isDateField(field) &&
                                !isPriorityField(field) &&
                                (isArrayOp
                                  ? 'Ex.: valor1, valor2'
                                  : 'Valor a comparar')}
                            </HelpText>
                          </Label>
                          {isDateField(field) ? (
                            <Input
                              type='date'
                              value={valueStr}
                              onChange={e =>
                                setFormData({
                                  ...formData,
                                  config: {
                                    ...formData.config,
                                    condition: {
                                      ...formData.config?.condition,
                                      field,
                                      operator,
                                      value: e.target.value || null,
                                      valueType: 'date',
                                    },
                                  },
                                })
                              }
                            />
                          ) : isPriorityField(field) &&
                            !isArrayOp &&
                            priorityOptions ? (
                            <Select
                              value={
                                formData.config?.condition?.value ?? undefined
                              }
                              onChange={val =>
                                setFormData({
                                  ...formData,
                                  config: {
                                    ...formData.config,
                                    condition: {
                                      ...formData.config?.condition,
                                      field,
                                      operator,
                                      value: val,
                                      valueType: 'string',
                                    },
                                  },
                                })
                              }
                              getPopupContainer={getPopupContainer}
                              options={priorityOptions}
                              placeholder='Selecione a prioridade'
                            />
                          ) : (
                            <Input
                              type={valueType === 'number' ? 'number' : 'text'}
                              value={valueStr}
                              onChange={e => {
                                const raw = e.target.value;
                                const value = isArrayOp
                                  ? raw
                                      .split(',')
                                      .map(s => s.trim())
                                      .filter(Boolean)
                                  : valueType === 'number'
                                    ? raw === ''
                                      ? null
                                      : Number(raw)
                                    : raw;
                                setFormData({
                                  ...formData,
                                  config: {
                                    ...formData.config,
                                    condition: {
                                      ...formData.config?.condition,
                                      field,
                                      operator,
                                      value,
                                      valueType,
                                    },
                                  },
                                });
                              }}
                              placeholder={
                                isArrayOp
                                  ? 'valor1, valor2, valor3'
                                  : isDateField(field)
                                    ? 'YYYY-MM-DD'
                                    : 'Valor'
                              }
                            />
                          )}
                        </FormGroup>
                      )}
                    </>
                  );
                })()}

              {formData.type === 'required_checklist' && (
                <FormGroup>
                  <Label>
                    Checklist
                    <HelpText>
                      Selecione o checklist que deve estar completo (em
                      desenvolvimento)
                    </HelpText>
                  </Label>
                  <Input
                    value={formData.config?.checklistId || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          checklistId: e.target.value,
                        },
                      })
                    }
                    placeholder='ID do checklist (será implementado)'
                    disabled
                  />
                </FormGroup>
              )}

              {/* ✅ Validação Condicional - Automática e não editável */}
              {formData.fromColumnId && (
                <InfoBox>
                  <strong>ℹ️ Validação Condicional:</strong>
                  <br />
                  <br />
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '16px',
                      fontWeight: 600,
                      marginTop: '8px',
                    }}
                  >
                    <span
                      style={{
                        padding: '8px 16px',
                        background: 'rgba(28, 78, 255, 0.1)',
                        borderRadius: '8px',
                        border: '2px solid rgba(28, 78, 255, 0.3)',
                      }}
                    >
                      {columns.find(c => c.id === formData.fromColumnId)
                        ?.title || 'Coluna Anterior'}
                    </span>
                    <span
                      style={{
                        fontSize: '20px',
                        color: 'rgba(28, 78, 255, 0.8)',
                      }}
                    >
                      ⇒
                    </span>
                    <span
                      style={{
                        padding: '8px 16px',
                        background: 'rgba(28, 78, 255, 0.1)',
                        borderRadius: '8px',
                        border: '2px solid rgba(28, 78, 255, 0.3)',
                      }}
                    >
                      {currentColumnTitle || 'Coluna Atual'}
                    </span>
                  </div>
                  <br />
                  <div
                    style={{
                      fontSize: '13px',
                      color: 'rgba(255, 255, 255, 0.7)',
                      marginTop: '8px',
                    }}
                  >
                    Esta validação será aplicada quando um card for movido da
                    coluna de origem para a coluna de destino.
                    <br />
                    <strong style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      Esta configuração é automática e não pode ser editada.
                    </strong>
                  </div>
                </InfoBox>
              )}
            </>
          )}
        </ModalBody>

        {!loading && (
          <ModalFooter>
            <Button onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button
              type='primary'
              onClick={handleSubmit}
              disabled={
                !formData.message.trim() ||
                isSaving ||
                (!validation &&
                  validations.length >= MAX_VALIDATIONS_PER_COLUMN)
              }
              loading={isSaving}
            >
              {validation ? 'Salvar' : 'Criar'}
            </Button>
          </ModalFooter>
        )}
      </ModalContent>
    </ModalOverlay>
  );

  return (
    <ConfigProvider theme={antdTheme}>
      {createPortal(modalContent, document.body)}
    </ConfigProvider>
  );
};
