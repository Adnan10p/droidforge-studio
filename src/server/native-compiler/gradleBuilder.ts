import fs from "fs";
import path from "path";
import { ProjectConfig, AndroidScreen } from "../../types";

export interface GradleProjectAssembly {
  projectDir: string;
  appModuleDir: string;
  srcMainJavaDir: string;
  resValuesDir: string;
  manifestPath: string;
}

export class GradleBuilder {
  // Assembles standard Android Studio Gradle project directory tree
  public static assembleProjectTree(
    baseDir: string,
    config: ProjectConfig
  ): GradleProjectAssembly {
    const pkgParts = (config.packageName || "com.droidforge.quickapp").split(".");
    const appModuleDir = path.join(baseDir, "app");
    const srcMainDir = path.join(appModuleDir, "src", "main");
    const srcMainJavaDir = path.join(srcMainDir, "java", ...pkgParts);
    const resValuesDir = path.join(srcMainDir, "res", "values");
    const manifestPath = path.join(srcMainDir, "AndroidManifest.xml");

    fs.mkdirSync(srcMainJavaDir, { recursive: true });
    fs.mkdirSync(resValuesDir, { recursive: true });

    // 1. Root settings.gradle.kts
    const settingsKts = `
rootProject.name = "${config.appName ? config.appName.replace(/[^a-zA-Z0-9]/g, "") : "DroidForgeApp"}"
include(":app")
    `.trim();
    fs.writeFileSync(path.join(baseDir, "settings.gradle.kts"), settingsKts, "utf8");

    // 2. Root build.gradle.kts
    const rootBuildKts = `
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
}
    `.trim();
    fs.writeFileSync(path.join(baseDir, "build.gradle.kts"), rootBuildKts, "utf8");

    // 3. app/build.gradle.kts
    const dependencies = (config.dependencies || []).filter((d) => d.enabled);
    const depLines = dependencies
      .map((d) => `    implementation("${d.group}:${d.artifact}:${d.version}")`)
      .join("\n");

    const appBuildKts = `
plugins {
    id("com.android.application")
}

android {
    namespace = "${config.packageName || "com.droidforge.quickapp"}"
    compileSdk = ${config.compileSdk || 34}

    defaultConfig {
        applicationId = "${config.packageName || "com.droidforge.quickapp"}"
        minSdk = ${config.minSdk || 21}
        targetSdk = ${config.targetSdk || 34}
        versionCode = ${config.versionCode || 1}
        versionName = "${config.versionName || "1.0.0"}"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
${depLines}
}
    `.trim();
    fs.writeFileSync(path.join(appModuleDir, "build.gradle.kts"), appBuildKts, "utf8");

    // 4. gradle.properties
    const gradleProps = `
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
    `.trim();
    fs.writeFileSync(path.join(baseDir, "gradle.properties"), gradleProps, "utf8");

    // 5. strings.xml
    const stringsXml = `
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${(config.appName || "DroidForge App").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</string>
</resources>
    `.trim();
    fs.writeFileSync(path.join(resValuesDir, "strings.xml"), stringsXml, "utf8");

    return {
      projectDir: baseDir,
      appModuleDir,
      srcMainJavaDir,
      resValuesDir,
      manifestPath,
    };
  }
}
