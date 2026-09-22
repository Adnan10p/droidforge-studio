import { ProjectConfig, AndroidScreen, ProjectAsset } from "../types";
import { DEFAULT_M3_THEME } from "./defaultTheme";

export const DEFAULT_PROJECT_CONFIG: ProjectConfig = {
  appName: "QuickForge Pro",
  packageName: "com.droidforge.quickapp",
  versionName: "1.0.0",
  versionCode: 1,
  minSdk: 24, // Android 7.0 Nougat
  targetSdk: 35, // Android 15 Vanilla Ice Cream
  compileSdk: 35,
  kotlinVersion: "2.0.21",
  composeVersion: "1.7.5",
  gradleVersion: "8.9",
  enableNdk: true,
  ndkVersion: "26.1.10909125",
  architectures: ["arm64-v8a", "armeabi-v7a", "x86_64"],
  permissions: [
    "android.permission.INTERNET",
    "android.permission.ACCESS_FINE_LOCATION",
    "android.permission.ACCESS_COARSE_LOCATION",
    "android.permission.CAMERA",
    "android.permission.POST_NOTIFICATIONS",
    "android.permission.VIBRATE",
  ],
  // App Branding & Launcher
  appIcon: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=512&auto=format&fit=crop&q=80",
  enableSplashScreen: true,
  splashImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
  splashBackgroundColor: "#0F172A",

  // Global Material 3 Theme
  theme: DEFAULT_M3_THEME,

  // Ad Networks & Monetization SDKs
  googleAdsAppId: "ca-app-pub-3940256099942544~3347511713",
  startIoAppId: "",
  unityAdsGameId: "",
  appLovinSdkKey: "",

  // Services, APIs & Gaming
  googlePlayGamesAppId: "",
  oneSignalAppId: "",
  googleMapsApiKey: "",
  googleCloudProjectNumber: "",
  dependencies: [
    {
      id: "dep_compose_m3",
      name: "Compose Material 3",
      group: "androidx.compose.material3",
      artifact: "material3",
      version: "1.3.1",
      description: "Material Design 3 UI components, colors, and typography for Jetpack Compose.",
      enabled: true,
      category: "Compose",
    },
    {
      id: "dep_coil",
      name: "Coil Compose (Async Image)",
      group: "io.coil-kt",
      artifact: "coil-compose",
      version: "2.7.0",
      description: "Kotlin-first image loading library for Android network and disk cached images.",
      enabled: true,
      category: "Media",
    },
    {
      id: "dep_core_ktx",
      name: "AndroidX Core KTX",
      group: "androidx.core",
      artifact: "core-ktx",
      version: "1.13.1",
      description: "Core Kotlin extensions for Android framework APIs.",
      enabled: true,
      category: "Native",
    },
    {
      id: "dep_lifecycle_runtime",
      name: "Lifecycle Runtime Compose",
      group: "androidx.lifecycle",
      artifact: "lifecycle-runtime-compose",
      version: "2.8.6",
      description: "Lifecycle-aware state collection and Compose ViewModel integration.",
      enabled: true,
      category: "Compose",
    },
  ],
  nativeLibs: [],
  buildFlavors: [
    { name: "dev", suffix: ".dev" },
    { name: "staging", suffix: ".staging" },
    { name: "production", suffix: "" },
  ],
};

export const INITIAL_SCREENS: AndroidScreen[] = [
  {
    id: "screen_home",
    name: "Screen1",
    title: "Screen1",
    isInitial: true,
    properties: {
      backgroundColor: "#FFFFFF",
      titleVisible: true,
      primaryColor: "#2563EB",
    },
    rootComponent: {
      id: "root_home_column",
      type: "ScrollView",
      name: "Screen1",
      category: "Layouts",
      props: {
        padding: 16,
        backgroundColor: "#FFFFFF",
        layoutWidth: "match_parent",
        layoutHeight: "match_parent",
      },
      children: [],
    },
    logicBlocks: [],
  },
];

export const INITIAL_ASSETS: ProjectAsset[] = [
  {
    id: "asset_ic_launcher",
    name: "ic_launcher.png",
    fileName: "ic_launcher.png",
    type: "mipmap",
    format: "png",
    size: "48 KB",
    targetResDir: "res/mipmap-xxxhdpi",
  },
  {
    id: "asset_logo_svg",
    name: "droidforge_logo.svg",
    fileName: "droidforge_logo.xml",
    type: "drawable",
    format: "svg",
    size: "12 KB",
    targetResDir: "res/drawable",
  },
  {
    id: "asset_font_inter",
    name: "inter_variable.ttf",
    fileName: "inter_variable.ttf",
    type: "font",
    format: "ttf",
    size: "340 KB",
    targetResDir: "res/font",
  },
  {
    id: "asset_raw_config",
    name: "app_endpoints.json",
    fileName: "app_endpoints.json",
    type: "raw",
    format: "json",
    size: "4 KB",
    targetResDir: "res/raw",
  },
];
