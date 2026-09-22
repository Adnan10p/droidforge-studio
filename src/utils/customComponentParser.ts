import {
  CustomComponentDefinition,
  CustomPropertyDef,
  CustomComponentRequiredLib,
  ComponentCategory,
  CustomComponentVisualTemplate,
} from "../types";
import { RECOMMENDED_ANDROID_LIBRARIES } from "../data/defaultCustomComponents";

import { EventOutputDef } from "../data/componentLogicMetadata";

export interface ParsedFunctionDef {
  id: string;
  name: string;
  description: string;
  params: { name: string; type: string; description?: string }[];
}

export interface ParsedEventDef {
  id: string;
  name: string;
  category: "gesture" | "lifecycle" | "input" | "sensor" | "network" | "timer";
  description: string;
  outputs: EventOutputDef[];
}

export interface ParsedCodeResult {
  name: string;
  typeId: string;
  category: ComponentCategory;
  description: string;
  visualTemplate: CustomComponentVisualTemplate;
  isContainer: boolean;
  isVisible: boolean;
  properties: CustomPropertyDef[];
  libraries: CustomComponentRequiredLib[];
  events: string[];
  parsedEvents: ParsedEventDef[];
  parsedFunctions: ParsedFunctionDef[];
  cleanCode: string;
  aiExplanation: string;
}

/**
 * Intelligent Code Parser & Analyzer for Jetpack Compose & Kodular/AIX Kotlin/Java code.
 * Extracts parameters, auto-detects libraries, infers category and visual template,
 * and creates UI properties automatically.
 */
export function analyzeAndParseCustomCode(rawCode: string): ParsedCodeResult {
  const code = rawCode.trim();

  // 1. Detect Component Name and TypeId
  let detectedName = "";
  let detectedTypeId = "";

  // Check for Compose function: @Composable fun ComponentName(...)
  const composableMatch = code.match(/@Composable\s+(?:inline\s+)?fun\s+([A-Za-z0-9_]+)/);
  // Check for Class: class ComponentName or class ComponentName(
  const classMatch = code.match(/class\s+([A-Za-z0-9_]+)/);
  // Check for DesignerComponent annotation
  const designerMatch = code.match(/@DesignerComponent\s*\([\s\S]*?description\s*=\s*["']([^"']+)["']/);

  if (composableMatch) {
    detectedTypeId = composableMatch[1];
    detectedName = formatIdentifierToName(composableMatch[1]);
  } else if (classMatch) {
    detectedTypeId = classMatch[1];
    detectedName = formatIdentifierToName(classMatch[1]);
  } else {
    detectedTypeId = "CustomComponent";
    detectedName = "Custom Component";
  }

  // 2. Detect Category & Visual Template
  let category: ComponentCategory = "Basic UI";
  let visualTemplate: CustomComponentVisualTemplate = "card";
  let isContainer = false;

  const codeLower = code.toLowerCase();

  // Monetization / Ads Detection
  if (
    codeLower.includes("startapp") ||
    codeLower.includes("startio") ||
    codeLower.includes("admob") ||
    codeLower.includes("banner") ||
    codeLower.includes("interstitial") ||
    codeLower.includes("rewarded") ||
    codeLower.includes("ironsource") ||
    codeLower.includes("unityads")
  ) {
    category = "Monetization";
    visualTemplate = "banner";
  }
  // Media / Audio / Video / Lottie
  else if (
    codeLower.includes("lottie") ||
    codeLower.includes("player") ||
    codeLower.includes("video") ||
    codeLower.includes("audio") ||
    codeLower.includes("exoplayer") ||
    codeLower.includes("mediaplayer")
  ) {
    category = "Media & Display";
    visualTemplate = "card";
  }
  // Charts & Visualizers
  else if (
    codeLower.includes("chart") ||
    codeLower.includes("mpandroidchart") ||
    codeLower.includes("graph") ||
    codeLower.includes("waveform")
  ) {
    category = "Media & Display";
    visualTemplate = "card";
  }
  // Buttons / Actions
  else if (
    codeLower.includes("button") ||
    codeLower.includes("ripple") ||
    codeLower.includes("gradientbutton") ||
    codeLower.includes("fab")
  ) {
    category = "Basic UI";
    visualTemplate = "button";
  }
  // Status / Badges / Chips
  else if (
    codeLower.includes("badge") ||
    codeLower.includes("chip") ||
    codeLower.includes("status") ||
    codeLower.includes("tag")
  ) {
    category = "Basic UI";
    visualTemplate = "badge";
  }
  // Network / Storage / Database
  else if (
    codeLower.includes("room") ||
    codeLower.includes("database") ||
    codeLower.includes("sqlite") ||
    codeLower.includes("datastore")
  ) {
    category = "Files & Storage";
  } else if (
    codeLower.includes("retrofit") ||
    codeLower.includes("http") ||
    codeLower.includes("api") ||
    codeLower.includes("json")
  ) {
    category = "System & Services";
  }

  // Detect if container
  if (
    codeLower.includes("content: @composable") ||
    codeLower.includes("content: () -> unit") ||
    codeLower.includes("columnscope") ||
    codeLower.includes("rowscope") ||
    codeLower.includes("componentcontainer") ||
    codeLower.includes("arrangement")
  ) {
    isContainer = true;
  }

  // 3. Detect & Auto-Add Required Maven Libraries
  const detectedLibraries: CustomComponentRequiredLib[] = [];

  function addLibIfFound(
    condition: boolean,
    libId: string,
    name: string,
    group: string,
    artifact: string,
    version: string,
    desc: string,
    cat: any = "Utility"
  ) {
    if (condition) {
      if (!detectedLibraries.some((l) => l.group === group && l.artifact === artifact)) {
        detectedLibraries.push({
          id: libId,
          name,
          group,
          artifact,
          version,
          description: desc,
          required: true,
          category: cat,
        });
      }
    }
  }

  // Start.io SDK
  addLibIfFound(
    codeLower.includes("com.startapp") || codeLower.includes("startappsdk") || codeLower.includes("startio"),
    "lib_startio_sdk",
    "Start.io In-App Ads SDK",
    "com.startapp",
    "inapp-sdk",
    "5.1.0",
    "Start.io SDK for Banner & Interstitial monetization",
    "Monetization"
  );

  // Lottie Compose
  addLibIfFound(
    codeLower.includes("lottie") || codeLower.includes("com.airbnb.android"),
    "lib_lottie_compose",
    "Lottie Animation Compose",
    "com.airbnb.android",
    "lottie-compose",
    "6.6.2",
    "Vector motion graphics and After Effects animations",
    "Media"
  );

  // MPAndroidChart
  addLibIfFound(
    codeLower.includes("mpandroidchart") || codeLower.includes("philjay"),
    "lib_mpandroidchart",
    "MPAndroidChart Charts",
    "com.github.PhilJay",
    "MPAndroidChart",
    "v3.1.0",
    "Line, bar, pie, and radar charts library",
    "Media"
  );

  // Coil Compose Image Loader
  addLibIfFound(
    codeLower.includes("asynclmage") || codeLower.includes("rememberasyncimagepainter") || codeLower.includes("io.coil-kt"),
    "lib_coil_compose",
    "Coil Image Loader",
    "io.coil-kt",
    "coil-compose",
    "2.7.0",
    "Fast asynchronous image loading for Jetpack Compose",
    "Media"
  );

  // Retrofit
  addLibIfFound(
    codeLower.includes("retrofit") || codeLower.includes("square.retrofit2"),
    "lib_retrofit",
    "Retrofit REST Client",
    "com.squareup.retrofit2",
    "retrofit",
    "2.11.0",
    "Type-safe HTTP REST client for Android",
    "Networking"
  );

  // Accompanist System UI / Permissions
  addLibIfFound(
    codeLower.includes("accompanist") || codeLower.includes("rememberpermissionsstate"),
    "lib_accompanist_perms",
    "Accompanist Permissions",
    "com.google.accompanist",
    "accompanist-permissions",
    "0.36.0",
    "Runtime permission utilities for Jetpack Compose",
    "Compose"
  );

  // Custom explicit implementation string in code: implementation 'group:artifact:version'
  const customGradleRegex = /(?:implementation|api)\s*\(?['"]([^:'"]+):([^:'"]+):([^'"]+)['"]\)?/g;
  let gradleMatch;
  while ((gradleMatch = customGradleRegex.exec(code)) !== null) {
    const [, g, a, v] = gradleMatch;
    addLibIfFound(true, `lib_custom_${a}`, formatIdentifierToName(a), g, a, v, `Imported from source: ${g}:${a}`);
  }

  // Always ensure Compose Material 3 is present if it's a compose UI component
  if (!detectedLibraries.some((l) => l.artifact === "material3")) {
    detectedLibraries.unshift({
      id: "lib_compose_m3",
      name: "Compose Material 3",
      group: "androidx.compose.material3",
      artifact: "material3",
      version: "1.3.1",
      description: "Material 3 tokens, surface and colors",
      required: true,
      category: "Compose",
    });
  }

  // 4. Auto Extract Properties
  const detectedProperties: CustomPropertyDef[] = [];
  const extractedKeys = new Set<string>();

  // A. If Jetpack Compose function, extract function parameters
  if (composableMatch) {
    const funSignature = code.substring(code.indexOf(composableMatch[0]));
    const paramStart = funSignature.indexOf("(");
    let paramEnd = -1;
    let depth = 0;

    for (let i = paramStart; i < funSignature.length; i++) {
      if (funSignature[i] === "(") depth++;
      else if (funSignature[i] === ")") {
        depth--;
        if (depth === 0) {
          paramEnd = i;
          break;
        }
      }
    }

    if (paramStart !== -1 && paramEnd !== -1) {
      const paramsBlock = funSignature.substring(paramStart + 1, paramEnd);
      // Split parameters considering possible nested generics or lambdas
      const rawParams = splitKotlinParams(paramsBlock);

      rawParams.forEach((paramStr) => {
        const trimmed = paramStr.trim();
        if (!trimmed || trimmed.startsWith("modifier") || trimmed.startsWith("content:")) return;

        // format: propName: Type = defaultValue
        const colonIdx = trimmed.indexOf(":");
        if (colonIdx === -1) return;

        const propKey = trimmed.substring(0, colonIdx).trim();
        if (extractedKeys.has(propKey)) return;

        const rest = trimmed.substring(colonIdx + 1).trim();
        let propType = "String";
        let defaultVal: any = "";

        const eqIdx = rest.indexOf("=");
        if (eqIdx !== -1) {
          propType = rest.substring(0, eqIdx).trim();
          defaultVal = rest.substring(eqIdx + 1).trim();
        } else {
          propType = rest.trim();
        }

        // Clean default value
        defaultVal = defaultVal.replace(/^["']|["']$/g, "");

        let mappedType: any = "text";
        if (propType.includes("Int") || propType.includes("Float") || propType.includes("Double") || propType.includes("Long")) {
          mappedType = "number";
          defaultVal = Number(defaultVal.replace(/[fFLldp]/g, "")) || 0;
        } else if (propType.includes("Boolean")) {
          mappedType = "boolean";
          defaultVal = defaultVal === "true";
        } else if (propType.includes("Color")) {
          mappedType = "color";
          defaultVal = extractColorHex(defaultVal) || "#6366F1";
        } else if (propType.includes("Dp")) {
          mappedType = "number";
          defaultVal = Number(defaultVal.replace(/(\.dp|dp)/g, "")) || 16;
        }

        extractedKeys.add(propKey);
        detectedProperties.push({
          id: `prop_${propKey}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          key: propKey,
          label: formatIdentifierToName(propKey),
          type: mappedType,
          defaultValue: defaultVal,
          description: `Configurable parameter for ${propKey}`,
        });
      });
    }
  }

  // B. If Kodular/AppInventor extension code, scan for @SimpleProperty, @SimpleFunction, or fields
  if (detectedProperties.length === 0) {
    const simplePropRegex = /fun\s+([A-Za-z0-9_]+)\s*\(\s*([A-Za-z0-9_]+)\s*:\s*([A-Za-z0-9_]+)\s*\)/g;
    let propMatch;
    while ((propMatch = simplePropRegex.exec(code)) !== null) {
      const [, funcName, paramName, paramType] = propMatch;
      const key = paramName.toLowerCase();
      if (!extractedKeys.has(key)) {
        extractedKeys.add(key);
        let mappedType: any = "text";
        let defaultVal: any = "";
        if (paramType === "Int" || paramType === "Float" || paramType === "Double") {
          mappedType = "number";
          defaultVal = 0;
        } else if (paramType === "Boolean") {
          mappedType = "boolean";
          defaultVal = true;
        }
        detectedProperties.push({
          id: `prop_${key}_${Date.now()}`,
          key,
          label: formatIdentifierToName(funcName),
          type: mappedType,
          defaultValue: defaultVal,
          description: `Property configured from ${funcName}`,
        });
      }
    }
  }

  // C. Fallback / Context-aware default properties if none found
  if (detectedProperties.length === 0) {
    if (category === "Monetization") {
      detectedProperties.push(
        {
          id: `prop_appId_${Date.now()}`,
          key: "appId",
          label: "App / Placement ID",
          type: "text",
          defaultValue: "208765432",
          description: "Monetization SDK Developer ID",
        },
        {
          id: `prop_testMode_${Date.now()}`,
          key: "testMode",
          label: "Test Ads Mode",
          type: "boolean",
          defaultValue: true,
          description: "Enable sandbox test ads during development",
        },
        {
          id: `prop_height_${Date.now()}`,
          key: "bannerHeight",
          label: "Banner Height (dp)",
          type: "number",
          defaultValue: 50,
          description: "Height in density-independent pixels",
        }
      );
    } else {
      detectedProperties.push(
        {
          id: `prop_title_${Date.now()}`,
          key: "title",
          label: "Title Text",
          type: "text",
          defaultValue: detectedName,
          description: "Headline label for the component",
        },
        {
          id: `prop_accentColor_${Date.now()}`,
          key: "accentColor",
          label: "Theme Accent Color",
          type: "color",
          defaultValue: "#6366F1",
          description: "Primary visual color",
        },
        {
          id: `prop_cornerRadius_${Date.now()}`,
          key: "cornerRadius",
          label: "Corner Radius (dp)",
          type: "number",
          defaultValue: 16,
          description: "Rounded corners radius",
        }
      );
    }
  }

  // 5. Parse @SimpleFunction and @SimpleEvent Annotations
  const events: string[] = ["Click"];
  const parsedEvents: ParsedEventDef[] = [
    {
      id: "Click",
      name: "Click (Tap)",
      category: "gesture",
      description: "Triggered when user clicks or taps this component",
      outputs: [{ name: "clickTimestamp", type: "Long", description: "Timestamp of click in ms" }],
    },
  ];

  const parsedFunctions: ParsedFunctionDef[] = [];

  // A. Extract @SimpleFunction annotations
  const simpleFunctionRegex = /@SimpleFunction\s*(?:\(\s*description\s*=\s*["']([^"']*)["']\s*\))?[\s\S]*?fun\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)/g;
  let funcMatch;
  while ((funcMatch = simpleFunctionRegex.exec(code)) !== null) {
    const funcDesc = funcMatch[1] || `Invoke method ${funcMatch[2]}`;
    const funcName = funcMatch[2];
    const rawParams = funcMatch[3] ? splitKotlinParams(funcMatch[3]) : [];

    const params = rawParams
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
      .map((p) => {
        const parts = p.split(":");
        const pName = parts[0]?.trim() || "arg";
        const pType = parts[1]?.trim() || "String";
        return { name: pName, type: pType, description: `Parameter ${pName}` };
      });

    if (!parsedFunctions.some((f) => f.id === funcName)) {
      parsedFunctions.push({
        id: funcName,
        name: formatIdentifierToName(funcName),
        description: funcDesc,
        params,
      });
    }
  }

  // Fallback: If no @SimpleFunction annotations were present, auto-detect public methods
  if (parsedFunctions.length === 0) {
    const commonMethods = [
      "Initialize",
      "LoadBanner",
      "ShowBanner",
      "HideBanner",
      "ReloadBanner",
      "Play",
      "Pause",
      "Stop",
      "Reset",
      "Clear",
    ];
    commonMethods.forEach((m) => {
      if (codeLower.includes(m.toLowerCase())) {
        parsedFunctions.push({
          id: m,
          name: formatIdentifierToName(m),
          description: `Execute ${formatIdentifierToName(m)} on ${detectedName}`,
          params: [],
        });
      }
    });
  }

  // B. Extract @SimpleEvent annotations
  const simpleEventRegex = /@SimpleEvent\s*(?:\(\s*description\s*=\s*["']([^"']*)["']\s*\))?[\s\S]*?fun\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)/g;
  let evAnnMatch;
  while ((evAnnMatch = simpleEventRegex.exec(code)) !== null) {
    const evDesc = evAnnMatch[1] || `Triggered when ${evAnnMatch[2]} occurs`;
    const evName = evAnnMatch[2];
    const rawParams = evAnnMatch[3] ? splitKotlinParams(evAnnMatch[3]) : [];

    const outputs: EventOutputDef[] = rawParams
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
      .map((p) => {
        const parts = p.split(":");
        const pName = parts[0]?.trim() || "val";
        const rawType = parts[1]?.trim() || "String";
        let mappedType: EventOutputDef["type"] = "String";
        if (rawType.includes("Int")) mappedType = "Int";
        else if (rawType.includes("Float")) mappedType = "Float";
        else if (rawType.includes("Boolean")) mappedType = "Boolean";
        else if (rawType.includes("Long")) mappedType = "Long";
        else if (rawType.includes("Double")) mappedType = "Double";
        return { name: pName, type: mappedType, description: `Event payload ${pName}` };
      });

    if (!events.includes(evName)) events.push(evName);
    if (!parsedEvents.some((e) => e.id === evName)) {
      parsedEvents.push({
        id: evName,
        name: formatIdentifierToName(evName),
        category: "sensor",
        description: evDesc,
        outputs,
      });
    }
  }

  // Fallback / legacy event matching
  const eventRegex = /fun\s+([A-Za-z0-9_]+)\s*\(\s*\)\s*(?:\{[\s\S]*?dispatchEvent|[\s\S]*?onReceive)/g;
  let evMatch;
  while ((evMatch = eventRegex.exec(code)) !== null) {
    const evName = evMatch[1];
    if (!events.includes(evName) && !evName.startsWith("get") && !evName.startsWith("set")) {
      events.push(evName);
      if (!parsedEvents.some((e) => e.id === evName)) {
        parsedEvents.push({
          id: evName,
          name: formatIdentifierToName(evName),
          category: "sensor",
          description: `Event triggered when ${evName}`,
          outputs: [],
        });
      }
    }
  }

  if (codeLower.includes("bannerloaded") && !events.includes("BannerLoaded")) {
    events.push("BannerLoaded");
    parsedEvents.push({
      id: "BannerLoaded",
      name: "Banner Loaded",
      category: "sensor",
      description: "Triggered when banner ad finishes loading",
      outputs: [],
    });
  }
  if (codeLower.includes("bannerfailed") && !events.includes("BannerFailed")) {
    events.push("BannerFailed");
    parsedEvents.push({
      id: "BannerFailed",
      name: "Banner Failed",
      category: "sensor",
      description: "Triggered when banner ad fails to load",
      outputs: [
        { name: "errorCode", type: "Int", description: "Error code status" },
        { name: "errorMessage", type: "String", description: "Failure description message" },
      ],
    });
  }
  if (codeLower.includes("bannerimpression") && !events.includes("BannerImpression")) {
    events.push("BannerImpression");
    parsedEvents.push({
      id: "BannerImpression",
      name: "Banner Impression",
      category: "sensor",
      description: "Triggered when banner impression is registered",
      outputs: [],
    });
  }

  // Description
  const description = designerMatch
    ? designerMatch[1]
    : `${detectedName} - Custom Jetpack Compose component ready for DroidForge visual canvas and APK export.`;

  // AI Assistant Summary Explanation
  const aiExplanation = `Analyzed Kotlin code successfully!
• Component Name: ${detectedName} (${detectedTypeId})
• Category Auto-Set: ${category}
• Visual Layout: ${visualTemplate.toUpperCase()} (Live Preview Active)
• Extracted ${detectedProperties.length} Properties: ${detectedProperties.map((p) => p.key).join(", ")}
• Extracted ${parsedFunctions.length} @SimpleFunction Methods: ${parsedFunctions.map((f) => f.id).join(", ")}
• Extracted ${parsedEvents.length} @SimpleEvent Triggers: ${parsedEvents.map((e) => e.id).join(", ")}
• Linked ${detectedLibraries.length} Android Libraries: ${detectedLibraries.map((l) => l.artifact).join(", ")}`;

  let isVisible = true;
  if (
    codeLower.includes("nonvisible = true") ||
    codeLower.includes("nonvisiblecomponent") ||
    codeLower.includes("androidnonvisiblecomponent") ||
    codeLower.includes("roomdatabase") ||
    codeLower.includes("sqlite") ||
    codeLower.includes("retrofit") ||
    codeLower.includes("telephony") ||
    codeLower.includes("sensor")
  ) {
    isVisible = false;
  }

  return {
    name: detectedName,
    typeId: detectedTypeId,
    category,
    description,
    visualTemplate,
    isContainer,
    isVisible,
    properties: detectedProperties,
    libraries: detectedLibraries,
    events,
    parsedEvents,
    parsedFunctions,
    cleanCode: code,
    aiExplanation,
  };
}

/**
 * Helper to split parameter list safely
 */
function splitKotlinParams(paramsStr: string): string[] {
  const result: string[] = [];
  let current = "";
  let depth = 0;

  for (let i = 0; i < paramsStr.length; i++) {
    const ch = paramsStr[i];
    if (ch === "(" || ch === "<" || ch === "{" || ch === "[") depth++;
    else if (ch === ")" || ch === ">" || ch === "}" || ch === "]") depth--;
    else if (ch === "," && depth === 0) {
      result.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) result.push(current);
  return result;
}

/**
 * Format camelCase or PascalCase into readable English
 */
function formatIdentifierToName(str: string): string {
  if (!str) return "Custom Component";
  return str
    .replace(/^Custom/, "")
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract hex color from Color(0xFF123456) or Color.parseColor("#123456")
 */
function extractColorHex(colorStr: string): string | null {
  if (!colorStr) return null;
  const hexMatch = colorStr.match(/#(?:[0-9a-fA-F]{3,8})/);
  if (hexMatch) return hexMatch[0];

  const hexValMatch = colorStr.match(/0x([0-9a-fA-F]{6,8})/);
  if (hexValMatch) {
    const raw = hexValMatch[1];
    return raw.length === 8 ? `#${raw.substring(2)}` : `#${raw}`;
  }
  return null;
}
