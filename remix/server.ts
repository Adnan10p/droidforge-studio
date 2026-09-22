import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

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

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
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
