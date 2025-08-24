import { z } from 'zod';

// Schemas base para reutilização
export const baseIdSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido')
});

export const baseTimestampSchema = z.object({
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export const basePaginationSchema = z.object({
  page: z.coerce.number().int().min(1, 'Página deve ser maior que 0').default(1),
  limit: z.coerce.number().int().min(1, 'Limite deve ser maior que 0').max(100, 'Limite máximo é 100').default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
});

// Schema para contato
export const contactSubmissionSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  
  email: z.string()
    .email('Email deve ser válido')
    .max(255, 'Email deve ter no máximo 255 caracteres'),
  
  phone: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Telefone deve ser válido')
    .min(10, 'Telefone deve ter pelo menos 10 dígitos')
    .max(16, 'Telefone deve ter no máximo 16 dígitos'),
  
  message: z.string()
    .min(10, 'Mensagem deve ter pelo menos 10 caracteres')
    .max(1000, 'Mensagem deve ter no máximo 1000 caracteres'),
  
  planId: z.string().uuid('ID do plano deve ser um UUID válido').optional(),
  
  source: z.enum(['website', 'whatsapp', 'phone', 'email', 'other']).default('website'),
  
  marketingConsent: z.boolean().default(false),
  
  preferredContact: z.enum(['email', 'phone', 'whatsapp']).default('email')
});

// Schema para planos
export const planSchema = z.object({
  name: z.string()
    .min(2, 'Nome do plano deve ter pelo menos 2 caracteres')
    .max(100, 'Nome do plano deve ter no máximo 100 caracteres'),
  
  description: z.string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres'),
  
  price: z.number()
    .positive('Preço deve ser positivo')
    .max(999999.99, 'Preço máximo é R$ 999.999,99'),
  
  currency: z.enum(['BRL', 'USD']).default('BRL'),
  
  features: z.array(z.string())
    .min(1, 'Plano deve ter pelo menos 1 recurso')
    .max(50, 'Plano pode ter no máximo 50 recursos'),
  
  coverage: z.object({
    accidents: z.boolean().default(false),
    illnesses: z.boolean().default(false),
    surgeries: z.boolean().default(false),
    medications: z.boolean().default(false),
    exams: z.boolean().default(false),
    vaccines: z.boolean().default(false),
    dental: z.boolean().default(false),
    ophthalmology: z.boolean().default(false)
  }),
  
  maxCoverage: z.number()
    .positive('Cobertura máxima deve ser positiva')
    .max(999999.99, 'Cobertura máxima é R$ 999.999,99'),
  
  deductible: z.number()
    .min(0, 'Franchise não pode ser negativa')
    .max(999999.99, 'Franchise máxima é R$ 999.999,99'),
  
  ageRange: z.object({
    min: z.number().int().min(0, 'Idade mínima não pode ser negativa').max(30, 'Idade mínima máxima é 30'),
    max: z.number().int().min(0, 'Idade máxima não pode ser negativa').max(30, 'Idade máxima é 30')
  }).refine(data => data.min <= data.max, {
    message: 'Idade mínima deve ser menor ou igual à idade máxima'
  }),
  
  isActive: z.boolean().default(true),
  
  priority: z.number().int().min(1, 'Prioridade deve ser maior que 0').max(100, 'Prioridade máxima é 100').default(50)
});

// Schema para unidades da rede
export const networkUnitSchema = z.object({
  name: z.string()
    .min(2, 'Nome da unidade deve ter pelo menos 2 caracteres')
    .max(100, 'Nome da unidade deve ter no máximo 100 caracteres'),
  
  type: z.enum(['clinic', 'hospital', 'laboratory', 'pharmacy', 'pet_shop', 'other']),
  
  address: z.object({
    street: z.string()
      .min(5, 'Endereço deve ter pelo menos 5 caracteres')
      .max(200, 'Endereço deve ter no máximo 200 caracteres'),
    
    number: z.string()
      .min(1, 'Número é obrigatório')
      .max(10, 'Número deve ter no máximo 10 caracteres'),
    
    complement: z.string().max(100, 'Complemento deve ter no máximo 100 caracteres').optional(),
    
    neighborhood: z.string()
      .min(2, 'Bairro deve ter pelo menos 2 caracteres')
      .max(100, 'Bairro deve ter no máximo 100 caracteres'),
    
    city: z.string()
      .min(2, 'Cidade deve ter pelo menos 2 caracteres')
      .max(100, 'Cidade deve ter no máximo 100 caracteres'),
    
    state: z.string()
      .length(2, 'Estado deve ter exatamente 2 caracteres')
      .regex(/^[A-Z]{2}$/, 'Estado deve ser uma sigla válida'),
    
    zipCode: z.string()
      .regex(/^\d{5}-?\d{3}$/, 'CEP deve estar no formato 00000-000 ou 00000000')
  }),
  
  contact: z.object({
    phone: z.string()
      .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Telefone deve ser válido')
      .min(10, 'Telefone deve ter pelo menos 10 dígitos')
      .max(16, 'Telefone deve ter no máximo 16 dígitos'),
    
    email: z.string()
      .email('Email deve ser válido')
      .max(255, 'Email deve ter no máximo 255 caracteres')
      .optional(),
    
    website: z.string()
      .url('Website deve ser uma URL válida')
      .max(255, 'Website deve ter no máximo 255 caracteres')
      .optional()
  }),
  
  services: z.array(z.string())
    .min(1, 'Unidade deve oferecer pelo menos 1 serviço')
    .max(50, 'Unidade pode oferecer no máximo 50 serviços'),
  
  specialties: z.array(z.string())
    .max(20, 'Unidade pode ter no máximo 20 especialidades')
    .optional(),
  
  workingHours: z.object({
    monday: z.object({
      open: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário deve estar no formato HH:MM'),
      close: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário deve estar no formato HH:MM')
    }).optional(),
    tuesday: z.object({
      open: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário deve estar no formato HH:MM'),
      close: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário deve estar no formato HH:MM')
    }).optional(),
    wednesday: z.object({
      open: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário deve estar no formato HH:MM'),
      close: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário deve estar no formato HH:MM')
    }).optional(),
    thursday: z.object({
      open: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário deve estar no formato HH:MM'),
      close: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário deve estar no formato HH:MM')
    }).optional(),
    friday: z.object({
      open: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário deve estar no formato HH:MM'),
      close: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário deve estar no formato HH:MM')
    }).optional(),
    saturday: z.object({
      open: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário deve estar no formato HH:MM'),
      close: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário deve estar no formato HH:MM')
    }).optional(),
    sunday: z.object({
      open: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário deve estar no formato HH:MM'),
      close: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário deve estar no formato HH:MM')
    }).optional()
  }),
  
  isActive: z.boolean().default(true),
  
  priority: z.number().int().min(1, 'Prioridade deve ser maior que 0').max(100, 'Prioridade máxima é 100').default(50)
});

// Schema para FAQ
export const faqItemSchema = z.object({
  question: z.string()
    .min(10, 'Pergunta deve ter pelo menos 10 caracteres')
    .max(500, 'Pergunta deve ter no máximo 500 caracteres'),
  
  answer: z.string()
    .min(20, 'Resposta deve ter pelo menos 20 caracteres')
    .max(2000, 'Resposta deve ter no máximo 2000 caracteres'),
  
  category: z.enum(['general', 'plans', 'coverage', 'claims', 'network', 'other']),
  
  tags: z.array(z.string())
    .max(10, 'Item pode ter no máximo 10 tags')
    .optional(),
  
  isActive: z.boolean().default(true),
  
  priority: z.number().int().min(1, 'Prioridade deve ser maior que 0').max(100, 'Prioridade máxima é 100').default(50),
  
  helpfulCount: z.number().int().min(0, 'Contador de útil não pode ser negativo').default(0),
  
  notHelpfulCount: z.number().int().min(0, 'Contador de não útil não pode ser negativo').default(0)
});

// Schema para configurações do site
export const siteSettingsSchema = z.object({
  companyName: z.string()
    .min(2, 'Nome da empresa deve ter pelo menos 2 caracteres')
    .max(100, 'Nome da empresa deve ter no máximo 100 caracteres'),
  
  companyDescription: z.string()
    .min(10, 'Descrição da empresa deve ter pelo menos 10 caracteres')
    .max(500, 'Descrição da empresa deve ter no máximo 500 caracteres'),
  
  contact: z.object({
    phone: z.string()
      .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Telefone deve ser válido')
      .min(10, 'Telefone deve ter pelo menos 10 dígitos')
      .max(16, 'Telefone deve ter no máximo 16 dígitos'),
    
    whatsapp: z.string()
      .regex(/^[\+]?[1-9][\d]{0,15}$/, 'WhatsApp deve ser válido')
      .min(10, 'WhatsApp deve ter pelo menos 10 dígitos')
      .max(16, 'WhatsApp deve ter no máximo 16 dígitos'),
    
    email: z.string()
      .email('Email deve ser válido')
      .max(255, 'Email deve ter no máximo 255 caracteres'),
    
    address: z.string()
      .min(10, 'Endereço deve ter pelo menos 10 caracteres')
      .max(300, 'Endereço deve ter no máximo 300 caracteres'),
    
    cnpj: z.string()
      .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX')
  }),
  
  social: z.object({
    facebook: z.string().url('Facebook deve ser uma URL válida').optional(),
    instagram: z.string().url('Instagram deve ser uma URL válida').optional(),
    linkedin: z.string().url('LinkedIn deve ser uma URL válida').optional(),
    youtube: z.string().url('YouTube deve ser uma URL válida').optional(),
    twitter: z.string().url('Twitter deve ser uma URL válida').optional()
  }).optional(),
  
  seo: z.object({
    title: z.string()
      .min(10, 'Título SEO deve ter pelo menos 10 caracteres')
      .max(60, 'Título SEO deve ter no máximo 60 caracteres'),
    
    description: z.string()
      .min(20, 'Descrição SEO deve ter pelo menos 20 caracteres')
      .max(160, 'Descrição SEO deve ter no máximo 160 caracteres'),
    
    keywords: z.array(z.string())
      .max(20, 'Pode ter no máximo 20 palavras-chave')
      .optional()
  }),
  
  theme: z.object({
    primaryColor: z.string()
      .regex(/^#[0-9A-F]{6}$/i, 'Cor primária deve ser um código hexadecimal válido'),
    
    secondaryColor: z.string()
      .regex(/^#[0-9A-F]{6}$/i, 'Cor secundária deve ser um código hexadecimal válido'),
    
    accentColor: z.string()
      .regex(/^#[0-9A-F]{6}$/i, 'Cor de destaque deve ser um código hexadecimal válido')
  }),
  
  features: z.object({
    enableBlog: z.boolean().default(false),
    enableNewsletter: z.boolean().default(false),
    enableReviews: z.boolean().default(false),
    enableChat: z.boolean().default(false),
    enableAppointment: z.boolean().default(false)
  }).default({}),
  
  isActive: z.boolean().default(true)
});

// Schema para autenticação de admin
export const adminLoginSchema = z.object({
  email: z.string()
    .email('Email deve ser válido')
    .max(255, 'Email deve ter no máximo 255 caracteres'),
  
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(128, 'Senha deve ter no máximo 128 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número')
});

// Schema para alteração de senha
export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Senha atual é obrigatória'),
  
  newPassword: z.string()
    .min(8, 'Nova senha deve ter pelo menos 8 caracteres')
    .max(128, 'Nova senha deve ter no máximo 128 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Nova senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número'),
  
  confirmPassword: z.string()
    .min(1, 'Confirmação de senha é obrigatória')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Nova senha e confirmação devem ser iguais',
  path: ['confirmPassword']
});

// Schema para upload de arquivo
export const fileUploadSchema = z.object({
  fieldname: z.string().min(1, 'Nome do campo é obrigatório'),
  originalname: z.string().min(1, 'Nome original é obrigatório'),
  encoding: z.string(),
  mimetype: z.string()
    .regex(/^image\/(jpeg|jpg|png|gif|webp)$/, 'Tipo de arquivo deve ser uma imagem válida'),
  size: z.number()
    .positive('Tamanho do arquivo deve ser positivo')
    .max(10 * 1024 * 1024, 'Tamanho máximo do arquivo é 10MB'),
  buffer: z.instanceof(Buffer)
});

// Schema para filtros de busca
export const searchFiltersSchema = z.object({
  query: z.string().min(1, 'Termo de busca é obrigatório').max(100, 'Termo de busca muito longo'),
  category: z.enum(['plans', 'network', 'faq', 'all']).default('all'),
  location: z.string().max(100, 'Localização muito longa').optional(),
  priceRange: z.object({
    min: z.number().min(0, 'Preço mínimo não pode ser negativo').optional(),
    max: z.number().min(0, 'Preço máximo não pode ser negativo').optional()
  }).optional(),
  features: z.array(z.string()).max(20, 'Máximo 20 recursos').optional(),
  isActive: z.boolean().optional()
});

// Schemas de resposta
export const successResponseSchema = z.object({
  success: z.literal(true),
  data: z.any(),
  message: z.string().optional(),
  timestamp: z.date()
});

export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
    timestamp: z.date()
  })
});

export const paginatedResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
    hasNext: z.boolean(),
    hasPrev: z.boolean()
  }),
  timestamp: z.date()
});

// Função para validar dados com tratamento de erro personalizado
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }));
      
      throw new Error(`Validação falhou: ${JSON.stringify(details)}`);
    }
    throw error;
  }
}

// Função para validar dados de forma segura (retorna null se inválido)
export function safeValidateData<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
  try {
    return schema.parse(data);
  } catch {
    return null;
  }
}

// Função para sanitizar dados antes da validação
export function sanitizeForValidation(data: any): any {
  if (typeof data === 'string') {
    return data.trim().replace(/\s+/g, ' ');
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForValidation(item));
  }
  
  if (data && typeof data === 'object') {
    const sanitized: any = {};
    Object.keys(data).forEach(key => {
      sanitized[key] = sanitizeForValidation(data[key]);
    });
    return sanitized;
  }
  
  return data;
}

// Exportar todos os schemas
export {
  contactSubmissionSchema,
  planSchema,
  networkUnitSchema,
  faqItemSchema,
  siteSettingsSchema,
  adminLoginSchema,
  changePasswordSchema,
  fileUploadSchema,
  searchFiltersSchema,
  baseIdSchema,
  baseTimestampSchema,
  basePaginationSchema,
  successResponseSchema,
  errorResponseSchema,
  paginatedResponseSchema
};
