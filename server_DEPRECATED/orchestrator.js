import { storage } from "./storage";
import { CodeParsingAgent } from "./agents/parser";
import { RuleEngineAgent } from "./agents/rule-engine";
import { ReasoningAgent } from "./agents/reasoning";
import { ReportingAgent } from "./agents/reporting";
import {} from "@shared/schema";
export class ScanOrchestrator {
    parsingAgent;
    ruleEngineAgent;
    reasoningAgent;
    reportingAgent;
    constructor() {
        this.parsingAgent = new CodeParsingAgent();
        this.ruleEngineAgent = new RuleEngineAgent();
        this.reasoningAgent = new ReasoningAgent();
        this.reportingAgent = new ReportingAgent();
    }
    async executeScan(repositoryUrl, onProgress) {
        const scanData = {
            repositoryUrl,
            status: "running",
            metadata: { startTime: new Date().toISOString() }
        };
        const scan = await storage.createScan(scanData);
        const scanId = scan.id;
        this.runScanAsync(scanId, repositoryUrl, onProgress).catch(error => {
            console.error(`Scan ${scanId} failed:`, error);
            storage.updateScan(scanId, {
                status: "failed",
                metadata: { error: error.message }
            });
        });
        return scanId;
    }
    async runScanAsync(scanId, repositoryUrl, onProgress) {
        try {
            onProgress?.({
                scanId,
                status: "running",
                currentAgent: "Parser",
                progress: 10,
                message: "Initializing Tree-sitter parser..."
            });
            await this.delay(500);
            onProgress?.({
                scanId,
                status: "running",
                currentAgent: "Parser",
                progress: 25,
                message: "Generating AST for source files..."
            });
            const parsedFiles = await this.parsingAgent.parseRepository(repositoryUrl);
            for (const file of parsedFiles) {
                const metadata = {
                    scanId,
                    filePath: file.filePath,
                    ast: file.ast,
                    cfg: file.cfg,
                    dfg: file.dfg
                };
                await storage.createCodeMetadata(metadata);
            }
            onProgress?.({
                scanId,
                status: "running",
                currentAgent: "Rule Engine",
                progress: 40,
                message: "Loading semantic security rules..."
            });
            await this.delay(1000);
            onProgress?.({
                scanId,
                status: "running",
                currentAgent: "Rule Engine",
                progress: 55,
                message: "Scanning for SQL Injection patterns..."
            });
            const detectedVulnerabilities = await this.ruleEngineAgent.analyzeCode(parsedFiles);
            onProgress?.({
                scanId,
                status: "running",
                currentAgent: "Reasoning",
                progress: 70,
                message: "Analyzing context with GPT-4o-mini..."
            });
            await this.delay(1500);
            const validatedVulnerabilities = await this.reasoningAgent.validateAndGenerateFixes(detectedVulnerabilities);
            for (const vuln of validatedVulnerabilities) {
                const vulnData = {
                    scanId,
                    title: vuln.title,
                    severity: vuln.severity,
                    cwe: vuln.cwe,
                    file: vuln.file,
                    line: vuln.line,
                    description: vuln.description,
                    codeSnippet: vuln.codeSnippet,
                    suggestedFix: vuln.suggestedFix,
                    confidence: vuln.confidence,
                    validated: vuln.validated
                };
                await storage.createVulnerability(vulnData);
            }
            onProgress?.({
                scanId,
                status: "running",
                currentAgent: "Reporting",
                progress: 90,
                message: "Compiling SARIF 2.1.0 report..."
            });
            await this.delay(1000);
            const sarif = this.reportingAgent.generateSARIF(validatedVulnerabilities);
            const summary = this.reportingAgent.generateDashboardSummary(validatedVulnerabilities);
            await storage.updateScan(scanId, {
                status: "completed",
                completedAt: new Date(),
                metadata: {
                    sarif,
                    summary,
                    completedTime: new Date().toISOString()
                }
            });
            onProgress?.({
                scanId,
                status: "completed",
                currentAgent: "Reporting",
                progress: 100,
                message: "Scan completed successfully"
            });
        }
        catch (error) {
            await storage.updateScan(scanId, {
                status: "failed",
                metadata: { error: error.message }
            });
            throw error;
        }
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
//# sourceMappingURL=orchestrator.js.map