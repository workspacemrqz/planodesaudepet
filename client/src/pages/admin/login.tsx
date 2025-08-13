import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Lock, Shield } from "lucide-react";
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
    <div className="min-h-screen bg-[#277677] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-none">
          <CardHeader className="text-center pb-6 bg-[#FBF9F7] rounded-t-xl">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-[#277677] p-3 rounded-full">
                <Shield className="h-8 w-8 text-[#FBF9F7]" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-[#277677]">
              Painel Administrativo
            </CardTitle>
            <p className="text-[#302e2b]/70 mt-2">
              Acesse o sistema de gerenciamento
            </p>
          </CardHeader>
          
          <CardContent className="p-6 bg-[#FBF9F7] rounded-b-xl">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 admin-no-focus">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#277677] font-medium">
                        Nome de usuário
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="admin" 
                          {...field}
                          data-testid="input-username"
                          className="border-[#277677]/20 focus:ring-0 focus:ring-offset-0 focus:border-gray-300 hover:border-gray-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#277677] font-medium">
                        Senha
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="admin" 
                          {...field}
                          data-testid="input-password"
                          className="border-[#277677]/20 focus:ring-0 focus:ring-offset-0 focus:border-gray-300 hover:border-gray-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-[#277677] hover:bg-[#277677]/90 text-[#FBF9F7] font-semibold py-3 rounded-lg"
                  disabled={loginMutation.isPending}
                  data-testid="button-login"
                >
                  {loginMutation.isPending ? (
                    <>
                      <Lock className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Entrar
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 p-4 bg-[#277677]/5 rounded-lg border border-[#277677]/10">
              <p className="text-sm text-[#302e2b]/70 text-center">
                <strong>Credenciais padrão:</strong><br />
                Usuário: admin | Senha: admin
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}