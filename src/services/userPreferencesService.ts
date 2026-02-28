/**
 * Serviço para gerenciar User Preferences
 * Permite que cada usuário tenha suas próprias configurações salvas no banco
 */

import { api } from './api';
import type {
  UserPreferences,
  UpdateUserPreferencesRequest,
  SetHomeScreenRequest,
  HomeScreenResponse,
  UserPreferencesResponse,
  HomeScreenType,
} from '../types/user-preferences.types';

class UserPreferencesService {
  private baseUrl = '/user-preferences';

  /**
   * Obtém todas as preferências do usuário logado
   */
  async getPreferences(): Promise<UserPreferences> {
    const response = await api.get(this.baseUrl);
    return response.data;
  }

  /**
   * Atualiza as preferências do usuário
   * Pode enviar apenas os campos que deseja alterar (merge)
   */
  async updatePreferences(
    preferences: UpdateUserPreferencesRequest
  ): Promise<UserPreferences> {
    const response = await api.put(this.baseUrl, preferences);
    return response.data;
  }

  /**
   * Define a tela inicial padrão do usuário
   */
  async setHomeScreen(homeScreen: HomeScreenType): Promise<UserPreferences> {
    const requestData: SetHomeScreenRequest = { homeScreen };
    const response = await api.post(`${this.baseUrl}/home-screen`, requestData);
    return response.data;
  }

  /**
   * Obtém apenas a tela inicial configurada pelo usuário
   */
  async getHomeScreen(): Promise<HomeScreenResponse> {
    const response = await api.get(`${this.baseUrl}/home-screen`);
    return response.data;
  }

  /**
   * Reseta todas as preferências para os valores padrão
   */
  async resetPreferences(): Promise<UserPreferencesResponse> {
    const response = await api.delete(this.baseUrl);
    return response.data;
  }

  /**
   * Atualiza configurações de tema
   */
  async updateThemeSettings(
    themeSettings: Partial<UserPreferences['themeSettings']>
  ): Promise<UserPreferences> {
    return this.updatePreferences({ themeSettings });
  }

  /**
   * Atualiza configurações de notificação
   */
  async updateNotificationSettings(
    notificationSettings: Partial<UserPreferences['notificationSettings']>
  ): Promise<UserPreferences> {
    return this.updatePreferences({ notificationSettings });
  }

  /**
   * Atualiza configurações de layout
   */
  async updateLayoutSettings(
    layoutSettings: Partial<UserPreferences['layoutSettings']>
  ): Promise<UserPreferences> {
    return this.updatePreferences({ layoutSettings });
  }

  /**
   * Atualiza configurações gerais
   */
  async updateGeneralSettings(
    generalSettings: UserPreferences['generalSettings']
  ): Promise<UserPreferences> {
    return this.updatePreferences({ generalSettings });
  }
}

// Exportar instância singleton
export const userPreferencesService = new UserPreferencesService();
export default userPreferencesService;
