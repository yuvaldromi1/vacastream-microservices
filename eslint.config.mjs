import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

// Backend services, shared libraries and tests.
// The frontend has its own config in Frontend/web-app.
export default defineConfig([
    globalIgnores(["**/dist", "**/node_modules", "Frontend"]),
    {
        files: ["**/*.ts"],
        extends: [js.configs.recommended, tseslint.configs.recommended],
        languageOptions: {
            ecmaVersion: 2022,
            globals: globals.node,
        },
        rules: {
            // "declare global { namespace Express }" is the standard way to extend Request
            "@typescript-eslint/no-namespace": ["error", { allowDeclarations: true }],
            // Express needs all four parameters to recognize error middleware
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
        },
    },
    {
        files: ["tests/**/*.ts"],
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
        },
    },
]);
