import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// --- HELPER COMPONENTS (ICONS) ---

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-[#277F80] bg-[#277F80]/5 backdrop-blur-sm transition-colors">
    {children}
  </div>
);

// --- MAIN COMPONENT ---

export default function AreaCliente() {
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const cpf = formData.get('password') as string;

    // Simular autenticação com email e CPF
    if (email === 'maria.santos@email.com' && cpf === '123.456.789-01') {
      // Implementar lógica de autenticação aqui
      console.log('Login realizado com sucesso');
    } else {
      // Mostrar erro se as credenciais estiverem incorretas
      alert('Email ou CPF incorretos. Verifique suas credenciais.');
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row font-geist w-[100dvw] bg-[#277F80]">
      {/* Left column: sign-in form */}
      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h1 className="animate-element animate-delay-100 text-3xl md:text-4xl font-semibold leading-tight text-white">
                Consulte seu plano com facilidade
              </h1>
            </div>

            <form className="space-y-5" onSubmit={handleSignIn}>
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

              <button type="submit" className="animate-element animate-delay-600 w-full rounded-2xl bg-[#EAA42A] py-4 font-medium text-[#FBF9F7] hover:bg-[#EAA42A]/90 transition-colors">
                Entrar
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
