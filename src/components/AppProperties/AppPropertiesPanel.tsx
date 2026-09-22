import React, { useState } from "react";
import {
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
  FileCode2,
  Hammer,
  Download,
  Settings,
  Shield,
  Zap,
  Palette,
  Cpu,
  FolderArchive,
  GitBranch,
  BookOpen,
} from "lucide-react";
import { AndroidScreen, ProjectAsset, ProjectConfig, ProjectSnapshot, SavedProject, BuilderIdeSettings } from "../../types";
import { ThemeManagementPanel } from "./ThemeManagementPanel";
import { SdkNativePanel } from "../SdkManager/SdkNativePanel";
import { AssetManagerPanel } from "../AssetManager/AssetManagerPanel";
import { VersionControlPanel } from "../VersionControl/VersionControlPanel";
import { DocumentationPanel } from "../Docs/DocumentationPanel";

export type PropertyTab =
  | "general"
  | "branding"
  | "theme"
  | "splash"
  | "sdk"
  | "assets"
  | "versions"
  | "monetization"
  | "services"
  | "manifest"
  | "docs";

export interface AppPropertiesPanelProps {
  config: ProjectConfig;
  onUpdateConfig: (updates: Partial<ProjectConfig>) => void;
  onOpenBuildModal?: () => void;
  onExportZip?: () => void;
  assets?: ProjectAsset[];
  onAddAsset?: (asset: ProjectAsset) => void;
  onDeleteAsset?: (id: string) => void;
  screens?: AndroidScreen[];
  projects?: SavedProject[];
  currentProjectId?: string;
  snapshots?: ProjectSnapshot[];
  onUpdateSnapshots?: (snapshots: ProjectSnapshot[]) => void;
  onRestoreSnapshot?: (snapshot: ProjectSnapshot) => void;
  onForkAsNewApp?: (snapshot: ProjectSnapshot) => void;
  initialSubTab?: PropertyTab;
  activeSubTab?: PropertyTab;
  onSubTabChange?: (tab: PropertyTab) => void;
  builderSettings?: BuilderIdeSettings;
}

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

export const AppPropertiesPanel: React.FC<AppPropertiesPanelProps> = ({
  config,
  onUpdateConfig,
  onOpenBuildModal,
  onExportZip,
  assets,
  onAddAsset,
  onDeleteAsset,
  screens,
  projects,
  currentProjectId,
  snapshots,
  onUpdateSnapshots,
  onRestoreSnapshot,
  onForkAsNewApp,
  initialSubTab,
  activeSubTab,
  onSubTabChange,
  builderSettings,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<PropertyTab>(
    activeSubTab || initialSubTab || "general"
  );
  const activeTab = activeSubTab || internalActiveTab;
  const setActiveTab = (tab: PropertyTab) => {
    setInternalActiveTab(tab);
    onSubTabChange?.(tab);
  };

  const ideShellStyle: React.CSSProperties = {
    backgroundColor: "var(--ide-shell-bg)",
    color: "var(--ide-text)",
  };

  const ideCardStyle: React.CSSProperties = {
    backgroundColor: "var(--ide-card-bg)",
    color: "var(--ide-text)",
    borderColor: "var(--ide-border)",
  };

  const ideCardInnerStyle: React.CSSProperties = {
    backgroundColor: "var(--ide-card-inner-bg)",
    color: "var(--ide-text)",
    borderColor: "var(--ide-border)",
  };

  const ideInputStyle: React.CSSProperties = {
    backgroundColor: "var(--ide-card-inner-bg)",
    color: "var(--ide-text)",
    borderColor: "var(--ide-border)",
  };

  const [selectedInfoKey, setSelectedInfoKey] = useState<string | null>(null);
  const [iconShape, setIconShape] = useState<"circle" | "squircle" | "rounded">("squircle");
  const [showSecretKey, setShowSecretKey] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleShowSecret = (key: string) => {
    setShowSecretKey((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const openInfo = (key: string) => {
    setSelectedInfoKey(key);
  };

  const isPackageValid = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(config.packageName || "");

  const handleFillTestKeys = () => {
    onUpdateConfig({
      googleAdsAppId: "ca-app-pub-3940256099942544~3347511713",
      startIoAppId: "208765432",
      unityAdsGameId: "5432109",
      appLovinSdkKey: "k3p_AbCdEfGhIjKlMnOpQrStUvWxYz_1234567890TestKeySample",
      googlePlayGamesAppId: "987654321012",
      oneSignalAppId: "4b5d2e34-7a1b-4f9e-9d2a-1c8e7f5a3b09",
      googleMapsApiKey: "AIzaSyD-DemoTestApiKeySampleForMapsOnly",
      googleCloudProjectNumber: "250958817990",
    });
  };

  const generatedManifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${config.packageName}">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="${config.appName}"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.${config.appName.replace(/\\s+/g, "")}">

        <!-- Google AdMob / Google Ads App ID -->
        ${
          config.googleAdsAppId
            ? `<meta-data
            android:name="com.google.android.gms.ads.APPLICATION_ID"
            android:value="${config.googleAdsAppId}" />`
            : `<!-- <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="ca-app-pub-..." /> -->`
        }

        <!-- Start.io Ads App ID -->
        ${
          config.startIoAppId
            ? `<meta-data
            android:name="com.startapp.sdk.APPLICATION_ID"
            android:value="${config.startIoAppId}" />`
            : ""
        }

        <!-- AppLovin MAX SDK Key -->
        ${
          config.appLovinSdkKey
            ? `<meta-data
            android:name="applovin.sdk.key"
            android:value="${config.appLovinSdkKey}" />`
            : ""
        }

        <!-- Google Play Games Services -->
        ${
          config.googlePlayGamesAppId
            ? `<meta-data
            android:name="com.google.android.gms.games.APP_ID"
            android:value="@string/game_services_project_id" />`
            : ""
        }

        <!-- Google Maps API Key -->
        ${
          config.googleMapsApiKey
            ? `<meta-data
            android:name="com.google.android.geo.API_KEY"
            android:value="${config.googleMapsApiKey}" />`
            : ""
        }

        <!-- MainActivity with Launcher Filter & SplashScreen API -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            ${
              config.enableSplashScreen
                ? 'android:theme="@style/Theme.App.Starting"'
                : 'android:theme="@style/Theme.Material3.DayNight.NoActionBar"'
            }>
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  return (
    <div
      id="app-properties-studio-panel"
      style={ideShellStyle}
      className="ide-theme-container flex-1 flex flex-col h-full overflow-hidden select-none"
    >
      {/* Top Studio Bar */}
      <div
        style={ideCardStyle}
        className="px-6 py-4 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0 border-b"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center overflow-hidden shadow-inner shrink-0">
            {config.appIcon ? (
              <img
                src={config.appIcon}
                alt="App Launcher Icon"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Smartphone className="w-6 h-6 text-violet-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1
                style={{ color: "var(--ide-text)" }}
                className="text-lg font-bold tracking-tight"
              >
                {config.appName}
              </h1>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-violet-500/15 text-violet-500 border border-violet-500/30 font-semibold">
                v{config.versionName} ({config.versionCode})
              </span>
              <span
                style={ideCardInnerStyle}
                className="text-xs font-mono px-2.5 py-0.5 rounded-full border"
              >
                {config.packageName}
              </span>
              {config.enableSplashScreen && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 font-medium">
                  Splash Active
                </span>
              )}
            </div>
            <p
              style={{ color: "var(--ide-text-muted)" }}
              className="text-xs mt-1"
            >
              Configure launcher identity, package IDs, versioning, monetization SDKs, and native cloud APIs for production release.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
          <button
            id="fill-sample-test-keys-btn"
            onClick={handleFillTestKeys}
            title="Populate test IDs for AdMob, Unity, and APIs"
            style={ideCardInnerStyle}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl font-semibold transition border hover:opacity-80"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Fill Test SDK IDs</span>
          </button>

          {onOpenBuildModal && (
            <button
              id="app-prop-build-apk-btn"
              onClick={onOpenBuildModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-md transition active:scale-95"
            >
              <Hammer className="w-3.5 h-3.5" />
              <span>Build APK / AAB</span>
            </button>
          )}

          {onExportZip && (
            <button
              id="app-prop-export-zip-btn"
              onClick={onExportZip}
              style={ideCardInnerStyle}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl font-semibold transition border hover:opacity-80"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Project</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div
        style={ideCardStyle}
        className="px-4 sm:px-6 pt-2 pb-2 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none border-b"
      >
        <button
          id="tab-btn-prop-general"
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === "general"
              ? "bg-violet-600 text-white shadow-xs"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>General & Package</span>
        </button>

        <button
          id="tab-btn-prop-branding"
          onClick={() => setActiveTab("branding")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === "branding"
              ? "bg-violet-600 text-white shadow-xs"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Launcher Icon</span>
        </button>

        <button
          id="tab-btn-prop-theme"
          onClick={() => setActiveTab("theme")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === "theme"
              ? "bg-violet-600 text-white shadow-xs"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Material 3 Theme</span>
        </button>

        <button
          id="tab-btn-prop-splash"
          onClick={() => setActiveTab("splash")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === "splash"
              ? "bg-violet-600 text-white shadow-xs"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Splash Screen</span>
        </button>

        {/* SDK, NDK & Permissions Hub */}
        <button
          id="tab-btn-prop-sdk"
          onClick={() => setActiveTab("sdk")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === "sdk"
              ? "bg-violet-600 text-white shadow-xs"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>SDK & NDK</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-violet-300">
            API {config.targetSdk || 35}
          </span>
        </button>

        {/* Assets Manager Hub */}
        <button
          id="tab-btn-prop-assets"
          onClick={() => setActiveTab("assets")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === "assets"
              ? "bg-violet-600 text-white shadow-xs"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <FolderArchive className="w-3.5 h-3.5" />
          <span>Assets</span>
          {assets && assets.length > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
              {assets.length}
            </span>
          )}
        </button>

        {/* Version Control Hub */}
        <button
          id="tab-btn-prop-versions"
          onClick={() => setActiveTab("versions")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === "versions"
              ? "bg-violet-600 text-white shadow-xs"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Version Control</span>
          {snapshots && snapshots.length > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
              {snapshots.length}
            </span>
          )}
        </button>

        <button
          id="tab-btn-prop-monetization"
          onClick={() => setActiveTab("monetization")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === "monetization"
              ? "bg-violet-600 text-white shadow-xs"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Monetization & Ads</span>
        </button>

        <button
          id="tab-btn-prop-services"
          onClick={() => setActiveTab("services")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === "services"
              ? "bg-violet-600 text-white shadow-xs"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Cloud & APIs</span>
        </button>

        <button
          id="tab-btn-prop-manifest"
          onClick={() => setActiveTab("manifest")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === "manifest"
              ? "bg-violet-600 text-white shadow-xs"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <FileCode2 className="w-3.5 h-3.5" />
          <span>Manifest.xml</span>
        </button>

        {/* Documentation & Compose Guides Hub */}
        <button
          id="tab-btn-prop-docs"
          onClick={() => setActiveTab("docs")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === "docs"
              ? "bg-violet-600 text-white shadow-xs"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Documentation</span>
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === "theme" && (
        <div style={ideShellStyle} className="ide-theme-container flex-1 overflow-hidden h-full flex flex-col">
          <ThemeManagementPanel config={config} onUpdateConfig={onUpdateConfig} assets={assets} />
        </div>
      )}

      {activeTab === "sdk" && (
        <div style={ideShellStyle} className="ide-theme-container flex-1 overflow-y-auto h-full flex flex-col">
          <SdkNativePanel
            config={config}
            onUpdateConfig={onUpdateConfig}
            onOpenAppProperties={() => setActiveTab("general")}
          />
        </div>
      )}

      {activeTab === "assets" && (
        <div style={ideShellStyle} className="ide-theme-container flex-1 overflow-y-auto h-full flex flex-col">
          <AssetManagerPanel
            assets={assets || []}
            onAddAsset={onAddAsset || (() => {})}
            onDeleteAsset={onDeleteAsset || (() => {})}
          />
        </div>
      )}

      {activeTab === "versions" && (
        <div style={ideShellStyle} className="ide-theme-container flex-1 overflow-y-auto h-full flex flex-col">
          <VersionControlPanel
            currentConfig={config}
            currentScreens={screens || []}
            currentAssets={assets || []}
            projects={projects || []}
            currentProjectId={currentProjectId || ""}
            snapshots={snapshots || []}
            onUpdateSnapshots={onUpdateSnapshots || (() => {})}
            onRestoreSnapshot={onRestoreSnapshot || (() => {})}
            onForkAsNewApp={onForkAsNewApp || (() => {})}
            onUpdateConfig={onUpdateConfig}
          />
        </div>
      )}

      {activeTab === "docs" && (
        <div style={ideShellStyle} className="ide-theme-container flex-1 overflow-hidden h-full flex flex-col">
          <DocumentationPanel />
        </div>
      )}

      {["general", "branding", "splash", "monetization", "services", "manifest"].includes(activeTab) && (
        <div style={ideShellStyle} className="ide-theme-container flex-1 overflow-y-auto p-6 space-y-6">
        {/* TAB 1: GENERAL & VERSIONING */}
        {activeTab === "general" && (
          <div className="max-w-4xl space-y-6 animate-in fade-in duration-150">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-violet-400" />
                    App Identity & Publishing Coordinates
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Core Android system attributes used in the phone launcher and Google Play Store.
                  </p>
                </div>
              </div>

              {/* App Name */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="app-name-input" className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    App Name
                    <span className="text-[10px] text-slate-500 font-normal">(android:label)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => openInfo("appName")}
                    className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 font-medium"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>More Info</span>
                  </button>
                </div>
                <input
                  id="app-name-input"
                  type="text"
                  value={config.appName}
                  onChange={(e) => onUpdateConfig({ appName: e.target.value })}
                  placeholder="e.g. My Awesome App"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition font-medium"
                />
                <p className="text-[11px] text-slate-400">
                  Visible below the app icon on the user's home screen, launcher drawer, and app info page.
                </p>
              </div>

              {/* Package Name */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="package-name-input" className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    Package Name
                    <span className="text-[10px] text-slate-500 font-normal">(applicationId)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => openInfo("packageName")}
                    className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 font-medium"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>More Info</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="package-name-input"
                    type="text"
                    value={config.packageName}
                    onChange={(e) => onUpdateConfig({ packageName: e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, "") })}
                    placeholder="com.example.myapp"
                    className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none transition ${
                      isPackageValid ? "border-slate-800 focus:border-violet-500" : "border-rose-500/60 focus:border-rose-500"
                    }`}
                  />
                  <div className="absolute right-3 top-2.5 flex items-center gap-1.5">
                    {isPackageValid ? (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Valid
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] text-rose-400 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Invalid format
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Must follow Java reverse-domain notation (e.g., <span className="font-mono text-violet-300">com.company.appname</span>). Unique in Google Play.
                </p>
              </div>

              {/* Versioning Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Version Code */}
                <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <label htmlFor="version-code-input" className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      Version Code
                      <span className="text-[10px] text-slate-500 font-normal">(Integer)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => openInfo("versionCode")}
                      className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 font-medium"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>More Info</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="version-code-input"
                      type="number"
                      min="1"
                      value={config.versionCode}
                      onChange={(e) => onUpdateConfig({ versionCode: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-violet-500 font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => onUpdateConfig({ versionCode: (config.versionCode || 1) + 1 })}
                      className="px-3 py-2 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-semibold flex items-center gap-1 transition shrink-0"
                      title="Increment version code for new release"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Increment (+1)</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Internal release counter. Must increase with every Google Play update.
                  </p>
                </div>

                {/* Version Name */}
                <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <label htmlFor="version-name-input" className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      Version Name
                      <span className="text-[10px] text-slate-500 font-normal">(Display string)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => openInfo("versionName")}
                      className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 font-medium"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>More Info</span>
                    </button>
                  </div>
                  <input
                    id="version-name-input"
                    type="text"
                    value={config.versionName}
                    onChange={(e) => onUpdateConfig({ versionName: e.target.value })}
                    placeholder="1.0.0"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-violet-500 font-bold"
                  />
                  <p className="text-[11px] text-slate-400">
                    User-facing version shown on Google Play Store listings and in Settings &gt; About.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-blue-950/30 border border-blue-800/40 rounded-2xl p-4 flex items-start gap-3 text-xs text-blue-200">
              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Google Play Publishing Tip:</span> If you are preparing an APK or Android App Bundle (AAB) for production, ensure your package name matches your Google Play Console app listing. Changing package names after initial publishing is not permitted by Android.
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LAUNCHER ICON (512x512) */}
        {activeTab === "branding" && (
          <div className="max-w-4xl space-y-6 animate-in fade-in duration-150">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-violet-400" />
                    Adaptive Launcher Icon (512x512 px)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Your app's visual identity on the Android launcher, multitasking view, and Google Play Store.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openInfo("icon")}
                  className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 font-medium"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Icon Guide</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Left: Shape preview & shape switcher */}
                <div className="md:col-span-5 bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-4">
                  <span className="text-xs font-semibold text-slate-400">Launcher Preview</span>

                  {/* Mask container */}
                  <div className="relative p-3 bg-slate-900 rounded-3xl border border-slate-800/80 shadow-2xl flex items-center justify-center">
                    <div
                      className={`w-32 h-32 overflow-hidden shadow-lg transition-all duration-300 flex items-center justify-center bg-slate-800 ${
                        iconShape === "circle"
                          ? "rounded-full"
                          : iconShape === "squircle"
                          ? "rounded-[28%]"
                          : "rounded-2xl"
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
                        <div className="flex flex-col items-center justify-center text-slate-500">
                          <Smartphone className="w-10 h-10 mb-1" />
                          <span className="text-[10px] font-mono">No Icon</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shape controls */}
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setIconShape("squircle")}
                      className={`px-3 py-1 rounded-lg font-medium transition ${
                        iconShape === "squircle" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Squircle (Pixel)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIconShape("circle")}
                      className={`px-3 py-1 rounded-lg font-medium transition ${
                        iconShape === "circle" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Circle
                    </button>
                    <button
                      type="button"
                      onClick={() => setIconShape("rounded")}
                      className={`px-3 py-1 rounded-lg font-medium transition ${
                        iconShape === "rounded" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Rounded (OneUI)
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-500 text-center">
                    Simulating Adaptive Icon mask applied across Pixel, Samsung One UI, and Xiaomi launchers.
                  </span>
                </div>

                {/* Right: URL Input & Presets */}
                <div className="md:col-span-7 space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="app-icon-url-input" className="text-xs font-bold text-slate-300">
                      Icon Image URL or Upload from PC (512x512 PNG/WebP/SVG)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="app-icon-url-input"
                        type="text"
                        value={config.appIcon || ""}
                        onChange={(e) => onUpdateConfig({ appIcon: e.target.value })}
                        placeholder="https://example.com/icon.png or Base64 DataURL"
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
                      />
                      <label className="px-3.5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition shrink-0 active:scale-95 shadow-xs">
                        <Upload className="w-4 h-4" />
                        <span>Upload PC File</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
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
                      {config.appIcon && (
                        <button
                          type="button"
                          onClick={() => onUpdateConfig({ appIcon: "" })}
                          className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sample Icon Presets */}
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-slate-400">Sample High-Resolution Presets:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {SAMPLE_ICONS.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => onUpdateConfig({ appIcon: item.url })}
                          className={`group p-2 rounded-xl border flex flex-col items-center gap-2 text-center transition ${
                            config.appIcon === item.url
                              ? "border-violet-500 bg-violet-600/10 ring-1 ring-violet-500"
                              : "border-slate-800 hover:border-slate-700 bg-slate-950/60"
                          }`}
                        >
                          <div className="w-12 h-12 rounded-xl overflow-hidden shadow-xs">
                            <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                          </div>
                          <span className="text-[11px] text-slate-300 font-medium truncate w-full">{item.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 text-xs text-slate-400 space-y-1">
                    <span className="font-semibold text-slate-200">Recommended Icon Specs:</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                      <li>Size: 512 x 512 pixels</li>
                      <li>Format: 32-bit PNG (with alpha channel)</li>
                      <li>Color space: sRGB</li>
                      <li>Keep primary artwork inside the central 66% safe circle</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SPLASH SCREEN (Android 12+) */}
        {activeTab === "splash" && (
          <div className="max-w-4xl space-y-6 animate-in fade-in duration-150">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-violet-400" />
                    Android 12+ Core SplashScreen API
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Controls the cold-start window background and animated branding glyph before Compose draws the first frame.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openInfo("splashScreen")}
                  className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 font-medium"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>More Info</span>
                </button>
              </div>

              {/* Enable Splash Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="space-y-0.5">
                  <div className="text-sm font-bold text-white">Enable Splash Screen</div>
                  <div className="text-xs text-slate-400">
                    Injects <span className="font-mono text-violet-300">androidx.core:core-splashscreen:1.0.1</span> and applies Starting Theme.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enableSplashScreen ?? true}
                    onChange={(e) => onUpdateConfig({ enableSplashScreen: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                </label>
              </div>

              {/* Splash Settings */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Left Settings */}
                <div className="md:col-span-7 space-y-4">
                  {/* Splash Image URL */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="splash-image-url-input" className="text-xs font-bold text-slate-300">
                        Splash Image / Logo Artwork
                      </label>
                      <button
                        type="button"
                        onClick={() => openInfo("splashImage")}
                        className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 font-medium"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>Specs</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        id="splash-image-url-input"
                        type="text"
                        value={config.splashImage || ""}
                        onChange={(e) => onUpdateConfig({ splashImage: e.target.value })}
                        placeholder="Leave empty to use App Icon"
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
                      />
                      <label className="px-3.5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition shrink-0 active:scale-95 shadow-xs">
                        <Upload className="w-4 h-4" />
                        <span>Upload PC File</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
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
                    <p className="text-[11px] text-slate-400">
                      If left blank, the app launcher icon is automatically used as the splash screen central glyph.
                    </p>
                  </div>

                  {/* Background Color */}
                  <div className="space-y-2">
                    <label htmlFor="splash-bg-color-input" className="text-xs font-bold text-slate-300">
                      Splash Window Background Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="splash-bg-color-input"
                        type="text"
                        value={config.splashBackgroundColor || "#111827"}
                        onChange={(e) => onUpdateConfig({ splashBackgroundColor: e.target.value })}
                        className="w-32 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
                      />
                      <input
                        type="color"
                        value={config.splashBackgroundColor || "#111827"}
                        onChange={(e) => onUpdateConfig({ splashBackgroundColor: e.target.value })}
                        className="w-10 h-9 rounded-lg border border-slate-700 bg-transparent cursor-pointer p-0"
                      />
                      <div className="flex items-center gap-1">
                        {["#111827", "#0F172A", "#FFFFFF", "#4F46E5", "#000000"].map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => onUpdateConfig({ splashBackgroundColor: color })}
                            className="w-6 h-6 rounded-md border border-slate-700 transition hover:scale-110"
                            style={{ backgroundColor: color }}
                            title={`Set to ${color}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Phone Cold-Start Simulation */}
                <div className="md:col-span-5 flex flex-col items-center">
                  <span className="text-xs font-semibold text-slate-400 mb-2">Cold Startup Simulation</span>
                  <div
                    className="w-48 h-80 rounded-[32px] border-4 border-slate-800 shadow-2xl p-2 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300"
                    style={{ backgroundColor: config.splashBackgroundColor || "#111827" }}
                  >
                    {/* Camera pill */}
                    <div className="absolute top-2 w-14 h-3 bg-black/40 rounded-full" />

                    {/* Central Splash glyph */}
                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg flex items-center justify-center animate-pulse">
                      {config.splashImage || config.appIcon ? (
                        <img
                          src={config.splashImage || config.appIcon}
                          alt="Splash Brand Logo"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-violet-600 flex items-center justify-center text-white font-bold text-xl">
                          {config.appName ? config.appName.charAt(0).toUpperCase() : "A"}
                        </div>
                      )}
                    </div>

                    <span className="text-[11px] font-bold mt-4 tracking-wider" style={{ color: config.splashBackgroundColor === "#FFFFFF" ? "#000" : "#FFF" }}>
                      {config.appName}
                    </span>

                    {/* Bottom home indicator */}
                    <div className="absolute bottom-2 w-16 h-1 bg-white/30 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MONETIZATION & ADS (AdMob, Start.io, Unity, AppLovin) */}
        {activeTab === "monetization" && (
          <div className="max-w-4xl space-y-6 animate-in fade-in duration-150">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    Ad Networks & Monetization SDK Keys
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Connect native advertising networks to monetize your application with banner, interstitial, and rewarded ads.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleFillTestKeys}
                  className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Insert Official Test Keys</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Google Ads / AdMob App ID */}
                <div className="space-y-2 bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <label htmlFor="admob-app-id-input" className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-yellow-400" />
                      Google AdMob App ID
                    </label>
                    <button
                      type="button"
                      onClick={() => openInfo("googleAdsAppId")}
                      className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Setup</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="admob-app-id-input"
                      type="text"
                      value={config.googleAdsAppId || ""}
                      onChange={(e) => onUpdateConfig({ googleAdsAppId: e.target.value.trim() })}
                      placeholder="ca-app-pub-################~##########"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Manifest: <code className="text-slate-300">com.google.android.gms.ads.APPLICATION_ID</code></span>
                    {config.googleAdsAppId && (
                      <button
                        type="button"
                        onClick={() => handleCopy(config.googleAdsAppId!, "admob")}
                        className="text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        {copiedKey === "admob" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === "admob" ? "Copied" : "Copy"}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Start.io App ID */}
                <div className="space-y-2 bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <label htmlFor="startio-app-id-input" className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      Start.io (StartApp) App ID
                    </label>
                    <button
                      type="button"
                      onClick={() => openInfo("startIoAppId")}
                      className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Setup</span>
                    </button>
                  </div>
                  <input
                    id="startio-app-id-input"
                    type="text"
                    value={config.startIoAppId || ""}
                    onChange={(e) => onUpdateConfig({ startIoAppId: e.target.value.trim() })}
                    placeholder="e.g. 208765432"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-violet-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    Provides zero-SDK configuration and fast banner / interstitial ad delivery.
                  </p>
                </div>

                {/* Unity Ads Game ID */}
                <div className="space-y-2 bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <label htmlFor="unity-ads-game-id-input" className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      Unity Ads Game ID
                    </label>
                    <button
                      type="button"
                      onClick={() => openInfo("unityAdsGameId")}
                      className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Setup</span>
                    </button>
                  </div>
                  <input
                    id="unity-ads-game-id-input"
                    type="text"
                    value={config.unityAdsGameId || ""}
                    onChange={(e) => onUpdateConfig({ unityAdsGameId: e.target.value.trim() })}
                    placeholder="e.g. 5432109"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-violet-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    Ideal for game applications, rewarded video, and playable ad placements.
                  </p>
                </div>

                {/* AppLovin MAX SDK Key */}
                <div className="space-y-2 bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <label htmlFor="applovin-sdk-key-input" className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      AppLovin MAX SDK Key
                    </label>
                    <button
                      type="button"
                      onClick={() => openInfo("appLovinSdkKey")}
                      className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Setup</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="applovin-sdk-key-input"
                      type={showSecretKey["applovin"] ? "text" : "password"}
                      value={config.appLovinSdkKey || ""}
                      onChange={(e) => onUpdateConfig({ appLovinSdkKey: e.target.value.trim() })}
                      placeholder="AppLovin MAX SDK Key"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-3 pr-10 py-2 text-xs font-mono text-white focus:outline-none focus:border-violet-500"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowSecret("applovin")}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
                    >
                      {showSecretKey["applovin"] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Required in AndroidManifest.xml under <code className="text-slate-300">applovin.sdk.key</code>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CLOUD & NATIVE SERVICES (Google Play Games, OneSignal, Maps, Cloud Project) */}
        {activeTab === "services" && (
          <div className="max-w-4xl space-y-6 animate-in fade-in duration-150">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Key className="w-4 h-4 text-violet-400" />
                    Cloud, Games & Native API Credentials
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure Google Play Games Services, OneSignal push notifications, Google Maps vector tiles, and Cloud Integrity.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleFillTestKeys}
                  className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Insert Test Credentials</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Google Play Games App ID */}
                <div className="space-y-2 bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <label htmlFor="play-games-app-id-input" className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
                      Google Play Games App ID
                    </label>
                    <button
                      type="button"
                      onClick={() => openInfo("googlePlayGamesAppId")}
                      className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Guide</span>
                    </button>
                  </div>
                  <input
                    id="play-games-app-id-input"
                    type="text"
                    value={config.googlePlayGamesAppId || ""}
                    onChange={(e) => onUpdateConfig({ googlePlayGamesAppId: e.target.value.trim() })}
                    placeholder="e.g. 123456789012"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-violet-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    Connects achievements, leaderboards, and automatic Play Games cloud save.
                  </p>
                </div>

                {/* OneSignal App ID */}
                <div className="space-y-2 bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <label htmlFor="onesignal-app-id-input" className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-rose-400" />
                      OneSignal Push Notification App ID
                    </label>
                    <button
                      type="button"
                      onClick={() => openInfo("oneSignalAppId")}
                      className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Guide</span>
                    </button>
                  </div>
                  <input
                    id="onesignal-app-id-input"
                    type="text"
                    value={config.oneSignalAppId || ""}
                    onChange={(e) => onUpdateConfig({ oneSignalAppId: e.target.value.trim() })}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-violet-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    Delivers remote push notifications, background data sync, and segmentation.
                  </p>
                </div>

                {/* Google Maps API Key */}
                <div className="space-y-2 bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <label htmlFor="maps-api-key-input" className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-400" />
                      Google Maps Android API Key
                    </label>
                    <button
                      type="button"
                      onClick={() => openInfo("googleMapsApiKey")}
                      className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Guide</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="maps-api-key-input"
                      type={showSecretKey["maps"] ? "text" : "password"}
                      value={config.googleMapsApiKey || ""}
                      onChange={(e) => onUpdateConfig({ googleMapsApiKey: e.target.value.trim() })}
                      placeholder="AIzaSy..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-3 pr-10 py-2 text-xs font-mono text-white focus:outline-none focus:border-violet-500"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowSecret("maps")}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
                    >
                      {showSecretKey["maps"] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Powers Google Maps SDK for Android with native vector map rendering.
                  </p>
                </div>

                {/* Google Cloud Project Number (Play Integrity) */}
                <div className="space-y-2 bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <label htmlFor="cloud-project-number-input" className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                      Cloud Project Number (Play Integrity)
                    </label>
                    <button
                      type="button"
                      onClick={() => openInfo("googleCloudProjectNumber")}
                      className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Guide</span>
                    </button>
                  </div>
                  <input
                    id="cloud-project-number-input"
                    type="text"
                    value={config.googleCloudProjectNumber || ""}
                    onChange={(e) => onUpdateConfig({ googleCloudProjectNumber: e.target.value.trim() })}
                    placeholder="e.g. 250958817990"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-violet-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    Protects your app against piracy, unauthorized APK tampering, and bot attacks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: MANIFEST & BUILD OUTPUT */}
        {activeTab === "manifest" && (
          <div className="max-w-4xl space-y-6 animate-in fade-in duration-150">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileCode2 className="w-4 h-4 text-violet-400" />
                    Generated AndroidManifest.xml
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live compiled Android manifest with your configured App Name, Icon, Package Name, AdMob, and Cloud metadata.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(generatedManifestXml, "manifest")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
                >
                  {copiedKey === "manifest" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "manifest" ? "Copied" : "Copy XML"}</span>
                </button>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-96">
                  {generatedManifestXml}
                </pre>
              </div>
            </div>

            {/* Gradle Config Snippet */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileCode2 className="w-4 h-4 text-cyan-400" />
                    app/build.gradle.kts (defaultConfig)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Synced Gradle build coordinates.
                  </p>
                </div>
              </div>

              <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
{`defaultConfig {
    applicationId = "${config.packageName}"
    minSdk = ${config.minSdk}
    targetSdk = ${config.targetSdk}
    versionCode = ${config.versionCode}
    versionName = "${config.versionName}"

    testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    vectorDrawables {
        useSupportLibrary = true
    }
}`}
              </pre>
            </div>
          </div>
        )}
      </div>
      )}

      {/* MORE INFO MODAL DIALOG */}
      {selectedInfoKey && MORE_INFO_GUIDES[selectedInfoKey] && (
        <div
          id="more-info-guide-backdrop"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100"
        >
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                  <Info className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white">
                  {MORE_INFO_GUIDES[selectedInfoKey].title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInfoKey(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {MORE_INFO_GUIDES[selectedInfoKey].body}
            </p>

            {MORE_INFO_GUIDES[selectedInfoKey].link && (
              <a
                href={MORE_INFO_GUIDES[selectedInfoKey].link}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 font-semibold"
              >
                <span>Read official Android documentation</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedInfoKey(null)}
                className="px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-xs transition"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
