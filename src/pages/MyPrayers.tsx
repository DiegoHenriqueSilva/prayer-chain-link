import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Eye, Heart, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const REACTION_MAP: Record<string, { emoji: string; label: string }> = {
  love: { emoji: "❤️", label: "Compaixão" },
  pray: { emoji: "🙏", label: "Graça" },
  patience: { emoji: "⏳", label: "Paciência" },
  strength: { emoji: "💪", label: "Força" },
  empathy: { emoji: "🥺", label: "Empatia" },
};

type PrayerWithReactions = {
  id: string;
  title: string | null;
  content: string;
  location: string | null;
  prayer_count: number;
  created_at: string;
  reactions: Record<string, number>;
};

const MyPrayers = () => {
  const navigate = useNavigate();
  const [prayers, setPrayers] = useState<PrayerWithReactions[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      try {
        const { data: prayerData, error: prayerError } = await supabase
          .from("prayer_requests")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        if (prayerError) throw prayerError;

        if (!prayerData || prayerData.length === 0) {
          setPrayers([]);
          setIsLoading(false);
          return;
        }

        const prayerIds = prayerData.map((p) => p.id);
        const { data: reactionData } = await supabase
          .from("prayer_reactions")
          .select("prayer_request_id, reaction_type")
          .in("prayer_request_id", prayerIds);

        const reactionsByPrayer: Record<string, Record<string, number>> = {};
        reactionData?.forEach((r) => {
          if (!reactionsByPrayer[r.prayer_request_id]) {
            reactionsByPrayer[r.prayer_request_id] = {};
          }
          reactionsByPrayer[r.prayer_request_id][r.reaction_type] =
            (reactionsByPrayer[r.prayer_request_id][r.reaction_type] || 0) + 1;
        });

        setPrayers(
          prayerData.map((p) => ({
            ...p,
            reactions: reactionsByPrayer[p.id] || {},
          }))
        );
      } catch (error) {
        console.error("Error loading prayers:", error);
        toast.error("Erro ao carregar seus pedidos");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [navigate]);

  const totalReactions = (reactions: Record<string, number>) =>
    Object.values(reactions).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen gradient-peace relative overflow-hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 z-20"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>

      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Minhas Preces
          </h1>
          <p className="text-lg text-muted-foreground">
            Acompanhe seus pedidos e veja quem orou por você
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          ) : prayers.length === 0 ? (
            <Card className="p-12 text-center soft-shadow">
              <Heart className="w-16 h-16 mx-auto mb-6 text-muted-foreground/40" />
              <h2 className="text-2xl font-semibold mb-2">Nenhum pedido ainda</h2>
              <p className="text-muted-foreground mb-6">
                Envie seu primeiro pedido de oração para a comunidade
              </p>
              <Button
                onClick={() => navigate("/submit")}
                className="gradient-divine text-primary-foreground hover:opacity-90"
              >
                Enviar Pedido
              </Button>
            </Card>
          ) : (
            prayers.map((prayer) => (
              <Card key={prayer.id} className="p-6 soft-shadow">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    {prayer.title && (
                      <h3 className="text-lg font-semibold mb-1">
                        {prayer.title}
                      </h3>
                    )}
                    <p className="text-foreground/80 leading-relaxed">
                      {prayer.content}
                    </p>
                  </div>
                </div>

                {prayer.location && (
                  <p className="text-sm text-muted-foreground mb-3">
                    📍 {prayer.location}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    <span>{prayer.prayer_count} orações</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4" />
                    <span>{totalReactions(prayer.reactions)} reações</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>
                      {format(new Date(prayer.created_at), "dd MMM yyyy", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>

                {totalReactions(prayer.reactions) > 0 && (
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
                    {Object.entries(prayer.reactions).map(([type, count]) => {
                      const info = REACTION_MAP[type];
                      if (!info) return null;
                      return (
                        <span
                          key={type}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-sm"
                        >
                          {info.emoji} {count}
                        </span>
                      );
                    })}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPrayers;
