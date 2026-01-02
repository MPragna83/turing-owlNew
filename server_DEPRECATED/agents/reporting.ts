import { type ValidatedVulnerability } from "./reasoning.ts";

export interface SARIFReport {
  version: string;
  $schema: string;
  runs: Array<{
    tool: {
      driver: {
        name: string;
        version: string;
        informationUri: string;
      };
    };
    results: Array<any>;
  }>;
}

export interface DashboardSummary {
  totalVulnerabilities: number;
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  byStatus: {
    validated: number;
    pending: number;
  };
  topCWEs: Array<{ cwe: string; count: number }>;
}

export class ReportingAgent {
  generateSARIF(vulnerabilities: ValidatedVulnerability[]): SARIFReport {
    return {
      version: "2.1.0",
      $schema: "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
      runs: [
        {
          tool: {
            driver: {
              name: "Agentic AI Security Scanner",
              version: "2.4.0",
              informationUri: "https://example.com/security-scanner"
            }
          },
          results: vulnerabilities.map(vuln => ({
            ruleId: vuln.cwe,
            level: this.getSARIFLevel(vuln.severity),
            message: {
              text: vuln.title
            },
            locations: [
              {
                physicalLocation: {
                  artifactLocation: {
                    uri: vuln.file
                  },
                  region: {
                    startLine: vuln.line
                  }
                }
              }
            ],
            fixes: vuln.suggestedFix ? [
              {
                description: {
                  text: "AI-generated secure fix"
                },
                artifactChanges: [
                  {
                    artifactLocation: {
                      uri: vuln.file
                    },
                    replacements: [
                      {
                        deletedRegion: {
                          startLine: vuln.line
                        },
                        insertedContent: {
                          text: vuln.suggestedFix
                        }
                      }
                    ]
                  }
                ]
              }
            ] : []
          }))
        }
      ]
    };
  }

  generateDashboardSummary(vulnerabilities: ValidatedVulnerability[]): DashboardSummary {
    const summary: DashboardSummary = {
      totalVulnerabilities: vulnerabilities.length,
      bySeverity: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      },
      byStatus: {
        validated: 0,
        pending: 0
      },
      topCWEs: []
    };

    const cweCount: Record<string, number> = {};

    for (const vuln of vulnerabilities) {
      summary.bySeverity[vuln.severity]++;
      
      if (vuln.validated) {
        summary.byStatus.validated++;
      } else {
        summary.byStatus.pending++;
      }

      cweCount[vuln.cwe] = (cweCount[vuln.cwe] || 0) + 1;
    }

    summary.topCWEs = Object.entries(cweCount)
      .map(([cwe, count]) => ({ cwe, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return summary;
  }

  private getSARIFLevel(severity: string): string {
    const mapping: Record<string, string> = {
      critical: "error",
      high: "error",
      medium: "warning",
      low: "note"
    };
    return mapping[severity] || "warning";
  }
}
