import { ensureSchema } from "./ensure-schema";

ensureSchema().catch((error) => {
  console.error("Schema setup failed:", error);
  process.exitCode = 1;
});
