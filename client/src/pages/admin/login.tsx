import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Lock, Shield, User, Eye, EyeOff } from "lucide-react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useLocation } from "wouter";

const loginSchema = z.object({
  username: z.string().min(1, "Nome de usuário é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { user, loginMutation } = useAdminAuth();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/admin");
    }
  }, [user, setLocation]);

  const onSubmit = async (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  // Don't render if already authenticated
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#277677] via-[#2a8a8b] to-[#1e5f60] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/3 rounded-full blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <Card className="shadow-2xl border-none backdrop-blur-sm bg-white/95 overflow-hidden">
          <CardHeader className="text-center pb-8 bg-gradient-to-b from-[#FBF9F7] to-white relative flex flex-col items-center">
            <img 
              src="/unipet-logo.png" 
              alt="UNIPET PLAN Logo" 
              className="h-12 w-auto mb-4"
            />
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[#277677] to-[#1e5f60] bg-clip-text text-transparent">
              Painel Administrativo
            </CardTitle>
            <p className="text-[#302e2b]/70 mt-3 text-lg">
              Acesse o sistema de gerenciamento
            </p>

          </CardHeader>
          
          <CardContent className="space-y-1.5 p-6 text-center pb-8 bg-gradient-to-b from-white to-[#FBF9F7]">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 admin-no-focus">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-[#277677] font-semibold text-base flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Nome de usuário
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Input 
                            placeholder="Digite seu usuário" 
                            {...field}
                            data-testid="input-username"
                            className="h-12 pl-4 pr-4 border-2 border-[#277677]/20 focus:border-[#277677] hover:border-[#277677]/40 transition-all duration-300 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm focus:shadow-md text-base text-[#101010] placeholder:text-[#121212]"
                          />
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#277677]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-[#277677] font-semibold text-base flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Senha
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Input 
                            type={showPassword ? "text" : "password"}
                            placeholder="Digite sua senha" 
                            {...field}
                            data-testid="input-password"
                            className="h-12 pl-4 pr-12 border-2 border-[#277677]/20 focus:border-[#277677] hover:border-[#277677]/40 transition-all duration-300 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm focus:shadow-md text-base text-[#101010] placeholder:text-[#121212]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#277677]/60 hover:text-[#277677] transition-colors duration-200"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#277677]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-14 bg-gradient-to-r from-[#277677] to-[#1e5f60] hover:from-[#1e5f60] hover:to-[#277677] text-[#FBF9F7] font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group mb-8"
                  disabled={loginMutation.isPending}
                  data-testid="button-login"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {loginMutation.isPending ? (
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <>
                      <Lock className="mr-3 h-5 w-5" />
                      <span className="relative z-10">Entrar no Sistema</span>
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}