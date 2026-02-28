import React from 'react';
import { VisitReportListPage } from './VisitReportListPage';

/** Gestão de Visitas: lista todos os relatórios da empresa (exige visit:manage) */
const VisitReportsPage: React.FC = () => (
  <VisitReportListPage
    scope="all"
    pageTitle="Gestão de Visitas"
    pageSubtitle="Visualize e gerencie todos os relatórios de visita da empresa."
  />
);

export { VisitReportsPage };
export default VisitReportsPage;
