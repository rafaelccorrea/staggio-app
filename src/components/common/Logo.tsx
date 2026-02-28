import React from 'react';
import { getAssetPath } from '../../utils/pathUtils';
import styled from 'styled-components';

interface LogoProps {
  /** Altura da logo em pixels */
  height?: number;
  /** Largura da logo (auto por padrão) */
  width?: number | 'auto';
  /** Classe CSS adicional */
  className?: string;
  /** Estilo inline adicional */
  style?: React.CSSProperties;
  /** Texto alternativo */
  alt?: string;
  /** Callback ao clicar na logo */
  onClick?: () => void;
  /** Se a logo é clicável */
  clickable?: boolean;
}

const LogoImage = styled.img<{ $clickable?: boolean; $height?: number; $width?: number | 'auto' }>`
  height: ${props => (props.$height ? `${props.$height}px` : '100px')};
  width: ${props => (props.$width === 'auto' ? 'auto' : props.$width ? `${props.$width}px` : 'auto')};
  object-fit: contain;
  display: block;
  cursor: ${props => (props.$clickable ? 'pointer' : 'default')};
  transition: opacity 0.2s ease;

  ${props =>
    props.$clickable &&
    `
    &:hover {
      opacity: 0.8;
    }
  `}
`;

const LogoContainer = styled.div<{ $clickable?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => (props.$clickable ? 'pointer' : 'default')};
`;

/**
 * Componente modular de Logo da Intellisys
 * 
 * @example
 * ```tsx
 * // Logo padrão
 * <Logo />
 * 
 * // Logo customizada
 * <Logo height={80} width={200} />
 * 
 * // Logo clicável
 * <Logo onClick={() => navigate('/')} clickable />
 * ```
 */
export const Logo: React.FC<LogoProps> = ({
  height = 100,
  width = 'auto',
  className,
  style,
  alt = 'Intellisys Logo',
  onClick,
  clickable = !!onClick,
}) => {
  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };

  const logoProps = {
    src: getAssetPath('intellisys.png'),
    alt,
    className,
    style,
    $clickable: clickable,
    $height: height,
    $width: width,
    onClick: clickable ? handleClick : undefined,
  };

  if (clickable) {
    return (
      <LogoContainer $clickable={clickable} onClick={handleClick}>
        <LogoImage {...logoProps} />
      </LogoContainer>
    );
  }

  return <LogoImage {...logoProps} />;
};

export default Logo;
