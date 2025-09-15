import { 
  type Offer, 
  type InsertOffer,
  type Lead,
  type InsertLead,
  type ScoredLead,
  type InsertScoredLead,
  type ScoredLeadResult
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Offers
  createOffer(offer: InsertOffer): Promise<Offer>;
  getLatestOffer(): Promise<Offer | undefined>;
  
  // Leads
  createLead(lead: InsertLead): Promise<Lead>;
  createLeads(leads: InsertLead[]): Promise<Lead[]>;
  getLeads(): Promise<Lead[]>;
  clearLeads(): Promise<void>;
  
  // Scored Leads
  createScoredLead(scoredLead: InsertScoredLead): Promise<ScoredLead>;
  getScoredResults(): Promise<ScoredLeadResult[]>;
  clearScoredLeads(): Promise<void>;
}

export class MemStorage implements IStorage {
  private offers: Map<string, Offer>;
  private leads: Map<string, Lead>;
  private scoredLeads: Map<string, ScoredLead>;

  constructor() {
    this.offers = new Map();
    this.leads = new Map();
    this.scoredLeads = new Map();
  }

  // Offers
  async createOffer(insertOffer: InsertOffer): Promise<Offer> {
    const id = randomUUID();
    const offer: Offer = { 
      ...insertOffer, 
      id,
      createdAt: new Date()
    };
    this.offers.set(id, offer);
    return offer;
  }

  async getLatestOffer(): Promise<Offer | undefined> {
    const offersArray = Array.from(this.offers.values());
    if (offersArray.length === 0) return undefined;
    
    return offersArray.reduce((latest, current) => 
      (current.createdAt && latest.createdAt && current.createdAt > latest.createdAt) ? current : latest
    );
  }

  // Leads
  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = randomUUID();
    const lead: Lead = { 
      ...insertLead, 
      id,
      createdAt: new Date()
    };
    this.leads.set(id, lead);
    return lead;
  }

  async createLeads(insertLeads: InsertLead[]): Promise<Lead[]> {
    const leads = insertLeads.map(insertLead => {
      const id = randomUUID();
      const lead: Lead = { 
        ...insertLead, 
        id,
        createdAt: new Date()
      };
      this.leads.set(id, lead);
      return lead;
    });
    return leads;
  }

  async getLeads(): Promise<Lead[]> {
    return Array.from(this.leads.values());
  }

  async clearLeads(): Promise<void> {
    this.leads.clear();
  }

  // Scored Leads
  async createScoredLead(insertScoredLead: InsertScoredLead): Promise<ScoredLead> {
    const id = randomUUID();
    const scoredLead: ScoredLead = { 
      ...insertScoredLead, 
      id,
      createdAt: new Date()
    };
    this.scoredLeads.set(id, scoredLead);
    return scoredLead;
  }

  async getScoredResults(): Promise<ScoredLeadResult[]> {
    const scoredLeadsArray = Array.from(this.scoredLeads.values());
    const results: ScoredLeadResult[] = [];

    for (const scoredLead of scoredLeadsArray) {
      const lead = this.leads.get(scoredLead.leadId);
      if (lead) {
        results.push({
          id: scoredLead.id,
          name: lead.name,
          role: lead.role,
          company: lead.company,
          industry: lead.industry,
          location: lead.location,
          intent: scoredLead.intent,
          score: scoredLead.score,
          reasoning: scoredLead.reasoning,
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  async clearScoredLeads(): Promise<void> {
    this.scoredLeads.clear();
  }
}

export const storage = new MemStorage();
