import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { usePermissionsContextOptional } from '../contexts/PermissionsContext';
import { useAuth } from '../hooks/useAuth';
import { LottieLoading } from './common/LottieLoading';

const DEFAULT_FALLBACK_PATH = '/dashboard';

interface PermissionRouteProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallbackPath?: string;
  noRoleBypass?: boolean;
  /** Quando true, exibe aviso de "sem permissão" na mesma página em vez de redirecionar */
  showDeniedInPlace?: boolean;
}

function safeString(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

class PermissionRouteErrorBoundary extends React.Component<
  { children: React.ReactNode; fallbackPath?: string },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: unknown): void {
    this.setState({ hasError: true });
    try {
      const msg =
        error != null && typeof (error as Error).message === 'string'
          ? (error as Error).message
          : String(error);
      console.error('[PermissionRoute] Erro capturado:', msg);
    } catch {
      // evita "Cannot convert object to primitive value" em extensões (ex.: React DevTools)
    }
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      const path =
        this.props.fallbackPath && typeof this.props.fallbackPath === 'string'
          ? this.props.fallbackPath
          : DEFAULT_FALLBACK_PATH;
      return <Navigate to={path} replace />;
    }
    return this.props.children;
  }
}

function PermissionDeniedPage({ onBack }: { onBack?: () => void }): React.ReactNode {
  const navigate = useNavigate();
  const handleBack = onBack || (() => navigate('/dashboard'));
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '48px 24px',
        gap: '16px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '3rem' }}>🔒</div>
      <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Acesso negado</h2>
      <p style={{ margin: 0, color: '#6B7280', maxWidth: '400px' }}>
        Você não tem permissão para acessar esta página. Entre em contato com o administrador do sistema.
      </p>
      <button
        onClick={handleBack}
        style={{
          marginTop: '8px',
          padding: '10px 24px',
          borderRadius: '8px',
          border: 'none',
          background: '#3B82F6',
          color: '#fff',
          fontWeight: 600,
          fontSize: '0.9rem',
          cursor: 'pointer',
        }}
      >
        Voltar
      </button>
    </div>
  );
}

function PermissionRouteInner(props: PermissionRouteProps): React.ReactNode {
  try {
    const {
      children,
      permission,
      permissions = [],
      requireAll = false,
      fallbackPath,
      noRoleBypass = false,
      showDeniedInPlace = false,
    } = props;

    const permissionsContext = usePermissionsContextOptional();
    const auth = useAuth();
    const getCurrentUser = auth?.getCurrentUser;
    const currentUser =
      typeof getCurrentUser === 'function' ? getCurrentUser() : null;

    const roleRaw =
      currentUser && typeof currentUser === 'object' && 'role' in currentUser
        ? (currentUser as { role?: unknown }).role
        : '';
    const userRole = safeString(roleRaw).toLowerCase();
    const hasRoleBypass = userRole
      ? ['master', 'admin', 'manager'].includes(userRole)
      : false;

    const permissionStr = safeString(permission);
    const permissionsList = Array.isArray(permissions)
      ? permissions.map(p => safeString(p)).filter(Boolean)
      : [];

    let hasAccess = false;
    if (permissionsContext === undefined || permissionsContext === null) {
      return <LottieLoading message="Verificando permissões..." />;
    }

    // Não renderizar conteúdo protegido enquanto permissões estão carregando (evita chamar APIs e 403).
    if (permissionsContext.isLoading) {
      return <LottieLoading message="Verificando permissões..." />;
    }

    // Quando exige permissão mas userPermissions ainda é null (ex.: cache invalidado, refetch em andamento), aguardar em vez de redirecionar
    const needsPermission = Boolean(permissionStr || permissionsList.length > 0);
    if (needsPermission && permissionsContext.userPermissions === null) {
      return <LottieLoading message="Verificando permissões..." />;
    }

    try {
      const hasPermission = permissionsContext.hasPermission;
      const hasAnyPermission = permissionsContext.hasAnyPermission;
      const hasAllPermissions = permissionsContext.hasAllPermissions;

      if (permissionStr) {
        hasAccess =
          typeof hasPermission === 'function' && hasPermission(permissionStr);
      } else if (permissionsList.length > 0) {
        if (requireAll) {
          hasAccess =
            typeof hasAllPermissions === 'function' &&
            hasAllPermissions(permissionsList);
        } else {
          hasAccess =
            typeof hasAnyPermission === 'function' &&
            hasAnyPermission(permissionsList);
        }
      } else {
        hasAccess = true;
      }
    } catch {
      hasAccess = false;
    }

    // Bypass por role (admin/master/manager): não aplicar para visit — exige permissão real para ver relatórios.
    const isVisitPermission = permissionStr === 'visit:view' || permissionStr === 'visit:manage' || permissionsList.some((p: string) => p === 'visit:view' || p === 'visit:manage');
    const requiresSpecificPermission = Boolean(permissionStr || permissionsList.length > 0);
    if (!hasAccess && hasRoleBypass && !noRoleBypass && requiresSpecificPermission && !isVisitPermission) {
      hasAccess = true;
    }

    if (!hasAccess) {
      if (showDeniedInPlace) {
        return <PermissionDeniedPage />;
      }
      const path = fallbackPath && typeof fallbackPath === 'string' ? fallbackPath : DEFAULT_FALLBACK_PATH;
      return <Navigate to={path} replace />;
    }

    return <>{children}</>;
  } catch {
    if (props.fallbackPath && typeof props.fallbackPath === 'string') {
      return <Navigate to={props.fallbackPath} replace />;
    }
    return null;
  }
}

export const PermissionRoute: React.FC<PermissionRouteProps> = (props) => (
  <PermissionRouteErrorBoundary fallbackPath={props.fallbackPath}>
    <PermissionRouteInner {...props} />
  </PermissionRouteErrorBoundary>
);
