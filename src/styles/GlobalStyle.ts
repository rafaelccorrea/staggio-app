import { createGlobalStyle } from 'styled-components';

/**
 * Variáveis e estilos globais que reagem ao tema (light/dark).
 * Deve ficar dentro do ThemeProvider do styled-components para receber theme.
 */
export const GlobalStyle = createGlobalStyle`
  :root {
    --color-primary: ${(p: { theme?: { rawColors?: Record<string, string> } }) => p.theme?.rawColors?.primary ?? '#A63126'};
    --color-primary-dark: ${(p: { theme?: { rawColors?: Record<string, string> } }) => p.theme?.rawColors?.primaryDark ?? '#8B251C'};
    --color-primary-hover: ${(p: { theme?: { rawColors?: Record<string, string> } }) => p.theme?.rawColors?.primaryHover ?? '#8a2920'};
    --color-secondary: ${(p: { theme?: { rawColors?: Record<string, string> } }) => p.theme?.rawColors?.secondary ?? '#2c3e50'};
    --color-background: ${(p: { theme?: { rawColors?: Record<string, string> } }) => p.theme?.rawColors?.background ?? '#F2F2F2'};
    --color-surface: ${(p: { theme?: { rawColors?: Record<string, string> } }) => p.theme?.rawColors?.surface ?? '#ffffff'};
    --color-text: ${(p: { theme?: { rawColors?: Record<string, string> } }) => p.theme?.rawColors?.text ?? '#1e293b'};
    --color-text-secondary: ${(p: { theme?: { rawColors?: Record<string, string> } }) => p.theme?.rawColors?.textSecondary ?? '#64748b'};
    --color-border: ${(p: { theme?: { rawColors?: Record<string, string> } }) => p.theme?.rawColors?.border ?? '#e2e8f0'};
    --color-error: ${(p: { theme?: { rawColors?: Record<string, string> } }) => p.theme?.rawColors?.error ?? '#ef4444'};
    --color-success: ${(p: { theme?: { rawColors?: Record<string, string> } }) => p.theme?.rawColors?.success ?? '#22c55e'};
    --color-warning: ${(p: { theme?: { rawColors?: Record<string, string> } }) => p.theme?.rawColors?.warning ?? '#f59e0b'};
    --color-purple: ${(p: { theme?: { rawColors?: Record<string, string> } }) => p.theme?.rawColors?.purple ?? '#8B5CF6'};
    --color-card-background: ${(p: { theme?: { rawColors?: Record<string, string> } }) => p.theme?.rawColors?.cardBackground ?? '#ffffff'};
    --color-background-secondary: ${(p: { theme?: { rawColors?: Record<string, string> } }) => p.theme?.rawColors?.backgroundSecondary ?? '#E5E5E5'};
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body, #root {
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }

  body {
    font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: ${(p: { theme?: { rawColors?: Record<string, string> } }) => p.theme?.rawColors?.background ?? 'var(--color-background)'};
    color: ${(p: { theme?: { rawColors?: Record<string, string> } }) => p.theme?.rawColors?.text ?? 'var(--color-text)'};
    line-height: 1.6;
  }

  /* Scrollbar personalizada - adapta ao tema */
  ::-webkit-scrollbar {
    width: 6px;
  }

  ::-webkit-scrollbar-track {
    background: ${(p: {
      theme?: { rawColors?: Record<string, string> };
      mode?: string;
    }) =>
      p.theme?.mode === 'dark'
        ? (p.theme?.rawColors?.backgroundSecondary ?? '#1C1C1C')
        : '#f8fafc'};
  }

  ::-webkit-scrollbar-thumb {
    background: ${(p: {
      theme?: { mode?: string; rawColors?: Record<string, string> };
    }) =>
      p.theme?.mode === 'dark'
        ? (p.theme?.rawColors?.border ?? '#404040')
        : '#cbd5e1'};
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${(p: {
      theme?: { mode?: string; rawColors?: Record<string, string> };
    }) =>
      p.theme?.mode === 'dark'
        ? (p.theme?.rawColors?.textSecondary ?? '#6b7280')
        : '#94a3b8'};
  }

  /* Selects: adaptam ao tema (dark/light) e evitam seta colada no canto */
  select {
    padding-right: 2.75rem !important; /* 44px – espaço entre texto e seta */
    background-color: var(--color-surface) !important;
    color: var(--color-text) !important;
    border-color: var(--color-border);
  }
  select option {
    background: var(--color-surface);
    color: var(--color-text);
  }

  button {
    cursor: pointer;
    font-family: inherit;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  /* DatePicker dropdown (card de seleção) – adapta aos temas dark e light */
  .ant-picker-dropdown {
    background: ${(p: { theme?: { rawColors?: Record<string, string> } }) =>
      p.theme?.rawColors?.cardBackground ?? 'var(--color-card-background)'} !important;
    border: 1px solid
      ${(p: { theme?: { rawColors?: Record<string, string> } }) =>
        p.theme?.rawColors?.border ?? 'var(--color-border)'} !important;
    border-radius: 12px !important;
    box-shadow: ${(p: { theme?: { mode?: string } }) =>
      p.theme?.mode === 'dark'
        ? '0 8px 32px rgba(0, 0, 0, 0.4)'
        : '0 8px 32px rgba(0, 0, 0, 0.15)'} !important;
  }

  .ant-picker-dropdown .ant-picker-panel-container {
    background: ${(p: { theme?: { rawColors?: Record<string, string> } }) =>
      p.theme?.rawColors?.cardBackground ?? 'var(--color-card-background)'} !important;
  }

  .ant-picker-dropdown .ant-picker-panel {
    background: ${(p: { theme?: { rawColors?: Record<string, string> } }) =>
      p.theme?.rawColors?.cardBackground ?? 'var(--color-card-background)'} !important;
    border: none !important;
  }

  .ant-picker-dropdown .ant-picker-header {
    background: ${(p: { theme?: { rawColors?: Record<string, string> } }) =>
      p.theme?.rawColors?.backgroundSecondary ?? 'var(--color-background-secondary)'} !important;
    border-bottom: 1px solid
      ${(p: { theme?: { rawColors?: Record<string, string> } }) =>
        p.theme?.rawColors?.border ?? 'var(--color-border)'} !important;
    color: ${(p: { theme?: { rawColors?: Record<string, string> } }) =>
      p.theme?.rawColors?.text ?? 'var(--color-text)'} !important;
  }

  .ant-picker-dropdown .ant-picker-header-view button {
    color: ${(p: { theme?: { rawColors?: Record<string, string> } }) =>
      p.theme?.rawColors?.text ?? 'var(--color-text)'} !important;
  }

  .ant-picker-dropdown .ant-picker-content th {
    color: ${(p: { theme?: { rawColors?: Record<string, string> } }) =>
      p.theme?.rawColors?.textSecondary ?? 'var(--color-text-secondary)'} !important;
  }

  .ant-picker-dropdown .ant-picker-cell {
    color: ${(p: { theme?: { rawColors?: Record<string, string> } }) =>
      p.theme?.rawColors?.text ?? 'var(--color-text)'} !important;
  }

  .ant-picker-dropdown .ant-picker-cell:hover:not(.ant-picker-cell-selected):not(.ant-picker-cell-range-start) .ant-picker-cell-inner {
    background: ${(p: { theme?: { mode?: string; rawColors?: Record<string, string> } }) =>
      p.theme?.mode === 'dark'
        ? (p.theme?.rawColors?.backgroundSecondary ?? 'var(--color-background-secondary)') + 'cc'
        : (p.theme?.rawColors?.primary ?? 'var(--color-primary)') + '20'} !important;
    color: ${(p: { theme?: { rawColors?: Record<string, string> } }) =>
      p.theme?.rawColors?.text ?? 'var(--color-text)'} !important;
  }

  .ant-picker-dropdown .ant-picker-cell-selected .ant-picker-cell-inner,
  .ant-picker-dropdown .ant-picker-cell-in-view.ant-picker-cell-selected .ant-picker-cell-inner {
    background: ${(p: { theme?: { rawColors?: Record<string, string> } }) =>
      p.theme?.rawColors?.primary ?? 'var(--color-primary)'} !important;
    color: #fff !important;
  }

  .ant-picker-dropdown .ant-picker-cell-today .ant-picker-cell-inner {
    border-color: ${(p: { theme?: { rawColors?: Record<string, string> } }) =>
      p.theme?.rawColors?.primary ?? 'var(--color-primary)'} !important;
    color: ${(p: { theme?: { rawColors?: Record<string, string> } }) =>
      p.theme?.rawColors?.primary ?? 'var(--color-primary)'} !important;
  }

  .ant-picker-dropdown .ant-picker-prev-icon,
  .ant-picker-dropdown .ant-picker-next-icon {
    color: ${(p: { theme?: { rawColors?: Record<string, string> } }) =>
      p.theme?.rawColors?.textSecondary ?? 'var(--color-text-secondary)'} !important;
  }

  .ant-picker-dropdown .ant-picker-prev-icon:hover,
  .ant-picker-dropdown .ant-picker-next-icon:hover {
    color: ${(p: { theme?: { rawColors?: Record<string, string> } }) =>
      p.theme?.rawColors?.primary ?? 'var(--color-primary)'} !important;
  }

  .ant-picker-dropdown .ant-picker-cell-disabled {
    color: ${(p: { theme?: { rawColors?: Record<string, string> } }) =>
      p.theme?.rawColors?.textSecondary ?? 'var(--color-text-secondary)'} !important;
    opacity: 0.5 !important;
  }

  .ant-picker-dropdown .ant-picker-footer {
    border-top: 1px solid
      ${(p: { theme?: { rawColors?: Record<string, string> } }) =>
        p.theme?.rawColors?.border ?? 'var(--color-border)'} !important;
    background: ${(p: { theme?: { rawColors?: Record<string, string> } }) =>
      p.theme?.rawColors?.backgroundSecondary ?? 'var(--color-background-secondary)'} !important;
    color: ${(p: { theme?: { rawColors?: Record<string, string> } }) =>
      p.theme?.rawColors?.text ?? 'var(--color-text)'} !important;
  }

  .ant-picker-dropdown .ant-picker-today-btn,
  .ant-picker-dropdown .ant-picker-clear-btn {
    color: ${(p: { theme?: { rawColors?: Record<string, string> } }) =>
      p.theme?.rawColors?.primary ?? 'var(--color-primary)'} !important;
  }

  .ant-picker-dropdown .ant-picker-today-btn:hover,
  .ant-picker-dropdown .ant-picker-clear-btn:hover {
    color: ${(p: { theme?: { rawColors?: Record<string, string> } }) =>
      p.theme?.rawColors?.primary ?? 'var(--color-primary)'} !important;
    background: ${(p: { theme?: { mode?: string; rawColors?: Record<string, string> } }) =>
      p.theme?.mode === 'dark'
        ? (p.theme?.rawColors?.border ?? 'var(--color-border)') + '40'
        : (p.theme?.rawColors?.primary ?? 'var(--color-primary)') + '15'} !important;
  }
`;
