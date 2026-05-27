import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Using Groq + Llama-3 to hallucinate/fetch recent news (Since we don't have Tavily integrated yet,
// we will simulate the web search by asking Llama-3 to act as a local news aggregator based on the current date)
async function fetchNewsForCategory(cityId: string, category: string, dateStr: string) {
  const prompt = `You are a highly accurate Hyper-Local News Aggregator for the city of ${cityId}, India.
Today is ${dateStr}. 
Provide EXACTLY ONE highly specific, realistic, and latest news headline and a 2-sentence description for the category: "${category}".
Format strictly as JSON:
{
  "headline": "...",
  "description": "..."
}
No other text. Ensure it sounds like a real utility or infrastructure update.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    const result = JSON.parse(chatCompletion.choices[0]?.message?.content || "{}");
    return result;
  } catch (e) {
    console.error("Error fetching news for category:", category, e);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const authHeader = request.headers.get('authorization');
    
    // Simple basic protection for Cron
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && url.hostname !== "localhost") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cityId = url.searchParams.get("city") || "raipur";
    const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });

    const categories = [
      "Municipal Corporation & Utility (Water, Electricity, Road repairs)",
      "Police & District Magistrate (Traffic alerts, section 144, announcements)",
      "Infrastructure & State Government (New bridges, schemes, development)"
    ];

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const results = [];
    for (const category of categories) {
      const news = await fetchNewsForCategory(cityId, category, dateStr);
      if (news && news.headline) {
        // Insert into supabase
        const { data, error } = await supabase.from('local_news_cache').insert({
          city_id: cityId,
          category: category,
          headline: news.headline,
          description: news.description,
          is_read: false
        }).select();

        if (error) {
           console.error("Supabase insert error:", error);
        } else {
           results.push(data[0]);
        }
      }
    }

    return NextResponse.json({ success: true, count: results.length, data: results });
  } catch (error) {
    console.error('[Fetch Local News] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
