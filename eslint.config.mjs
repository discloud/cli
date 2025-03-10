import pluginJs from "@eslint/js";
import { Linter } from "eslint";
import globals from "globals";
import tseslint from "typescript-eslint";

/** @type {Linter.Config[]} */
export default [
  { files: ["**/*.?(c|m)ts"] },
  { ignores: ["**/*.?(c|m)js", "**/*.d.?(c|m)ts"] },
  { languageOptions: { globals: globals.node } },
  { languageOptions: { sourceType: "script" } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/consistent-type-imports": ["warn", { fixStyle: "inline-type-imports" }],
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-declaration-merging": "off",
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      }],
      "@typescript-eslint/prefer-ts-expect-error": "warn",
      "comma-dangle": ["warn", "always-multiline"],
      "func-style": ["warn", "declaration"],
      indent: ["warn", 2, { SwitchCase: 1 }],
      "no-case-declarations": "off",
      "no-duplicate-imports": ["warn", { includeExports: true }],
      "no-empty": "off",
      "no-unused-private-class-members": "warn",
      "no-unused-vars": "off",
      "prefer-const": "warn",
      "prefer-object-has-own": "warn",
      "prefer-regex-literals": "warn",
      quotes: ["warn", "double"],
      semi: ["warn", "always"],
    },
  },
];
