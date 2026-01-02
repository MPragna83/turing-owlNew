import { storage } from "./storage.js";
import { CodeParsingAgent } from "./agents/parser.js";
import { RuleEngineAgent } from "./agents/rule-engine.js";
import { ReasoningAgent } from "./agents/reasoning.js";
import { ReportingAgent } from "./agents/reporting.js";
import type {
  InsertScan,
  InsertVulnerability,
  InsertCodeMetadata,
} from "../shared/schema.js";

export interface ScanProgress {
  scanId: number;
  status: string;
  currentAgent: string;
  progress: number;
  message: string;
}

export class ScanOrchestrator {
  private parsingAgent = new CodeParsingAgent();
  private ruleEngineAgent = new RuleEngineAgent();
  private reasoningAgent = new ReasoningAgent();
  private reportingAgent = new ReportingAgent();

  async executeScan(
    repositoryUrl: string,
    onProgress?: (progress: ScanProgress) => void
  ): Promise<number> {
    const scan: InsertScan = {
      repositoryUrl,
      status: "running",
      metadata: { startTime: new Date().toISOString() },
    };

    const created = await storage.createScan(scan);
    const scanId = created.id;

    this.runScanAsync(scanId, repositoryUrl, onProgress).catch(async (err) => {
      console.error(`Scan ${scanId} failed`, err);
      await storage.updateScan(scanId, {
        status: "failed",
        metadata: { error: err.message },
      });
    });

    return scanId;
  }

  private async runScanAsync(
    scanId: number,
    repositoryUrl: string,
    onProgress?: (progress: ScanProgress) => void
  ) {
    onProgress?.({
      scanId,
      status: "running",
      currentAgent: "Parser",
      progress: 20,
      message: "Parsing repository source code",
    });

    const parsedFiles = await this.parsingAgent.parseRepository(repositoryUrl);

    for (const file of parsedFiles) {
      const meta: InsertCodeMetadata = {
        scanId,
        filePath: file.filePath,
        ast: file.ast,
      };
      await storage.createCodeMetadata(meta);
    }

    onProgress?.({
      scanId,
      status: "running",
      currentAgent: "Rule Engine",
      progress: 50,
      message: "Detecting vulnerabilities",
    });

    const detected = await this.ruleEngineAgent.analyzeCode(parsedFiles);

    onProgress?.({
      scanId,
      status: "running",
      currentAgent: "Reasoning",
      progress: 70,
      message: "Validating vulnerabilities with AI",
    });

    const validated =
      await this.reasoningAgent.validateAndGenerateFixes(detected);

    for (const v of validated) {
      const record: InsertVulnerability = {
        scanId,
        title: v.title,
        severity: v.severity,
        cwe: v.cwe,
        file: v.file,
        line: v.line,
        description: v.description,
        codeSnippet: v.codeSnippet,
        suggestedFix: v.suggestedFix,
        confidence: v.confidence,
        validated: v.validated,
      };

      await storage.createVulnerability(record);
    }

    onProgress?.({
      scanId,
      status: "running",
      currentAgent: "Reporting",
      progress: 90,
      message: "Generating reports",
    });

    const sarif = this.reportingAgent.generateSARIF(validated);
    const summary =
      this.reportingAgent.generateDashboardSummary(validated);

    await storage.updateScan(scanId, {
      status: "completed",
      completedAt: new Date(),
      metadata: {
        sarif,
        summary,
        completedTime: new Date().toISOString(),
      },
    });

    onProgress?.({
      scanId,
      status: "completed",
      currentAgent: "Reporting",
      progress: 100,
      message: "Scan completed successfully",
    });
  }
}
