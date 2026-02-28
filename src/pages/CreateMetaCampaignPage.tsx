import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdCampaign, MdSchedule, MdSettings, MdClose, MdAdd, MdAttachMoney, MdImage, MdCloudUpload, MdAutoAwesome } from 'react-icons/md';
import { Layout } from '../components/layout/Layout';
import { CreateMetaCampaignShimmer } from '../components/shimmer/CreateMetaCampaignShimmer';
import { metaCampaignApi } from '../services/metaCampaignApi';
import { companyMembersApi } from '../services/companyMembersApi';
import { showSuccess, showError } from '../utils/notifications';
import { maskCurrencyReais, getNumericValue, formatCurrencyValue } from '../utils/masks';
import {
  PageContainer,
  BackButton,
  PageHeader,
  PageTitle,
  PageSubtitle,
  Section,
  SectionIconWrap,
  SectionTitle,
  FormGrid,
  Field,
  FieldLabel,
  FieldHint,
  Input,
  Select,
  ScheduleRow,
  CheckboxWrap,
  AdSetFieldsWrap,
  FormActions,
  ButtonSecondary,
  ButtonPrimary,
  Spinner,
  FileInputHidden,
  FileUploadZone,
  FileUploadIcon,
  FileUploadText,
  FileUploadHint,
  FileUploadFileName,
  PreviewSection,
  PreviewCard,
  PreviewMediaWrap,
  PreviewMediaImg,
  PreviewMediaVideo,
  PreviewMediaPlaceholder,
  PreviewContent,
  PreviewSponsored,
  PreviewHeadline,
  PreviewBody,
  PreviewCtaButton,
} from '../styles/pages/CreateMetaCampaignPageStyles';

const OBJECTIVES = [
  { value: 'OUTCOME_LEADS', label: 'Leads' },
  { value: 'OUTCOME_TRAFFIC', label: 'Tráfego' },
  { value: 'LINK_CLICKS', label: 'Cliques no link' },
  { value: 'CONVERSIONS', label: 'Conversões' },
  { value: 'MESSAGES', label: 'Mensagens' },
  { value: 'REACH', label: 'Alcance' },
  { value: 'BRAND_AWARENESS', label: 'Consciência de marca' },
  { value: 'VIDEO_VIEWS', label: 'Visualizações de vídeo' },
  { value: 'APP_INSTALLS', label: 'Instalações de app' },
  { value: 'PRODUCT_CATALOG_SALES', label: 'Vendas do catálogo' },
] as const;

const SPECIAL_CATEGORIES = [
  { value: 'NONE', label: 'Nenhuma (anúncio comum)' },
  { value: 'HOUSING', label: 'Housing (imóveis)' },
  { value: 'EMPLOYMENT', label: 'Emprego' },
  { value: 'CREDIT', label: 'Crédito' },
  { value: 'FINANCIAL_PRODUCTS_SERVICES', label: 'Produtos/serviços financeiros' },
  { value: 'ISSUES_ELECTIONS_POLITICS', label: 'Questões, eleições ou política' },
] as const;

const CTA_OPTIONS = [
  { value: 'LEARN_MORE', label: 'Saiba mais' },
  { value: 'SIGN_UP', label: 'Cadastre-se' },
  { value: 'CONTACT_US', label: 'Entre em contato' },
  { value: 'SHOP_NOW', label: 'Compre agora' },
  { value: 'DOWNLOAD', label: 'Download' },
  { value: 'GET_QUOTE', label: 'Solicitar orçamento' },
  { value: 'SUBSCRIBE', label: 'Inscrever-se' },
] as const;

export default function CreateMetaCampaignPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [accounts, setAccounts] = useState<{ id: string; name?: string }[]>([]);
  const [pages, setPages] = useState<{ id: string; name: string }[]>([]);
  const [companyUsers, setCompanyUsers] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    adAccountId: '',
    name: '',
    objective: 'OUTCOME_LEADS',
    status: 'PAUSED',
    specialAdCategories: 'NONE',
    scheduleDate: '',
    scheduleTime: '',
    scheduleEndDate: '',
    scheduleEndTime: '',
    scheduleDailyBudgetReais: '',
    createAdSet: true,
    adSetName: '',
    dailyBudgetReais: '',
    periodStartDate: '',
    periodStartTime: '',
    periodEndDate: '',
    periodEndTime: '',
    creativeType: 'image' as 'image' | 'video',
    creativePageId: '',
    creativeImageUrl: '',
    creativeVideoUrl: '',
    creativeMessage: '',
    creativeHeadline: '',
    creativeLink: '',
    creativeCallToAction: 'LEARN_MORE',
    creativeFileLabel: '', // nome do arquivo após upload
    responsibleUserId: '', // responsável pelos leads (opcional); senão usa o da config de campanhas
  });
  const [uploadingCreative, setUploadingCreative] = useState(false);
  const [fileDropOver, setFileDropOver] = useState(false);
  const [optimizingAi, setOptimizingAi] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const processCreativeFile = useCallback(async (file: File) => {
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isImage && !isVideo) {
      showError('Envie uma imagem (JPEG, PNG, GIF, WebP) ou vídeo (MP4, MOV).');
      return;
    }
    setUploadingCreative(true);
    try {
      const { url } = await metaCampaignApi.uploadCreativeMedia(file);
      setForm(prev => ({
        ...prev,
        creativeFileLabel: file.name,
        ...(isVideo
          ? { creativeType: 'video' as const, creativeVideoUrl: url, creativeImageUrl: '' }
          : { creativeType: 'image' as const, creativeImageUrl: url, creativeVideoUrl: '' }),
      }));
    } catch (err: any) {
      showError(err?.message || 'Erro ao enviar arquivo.');
    } finally {
      setUploadingCreative(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, []);

  const handleCreativeFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      await processCreativeFile(file);
    },
    [processCreativeFile],
  );

  const handleFileDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setFileDropOver(false);
      if (uploadingCreative) return;
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      processCreativeFile(file);
    },
    [uploadingCreative, processCreativeFile],
  );

  const handleFileDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFileDropOver(true);
  }, []);

  const handleFileDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFileDropOver(false);
  }, []);

  const handleOptimizeWithAi = useCallback(async () => {
    setOptimizingAi(true);
    try {
      const suggestions = await metaCampaignApi.getOptimizationSuggestions(
        form.adAccountId || undefined
      );
      const hasAny =
        suggestions.objective ||
        suggestions.dailyBudgetReais != null ||
        suggestions.headlineSuggestion ||
        suggestions.messageSuggestion ||
        suggestions.cta ||
        suggestions.specialAdCategory;
      if (!hasAny) {
        showError(
          'Nenhuma sugestão retornada. Verifique se há campanhas anteriores ou se a Qwen está configurada (QWEN_API_KEY no servidor).'
        );
        return;
      }
      setForm(prev => ({
        ...prev,
        ...(suggestions.objective && { objective: suggestions.objective }),
        ...(suggestions.specialAdCategory && {
          specialAdCategories: suggestions.specialAdCategory,
        }),
        ...(suggestions.dailyBudgetReais != null && {
          dailyBudgetReais: formatCurrencyValue(suggestions.dailyBudgetReais),
        }),
        ...(suggestions.headlineSuggestion && {
          creativeHeadline: suggestions.headlineSuggestion,
        }),
        ...(suggestions.messageSuggestion && {
          creativeMessage: suggestions.messageSuggestion,
        }),
        ...(suggestions.cta && { creativeCallToAction: suggestions.cta }),
      }));
      showSuccess(
        suggestions.summary
          ? `Sugestões aplicadas. ${suggestions.summary}`
          : 'Sugestões aplicadas com base nas campanhas anteriores.'
      );
    } catch (e: any) {
      showError(e?.message || 'Erro ao obter sugestões da IA.');
    } finally {
      setOptimizingAi(false);
    }
  }, [form.adAccountId]);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const config = await metaCampaignApi.getConfig();
      const list =
        config?.adAccounts?.length
          ? config.adAccounts
          : config?.adAccountId
            ? [
                {
                  id: config.adAccountId,
                  name: config.businessName || config.adAccountId,
                },
              ]
            : [];
      setAccounts(list);
      if (list.length && !form.adAccountId) {
        setForm(prev => ({ ...prev, adAccountId: list[0].id }));
      }
      if (!config || (list.length === 0 && !config.adAccountId?.trim())) {
        showError('Configure a integração Meta e pelo menos uma conta de anúncios em Configurações.');
        navigate('/integrations/meta-campaign/config', { replace: true });
      } else {
        const [pagesList, members] = await Promise.all([
          metaCampaignApi.getPages(),
          companyMembersApi.getMembersSimple().catch(() => []),
        ]);
        setPages(pagesList);
        setCompanyUsers(members);
        if (pagesList.length && !form.creativePageId) {
          setForm(prev => ({ ...prev, creativePageId: pagesList[0].id }));
        }
      }
    } catch (e: any) {
      showError(e?.message || 'Erro ao carregar contas.');
      navigate('/integrations/meta-campaign/campaigns', { replace: true });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount; form defaults set when lists load
  }, [navigate]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.adAccountId?.trim() || !form.name?.trim()) {
      showError('Selecione a conta e informe o nome da campanha.');
      return;
    }
    const scheduled_start_at =
      form.scheduleDate?.trim() && form.scheduleTime?.trim()
        ? `${form.scheduleDate.trim()}T${form.scheduleTime.trim()}:00-03:00`
        : undefined;
    const isScheduled = Boolean(scheduled_start_at);
    const wantAdSet = !isScheduled;
    // Criativo (imagem ou vídeo + texto + link) é OBRIGATÓRIO
    const requireCreative = () => {
      if (!form.creativePageId?.trim()) {
        showError('Selecione a página do Facebook para o criativo.');
        return false;
      }
      if (form.creativeType === 'image' && !form.creativeImageUrl?.trim()) {
        showError('Envie uma imagem para o criativo (upload acima).');
        return false;
      }
      if (form.creativeType === 'video' && !form.creativeVideoUrl?.trim()) {
        showError('Envie um vídeo para o criativo (upload acima).');
        return false;
      }
      if (!form.creativeMessage?.trim()) {
        showError('Informe o texto principal do anúncio.');
        return false;
      }
      if (!form.creativeHeadline?.trim()) {
        showError('Informe o título do anúncio.');
        return false;
      }
      if (!form.creativeLink?.trim()) {
        showError('Informe o link de destino do anúncio.');
        return false;
      }
      return true;
    };

    if (wantAdSet) {
      const budget = getNumericValue(form.dailyBudgetReais);
      if (!form.adSetName?.trim()) {
        showError('Informe o nome do conjunto de anúncios.');
        return;
      }
      if (!Number.isFinite(budget) || budget < 5) {
        showError('Orçamento diário deve ser no mínimo R$ 5.');
        return;
      }
      if (!requireCreative()) return;
    } else {
      // Campanha agendada: criativo também é obrigatório
      if (!requireCreative()) return;
    }

    setSubmitting(true);
    try {
      const payload: Parameters<typeof metaCampaignApi.createCampaign>[0] = {
        adAccountId: form.adAccountId,
        name: form.name.trim(),
        objective: form.objective,
        status: form.status,
        special_ad_categories: form.specialAdCategories || 'NONE',
        scheduled_start_at,
        responsible_user_id: form.responsibleUserId?.trim() || undefined,
      };
      if (isScheduled) {
        if (form.creativeImageUrl?.trim()) payload.creative_image_url = form.creativeImageUrl.trim();
        if (form.creativeVideoUrl?.trim()) payload.creative_video_url = form.creativeVideoUrl.trim();
        if (form.scheduleEndDate?.trim() && form.scheduleEndTime?.trim()) {
          payload.campaign_end_at = `${form.scheduleEndDate.trim()}T${form.scheduleEndTime.trim()}:00-03:00`;
        }
        const scheduleBudget = getNumericValue(form.scheduleDailyBudgetReais);
        if (Number.isFinite(scheduleBudget) && scheduleBudget >= 1) {
          payload.daily_budget_reais = scheduleBudget;
        }
      }
      if (wantAdSet) {
        payload.create_ad_set = true;
        payload.ad_set_name = form.adSetName.trim();
        payload.daily_budget_reais = getNumericValue(form.dailyBudgetReais);
        if (form.periodStartDate?.trim() && form.periodStartTime?.trim()) {
          payload.campaign_start_at = `${form.periodStartDate.trim()}T${form.periodStartTime.trim()}:00-03:00`;
          if (form.periodEndDate?.trim() && form.periodEndTime?.trim()) {
            payload.campaign_end_at = `${form.periodEndDate.trim()}T${form.periodEndTime.trim()}:00-03:00`;
          }
        }
        if (
          form.creativePageId?.trim() &&
          form.creativeMessage?.trim() &&
          form.creativeHeadline?.trim() &&
          form.creativeLink?.trim() &&
          ((form.creativeType === 'image' && form.creativeImageUrl?.trim()) ||
            (form.creativeType === 'video' && form.creativeVideoUrl?.trim()))
        ) {
          payload.creative_type = form.creativeType;
          payload.creative_page_id = form.creativePageId.trim();
          if (form.creativeType === 'image') {
            payload.creative_image_url = form.creativeImageUrl.trim();
          } else {
            payload.creative_video_url = form.creativeVideoUrl.trim();
          }
          payload.creative_message = form.creativeMessage.trim();
          payload.creative_headline = form.creativeHeadline.trim();
          payload.creative_link = form.creativeLink.trim();
          payload.creative_call_to_action = form.creativeCallToAction || 'LEARN_MORE';
        }
      }
      const res = await metaCampaignApi.createCampaign(payload);
      if (res && 'scheduled' in res && res.scheduled) {
        const runAt = res.run_at
          ? new Date(res.run_at).toLocaleString('pt-BR', {
              timeZone: 'America/Sao_Paulo',
              dateStyle: 'short',
              timeStyle: 'short',
            })
          : res.run_at;
        showSuccess(
          `Campanha agendada para ${runAt}. Ela será criada automaticamente no horário escolhido (Horário de Brasília).`
        );
      } else {
        const withAd = res && 'adId' in res && res.adId;
        const withAdSet = res && 'adSetId' in res && res.adSetId;
        showSuccess(
          withAd
            ? 'Campanha, conjunto de anúncios e anúncio (imagem + link) criados na Meta. Tudo feito por aqui.'
            : withAdSet
              ? 'Campanha e conjunto de anúncios criados na Meta.'
              : 'Campanha criada na Meta com sucesso.'
        );
      }
      navigate('/integrations/meta-campaign/campaigns');
    } catch (e: any) {
      showError(e?.message || 'Erro ao criar campanha.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <PageContainer>
          <CreateMetaCampaignShimmer />
        </PageContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageContainer>
        <BackButton type="button" onClick={() => navigate(-1)} title="Voltar">
          <MdArrowBack size={20} aria-hidden /> Voltar
        </BackButton>

        <PageHeader>
          <PageTitle>Nova campanha na Meta</PageTitle>
          <PageSubtitle>
            Crie a campanha e, se quiser, o conjunto com orçamento diário (Brasil). Tudo pelo sistema, sem abrir a Meta.
          </PageSubtitle>
          <div style={{ marginTop: 12 }}>
            <ButtonSecondary
              type="button"
              onClick={handleOptimizeWithAi}
              disabled={optimizingAi}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              {optimizingAi ? (
                <>
                  <Spinner />
                  Analisando campanhas anteriores...
                </>
              ) : (
                <>
                  <MdAutoAwesome size={20} />
                  Otimizar com IA (sugestões com base em campanhas anteriores)
                </>
              )}
            </ButtonSecondary>
          </div>
        </PageHeader>

        <form onSubmit={handleSubmit}>
          <Section>
            <SectionTitle>
              <SectionIconWrap><MdCampaign size={20} aria-hidden /></SectionIconWrap>
              Dados básicos
            </SectionTitle>
            <FormGrid>
              <Field>
                <FieldLabel>Conta de anúncios</FieldLabel>
                <Select
                  value={form.adAccountId}
                  onChange={e => setForm(prev => ({ ...prev, adAccountId: e.target.value }))}
                  required
                >
                  <option value="">Selecione a conta</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name || acc.id}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field>
                <FieldLabel>Nome da campanha</FieldLabel>
                <Input
                  type="text"
                  placeholder="Ex: Campanha Leads - Imóveis"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </Field>
              <Field>
                <FieldLabel>Responsável pelos leads (opcional)</FieldLabel>
                <Select
                  value={form.responsibleUserId}
                  onChange={e => setForm(prev => ({ ...prev, responsibleUserId: e.target.value }))}
                >
                  <option value="">Usar responsável da configuração de campanhas</option>
                  {companyUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </Select>
                <FieldHint style={{ marginTop: 4 }}>
                  Se escolher alguém aqui, os leads desta campanha serão atribuídos a ele. Senão, usa o definido em Integrações → Meta Campanhas → Configuração.
                </FieldHint>
              </Field>
            </FormGrid>
          </Section>

          <Section>
            <SectionTitle>
              <SectionIconWrap><MdSettings size={20} aria-hidden /></SectionIconWrap>
              Objetivo e categoria
            </SectionTitle>
            <FormGrid>
              <Field>
                <FieldLabel>Objetivo</FieldLabel>
                <Select
                  value={form.objective}
                  onChange={e => setForm(prev => ({ ...prev, objective: e.target.value }))}
                >
                  {OBJECTIVES.map(o => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field>
                <FieldLabel>Categoria especial</FieldLabel>
                <Select
                  value={form.specialAdCategories}
                  onChange={e => setForm(prev => ({ ...prev, specialAdCategories: e.target.value }))}
                >
                  {SPECIAL_CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field>
                <FieldLabel>Status inicial</FieldLabel>
                <Select
                  value={form.status}
                  onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="PAUSED">Pausada</option>
                  <option value="ACTIVE">Ativa</option>
                </Select>
              </Field>
            </FormGrid>
          </Section>

          <Section>
            <SectionTitle>
              <SectionIconWrap><MdAttachMoney size={20} aria-hidden /></SectionIconWrap>
              Conjunto de anúncios
            </SectionTitle>
            {form.scheduleDate?.trim() && form.scheduleTime?.trim() ? (
              <>
                <FieldHint style={{ marginTop: 0 }}>Disponível só para criação imediata. Desmarque data/hora em Agendamento para configurar o conjunto.</FieldHint>
                <AdSetFieldsWrap style={{ marginTop: 24 }}>
                  <SectionTitle>
                    <SectionIconWrap><MdImage size={20} aria-hidden /></SectionIconWrap>
                    Criativo (imagem ou vídeo + texto + link) — obrigatório
                  </SectionTitle>
                  <Field>
                    <FieldLabel>Tipo</FieldLabel>
                    <ScheduleRow style={{ gap: 16, flexWrap: 'wrap' }}>
                      <CheckboxWrap>
                        <input
                          type="radio"
                          name="creativeTypeSched"
                          checked={form.creativeType === 'image'}
                          onChange={() => setForm(prev => ({ ...prev, creativeType: 'image', creativeVideoUrl: '', creativeFileLabel: '' }))}
                        />
                        <span>Imagem</span>
                      </CheckboxWrap>
                      <CheckboxWrap>
                        <input
                          type="radio"
                          name="creativeTypeSched"
                          checked={form.creativeType === 'video'}
                          onChange={() => setForm(prev => ({ ...prev, creativeType: 'video', creativeImageUrl: '', creativeFileLabel: '' }))}
                        />
                        <span>Vídeo</span>
                      </CheckboxWrap>
                    </ScheduleRow>
                  </Field>
                  <Field>
                    <FieldLabel>{form.creativeType === 'video' ? 'Vídeo' : 'Imagem'}</FieldLabel>
                    <FileInputHidden
                      ref={fileInputRef}
                      accept={form.creativeType === 'video' ? 'video/mp4,video/quicktime' : 'image/jpeg,image/png,image/gif,image/webp'}
                      onChange={handleCreativeFile}
                      disabled={uploadingCreative}
                      aria-label="Escolher arquivo"
                    />
                    <FileUploadZone
                      $isDragOver={fileDropOver}
                      $disabled={uploadingCreative}
                      data-disabled={uploadingCreative ? true : undefined}
                      onDrop={handleFileDrop}
                      onDragOver={handleFileDragOver}
                      onDragLeave={handleFileDragLeave}
                      onClick={() => !uploadingCreative && fileInputRef.current?.click()}
                    >
                      {uploadingCreative ? (
                        <>
                          <Spinner />
                          <FileUploadText>Enviando...</FileUploadText>
                        </>
                      ) : fileDropOver ? (
                        <>
                          <FileUploadIcon><MdCloudUpload /></FileUploadIcon>
                          <FileUploadText>Solte o arquivo aqui</FileUploadText>
                        </>
                      ) : (
                        <>
                          <FileUploadIcon><MdCloudUpload /></FileUploadIcon>
                          <FileUploadText>Clique ou arraste o arquivo</FileUploadText>
                          <FileUploadHint>
                            {form.creativeType === 'video' ? 'MP4 ou MOV, até 150 MB' : 'JPEG, PNG, GIF ou WebP'}
                          </FileUploadHint>
                          {form.creativeFileLabel && (
                            <FileUploadFileName>{form.creativeFileLabel}</FileUploadFileName>
                          )}
                        </>
                      )}
                    </FileUploadZone>
                  </Field>
                  <Field>
                    <FieldLabel>Página do Facebook</FieldLabel>
                    <Select
                      value={form.creativePageId}
                      onChange={e => setForm(prev => ({ ...prev, creativePageId: e.target.value }))}
                      required
                    >
                      <option value="">Selecione a página</option>
                      {pages.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel>Título (headline)</FieldLabel>
                    <Input
                      type="text"
                      placeholder="Ex: Apartamentos à venda"
                      value={form.creativeHeadline}
                      onChange={e => setForm(prev => ({ ...prev, creativeHeadline: e.target.value }))}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Texto do anúncio</FieldLabel>
                    <Input
                      as="textarea"
                      placeholder="Descrição ou chamada para ação..."
                      value={form.creativeMessage}
                      onChange={e => setForm(prev => ({ ...prev, creativeMessage: e.target.value }))}
                      rows={3}
                      style={{ minHeight: 80, resize: 'vertical' }}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Link de destino</FieldLabel>
                    <Input
                      type="url"
                      placeholder="https://..."
                      value={form.creativeLink}
                      onChange={e => setForm(prev => ({ ...prev, creativeLink: e.target.value }))}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Botão de ação</FieldLabel>
                    <Select
                      value={form.creativeCallToAction}
                      onChange={e => setForm(prev => ({ ...prev, creativeCallToAction: e.target.value }))}
                    >
                      {CTA_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </Select>
                  </Field>
                </AdSetFieldsWrap>
              </>
            ) : (
            <FormGrid>
              {!form.scheduleDate?.trim() && !form.scheduleTime?.trim() && (
                <AdSetFieldsWrap>
                  <Field>
                    <FieldLabel>Nome do conjunto de anúncios</FieldLabel>
                    <Input
                      type="text"
                      placeholder="Ex: Conjunto Leads - Imóveis"
                      value={form.adSetName}
                      onChange={e => setForm(prev => ({ ...prev, adSetName: e.target.value }))}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Orçamento diário</FieldLabel>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="R$ 0,00"
                      value={form.dailyBudgetReais}
                      onChange={e => setForm(prev => ({ ...prev, dailyBudgetReais: maskCurrencyReais(e.target.value) }))}
                    />
                    <FieldHint>Mínimo R$ 5 (Meta). Segmentação: Brasil.</FieldHint>
                  </Field>
                  <Field>
                    <FieldLabel>Período de veiculação (opcional)</FieldLabel>
                    <FieldHint style={{ marginBottom: 8, display: 'block' }}>
                      Quando a campanha começa e termina de rodar na Meta. Se não preencher, a campanha fica sem data de fim.
                    </FieldHint>
                    <ScheduleRow style={{ gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Início</span>
                        <ScheduleRow style={{ gap: 8 }}>
                          <Input
                            type="date"
                            value={form.periodStartDate}
                            onChange={e => setForm(prev => ({ ...prev, periodStartDate: e.target.value }))}
                            style={{ minWidth: 180, width: 'auto' }}
                          />
                          <Input
                            type="time"
                            value={form.periodStartTime}
                            onChange={e => setForm(prev => ({ ...prev, periodStartTime: e.target.value }))}
                            style={{ minWidth: 120, width: 'auto' }}
                          />
                        </ScheduleRow>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Fim</span>
                        <ScheduleRow style={{ gap: 8 }}>
                          <Input
                            type="date"
                            value={form.periodEndDate}
                            onChange={e => setForm(prev => ({ ...prev, periodEndDate: e.target.value }))}
                            style={{ minWidth: 180, width: 'auto' }}
                          />
                          <Input
                            type="time"
                            value={form.periodEndTime}
                            onChange={e => setForm(prev => ({ ...prev, periodEndTime: e.target.value }))}
                            style={{ minWidth: 120, width: 'auto' }}
                          />
                        </ScheduleRow>
                      </div>
                    </ScheduleRow>
                    {form.periodStartDate?.trim() &&
                      form.periodStartTime?.trim() &&
                      form.periodEndDate?.trim() &&
                      form.periodEndTime?.trim() &&
                      form.dailyBudgetReais &&
                      getNumericValue(form.dailyBudgetReais) >= 5 && (() => {
                        const start = new Date(`${form.periodStartDate}T${form.periodStartTime}:00`);
                        const end = new Date(`${form.periodEndDate}T${form.periodEndTime}:00`);
                        if (end <= start) return null;
                        const days = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
                        const daily = getNumericValue(form.dailyBudgetReais);
                        const total = days * daily;
                        return (
                          <p style={{ marginTop: 12, fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>
                            Valor final estimado = orçamento diário × dias de veiculação: {formatCurrencyValue(daily)}/dia × {days} {days === 1 ? 'dia' : 'dias'} = {formatCurrencyValue(total)}
                          </p>
                        );
                      })()}
                  </Field>
                </AdSetFieldsWrap>
              )}
              {!form.scheduleDate?.trim() && !form.scheduleTime?.trim() && (
                <AdSetFieldsWrap>
                  <SectionTitle>
                    <SectionIconWrap><MdImage size={20} aria-hidden /></SectionIconWrap>
                    Criativo (imagem ou vídeo + texto + link) — obrigatório
                  </SectionTitle>
                  <Field>
                    <FieldLabel>Tipo</FieldLabel>
                    <ScheduleRow style={{ gap: 16, flexWrap: 'wrap' }}>
                      <CheckboxWrap>
                        <input
                          type="radio"
                          name="creativeType"
                          checked={form.creativeType === 'image'}
                          onChange={() => setForm(prev => ({ ...prev, creativeType: 'image', creativeVideoUrl: '', creativeFileLabel: '' }))}
                        />
                        <span>Imagem</span>
                      </CheckboxWrap>
                      <CheckboxWrap>
                        <input
                          type="radio"
                          name="creativeType"
                          checked={form.creativeType === 'video'}
                          onChange={() => setForm(prev => ({ ...prev, creativeType: 'video', creativeImageUrl: '', creativeFileLabel: '' }))}
                        />
                        <span>Vídeo</span>
                      </CheckboxWrap>
                    </ScheduleRow>
                  </Field>
                  <Field>
                    <FieldLabel>{form.creativeType === 'video' ? 'Vídeo' : 'Imagem'}</FieldLabel>
                    <FileInputHidden
                      ref={fileInputRef}
                      accept={form.creativeType === 'video' ? 'video/mp4,video/quicktime' : 'image/jpeg,image/png,image/gif,image/webp'}
                      onChange={handleCreativeFile}
                      disabled={uploadingCreative}
                      aria-label="Escolher arquivo"
                    />
                    <FileUploadZone
                      $isDragOver={fileDropOver}
                      $disabled={uploadingCreative}
                      data-disabled={uploadingCreative ? true : undefined}
                      onDrop={handleFileDrop}
                      onDragOver={handleFileDragOver}
                      onDragLeave={handleFileDragLeave}
                      onClick={() => !uploadingCreative && fileInputRef.current?.click()}
                    >
                      {uploadingCreative ? (
                        <>
                          <Spinner />
                          <FileUploadText>Enviando...</FileUploadText>
                        </>
                      ) : fileDropOver ? (
                        <>
                          <FileUploadIcon><MdCloudUpload /></FileUploadIcon>
                          <FileUploadText>Solte o arquivo aqui</FileUploadText>
                        </>
                      ) : (
                        <>
                          <FileUploadIcon><MdCloudUpload /></FileUploadIcon>
                          <FileUploadText>Clique ou arraste o arquivo</FileUploadText>
                          <FileUploadHint>
                            {form.creativeType === 'video'
                              ? 'MP4 ou MOV, até 150 MB'
                              : 'JPEG, PNG, GIF ou WebP'}
                          </FileUploadHint>
                          {form.creativeFileLabel && (
                            <FileUploadFileName>{form.creativeFileLabel}</FileUploadFileName>
                          )}
                        </>
                      )}
                    </FileUploadZone>
                  </Field>
                  <Field>
                    <FieldLabel>Página do Facebook</FieldLabel>
                    <Select
                      value={form.creativePageId}
                      onChange={e => setForm(prev => ({ ...prev, creativePageId: e.target.value }))}
                      required
                    >
                      <option value="">Selecione a página</option>
                      {pages.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel>Título (headline)</FieldLabel>
                    <Input
                      type="text"
                      placeholder="Ex: Apartamentos à venda"
                      value={form.creativeHeadline}
                      onChange={e => setForm(prev => ({ ...prev, creativeHeadline: e.target.value }))}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Texto do anúncio</FieldLabel>
                    <Input
                      as="textarea"
                      placeholder="Descrição ou chamada para ação..."
                      value={form.creativeMessage}
                      onChange={e => setForm(prev => ({ ...prev, creativeMessage: e.target.value }))}
                      rows={3}
                      style={{ minHeight: 80, resize: 'vertical' }}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Link de destino</FieldLabel>
                    <Input
                      type="url"
                      placeholder="https://..."
                      value={form.creativeLink}
                      onChange={e => setForm(prev => ({ ...prev, creativeLink: e.target.value }))}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Botão de ação</FieldLabel>
                    <Select
                      value={form.creativeCallToAction}
                      onChange={e => setForm(prev => ({ ...prev, creativeCallToAction: e.target.value }))}
                    >
                      {CTA_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </Select>
                  </Field>
                </AdSetFieldsWrap>
              )}
            </FormGrid>
            )}
          </Section>

          <Section>
            <SectionTitle>
              <SectionIconWrap><MdSchedule size={20} aria-hidden /></SectionIconWrap>
              Agendamento (opcional)
            </SectionTitle>
            <FormGrid>
              <Field>
                <FieldLabel>Data e hora em que a campanha será criada (Brasília)</FieldLabel>
                <ScheduleRow>
                  <Input
                    type="date"
                    value={form.scheduleDate}
                    onChange={e => setForm(prev => ({ ...prev, scheduleDate: e.target.value }))}
                    min={new Date().toISOString().slice(0, 10)}
                    style={{ minWidth: 180, width: 'auto' }}
                  />
                  <Input
                    type="time"
                    value={form.scheduleTime}
                    onChange={e => setForm(prev => ({ ...prev, scheduleTime: e.target.value }))}
                    style={{ minWidth: 120, width: 'auto' }}
                  />
                </ScheduleRow>
                <FieldHint style={{ marginTop: 8, display: 'block' }}>
                  A data de início da campanha na Meta será esta data e hora (quando a campanha começa a veicular).
                </FieldHint>
              </Field>
              {form.scheduleDate?.trim() && form.scheduleTime?.trim() && (
                <>
                  <Field>
                    <FieldLabel>Data e hora de fim da campanha (opcional)</FieldLabel>
                    <ScheduleRow>
                      <Input
                        type="date"
                        value={form.scheduleEndDate}
                        onChange={e => setForm(prev => ({ ...prev, scheduleEndDate: e.target.value }))}
                        min={form.scheduleDate}
                        style={{ minWidth: 180, width: 'auto' }}
                      />
                      <Input
                        type="time"
                        value={form.scheduleEndTime}
                        onChange={e => setForm(prev => ({ ...prev, scheduleEndTime: e.target.value }))}
                        style={{ minWidth: 120, width: 'auto' }}
                      />
                    </ScheduleRow>
                    <FieldHint style={{ marginTop: 4 }}>Quando a campanha deve parar de veicular na Meta.</FieldHint>
                  </Field>
                  <Field>
                    <FieldLabel>Orçamento diário (R$) – para cálculo do total</FieldLabel>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="R$ 0,00"
                      value={form.scheduleDailyBudgetReais}
                      onChange={e => setForm(prev => ({ ...prev, scheduleDailyBudgetReais: maskCurrencyReais(e.target.value) }))}
                    />
                    <FieldHint style={{ marginTop: 4 }}>
                      Informe o orçamento diário para estimar o valor total no período.
                    </FieldHint>
                    {form.scheduleEndDate?.trim() &&
                      form.scheduleEndTime?.trim() &&
                      form.scheduleDailyBudgetReais &&
                      getNumericValue(form.scheduleDailyBudgetReais) >= 5 && (() => {
                        const start = new Date(`${form.scheduleDate}T${form.scheduleTime}:00`);
                        const end = new Date(`${form.scheduleEndDate}T${form.scheduleEndTime}:00`);
                        if (end <= start) return null;
                        const days = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
                        const daily = getNumericValue(form.scheduleDailyBudgetReais);
                        const total = days * daily;
                        return (
                          <p style={{ marginTop: 8, fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>
                            Valor final estimado = orçamento diário × dias de veiculação: {formatCurrencyValue(daily)}/dia × {days} {days === 1 ? 'dia' : 'dias'} = {formatCurrencyValue(total)}
                          </p>
                        );
                      })()}
                  </Field>
                </>
              )}
            </FormGrid>
          </Section>

          <PreviewSection>
            <SectionTitle>
              <SectionIconWrap><MdImage size={20} aria-hidden /></SectionIconWrap>
              Prévia do anúncio
            </SectionTitle>
            <FieldHint style={{ marginBottom: 12, display: 'block' }}>
              Como o anúncio pode aparecer no feed (Facebook/Instagram). Antes de criar, confira se está tudo certo.
            </FieldHint>
            <PreviewCard>
              <PreviewMediaWrap>
                {form.creativeType === 'video' && form.creativeVideoUrl ? (
                  <PreviewMediaVideo
                    src={form.creativeVideoUrl}
                    controls
                    muted
                    playsInline
                    preload="auto"
                  />
                ) : form.creativeImageUrl ? (
                  <PreviewMediaImg src={form.creativeImageUrl} alt="" />
                ) : (
                  <PreviewMediaPlaceholder>
                    {!(form.scheduleDate?.trim() && form.scheduleTime?.trim())
                      ? 'Envie uma imagem ou vídeo acima para ver a prévia'
                      : 'Desmarque data/hora em Agendamento para configurar o conjunto e ver a prévia'}
                  </PreviewMediaPlaceholder>
                )}
              </PreviewMediaWrap>
              <PreviewContent>
                <PreviewSponsored>Patrocinado</PreviewSponsored>
                {form.creativeHeadline && (
                  <PreviewHeadline>{form.creativeHeadline}</PreviewHeadline>
                )}
                {form.creativeMessage && (
                  <PreviewBody>{form.creativeMessage}</PreviewBody>
                )}
                <PreviewCtaButton>
                  {CTA_OPTIONS.find(o => o.value === form.creativeCallToAction)?.label ?? 'Saiba mais'}
                </PreviewCtaButton>
              </PreviewContent>
            </PreviewCard>
          </PreviewSection>

          <FormActions>
            <ButtonSecondary
              type="button"
              onClick={() => navigate(-1)}
              disabled={submitting}
              title="Cancelar e voltar"
            >
              <MdClose size={18} aria-hidden /> Cancelar
            </ButtonSecondary>
            <ButtonPrimary type="submit" disabled={submitting} title={submitting ? 'Criando campanha...' : 'Criar campanha na Meta'}>
              {submitting ? (
                <>
                  <Spinner aria-hidden /> Criando...
                </>
              ) : (
                <>
                  <MdAdd size={20} aria-hidden /> Criar campanha
                </>
              )}
            </ButtonPrimary>
          </FormActions>
        </form>
      </PageContainer>
    </Layout>
  );
}
