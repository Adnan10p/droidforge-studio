import { ensurePrebuiltCompanionApk } from "../src/server/apkBuilder";
import fs from "fs";

async function main() {
  console.log("Generating upgraded Master Companion APK v3.0.0...");
  const targetPath = await ensurePrebuiltCompanionApk();
  console.log("Master APK Generated at:", targetPath);
  console.log("File Size:", fs.statSync(targetPath).size, "bytes");
}

main().catch(console.error);
