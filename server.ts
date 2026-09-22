import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import QRCode from "qrcode";
import { buildApkBinary, ensurePrebuiltCompanionApk } from "./src/server/apkBuilder";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Dynamic QR Code PNG Generator Endpoint
app.get("/api/qr-code", async (req, res) => {
  const text = (req.query.text as string) || (req.query.code as string) || "DF-DEHM";
  try {
    const qrBuffer = await QRCode.toBuffer(text, {
      margin: 2,
      width: 300,
      color: { dark: "#0B0F19", light: "#FFFFFF" },
    });
    res.setHeader("Content-Type", "image/png");
    return res.send(qrBuffer);
  } catch (err: any) {
    return res.status(500).send("Error generating QR code");
  }
});

// Master Companion APK direct download routes at top of Express middleware stack
app.get([
  "/DroidForge-Companion-v5.0.0-Master.apk",
  "/downloads/DroidForge-Companion-v5.0.0-Master.apk",
  "/DroidForge-Companion-v4.0.0-Master.apk",
  "/downloads/DroidForge-Companion-v4.0.0-Master.apk",
  "/DroidForge-Companion-v3.5.0-Master.apk",
  "/downloads/DroidForge-Companion-v3.5.0-Master.apk",
  "/DroidForge-Companion-v3.0.0-Master.apk",
  "/downloads/DroidForge-Companion-v3.0.0-Master.apk",
  "/downloads/DroidForge-Companion-v2.64.apk",
  "/companion.apk",
  "/api/companion/download",
  "/download/companion.apk"
], (_req, res) => {
  const apkPath = path.join(process.cwd(), "public", "downloads", "DroidForge-Companion-v5.0.0-Master.apk");
  if (fs.existsSync(apkPath)) {
    const stats = fs.statSync(apkPath);
    res.setHeader("Content-Type", "application/vnd.android.package-archive");
    res.setHeader("Content-Disposition", 'attachment; filename="DroidForge-Companion-v5.0.0-Master.apk"');
    res.setHeader("Content-Length", stats.size);
    return res.sendFile(apkPath);
  }
  return res.status(404).send("Companion APK file not found");
});

app.use(express.static(path.join(process.cwd(), "public")));

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI App Builder endpoint
app.post("/api/ai/generate-app", async (req, res) => {
  try {
    const { prompt, currentScreenName } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getAIClient();
    if (!ai) {
      // Fallback smart mock generator if no API key is set yet
      return res.json({
        success: true,
        isFallback: true,
        message: "Gemini API key not configured yet. Providing structured template.",
        screen: {
          name: currentScreenName || "GeneratedScreen",
          title: "AI Generated Screen",
          components: [
            {
              id: "comp_ai_header",
              type: "Toolbar",
              name: "TopBar",
              props: { title: "Generated Screen", elevation: 4, showBackButton: true },
              children: []
            },
            {
              id: "comp_ai_card",
              type: "Card",
              name: "MainCard",
              props: { elevation: 2, cornerRadius: 16, padding: 16, backgroundColor: "#ffffff" },
              children: [
                {
                  id: "comp_ai_title",
                  type: "Text",
                  name: "TitleLabel",
                  props: { text: `Design for: ${prompt.slice(0, 30)}...`, fontSize: 18, fontWeight: "bold", textColor: "#1E293B" },
                  children: []
                },
                {
                  id: "comp_ai_desc",
                  type: "Text",
                  name: "DescLabel",
                  props: { text: "Built with DroidForge Studio visual engine.", fontSize: 14, textColor: "#64748B" },
                  children: []
                },
                {
                  id: "comp_ai_btn",
                  type: "Button",
                  name: "ActionBtn",
                  props: { text: "Get Started", backgroundColor: "#2563EB", textColor: "#ffffff", cornerRadius: 10 },
                  children: []
                }
              ]
            }
          ],
          logicBlocks: [
            {
              id: "block_ai_click",
              event: "ActionBtn.Click",
              targetComponent: "comp_ai_btn",
              actions: [
                { actionType: "toast", message: "Action clicked successfully!" },
                { actionType: "setProperty", targetId: "comp_ai_title", property: "text", value: "Action Completed!" }
              ]
            }
          ]
        }
      });
    }

    const systemPrompt = `You are DroidForge Studio's Android App Generator.
Your job is to generate a comprehensive, modern Android screen with UI components and interactive visual logic blocks based on the user's description.
Available component types:
- Containers: Card, Recycler/List, ScrollView, Form, Dialog, Bottom Sheet, Drawer, Toolbar
- Basic UI: Text, Button, Image, Video, WebView, TextField, Checkbox, Switch, Slider, Progress
- Device & Native: Map, Camera, File Picker, Audio, ExoPlayer, Notifications, Bluetooth, Wi-Fi, Location/GPS, Sensors, Contacts, Share, Browser

Rules:
Return ONLY valid JSON matching this structure:
{
  "screenName": string,
  "screenTitle": string,
  "components": [
    {
      "id": string (unique, e.g. "comp_1"),
      "type": string (one of the available component types),
      "name": string (readable Kotlin-style identifier, e.g. "SubmitButton"),
      "props": {
        "text"?: string,
        "title"?: string,
        "textColor"?: string,
        "backgroundColor"?: string,
        "fontSize"?: number,
        "fontWeight"?: "normal"|"bold",
        "padding"?: number,
        "cornerRadius"?: number,
        "elevation"?: number,
        "hint"?: string,
        "icon"?: string,
        "url"?: string,
        "checked"?: boolean,
        "value"?: number,
        "layoutWidth"?: "wrap_content"|"match_parent"|number,
        "layoutHeight"?: "wrap_content"|"match_parent"|number
      },
      "children": [ (array of child components if container, else empty) ]
    }
  ],
  "logicBlocks": [
    {
      "id": string,
      "event": string (e.g. "SubmitButton.Click" or "Screen.OnCreate" or "LocationSensor.OnLocationChanged"),
      "targetComponent": string (component id or "screen"),
      "actions": [
        {
          "actionType": "toast"|"navigate"|"setProperty"|"callApi"|"firebaseWrite"|"permissionRequest",
          "message"?: string,
          "targetScreen"?: string,
          "targetId"?: string,
          "property"?: string,
          "value"?: any,
          "endpoint"?: string
        }
      ]
    }
  ],
  "requiredPermissions": [ string (e.g. "android.permission.INTERNET", "android.permission.ACCESS_FINE_LOCATION") ],
  "recommendedDependencies": [ string (e.g. "androidx.compose.material3:material3:1.2.1") ],
  "kotlinComposeCode": string (fully functional Jetpack Compose @Composable function)
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `Create an Android app screen for: "${prompt}"\nPreferred Screen Name: "${currentScreenName || "MainScreen"}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    try {
      const parsed = JSON.parse(text);
      return res.json({ success: true, data: parsed });
    } catch {
      return res.status(500).json({ error: "Failed to parse Gemini output", raw: text });
    }
  } catch (err: any) {
    console.error("AI Generation error:", err);
    return res.status(500).json({ error: err?.message || "Internal server error during AI generation" });
  }
});

// AI Logic Block Suggester
app.post("/api/ai/suggest-logic", async (req, res) => {
  try {
    const { componentType, componentName, userIntent } = req.body;
    const ai = getAIClient();

    if (!ai) {
      return res.json({
        success: true,
        isFallback: true,
        suggestions: [
          {
            title: `When ${componentName}.Click -> Show Toast & Update State`,
            blocks: [
              { actionType: "toast", message: `Processing ${componentName}...` },
              { actionType: "setProperty", property: "enabled", value: false },
            ],
            kotlinSnippet: `Button(onClick = { \n  Toast.makeText(context, "Processing...", Toast.LENGTH_SHORT).show()\n  isEnabled = false \n}) { ... }`
          }
        ]
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `Suggest 3 realistic visual event logic blocks for an Android component:
Type: ${componentType}
Name: ${componentName}
Intent: ${userIntent || "User action or lifecycle event"}

Return JSON format:
{
  "suggestions": [
    {
      "title": string,
      "event": string,
      "blocks": [
        { "actionType": string, "description": string, "params": object }
      ],
      "kotlinSnippet": string
    }
  ]
}`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    return res.json({ success: true, data: parsed });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Logic suggestion error" });
  }
});

// AI Android Expert Chat / Code explanation
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, projectContext } = req.body;
    const ai = getAIClient();

    if (!ai) {
      return res.json({
        reply: `DroidForge AI Assistant (Offline Mode): I'm ready to help you configure Android SDK, Jetpack Compose UI, Native NDK C++ bindings, Gradle build scripts, and visual block logic! (Set your GEMINI_API_KEY in Settings > Secrets to unlock live model queries).`
      });
    }

    const systemInstruction = `You are DroidForge Studio's senior Android Architect and Developer Advocate.
Help the user build production-grade Android apps using Jetpack Compose, Material 3, Kotlin Coroutines, Room DB, Retrofit, NDK/JNI, Gradle build configurations, and visual block architecture.
Keep answers concise, actionable, and include clean Kotlin / Jetpack Compose code snippets.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `Project Context:\n${JSON.stringify(projectContext || {}, null, 2)}\n\nUser Question:\n${message}`,
      config: {
        systemInstruction,
      },
    });

    return res.json({ reply: response.text || "No response generated." });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "AI Chat error" });
  }
});

// Live Companion Broadcast State Store
let companionLiveState = {
  config: null as any,
  screens: [] as any[],
  currentScreenId: "",
  updatedAt: new Date().toISOString(),
};

// Studio updates active project state for live companion devices
app.post("/api/companion/sync", (req, res) => {
  try {
    const { config, screens, currentScreenId } = req.body;
    companionLiveState = {
      config: config || companionLiveState.config,
      screens: screens || companionLiveState.screens,
      currentScreenId: currentScreenId || companionLiveState.currentScreenId,
      updatedAt: new Date().toISOString(),
    };
    return res.json({ success: true, updatedAt: companionLiveState.updatedAt });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to sync live state" });
  }
});

// Companion devices or Mobile Web Receiver fetch live state
app.get("/api/companion/live-state", (_req, res) => {
  res.setHeader("Cache-Control", "no-cache");
  return res.json(companionLiveState);
});

// Binary APK Compilation Endpoint
app.post("/api/build/apk", async (req, res) => {
  try {
    const { config, screens } = req.body;
    if (!config || !config.appName) {
      return res.status(400).json({ error: "Project configuration is required" });
    }

    const result = await buildApkBinary(config, screens || []);
    return res.json(result);
  } catch (err: any) {
    console.error("APK Build error:", err);
    return res.status(500).json({ error: err?.message || "Failed to compile APK binary" });
  }
});

// Binary APK Download Endpoint by Build ID
app.get("/api/build/download-apk", (req, res) => {
  try {
    const buildId = (req.query.id as string) || "latest";
    const appName = (req.query.appName as string) || "app";
    const fileName = `${appName.toLowerCase().replace(/[^a-z0-9]/g, "_")}-release.apk`;

    let apkPath = path.join(process.cwd(), "scratch", "builds", buildId, "app-release.apk");

    // Fallback to latest build directory if specific buildId folder is missing
    if (!fs.existsSync(apkPath)) {
      const buildsDir = path.join(process.cwd(), "scratch", "builds");
      if (fs.existsSync(buildsDir)) {
        const dirs = fs.readdirSync(buildsDir).sort().reverse();
        if (dirs.length > 0) {
          apkPath = path.join(buildsDir, dirs[0], "app-release.apk");
        }
      }
    }

    if (!fs.existsSync(apkPath)) {
      return res.status(404).send("APK file not found. Please click 'Start APK Compilation' first.");
    }

    const stats = fs.statSync(apkPath);
    res.setHeader("Content-Type", "application/vnd.android.package-archive");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Length", stats.size);

    const stream = fs.createReadStream(apkPath);
    stream.pipe(res);
  } catch (err: any) {
    return res.status(500).send("Error downloading APK file");
  }
});

// Master DroidForge Companion APK Direct Instant Download Endpoint
app.get(["/api/companion/download", "/download/companion.apk"], async (_req, res) => {
  try {
    const apkPath = await ensurePrebuiltCompanionApk();
    if (fs.existsSync(apkPath)) {
      const stats = fs.statSync(apkPath);
      res.setHeader("Content-Type", "application/vnd.android.package-archive");
      res.setHeader("Content-Disposition", 'attachment; filename="DroidForge-Companion-v6.0.0-Master.apk"');
      res.setHeader("Content-Length", stats.size);
      const stream = fs.createReadStream(apkPath);
      return stream.pipe(res);
    }
    return res.status(404).send("Companion APK file build in progress. Please refresh.");
  } catch (err: any) {
    return res.status(500).send("Error serving prebuilt Companion APK");
  }
});

// Downloads static route for companion APKs and compiled project binaries
app.get(["/downloads/:fileName", "/download/:fileName"], async (req, res) => {
  try {
    const requestedName = req.params.fileName || "app-release.apk";
    const cleanName = requestedName.endsWith(".apk") ? requestedName : `${requestedName}.apk`;

    // 1. Check if file exists in public/downloads/
    const publicDownloadPath = path.join(process.cwd(), "public", "downloads", cleanName);
    if (fs.existsSync(publicDownloadPath)) {
      const stats = fs.statSync(publicDownloadPath);
      res.setHeader("Content-Type", "application/vnd.android.package-archive");
      res.setHeader("Content-Disposition", `attachment; filename="${cleanName}"`);
      res.setHeader("Content-Length", stats.size);
      return fs.createReadStream(publicDownloadPath).pipe(res);
    }

    // 2. Check prebuilt companion APK fallback
    if (cleanName.toLowerCase().includes("companion")) {
      const companionPath = await ensurePrebuiltCompanionApk();
      if (fs.existsSync(companionPath)) {
        const stats = fs.statSync(companionPath);
        res.setHeader("Content-Type", "application/vnd.android.package-archive");
        res.setHeader("Content-Disposition", `attachment; filename="${cleanName}"`);
        res.setHeader("Content-Length", stats.size);
        return fs.createReadStream(companionPath).pipe(res);
      }
    }

    // 3. Fallback to latest scratch build directory
    let apkPath = "";
    const buildsDir = path.join(process.cwd(), "scratch", "builds");
    if (fs.existsSync(buildsDir)) {
      const dirs = fs.readdirSync(buildsDir).sort().reverse();
      if (dirs.length > 0) {
        const candidate = path.join(buildsDir, dirs[0], "app-release.apk");
        if (fs.existsSync(candidate)) {
          apkPath = candidate;
        }
      }
    }

    if (!apkPath || !fs.existsSync(apkPath)) {
      return res.status(404).send("APK not found. Please click 'Start APK Compilation' in DroidForge Studio.");
    }

    const stats = fs.statSync(apkPath);
    res.setHeader("Content-Type", "application/vnd.android.package-archive");
    res.setHeader("Content-Disposition", `attachment; filename="${cleanName}"`);
    res.setHeader("Content-Length", stats.size);

    const stream = fs.createReadStream(apkPath);
    stream.pipe(res);
  } catch (err: any) {
    return res.status(500).send("Error serving APK download");
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  // Prebuild Master Companion APK in background on startup
  ensurePrebuiltCompanionApk().catch((e) => console.warn("Prebuilding Companion APK notice:", e));

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl || req.url;
      if (url.startsWith("/api") || url.startsWith("/downloads") || url.endsWith(".apk")) {
        return next();
      }
      try {
        let template = fs.readFileSync(path.join(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        return res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        return next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DroidForge Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

