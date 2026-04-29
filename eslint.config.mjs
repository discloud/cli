import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  { ignores: ["build/**", "test/**/*.mjs"] },
  { files: ["**/*.{mjs,ts}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.mjs"], languageOptions: { sourceType: "script" } },
  { files: ["**/*.{mjs,ts}"], languageOptions: { globals: globals.node } },
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["*.mjs"],
        },
      },
    },
  },
  {
    files: ["*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    rules: {
      "@typescript-eslint/consistent-type-imports": ["warn", { fixStyle: "inline-type-imports" }],
      "@typescript-eslint/only-throw-error": "warn",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "warn",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-declaration-merging": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      }],
      "@typescript-eslint/prefer-ts-expect-error": "warn",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/return-await": "off",
      "@typescript-eslint/sort-type-constituents": "warn",
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
]);
