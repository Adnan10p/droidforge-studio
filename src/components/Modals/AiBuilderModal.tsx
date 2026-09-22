import React, { useState } from "react";
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Bot,
  Layers,
  Wand2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { AndroidScreen, ProjectConfig } from "../../types";

interface AiBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ProjectConfig;
  onApplyGeneratedApp: (screens: AndroidScreen[], configUpdates?: Partial<ProjectConfig>) => void;
  initialPrompt?: string;
}

const PRESET_PROMPTS = [
  "Fitness Tracker with real-time GPS map, step progress bar, and health stats",
  "Crypto & Web3 Wallet with biometric lock, balance card, and recent transactions",
  "Food Delivery App with restaurant search, category chips, and order checkout",
  "Smart Home IoT Controller with room switches, thermostat slider, and camera feed",
];

export const AiBuilderModal: React.FC<AiBuilderModalProps> = ({
  isOpen,
  onClose,
  config,
  onApplyGeneratedApp,
  initialPrompt = "",
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeMode, setActiveMode] = useState<"generate" | "consult">("generate");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    {
      role: "assistant",
      text: "Hello! I am your AI Android Architect. Describe the app you want to build, or ask any question about Jetpack Compose, NDK C++, Kotlin Coroutines, or Gradle configuration.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateApp = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/ai/generate-app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, projectConfig: config }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();

      if (data.screens && data.screens.length > 0) {
        onApplyGeneratedApp(data.screens, data.configUpdates);
        onClose();
      } else {
        throw new Error("No screens returned from AI generator");
      }
    } catch (err: any) {
      console.error("AI Generation failed:", err);
      setErrorMessage(
        err.message || "Failed to generate app. Please verify server connection."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          context: {
            appName: config.appName,
            packageName: config.packageName,
            targetSdk: config.targetSdk,
          },
        }),
      });

      const data = await response.json();
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.reply || "No response received." },
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, I encountered an issue connecting to the AI architect service.",
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-inner">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Gemini AI Android Studio Architect</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800/60">
                  Gemini Flash
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Generate complete multi-screen Jetpack Compose apps or get real-time engineering advice.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center px-4 pt-3 border-b border-slate-800 gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveMode("generate")}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition ${
              activeMode === "generate"
                ? "border-blue-500 text-blue-400 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Generate Entire App</span>
          </button>
          <button
            onClick={() => setActiveMode("consult")}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition ${
              activeMode === "consult"
                ? "border-blue-500 text-blue-400 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Ask Android Architect</span>
          </button>
        </div>

        {/* Content Area */}
        {activeMode === "generate" ? (
          <div className="p-5 overflow-y-auto space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                Describe the Android App You Want to Build:
              </label>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Build an advanced Smart Home controller with lighting switches, temperature slider, camera feed preview, and Firebase telemetry sync..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>

            {/* Quick preset chips */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Or pick an industry template:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_PROMPTS.map((pr, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPrompt(pr)}
                    className="text-left p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition"
                  >
                    💡 {pr}
                  </button>
                ))}
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-950/40 border border-red-800/80 rounded-xl flex items-center gap-2 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 flex-1 flex flex-col overflow-hidden h-96">
            <div className="flex-1 overflow-y-auto space-y-3 p-1">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-slate-200 border border-slate-700/70"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isGenerating && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 text-slate-400 p-3 rounded-xl text-xs flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                placeholder="Ask about NDK C++, Jetpack Compose, Coroutines, or Room..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSendChat}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        {activeMode === "generate" && (
          <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Generates Jetpack Compose UI, ViewModels, and Navigation hierarchy
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateApp}
                disabled={isGenerating || !prompt.trim()}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50 shadow-md"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Building App Structure...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Generate App</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
