/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";
import { writeFileSync } from "fs";
import { join } from "path";

const buildTimestamp = Date.now();
const buildVersion = `${buildTimestamp}`;

// Write version to public folder for service worker access
try {
  const versionData = {
    version: buildVersion,
    timestamp: buildTimestamp,
    buildDate: new Date().toISOString(),
  };
  writeFileSync(
    join(process.cwd(), "public", "version.json"),
    JSON.stringify(versionData),
  );
  console.log(`[Build] Generated version.json: ${JSON.stringify(versionData)}`);
} catch (error) {
  console.warn("Failed to write version.json:", error);
}

/** @type {import("next").NextConfig} */
const config = {
  env: {
    NEXT_PUBLIC_APP_VERSION: buildVersion,
    NEXT_PUBLIC_BUILD_TIMESTAMP: buildTimestamp.toString(),
  },
};

export default config;
