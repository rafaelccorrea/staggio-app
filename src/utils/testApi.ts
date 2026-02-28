// Teste para verificar se o axios está funcionando e se o header X-Company-ID está sendo enviado
import { api } from '../services/api';

export const testApiConnection = async () => {
  try {
    // Verificar se há empresa selecionada
    const selectedCompanyId = localStorage.getItem(
      'dream_keys_selected_company_id'
    );
    // Teste 1: Verificar perfil do usuário (requer autenticação)
    const profileResponse = await api.get('/auth/profile');
    // Teste 2: Verificar se o header X-Company-ID está sendo enviado em outras rotas
    if (selectedCompanyId) {
      try {
        const companiesResponse = await api.get('/companies');
        return {
          profile: profileResponse.data,
          companies: companiesResponse.data,
          companyId: selectedCompanyId,
        };
      } catch (companyError) {
        const errorMessage =
          companyError instanceof Error
            ? companyError.message
            : typeof companyError === 'object' &&
                companyError !== null &&
                'message' in companyError
              ? String(companyError.message)
              : 'Erro desconhecido';
        return {
          profile: profileResponse.data,
          companyId: selectedCompanyId,
          error: errorMessage,
        };
      }
    } else {
      return {
        profile: profileResponse.data,
        companyId: null,
      };
    }
  } catch (error) {
    console.error('❌ Erro na API:', error);
    throw error;
  }
};
