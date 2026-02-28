import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { Layout } from '../components/layout/Layout';
import { metaCampaignApi } from '../services/metaCampaignApi';
import type { MetaAdItem } from '../types/metaCampaign';
import {
  PageContainer,
  BackButton,
  PageTitle,
  PageSubtitle,
  Section,
  SectionTitle,
  MediaWrap,
  MediaVideo,
  MediaImg,
  MediaPlaceholder,
  ImageGallery,
  GalleryItem,
  GalleryImg,
  StatusBadge,
  TextBlock,
  EmptyState,
} from '../styles/pages/MetaAdDetailPageStyles';

function getStatusLabel(status?: string): string {
  if (!status) return '—';
  const u = status.toUpperCase();
  if (u === 'ACTIVE') return 'Ativa';
  if (u === 'PAUSED') return 'Pausada';
  if (u === 'ARCHIVED') return 'Arquivada';
  if (u === 'DELETED') return 'Excluída';
  return status;
}

export default function MetaAdDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { ad?: MetaAdItem; campaignName?: string; adSetName?: string } | undefined;
  const ad = state?.ad;

  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!ad?.creative?.object_story_spec?.video_data?.video_id) {
      setVideoUrl(null);
      return;
    }
    const videoId = ad.creative.object_story_spec.video_data.video_id;
    let cancelled = false;
    metaCampaignApi.getVideoSourceUrl(videoId).then(({ url }) => {
      if (!cancelled && url) setVideoUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [ad?.id, ad?.creative?.object_story_spec?.video_data?.video_id]);

  const handleBack = useCallback(() => {
    navigate('/integrations/meta-campaign/campaigns');
  }, [navigate]);

  if (!ad) {
    return (
      <Layout>
        <PageContainer>
          <BackButton type="button" onClick={handleBack}>
            <MdArrowBack size={20} /> Voltar às campanhas
          </BackButton>
          <EmptyState>
            <p>Anúncio não encontrado.</p>
            <p style={{ marginTop: 8 }}>
              Acesse os detalhes a partir da lista de campanhas (expandir ad sets e anúncios → Ver detalhes).
            </p>
          </EmptyState>
        </PageContainer>
      </Layout>
    );
  }

  const creative = ad.creative;
  const hasVideo = !!(videoUrl || creative?.video_url);
  const mainImageUrl = creative?.image_url || creative?.thumbnail_url;
  const thumbnailUrl = creative?.thumbnail_url;
  const imageUrls = [
    ...(mainImageUrl ? [mainImageUrl] : []),
    ...(thumbnailUrl && thumbnailUrl !== mainImageUrl ? [thumbnailUrl] : []),
  ].filter(Boolean) as string[];

  return (
    <Layout>
      <PageContainer>
        <BackButton type="button" onClick={handleBack} title="Voltar às campanhas">
          <MdArrowBack size={20} aria-hidden /> Voltar às campanhas
        </BackButton>

        <PageTitle>Detalhes do anúncio</PageTitle>
        <PageSubtitle>
          {state?.campaignName && (
            <span>Campanha: {state.campaignName}</span>
          )}
          {state?.adSetName && (
            <span style={{ marginLeft: state?.campaignName ? 12 : 0 }}>
              Conjunto: {state.adSetName}
            </span>
          )}
          {!state?.campaignName && !state?.adSetName && 'Visualize a mídia e os textos do anúncio.'}
        </PageSubtitle>

        <Section>
          <SectionTitle>Mídia</SectionTitle>
          {hasVideo ? (
            <MediaWrap>
              <MediaVideo
                src={videoUrl || creative?.video_url || ''}
                controls
                playsInline
                preload="metadata"
              />
            </MediaWrap>
          ) : mainImageUrl ? (
            <MediaWrap>
              <MediaImg src={mainImageUrl} alt="" />
            </MediaWrap>
          ) : (
            <MediaWrap>
              <MediaPlaceholder>
                {creative?.object_story_spec?.video_data
                  ? 'Vídeo (carregando... ou prévia indisponível)'
                  : 'Sem mídia'}
              </MediaPlaceholder>
            </MediaWrap>
          )}

          {imageUrls.length > 0 && (
            <>
              <SectionTitle style={{ marginTop: 24, marginBottom: 8 }}>
                Imagens
              </SectionTitle>
              <ImageGallery>
                {imageUrls.map((url, i) => (
                  <GalleryItem key={`${url}-${i}`}>
                    <GalleryImg src={url} alt="" />
                  </GalleryItem>
                ))}
              </ImageGallery>
            </>
          )}
        </Section>

        <Section>
          <SectionTitle>Informações</SectionTitle>
          <div style={{ marginBottom: 16 }}>
            <TextBlock as="div" style={{ marginBottom: 8 }}>
              <strong>Nome</strong>
              {ad.name || ad.id}
            </TextBlock>
            <StatusBadge>
              {getStatusLabel(ad.effective_status || ad.status)}
            </StatusBadge>
          </div>
          {creative?.title && (
            <TextBlock>
              <strong>Título (headline)</strong>
              {creative.title}
            </TextBlock>
          )}
          {creative?.body && (
            <TextBlock>
              <strong>Texto do anúncio</strong>
              {creative.body}
            </TextBlock>
          )}
        </Section>
      </PageContainer>
    </Layout>
  );
}
