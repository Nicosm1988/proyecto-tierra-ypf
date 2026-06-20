import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      ".vercel/**",
      ".playwright-mcp/**",
      "playwright-report/**",
      "test-results/**"
    ]
  },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        sourceType: "module"
      }
    },
    plugins: {
      "react-hooks": reactHooks
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/set-state-in-effect": "off"
    }
  }
];
