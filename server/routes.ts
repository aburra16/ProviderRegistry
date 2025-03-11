import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { providerFilterSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all providers (paginated)
  app.get("/api/providers", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sort = req.query.sort as string || "relevance";
      
      const result = await storage.getProviders({ page, limit, sort });
      res.json(result);
    } catch (error) {
      console.error("Error fetching providers:", error);
      res.status(500).json({ message: "Failed to fetch providers" });
    }
  });

  // Get a single provider by ID
  app.get("/api/providers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid provider ID" });
      }
      
      const provider = await storage.getProvider(id);
      
      if (!provider) {
        return res.status(404).json({ message: "Provider not found" });
      }
      
      res.json(provider);
    } catch (error) {
      console.error("Error fetching provider:", error);
      res.status(500).json({ message: "Failed to fetch provider" });
    }
  });

  // Search providers with filters
  app.post("/api/providers/filter", async (req, res) => {
    try {
      // Validate the filter parameters
      const filterResult = providerFilterSchema.safeParse(req.body);
      
      if (!filterResult.success) {
        return res.status(400).json({ 
          message: "Invalid filter parameters",
          errors: filterResult.error.errors 
        });
      }
      
      const result = await storage.searchProviders(filterResult.data);
      res.json(result);
    } catch (error) {
      console.error("Error searching providers:", error);
      res.status(500).json({ message: "Failed to search providers" });
    }
  });

  // Get all specialties
  app.get("/api/specialties", async (req, res) => {
    try {
      const specialties = await storage.getSpecialties();
      res.json(specialties);
    } catch (error) {
      console.error("Error fetching specialties:", error);
      res.status(500).json({ message: "Failed to fetch specialties" });
    }
  });

  // Get all insurance plans
  app.get("/api/insurance-plans", async (req, res) => {
    try {
      const insurancePlans = await storage.getInsurancePlans();
      res.json(insurancePlans);
    } catch (error) {
      console.error("Error fetching insurance plans:", error);
      res.status(500).json({ message: "Failed to fetch insurance plans" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
