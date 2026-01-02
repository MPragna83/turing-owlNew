import ts from "typescript";
import { SecurityRule } from "../rule-engine";

export const SQLInjectionRule: SecurityRule = {
  id: "sql-injection",
  description: "SQL Injection via string concatenation",
  cwe: "CWE-89",
  severity: "critical",

  match(sourceFile) {
    const matches = [];

    const visit = (node: ts.Node) => {
      if (
        ts.isTemplateExpression(node) ||
        (ts.isBinaryExpression(node) &&
          node.operatorToken.kind === ts.SyntaxKind.PlusToken)
      ) {
        const text = node.getText(sourceFile);

        if (
          /SELECT|INSERT|UPDATE|DELETE/i.test(text) &&
          /req\.(body|query|params)/.test(text)
        ) {
          matches.push({
            node,
            message:
              "User-controlled input is directly embedded into an SQL query",
          });
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return matches;
  },
};
