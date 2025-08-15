import { useQueries } from "@tanstack/react-query";
import { Plan, NetworkUnit, FaqItem, SiteSettings } from "@shared/schema";

/**
 * Hook para carregamento paralelo de múltiplos tipos de dados
 * Otimiza o carregamento fazendo todas as requisições em paralelo
 */
export function useParallelData(options: {
  plans?: boolean;
  networkUnits?: boolean;
  faq?: boolean;
  siteSettings?: boolean;
}) {
  const queries = [];

  if (options.plans) {
    queries.push({
      queryKey: ['plans'],
      queryFn: async (): Promise<Plan[]> => {
        const response = await fetch('/api/plans');
        if (!response.ok) throw new Error('Failed to fetch plans');
        return response.json();
      },
      staleTime: 5 * 60 * 1000, // 5 minutos
    });
  }

  if (options.networkUnits) {
    queries.push({
      queryKey: ['/api/network-units'],
      queryFn: async (): Promise<NetworkUnit[]> => {
        const response = await fetch('/api/network-units');
        if (!response.ok) throw new Error('Failed to fetch network units');
        return response.json();
      },
      staleTime: 5 * 60 * 1000, // 5 minutos
    });
  }

  if (options.faq) {
    queries.push({
      queryKey: ['/api/faq'],
      queryFn: async (): Promise<FaqItem[]> => {
        const response = await fetch('/api/faq');
        if (!response.ok) throw new Error('Failed to fetch FAQ');
        return response.json();
      },
      staleTime: 5 * 60 * 1000, // 5 minutos
    });
  }

  if (options.siteSettings) {
    queries.push({
      queryKey: ['site-settings'],
      queryFn: async (): Promise<SiteSettings> => {
        const response = await fetch('/api/site-settings');
        if (!response.ok) throw new Error('Failed to fetch site settings');
        return response.json();
      },
      staleTime: 5 * 60 * 1000, // 5 minutos
    });
  }

  const results = useQueries({ queries });

  // Mapear resultados para um objeto mais fácil de usar
  let index = 0;
  const data: {
    plans?: Plan[];
    networkUnits?: NetworkUnit[];
    faq?: FaqItem[];
    siteSettings?: SiteSettings;
  } = {};

  const loading: {
    plans?: boolean;
    networkUnits?: boolean;
    faq?: boolean;
    siteSettings?: boolean;
  } = {};

  const errors: {
    plans?: Error | null;
    networkUnits?: Error | null;
    faq?: Error | null;
    siteSettings?: Error | null;
  } = {};

  if (options.plans) {
    data.plans = results[index]?.data;
    loading.plans = results[index]?.isLoading;
    errors.plans = results[index]?.error;
    index++;
  }

  if (options.networkUnits) {
    data.networkUnits = results[index]?.data;
    loading.networkUnits = results[index]?.isLoading;
    errors.networkUnits = results[index]?.error;
    index++;
  }

  if (options.faq) {
    data.faq = results[index]?.data;
    loading.faq = results[index]?.isLoading;
    errors.faq = results[index]?.error;
    index++;
  }

  if (options.siteSettings) {
    data.siteSettings = results[index]?.data;
    loading.siteSettings = results[index]?.isLoading;
    errors.siteSettings = results[index]?.error;
    index++;
  }

  // Estados globais
  const isLoading = results.some(result => result.isLoading);
  const hasError = results.some(result => result.error);
  const isSuccess = results.every(result => result.isSuccess);

  return {
    data,
    loading,
    errors,
    isLoading,
    hasError,
    isSuccess,
  };
}

/**
 * Hook específico para dados da home page
 * Carrega planos e configurações do site em paralelo
 */
export function useHomePageData() {
  return useParallelData({
    plans: true,
    siteSettings: true,
  });
}

/**
 * Hook específico para dados da página de rede credenciada
 * Carrega unidades da rede e configurações do site em paralelo
 */
export function useNetworkPageData() {
  return useParallelData({
    networkUnits: true,
    siteSettings: true,
  });
}

/**
 * Hook específico para dados da página de FAQ
 * Carrega FAQ e configurações do site em paralelo
 */
export function useFaqPageData() {
  return useParallelData({
    faq: true,
    siteSettings: true,
  });
}