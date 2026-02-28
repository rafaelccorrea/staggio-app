import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { MdArrowBack, MdSave, MdRefresh } from 'react-icons/md';
import { NumericFormat } from 'react-number-format';
import {
  useClients,
  MaritalStatus,
  EmploymentStatus,
} from '../hooks/useClients';
import { useSpouse } from '../hooks/useSpouse';
import { useStatesCities } from '../hooks/useStatesCities';
import { useUsers } from '../hooks/useUsers';
import { useAuth } from '../hooks/useAuth';
import {
  CLIENT_TYPE_LABELS,
  CLIENT_STATUS_LABELS,
  CLIENT_SOURCE_LABELS,
} from '../types/client';
import {
  MARITAL_STATUS_LABELS,
  EMPLOYMENT_STATUS_LABELS,
  CONTRACT_TYPE_OPTIONS,
  ACCOUNT_TYPE_OPTIONS,
} from '../types/client';
import {
  validateEmail,
  maskPhoneAuto,
  maskCPF,
  maskRG,
  maskCEP,
  validateCreditScore,
} from '../utils/masks';
import { SpouseForm } from '../components/modals/SpouseForm';
import { DesiredFeaturesInput } from '../components/common/DesiredFeaturesInput';
import type { DesiredFeatures } from '../types/match';
import { Layout } from '../components/layout/Layout';
import { toast } from 'react-toastify';
import { ClientFormShimmer } from '../components/shimmer/ClientFormShimmer';
import { clientsApi } from '../services/clientsApi';
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageTitleContainer,
  PageTitle,
  PageSubtitle,
  BackButton,
  FormContainer,
  Section,
  SectionHeader,
  SectionTitle,
  SectionDescription,
  FieldContainer,
  FieldLabel,
  RequiredIndicator,
  FieldInput,
  FieldSelect,
  FieldTextarea,
  FieldContainerWithError,
  ErrorMessage,
  RowContainer,
  CheckboxContainer,
  Checkbox,
  CheckboxLabel,
  FormActions,
  Button,
  LoadingIndicator,
} from '../styles/pages/ClientFormPageStyles';

const ClientFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isEditing = !!id;
  const isNewTenant = !isEditing && searchParams.get('type') === 'renter';

  const { createClient, updateClient } = useClients();
  const { createSpouse, updateSpouse, deleteSpouse } = useSpouse();
  const { getCurrentUser } = useAuth();
  const { users, getUsers } = useUsers();
  const {
    states,
    cities,
    selectedState,
    selectedCity,
    loadingStates,
    loadingCities,
    setSelectedState,
    setSelectedCity,
    getCityDisplayName,
  } = useStatesCities();

  const [formData, setFormData] = useState<any>({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    secondaryPhone: '',
    whatsapp: '',
    birthDate: '',
    anniversaryDate: '',
    rg: '',
    zipCode: '',
    address: '',
    city: '',
    state: '',
    neighborhood: '',
    type: searchParams.get('type') === 'renter' ? 'renter' : 'general',
    status: 'active',
    leadSource: '',
    maritalStatus: '',
    hasDependents: false,
    numberOfDependents: '',
    dependentsNotes: '',
    employmentStatus: '',
    companyName: '',
    jobPosition: '',
    jobStartDate: '',
    jobEndDate: '',
    isCurrentlyWorking: true,
    companyTimeMonths: '',
    contractType: '',
    isRetired: false,
    monthlyIncome: '',
    grossSalary: '',
    netSalary: '',
    thirteenthSalary: '',
    vacationPay: '',
    otherIncomeSources: '',
    otherIncomeAmount: '',
    familyIncome: '',
    creditScore: '',
    lastCreditCheck: '',
    bankName: '',
    bankAgency: '',
    accountType: '',
    hasProperty: false,
    hasVehicle: false,
    referenceName: '',
    referencePhone: '',
    referenceRelationship: '',
    professionalReferenceName: '',
    professionalReferencePhone: '',
    professionalReferencePosition: '',
    incomeRange: '',
    loanRange: '',
    priceRange: '',
    preferences: '',
    notes: '',
    preferredContactMethod: '',
    preferredPropertyType: '',
    preferredCity: '',
    preferredNeighborhood: '',
    minArea: '',
    maxArea: '',
    minBedrooms: '',
    maxBedrooms: '',
    minBathrooms: '',
    minValue: '',
    maxValue: '',
    desiredFeatures: {},
    // Campos MCMV
    mcmvInterested: false,
    mcmvEligible: false,
    mcmvIncomeRange: '',
    mcmvCadunicoNumber: '',
    mcmvPreRegistrationDate: '',
    // Captador
    capturedById: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);
  const [cepTimeout, setCepTimeout] = useState<NodeJS.Timeout | null>(null);
  const [client, setClient] = useState<any>(null);
  const [isLoadingClient, setIsLoadingClient] = useState(false);
  const [hasLoadedData, setHasLoadedData] = useState(false);

  const loadClientData = useCallback(async () => {
    if (isEditing && id && !hasLoadedData) {
      try {
        setIsLoadingClient(true);
        // Buscar dados completos do cliente via API
        const foundClient = await clientsApi.getClient(id);

        if (foundClient) {
          setClient(foundClient);
          setHasLoadedData(true);

          // Formatar data de pré-cadastro MCMV se existir
          let mcmvPreRegistrationDateFormatted = '';
          if (foundClient.mcmvPreRegistrationDate) {
            const date = new Date(foundClient.mcmvPreRegistrationDate);
            mcmvPreRegistrationDateFormatted = date.toISOString().split('T')[0];
          }

          setFormData({
            name: foundClient.name || '',
            email: foundClient.email || '',
            cpf: foundClient.cpf ? maskCPF(foundClient.cpf) : '',
            phone: foundClient.phone ? maskPhoneAuto(foundClient.phone) : '',
            secondaryPhone: foundClient.secondaryPhone
              ? maskPhoneAuto(foundClient.secondaryPhone)
              : '',
            whatsapp: foundClient.whatsapp
              ? maskPhoneAuto(foundClient.whatsapp)
              : '',
            birthDate: foundClient.birthDate || '',
            anniversaryDate: foundClient.anniversaryDate || '',
            rg: foundClient.rg ? maskRG(foundClient.rg) : '',
            zipCode: foundClient.zipCode ? maskCEP(foundClient.zipCode) : '',
            address: foundClient.address || '',
            city: foundClient.city || '',
            state: foundClient.state || '',
            neighborhood: foundClient.neighborhood || '',
            type: foundClient.type || 'general',
            status: foundClient.status || 'active',
            leadSource: foundClient.leadSource || '',
            maritalStatus: foundClient.maritalStatus || '',
            hasDependents: foundClient.hasDependents || false,
            numberOfDependents: foundClient.numberOfDependents
              ? String(foundClient.numberOfDependents)
              : '',
            dependentsNotes: foundClient.dependentsNotes || '',
            employmentStatus: foundClient.employmentStatus || '',
            companyName: foundClient.companyName || '',
            jobPosition: foundClient.jobPosition || '',
            jobStartDate: foundClient.jobStartDate || '',
            jobEndDate: foundClient.jobEndDate || '',
            isCurrentlyWorking: foundClient.isCurrentlyWorking ?? true,
            companyTimeMonths: foundClient.companyTimeMonths
              ? String(foundClient.companyTimeMonths)
              : '',
            contractType: foundClient.contractType || '',
            isRetired: foundClient.isRetired || false,
            monthlyIncome: foundClient.monthlyIncome
              ? String(foundClient.monthlyIncome)
              : '',
            grossSalary: foundClient.grossSalary
              ? String(foundClient.grossSalary)
              : '',
            netSalary: foundClient.netSalary
              ? String(foundClient.netSalary)
              : '',
            thirteenthSalary: foundClient.thirteenthSalary
              ? String(foundClient.thirteenthSalary)
              : '',
            vacationPay: foundClient.vacationPay
              ? String(foundClient.vacationPay)
              : '',
            otherIncomeSources: foundClient.otherIncomeSources || '',
            otherIncomeAmount: foundClient.otherIncomeAmount
              ? String(foundClient.otherIncomeAmount)
              : '',
            familyIncome: foundClient.familyIncome
              ? String(foundClient.familyIncome)
              : '',
            creditScore: foundClient.creditScore
              ? String(foundClient.creditScore)
              : '',
            lastCreditCheck: foundClient.lastCreditCheck || '',
            bankName: foundClient.bankName || '',
            bankAgency: foundClient.bankAgency || '',
            accountType: foundClient.accountType || '',
            hasProperty: foundClient.hasProperty || false,
            hasVehicle: foundClient.hasVehicle || false,
            referenceName: foundClient.referenceName || '',
            referencePhone: foundClient.referencePhone || '',
            referenceRelationship: foundClient.referenceRelationship || '',
            professionalReferenceName:
              foundClient.professionalReferenceName || '',
            professionalReferencePhone:
              foundClient.professionalReferencePhone || '',
            professionalReferencePosition:
              foundClient.professionalReferencePosition || '',
            incomeRange: foundClient.incomeRange
              ? String(foundClient.incomeRange)
              : '',
            loanRange: foundClient.loanRange
              ? String(foundClient.loanRange)
              : '',
            priceRange: foundClient.priceRange
              ? String(foundClient.priceRange)
              : '',
            preferences: foundClient.preferences || '',
            notes: foundClient.notes || '',
            preferredContactMethod: foundClient.preferredContactMethod || '',
            preferredPropertyType: foundClient.preferredPropertyType || '',
            preferredCity: foundClient.preferredCity || '',
            preferredNeighborhood: foundClient.preferredNeighborhood || '',
            minArea: foundClient.minArea ? String(foundClient.minArea) : '',
            maxArea: foundClient.maxArea ? String(foundClient.maxArea) : '',
            minBedrooms: foundClient.minBedrooms
              ? String(foundClient.minBedrooms)
              : '',
            maxBedrooms: foundClient.maxBedrooms
              ? String(foundClient.maxBedrooms)
              : '',
            minBathrooms: foundClient.minBathrooms
              ? String(foundClient.minBathrooms)
              : '',
            minValue: foundClient.minValue ? String(foundClient.minValue) : '',
            maxValue: foundClient.maxValue ? String(foundClient.maxValue) : '',
            desiredFeatures: foundClient.desiredFeatures || {},
            // Campos MCMV
            mcmvInterested: foundClient.mcmvInterested || false,
            mcmvEligible: foundClient.mcmvEligible || false,
            mcmvIncomeRange: foundClient.mcmvIncomeRange || '',
            mcmvCadunicoNumber: foundClient.mcmvCadunicoNumber || '',
            mcmvPreRegistrationDate: mcmvPreRegistrationDateFormatted,
            // Captador - usar usuário atual como fallback para clientes antigos sem capturedById
            capturedById:
              foundClient.capturedById || getCurrentUser()?.id || '',
          });

          // Se o cliente não tinha capturedById, garantir que está preenchido
          if (!foundClient.capturedById) {
            const currentUser = getCurrentUser();
            if (currentUser?.id) {
              setFormData(prev => ({
                ...prev,
                capturedById: currentUser.id,
              }));
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do cliente:', error);
        toast.error('Erro ao carregar dados do cliente');
      } finally {
        setIsLoadingClient(false);
      }
    }
  }, [isEditing, id, hasLoadedData]);

  // Inicializar capturedById com o usuário atual
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser?.id && !formData.capturedById && !isEditing) {
      setFormData(prev => ({
        ...prev,
        capturedById: currentUser.id,
      }));
    }
  }, [getCurrentUser, isEditing]);

  // Carregar lista de usuários
  useEffect(() => {
    getUsers({ page: 1, limit: 100 });
  }, [getUsers]);

  useEffect(() => {
    setHasLoadedData(false); // Reset ao mudar de cliente
    loadClientData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditing]); // Carrega apenas quando o ID muda (ao abrir a página de edição)

  useEffect(() => {
    return () => {
      if (cepTimeout) {
        clearTimeout(cepTimeout);
      }
    };
  }, [cepTimeout]);

  useEffect(() => {
    if (client && client.preferredCity) {
      const cityParts = client.preferredCity.split(' - ');
      if (cityParts.length === 2) {
        const cityName = cityParts[0];
        const stateSigla = cityParts[1];

        const state = states.find(s => s.sigla === stateSigla);
        if (state) {
          setSelectedState(state);

          setTimeout(() => {
            const city = cities.find(c => c.nome === cityName);
            if (city) {
              setSelectedCity(city);
            }
          }, 1000);
        }
      }
    }
  }, [client, states, cities, setSelectedState, setSelectedCity]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.cpf.trim()) newErrors.cpf = 'CPF é obrigatório';
    if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatório';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'CEP é obrigatório';
    if (!formData.address.trim()) newErrors.address = 'Endereço é obrigatório';
    if (!formData.city.trim()) newErrors.city = 'Cidade é obrigatória';
    if (!formData.state.trim()) newErrors.state = 'Estado é obrigatório';
    if (!formData.neighborhood.trim())
      newErrors.neighborhood = 'Bairro é obrigatório';

    if (formData.creditScore) {
      const score = parseFloat(formData.creditScore.toString());
      if (!validateCreditScore(score)) {
        newErrors.creditScore = 'Score de crédito deve estar entre 0 e 1000';
      }
    }

    // Regras solicitadas:
    // 1) Se houver renda, exigir profissão (situação profissional) ou marcar aposentado(a)
    const hasAnyIncome = Boolean(
      formData.monthlyIncome ||
        formData.familyIncome ||
        formData.grossSalary ||
        formData.netSalary ||
        formData.otherIncomeAmount
    );
    if (hasAnyIncome && !formData.employmentStatus && !formData.isRetired) {
      newErrors.employmentStatus =
        'Informe a situação profissional ou marque que é aposentado(a)';
    }

    // 2) Se informou profissão com trabalho (empregado/autônomo) e houver renda, exigir cargo/função
    const isWorkingStatus =
      formData.employmentStatus === EmploymentStatus.EMPLOYED ||
      formData.employmentStatus === EmploymentStatus.SELF_EMPLOYED;
    if (
      hasAnyIncome &&
      isWorkingStatus &&
      !String(formData.jobPosition || '').trim()
    ) {
      newErrors.jobPosition = 'Informe o cargo/função';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchAddressByCEP = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length !== 8) return;

    setIsLoadingCEP(true);

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCEP}/json/`
      );
      const data = await response.json();

      if (!data.erro) {
        setFormData((prev: any) => ({
          ...prev,
          address: data.logradouro || '',
          neighborhood: data.bairro || '',
          city: data.localidade || '',
          state: data.uf || '',
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setIsLoadingCEP(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }

    if (field === 'zipCode' && value) {
      if (cepTimeout) clearTimeout(cepTimeout);
      const timeout = setTimeout(() => fetchAddressByCEP(value), 500);
      setCepTimeout(timeout);
    }
  };

  const sanitizeFormData = (data: any) => {
    const cleaned: any = {};

    // Lista de campos obrigatórios que sempre devem ser incluídos
    const requiredFields = [
      'type',
      'status',
      'name',
      'email',
      'cpf',
      'phone',
      'zipCode',
      'city',
      'state',
      'neighborhood',
      'address',
    ];

    // Campos booleanos que devem sempre ser incluídos (mesmo que false)
    const booleanFields = [
      'mcmvInterested',
      'mcmvEligible',
      'hasDependents',
      'isCurrentlyWorking',
      'isRetired',
      'hasProperty',
      'hasVehicle',
    ];

    // Iterar sobre todas as chaves do formData
    Object.keys(data).forEach(key => {
      const value = data[key];

      // Sempre incluir campos obrigatórios (mesmo que vazios ou com valores padrão)
      if (requiredFields.includes(key)) {
        cleaned[key] = value;
        return;
      }

      // Sempre incluir campos booleanos (mesmo que false)
      if (booleanFields.includes(key)) {
        cleaned[key] = value === true || value === 'true';
        return;
      }

      // Incluir apenas valores não vazios
      if (value !== '' && value !== null && value !== undefined) {
        // Se for boolean false, incluir
        if (typeof value === 'boolean') {
          cleaned[key] = value;
        }
        // Se for string, verificar se não está vazia após trim
        else if (typeof value === 'string' && value.trim() !== '') {
          cleaned[key] = value;
        }
        // Se for number, incluir
        else if (typeof value === 'number') {
          cleaned[key] = value;
        }
        // Para arrays e objetos, incluir se tiver conteúdo
        else if (Array.isArray(value) && value.length > 0) {
          cleaned[key] = value;
        } else if (typeof value === 'object' && Object.keys(value).length > 0) {
          cleaned[key] = value;
        }
      }
    });

    return cleaned;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);

    try {
      // Sanitizar dados antes de enviar
      const cleanedData = sanitizeFormData(formData);

      const getClientErrorMessage = (error: any) =>
        error?.response?.data?.message ||
        error?.message ||
        'Erro ao salvar cliente';

      const submissionPromise =
        isEditing && id
          ? updateClient(id, cleanedData)
          : createClient(cleanedData);

      await toast.promise(submissionPromise, {
        pending: isEditing ? 'Atualizando cliente...' : 'Criando cliente...',
        success: isEditing
          ? 'Cliente atualizado com sucesso!'
          : 'Cliente criado com sucesso!',
        error: {
          render({ data }) {
            return getClientErrorMessage(data);
          },
        },
      });
      navigate(formData.type === 'renter' ? '/clients?type=renter' : '/clients');
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSpouseSave = async (spouseData: any) => {
    if (!client?.id) return;
    if (client.spouse?.id) {
      await updateSpouse(client.spouse.id, spouseData);
    } else {
      await createSpouse(client.id, spouseData);
    }
  };

  const handleSpouseDelete = async (spouseId: string) => {
    await deleteSpouse(spouseId);
  };

  const shouldShowSpouse =
    formData.maritalStatus === MaritalStatus.MARRIED ||
    formData.maritalStatus === MaritalStatus.COMMON_LAW;
  const shouldShowDependentsDetails = formData.hasDependents;
  const shouldShowEmploymentFields =
    formData.employmentStatus === EmploymentStatus.EMPLOYED ||
    formData.employmentStatus === EmploymentStatus.SELF_EMPLOYED;
  const shouldShowJobEndDate = !formData.isCurrentlyWorking;

  const isFormLoading = isEditing && (isLoadingClient || !hasLoadedData);

  if (isFormLoading) {
    return (
      <Layout>
        <ClientFormShimmer />
      </Layout>
    );
  }

  return (
    <Layout>
      <PageContainer>
        <PageContent>
          <>
            <PageHeader>
              <PageTitleContainer>
                <PageTitle>
                  {isEditing
                    ? formData.type === 'renter'
                      ? 'Editar Inquilino'
                      : 'Editar Cliente'
                    : isNewTenant
                      ? 'Novo Inquilino'
                      : 'Novo Cliente'}
                </PageTitle>
                <PageSubtitle>
                  {isEditing
                    ? formData.type === 'renter'
                      ? 'Atualize as informações do inquilino'
                      : 'Atualize as informações do cliente'
                    : isNewTenant
                      ? 'Preencha os dados para cadastrar um novo inquilino'
                      : 'Preencha os dados para cadastrar um novo cliente'}
                </PageSubtitle>
              </PageTitleContainer>
              <BackButton
                onClick={() =>
                  navigate(
                    isNewTenant || formData.type === 'renter'
                      ? '/clients?type=renter'
                      : '/clients'
                  )
                }
              >
                <MdArrowBack />
                Voltar
              </BackButton>
            </PageHeader>

            <FormContainer onSubmit={handleSubmit}>
              {/* Dados Básicos */}
              <Section>
                <SectionHeader>
                  <SectionTitle>👤 Dados Básicos</SectionTitle>
                  <SectionDescription>
                    Informações essenciais do cliente
                  </SectionDescription>
                </SectionHeader>

                <FieldContainerWithError>
                  <FieldLabel>
                    Nome Completo <RequiredIndicator>*</RequiredIndicator>
                  </FieldLabel>
                  <FieldInput
                    type='text'
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    placeholder='Digite o nome completo...'
                    $hasError={!!errors.name}
                  />
                  {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
                </FieldContainerWithError>

                <RowContainer>
                  <FieldContainerWithError>
                    <FieldLabel>
                      Email <RequiredIndicator>*</RequiredIndicator>
                    </FieldLabel>
                    <FieldInput
                      type='email'
                      value={formData.email}
                      onChange={e => handleInputChange('email', e.target.value)}
                      placeholder='email@exemplo.com'
                      $hasError={!!errors.email}
                    />
                    {errors.email && (
                      <ErrorMessage>{errors.email}</ErrorMessage>
                    )}
                  </FieldContainerWithError>

                  <FieldContainerWithError>
                    <FieldLabel>
                      CPF <RequiredIndicator>*</RequiredIndicator>
                    </FieldLabel>
                    <FieldInput
                      type='text'
                      value={formData.cpf}
                      onChange={e =>
                        handleInputChange('cpf', maskCPF(e.target.value))
                      }
                      placeholder='000.000.000-00'
                      maxLength={14}
                      $hasError={!!errors.cpf}
                    />
                    {errors.cpf && <ErrorMessage>{errors.cpf}</ErrorMessage>}
                  </FieldContainerWithError>
                </RowContainer>

                <RowContainer>
                  <FieldContainer>
                    <FieldLabel>RG</FieldLabel>
                    <FieldInput
                      type='text'
                      value={formData.rg}
                      onChange={e =>
                        handleInputChange('rg', maskRG(e.target.value))
                      }
                      placeholder='00.000.000-0'
                      maxLength={12}
                    />
                  </FieldContainer>

                  <FieldContainer>
                    <FieldLabel>Data de Nascimento</FieldLabel>
                    <FieldInput
                      type='date'
                      value={formData.birthDate}
                      onChange={e =>
                        handleInputChange('birthDate', e.target.value)
                      }
                    />
                  </FieldContainer>
                </RowContainer>

                <RowContainer>
                  <FieldContainer>
                    <FieldLabel>
                      Tipo <RequiredIndicator>*</RequiredIndicator>
                    </FieldLabel>
                    <FieldSelect
                      value={formData.type}
                      onChange={e => handleInputChange('type', e.target.value)}
                    >
                      {Object.entries(CLIENT_TYPE_LABELS).map(
                        ([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        )
                      )}
                    </FieldSelect>
                  </FieldContainer>

                  <FieldContainer>
                    <FieldLabel>
                      Status <RequiredIndicator>*</RequiredIndicator>
                    </FieldLabel>
                    <FieldSelect
                      value={formData.status}
                      onChange={e =>
                        handleInputChange('status', e.target.value)
                      }
                    >
                      {Object.entries(CLIENT_STATUS_LABELS).map(
                        ([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        )
                      )}
                    </FieldSelect>
                  </FieldContainer>
                </RowContainer>

                <FieldContainer>
                  <FieldLabel>Origem do Lead</FieldLabel>
                  <FieldSelect
                    value={formData.leadSource}
                    onChange={e =>
                      handleInputChange('leadSource', e.target.value)
                    }
                  >
                    <option value=''>Selecione...</option>
                    {Object.entries(CLIENT_SOURCE_LABELS).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      )
                    )}
                  </FieldSelect>
                </FieldContainer>

                <FieldContainer>
                  <FieldLabel>
                    Captador
                    <RequiredIndicator>*</RequiredIndicator>
                  </FieldLabel>
                  <FieldSelect
                    value={formData.capturedById}
                    onChange={e =>
                      handleInputChange('capturedById', e.target.value)
                    }
                    required
                  >
                    <option value=''>Selecione o captador</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} {user.email ? `(${user.email})` : ''}
                      </option>
                    ))}
                  </FieldSelect>
                  <small
                    style={{
                      color: 'var(--color-text-secondary)',
                      marginTop: '4px',
                      display: 'block',
                    }}
                  >
                    Usuário responsável por capturar/cadastrar este cliente
                  </small>
                </FieldContainer>
              </Section>

              {/* Contatos */}
              <Section>
                <SectionHeader>
                  <SectionTitle>📞 Contatos</SectionTitle>
                  <SectionDescription>
                    Formas de contato com o cliente
                  </SectionDescription>
                </SectionHeader>

                <FieldContainerWithError>
                  <FieldLabel>
                    Telefone Principal <RequiredIndicator>*</RequiredIndicator>
                  </FieldLabel>
                  <FieldInput
                    type='tel'
                    value={formData.phone}
                    onChange={e =>
                      handleInputChange('phone', maskPhoneAuto(e.target.value))
                    }
                    placeholder='(11) 99999-9999'
                    maxLength={15}
                    $hasError={!!errors.phone}
                  />
                  {errors.phone && <ErrorMessage>{errors.phone}</ErrorMessage>}
                </FieldContainerWithError>

                <RowContainer>
                  <FieldContainer>
                    <FieldLabel>Telefone Secundário</FieldLabel>
                    <FieldInput
                      type='tel'
                      value={formData.secondaryPhone}
                      onChange={e =>
                        handleInputChange(
                          'secondaryPhone',
                          maskPhoneAuto(e.target.value)
                        )
                      }
                      placeholder='(11) 99999-9999'
                      maxLength={15}
                    />
                  </FieldContainer>

                  <FieldContainer>
                    <FieldLabel>WhatsApp</FieldLabel>
                    <FieldInput
                      type='tel'
                      value={formData.whatsapp}
                      onChange={e =>
                        handleInputChange(
                          'whatsapp',
                          maskPhoneAuto(e.target.value)
                        )
                      }
                      placeholder='(11) 99999-9999'
                      maxLength={15}
                    />
                  </FieldContainer>
                </RowContainer>
              </Section>

              {/* Endereço */}
              <Section>
                <SectionHeader>
                  <SectionTitle>📍 Endereço</SectionTitle>
                  <SectionDescription>
                    Localização do cliente
                  </SectionDescription>
                </SectionHeader>

                <RowContainer>
                  <FieldContainerWithError>
                    <FieldLabel>
                      CEP <RequiredIndicator>*</RequiredIndicator>
                      {isLoadingCEP && (
                        <LoadingIndicator>
                          <MdRefresh size={14} />
                          Buscando...
                        </LoadingIndicator>
                      )}
                    </FieldLabel>
                    <FieldInput
                      type='text'
                      value={formData.zipCode}
                      onChange={e =>
                        handleInputChange('zipCode', maskCEP(e.target.value))
                      }
                      placeholder='00000-000'
                      maxLength={9}
                      $hasError={!!errors.zipCode}
                      disabled={isLoadingCEP}
                    />
                    {errors.zipCode && (
                      <ErrorMessage>{errors.zipCode}</ErrorMessage>
                    )}
                  </FieldContainerWithError>

                  <FieldContainerWithError>
                    <FieldLabel>
                      Estado <RequiredIndicator>*</RequiredIndicator>
                    </FieldLabel>
                    <FieldInput
                      type='text'
                      value={formData.state}
                      onChange={e =>
                        handleInputChange('state', e.target.value.toUpperCase())
                      }
                      placeholder='SP'
                      maxLength={2}
                      $hasError={!!errors.state}
                    />
                    {errors.state && (
                      <ErrorMessage>{errors.state}</ErrorMessage>
                    )}
                  </FieldContainerWithError>
                </RowContainer>

                <RowContainer>
                  <FieldContainerWithError>
                    <FieldLabel>
                      Cidade <RequiredIndicator>*</RequiredIndicator>
                    </FieldLabel>
                    <FieldInput
                      type='text'
                      value={formData.city}
                      onChange={e => handleInputChange('city', e.target.value)}
                      placeholder='São Paulo'
                      $hasError={!!errors.city}
                    />
                    {errors.city && <ErrorMessage>{errors.city}</ErrorMessage>}
                  </FieldContainerWithError>

                  <FieldContainerWithError>
                    <FieldLabel>
                      Bairro <RequiredIndicator>*</RequiredIndicator>
                    </FieldLabel>
                    <FieldInput
                      type='text'
                      value={formData.neighborhood}
                      onChange={e =>
                        handleInputChange('neighborhood', e.target.value)
                      }
                      placeholder='Centro'
                      $hasError={!!errors.neighborhood}
                    />
                    {errors.neighborhood && (
                      <ErrorMessage>{errors.neighborhood}</ErrorMessage>
                    )}
                  </FieldContainerWithError>
                </RowContainer>

                <FieldContainerWithError>
                  <FieldLabel>
                    Endereço Completo <RequiredIndicator>*</RequiredIndicator>
                  </FieldLabel>
                  <FieldInput
                    type='text'
                    value={formData.address}
                    onChange={e => handleInputChange('address', e.target.value)}
                    placeholder='Rua das Flores, 123, Apto 45'
                    $hasError={!!errors.address}
                  />
                  {errors.address && (
                    <ErrorMessage>{errors.address}</ErrorMessage>
                  )}
                </FieldContainerWithError>
              </Section>

              {/* Situação Pessoal */}
              <Section>
                <SectionHeader>
                  <SectionTitle>💍 Situação Pessoal</SectionTitle>
                  <SectionDescription>
                    Estado civil e dependentes
                  </SectionDescription>
                </SectionHeader>

                <FieldContainer>
                  <FieldLabel>Estado Civil</FieldLabel>
                  <FieldSelect
                    value={formData.maritalStatus}
                    onChange={e =>
                      handleInputChange('maritalStatus', e.target.value)
                    }
                  >
                    <option value=''>Selecione...</option>
                    {Object.entries(MARITAL_STATUS_LABELS).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      )
                    )}
                  </FieldSelect>
                </FieldContainer>

                <CheckboxContainer>
                  <Checkbox
                    type='checkbox'
                    id='hasDependents'
                    checked={formData.hasDependents}
                    onChange={e =>
                      handleInputChange('hasDependents', e.target.checked)
                    }
                  />
                  <CheckboxLabel htmlFor='hasDependents'>
                    Possui dependentes
                  </CheckboxLabel>
                </CheckboxContainer>

                {shouldShowDependentsDetails && (
                  <>
                    <FieldContainer>
                      <FieldLabel>Número de Dependentes</FieldLabel>
                      <FieldInput
                        type='number'
                        min='0'
                        value={formData.numberOfDependents}
                        onChange={e =>
                          handleInputChange(
                            'numberOfDependents',
                            e.target.value
                          )
                        }
                        placeholder='Quantos dependentes?'
                      />
                    </FieldContainer>

                    <FieldContainer>
                      <FieldLabel>Observações sobre Dependentes</FieldLabel>
                      <FieldTextarea
                        value={formData.dependentsNotes}
                        onChange={e =>
                          handleInputChange('dependentsNotes', e.target.value)
                        }
                        placeholder='Informações sobre os dependentes...'
                      />
                    </FieldContainer>
                  </>
                )}
              </Section>

              {/* Dados Profissionais */}
              <Section>
                <SectionHeader>
                  <SectionTitle>💼 Dados Profissionais</SectionTitle>
                  <SectionDescription>
                    Informações sobre emprego e ocupação
                  </SectionDescription>
                </SectionHeader>

                <FieldContainerWithError>
                  <FieldLabel>Situação Profissional</FieldLabel>
                  <FieldSelect
                    value={formData.employmentStatus}
                    onChange={e =>
                      handleInputChange('employmentStatus', e.target.value)
                    }
                  >
                    <option value=''>Selecione...</option>
                    {Object.entries(EMPLOYMENT_STATUS_LABELS).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      )
                    )}
                  </FieldSelect>
                  {errors.employmentStatus && (
                    <ErrorMessage>{errors.employmentStatus}</ErrorMessage>
                  )}
                </FieldContainerWithError>

                {shouldShowEmploymentFields && (
                  <>
                    <RowContainer>
                      <FieldContainer>
                        <FieldLabel>Empresa</FieldLabel>
                        <FieldInput
                          type='text'
                          value={formData.companyName}
                          onChange={e =>
                            handleInputChange('companyName', e.target.value)
                          }
                          placeholder='Nome da empresa...'
                        />
                      </FieldContainer>

                      <FieldContainerWithError>
                        <FieldLabel>Cargo/Função</FieldLabel>
                        <FieldInput
                          type='text'
                          value={formData.jobPosition}
                          onChange={e =>
                            handleInputChange('jobPosition', e.target.value)
                          }
                          placeholder='Cargo atual...'
                          $hasError={!!errors.jobPosition}
                        />
                        {errors.jobPosition && (
                          <ErrorMessage>{errors.jobPosition}</ErrorMessage>
                        )}
                      </FieldContainerWithError>
                    </RowContainer>

                    <RowContainer>
                      <FieldContainer>
                        <FieldLabel>Tipo de Contrato</FieldLabel>
                        <FieldSelect
                          value={formData.contractType}
                          onChange={e =>
                            handleInputChange('contractType', e.target.value)
                          }
                        >
                          <option value=''>Selecione...</option>
                          {CONTRACT_TYPE_OPTIONS.map(type => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </FieldSelect>
                      </FieldContainer>

                      <FieldContainer>
                        <FieldLabel>Data de Início</FieldLabel>
                        <FieldInput
                          type='date'
                          value={formData.jobStartDate}
                          onChange={e =>
                            handleInputChange('jobStartDate', e.target.value)
                          }
                        />
                      </FieldContainer>
                    </RowContainer>

                    <CheckboxContainer>
                      <Checkbox
                        type='checkbox'
                        id='isCurrentlyWorking'
                        checked={formData.isCurrentlyWorking}
                        onChange={e =>
                          handleInputChange(
                            'isCurrentlyWorking',
                            e.target.checked
                          )
                        }
                      />
                      <CheckboxLabel htmlFor='isCurrentlyWorking'>
                        Ainda está trabalhando
                      </CheckboxLabel>
                    </CheckboxContainer>

                    {shouldShowJobEndDate && (
                      <FieldContainer>
                        <FieldLabel>Data de Término</FieldLabel>
                        <FieldInput
                          type='date'
                          value={formData.jobEndDate}
                          onChange={e =>
                            handleInputChange('jobEndDate', e.target.value)
                          }
                        />
                      </FieldContainer>
                    )}
                  </>
                )}

                <CheckboxContainer>
                  <Checkbox
                    type='checkbox'
                    id='isRetired'
                    checked={formData.isRetired}
                    onChange={e =>
                      handleInputChange('isRetired', e.target.checked)
                    }
                  />
                  <CheckboxLabel htmlFor='isRetired'>
                    É aposentado(a)
                  </CheckboxLabel>
                </CheckboxContainer>
              </Section>

              {/* Informações Financeiras */}
              <Section>
                <SectionHeader>
                  <SectionTitle>💰 Informações Financeiras</SectionTitle>
                  <SectionDescription>
                    Renda e dados financeiros
                  </SectionDescription>
                </SectionHeader>

                <RowContainer>
                  <FieldContainer>
                    <FieldLabel>Renda Mensal</FieldLabel>
                    <NumericFormat
                      customInput={FieldInput}
                      thousandSeparator='.'
                      decimalSeparator=','
                      prefix='R$ '
                      decimalScale={2}
                      fixedDecimalScale
                      allowNegative={false}
                      placeholder='R$ 0,00'
                      value={formData.monthlyIncome}
                      onValueChange={values =>
                        handleInputChange(
                          'monthlyIncome',
                          values.floatValue || ''
                        )
                      }
                    />
                  </FieldContainer>

                  <FieldContainer>
                    <FieldLabel>Renda Familiar</FieldLabel>
                    <NumericFormat
                      customInput={FieldInput}
                      thousandSeparator='.'
                      decimalSeparator=','
                      prefix='R$ '
                      decimalScale={2}
                      fixedDecimalScale
                      allowNegative={false}
                      placeholder='R$ 0,00'
                      value={formData.familyIncome}
                      onValueChange={values =>
                        handleInputChange(
                          'familyIncome',
                          values.floatValue || ''
                        )
                      }
                    />
                  </FieldContainer>
                </RowContainer>

                <RowContainer>
                  <FieldContainer>
                    <FieldLabel>Salário Bruto</FieldLabel>
                    <NumericFormat
                      customInput={FieldInput}
                      thousandSeparator='.'
                      decimalSeparator=','
                      prefix='R$ '
                      decimalScale={2}
                      fixedDecimalScale
                      allowNegative={false}
                      placeholder='R$ 0,00'
                      value={formData.grossSalary}
                      onValueChange={values =>
                        handleInputChange(
                          'grossSalary',
                          values.floatValue || ''
                        )
                      }
                    />
                  </FieldContainer>

                  <FieldContainer>
                    <FieldLabel>Salário Líquido</FieldLabel>
                    <NumericFormat
                      customInput={FieldInput}
                      thousandSeparator='.'
                      decimalSeparator=','
                      prefix='R$ '
                      decimalScale={2}
                      fixedDecimalScale
                      allowNegative={false}
                      placeholder='R$ 0,00'
                      value={formData.netSalary}
                      onValueChange={values =>
                        handleInputChange('netSalary', values.floatValue || '')
                      }
                    />
                  </FieldContainer>
                </RowContainer>

                <RowContainer>
                  <FieldContainerWithError>
                    <FieldLabel>Score de Crédito (0-1000)</FieldLabel>
                    <FieldInput
                      type='number'
                      min='0'
                      max='1000'
                      value={formData.creditScore}
                      onChange={e =>
                        handleInputChange('creditScore', e.target.value)
                      }
                      placeholder='Ex: 750'
                      $hasError={!!errors.creditScore}
                    />
                    {errors.creditScore && (
                      <ErrorMessage>{errors.creditScore}</ErrorMessage>
                    )}
                  </FieldContainerWithError>

                  <FieldContainer>
                    <FieldLabel>Última Consulta de Crédito</FieldLabel>
                    <FieldInput
                      type='date'
                      value={formData.lastCreditCheck}
                      onChange={e =>
                        handleInputChange('lastCreditCheck', e.target.value)
                      }
                    />
                  </FieldContainer>
                </RowContainer>

                <FieldContainer>
                  <FieldLabel>Outras Fontes de Renda</FieldLabel>
                  <FieldTextarea
                    value={formData.otherIncomeSources}
                    onChange={e =>
                      handleInputChange('otherIncomeSources', e.target.value)
                    }
                    placeholder='Descreva outras fontes de renda (aluguel, investimentos, etc)...'
                  />
                </FieldContainer>

                <FieldContainer>
                  <FieldLabel>Valor de Outras Rendas</FieldLabel>
                  <NumericFormat
                    customInput={FieldInput}
                    thousandSeparator='.'
                    decimalSeparator=','
                    prefix='R$ '
                    decimalScale={2}
                    fixedDecimalScale
                    allowNegative={false}
                    placeholder='R$ 0,00'
                    value={formData.otherIncomeAmount}
                    onValueChange={values =>
                      handleInputChange(
                        'otherIncomeAmount',
                        values.floatValue || ''
                      )
                    }
                  />
                </FieldContainer>
              </Section>

              {/* Dados Bancários */}
              <Section>
                <SectionHeader>
                  <SectionTitle>🏦 Dados Bancários</SectionTitle>
                  <SectionDescription>
                    Informações da conta bancária
                  </SectionDescription>
                </SectionHeader>

                <RowContainer>
                  <FieldContainer>
                    <FieldLabel>Banco</FieldLabel>
                    <FieldInput
                      type='text'
                      value={formData.bankName}
                      onChange={e =>
                        handleInputChange('bankName', e.target.value)
                      }
                      placeholder='Nome do banco...'
                    />
                  </FieldContainer>

                  <FieldContainer>
                    <FieldLabel>Agência</FieldLabel>
                    <FieldInput
                      type='text'
                      value={formData.bankAgency}
                      onChange={e =>
                        handleInputChange('bankAgency', e.target.value)
                      }
                      placeholder='0000'
                    />
                  </FieldContainer>
                </RowContainer>

                <FieldContainer>
                  <FieldLabel>Tipo de Conta</FieldLabel>
                  <FieldSelect
                    value={formData.accountType}
                    onChange={e =>
                      handleInputChange('accountType', e.target.value)
                    }
                  >
                    <option value=''>Selecione...</option>
                    {ACCOUNT_TYPE_OPTIONS.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </FieldSelect>
                </FieldContainer>
              </Section>

              {/* Patrimônio */}
              <Section>
                <SectionHeader>
                  <SectionTitle>🏠 Patrimônio e Bens</SectionTitle>
                  <SectionDescription>
                    Propriedades e veículos do cliente
                  </SectionDescription>
                </SectionHeader>

                <CheckboxContainer>
                  <Checkbox
                    type='checkbox'
                    id='hasProperty'
                    checked={formData.hasProperty}
                    onChange={e =>
                      handleInputChange('hasProperty', e.target.checked)
                    }
                  />
                  <CheckboxLabel htmlFor='hasProperty'>
                    Possui imóvel próprio
                  </CheckboxLabel>
                </CheckboxContainer>

                <CheckboxContainer>
                  <Checkbox
                    type='checkbox'
                    id='hasVehicle'
                    checked={formData.hasVehicle}
                    onChange={e =>
                      handleInputChange('hasVehicle', e.target.checked)
                    }
                  />
                  <CheckboxLabel htmlFor='hasVehicle'>
                    Possui veículo próprio
                  </CheckboxLabel>
                </CheckboxContainer>
              </Section>

              {/* Referências */}
              <Section>
                <SectionHeader>
                  <SectionTitle>📞 Referências</SectionTitle>
                  <SectionDescription>
                    Contatos de referência pessoal e profissional
                  </SectionDescription>
                </SectionHeader>

                <FieldContainer>
                  <FieldLabel>Nome da Referência Pessoal</FieldLabel>
                  <FieldInput
                    type='text'
                    value={formData.referenceName}
                    onChange={e =>
                      handleInputChange('referenceName', e.target.value)
                    }
                    placeholder='Nome completo...'
                  />
                </FieldContainer>

                <RowContainer>
                  <FieldContainer>
                    <FieldLabel>Telefone da Referência</FieldLabel>
                    <FieldInput
                      type='tel'
                      value={formData.referencePhone}
                      onChange={e =>
                        handleInputChange(
                          'referencePhone',
                          maskPhoneAuto(e.target.value)
                        )
                      }
                      placeholder='(11) 99999-9999'
                      maxLength={15}
                    />
                  </FieldContainer>

                  <FieldContainer>
                    <FieldLabel>Relação</FieldLabel>
                    <FieldInput
                      type='text'
                      value={formData.referenceRelationship}
                      onChange={e =>
                        handleInputChange(
                          'referenceRelationship',
                          e.target.value
                        )
                      }
                      placeholder='Amigo, familiar, etc...'
                    />
                  </FieldContainer>
                </RowContainer>

                <FieldContainer>
                  <FieldLabel>Nome da Referência Profissional</FieldLabel>
                  <FieldInput
                    type='text'
                    value={formData.professionalReferenceName}
                    onChange={e =>
                      handleInputChange(
                        'professionalReferenceName',
                        e.target.value
                      )
                    }
                    placeholder='Nome completo...'
                  />
                </FieldContainer>

                <RowContainer>
                  <FieldContainer>
                    <FieldLabel>Telefone Profissional</FieldLabel>
                    <FieldInput
                      type='tel'
                      value={formData.professionalReferencePhone}
                      onChange={e =>
                        handleInputChange(
                          'professionalReferencePhone',
                          maskPhoneAuto(e.target.value)
                        )
                      }
                      placeholder='(11) 99999-9999'
                      maxLength={15}
                    />
                  </FieldContainer>

                  <FieldContainer>
                    <FieldLabel>Cargo/Posição</FieldLabel>
                    <FieldInput
                      type='text'
                      value={formData.professionalReferencePosition}
                      onChange={e =>
                        handleInputChange(
                          'professionalReferencePosition',
                          e.target.value
                        )
                      }
                      placeholder='Cargo da referência...'
                    />
                  </FieldContainer>
                </RowContainer>
              </Section>

              {/* Preferências Imobiliárias */}
              <Section>
                <SectionHeader>
                  <SectionTitle>🏘️ Preferências Imobiliárias</SectionTitle>
                  <SectionDescription>
                    Características desejadas para imóveis
                  </SectionDescription>
                </SectionHeader>

                <RowContainer>
                  <FieldContainer>
                    <FieldLabel>Estado Preferido</FieldLabel>
                    <FieldSelect
                      value={selectedState?.id || ''}
                      onChange={e => {
                        const stateId = e.target.value;
                        const state = states.find(s => s.id === stateId);
                        setSelectedState(state || null);
                        handleInputChange(
                          'preferredCity',
                          getCityDisplayName()
                        );
                      }}
                      disabled={loadingStates}
                    >
                      <option value=''>
                        {loadingStates
                          ? 'Carregando estados...'
                          : 'Selecione o estado'}
                      </option>
                      {states.map(state => (
                        <option key={state.id} value={state.id}>
                          {state.nome} - {state.sigla}
                        </option>
                      ))}
                    </FieldSelect>
                  </FieldContainer>

                  <FieldContainer>
                    <FieldLabel>Cidade Preferida</FieldLabel>
                    <FieldSelect
                      value={selectedCity?.id || ''}
                      onChange={e => {
                        const cityId = e.target.value;
                        const city = cities.find(c => c.id === String(cityId));
                        setSelectedCity(city || null);
                        handleInputChange(
                          'preferredCity',
                          getCityDisplayName()
                        );
                      }}
                      disabled={!selectedState || loadingCities}
                    >
                      <option value=''>
                        {!selectedState
                          ? 'Selecione primeiro o estado'
                          : loadingCities
                            ? 'Carregando cidades...'
                            : 'Selecione a cidade'}
                      </option>
                      {cities.map(city => (
                        <option key={city.id} value={city.id}>
                          {city.nome}
                        </option>
                      ))}
                    </FieldSelect>
                  </FieldContainer>
                </RowContainer>

                <FieldContainer>
                  <FieldLabel>Bairro Preferido</FieldLabel>
                  <FieldInput
                    type='text'
                    value={formData.preferredNeighborhood}
                    onChange={e =>
                      handleInputChange('preferredNeighborhood', e.target.value)
                    }
                    placeholder='Centro'
                  />
                </FieldContainer>

                <RowContainer>
                  <FieldContainer>
                    <FieldLabel>Valor Mínimo</FieldLabel>
                    <NumericFormat
                      customInput={FieldInput}
                      thousandSeparator='.'
                      decimalSeparator=','
                      prefix='R$ '
                      decimalScale={2}
                      fixedDecimalScale
                      allowNegative={false}
                      placeholder='R$ 0,00'
                      value={formData.minValue}
                      onValueChange={values =>
                        handleInputChange('minValue', values.floatValue || '')
                      }
                    />
                  </FieldContainer>

                  <FieldContainer>
                    <FieldLabel>Valor Máximo</FieldLabel>
                    <NumericFormat
                      customInput={FieldInput}
                      thousandSeparator='.'
                      decimalSeparator=','
                      prefix='R$ '
                      decimalScale={2}
                      fixedDecimalScale
                      allowNegative={false}
                      placeholder='R$ 0,00'
                      value={formData.maxValue}
                      onValueChange={values =>
                        handleInputChange('maxValue', values.floatValue || '')
                      }
                    />
                  </FieldContainer>
                </RowContainer>
              </Section>

              {/* Características Desejadas */}
              <Section>
                <SectionHeader>
                  <SectionTitle>✨ Características Desejadas</SectionTitle>
                  <SectionDescription>
                    Especificações e comodidades desejadas
                  </SectionDescription>
                </SectionHeader>

                <DesiredFeaturesInput
                  value={formData.desiredFeatures as DesiredFeatures}
                  onChange={features =>
                    handleInputChange('desiredFeatures', features)
                  }
                />
              </Section>

              {/* Informações MCMV */}
              <Section>
                <SectionHeader>
                  <SectionTitle>
                    🏠 Informações Minha Casa Minha Vida
                  </SectionTitle>
                  <SectionDescription>
                    Dados relacionados ao programa Minha Casa Minha Vida
                  </SectionDescription>
                </SectionHeader>

                <CheckboxContainer>
                  <Checkbox
                    type='checkbox'
                    id='mcmvInterested'
                    checked={formData.mcmvInterested}
                    onChange={e =>
                      handleInputChange('mcmvInterested', e.target.checked)
                    }
                  />
                  <CheckboxLabel htmlFor='mcmvInterested'>
                    Interessado em Minha Casa Minha Vida
                  </CheckboxLabel>
                </CheckboxContainer>

                <CheckboxContainer>
                  <Checkbox
                    type='checkbox'
                    id='mcmvEligible'
                    checked={formData.mcmvEligible}
                    onChange={e =>
                      handleInputChange('mcmvEligible', e.target.checked)
                    }
                  />
                  <CheckboxLabel htmlFor='mcmvEligible'>
                    Elegível para Minha Casa Minha Vida
                  </CheckboxLabel>
                </CheckboxContainer>

                {formData.mcmvInterested && (
                  <>
                    <FieldContainer>
                      <FieldLabel>
                        Faixa de Renda Minha Casa Minha Vida
                      </FieldLabel>
                      <FieldSelect
                        value={formData.mcmvIncomeRange}
                        onChange={e =>
                          handleInputChange('mcmvIncomeRange', e.target.value)
                        }
                      >
                        <option value=''>Selecione a faixa</option>
                        <option value='faixa1'>Faixa 1 (até R$ 1.800)</option>
                        <option value='faixa2'>
                          Faixa 2 (R$ 1.801 até R$ 2.600)
                        </option>
                        <option value='faixa3'>
                          Faixa 3 (R$ 2.601 até R$ 4.000)
                        </option>
                      </FieldSelect>
                    </FieldContainer>

                    <FieldContainer>
                      <FieldLabel>Número do CadÚnico</FieldLabel>
                      <FieldInput
                        type='text'
                        value={formData.mcmvCadunicoNumber}
                        onChange={e =>
                          handleInputChange(
                            'mcmvCadunicoNumber',
                            e.target.value
                          )
                        }
                        placeholder='Número do Cadastro Único'
                      />
                    </FieldContainer>

                    <FieldContainer>
                      <FieldLabel>
                        Data do Pré-Cadastro Minha Casa Minha Vida
                      </FieldLabel>
                      <FieldInput
                        type='date'
                        value={formData.mcmvPreRegistrationDate}
                        onChange={e =>
                          handleInputChange(
                            'mcmvPreRegistrationDate',
                            e.target.value
                          )
                        }
                      />
                    </FieldContainer>
                  </>
                )}
              </Section>

              {/* Observações */}
              <Section>
                <SectionHeader>
                  <SectionTitle>📝 Observações</SectionTitle>
                  <SectionDescription>
                    Informações adicionais sobre o cliente
                  </SectionDescription>
                </SectionHeader>

                <FieldContainer>
                  <FieldLabel>Observações Gerais</FieldLabel>
                  <FieldTextarea
                    value={formData.notes}
                    onChange={e => handleInputChange('notes', e.target.value)}
                    placeholder='Informações adicionais sobre o cliente...'
                  />
                </FieldContainer>
              </Section>

              {/* Cônjuge */}
              {client && shouldShowSpouse && (
                <Section>
                  <SectionHeader>
                    <SectionTitle>💑 Dados do Cônjuge</SectionTitle>
                    <SectionDescription>
                      Informações do cônjuge do cliente
                    </SectionDescription>
                  </SectionHeader>

                  <SpouseForm
                    clientId={client.id}
                    spouse={client.spouse}
                    onSave={handleSpouseSave}
                    onDelete={handleSpouseDelete}
                  />
                </Section>
              )}

              <FormActions>
                <Button
                  type='button'
                  $variant='secondary'
                  onClick={() => navigate('/clients')}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type='submit'
                  $variant='primary'
                  disabled={isSubmitting}
                >
                  <MdSave />
                  {isSubmitting
                    ? 'Salvando...'
                    : isEditing
                      ? 'Atualizar Cliente'
                      : 'Criar Cliente'}
                </Button>
              </FormActions>
            </FormContainer>
          </>
        </PageContent>
      </PageContainer>
    </Layout>
  );
};

export default ClientFormPage;
