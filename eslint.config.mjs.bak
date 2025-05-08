// eslint.config.ts
import js from "@eslint/js";
import globals from "globals";
import prettier from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    plugins: { js, prettier: prettierPlugin },
    extends: ["js/recommended", prettier],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest // ✅ Include Jest globals like describe, it, expect
      }
    },
    rules: {
      "prettier/prettier": "error",
      "no-unused-vars": "off",
      "no-undef": "off" // ✅ Turned off since Jest globals will now be recognized
    }
  }
]);
