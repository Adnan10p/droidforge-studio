import { ensurePrebuiltCompanionApk } from "../src/server/apkBuilder";
import fs from "fs";

async function main() {
  console.log("Forcing build of DroidForge-Companion-v6.0.0-Master.apk with Embedded Native WebView...");
  const targetPath = await ensurePrebuiltCompanionApk(true);
  console.log("Generated APK at:", targetPath);
  console.log("APK Size:", fs.statSync(targetPath).size, "bytes");
}

main().catch(console.error);
