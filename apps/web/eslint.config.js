// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config} */
export default [...nextJsConfig, {
  rules: {
    "react/prop-types": "off", // TypeScript 사용 시 불필요
  },
}, ...storybook.configs["flat/recommended"]];
