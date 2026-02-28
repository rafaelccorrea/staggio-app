import React from 'react';
import styled from 'styled-components';
import { usePermissionsContextOptional } from '../../contexts/PermissionsContext';
import { getPermissionDescription } from '../../utils/permissionDescriptions';

interface PermissionButtonProps {
  permission: string;
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  tooltip?: string;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  style?: React.CSSProperties;
}

const Button = styled.button<{
  $variant: string;
  $size: string;
  $disabled: boolean;
  $hasPermission: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: ${props =>
    props.$disabled || !props.$hasPermission ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  position: relative;

  /* Variantes de tamanho */
  ${props =>
    props.$size === 'small' &&
    `
    padding: 6px 12px;
    font-size: 12px;
    min-height: 32px;
    
    @media (max-width: 768px) {
      padding: 4px 8px;
      font-size: 12px;
      min-height: 28px;
    }
  `}

  ${props =>
    props.$size === 'medium' &&
    `
    padding: 12px 20px;
    font-size: 14px;
    min-height: 44px;
    
    @media (max-width: 768px) {
      width: 100%;
      justify-content: center;
    }
  `}

  ${props =>
    props.$size === 'large' &&
    `
    padding: 12px 20px;
    font-size: 16px;
    min-height: 48px;
  `}

  /* Variantes de cor */
  ${props =>
    props.$variant === 'primary' &&
    `
    background: ${
      props.$disabled || !props.$hasPermission
        ? props.theme.colors.border
        : props.theme.colors.primary
    };
    color: ${
      props.$disabled || !props.$hasPermission
        ? props.theme.colors.textSecondary
        : '#ffffff'
    };
    
    &:hover {
      background: ${
        props.$disabled || !props.$hasPermission
          ? props.theme.colors.border
          : props.theme.colors.primaryHover ||
            props.theme.colors.primaryDark ||
            props.theme.colors.primary
      };
    }
  `}

  ${props =>
    props.$variant === 'secondary' &&
    `
    background: ${
      props.$disabled || !props.$hasPermission
        ? props.theme.colors.backgroundSecondary
        : props.theme.colors.cardBackground
    };
    color: ${
      props.$disabled || !props.$hasPermission
        ? props.theme.colors.textSecondary
        : props.theme.colors.text
    };
    border: 1px solid ${
      props.$disabled || !props.$hasPermission
        ? props.theme.colors.border
        : props.theme.colors.border
    };
    
    &:hover {
      background: ${
        props.$disabled || !props.$hasPermission
          ? props.theme.colors.backgroundSecondary
          : props.theme.colors.backgroundSecondary
      };
    }
  `}

  ${props =>
    props.$variant === 'danger' &&
    `
    background: ${
      props.$disabled || !props.$hasPermission
        ? props.theme.colors.border
        : props.theme.colors.error
    };
    color: ${
      props.$disabled || !props.$hasPermission
        ? props.theme.colors.textSecondary
        : '#ffffff'
    };
    
    &:hover {
      background: ${
        props.$disabled || !props.$hasPermission
          ? props.theme.colors.border
          : props.theme.colors.errorHover || '#dc2626'
      };
    }
  `}

  /* Efeitos de foco */
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }

  /* Desabilitado: opacidade e não clicável (pointer-events evita qualquer clique) */
  ${props =>
    (props.$disabled || !props.$hasPermission) &&
    `
    opacity: 0.6;
    pointer-events: none;
  `}
`;

export const PermissionButton: React.FC<PermissionButtonProps> = ({
  permission,
  onClick,
  children,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  tooltip,
  className,
  type = 'button',
  style,
}) => {
  const permissionsContext = usePermissionsContextOptional();
  const permissionsLoading = permissionsContext?.isLoading ?? true;
  const hasPermission =
    !permissionsLoading && (permissionsContext?.hasPermission(permission) ?? false);

  const isDisabled = disabled || !hasPermission || permissionsLoading;

  const handleClick = (e: React.MouseEvent) => {
    if (isDisabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick?.();
  };

  const permissionDescription = getPermissionDescription(permission);
  const tooltipMessage =
    tooltip ||
    `Você não tem permissão para ${permissionDescription.toLowerCase()}. Entre em contato com um administrador para solicitar acesso.`;

  return (
    <Button
      $variant={variant}
      $size={size}
      $disabled={isDisabled}
      $hasPermission={hasPermission}
      onClick={handleClick}
      disabled={isDisabled}
      className={className}
      type={type}
      title={hasPermission ? tooltip : tooltipMessage}
      style={style}
      aria-disabled={isDisabled}
    >
      {children}
    </Button>
  );
};
