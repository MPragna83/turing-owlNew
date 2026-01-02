import { scans, vulnerabilities, codeMetadata, securityRules } from "@shared/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import { eq, desc } from "drizzle-orm";
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});
export const db = drizzle(pool);
export class DbStorage {
    async createScan(scan) {
        const [newScan] = await db.insert(scans).values(scan).returning();
        return newScan;
    }
    async getScan(id) {
        const [scan] = await db.select().from(scans).where(eq(scans.id, id));
        return scan;
    }
    async updateScan(id, updates) {
        const [updated] = await db.update(scans)
            .set(updates)
            .where(eq(scans.id, id))
            .returning();
        return updated;
    }
    async getAllScans() {
        return db.select().from(scans).orderBy(desc(scans.startedAt));
    }
    async createVulnerability(vulnerability) {
        const [newVuln] = await db.insert(vulnerabilities).values(vulnerability).returning();
        return newVuln;
    }
    async getVulnerabilitiesByScan(scanId) {
        return db.select().from(vulnerabilities).where(eq(vulnerabilities.scanId, scanId));
    }
    async createCodeMetadata(metadata) {
        const [newMetadata] = await db.insert(codeMetadata).values(metadata).returning();
        return newMetadata;
    }
    async getCodeMetadataByScan(scanId) {
        return db.select().from(codeMetadata).where(eq(codeMetadata.scanId, scanId));
    }
    async createSecurityRule(rule) {
        const [newRule] = await db.insert(securityRules).values(rule).returning();
        return newRule;
    }
    async getAllSecurityRules() {
        return db.select().from(securityRules);
    }
    async getEnabledSecurityRules() {
        return db.select().from(securityRules).where(eq(securityRules.enabled, true));
    }
}
export const storage = new DbStorage();
//# sourceMappingURL=storage.js.map