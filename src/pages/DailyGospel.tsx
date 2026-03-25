import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Share2, Loader2, BookOpen } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";
import { useXp } from "@/hooks/use-xp";
import { getLevel } from "@/lib/xp";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface GospelData {
  verse: string;
  reference: string;
  liturgicalDay?: string;
  title?: string;
}

const DailyGospel = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const { totalXp } = useXp();
  const [generating, setGenerating] = useState(false);
  const [loadingGospel, setLoadingGospel] = useState(true);
  const [gospel, setGospel] = useState<GospelData | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  useEffect(() => {
    fetchDailyGospel();
  }, []);

  const fetchDailyGospel = async () => {
    setLoadingGospel(true);
    try {
      // Check localStorage cache (valid for same day)
      const cached = localStorage.getItem("daily_gospel_cache");
      if (cached) {
        const { data, date } = JSON.parse(cached);
        if (date === new Date().toISOString().split("T")[0]) {
          setGospel(data);
          setLoadingGospel(false);
          return;
        }
      }

      const { data, error } = await supabase.functions.invoke("daily-gospel");
      if (error) throw error;

      if (data && data.verse) {
        setGospel(data);
        localStorage.setItem(
          "daily_gospel_cache",
          JSON.stringify({ data, date: new Date().toISOString().split("T")[0] })
        );
      }
    } catch (err) {
      console.error("Failed to fetch daily gospel:", err);
      // Fallback
      setGospel({
        verse: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.",
        reference: "João 3:16",
        liturgicalDay: "Evangelho do Dia",
        title: "O amor de Deus",
      });
    } finally {
      setLoadingGospel(false);
    }
  };

  const level = getLevel(totalXp);
  const referralLink = user
    ? `${window.location.origin}/auth?ref=${user.id}`
    : window.location.origin;

  const handleShare = async () => {
    if (!user) {
      toast.error("Faça login para compartilhar com seu link de convite!");
      navigate("/auth");
      return;
    }
    if (!gospel) return;

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-gospel-image", {
        body: {
          verse: gospel.verse,
          reference: gospel.reference,
          userName: user.email?.split("@")[0] ?? "Fiel",
          userLevel: level.name,
          userEmoji: level.emoji,
        },
      });

      if (error) throw error;

      const shareText = `✦ Evangelho do Dia ✦\n\n"${gospel.verse}"\n— ${gospel.reference}\n\n🙏 Junte-se a nós no Améns:\n${referralLink}`;

      if (navigator.share && data?.imageUrl) {
        try {
          const response = await fetch(data.imageUrl);
          const blob = await response.blob();
          const file = new File([blob], "evangelho-do-dia.png", { type: "image/png" });
          await navigator.share({
            title: "Evangelho do Dia - Améns",
            text: shareText,
            files: [file],
          });
          toast.success("Compartilhado com sucesso! ✨");
        } catch {
          await navigator.clipboard.writeText(shareText);
          toast.success("Texto copiado! Cole no WhatsApp ou redes sociais 📋");
        }
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success("Texto copiado! Cole no WhatsApp ou redes sociais 📋");
      }
    } catch (err) {
      console.error("Share error:", err);
      const shareText = `✦ Evangelho do Dia ✦\n\n"${gospel.verse}"\n— ${gospel.reference}\n\n🙏 Junte-se a nós no Améns:\n${referralLink}`;
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success("Texto copiado para compartilhar! 📋");
      } catch {
        toast.error("Não foi possível compartilhar. Tente novamente.");
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background relative overflow-hidden">
        <div className="absolute top-[-8rem] right-[-6rem] w-[28rem] h-[28rem] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[-6rem] left-[-6rem] w-[24rem] h-[24rem] rounded-full bg-accent/5 blur-3xl" />

        <div className="container mx-auto px-4 py-6 relative z-10 max-w-lg">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="mb-4">
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs uppercase tracking-[0.25em] text-primary mb-2">✦</p>
            <h1 className="text-4xl font-bold text-foreground mb-2">Evangelho do Dia</h1>
            <div className="divider-gold max-w-[6rem] mx-auto my-3" />
            <p className="text-sm text-muted-foreground">Liturgia diária da Igreja Católica</p>
          </motion.div>

          {loadingGospel ? (
            <Card className="p-8 soft-shadow border-primary/15 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Buscando o evangelho de hoje...</p>
            </Card>
          ) : gospel ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="p-8 soft-shadow border-primary/15 text-center space-y-6">
                <div className="w-14 h-14 mx-auto gradient-divine rounded-full flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-primary-foreground" />
                </div>

                {gospel.liturgicalDay && (
                  <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">
                    {gospel.liturgicalDay}
                  </p>
                )}

                {gospel.title && (
                  <h2 className="text-lg font-semibold text-foreground">{gospel.title}</h2>
                )}

                <motion.blockquote
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-base leading-relaxed text-foreground italic font-serif"
                >
                  "{gospel.verse}"
                </motion.blockquote>

                <p className="text-sm font-semibold text-primary">— {gospel.reference}</p>

                <div className="divider-gold" />

                <Button
                  onClick={handleShare}
                  disabled={generating}
                  className="gradient-divine text-primary-foreground hover:opacity-90 w-full"
                  size="lg"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando imagem...
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 mr-2" />
                      Compartilhar com Imagem
                    </>
                  )}
                </Button>

                {user && (
                  <motion.div
                    className="pt-2 border-t border-primary/10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="text-xs text-muted-foreground">
                      {level.emoji} Compartilhando como <span className="font-semibold text-primary">{level.name}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      🎁 Ganhe <span className="font-semibold text-primary">+30 XP</span> quando alguém se cadastrar pelo seu link!
                    </p>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ) : null}
        </div>
      </div>
    </PageTransition>
  );
};

export default DailyGospel;
