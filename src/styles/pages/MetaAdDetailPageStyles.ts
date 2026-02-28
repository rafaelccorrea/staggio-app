import styled from 'styled-components';

export const PageContainer = styled.div`
  width: 100%;
  padding: 16px 20px 32px;
  min-height: 100vh;
  box-sizing: border-box;
  background: ${props => props.theme.colors.background};
  padding-left: max(20px, env(safe-area-inset-left, 0px));
  padding-right: max(20px, env(safe-area-inset-right, 0px));
  @media (min-width: 600px) {
    padding: 20px 24px 40px;
    padding-left: max(24px, env(safe-area-inset-left, 0px));
    padding-right: max(24px, env(safe-area-inset-right, 0px));
  }
  @media (min-width: 768px) {
    padding: 24px 28px 48px;
    padding-left: max(28px, env(safe-area-inset-left, 0px));
    padding-right: max(28px, env(safe-area-inset-right, 0px));
  }
  @media (min-width: 960px) {
    padding: 24px 32px 48px;
    padding-left: max(32px, env(safe-area-inset-left, 0px));
    padding-right: max(32px, env(safe-area-inset-right, 0px));
  }
`;

export const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  margin-bottom: 20px;
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 10px;
  color: ${props => props.theme.colors.text};
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  &:hover {
    background: ${props => props.theme.colors.backgroundSecondary};
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
  }
`;

export const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin: 0 0 8px 0;
  @media (min-width: 768px) {
    font-size: 1.75rem;
  }
`;

export const PageSubtitle = styled.p`
  font-size: 0.9375rem;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0 0 24px 0;
`;

export const Section = styled.section`
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  overflow: hidden;
  @media (min-width: 768px) {
    padding: 24px;
    margin-bottom: 24px;
  }
`;

export const SectionTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0 0 16px 0;
`;

/** Área da mídia em destaque: ocupa toda a largura do card (borda a borda) */
export const MediaWrap = styled.div`
  width: calc(100% + 40px);
  margin-left: -20px;
  margin-right: -20px;
  margin-bottom: 16px;
  border-radius: 0 0 12px 12px;
  overflow: hidden;
  background: ${props => props.theme.colors.backgroundTertiary};
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 280px;
  @media (min-width: 768px) {
    width: calc(100% + 48px);
    margin-left: -24px;
    margin-right: -24px;
    min-height: 420px;
  }
`;

export const MediaVideo = styled.video`
  width: 100%;
  min-height: 280px;
  max-height: 75vh;
  display: block;
  object-fit: contain;
  @media (min-width: 768px) {
    min-height: 420px;
  }
`;

export const MediaImg = styled.img`
  width: 100%;
  height: auto;
  min-height: 280px;
  max-height: 75vh;
  display: block;
  object-fit: contain;
  object-position: center;
  @media (min-width: 768px) {
    min-height: 420px;
  }
`;

export const MediaPlaceholder = styled.div`
  padding: 24px;
  font-size: 0.9375rem;
  color: ${props => props.theme.colors.textSecondary};
  text-align: center;
`;

export const ImageGallery = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  margin-top: 16px;
  @media (min-width: 768px) {
    gap: 16px;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
`;

export const GalleryItem = styled.div`
  border-radius: 10px;
  overflow: hidden;
  background: ${props => props.theme.colors.backgroundSecondary};
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const GalleryImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
`;

export const StatusBadge = styled.span`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  background: ${props => props.theme.colors.backgroundTertiary};
  color: ${props => props.theme.colors.text};
`;

export const TextBlock = styled.div`
  font-size: 0.9375rem;
  color: ${props => props.theme.colors.text};
  line-height: 1.6;
  margin-bottom: 12px;
  & strong {
    display: block;
    font-size: 0.8125rem;
    color: ${props => props.theme.colors.textSecondary};
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9375rem;
`;
