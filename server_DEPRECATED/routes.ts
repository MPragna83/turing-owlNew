import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.ts";
import { ScanOrchestrator } from "./orchestrator.ts";
import { insertScanSchema } from "../shared/schema.ts";
import { WebSocketServer } from "ws";

const orchestrator = new ScanOrchestrator();

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const wss = new WebSocketServer({ server: httpServer, path: "/api/scan/ws" });

  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");

    ws.on("close", () => {
      console.log("WebSocket client disconnected");
    });
  });

  app.post("/api/scan/start", async (req, res) => {
    try {
      const body = insertScanSchema.parse(req.body);
      
      const scanId = await orchestrator.executeScan(
        body.repositoryUrl,
        (progress) => {
          wss.clients.forEach(client => {
            if (client.readyState === 1) {
              client.send(JSON.stringify(progress));
            }
          });
        }
      );

      res.json({ scanId, status: "started" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/scan/:id", async (req, res) => {
    try {
      const scanId = parseInt(req.params.id);
      const scan = await storage.getScan(scanId);

      if (!scan) {
        return res.status(404).json({ error: "Scan not found" });
      }

      res.json(scan);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/scan/:id/vulnerabilities", async (req, res) => {
    try {
      const scanId = parseInt(req.params.id);
      const vulnerabilities = await storage.getVulnerabilitiesByScan(scanId);

      res.json(vulnerabilities);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/scans", async (req, res) => {
    try {
      const scans = await storage.getAllScans();
      res.json(scans);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/rules", async (req, res) => {
    try {
      const rules = await storage.getEnabledSecurityRules();
      res.json(rules);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
