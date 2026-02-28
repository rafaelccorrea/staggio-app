import React, { useState, useEffect } from 'react';
// IMPORTANT: Ensure Chart.js scales are registered before any chart components render
import { ensureChartRegistration } from './charts/chartConfig';
import { useAuth } from '../hooks/useAuth';
import DashboardPage from '../pages/DashboardPage';
import UserDashboardPage from '../pages/UserDashboardPage';
import { LottieLoading } from './common/LottieLoading';

const RoleBasedDashboard: React.FC = () => {
  // Garantir que Chart.js está registrado quando o componente montar (não quebrar se falhar)
  useEffect(() => {
    try {
      ensureChartRegistration();
    } catch (e) {
      console.warn('[RoleBasedDashboard] Chart registration skipped:', e);
    }
  }, []);

  let currentUser: { role?: string } | null = null;
  try {
    const { getCurrentUser } = useAuth();
    currentUser = getCurrentUser() ?? null;
  } catch (e) {
    console.warn('[RoleBasedDashboard] useAuth failed:', e);
  }

  const [isInitializing, setIsInitializing] = useState(true);
  const [hasCheckedUser, setHasCheckedUser] = useState(false);

  // Garantir que sempre renderize algo durante a inicialização
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasCheckedUser(true);
      setIsInitializing(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  if (!hasCheckedUser || isInitializing) {
    return <LottieLoading asOverlay={true} />;
  }

  if (!currentUser) {
    return <LottieLoading asOverlay={true} />;
  }

  const role = currentUser?.role;
  if (role === 'admin' || role === 'master') {
    return <DashboardPage />;
  }

  return <UserDashboardPage />;
};

export default RoleBasedDashboard;
