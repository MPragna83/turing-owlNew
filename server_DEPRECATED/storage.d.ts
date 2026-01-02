import { type Scan, type InsertScan, type Vulnerability, type InsertVulnerability, type CodeMetadata, type InsertCodeMetadata, type SecurityRule, type InsertSecurityRule } from "@shared/schema";
import pkg from "pg";
export declare const db: import("drizzle-orm/node-postgres").NodePgDatabase<Record<string, never>> & {
    $client: pkg.Pool;
};
export interface IStorage {
    createScan(scan: InsertScan): Promise<Scan>;
    getScan(id: number): Promise<Scan | undefined>;
    updateScan(id: number, updates: Partial<InsertScan>): Promise<Scan | undefined>;
    getAllScans(): Promise<Scan[]>;
    createVulnerability(vulnerability: InsertVulnerability): Promise<Vulnerability>;
    getVulnerabilitiesByScan(scanId: number): Promise<Vulnerability[]>;
    createCodeMetadata(metadata: InsertCodeMetadata): Promise<CodeMetadata>;
    getCodeMetadataByScan(scanId: number): Promise<CodeMetadata[]>;
    createSecurityRule(rule: InsertSecurityRule): Promise<SecurityRule>;
    getAllSecurityRules(): Promise<SecurityRule[]>;
    getEnabledSecurityRules(): Promise<SecurityRule[]>;
}
export declare class DbStorage implements IStorage {
    createScan(scan: InsertScan): Promise<Scan>;
    getScan(id: number): Promise<Scan | undefined>;
    updateScan(id: number, updates: Partial<InsertScan>): Promise<Scan | undefined>;
    getAllScans(): Promise<Scan[]>;
    createVulnerability(vulnerability: InsertVulnerability): Promise<Vulnerability>;
    getVulnerabilitiesByScan(scanId: number): Promise<Vulnerability[]>;
    createCodeMetadata(metadata: InsertCodeMetadata): Promise<CodeMetadata>;
    getCodeMetadataByScan(scanId: number): Promise<CodeMetadata[]>;
    createSecurityRule(rule: InsertSecurityRule): Promise<SecurityRule>;
    getAllSecurityRules(): Promise<SecurityRule[]>;
    getEnabledSecurityRules(): Promise<SecurityRule[]>;
}
export declare const storage: DbStorage;
//# sourceMappingURL=storage.d.ts.map