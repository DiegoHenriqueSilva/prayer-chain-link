import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Heart, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useXp } from "@/hooks/use-xp";
import { XP_REWARDS } from "@/lib/xp";

const Pray = () => {
  const [prayerRequest, setPrayerRequest] = useState<any>(null);
  const [suggestedPrayer, setSuggestedPrayer] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const { addXp } = useXp();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
    });
  }, [navigate]);

  const fetchRandomPrayerRequest = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('prayer_requests')
        .select('*')
        .lt('prayer_count', 5)
        .limit(10);
      if (error) throw error;
      if (data && data.length > 0) {
        const randomRequest = data[Math.floor(Math.random() * data.length)];
        setPrayerRequest(randomRequest);
        await supabase.from('prayer_requests').update({ prayer_count: randomRequest.prayer_count + 1 }).eq('id', randomRequest.id);
        setSuggestedPrayer("");
        await addXp("pray");
        toast.success(`+${XP_REWARDS.pray} XP por orar!`);
      } else {
        toast.info("Não há causas disponíveis no momento");
      }
    } catch (error) {
      console.error('Error fetching prayer request:', error);
      toast.error("Erro ao buscar pedido de oração");
    } finally {
      setIsLoading(false);
    }
  };

  const generatePrayer = async () => {
    if (!prayerRequest) return;
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-prayer', {
        body: { prayerRequest: prayerRequest.content }
      });
      if (error) throw error;
      setSuggestedPrayer(data.prayer);
    } catch (error) {
      console.error('Error generating prayer:', error);
      toast.error("Erro ao gerar sugestão de oração");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="absolute top-4 left-4 z-20">
        <ArrowLeft className="w-5 h-5" />
      </Button>

      <div className="absolute top-[-6rem] left-[-4rem] w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-6rem] right-[-4rem] w-80 h-80 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <p className="text-sm uppercase tracking-[0.25em] text-primary mb-2">✦</p>
          <h1 className="text-5xl md:text-6xl font-bold mb-3 text-foreground">
            Orar por uma Causa
          </h1>
          <div className="divider-gold max-w-[10rem] mx-auto mb-3" />
          <p className="text-muted-foreground">Seja um instrumento da graça divina</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {!prayerRequest ? (
            <Card className="p-12 text-center soft-shadow border-primary/10">
              <Sparkles className="w-14 h-14 mx-auto mb-5 text-primary" />
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Clique para receber uma causa</h2>
              <Button onClick={fetchRandomPrayerRequest} disabled={isLoading} size="lg" className="gradient-divine text-primary-foreground hover:opacity-90">
                {isLoading ? "Buscando..." : "Sortear Causa e Orar"}
              </Button>
            </Card>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <Card className="p-8 soft-shadow border-primary/10">
                <div className="flex items-start gap-4 mb-6">
                  <Heart className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    {prayerRequest.title && <h3 className="text-xl font-semibold mb-2 text-foreground">{prayerRequest.title}</h3>}
                    <p className="text-foreground/80 leading-relaxed">{prayerRequest.content}</p>
                    {prayerRequest.location && <p className="text-sm text-muted-foreground mt-3">📍 {prayerRequest.location}</p>}
                  </div>
                </div>
                <div className="divider-gold mb-5" />
                <div className="flex gap-3 flex-wrap">
                  <Button onClick={generatePrayer} disabled={isGenerating} className="gradient-sacred text-foreground hover:opacity-90">
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isGenerating ? "Gerando..." : "Sugestão de Oração"}
                  </Button>
                  <Button onClick={fetchRandomPrayerRequest} variant="outline" disabled={isLoading} className="border-primary/20">
                    Próxima Causa
                  </Button>
                  <Button onClick={() => { setPrayerRequest(null); setSuggestedPrayer(""); }} variant="ghost">
                    Voltar
                  </Button>
                </div>
              </Card>

              {suggestedPrayer && (
                <>
                  <Card className="p-8 soft-shadow border-primary/15 animate-fade-in">
                    <h3 className="text-xl font-semibold mb-4 text-primary">Sugestão de Oração</h3>
                    <p className="text-foreground/85 leading-relaxed italic whitespace-pre-wrap">{suggestedPrayer}</p>
                  </Card>

                  <Card className="p-8 soft-shadow border-primary/15 animate-fade-in">
                    <h3 className="text-xl font-semibold mb-3 text-primary">Envie Energia e Solidariedade</h3>
                    <p className="text-sm text-muted-foreground mb-5">Reaja para mostrar seu apoio</p>
                    <div className="flex flex-wrap gap-3 justify-center">
                      {[
                        { type: "love", emoji: "❤️", label: "Compaixão" },
                        { type: "pray", emoji: "🙏", label: "Graça" },
                        { type: "patience", emoji: "⏳", label: "Paciência" },
                        { type: "strength", emoji: "💪", label: "Força" },
                        { type: "empathy", emoji: "🥺", label: "Empatia" },
                      ].map((reaction) => (
                        <button
                          key={reaction.type}
                          className="flex flex-col items-center gap-1.5 p-3 rounded-lg hover:bg-primary/5 transition-colors group"
                          onClick={async () => {
                            try {
                              const { data: { session } } = await supabase.auth.getSession();
                              if (!session) return;
                              await supabase.from("prayer_reactions").insert({
                                prayer_request_id: prayerRequest.id,
                                reactor_user_id: session.user.id,
                                reaction_type: reaction.type,
                              });
                              await addXp("react");
                              toast.success(`Reação enviada! +${XP_REWARDS.react} XP`);
                            } catch {
                              toast.error("Erro ao enviar reação");
                            }
                          }}
                        >
                          <span className="text-3xl group-hover:scale-110 transition-transform">{reaction.emoji}</span>
                          <span className="text-[11px] text-muted-foreground">{reaction.label}</span>
                        </button>
                      ))}
                    </div>
                  </Card>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pray;
