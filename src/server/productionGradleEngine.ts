import fs from "fs";
import path from "path";
import { spawnSync, spawn } from "child_process";
import { ProjectConfig, AndroidScreen } from "../types";
import { compileNativeMainActivityJava, HardwareCompiler } from "./native-compiler";
import { buildIntermediateRepresentation } from "./intermediateRepresentation";

export interface GradleBuildOptions {
  target?: "apk" | "aab";
  mode?: "debug" | "release";
  clean?: boolean;
  timeoutMs?: number;
}

export interface GradleBuildResult {
  success: boolean;
  buildId: string;
  target: "apk" | "aab";
  artifactPath?: string;
  artifactSizeMb?: string;
  downloadUrl?: string;
  logs: string[];
  error?: string;
  diagnostics?: any[];
}

/**
 * Dynamically locates Gradle executable on host machine:
 * 1. PATH or GRADLE_HOME
 * 2. Cached Gradle wrapper in ~/.gradle/wrapper/dists
 */
export function findGradleExecutable(): string | null {
  // 1. Check GRADLE_HOME
  if (process.env.GRADLE_HOME) {
    const bat = path.join(process.env.GRADLE_HOME, "bin", "gradle.bat");
    if (fs.existsSync(bat)) return bat;
  }

  // 2. Check standard user .gradle cache on Windows
  const userProfile = process.env.USERPROFILE || "";
  if (userProfile) {
    const distsDir = path.join(userProfile, ".gradle", "wrapper", "dists");
    if (fs.existsSync(distsDir)) {
      try {
        const dists = fs.readdirSync(distsDir);
        // Prioritize gradle-8.x or gradle-7.x
        dists.sort((a, b) => b.localeCompare(a));
        for (const dist of dists) {
          const subDir = path.join(distsDir, dist);
          if (fs.statSync(subDir).isDirectory()) {
            const hashes = fs.readdirSync(subDir);
            for (const hash of hashes) {
              const hashDir = path.join(subDir, hash);
              if (fs.statSync(hashDir).isDirectory()) {
                const subItems = fs.readdirSync(hashDir);
                for (const item of subItems) {
                  const candidate = path.join(hashDir, item, "bin", "gradle.bat");
                  if (fs.existsSync(candidate)) {
                    return candidate;
                  }
                }
              }
            }
          }
        }
      } catch {
        // Continue search
      }
    }
  }

  // 3. Check C:\Program Files\Android
  const programFiles = process.env.PROGRAMFILES || "C:\\Program Files";
  const studioGradle = path.join(programFiles, "Android", "Android Studio", "gradle");
  if (fs.existsSync(studioGradle)) {
    try {
      const items = fs.readdirSync(studioGradle);
      for (const item of items) {
        const candidate = path.join(studioGradle, item, "bin", "gradle.bat");
        if (fs.existsSync(candidate)) return candidate;
      }
    } catch {}
  }

  return null;
}

/**
 * Assembles a complete, production-grade Gradle project ready for compile
 */
export function assembleProductionGradleProject(
  projectDir: string,
  config: ProjectConfig,
  screens: AndroidScreen[]
): {
  appModuleDir: string;
  srcMainJavaDir: string;
  manifestPath: string;
} {
  const pkg = config.packageName || "com.droidforge.quickapp";
  const pkgParts = pkg.split(".");
  const appModuleDir = path.join(projectDir, "app");
  const srcMainDir = path.join(appModuleDir, "src", "main");
  const srcMainJavaDir = path.join(srcMainDir, "java", ...pkgParts);
  const resValuesDir = path.join(srcMainDir, "res", "values");
  const manifestPath = path.join(srcMainDir, "AndroidManifest.xml");
  const gradleWrapperDir = path.join(projectDir, "gradle", "wrapper");

  fs.mkdirSync(srcMainJavaDir, { recursive: true });
  fs.mkdirSync(resValuesDir, { recursive: true });
  fs.mkdirSync(gradleWrapperDir, { recursive: true });

  const cleanAppName = (config.appName || "DroidForge App").replace(/[^a-zA-Z0-9_]/g, "");

  // 1. root settings.gradle.kts
  const settingsKts = `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        maven { url = java.net.URI("https://jitpack.io") }
    }
}
rootProject.name = "${cleanAppName}"
include(":app")
`;
  fs.writeFileSync(path.join(projectDir, "settings.gradle.kts"), settingsKts, "utf8");

  // 2. root build.gradle.kts
  const rootBuildKts = `plugins {
    id("com.android.application") version "8.5.2" apply false
    id("org.jetbrains.kotlin.android") version "2.0.0" apply false
}
`;
  fs.writeFileSync(path.join(projectDir, "build.gradle.kts"), rootBuildKts, "utf8");

  // 3. gradle.properties
  const gradleProperties = `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
android.nonTransitiveRClass=true
`;
  fs.writeFileSync(path.join(projectDir, "gradle.properties"), gradleProperties, "utf8");

  // 4. gradle/wrapper/gradle-wrapper.properties
  const wrapperProps = `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.9-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`;
  fs.writeFileSync(path.join(gradleWrapperDir, "gradle-wrapper.properties"), wrapperProps, "utf8");

  // 5. app/build.gradle.kts
  const dependencies = (config.dependencies || []).filter((d) => d.enabled !== false);
  const depLines = dependencies
    .map((d) => `    implementation("${d.group}:${d.artifact}:${d.version}")`)
    .join("\n");

  const appBuildKts = `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "${pkg}"
    compileSdk = ${config.compileSdk || 35}

    defaultConfig {
        applicationId = "${pkg}"
        minSdk = ${config.minSdk || 24}
        targetSdk = ${config.targetSdk || 34}
        versionCode = ${config.versionCode || 1}
        versionName = "${config.versionName || "1.0.0"}"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("debug")
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            isMinifyEnabled = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    implementation("androidx.core:core-ktx:1.13.1")
${depLines}
}
`;
  fs.writeFileSync(path.join(appModuleDir, "build.gradle.kts"), appBuildKts, "utf8");

  // 6. AndroidManifest.xml
  const hardwareCompiler = new HardwareCompiler();
  const allPermissions = hardwareCompiler.collectPermissions(config.permissions, screens);
  const permXml = allPermissions
    .map((p) => `    <uses-permission android:name="${p}" />`)
    .join("\n");

  const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${pkg}"
    android:versionCode="${config.versionCode || 1}"
    android:versionName="${config.versionName || "1.0.0"}">
    <uses-sdk android:minSdkVersion="${config.minSdk || 24}" android:targetSdkVersion="${config.targetSdk || 34}" />
${permXml}
    <application
        android:label="@string/app_name"
        android:hasCode="true"
        android:usesCleartextTraffic="true"
        android:icon="@android:drawable/sym_def_app_icon"
        android:theme="@style/Theme.AppCompat.Light.NoActionBar">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;
  fs.writeFileSync(manifestPath, manifestXml, "utf8");

  // 7. strings.xml
  const stringsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${(config.appName || "DroidForge App")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")}</string>
</resources>`;
  fs.writeFileSync(path.join(resValuesDir, "strings.xml"), stringsXml, "utf8");

  // 8. Generate Native Java MainActivity
  const javaCode = compileNativeMainActivityJava(config, screens);
  fs.writeFileSync(path.join(srcMainJavaDir, "MainActivity.java"), javaCode, "utf8");

  return {
    appModuleDir,
    srcMainJavaDir,
    manifestPath,
  };
}

/**
 * Executes full production Gradle build for signed Release APK or Release AAB
 */
export async function buildProductionGradleArtifact(
  config: ProjectConfig,
  screens: AndroidScreen[],
  options: GradleBuildOptions = {}
): Promise<GradleBuildResult> {
  const buildId = `gradle_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const target = options.target || "apk";
  const mode = options.mode || "release";
  const logs: string[] = [];

  logs.push(`> [Gradle Engine] Initialized task for target: ${target.toUpperCase()} [Build ID: ${buildId}]`);
  logs.push(`> [Diagnostics] Validating Intermediate Representation (AppIR)...`);

  // Run IR pre-build validation
  const validation = buildIntermediateRepresentation(config, screens);
  if (!validation.valid) {
    const errorMsgs = validation.diagnostics
      .filter((d) => d.severity === "error")
      .map((d) => `[${d.code}] ${d.message} (${d.remediation || ""})`)
      .join("\n");
    logs.push(`> [FATAL VALIDATION ERROR]:\n${errorMsgs}`);
    return {
      success: false,
      buildId,
      target,
      error: `Pre-build validation failed:\n${errorMsgs}`,
      diagnostics: validation.diagnostics,
      logs,
    };
  }

  // Locate Gradle
  const gradleExec = findGradleExecutable();
  if (!gradleExec) {
    const err = "Gradle executable not found on host machine. Please install Gradle or rely on fast offline Java builder.";
    logs.push(`> [GRADLE ERROR]: ${err}`);
    return {
      success: false,
      buildId,
      target,
      error: err,
      logs,
    };
  }

  logs.push(`> Using host Gradle: ${gradleExec}`);

  // Create scratch project folder
  const projectDir = path.join(process.cwd(), "scratch", "builds", buildId, "gradle_project");
  fs.mkdirSync(projectDir, { recursive: true });

  logs.push(`> Assembling Gradle project structure at ${projectDir}...`);
  assembleProductionGradleProject(projectDir, config, screens);

  // Determine Gradle task
  const taskName = target === "aab" ? (mode === "release" ? "bundleRelease" : "bundleDebug") : (mode === "release" ? "assembleRelease" : "assembleDebug");
  logs.push(`> Executing Gradle command: gradle ${taskName} --stacktrace...`);

  const startTime = Date.now();

  try {
    const gradleArgs = [taskName, "--stacktrace", "--no-daemon", "--warning-mode", "none"];
    
    // Windows execution: spawnSync gradle.bat
    const proc = spawnSync(gradleExec, gradleArgs, {
      cwd: projectDir,
      encoding: "utf8",
      timeout: options.timeoutMs || 180000, // 3 minutes timeout
      env: {
        ...process.env,
        JAVA_HOME: process.env.JAVA_HOME || "C:\\Program Files\\Java\\jdk-17.0.1",
      },
    });

    const stdout = proc.stdout ? proc.stdout.toString() : "";
    const stderr = proc.stderr ? proc.stderr.toString() : "";

    const combinedOutput = `${stdout}\n${stderr}`;
    const outputLines = combinedOutput.split("\n").filter((l) => l.trim().length > 0);
    
    // Pick meaningful log lines to avoid cluttering UI
    const filteredLogs = outputLines
      .filter((l) =>
        l.includes("> Task") ||
        l.includes("BUILD") ||
        l.includes("FAILURE") ||
        l.includes("error:") ||
        l.includes("Deprecated") ||
        l.includes("Configuration") ||
        l.includes("Note:")
      )
      .slice(0, 50);

    logs.push(...filteredLogs);

    if (proc.status !== 0) {
      const errMsg = `Gradle build failed with exit code ${proc.status}.`;
      logs.push(`> [BUILD ERROR] ${errMsg}`);
      return {
        success: false,
        buildId,
        target,
        error: errMsg,
        logs,
      };
    }

    // Locate generated artifact
    let artifactPath: string | null = null;
    if (target === "aab") {
      const bundleDir = path.join(projectDir, "app", "build", "outputs", "bundle", mode);
      if (fs.existsSync(bundleDir)) {
        const files = fs.readdirSync(bundleDir).filter((f) => f.endsWith(".aab"));
        if (files.length > 0) {
          artifactPath = path.join(bundleDir, files[0]);
        }
      }
    } else {
      const apkDir = path.join(projectDir, "app", "build", "outputs", "apk", mode);
      if (fs.existsSync(apkDir)) {
        const files = fs.readdirSync(apkDir).filter((f) => f.endsWith(".apk"));
        if (files.length > 0) {
          artifactPath = path.join(apkDir, files[0]);
        }
      }
    }

    if (!artifactPath || !fs.existsSync(artifactPath)) {
      const errMsg = `Gradle reported success but output ${target.toUpperCase()} artifact was not found.`;
      logs.push(`> [ERROR] ${errMsg}`);
      return {
        success: false,
        buildId,
        target,
        error: errMsg,
        logs,
      };
    }

    // Copy artifact to root of build directory
    const finalArtifactName = `app-${mode}.${target}`;
    const destinationPath = path.join(process.cwd(), "scratch", "builds", buildId, finalArtifactName);
    fs.copyFileSync(artifactPath, destinationPath);

    const stats = fs.statSync(destinationPath);
    const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
    const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

    logs.push(
      `> [SUCCESS] Generated ${target.toUpperCase()} artifact in ${durationSec}s: ${finalArtifactName} (${sizeMb} MB)`
    );

    const downloadUrl = target === "aab"
      ? `/api/build/download-aab?id=${buildId}&appName=${encodeURIComponent(config.appName || "app")}`
      : `/api/build/download-apk?id=${buildId}&appName=${encodeURIComponent(config.appName || "app")}`;

    return {
      success: true,
      buildId,
      target,
      artifactPath: destinationPath,
      artifactSizeMb: sizeMb,
      downloadUrl,
      logs,
      diagnostics: validation.diagnostics,
    };
  } catch (err: any) {
    const errorText = err?.message || String(err);
    logs.push(`> [EXCEPTION] Gradle build exception: ${errorText}`);
    return {
      success: false,
      buildId,
      target,
      error: errorText,
      logs,
    };
  }
}
