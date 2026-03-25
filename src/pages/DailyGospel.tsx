import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Share2, Loader2, RefreshCw, BookOpen } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";
import { useXp } from "@/hooks/use-xp";
import { getLevel } from "@/lib/xp";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const DAILY_VERSES = [
  { verse: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.", reference: "João 3:16" },
  { verse: "O Senhor é o meu pastor; nada me faltará.", reference: "Salmos 23:1" },
  { verse: "Tudo posso naquele que me fortalece.", reference: "Filipenses 4:13" },
  { verse: "Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento.", reference: "Provérbios 3:5" },
  { verse: "Mas os que esperam no Senhor renovarão as suas forças; subirão com asas como águias.", reference: "Isaías 40:31" },
  { verse: "Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus.", reference: "Isaías 41:10" },
  { verse: "Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.", reference: "Mateus 11:28" },
  { verse: "Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz e não de mal, para vos dar o fim que esperais.", reference: "Jeremias 29:11" },
  { verse: "E conhecereis a verdade, e a verdade vos libertará.", reference: "João 8:32" },
  { verse: "Alegrai-vos sempre no Senhor; outra vez digo: alegrai-vos!", reference: "Filipenses 4:4" },
  { verse: "O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha.", reference: "1 Coríntios 13:4" },
  { verse: "Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará.", reference: "Salmos 37:5" },
  { verse: "Eu sou o caminho, a verdade e a vida. Ninguém vem ao Pai senão por mim.", reference: "João 14:6" },
  { verse: "Buscai primeiro o Reino de Deus e a sua justiça, e todas essas coisas vos serão acrescentadas.", reference: "Mateus 6:33" },
  { verse: "Porque onde estiver o vosso tesouro, aí estará também o vosso coração.", reference: "Mateus 6:21" },
  { verse: "Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia.", reference: "Salmos 46:1" },
  { verse: "O Senhor é bom, ele é um refúgio em tempos de angústia. Ele protege os que nele confiam.", reference: "Naum 1:7" },
  { verse: "Lâmpada para os meus pés é a tua palavra, e luz para o meu caminho.", reference: "Salmos 119:105" },
  { verse: "E a paz de Deus, que excede todo o entendimento, guardará os vossos corações e os vossos pensamentos em Cristo Jesus.", reference: "Filipenses 4:7" },
  { verse: "Se Deus é por nós, quem será contra nós?", reference: "Romanos 8:31" },
  { verse: "Pela graça sois salvos, por meio da fé; e isto não vem de vós; é dom de Deus.", reference: "Efésios 2:8" },
  { verse: "Sede fortes e corajosos. Não temais, nem vos assusteis diante deles, porque o Senhor, o vosso Deus, é quem vai convosco.", reference: "Deuteronômio 31:6" },
  { verse: "Delécia-te também no Senhor, e ele te concederá o que deseja o teu coração.", reference: "Salmos 37:4" },
  { verse: "Aquele que habita no esconderijo do Altíssimo, à sombra do Onipotente descansará.", reference: "Salmos 91:1" },
  { verse: "De sorte que as coisas velhas já passaram; eis que tudo se fez novo.", reference: "2 Coríntios 5:17" },
  { verse: "Mas, a todos quantos o receberam, deu-lhes o poder de serem feitos filhos de Deus.", reference: "João 1:12" },
  { verse: "Pedi, e dar-se-vos-á; buscai, e encontrareis; batei, e abrir-se-vos-á.", reference: "Mateus 7:7" },
  { verse: "O Senhor te abençoe e te guarde; o Senhor faça resplandecer o seu rosto sobre ti e tenha misericórdia de ti.", reference: "Números 6:24-25" },
  { verse: "Sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus.", reference: "Romanos 8:28" },
  { verse: "Porque o salário do pecado é a morte, mas o dom gratuito de Deus é a vida eterna em Cristo Jesus.", reference: "Romanos 6:23" },
  { verse: "Clama a mim, e responder-te-ei e anunciar-te-ei coisas grandes e ocultas, que não sabes.", reference: "Jeremias 33:3" },
];

function getDailyVerse() {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return DAILY_VERSES[dayOfYear % DAILY_VERSES.length];
}

const DailyGospel = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const { totalXp } = useXp();
  const [generating, setGenerating] = useState(false);
  const [verse, setVerse] = useState(getDailyVerse());

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

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

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-gospel-image", {
        body: {
          verse: verse.verse,
          reference: verse.reference,
          userName: user.email?.split("@")[0] ?? "Fiel",
          userLevel: level.name,
          userEmoji: level.emoji,
        },
      });

      if (error) throw error;

      const shareText = `✦ Evangelho do Dia ✦\n\n"${verse.verse}"\n— ${verse.reference}\n\n🙏 Junte-se a nós no Fé Conectada:\n${referralLink}`;

      if (navigator.share && data?.imageUrl) {
        try {
          const response = await fetch(data.imageUrl);
          const blob = await response.blob();
          const file = new File([blob], "evangelho-do-dia.png", { type: "image/png" });

          await navigator.share({
            title: "Evangelho do Dia - Fé Conectada",
            text: shareText,
            files: [file],
          });
          toast.success("Compartilhado com sucesso! ✨");
        } catch (shareErr) {
          // User cancelled or share not supported with files, fallback to text
          await navigator.clipboard.writeText(shareText);
          toast.success("Texto copiado! Cole no WhatsApp ou redes sociais 📋");
        }
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success("Texto copiado! Cole no WhatsApp ou redes sociais 📋");
      }
    } catch (err) {
      console.error("Share error:", err);
      // Fallback: share text only
      const shareText = `✦ Evangelho do Dia ✦\n\n"${verse.verse}"\n— ${verse.reference}\n\n🙏 Junte-se a nós no Fé Conectada:\n${referralLink}`;
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

  const handleRandomVerse = () => {
    const randomIdx = Math.floor(Math.random() * DAILY_VERSES.length);
    setVerse(DAILY_VERSES[randomIdx]);
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
            <p className="text-sm text-muted-foreground">Alimente sua fé diariamente</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-8 soft-shadow border-primary/15 text-center space-y-6">
              <div className="w-14 h-14 mx-auto gradient-divine rounded-full flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-primary-foreground" />
              </div>

              <motion.blockquote
                key={verse.reference}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-lg leading-relaxed text-foreground italic font-serif"
              >
                "{verse.verse}"
              </motion.blockquote>

              <p className="text-sm font-semibold text-primary">— {verse.reference}</p>

              <div className="divider-gold" />

              <div className="flex flex-col gap-3">
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

                <Button
                  onClick={handleRandomVerse}
                  variant="outline"
                  className="w-full border-primary/20 hover:bg-primary/5"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Outra Passagem
                </Button>
              </div>

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
        </div>
      </div>
    </PageTransition>
  );
};

export default DailyGospel;
