import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

const androidSdk = process.env.ANDROID_HOME || "C:\\Users\\SAAB PC\\AppData\\Local\\Android\\Sdk";
const javaHome = process.env.JAVA_HOME || "C:\\Program Files\\Java\\jdk-17.0.1";

console.log("ANDROID_HOME env:", process.env.ANDROID_HOME);
console.log("JAVA_HOME env:", process.env.JAVA_HOME);
console.log("androidSdk checked:", androidSdk, "exists:", fs.existsSync(androidSdk));
console.log("javaHome checked:", javaHome, "exists:", fs.existsSync(javaHome));

if (fs.existsSync(androidSdk)) {
  console.log("build-tools contents:", fs.existsSync(path.join(androidSdk, "build-tools")) ? fs.readdirSync(path.join(androidSdk, "build-tools")) : "missing");
  console.log("platforms contents:", fs.existsSync(path.join(androidSdk, "platforms")) ? fs.readdirSync(path.join(androidSdk, "platforms")) : "missing");
}

const javacCheck = spawnSync("javac", ["-version"]);
console.log("javac on PATH status:", javacCheck.status, javacCheck.stdout?.toString(), javacCheck.stderr?.toString());

const javaCheck = spawnSync("java", ["-version"]);
console.log("java on PATH status:", javaCheck.status, javaCheck.stdout?.toString(), javaCheck.stderr?.toString());
