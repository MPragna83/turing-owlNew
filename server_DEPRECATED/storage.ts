import { 
  type Scan, type InsertScan,
  type Vulnerability, type InsertVulnerability,
  type CodeMetadata, type InsertCodeMetadata,
  type SecurityRule, type InsertSecurityRule,
  scans, vulnerabilities, codeMetadata, securityRules
} from "../shared/schema.ts";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import { eq, desc } from "drizzle-orm";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);

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

export class DbStorage implements IStorage {
  async createScan(scan: InsertScan): Promise<Scan> {
    const [newScan] = await db.insert(scans).values(scan).returning();
    return newScan;
  }

  async getScan(id: number): Promise<Scan | undefined> {
    const [scan] = await db.select().from(scans).where(eq(scans.id, id));
    return scan;
  }

  async updateScan(id: number, updates: Partial<InsertScan>): Promise<Scan | undefined> {
    const [updated] = await db.update(scans)
      .set(updates)
      .where(eq(scans.id, id))
      .returning();
    return updated;
  }

  async getAllScans(): Promise<Scan[]> {
    return db.select().from(scans).orderBy(desc(scans.startedAt));
  }

  async createVulnerability(vulnerability: InsertVulnerability): Promise<Vulnerability> {
    const [newVuln] = await db.insert(vulnerabilities).values(vulnerability).returning();
    return newVuln;
  }

  async getVulnerabilitiesByScan(scanId: number): Promise<Vulnerability[]> {
    return db.select().from(vulnerabilities).where(eq(vulnerabilities.scanId, scanId));
  }

  async createCodeMetadata(metadata: InsertCodeMetadata): Promise<CodeMetadata> {
    const [newMetadata] = await db.insert(codeMetadata).values(metadata).returning();
    return newMetadata;
  }

  async getCodeMetadataByScan(scanId: number): Promise<CodeMetadata[]> {
    return db.select().from(codeMetadata).where(eq(codeMetadata.scanId, scanId));
  }

  async createSecurityRule(rule: InsertSecurityRule): Promise<SecurityRule> {
    const [newRule] = await db.insert(securityRules).values(rule).returning();
    return newRule;
  }

  async getAllSecurityRules(): Promise<SecurityRule[]> {
    return db.select().from(securityRules);
  }

  async getEnabledSecurityRules(): Promise<SecurityRule[]> {
    return db.select().from(securityRules).where(eq(securityRules.enabled, true));
  }
}

export const storage = new DbStorage();
