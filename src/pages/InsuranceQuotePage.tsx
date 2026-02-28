import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { Layout } from '../components/layout/Layout';
import { toast } from 'react-toastify';
import insuranceService from '../services/insuranceService';
import type {
  InsuranceQuote,
  InsurancePolicyRequest,
  InsuranceQuoteRequest,
} from '../services/insuranceService';
import { maskCPF, maskCNPJ, formatCurrencyValue, getNumericValue, maskCurrencyReais } from '../utils/masks';
import {
  MdSecurity,
  MdCheckCircle,
  MdArrowForward,
  MdSearch,
  MdCompareArrows,
  MdKeyboardArrowDown,
} from 'react-icons/md';
import { api } from '../services/api';

/** Base URL das logos das seguradoras (arquivos em public/assets/insurers/) – respeita base path do Vite (ex: /sistema) */
const INSURER_LOGO_BASE = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/assets/insurers`;

interface Client {
  id: string;
  name: string;
  document: string;
  email?: string;
  phone?: string;
}

interface Property {
  id: string;
  code?: string;
  address: string;
  value: number;
  monthlyRent?: number;
}

const InsuranceQuotePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rentalId = searchParams.get('rentalId') || undefined;

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [quotes, setQuotes] = useState<InsuranceQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<InsuranceQuote | null>(null);

  // Dados de busca
  const [clientCPF, setClientCPF] = useState('');
  const [propertyCode, setPropertyCode] = useState('');
  const [client, setClient] = useState<Client | null>(null);
  const [property, setProperty] = useState<Property | null>(null);

  // Dados da locação
  const [rentalStartDate, setRentalStartDate] = useState('');
  const [rentalEndDate, setRentalEndDate] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');

  // Modo de cotação: todas as seguradoras ou uma única
  const [quoteMode, setQuoteMode] = useState<'all' | 'single'>('all');
  const [selectedProvider, setSelectedProvider] = useState<string>('POTTENCIAL');
  const [insurerSelectOpen, setInsurerSelectOpen] = useState(false);
  const insurerSelectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (insurerSelectRef.current && !insurerSelectRef.current.contains(e.target as Node)) {
        setInsurerSelectOpen(false);
      }
    };
    if (insurerSelectOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [insurerSelectOpen]);

  const providers = [
    { value: 'POTTENCIAL', label: 'Pottencial Seguros', logo: `${INSURER_LOGO_BASE}/pottencial.png`, color: '#4CAF50' },
    { value: 'PORTO_SEGURO', label: 'Porto Seguro', logo: `${INSURER_LOGO_BASE}/porto-seguro.png`, color: '#2196F3' },
    { value: 'JUNTO_SEGUROS', label: 'Junto Seguros', logo: `${INSURER_LOGO_BASE}/junto-seguros.png`, color: '#8BC34A' },
    { value: 'TOKIO_MARINE', label: 'Tokio Marine', logo: `${INSURER_LOGO_BASE}/tokio-marine.png`, color: '#F44336' },
  ];

  const handleSearchClient = async () => {
    if (!clientCPF) {
      toast.error('Digite um CPF');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get('/clients', {
        params: { document: clientCPF.replace(/\D/g, '') },
      });

      if (response.data && response.data.length > 0) {
        const foundClient = response.data[0];
        setClient(foundClient);
        toast.success('Cliente encontrado!');
      } else {
        toast.error('Cliente não encontrado');
        setClient(null);
      }
    } catch (error: any) {
      toast.error('Erro ao buscar cliente');
      setClient(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchProperty = async () => {
    if (!propertyCode) {
      toast.error('Digite um código de imóvel');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/properties/${propertyCode}`);

      if (response.data) {
        setProperty(response.data);
        if (response.data.monthlyRent != null) {
          setMonthlyRent(
            response.data.monthlyRent === 0
              ? ''
              : formatCurrencyValue(response.data.monthlyRent)
          );
        }
        toast.success('Imóvel encontrado!');
      } else {
        toast.error('Imóvel não encontrado');
        setProperty(null);
      }
    } catch (error: any) {
      toast.error('Erro ao buscar imóvel');
      setProperty(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!client || !property) {
      toast.error('Busque o cliente e o imóvel antes de cotar');
      return;
    }

    setLoading(true);
    try {
      const baseData = {
        propertyAddress: property.address,
        propertyValue: property.value,
        monthlyRent: getNumericValue(monthlyRent),
        tenantName: client.name,
        tenantDocument: client.document,
        tenantEmail: client.email,
        tenantPhone: client.phone,
        rentalStartDate,
        rentalEndDate,
        rentalId,
      };

      if (quoteMode === 'single') {
        const singleQuote = await insuranceService.createQuote({
          ...baseData,
          provider: selectedProvider as InsuranceQuoteRequest['provider'],
        });
        setQuotes([singleQuote]);
        setCurrentStep(1);
        if (singleQuote.status === 'COMPLETED') {
          toast.success('Cotação realizada com sucesso!');
        } else {
          toast.warning('A seguradora não retornou cotação válida.');
        }
      } else {
        const allQuotes = await insuranceService.createQuoteAll(baseData);
        setQuotes(allQuotes);
        setCurrentStep(1);
        const successCount = allQuotes.filter(q => q.status === 'COMPLETED').length;
        toast.success(`${successCount} cotações realizadas com sucesso!`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao criar cotações');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuote = (quote: InsuranceQuote) => {
    setSelectedQuote(quote);
  };

  const handleContractInsurance = async () => {
    if (!selectedQuote || !rentalId) {
      toast.error('Selecione uma cotação e tenha um ID de locação válido');
      return;
    }

    setLoading(true);
    try {
      const policyData: InsurancePolicyRequest = {
        quoteId: selectedQuote.id,
        rentalId: rentalId,
      };

      await insuranceService.createPolicy(policyData);
      toast.success('Apólice contratada com sucesso!');
      setCurrentStep(2);

      setTimeout(() => {
        navigate(`/rentals/${rentalId}`);
      }, 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao contratar seguro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Container>
        <Header>
          <Title>
            <MdSecurity size={32} />
            Cotação de Seguro Fiança Locatícia
          </Title>
          <Subtitle>
            Compare cotações de todas as seguradoras e escolha a melhor opção
          </Subtitle>
        </Header>

        <StepsContainer>
          <Step active={currentStep === 0} completed={currentStep > 0}>
            <StepNumber>{currentStep > 0 ? <MdCheckCircle /> : '1'}</StepNumber>
            <StepLabel>Dados da Locação</StepLabel>
          </Step>
          <StepLine completed={currentStep > 0} />
          <Step active={currentStep === 1} completed={currentStep > 1}>
            <StepNumber>{currentStep > 1 ? <MdCheckCircle /> : '2'}</StepNumber>
            <StepLabel>Comparar Cotações</StepLabel>
          </Step>
          <StepLine completed={currentStep > 1} />
          <Step active={currentStep === 2} completed={false}>
            <StepNumber>3</StepNumber>
            <StepLabel>Contratar Seguro</StepLabel>
          </Step>
        </StepsContainer>

        {loading && (
          <LoadingContainer>
            <LoadingText>
              {quoteMode === 'single'
                ? `Consultando ${providers.find(p => p.value === selectedProvider)?.label || 'seguradora'}...`
                : 'Consultando seguradoras...'}
            </LoadingText>
            <LogosContainer>
              {(quoteMode === 'single'
                ? providers.filter(p => p.value === selectedProvider)
                : providers
              ).map((provider, index) => (
                <ProviderLogo
                  key={provider.value}
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <LogoIcon src={provider.logo} alt={provider.label} />
                  <LogoLabel>{provider.label}</LogoLabel>
                </ProviderLogo>
              ))}
            </LogosContainer>
          </LoadingContainer>
        )}

        {!loading && currentStep === 0 && (
          <FormCard>
            <Form onSubmit={handleSubmitQuote}>
              <FormSection>
                <SectionTitle>
                  <MdSearch /> Buscar Cliente
                </SectionTitle>
                <SearchRow>
                  <FormGroup style={{ flex: 1 }}>
                    <Label>CPF do Inquilino</Label>
                    <Input
                      type="text"
                      value={maskCPF(clientCPF)}
                      onChange={e => setClientCPF(e.target.value.replace(/\D/g, ''))}
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                  </FormGroup>
                  <SearchButton type="button" onClick={handleSearchClient}>
                    <MdSearch /> Buscar
                  </SearchButton>
                </SearchRow>
                {client && (
                  <ClientInfo>
                    <InfoLabel>Cliente Encontrado:</InfoLabel>
                    <InfoValue>{client.name}</InfoValue>
                    {client.email && <InfoDetail>Email: {client.email}</InfoDetail>}
                    {client.phone && <InfoDetail>Telefone: {client.phone}</InfoDetail>}
                  </ClientInfo>
                )}
              </FormSection>

              <FormSection>
                <SectionTitle>
                  <MdSearch /> Buscar Imóvel
                </SectionTitle>
                <SearchRow>
                  <FormGroup style={{ flex: 1 }}>
                    <Label>Código do Imóvel</Label>
                    <Input
                      type="text"
                      value={propertyCode}
                      onChange={e => setPropertyCode(e.target.value)}
                      placeholder="Digite o código ou ID do imóvel"
                    />
                  </FormGroup>
                  <SearchButton type="button" onClick={handleSearchProperty}>
                    <MdSearch /> Buscar
                  </SearchButton>
                </SearchRow>
                {property && (
                  <ClientInfo>
                    <InfoLabel>Imóvel Encontrado:</InfoLabel>
                    <InfoValue>{property.address}</InfoValue>
                    <InfoDetail>
                      Valor: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.value)}
                    </InfoDetail>
                  </ClientInfo>
                )}
              </FormSection>

              <FormSection>
                <SectionTitle>Dados da Locação</SectionTitle>
                <FormRow>
                  <FormGroup>
                    <Label>Valor do Aluguel Mensal</Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="R$ 0,00"
                      value={monthlyRent}
                      onChange={e => setMonthlyRent(maskCurrencyReais(e.target.value))}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Data de Início</Label>
                    <Input
                      type="date"
                      value={rentalStartDate}
                      onChange={e => setRentalStartDate(e.target.value)}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Data de Término</Label>
                    <Input
                      type="date"
                      value={rentalEndDate}
                      onChange={e => setRentalEndDate(e.target.value)}
                      required
                    />
                  </FormGroup>
                </FormRow>
              </FormSection>

              <FormSection>
                <SectionTitle>Onde cotar</SectionTitle>
                <FormRow>
                  <FormGroup>
                    <Label>Modo de cotação</Label>
                    <RadioGroup>
                      <RadioLabel>
                        <input
                          type="radio"
                          name="quoteMode"
                          checked={quoteMode === 'all'}
                          onChange={() => setQuoteMode('all')}
                        />
                        <RadioText>Cotar em todas as seguradoras</RadioText>
                      </RadioLabel>
                      <RadioLabel>
                        <input
                          type="radio"
                          name="quoteMode"
                          checked={quoteMode === 'single'}
                          onChange={() => setQuoteMode('single')}
                        />
                        <RadioText>Cotar em uma seguradora</RadioText>
                      </RadioLabel>
                    </RadioGroup>
                  </FormGroup>
                  {quoteMode === 'single' && (
                    <FormGroup>
                      <Label>Seguradora</Label>
                      <InsurerSelectWrapper ref={insurerSelectRef}>
                        <InsurerSelectTrigger
                          type="button"
                          onClick={() => setInsurerSelectOpen(prev => !prev)}
                          $isOpen={insurerSelectOpen}
                        >
                          {(() => {
                            const p = providers.find(pr => pr.value === selectedProvider);
                            return p ? (
                              <>
                                <InsurerLogo src={p.logo} alt="" />
                                <span>{p.label}</span>
                              </>
                            ) : (
                              <span>Selecione a seguradora</span>
                            );
                          })()}
                          <MdKeyboardArrowDown size={20} />
                        </InsurerSelectTrigger>
                        {insurerSelectOpen && (
                          <InsurerSelectDropdown>
                            {providers.map(p => (
                              <InsurerOption
                                key={p.value}
                                type="button"
                                onClick={() => {
                                  setSelectedProvider(p.value);
                                  setInsurerSelectOpen(false);
                                }}
                                $selected={p.value === selectedProvider}
                              >
                                <InsurerLogo src={p.logo} alt="" />
                                <span>{p.label}</span>
                              </InsurerOption>
                            ))}
                          </InsurerSelectDropdown>
                        )}
                      </InsurerSelectWrapper>
                    </FormGroup>
                  )}
                </FormRow>
              </FormSection>

              <ButtonGroup>
                <Button
                  type="submit"
                  disabled={loading || !client || !property}
                >
                  <MdCompareArrows />
                  {quoteMode === 'all'
                    ? 'Cotar em Todas as Seguradoras'
                    : `Cotar na ${providers.find(p => p.value === selectedProvider)?.label || 'Seguradora'}`}
                  <MdArrowForward />
                </Button>
              </ButtonGroup>
            </Form>
          </FormCard>
        )}

        {!loading && currentStep === 1 && quotes.length > 0 && (
          <QuotesContainer>
            <QuotesHeader>
              <QuotesTitle>
                <MdCompareArrows /> Compare as Cotações
              </QuotesTitle>
              <QuotesSubtitle>
                {quotes.filter(q => q.status === 'COMPLETED').length} de {quotes.length} seguradoras responderam
              </QuotesSubtitle>
            </QuotesHeader>

            <QuotesGrid>
              {quotes
                .filter(q => q.status === 'COMPLETED')
                .sort((a, b) => (a.monthlyPremium || 0) - (b.monthlyPremium || 0))
                .map(quote => {
                  const providerInfo = providers.find(p => p.value === quote.provider);
                  const isSelected = selectedQuote?.id === quote.id;

                  return (
                    <QuoteCard
                      key={quote.id}
                      selected={isSelected}
                      onClick={() => handleSelectQuote(quote)}
                    >
                      {isSelected && <SelectedBadge>Selecionado</SelectedBadge>}
                      <QuoteHeader color={providerInfo?.color}>
                        <QuoteLogo src={providerInfo?.logo} alt={providerInfo?.label} />
                        <QuoteProvider>{providerInfo?.label}</QuoteProvider>
                      </QuoteHeader>
                      <QuoteBody>
                        <QuotePrice>
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(quote.monthlyPremium || 0)}
                          <QuotePriceLabel>/mês</QuotePriceLabel>
                        </QuotePrice>
                        <QuoteDetail>
                          <QuoteDetailLabel>Cobertura</QuoteDetailLabel>
                          <QuoteDetailValue>
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(quote.coverageAmount || 0)}
                          </QuoteDetailValue>
                        </QuoteDetail>
                      </QuoteBody>
                    </QuoteCard>
                  );
                })}
            </QuotesGrid>

            {quotes.filter(q => q.status === 'ERROR').length > 0 && (
              <ErrorSection>
                <ErrorTitle>Seguradoras que não responderam:</ErrorTitle>
                <ErrorList>
                  {quotes
                    .filter(q => q.status === 'ERROR')
                    .map(quote => {
                      const providerInfo = providers.find(p => p.value === quote.provider);
                      return (
                        <ErrorItem key={quote.id}>
                          <img src={providerInfo?.logo} alt={providerInfo?.label} style={{ width: '24px', height: '24px', marginRight: '8px', objectFit: 'contain' }} />
                          {providerInfo?.label}
                        </ErrorItem>
                      );
                    })}
                </ErrorList>
              </ErrorSection>
            )}

            <ButtonGroup>
              <Button type="button" onClick={() => setCurrentStep(0)} secondary>
                Voltar
              </Button>
              <Button
                type="button"
                onClick={handleContractInsurance}
                disabled={!selectedQuote || loading}
              >
                Contratar Seguro Selecionado
                <MdArrowForward />
              </Button>
            </ButtonGroup>
          </QuotesContainer>
        )}

        {!loading && currentStep === 2 && (
          <SuccessCard>
            <SuccessIcon>
              <MdCheckCircle size={64} />
            </SuccessIcon>
            <SuccessTitle>Seguro Contratado com Sucesso! 🎉</SuccessTitle>
            <SuccessText>
              Você será redirecionado para os detalhes da locação em instantes...
            </SuccessText>
          </SuccessCard>
        )}
      </Container>
    </Layout>
  );
};

// Styled Components
const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 1.25rem;
  width: 100%;
`;

const Header = styled.div`
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;

  svg {
    color: ${props => props.theme.colors.primary};
  }
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-left: 3rem;
`;

const StepsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 3rem;
  gap: 1rem;
`;

const Step = styled.div<{ active: boolean; completed: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  opacity: ${props => (props.active || props.completed ? 1 : 0.5)};
`;

const StepNumber = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.25rem;

  svg {
    font-size: 1.5rem;
  }
`;

const StepLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
`;

const StepLine = styled.div<{ completed: boolean }>`
  width: 80px;
  height: 2px;
  background: ${props =>
    props.completed ? props.theme.colors.primary : props.theme.colors.border};
  margin-bottom: 1.5rem;
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  background: ${props => props.theme.colors.background};
  border-radius: 12px;
`;

const LoadingText = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 2rem;
`;

const LogosContainer = styled.div`
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const ProviderLogo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const LogoIcon = styled.img`
  width: 80px;
  height: 80px;
  object-fit: contain;
`;

const LogoLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.theme.colors.textSecondary};
`;

const FormCard = styled.div`
  background: ${props => props.theme.colors.background};
  border-radius: 12px;
  padding: 1.5rem 1.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid ${props => props.theme.colors.border};
`;

const SearchRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-end;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 1rem;
  color: ${props => props.theme.colors.text};
  background: ${props => props.theme.colors.backgroundSecondary};
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

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9375rem;

  input[type='radio'] {
    accent-color: ${props => props.theme.colors.primary};
    width: 1.125rem;
    height: 1.125rem;
  }
`;

const RadioText = styled.span`
  color: ${props => props.theme.colors.text};
  font-weight: 500;
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 1rem;
  color: ${props => props.theme.colors.text};
  background: ${props => props.theme.colors.backgroundSecondary};
  cursor: pointer;
  min-width: 220px;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const InsurerSelectWrapper = styled.div`
  position: relative;
  min-width: 260px;
`;

const InsurerSelectTrigger = styled.button<{ $isOpen?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 8px;
  font-size: 1rem;
  color: ${p => p.theme.colors.text};
  background: ${p => p.theme.colors.backgroundSecondary};
  cursor: pointer;
  text-align: left;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${p => p.theme.colors.primary};
  }

  ${p => p.$isOpen && `border-color: ${p.theme.colors.primary};`}

  svg {
    margin-left: auto;
    flex-shrink: 0;
    transition: transform 0.2s;
    ${p => p.$isOpen && 'transform: rotate(180deg);'}
  }
`;

const InsurerLogo = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
  flex-shrink: 0;
`;

const InsurerSelectDropdown = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: ${p => p.theme.colors.cardBackground};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
  overflow: hidden;
`;

const InsurerOption = styled.button<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.65rem 1rem;
  border: none;
  background: ${p => (p.$selected ? p.theme.colors.primary + '15' : 'transparent')};
  color: ${p => p.theme.colors.text};
  font-size: 0.9375rem;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;

  &:hover {
    background: ${p => p.theme.colors.backgroundSecondary};
  }

  ${InsurerLogo} {
    width: 28px;
    height: 28px;
  }
`;

const SearchButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.theme.colors.primary};
  color: white;
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const ClientInfo = styled.div`
  padding: 1rem;
  background: ${props => props.theme.colors.success}10;
  border-left: 4px solid ${props => props.theme.colors.success};
  border-radius: 8px;
  margin-top: 1rem;
`;

const InfoLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.colors.success};
  margin-bottom: 0.5rem;
`;

const InfoValue = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.25rem;
`;

const InfoDetail = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const Button = styled.button<{ secondary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props =>
    props.secondary
      ? props.theme.colors.backgroundSecondary
      : props.theme.colors.primary};
  color: ${props => (props.secondary ? props.theme.colors.text : 'white')};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const QuotesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const QuotesHeader = styled.div`
  text-align: center;
`;

const QuotesTitle = styled.h2`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.75rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const QuotesSubtitle = styled.p`
  font-size: 1rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const QuotesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const QuoteCard = styled.div<{ selected: boolean }>`
  position: relative;
  background: ${props => props.theme.colors.background};
  border: 2px solid
    ${props =>
      props.selected ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${props =>
    props.selected
      ? `0 4px 16px ${props.theme.colors.primary}40`
      : '0 2px 8px rgba(0, 0, 0, 0.1)'};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
`;

const SelectedBadge = styled.div`
  position: absolute;
  top: -10px;
  right: 10px;
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
`;

const QuoteHeader = styled.div<{ color?: string }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid ${props => props.color || props.theme.colors.border};
`;

const QuoteLogo = styled.img`
  width: 60px;
  height: 60px;
  object-fit: contain;
`;

const QuoteProvider = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
`;

const QuoteBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const QuotePrice = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
`;

const QuotePriceLabel = styled.span`
  font-size: 1rem;
  font-weight: 500;
  color: ${props => props.theme.colors.textSecondary};
`;

const QuoteDetail = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const QuoteDetailLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.theme.colors.textSecondary};
`;

const QuoteDetailValue = styled.span`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const ErrorSection = styled.div`
  padding: 1.5rem;
  background: ${props => props.theme.colors.error}10;
  border-left: 4px solid ${props => props.theme.colors.error};
  border-radius: 8px;
`;

const ErrorTitle = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.error};
  margin-bottom: 0.75rem;
`;

const ErrorList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const ErrorItem = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const SuccessCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: ${props => props.theme.colors.background};
  border-radius: 12px;
  text-align: center;
`;

const SuccessIcon = styled.div`
  color: ${props => props.theme.colors.success};
  margin-bottom: 1.5rem;
`;

const SuccessTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin-bottom: 1rem;
`;

const SuccessText = styled.p`
  font-size: 1.125rem;
  color: ${props => props.theme.colors.textSecondary};
`;

export default InsuranceQuotePage;
