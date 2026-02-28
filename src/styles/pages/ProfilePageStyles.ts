import styled, { keyframes } from 'styled-components';
import { MdPerson, MdSearch } from 'react-icons/md';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const ProfilePageContainer = styled.div`
  padding: 0;
  min-height: 100vh;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  animation: ${fadeInUp} 0.4s ease-out;

  @media (max-width: 1024px) {
    padding: 0;
  }
  @media (max-width: 768px) {
    padding: 0;
  }
`;

/* Hero / Cabeçalho moderno - fundo neutro (sem vermelho) */
export const ProfileHero = styled.section`
  position: relative;
  padding: 40px 32px 56px;
  margin-bottom: -24px;
  border-radius: 0 0 28px 28px;
  background: linear-gradient(
    180deg,
    ${props => props.theme.colors.backgroundSecondary} 0%,
    ${props => props.theme.colors.background || props.theme.colors.cardBackground} 100%
  );
  border-bottom: 1px solid ${props => props.theme.colors.border};
  box-shadow: ${props =>
    props.theme.mode === 'dark'
      ? '0 4px 24px rgba(0, 0, 0, 0.25)'
      : '0 4px 24px rgba(0, 0, 0, 0.06)'};
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40%;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.03), transparent);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    padding: 32px 20px 48px;
    margin-bottom: -20px;
    border-radius: 0 0 20px 20px;
  }
`;

export const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  gap: 28px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 20px;
  }
`;

export const HeroAvatarWrap = styled.div`
  flex-shrink: 0;
  position: relative;
`;

export const HeroMeta = styled.div`
  flex: 1;
  min-width: 0;
  padding-bottom: 4px;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

/* Nome e tags na mesma linha (hero) */
export const HeroTitleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 14px;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    justify-content: center;
    gap: 8px 12px;
  }
`;

export const HeroTagsWrap = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 10px;
`;

export const HeroTagPill = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => `${props.$color}22`};
  color: ${props => props.$color};
  border: 1px solid ${props => `${props.$color}50`};
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

export const HeroTagPillDot = styled.span<{ $color: string }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${props => props.$color};
  flex-shrink: 0;
`;

export const HeroTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${props =>
    props.theme.mode === 'dark'
      ? (props.theme.rawColors?.text ?? '#E6E6E6')
      : props.theme.colors.text};
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

export const HeroSubtitle = styled.p`
  font-size: 0.95rem;
  color: ${props =>
    props.theme.mode === 'dark'
      ? (props.theme.rawColors?.textSecondary ?? '#B3B3B3')
      : props.theme.colors.textSecondary};
  margin: 0 0 16px 0;
  font-weight: 500;
`;

export const HeroBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 999px;
  background: ${props => props.theme.colors.primary}18;
  color: ${props => props.theme.colors.primary};
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid ${props => props.theme.colors.primary}30;
`;

export const HeroActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
  padding-bottom: 4px;

  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
    justify-content: center;
  }
`;

export const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  flex-wrap: wrap;
  gap: 12px;
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

export const ProfileTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${props =>
    props.theme.mode === 'dark'
      ? (props.theme.rawColors?.text ?? '#E6E6E6')
      : props.theme.colors.text};
  margin: 0;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.75rem;
  }
`;

export const ProfileIcon = styled(MdPerson)`
  color: ${props => props.theme.colors.primary};
  font-size: 2.5rem;
`;

export const ProfileCount = styled.div`
  background: ${props => props.theme.colors.primary}20;
  color: ${props => props.theme.colors.primary};
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  border: 1px solid ${props => props.theme.colors.primary}30;
`;

export const ProfileUserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  background: ${props => props.theme.colors.backgroundSecondary};
  border-radius: 16px;
  border: 1px solid ${props => props.theme.colors.border};
`;

export const ProfileUserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ProfileUserName = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

export const ProfileUserRole = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

export const HeroAvatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 24px;
  overflow: hidden;
  background: ${props => props.theme.colors.backgroundSecondary};
  border: 3px solid ${props => props.theme.colors.border};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;

  &:hover {
    transform: scale(1.03);
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12);
  }

  @media (max-width: 768px) {
    width: 88px;
    height: 88px;
    border-radius: 20px;
    border-width: 2px;
  }
`;

export const HeroAvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const HeroAvatarPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.25rem;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  background: ${props => props.theme.colors.backgroundSecondary};
`;

export const EditProfileButton = styled.button`
  background: linear-gradient(
    135deg,
    ${props => props.theme.colors.primary} 0%,
    ${props => props.theme.colors.primaryDark} 100%
  );
  color: ${props =>
    props.theme.mode === 'dark'
      ? props.theme.colors.background || '#fff'
      : '#fff'};
  border: none;
  border-radius: 16px;
  padding: 16px 24px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px ${props => props.theme.colors.primary}30;

  &:hover {
    box-shadow: 0 6px 20px ${props => props.theme.colors.primary}40;
    opacity: 0.9;
  }

  &:active {
    opacity: 0.8;
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

export const HeroEditButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 12px 20px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s ease;
  box-shadow: ${props =>
    props.theme.mode === 'dark'
      ? '0 2px 12px rgba(0, 0, 0, 0.3)'
      : `0 2px 12px ${props.theme.colors.primary}40`};

  &:hover {
    filter: brightness(1.12);
    transform: translateY(-1px);
    box-shadow: ${props =>
      props.theme.mode === 'dark'
        ? '0 4px 16px rgba(0, 0, 0, 0.4)'
        : `0 4px 16px ${props.theme.colors.primary}50`};
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

/* Grid principal: coluna esquerda (perfil + segurança) | coluna direita (empresas) */
export const ProfileMainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.15fr;
  gap: 28px;
  padding: 0 32px 40px;
  align-items: start;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    padding: 0 24px 32px;
  }

  @media (max-width: 768px) {
    gap: 20px;
    padding: 0 16px 24px;
  }
`;

export const ProfileLeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const ProfileRightColumn = styled.div`
  min-width: 0;
`;

export const ProfileControls = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
  padding: 20px;
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 20px;
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  flex-wrap: wrap;

  @media (max-width: 768px) {
    padding: 12px;
    border-radius: 12px;
    gap: 12px;
  }
`;

export const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
  min-width: 240px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    max-width: 100%;
    min-width: 100%;
    margin-bottom: 16px;
  }

  @media (max-width: 480px) {
    margin-bottom: 12px;
  }
`;

export const SearchInputContainer = styled.div`
  position: relative;
  max-width: 400px;

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 16px 20px 16px 50px;
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 16px;
  font-size: 1rem;
  background: ${props => props.theme.colors.cardBackground};
  color: ${props => props.theme.colors.text};
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }

  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

export const SearchIcon = styled(MdSearch)`
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1.25rem;
  pointer-events: none;
  z-index: 1;
`;

export const FilterToggle = styled.button`
  background: ${props => props.theme.colors.backgroundSecondary};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 16px;
  padding: 16px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primary}10;
  }

  &:active {
    transform: translateY(1px);
  }
`;

export const ActiveFiltersIndicator = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  background: ${props => props.theme.colors.error};
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  border: 2px solid ${props => props.theme.colors.cardBackground};
`;

// Filtros
export const FilterPanel = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 20px;
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 32px;
  overflow: hidden;
  animation: slideDown 0.3s ease-out;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const FilterHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.backgroundSecondary};
`;

export const FilterTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

export const FilterClose = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
  }
`;

export const FilterContent = styled.div`
  padding: 24px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const FilterLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

export const FilterSelect = styled.select`
  padding: 12px 16px;
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

export const FilterActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  grid-column: 1 / -1;
  padding-top: 16px;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

export const FilterButton = styled.button<{ primary?: boolean }>`
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;

  ${props =>
    props.primary
      ? `
    background: ${props.theme.colors.primary};
    color: white;
    
    &:hover {
      background: ${props.theme.colors.primaryDark};
      transform: translateY(-2px);
      box-shadow: 0 4px 12px ${props.theme.colors.primary}40;
    }
  `
      : `
    background: ${props.theme.colors.backgroundSecondary};
    color: ${props.theme.colors.text};
    border-color: ${props.theme.colors.border};
    
    &:hover {
      background: ${props.theme.colors.background};
      border-color: ${props.theme.colors.primary};
      color: ${props.theme.colors.primary};
    }
  `}

  &:active {
    transform: translateY(0);
  }
`;

export const ProfileStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
`;

export const StatCard = styled.div<{ $accentColor?: string }>`
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 16px;
  padding: 20px;
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 16px;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${props => props.$accentColor || props.theme.colors.primary};
    border-radius: 4px 0 0 4px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 480px) {
    padding: 14px;
    border-radius: 12px;
    gap: 12px;
  }
`;

export const StatIcon = styled.div<{ color?: string }>`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: ${props => (props.color ? `${props.color}18` : `${props.theme.colors.primary}18`)};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.color || props.theme.colors.primary};
  font-size: 1.35rem;
  flex-shrink: 0;
`;

export const StatContent = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

export const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${props =>
    props.theme.mode === 'dark'
      ? (props.theme.rawColors?.text ?? '#E6E6E6')
      : props.theme.colors.text};
  margin-bottom: 2px;
  line-height: 1.2;
`;

export const StatLabel = styled.div`
  font-size: 0.8rem;
  color: ${props =>
    props.theme.mode === 'dark'
      ? (props.theme.rawColors?.textSecondary ?? '#B3B3B3')
      : props.theme.colors.textSecondary};
  font-weight: 500;
`;

export const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

export const ModernProfileCard = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 20px;
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(
      90deg,
      ${props => props.theme.colors.primary},
      ${props => props.theme.colors.primaryLight}
    );
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  }
`;

export const ProfileCardGradient = styled.div`
  background: linear-gradient(
    135deg,
    ${props => props.theme.colors.backgroundSecondary} 0%,
    ${props => props.theme.colors.backgroundTertiary} 100%
  );
  padding: 24px;
  border-radius: 20px 20px 0 0;
  position: relative;
`;

export const ProfileCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

export const ProfileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const ProfileAvatar = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: ${props => props.theme.colors.backgroundSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid ${props => props.theme.colors.primary};
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

export const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 17px;
  object-fit: cover;
`;

export const AvatarPlaceholder = styled.div`
  font-size: 2rem;
  color: ${props => props.theme.colors.textSecondary};
  font-weight: 700;
`;

export const ProfileDetails = styled.div`
  flex: 1;
`;

export const ProfileName = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin: 0 0 4px 0;
`;

export const ProfileRole = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
  font-weight: 500;
`;

export const ProfileActions = styled.div`
  display: flex;
  gap: 8px;
`;

export const ActionButton = styled.button`
  background: ${props => props.theme.colors.backgroundSecondary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1rem;
  width: 36px;
  height: 36px;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primary}10;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }

  ${props =>
    props.$variant === 'danger' &&
    `
    &:hover {
      border-color: ${props.theme.colors.error};
      color: ${props.theme.colors.error};
      background: ${props.theme.colors.error}10;
    }
  `}
`;

export const ProfileStats = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 16px;
`;

export const ProfileStat = styled.div`
  text-align: center;
  flex: 1;
`;

export const ProfileStatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin-bottom: 4px;
`;

export const ProfileStatLabel = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
  font-weight: 500;
`;

export const InfoCard = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 20px;
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  margin-bottom: 0;
  padding: 0;
  overflow: hidden;
  transition: box-shadow 0.25s ease, transform 0.25s ease;

  &:hover {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  }
`;

export const CardHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.backgroundSecondary};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const CardTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${props =>
    props.theme.mode === 'dark'
      ? (props.theme.rawColors?.text ?? '#E6E6E6')
      : props.theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const CardAction = styled.button`
  background: ${props => props.theme.colors.primary}20;
  border: 1px solid ${props => props.theme.colors.primary}30;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme.colors.primary}30;
    transform: translateY(-1px);
  }
`;

export const SectionBody = styled.div`
  padding: 20px 24px 24px;

  @media (max-width: 768px) {
    padding: 16px 18px 20px;
  }
`;

/* Tags do perfil: container e pills coloridas */
export const TagsWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 4px 0;
`;

export const TagPill = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 600;
  background: ${props => `${props.$color}20`};
  color: ${props => props.$color};
  border: 1px solid ${props => `${props.$color}40`};
  box-shadow: 0 1px 3px ${props => `${props.$color}15`};
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px ${props => `${props.$color}25`};
  }
`;

export const TagPillDot = styled.span<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$color};
  flex-shrink: 0;
`;

export const InfoList = styled.ul`
  padding: 16px 24px 20px;
  margin: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;

  @media (max-width: 768px) {
    padding: 14px 18px 18px;
  }
`;

export const InfoItem = styled.li`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 12px;
  border-radius: 12px;
  min-width: 0;
  position: relative;
  transition: background 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.backgroundSecondary};
  }

  &::before {
    content: '';
    position: absolute;
    left: 24px;
    top: 50%;
    transform: translateY(-50%);
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: ${props => props.theme.colors.primary};
    opacity: 0.5;
  }

  @media (max-width: 768px) {
    align-items: flex-start;
    gap: 12px;
    padding: 12px 10px;
  }

  &:last-child {
    border-bottom: none;
  }
`;

export const InfoIcon = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.primary};
  font-size: 1.1rem;
`;

export const InfoContent = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden;

  & > div,
  & > p {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const InfoLabel = styled.div`
  font-size: 0.875rem;
  color: ${props =>
    props.theme.mode === 'dark'
      ? (props.theme.rawColors?.textSecondary ?? '#B3B3B3')
      : props.theme.colors.textSecondary};
  font-weight: 500;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const InfoValue = styled.div`
  font-size: 1rem;
  color: ${props =>
    props.theme.mode === 'dark'
      ? (props.theme.rawColors?.text ?? '#E6E6E6')
      : props.theme.colors.text};
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const InfoAction = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme.colors.primary}20;
  }
`;

export const CompanyCard = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 16px;
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

export const CompanyHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

export const CompanyName = styled.h4`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${props =>
    props.theme.mode === 'dark'
      ? (props.theme.rawColors?.text ?? '#E6E6E6')
      : props.theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const CompanyActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const CompanyActionButton = styled.button`
  background: ${props => props.theme.colors.backgroundSecondary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: ${props => props.theme.colors.textSecondary};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primary}10;
  }

  @media (max-width: 480px) {
    padding: 6px;
    border-radius: 6px;
  }
`;

export const CompanyInfo = styled.div`
  padding: 16px 20px;
`;

export const CompanyDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 0.875rem;
  color: ${props =>
    props.theme.mode === 'dark'
      ? (props.theme.rawColors?.textSecondary ?? '#B3B3B3')
      : props.theme.colors.textSecondary};

  &:last-child {
    margin-bottom: 0;
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${props => props.theme.colors.textSecondary};
`;

export const EmptyStateIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 16px;
  color: ${props => props.theme.colors.textLight};
`;

export const EmptyStateTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: ${props =>
    props.theme.mode === 'dark'
      ? (props.theme.rawColors?.text ?? '#E6E6E6')
      : props.theme.colors.text};
`;

export const EmptyStateDescription = styled.p`
  font-size: 1rem;
  margin: 0;
  color: ${props =>
    props.theme.mode === 'dark'
      ? (props.theme.rawColors?.textSecondary ?? '#B3B3B3')
      : props.theme.colors.textSecondary};
`;

export const LoadingText = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: ${props =>
    props.theme.mode === 'dark'
      ? (props.theme.rawColors?.textSecondary ?? '#B3B3B3')
      : props.theme.colors.textSecondary};
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
`;

export const HiddenFileInput = styled.input`
  display: none;
`;

// Responsive design
export const ResponsiveGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

export const StatsRow = styled.div`
  padding: 0 32px;
  margin-bottom: 28px;
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    padding: 0 16px;
    margin-bottom: 20px;
  }
`;

export const ResponsiveStats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 0;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  @media (max-width: 400px) {
    grid-template-columns: 1fr;
  }
`;
