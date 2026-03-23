import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Send, Sparkles, LogOut, User, BookOpen } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useXp } from "@/hooks/use-xp";
import { XpBadge } from "@/components/XpBadge";

const Index = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const navigate = useNavigate();
  const { totalXp, loading: xpLoading } = useXp();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Logout realizado com sucesso!");
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle decorative gold circles */}
      <div className="absolute top-[-8rem] right-[-6rem] w-[28rem] h-[28rem] rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-[-6rem] left-[-6rem] w-[24rem] h-[24rem] rounded-full bg-accent/5 blur-3xl" />

      <div className="container mx-auto px-4 py-4 relative z-10">
        {/* Header */}
        <div className="flex justify-end mb-6">
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

        {/* Hero */}
        <div className="text-center mb-10 animate-fade-in">
          <p className="text-sm uppercase tracking-[0.3em] text-primary font-medium mb-3">
            ✦ Unidos pela Fé ✦
          </p>
          <h1 className="text-6xl md:text-7xl font-bold mb-4 text-foreground">
            Fé Conectada
          </h1>
          <div className="divider-gold max-w-xs mx-auto mb-4" />
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Conectando corações através da oração. Seja um instrumento da graça divina ou compartilhe sua necessidade com a comunidade.
          </p>
        </div>

        {/* XP Badge */}
        {user && !xpLoading && (
          <div className="max-w-sm mx-auto mb-10">
            <Card className="p-4 soft-shadow border-primary/15">
              <XpBadge totalXp={totalXp} />
            </Card>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="p-8 soft-shadow hover:shadow-lg smooth-transition group border-primary/10">
            <div className="text-center space-y-5">
              <div className="w-16 h-16 mx-auto gradient-divine rounded-full flex items-center justify-center group-hover:scale-105 smooth-transition">
                <Heart className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">Orar por uma Causa</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Receba um pedido de oração aleatório e seja um instrumento de intercessão e graça
              </p>
              <Link to="/pray">
                <Button size="lg" className="gradient-divine text-primary-foreground hover:opacity-90 w-full">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Começar a Orar
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-8 soft-shadow hover:shadow-lg smooth-transition group border-primary/10">
            <div className="text-center space-y-5">
              <div className="w-16 h-16 mx-auto bg-secondary rounded-full flex items-center justify-center group-hover:scale-105 smooth-transition border border-primary/20">
                <Send className="w-8 h-8 text-foreground" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">Enviar Pedido</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Compartilhe sua necessidade de oração com a comunidade e receba apoio espiritual
              </p>
              <Link to="/submit">
                <Button size="lg" variant="outline" className="w-full border-primary/30 hover:bg-primary/5">
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Pedido
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* My Prayers */}
        {user && (
          <div className="max-w-4xl mx-auto mt-8">
            <Card className="p-5 soft-shadow hover:shadow-lg smooth-transition group border-primary/10">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 gradient-sacred rounded-full flex items-center justify-center group-hover:scale-105 smooth-transition flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground">Minhas Preces</h2>
                  <p className="text-sm text-muted-foreground">Veja quantas pessoas oraram por você</p>
                </div>
                <Link to="/my-prayers">
                  <Button className="gradient-divine text-primary-foreground hover:opacity-90" size="sm">
                    Ver Histórico
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        )}

        {/* How it works */}
        <div className="max-w-3xl mx-auto mt-14 text-center">
          <div className="divider-gold mb-8" />
          <h3 className="text-2xl font-semibold mb-6 text-foreground">Como Funciona</h3>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div>
              <h4 className="font-semibold text-primary mb-2 text-base">📿 Para Orantes</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Receba causas aleatórias e ore com sugestões de oração geradas por IA que capturam a essência emocional de cada pedido
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-2 text-base">✨ Para Solicitantes</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Envie seus pedidos e saiba quantas pessoas oraram por você. Sua causa será compartilhada anonimamente
              </p>
            </div>
          </div>
          <div className="divider-gold mt-8" />
        </div>
      </div>
    </div>
  );
};

export default Index;
