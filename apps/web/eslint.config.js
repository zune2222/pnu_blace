// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { nextJsConfig } from "@pnu-blace/eslint-config/next-js";

/** @type {import("eslint").Linter.Config} */
export default [
  ...nextJsConfig,
  ...storybook.configs["flat/recommended"],
  {
    rules: {
      "react/prop-types": "off", // TypeScript 사용 시 불필요
      "storybook/no-renderer-packages": "off", // @storybook/react에서 직접 import 허용
    },
  },
];
