import React, { useState, useEffect } from "react";
import {
  X,
  Play,
  CheckCircle2,
  Download,
  QrCode,
  Terminal,
  AlertTriangle,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { ProjectConfig, AndroidScreen } from "../../types";

interface BuildApkModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ProjectConfig;
  screens?: AndroidScreen[];
  onExportZip: () => void;
}

export const BuildApkModal: React.FC<BuildApkModalProps> = ({
  isOpen,
  onClose,
  config,
  screens = [],
  onExportZip,
}) => {
  const [buildType, setBuildType] = useState<"apk" | "aab">("apk");
  const [engineType, setEngineType] = useState<"auto" | "fast_java" | "gradle">("auto");
  const [buildProgress, setBuildProgress] = useState<number>(0);
  const [isBuilding, setIsBuilding] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [buildId, setBuildId] = useState<string>("");
  const [buildError, setBuildError] = useState<string | null>(null);

  const [activeModalTab, setActiveModalTab] = useState<"compiler" | "libraries" | "diagnostics">("compiler");

  // Pre-build validation diagnostics state
  const [validationState, setValidationState] = useState<{
    valid: boolean;
    diagnostics: Array<{ severity: "error" | "warning" | "info"; code: string; message: string; remediation?: string }>;
    recommendedEngine: string;
    reasonForEngine?: string;
  } | null>(null);

  // Dynamic active project dependencies directly linked from config.dependencies
  const allProjectDependencies = (config.dependencies || [])
    .filter((dep) => dep.enabled !== false)
    .map((dep) => ({
      name: dep.name,
      gradle: `${dep.group}:${dep.artifact}:${dep.version}`,
      cat: dep.category || "Gradle Dependency",
      status: "Active",
    }));

  // Fetch pre-build architecture validation on modal open
  useEffect(() => {
    if (isOpen) {
      setBuildError(null);
      fetch("/api/build/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config, screens }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.ir) {
            setValidationState({
              valid: data.valid,
              diagnostics: data.diagnostics || [],
              recommendedEngine: data.recommendedEngine || "FAST_JAVA",
              reasonForEngine: data.ir.reasonForEngine,
            });
          }
        })
        .catch(() => {});
    }
  }, [isOpen, config, screens]);

  if (!isOpen) return null;

  const startBuild = async () => {
    setIsBuilding(true);
    setIsFinished(false);
    setBuildError(null);
    setBuildProgress(10);
    setLogs([
      `> Initializing Android Hybrid Build Engine [Target: ${buildType.toUpperCase()}]...`,
      `> Architecture Engine: ${engineType === "auto" ? "Smart Hybrid Auto-Detect" : engineType === "fast_java" ? "Fast 3s Offline Java Compiler" : "Production Gradle Engine"}`,
      `> Target SDK: ${config.targetSdk || 34} | Compile SDK: ${config.compileSdk || 35} | Min SDK: ${config.minSdk || 24}`,
      `> Application Package: ${config.packageName || "com.droidforge.quickapp"}`,
    ]);

    try {
      // Step progress timers
      setTimeout(() => {
        setBuildProgress(35);
        setLogs((prev) => [
          ...prev,
          `> Validating AppIR and symbol table across ${screens.length || 1} screens...`,
          `> Generating native Android source code & AndroidManifest.xml...`,
        ]);
      }, 400);

      setTimeout(() => {
        setBuildProgress(65);
        setLogs((prev) => [
          ...prev,
          `> Invoking native Android compiler toolchain...`,
        ]);
      }, 900);

      // Call server build endpoint
      const endpoint = buildType === "aab" ? "/api/build/aab" : "/api/build/apk";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config,
          screens,
          engine: engineType,
          target: buildType,
          mode: "release",
        }),
      });

      const data = await response.json();

      setBuildProgress(100);
      setIsBuilding(false);
      setIsFinished(true);

      if (data.success) {
        setBuildId(data.buildId || "latest");
        const defaultDownload = buildType === "aab"
          ? `/api/build/download-aab?id=${data.buildId}&appName=${encodeURIComponent(config.appName)}`
          : `/api/build/download-apk?id=${data.buildId}&appName=${encodeURIComponent(config.appName)}`;
        setDownloadUrl(data.downloadUrl || defaultDownload);
        if (data.logs && Array.isArray(data.logs)) {
          setLogs((prev) => [...prev, ...data.logs]);
        } else {
          setLogs((prev) => [
            ...prev,
            `\nBUILD SUCCESSFUL! Standalone ${buildType.toUpperCase()} package ready for installation / distribution.`,
          ]);
        }
      } else {
        const errorMsg = data.error || "Build encountered an error.";
        setBuildError(errorMsg);
        if (data.logs && Array.isArray(data.logs)) {
          setLogs((prev) => [...prev, ...data.logs, `\n[BUILD ERROR]: ${errorMsg}`]);
        } else {
          setLogs((prev) => [...prev, `\n[BUILD ERROR]: ${errorMsg}`]);
        }
      }
    } catch (err: any) {
      console.error("Build request failed:", err);
      setBuildProgress(100);
      setIsBuilding(false);
      setIsFinished(true);
      const errMsg = err?.message || "Build request failed";
      setBuildError(errMsg);
      setLogs((prev) => [...prev, `\n[NETWORK ERROR]: ${errMsg}`]);
    }
  };

  const handleDownloadArtifact = () => {
    const isAab = buildType === "aab";
    const defaultUrl = isAab
      ? `/api/build/download-aab?id=${buildId}&appName=${encodeURIComponent(config.appName)}`
      : `/api/build/download-apk?id=${buildId}&appName=${encodeURIComponent(config.appName)}`;
    const targetUrl = downloadUrl || defaultUrl;
    const link = document.createElement("a");
    link.href = targetUrl;
    link.download = `${config.appName.toLowerCase().replace(/[^a-z0-9]/g, "_")}-release.${buildType}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSourceOnly = () => {
    onExportZip();
  };

  const qrDataUrl = `http://${window.location.hostname || "localhost"}:${
    window.location.port || "3000"
  }${downloadUrl || `/api/build/download-apk?id=${buildId}&appName=${encodeURIComponent(config.appName)}`}`;

  const hasFatalErrors = validationState?.diagnostics.some((d) => d.severity === "error");

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-100">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg font-bold text-xs">
              {buildType.toUpperCase()}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Android Hybrid Build & Release Engine</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 fill-current" />
                  Hybrid Pipeline
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Compile signed Release APK (Direct Install) or Google Play Store App Bundle (AAB).
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

        {/* Pre-Build Validation Status Banner */}
        {validationState && (
          <div className={`px-4 py-2 border-b flex items-center justify-between text-xs ${
            hasFatalErrors
              ? "bg-rose-950/40 border-rose-800/60 text-rose-300"
              : "bg-slate-950/60 border-slate-800 text-slate-300"
          }`}>
            <div className="flex items-center gap-2">
              {hasFatalErrors ? (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              )}
              <span className="font-medium text-[11px]">
                {hasFatalErrors
                  ? "Pre-build validation errors detected. Review diagnostics."
                  : `Architecture Valid • Recommended: ${validationState.recommendedEngine === "PRODUCTION_GRADLE" ? "Production Gradle" : "⚡ Fast 3s Offline Java"}`}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-mono">
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                SDK {config.minSdk || 24}→{config.targetSdk || 34}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {validationState.diagnostics.length} checks
              </span>
            </div>
          </div>
        )}

        {/* Sub-Header / Controls & Tab Navigation */}
        <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-2">
          {/* Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl gap-1 text-xs font-semibold">
            <button
              onClick={() => setActiveModalTab("compiler")}
              className={`px-3 py-1 rounded-lg transition ${
                activeModalTab === "compiler"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Compiler Console
            </button>
            <button
              onClick={() => setActiveModalTab("libraries")}
              className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 ${
                activeModalTab === "libraries"
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800/60 shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>Libraries</span>
              <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.2 rounded-full font-mono text-emerald-300 font-bold">
                {allProjectDependencies.length}
              </span>
            </button>
            <button
              onClick={() => setActiveModalTab("diagnostics")}
              className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 ${
                activeModalTab === "diagnostics"
                  ? "bg-blue-950 text-blue-300 border border-blue-800/60 shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>Diagnostics</span>
              {validationState && validationState.diagnostics.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  hasFatalErrors ? "bg-rose-500/20 text-rose-300" : "bg-blue-500/20 text-blue-300"
                }`}>
                  {validationState.diagnostics.length}
                </span>
              )}
            </button>
          </div>

          {/* Target & Engine Controls */}
          <div className="flex items-center gap-2">
            {/* Target Select */}
            <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => !isBuilding && setBuildType("apk")}
                className={`px-2 py-1 rounded-md font-semibold transition ${
                  buildType === "apk"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Standalone installable APK"
              >
                Release APK
              </button>
              <button
                onClick={() => !isBuilding && setBuildType("aab")}
                className={`px-2 py-1 rounded-md font-semibold transition ${
                  buildType === "aab"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Google Play App Bundle"
              >
                Play AAB
              </button>
            </div>

            {/* Engine Select */}
            <select
              value={engineType}
              onChange={(e) => setEngineType(e.target.value as any)}
              disabled={isBuilding}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-hidden focus:border-emerald-500 font-medium"
              title="Select compilation engine"
            >
              <option value="auto">⚡ Hybrid Auto-Route</option>
              <option value="fast_java">⚡ Fast 3s Offline Java</option>
              <option value="gradle">🚀 Production Gradle</option>
            </select>

            {/* Compile Action Button */}
            {!isBuilding && !isFinished && (
              <button
                onClick={startBuild}
                disabled={hasFatalErrors}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition active:scale-95 shadow-md ml-1 ${
                  hasFatalErrors
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                }`}
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Build {buildType.toUpperCase()}</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Progress Bar & Terminal Logs */}
        {activeModalTab === "compiler" && (
          <div className="p-4 space-y-3">
            {(isBuilding || isFinished) && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>
                    {isBuilding
                      ? `Compiling ${buildType.toUpperCase()} artifact...`
                      : buildError
                      ? "Compilation Error"
                      : `${buildType.toUpperCase()} Build Succeeded`}
                  </span>
                  <span>{buildProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${buildProgress}%` }}
                    className={`h-full transition-all duration-300 ${
                      buildError
                        ? "bg-rose-500"
                        : isFinished
                        ? "bg-emerald-500"
                        : "bg-blue-600 animate-pulse"
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Terminal Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 h-52 overflow-y-auto font-mono text-[11px] text-slate-300 space-y-1 select-text scrollbar-thin scrollbar-thumb-slate-800">
              <div className="text-slate-500 flex items-center justify-between pb-1 border-b border-slate-900">
                <div className="flex items-center gap-1">
                  <Terminal className="w-3 h-3" />
                  <span>Build Engine Console Output</span>
                </div>
                <span className="text-[10px] text-slate-600">
                  {engineType === "auto" ? "Hybrid" : engineType} • {buildType.toUpperCase()}
                </span>
              </div>
              {logs.length === 0 ? (
                <div className="p-8 text-center text-slate-600 space-y-1">
                  <p>Click "Build {buildType.toUpperCase()}" to compile your project into a signed Android binary.</p>
                  <p className="text-[10px] text-slate-700">Standard projects compile in ~3 seconds offline.</p>
                </div>
              ) : (
                logs.map((line, idx) => (
                  <div
                    key={idx}
                    className={
                      line.includes("SUCCESSFUL") || line.includes("[SUCCESS]")
                        ? "text-emerald-400 font-bold"
                        : line.includes("ERROR") || line.includes("FATAL") || line.includes("FAILED")
                        ? "text-rose-400 font-bold"
                        : line.includes("Task") || line.includes("[Gradle Engine]")
                        ? "text-blue-400"
                        : line.includes("Warning") || line.includes("Notice")
                        ? "text-amber-400"
                        : "text-slate-300"
                    }
                  >
                    {line}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Supported Libraries */}
        {activeModalTab === "libraries" && (
          <div className="p-4 space-y-3">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <span>Linked Gradle Maven Dependencies</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                  Auto-Linked to build scripts
                </span>
              </h4>
              <p className="text-[11px] text-slate-400">
                All active Android core dependencies and native libraries compiled into your binary.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl h-52 overflow-y-auto p-2 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
              {allProjectDependencies.map((dep, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center justify-center font-mono text-[10px] font-bold">
                      ✓
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-100 block">{dep.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{dep.gradle}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {dep.cat}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                      {dep.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Diagnostics & Pre-Build Health */}
        {activeModalTab === "diagnostics" && (
          <div className="p-4 space-y-3">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <span>Intermediate Representation (AppIR) Health Check</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Static safety verification prevents compiler failures before launching native toolchains.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl h-52 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-slate-800">
              {validationState?.diagnostics.length === 0 ? (
                <div className="p-6 text-center text-emerald-400 font-semibold text-xs flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  <span>All architecture checks passed with zero warnings!</span>
                </div>
              ) : (
                validationState?.diagnostics.map((diag, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-lg border flex flex-col gap-1 text-xs ${
                      diag.severity === "error"
                        ? "bg-rose-950/30 border-rose-800/60 text-rose-200"
                        : diag.severity === "warning"
                        ? "bg-amber-950/30 border-amber-800/60 text-amber-200"
                        : "bg-blue-950/30 border-blue-800/60 text-blue-200"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-black/40">
                        {diag.code}
                      </span>
                      <span className="text-[10px] uppercase font-mono">{diag.severity}</span>
                    </div>
                    <p className="text-[11px]">{diag.message}</p>
                    {diag.remediation && (
                      <p className="text-[10px] text-slate-400 italic">
                        Tip: {diag.remediation}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Finish Artifact Download & QR Code Section */}
        {isFinished && !buildError && (
          <div className="p-4 bg-emerald-950/20 border-t border-emerald-800/40 flex flex-col gap-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <span>{config.appName} ({buildType.toUpperCase()}) Build Complete!</span>
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                      {buildType === "aab" ? "PLAY STORE BUNDLE" : "INSTALLABLE BINARY"}
                    </span>
                  </h4>
                  <p className="text-[11px] text-emerald-300/80">
                    Package: {config.packageName} • Target: SDK {config.targetSdk || 34}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleDownloadArtifact}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition active:scale-95 shadow-lg"
                  title={
                    buildType === "aab"
                      ? "Download .aab file for Google Play Console upload"
                      : "Download signed .apk for immediate phone installation"
                  }
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>⚡ Download {buildType.toUpperCase()}</span>
                </button>
                <button
                  onClick={handleExportSourceOnly}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition active:scale-95 shadow-md"
                  title="Download complete Jetpack Compose Kotlin project for Android Studio"
                >
                  <span>📦 Export Kotlin .ZIP</span>
                </button>
              </div>
            </div>

            {/* Mobile Scan QR Code (Only for APK builds) */}
            {buildType === "apk" && (
              <div className="bg-slate-950/90 border border-emerald-800/50 rounded-xl p-3.5 flex flex-col sm:flex-row items-center gap-4">
                <div className="p-2 bg-white rounded-xl shadow-md shrink-0 flex items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                      qrDataUrl
                    )}`}
                    alt="Scan QR Code to Download APK directly on Mobile Phone"
                    className="w-24 h-24 object-contain"
                  />
                </div>

                <div className="space-y-1.5 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-emerald-300">
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    <span>Scan to Download & Install Directly on Any Android Phone</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Scan with your mobile camera to download the compiled <strong>{config.appName} APK file</strong> directly into your phone.
                  </p>
                  <div className="text-[11px] text-emerald-300/90 bg-emerald-950/40 p-2 rounded-lg border border-emerald-800/50 space-y-0.5">
                    <span className="font-bold text-emerald-200 block text-[10px]">📱 Ready for Direct Installation:</span>
                    <p className="text-[10px] text-emerald-100/80 leading-normal">
                      Open the downloaded <code>.apk</code> on your phone and tap <strong>Install</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
