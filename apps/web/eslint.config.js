import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config} */
export default [
  ...nextJsConfig,
  {
    rules: {
      "react/prop-types": "off", // TypeScript 사용 시 불필요
    },
  },
];
