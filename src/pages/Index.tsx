import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Send, Sparkles, LogOut, User, BookOpen } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const Index = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Logout realizado com sucesso!");
  };

  return (
    <div className="min-h-screen gradient-peace relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 py-4 relative z-10">
        {/* Header with Auth */}
        <div className="flex justify-end mb-8">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                {user.email}
              </div>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          ) : (
            <Button onClick={() => navigate("/auth")} variant="outline">
              Entrar / Criar Conta
            </Button>
          )}
        </div>
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent gradient-divine bg-gradient-to-r from-primary via-accent to-secondary">
            Fé Conectada
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Conectando corações através da oração. Seja um instrumento da graça divina ou compartilhe sua necessidade com a comunidade.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="p-8 soft-shadow hover:scale-105 smooth-transition group">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto gradient-divine rounded-full flex items-center justify-center celestial-glow group-hover:scale-110 smooth-transition">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold">Orar por uma Causa</h2>
              <p className="text-muted-foreground leading-relaxed">
                Receba um pedido de oração aleatório e seja um instrumento de intercessão e graça
              </p>
              <Link to="/pray">
                <Button size="lg" className="gradient-divine text-white hover:opacity-90 w-full">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Começar a Orar
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-8 soft-shadow hover:scale-105 smooth-transition group">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto gradient-sacred rounded-full flex items-center justify-center celestial-glow group-hover:scale-110 smooth-transition">
                <Send className="w-10 h-10 text-foreground" />
              </div>
              <h2 className="text-3xl font-bold">Enviar Pedido</h2>
              <p className="text-muted-foreground leading-relaxed">
                Compartilhe sua necessidade de oração com a comunidade e receba apoio espiritual
              </p>
              <Link to="/submit">
                <Button size="lg" className="gradient-sacred hover:opacity-90 w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Pedido
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* My Prayers Card - only for logged in users */}
        {user && (
          <div className="max-w-4xl mx-auto mt-8">
            <Card className="p-6 soft-shadow hover:scale-[1.02] smooth-transition group">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 gradient-sacred rounded-full flex items-center justify-center celestial-glow group-hover:scale-110 smooth-transition flex-shrink-0">
                  <BookOpen className="w-8 h-8 text-secondary-foreground" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">Minhas Preces</h2>
                  <p className="text-muted-foreground">Veja quantas pessoas oraram por você e as reações recebidas</p>
                </div>
                <Link to="/my-prayers">
                  <Button className="gradient-divine text-primary-foreground hover:opacity-90">
                    Ver Histórico
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        )}

        {/* Info Section */}
        <div className="max-w-3xl mx-auto mt-16 text-center">
          <Card className="p-8 soft-shadow bg-card/50 backdrop-blur">
            <h3 className="text-2xl font-semibold mb-4">Como Funciona</h3>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h4 className="font-semibold text-primary mb-2">📿 Para Orantes</h4>
                <p className="text-sm text-muted-foreground">
                  Receba causas aleatórias e ore com sugestões de oração geradas por IA que capturam a essência emocional de cada pedido
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-secondary mb-2">✨ Para Solicitantes</h4>
                <p className="text-sm text-muted-foreground">
                  Envie seus pedidos e saiba quantas pessoas oraram por você. Sua causa será compartilhada anonimamente com a comunidade
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
