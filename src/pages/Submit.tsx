import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Submit = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });
  }, [navigate]);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    location: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      toast.error("Por favor, descreva seu pedido de oração");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase
        .from('prayer_requests')
        .insert([
          {
            title: formData.title.trim() || null,
            content: formData.content.trim(),
            location: formData.location.trim() || null,
            prayer_count: 0,
            user_id: session?.user?.id
          }
        ]);

      if (error) throw error;

      toast.success("Seu pedido de oração foi enviado com sucesso!");
      setFormData({ title: "", content: "", location: "" });
      
      // Navigate to home after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error('Error submitting prayer request:', error);
      toast.error("Erro ao enviar pedido de oração");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent gradient-divine bg-gradient-to-r from-primary to-accent">
            Enviar Pedido de Oração
          </h1>
          <p className="text-lg text-muted-foreground">
            Compartilhe sua necessidade com a comunidade
          </p>
        </div>

        <Card className="max-w-2xl mx-auto p-8 soft-shadow">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-base">
                Título (Opcional)
              </Label>
              <Input
                id="title"
                placeholder="Ex: Cura para meu filho Miguel"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-2"
                maxLength={100}
              />
            </div>

            <div>
              <Label htmlFor="content" className="text-base">
                Seu Pedido de Oração *
              </Label>
              <Textarea
                id="content"
                placeholder="Descreva seu pedido de oração com detalhes..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="mt-2 min-h-[200px]"
                required
                maxLength={1000}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {formData.content.length}/1000 caracteres
              </p>
            </div>

            <div>
              <Label htmlFor="location" className="text-base">
                Localização (Opcional)
              </Label>
              <Input
                id="location"
                placeholder="Ex: São Paulo, SP"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="mt-2"
                maxLength={100}
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              size="lg"
              className="w-full gradient-divine text-white hover:opacity-90 celestial-glow"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? "Enviando..." : "Enviar Pedido"}
            </Button>
          </form>
        </Card>

        <div className="max-w-2xl mx-auto mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Seus pedidos serão compartilhados com a comunidade de oração.
            Mantenha o respeito e a fé em todas as mensagens.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Submit;
