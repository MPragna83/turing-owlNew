import fs from "fs";
import path from "path";
import ts from "typescript";
import { simpleGit } from "simple-git";

export interface ParsedFile {
  filePath: string;
  language: "typescript" | "javascript";
  ast: {
    language: string;
    functions: number;
    calls: number;
  };
  functions: ParsedFunction[];
  calls: FunctionCall[];
  taintMarkers: TaintMarker[];
}

export interface ParsedFunction {
  name: string;
  parameters: string[];
  startLine: number;
}

export interface FunctionCall {
  callee: string;
  arguments: string[];
  line: number;
}

export interface TaintMarker {
  type: "source" | "sink";
  name: string;
  line: number;
}

export class CodeParsingAgent {
  private repoDir = path.join(process.cwd(), ".repos");
  private git = simpleGit();

  async parseRepository(repositoryUrl: string): Promise<ParsedFile[]> {
    const localPath = await this.cloneRepo(repositoryUrl);
    const files = this.collectSourceFiles(localPath);
    return files.map(file => this.parseFile(file));
  }

  private async cloneRepo(repoUrl: string): Promise<string> {
    const repoName = repoUrl.split("/").pop()!.replace(".git", "");
    const target = path.join(this.repoDir, repoName);

    if (!fs.existsSync(this.repoDir)) fs.mkdirSync(this.repoDir);

    if (!fs.existsSync(target)) {
      await this.git.clone(repoUrl, target);
    }

    return target;
  }

  private collectSourceFiles(dir: string): string[] {
    const results: string[] = [];

    const walk = (current: string) => {
      for (const item of fs.readdirSync(current)) {
        const full = path.join(current, item);
        if (fs.statSync(full).isDirectory()) {
          if (!["node_modules", ".git", "dist"].includes(item)) walk(full);
        } else if (full.endsWith(".ts") || full.endsWith(".js")) {
          results.push(full);
        }
      }
    };

    walk(dir);
    return results;
  }

  private parseFile(filePath: string): ParsedFile {
    const code = fs.readFileSync(filePath, "utf-8");

    const sourceFile = ts.createSourceFile(
      filePath,
      code,
      ts.ScriptTarget.Latest,
      true
    );

    const functions: ParsedFunction[] = [];
    const calls: FunctionCall[] = [];

    const visit = (node: ts.Node) => {
      if (ts.isFunctionDeclaration(node) && node.name) {
        functions.push({
          name: node.name.text,
          parameters: node.parameters.map(p => p.name.getText()),
          startLine: this.line(node, sourceFile),
        });
      }

      if (ts.isCallExpression(node)) {
        calls.push({
          callee: node.expression.getText(),
          arguments: node.arguments.map(a => a.getText()),
          line: this.line(node, sourceFile),
        });
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    return {
      filePath,
      language: filePath.endsWith(".ts") ? "typescript" : "javascript",
      ast: {
        language: filePath.endsWith(".ts") ? "ts" : "js",
        functions: functions.length,
        calls: calls.length,
      },
      functions,
      calls,
      taintMarkers: [],
    };
  }

  private line(node: ts.Node, sf: ts.SourceFile): number {
    return sf.getLineAndCharacterOfPosition(node.getStart()).line + 1;
  }
}
