import React, { useState, lazy, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/DatePickerCustom.css';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekYear from 'dayjs/plugin/weekYear';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isBetween from 'dayjs/plugin/isBetween';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

// Configurar plugins do dayjs globalmente
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);
dayjs.extend(dayOfYear);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(timezone);

// Configurar locale padrão e fuso horário
dayjs.locale('pt-br');
dayjs.tz.setDefault('America/Sao_Paulo');

// Importar utilitário de teste de notificações (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  import('./utils/testNotificationBadges');
}

import { GlobalStyle } from './styles/GlobalStyle';
import { getTheme } from './styles/theme';
import {
  ThemeProvider as CustomThemeProvider,
  useTheme,
} from './contexts/ThemeContext';
import { CompanyProvider, useCompanyContext } from './contexts';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { ModuleAccessProvider } from './contexts/ModuleAccessContext';
import { ModulesProvider } from './contexts';
import { PermissionsProvider } from './contexts/PermissionsContext';
import { ErrorBoundary } from './components';
// import { PageContentShimmer } from './components/shimmer'; // Removido - shimmer estava afetando todo o sistema
import { GlobalModuleUpgradeModal } from './components/GlobalModuleUpgradeModal';
// Chart.js provider to ensure scales are registered before charts render
import { ChartProvider } from './components/charts/ChartProvider';
import { GlobalPropertyPublicUpgradeModal } from './components/GlobalPropertyPublicUpgradeModal';
// import { usePermissionsMonitor } from './hooks/usePermissionsMonitor';
import { PermissionsNotification } from './components/notifications/PermissionsNotification';
import { useTokenRefresh } from './hooks/useTokenRefresh';
import { useWhatsAppNotifications } from './hooks/useWhatsAppNotifications';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import { PermissionRoute } from './components/PermissionRoute';
import { AdminRoute } from './components/AdminRoute';
import { AdminOwnerRoute } from './components/AdminOwnerRoute';
import { MasterRoute } from './components/MasterRoute';
import { StandalonePage } from './components/StandalonePage';
import { NotFoundRedirect } from './components/NotFoundRedirect';
import ModuleGuard from './components/ModuleGuard';
import { ModuleRoute } from './components/ModuleRoute';
import { ScrollToTop } from './components/common/ScrollToTop';
import { AuthInitializer } from './components/AuthInitializer';
import { InitializationFlow } from './components/InitializationFlow';
import { Layout } from './components/layout/Layout';
import { useLocation } from 'react-router-dom';
import { LottieLoading } from './components/common/LottieLoading';
import { FichaVendaThemeWrapper } from './components/FichaVendaThemeWrapper';

// Lazy loading das páginas para melhor performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const RoleBasedDashboard = lazyWithRetry(
  () => import('./components/RoleBasedDashboard')
);
// Retry + reload em falha de chunk (evita "Failed to fetch dynamically imported module" após deploy)
function lazyWithRetry(
  importFn: () => Promise<{ default: React.ComponentType<any> }>,
  retries = 2
) {
  return lazy(async () => {
    let lastError: unknown;
    for (let i = 0; i <= retries; i++) {
      try {
        return await importFn();
      } catch (e) {
        lastError = e;
        if (i < retries) await new Promise((r) => setTimeout(r, 500 * (i + 1)));
      }
    }
    // Após novo deploy, chunks antigos (ex: TaskDetailsPage-CqcpWVTM.js) não existem mais.
    // Forçar reload para o usuário carregar a nova versão.
    const msg = lastError instanceof Error ? lastError.message : String(lastError);
    if (
      typeof window !== 'undefined' &&
      (msg.includes('Failed to fetch dynamically imported module') ||
        msg.includes('Importing a module script failed') ||
        msg.includes('Loading chunk') ||
        msg.includes('Loading CSS chunk'))
    ) {
      window.location.reload();
      return new Promise(() => {}); // nunca resolve; a página recarrega
    }
    throw lastError;
  });
}

const KanbanPage = lazyWithRetry(() => import('./pages/KanbanPage'));
const VisitsPage = lazy(() =>
  import('./pages/VisitsPage').then(m => ({ default: m.default ?? m.VisitsPage }))
);
const VisitReportsPage = lazy(() =>
  import('./pages/VisitReportsPage').then(m => ({ default: m.default ?? m.VisitReportsPage }))
);
const VisitReportFormPage = lazy(() =>
  import('./pages/VisitReportFormPage').then(m => ({ default: m.default ?? m.VisitReportFormPage }))
);
const KanbanSettingsPage = lazy(() => import('./pages/KanbanSettingsPage'));
const ColorRulesPage = lazy(() => import('./pages/ColorRulesPage'));
const KanbanMetricsPage = lazy(() => import('./pages/KanbanMetricsPage'));
const KanbanInsightsPage = lazy(() => import('./pages/KanbanInsightsPage'));
const KanbanVisitReportsPage = lazy(() =>
  import('./pages/KanbanVisitReportsPage').then(m => ({ default: m.default ?? m.KanbanVisitReportsPage }))
);
// Import direto para evitar erro "Cannot convert object to primitive value" no lazyInitializer ao acessar /kanban/permissions
import { KanbanPermissionsPage } from './pages/KanbanPermissionsPage';
const CreateTaskPage = lazy(() => import('./pages/CreateTaskPage'));
const CreateColumnPage = lazy(() => import('./pages/CreateColumnPage'));
const TaskDetailsPage = lazyWithRetry(() => import('./pages/TaskDetailsPage'));
const CreateSubTaskPage = lazy(() => import('./pages/CreateSubTaskPage'));
const SubTaskDetailsPage = lazyWithRetry(() => import('./pages/SubTaskDetailsPage'));
const EditSubTaskPage = lazy(() => import('./pages/EditSubTaskPage'));
const CreateValidationPage = lazy(() => import('./pages/CreateValidationPage'));
const CreateActionPage = lazy(() => import('./pages/CreateActionPage'));
const ProjectsHistory = lazy(() => import('./pages/ProjectsHistory'));
const ProjectHistoryDetail = lazy(() => import('./pages/ProjectHistoryDetail'));
const PropertiesPage = lazy(() => import('./pages/PropertiesPage'));
const PropertyPendingApprovalsPage = lazy(
  () => import('./pages/PropertyPendingApprovalsPage')
);
const PropertyDetailsPage = lazy(() => import('./pages/PropertyDetailsPage'));
const CreatePropertyPage = lazy(() => import('./pages/CreatePropertyPage'));
const CreateCondominiumPage = lazy(
  () => import('./pages/CreateCondominiumPage')
);
const CondominiumsPage = lazy(() => import('./pages/CondominiumsPage'));
const CreatePropertyExpensePage = lazy(
  () => import('./pages/CreatePropertyExpensePage')
);
const EditPropertyExpensePage = lazy(
  () => import('./pages/EditPropertyExpensePage')
);
const PortfolioOptimizationPage = lazy(
  () => import('./pages/PortfolioOptimizationPage')
);
const PropertyOffersPage = lazy(() => import('./pages/PropertyOffersPage'));
const OfferDetailsPage = lazy(() => import('./pages/OfferDetailsPage'));
const PropertyImportExportPage = lazy(
  () => import('./pages/PropertyImportExportPage')
);
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ProfilePage = lazyWithRetry(() => import('./pages/ProfilePage'));
const EditProfilePage = lazyWithRetry(() => import('./pages/EditProfilePage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ForgotPasswordConfirmationPage = lazy(
  () => import('./pages/ForgotPasswordConfirmationPage')
);
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const VisitReportSignPage = lazy(() => import('./pages/VisitReportSignPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const CreateUserPage = lazy(() => import('./pages/CreateUserPage'));
const EditUserPage = lazy(() => import('./pages/EditUserPage'));
const HierarchyPage = lazy(() => import('./pages/HierarchyPage'));
const TeamsPage = lazy(() => import('./pages/TeamsPage'));
const CreateTeamPage = lazy(() => import('./pages/CreateTeamPage'));
const EditTeamPage = lazy(() => import('./pages/EditTeamPage'));
const NotesPage = lazy(() => import('./pages/NotesPage'));
const CreateNotePage = lazy(() => import('./pages/CreateNotePage'));
const EditNotePage = lazy(() => import('./pages/EditNotePage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const EditGroupChatPage = lazy(() => import('./pages/EditGroupChatPage'));
const WhatsAppPage = lazy(() => import('./pages/WhatsAppPage'));
const WhatsAppConfigPage = lazy(() => import('./pages/WhatsAppConfigPage'));
const WhatsAppNotificationConfigPage = lazy(
  () => import('./pages/WhatsAppNotificationConfigPage')
);
const IntegrationsPage = lazy(() => import('./pages/IntegrationsPage'));
const MetaCampaignConfigPage = lazy(
  () => import('./pages/MetaCampaignConfigPage')
);
const MetaCampaignsPage = lazy(() => import('./pages/MetaCampaignsPage'));
const MetaAdDetailPage = lazy(() => import('./pages/MetaAdDetailPage'));
const CreateMetaCampaignPage = lazy(
  () => import('./pages/CreateMetaCampaignPage')
);
const InstagramConfigPage = lazy(() => import('./pages/Instagram/InstagramConfigPage'));
const InstagramAutomationsPage = lazy(() => import('./pages/Instagram/InstagramAutomationsPage'));
const InstagramLogsPage = lazy(() => import('./pages/Instagram/InstagramLogsPage'));
const InstagramDashboardPage = lazy(() => import('./pages/Instagram/InstagramDashboardPage'));
const EditScheduledMetaCampaignPage = lazy(
  () => import('./pages/EditScheduledMetaCampaignPage')
);
const MetaLeadsPage = lazy(() => import('./pages/MetaLeadsPage'));
const GrupoZapConfigPage = lazy(() => import('./pages/GrupoZapConfigPage'));
const LeadDistributionConfigPage = lazy(
  () => import('./pages/LeadDistributionConfigPage')
);
const LeadDistributionFormPage = lazy(
  () => import('./pages/LeadDistributionFormPage')
);
const LeadDistributionAnalysisPage = lazy(
  () => import('./pages/LeadDistributionAnalysisPage')
);
const ZezinConfigPage = lazy(() => import('./pages/ZezinConfigPage'));
const ZezinAskPage = lazy(() => import('./pages/ZezinAskPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const CreateAppointmentPage = lazy(
  () => import('./pages/CreateAppointmentPage')
);
const EditAppointmentPage = lazy(() => import('./pages/EditAppointmentPage'));
const AppointmentDetailsPage = lazy(
  () => import('./pages/AppointmentDetailsPage')
);
const CommissionCalculatorPage = lazy(
  () => import('./pages/CommissionCalculatorPage')
);
const CommissionSettingsPage = lazy(
  () => import('./pages/CommissionSettingsPage')
);
const VistoriaPage = lazy(() => import('./pages/VistoriaPage'));
const VistoriaDetailPage = lazy(() => import('./pages/VistoriaDetailPage'));
const CreateInspectionPage = lazy(() => import('./pages/CreateInspectionPage'));
const EditInspectionPage = lazy(() => import('./pages/EditInspectionPage'));
const KeysPage = lazy(() => import('./pages/KeysPage'));
const CreateAssetPage = lazy(() => import('./pages/CreateAssetPage'));
const AssetsPage = lazy(() => import('./pages/AssetsPage'));
const RentalsPage = lazy(() => import('./pages/RentalsPage'));
const CreateRentalPage = lazy(() => import('./pages/CreateRentalPage'));
const RentalDetailsPage = lazy(() => import('./pages/RentalDetailsPage'));
const InsuranceQuotePage = lazy(() => import('./pages/InsuranceQuotePage'));
const RentalWorkflowsPage = lazy(() => import('./pages/RentalWorkflowsPage'));
const RentalWorkflowFormPage = lazy(() => import('./pages/RentalWorkflowFormPage'));
const RentalSettingsPage = lazy(() => import('./pages/RentalSettingsPage'));
const RentalDashboardPage = lazy(() => import('./pages/RentalDashboardPage'));
const CreditAnalysisPage = lazy(() => import('./pages/CreditAnalysisPage'));
const CollectionPage = lazy(() => import('./pages/CollectionPage'));
const CreditAnalysisSettingsPage = lazy(() => import('./pages/CreditAnalysisSettingsPage'));
const CollectionRulesPage = lazy(() => import('./pages/CollectionRulesPage'));
const CollectionRuleFormPage = lazy(() => import('./pages/CollectionRuleFormPage'));
const SDRSettingsPage = lazy(() => import('./pages/SDRSettingsPage'));
const ChecklistsPage = lazy(() => import('./pages/ChecklistsPage'));
const ChecklistDetailsPage = lazy(() => import('./pages/ChecklistDetailsPage'));
const CreateChecklistPage = lazy(() => import('./pages/CreateChecklistPage'));
const AutomationsPage = lazy(() => import('./pages/AutomationsPage'));
const CreateAutomationPage = lazy(() => import('./pages/CreateAutomationPage'));
const AutomationDetailsPage = lazy(
  () => import('./pages/AutomationDetailsPage')
);
const AutomationHistoryPage = lazy(
  () => import('./pages/AutomationHistoryPage')
);
const GamificationPage = lazy(() => import('./pages/GamificationPage'));
const GamificationSettingsPage = lazy(
  () => import('./pages/GamificationSettingsPage')
);
// Preload rewards components para navegação mais suave
const RewardsPage = lazy(() => import('./pages/RewardsPage'));
const MyRedemptionsPage = lazy(() => import('./pages/MyRedemptionsPage'));
const ApproveRedemptionsPage = lazy(
  () => import('./pages/ApproveRedemptionsPage')
);
const ManageRewardsPage = lazy(() => import('./pages/ManageRewardsPage'));
const CreateRewardPage = lazy(() => import('./pages/CreateRewardPage'));
const EditRewardPage = lazy(() => import('./pages/EditRewardPage'));

// Preload para formulários
if (typeof window !== 'undefined') {
  setTimeout(() => {
    import('./pages/CreateRewardPage');
  }, 3000);
}

// Preload dos componentes de rewards quando o app carrega
if (typeof window !== 'undefined') {
  // Aguarda 2 segundos após o load inicial para fazer preload
  setTimeout(() => {
    import('./pages/RewardsPage');
    import('./pages/MyRedemptionsPage');
  }, 2000);
}
const CompetitionsPage = lazy(() => import('./pages/CompetitionsPage'));
const CreateCompetitionPage = lazy(
  () => import('./pages/CreateCompetitionPage')
);
const EditCompetitionPage = lazy(() => import('./pages/EditCompetitionPage'));
const AddPrizesPage = lazy(() => import('./pages/AddPrizesPage'));
const PrizesPage = lazy(() => import('./pages/PrizesPage'));
const AuditPage = lazy(() => import('./pages/AuditPage'));
const AdminWhatsAppPreAttendancePage = lazy(
  () => import('./pages/AdminWhatsAppPreAttendancePage')
);
const CreateKeyPage = lazy(() => import('./pages/CreateKeyPage'));
const ClientsPage = lazy(() => import('./pages/ClientsPage'));
const ClientDetailsPage = lazy(() => import('./pages/ClientDetailsPage'));
const ClientFormPage = lazy(() => import('./pages/ClientFormPage'));
const GenerateProposalPage = lazy(() => import('./pages/GenerateProposalPage'));
const FinancialPage = lazy(() => import('./pages/FinancialPage'));
const NewTransactionPage = lazy(() => import('./pages/NewTransactionPage'));
const EditTransactionPage = lazy(() => import('./pages/EditTransactionPage'));
const TransactionDetailsPage = lazy(
  () => import('./pages/TransactionDetailsPage')
);
const ApprovalDetailsPage = lazy(() => import('./pages/ApprovalDetailsPage'));
const SubscriptionPlansPage = lazy(
  () => import('./pages/SubscriptionPlansPage')
);
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const SubscriptionManagementPage = lazy(
  () => import('./pages/SubscriptionManagementPage')
);
const SubscriptionDetailsPage = lazy(
  () => import('./pages/SubscriptionDetailsPage')
);
const AdminSubscriptionPage = lazy(
  () => import('./pages/AdminSubscriptionPage')
);
const CustomPlanPage = lazy(() => import('./pages/CustomPlanPage'));
const SystemUnavailablePage = lazy(
  () => import('./pages/SystemUnavailablePage')
);
const VerifyingAccessPage = lazy(() => import('./pages/VerifyingAccessPage'));
const CreateFirstCompanyPage = lazy(
  () => import('./pages/CreateFirstCompanyPage')
);
const CreateCompanyPage = lazy(() => import('./pages/CreateCompanyPage'));
const EditCompanyPage = lazy(() => import('./pages/EditCompanyPage'));
const EmailConfirmationPage = lazy(
  () => import('./pages/EmailConfirmationPage')
);
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'));
const DocumentDetailsPage = lazy(() => import('./pages/DocumentDetailsPage'));
const EditDocumentPage = lazy(() => import('./pages/EditDocumentPage'));
const SendDocumentForSignaturePage = lazy(() =>
  import('./pages/SendDocumentForSignaturePage').then(module => ({
    default: module.SendDocumentForSignaturePage,
  }))
);
const AllSignaturesPage = lazy(() =>
  import('./pages/AllSignaturesPage').then(module => ({
    default: module.AllSignaturesPage,
  }))
);
const CreateDocumentPage = lazy(() => import('./pages/CreateDocumentPage'));
const MatchesPage = lazy(() => import('./pages/MatchesPage'));
const PropertyMatchesPage = lazy(() => import('./pages/PropertyMatchesPage'));
const MCMVLeadsPage = lazy(() => import('./pages/MCMVLeadsPage'));
const MCMVLeadDetailsPage = lazy(() => import('./pages/MCMVLeadDetailsPage'));
const MCMVBlacklistPage = lazy(() => import('./pages/MCMVBlacklistPage'));
const MCMVTemplatesPage = lazy(() => import('./pages/MCMVTemplatesPage'));
const MyWorkspacePage = lazy(() => import('./pages/MyWorkspacePage'));
const GoalsPage = lazy(() => import('./pages/GoalsPage'));
const NewGoalPage = lazy(() => import('./pages/NewGoalPage'));
const PublicSiteAnalyticsPage = lazy(
  () => import('./pages/PublicSiteAnalyticsPage')
);
const AdvancedAnalyticsPage = lazy(
  () => import('./pages/AdvancedAnalyticsPage')
);
const EditGoalPage = lazy(() => import('./pages/EditGoalPage'));
const GoalAnalyticsPage = lazy(() => import('./pages/GoalAnalyticsPage'));
const CommissionConfigPage = lazy(() => import('./pages/CommissionConfigPage'));
const CommissionsPage = lazy(() => import('./pages/CommissionsPage'));
const CompareUsersPage = lazy(() => import('./pages/CompareUsersPage'));
const CompareTeamsPage = lazy(() => import('./pages/CompareTeamsPage'));
const FichaVendaPage = lazy(() => import('./pages/FichaVendaPage'));
const FichaPropostaPage = lazy(() => import('./pages/FichaPropostaPage'));

// Fallback de loading para Suspense - usando LottieLoading
const SuspenseFallback: React.FC = () => {
  return <LottieLoading message='Carregando...' />;
};

// Componente wrapper para verificação de assinatura - REMOVIDO
// A verificação agora é feita pelo SubscriptionContext

// Componente wrapper para refresh automático de token
const TokenRefreshWrapper: React.FC = () => {
  useTokenRefresh(); // Reativado para resolver problemas de autenticação
  return null;
};

// Componente wrapper para rotas protegidas com permissões
const ProtectedRouteWithPermissions: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <PermissionsProvider>{children}</PermissionsProvider>;
};

// Componente para renderizar Layout condicionalmente
const ConditionalLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const location = useLocation();

  // Rotas públicas que NÃO devem ter Layout
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/forgot-password-confirmation',
    '/reset-password',
    '/system-unavailable',
    '/verify-email',
    '/confirm-email',
    '/subscription-plans', // CORREÇÃO: Usuário sem plano não deve ver drawer
    '/ficha-venda', // Ficha de Venda - página pública para corretores
    '/ficha-proposta', // Ficha de Proposta de Compra - página pública para corretores
    '/public/assinatura-visita', // Assinatura de relatório de visita (link enviado ao cliente)
  ];

  // Verificar se a rota atual é pública (comparação exata ou startsWith)
  const isPublicRoute = publicRoutes.some(route => {
    // Comparação exata para rotas específicas
    if (location.pathname === route) return true;
    // Comparação startsWith para rotas com parâmetros (ex: /reset-password/:token)
    if (route !== '/' && location.pathname.startsWith(route)) return true;
    return false;
  });

  // Se for rota pública, renderiza só o conteúdo
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Se for rota protegida, renderiza com Layout
  return <Layout>{children}</Layout>;
};

// Componente wrapper para notificações WhatsApp (deve estar dentro do Router)
const WhatsAppNotificationsWrapper: React.FC = () => {
  useWhatsAppNotifications();
  return null;
};

// Componente interno para usar o tema dinâmico
const AppContent: React.FC = () => {
  const { theme } = useTheme();
  const [showPermissionsNotification, setShowPermissionsNotification] =
    useState(false);

  // Monitor de permissões para usuários master (desabilitado temporariamente)
  // usePermissionsMonitor({
  //   interval: 30000, // Verificar a cada 30 segundos
  //   enabled: false, // Desabilitado até backend estar pronto
  //   onPermissionsChanged: newPermissions => {
  //     setShowPermissionsNotification(true);
  //   },
  // });

  // WebSocket será conectado automaticamente pelos hooks que precisam dele
  // Removido para evitar múltiplas conexões

  // Base path - deve corresponder ao configurado no vite.config.ts
  // Para subpasta: '/sistema'
  // Para raiz: ''
  const basePath = '/sistema'; // 👈 ALTERE AQUI se mudar no vite.config.ts

  return (
    <>
      <Router basename={basePath}>
        {/* Monitorar novas mensagens WhatsApp e mostrar notificações */}
        <WhatsAppNotificationsWrapper />
        {/* Inicializador de autenticação - mantém usuário logado */}
        <AuthInitializer>
          {/* Fluxo de inicialização para novos usuários */}
          <InitializationFlow>
            {/* Scroll para o topo ao mudar de rota */}
            <ScrollToTop />

            {/* Verificar status da assinatura após login */}

            {/* Refresh automático de token */}
            <TokenRefreshWrapper />

            {/* Layout condicional - FORA do Suspense para não desmontar */}
            <ConditionalLayout>
              <Suspense fallback={<SuspenseFallback />}>
                <Routes>
                  {/* Rota pública - Landing Page */}
                  <Route
                    path='/'
                    element={
                      <PublicRoute>
                        <LandingPage />
                      </PublicRoute>
                    }
                  />
                  {/* Rotas públicas - SEM PermissionsProvider */}
                  <Route
                    path='/gallery'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='property:view'>
                              <GalleryPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/login'
                    element={
                      <PublicRoute>
                        <LoginPage />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path='/register'
                    element={
                      <PublicRoute>
                        <RegisterPage />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path='/forgot-password'
                    element={
                      <PublicRoute>
                        <ForgotPasswordPage />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path='/forgot-password-confirmation'
                    element={
                      <PublicRoute>
                        <ForgotPasswordConfirmationPage />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path='/reset-password/:token'
                    element={
                      <PublicRoute>
                        <ResetPasswordPage />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path='/public/assinatura-visita/:token'
                    element={
                      <PublicRoute>
                        <VisitReportSignPage />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path='/ficha-venda/:id'
                    element={
                      <PublicRoute>
                        <FichaVendaThemeWrapper>
                          <FichaVendaPage />
                        </FichaVendaThemeWrapper>
                      </PublicRoute>
                    }
                  />
                  <Route
                    path='/ficha-venda'
                    element={
                      <PublicRoute>
                        <FichaVendaThemeWrapper>
                          <FichaVendaPage />
                        </FichaVendaThemeWrapper>
                      </PublicRoute>
                    }
                  />
                  <Route
                    path='/ficha-proposta/:id'
                    element={
                      <PublicRoute>
                        <FichaVendaThemeWrapper>
                          <FichaPropostaPage />
                        </FichaVendaThemeWrapper>
                      </PublicRoute>
                    }
                  />
                  <Route
                    path='/ficha-proposta'
                    element={
                      <PublicRoute>
                        <FichaVendaThemeWrapper>
                          <FichaPropostaPage />
                        </FichaVendaThemeWrapper>
                      </PublicRoute>
                    }
                  />
                  <Route
                    path='/kanban'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='kanban:view'>
                              <KanbanPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/visits'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='visit_report'>
                              <PermissionRoute permission='visit:view'>
                                <VisitsPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/visits/create'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='visit_report'>
                              <PermissionRoute permission='visit:view'>
                                <VisitReportFormPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/visits/edit/:id'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='visit_report'>
                              <PermissionRoute permission='visit:view'>
                                <VisitReportFormPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/visit-reports'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='visit_report'>
                              <PermissionRoute permission='visit:manage'>
                                <VisitReportsPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/visit-reports/create'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='visit_report'>
                              <PermissionRoute permission='visit:manage'>
                                <VisitReportFormPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/visit-reports/edit/:id'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='visit_report'>
                              <PermissionRoute permission='visit:manage'>
                                <VisitReportFormPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/kanban/settings'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='kanban.settings'>
                              <KanbanSettingsPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/kanban/color-rules'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='kanban:update'>
                              <ColorRulesPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/kanban/metrics'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='kanban:view_analytics'>
                              <KanbanMetricsPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/kanban/insights'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='kanban:view_analytics'>
                              <KanbanInsightsPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/kanban/visit-reports'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='visit_report'>
                              <PermissionRoute permission='visit:view'>
                                <KanbanVisitReportsPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/kanban/permissions'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute
                              permission='kanban:manage_users'
                              noRoleBypass
                              fallbackPath='/kanban'
                            >
                              <KanbanPermissionsPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/kanban/create-task'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='kanban:create'>
                              <CreateTaskPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/kanban/create-column'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='kanban:create'>
                              <CreateColumnPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/kanban/task/:taskId'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='kanban:view' showDeniedInPlace>
                              <TaskDetailsPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/kanban/tasks/:taskId/subtasks/new'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='kanban:create'>
                              <CreateSubTaskPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/kanban/subtasks/:subTaskId'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='kanban:view'>
                              <SubTaskDetailsPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/kanban/subtasks/:subTaskId/edit'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='kanban:update'>
                              <EditSubTaskPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/kanban/create-validation'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='kanban:create'>
                              <CreateValidationPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/kanban/create-action'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='kanban:create'>
                              <CreateActionPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/projects-history/:teamId'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='kanban:view_history'>
                              <ProjectsHistory />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/project-history/:teamId/:projectId'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='kanban:view_history'>
                              <ProjectHistoryDetail />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/properties'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleGuard>
                              <PermissionRoute permission='property:view'>
                                <PropertiesPage />
                              </PermissionRoute>
                            </ModuleGuard>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/properties/pending-approvals'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleGuard>
                              <PermissionRoute permission='property:view'>
                                <PropertyPendingApprovalsPage />
                              </PermissionRoute>
                            </ModuleGuard>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/properties/:propertyId'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='property:view'>
                              <PropertyDetailsPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/properties/create'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='property:create'>
                              <CreatePropertyPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/properties/edit/:id'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='property:update'>
                              <CreatePropertyPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/condominiums'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='condominium:view'>
                              <CondominiumsPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/condominiums/create'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='condominium:create'>
                              <CreateCondominiumPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/condominiums/edit/:id'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='condominium:update'>
                              <CreateCondominiumPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/properties/:propertyId/expenses/create'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='property:update'>
                              <CreatePropertyExpensePage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/properties/:propertyId/expenses/:expenseId/edit'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='property:update'>
                              <EditPropertyExpensePage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/properties/optimization'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='ai_assistant'>
                              <PermissionRoute permission='property:view'>
                                <PortfolioOptimizationPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/properties/:propertyId/matches'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='match_system'>
                              <PermissionRoute permission='property:view'>
                                <PropertyMatchesPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/properties/offers/:offerId'
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <ProtectedRouteWithPermissions>
                            <ProtectedRoute>
                              <PermissionRoute permission='property:view'>
                                <OfferDetailsPage />
                              </PermissionRoute>
                            </ProtectedRoute>
                          </ProtectedRouteWithPermissions>
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/properties/offers'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='property:view'>
                              <PropertyOffersPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/properties/import-export'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PropertyImportExportPage />
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/automations'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <AdminRoute>
                              <ModuleRoute requiredModule='automations'>
                                <AutomationsPage />
                              </ModuleRoute>
                            </AdminRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/automations/create'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <AdminRoute>
                              <ModuleRoute requiredModule='automations'>
                                <CreateAutomationPage />
                              </ModuleRoute>
                            </AdminRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/automations/:id'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <AdminRoute>
                              <ModuleRoute requiredModule='automations'>
                                <AutomationDetailsPage />
                              </ModuleRoute>
                            </AdminRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/automations/:id/history'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <AdminRoute>
                              <ModuleRoute requiredModule='automations'>
                                <AutomationHistoryPage />
                              </ModuleRoute>
                            </AdminRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/settings'
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <SettingsPage />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/profile'
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/profile/edit'
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <EditProfilePage />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/users'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='user:view'>
                              <UsersPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/users/new'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='user:create'>
                              <CreateUserPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/users/create'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='user:create'>
                              <CreateUserPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/users/:id/edit'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='user:update'>
                              <EditUserPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/hierarchy'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <AdminRoute>
                              <HierarchyPage />
                            </AdminRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/teams'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='team:view'>
                              <TeamsPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/teams/create'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='team:create'>
                              <CreateTeamPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/teams/:teamId/edit'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='team:update'>
                              <EditTeamPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/subscription-plans'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <AdminRoute>
                              <SubscriptionPlansPage />
                            </AdminRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/subscription-management'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <AdminRoute>
                              <SubscriptionManagementPage />
                            </AdminRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/subscription-management/:subscriptionId'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <MasterRoute>
                              <SubscriptionDetailsPage />
                            </MasterRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/my-subscription'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <AdminRoute>
                              <AdminSubscriptionPage />
                            </AdminRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/custom-plan'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <AdminRoute>
                              <CustomPlanPage />
                            </AdminRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/system-unavailable'
                    element={
                      <ErrorBoundary>
                        <StandalonePage>
                          <SystemUnavailablePage />
                        </StandalonePage>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/verifying-access'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <AdminRoute>
                              <VerifyingAccessPage />
                            </AdminRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/create-first-company'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <AdminRoute>
                              <CreateFirstCompanyPage />
                            </AdminRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/companies/create'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <AdminRoute>
                              <CreateCompanyPage />
                            </AdminRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/companies/:id/edit'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <AdminRoute>
                              <EditCompanyPage />
                            </AdminRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/verify-email'
                    element={
                      <PublicRoute>
                        <EmailConfirmationPage />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path='/confirm-email/:token'
                    element={
                      <PublicRoute>
                        <EmailConfirmationPage />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path='/dashboard'
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <RoleBasedDashboard />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/dashboard/advanced-analytics'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='performance:view_company'>
                              <AdvancedAnalyticsPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/notes'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='note:view'>
                              <NotesPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/notes/create'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='note:create'>
                              <CreateNotePage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/notes/edit/:id'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='note:update'>
                              <EditNotePage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/chat'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ChatPage />
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/chat/:roomId'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ChatPage />
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/chat/edit-group/:roomId'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <EditGroupChatPage />
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/whatsapp'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='api_integrations'>
                              <PermissionRoute
                                permissions={[
                                  'whatsapp:view',
                                  'whatsapp:view_messages',
                                ]}
                              >
                                <WhatsAppPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/integrations/whatsapp/config'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='api_integrations'>
                              <PermissionRoute
                                permissions={[
                                  'whatsapp:view',
                                  'whatsapp:manage_config',
                                ]}
                              >
                                <WhatsAppConfigPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/integrations/whatsapp/notifications'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='api_integrations'>
                              <PermissionRoute
                                permissions={[
                                  'whatsapp:view',
                                  'whatsapp:manage_config',
                                ]}
                              >
                                <WhatsAppNotificationConfigPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/integrations/meta-campaign/config'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='third_party_integrations'>
                              <PermissionRoute
                                permissions={[
                                  'meta_campaign:view',
                                  'meta_campaign:manage_config',
                                ]}
                              >
                                <MetaCampaignConfigPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/integrations/meta-campaign/campaigns/scheduled/:id/edit'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='third_party_integrations'>
                              <PermissionRoute
                                permission='kanban:manage_users'
                                fallbackPath='/dashboard'
                              >
                                <EditScheduledMetaCampaignPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/integrations/meta-campaign/campaigns/create'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='third_party_integrations'>
                              <PermissionRoute
                                permission='kanban:manage_users'
                                fallbackPath='/dashboard'
                              >
                                <CreateMetaCampaignPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/integrations/meta-campaign/campaigns/ad'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='third_party_integrations'>
                              <PermissionRoute
                                permission='kanban:manage_users'
                                fallbackPath='/dashboard'
                              >
                                <MetaAdDetailPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/integrations/meta-campaign/campaigns'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='third_party_integrations'>
                              <PermissionRoute
                                permission='kanban:manage_users'
                                fallbackPath='/dashboard'
                              >
                                <MetaCampaignsPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/integrations/meta-campaign/leads'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='third_party_integrations'>
                              <PermissionRoute
                                permissions={[
                                  'meta_campaign:view',
                                  'meta_campaign:manage_config',
                                ]}
                              >
                                <MetaLeadsPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/integrations/instagram/config'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='third_party_integrations'>
                              <PermissionRoute
                                permissions={[
                                  'instagram:view',
                                  'instagram:manage_config',
                                ]}
                                noRoleBypass
                              >
                                <InstagramConfigPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/integrations/instagram/automations'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='third_party_integrations'>
                              <PermissionRoute
                                permissions={[
                                  'instagram:view',
                                  'instagram:manage_config',
                                ]}
                                noRoleBypass
                              >
                                <InstagramAutomationsPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/integrations/instagram/logs'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='third_party_integrations'>
                              <PermissionRoute
                                permissions={[
                                  'instagram:view',
                                  'instagram:manage_config',
                                ]}
                                noRoleBypass
                              >
                                <InstagramLogsPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/integrations/instagram/dashboard'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='third_party_integrations'>
                              <PermissionRoute
                                permissions={[
                                  'instagram:view',
                                  'instagram:manage_config',
                                ]}
                                noRoleBypass
                              >
                                <InstagramDashboardPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/integrations/grupo-zap/config'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='third_party_integrations'>
                              <PermissionRoute
                                permissions={[
                                  'grupo_zap:view',
                                  'grupo_zap:manage_config',
                                ]}
                              >
                                <GrupoZapConfigPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/integrations/lead-distribution/config/new/:scope?'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='lead_distribution'>
                              <PermissionRoute
                                permissions={[
                                  'lead_distribution:view',
                                  'lead_distribution:manage_config',
                                ]}
                              >
                                <LeadDistributionFormPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/integrations/lead-distribution/config/edit/:id'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='lead_distribution'>
                              <PermissionRoute
                                permissions={[
                                  'lead_distribution:view',
                                  'lead_distribution:manage_config',
                                ]}
                              >
                                <LeadDistributionFormPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/integrations/lead-distribution/config'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='lead_distribution'>
                              <PermissionRoute
                                permissions={[
                                  'lead_distribution:view',
                                  'lead_distribution:manage_config',
                                ]}
                              >
                                <LeadDistributionConfigPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/integrations/lead-distribution/analysis'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='lead_distribution'>
                              <PermissionRoute
                                permissions={['lead_distribution:view']}
                              >
                                <LeadDistributionAnalysisPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/integrations/zezin/config'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ZezinConfigPage />
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/integrations/zezin/ask'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ZezinAskPage />
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/integrations'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute
                              requiredModules={[
                                'api_integrations',
                                'third_party_integrations',
                                'lead_distribution',
                              ]}
                            >
                              <PermissionRoute
                                permissions={[
                                  'whatsapp:view',
                                  'whatsapp:view_messages',
                                  'whatsapp:manage_config',
                                  'meta_campaign:view',
                                  'meta_campaign:manage_config',
                                  'grupo_zap:view',
                                  'grupo_zap:manage_config',
                                  'lead_distribution:view',
                                  'lead_distribution:manage_config',
                                ]}
                              >
                                <IntegrationsPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/calendar'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='calendar:view'>
                              <CalendarPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/calendar/create'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='calendar:create'>
                              <CreateAppointmentPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/calendar/edit/:id'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='calendar:update'>
                              <EditAppointmentPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/calendar/details/:id'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='calendar:view'>
                              <AppointmentDetailsPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/commissions'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='commission:view'>
                              <CommissionCalculatorPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/commissions/settings'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='commission:view'>
                              <CommissionSettingsPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/inspection'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='inspection:view'>
                              <VistoriaPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/inspection/new'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='inspection:create'>
                              <CreateInspectionPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/inspection/:id/edit'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='inspection:update'>
                              <EditInspectionPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/inspection/:id'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='inspection:view'>
                              <VistoriaDetailPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/keys'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='key:view'>
                              <KeysPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/assets'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='asset_management'>
                              <PermissionRoute permission='asset:view'>
                                <AssetsPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/assets/create'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='asset_management'>
                              <PermissionRoute permission='asset:create'>
                                <CreateAssetPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/assets/:id/edit'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='asset_management'>
                              <PermissionRoute permission='asset:update'>
                                <CreateAssetPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/keys/create'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='key:create'>
                              <CreateKeyPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  {/* Módulo Locações: exige rental_management + permissão específica */}
                  <Route
                    path='/rentals'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='rental_management'>
                              <PermissionRoute permission='rental:view'>
                                <RentalsPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/rentals/new'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='rental_management'>
                              <PermissionRoute permission='rental:create'>
                                <CreateRentalPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/rentals/:id/edit'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='rental_management'>
                              <PermissionRoute permission='rental:update'>
                                <CreateRentalPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/rentals/:id'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='rental_management'>
                              <PermissionRoute permission='rental:view'>
                                <RentalDetailsPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  {/* Rota de Dashboard de Locações */}
                  <Route
                    path='/rentals/dashboard'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='rental_management'>
                              <PermissionRoute permission='rental:view_dashboard'>
                                <RentalDashboardPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  {/* Seguros (cotação) - no drawer sob Locações, exige módulo rental */}
                  <Route
                    path='/insurance/quote'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='rental_management'>
                              <PermissionRoute permission='insurance:create_quote'>
                                <InsuranceQuotePage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/settings/rentals'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='rental_management'>
                              <PermissionRoute permission='rental:manage_workflows'>
                                <RentalSettingsPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/settings/rental-workflows'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='rental_management'>
                              <PermissionRoute permission='rental:manage_workflows'>
                                <RentalWorkflowsPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/settings/rental-workflows/new'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='rental_management'>
                              <PermissionRoute permission='rental:manage_workflows'>
                                <RentalWorkflowFormPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/settings/rental-workflows/:id/edit'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='rental_management'>
                              <PermissionRoute permission='rental:manage_workflows'>
                                <RentalWorkflowFormPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  {/* Módulo Análise de Crédito e Cobrança */}
                  <Route
                    path='/credit-analysis'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='credit_and_collection'>
                              <PermissionRoute permission='credit_analysis:view'>
                                <CreditAnalysisPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/credit-analysis/settings'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='credit_and_collection'>
                              <PermissionRoute permission='credit_analysis:review'>
                                <CreditAnalysisSettingsPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  {/* Rotas de Régua de Cobrança */}
                  <Route
                    path='/collection'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='credit_and_collection'>
                              <PermissionRoute permission='collection:view'>
                                <CollectionPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/collection/rules'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='credit_and_collection'>
                              <PermissionRoute permission='collection:manage'>
                                <CollectionRulesPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/collection/rules/new'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='credit_and_collection'>
                              <PermissionRoute permission='collection:manage'>
                                <CollectionRuleFormPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/collection/rules/:id'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='credit_and_collection'>
                              <PermissionRoute permission='collection:manage'>
                                <CollectionRuleFormPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/sdr/settings'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='whatsapp:manage_config'>
                              <SDRSettingsPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  {/* Rotas de Checklists */}
                  <Route
                    path='/checklists'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ChecklistsPage />
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/checklists/new'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <CreateChecklistPage />
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/checklists/:id/edit'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <CreateChecklistPage />
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/checklists/:id'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ChecklistDetailsPage />
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/gamification'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='gamification:view'>
                              <GamificationPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/gamification/settings'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='gamification:configure'>
                              <GamificationSettingsPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  {/* Rotas de Prêmios */}
                  <Route
                    path='/rewards'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='reward:redeem'>
                              <RewardsPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/rewards/my-redemptions'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='reward:redeem'>
                              <MyRedemptionsPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/rewards/approve'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='reward:approve'>
                              <ApproveRedemptionsPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/rewards/manage'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='reward:view'>
                              <ManageRewardsPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/rewards/create'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='reward:create'>
                              <CreateRewardPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/rewards/edit/:id'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='reward:update'>
                              <EditRewardPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/competitions'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='competition:view'>
                              <CompetitionsPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/competitions/new'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='competition:create'>
                              <CreateCompetitionPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/competitions/:id/edit'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='competition:edit'>
                              <EditCompetitionPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/competitions/:competitionId/prizes'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='prize:create'>
                              <AddPrizesPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/audit'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <MasterRoute>
                              <AuditPage />
                            </MasterRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/admin/whatsapp-pre-attendance'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <MasterRoute>
                              <AdminWhatsAppPreAttendancePage />
                            </MasterRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/prizes'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='prize:view'>
                              <PrizesPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/clients'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleGuard>
                              <PermissionRoute permission='client:view'>
                                <ClientsPage />
                              </PermissionRoute>
                            </ModuleGuard>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/clients/new'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleGuard>
                              <PermissionRoute permission='client:create'>
                                <ClientFormPage />
                              </PermissionRoute>
                            </ModuleGuard>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/clients/:id'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleGuard>
                              <PermissionRoute permission='client:view'>
                                <ClientDetailsPage />
                              </PermissionRoute>
                            </ModuleGuard>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/clients/edit/:id'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleGuard>
                              <PermissionRoute permission='client:update'>
                                <ClientFormPage />
                              </PermissionRoute>
                            </ModuleGuard>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/proposals/generate'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='ai_assistant'>
                              <GenerateProposalPage />
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/matches'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='match_system'>
                              <PermissionRoute permission='client:view'>
                                <MatchesPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/mcmv/leads'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='mcmv:lead:view'>
                              <MCMVLeadsPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/mcmv/leads/:id'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='mcmv:lead:view'>
                              <MCMVLeadDetailsPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/mcmv/blacklist'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='mcmv:blacklist:view'>
                              <MCMVBlacklistPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/mcmv/templates'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='mcmv:template:view'>
                              <MCMVTemplatesPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/comparar-corretores'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <CompareUsersPage />
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/comparar-equipes'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <CompareTeamsPage />
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/my-workspace'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='kanban:view'>
                              <MyWorkspacePage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/financial'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleGuard>
                              <PermissionRoute permission='financial:view'>
                                <FinancialPage />
                              </PermissionRoute>
                            </ModuleGuard>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/financial/new'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleGuard>
                              <PermissionRoute permission='financial:create'>
                                <NewTransactionPage />
                              </PermissionRoute>
                            </ModuleGuard>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/financial/edit/:id'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleGuard>
                              <PermissionRoute permission='financial:update'>
                                <EditTransactionPage />
                              </PermissionRoute>
                            </ModuleGuard>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/financial/details/:id'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleGuard>
                              <PermissionRoute permission='financial:view'>
                                <TransactionDetailsPage />
                              </PermissionRoute>
                            </ModuleGuard>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/financial/approval/:id'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleGuard>
                              <PermissionRoute permission='financial:view'>
                                <ApprovalDetailsPage />
                              </PermissionRoute>
                            </ModuleGuard>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/documents/create'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='document_management'>
                              <PermissionRoute permission='document:create'>
                                <CreateDocumentPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/documents'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='document_management'>
                              <PermissionRoute permission='document:read'>
                                <DocumentsPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/documents/:id/edit'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='document_management'>
                              <PermissionRoute permission='document:update'>
                                <EditDocumentPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/documents/:id'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='document_management'>
                              <PermissionRoute permission='document:read'>
                                <DocumentDetailsPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/documents/:id/send-for-signature'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='document_management'>
                              <PermissionRoute permission='document:create'>
                                <SendDocumentForSignaturePage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/documents/signatures'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='document_management'>
                              <PermissionRoute permission='document:read'>
                                <AllSignaturesPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/goals'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <AdminRoute>
                              <GoalsPage />
                            </AdminRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/goals/new'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <AdminRoute>
                              <NewGoalPage />
                            </AdminRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/goals/edit/:id'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <AdminRoute>
                              <EditGoalPage />
                            </AdminRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/goals/analytics/:id'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <AdminRoute>
                              <GoalAnalyticsPage />
                            </AdminRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/commission-config'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <AdminOwnerRoute>
                              <CommissionConfigPage />
                            </AdminOwnerRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/commissions'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <PermissionRoute permission='financial:view'>
                              <CommissionsPage />
                            </PermissionRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path='/analytics/public-site'
                    element={
                      <ErrorBoundary>
                        <ProtectedRouteWithPermissions>
                          <ProtectedRoute>
                            <ModuleRoute requiredModule='public_site_analytics'>
                              <PermissionRoute permission='public_analytics:view'>
                                <PublicSiteAnalyticsPage />
                              </PermissionRoute>
                            </ModuleRoute>
                          </ProtectedRoute>
                        </ProtectedRouteWithPermissions>
                      </ErrorBoundary>
                    }
                  />
                  {/* Rota catch-all para rotas não encontradas (404) */}
                  <Route path='*' element={<NotFoundRedirect />} />
                </Routes>
              </Suspense>
            </ConditionalLayout>

            {/* Modal global de upgrade de módulo - DENTRO do Router */}
            <GlobalModuleUpgradeModal />

            {/* Modal global de upgrade para propriedades públicas - DENTRO do Router */}
            <GlobalPropertyPublicUpgradeModal />
          </InitializationFlow>
        </AuthInitializer>
      </Router>
      <ToastContainer
        position='top-right'
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme}
        style={{ zIndex: 10002 }}
      />

      {/* Notificação de permissões atualizadas */}
      <PermissionsNotification
        isVisible={showPermissionsNotification}
        onClose={() => setShowPermissionsNotification(false)}
        type='success'
        title='Permissões Atualizadas'
        message='Suas permissões foram atualizadas automaticamente. Recarregue a página se necessário.'
        autoClose={true}
        autoCloseDelay={8000}
      />
    </>
  );
};

const AppWithTheme: React.FC = () => {
  const { theme: currentTheme } = useTheme();

  // Obter tema dinâmico baseado no modo atual (light/dark)
  const dynamicTheme = getTheme(currentTheme);

  return (
    <ThemeProvider theme={dynamicTheme as any}>
      <GlobalStyle />
      <AppContent />
    </ThemeProvider>
  );
};

// Wrapper para ModulesProvider que tem acesso ao companyId
const AppWithModules: React.FC = () => {
  const { selectedCompany } = useCompanyContext();

  return (
    <ModulesProvider companyId={selectedCompany?.id || null}>
      <ModuleAccessProvider>
        <AppWithTheme />
      </ModuleAccessProvider>
    </ModulesProvider>
  );
};

const App: React.FC = () => {
  // Debug: verificar se há token no localStorage
  // const token = localStorage.getItem('dream_keys_access_token');
  // Capturar erros globais não tratados
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const err = event.error;
      let msg = '[erro desconhecido]';
      try {
        const raw = event.message ?? err?.message;
        msg = raw != null && typeof raw === 'string' ? raw : String(raw);
      } catch {
        msg = '[erro ao serializar mensagem]';
      }
      let stack = '';
      let filename = '';
      try {
        stack = err?.stack != null ? String(err.stack) : '';
        filename = event.filename != null ? String(event.filename) : '';
      } catch {
        // evita que objeto não serializável quebre o console (ex.: extensão React DevTools)
      }
      try {
        console.error('❌ ERRO GLOBAL NÃO TRATADO:', msg);
        if (stack) console.error('❌ Stack trace:', stack);
        if (filename) console.error('❌ Filename:', filename);
        console.error('❌ Line:', event.lineno, 'Column:', event.colno);
      } catch {
        // fallback se console.error falhar (ex.: objeto não convertível em extensão)
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const r = event.reason;
      let msg = '[rejeição desconhecida]';
      let stack = '';
      try {
        const rawMsg = r?.message ?? r;
        msg = rawMsg != null && typeof rawMsg === 'string' ? rawMsg : String(rawMsg);
        stack = r?.stack != null ? String(r.stack) : '';
      } catch {
        msg = '[erro ao serializar rejeição]';
      }
      try {
        console.error('❌ PROMISE REJECTION NÃO TRATADA:', msg);
        if (stack) console.error('❌ Stack:', stack);
      } catch {
        // fallback se console.error falhar
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener(
        'unhandledrejection',
        handleUnhandledRejection
      );
    };
  }, []);

  return (
    <CustomThemeProvider>
      <ChartProvider>
        <SubscriptionProvider>
          <CompanyProvider>
            <AppWithModules />
          </CompanyProvider>
        </SubscriptionProvider>
      </ChartProvider>
    </CustomThemeProvider>
  );
};

export default App;
