import type { ParsedFile } from "./parser.js";

/* ================= TYPES ================= */

export type Severity = "critical" | "high" | "medium" | "low";

export interface DetectedVulnerability {
  title: string;
  severity: Severity;
  cwe: string;
  file: string;
  line: number;
  description: string;
  codeSnippet: string;
  confidence: number;
}

/* ================= AGENT ================= */

export class RuleEngineAgent {
  analyzeCode(files: ParsedFile[]): DetectedVulnerability[] {
    const results: DetectedVulnerability[] = [];

    for (const file of files) {
      results.push(...this.sqlInjection(file));
      results.push(...this.xss(file));
      results.push(...this.secrets(file));
    }

    return results;
  }

  /* ---------- SQLi ---------- */

  private sqlInjection(file: ParsedFile): DetectedVulnerability[] {
    return file.calls
      .filter(
        c =>
          (c.callee.includes("query") || c.callee.includes("execute")) &&
          c.arguments.some(a =>
            a.includes("req.body") ||
            a.includes("req.query") ||
            a.includes("req.params")
          )
      )
      .map(c => ({
        title: "SQL Injection",
        severity: "critical",
        cwe: "CWE-89",
        file: file.filePath,
        line: c.line,
        description: "User input flows directly into database query",
        codeSnippet: `${c.callee}(${c.arguments.join(", ")})`,
        confidence: 95,
      }));
  }

  /* ---------- XSS ---------- */

  private xss(file: ParsedFile): DetectedVulnerability[] {
    return file.calls
      .filter(
        c =>
          c.callee.includes("res.send") &&
          c.arguments.some(a =>
            a.includes("req.body") ||
            a.includes("req.query") ||
            a.includes("req.params")
          )
      )
      .map(c => ({
        title: "Reflected XSS",
        severity: "medium",
        cwe: "CWE-79",
        file: file.filePath,
        line: c.line,
        description: "Unescaped user input reflected in response",
        codeSnippet: `${c.callee}(${c.arguments.join(", ")})`,
        confidence: 85,
      }));
  }

  /* ---------- SECRETS ---------- */

  private secrets(file: ParsedFile): DetectedVulnerability[] {
    return file.functions
      .filter(f => /(key|secret|token|password)/i.test(f.name))
      .map(f => ({
        title: "Possible Hardcoded Secret",
        severity: "high",
        cwe: "CWE-798",
        file: file.filePath,
        line: f.startLine,
        description: "Suspicious function name suggesting secret usage",
        codeSnippet: `function ${f.name}(...)`,
        confidence: 70,
      }));
  }
}
