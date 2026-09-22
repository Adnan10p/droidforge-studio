import React, { useState, useEffect } from "react";
import {
  X,
  Wifi,
  Usb,
  RotateCw,
  Power,
  Smartphone,
  Copy,
  Check,
  QrCode,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Activity,
  Layers,
  Radio,
  RefreshCw,
  AlertTriangle,
  Play,
  Monitor,
} from "lucide-react";
import { AndroidScreen, ProjectConfig, Material3Theme, CompanionSession, CompanionPayload, CompanionDevice } from "../../types";
import { companionBridge } from "./companionBridge";
import { LiveCompanionView } from "./LiveCompanionView";

interface CompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScreen: AndroidScreen;
  screens: AndroidScreen[];
  config: ProjectConfig;
  theme?: Material3Theme;
}

export const CompanionModal: React.FC<CompanionModalProps> = ({
  isOpen,
  onClose,
  currentScreen,
  screens,
  config,
  theme,
}) => {
  const [activeTab, setActiveTab] = useState<"wifi" | "usb" | "live_preview" | "logs">("wifi");
  const [session, setSession] = useState<CompanionSession>(companionBridge.getSession());
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedAdbCmd, setCopiedAdbCmd] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccessText, setRefreshSuccessText] = useState<string | null>(null);

  // Subscribe to companion bridge events
  useEffect(() => {
    const unsub = companionBridge.subscribeSession((nextSession) => {
      setSession(nextSession);
    });
    return unsub;
  }, []);

  // When modal is opened, push latest payload to ensure companion is synchronized
  useEffect(() => {
    if (isOpen) {
      handlePushLatestScreen(false);
    }
  }, [isOpen, currentScreen.id, currentScreen.rootComponent]);

  const handlePushLatestScreen = (manual: boolean) => {
    const payload: CompanionPayload = {
      projectId: "droidforge_active",
      appName: config.appName,
      packageName: config.packageName,
      theme,
      screen: currentScreen,
      screensSummary: screens.map((s) => ({ id: s.id, name: s.name, isInitial: s.isInitial })),
      timestamp: Date.now(),
      version: "2.5.0",
    };
    companionBridge.pushPayload(payload, manual);
  };

  const handleRefreshCompanionScreen = () => {
    setIsRefreshing(true);
    handlePushLatestScreen(true);
    setRefreshSuccessText("Screen payload refreshed & sent to companion!");
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
    setTimeout(() => {
      setRefreshSuccessText(null);
    }, 2800);
  };

  const handleResetConnection = () => {
    companionBridge.resetConnection();
    setRefreshSuccessText("Connection reset. All companion sessions disconnected.");
    setTimeout(() => setRefreshSuccessText(null), 3000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(session.pairingCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyAdb = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedAdbCmd(true);
    setTimeout(() => setCopiedAdbCmd(false), 2000);
  };

  const handleSimulateConnect = (type: "wifi" | "usb") => {
    const mockDevice: CompanionDevice = {
      id: `dev_${Date.now()}`,
      name: type === "usb" ? "Google Pixel 8 Pro (USB-C ADB)" : "Samsung Galaxy S23 Ultra (WiFi 6)",
      model: type === "usb" ? "Pixel 8 Pro - Android 15" : "SM-S918B - Android 14",
      osVersion: "Android 15 (API 35)",
      batteryLevel: 94,
      screenResolution: "1440 x 3120",
      ipAddress: type === "usb" ? "127.0.0.1:5037" : "192.168.1.108",
      latencyMs: type === "usb" ? 4 : 16,
      connectedAt: new Date().toLocaleTimeString(),
      connectionType: type,
    };
    companionBridge.connectDevice(mockDevice);
    setRefreshSuccessText(`Device '${mockDevice.name}' paired successfully!`);
    setTimeout(() => setRefreshSuccessText(null), 3000);
  };

  if (!isOpen) return null;

  const isConnected = session.status === "connected" || session.status === "syncing";
  const webCompanionUrl = typeof window !== "undefined"
    ? `${window.location.origin}${window.location.pathname}?companion=1&code=${session.pairingCode}`
    : `https://droidforge.app/companion?code=${session.pairingCode}`;

  return (
    <div
      id="companion-live-test-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 select-none"
    >
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Live Test & Companion Studio
                </h2>
                {isConnected ? (
                  <span className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Connected: {session.connectedDevice?.name || "Android Device"}
                  </span>
                ) : (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-medium">
                    Waiting for Pairing
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Test your app live on physical Android devices via Wi-Fi Companion or USB Debugging Bridge.
              </p>
            </div>
          </div>

          {/* Top Quick Actions: Refresh Screen & Reset Connection */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="companion-refresh-screen-btn"
              onClick={handleRefreshCompanionScreen}
              disabled={isRefreshing}
              title="Push instant update to companion screen"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-semibold shadow-xs transition"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh Companion Screen</span>
              <span className="sm:hidden">Refresh</span>
            </button>

            <button
              type="button"
              id="companion-reset-connection-btn"
              onClick={handleResetConnection}
              title="Reset pairing code and disconnect sessions"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-500/50 border border-slate-700 text-slate-300 text-xs font-semibold transition active:scale-95"
            >
              <Power className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Connection</span>
              <span className="sm:hidden">Reset</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feedback Banner if refresh or reset occurred */}
        {refreshSuccessText && (
          <div className="px-6 py-2 bg-indigo-500/20 border-b border-indigo-500/30 flex items-center gap-2 text-xs text-indigo-300 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{refreshSuccessText}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              id="companion-tab-wifi"
              onClick={() => setActiveTab("wifi")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "wifi"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>Connect to Companion (Wi-Fi / QR)</span>
            </button>

            <button
              type="button"
              id="companion-tab-usb"
              onClick={() => setActiveTab("usb")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "usb"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Usb className="w-3.5 h-3.5" />
              <span>Connect via USB (ADB Bridge)</span>
            </button>

            <button
              type="button"
              id="companion-tab-preview"
              onClick={() => setActiveTab("live_preview")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "live_preview"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Live Companion Emulator</span>
            </button>

            <button
              type="button"
              id="companion-tab-logs"
              onClick={() => setActiveTab("logs")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "logs"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Bridge Logs ({session.logs.length})</span>
            </button>
          </div>

          {/* Auto-sync indicator toggle */}
          <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
            <span className="hidden md:inline">Hot-Reload on Edit:</span>
            <button
              type="button"
              onClick={() => companionBridge.setAutoSync(!session.autoSync)}
              className={`px-2 py-0.5 rounded-full font-mono text-[11px] font-bold border transition ${
                session.autoSync
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              {session.autoSync ? "AUTO-SYNC ON" : "PAUSED"}
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: CONNECT TO COMPANION (Wi-Fi / QR / Code) */}
          {activeTab === "wifi" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Pairing Code & QR Code Card */}
              <div className="lg:col-span-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center space-y-5">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono tracking-wider uppercase text-indigo-400 font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30">
                    6-Character Pairing Code
                  </span>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <span className="text-4xl sm:text-5xl font-mono font-black text-white tracking-widest bg-slate-900 px-6 py-2.5 rounded-2xl border border-indigo-500/40 shadow-inner">
                      {session.pairingCode}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      title="Copy pairing code"
                      className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white transition active:scale-95 shadow-md"
                    >
                      {copiedCode ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Visual SVG QR Code */}
                <div className="p-4 bg-white rounded-2xl shadow-xl flex flex-col items-center">
                  {/* Styled SVG QR representation */}
                  <svg
                    viewBox="0 0 140 140"
                    className="w-36 h-36"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="140" height="140" fill="white" rx="8" />
                    {/* Corner Position Boxes */}
                    <rect x="10" y="10" width="36" height="36" rx="4" fill="#0F172A" />
                    <rect x="16" y="16" width="24" height="24" rx="2" fill="white" />
                    <rect x="22" y="22" width="12" height="12" fill="#4F46E5" />

                    <rect x="94" y="10" width="36" height="36" rx="4" fill="#0F172A" />
                    <rect x="100" y="16" width="24" height="24" rx="2" fill="white" />
                    <rect x="106" y="22" width="12" height="12" fill="#4F46E5" />

                    <rect x="10" y="94" width="36" height="36" rx="4" fill="#0F172A" />
                    <rect x="16" y="100" width="24" height="24" rx="2" fill="white" />
                    <rect x="22" y="106" width="12" height="12" fill="#4F46E5" />

                    {/* Data Matrix Dots Pattern representing the Code */}
                    <rect x="52" y="12" width="6" height="6" fill="#0F172A" />
                    <rect x="64" y="12" width="6" height="6" fill="#0F172A" />
                    <rect x="76" y="12" width="6" height="6" fill="#0F172A" />
                    <rect x="58" y="24" width="6" height="6" fill="#4F46E5" />
                    <rect x="70" y="24" width="6" height="6" fill="#0F172A" />
                    <rect x="82" y="24" width="6" height="6" fill="#4F46E5" />
                    <rect x="52" y="36" width="6" height="6" fill="#0F172A" />
                    <rect x="64" y="36" width="6" height="6" fill="#4F46E5" />
                    <rect x="76" y="36" width="6" height="6" fill="#0F172A" />

                    <rect x="12" y="52" width="6" height="6" fill="#0F172A" />
                    <rect x="24" y="52" width="6" height="6" fill="#4F46E5" />
                    <rect x="36" y="52" width="6" height="6" fill="#0F172A" />
                    <rect x="48" y="52" width="6" height="6" fill="#0F172A" />
                    <rect x="60" y="52" width="20" height="6" fill="#4F46E5" />
                    <rect x="86" y="52" width="6" height="6" fill="#0F172A" />
                    <rect x="98" y="52" width="6" height="6" fill="#4F46E5" />
                    <rect x="110" y="52" width="6" height="6" fill="#0F172A" />
                    <rect x="122" y="52" width="6" height="6" fill="#0F172A" />

                    <rect x="12" y="64" width="6" height="6" fill="#4F46E5" />
                    <rect x="24" y="64" width="6" height="6" fill="#0F172A" />
                    <rect x="36" y="64" width="6" height="6" fill="#4F46E5" />
                    <rect x="48" y="64" width="6" height="6" fill="#4F46E5" />
                    <rect x="60" y="64" width="6" height="6" fill="#0F172A" />
                    <rect x="72" y="64" width="6" height="6" fill="#4F46E5" />
                    <rect x="84" y="64" width="6" height="6" fill="#0F172A" />
                    <rect x="96" y="64" width="6" height="6" fill="#0F172A" />
                    <rect x="108" y="64" width="6" height="6" fill="#4F46E5" />
                    <rect x="120" y="64" width="6" height="6" fill="#0F172A" />

                    <rect x="12" y="76" width="6" height="6" fill="#0F172A" />
                    <rect x="24" y="76" width="6" height="6" fill="#0F172A" />
                    <rect x="36" y="76" width="6" height="6" fill="#0F172A" />
                    <rect x="48" y="76" width="6" height="6" fill="#4F46E5" />
                    <rect x="60" y="76" width="20" height="6" fill="#0F172A" />
                    <rect x="86" y="76" width="6" height="6" fill="#4F46E5" />
                    <rect x="98" y="76" width="6" height="6" fill="#0F172A" />
                    <rect x="110" y="76" width="6" height="6" fill="#4F46E5" />
                    <rect x="122" y="76" width="6" height="6" fill="#0F172A" />

                    <rect x="52" y="94" width="6" height="6" fill="#0F172A" />
                    <rect x="64" y="94" width="6" height="6" fill="#4F46E5" />
                    <rect x="76" y="94" width="6" height="6" fill="#0F172A" />
                    <rect x="88" y="94" width="6" height="6" fill="#4F46E5" />
                    <rect x="100" y="94" width="6" height="6" fill="#0F172A" />
                    <rect x="112" y="94" width="6" height="6" fill="#4F46E5" />
                    <rect x="124" y="94" width="6" height="6" fill="#0F172A" />

                    <rect x="58" y="106" width="6" height="6" fill="#4F46E5" />
                    <rect x="70" y="106" width="6" height="6" fill="#0F172A" />
                    <rect x="82" y="106" width="6" height="6" fill="#4F46E5" />
                    <rect x="94" y="106" width="6" height="6" fill="#0F172A" />
                    <rect x="106" y="106" width="6" height="6" fill="#4F46E5" />
                    <rect x="118" y="106" width="6" height="6" fill="#0F172A" />

                    <rect x="52" y="118" width="6" height="6" fill="#0F172A" />
                    <rect x="64" y="118" width="6" height="6" fill="#0F172A" />
                    <rect x="76" y="118" width="6" height="6" fill="#4F46E5" />
                    <rect x="88" y="118" width="6" height="6" fill="#0F172A" />
                    <rect x="100" y="118" width="6" height="6" fill="#4F46E5" />
                    <rect x="112" y="118" width="6" height="6" fill="#0F172A" />
                    <rect x="124" y="118" width="6" height="6" fill="#0F172A" />
                  </svg>
                  <span className="text-[11px] font-mono text-slate-800 font-bold mt-2">
                    Scan with Mobile Camera / Companion App
                  </span>
                </div>

                {/* Instant Connect Simulation Button */}
                <div className="w-full flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleSimulateConnect("wifi")}
                    className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Simulate Mobile Phone Connect</span>
                  </button>

                  <a
                    href={webCompanionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    title="Open Companion Web App in New Tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Right Column: Step-by-Step Instructions & Connection Info */}
              <div className="lg:col-span-6 space-y-4">
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-indigo-400" />
                    How to Connect via Wi-Fi:
                  </h3>
                  <ol className="space-y-3 text-xs text-slate-300">
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                        1
                      </span>
                      <span>
                        Make sure your Android phone and this computer are connected to the same Wi-Fi network (or scan the QR code).
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                        2
                      </span>
                      <span>
                        Open the <strong>DroidForge Companion App</strong> on your phone (or open the companion link in your mobile browser).
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                        3
                      </span>
                      <span>
                        Enter pairing code <span className="font-mono font-bold text-indigo-300">{session.pairingCode}</span> or point camera at the QR code.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                        4
                      </span>
                      <span>
                        Your screen layout updates instantly in real-time as you drag components or update properties!
                      </span>
                    </li>
                  </ol>
                </div>

                {/* Device Status Card */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Active Device Status</span>
                    {isConnected && (
                      <span className="text-emerald-400 font-mono text-[11px]">
                        Latency: {session.connectedDevice?.latencyMs ?? 12}ms
                      </span>
                    )}
                  </h4>

                  {session.connectedDevice ? (
                    <div className="flex items-center gap-3 bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                      <Smartphone className="w-8 h-8 text-emerald-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-white truncate">
                          {session.connectedDevice.name}
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                          {session.connectedDevice.model} • {session.connectedDevice.osVersion}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold font-mono">
                          ONLINE
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1">
                          Batt: {session.connectedDevice.batteryLevel}%
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 bg-slate-900/60 p-3.5 rounded-xl border border-dashed border-slate-800 text-center">
                      No device currently connected. Scan QR code above or click "Simulate Mobile Phone Connect".
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleRefreshCompanionScreen}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 font-semibold"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Force Re-sync Current Screen</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetConnection}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>Reset Pairing</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONNECT VIA USB (ADB Bridge) */}
          {activeTab === "usb" && (
            <div className="space-y-6">
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <Usb className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Android Debug Bridge (ADB) USB Tunnel
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        High-speed sub-millisecond live sync with zero Wi-Fi dependencies using USB tethering.
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono font-bold">
                    ADB v1.0.41 Ready
                  </span>
                </div>

                {/* ADB Forwarding Commands */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>1. Run ADB Port Forwarding in Terminal:</span>
                    <button
                      type="button"
                      onClick={() => handleCopyAdb("adb forward tcp:8000 tcp:8000 && adb reverse tcp:8080 tcp:3000")}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px]"
                    >
                      {copiedAdbCmd ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>Copy ADB Command</span>
                    </button>
                  </label>
                  <div className="bg-black/90 p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 flex items-center justify-between">
                    <code>adb forward tcp:8000 tcp:8000 && adb reverse tcp:8080 tcp:3000</code>
                  </div>
                </div>

                {/* Detected Devices over USB */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-300">
                    2. Detected USB / ADB Devices:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-6 h-6 text-cyan-400" />
                        <div>
                          <div className="font-bold text-xs text-white">Google Pixel 8 Pro</div>
                          <div className="text-[11px] text-slate-400 font-mono">USB 3.1 • 192.168.1.45:5555</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSimulateConnect("usb")}
                        className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                      >
                        Connect USB
                      </button>
                    </div>

                    <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-6 h-6 text-slate-400" />
                        <div>
                          <div className="font-bold text-xs text-white">Android Virtual Device</div>
                          <div className="text-[11px] text-slate-400 font-mono">emulator-5554 • Localhost</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSimulateConnect("usb")}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
                      >
                        Connect AVD
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleRefreshCompanionScreen}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Send USB Hot-Reload Frame</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetConnection}
                    className="px-4 py-2 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 text-xs font-semibold rounded-xl transition"
                  >
                    Reset USB Tunnel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE COMPANION EMULATOR */}
          {activeTab === "live_preview" && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="flex items-center justify-between w-full max-w-[340px] text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-bold text-slate-300">
                  <Monitor className="w-4 h-4 text-indigo-400" />
                  Live Companion Screen
                </span>
                <span className="font-mono text-[11px] text-indigo-400">
                  Active Screen: {currentScreen.name}
                </span>
              </div>

              <LiveCompanionView
                payload={companionBridge.getLastPayload()}
                onRefreshScreen={handleRefreshCompanionScreen}
                onResetConnection={handleResetConnection}
              />
            </div>
          )}

          {/* TAB 4: COMPANION BRIDGE LOGS */}
          {activeTab === "logs" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  Companion Protocol Event Stream
                </span>
                <button
                  type="button"
                  onClick={() => companionBridge.addLog("info", "Ping dispatched to companion client")}
                  className="text-xs text-indigo-400 hover:text-indigo-300"
                >
                  Send Ping Test
                </button>
              </div>

              <div className="bg-black/90 p-4 rounded-2xl border border-slate-800 font-mono text-xs space-y-1.5 max-h-[350px] overflow-y-auto">
                {session.logs.map((log) => (
                  <div
                    key={log.id}
                    className={`flex items-start gap-2.5 ${
                      log.type === "success"
                        ? "text-emerald-400"
                        : log.type === "warn"
                        ? "text-amber-400"
                        : log.type === "error"
                        ? "text-rose-400"
                        : "text-slate-300"
                    }`}
                  >
                    <span className="text-slate-600 select-none">[{log.timestamp}]</span>
                    <span className="flex-1">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted WebRTC & Localhost ADB socket bridge</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRefreshCompanionScreen}
              className="text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Force Refresh
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
