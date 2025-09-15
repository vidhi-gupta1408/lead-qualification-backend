import type { Lead, Offer } from "@shared/schema";
import { analyzeLeadIntent } from "./openai";

interface ScoringResult {
  ruleScore: number;
  aiScore: number;
  totalScore: number;
  intent: "High" | "Medium" | "Low";
  reasoning: string;
}

export async function scoreLead(lead: Lead, offer: Offer): Promise<ScoringResult> {
  // Rule-based scoring (max 50 points)
  let ruleScore = 0;
  const ruleReasons: string[] = [];

  // Role relevance scoring
  const decisionMakerRoles = [
    'ceo', 'cto', 'cfo', 'vp', 'vice president', 'director', 'head of', 'chief',
    'founder', 'owner', 'president', 'general manager', 'gm'
  ];
  
  const influencerRoles = [
    'manager', 'senior', 'lead', 'principal', 'architect', 'specialist', 
    'consultant', 'analyst', 'coordinator'
  ];

  const roleLower = lead.role.toLowerCase();
  
  if (decisionMakerRoles.some(role => roleLower.includes(role))) {
    ruleScore += 20;
    ruleReasons.push("Decision maker role (+20)");
  } else if (influencerRoles.some(role => roleLower.includes(role))) {
    ruleScore += 10;
    ruleReasons.push("Influencer role (+10)");
  }

  // Industry match scoring
  const industryLower = lead.industry.toLowerCase();
  const idealUseCasesText = offer.ideal_use_cases.join(' ').toLowerCase();
  
  // Check for exact matches
  if (offer.ideal_use_cases.some(useCase => 
    industryLower.includes(useCase.toLowerCase()) || 
    useCase.toLowerCase().includes(industryLower)
  )) {
    ruleScore += 20;
    ruleReasons.push("Exact industry match (+20)");
  } 
  // Check for adjacent industries
  else if (
    (industryLower.includes('saas') && idealUseCasesText.includes('saas')) ||
    (industryLower.includes('software') && idealUseCasesText.includes('software')) ||
    (industryLower.includes('tech') && idealUseCasesText.includes('tech')) ||
    (industryLower.includes('b2b') && idealUseCasesText.includes('b2b'))
  ) {
    ruleScore += 10;
    ruleReasons.push("Adjacent industry (+10)");
  }

  // Data completeness check
  if (lead.name && lead.role && lead.company && lead.industry && 
      lead.location && lead.linkedin_bio) {
    ruleScore += 10;
    ruleReasons.push("Complete data (+10)");
  }

  // AI analysis (max 50 points)
  const aiAnalysis = await analyzeLeadIntent(lead, offer);

  const totalScore = ruleScore + aiAnalysis.score;
  
  // Combine reasoning
  const combinedReasoning = [
    ruleReasons.length > 0 ? `Rules: ${ruleReasons.join(", ")}` : "",
    `AI: ${aiAnalysis.reasoning}`
  ].filter(Boolean).join(". ");

  return {
    ruleScore,
    aiScore: aiAnalysis.score,
    totalScore,
    intent: aiAnalysis.intent,
    reasoning: combinedReasoning
  };
}
