import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { insertOfferSchema, csvLeadSchema } from "@shared/schema";
import { scoreLead } from "./services/scoring";
import { z } from "zod";

// Set up multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // POST /api/offer - Accept product/offer details
  app.post("/api/offer", async (req, res) => {
    try {
      // Parse value_props and ideal_use_cases from strings to arrays
      const body = { ...req.body };
      if (typeof body.value_props === 'string') {
        body.value_props = body.value_props.split('\n').map((s: string) => s.trim()).filter(Boolean);
      }
      if (typeof body.ideal_use_cases === 'string') {
        body.ideal_use_cases = body.ideal_use_cases.split('\n').map((s: string) => s.trim()).filter(Boolean);
      }

      const validatedData = insertOfferSchema.parse(body);
      const offer = await storage.createOffer(validatedData);
      
      res.json({ 
        success: true, 
        message: "Offer created successfully",
        data: offer 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: "Validation error", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: "Internal server error" 
        });
      }
    }
  });

  // POST /api/leads/upload - Accept CSV file with leads
  app.post("/api/leads/upload", upload.single('csvFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: "No CSV file provided" 
        });
      }

      const csvContent = req.file.buffer.toString('utf-8');
      const lines = csvContent.split('\n').map(line => line.trim()).filter(Boolean);
      
      if (lines.length < 2) {
        return res.status(400).json({ 
          success: false, 
          message: "CSV must contain header and at least one data row" 
        });
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const expectedHeaders = ['name', 'role', 'company', 'industry', 'location', 'linkedin_bio'];
      
      if (!expectedHeaders.every(header => headers.includes(header))) {
        return res.status(400).json({ 
          success: false, 
          message: `CSV must contain columns: ${expectedHeaders.join(', ')}` 
        });
      }

      // Clear existing leads
      await storage.clearLeads();
      await storage.clearScoredLeads();

      // Parse CSV data
      const leads = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        
        if (values.length !== headers.length) continue;
        
        const leadData: any = {};
        headers.forEach((header, index) => {
          leadData[header] = values[index];
        });

        try {
          const validatedLead = csvLeadSchema.parse(leadData);
          leads.push(validatedLead);
        } catch (validationError) {
          // Skip invalid rows but continue processing
          console.warn(`Skipping invalid row ${i + 1}:`, validationError);
        }
      }

      if (leads.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: "No valid leads found in CSV" 
        });
      }

      const createdLeads = await storage.createLeads(leads);
      
      res.json({ 
        success: true, 
        message: `Successfully uploaded ${createdLeads.length} leads`,
        data: { count: createdLeads.length } 
      });
    } catch (error) {
      console.error("CSV upload error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error processing CSV file" 
      });
    }
  });

  // POST /api/score - Run scoring pipeline on uploaded leads
  app.post("/api/score", async (req, res) => {
    try {
      const leads = await storage.getLeads();
      const offer = await storage.getLatestOffer();

      if (!offer) {
        return res.status(400).json({ 
          success: false, 
          message: "No product/offer found. Please create an offer first." 
        });
      }

      if (leads.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: "No leads found. Please upload leads first." 
        });
      }

      // Clear existing scored leads
      await storage.clearScoredLeads();

      // Score all leads
      const scoringPromises = leads.map(async (lead) => {
        const scoringResult = await scoreLead(lead, offer);
        
        return storage.createScoredLead({
          leadId: lead.id,
          offerId: offer.id,
          intent: scoringResult.intent,
          score: scoringResult.totalScore,
          ruleScore: scoringResult.ruleScore,
          aiScore: scoringResult.aiScore,
          reasoning: scoringResult.reasoning
        });
      });

      const scoredLeads = await Promise.all(scoringPromises);

      res.json({ 
        success: true, 
        message: `Successfully scored ${scoredLeads.length} leads`,
        data: { count: scoredLeads.length } 
      });
    } catch (error) {
      console.error("Scoring error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error during lead scoring" 
      });
    }
  });

  // GET /api/results - Return scored leads
  app.get("/api/results", async (req, res) => {
    try {
      const results = await storage.getScoredResults();
      
      res.json({ 
        success: true, 
        data: results 
      });
    } catch (error) {
      console.error("Results error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error fetching results" 
      });
    }
  });

  // GET /api/results/csv - Export results as CSV
  app.get("/api/results/csv", async (req, res) => {
    try {
      const results = await storage.getScoredResults();
      
      if (results.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: "No results available for export" 
        });
      }

      // Generate CSV content
      const csvHeaders = ['Name', 'Role', 'Company', 'Industry', 'Location', 'Intent', 'Score', 'Reasoning'];
      const csvRows = results.map(result => [
        result.name,
        result.role,
        result.company,
        result.industry,
        result.location,
        result.intent,
        result.score.toString(),
        `"${result.reasoning.replace(/"/g, '""')}"` // Escape quotes in reasoning
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="lead_scores.csv"');
      res.send(csvContent);
    } catch (error) {
      console.error("CSV export error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error exporting CSV" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
