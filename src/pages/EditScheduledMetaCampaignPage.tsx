import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { MdArrowBack, MdSave, MdImage, MdSchedule, MdAttachMoney, MdCloudUpload, MdClose } from 'react-icons/md';
import { Layout } from '../components/layout/Layout';
import { metaCampaignApi } from '../services/metaCampaignApi';
import { showSuccess, showError } from '../utils/notifications';
import { maskCurrencyReais, getNumericValue, formatCurrencyValue } from '../utils/masks';
import type { ScheduledMetaCampaignItem } from '../types/metaCampaign';
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
  CheckboxWrap,
} from '../styles/pages/CreateMetaCampaignPageStyles';

const OBJECTIVE_LABELS: Record<string, string> = {
  OUTCOME_LEADS: 'Leads',
  OUTCOME_TRAFFIC: 'Tráfego',
  LINK_CLICKS: 'Cliques no link',
  CONVERSIONS: 'Conversões',
  MESSAGES: 'Mensagens',
  REACH: 'Alcance',
  BRAND_AWARENESS: 'Consciência de marca',
  VIDEO_VIEWS: 'Visualizações de vídeo',
  APP_INSTALLS: 'Instalações de app',
  PRODUCT_CATALOG_SALES: 'Vendas do catálogo',
};

function toDatetimeLocal(isoOrDate: string | Date): string {
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditScheduledMetaCampaignPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [item, setItem] = useState<ScheduledMetaCampaignItem | null>(
    (location.state as { item?: ScheduledMetaCampaignItem })?.item ?? null
  );
  const [loading, setLoading] = useState(!item);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingCreative, setUploadingCreative] = useState(false);
  const [fileDropOver, setFileDropOver] = useState(false);
  const [creativeType, setCreativeType] = useState<'image' | 'video'>('image');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: '',
    objective: 'OUTCOME_LEADS',
    status: 'PAUSED',
    specialAdCategories: 'NONE',
    runAt: '',
    runEndAt: '',
    dailyBudgetReais: '',
    creativeImageUrl: '',
    creativeVideoUrl: '',
    creativeFileLabel: '',
  });

  const loadItem = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const list = await metaCampaignApi.getScheduledCampaigns('all');
      const found = list.find(s => s.id === id) ?? null;
      setItem(found);
      if (found) {
        const hasVideo = Boolean(found.creativeVideoUrl?.trim());
        setForm({
          name: found.name || '',
          objective: found.objective || 'OUTCOME_LEADS',
          status: found.status || 'PAUSED',
          specialAdCategories: found.specialAdCategories || 'NONE',
          runAt: toDatetimeLocal(found.runAt),
          runEndAt: found.runEndAt ? toDatetimeLocal(found.runEndAt) : '',
          dailyBudgetReais:
            found.dailyBudgetReais != null && found.dailyBudgetReais >= 0
              ? maskCurrencyReais(String(found.dailyBudgetReais))
              : '',
          creativeImageUrl: found.creativeImageUrl || '',
          creativeVideoUrl: found.creativeVideoUrl || '',
          creativeFileLabel: '',
        });
        setCreativeType(hasVideo ? 'video' : 'image');
      }
    } catch (e) {
      showError('Erro ao carregar agendamento.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (item) {
      const hasVideo = Boolean(item.creativeVideoUrl?.trim());
      setForm(prev => ({
        ...prev,
        name: item.name || '',
        objective: item.objective || 'OUTCOME_LEADS',
        status: item.status || 'PAUSED',
        specialAdCategories: item.specialAdCategories || 'NONE',
        runAt: toDatetimeLocal(item.runAt),
        runEndAt: item.runEndAt ? toDatetimeLocal(item.runEndAt) : '',
        dailyBudgetReais:
          item.dailyBudgetReais != null && item.dailyBudgetReais >= 0
            ? maskCurrencyReais(String(item.dailyBudgetReais))
            : '',
        creativeImageUrl: item.creativeImageUrl || '',
        creativeVideoUrl: item.creativeVideoUrl || '',
      }));
      setCreativeType(hasVideo ? 'video' : 'image');
    } else if (id) {
      loadItem();
    }
  }, [id, item, loadItem]);

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
          ? { creativeVideoUrl: url, creativeImageUrl: '' }
          : { creativeImageUrl: url, creativeVideoUrl: '' }),
      }));
      setCreativeType(isVideo ? 'video' : 'image');
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
    [processCreativeFile]
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
    [uploadingCreative, processCreativeFile]
  );

  const handleFileDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setFileDropOver(true);
  }, []);

  const handleFileDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setFileDropOver(false);
  }, []);

  const removeMedia = useCallback(() => {
    setForm(prev => ({
      ...prev,
      creativeImageUrl: '',
      creativeVideoUrl: '',
      creativeFileLabel: '',
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !item) return;
    if (!form.name.trim()) {
      showError('Informe o nome da campanha.');
      return;
    }
    if (!form.creativeImageUrl?.trim() && !form.creativeVideoUrl?.trim()) {
      showError('Criativo é obrigatório: envie uma imagem ou um vídeo.');
      return;
    }
    const budget = getNumericValue(form.dailyBudgetReais);
    if (!Number.isFinite(budget) || budget < 5) {
      showError('Informe o orçamento diário (mínimo R$ 5).');
      return;
    }
    setSubmitting(true);
    try {
      const runAtDate = new Date(form.runAt);
      const payload: Parameters<typeof metaCampaignApi.updateScheduledCampaign>[1] = {
        name: form.name.trim(),
        objective: form.objective,
        status: form.status,
        specialAdCategories: form.specialAdCategories,
        runAt: runAtDate.toISOString(),
        creativeImageUrl: form.creativeImageUrl.trim() || undefined,
        creativeVideoUrl: form.creativeVideoUrl.trim() || undefined,
      };
      if (form.runEndAt) {
        payload.runEndAt = new Date(form.runEndAt).toISOString();
      } else {
        payload.runEndAt = null;
      }
      const budget = getNumericValue(form.dailyBudgetReais);
      if (Number.isFinite(budget) && budget >= 0) {
        payload.dailyBudgetReais = budget >= 1 ? budget : null;
      }
      await metaCampaignApi.updateScheduledCampaign(id, payload);
      showSuccess('Agendamento atualizado.');
      navigate('/integrations/meta-campaign/campaigns', { state: { tab: 'scheduled' } });
    } catch (e: any) {
      showError(e?.message || 'Erro ao salvar.');
    } finally {
      setSubmitting(false);
    }
  };

  const campaignsPath = '/integrations/meta-campaign/campaigns';
  const hasMedia = Boolean(form.creativeImageUrl?.trim() || form.creativeVideoUrl?.trim());

  if (loading) {
    return (
      <Layout>
        <PageContainer>
          <BackButton type="button" onClick={() => navigate(campaignsPath)}>
            <MdArrowBack size={20} aria-hidden /> Voltar
          </BackButton>
          <p style={{ color: 'var(--color-text-secondary)' }}>Carregando...</p>
        </PageContainer>
      </Layout>
    );
  }

  if (!item) {
    return (
      <Layout>
        <PageContainer>
          <BackButton type="button" onClick={() => navigate(campaignsPath)}>
            <MdArrowBack size={20} aria-hidden /> Voltar
          </BackButton>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 16 }}>
            Agendamento não encontrado.
          </p>
          <ButtonSecondary type="button" onClick={() => navigate(campaignsPath)} style={{ marginTop: 12 }}>
            Ir para Campanhas
          </ButtonSecondary>
        </PageContainer>
      </Layout>
    );
  }

  if (item.processedAt) {
    return (
      <Layout>
        <PageContainer>
          <BackButton type="button" onClick={() => navigate(campaignsPath)}>
            <MdArrowBack size={20} aria-hidden /> Voltar
          </BackButton>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 16 }}>
            Este agendamento já foi enviado à Meta e não pode mais ser editado.
          </p>
          <ButtonSecondary type="button" onClick={() => navigate(campaignsPath)} style={{ marginTop: 12 }}>
            Voltar para Campanhas
          </ButtonSecondary>
        </PageContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageContainer>
        <BackButton type="button" onClick={() => navigate(campaignsPath)}>
          <MdArrowBack size={20} aria-hidden /> Voltar
        </BackButton>
        <PageHeader>
          <PageTitle>Editar agendamento</PageTitle>
          <PageSubtitle>
            Altere os dados da campanha agendada. Só é possível editar antes do envio à Meta.
          </PageSubtitle>
        </PageHeader>

        <form onSubmit={handleSubmit}>
          <Section>
            <SectionTitle>
              <SectionIconWrap><MdAttachMoney size={20} aria-hidden /></SectionIconWrap>
              Dados da campanha
            </SectionTitle>
            <FormGrid>
              <Field>
                <FieldLabel>Nome</FieldLabel>
                <Input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome da campanha"
                />
              </Field>
              <Field>
                <FieldLabel>Objetivo</FieldLabel>
                <Select
                  value={form.objective}
                  onChange={e => setForm(prev => ({ ...prev, objective: e.target.value }))}
                >
                  {Object.entries(OBJECTIVE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </Field>
              <Field>
                <FieldLabel>Status</FieldLabel>
                <Select
                  value={form.status}
                  onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="ACTIVE">Ativa</option>
                  <option value="PAUSED">Pausada</option>
                  <option value="ARCHIVED">Arquivada</option>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Categoria especial</FieldLabel>
                <Select
                  value={form.specialAdCategories}
                  onChange={e => setForm(prev => ({ ...prev, specialAdCategories: e.target.value }))}
                >
                  <option value="NONE">Nenhuma (anúncio comum)</option>
                  <option value="HOUSING">Housing (imóveis)</option>
                  <option value="EMPLOYMENT">Emprego</option>
                  <option value="CREDIT">Crédito</option>
                  <option value="FINANCIAL_PRODUCTS_SERVICES">Produtos/serviços financeiros</option>
                  <option value="ISSUES_ELECTIONS_POLITICS">Questões, eleições ou política</option>
                </Select>
              </Field>
            </FormGrid>
          </Section>

          <Section>
            <SectionTitle>
              <SectionIconWrap><MdSchedule size={20} aria-hidden /></SectionIconWrap>
              Agendamento
            </SectionTitle>
            <FieldHint style={{ marginBottom: 16, display: 'block' }}>
              Defina quando a campanha será criada na Meta (data/hora de início da veiculação) e quando deve terminar.
            </FieldHint>
            <FormGrid>
              <Field>
                <FieldLabel>Data e hora em que a campanha será criada (Brasília)</FieldLabel>
                <Input
                  type="datetime-local"
                  value={form.runAt}
                  onChange={e => setForm(prev => ({ ...prev, runAt: e.target.value }))}
                />
                <FieldHint>A data de início da campanha na Meta será esta data e hora.</FieldHint>
              </Field>
              <Field>
                <FieldLabel>Data e hora de fim da campanha (opcional)</FieldLabel>
                <Input
                  type="datetime-local"
                  value={form.runEndAt}
                  onChange={e => setForm(prev => ({ ...prev, runEndAt: e.target.value }))}
                />
                <FieldHint>Quando a campanha deve parar de veicular na Meta.</FieldHint>
              </Field>
            </FormGrid>
          </Section>

          <Section>
            <SectionTitle>
              <SectionIconWrap><MdAttachMoney size={20} aria-hidden /></SectionIconWrap>
              Orçamento
            </SectionTitle>
            <FormGrid>
              <Field>
                <FieldLabel>Orçamento diário (R$)</FieldLabel>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="R$ 0,00"
                  value={form.dailyBudgetReais}
                  onChange={e =>
                    setForm(prev => ({
                      ...prev,
                      dailyBudgetReais: maskCurrencyReais(e.target.value),
                    }))
                  }
                />
                <FieldHint>Mínimo R$ 5 (Meta). Valor total = orçamento diário × dias de veiculação.</FieldHint>
                {form.runAt &&
                  form.runEndAt &&
                  getNumericValue(form.dailyBudgetReais) >= 5 && (() => {
                    const start = new Date(form.runAt);
                    const end = new Date(form.runEndAt);
                    if (end <= start) return null;
                    const days = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
                    const daily = getNumericValue(form.dailyBudgetReais);
                    const total = days * daily;
                    return (
                      <p style={{ marginTop: 8, fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>
                        Valor total estimado: {formatCurrencyValue(daily)}/dia × {days} {days === 1 ? 'dia' : 'dias'} = {formatCurrencyValue(total)}
                      </p>
                    );
                  })()}
              </Field>
            </FormGrid>
          </Section>

          <Section>
            <SectionTitle>
              <SectionIconWrap><MdImage size={20} aria-hidden /></SectionIconWrap>
              Mídia do anúncio (imagem ou vídeo) — obrigatório
            </SectionTitle>
            <FormGrid>
              {hasMedia && (
                <Field>
                  <FieldLabel>Imagem ou vídeo atual</FieldLabel>
                  <PreviewCard style={{ maxWidth: 420, marginBottom: 8 }}>
                    <PreviewMediaWrap style={{ minHeight: 220, aspectRatio: '1.91 / 1' }}>
                      {form.creativeVideoUrl ? (
                        <PreviewMediaVideo
                          src={form.creativeVideoUrl}
                          controls
                          muted
                          playsInline
                          preload="auto"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      ) : form.creativeImageUrl ? (
                        <PreviewMediaImg
                          src={form.creativeImageUrl}
                          alt="Mídia do anúncio"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      ) : null}
                    </PreviewMediaWrap>
                  </PreviewCard>
                  <ButtonSecondary type="button" onClick={removeMedia} style={{ marginBottom: 16 }}>
                    <MdClose size={18} /> Remover mídia
                  </ButtonSecondary>
                </Field>
              )}
              <Field>
                <FieldLabel>Tipo</FieldLabel>
                <ScheduleRow style={{ gap: 16, flexWrap: 'wrap' }}>
                  <CheckboxWrap>
                    <input
                      type="radio"
                      name="creativeTypeEdit"
                      checked={creativeType === 'image'}
                      onChange={() => setCreativeType('image')}
                    />
                    <span>Imagem</span>
                  </CheckboxWrap>
                  <CheckboxWrap>
                    <input
                      type="radio"
                      name="creativeTypeEdit"
                      checked={creativeType === 'video'}
                      onChange={() => setCreativeType('video')}
                    />
                    <span>Vídeo</span>
                  </CheckboxWrap>
                </ScheduleRow>
              </Field>
              <Field>
                <FieldLabel>Enviar nova mídia</FieldLabel>
                <FileInputHidden
                  ref={fileInputRef}
                  accept={
                    creativeType === 'video'
                      ? 'video/mp4,video/quicktime'
                      : 'image/jpeg,image/png,image/gif,image/webp'
                  }
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
                      <FileUploadText>Clique ou arraste para substituir</FileUploadText>
                      <FileUploadHint>
                        {creativeType === 'video' ? 'MP4 ou MOV, até 150 MB' : 'JPEG, PNG, GIF ou WebP'}
                      </FileUploadHint>
                      {form.creativeFileLabel && (
                        <FileUploadFileName>{form.creativeFileLabel}</FileUploadFileName>
                      )}
                    </>
                  )}
                </FileUploadZone>
                <FieldHint style={{ marginTop: 6 }}>
                  O arquivo será enviado ao nosso servidor (S3). Você pode substituir a mídia atual.
                </FieldHint>
              </Field>
            </FormGrid>
          </Section>

          <FormActions style={{ marginTop: 24 }}>
            <ButtonSecondary
              type="button"
              onClick={() => navigate(campaignsPath)}
              disabled={submitting}
            >
              Cancelar
            </ButtonSecondary>
            <ButtonPrimary type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner aria-hidden /> Salvando...
                </>
              ) : (
                <>
                  <MdSave size={20} aria-hidden /> Salvar
                </>
              )}
            </ButtonPrimary>
          </FormActions>
        </form>
      </PageContainer>
    </Layout>
  );
}
