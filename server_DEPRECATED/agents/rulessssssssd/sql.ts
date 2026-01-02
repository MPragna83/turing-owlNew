import * as ts from "typescript";
import { SecurityRule } from "./types.js";

export const sqlInjectionRule: SecurityRule = {
  id: "sql-injection",
  name: "SQL Injection",
  cwe: "CWE-89",
  severity: "critical",
  confidence: 95,

  match(ast) {
    const matches = [];

    function visit(node: ts.Node) {
      if (
        ts.isTemplateExpression(node) &&
        node.getText().toLowerCase().includes("select")
      ) {
        matches.push({
          node,
          message: "SQL query constructed using template literals"
        });
      }
      ts.forEachChild(node, visit);
    }

    visit(ast);
    return matches;
  }
};
