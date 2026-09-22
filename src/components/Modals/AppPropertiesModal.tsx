import React, { useState } from "react";
import {
  X,
  Smartphone,
  Image as ImageIcon,
  DollarSign,
  Key,
  Gamepad2,
  Bell,
  MapPin,
  ShieldAlert,
  Info,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Plus,
  Upload,
  Layers,
  Copy,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { ProjectConfig } from "../../types";

interface AppPropertiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ProjectConfig;
  onUpdateConfig: (updates: Partial<ProjectConfig>) => void;
}

type PropertyTab = "general" | "branding" | "splash" | "monetization" | "services";

const SAMPLE_ICONS = [
  {
    name: "Modern Gradient",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=512&auto=format&fit=crop&q=80",
  },
  {
    name: "Cyber Neon",
    url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=512&auto=format&fit=crop&q=80",
  },
  {
    name: "Minimal Emerald",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=512&auto=format&fit=crop&q=80",
  },
  {
    name: "Abstract Waves",
    url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=512&auto=format&fit=crop&q=80",
  },
];

const MORE_INFO_GUIDES: Record<string, { title: string; body: string; link?: string }> = {
  appName: {
    title: "Android App Name (android:label)",
    body: "This is the user-facing name of your app. It will show in your phone's launcher, settings screen, app switcher, notifications, and other parts of the Android interface. Note that the app name can be different from the project name.",
    link: "https://developer.android.com/guide/topics/manifest/application-element#label",
  },
  icon: {
    title: "Adaptive Launcher Icon (512x512px)",
    body: "Your app's icon is displayed on your phone's launcher alongside the app name. Use a square or round .png image of size 512x512px for best results. DroidForge generates adaptive icon XML layers (foreground, background, and monochrome tint) for Android 8.0 through Android 15.",
    link: "https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive",
  },
  splashScreen: {
    title: "Android 12+ Core SplashScreen API",
    body: "If enabled, your app will show a splash screen while your app is first launched and is loading. A splash screen can be used to display custom branding or loading progress. Modern Android displays this automatically during cold startup.",
    link: "https://developer.android.com/develop/ui/views/launch/splash-screen",
  },
  splashImage: {
    title: "Splash Artwork & Window Background",
    body: "If the splash screen property is enabled, this image will be used as the branding artwork while your app is loading. It should feature a clean central glyph or wordmark on an opaque background color.",
    link: "https://developer.android.com/develop/ui/views/launch/splash-screen/migrate",
  },
  packageName: {
    title: "Application ID / Package Name",
    body: "The package name is used to uniquely identify your app in distribution stores you would like to publish it in (Google Play Store, Samsung Galaxy Store, Amazon Appstore). Once published, it can NEVER be changed without publishing a brand new app.",
    link: "https://developer.android.com/build/configure-app-module#set-application-id",
  },
  versionCode: {
    title: "Version Code (Android Build Number)",
    body: "Your app's version code is used by Google Play and other distribution stores to identify each version of your app. Make sure to increment this property by 1 every time you export for publishing. Google Play rejects APKs/AABs with equal or lower version codes.",
    link: "https://developer.android.com/build/publish-library/upload-library#versioning",
  },
  versionName: {
    title: "Version Name (User-Facing Version)",
    body: "The version name is used by users to distinguish different versions of your app. This property can contain additional version context in the form of text (e.g., '1.0.0', '2.1-beta').",
    link: "https://developer.android.com/studio/publish/versioning",
  },
  googleAdsAppId: {
    title: "Google Ads / AdMob App ID",
    body: "This ID issued by Google Ads is used to correctly initialize Google AdMob/Ad Manager on your app. Required in AndroidManifest.xml under 'com.google.android.gms.ads.APPLICATION_ID'. Apps without this crash immediately on startup when AdMob is invoked.",
    link: "https://developers.google.com/admob/android/quick-start#update_your_androidmanifestxml",
  },
  startIoAppId: {
    title: "Start.io (formerly StartApp) App ID",
    body: "This ID issued by Start.io is used to correctly initialize the Start.io SDK on your app. It links interstitial, rewarded, and banner ads to your Start.io publisher account.",
    link: "https://support.start.io/hc/en-us/articles/360010777598-Android-SDK-Integration",
  },
  unityAdsGameId: {
    title: "Unity Ads Game ID",
    body: "This Game ID issued by Unity Ads is used to correctly initialize the Unity Ads SDK on your app. Find it in the Unity Dashboard under Monetization > Placements.",
    link: "https://docs.unity.com/ads/en-us/manual/InitializingTheSDKAndroid",
  },
  appLovinSdkKey: {
    title: "AppLovin MAX SDK Key",
    body: "The SDK key from your AppLovin account. Required by all AppLovin Max ad components. Find it under Account > Keys in the AppLovin dashboard. Required in AndroidManifest.xml under 'applovin.sdk.key'.",
    link: "https://dash.applovin.com/documentation/core/integration/android/integration",
  },
  googlePlayGamesAppId: {
    title: "Google Play Games App ID",
    body: "This key is used by the Google Play Games service to connect to your app. It allows player sign-in, cloud save, achievements, and real-time leaderboards in the Play Console.",
    link: "https://developers.google.com/games/services/android/quickstart",
  },
  oneSignalAppId: {
    title: "OneSignal Push Notification App ID",
    body: "This key is used by OneSignal push notification services to connect to your app. Configured in AndroidManifest.xml to route push tokens to your OneSignal application dashboard.",
    link: "https://documentation.onesignal.com/docs/android-sdk-setup",
  },
  googleMapsApiKey: {
    title: "Google Maps Android API Key",
    body: "This key is used by the Google Maps service to connect to your app. Enables MapView, vector map tiles, marker clustering, and location camera positioning.",
    link: "https://developers.google.com/maps/documentation/android-sdk/get-api-key",
  },
  googleCloudProjectNumber: {
    title: "Google Cloud Project Number (Play Integrity)",
    body: "The Google Cloud Project Number is used by the Play Integrity component to connect to your Google Cloud project. It verifies tamper-free binary execution, licensed user status, and hardware attestation.",
    link: "https://developer.android.com/google/play/integrity/overview",
  },
};

export const AppPropertiesModal: React.FC<AppPropertiesModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
}) => {
  const [activeTab, setActiveTab] = useState<PropertyTab>("general");
  const [selectedInfoKey, setSelectedInfoKey] = useState<string | null>(null);
  const [iconShape, setIconShape] = useState<"circle" | "squircle" | "rounded">("squircle");
  const [showSecretKey, setShowSecretKey] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleShowSecret = (key: string) => {
    setShowSecretKey((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Helper to open more info
  const openInfo = (key: string) => {
    setSelectedInfoKey(key);
  };

  // Check validity of package name
  const isPackageValid = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(config.packageName || "");

  // Fill sample test IDs for development
  const handleFillTestKeys = () => {
    onUpdateConfig({
      googleAdsAppId: "ca-app-pub-3940256099942544~3347511713", // Official Google AdMob sample test ID
      startIoAppId: "208765432",
      unityAdsGameId: "5432109",
      appLovinSdkKey: "k3p_AbCdEfGhIjKlMnOpQrStUvWxYz_1234567890TestKeySample",
      googlePlayGamesAppId: "987654321012",
      oneSignalAppId: "4b5d2e34-7a1b-4f9e-9d2a-1c8e7f5a3b09",
      googleMapsApiKey: "AIzaSyD-DemoTestApiKeySampleForMapsOnly",
      googleCloudProjectNumber: "250958817990",
    });
  };

  return (
    <div
      id="app-properties-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150 select-none"
    >
      <div
        id="app-properties-modal-card"
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  App Properties & Publishing Setup
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20 font-semibold">
                  Google Play & SDKs
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure launcher identity, package IDs, versioning, monetization SDKs, and native cloud APIs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="fill-sample-test-keys-btn"
              onClick={handleFillTestKeys}
              title="Populate test IDs for AdMob, Unity, and APIs"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>Fill Test SDK IDs</span>
            </button>
            <button
              id="close-app-properties-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 pb-2 bg-slate-950/50 border-b border-slate-800 flex items-center gap-1 overflow-x-auto">
          <button
            id="tab-btn-prop-general"
            onClick={() => setActiveTab("general")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === "general"
                ? "bg-violet-600 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>General & Versioning</span>
          </button>

          <button
            id="tab-btn-prop-branding"
            onClick={() => setActiveTab("branding")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === "branding"
                ? "bg-violet-600 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>App Icon (512x512)</span>
          </button>

          <button
            id="tab-btn-prop-splash"
            onClick={() => setActiveTab("splash")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === "splash"
                ? "bg-violet-600 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Splash Screen</span>
            {config.enableSplashScreen && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>

          <button
            id="tab-btn-prop-monetization"
            onClick={() => setActiveTab("monetization")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === "monetization"
                ? "bg-violet-600 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Ad Networks & Monetization</span>
            {(config.googleAdsAppId || config.startIoAppId || config.unityAdsGameId || config.appLovinSdkKey) && (
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded-full font-mono font-bold">
                Active
              </span>
            )}
          </button>

          <button
            id="tab-btn-prop-services"
            onClick={() => setActiveTab("services")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === "services"
                ? "bg-violet-600 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Cloud & Game Services</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: GENERAL & VERSIONING */}
          {activeTab === "general" && (
            <div className="space-y-6 animate-in fade-in duration-100">
              {/* Top Banner with App Preview */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative">
                  <div
                    className={`w-16 h-16 bg-slate-800 overflow-hidden shadow-lg border border-slate-700 flex items-center justify-center ${
                      iconShape === "circle"
                        ? "rounded-full"
                        : iconShape === "squircle"
                        ? "rounded-2xl"
                        : "rounded-xl"
                    }`}
                  >
                    {config.appIcon ? (
                      <img
                        src={config.appIcon}
                        alt="App Icon"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Smartphone className="w-8 h-8 text-violet-400" />
                    )}
                  </div>
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <div className="text-xs text-violet-400 font-semibold uppercase tracking-wider">
                    Launcher Appearance
                  </div>
                  <div className="text-lg font-bold text-white mt-0.5">
                    {config.appName || "My Android App"}
                  </div>
                  <div className="text-xs font-mono text-slate-400 mt-0.5">
                    {config.packageName} • v{config.versionName} ({config.versionCode})
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-center">
                  <div className="text-[10px] uppercase text-slate-400 font-medium">Build Status</div>
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Store Ready</span>
                  </div>
                </div>
              </div>

              {/* Input Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. App Name */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <span>App Name</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-normal">
                        User-Facing
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => openInfo("appName")}
                      className="text-xs text-slate-400 hover:text-violet-400 flex items-center gap-1 transition"
                      title="More information"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span className="underline">More info</span>
                    </button>
                  </div>
                  <input
                    id="input-app-name-property"
                    type="text"
                    value={config.appName}
                    onChange={(e) => onUpdateConfig({ appName: e.target.value })}
                    placeholder="e.g. QuickForge Pro"
                    className="w-full bg-slate-900 border border-slate-700/80 focus:border-violet-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    This is the user-facing name of your app. It will show in your phone's launcher, settings screen, and other parts of the Android interface. Note that the app name can be different from the project name.
                  </p>
                </div>

                {/* 2. Package Name */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <span>Package Name</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-normal">
                        Unique Store ID
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => openInfo("packageName")}
                      className="text-xs text-slate-400 hover:text-violet-400 flex items-center gap-1 transition"
                      title="More information"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span className="underline">More info</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="input-package-name-property"
                      type="text"
                      value={config.packageName}
                      onChange={(e) => onUpdateConfig({ packageName: e.target.value.toLowerCase().trim() })}
                      placeholder="e.g. com.company.appname"
                      className={`w-full bg-slate-900 border rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none ${
                        isPackageValid
                          ? "border-slate-700/80 focus:border-violet-500"
                          : "border-amber-500/80 focus:border-amber-400 text-amber-200"
                      }`}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    The package name is used to uniquely identify your app in distribution stores you would like to publish it in.
                  </p>
                  {!isPackageValid && (
                    <div className="text-[11px] text-amber-400 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Must contain at least 2 segments separated by dots (e.g. com.example.app)</span>
                    </div>
                  )}
                </div>

                {/* 3. Version Code */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <span>Version Code</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-normal font-mono">
                        Integer Build #
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => openInfo("versionCode")}
                      className="text-xs text-slate-400 hover:text-violet-400 flex items-center gap-1 transition"
                      title="More information"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span className="underline">More info</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="input-version-code-property"
                      type="number"
                      min={1}
                      value={config.versionCode}
                      onChange={(e) => onUpdateConfig({ versionCode: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="flex-1 bg-slate-900 border border-slate-700/80 focus:border-violet-500 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      id="btn-increment-version-code"
                      onClick={() => onUpdateConfig({ versionCode: (config.versionCode || 1) + 1 })}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1 transition active:scale-95"
                      title="Increment version code by 1 for next Google Play release"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-400" />
                      <span>+1 Next Release</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Your app's version code is used by Google Play and other distribution stores to identify each version of your app. Make sure to increment this property by 1 every time you export for publishing.
                  </p>
                </div>

                {/* 4. Version Name */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <span>Version Name</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-normal">
                        User-Visible
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => openInfo("versionName")}
                      className="text-xs text-slate-400 hover:text-violet-400 flex items-center gap-1 transition"
                      title="More information"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span className="underline">More info</span>
                    </button>
                  </div>
                  <input
                    id="input-version-name-property"
                    type="text"
                    value={config.versionName}
                    onChange={(e) => onUpdateConfig({ versionName: e.target.value })}
                    placeholder="e.g. 1.0.0 or 1.0.0-beta"
                    className="w-full bg-slate-900 border border-slate-700/80 focus:border-violet-500 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    The version name is used by users to distinguish different versions of your app. This property can contain additional version context in the form of text.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APP ICON (512x512) */}
          {activeTab === "branding" && (
            <div className="space-y-6 animate-in fade-in duration-100">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-violet-400" />
                      <span>Launcher Icon (512x512px)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-2xl">
                      Your app's icon is displayed on your phone's launcher alongside the app name. Use a square or round .png image of size 512x512px for best results.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openInfo("icon")}
                    className="text-xs text-slate-400 hover:text-violet-400 flex items-center gap-1 transition"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span className="underline">More info</span>
                  </button>
                </div>

                {/* Shape Selector & Live Previews */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800/80 items-center">
                  {/* Icon Box */}
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-900 border border-slate-800 rounded-xl">
                    <div
                      className={`w-28 h-28 bg-slate-800 overflow-hidden shadow-2xl border-2 border-violet-500/40 transition-all duration-300 ${
                        iconShape === "circle"
                          ? "rounded-full"
                          : iconShape === "squircle"
                          ? "rounded-3xl"
                          : "rounded-xl"
                      }`}
                    >
                      {config.appIcon ? (
                        <img
                          src={config.appIcon}
                          alt="App Icon Preview"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                          <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                          <span>No Icon</span>
                        </div>
                      )}
                    </div>

                    {/* Shape Toggle Buttons */}
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 mt-4 text-xs">
                      <button
                        type="button"
                        onClick={() => setIconShape("squircle")}
                        className={`px-2.5 py-1 rounded-md transition font-medium ${
                          iconShape === "squircle"
                            ? "bg-violet-600 text-white"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Squircle (Android 14+)
                      </button>
                      <button
                        type="button"
                        onClick={() => setIconShape("circle")}
                        className={`px-2.5 py-1 rounded-md transition font-medium ${
                          iconShape === "circle"
                            ? "bg-violet-600 text-white"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Round
                      </button>
                      <button
                        type="button"
                        onClick={() => setIconShape("rounded")}
                        className={`px-2.5 py-1 rounded-md transition font-medium ${
                          iconShape === "rounded"
                            ? "bg-violet-600 text-white"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Square
                      </button>
                    </div>
                  </div>

                  {/* Phone Launcher Simulation */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-200">
                        Icon Image URL or Upload (.png 512x512)
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="input-app-icon-url"
                          type="text"
                          value={config.appIcon || ""}
                          onChange={(e) => onUpdateConfig({ appIcon: e.target.value })}
                          placeholder="https://.../icon-512.png"
                          className="flex-1 bg-slate-900 border border-slate-700/80 focus:border-violet-500 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
                        />
                        <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium rounded-lg cursor-pointer flex items-center gap-1.5 transition">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Browse</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                  onUpdateConfig({ appIcon: reader.result as string });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Starter Presets */}
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-2 font-medium">
                        Or pick from curated Android 512x512 icon presets:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {SAMPLE_ICONS.map((sample, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => onUpdateConfig({ appIcon: sample.url })}
                            className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 transition text-left group"
                          >
                            <img
                              src={sample.url}
                              alt={sample.name}
                              className="w-7 h-7 rounded-md object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <span className="text-[11px] text-slate-300 group-hover:text-white truncate">
                              {sample.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Android Launcher Dock Mock */}
                    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-around">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 text-xs">
                          Phone
                        </div>
                        <span className="text-[10px] text-slate-400">Dialer</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 text-xs">
                          Msg
                        </div>
                        <span className="text-[10px] text-slate-400">Messages</span>
                      </div>

                      {/* Current App */}
                      <div className="flex flex-col items-center gap-1 scale-105">
                        <div
                          className={`w-11 h-11 bg-slate-800 overflow-hidden ring-2 ring-violet-500 shadow-md ${
                            iconShape === "circle"
                              ? "rounded-full"
                              : iconShape === "squircle"
                              ? "rounded-xl"
                              : "rounded-lg"
                          }`}
                        >
                          {config.appIcon ? (
                            <img
                              src={config.appIcon}
                              alt="Current Icon"
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
                              DF
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-semibold text-white max-w-[70px] truncate">
                          {config.appName || "My App"}
                        </span>
                      </div>

                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 text-xs">
                          Photos
                        </div>
                        <span className="text-[10px] text-slate-400">Gallery</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SPLASH SCREEN & ARTWORK */}
          {activeTab === "splash" && (
            <div className="space-y-6 animate-in fade-in duration-100">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-5">
                {/* Splash Screen Toggle */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">Splash Screen</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          config.enableSplashScreen
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {config.enableSplashScreen ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                      If enabled, your app will show a splash screen while your app is first launched and is loading. A splash screen can be used to display custom branding or loading progress.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openInfo("splashScreen")}
                      className="text-xs text-slate-400 hover:text-violet-400 flex items-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span className="underline">More info</span>
                    </button>
                    <button
                      type="button"
                      id="toggle-splash-screen-btn"
                      onClick={() =>
                        onUpdateConfig({ enableSplashScreen: !config.enableSplashScreen })
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        config.enableSplashScreen ? "bg-violet-600" : "bg-slate-800"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          config.enableSplashScreen ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Splash Image Configuration */}
                {config.enableSplashScreen ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-semibold text-white">
                            Splash Image (Branding Artwork)
                          </label>
                          <button
                            type="button"
                            onClick={() => openInfo("splashImage")}
                            className="text-xs text-slate-400 hover:text-violet-400 flex items-center gap-1"
                          >
                            <Info className="w-3 h-3" />
                            <span className="underline">More info</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                          If the splash screen property is enabled, this image will be used as the branding artwork while your app is loading.
                        </p>
                        <div className="flex gap-2">
                          <input
                            id="input-splash-image-url"
                            type="text"
                            value={config.splashImage || ""}
                            onChange={(e) => onUpdateConfig({ splashImage: e.target.value })}
                            placeholder="https://.../splash_logo.png"
                            className="flex-1 bg-slate-900 border border-slate-700/80 focus:border-violet-500 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
                          />
                          <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium rounded-lg cursor-pointer flex items-center gap-1.5 transition">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    onUpdateConfig({ splashImage: reader.result as string });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Splash Background Color */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-white">
                          Splash Window Background Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={config.splashBackgroundColor || "#0F172A"}
                            onChange={(e) =>
                              onUpdateConfig({ splashBackgroundColor: e.target.value })
                            }
                            className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                          />
                          <input
                            type="text"
                            value={config.splashBackgroundColor || "#0F172A"}
                            onChange={(e) =>
                              onUpdateConfig({ splashBackgroundColor: e.target.value })
                            }
                            className="w-32 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white"
                          />
                          <span className="text-xs text-slate-500">
                            (Matches Android 12+ windowSplashScreenBackground)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Live Mobile Splash Preview */}
                    <div className="flex flex-col items-center justify-center p-4 bg-slate-900 border border-slate-800 rounded-xl">
                      <span className="text-[10px] font-mono text-slate-400 mb-2 uppercase tracking-wider">
                        Android Cold Start Preview
                      </span>
                      <div
                        className="w-44 h-80 rounded-2xl border-4 border-slate-700 shadow-2xl relative flex flex-col items-center justify-center overflow-hidden transition-colors"
                        style={{ backgroundColor: config.splashBackgroundColor || "#0F172A" }}
                      >
                        {/* Device Notch */}
                        <div className="absolute top-2 w-16 h-3.5 bg-black/40 rounded-full" />

                        {/* Central Splash Graphic */}
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border border-white/10 flex items-center justify-center bg-black/20">
                            {config.splashImage || config.appIcon ? (
                              <img
                                src={config.splashImage || config.appIcon}
                                alt="Splash"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <Smartphone className="w-8 h-8 text-white" />
                            )}
                          </div>
                          <span className="text-xs font-bold text-white tracking-wide">
                            {config.appName || "My App"}
                          </span>
                        </div>

                        {/* Simulated Progress Indicator */}
                        <div className="absolute bottom-6 flex flex-col items-center gap-1.5">
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          <span className="text-[9px] text-white/60 font-mono">Initializing...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    Splash screen is disabled. The app will launch directly into the initial launcher screen.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: AD NETWORKS & MONETIZATION */}
          {activeTab === "monetization" && (
            <div className="space-y-5 animate-in fade-in duration-100">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Mobile Advertising & Monetization SDKs</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Configure publisher App IDs to serve banner, interstitial, and rewarded video ads. DroidForge generates necessary manifest & gradle declarations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. Google Ads App ID */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-300 flex items-center justify-center text-xs font-bold">
                        G
                      </div>
                      <span className="text-xs font-bold text-white">Google Ads App ID</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openInfo("googleAdsAppId")}
                      className="text-xs text-slate-400 hover:text-violet-400 flex items-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span className="underline">More info</span>
                    </button>
                  </div>
                  <input
                    id="input-google-ads-app-id"
                    type="text"
                    value={config.googleAdsAppId || ""}
                    onChange={(e) => onUpdateConfig({ googleAdsAppId: e.target.value.trim() })}
                    placeholder="ca-app-pub-3940256099942544~3347511713"
                    className="w-full bg-slate-900 border border-slate-700/80 focus:border-violet-500 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    This ID issued by Google Ads is used to correctly initialize Google AdMob/Ad Manager on your app.
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateConfig({
                          googleAdsAppId: "ca-app-pub-3940256099942544~3347511713",
                        })
                      }
                      className="text-[11px] text-violet-400 hover:text-violet-300 font-medium underline"
                    >
                      Use Official Google Test AdMob ID
                    </button>
                    {config.googleAdsAppId && (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                        <Check className="w-3 h-3" /> Configured
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Start.io App ID */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-sky-500/20 text-sky-300 flex items-center justify-center text-xs font-bold">
                        S
                      </div>
                      <span className="text-xs font-bold text-white">Start.io App ID</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openInfo("startIoAppId")}
                      className="text-xs text-slate-400 hover:text-violet-400 flex items-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span className="underline">More info</span>
                    </button>
                  </div>
                  <input
                    id="input-start-io-app-id"
                    type="text"
                    value={config.startIoAppId || ""}
                    onChange={(e) => onUpdateConfig({ startIoAppId: e.target.value.trim() })}
                    placeholder="e.g. 208765432"
                    className="w-full bg-slate-900 border border-slate-700/80 focus:border-violet-500 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    This ID issued by Start.io is used to correctly initialize the Start.io SDK on your app.
                  </p>
                </div>

                {/* 3. Unity Ads Game ID */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-slate-600/30 text-slate-200 flex items-center justify-center text-xs font-bold">
                        U
                      </div>
                      <span className="text-xs font-bold text-white">Unity Ads Game ID</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openInfo("unityAdsGameId")}
                      className="text-xs text-slate-400 hover:text-violet-400 flex items-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span className="underline">More info</span>
                    </button>
                  </div>
                  <input
                    id="input-unity-ads-game-id"
                    type="text"
                    value={config.unityAdsGameId || ""}
                    onChange={(e) => onUpdateConfig({ unityAdsGameId: e.target.value.trim() })}
                    placeholder="e.g. 4567890"
                    className="w-full bg-slate-900 border border-slate-700/80 focus:border-violet-500 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    This Game ID issued by Unity Ads is used to correctly initialize the Unity Ads SDK on your app.
                  </p>
                </div>

                {/* 4. AppLovin SDK Key */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-rose-500/20 text-rose-300 flex items-center justify-center text-xs font-bold">
                        AL
                      </div>
                      <span className="text-xs font-bold text-white">AppLovin SDK Key</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openInfo("appLovinSdkKey")}
                      className="text-xs text-slate-400 hover:text-violet-400 flex items-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span className="underline">More info</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="input-app-lovin-sdk-key"
                      type={showSecretKey["appLovin"] ? "text" : "password"}
                      value={config.appLovinSdkKey || ""}
                      onChange={(e) => onUpdateConfig({ appLovinSdkKey: e.target.value.trim() })}
                      placeholder="Enter AppLovin MAX SDK Key"
                      className="w-full bg-slate-900 border border-slate-700/80 focus:border-violet-500 rounded-lg px-3 py-2 pr-10 text-xs font-mono text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowSecret("appLovin")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showSecretKey["appLovin"] ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    The SDK key from your AppLovin account. Required by all AppLovin Max ad components. Find it under Account &gt; Keys in the AppLovin dashboard.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SERVICES, APIS & GAMING */}
          {activeTab === "services" && (
            <div className="space-y-5 animate-in fade-in duration-100">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-violet-400" />
                  <span>Google Cloud, Play Games & Native Services</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Connect your Android app with Google Maps, Push Notifications, Google Play Games Services, and Google Play Integrity.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. Google Play Games App ID */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white">Google Play Games App ID</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openInfo("googlePlayGamesAppId")}
                      className="text-xs text-slate-400 hover:text-violet-400 flex items-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span className="underline">More info</span>
                    </button>
                  </div>
                  <input
                    id="input-google-play-games-app-id"
                    type="text"
                    value={config.googlePlayGamesAppId || ""}
                    onChange={(e) => onUpdateConfig({ googlePlayGamesAppId: e.target.value.trim() })}
                    placeholder="e.g. 123456789012"
                    className="w-full bg-slate-900 border border-slate-700/80 focus:border-violet-500 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    This key is used by the Google Play Games service to connect to your app.
                  </p>
                </div>

                {/* 2. OneSignal App ID */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-rose-400" />
                      <span className="text-xs font-bold text-white">OneSignal App ID</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openInfo("oneSignalAppId")}
                      className="text-xs text-slate-400 hover:text-violet-400 flex items-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span className="underline">More info</span>
                    </button>
                  </div>
                  <input
                    id="input-onesignal-app-id"
                    type="text"
                    value={config.oneSignalAppId || ""}
                    onChange={(e) => onUpdateConfig({ oneSignalAppId: e.target.value.trim() })}
                    placeholder="e.g. b2f7f966-d8cc-11e4-bed1-df8f05be55ba"
                    className="w-full bg-slate-900 border border-slate-700/80 focus:border-violet-500 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    This key is used by OneSignal push notification services to connect to your app.
                  </p>
                </div>

                {/* 3. Google Maps API Key */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-white">Google Maps API Key</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openInfo("googleMapsApiKey")}
                      className="text-xs text-slate-400 hover:text-violet-400 flex items-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span className="underline">More info</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="input-google-maps-api-key"
                      type={showSecretKey["maps"] ? "text" : "password"}
                      value={config.googleMapsApiKey || ""}
                      onChange={(e) => onUpdateConfig({ googleMapsApiKey: e.target.value.trim() })}
                      placeholder="e.g. AIzaSy..."
                      className="w-full bg-slate-900 border border-slate-700/80 focus:border-violet-500 rounded-lg px-3 py-2 pr-10 text-xs font-mono text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowSecret("maps")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showSecretKey["maps"] ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    This key is used by the Google Maps service to connect to your app.
                  </p>
                </div>

                {/* 4. Google Cloud Project Number */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold text-white">Google Cloud Project Number</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openInfo("googleCloudProjectNumber")}
                      className="text-xs text-slate-400 hover:text-violet-400 flex items-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span className="underline">More info</span>
                    </button>
                  </div>
                  <input
                    id="input-google-cloud-project-number"
                    type="text"
                    value={config.googleCloudProjectNumber || ""}
                    onChange={(e) => onUpdateConfig({ googleCloudProjectNumber: e.target.value.trim() })}
                    placeholder="e.g. 250958817990"
                    className="w-full bg-slate-900 border border-slate-700/80 focus:border-violet-500 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    The Google Cloud Project Number is used by the Play Integrity component to connect to your Google Cloud project.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Changes are automatically saved to your Android project</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-xs transition active:scale-95"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* Info Popover / Modal */}
      {selectedInfoKey && MORE_INFO_GUIDES[selectedInfoKey] && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-3 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-violet-400" />
                <span>{MORE_INFO_GUIDES[selectedInfoKey].title}</span>
              </h4>
              <button
                onClick={() => setSelectedInfoKey(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {MORE_INFO_GUIDES[selectedInfoKey].body}
            </p>
            {MORE_INFO_GUIDES[selectedInfoKey].link && (
              <a
                href={MORE_INFO_GUIDES[selectedInfoKey].link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 underline font-medium pt-1"
              >
                <span>Official Android Documentation</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedInfoKey(null)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
