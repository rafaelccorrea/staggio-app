import React, { useEffect } from 'react';
import { ThemeProvider, createGlobalStyle } from 'styled-components';
import { getTheme } from '../styles/theme';

interface FichaVendaThemeWrapperProps {
  children: React.ReactNode;
}

// Tema específico para Ficha de Venda (sempre claro)
const fichaVendaTheme = getTheme('light');
const lc = fichaVendaTheme.rawColors;

// Sobrescreve as variáveis CSS do :root com os valores do tema light,
// garantindo que mesmo no modo dark o GlobalStyle não contamine as fichas.
const FichaLightGlobalStyle = createGlobalStyle`
  :root {
    --color-primary: ${lc.primary} !important;
    --color-primary-dark: ${lc.primaryDark} !important;
    --color-primary-hover: ${lc.primaryHover} !important;
    --color-secondary: ${lc.secondary} !important;
    --color-background: ${lc.background} !important;
    --color-surface: ${lc.surface} !important;
    --color-text: ${lc.text} !important;
    --color-text-secondary: ${lc.textSecondary} !important;
    --color-text-light: ${lc.textLight} !important;
    --color-border: ${lc.border} !important;
    --color-border-light: ${lc.borderLight} !important;
    --color-error: ${lc.error} !important;
    --color-success: ${lc.success} !important;
    --color-warning: ${lc.warning} !important;
    --color-purple: ${lc.purple} !important;
    --color-card-background: ${lc.cardBackground} !important;
    --color-background-secondary: ${lc.backgroundSecondary} !important;
    --color-background-tertiary: ${lc.backgroundTertiary} !important;
    --color-hover: ${lc.hover} !important;
    --color-hover-dark: ${lc.hoverDark} !important;
    --color-input-background: ${lc.inputBackground} !important;
    --color-hover-background: ${lc.hoverBackground} !important;
    --color-success-background: ${lc.successBackground} !important;
    --color-success-border: ${lc.successBorder} !important;
    --color-success-text: ${lc.successText} !important;
    --color-error-background: ${lc.errorBackground} !important;
    --color-error-border: ${lc.errorBorder} !important;
    --color-error-text: ${lc.errorText} !important;
    --color-warning-background: ${lc.warningBackground} !important;
    --color-warning-border: ${lc.warningBorder} !important;
    --color-warning-text: ${lc.warningText} !important;
    --color-info-background: ${lc.infoBackground} !important;
    --color-info-border: ${lc.infoBorder} !important;
    --color-info-text: ${lc.infoText} !important;
  }

  body {
    background: ${lc.background} !important;
    color: ${lc.text} !important;
  }
`;

export const FichaVendaThemeWrapper: React.FC<FichaVendaThemeWrapperProps> = ({
  children,
}) => {
  // Forçar tema claro para Ficha de Venda
  useEffect(() => {
    // Salvar tema atual
    const currentTheme = document.body.getAttribute('data-theme');
    localStorage.setItem('dream_keys_theme_backup', currentTheme || 'light');

    // Forçar tema claro imediatamente no DOM
    const forceLightTheme = () => {
      document.body.setAttribute('data-theme', 'light');
      document.documentElement.setAttribute('data-theme', 'light');
      // Também sobrescrever no localStorage temporariamente
      localStorage.setItem('dream_keys_theme', 'light');
    };

    forceLightTheme();

    // Habilitar scroll no body, html e #root
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.height = 'auto';
    const root = document.getElementById('root');
    if (root) {
      root.style.overflow = 'auto';
      root.style.height = 'auto';
    }

    // Prevenir mudança de tema enquanto estiver na página
    const preventThemeChange = () => {
      forceLightTheme();
    };

    // Observar mudanças no atributo data-theme
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-theme'
        ) {
          const currentValue = (mutation.target as HTMLElement).getAttribute(
            'data-theme'
          );
          if (currentValue !== 'light') {
            preventThemeChange();
          }
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    // Verificar periodicamente para garantir tema light
    const intervalId = setInterval(() => {
      if (document.body.getAttribute('data-theme') !== 'light') {
        preventThemeChange();
      }
    }, 100);

    // Cleanup: restaurar tema original e scroll quando componente desmontar
    return () => {
      clearInterval(intervalId);
      observer.disconnect();
      const originalTheme =
        localStorage.getItem('dream_keys_theme_backup') || 'light';
      document.body.setAttribute('data-theme', originalTheme);
      document.documentElement.setAttribute('data-theme', originalTheme);
      localStorage.setItem('dream_keys_theme', originalTheme);
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
      if (root) {
        root.style.overflow = '';
        root.style.height = '';
      }
    };
  }, []);

  return (
    <ThemeProvider theme={fichaVendaTheme}>
      <FichaLightGlobalStyle />
      {children}
    </ThemeProvider>
  );
};
