export type DeviceType = "phone" | "tablet" | "foldable";
export type Orientation = "portrait" | "landscape";

export type ComponentCategory =
  | "Actions"
  | "Navigation"
  | "Containment"
  | "Inputs"
  | "Content"
  | "Progress"
  | "Hardware & Native"
  | "Layout & Containers"
  | "Basic UI"
  | "Input & Controls"
  | "Media & Display"
  | "Device & Hardware"
  | "Sensors & Location"
  | "System & Services";

export interface ComponentPropDef {
  text?: string;
  title?: string;
  subtitle?: string;
  hint?: string;
  placeholder?: string;
  helperText?: string;
  textColor?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontWeight?: "normal" | "medium" | "bold";
  fontStyle?: "normal" | "italic";
  textAlign?: "left" | "center" | "right";
  textDecoration?: "none" | "underline" | "line-through";
  letterSpacing?: number;
  lineHeight?: number;
  maxLines?: number;
  singleLine?: boolean;
  readOnly?: boolean;
  padding?: number;
  margin?: number;
  cornerRadius?: number;
  elevation?: number;
  layoutWidth?: "wrap_content" | "match_parent" | number;
  layoutHeight?: "wrap_content" | "match_parent" | number;
  orientation?: "vertical" | "horizontal";
  icon?: string;
  hasIcon?: boolean;
  url?: string;
  src?: string;
  alt?: string;
  contentScale?: "fit" | "crop" | "fillBounds" | "inside" | "center";
  tintColor?: string;
  aspectRatio?: number;
  checked?: boolean;
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  progress?: number;
  indeterminate?: boolean;
  thickness?: number;
  color?: string;
  isCircular?: boolean;
  showBackButton?: boolean;
  items?: string[];
  enabled?: boolean;
  visibility?: "visible" | "invisible" | "gone";
  alpha?: number;
  borderWidth?: number;
  borderColor?: string;
  align?: "top-left" | "top-center" | "top-right" | "top-fill" | "center-left" | "center" | "center-right" | "bottom-fill" | string;
  variant?: "filled" | "tonal" | "elevated" | "outlined" | "text";
  toggleButton?: boolean;
  fixedWidth?: boolean | number;
  fullWidth?: boolean;
  shape?: "rounded" | "circle" | "pill" | "square";
  inputType?: "text" | "email" | "password" | "number" | "phone" | "multiline";
  isPassword?: boolean;
  thumbColor?: string;
  activeTrackColor?: string;
  inactiveTrackColor?: string;
  boxColor?: string;
  checkColor?: string;
  selectedColor?: string;
  lensFacing?: "back" | "front";
  flashMode?: "off" | "on" | "auto";
  latitude?: number;
  longitude?: number;
  zoom?: number;
  mapType?: "normal" | "satellite" | "terrain" | "hybrid";
  showUserLocation?: boolean;
  chipStyle?: "filter" | "assist" | "input" | "suggestion";
  selected?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  showControls?: boolean;
  enableJavaScript?: boolean;
  enableZoom?: boolean;
  [key: string]: any;
}

export type ScreenOrientationType =
  | "unspecified"
  | "portrait"
  | "landscape"
  | "sensor"
  | "user"
  | "behind"
  | "sensorPortrait"
  | "sensorLandscape";

export type ScreenAnimationType =
  | "default"
  | "fade"
  | "zoom"
  | "slide_horizontal"
  | "slide_vertical"
  | "none";

export interface ScreenProperties {
  alignHorizontal?: "left" | "center" | "right";
  alignVertical?: "top" | "center" | "bottom";
  backgroundColor?: string;
  backgroundImage?: string;
  bigDefaultText?: boolean;
  closeScreenAnimation?: ScreenAnimationType;
  highContrast?: boolean;
  highQualityImages?: boolean;
  navigationBarColor?: string;
  navigationBarLightIcons?: boolean;
  openScreenAnimation?: ScreenAnimationType;
  primaryColor?: string;
  primaryColorDark?: string;
  accentColor?: string;
  screenOrientation?: ScreenOrientationType;
  showAboutInMenu?: boolean;
  aboutScreenText?: string;
  showListsAsJson?: boolean;
  showNavigationBar?: boolean;
  showStatusBar?: boolean;
  sizing?: "Fixed" | "Responsive";
  statusBarColor?: string;
  statusBarLightIcons?: boolean;
  title?: string;
  titleVisible?: boolean;
  scrollable?: boolean;
  keepScreenOn?: boolean;
}

export interface AndroidComponent {
  id: string;
  type: string;
  name: string;
  category: ComponentCategory;
  props: ComponentPropDef;
  children?: AndroidComponent[];
}

export interface LogicCondition {
  id?: string;
  left: string;
  operator: "==" | "!=" | ">" | "<" | ">=" | "<=" | "contains" | "isEmpty" | "isNotEmpty";
  right: string;
}

export interface StateVariable {
  id: string;
  name: string;
  type: "String" | "Int" | "Boolean" | "List" | "Double";
  initialValue: string;
  description?: string;
}

export interface LogicAction {
  id: string;
  actionType:
    | "setProperty"
    | "setVariable"
    | "navigate"
    | "popBack"
    | "toast"
    | "snackbar"
    | "dialog"
    | "bottomSheet"
    | "callApi"
    | "webSocketSend"
    | "firebaseWrite"
    | "firebaseRead"
    | "databaseInsert"
    | "databaseQuery"
    | "preferencesSave"
    | "requestPermission"
    | "startService"
    | "playAudio"
    | "vibrate"
    | "share"
    | "openBrowser"
    | "aiQuery"
    | "textToSpeech"
    | "delay"
    | "copyToClipboard"
    | "toggleFlashlight";
  targetId?: string;
  property?: string;
  value?: any;
  message?: string;
  duration?: "short" | "long";
  actionLabel?: string;
  targetScreen?: string;
  transitionType?: "slide" | "fade" | "scale";
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: string;
  saveResponseTo?: string;
  permission?: string;
  variableName?: string;
  variableOperation?: "assign" | "increment" | "decrement" | "toggle";
  variableValue?: string;
  delayMs?: number;
  hapticPattern?: "click" | "heavy" | "double" | "tick";
  dialogTitle?: string;
  dialogBody?: string;
  dialogConfirmText?: string;
  dialogDismissText?: string;
  ttsText?: string;
  collectionName?: string;
  tableName?: string;
  url?: string;
  conditionEnabled?: boolean;
  condition?: LogicCondition;
  branchType?: "standard" | "condition_yes" | "condition_no" | "api_success" | "api_failure";
  parentId?: string;
  position?: { x: number; y: number };
  subActions?: LogicAction[];
  elseActions?: LogicAction[];
}

export interface LogicBlock {
  id: string;
  componentId: string;
  componentName: string;
  event: string; // e.g. "Click", "LongClick", "OnCreate", "OnLocationChanged", etc.
  eventCategory?: "gesture" | "lifecycle" | "input" | "sensor" | "network" | "timer";
  description: string;
  enabled?: boolean;
  actions: LogicAction[];
  position?: { x: number; y: number };
  flowMetadata?: Record<string, any>;
}

export interface AndroidScreen {
  id: string;
  name: string;
  title: string;
  isInitial?: boolean;
  rootComponent: AndroidComponent;
  logicBlocks: LogicBlock[];
  stateVariables?: StateVariable[];
  properties?: ScreenProperties;
}

export interface AndroidDependency {
  id: string;
  name: string;
  group: string;
  artifact: string;
  version: string;
  description: string;
  enabled: boolean;
  category: "Compose" | "Networking" | "Database" | "Media" | "Firebase" | "Native" | "Utility";
}

export interface NativeLibrary {
  id: string;
  name: string;
  fileName: string; // e.g. "libnative-crypto.so" or "core-crypto.aar"
  type: "so" | "aar" | "jar";
  abi: "arm64-v8a" | "armeabi-v7a" | "x86_64" | "all";
  size: string;
  enabled: boolean;
  jniMethodSignature?: string;
}

export interface ProjectAsset {
  id: string;
  name: string;
  fileName: string;
  type: "drawable" | "mipmap" | "font" | "raw" | "asset";
  format: "png" | "webp" | "svg" | "ttf" | "json" | "mp3" | "mp4";
  size: string;
  url?: string;
  targetResDir: string;
}

export interface Material3ColorScheme {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  outline: string;
  outlineVariant: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
}

export interface Material3TypographyToken {
  fontFamily: string;
  fontSize: number; // sp / px
  fontWeight: "normal" | "medium" | "semibold" | "bold";
  lineHeight: number;
}

export interface Material3TypographyConfig {
  baseFontFamily: string; // e.g. "Roboto", "Plus Jakarta Sans", "Outfit", "Poppins", "Inter"
  displayLarge: Material3TypographyToken;
  headlineMedium: Material3TypographyToken;
  titleLarge: Material3TypographyToken;
  titleMedium: Material3TypographyToken;
  bodyLarge: Material3TypographyToken;
  bodyMedium: Material3TypographyToken;
  labelLarge: Material3TypographyToken; // Used for button labels
  labelMedium: Material3TypographyToken; // Used for chips/badges
}

export interface Material3ShapeConfig {
  cornerStyle: "rounded" | "cut";
  extraSmall: number; // dp (autocomplete, small chips) e.g. 4
  small: number; // dp (chips, snackbars) e.g. 8
  medium: number; // dp (cards, small dialogs) e.g. 12
  large: number; // dp (FABs, modal drawers) e.g. 16
  extraLarge: number; // dp (large dialogs, pill buttons) e.g. 28
}

export interface Material3Theme {
  mode: "light" | "dark" | "system";
  useDynamicColor: boolean; // Android 12+ Material You
  lightColors: Material3ColorScheme;
  darkColors: Material3ColorScheme;
  typography: Material3TypographyConfig;
  shapes: Material3ShapeConfig;
}

export interface ProjectConfig {
  appName: string;
  packageName: string;
  versionName: string;
  versionCode: number;
  minSdk: number;
  targetSdk: number;
  compileSdk: number;
  kotlinVersion: string;
  composeVersion: string;
  gradleVersion: string;
  enableNdk: boolean;
  ndkVersion: string;
  architectures: ("arm64-v8a" | "armeabi-v7a" | "x86_64")[];
  permissions: string[];
  dependencies: AndroidDependency[];
  nativeLibs: NativeLibrary[];
  buildFlavors: { name: string; suffix: string }[];

  // App Branding & Launcher Properties
  appIcon?: string;
  enableSplashScreen?: boolean;
  splashImage?: string;
  splashBackgroundColor?: string;

  // Material 3 Global Theme
  theme?: Material3Theme;

  // Ad Networks & Monetization SDK Keys
  googleAdsAppId?: string;
  startIoAppId?: string;
  unityAdsGameId?: string;
  appLovinSdkKey?: string;

  // Cloud, Game & Native Services Keys
  googlePlayGamesAppId?: string;
  oneSignalAppId?: string;
  googleMapsApiKey?: string;
  googleCloudProjectNumber?: string;
}

export type ActiveTab =
  | "dashboard"
  | "canvas"
  | "logic"
  | "code"
  | "sdk"
  | "assets"
  | "properties"
  | "versions"
  | "docs";

export interface SavedProject {
  id: string;
  name: string;
  packageName: string;
  description?: string;
  category: "Android App" | "Web App" | "SaaS App" | "Landing Page" | "E-Commerce" | "Portfolio" | "Tools" | "Social";
  status: "Published" | "Draft" | "Building";
  gradient: string;
  updatedAt: string;
  createdAt?: string;
  icon?: string;
  screensCount: number;
  deploymentsCount: number;
  viewsCount: string;
  config: ProjectConfig;
  screens: AndroidScreen[];
  assets: ProjectAsset[];
}

export interface ProjectSnapshot {
  id: string;
  projectId: string;
  projectName: string;
  versionTag: string;
  commitMessage: string;
  description?: string;
  timestamp: string;
  formattedDate: string;
  type: "manual" | "auto" | "milestone";
  screensCount: number;
  componentsCount: number;
  configSnapshot: ProjectConfig;
  screensSnapshot: AndroidScreen[];
  assetsSnapshot: ProjectAsset[];
  projectsSnapshot?: SavedProject[];
}

// ==========================================
// BUILDER IDE PREFERENCES & WORKSPACE CONFIG
// (Controls ONLY IDE UI - Never modifies user Android App)
// ==========================================
export type IdeTheme = "slate" | "midnight" | "light" | "nordic" | "high-contrast" | "custom";
export type IdeAccentColor = "indigo" | "blue" | "violet" | "emerald" | "amber" | "rose" | "cyan" | "custom";
export type IdeDensity = "compact" | "comfortable" | "spacious";
export type IdeFont = "system" | "plus-jakarta" | "inter" | "jetbrains" | "outfit";
export type CanvasBgStyle = "dots" | "blueprint" | "solid" | "dark-grid";
export type CodeEditorTheme = "vs-dark" | "monokai" | "github-dark" | "github-light" | "dracula";
export type AutoSaveInterval = "instant" | "30s" | "60s" | "manual";

export interface CustomThemeColors {
  // Theme Background & Surface Colors
  shellBg: string;         // Studio IDE Background (e.g. #0F172A)
  cardBg: string;          // Card & Panel Surface (e.g. #1E293B)
  cardInnerBg: string;     // Inner Container & Sub-card (e.g. #0F172A)
  borderColor: string;     // Borders & Dividers (e.g. #334155)

  // Typography & Font Colors
  textColor: string;       // Primary Text / Font Color (e.g. #F8FAFC)
  textMutedColor: string;  // Muted / Secondary Font Color (e.g. #94A3B8)

  // Tab Navigation Colors
  tabBarBg: string;        // Navigation Tab Bar Background (e.g. #0B1120)
  tabActiveBg: string;     // Active Tab Background (e.g. #6366F1)
  tabActiveText: string;   // Active Tab Text / Font Color (e.g. #FFFFFF)
  tabInactiveText: string; // Inactive Tab Text / Font Color (e.g. #94A3B8)
  tabIndicatorColor: string; // Tab Highlight / Border Color (e.g. #818CF8)

  // Accent & Action Colors
  accentColor: string;     // Studio Accent Color (e.g. #6366F1)
  accentTextColor: string; // Text Color on Accent Elements (e.g. #FFFFFF)
}

export interface BuilderIdeSettings {
  // Appearance & Personalization (IDE Studio UI only)
  theme: IdeTheme;
  customThemeColors?: CustomThemeColors;
  accentColor: IdeAccentColor;
  density: IdeDensity;
  uiFont: IdeFont;
  canvasBackground: CanvasBgStyle;
  interfaceScaling: number; // 90, 100, 105, 110
  reducedMotion: boolean;

  // Code Studio Preferences (IDE Kotlin/Compose Editor)
  codeEditorTheme: CodeEditorTheme;
  codeFontSize: number;
  codeTabSize: 2 | 4;
  codeLineNumbers: boolean;
  codeMinimap: boolean;
  codeWordWrap: boolean;

  // Visual Editor / Canvas IDE behavior
  snapToGrid: boolean;
  gridSize: 8 | 16 | 24;
  showComponentOutlines: boolean;
  smartAlignmentGuides: boolean;
  touchTargetIndicators: boolean; // Highlights 48dp Android touch boundaries

  // Workflow & Feedback
  soundEffects: boolean;
  autoSaveInterval: AutoSaveInterval;
}

