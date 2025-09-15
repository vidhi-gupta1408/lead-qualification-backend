import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const offers = pgTable("offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  value_props: text("value_props").array().notNull(),
  ideal_use_cases: text("ideal_use_cases").array().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  role: text("role").notNull(),
  company: text("company").notNull(),
  industry: text("industry").notNull(),
  location: text("location").notNull(),
  linkedin_bio: text("linkedin_bio").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const scoredLeads = pgTable("scored_leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull(),
  offerId: varchar("offer_id").notNull(),
  intent: text("intent").notNull(), // High, Medium, Low
  score: integer("score").notNull(), // 0-100
  ruleScore: integer("rule_score").notNull(), // 0-50
  aiScore: integer("ai_score").notNull(), // 0-50
  reasoning: text("reasoning").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOfferSchema = createInsertSchema(offers).omit({
  id: true,
  createdAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

export const insertScoredLeadSchema = createInsertSchema(scoredLeads).omit({
  id: true,
  createdAt: true,
});

// CSV upload schema
export const csvLeadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  company: z.string().min(1, "Company is required"),
  industry: z.string().min(1, "Industry is required"),
  location: z.string().min(1, "Location is required"),
  linkedin_bio: z.string().min(1, "LinkedIn bio is required"),
});

export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type Offer = typeof offers.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertScoredLead = z.infer<typeof insertScoredLeadSchema>;
export type ScoredLead = typeof scoredLeads.$inferSelect;
export type CsvLead = z.infer<typeof csvLeadSchema>;

// Result type for API responses
export type ScoredLeadResult = {
  id: string;
  name: string;
  role: string;
  company: string;
  industry: string;
  location: string;
  intent: string;
  score: number;
  reasoning: string;
};
