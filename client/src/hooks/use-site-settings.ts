import { useQuery } from "@tanstack/react-query";
import { SiteSettings } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { clientConfig } from "../config";

// Função para formatar telefone brasileiro com formatação dinâmica para 8 ou 9 dígitos
const formatBrazilianPhoneForDisplay = (value: string | null | undefined): string => {
  if (!value) return '';
  
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  // Se não tem números, retorna vazio
  if (!numbers) return '';
  
  // Garante que sempre comece com 55 (código do Brasil)
  let cleanNumbers = numbers;
  if (!cleanNumbers.startsWith('55')) {
    cleanNumbers = '55' + cleanNumbers;
  }
  
  // Aplica a formatação baseada no tamanho
  if (cleanNumbers.length <= 2) {
    return `+${cleanNumbers}`;
  } else if (cleanNumbers.length <= 4) {
    return `+${cleanNumbers.substring(0, 2)} (${cleanNumbers.substring(2)})`;
  } else if (cleanNumbers.length <= 9) {
    return `+${cleanNumbers.substring(0, 2)} (${cleanNumbers.substring(2, 4)}) ${cleanNumbers.substring(4)}`;
  } else {
    const areaCode = cleanNumbers.substring(2, 4);
    const phoneDigits = cleanNumbers.substring(4);
    
    // Formatação dinâmica baseada na quantidade de dígitos após DDD
    if (phoneDigits.length <= 8) {
      // Formato para 8 dígitos: +55 (XX) XXXX-XXXX
      const firstPart = phoneDigits.substring(0, 4);
      const secondPart = phoneDigits.substring(4);
      return `+55 (${areaCode}) ${firstPart}${secondPart ? '-' + secondPart : ''}`;
    } else {
      // Formato para 9 dígitos: +55 (XX) XXXXX-XXXX
      const firstPart = phoneDigits.substring(0, 5);
      const secondPart = phoneDigits.substring(5);
      return `+55 (${areaCode}) ${firstPart}${secondPart ? '-' + secondPart : ''}`;
    }
  }
};

/**
 * Hook para buscar as configurações do site (versão pública)
 * Usado nos componentes do frontend para exibir informações de contato e conteúdo
 */
export function useSiteSettings() {
  return useQuery<SiteSettings>({
    queryKey: ["site-settings"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/site-settings");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return await res.json();
      } catch (error) {
        console.warn('Failed to fetch site settings, using defaults:', error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (anteriormente cacheTime)
    retry: 2, // Tentar apenas 2 vezes
    retryDelay: 1000, // Esperar 1 segundo entre tentativas
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
      try {
        const res = await apiRequest("GET", "/api/admin/site-settings");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return await res.json();
      } catch (error) {
        console.warn('Failed to fetch admin site settings:', error);
        throw error; // Re-throw para admin, pois é crítico
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos (anteriormente cacheTime)
    retry: 3,
    retryDelay: 1000,
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
  whatsapp: clientConfig.contact.whatsapp,
  email: clientConfig.contact.email,
  phone: clientConfig.contact.phone,
  address: clientConfig.contact.address,
  cnpj: clientConfig.contact.cnpj,
  businessHours: "Segunda a Sexta: 8h às 18h\nSábado: 8h às 14h\nEmergências: 24h todos os dias",
  ourStory: "A UNIPET PLAN nasceu da paixão de veterinários experientes que acreditam que todo animal merece cuidados de qualidade, independentemente da condição financeira de seus tutores. Nossa missão é tornar os cuidados veterinários acessíveis a todos, oferecendo planos de saúde que garantem o bem-estar dos pets.",
  mainImage: "/Cachorros.jpg",
  networkImage: null,
  aboutImage: "/inicio-sobre.jpg",
};

/**
 * Hook que combina as configurações do site com valores padrão
 * Garante que sempre haverá valores disponíveis, mesmo durante o carregamento
 * Aplica formatação automática aos números de telefone
 */
export function useSiteSettingsWithDefaults() {
  const { data: settings, isLoading, error } = useSiteSettings();
  
  // Type assertion para garantir que as propriedades sejam reconhecidas
  const typedSettings = settings as SiteSettings | undefined;
  
  const settingsWithDefaults = {
    ...defaultSettings,
    ...(typedSettings || {}),
    // Aplicar formatação aos telefones se existirem
    whatsapp: typedSettings?.whatsapp ? formatBrazilianPhoneForDisplay(typedSettings.whatsapp) : defaultSettings.whatsapp,
    phone: typedSettings?.phone ? formatBrazilianPhoneForDisplay(typedSettings.phone) : defaultSettings.phone,
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
      address: shouldShowField(typedSettings?.address),
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