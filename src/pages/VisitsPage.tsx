import React from 'react';
import { VisitReportListPage } from './VisitReportListPage';

/** Visitas: lista apenas os relatórios criados pelo usuário (visit:view) */
const VisitsPage: React.FC = () => (
  <VisitReportListPage
    scope="mine"
    pageTitle="Visitas"
    pageSubtitle="Seus relatórios de visita. Registre os imóveis visitados e gere o link de assinatura para o cliente."
  />
);

export { VisitsPage };
export default VisitsPage;
