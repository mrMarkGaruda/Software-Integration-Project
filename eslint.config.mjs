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
    rules: {
      "prettier/prettier": "error"
    }
  },
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: { globals: globals.node }
  }
]);