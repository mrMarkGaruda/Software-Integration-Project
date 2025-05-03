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
      "prettier/prettier": "error",
      "no-unused-vars": "off", // Disable warnings for unused variables
      "no-undef": "warn"       // Change undefined variables to warnings instead of errors
    }
  },
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: { globals: globals.node }
  }
]);