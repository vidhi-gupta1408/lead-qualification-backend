import OpenAI from "openai";
import type { Lead, Offer } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.API_KEY || "default_key" 
});

export interface AiAnalysis {
  intent: "High" | "Medium" | "Low";
  reasoning: string;
  score: number; // 10, 30, or 50 based on intent
}

export async function analyzeLeadIntent(lead: Lead, offer: Offer): Promise<AiAnalysis> {
  try {
    const prompt = `You are an expert lead qualification analyst. Analyze this prospect against the product/offer and classify their buying intent.

PRODUCT/OFFER:
Name: ${offer.name}
Value Propositions: ${offer.value_props.join(", ")}
Ideal Use Cases: ${offer.ideal_use_cases.join(", ")}

PROSPECT:
Name: ${lead.name}
Role: ${lead.role}
Company: ${lead.company}
Industry: ${lead.industry}
Location: ${lead.location}
LinkedIn Bio: ${lead.linkedin_bio}

Classify their intent as High, Medium, or Low and provide 1-2 sentences explaining your reasoning.

Respond with JSON in this exact format:
{
  "intent": "High|Medium|Low",
  "reasoning": "Your 1-2 sentence explanation here"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a lead qualification expert. Analyze prospects and classify their buying intent based on role, company fit, and context. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate and normalize the response
    const intent = ["High", "Medium", "Low"].includes(result.intent) 
      ? result.intent as "High" | "Medium" | "Low"
      : "Low";
    
    const score = intent === "High" ? 50 : intent === "Medium" ? 30 : 10;
    
    return {
      intent,
      reasoning: result.reasoning || "AI analysis completed",
      score
    };
  } catch (error) {
    console.error("OpenAI analysis failed:", error);
    // Fallback to Low intent if AI fails
    return {
      intent: "Low",
      reasoning: "AI analysis unavailable - defaulting to low intent",
      score: 10
    };
  }
}
