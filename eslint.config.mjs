import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default [{
  ignores: ["node_modules/**/*"],
}, ...compat.extends("eslint:recommended"), {
  languageOptions: {
    globals: {
      ...globals.node,
      ...globals.mocha,
    },

    ecmaVersion: 8,
    sourceType: "module",
  },

  rules: {
    indent: ["error", 2, {
      SwitchCase: 1,
    }],

    "linebreak-style": ["error", "unix"],
    semi: ["error", "always"],
    "no-useless-escape": [0],
  },
}];