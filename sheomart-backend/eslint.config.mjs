import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginPrettier from "eslint-plugin-prettier";
import globals from "globals";

export default [
  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ["**/*.ts"],

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: false,
        sourceType: "module",
      },

      globals: {
        ...globals.node,
      },
    },

    plugins: {
      prettier: eslintPluginPrettier,
    },

    rules: {
      "prettier/prettier": "error",

      "no-console": "off",

      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },

  eslintConfigPrettier,
];
