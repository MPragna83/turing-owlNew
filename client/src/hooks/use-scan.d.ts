interface ScanProgress {
    scanId: number;
    status: string;
    currentAgent: string;
    progress: number;
    message: string;
}
export declare function useScan(): {
    startScan: import("@tanstack/react-query").UseMutationResult<any, Error, string, unknown>;
    progress: ScanProgress | null;
};
export declare function useVulnerabilities(scanId: number | null): import("@tanstack/react-query").UseQueryResult<any, Error>;
export declare function useScanDetails(scanId: number | null): import("@tanstack/react-query").UseQueryResult<any, Error>;
export {};
//# sourceMappingURL=use-scan.d.ts.map