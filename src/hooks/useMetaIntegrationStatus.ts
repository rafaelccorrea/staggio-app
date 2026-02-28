import { useState, useEffect, useCallback } from 'react';
import { metaCampaignApi } from '../services/metaCampaignApi';

interface UseMetaIntegrationStatusOptions {
  /** So faz a requisicao quando true (ex.: quando usuario tem permissao meta_campaign) */
  enabled?: boolean;
}

export function useMetaIntegrationStatus(
  options: UseMetaIntegrationStatusOptions = {}
) {
  const { enabled = true } = options;
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(enabled);

  const refetch = useCallback(async () => {
    if (!enabled) {
      setIsConfigured(false);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const config = await metaCampaignApi.getConfig();
      setIsConfigured(!!config?.isActive);
    } catch {
      setIsConfigured(false);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      setIsConfigured(false);
      return;
    }
    refetch();
  }, [enabled, refetch]);

  return { isConfigured, isLoading, refetch };
}
