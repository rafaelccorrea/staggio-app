import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { rentalService } from '@/services/rental.service';
import { clientsApi } from '@/services/clientsApi';
import { propertyApi } from '@/services/propertyApi';
import { checklistService } from '@/services/checklist.service';
import { listDocuments } from '@/services/documentApi';
import { useProperties } from '@/hooks/useProperties';
import { usePermissionsContext } from '@/contexts/PermissionsContext';
import {
  canExecuteFunctionality,
  getDisabledFunctionalityMessage,
} from '@/utils/permissionContextualDependencies';
import type { CreateRentalRequest } from '@/types/rental.types';
import { toast } from 'react-toastify';
import styled, { keyframes } from 'styled-components';
import {
  MdArrowBack,
  MdSave,
  MdPerson,
  MdHome,
  MdAttachMoney,
  MdSearch,
  MdChecklist,
  MdAttachFile,
  MdAssessment,
  MdInfoOutline,
} from 'react-icons/md';
import { getCreditAnalyses, updateCreditAnalysis } from '@/services/creditAnalysisService';
import type { CreditAnalysis } from '@/services/creditAnalysisService';
import { getCreditAnalysisSettings, type CreditAnalysisSettings } from '@/services/creditAnalysisSettingsService';
import {
  maskCPF,
  maskCNPJ,
  maskCelPhone,
  maskCurrencyReais,
  getNumericValue,
  validateEmail,
} from '@/utils/masks';
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageTitleContainer,
  PageTitle,
  PageSubtitle,
} from '@/styles/pages/PropertiesPageStyles';
import { ShimmerBase } from '@/components/common/Shimmer';

export const CreateRentalPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { properties, getProperties } = useProperties();
  const { hasPermission } = usePermissionsContext();
  const [loading, setLoading] = useState(false);
  const [loadingRental, setLoadingRental] = useState(false);
  const [searchingClient, setSearchingClient] = useState(false);
  const [searchingProperty, setSearchingProperty] = useState(false);
  const [hasCheckedPermissions, setHasCheckedPermissions] = useState(false);
  const hasLoadedRef = React.useRef(false);

  // Data mínima para validação (hoje)
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState<CreateRentalRequest>({
    tenantName: '',
    tenantDocument: '',
    tenantPhone: '',
    tenantEmail: '',
    startDate: '',
    endDate: '',
    monthlyValue: 0,
    dueDay: 5,
    propertyId: '',
    observations: '',
    depositValue: 0,
    autoGeneratePayments: true,
    sendBilletByEmail: false,
    checklistId: '',
    documentIds: [],
    lateFeePercent: undefined,
    interestPerMonthPercent: undefined,
  });

  // Estados para os valores formatados
  const [displayValues, setDisplayValues] = useState({
    document: '',
    phone: '',
    monthlyValue: '',
    depositValue: '',
  });

  // Estado para validação de email
  const [emailError, setEmailError] = useState('');

  // Listas para vincular checklist e documentos
  const [rentalChecklists, setRentalChecklists] = useState<Array<{ id: string; label: string }>>([]);
  const [companyDocuments, setCompanyDocuments] = useState<Array<{ id: string; originalName: string }>>([]);
  const [loadingChecklists, setLoadingChecklists] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [checklistSearch, setChecklistSearch] = useState('');
  const [documentSearch, setDocumentSearch] = useState('');
  const [creditAnalyses, setCreditAnalyses] = useState<CreditAnalysis[]>([]);
  const [selectedCreditAnalysisId, setSelectedCreditAnalysisId] = useState<string>('');
  const [loadingCreditAnalyses, setLoadingCreditAnalyses] = useState(false);
  const [creditAnalysisSettings, setCreditAnalysisSettings] = useState<CreditAnalysisSettings | null>(null);
  const [creditAnalysisCpfSearch, setCreditAnalysisCpfSearch] = useState('');
  const [rentalSettings, setRentalSettings] = useState<{ requireApprovalToCreateRental: boolean } | null>(null);

  const filteredChecklists = useMemo(() => {
    const q = checklistSearch.trim().toLowerCase();
    if (!q) return rentalChecklists;
    const filtered = rentalChecklists.filter(c => c.label.toLowerCase().includes(q));
    const selectedId = formData.checklistId;
    if (selectedId && !filtered.some(c => c.id === selectedId)) {
      const selected = rentalChecklists.find(c => c.id === selectedId);
      if (selected) return [selected, ...filtered];
    }
    return filtered;
  }, [rentalChecklists, checklistSearch, formData.checklistId]);

  const filteredDocuments = useMemo(() => {
    const q = documentSearch.trim().toLowerCase();
    if (!q) return companyDocuments;
    return companyDocuments.filter(d =>
      (d.originalName || '').toLowerCase().includes(q)
    );
  }, [companyDocuments, documentSearch]);

  const filteredCreditAnalyses = useMemo(() => {
    const cpfDigits = (creditAnalysisCpfSearch || '').replace(/\D/g, '');
    if (!cpfDigits) return creditAnalyses;
    return creditAnalyses.filter(a => {
      const analysisCpf = (a.analyzedCpf || '').replace(/\D/g, '');
      return analysisCpf.includes(cpfDigits);
    });
  }, [creditAnalyses, creditAnalysisCpfSearch]);

  const creditAnalysesSelectOptions = useMemo(() => {
    const list = filteredCreditAnalyses;
    const selected = selectedCreditAnalysisId
      ? creditAnalyses.find(a => a.id === selectedCreditAnalysisId)
      : null;
    if (selected && !list.some(a => a.id === selected.id)) {
      return [selected, ...list];
    }
    return list;
  }, [filteredCreditAnalyses, selectedCreditAnalysisId, creditAnalyses]);

  // Verificar permissões e carregar propriedades
  useEffect(() => {
    if (hasLoadedRef.current) return;

    const loadData = async () => {
      hasLoadedRef.current = true;
      // Verificar se pode vincular aluguel a propriedade
      const canLinkToProperty = canExecuteFunctionality(
        hasPermission,
        isEdit ? 'rental:update' : 'rental:create',
        isEdit ? 'alterar_propriedade_aluguel' : 'vincular_aluguel_propriedade'
      );

      // Só carregar propriedades se tiver permissão
      if (canLinkToProperty && (!properties || properties.length === 0)) {
        try {
          await getProperties({}, { page: 1, limit: 100 });
        } catch (error) {
          console.error('Erro ao carregar propriedades:', error);
          hasLoadedRef.current = false; // Permite tentar novamente
        }
      }
      // Carregar checklists tipo aluguel e documentos para vínculo opcional
      setLoadingChecklists(true);
      setLoadingDocuments(true);
      setLoadingCreditAnalyses(true);
      try {
        const [checklists, docRes, analysesRes, settingsRes, rentalSettingsRes] = await Promise.all([
          checklistService.getAll({ type: 'rental' as const, limit: 200 }),
          listDocuments({ page: 1, limit: 100 }),
          !isEdit ? getCreditAnalyses() : Promise.resolve([]),
          !isEdit ? getCreditAnalysisSettings() : Promise.resolve(null),
          !isEdit && hasPermission('rental:manage_workflows') ? rentalService.getSettings() : Promise.resolve(null),
        ]);
        setRentalChecklists(
          checklists.map(c => ({
            id: c.id,
            label: `${c.property?.title || 'Propriedade'} – ${c.client?.name || 'Cliente'} (${c.status})`,
          }))
        );
        setCompanyDocuments(
          (docRes.documents || []).map(d => ({ id: d.id, originalName: d.originalName || d.fileName }))
        );
        if (!isEdit && Array.isArray(analysesRes)) {
          setCreditAnalyses(analysesRes.filter((a: CreditAnalysis) => !a.rentalId));
        }
        if (!isEdit && settingsRes) {
          setCreditAnalysisSettings(settingsRes);
        }
        if (!isEdit && rentalSettingsRes) {
          setRentalSettings(rentalSettingsRes);
        }
      } catch (e) {
        console.error('Erro ao carregar checklists/documentos/análises:', e);
      } finally {
        setLoadingChecklists(false);
        setLoadingDocuments(false);
        setLoadingCreditAnalyses(false);
      }
      setHasCheckedPermissions(true);
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Executar apenas uma vez ao montar

  useEffect(() => {
    if (isEdit && hasCheckedPermissions) {
      loadRental();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit, hasCheckedPermissions]);

  // Desmarcar "Enviar boleto por email" quando não houver email do inquilino
  useEffect(() => {
    if (!formData.tenantEmail?.trim() && formData.sendBilletByEmail) {
      setFormData(prev => ({ ...prev, sendBilletByEmail: false }));
    }
  }, [formData.tenantEmail]);

  const loadRental = async () => {
    if (!id) return;
    setLoadingRental(true);
    try {
      const rental = await rentalService.getById(id);
      setFormData({
        tenantName: rental.tenantName,
        tenantDocument: rental.tenantDocument,
        tenantPhone: rental.tenantPhone || '',
        tenantEmail: rental.tenantEmail || '',
        startDate: rental.startDate.split('T')[0],
        endDate: rental.endDate.split('T')[0],
        monthlyValue: rental.monthlyValue,
        dueDay: rental.dueDay,
        propertyId: rental.propertyId,
        observations: rental.observations || '',
        depositValue: rental.depositValue || 0,
        autoGeneratePayments: rental.autoGeneratePayments,
        sendBilletByEmail: false,
        checklistId: rental.checklistId || '',
        documentIds: rental.documents?.map(d => d.id) || [],
        lateFeePercent: rental.lateFeePercent ?? undefined,
        interestPerMonthPercent: rental.interestPerMonthPercent ?? undefined,
      });

      // Formatar valores para exibição
      const doc = rental.tenantDocument;
      const cleanDoc = doc.replace(/\D/g, '');
      setDisplayValues({
        document: cleanDoc.length === 11 ? maskCPF(doc) : maskCNPJ(doc),
        phone: rental.tenantPhone ? maskCelPhone(rental.tenantPhone) : '',
        monthlyValue: maskCurrencyReais(String(rental.monthlyValue * 100)),
        depositValue: rental.depositValue
          ? maskCurrencyReais(String(rental.depositValue * 100))
          : '',
      });
    } catch {
      toast.error('Erro ao carregar aluguel');
      navigate('/rentals');
    } finally {
      setLoadingRental(false);
    }
  };

  const handleDocumentChange = (value: string) => {
    // Remove tudo que não é alfanumérico
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '');

    // Se tem letras, é CNPJ alfanumérico (independente do tamanho)
    const hasLetters = /[A-Za-z]/.test(cleaned);
    let formatted = '';

    if (hasLetters) {
      // CNPJ alfanumérico
      formatted = maskCNPJ(value);
    } else if (cleaned.length <= 11) {
      // CPF (só números, 11 dígitos)
      formatted = maskCPF(value);
    } else {
      // CNPJ numérico (só números, mais de 11 dígitos)
      formatted = maskCNPJ(value);
    }

    setDisplayValues(prev => ({ ...prev, document: formatted }));
    setFormData(prev => ({ ...prev, tenantDocument: cleaned }));
  };

  const handlePhoneChange = (value: string) => {
    const formatted = maskCelPhone(value);
    const cleanValue = value.replace(/\D/g, '');
    setDisplayValues(prev => ({ ...prev, phone: formatted }));
    setFormData(prev => ({ ...prev, tenantPhone: cleanValue }));
  };

  const handleMoneyChange = (
    value: string,
    field: 'monthlyValue' | 'depositValue'
  ) => {
    const formatted = maskCurrencyReais(value);
    const numericValue = getNumericValue(formatted) / 100;

    setDisplayValues(prev => ({ ...prev, [field]: formatted }));
    setFormData(prev => ({ ...prev, [field]: numericValue }));
  };

  const handleEmailChange = (value: string) => {
    setFormData(prev => ({ ...prev, tenantEmail: value }));

    // Validar email apenas se não estiver vazio
    if (value && !validateEmail(value)) {
      setEmailError('Email inválido');
    } else {
      setEmailError('');
    }
  };

  const handleSearchClient = async () => {
    const cpf = formData.tenantDocument.replace(/\D/g, '');
    if (!cpf || cpf.length < 11) {
      toast.error('Digite um CPF válido');
      return;
    }

    setSearchingClient(true);
    try {
      const data = await clientsApi.getClients({ document: cpf, limit: 10 });
      const list = Array.isArray(data) ? data : (data as any)?.data ?? [];
      if (list.length > 0) {
        const client = list[0];
        setFormData(prev => ({
          ...prev,
          tenantName: client.name || '',
          tenantEmail: client.email || '',
          tenantPhone: client.phone || '',
        }));
        setDisplayValues(prev => ({
          ...prev,
          phone: maskCelPhone(client.phone || ''),
        }));
        toast.success('Cliente encontrado!');
      } else {
        toast.error('Cliente não encontrado');
      }
    } catch (error) {
      toast.error('Erro ao buscar cliente');
    } finally {
      setSearchingClient(false);
    }
  };

  const handleSearchProperty = async (code: string) => {
    if (!code) {
      toast.error('Digite um código de imóvel');
      return;
    }

    setSearchingProperty(true);
    try {
      const response = await propertyApi.getProperties(
        { code: code.trim() },
        { page: 1, limit: 1 },
      );
      const property = response.data?.[0];
      if (property) {
        setFormData(prev => ({
          ...prev,
          propertyId: property.id,
          monthlyValue: Number(property.rentPrice) || 0,
        }));
        setDisplayValues(prev => ({
          ...prev,
          monthlyValue: maskCurrencyReais(
            String((Number(property.rentPrice) || 0) * 100),
          ),
        }));
        toast.success('Imóvel encontrado!');
      } else {
        toast.error('Imóvel não encontrado');
      }
    } catch (error) {
      toast.error('Erro ao buscar imóvel');
    } finally {
      setSearchingProperty(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.propertyId || !formData.startDate || !formData.endDate) {
      return;
    }
    setLoading(true);

    try {
      // Trava no front: verificar se o imóvel está disponível no período
      const { available } = await rentalService.checkAvailability(
        formData.propertyId,
        formData.startDate,
        formData.endDate,
        isEdit ? id ?? undefined : undefined,
      );
      if (!available) {
        toast.error(
          'Este imóvel já possui um aluguel no período informado. Escolha outras datas ou outro imóvel.'
        );
        setLoading(false);
        return;
      }

      // Regras de criação de aluguel (configurações de análise de crédito)
        if (!isEdit && creditAnalysisSettings) {
          const requireAnalysis = !!creditAnalysisSettings.requireCreditAnalysisToCreateRental;
          if (requireAnalysis && !selectedCreditAnalysisId) {
            toast.error('É obrigatório vincular uma análise de crédito para criar o aluguel.');
            setLoading(false);
            return;
          }
          if (selectedCreditAnalysisId) {
            const analysis = creditAnalyses.find(a => a.id === selectedCreditAnalysisId);
            if (analysis) {
              const recommendation = (analysis as any).approvalRecommendation ?? analysis.recommendation ?? '';
              if (!!creditAnalysisSettings.onlyAllowRentalIfAnalysisPositive && recommendation.toUpperCase() !== 'APPROVE') {
                toast.error('A configuração exige que a análise de crédito seja positiva (Aprovar) para criar o aluguel.');
                setLoading(false);
                return;
              }
              const minScore = creditAnalysisSettings.minScoreToAllowRental;
              if (minScore != null && minScore > 0 && (analysis.creditScore ?? 0) < minScore) {
                toast.error(`A configuração exige score mínimo de ${minScore} para criar o aluguel. Esta análise tem score ${analysis.creditScore ?? 0}.`);
                setLoading(false);
                return;
              }
            }
          }
        }

        const payload = { ...formData };
        if (!payload.checklistId) delete payload.checklistId;
        if (!payload.documentIds?.length) delete payload.documentIds;
        if (isEdit && id) {
          await rentalService.update(id, payload);
          toast.success('Aluguel atualizado com sucesso');
        } else {
          const newRental = await rentalService.create(payload);
          if (newRental.status === 'pending_approval') {
            toast.success('Aluguel enviado para aprovação. Um usuário com permissão "Gerenciar fluxos de locação" precisará confirmar.');
          } else if (selectedCreditAnalysisId) {
            try {
              await updateCreditAnalysis(selectedCreditAnalysisId, { rentalId: newRental.id });
              toast.success('Aluguel criado e análise de crédito vinculada com sucesso');
            } catch {
              toast.success('Aluguel criado com sucesso. Não foi possível vincular a análise de crédito.');
            }
          } else {
            toast.success('Aluguel criado com sucesso');
          }
        }
      navigate('/rentals');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao salvar aluguel');
    } finally {
      setLoading(false);
    }
  };

  if (isEdit && loadingRental) {
    return (
      <Layout>
        <PageContainer>
          <PageContent>
            <PageHeader>
              <PageTitleContainer>
                <CreateRentalShimmerTitle />
                <CreateRentalShimmerSubtitle />
              </PageTitleContainer>
              <BackButton onClick={() => navigate('/rentals')}>
                <MdArrowBack />
                Voltar
              </BackButton>
            </PageHeader>
            <FormCard as="div">
              <CreateRentalShimmerSection>
                <CreateRentalShimmerSectionTitle />
                <FormGrid style={{ marginTop: 16 }}>
                  {[1, 2, 3].map(i => (
                    <CreateRentalShimmerField key={i}>
                      <CreateRentalShimmerLabel />
                      <CreateRentalShimmerInput />
                    </CreateRentalShimmerField>
                  ))}
                </FormGrid>
              </CreateRentalShimmerSection>
              <CreateRentalShimmerSection>
                <CreateRentalShimmerSectionTitle $width="200px" />
                <FormGrid style={{ marginTop: 16 }}>
                  {[1, 2].map(i => (
                    <CreateRentalShimmerField key={i}>
                      <CreateRentalShimmerLabel />
                      <CreateRentalShimmerInput />
                    </CreateRentalShimmerField>
                  ))}
                </FormGrid>
              </CreateRentalShimmerSection>
              <CreateRentalShimmerSection>
                <CreateRentalShimmerSectionTitle $width="160px" />
                <FormGrid style={{ marginTop: 16 }}>
                  {[1, 2, 3, 4].map(i => (
                    <CreateRentalShimmerField key={i}>
                      <CreateRentalShimmerLabel />
                      <CreateRentalShimmerInput />
                    </CreateRentalShimmerField>
                  ))}
                </FormGrid>
              </CreateRentalShimmerSection>
            </FormCard>
          </PageContent>
        </PageContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageContainer>
        <PageContent>
          {/* Header */}
          <PageHeader>
            <PageTitleContainer>
              <PageTitle>
                {isEdit ? 'Editar Aluguel' : 'Novo Aluguel'}
              </PageTitle>
              <PageSubtitle>
                {isEdit
                  ? 'Atualize as informações do contrato de aluguel'
                  : 'Cadastre um novo contrato de aluguel'}
              </PageSubtitle>
            </PageTitleContainer>
            <BackButton onClick={() => navigate('/rentals')}>
              <MdArrowBack />
              Voltar
            </BackButton>
          </PageHeader>

          {!isEdit && rentalSettings?.requireApprovalToCreateRental && (
            <RentalSettingsApprovalAlert>
              <MdInfoOutline size={20} />
              <span>
                Conforme as <strong>Configurações de Locação</strong> da empresa, novos aluguéis serão criados como <strong>Aguardando aprovação</strong>. Um usuário com permissão &quot;Gerenciar fluxos de locação&quot; precisará confirmar para ativar o aluguel e gerar os boletos.
              </span>
            </RentalSettingsApprovalAlert>
          )}

          <FormCard onSubmit={handleSubmit}>
            {/* Dados do Inquilino */}
            <Section>
              <SectionHeader>
                <SectionIcon>
                  <MdPerson />
                </SectionIcon>
                <SectionTitle>Dados do Inquilino</SectionTitle>
              </SectionHeader>

              <SearchRow>
                <FormGroup style={{ flex: 1 }}>
                  <Label>
                    CPF/CNPJ do Inquilino <Required>*</Required>
                  </Label>
                  <Input
                    required
                    placeholder='000.000.000-00'
                    value={displayValues.document}
                    onChange={e => handleDocumentChange(e.target.value)}
                    maxLength={18}
                  />
                </FormGroup>
                <SearchButton
                  type="button"
                  onClick={handleSearchClient}
                  disabled={searchingClient}
                >
                  {searchingClient ? (
                    <>
                      <ButtonSpinner />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <MdSearch /> Buscar Cliente
                    </>
                  )}
                </SearchButton>
              </SearchRow>

              <FormGrid>
                <FormGroup>
                  <Label>
                    Nome Completo <Required>*</Required>
                  </Label>
                  <Input
                    required
                    placeholder='Digite o nome do inquilino'
                    value={formData.tenantName}
                    onChange={e =>
                      setFormData({ ...formData, tenantName: e.target.value })
                    }
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Telefone</Label>
                  <Input
                    type='tel'
                    placeholder='(00) 00000-0000'
                    value={displayValues.phone}
                    onChange={e => handlePhoneChange(e.target.value)}
                    maxLength={15}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Email</Label>
                  <Input
                    type='email'
                    placeholder='email@exemplo.com'
                    value={formData.tenantEmail}
                    onChange={e => handleEmailChange(e.target.value)}
                    $hasError={!!emailError}
                  />
                  {emailError && <ErrorText>{emailError}</ErrorText>}
                </FormGroup>
              </FormGrid>
            </Section>

            {/* Dados do Contrato */}
            <Section>
              <SectionHeader>
                <SectionIcon>
                  <MdHome />
                </SectionIcon>
                <SectionTitle>Dados do Contrato</SectionTitle>
              </SectionHeader>

              <SearchRow>
                <FormGroup style={{ flex: 1 }}>
                  <Label>Código do Imóvel</Label>
                  <Input
                    placeholder='Digite o código ou ID do imóvel'
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearchProperty((e.target as HTMLInputElement).value);
                      }
                    }}
                  />
                </FormGroup>
                <SearchButton
                  type="button"
                  onClick={e => {
                    const input = (e.currentTarget.previousElementSibling as HTMLDivElement)?.querySelector('input');
                    if (input) handleSearchProperty(input.value);
                  }}
                  disabled={searchingProperty}
                >
                  {searchingProperty ? (
                    <>
                      <ButtonSpinner />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <MdSearch /> Buscar Imóvel
                    </>
                  )}
                </SearchButton>
              </SearchRow>

              <FormGrid>
                <FormGroup>
                  <Label>
                    Propriedade <Required>*</Required>
                  </Label>
                  <Select
                    required
                    value={formData.propertyId}
                    onChange={e =>
                      setFormData({ ...formData, propertyId: e.target.value })
                    }
                  >
                    <option value=''>Selecione uma propriedade</option>
                    {properties.map(prop => (
                      <option key={prop.id} value={prop.id}>
                        {prop.title}
                      </option>
                    ))}
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>
                    Data de Início <Required>*</Required>
                  </Label>
                  <Input
                    type='date'
                    required
                    min={isEdit ? undefined : today}
                    value={formData.startDate}
                    onChange={e =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                  />
                  {!isEdit && (
                    <HintText>
                      Não é possível selecionar datas no passado
                    </HintText>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label>
                    Data de Término <Required>*</Required>
                  </Label>
                  <Input
                    type='date'
                    required
                    min={formData.startDate || today}
                    value={formData.endDate}
                    onChange={e =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                  />
                  <HintText>Deve ser posterior à data de início</HintText>
                </FormGroup>

                <FormGroup>
                  <Label>
                    Dia de Vencimento <Required>*</Required>
                  </Label>
                  <Input
                    type='number'
                    required
                    min='1'
                    max='31'
                    placeholder='5'
                    value={Number.isFinite(formData.dueDay) ? formData.dueDay : ''}
                    onChange={e => {
                      const n = parseInt(e.target.value, 10);
                      setFormData({
                        ...formData,
                        dueDay: Number.isFinite(n) && n >= 1 && n <= 31 ? n : 1,
                      });
                    }}
                  />
                  <HintText>
                    Dia do mês para vencimento das parcelas (1 a 31)
                  </HintText>
                </FormGroup>
              </FormGrid>
            </Section>

            {/* Valores */}
            <Section>
              <SectionHeader>
                <SectionIcon>
                  <MdAttachMoney />
                </SectionIcon>
                <SectionTitle>Valores</SectionTitle>
              </SectionHeader>

              <FormGrid>
                <FormGroup>
                  <Label>
                    Valor Mensal <Required>*</Required>
                  </Label>
                  <InputWithPrefix>
                    <Prefix>R$</Prefix>
                    <InputMoney
                      required
                      placeholder='0,00'
                      value={displayValues.monthlyValue}
                      onChange={e =>
                        handleMoneyChange(e.target.value, 'monthlyValue')
                      }
                    />
                  </InputWithPrefix>
                </FormGroup>

                <FormGroup>
                  <Label>Valor do Depósito/Caução</Label>
                  <InputWithPrefix>
                    <Prefix>R$</Prefix>
                    <InputMoney
                      placeholder='0,00'
                      value={displayValues.depositValue}
                      onChange={e =>
                        handleMoneyChange(e.target.value, 'depositValue')
                      }
                    />
                  </InputWithPrefix>
                  <HintText>Valor pago como garantia (opcional)</HintText>
                </FormGroup>
              </FormGrid>
            </Section>

            {/* Observações e Opções */}
            <Section>
              <FormGroup>
                <Label>Observações</Label>
                <TextArea
                  rows={4}
                  placeholder='Informações adicionais sobre o contrato...'
                  value={formData.observations}
                  onChange={e =>
                    setFormData({ ...formData, observations: e.target.value })
                  }
                />
              </FormGroup>

              <CheckboxContainer>
                <CheckboxLabel>
                  <Checkbox
                    type='checkbox'
                    checked={formData.autoGeneratePayments}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        autoGeneratePayments: e.target.checked,
                      })
                    }
                  />
                  <CheckboxText>
                    <strong>Gerar pagamentos automaticamente</strong>
                    <CheckboxHint>
                      Criar automaticamente as parcelas mensais com base no
                      período do contrato
                    </CheckboxHint>
                  </CheckboxText>
                </CheckboxLabel>
              </CheckboxContainer>

              {formData.tenantEmail?.trim() && (
                <CheckboxContainer>
                  <CheckboxLabel>
                    <Checkbox
                      type='checkbox'
                      checked={formData.sendBilletByEmail}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          sendBilletByEmail: e.target.checked,
                        })
                      }
                    />
                    <CheckboxText>
                      <strong>Enviar boleto por email</strong>
                      <CheckboxHint>
                        Enviar automaticamente o boleto para o email do inquilino ({formData.tenantEmail.trim()})
                      </CheckboxHint>
                    </CheckboxText>
                  </CheckboxLabel>
                </CheckboxContainer>
              )}

              <FormGrid style={{ marginTop: '1rem' }}>
                <FormGroup>
                  <Label>Multa (% em atraso) – opcional</Label>
                  <PercentInputWrap>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      max={100}
                      placeholder="Ex.: 2"
                      value={formData.lateFeePercent != null && Number.isFinite(formData.lateFeePercent) ? formData.lateFeePercent : ''}
                      onChange={e => {
                        const v = e.target.value;
                        if (v === '') {
                          setFormData({ ...formData, lateFeePercent: undefined });
                          return;
                        }
                        const num = parseFloat(v);
                        if (!Number.isFinite(num)) return;
                        const clamped = Math.min(100, Math.max(0, num));
                        setFormData({ ...formData, lateFeePercent: clamped });
                      }}
                    />
                    <PercentSuffix>%</PercentSuffix>
                  </PercentInputWrap>
                  <HintText>Percentual de multa sobre o valor da parcela para pagamento após o vencimento (ex.: 2 = 2%). Máx. 100%.</HintText>
                </FormGroup>
                <FormGroup>
                  <Label>Juros ao mês (% em atraso) – opcional</Label>
                  <PercentInputWrap>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      max={100}
                      placeholder="Ex.: 1"
                      value={formData.interestPerMonthPercent != null && Number.isFinite(formData.interestPerMonthPercent) ? formData.interestPerMonthPercent : ''}
                      onChange={e => {
                        const v = e.target.value;
                        if (v === '') {
                          setFormData({ ...formData, interestPerMonthPercent: undefined });
                          return;
                        }
                        const num = parseFloat(v);
                        if (!Number.isFinite(num)) return;
                        const clamped = Math.min(100, Math.max(0, num));
                        setFormData({ ...formData, interestPerMonthPercent: clamped });
                      }}
                    />
                    <PercentSuffix>%</PercentSuffix>
                  </PercentInputWrap>
                  <HintText>Percentual de juros ao mês sobre o valor da parcela para pagamento após o vencimento (ex.: 1 = 1% a.m.). Máx. 100%.</HintText>
                </FormGroup>
              </FormGrid>
            </Section>

            {/* Análise de Crédito – apenas na criação */}
            {!isEdit && (
              <Section>
                <SectionHeader>
                  <SectionIcon>
                    <MdAssessment />
                  </SectionIcon>
                  <SectionTitle>Análise de Crédito</SectionTitle>
                </SectionHeader>
                <FormGrid>
                  <FormGroup>
                    <Label>Vincular análise de crédito (opcional)</Label>
                    <Input
                      type="text"
                      placeholder="Buscar por CPF da análise..."
                      value={creditAnalysisCpfSearch}
                      onChange={e => setCreditAnalysisCpfSearch(maskCPF(e.target.value))}
                      maxLength={14}
                      style={{ marginBottom: 8 }}
                    />
                    <Select
                      value={selectedCreditAnalysisId}
                      onChange={e => setSelectedCreditAnalysisId(e.target.value)}
                      disabled={loadingCreditAnalyses}
                    >
                      <option value="">Nenhuma</option>
                      {creditAnalysesSelectOptions.map(a => (
                        <option key={a.id} value={a.id}>
                          {[
                            a.analyzedName || 'Sem nome',
                            a.analyzedCpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.***.***-$4'),
                            a.creditScore != null ? `Score ${a.creditScore}` : '',
                            a.status,
                          ]
                            .filter(Boolean)
                            .join(' – ')}
                        </option>
                      ))}
                    </Select>
                    <HintText>
                      Vincule uma análise de crédito já realizada a este aluguel. Use o CPF para filtrar. Só aparecem análises ainda não vinculadas.
                    </HintText>
                  </FormGroup>
                </FormGrid>
              </Section>
            )}

            {/* Checklist e Documentos */}
            <Section>
              <SectionHeader>
                <SectionIcon>
                  <MdChecklist />
                </SectionIcon>
                <SectionTitle>Checklist e Documentos</SectionTitle>
              </SectionHeader>
              <FormGrid>
                <FormGroup>
                  <Label>Checklist de aluguel (opcional)</Label>
                  {rentalChecklists.length > 3 && (
                    <Input
                      type='text'
                      placeholder='Buscar checklist por nome...'
                      value={checklistSearch}
                      onChange={e => setChecklistSearch(e.target.value)}
                      style={{ marginBottom: '0.5rem' }}
                    />
                  )}
                  <Select
                    value={formData.checklistId || ''}
                    onChange={e =>
                      setFormData({ ...formData, checklistId: e.target.value })
                    }
                    disabled={loadingChecklists}
                  >
                    <option value=''>Nenhum</option>
                    {filteredChecklists.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                    {filteredChecklists.length === 0 && rentalChecklists.length > 0 && (
                      <option value='' disabled>Nenhum resultado para &quot;{checklistSearch}&quot;</option>
                    )}
                  </Select>
                  <HintText>Vincule um checklist de tipo aluguel a esta locação</HintText>
                </FormGroup>
              </FormGrid>
              <FormGroup style={{ marginTop: '1rem' }}>
                <Label>Documentos da locação (opcional)</Label>
                {loadingDocuments ? (
                  <HintText>Carregando documentos...</HintText>
                ) : (
                  <>
                    {companyDocuments.length > 3 && (
                      <Input
                        type='text'
                        placeholder='Buscar documento por nome...'
                        value={documentSearch}
                        onChange={e => setDocumentSearch(e.target.value)}
                        style={{ marginBottom: '0.5rem' }}
                      />
                    )}
                    <DocCheckboxList>
                      {filteredDocuments.map(doc => (
                        <CheckboxLabel key={doc.id}>
                          <Checkbox
                            type='checkbox'
                            checked={(formData.documentIds || []).includes(doc.id)}
                            onChange={e => {
                              const ids = formData.documentIds || [];
                              const next = e.target.checked
                                ? [...ids, doc.id]
                                : ids.filter(id => id !== doc.id);
                              setFormData({ ...formData, documentIds: next });
                            }}
                          />
                          <CheckboxText>{doc.originalName}</CheckboxText>
                        </CheckboxLabel>
                      ))}
                      {filteredDocuments.length === 0 && companyDocuments.length > 0 && (
                        <HintText>Nenhum documento encontrado para &quot;{documentSearch}&quot;</HintText>
                      )}
                      {companyDocuments.length === 0 && (
                        <HintText>Nenhum documento cadastrado na empresa</HintText>
                      )}
                    </DocCheckboxList>
                  </>
                )}
              </FormGroup>
            </Section>

            {/* Ações */}
            <Actions>
              <CancelButton type='button' onClick={() => navigate('/rentals')}>
                Cancelar
              </CancelButton>
              <SaveButton type='submit' disabled={loading}>
                <MdSave />
                {loading
                  ? 'Salvando...'
                  : isEdit
                    ? 'Atualizar Aluguel'
                    : 'Criar Aluguel'}
              </SaveButton>
            </Actions>
          </FormCard>
        </PageContent>
      </PageContainer>
    </Layout>
  );
};

// Styled Components
const RentalSettingsApprovalAlert = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  margin-bottom: 20px;
  background: ${p => p.theme.colors?.warningBg ?? '#fef3c7'};
  border: 1px solid ${p => p.theme.colors?.warning ?? '#f59e0b'};
  border-radius: 8px;
  color: ${p => p.theme.colors?.text ?? '#111827'};
  font-size: 14px;
  line-height: 1.45;
  flex-shrink: 0;
  svg {
    color: ${p => p.theme.colors?.warning ?? '#f59e0b'};
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  background: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.hover};
    transform: translateX(-2px);
  }

  svg {
    font-size: 18px;
  }
`;

const FormCard = styled.form`
  /* Formulário sem card - campos soltos */
`;

/* Shimmer para edição de aluguel */
const CreateRentalShimmerTitle = styled(ShimmerBase)`
  width: 220px;
  height: 2.5rem;
  border-radius: 8px;
`;
const CreateRentalShimmerSubtitle = styled(ShimmerBase)`
  width: 320px;
  height: 1.25rem;
  border-radius: 6px;
  margin-top: 8px;
`;
const CreateRentalShimmerSection = styled.div`
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid ${props => props.theme.colors.border};
  &:last-child {
    border-bottom: none;
  }
`;
const CreateRentalShimmerSectionTitle = styled(ShimmerBase)`
  width: 180px;
  height: 22px;
  border-radius: 6px;
  margin-bottom: 16px;
`;
const CreateRentalShimmerField = styled.div`
  margin-bottom: 20px;
`;
const CreateRentalShimmerLabel = styled(ShimmerBase)`
  width: 100px;
  height: 14px;
  border-radius: 4px;
  margin-bottom: 8px;
`;
const CreateRentalShimmerInput = styled(ShimmerBase)`
  width: 100%;
  height: 44px;
  border-radius: 12px;
`;

const Section = styled.div`
  margin-bottom: 32px;

  &:last-of-type {
    margin-bottom: 24px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid ${props => props.theme.colors.border};
`;

const SectionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: ${props => props.theme.colors.primary}15;
  color: ${props => props.theme.colors.primary};
  border-radius: 10px;
  font-size: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SearchRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-end;
  margin-bottom: 20px;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const ButtonSpinner = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: white;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
  flex-shrink: 0;
`;

const SearchButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  height: 46px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.85;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    font-size: 18px;
  }
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const Required = styled.span`
  color: ${props => props.theme.colors.error};
`;

const Input = styled.input<{ $hasError?: boolean }>`
  padding: 12px 16px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  border: 1px solid
    ${props =>
      props.$hasError ? props.theme.colors.error : props.theme.colors.border};
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${props =>
      props.$hasError ? props.theme.colors.error : props.theme.colors.primary};
    box-shadow: 0 0 0 3px
      ${props =>
        props.$hasError
          ? props.theme.colors.error
          : props.theme.colors.primary}20;
  }

  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const PercentInputWrap = styled.div`
  display: flex;
  align-items: center;
  max-width: 140px;
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  transition: all 0.2s;

  &:focus-within {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }

  input {
    flex: 1;
    min-width: 0;
    border: none;
    border-radius: 12px 0 0 12px;
    padding-right: 8px;
    background: transparent;
  }
`;

const PercentSuffix = styled.span`
  padding: 12px 14px 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.textSecondary};
`;

const InputWithPrefix = styled.div`
  display: flex;
  align-items: center;
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  transition: all 0.2s;

  &:focus-within {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const Prefix = styled.span`
  padding: 12px 0 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.textSecondary};
`;

const InputMoney = styled.input`
  flex: 1;
  padding: 12px 16px 12px 8px;
  background: transparent;
  color: ${props => props.theme.colors.text};
  border: none;
  font-size: 14px;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const Select = styled.select`
  padding: 12px 16px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }

  option {
    background: ${props => props.theme.colors.cardBackground};
    color: ${props => props.theme.colors.text};
  }
`;

const TextArea = styled.textarea`
  padding: 12px 16px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }

  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const HintText = styled.span`
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
  margin-top: -4px;
`;

const ErrorText = styled.span`
  font-size: 12px;
  color: ${props => props.theme.colors.error};
  margin-top: -4px;
`;

const CheckboxContainer = styled.div`
  margin-top: 20px;
  padding: 16px;
  background: ${props => props.theme.colors.backgroundSecondary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  margin-top: 2px;
  cursor: pointer;
  accent-color: ${props => props.theme.colors.primary};
`;

const CheckboxText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  strong {
    font-size: 14px;
    font-weight: 600;
    color: ${props => props.theme.colors.text};
  }
`;

const CheckboxHint = styled.span`
  font-size: 13px;
  color: ${props => props.theme.colors.textSecondary};
`;

const DocCheckboxList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  padding: 8px 0;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const CancelButton = styled.button`
  padding: 14px 28px;
  background: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.hover};
  }
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: linear-gradient(
    135deg,
    ${props => props.theme.colors.primary} 0%,
    ${props => props.theme.colors.primaryDark} 100%
  );
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 15px ${props => props.theme.colors.primary}20;

  &:hover:not(:disabled) {
    box-shadow: 0 6px 20px ${props => props.theme.colors.primary}30;
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  svg {
    font-size: 18px;
  }
`;

export default CreateRentalPage;
