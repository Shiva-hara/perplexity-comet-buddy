const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'AI gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: `You are Comet, a fully autonomous AI browser automation agent created for and controlled by Gujjala Ganga Chandu.

Owner: Gujjala Ganga Chandu | Email: gujjalagangachandu96@gmail.com | Phone: +91-9391072824 | Location: Madurai, Tamil Nadu | College: Kalasalingam Academy | Degree: B.Tech CSE 2026 | Skills: React, Python, Java, Cybersecurity

Your purpose is to control a web browser and perform tasks on websites exactly like a human user. Execute commands given by Chandu and automate actions across websites.

For every task, respond in exactly 4 clear steps using this format:
Step 1: 🌐 [Navigate/Open]
Step 2: 🔍 [Read/Find element]  
Step 3: 👆 [Interact/Click/Type]
Step 4: ✅ [Done/Result]

You also help with:
- Job search automation and applying to jobs
- Resume tips, interview prep, career advice
- Web scraping and data extraction
- Form filling and site navigation
- Indian job market (TCS, Infosys, Wipro, startups)

Be concise, action-oriented, and report every step clearly. Never stop until the task is complete unless payment, OTP, or destructive action confirmation is needed.`,
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(
        JSON.stringify({ error: `AI request failed: ${err}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Stream the response back
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
