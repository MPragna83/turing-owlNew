import { HardcodedSecretRule } from "./secrets.ts";
import { SqlInjectionRule } from "./sql.ts";
import { ReflectedXSSRule } from "./xss.ts";
import { SecurityRule } from "./types.ts";

export const ALL_RULES: SecurityRule[] = [
  HardcodedSecretRule,
  SqlInjectionRule,
  ReflectedXSSRule,
];
