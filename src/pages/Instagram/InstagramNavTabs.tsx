import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Settings, Zap, FileText, LayoutDashboard } from 'lucide-react';

const NavTabs = styled.nav`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const NavTab = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props =>
    props.$active ? props.theme.colors.primary : props.theme.colors.cardBackground};
  color: ${props => (props.$active ? 'white' : props.theme.colors.text)};
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props =>
      props.$active ? props.theme.colors.primary : props.theme.colors.backgroundSecondary};
    border-color: ${props => props.theme.colors.primary};
    color: ${props => (props.$active ? 'white' : props.theme.colors.primary)};
  }
`;

export const InstagramNavTabs: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname.includes('/dashboard');
  const isConfig = location.pathname.includes('/config');
  const isAutomations = location.pathname.includes('/automations');
  const isLogs = location.pathname.includes('/logs');

  return (
    <NavTabs>
      <NavTab
        $active={isDashboard}
        onClick={() => navigate('/integrations/instagram/dashboard')}
      >
        <LayoutDashboard size={18} />
        Dashboard
      </NavTab>
      <NavTab
        $active={isConfig}
        onClick={() => navigate('/integrations/instagram/config')}
      >
        <Settings size={18} />
        Configuração
      </NavTab>
      <NavTab
        $active={isAutomations}
        onClick={() => navigate('/integrations/instagram/automations')}
      >
        <Zap size={18} />
        Automações
      </NavTab>
      <NavTab
        $active={isLogs}
        onClick={() => navigate('/integrations/instagram/logs')}
      >
        <FileText size={18} />
        Logs
      </NavTab>
    </NavTabs>
  );
};

export default InstagramNavTabs;
