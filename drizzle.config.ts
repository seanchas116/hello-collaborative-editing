import type { Config } from "drizzle-kit";
export default {
  schema: "./utils/schema.ts",
  out: "./drizzle",
} satisfies Config;
