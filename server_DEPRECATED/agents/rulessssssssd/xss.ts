import ts from "typescript";
import type { SecurityRule, RuleMatch } from "../rule-engine.ts";

export const ReflectedXSSRule: SecurityRule = {
  id: "reflected-xss",
  name: "Reflected XSS",
  cwe: "CWE-79",
  severity: "medium",

  match(sourceFile) {
    const matches: RuleMatch[] = [];

    const visit = (node: ts.Node) => {
      if (ts.isCallExpression(node)) {
        const text = node.getText(sourceFile);
        if (
          text.includes("res.send") &&
          /req\.(query|body|params)/.test(text)
        ) {
          matches.push({
            node,
            message: "Unescaped user input reflected in response",
          });
        }
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return matches;
  },
};
