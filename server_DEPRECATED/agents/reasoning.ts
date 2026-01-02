import OpenAI from "openai";
import crypto from "crypto";
import type { DetectedVulnerability } from "./rule-engine";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ValidatedVulnerability extends DetectedVulnerability {
  validated: boolean;
  suggestedFix: string;
  explanation: string;
}

export class ReasoningAgent {
  private cache = new Map<string, ValidatedVulnerability>();

  async validateAndGenerateFixes(
    vulns: DetectedVulnerability[]
  ): Promise<ValidatedVulnerability[]> {
    if (vulns.length === 0) return [];

    // ---------- CACHE ----------
    const uncached: DetectedVulnerability[] = [];
    const results: ValidatedVulnerability[] = [];

    for (const v of vulns) {
      const key = this.hash(v);
      if (this.cache.has(key)) {
        results.push(this.cache.get(key)!);
      } else {
        uncached.push(v);
      }
    }

    if (uncached.length === 0) return results;

    // ---------- BATCH AI CALL ----------
    const aiResults = await this.processBatch(uncached);

    for (const r of aiResults) {
      this.cache.set(this.hash(r), r);
      results.push(r);
    }

    return results;
  }

  // ---------- CORE ----------
  private async processBatch(
    vulns: DetectedVulnerability[]
  ): Promise<ValidatedVulnerability[]> {
    const payload = vulns.map(v => ({
      id: this.hash(v),
      cwe: v.cwe,
      severity: v.severity,
      code: v.codeSnippet.slice(0, 500), // HARD TOKEN CAP
    }));

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a security validation engine. Respond ONLY in JSON. No prose.",
          },
          {
            role: "user",
            content: `
Validate the following vulnerabilities.
For each item return:
- validated (boolean)
- suggestedFix (short code snippet)
- explanation (1 sentence)

Input:
${JSON.stringify(payload)}
`,
          },
        ],
      });

      const parsed = JSON.parse(
        response.choices[0].message.content || "{}"
      );

      return vulns.map(v => {
        const id = this.hash(v);
        const ai = parsed[id];

        return {
          ...v,
          validated: ai?.validated ?? true,
          suggestedFix:
            ai?.suggestedFix ?? this.defaultFix(v.cwe),
          explanation:
            ai?.explanation ??
            "Rule-based vulnerability with standard mitigation.",
        };
      });
    } catch (err) {
      // ---------- HARD FALLBACK ----------
      console.error("AI batch failed, falling back:", err);

      return vulns.map(v => ({
        ...v,
        validated: true,
        suggestedFix: this.defaultFix(v.cwe),
        explanation:
          "AI unavailable. Classified using deterministic security rules.",
      }));
    }
  }

  // ---------- HELPERS ----------
  private hash(v: DetectedVulnerability): string {
    return crypto
      .createHash("sha1")
      .update(v.cwe + v.file + v.line + v.codeSnippet)
      .digest("hex");
  }

  private defaultFix(cwe: string): string {
    const fixes: Record<string, string> = {
      "CWE-89":
        "Use parameterized queries instead of string concatenation.",
      "CWE-79":
        "Escape or sanitize user input before rendering HTML.",
      "CWE-798":
        "Move secrets to environment variables or a secret manager.",
    };

    return fixes[cwe] || "Apply standard input validation and sanitization.";
  }
}

