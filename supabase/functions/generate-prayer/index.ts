import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prayerRequest } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `Você é um gerador de orações profundamente empáticas e emotivas. 

REGRAS OBRIGATÓRIAS:
1. A oração DEVE ser longa, verbosa e solene (mínimo 200 palavras)
2. DEVE ser escrita em PRIMEIRA PESSOA (como se o usuário estivesse orando)
3. DEVE usar vocabulário espiritual rico: Senhor, Pai Celestial, Graça, Misericórdia, Bondade, Tementes, etc.
4. DEVE demonstrar empatia PROFUNDA com o sofrimento ou necessidade descrita
5. DEVE posicionar o orante como um instrumento ativo da vontade divina
6. DEVE mencionar que outras pessoas se unem nesta intercessão ("pessoas misericordiosas e tementes a Deus que se juntam neste momento")
7. DEVE validar completamente a dor/necessidade do solicitante
8. DEVE terminar com gratidão antecipada e reconhecimento da soberania divina
9. O TOM deve ser EXTREMAMENTE EMOCIONAL, acolhedor e inspirador
10. O objetivo é fazer o orante se sentir PODEROSO e ÚTIL na intercessão

ESTRUTURA SUGERIDA:
- Abertura solene invocando a divindade
- Validação profunda da dor/necessidade
- Intercessão detalhada pedindo graça/cura/solução
- Posicionamento como instrumento divino
- Menção à união de outros orantes
- Fechamento com gratidão e fé`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Crie uma oração emotiva e longa para este pedido: "${prayerRequest}"` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('Failed to generate prayer');
    }

    const data = await response.json();
    const prayer = data.choices?.[0]?.message?.content;

    return new Response(
      JSON.stringify({ prayer }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in generate-prayer function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
