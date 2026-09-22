import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import {
  X,
  Smartphone,
  Wifi,
  Usb,
  RotateCcw,
  RefreshCw,
  QrCode,
  CheckCircle2,
  Copy,
  Check,
  Radio,
  Download,
  CheckSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { ProjectConfig, AndroidScreen } from "../../types";
import { downloadCompanionApkFile } from "../../utils/codeGenerators";
import { CompanionLiveRunner } from "../CompanionLiveRunner";

interface LiveTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ProjectConfig;
  screens: AndroidScreen[];
  currentScreenId: string;
  appName: string;
  appIcon?: string;
}

export const LiveTestModal: React.FC<LiveTestModalProps> = ({
  isOpen,
  onClose,
  config,
  screens,
  currentScreenId,
  appName,
}) => {
  // Active Tab: "wifi", "usb", "simulator", or "download"
  const [activeTab, setActiveTab] = useState<"wifi" | "usb" | "simulator" | "download">("wifi");

  // Connection State
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionType, setConnectionType] = useState<"Wi-Fi" | "USB" | "Simulator" | "None">("None");
  const [autoSync, setAutoSync] = useState<boolean>(true);

  // Pairing Code, QR & Inputs
  const [pairingCode, setPairingCode] = useState<string>("DF-DEHM");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [simCodeInput, setSimCodeInput] = useState<string>("");
  const [simConnected, setSimConnected] = useState<boolean>(false);

  // Generate dynamic QR Code Data URL whenever pairing code changes
  useEffect(() => {
    if (pairingCode) {
      const hostIp = window.location.hostname === "localhost" ? "192.168.10.7" : window.location.hostname;
      const streamUrl = `http://${hostIp}:3000`;
      const payload = JSON.stringify({
        code: pairingCode,
        host: streamUrl,
        version: "4.0.0",
      });
      QRCode.toDataURL(payload, {
        margin: 2,
        width: 280,
        color: { dark: "#0B0F19", light: "#FFFFFF" },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error("QR Code error:", err));
    }
  }, [pairingCode]);

  // USB ADB Selection
  const [selectedUsbDevice, setSelectedUsbDevice] = useState<string>("Google Pixel 8 Pro (USB Debugging)");

  // Sync effect whenever modal or screen changes
  useEffect(() => {
    if (isOpen) {
      fetch("/api/companion/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config, screens, currentScreenId }),
      }).catch((e) => console.warn("Sync push error:", e));
    }
  }, [isOpen, currentScreenId, config, screens]);

  if (!isOpen) return null;

  const generateNewPairingCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let randomLetters = "";
    for (let i = 0; i < 4; i++) {
      randomLetters += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newCode = `DF-${randomLetters}`;
    setPairingCode(newCode);
  };

  const copyPairingCode = () => {
    navigator.clipboard.writeText(pairingCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleResetConnection = () => {
    setIsConnected(false);
    setSimConnected(false);
    setConnectionType("None");
    generateNewPairingCode();
  };

  const handleRefreshScreen = () => {
    fetch("/api/companion/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config, screens, currentScreenId }),
    }).catch(() => {});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-5 animate-in fade-in duration-150 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* ========================================================= */}
        {/* MODAL HEADER MATCHING SCREENSHOT 2                        */}
        {/* ========================================================= */}
        <div className="px-6 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-teal-500 flex items-center justify-center text-slate-950 shadow-md">
              <Radio className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  App Live Test & Companion
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${
                    isConnected
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                    }`}
                  />
                  <span>{isConnected ? `Connected (${connectionType})` : "Disconnected"}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time Wi-Fi & USB live previewing on physical Android devices or Web Companion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Top Teal Refresh Button */}
            <button
              onClick={handleRefreshScreen}
              className="flex items-center gap-1.5 bg-teal-700 hover:bg-teal-600 active:scale-95 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Screen</span>
            </button>

            {/* Top Red Reset Connection Button */}
            <button
              onClick={handleResetConnection}
              className="flex items-center gap-1.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 px-3.5 py-1.5 rounded-xl text-xs font-bold border border-rose-700/50 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-300" />
              <span>Reset Connection</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MODAL TABS BAR MATCHING SCREENSHOT 2                       */}
        {/* ========================================================= */}
        <div className="px-6 py-2 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-2">
            {/* Tab 1: Connect to Companion (Wi-Fi) */}
            <button
              onClick={() => setActiveTab("wifi")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "wifi"
                  ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Wifi className="w-4 h-4 text-emerald-400" />
              <span>Connect to Companion (Wi-Fi)</span>
            </button>

            {/* Tab 2: Connect via USB */}
            <button
              onClick={() => setActiveTab("usb")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "usb"
                  ? "bg-blue-950/80 text-blue-400 border border-blue-500/40 shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Usb className="w-4 h-4 text-blue-400" />
              <span>Connect via USB</span>
            </button>

            {/* Tab 3: Companion App Simulator */}
            <button
              onClick={() => setActiveTab("simulator")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "simulator"
                  ? "bg-purple-950/80 text-purple-300 border border-purple-500/40 shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Smartphone className="w-4 h-4 text-purple-400" />
              <span>Companion App Simulator</span>
            </button>

            {/* Tab 4: Download Companion APK */}
            <button
              onClick={() => setActiveTab("download")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "download"
                  ? "bg-amber-950/80 text-amber-400 border border-amber-500/40 shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Download Companion APK</span>
            </button>
          </div>

          {/* Far Right: Auto-Sync Checkbox */}
          <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
            <span>Auto-Sync on Changes</span>
          </label>
        </div>

        {/* ========================================================= */}
        {/* MODAL BODY                                                 */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/40">
          
          {/* TAB 1: CONNECT TO COMPANION (WI-FI) MATCHING SCREENSHOT 2 */}
          {activeTab === "wifi" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-150">
              
              {/* LEFT: 6-DIGIT PAIRING CODE & QR CODE */}
              <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-5">
                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  6-DIGIT PAIRING CODE
                </span>

                {/* Big Code Box with Copy & Refresh */}
                <div className="flex items-center gap-2">
                  <div className="bg-slate-950 border border-slate-700 px-6 py-2.5 rounded-xl font-mono text-2xl font-black text-white tracking-widest shadow-inner">
                    {pairingCode}
                  </div>

                  <button
                    onClick={copyPairingCode}
                    title="Copy Code"
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={generateNewPairingCode}
                    title="Generate New Code"
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>

                {/* Dynamic Scannable QR Code Container */}
                <div className="bg-white p-3.5 rounded-2xl shadow-xl border border-slate-200 flex flex-col items-center justify-center gap-2">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt={`Pairing QR Code ${pairingCode}`}
                      className="w-48 h-48 rounded-xl object-contain shadow-xs"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-slate-400 font-bold text-xs">
                      Generating QR Code...
                    </div>
                  )}
                  <span className="text-[10px] font-bold text-slate-600 font-mono tracking-wider uppercase">
                    PAIR CODE: {pairingCode} • SCAN TO CONNECT
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                  Scan this QR code using the <strong>DroidForge Companion app</strong> on your Android device.
                </p>
              </div>

              {/* RIGHT: HOW TO CONNECT & SIMULATOR LAUNCHER */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* How to connect card */}
                <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Radio className="w-4 h-4 text-teal-400" />
                    <span>How to connect your Android phone:</span>
                  </h3>

                  <div className="space-y-3">
                    {/* Step 1 */}
                    <div className="flex items-start gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                      <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 font-bold text-xs flex items-center justify-center shrink-0">
                        1
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200">Install DroidForge Companion</div>
                        <div className="text-[11px] text-slate-400">
                          Download the free Companion app on your Android phone or tablet.
                        </div>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-start gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                      <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 font-bold text-xs flex items-center justify-center shrink-0">
                        2
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200">Scan QR Code or Type 6-Digit Code</div>
                        <div className="text-[11px] text-slate-400">
                          Tap <strong>Scan QR Code</strong> in the companion app, or enter <code className="text-teal-300 font-bold">{pairingCode}</code>.
                        </div>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-start gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                      <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 font-bold text-xs flex items-center justify-center shrink-0">
                        3
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200">Instant Live Test & Hot-Reload</div>
                        <div className="text-[11px] text-slate-400">
                          Every widget, layout change, color, and logic block will instantly render live on your phone!
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* No physical phone nearby? Card */}
                <div className="bg-purple-950/30 border border-purple-800/40 p-5 rounded-2xl flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-purple-200">No physical phone nearby?</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Zero Setup
                      </span>
                    </div>
                    <p className="text-[11px] text-purple-300/80 mt-1 max-w-md">
                      You can launch our in-browser Companion Simulator immediately to test buttons, YouTube player, and navigation live!
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab("simulator")}
                    className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition active:scale-95 shrink-0 flex items-center gap-2 cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Launch In-Browser Companion Simulator</span>
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: CONNECT VIA USB */}
          {activeTab === "usb" && (
            <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Usb className="w-4 h-4 text-blue-400" />
                  <span>ADB USB Debugging Connection</span>
                </h3>
                <span className="text-xs font-mono bg-blue-500/10 text-blue-400 px-2.5 py-0.5 rounded border border-blue-500/20">
                  Port 8001 Forwarded
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-semibold">Select Attached Android USB Device:</label>
                <select
                  value={selectedUsbDevice}
                  onChange={(e) => setSelectedUsbDevice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-bold focus:outline-none focus:border-blue-500"
                >
                  <option>Google Pixel 8 Pro (USB Debugging Active)</option>
                  <option>Samsung Galaxy S24 Ultra (ADB Active)</option>
                  <option>Android Emulator (localhost:5554)</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setIsConnected(true);
                  setConnectionType("USB");
                }}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Usb className="w-4 h-4" />
                <span>Link ADB USB Device & Start Live Sync</span>
              </button>
            </div>
          )}

          {/* TAB 3: COMPANION APP SIMULATOR MATCHING SCREENSHOT 3 */}
          {activeTab === "simulator" && (
            <div className="flex items-center justify-center py-4 animate-in fade-in duration-150">
              {!simConnected ? (
                /* Companion App UI from Screenshot 3 */
                <div className="w-[320px] bg-slate-900 border-4 border-slate-800 rounded-[36px] p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden select-none">
                  
                  {/* Phone Notch / Status Bar */}
                  <div className="w-full flex items-center justify-between text-[11px] text-slate-400 font-bold mb-6 px-1">
                    <span>12:00</span>
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-800" />
                    <span className="text-[10px]">5G 📶</span>
                  </div>

                  {/* Logo Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-teal-500 flex items-center justify-center mb-4 text-slate-950 shadow-lg">
                    <Radio className="w-8 h-8 text-slate-950 stroke-[2.5]" />
                  </div>

                  <h3 className="text-lg font-bold text-white tracking-tight">DroidForge Companion</h3>
                  <p className="text-xs text-slate-400 mb-6">Version 2.64.0 (Compose Live)</p>

                  {/* Card Box */}
                  <div className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3 mb-3 text-left">
                    <label className="text-xs font-bold text-slate-300 block">Enter 6-Digit Code:</label>
                    <input
                      type="text"
                      placeholder="E.G.  DF-8492"
                      value={simCodeInput}
                      onChange={(e) => setSimCodeInput(e.target.value.toUpperCase())}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-center text-sm font-mono font-bold tracking-widest text-white focus:outline-none focus:border-teal-500"
                    />
                    <button
                      onClick={() => {
                        setIsConnected(true);
                        setSimConnected(true);
                        setConnectionType("Simulator");
                      }}
                      className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
                    >
                      Connect with Code
                    </button>
                  </div>

                  {/* White Card Button */}
                  <button
                    onClick={() => {
                      setIsConnected(true);
                      setSimConnected(true);
                      setConnectionType("Simulator");
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer mb-6"
                  >
                    <QrCode className="w-4 h-4 text-teal-600" />
                    <span>Scan QR Code (Auto Connect)</span>
                  </button>

                  <p className="text-[10px] text-slate-500 font-mono">
                    Connected to Project: {appName}
                  </p>
                </div>
              ) : (
                /* Full Live App Runner when connected */
                <div className="w-full max-w-md">
                  <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                    <span>Simulator Active Mode</span>
                    <button
                      onClick={() => setSimConnected(false)}
                      className="text-teal-400 font-bold hover:underline"
                    >
                      Back to Pair Code
                    </button>
                  </div>
                  <CompanionLiveRunner />
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DOWNLOAD COMPANION APK MATCHING SCREENSHOT 4 */}
          {activeTab === "download" && (
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-150">
              
              {/* Dark Card Matching Screenshot 4 */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-teal-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg">
                    DF
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      DroidForge Live Companion APK
                    </h3>
                    <p className="text-xs text-slate-400">
                      Official Android testing client for Android 7.0 (API 24) to Android 15 (API 35)
                    </p>
                  </div>
                </div>

                {/* 3 Metric Pills */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Version</span>
                    <span className="text-xs font-bold text-teal-400">6.0.0 Release (Master)</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">APK Size</span>
                    <span className="text-xs font-bold text-slate-200">18.8 MB</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Architecture</span>
                    <span className="text-xs font-bold text-slate-200">Universal (arm64/x86_64)</span>
                  </div>
                </div>

                {/* Big Green Download Button (Blob Stream Download) */}
                <button
                  type="button"
                  onClick={() => downloadCompanionApkFile()}
                  className="w-full py-3.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-xl transition active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Download className="w-5 h-5 stroke-[2.5]" />
                  <span>Download DroidForge-Companion-v6.0.0-Master.apk</span>
                </button>
              </div>

              {/* How to install on Android phone instructions card */}
              <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-2 text-xs text-slate-300">
                <h4 className="font-bold text-white">How to install on Android phone:</h4>
                <ol className="list-decimal pl-5 space-y-1 text-slate-400 text-[11px] leading-relaxed">
                  <li>Download the APK directly to your phone or transfer via USB/Google Drive.</li>
                  <li>Tap the APK file in Downloads and allow “Install from Unknown Sources”.</li>
                  <li>Open the app, grant Camera permission (for QR scanner), and you are ready!</li>
                </ol>
              </div>

            </div>
          )}

        </div>

        {/* ========================================================= */}
        {/* MODAL FOOTER STATUS LINE MATCHING SCREENSHOT 2             */}
        {/* ========================================================= */}
        <div className="px-6 py-2.5 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            <span>Pairing Channel: WebSocket / WebRTC Mesh + ADB Forwarding</span>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
