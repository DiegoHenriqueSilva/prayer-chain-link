import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Pray = () => {
  const [prayerRequest, setPrayerRequest] = useState<any>(null);
  const [suggestedPrayer, setSuggestedPrayer] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchRandomPrayerRequest = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('prayer_requests')
        .select('*')
        .lt('prayer_count', 5) // Only get requests with less than 5 prayers
        .limit(10);

      if (error) throw error;

      if (data && data.length > 0) {
        const randomRequest = data[Math.floor(Math.random() * data.length)];
        setPrayerRequest(randomRequest);
        
        // Increment prayer count
        await supabase
          .from('prayer_requests')
          .update({ prayer_count: randomRequest.prayer_count + 1 })
          .eq('id', randomRequest.id);
        
        setSuggestedPrayer("");
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
    <div className="min-h-screen gradient-peace relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent gradient-divine bg-gradient-to-r from-primary to-accent">
            Orar por uma Causa
          </h1>
          <p className="text-lg text-muted-foreground">
            Seja um instrumento da graça divina
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {!prayerRequest ? (
            <Card className="p-12 text-center soft-shadow">
              <Sparkles className="w-16 h-16 mx-auto mb-6 text-primary" />
              <h2 className="text-2xl font-semibold mb-4">
                Clique para receber uma causa
              </h2>
              <Button
                onClick={fetchRandomPrayerRequest}
                disabled={isLoading}
                size="lg"
                className="gradient-divine text-white hover:opacity-90 celestial-glow"
              >
                {isLoading ? "Buscando..." : "Sortear Causa e Orar"}
              </Button>
            </Card>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <Card className="p-8 soft-shadow">
                <div className="flex items-start gap-4 mb-6">
                  <Heart className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    {prayerRequest.title && (
                      <h3 className="text-xl font-semibold mb-2">
                        {prayerRequest.title}
                      </h3>
                    )}
                    <p className="text-foreground/80 leading-relaxed">
                      {prayerRequest.content}
                    </p>
                    {prayerRequest.location && (
                      <p className="text-sm text-muted-foreground mt-4">
                        📍 {prayerRequest.location}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={generatePrayer}
                    disabled={isGenerating}
                    className="gradient-sacred hover:opacity-90"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isGenerating ? "Gerando..." : "Receber Sugestão de Oração"}
                  </Button>
                  <Button
                    onClick={fetchRandomPrayerRequest}
                    variant="outline"
                    disabled={isLoading}
                  >
                    Próxima Causa
                  </Button>
                </div>
              </Card>

              {suggestedPrayer && (
                <>
                  <Card className="p-8 soft-shadow border-primary/20 animate-fade-in">
                    <h3 className="text-xl font-semibold mb-4 text-primary">
                      Sugestão de Oração
                    </h3>
                    <p className="text-foreground/90 leading-relaxed italic whitespace-pre-wrap">
                      {suggestedPrayer}
                    </p>
                  </Card>

                  <Card className="p-8 soft-shadow border-primary/20 animate-fade-in">
                    <h3 className="text-xl font-semibold mb-4 text-primary">
                      Envie Energia e Solidariedade
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Reaja com um emoticon para mostrar seu apoio
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                      <button 
                        className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-accent/10 transition-colors group"
                        onClick={() => toast.success("Reação enviada!")}
                      >
                        <span className="text-4xl group-hover:scale-110 transition-transform">❤️</span>
                        <span className="text-xs text-center text-muted-foreground">Compaixão e Amor</span>
                      </button>
                      <button 
                        className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-accent/10 transition-colors group"
                        onClick={() => toast.success("Reação enviada!")}
                      >
                        <span className="text-4xl group-hover:scale-110 transition-transform">🙏</span>
                        <span className="text-xs text-center text-muted-foreground">Graça de Deus</span>
                      </button>
                      <button 
                        className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-accent/10 transition-colors group"
                        onClick={() => toast.success("Reação enviada!")}
                      >
                        <span className="text-4xl group-hover:scale-110 transition-transform">⏳</span>
                        <span className="text-xs text-center text-muted-foreground">Paciência</span>
                      </button>
                      <button 
                        className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-accent/10 transition-colors group"
                        onClick={() => toast.success("Reação enviada!")}
                      >
                        <span className="text-4xl group-hover:scale-110 transition-transform">💪</span>
                        <span className="text-xs text-center text-muted-foreground">Força e Coragem</span>
                      </button>
                      <button 
                        className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-accent/10 transition-colors group"
                        onClick={() => toast.success("Reação enviada!")}
                      >
                        <span className="text-4xl group-hover:scale-110 transition-transform">🥺</span>
                        <span className="text-xs text-center text-muted-foreground">Empatia</span>
                      </button>
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
