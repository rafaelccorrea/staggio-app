import React from 'react';
import { useLocation } from 'react-router-dom';
import { useInitializationFlow } from '../hooks/useInitializationFlow';
import { LottieLoading } from './common/LottieLoading';

interface InitializationFlowProps {
  children: React.ReactNode;
}

/** Rotas que são 100% públicas e não devem passar por nenhum fluxo de auth/empresa (evita 401 e redirect para login). */
const STRICT_PUBLIC_PATHS = ['/public/assinatura-visita'];

export const InitializationFlow: React.FC<InitializationFlowProps> = ({
  children,
}) => {
  const location = useLocation();
  const isStrictPublic = STRICT_PUBLIC_PATHS.some(p =>
    location.pathname.startsWith(p)
  );

  // Para assinatura de visita etc.: renderizar direto, sem loading nem useInitializationFlow (evita 401 → redirect login)
  if (isStrictPublic) {
    return <>{children}</>;
  }

  const { isLoading, error } = useInitializationFlow();

  if (isLoading) {
    return <LottieLoading message='Carregando empresas...' />;
  }

  if (error) {
    console.error('❌ Erro na inicialização:', error);
    // Mesmo com erro, renderizar children para não travar a aplicação
  }

  return <>{children}</>;
};
