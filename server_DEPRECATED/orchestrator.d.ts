export interface ScanProgress {
    scanId: number;
    status: string;
    currentAgent: string;
    progress: number;
    message: string;
}
export declare class ScanOrchestrator {
    private parsingAgent;
    private ruleEngineAgent;
    private reasoningAgent;
    private reportingAgent;
    constructor();
    executeScan(repositoryUrl: string, onProgress?: (progress: ScanProgress) => void): Promise<number>;
    private runScanAsync;
    private delay;
}
//# sourceMappingURL=orchestrator.d.ts.map