import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { usePricingData } from '../hooks/usePricingData';
import { usePlanModules } from '../hooks/usePlanModules';
import { useAddress } from '../hooks/useAddress';
import { CustomPlanModal } from '../components/modals/CustomPlanModal';
import SubscriptionPlansShimmer from '../components/shimmer/SubscriptionPlansShimmer';
import { subscriptionService } from '../services/subscriptionService';
import type { IconType } from 'react-icons';
import { MdCheck, MdStar, MdCreditCard, MdLogout } from 'react-icons/md';
import type { SubscriptionPlan } from '../types/subscription';
import type { Plan } from '../types/subscriptionTypes';
import * as S from '../styles/pages/SubscriptionPlansPageStyles';

interface PricingPlanWithBackend extends SubscriptionPlan {
  backendPlanId?: string;
  trialDays?: number;
}

export const SubscriptionPlansPage: React.FC = () => {
  const navigate = useNavigate();
  const { createSubscription, loadSubscriptionStatus } = useSubscription();
  const { data: pricingData, loading, error } = usePricingData();
  const { data: planModulesData } = usePlanModules();
  const { setTheme, theme } = useTheme();
  const { logout } = useAuth();
  const [selectedPlan, setSelectedPlan] =
    useState<PricingPlanWithBackend | null>(null);

  // Verificar se está em modo BETA
  const isBeta = import.meta.env.VITE_IS_BETA === 'true';
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set());
  const [showCustomPlanModal, setShowCustomPlanModal] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );
  const [activePaymentMethod, setActivePaymentMethod] = useState<
    'credit_card' | null
  >(null);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [availablePlansError, setAvailablePlansError] = useState<string | null>(
    null
  );
  const [cardData, setCardData] = useState({
    holderName: '',
    number: '',
    expiryMonth: '',
    expiryYear: '',
    ccv: '',
  });
  const [cardHolderData, setCardHolderData] = useState({
    name: '',
    email: '',
    cpfCnpj: '',
    postalCode: '',
    addressNumber: '',
    addressComplement: '',
    mobilePhone: '',
    phone: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [clientIp, setClientIp] = useState<string | null>(null);
  const [trialEnabled, setTrialEnabled] = useState(true);
  const [trialSummary, setTrialSummary] = useState<{
    trialEndsAt?: string | null;
    nextBillingDate?: string | null;
    trialDays?: number;
    autoRenew?: boolean;
  } | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [cepTimeout, setCepTimeout] = useState<NodeJS.Timeout | null>(null);

  // Hook para busca de endereço por CEP
  const {
    isLoading: isLoadingCEP,
    error: cepError,
    addressData,
    searchByZipCode,
  } = useAddress();

  // Forçar tema dark nesta página
  useEffect(() => {
    setTheme('dark');
  }, [setTheme]);

  useEffect(() => {
    const fetchAvailablePlans = async () => {
      try {
        setAvailablePlansError(null);
        const plans = await subscriptionService.getAvailablePlans();
        setAvailablePlans(plans);
      } catch (err) {
        console.error('Erro ao carregar planos disponíveis:', err);
        setAvailablePlans([]);
        setAvailablePlansError(
          'Não foi possível carregar os planos disponíveis. Tente novamente mais tarde.'
        );
      }
    };

    fetchAvailablePlans();
  }, []);

  useEffect(() => {
    if (showPaymentModal) {
      setActivePaymentMethod('credit_card');
      setPaymentError(null);
      setPaymentSuccess(false);
      setFormErrors({});
      setTermsAccepted(false);
      setTermsError(null);
      setShowConfirmationModal(false);
      setCardData({
        holderName: '',
        number: '',
        expiryMonth: '',
        expiryYear: '',
        ccv: '',
      });
      setCardHolderData({
        name: '',
        email: '',
        cpfCnpj: '',
        postalCode: '',
        addressNumber: '',
        addressComplement: '',
        mobilePhone: '',
        phone: '',
      });
      setTrialEnabled(Boolean((selectedPlan?.trialDays ?? 7) > 0));
      setTrialSummary(null);

      subscriptionService
        .fetchClientIp()
        .then(ip => setClientIp(ip))
        .catch(() => setClientIp(null));
    }
  }, [showPaymentModal, selectedPlan]);

  // Limpar timeout quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (cepTimeout) {
        clearTimeout(cepTimeout);
      }
    };
  }, [cepTimeout]);

  // Agrupa módulos por tópicos com base em palavras‑chave do nome
  const getModuleCategory = (name: string): string => {
    const n = name.toLowerCase();
    if (/(usuár|usuario|user|empresa|equipe|time|colaborador)/.test(n))
      return 'Pessoas';
    if (/(propried|imóv|imovel|chave|vistoria|agenda|calend)/.test(n))
      return 'Imóveis';
    if (
      /(cliente|aluguel|locaç|locacao|comiss|venda|kanban|match|pipeline|prospec)/.test(
        n
      )
    )
      return 'Comercial';
    if (
      /(finance|financeiro|relatór|relatorio|dashboard|meta|kpi|bi|auditoria)/.test(
        n
      )
    )
      return 'Gestão e Relatórios';
    if (/(galeria|imagem|mídia|midia|document)/.test(n))
      return 'Documentos e Mídias';
    if (/(api|integra|webhook)/.test(n)) return 'Integrações';
    return 'Outros';
  };

  const sanitizeNumber = (value: string) => value.replace(/\D/g, '');

  const maskCardNumber = (value: string) => {
    const digits = sanitizeNumber(value).slice(0, 16);
    const groups = digits.match(/.{1,4}/g);
    return groups ? groups.join(' ') : digits;
  };

  const maskExpiryValue = (value: string) => sanitizeNumber(value).slice(0, 2);

  const maskCvv = (value: string) => sanitizeNumber(value).slice(0, 4);

  const maskCpfCnpj = (value: string) => {
    const digits = sanitizeNumber(value).slice(0, 14);
    if (digits.length <= 11) {
      return digits
        .replace(/^(\d{3})(\d)/, '$1.$2')
        .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1-$2');
    }
    return digits
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  };

  const maskPostalCode = (value: string) => {
    const digits = sanitizeNumber(value).slice(0, 8);
    if (digits.length > 5) {
      return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    }
    return digits;
  };

  const maskPhoneNumber = (value: string) => {
    const digits = sanitizeNumber(value).slice(0, 11);
    if (digits.length <= 10) {
      return digits
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
    }
    return digits
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
  };

  const MS_IN_DAY = 1000 * 60 * 60 * 24;

  const formatDateLong = (value?: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const calculateDaysLeft = (value?: string | null) => {
    if (!value) return null;
    const target = new Date(value);
    if (Number.isNaN(target.getTime())) return null;
    return Math.max(0, Math.ceil((target.getTime() - Date.now()) / MS_IN_DAY));
  };
  const CARD_FIELD_ERROR_MAP: Record<keyof typeof cardData, string> = {
    holderName: 'cardHolderName',
    number: 'cardNumber',
    expiryMonth: 'expiryMonth',
    expiryYear: 'expiryYear',
    ccv: 'cvv',
  };

  const handleCardChange = (field: keyof typeof cardData, value: string) => {
    let formattedValue = value;

    switch (field) {
      case 'number':
        formattedValue = maskCardNumber(value);
        break;
      case 'expiryMonth': {
        // CORREÇÃO: Validar que o mês está entre 1 e 12
        formattedValue = maskExpiryValue(value);
        const monthDigits = sanitizeNumber(formattedValue);
        if (monthDigits.length === 2) {
          const monthNumber = Number(monthDigits);
          // Se o valor for maior que 12, manter apenas o primeiro dígito
          if (monthNumber > 12) {
            formattedValue = monthDigits[0];
          }
        }
        break;
      }
      case 'expiryYear':
        formattedValue = maskExpiryValue(value);
        break;
      case 'ccv':
        formattedValue = maskCvv(value);
        break;
      default:
        break;
    }

    setCardData(prev => {
      const newData = { ...prev, [field]: formattedValue };
      return newData;
    });
    setPaymentError(null);
    setFormErrors(prev => {
      const errorKey = CARD_FIELD_ERROR_MAP[field];
      if (!(errorKey in prev)) {
        return prev;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [errorKey]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleCardHolderChange = (
    field: keyof typeof cardHolderData,
    value: string
  ) => {
    let formattedValue = value;

    if (field === 'cpfCnpj') {
      formattedValue = maskCpfCnpj(value);
    } else if (field === 'postalCode') {
      formattedValue = maskPostalCode(value);
    } else if (field === 'mobilePhone' || field === 'phone') {
      formattedValue = maskPhoneNumber(value);
    }

    setCardHolderData(prev => {
      const newData = { ...prev, [field]: formattedValue };
      return newData;
    });
    setPaymentError(null);
    setFormErrors(prev => {
      if (!(field in prev)) {
        return prev;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [field]: _, ...rest } = prev;
      return rest;
    });

    // Buscar endereço automaticamente quando CEP for preenchido (com debounce)
    if (field === 'postalCode' && formattedValue) {
      if (cepTimeout) {
        clearTimeout(cepTimeout);
      }

      const cleanCEP = formattedValue.replace(/\D/g, '');
      if (cleanCEP.length === 8) {
        const timeout = setTimeout(() => {
          searchByZipCode(formattedValue);
        }, 500); // 500ms de delay

        setCepTimeout(timeout);
      }
    }
  };

  // Função para verificar se o formulário está válido (sem mostrar erros)
  const isFormValid = useMemo(() => {
    try {

      // Validação do cartão
      if (!cardData?.holderName?.trim()) {
        return false;
      }
      const cardNumberDigits = sanitizeNumber(cardData.number || '');
      if (cardNumberDigits.length < 13 || cardNumberDigits.length > 16) {
        return false;
      }

      const monthDigits = sanitizeNumber(cardData.expiryMonth || '');
      const yearDigits = sanitizeNumber(cardData.expiryYear || '');
      const monthNumber = Number(monthDigits);
      // CORREÇÃO: Aceitar 1 ou 2 dígitos, mas validar que o valor está entre 1-12
      if (
        monthDigits.length === 0 ||
        Number.isNaN(monthNumber) ||
        monthNumber < 1 ||
        monthNumber > 12
      ) {
        return false;
      }
      // Se tiver apenas 1 dígito, ainda é válido (será formatado para 2 dígitos no submit)

      if (yearDigits.length !== 2) {
        return false;
      }
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const yearNumber = Number(yearDigits);
      // CORREÇÃO: Calcular o ano completo de forma mais inteligente
      const century = Math.floor(currentYear / 100) * 100; // Ex: 2026 -> 2000
      let fullYear = century + yearNumber; // Ex: 2000 + 23 = 2023

      // Se o ano calculado já passou, verificar se deve ser do próximo século
      if (fullYear < currentYear) {
        // Se a diferença for pequena (menos de 10 anos), provavelmente é um erro
        // Se a diferença for grande, pode ser do próximo século, mas limitar a 20 anos no futuro
        const diff = currentYear - fullYear;
        if (diff <= 10) {
          // Diferença pequena: provavelmente é um erro ou cartão expirado
          // Não ajustar, deixar como está para ser rejeitado na validação de expiração
        } else {
          // Diferença grande: pode ser do próximo século, mas verificar se não fica muito distante
          const nextCenturyYear = fullYear + 100;
          if (nextCenturyYear - currentYear <= 20) {
            fullYear = nextCenturyYear;
          } else {
            // Muito distante no futuro, rejeitar
            return false;
          }
        }
      }

      // CORREÇÃO: Validar se não está muito no futuro (máximo 20 anos - mais razoável para cartões)
      if (fullYear - currentYear > 20) {
        return false;
      }

      // Validar se não está expirado
      if (fullYear === currentYear && monthNumber < currentMonth) {
        return false;
      }

      // Se o ano está no passado (mesmo após ajustes), rejeitar
      if (fullYear < currentYear) {
        return false;
      }

      const cvvDigits = sanitizeNumber(cardData.ccv || '');
      if (cvvDigits.length < 3 || cvvDigits.length > 4) {
        return false;
      }

      // Validação do titular
      if (!cardHolderData?.name?.trim()) {
        return false;
      }
      const emailValue = (cardHolderData.email || '').trim();
      if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
        return false;
      }

      const cpfCnpjDigits = sanitizeNumber(cardHolderData.cpfCnpj || '');
      if (cpfCnpjDigits.length !== 11 && cpfCnpjDigits.length !== 14) {
        return false;
      }

      const postalCodeDigits = sanitizeNumber(cardHolderData.postalCode || '');
      if (postalCodeDigits.length !== 8) {
        return false;
      }
      if (!cardHolderData.addressNumber?.trim()) {
        return false;
      }

      const mobileDigits = sanitizeNumber(cardHolderData.mobilePhone || '');
      if (mobileDigits.length !== 11) {
        return false;
      }

      // CORREÇÃO: Telefone fixo é opcional, mas se preenchido deve ter pelo menos 10 dígitos
      // Verificar se está vazio ou tem valor válido
      const phoneTrimmed = (cardHolderData.phone || '').trim();
      const phoneDigits = sanitizeNumber(phoneTrimmed);
      // Se tiver algum valor (não vazio), deve ter pelo menos 10 dígitos e no máximo 11
      if (phoneTrimmed.length > 0) {
        if (phoneDigits.length < 10 || phoneDigits.length > 11) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('❌ [isFormValid] Erro na validação do formulário:', error);
      return false;
    }
  }, [cardData, cardHolderData]);

  const validatePaymentForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!cardData.holderName.trim()) {
      errors.cardHolderName = 'Informe o nome impresso no cartão';
    }
    const cardNumberDigits = sanitizeNumber(cardData.number);
    if (cardNumberDigits.length < 13 || cardNumberDigits.length > 16) {
      errors.cardNumber = 'Número de cartão inválido';
    }
    const monthDigits = sanitizeNumber(cardData.expiryMonth);
    const yearDigits = sanitizeNumber(cardData.expiryYear);
    const monthNumber = Number(monthDigits);
    // CORREÇÃO: Aceitar 1 ou 2 dígitos, mas validar que o valor está entre 1-12
    if (
      monthDigits.length === 0 ||
      Number.isNaN(monthNumber) ||
      monthNumber < 1 ||
      monthNumber > 12
    ) {
      errors.expiryMonth = 'Mês inválido';
    }
    if (yearDigits.length !== 2) {
      errors.expiryYear = 'Ano inválido';
    } else {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const yearNumber = Number(yearDigits);
      const century = Math.floor(currentYear / 100) * 100;
      let fullYear = century + yearNumber;
      if (fullYear < currentYear) {
        fullYear += 100;
      }
      if (!errors.expiryMonth) {
        if (fullYear === currentYear && monthNumber < currentMonth) {
          errors.expiryMonth = 'Cartão expirado';
        } else if (fullYear - currentYear > 20) {
          errors.expiryYear = 'Ano inválido';
        }
      }
    }
    const cvvDigits = sanitizeNumber(cardData.ccv);
    if (cvvDigits.length < 3 || cvvDigits.length > 4) {
      errors.cvv = 'CVV inválido';
    }

    if (!cardHolderData.name.trim()) {
      errors.holderName = 'Informe o nome do titular';
    }
    const emailValue = cardHolderData.email.trim();
    if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      errors.email = 'Informe um e-mail válido';
    }
    const cpfCnpjDigits = sanitizeNumber(cardHolderData.cpfCnpj);
    if (cpfCnpjDigits.length !== 11 && cpfCnpjDigits.length !== 14) {
      errors.cpfCnpj = 'CPF/CNPJ inválido';
    }
    if (sanitizeNumber(cardHolderData.postalCode).length !== 8) {
      errors.postalCode = 'CEP inválido';
    }
    if (!cardHolderData.addressNumber.trim()) {
      errors.addressNumber = 'Informe o número';
    }
    const mobileDigits = sanitizeNumber(cardHolderData.mobilePhone);
    if (mobileDigits.length !== 11) {
      errors.mobilePhone = 'Telefone celular inválido';
    }
    const phoneDigits = sanitizeNumber(cardHolderData.phone);
    if (phoneDigits.length > 0 && phoneDigits.length < 10) {
      errors.phone = 'Telefone fixo inválido';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSelectPlan = (plan: PricingPlanWithBackend) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
    setPaymentError(null);
    setPaymentSuccess(false);
    setTrialEnabled(Boolean((plan.trialDays ?? 7) > 0));
  };

  const togglePlanExpansion = (planId: string) => {
    setExpandedPlans(prev => {
      const newSet = new Set(prev);
      if (newSet.has(planId)) {
        newSet.delete(planId);
      } else {
        newSet.add(planId);
      }
      return newSet;
    });
  };

  const toggleModulesExpansion = (planId: string) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(planId)) {
        newSet.delete(planId);
      } else {
        newSet.add(planId);
      }
      return newSet;
    });
  };

  const handleSubmitPayment = async () => {
    if (!selectedPlan) return;

    if (activePaymentMethod !== 'credit_card') {
      setPaymentError('Selecione o cartão de crédito para continuar.');
      return;
    }

    if (!selectedPlan.backendPlanId) {
      setPaymentError(
        'Não foi possível identificar o plano selecionado. Atualize a página e tente novamente.'
      );
      return;
    }

    if (!validatePaymentForm()) {
      setPaymentError('Revise os campos destacados e tente novamente.');
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const status = await createSubscription({
        planId: selectedPlan.backendPlanId,
        card: {
          holderName: cardData.holderName.trim(),
          number: sanitizeNumber(cardData.number),
          // CORREÇÃO: Garantir que o mês tenha 2 dígitos (ex: "3" -> "03")
          expiryMonth: sanitizeNumber(cardData.expiryMonth).padStart(2, '0'),
          expiryYear: cardData.expiryYear,
          ccv: sanitizeNumber(cardData.ccv),
        },
        cardHolder: {
          name: cardHolderData.name.trim(),
          email: cardHolderData.email.trim(),
          cpfCnpj: sanitizeNumber(cardHolderData.cpfCnpj),
          postalCode: sanitizeNumber(cardHolderData.postalCode),
          addressNumber: cardHolderData.addressNumber.trim(),
          addressComplement:
            cardHolderData.addressComplement?.trim() || undefined,
          mobilePhone: sanitizeNumber(cardHolderData.mobilePhone),
          phone: cardHolderData.phone
            ? sanitizeNumber(cardHolderData.phone)
            : undefined,
        },
        remoteIp: clientIp ?? undefined,
        trialDays: trialEnabled ? (selectedPlan.trialDays ?? 7) : 0,
      });

      setTrialSummary({
        trialEndsAt: status?.subscription?.trialEndsAt,
        nextBillingDate: status?.subscription?.nextPaymentDate ?? null,
        trialDays: trialEnabled ? (selectedPlan.trialDays ?? 7) : 0,
        autoRenew: status?.subscription?.autoRenew ?? true,
      });

      setPaymentSuccess(true);
      await loadSubscriptionStatus();

      const hasCompanySelected = Boolean(
        localStorage.getItem('dream_keys_selected_company_id')
      );
      const redirectPath = hasCompanySelected
        ? '/dashboard'
        : '/verifying-access';

      setTimeout(() => {
        navigate(redirectPath);
      }, 3000);
    } catch (error: any) {
      setTrialSummary(null);
      const message =
        error?.response?.data?.message ??
        error?.message ??
        'Erro ao processar pagamento. Tente novamente.';
      setPaymentError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isProcessing) return;

    const isValid = validatePaymentForm();
    if (!isValid) {
      setPaymentError('Revise os campos destacados e tente novamente.');
      return;
    }

    if (!termsAccepted) {
      setTermsError('É necessário aceitar os Termos de Uso para continuar.');
      return;
    }

    setPaymentError(null);
    setTermsError(null);
    setShowConfirmationModal(true);
  };

  const handleConfirmSubscription = () => {
    if (isProcessing) return;
    setShowConfirmationModal(false);
    handleSubmitPayment();
  };

  const handleCancelConfirmation = () => {
    if (isProcessing) return;
    setShowConfirmationModal(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  type PaymentMethodOption = {
    id: 'credit_card';
    name: string;
    description: string;
    icon: IconType;
    available: boolean;
    helper?: string;
  };

  const paymentMethods: PaymentMethodOption[] = [
    {
      id: 'credit_card',
      name: 'Cartão de Crédito',
      description: 'Visa, Mastercard, Elo',
      icon: MdCreditCard,
      available: true,
    },
  ];

  const trialEndsDisplay = formatDateLong(trialSummary?.trialEndsAt);
  const trialDaysLeft = calculateDaysLeft(trialSummary?.trialEndsAt);
  const nextBillingDisplay = formatDateLong(trialSummary?.nextBillingDate);
  const selectedPlanPriceValue = selectedPlan?.price
    ? Number(String(selectedPlan.price).replace(',', '.'))
    : 0;
  const selectedPlanPriceDisplay = selectedPlanPriceValue
    ? selectedPlanPriceValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
    : 'R$ 0,00';
  const selectedPlanTrialDays = selectedPlan?.trialDays ?? 0;

  if (loading) {
    return <SubscriptionPlansShimmer />;
  }

  if (error || !pricingData) {
    return (
      <S.Container>
        <S.Header>
          <S.LogoutButton onClick={handleLogout}>
            <MdLogout size={16} />
            Sair
          </S.LogoutButton>

          <S.Title>❌ Erro ao Carregar Planos</S.Title>
          <S.Subtitle>{error || 'Dados de pricing não disponíveis'}</S.Subtitle>

          <div
            style={{
              marginTop: '24px',
              padding: '20px',
              background:
                theme === 'dark'
                  ? 'rgba(30, 41, 59, 0.8)'
                  : 'var(--color-background-secondary)',
              borderRadius: '12px',
              maxWidth: '600px',
              margin: '24px auto',
              textAlign: 'left',
              border:
                theme === 'dark'
                  ? '1px solid rgba(148, 163, 184, 0.2)'
                  : 'none',
            }}
          >
            <p
              style={{
                margin: '0 0 12px 0',
                fontWeight: '600',
                color: theme === 'dark' ? '#e2e8f0' : 'var(--color-text)',
              }}
            >
              ⚠️ Possíveis causas:
            </p>
            <ul
              style={{
                margin: 0,
                paddingLeft: '20px',
                color:
                  theme === 'dark' ? '#cbd5e1' : 'var(--color-text-secondary)',
              }}
            >
              <li>
                Endpoint{' '}
                <code
                  style={{
                    background:
                      theme === 'dark'
                        ? 'rgba(148, 163, 184, 0.15)'
                        : 'rgba(0, 0, 0, 0.05)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    color: theme === 'dark' ? '#93c5fd' : 'inherit',
                  }}
                >
                  /plans/pricing-page
                </code>{' '}
                não implementado no backend
              </li>
              <li>Backend não está rodando</li>
              <li>Erro de autenticação ou permissões</li>
            </ul>

            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '20px',
                padding: '12px 24px',
                background:
                  theme === 'dark' ? '#3b82f6' : 'var(--color-primary)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                width: '100%',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background =
                  theme === 'dark' ? '#2563eb' : 'var(--color-primary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background =
                  theme === 'dark' ? '#3b82f6' : 'var(--color-primary)';
              }}
            >
              🔄 Tentar Novamente
            </button>
          </div>
        </S.Header>
      </S.Container>
    );
  }

  return (
    <S.Container>
      <S.Header>
        <S.LogoutButton onClick={handleLogout}>
          <MdLogout size={16} />
          Sair
        </S.LogoutButton>

        <S.Title>Escolha seu Plano</S.Title>
        <S.Subtitle>
          {isBeta
            ? 'Soluções completas para gestão imobiliária.'
            : 'Soluções completas para gestão imobiliária. Comece grátis por 7 dias.'}
        </S.Subtitle>
      </S.Header>

      {isBeta ? (
        <S.BetaWarningCard>
          <S.BetaWarningIcon>🚀</S.BetaWarningIcon>
          <S.BetaWarningContent>
            <S.BetaWarningTitle>Período de Lançamento</S.BetaWarningTitle>
            <S.BetaWarningMessage>
              Estamos em fase de lançamento e aprimoramento contínuo do sistema.
              Durante este período inicial, você pode encontrar pequenas
              instabilidades que são corrigidas continuamente pela nossa equipe.
            </S.BetaWarningMessage>
            <S.BetaWarningHighlight>
              <strong>
                Acesso completo sem custos de assinatura durante o período de
                lançamento.
              </strong>
            </S.BetaWarningHighlight>
            <S.BetaWarningFooter>
              Para validar seu cartão, será realizada uma cobrança simbólica de{' '}
              <strong>R$ 5,00</strong> que será estornada automaticamente logo
              após a confirmação. O período de teste acaba em{' '}
              <strong>11 de março</strong>. Nossos usuários serão notificados
              com <strong>30 dias de antecedência</strong> sobre o início da
              cobrança, garantindo transparência total no processo de transição.
            </S.BetaWarningFooter>
          </S.BetaWarningContent>
        </S.BetaWarningCard>
      ) : (
        <S.TrialNotice>
          <strong>Período de teste gratuito:</strong> escolha qualquer plano e
          experimente todas as funcionalidades por 7 dias antes de ser cobrado.
          Caso não queira continuar, cancele antes do término do período de
          avaliação.
        </S.TrialNotice>
      )}

      {availablePlansError && (
        <S.TrialError>{availablePlansError}</S.TrialError>
      )}

      <div style={{ height: '24px' }} />

      <S.PlansGrid data-scroll-to='plans'>
        {pricingData &&
          Object.entries(pricingData.plans).map(([key, plan]) => {
            const isCustomPlan = key === 'custom';
            const planAny = plan as any;

            const price = isCustomPlan ? planAny.basePrice : planAny.price;

            const normalizedKey = key.toLowerCase();
            const normalizedPlanName = plan.name.toLowerCase();
            const PLAN_TYPE_ALIASES: Record<string, string[]> = {
              basic: ['basic', 'starter', 'essencial'],
              professional: ['pro', 'professional', 'profissional', 'business'],
              custom: ['custom', 'personalizado'],
            };
            const aliases = PLAN_TYPE_ALIASES[normalizedKey] ?? [normalizedKey];

            const backendPlan = availablePlans.find(candidate => {
              const type = (candidate.type ?? '').toString().toLowerCase();
              const id = (candidate.id ?? '').toString().toLowerCase();
              const name = (candidate.name ?? '').toString().toLowerCase();
              return (
                aliases.includes(type) ||
                aliases.includes(id) ||
                id === normalizedKey ||
                name === normalizedPlanName ||
                aliases.some(alias => name.includes(alias))
              );
            });

            const trialDaysValue =
              backendPlan?.trialDays ??
              (typeof planAny.trialDays === 'number' ? planAny.trialDays : 7);

            /**
             * Lógica de módulos por plano:
             * 1. Tenta usar os módulos da API /plans/modules-by-plan (nova API)
             * 2. Se não disponível, usa os módulos do pricingData (fallback)
             *
             * A nova API retorna módulos com código e nome completo, enquanto
             * o pricingData pode ter uma estrutura diferente.
             */
            let modulesForPlan = planAny.modules?.map((m: any) => m.code) || [];
            let modulesListForDisplay = planAny.modules || [];

            // Se a nova API retornou dados e é plano basic ou pro/professional, usar esses dados
            if (planModulesData) {
              // Determinar a chave do plano na API baseado nos aliases
              // A API usa 'basic' e 'pro', mas o pricingData pode usar outros nomes
              let planTypeKey: 'basic' | 'pro' | null = null;

              if (
                aliases.some(alias =>
                  ['basic', 'starter', 'essencial'].includes(alias)
                )
              ) {
                planTypeKey = 'basic';
              } else if (
                aliases.some(alias =>
                  ['pro', 'professional', 'profissional', 'business'].includes(
                    alias
                  )
                )
              ) {
                planTypeKey = 'pro';
              }

              // Se encontrou o tipo do plano na API, usar os módulos da API
              // Isso garante que sempre temos os módulos mais atualizados do backend
              if (planTypeKey && planModulesData[planTypeKey]) {
                const apiPlanData = planModulesData[planTypeKey];

                if (
                  apiPlanData &&
                  apiPlanData.modules &&
                  apiPlanData.modules.length > 0
                ) {
                  modulesForPlan = apiPlanData.modules.map(
                    (m: { code: string; name: string }) => m.code
                  );
                  modulesListForDisplay = apiPlanData.modules.map(
                    (m: { code: string; name: string }) => ({
                      code: m.code,
                      name: m.name,
                    })
                  );
                }
              }
            }

            const planData: PricingPlanWithBackend = {
              id: key,
              name: plan.name,
              description: plan.description,
              price:
                typeof price === 'number'
                  ? price
                  : Number(String(price).replace(',', '.')) || 0,
              currency: 'BRL',
              interval: 'monthly',
              features: planAny.features || [],
              supportLevel:
                normalizedKey === 'basic'
                  ? 'basic'
                  : normalizedKey === 'professional' || normalizedKey === 'pro'
                    ? 'priority'
                    : 'basic',
              isPopular: planAny.popular || false,
              modules: modulesForPlan,
              backendPlanId: backendPlan?.id,
              trialDays: trialDaysValue,
              maxUsers: planAny.maxUsers,
              maxProperties: planAny.maxProperties,
              maxCompanies: planAny.maxCompanies,
              maxStorage: planAny.maxStorage,
              billingType: planAny.billingType || 'monthly',
            };

            const isExpanded = expandedPlans.has(key);
            const isPlanAvailable =
              isCustomPlan || Boolean(planData.backendPlanId);
            const primaryActionLabel = isCustomPlan
              ? 'Personalizar Plano'
              : isBeta
                ? 'Confirmar Acesso'
                : trialDaysValue > 0
                  ? 'Iniciar teste grátis'
                  : 'Assinar agora';
            const shouldShowToggle = (planAny.features?.length || 0) > 6;
            const featuresToShow =
              shouldShowToggle && !isExpanded
                ? planAny.features.slice(0, 6)
                : planAny.features;

            return (
              <S.PlanCard
                key={key}
                $isPopular={planData.isPopular}
                $featureCount={planAny.features?.length || 0}
              >
                {planData.isPopular && (
                  <S.PopularBadge>
                    <MdStar size={14} />
                    Mais Popular
                  </S.PopularBadge>
                )}

                {isCustomPlan && (
                  <S.PopularBadge
                    style={{
                      background:
                        theme === 'dark'
                          ? 'linear-gradient(135deg, #7c3aed, #6366f1)'
                          : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                    }}
                  >
                    ⚙️ Personalizável
                  </S.PopularBadge>
                )}

                {!isBeta && (trialDaysValue ?? 0) > 0 && (
                  <S.TrialTag>{trialDaysValue} dias de teste grátis</S.TrialTag>
                )}

                <S.PlanHeader>
                  <S.PlanName>{plan.name}</S.PlanName>
                  <S.PlanDescription>{plan.description}</S.PlanDescription>

                  {!isCustomPlan ? (
                    <S.PlanPrice>
                      <S.Currency>R$</S.Currency>
                      <S.Price>{price.toFixed(2).replace('.', ',')}</S.Price>
                      <S.Period>/mês</S.Period>
                    </S.PlanPrice>
                  ) : (
                    <S.PlanPrice>
                      <S.Currency>A partir de R$</S.Currency>
                      <S.Price>{price.toFixed(2).replace('.', ',')}</S.Price>
                      <S.Period>/mês</S.Period>
                    </S.PlanPrice>
                  )}

                  {!isCustomPlan && planAny.discountPercentage > 0 && (
                    <div
                      style={{
                        fontSize: '0.875rem',
                        color:
                          theme === 'dark' ? '#4ade80' : 'var(--color-success)',
                        marginTop: '8px',
                        fontWeight: '600',
                      }}
                    >
                      💰 {planAny.discountPercentage}% de desconto
                    </div>
                  )}
                </S.PlanHeader>

                <S.FeaturesList>
                  {featuresToShow.map((feature: string, index: number) => (
                    <S.FeatureItem key={index}>
                      <S.FeatureIcon $included={true}>
                        <MdCheck size={12} />
                      </S.FeatureIcon>
                      {feature}
                    </S.FeatureItem>
                  ))}

                  {shouldShowToggle && (
                    <S.ShowMoreButton onClick={() => togglePlanExpansion(key)}>
                      {isExpanded
                        ? 'Ver menos'
                        : `Ver mais ${(planAny.features?.length || 0) - 6} recursos`}
                    </S.ShowMoreButton>
                  )}
                </S.FeaturesList>

                {!isCustomPlan &&
                  modulesListForDisplay &&
                  modulesListForDisplay.length > 0 &&
                  (() => {
                    const isModulesExpanded = expandedModules.has(key);
                    const list = modulesListForDisplay.map(
                      (m: { code: string; name: string }) => ({
                        code: m.code,
                        name: String(m.name)
                          .replace('Gerenciamento de ', '')
                          .replace('Gestão de ', '')
                          .replace('Sistema de ', ''),
                        cat: getModuleCategory(String(m.name)),
                      })
                    );

                    // Agrupa todos os módulos por categoria
                    const groupedAll: Record<
                      string,
                      { code: string; name: string }[]
                    > = {};
                    for (const item of list) {
                      if (!groupedAll[item.cat]) groupedAll[item.cat] = [];
                      groupedAll[item.cat].push({
                        code: item.code,
                        name: item.name,
                      });
                    }

                    // Seleciona até 3 módulos totais quando colapsado (não por categoria)
                    let visibleCount = 0;
                    const groupedVisible: Record<
                      string,
                      { code: string; name: string }[]
                    > = {};
                    if (!isModulesExpanded) {
                      for (const item of list) {
                        if (visibleCount >= 3) break;
                        if (!groupedVisible[item.cat])
                          groupedVisible[item.cat] = [];
                        groupedVisible[item.cat].push({
                          code: item.code,
                          name: item.name,
                        });
                        visibleCount += 1;
                      }
                    }

                    const cats = Object.keys(
                      isModulesExpanded ? groupedAll : groupedVisible
                    );
                    const remainingTotal = Math.max(
                      0,
                      list.length -
                        (isModulesExpanded
                          ? list.length
                          : Math.min(3, list.length))
                    );

                    return (
                      <div
                        style={{
                          marginBottom: '16px',
                          paddingTop: '12px',
                          borderTop: `1px solid ${theme === 'dark' ? 'rgba(148, 163, 184, 0.2)' : 'var(--color-border)'}`,
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            color:
                              theme === 'dark'
                                ? '#cbd5e1'
                                : 'var(--color-text-secondary)',
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}
                        >
                          Módulos Incluídos
                        </div>

                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr',
                            gap: '6px',
                          }}
                        >
                          {cats.map(cat => {
                            const items =
                              (isModulesExpanded ? groupedAll : groupedVisible)[
                                cat
                              ] || [];
                            return (
                              <div key={cat}>
                                <div
                                  style={{
                                    fontSize: '0.75rem',
                                    color:
                                      theme === 'dark'
                                        ? '#cbd5e1'
                                        : 'var(--color-text-secondary)',
                                    marginBottom: '2px',
                                    fontWeight: 600,
                                  }}
                                >
                                  {cat}
                                </div>
                                <div
                                  style={{
                                    fontSize: '0.85rem',
                                    color:
                                      theme === 'dark'
                                        ? '#e2e8f0'
                                        : 'var(--color-text)',
                                    lineHeight: '1.5',
                                  }}
                                >
                                  {items.map((m, idx) => (
                                    <span key={m.code}>
                                      {m.name}
                                      {idx < items.length - 1 ? ', ' : ''}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {!isModulesExpanded && remainingTotal > 0 && (
                          <div style={{ marginTop: '6px' }}>
                            <button
                              style={{
                                background: 'none',
                                border: 'none',
                                color:
                                  theme === 'dark'
                                    ? '#60a5fa'
                                    : 'var(--color-primary)',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                textDecoration: 'underline',
                                padding: 0,
                                transition: 'color 0.2s ease',
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.color =
                                  theme === 'dark'
                                    ? '#93c5fd'
                                    : 'var(--color-primary)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.color =
                                  theme === 'dark'
                                    ? '#60a5fa'
                                    : 'var(--color-primary)';
                              }}
                              onClick={() => toggleModulesExpansion(key)}
                            >
                              ver mais {remainingTotal}
                            </button>
                          </div>
                        )}

                        {isModulesExpanded && (
                          <div style={{ marginTop: '8px' }}>
                            <button
                              style={{
                                background: 'none',
                                border: 'none',
                                color:
                                  theme === 'dark'
                                    ? '#60a5fa'
                                    : 'var(--color-primary)',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                textDecoration: 'underline',
                                padding: 0,
                                transition: 'color 0.2s ease',
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.color =
                                  theme === 'dark'
                                    ? '#93c5fd'
                                    : 'var(--color-primary)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.color =
                                  theme === 'dark'
                                    ? '#60a5fa'
                                    : 'var(--color-primary)';
                              }}
                              onClick={() => toggleModulesExpansion(key)}
                            >
                              ver menos
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                <S.SelectButton
                  $isPopular={planData.isPopular || isCustomPlan}
                  disabled={!isPlanAvailable}
                  title={
                    !isPlanAvailable
                      ? 'Plano temporariamente indisponível. Tente novamente mais tarde.'
                      : undefined
                  }
                  onClick={() => {
                    if (!isPlanAvailable) return;
                    if (isCustomPlan) {
                      setShowCustomPlanModal(true);
                    } else {
                      handleSelectPlan(planData);
                    }
                  }}
                >
                  {isPlanAvailable ? primaryActionLabel : 'Indisponível'}
                </S.SelectButton>
              </S.PlanCard>
            );
          })}
      </S.PlansGrid>

      <S.PaymentModal
        $isOpen={showPaymentModal}
        onClick={() => {
          setShowPaymentModal(false);
          setShowConfirmationModal(false);
        }}
      >
        <S.PaymentContent onClick={e => e.stopPropagation()}>
          <S.PaymentTitle>
            {paymentSuccess
              ? 'Pagamento Processado! ✅'
              : `Selecione o método de pagamento`}
          </S.PaymentTitle>

          {!paymentSuccess && !isProcessing && (
            <>
              <S.PaymentMethods>
                {paymentMethods.map(method => {
                  const isSelected = activePaymentMethod === method.id;
                  return (
                    <S.PaymentMethodButton
                      key={method.id}
                      type='button'
                      $selected={isSelected}
                      $disabled={!method.available || isProcessing}
                      onClick={() => {
                        if (!method.available) {
                          setPaymentError(
                            method.helper ?? 'Método indisponível no momento.'
                          );
                          return;
                        }
                        setActivePaymentMethod(
                          method.id === 'credit_card' ? 'credit_card' : null
                        );
                        setPaymentError(null);
                      }}
                    >
                      <method.icon size={24} />
                      <div style={{ textAlign: 'left', flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: '1rem',
                            color:
                              theme === 'dark'
                                ? '#e2e8f0'
                                : 'var(--color-text)',
                          }}
                        >
                          {method.name}
                        </div>
                        <div
                          style={{
                            fontSize: '0.875rem',
                            color:
                              theme === 'dark'
                                ? '#cbd5e1'
                                : 'var(--color-text-secondary)',
                          }}
                        >
                          {method.description}
                        </div>
                        {!method.available && method.helper && (
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color:
                                theme === 'dark'
                                  ? '#94a3b8'
                                  : 'var(--color-text-secondary)',
                              marginTop: 4,
                            }}
                          >
                            {method.helper}
                          </div>
                        )}
                      </div>
                    </S.PaymentMethodButton>
                  );
                })}
              </S.PaymentMethods>

              {activePaymentMethod === 'credit_card' && (
                <>
                  {isBeta && (
                    <S.BetaWarningCard>
                      <S.BetaWarningIcon>🚀</S.BetaWarningIcon>
                      <S.BetaWarningContent>
                        <S.BetaWarningTitle>
                          Período de Lançamento
                        </S.BetaWarningTitle>
                        <S.BetaWarningMessage>
                          Estamos em fase de lançamento e aprimoramento contínuo
                          do sistema. Durante este período inicial, você pode
                          encontrar pequenas instabilidades que são corrigidas
                          continuamente pela nossa equipe.
                        </S.BetaWarningMessage>
                        <S.BetaWarningHighlight>
                          <strong>
                            Acesso completo sem custos de assinatura durante o
                            período de lançamento.
                          </strong>
                        </S.BetaWarningHighlight>
                        <S.BetaWarningFooter>
                          Para validar seu cartão, será realizada uma cobrança
                          simbólica de <strong>R$ 5,00</strong> que será
                          estornada automaticamente logo após a confirmação. O
                          período de teste acaba em <strong>11 de março</strong>
                          . Nossos usuários serão notificados com{' '}
                          <strong>30 dias de antecedência</strong> sobre o
                          início da cobrança, garantindo transparência total no
                          processo de transição.
                        </S.BetaWarningFooter>
                      </S.BetaWarningContent>
                    </S.BetaWarningCard>
                  )}

                  {!isBeta && (
                    <S.TrialContainer>
                      <div>
                        <S.TrialTitle>Teste grátis de 7 dias</S.TrialTitle>
                        <S.TrialDescription>
                          Você pode iniciar com um período de avaliação antes da
                          cobrança. O plano escolhido será renovado
                          automaticamente após o teste.
                        </S.TrialDescription>
                      </div>
                      <S.TrialToggle>
                        <S.ToggleLabel $active={trialEnabled}>
                          <S.ToggleInput
                            type='checkbox'
                            checked={trialEnabled}
                            onChange={event =>
                              setTrialEnabled(event.target.checked)
                            }
                          />
                          <S.ToggleSlider $active={trialEnabled} />
                        </S.ToggleLabel>
                      </S.TrialToggle>
                    </S.TrialContainer>
                  )}

                  {!isBeta && (
                    <S.TrialNote $active={trialEnabled}>
                      {trialEnabled
                        ? 'Para liberar o teste gratuito será feita uma cobrança simbólica de R$ 5,00 para validar seu cartão. O valor é estornado automaticamente logo após a confirmação e você permanece com 7 dias sem custo.'
                        : 'Ao confirmar, o valor integral do plano será cobrado imediatamente no cartão informado.'}
                    </S.TrialNote>
                  )}

                  {isBeta && (
                    <S.TrialNote $active={true}>
                      <strong>Período de Lançamento:</strong> Para validar seu
                      cartão, será realizada uma cobrança simbólica de
                      <strong> R$ 5,00</strong> que será estornada
                      automaticamente logo após a confirmação. O período de
                      teste acaba em <strong>11 de março</strong>. Nenhuma
                      cobrança de assinatura será realizada durante este período
                      inicial.
                    </S.TrialNote>
                  )}

                  <S.PaymentForm onSubmit={handlePaymentFormSubmit}>
                    <S.FormField>
                      <S.Label>
                        Nome impresso no cartão{' '}
                        <S.RequiredAsterisk>*</S.RequiredAsterisk>
                      </S.Label>
                      <S.Input
                        placeholder='João da Silva'
                        value={cardData.holderName}
                        onChange={e =>
                          handleCardChange('holderName', e.target.value)
                        }
                        autoComplete='cc-name'
                        required
                      />
                      {formErrors.cardHolderName && (
                        <S.ErrorMessage>
                          {formErrors.cardHolderName}
                        </S.ErrorMessage>
                      )}
                    </S.FormField>

                    <S.FormField>
                      <S.Label>
                        Número do cartão{' '}
                        <S.RequiredAsterisk>*</S.RequiredAsterisk>
                      </S.Label>
                      <S.Input
                        placeholder='4111 1111 1111 1111'
                        value={cardData.number}
                        onChange={e =>
                          handleCardChange('number', e.target.value)
                        }
                        autoComplete='cc-number'
                        inputMode='numeric'
                        required
                      />
                      {formErrors.cardNumber && (
                        <S.ErrorMessage>{formErrors.cardNumber}</S.ErrorMessage>
                      )}
                    </S.FormField>

                    <S.FormFieldRow>
                      <S.FormField>
                        <S.Label>
                          Validade (mês){' '}
                          <S.RequiredAsterisk>*</S.RequiredAsterisk>
                        </S.Label>
                        <S.Input
                          placeholder='08'
                          value={cardData.expiryMonth}
                          onChange={e =>
                            handleCardChange('expiryMonth', e.target.value)
                          }
                          maxLength={2}
                          inputMode='numeric'
                          autoComplete='cc-exp-month'
                          required
                        />
                        {formErrors.expiryMonth && (
                          <S.ErrorMessage>
                            {formErrors.expiryMonth}
                          </S.ErrorMessage>
                        )}
                      </S.FormField>
                      <S.FormField>
                        <S.Label>
                          Validade (ano){' '}
                          <S.RequiredAsterisk>*</S.RequiredAsterisk>
                        </S.Label>
                        <S.Input
                          placeholder='29'
                          value={cardData.expiryYear}
                          onChange={e =>
                            handleCardChange('expiryYear', e.target.value)
                          }
                          maxLength={2}
                          inputMode='numeric'
                          autoComplete='cc-exp-year'
                          required
                        />
                        {formErrors.expiryYear && (
                          <S.ErrorMessage>
                            {formErrors.expiryYear}
                          </S.ErrorMessage>
                        )}
                      </S.FormField>
                      <S.FormField>
                        <S.Label>
                          CVV <S.RequiredAsterisk>*</S.RequiredAsterisk>
                        </S.Label>
                        <S.Input
                          placeholder='123'
                          value={cardData.ccv}
                          onChange={e =>
                            handleCardChange('ccv', e.target.value)
                          }
                          maxLength={4}
                          inputMode='numeric'
                          autoComplete='cc-csc'
                          required
                        />
                        {formErrors.cvv && (
                          <S.ErrorMessage>{formErrors.cvv}</S.ErrorMessage>
                        )}
                      </S.FormField>
                    </S.FormFieldRow>

                    <S.FormFieldRow>
                      <S.FormField>
                        <S.Label>
                          Nome completo do titular{' '}
                          <S.RequiredAsterisk>*</S.RequiredAsterisk>
                        </S.Label>
                        <S.Input
                          placeholder='João da Silva'
                          value={cardHolderData.name}
                          onChange={e =>
                            handleCardHolderChange('name', e.target.value)
                          }
                          autoComplete='name'
                          required
                        />
                        {formErrors.holderName && (
                          <S.ErrorMessage>
                            {formErrors.holderName}
                          </S.ErrorMessage>
                        )}
                      </S.FormField>
                      <S.FormField>
                        <S.Label>
                          E-mail do titular{' '}
                          <S.RequiredAsterisk>*</S.RequiredAsterisk>
                        </S.Label>
                        <S.Input
                          placeholder='joao.silva@example.com'
                          value={cardHolderData.email}
                          onChange={e =>
                            handleCardHolderChange('email', e.target.value)
                          }
                          autoComplete='email'
                          type='email'
                          required
                        />
                        {formErrors.email && (
                          <S.ErrorMessage>{formErrors.email}</S.ErrorMessage>
                        )}
                      </S.FormField>
                    </S.FormFieldRow>

                    <S.FormFieldRow>
                      <S.FormField>
                        <S.Label>
                          CPF/CNPJ <S.RequiredAsterisk>*</S.RequiredAsterisk>
                        </S.Label>
                        <S.Input
                          placeholder='123.456.789-01'
                          value={cardHolderData.cpfCnpj}
                          onChange={e =>
                            handleCardHolderChange('cpfCnpj', e.target.value)
                          }
                          inputMode='numeric'
                          required
                        />
                        {formErrors.cpfCnpj && (
                          <S.ErrorMessage>{formErrors.cpfCnpj}</S.ErrorMessage>
                        )}
                      </S.FormField>
                      <S.FormField>
                        <S.Label>
                          Celular <S.RequiredAsterisk>*</S.RequiredAsterisk>
                        </S.Label>
                        <S.Input
                          placeholder='(48) 99999-9999'
                          value={cardHolderData.mobilePhone}
                          onChange={e =>
                            handleCardHolderChange(
                              'mobilePhone',
                              e.target.value
                            )
                          }
                          inputMode='tel'
                          autoComplete='tel-national'
                          required
                        />
                        {formErrors.mobilePhone && (
                          <S.ErrorMessage>
                            {formErrors.mobilePhone}
                          </S.ErrorMessage>
                        )}
                      </S.FormField>
                    </S.FormFieldRow>

                    <S.FormFieldRow>
                      <S.FormField>
                        <S.Label>
                          CEP <S.RequiredAsterisk>*</S.RequiredAsterisk>
                          {isLoadingCEP && (
                            <span
                              style={{
                                marginLeft: '8px',
                                fontSize: '0.75rem',
                                color: '#3b82f6',
                              }}
                            >
                              🔍 Buscando...
                            </span>
                          )}
                        </S.Label>
                        <S.Input
                          placeholder='88000-000'
                          value={cardHolderData.postalCode}
                          onChange={e =>
                            handleCardHolderChange('postalCode', e.target.value)
                          }
                          inputMode='numeric'
                          autoComplete='postal-code'
                          required
                          disabled={isLoadingCEP}
                        />
                        {formErrors.postalCode && (
                          <S.ErrorMessage>
                            {formErrors.postalCode}
                          </S.ErrorMessage>
                        )}
                        {cepError && (
                          <S.ErrorMessage>{cepError}</S.ErrorMessage>
                        )}
                        {addressData && !cepError && (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              color: '#10b981',
                              marginTop: '4px',
                              display: 'block',
                            }}
                          >
                            ✓ CEP encontrado
                          </span>
                        )}
                      </S.FormField>
                      <S.FormField>
                        <S.Label>
                          Número <S.RequiredAsterisk>*</S.RequiredAsterisk>
                        </S.Label>
                        <S.Input
                          placeholder='123'
                          value={cardHolderData.addressNumber}
                          onChange={e =>
                            handleCardHolderChange(
                              'addressNumber',
                              e.target.value
                            )
                          }
                          autoComplete='address-line2'
                          required
                        />
                        {formErrors.addressNumber && (
                          <S.ErrorMessage>
                            {formErrors.addressNumber}
                          </S.ErrorMessage>
                        )}
                      </S.FormField>
                      <S.FormField>
                        <S.Label>Complemento</S.Label>
                        <S.Input
                          placeholder='Apto 101'
                          value={cardHolderData.addressComplement}
                          onChange={e =>
                            handleCardHolderChange(
                              'addressComplement',
                              e.target.value
                            )
                          }
                          autoComplete='address-line3'
                        />
                      </S.FormField>
                      <S.FormField>
                        <S.Label>Telefone (opcional)</S.Label>
                        <S.Input
                          placeholder='(48) 3333-3333'
                          value={cardHolderData.phone}
                          onChange={e =>
                            handleCardHolderChange('phone', e.target.value)
                          }
                          inputMode='tel'
                        />
                        {formErrors.phone && (
                          <S.ErrorMessage>{formErrors.phone}</S.ErrorMessage>
                        )}
                      </S.FormField>
                    </S.FormFieldRow>

                    <S.TermsContainer>
                      <S.TermsCheckbox
                        id='terms-of-use'
                        type='checkbox'
                        checked={termsAccepted}
                        onChange={event => {
                          const checked = event.target.checked;
                          setTermsAccepted(checked);
                          if (checked) {
                            setTermsError(null);
                          }
                        }}
                      />
                      <S.TermsLabel htmlFor='terms-of-use'>
                        Eu li e aceito os{' '}
                        <S.TermsLink
                          href='/termos-de-uso'
                          target='_blank'
                          rel='noreferrer'
                        >
                          Termos de Uso
                        </S.TermsLink>{' '}
                        e autorizo a renovação automática do plano escolhido com
                        o cartão informado.
                      </S.TermsLabel>
                    </S.TermsContainer>
                    {termsError && <S.TermsError>{termsError}</S.TermsError>}

                    <S.SubmitButton
                      type='submit'
                      disabled={(() => {
                        const disabled =
                          isProcessing || !termsAccepted || !isFormValid;
                        return disabled;
                      })()}
                      $loading={isProcessing}
                      title={
                        !termsAccepted
                          ? 'Aceite os termos de uso para continuar'
                          : !isFormValid
                            ? 'Preencha todos os campos obrigatórios corretamente'
                            : ''
                      }
                    >
                      {isProcessing ? (
                        <>
                          <S.SubmitButtonSpinner />
                          Processando...
                        </>
                      ) : (
                        <>
                          <MdCheck size={20} />
                          {isBeta ? 'Confirmar Acesso' : 'Confirmar Assinatura'}
                        </>
                      )}
                    </S.SubmitButton>
                  </S.PaymentForm>
                </>
              )}

              {paymentError && (
                <div
                  style={{
                    color: theme === 'dark' ? '#f87171' : 'var(--color-error)',
                    marginBottom: '16px',
                    fontSize: '0.875rem',
                    padding: '12px',
                    background:
                      theme === 'dark'
                        ? 'rgba(239, 68, 68, 0.1)'
                        : 'rgba(239, 68, 68, 0.05)',
                    borderRadius: '8px',
                    border:
                      theme === 'dark'
                        ? '1px solid rgba(239, 68, 68, 0.3)'
                        : '1px solid rgba(239, 68, 68, 0.2)',
                  }}
                >
                  {paymentError}
                </div>
              )}

              <S.CloseButton
                onClick={() => {
                  setShowPaymentModal(false);
                  setShowConfirmationModal(false);
                }}
              >
                Cancelar
              </S.CloseButton>
            </>
          )}

          {isProcessing && (
            <div style={{ padding: '32px 0', textAlign: 'center' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  border: `4px solid ${theme === 'dark' ? '#3b82f6' : 'var(--color-primary)'}`,
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 16px',
                }}
              />
              <div
                style={{
                  fontSize: '1rem',
                  color: theme === 'dark' ? '#e2e8f0' : 'var(--color-text)',
                }}
              >
                Processando pagamento...
              </div>
            </div>
          )}

          {paymentSuccess && (
            <>
              <div
                style={{
                  fontSize: '4rem',
                  textAlign: 'center',
                  margin: '24px 0',
                }}
              >
                ✅
              </div>

              {!isBeta &&
              trialSummary?.trialDays &&
              trialSummary.trialDays > 0 ? (
                <div
                  style={{
                    fontSize: '0.95rem',
                    color: theme === 'dark' ? '#ffffff' : 'var(--color-text)',
                    textAlign: 'center',
                    margin: '0 0 16px',
                    lineHeight: 1.5,
                  }}
                >
                  <strong>Teste gratuito ativado!</strong>{' '}
                  {trialDaysLeft !== null
                    ? `Restam ${trialDaysLeft} ${trialDaysLeft === 1 ? 'dia' : 'dias'}`
                    : `Aproveite os próximos ${trialSummary.trialDays} dias`}
                  {trialEndsDisplay ? ` (até ${trialEndsDisplay})` : ''}.
                  <br />
                  {nextBillingDisplay
                    ? `Se não houver cancelamento, a primeira cobrança acontecerá em ${nextBillingDisplay}.`
                    : 'Caso não cancele antes do término do período de avaliação, a cobrança será feita automaticamente.'}
                </div>
              ) : (
                <div
                  style={{
                    fontSize: '0.95rem',
                    color: theme === 'dark' ? '#ffffff' : 'var(--color-text)',
                    textAlign: 'center',
                    margin: '0 0 16px',
                    lineHeight: 1.5,
                  }}
                >
                  Assinatura confirmada! Seu plano foi ativado e o pagamento
                  será processado conforme selecionado.
                </div>
              )}

              <div
                style={{
                  fontSize: '1rem',
                  textAlign: 'center',
                  color:
                    theme === 'dark'
                      ? '#ffffff'
                      : 'var(--color-text-secondary)',
                  marginBottom: '24px',
                }}
              >
                Redirecionando para o dashboard...
              </div>
            </>
          )}
        </S.PaymentContent>
      </S.PaymentModal>

      {showConfirmationModal && (
        <S.ConfirmationOverlay onClick={handleCancelConfirmation}>
          <S.ConfirmationDialog onClick={e => e.stopPropagation()}>
            <S.ConfirmationTitle>
              Confirmar assinatura do plano {selectedPlan?.name ?? ''}
            </S.ConfirmationTitle>
            <S.ConfirmationDescription>
              {isBeta ? (
                <>
                  <S.ConfirmationList>
                    <li>
                      <strong>Período de Lançamento:</strong> Acesso completo
                      sem custos de assinatura durante este período inicial. O
                      período de teste acaba em <strong>11 de março</strong>.
                    </li>
                    <li>
                      Para validar seu cartão, será realizada uma cobrança
                      simbólica de <strong>R$ 5,00</strong> que será estornada
                      automaticamente logo após a confirmação. Nenhuma cobrança
                      de assinatura será realizada no momento.
                    </li>
                    <li>
                      Você será notificado com{' '}
                      <strong>30 dias de antecedência</strong> sobre o início da
                      cobrança, garantindo transparência total no processo de
                      transição.
                    </li>
                    <li>
                      Estamos em constante aprimoramento do sistema, corrigindo
                      eventuais instabilidades de forma contínua.
                    </li>
                  </S.ConfirmationList>
                  <S.ConfirmationNote>
                    Você pode cancelar a assinatura a qualquer momento em Minha
                    Assinatura.
                  </S.ConfirmationNote>
                </>
              ) : (
                <>
                  <S.ConfirmationList>
                    <li>
                      Uma cobrança temporária de <strong>R$ 5,00</strong> será
                      realizada agora para validar o cartão. O valor é estornado
                      automaticamente logo após a confirmação.
                    </li>
                    <li>
                      {trialEnabled && selectedPlanTrialDays > 0
                        ? `Você terá ${selectedPlanTrialDays} ${
                            selectedPlanTrialDays === 1 ? 'dia' : 'dias'
                          } de avaliação sem custo. Caso não cancele até o fim desse período, a primeira mensalidade será gerada automaticamente.`
                        : `A primeira cobrança de ${selectedPlanPriceDisplay} será processada imediatamente após a confirmação.`}
                    </li>
                    <li>
                      A assinatura será renovada automaticamente todo mês por{' '}
                      <strong>{selectedPlanPriceDisplay}</strong> utilizando o
                      cartão informado.
                    </li>
                  </S.ConfirmationList>
                  <S.ConfirmationNote>
                    Você pode cancelar a renovação automática a qualquer momento
                    em Minha Assinatura.
                  </S.ConfirmationNote>
                </>
              )}
            </S.ConfirmationDescription>
            <S.ConfirmationActions>
              <S.ConfirmationButton
                type='button'
                $variant='secondary'
                onClick={handleCancelConfirmation}
              >
                Voltar
              </S.ConfirmationButton>
              <S.ConfirmationButton
                type='button'
                onClick={handleConfirmSubscription}
                disabled={isProcessing}
              >
                {isBeta ? 'Confirmar Acesso' : 'Confirmar e validar cartão'}
              </S.ConfirmationButton>
            </S.ConfirmationActions>
          </S.ConfirmationDialog>
        </S.ConfirmationOverlay>
      )}

      <CustomPlanModal
        isOpen={showCustomPlanModal}
        onClose={() => setShowCustomPlanModal(false)}
        modules={pricingData?.modules.availableForCustom || []}
        addons={pricingData?.addons || { all: [], byType: {} }}
        initialModules={[]}
        initialAddons={{}}
      />
    </S.Container>
  );
};

export default SubscriptionPlansPage;
