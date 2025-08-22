import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// --- HELPER COMPONENTS (ICONS) ---

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
    </svg>
);

// --- TYPE DEFINITIONS ---

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

interface SignInPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn?: () => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
}

// --- SUB-COMPONENTS ---

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-[#277F80] bg-[#277F80]/5 backdrop-blur-sm transition-colors">
    {children}
  </div>
);

const TestimonialCard = ({ testimonial, delay }: { testimonial: Testimonial, delay: string }) => (
  <div className={`animate-testimonial ${delay} flex items-start gap-3 rounded-3xl bg-[#277F80]/40 dark:bg-[#277F80]/40 backdrop-blur-xl border border-white/10 p-5 w-64`}>
    <img src={testimonial.avatarSrc} className="h-10 w-10 object-cover rounded-2xl" alt="avatar" />
    <div className="text-sm leading-snug">
      <p className="flex items-center gap-1 font-medium text-white">{testimonial.name}</p>
      <p className="text-white/70">{testimonial.handle}</p>
      <p className="mt-1 text-white/80">{testimonial.text}</p>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

export const SignInPage: React.FC<SignInPageProps> = ({
  title = <span className="font-light text-white tracking-tighter">Bem-vindo</span>,
  description = "Acesse sua conta e continue sua jornada conosco",
  heroImageSrc,
  testimonials = [],
  onSignIn,
  onGoogleSignIn,
  onResetPassword,
  onCreateAccount,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row font-geist w-[100dvw] bg-[#277F80]">
      {/* Left column: sign-in form */}
      <section className="flex-1 flex items-center justify-center p-8">
                  <div className="w-full max-w-md">
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <h1 className="animate-element animate-delay-100 text-3xl md:text-4xl font-semibold leading-tight text-white">{title}</h1>
              </div>

            <form className="space-y-5" onSubmit={onSignIn}>
              <div className="animate-element animate-delay-300">
                <label className="text-sm font-medium text-white/90">Endereço de Email</label>
                <GlassInputWrapper>
                  <input name="email" type="email" placeholder="Digite seu endereço de email" className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-white placeholder-white/50" />
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-400">
                <label className="text-sm font-medium text-white/90">CPF</label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Digite seu CPF" className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none text-white placeholder-white/50" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center">
                      {showPassword ? <EyeOff className="w-5 h-5 text-white/70 hover:text-white transition-colors" /> : <Eye className="w-5 h-5 text-white/70 hover:text-white transition-colors" />}
                    </button>
                  </div>
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-500 flex items-center justify-between text-sm">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="rememberMe" className="custom-checkbox" />
                  <span className="text-white/90">Manter conectado</span>
                </label>
                <a href="#" onClick={(e) => { e.preventDefault(); onResetPassword?.(); }} className="hover:underline text-[#FBF9F7] transition-colors">Redefinir senha</a>
              </div>

              <button type="submit" className="animate-element animate-delay-600 w-full rounded-2xl bg-[#EAA42A] py-4 font-medium text-[#FBF9F7] hover:bg-[#EAA42A]/90 transition-colors">
                Entrar
              </button>
            </form>

            <div className="animate-element animate-delay-700 relative flex items-center justify-center">
              <span className="w-full border-t border-white/20"></span>
              <span className="px-4 text-sm text-white/70 bg-[#277F80] absolute">Ou continue com</span>
            </div>

            <button onClick={onGoogleSignIn} className="animate-element animate-delay-800 w-full flex items-center justify-center gap-3 border border-white/20 rounded-2xl py-4 bg-[#FBF9F7] hover:bg-[#FBF9F7]/90 transition-colors text-[#277F80]">
                <GoogleIcon />
                Continuar com Google
            </button>

            <p className="animate-element animate-delay-900 text-center text-sm text-white/70">
              Novo em nossa plataforma? <a href="#" onClick={(e) => { e.preventDefault(); onCreateAccount?.(); }} className="text-[#EAA42A] hover:underline transition-colors">Criar Conta</a>
            </p>
          </div>
        </div>
      </section>

      {/* Right column: hero image + testimonials */}
      {heroImageSrc && (
        <section className="hidden md:block flex-1 relative p-4">
          <div className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl bg-cover bg-center" style={{ backgroundImage: `url(${heroImageSrc})` }}></div>
          {testimonials.length > 0 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 px-8 w-full justify-center">
              <TestimonialCard testimonial={testimonials[0]} delay="animate-delay-1000" />
              {testimonials[1] && <div className="hidden xl:flex"><TestimonialCard testimonial={testimonials[1]} delay="animate-delay-1200" /></div>}
              {testimonials[2] && <div className="hidden 2xl:flex"><TestimonialCard testimonial={testimonials[2]} delay="animate-delay-1400" /></div>}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

// --- DEFAULT EXPORT ---

export default function AreaCliente() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [clienteInfo, setClienteInfo] = useState<any>(null);

    const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const cpf = formData.get('password') as string;

    // Simular autenticação com email e CPF
    if (email === 'maria.santos@email.com' && cpf === '123.456.789-01') {
      setIsLoggedIn(true);
      setClienteInfo({
        nome: 'Maria Silva Santos',
        cpf: '123.456.789-01',
        telefone: '(11) 98765-4321',
        email: 'maria.santos@email.com',
        plano: {
          nome: 'INFINITY',
          numeroApolice: 'PC-2025-789456',
          mensalidade: 20000,
          vencimento: 15,
          formaPagamento: 'Débito automático',
          coparticipacao: 'Sem coparticipação',
          dataInicio: '01/01/2025'
        },
        carencias: {
          consultas: '30 dias',
          exames: '60 dias',
          cirurgias: '180 dias',
          emergencias: 'Cobertura imediata'
        },
        contato: {
          atendimento: '0800-123-4567',
          app: 'UNIPET PLAN',
          site: 'www.unipetplan.com.br'
        }
      });
    } else {
      // Mostrar erro se as credenciais estiverem incorretas
      alert('Email ou CPF incorretos. Verifique suas credenciais.');
    }
  };

  const handleGoogleSignIn = () => {
    // Implementar autenticação com Google
    console.log('Google sign in clicked');
  };

  const handleResetPassword = () => {
    // Implementar redefinição de senha
    console.log('Reset password clicked');
  };

  const handleCreateAccount = () => {
    // Implementar criação de conta
    console.log('Create account clicked');
  };

  if (isLoggedIn && clienteInfo) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header da área do cliente */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#277677]">Área do Cliente</h1>
                <p className="text-gray-600 mt-2">Bem-vindo(a), {clienteInfo.nome}</p>
              </div>
              <button 
                onClick={() => setIsLoggedIn(false)}
                className="px-4 py-2 border border-[#277677] text-[#277677] hover:bg-[#277677] hover:text-white rounded-lg transition-colors"
              >
                Sair
              </button>
            </div>
          </div>

          {/* Conteúdo da área do cliente - mantido como estava */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informações Pessoais */}
            <div className="lg:col-span-1 bg-white rounded-lg shadow-md">
              <div className="bg-[#277677] text-white rounded-t-lg p-4">
                <h3 className="font-semibold">Informações Pessoais</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nome Completo</label>
                    <p className="text-lg font-semibold text-gray-900">{clienteInfo.nome}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">CPF</label>
                    <p className="text-lg font-semibold text-gray-900">{clienteInfo.cpf}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Telefone</label>
                    <p className="text-lg font-semibold text-gray-900">{clienteInfo.telefone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-lg font-semibold text-gray-900">{clienteInfo.email}</p>
                  </div>
                </div>
                  </div>
                </div>

            {/* Informações do Plano */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md">
              <div className="bg-[#277677] text-white rounded-t-lg p-4">
                <h3 className="font-semibold">Informações do Plano</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Plano</label>
                      <p className="text-2xl font-bold text-[#277677]">{clienteInfo.plano.nome}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Número da Apólice</label>
                      <p className="text-lg font-semibold text-gray-900">{clienteInfo.plano.numeroApolice}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Mensalidade</label>
                      <p className="text-2xl font-bold text-green-600">R$ {(clienteInfo.plano.mensalidade / 100).toFixed(2)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Vencimento</label>
                      <p className="text-lg font-semibold text-gray-900">Todo dia {clienteInfo.plano.vencimento}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Forma de Pagamento</label>
                      <p className="text-lg font-semibold text-gray-900">{clienteInfo.plano.formaPagamento}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Coparticipação</label>
                      <p className="text-lg font-semibold text-gray-900">{clienteInfo.plano.coparticipacao}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Data de Início</label>
                      <p className="text-lg font-semibold text-gray-900">{clienteInfo.plano.dataInicio}</p>
                    </div>
                  </div>
                    </div>
                  </div>
                </div>

            {/* Carências */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md">
              <div className="bg-[#277677] text-white rounded-t-lg p-4">
                <h3 className="font-semibold">Carências</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="h-6 w-6 text-green-600">✓</div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Consultas</label>
                      <p className="text-lg font-semibold text-gray-900">{clienteInfo.carencias.consultas}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="h-6 w-6 text-green-600">✓</div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Exames</label>
                      <p className="text-lg font-semibold text-gray-900">{clienteInfo.carencias.exames}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="h-6 w-6 text-green-600">✓</div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Cirurgias</label>
                      <p className="text-lg font-semibold text-gray-900">{clienteInfo.carencias.cirurgias}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="h-6 w-6 text-orange-600">⚠</div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Emergências</label>
                      <p className="text-lg font-semibold text-gray-900">{clienteInfo.carencias.emergencias}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações de Contato */}
            <div className="lg:col-span-1 bg-white rounded-lg shadow-md">
              <div className="bg-[#277677] text-white rounded-t-lg p-4">
                <h3 className="font-semibold">Contato</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Atendimento</label>
                    <p className="text-lg font-semibold text-gray-900">{clienteInfo.contato.atendimento}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">App</label>
                    <p className="text-lg font-semibold text-gray-900">{clienteInfo.contato.app}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Site</label>
                    <p className="text-lg font-semibold text-gray-900">{clienteInfo.contato.site}</p>
                  </div>
                </div>
                  </div>
                </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SignInPage
      title={<span className="font-light text-white tracking-tighter">Bem-vindo à UNIPET PLAN</span>}
      description="Acesse sua conta e continue sua jornada conosco"
      onSignIn={handleSignIn}
      onGoogleSignIn={handleGoogleSignIn}
      onResetPassword={handleResetPassword}
      onCreateAccount={handleCreateAccount}
    />
  );
}
