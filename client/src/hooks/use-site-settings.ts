import { useQuery } from "@tanstack/react-query";
import { SiteSettings } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

/**
 * Hook para buscar as configurações do site (versão pública)
 * Usado nos componentes do frontend para exibir informações de contato e conteúdo
 */
export function useSiteSettings() {
  return useQuery<SiteSettings>({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/site-settings");
      return await res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (anteriormente cacheTime)
  });
}

/**
 * Hook para buscar as configurações do site (versão administrativa)
 * Usado no painel administrativo para editar as configurações
 */
export function useAdminSiteSettings() {
  return useQuery<SiteSettings>({
    queryKey: ["admin-site-settings"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/site-settings");
      return await res.json();
    },
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos (anteriormente cacheTime)
  });
}

/**
 * Utilitário para verificar se um campo de configuração deve ser exibido
 * Retorna true se o valor existe e não está vazio
 */
export function shouldShowField(value: string | null | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

/**
 * Utilitário para obter valores padrão quando as configurações não estão disponíveis
 * Usado como fallback durante o carregamento ou em caso de erro
 */
export const defaultSettings: Partial<SiteSettings> = {
  whatsapp: "(11) 99999-9999",
  email: "contato@unipetplan.com.br",
  phone: "0800 123 4567",
  cnpj: "00.000.000/0001-00",
  businessHours: "Segunda a Sexta: 8h às 18h\nSábado: 8h às 14h\nEmergências: 24h todos os dias",
  ourStory: "A UNIPET PLAN nasceu da paixão de veterinários experientes que acreditam que todo animal merece cuidados de qualidade, independentemente da condição financeira de seus tutores. Nossa missão é tornar os cuidados veterinários acessíveis a todos, oferecendo planos de saúde que garantem o bem-estar dos seus companheiros de quatro patas.",
};

/**
 * Hook que combina as configurações do site com valores padrão
 * Garante que sempre haverá valores disponíveis, mesmo durante o carregamento
 */
export function useSiteSettingsWithDefaults() {
  const { data: settings, isLoading, error } = useSiteSettings();
  
  // Type assertion para garantir que as propriedades sejam reconhecidas
  const typedSettings = settings as SiteSettings | undefined;
  
  const settingsWithDefaults = {
    ...defaultSettings,
    ...(typedSettings || {}),
  };
  
  return {
    settings: settingsWithDefaults,
    isLoading,
    error,
    // Funções utilitárias para verificar visibilidade
    shouldShow: {
      whatsapp: shouldShowField(typedSettings?.whatsapp),
      email: shouldShowField(typedSettings?.email),
      phone: shouldShowField(typedSettings?.phone),
      instagramUrl: shouldShowField(typedSettings?.instagramUrl),
      facebookUrl: shouldShowField(typedSettings?.facebookUrl),
      linkedinUrl: shouldShowField(typedSettings?.linkedinUrl),
      youtubeUrl: shouldShowField(typedSettings?.youtubeUrl),
      cnpj: shouldShowField(typedSettings?.cnpj),
      businessHours: shouldShowField(typedSettings?.businessHours),
      ourStory: shouldShowField(typedSettings?.ourStory),
    },
  };
}