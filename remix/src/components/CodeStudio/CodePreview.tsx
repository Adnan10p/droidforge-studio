import React, { useState, useEffect, useRef } from "react";
import {
  Copy,
  Check,
  Download,
  FileCode,
  Layers,
  Cpu,
  FileText,
  Boxes,
  Play,
  RotateCcw,
  Sparkles,
  Smartphone,
  Workflow,
  Split,
  ChevronDown,
  Code2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FolderTree,
  Zap,
} from "lucide-react";
import {
  AndroidScreen,
  ProjectConfig,
  ProjectAsset,
  BuilderIdeSettings,
} from "../../types";
import {
  generateJetpackComposeCode,
  generateViewModelCode,
  generateAndroidManifest,
  generateBuildGradleKts,
  generateNativeCppCode,
  generateMainActivityKt,
  generateJavaMainActivity,
  generateXmlLayout,
  generateJavaBuildGradle,
} from "../../utils/codeGenerators";
import { parseComposeToScreen, ParseResult } from "../../utils/composeParser";
import { COMPOSE_TEMPLATES, ComposeTemplate } from "./composeTemplates";
import { Canvas } from "../VisualEditor/Canvas";

interface CodePreviewProps {
  screen: AndroidScreen;
  screens: AndroidScreen[];
  config: ProjectConfig;
  assets: ProjectAsset[];
  builderSettings?: BuilderIdeSettings;
  onUpdateScreen?: (screen: AndroidScreen) => void;
  onSelectScreen?: (screenId: string) => void;
  onSwitchToCanvas?: () => void;
  onSwitchToLogic?: () => void;
  onUpdateConfig?: (updates: Partial<ProjectConfig>) => void;
}

type CodeTab =
  | "compose"
  | "java_activity"
  | "xml_layout"
  | "viewmodel"
  | "mainactivity"
  | "manifest"
  | "gradle"
  | "native_cpp";

export const CodePreview: React.FC<CodePreviewProps> = ({
  screen,
  screens,
  config,
  builderSettings,
  onUpdateScreen,
  onSelectScreen,
  onSwitchToCanvas,
  onSwitchToLogic,
}) => {
  const isJava = config.language === "java";
  const [activeCodeTab, setActiveCodeTab] = useState<CodeTab>(
    config.language === "java" ? "java_activity" : "compose"
  );
  const [copied, setCopied] = useState(false);
  const [showSplitView, setShowSplitView] = useState(false);
  const [showTemplatesMenu, setShowTemplatesMenu] = useState(false);
  const [showScreenSelectMenu, setShowScreenSelectMenu] = useState(false);

  // Editable compose code buffer
  const [editableCode, setEditableCode] = useState<string>("");
  const [isModified, setIsModified] = useState(false);

  // Automatically enforce correct active tab when project language changes or loads
  useEffect(() => {
    if (isJava) {
      if (
        activeCodeTab === "compose" ||
        activeCodeTab === "viewmodel" ||
        activeCodeTab === "mainactivity"
      ) {
        setActiveCodeTab("java_activity");
      }
    } else {
      if (activeCodeTab === "java_activity" || activeCodeTab === "xml_layout") {
        setActiveCodeTab("compose");
      }
    }
  }, [isJava]);

  // Parse & Sync Feedback
  const [lastParseResult, setLastParseResult] = useState<ParseResult | null>(null);
  const [showSyncSuccessBanner, setShowSyncSuccessBanner] = useState(false);
  const [parseErrorBanner, setParseErrorBanner] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-generate code when screen updates unless user is actively editing
  useEffect(() => {
    if (!isModified) {
      const generated = generateJetpackComposeCode(screen, config);
      setEditableCode(generated);
    }
  }, [screen, config, isModified]);

  // When switching screen, reset buffer to fresh generated code
  useEffect(() => {
    const generated = generateJetpackComposeCode(screen, config);
    setEditableCode(generated);
    setIsModified(false);
    setLastParseResult(null);
    setShowSyncSuccessBanner(false);
    setParseErrorBanner(null);
  }, [screen.id]);

  const composeCode = isModified ? editableCode : generateJetpackComposeCode(screen, config);
  const viewModelCode = generateViewModelCode(screen);
  const mainActivityCode = generateMainActivityKt(config, screens);
  const javaActivityCode = generateJavaMainActivity(config, screens, screen);
  const xmlLayoutCode = generateXmlLayout(screen, config);
  const manifestCode = generateAndroidManifest(config, screens);
  const gradleCode = config.language === "java" ? generateJavaBuildGradle(config) : generateBuildGradleKts(config);
  const nativeCpp = generateNativeCppCode(config);

  const getActiveCode = (): { content: string; filename: string; language: string } => {
    switch (activeCodeTab) {
      case "compose":
        return {
          content: editableCode,
          filename: `${screen.name}.kt`,
          language: "kotlin",
        };
      case "java_activity":
        return {
          content: javaActivityCode,
          filename: "MainActivity.java",
          language: "java",
        };
      case "xml_layout":
        return {
          content: xmlLayoutCode,
          filename: `activity_${screen.name.toLowerCase().replace(/[^a-z0-9_]/g, "_")}.xml`,
          language: "xml",
        };
      case "viewmodel":
        return {
          content: viewModelCode,
          filename: `${screen.name}ViewModel.kt`,
          language: "kotlin",
        };
      case "mainactivity":
        return {
          content: mainActivityCode,
          filename: "MainActivity.kt",
          language: "kotlin",
        };
      case "manifest":
        return {
          content: manifestCode,
          filename: "AndroidManifest.xml",
          language: "xml",
        };
      case "gradle":
        return {
          content: gradleCode,
          filename: config.language === "java" ? "app/build.gradle" : "app/build.gradle.kts",
          language: config.language === "java" ? "groovy" : "kotlin",
        };
      case "native_cpp":
        return {
          content: `// app/src/main/cpp/CMakeLists.txt\n${nativeCpp.cmake}\n\n// app/src/main/cpp/native-lib.cpp\n${nativeCpp.cpp}`,
          filename: "native-lib.cpp & CMakeLists.txt",
          language: "cpp",
        };
    }
  };

  const { content, filename } = getActiveCode();

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetToGenerated = () => {
    const freshCode = generateJetpackComposeCode(screen, config);
    setEditableCode(freshCode);
    setIsModified(false);
    setParseErrorBanner(null);
  };

  const handleApplyTemplate = (tmpl: ComposeTemplate) => {
    setEditableCode(tmpl.code);
    setIsModified(true);
    setShowTemplatesMenu(false);
    // Automatically apply template to screen and logic
    handleParseAndSync(tmpl.code);
  };

  const handleParseAndSync = (codeToParse?: string) => {
    const targetCode = codeToParse || editableCode;
    if (!targetCode.trim()) {
      setParseErrorBanner("Code buffer is empty. Please enter or paste Jetpack Compose code.");
      return;
    }

    const result = parseComposeToScreen(targetCode, screen, screens);
    setLastParseResult(result);

    if (result.success && onUpdateScreen) {
      onUpdateScreen(result.screen);
      setShowSyncSuccessBanner(true);
      setParseErrorBanner(null);
      setIsModified(false);
      setTimeout(() => {
        setShowSyncSuccessBanner(false);
      }, 5000);
    } else {
      setParseErrorBanner(
        result.warnings[0] || "Could not parse code into valid UI components and logic."
      );
    }
  };

  // Quick live heuristic stats from the buffer
  const countButtons = (editableCode.match(/Button\s*\(|IconButton\s*\(/g) || []).length;
  const countTexts = (editableCode.match(/Text\s*\(/g) || []).length;
  const countFields = (editableCode.match(/TextField\s*\(/g) || []).length;
  const countCards = (editableCode.match(/Card\s*\(/g) || []).length;

  const lines = content.split("\n");

  const themeBg = (() => {
    switch (builderSettings?.codeEditorTheme) {
      case "monokai":
        return "bg-[#272822] text-[#F8F8F2]";
      case "github-dark":
        return "bg-[#0D1117] text-[#C9D1D9]";
      case "github-light":
        return "bg-[#FFFFFF] text-[#24292F]";
      case "dracula":
        return "bg-[#282A36] text-[#F8F8F2]";
      case "vs-dark":
      default:
        return "bg-[#1E1E1E] text-slate-200";
    }
  })();

  const fontSize = builderSettings?.codeFontSize || 13;
  const showLineNumbers = builderSettings?.codeLineNumbers !== false;

  return (
    <div
      id="code-studio-container"
      className="flex-1 bg-slate-950 flex flex-col h-full overflow-hidden text-slate-200"
    >
      {/* Code Studio Master Header: Screen Selector + Quick Actions + Sync Button */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap select-none z-20">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md text-xs font-semibold">
            <Code2 className="w-3.5 h-3.5" />
            <span>Code Studio Pro</span>
          </div>

          {/* Project Architecture Badge */}
          {isJava ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-md text-xs font-bold font-mono">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Java / XML Views</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-violet-500/15 text-violet-300 border border-violet-500/30 rounded-md text-xs font-bold font-mono">
              <span className="w-2 h-2 rounded-full bg-violet-400" />
              <span>Kotlin / Jetpack Compose</span>
            </div>
          )}

          {/* Screen Switcher Dropdown */}
          <div className="relative">
            <button
              id="code-screen-selector-btn"
              onClick={() => setShowScreenSelectMenu(!showScreenSelectMenu)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
              title="Switch Target Screen"
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-semibold text-white">{screen.name}</span>
              <span className="text-slate-400 font-mono">({screen.title || "Screen"})</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showScreenSelectMenu && (
              <div
                id="code-screen-select-dropdown"
                className="absolute left-0 top-full mt-1 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">
                  Select Screen to Edit
                </div>
                {screens.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      if (onSelectScreen) onSelectScreen(s.id);
                      setShowScreenSelectMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-700 transition ${
                      s.id === screen.id ? "bg-blue-600/20 text-blue-400 font-bold" : "text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-3.5 h-3.5 opacity-70" />
                      <span>{s.name}</span>
                    </div>
                    {s.isInitial && (
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                        Home
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Template Gallery Button */}
          <div className="relative">
            <button
              id="code-template-picker-btn"
              onClick={() => setShowTemplatesMenu(!showTemplatesMenu)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
              title="Paste ready-to-use Compose Screen Templates"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Paste Screen Template</span>
              <ChevronDown className="w-3 h-3 text-amber-400/80" />
            </button>

            {showTemplatesMenu && (
              <div
                id="code-template-dropdown"
                className="absolute left-0 top-full mt-1 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 z-50"
              >
                <div className="px-2 py-1 text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Pre-built Compose Templates</span>
                  <span className="text-slate-400 text-[10px]">Instant Sync</span>
                </div>
                <div className="space-y-1 mt-1 max-h-72 overflow-y-auto pr-1">
                  {COMPOSE_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      onClick={() => handleApplyTemplate(tmpl)}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-700 text-slate-200 transition flex flex-col gap-0.5 border border-transparent hover:border-slate-600"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-white">{tmpl.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 font-mono">
                          {tmpl.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                        {tmpl.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Central Sync & Canvas Trigger */}
        <div className="flex items-center gap-2">
          {/* Main Action: Synchronize Code to Canvas and Logic Blocks */}
          <button
            id="apply-code-to-canvas-btn"
            onClick={() => handleParseAndSync()}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-md shadow-blue-900/30 transition transform active:scale-95"
            title="Parse Compose code and automatically update Canvas UI components, action buttons, and Logic Blocks"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>Apply Code to Canvas & Logic</span>
          </button>

          {/* Direct jump to Canvas UI */}
          {onSwitchToCanvas && (
            <button
              id="switch-to-canvas-btn"
              onClick={onSwitchToCanvas}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
              title="Open Visual Drag & Drop Canvas Studio"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>View Canvas</span>
            </button>
          )}

          {/* Direct jump to Logic Studio */}
          {onSwitchToLogic && (
            <button
              id="switch-to-logic-btn"
              onClick={onSwitchToLogic}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
              title="Open Visual Logic Blocks Flow Studio"
            >
              <Workflow className="w-3.5 h-3.5 text-violet-400" />
              <span>View Logic</span>
            </button>
          )}

          {/* Toggle Split View Live Preview */}
          <button
            id="toggle-split-view-btn"
            onClick={() => setShowSplitView(!showSplitView)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition ${
              showSplitView
                ? "bg-blue-600/20 text-blue-300 border-blue-500/50"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
            }`}
            title="Toggle Side-by-Side Live Android Preview"
          >
            <Split className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Code Studio File Tab Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-1.5 flex items-center justify-between gap-2 overflow-x-auto select-none">
        <div className="flex items-center gap-1.5">
          {/* Strict Separation: Java Projects ONLY get Java & XML files */}
          {isJava ? (
            <>
              {/* Java MainActivity Tab */}
              <button
                id="code-tab-java"
                onClick={() => setActiveCodeTab("java_activity")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                  activeCodeTab === "java_activity"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-amber-400/80 hover:text-amber-300 hover:bg-slate-800"
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-amber-400" />
                <span>MainActivity.java</span>
              </button>

              {/* Android XML Layout Tab */}
              <button
                id="code-tab-xml"
                onClick={() => setActiveCodeTab("xml_layout")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                  activeCodeTab === "xml_layout"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-emerald-400/80 hover:text-emerald-300 hover:bg-slate-800"
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>activity_{screen.name.toLowerCase().replace(/[^a-z0-9_]/g, "_")}.xml</span>
              </button>

              {/* AndroidManifest.xml */}
              <button
                id="code-tab-manifest"
                onClick={() => setActiveCodeTab("manifest")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                  activeCodeTab === "manifest"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>AndroidManifest.xml</span>
              </button>

              {/* app/build.gradle (Groovy DSL) */}
              <button
                id="code-tab-gradle"
                onClick={() => setActiveCodeTab("gradle")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                  activeCodeTab === "gradle"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-amber-400" />
                <span>app/build.gradle</span>
              </button>
            </>
          ) : (
            /* Strict Separation: Kotlin Projects ONLY get Kotlin & Jetpack Compose files */
            <>
              {/* Kotlin Jetpack Compose Tab */}
              <button
                id="code-tab-compose"
                onClick={() => setActiveCodeTab("compose")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                  activeCodeTab === "compose"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-violet-300" />
                <span>{screen.name}.kt</span>
                {isModified && (
                  <span className="w-2 h-2 rounded-full bg-amber-400" title="Unsaved modifications" />
                )}
              </button>

              {/* ViewModel Tab */}
              <button
                id="code-tab-viewmodel"
                onClick={() => setActiveCodeTab("viewmodel")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                  activeCodeTab === "viewmodel"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <Boxes className="w-3.5 h-3.5 text-indigo-400" />
                <span>{screen.name}ViewModel.kt</span>
              </button>

              {/* MainActivity.kt Tab */}
              <button
                id="code-tab-mainactivity"
                onClick={() => setActiveCodeTab("mainactivity")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                  activeCodeTab === "mainactivity"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>MainActivity.kt</span>
              </button>

              {/* AndroidManifest.xml */}
              <button
                id="code-tab-manifest"
                onClick={() => setActiveCodeTab("manifest")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                  activeCodeTab === "manifest"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>AndroidManifest.xml</span>
              </button>

              {/* build.gradle.kts (Kotlin DSL) */}
              <button
                id="code-tab-gradle"
                onClick={() => setActiveCodeTab("gradle")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                  activeCodeTab === "gradle"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>build.gradle.kts</span>
              </button>
            </>
          )}

          {/* C++ NDK / JNI (Shared if enabled in config) */}
          {config.enableNdk && (
            <button
              id="code-tab-native-cpp"
              onClick={() => setActiveCodeTab("native_cpp")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                activeCodeTab === "native_cpp"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>C++ NDK / JNI</span>
            </button>
          )}
        </div>

        {/* Action Buttons: Reset, Copy, Download */}
        <div className="flex items-center gap-2">
          {activeCodeTab === "compose" && isModified && (
            <button
              id="reset-code-btn"
              onClick={handleResetToGenerated}
              className="flex items-center gap-1 text-slate-400 hover:text-slate-200 text-xs px-2 py-1 rounded hover:bg-slate-800 transition"
              title="Reset code buffer to match current Canvas layout"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          <button
            id="copy-code-btn"
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            id="download-code-file-btn"
            onClick={handleDownloadSingle}
            title="Download this file"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sync Success Feedback Notification */}
      {showSyncSuccessBanner && lastParseResult && (
        <div
          id="code-sync-success-banner"
          className="bg-emerald-950/90 border-b border-emerald-700/60 px-4 py-2 flex items-center justify-between gap-3 text-xs text-emerald-200 z-10 animate-in fade-in duration-150"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-semibold text-white">Code synchronized to Screen & Logic!</span>
              <span className="ml-2 text-emerald-300">
                Created {lastParseResult.stats.componentsCount} UI element(s),{" "}
                {lastParseResult.stats.logicBlocksCount} Logic Block(s), and{" "}
                {lastParseResult.stats.variablesCount} State Variable(s).
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onSwitchToCanvas && (
              <button
                onClick={onSwitchToCanvas}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium text-[11px] transition shadow-sm"
              >
                Go to Canvas UI
              </button>
            )}
            {onSwitchToLogic && (
              <button
                onClick={onSwitchToLogic}
                className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded font-medium text-[11px] transition"
              >
                Go to Logic Blocks
              </button>
            )}
            <button
              onClick={() => setShowSyncSuccessBanner(false)}
              className="text-emerald-400 hover:text-white px-1.5"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Parse Error Notification */}
      {parseErrorBanner && (
        <div
          id="code-sync-error-banner"
          className="bg-rose-950/90 border-b border-rose-700/60 px-4 py-2 flex items-center justify-between gap-3 text-xs text-rose-200 z-10"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{parseErrorBanner}</span>
          </div>
          <button
            onClick={() => setParseErrorBanner(null)}
            className="text-rose-400 hover:text-white px-1.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Workspace Area (Optional Split View) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left / Center: Interactive Code Editor */}
        <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-slate-800">
          {activeCodeTab === "compose" ? (
            /* Editable Compose View */
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
              {/* Editor Sub-header with live element counter badge */}
              <div className="bg-slate-900/50 border-b border-slate-800 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-400 select-none">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Editable Mode: Paste or type Kotlin Jetpack Compose code</span>
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-300">
                    Detected: <strong className="text-blue-400">{countButtons}</strong> Buttons,{" "}
                    <strong className="text-emerald-400">{countFields}</strong> Inputs,{" "}
                    <strong className="text-purple-400">{countCards}</strong> Cards,{" "}
                    <strong className="text-amber-400">{countTexts}</strong> Labels
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {lines.length} lines
                  </span>
                </div>
              </div>

              {/* Editable Textarea with Line Numbers */}
              <div
                className={`flex-1 flex overflow-hidden font-mono ${themeBg}`}
                style={{ fontSize: `${fontSize}px` }}
              >
                {/* Line Numbers Gutter */}
                {showLineNumbers && (
                  <div className="w-12 bg-black/20 text-slate-500 select-none text-right py-4 pr-3 border-r border-white/5 font-mono shrink-0 overflow-hidden">
                    {lines.map((_, i) => (
                      <div key={i} className="leading-6 text-[11px] opacity-60">
                        {i + 1}
                      </div>
                    ))}
                  </div>
                )}

                {/* Textarea Code Input */}
                <textarea
                  id="compose-code-editor-textarea"
                  ref={textareaRef}
                  value={editableCode}
                  onChange={(e) => {
                    setEditableCode(e.target.value);
                    setIsModified(true);
                  }}
                  onKeyDown={(e) => {
                    // Support Tab indentation
                    if (e.key === "Tab") {
                      e.preventDefault();
                      const start = e.currentTarget.selectionStart;
                      const end = e.currentTarget.selectionEnd;
                      const val = editableCode;
                      setEditableCode(val.substring(0, start) + "    " + val.substring(end));
                      setIsModified(true);
                      setTimeout(() => {
                        if (textareaRef.current) {
                          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
                        }
                      }, 0);
                    }
                  }}
                  placeholder="// Paste or write your Jetpack Compose code here..."
                  spellCheck={false}
                  className="flex-1 p-4 bg-transparent outline-none resize-none leading-6 font-mono text-slate-200 placeholder-slate-600 select-text overflow-auto"
                />
              </div>
            </div>
          ) : (
            /* Read-only Secondary Files (ViewModel, MainActivity, Manifest, Gradle, NDK) */
            <div
              className={`flex-1 overflow-auto font-mono flex ${themeBg}`}
              style={{ fontSize: `${fontSize}px` }}
            >
              {showLineNumbers && (
                <div className="w-12 bg-black/20 text-slate-500 select-none text-right py-4 pr-3 border-r border-white/5 font-mono shrink-0">
                  {lines.map((_, i) => (
                    <div key={i} className="leading-6 text-[11px] opacity-60">
                      {i + 1}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex-1 p-4 overflow-x-auto leading-6 whitespace-pre font-mono select-text">
                {lines.map((line, idx) => {
                  let color = "text-slate-300";
                  const trimmed = line.trim();
                  if (
                    trimmed.startsWith("//") ||
                    trimmed.startsWith("/*") ||
                    trimmed.startsWith("*") ||
                    trimmed.startsWith("<!--")
                  ) {
                    color = "text-emerald-500/80 italic";
                  } else if (
                    line.includes("@Composable") ||
                    line.includes("@OptIn") ||
                    line.includes("@Override") ||
                    line.includes("@NonNull")
                  ) {
                    color = "text-amber-400 font-bold";
                  } else if (
                    line.includes("fun ") ||
                    line.includes("class ") ||
                    line.includes("val ") ||
                    line.includes("var ") ||
                    line.includes("public ") ||
                    line.includes("private ") ||
                    line.includes("protected ") ||
                    line.includes("void ") ||
                    line.includes("boolean ") ||
                    line.includes("int ")
                  ) {
                    color = "text-cyan-400";
                  } else if (
                    line.includes("import ") ||
                    line.includes("package ") ||
                    line.includes("plugins {")
                  ) {
                    color = "text-purple-400";
                  } else if (
                    trimmed.startsWith("<") ||
                    trimmed.endsWith(">") ||
                    trimmed.startsWith("</")
                  ) {
                    color = "text-blue-400 font-semibold";
                  } else if (
                    line.includes("android:") ||
                    line.includes("app:") ||
                    line.includes("tools:")
                  ) {
                    color = "text-amber-300/90";
                  } else if (
                    line.includes("Modifier") ||
                    line.includes("MaterialTheme") ||
                    line.includes("setContentView") ||
                    line.includes("findViewById")
                  ) {
                    color = "text-blue-300";
                  }

                  return (
                    <div key={idx} className={color}>
                      {line || " "}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Split View: Live Canvas Screen Preview */}
        {showSplitView && (
          <div className="w-[420px] bg-slate-900/90 flex flex-col h-full border-l border-slate-800 shrink-0 overflow-hidden animate-in slide-in-from-right-4 duration-150">
            <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                <span>Live Canvas Stage</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleParseAndSync()}
                  className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-medium"
                  title="Update preview with edited code"
                >
                  Refresh UI
                </button>
                <button
                  onClick={() => setShowSplitView(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col bg-slate-950">
              <Canvas
                screen={screen}
                screens={screens}
                theme={config.theme}
                deviceType="phone"
                orientation="portrait"
                selectedComponentId={null}
                onSelectComponent={() => {}}
                onDropNewComponent={() => {}}
                builderSettings={builderSettings}
              />
            </div>
          </div>
        )}
      </div>

      {/* Code Studio Status Bar */}
      <div className="bg-slate-900 border-t border-slate-800 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-400 select-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-slate-300">
            <span className="font-semibold">{screen.name}</span>
            <span className="opacity-60">({screen.rootComponent?.children?.length || 0} top-level nodes, {screen.logicBlocks?.length || 0} logic blocks)</span>
          </span>
          {isModified && (
            <span className="text-amber-400 font-medium flex items-center gap-1">
              <span>● Modified</span>
              <span className="opacity-75">- click "Apply Code to Canvas & Logic" to update UI</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span>Kotlin Jetpack Compose</span>
          <span>UTF-8</span>
          <span>Spaces: 4</span>
        </div>
      </div>
    </div>
  );
};
