import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, timestamp, jsonb, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const scans = pgTable("scans", {
  id: serial("id").primaryKey(),
  repositoryUrl: text("repository_url").notNull(),
  status: text("status").notNull().default("pending"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  metadata: jsonb("metadata"),
});

export const vulnerabilities = pgTable("vulnerabilities", {
  id: serial("id").primaryKey(),
  scanId: integer("scan_id").notNull().references(() => scans.id),
  title: text("title").notNull(),
  severity: text("severity").notNull(),
  cwe: text("cwe").notNull(),
  file: text("file").notNull(),
  line: integer("line").notNull(),
  description: text("description").notNull(),
  codeSnippet: text("code_snippet").notNull(),
  suggestedFix: text("suggested_fix"),
  confidence: integer("confidence").default(0),
  validated: boolean("validated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const codeMetadata = pgTable("code_metadata", {
  id: serial("id").primaryKey(),
  scanId: integer("scan_id").notNull().references(() => scans.id),
  filePath: text("file_path").notNull(),
  ast: jsonb("ast"),
  cfg: jsonb("cfg"),
  dfg: jsonb("dfg"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const securityRules = pgTable("security_rules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  cwe: text("cwe").notNull(),
  pattern: text("pattern").notNull(),
  severity: text("severity").notNull(),
  description: text("description").notNull(),
  enabled: boolean("enabled").default(true),
});

export const insertScanSchema = createInsertSchema(scans).omit({ id: true, startedAt: true });
export const insertVulnerabilitySchema = createInsertSchema(vulnerabilities).omit({ id: true, createdAt: true });
export const insertCodeMetadataSchema = createInsertSchema(codeMetadata).omit({ id: true, createdAt: true });
export const insertSecurityRuleSchema = createInsertSchema(securityRules).omit({ id: true });

export type InsertScan = z.infer<typeof insertScanSchema>;
export type Scan = typeof scans.$inferSelect;
export type InsertVulnerability = z.infer<typeof insertVulnerabilitySchema>;
export type Vulnerability = typeof vulnerabilities.$inferSelect;
export type InsertCodeMetadata = z.infer<typeof insertCodeMetadataSchema>;
export type CodeMetadata = typeof codeMetadata.$inferSelect;
export type InsertSecurityRule = z.infer<typeof insertSecurityRuleSchema>;
export type SecurityRule = typeof securityRules.$inferSelect;
