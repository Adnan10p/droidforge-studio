import React, { useState } from "react";
import {
  Cpu,
  Boxes,
  ShieldCheck,
  Plus,
  Trash2,
  Check,
  Layers,
  Terminal,
  FileCode2,
  Settings,
  Smartphone,
  ExternalLink,
} from "lucide-react";
import { ProjectConfig, AndroidDependency, NativeLibrary } from "../../types";

interface SdkNativePanelProps {
  config: ProjectConfig;
  onUpdateConfig: (updates: Partial<ProjectConfig>) => void;
  onOpenAppProperties?: () => void;
}

const ALL_PERMISSIONS = [
  { name: "android.permission.INTERNET", desc: "Allow app to access internet & network APIs" },
  { name: "android.permission.ACCESS_FINE_LOCATION", desc: "High accuracy GPS coordinates" },
  { name: "android.permission.ACCESS_COARSE_LOCATION", desc: "Cellular & Wi-Fi location estimate" },
  { name: "android.permission.CAMERA", desc: "Access CameraX hardware streams" },
  { name: "android.permission.POST_NOTIFICATIONS", desc: "Display heads-up notifications (Android 13+)" },
  { name: "android.permission.VIBRATE", desc: "Trigger haptic feedback engine" },
  { name: "android.permission.RECORD_AUDIO", desc: "Microphone recording & Live API" },
  { name: "android.permission.BLUETOOTH_SCAN", desc: "Discover nearby BLE peripherals" },
  { name: "android.permission.READ_MEDIA_IMAGES", desc: "Photo picker access" },
];

export const SdkNativePanel: React.FC<SdkNativePanelProps> = ({
  config,
  onUpdateConfig,
  onOpenAppProperties,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"sdk" | "deps" | "native" | "permissions">("sdk");
  const [newDepInput, setNewDepInput] = useState("");
  const [newNativeName, setNewNativeName] = useState("");
  const [newNativeType, setNewNativeType] = useState<"so" | "aar" | "jar">("so");
  const [newCustomPerm, setNewCustomPerm] = useState("");

  // Add custom permission
  const handleAddCustomPermission = () => {
    if (!newCustomPerm.trim()) return;
    const perm = newCustomPerm.trim();
    if (!config.permissions.includes(perm)) {
      onUpdateConfig({ permissions: [...config.permissions, perm] });
    }
    setNewCustomPerm("");
  };

  // Toggle permission
  const handleTogglePermission = (perm: string) => {
    const exists = config.permissions.includes(perm);
    const updated = exists
      ? config.permissions.filter((p) => p !== perm)
      : [...config.permissions, perm];
    onUpdateConfig({ permissions: updated });
  };

  // Toggle dependency
  const handleToggleDependency = (id: string) => {
    const updated = config.dependencies.map((d) => (d.id === id ? { ...d, enabled: !d.enabled } : d));
    onUpdateConfig({ dependencies: updated });
  };

  // Update dependency version
  const handleUpdateDependencyVersion = (id: string, newVersion: string) => {
    const updated = config.dependencies.map((d) =>
      d.id === id ? { ...d, version: newVersion.trim() } : d
    );
    onUpdateConfig({ dependencies: updated });
  };

  // Remove dependency
  const handleRemoveDependency = (id: string) => {
    const updated = config.dependencies.filter((d) => d.id !== id);
    onUpdateConfig({ dependencies: updated });
  };

  // Add custom dependency
  const handleAddCustomDependency = () => {
    if (!newDepInput.trim()) return;
    const parts = newDepInput.trim().split(":");
    if (parts.length < 3) {
      alert("Please enter format: group:artifact:version (e.g. androidx.work:work-runtime-ktx:2.9.1)");
      return;
    }
    const newDep: AndroidDependency = {
      id: `dep_${Date.now()}`,
      name: parts[1],
      group: parts[0],
      artifact: parts[1],
      version: parts[2],
      description: "Custom Maven / Gradle dependency",
      enabled: true,
      category: "Utility",
    };
    onUpdateConfig({ dependencies: [...config.dependencies, newDep] });
    setNewDepInput("");
  };

  // Add custom native library
  const handleAddNativeLib = () => {
    if (!newNativeName.trim()) return;
    const newLib: NativeLibrary = {
      id: `lib_${Date.now()}`,
      name: newNativeName.trim(),
      fileName: newNativeName.trim(),
      type: newNativeType,
      abi: "arm64-v8a",
      size: "1.2 MB",
      enabled: true,
      jniMethodSignature: "external fun nativeBridgeAction(): String",
    };
    onUpdateConfig({ nativeLibs: [...config.nativeLibs, newLib] });
    setNewNativeName("");
  };

  return (
    <div
      id="sdk-ndk-panel-container"
      className="flex-1 bg-slate-950 flex flex-col h-full overflow-y-auto text-slate-200 select-none p-6"
    >
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Header & SubTabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-400" />
              <span>Android SDK & Native Library Engine</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure Target Android SDK 35, Jetpack Compose K2, ABI Architectures, C/C++ NDK JNI, and Maven dependencies.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start">
            <button
              onClick={() => setActiveSubTab("sdk")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeSubTab === "sdk" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              SDK & Build
            </button>
            <button
              onClick={() => setActiveSubTab("deps")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeSubTab === "deps" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Dependencies
            </button>
            <button
              onClick={() => setActiveSubTab("native")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeSubTab === "native" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              NDK & C++ (.so)
            </button>
            <button
              onClick={() => setActiveSubTab("permissions")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeSubTab === "permissions" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Permissions
            </button>
          </div>
        </div>

        {/* Tab 1: Android SDK & Build Config */}
        {activeSubTab === "sdk" && (
          <div className="space-y-4">
            {/* App Properties & Branding Quick Overview Card */}
            <div className="bg-gradient-to-r from-violet-950/40 via-slate-900 to-slate-900 border border-violet-800/40 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center overflow-hidden shrink-0">
                  {config.appIcon ? (
                    <img src={config.appIcon} alt="App Icon" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <Smartphone className="w-6 h-6 text-violet-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{config.appName}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-900/60 text-violet-300 border border-violet-700/50">
                      v{config.versionName} ({config.versionCode})
                    </span>
                    {config.enableSplashScreen && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800/60">
                        Splash Enabled
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono text-slate-400">{config.packageName}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-[11px] text-slate-400">
                      Ads: {config.googleAdsAppId || config.startIoAppId || config.unityAdsGameId || config.appLovinSdkKey ? "Configured" : "None"}
                    </span>
                  </div>
                </div>
              </div>

              {onOpenAppProperties && (
                <button
                  id="sdk-open-app-properties-btn"
                  onClick={onOpenAppProperties}
                  className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-sm active:scale-95 shrink-0"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Configure App Properties</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* compileSdk */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                  compileSdk
                </span>
                <div className="text-xl font-bold text-white">{config.compileSdk}</div>
                <p className="text-[11px] text-slate-500 mt-1">Android 15 (Vanilla Ice Cream API 35)</p>
              </div>

              {/* targetSdk */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                  targetSdk
                </span>
                <select
                  value={config.targetSdk}
                  onChange={(e) => onUpdateConfig({ targetSdk: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-sm font-bold text-white"
                >
                  <option value={35}>35 (Android 15)</option>
                  <option value={34}>34 (Android 14)</option>
                  <option value={33}>33 (Android 13)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">Google Play 2026 Target Requirement</p>
              </div>

              {/* minSdk */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                  minSdk (Minimum Support)
                </span>
                <select
                  value={config.minSdk}
                  onChange={(e) => onUpdateConfig({ minSdk: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-sm font-bold text-white"
                >
                  <option value={24}>24 (Android 7.0 - 95.8% devices)</option>
                  <option value={26}>26 (Android 8.0 - 91.2% devices)</option>
                  <option value={30}>30 (Android 11.0 - 82.5% devices)</option>
                  <option value={33}>33 (Android 13.0 - 64.0% devices)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">Broad backward compatibility</p>
              </div>
            </div>

            {/* Architecture ABIs */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <h2 className="text-xs font-semibold text-white uppercase tracking-wider">
                Target CPU Architectures (ndk.abiFilters)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { abi: "arm64-v8a", desc: "Modern 64-bit ARM (Standard for 99% modern phones)" },
                  { abi: "armeabi-v7a", desc: "Legacy 32-bit ARM (Older budget hardware)" },
                  { abi: "x86_64", desc: "Intel / AMD (Android Studio Emulators & ChromeOS)" },
                ].map(({ abi, desc }) => {
                  const isChecked = config.architectures.includes(abi as any);
                  return (
                    <label
                      key={abi}
                      className={`p-3 rounded-lg border cursor-pointer flex items-start gap-2.5 transition ${
                        isChecked
                          ? "bg-blue-900/30 border-blue-500/80 text-white"
                          : "bg-slate-950/60 border-slate-800 text-slate-400"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          const updated = isChecked
                            ? config.architectures.filter((a) => a !== abi)
                            : [...config.architectures, abi as any];
                          onUpdateConfig({ architectures: updated });
                        }}
                        className="rounded bg-slate-950 border-slate-700 text-blue-600 mt-0.5"
                      />
                      <div>
                        <span className="font-mono text-xs font-bold block">{abi}</span>
                        <span className="text-[11px] text-slate-400">{desc}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Kotlin & Gradle Versions */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <h2 className="text-xs font-semibold text-white uppercase tracking-wider">
                Kotlin 2.0 & Jetpack Compose Compiler
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono block">Kotlin Version</span>
                  <span className="font-mono font-bold text-white">{config.kotlinVersion} (K2)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono block">Compose Compiler</span>
                  <span className="font-mono font-bold text-white">{config.composeVersion}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono block">Gradle Wrapper</span>
                  <span className="font-mono font-bold text-white">{config.gradleVersion}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono block">AGP Version</span>
                  <span className="font-mono font-bold text-white">8.7.0</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Dependencies Manager */}
        {activeSubTab === "deps" && (
          <div className="space-y-4">
            {/* Custom Dependency Adder */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <span className="text-xs font-semibold text-white uppercase tracking-wider block">
                + Add Maven / Gradle Dependency
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. com.google.accompanist:accompanist-permissions:0.36.0"
                  value={newDepInput}
                  onChange={(e) => setNewDepInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleAddCustomDependency}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition"
                >
                  Add Dependency
                </button>
              </div>
            </div>

            {/* Dependencies Table */}
            <div className="space-y-2.5">
              {config.dependencies.map((dep) => (
                <div
                  key={dep.id}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                    dep.enabled
                      ? "bg-slate-900/90 border-slate-800 shadow-xs"
                      : "bg-slate-950/40 border-slate-900 opacity-60"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{dep.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-900/50">
                        {dep.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 font-mono truncate">
                      implementation("{dep.group}:{dep.artifact}:<span className="text-cyan-400 font-bold">{dep.version}</span>")
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{dep.description}</p>
                  </div>

                  {/* Version Edit & Status Toggle */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-mono">v</span>
                      <input
                        type="text"
                        value={dep.version}
                        onChange={(e) => handleUpdateDependencyVersion(dep.id, e.target.value)}
                        className="w-16 bg-transparent text-xs font-mono font-bold text-cyan-300 focus:outline-none"
                        title="Click to edit dependency version"
                      />
                    </div>

                    <button
                      onClick={() => handleToggleDependency(dep.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        dep.enabled
                          ? "bg-emerald-600/30 text-emerald-400 border border-emerald-500/50"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {dep.enabled ? "Active" : "Disabled"}
                    </button>

                    <button
                      onClick={() => handleRemoveDependency(dep.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600/80 text-slate-400 hover:text-white transition"
                      title="Remove dependency"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Native NDK & C++ */}
        {activeSubTab === "native" && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">C/C++ NDK Support & CMake Build</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Allows embedding high-performance C++20 algorithms, cryptography, and JNI bridges.
                </p>
              </div>
              <button
                onClick={() => onUpdateConfig({ enableNdk: !config.enableNdk })}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  config.enableNdk
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {config.enableNdk ? "NDK Enabled" : "Enable NDK"}
              </button>
            </div>

            {config.enableNdk && (
              <>
                {/* Add Native Lib */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                  <span className="text-xs font-semibold text-white uppercase tracking-wider block">
                    Link Native .so / .aar / .jar Library
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. libopencv_java4.so or my-engine.aar"
                      value={newNativeName}
                      onChange={(e) => setNewNativeName(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none"
                    />
                    <select
                      value={newNativeType}
                      onChange={(e) => setNewNativeType(e.target.value as any)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                    >
                      <option value="so">.so (Shared Object)</option>
                      <option value="aar">.aar (Android Archive)</option>
                      <option value="jar">.jar (Java Archive)</option>
                    </select>
                    <button
                      onClick={handleAddNativeLib}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition"
                    >
                      Add Native Lib
                    </button>
                  </div>
                </div>

                {/* Native Libs Table */}
                <div className="space-y-2">
                  {config.nativeLibs.map((lib) => (
                    <div
                      key={lib.id}
                      className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-white">{lib.fileName}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800/60">
                            {lib.type.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{lib.size}</span>
                        </div>
                        {lib.jniMethodSignature && (
                          <p className="text-[11px] font-mono text-cyan-400 mt-1">
                            {lib.jniMethodSignature}
                          </p>
                        )}
                      </div>

                      <span className="text-xs text-emerald-400 font-mono bg-emerald-950/60 px-2 py-1 rounded border border-emerald-800/60">
                        Linked via CMake
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 4: Android Permissions */}
        {activeSubTab === "permissions" && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Selected permissions will be automatically injected into `AndroidManifest.xml` and validated against modern Android 15 runtime permission protocols.
            </p>

            {/* Custom Permission Add Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <span className="text-xs font-semibold text-white uppercase tracking-wider block">
                Add Custom Android Permission
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. android.permission.BLUETOOTH_CONNECT or com.android.vending.BILLING"
                  value={newCustomPerm}
                  onChange={(e) => setNewCustomPerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddCustomPermission();
                  }}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleAddCustomPermission}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Permission</span>
                </button>
              </div>
            </div>

            {/* Standard Preset Permissions */}
            <div className="space-y-2">
              {ALL_PERMISSIONS.map((p) => {
                const isSelected = config.permissions.includes(p.name);
                return (
                  <div
                    key={p.name}
                    onClick={() => handleTogglePermission(p.name)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                      isSelected
                        ? "bg-blue-900/30 border-blue-500/80 text-white"
                        : "bg-slate-900/50 border-slate-800 hover:bg-slate-900 text-slate-400"
                    }`}
                  >
                    <div>
                      <span className="font-mono text-xs font-bold block">{p.name}</span>
                      <span className="text-xs text-slate-400 mt-0.5 block">{p.desc}</span>
                    </div>
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center ${
                        isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-slate-600"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Extra Permissions List */}
            {config.permissions.filter((perm) => !ALL_PERMISSIONS.some((ap) => ap.name === perm)).length > 0 && (
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Additional Custom Permissions
                </span>
                <div className="space-y-2">
                  {config.permissions
                    .filter((perm) => !ALL_PERMISSIONS.some((ap) => ap.name === perm))
                    .map((customPerm) => (
                      <div
                        key={customPerm}
                        className="p-3 bg-slate-900 border border-blue-500/50 rounded-xl flex items-center justify-between"
                      >
                        <div>
                          <span className="font-mono text-xs font-bold text-blue-300 block">{customPerm}</span>
                          <span className="text-[11px] text-slate-500 font-mono">Custom Manifest Tag</span>
                        </div>
                        <button
                          onClick={() => handleTogglePermission(customPerm)}
                          className="text-slate-500 hover:text-red-400 p-1 rounded transition"
                          title="Remove permission"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
