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

    const systemPrompt = `Você é um gerador de orações empáticas e acessíveis para todas as pessoas. 

REGRAS OBRIGATÓRIAS:
1. A oração DEVE ter no MÁXIMO 250 palavras
2. DEVE usar linguagem SIMPLES e ACESSÍVEL - palavras fáceis que qualquer pessoa entenda
3. DEVE ser escrita em PRIMEIRA PESSOA, mas como INTERCESSÃO por outra pessoa
4. NUNCA assuma parentesco com a pessoa do pedido (não use "minha filha", "meu pai", etc.)
5. Use "essa pessoa", "ele/ela", "essa família", "esse irmão/irmã" para se referir a quem precisa
6. DEVE demonstrar empatia profunda mas com palavras simples
7. DEVE mencionar que outras pessoas também estão orando junto
8. Evite palavras muito formais ou difíceis
9. O TOM deve ser ACOLHEDOR, SINCERO e CARINHOSO
10. Deve fazer a pessoa se sentir útil e conectada na oração

ESTRUTURA SUGERIDA:
- Abertura simples chamando Deus/Senhor/Pai
- Reconhecer a situação da pessoa que precisa (sem parentesco)
- Pedir ajuda, cura ou solução com palavras do coração
- Mencionar que não está orando sozinho
- Fechar com fé e esperança

EXEMPLO DE COMO ESCREVER:
❌ ERRADO: "Senhor, rogo pelo sofrimento de minha pequena, de minha amada filha"
✅ CORRETO: "Senhor, peço por essa criança que está sofrendo, pela família dela"

❌ ERRADO: "Imploro Vossa infinita misericórdia para restaurar a saúde de meu progenitor"
✅ CORRETO: "Peço com todo meu coração que o Senhor cure essa pessoa e dê força pra família"`;


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
          { role: 'user', content: `Crie uma oração simples e acessível (máximo 250 palavras) para este pedido: "${prayerRequest}"` }
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
