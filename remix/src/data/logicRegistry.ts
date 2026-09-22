import { LogicAction, LogicBlock } from "../types";

export interface EventDefinition {
  id: string;
  name: string;
  category: "gesture" | "lifecycle" | "input" | "sensor" | "network" | "timer";
  description: string;
  badgeColor: string;
  applicableComponents?: string[]; // e.g. ["Button", "Card"] or empty for all
}

export interface ActionDefinition {
  type: LogicAction["actionType"];
  label: string;
  category: "ui" | "navigation" | "data" | "device" | "ai" | "control";
  description: string;
  color: string;
  defaultAction: Partial<LogicAction>;
}

export interface LogicRecipe {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  block: Omit<LogicBlock, "id">;
}

export const EVENT_DEFINITIONS: EventDefinition[] = [
  // Gestures
  {
    id: "Click",
    name: "On Click (Single Tap)",
    category: "gesture",
    description: "Triggered immediately when user taps once on this element.",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  },
  {
    id: "LongClick",
    name: "On Long Click (Hold 500ms)",
    category: "gesture",
    description: "Triggered when user presses and holds for over 500ms with haptic tick.",
    badgeColor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/40",
  },
  {
    id: "DoubleTap",
    name: "On Double Tap",
    category: "gesture",
    description: "Triggered on rapid 2x successive taps (e.g. like photo or zoom).",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/40",
  },
  {
    id: "SwipeLeft",
    name: "On Swipe Left",
    category: "gesture",
    description: "Triggered when user horizontal flings towards the left.",
    badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40",
  },
  {
    id: "SwipeRight",
    name: "On Swipe Right",
    category: "gesture",
    description: "Triggered when user horizontal flings towards the right (e.g. dismiss).",
    badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40",
  },

  // Lifecycle
  {
    id: "OnScreenLoad",
    name: "On Screen Load (LaunchedEffect)",
    category: "lifecycle",
    description: "Runs automatically as soon as this screen enters the composition tree.",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  },
  {
    id: "OnResume",
    name: "On Activity Resume",
    category: "lifecycle",
    description: "Runs when the app or screen comes back to foreground.",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  },
  {
    id: "OnBackPress",
    name: "On Back Gesture / Key",
    category: "lifecycle",
    description: "Intercepts Android 14+ Predictive Back gesture or hardware back button.",
    badgeColor: "bg-rose-500/20 text-rose-400 border-rose-500/40",
  },

  // Input & State
  {
    id: "OnTextChanged",
    name: "On Text Changed",
    category: "input",
    description: "Emitted on every keystroke in a TextField or SearchBar.",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  },
  {
    id: "OnSearchDebounce",
    name: "On Search (300ms Debounce)",
    category: "input",
    description: "Waits until typing pauses for 300ms before initiating search flow.",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  },
  {
    id: "OnCheckedChange",
    name: "On Checked / Toggle Change",
    category: "input",
    description: "Emitted when Switch, Checkbox, or RadioButton flips state.",
    badgeColor: "bg-teal-500/20 text-teal-400 border-teal-500/40",
  },
  {
    id: "OnValueChange",
    name: "On Slider Value Drag",
    category: "input",
    description: "Emitted continuously or on release as Slider thumb is moved.",
    badgeColor: "bg-teal-500/20 text-teal-400 border-teal-500/40",
  },

  // Sensors & Hardware
  {
    id: "OnLocationChanged",
    name: "On GPS Location Pinpoint",
    category: "sensor",
    description: "Triggered by FusedLocationProvider when coordinates update.",
    badgeColor: "bg-sky-500/20 text-sky-400 border-sky-500/40",
  },
  {
    id: "OnShakeDetected",
    name: "On Shake (Accelerometer)",
    category: "sensor",
    description: "Triggered by accelerometer sensor detecting physical device shake.",
    badgeColor: "bg-orange-500/20 text-orange-400 border-orange-500/40",
  },
  {
    id: "OnNetworkConnected",
    name: "On Network Online / Connected",
    category: "network",
    description: "Triggered when ConnectivityManager detects WiFi/Cellular link.",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  },
  {
    id: "OnNetworkLost",
    name: "On Network Offline / Lost",
    category: "network",
    description: "Triggered when device loses all internet connectivity.",
    badgeColor: "bg-red-500/20 text-red-400 border-red-500/40",
  },
  {
    id: "OnBarcodeScanned",
    name: "On Camera ML Barcode Found",
    category: "sensor",
    description: "Triggered by MLKit CameraX analyzer detecting QR/Barcode value.",
    badgeColor: "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/40",
  },

  // Timer
  {
    id: "OnTimerInterval",
    name: "On Periodic Timer Tick",
    category: "timer",
    description: "Fires repeatedly on specified interval (e.g. 1s or 5s loop).",
    badgeColor: "bg-violet-500/20 text-violet-400 border-violet-500/40",
  },
];

export const ACTION_DEFINITIONS: ActionDefinition[] = [
  // UI & Feedback
  {
    type: "toast",
    label: "Show Toast Message",
    category: "ui",
    description: "Quick overlay notification message (Short 2s / Long 3.5s).",
    color: "text-amber-400 border-amber-500/40 bg-amber-500/10",
    defaultAction: {
      actionType: "toast",
      message: "Operation completed successfully!",
      duration: "short",
    },
  },
  {
    type: "snackbar",
    label: "Show Material Snackbar",
    category: "ui",
    description: "Interactive bottom banner with an optional action button (e.g. Undo).",
    color: "text-amber-400 border-amber-500/40 bg-amber-500/10",
    defaultAction: {
      actionType: "snackbar",
      message: "Item moved to trash",
      actionLabel: "UNDO",
    },
  },
  {
    type: "dialog",
    label: "Show AlertDialog Modal",
    category: "ui",
    description: "Material 3 confirmation dialog with title, message, confirm/cancel buttons.",
    color: "text-indigo-400 border-indigo-500/40 bg-indigo-500/10",
    defaultAction: {
      actionType: "dialog",
      dialogTitle: "Confirm Action",
      dialogBody: "Are you sure you want to proceed with this operation?",
      dialogConfirmText: "Proceed",
      dialogDismissText: "Cancel",
    },
  },
  {
    type: "bottomSheet",
    label: "Expand BottomSheet",
    category: "ui",
    description: "Sliding bottom modal sheet for options or filters.",
    color: "text-indigo-400 border-indigo-500/40 bg-indigo-500/10",
    defaultAction: {
      actionType: "bottomSheet",
      message: "Options Menu",
    },
  },
  {
    type: "setProperty",
    label: "Set Component Property",
    category: "ui",
    description: "Mutate target UI component property (text, visibility, color, enabled).",
    color: "text-blue-400 border-blue-500/40 bg-blue-500/10",
    defaultAction: {
      actionType: "setProperty",
      property: "text",
      value: "Updated Value",
    },
  },
  {
    type: "setVariable",
    label: "Mutate State Variable",
    category: "ui",
    description: "Update, increment, decrement or toggle a screen state variable.",
    color: "text-blue-400 border-blue-500/40 bg-blue-500/10",
    defaultAction: {
      actionType: "setVariable",
      variableName: "count",
      variableOperation: "increment",
      variableValue: "1",
    },
  },

  // Navigation
  {
    type: "navigate",
    label: "Navigate to Screen",
    category: "navigation",
    description: "Transitions to another Compose screen with custom animation.",
    color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
    defaultAction: {
      actionType: "navigate",
      transitionType: "slide",
    },
  },
  {
    type: "popBack",
    label: "Pop Back / Navigate Up",
    category: "navigation",
    description: "Returns to the previous screen in the NavHost backstack.",
    color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
    defaultAction: {
      actionType: "popBack",
    },
  },
  {
    type: "openBrowser",
    label: "Open Custom Tabs / URL",
    category: "navigation",
    description: "Launches Chrome Custom Tabs or device browser with target URL.",
    color: "text-cyan-400 border-cyan-500/40 bg-cyan-500/10",
    defaultAction: {
      actionType: "openBrowser",
      url: "https://android.com",
    },
  },
  {
    type: "share",
    label: "Share Content (Intent)",
    category: "navigation",
    description: "Launches Android system ShareSheet (ACTION_SEND) for text or link.",
    color: "text-cyan-400 border-cyan-500/40 bg-cyan-500/10",
    defaultAction: {
      actionType: "share",
      message: "Check out this Android app created with QuickForge!",
    },
  },

  // Data & Networking
  {
    type: "callApi",
    label: "Call REST API (HTTP)",
    category: "data",
    description: "Execute asynchronous Ktor / Retrofit HTTP request (GET, POST, PUT, DELETE).",
    color: "text-teal-400 border-teal-500/40 bg-teal-500/10",
    defaultAction: {
      actionType: "callApi",
      method: "GET",
      endpoint: "https://jsonplaceholder.typicode.com/posts/1",
      saveResponseTo: "apiData",
    },
  },
  {
    type: "databaseInsert",
    label: "Room DB / SQLite Insert",
    category: "data",
    description: "Persist record entity into local Room Database DAO table.",
    color: "text-sky-400 border-sky-500/40 bg-sky-500/10",
    defaultAction: {
      actionType: "databaseInsert",
      tableName: "user_records",
      value: "Item payload",
    },
  },
  {
    type: "databaseQuery",
    label: "Room DB Query / Select",
    category: "data",
    description: "Fetch cached entities from local Room Database DAO flow.",
    color: "text-sky-400 border-sky-500/40 bg-sky-500/10",
    defaultAction: {
      actionType: "databaseQuery",
      tableName: "user_records",
      saveResponseTo: "cachedItems",
    },
  },
  {
    type: "preferencesSave",
    label: "DataStore / Preferences",
    category: "data",
    description: "Save key-value pair to Android Jetpack Proto/Preferences DataStore.",
    color: "text-sky-400 border-sky-500/40 bg-sky-500/10",
    defaultAction: {
      actionType: "preferencesSave",
      variableName: "user_token",
      variableValue: "auth_token_xyz",
    },
  },
  {
    type: "firebaseWrite",
    label: "Cloud Firestore Write",
    category: "data",
    description: "Insert or update document in Google Firebase Firestore collection.",
    color: "text-orange-400 border-orange-500/40 bg-orange-500/10",
    defaultAction: {
      actionType: "firebaseWrite",
      collectionName: "telemetry_logs",
    },
  },
  {
    type: "firebaseRead",
    label: "Cloud Firestore Read",
    category: "data",
    description: "Stream real-time document or collection snapshot from Firestore.",
    color: "text-orange-400 border-orange-500/40 bg-orange-500/10",
    defaultAction: {
      actionType: "firebaseRead",
      collectionName: "user_profiles",
      saveResponseTo: "remoteProfile",
    },
  },
  {
    type: "webSocketSend",
    label: "WebSocket / Realtime Send",
    category: "data",
    description: "Transmit real-time packet through active OkHttp WebSocket connection.",
    color: "text-teal-400 border-teal-500/40 bg-teal-500/10",
    defaultAction: {
      actionType: "webSocketSend",
      body: '{"event": "ping"}',
    },
  },

  // Native Device Hardware
  {
    type: "vibrate",
    label: "Haptic Feedback / Vibrate",
    category: "device",
    description: "Trigger Android VibrationEffect (Click, Heavy, Double Pulse, or Tick).",
    color: "text-pink-400 border-pink-500/40 bg-pink-500/10",
    defaultAction: {
      actionType: "vibrate",
      hapticPattern: "click",
    },
  },
  {
    type: "playAudio",
    label: "Play Sound / Raw Audio",
    category: "device",
    description: "Play short audio cue or sound pool effect via Android MediaPlayer.",
    color: "text-pink-400 border-pink-500/40 bg-pink-500/10",
    defaultAction: {
      actionType: "playAudio",
      value: "chime_notification",
    },
  },
  {
    type: "requestPermission",
    label: "Request Runtime Permission",
    category: "device",
    description: "Show Android system runtime permission prompt (Camera, Location, etc).",
    color: "text-rose-400 border-rose-500/40 bg-rose-500/10",
    defaultAction: {
      actionType: "requestPermission",
      permission: "android.permission.CAMERA",
    },
  },
  {
    type: "copyToClipboard",
    label: "Copy to Clipboard",
    category: "device",
    description: "Write string to system ClipboardManager with Android 13+ visual chip.",
    color: "text-purple-400 border-purple-500/40 bg-purple-500/10",
    defaultAction: {
      actionType: "copyToClipboard",
      value: "Copied content string",
    },
  },
  {
    type: "toggleFlashlight",
    label: "Toggle Torch / Flashlight",
    category: "device",
    description: "Turn camera LED flash on/off via Android CameraManager.",
    color: "text-yellow-400 border-yellow-500/40 bg-yellow-500/10",
    defaultAction: {
      actionType: "toggleFlashlight",
      value: "toggle",
    },
  },
  {
    type: "startService",
    label: "Start Foreground Service",
    category: "device",
    description: "Launch background/foreground Service or WorkManager worker.",
    color: "text-violet-400 border-violet-500/40 bg-violet-500/10",
    defaultAction: {
      actionType: "startService",
      value: "SyncBackgroundWorker",
    },
  },

  // AI & Speech
  {
    type: "aiQuery",
    label: "Gemini 2.5 Flash Query",
    category: "ai",
    description: "Send prompt context to Google Gemini AI and stream structured response.",
    color: "text-purple-300 border-purple-500/50 bg-purple-500/20",
    defaultAction: {
      actionType: "aiQuery",
      message: "Summarize current inputs into an Android smart recommendation",
      saveResponseTo: "aiSummary",
    },
  },
  {
    type: "textToSpeech",
    label: "Text-to-Speech (TTS)",
    category: "ai",
    description: "Speak sentence out loud using Android TextToSpeech engine.",
    color: "text-purple-300 border-purple-500/50 bg-purple-500/20",
    defaultAction: {
      actionType: "textToSpeech",
      ttsText: "Operation complete. Welcome to QuickForge.",
    },
  },

  // Flow Control
  {
    type: "delay",
    label: "Coroutine Delay (Pause)",
    category: "control",
    description: "Non-blocking coroutine suspension (e.g. wait 1000ms before next step).",
    color: "text-slate-300 border-slate-600 bg-slate-800",
    defaultAction: {
      actionType: "delay",
      delayMs: 1000,
    },
  },
];

export const PREBUILT_RECIPES: LogicRecipe[] = [
  {
    id: "recipe_rest_api",
    title: "REST API Sync & State Update",
    description: "Calls an external API, mutates UI state variable, and alerts with a toast notification.",
    category: "Networking",
    icon: "Globe",
    block: {
      componentId: "root",
      componentName: "FetchTrigger",
      event: "Click",
      eventCategory: "gesture",
      description: "When FetchTrigger.Click -> Call API & Update State",
      enabled: true,
      actions: [
        {
          id: "act_rec_1",
          actionType: "callApi",
          method: "GET",
          endpoint: "https://jsonplaceholder.typicode.com/posts/1",
          saveResponseTo: "articleState",
        },
        {
          id: "act_rec_2",
          actionType: "vibrate",
          hapticPattern: "click",
        },
        {
          id: "act_rec_3",
          actionType: "toast",
          message: "API data retrieved and bound to UI state!",
          duration: "short",
        },
      ],
    },
  },
  {
    id: "recipe_biometric_auth",
    title: "Biometric Auth & Home Navigate",
    description: "Requests biometric verification, gives haptic pulse, and navigates to details.",
    category: "Security",
    icon: "Lock",
    block: {
      componentId: "root",
      componentName: "LoginBtn",
      event: "Click",
      eventCategory: "gesture",
      description: "When LoginBtn.Click -> Authenticate & Transition Screen",
      enabled: true,
      actions: [
        {
          id: "act_rec_auth_1",
          actionType: "vibrate",
          hapticPattern: "click",
        },
        {
          id: "act_rec_auth_2",
          actionType: "toast",
          message: "Biometric authentication verified!",
          duration: "short",
        },
        {
          id: "act_rec_auth_3",
          actionType: "navigate",
          targetScreen: "screen_details",
          transitionType: "slide",
        },
      ],
    },
  },
  {
    id: "recipe_gemini_ai",
    title: "Gemini AI Smart Assistant Flow",
    description: "Sends contextual prompt to Gemini 2.5 Flash, plays haptic tick, and updates card.",
    category: "AI & Cloud",
    icon: "Sparkles",
    block: {
      componentId: "root",
      componentName: "AiAskBtn",
      event: "Click",
      eventCategory: "gesture",
      description: "When AiAskBtn.Click -> Consult Gemini Flash & Speak",
      enabled: true,
      actions: [
        {
          id: "act_rec_ai_1",
          actionType: "toast",
          message: "Generating smart response via Gemini...",
          duration: "short",
        },
        {
          id: "act_rec_ai_2",
          actionType: "aiQuery",
          message: "Explain Android Jetpack Compose State hoisting simply",
          saveResponseTo: "geminiAnswer",
        },
        {
          id: "act_rec_ai_3",
          actionType: "vibrate",
          hapticPattern: "double",
        },
        {
          id: "act_rec_ai_4",
          actionType: "textToSpeech",
          ttsText: "Gemini analysis generated successfully.",
        },
      ],
    },
  },
  {
    id: "recipe_camera_scanner",
    title: "Camera QR / Barcode Scanner",
    description: "Requests CAMERA runtime permission and initializes MLKit scanner.",
    category: "Hardware",
    icon: "Camera",
    block: {
      componentId: "root",
      componentName: "BarcodeNode",
      event: "OnBarcodeScanned",
      eventCategory: "sensor",
      description: "When BarcodeNode.OnBarcodeScanned -> Haptic & Clipboard",
      enabled: true,
      actions: [
        {
          id: "act_rec_cam_1",
          actionType: "vibrate",
          hapticPattern: "heavy",
        },
        {
          id: "act_rec_cam_2",
          actionType: "copyToClipboard",
          value: "QR_PAYLOAD_892341",
        },
        {
          id: "act_rec_cam_3",
          actionType: "snackbar",
          message: "QR Barcode scanned & copied to clipboard",
          actionLabel: "VIEW",
        },
      ],
    },
  },
  {
    id: "recipe_room_db_offline",
    title: "Room SQLite Database Persistence",
    description: "Saves entity record into local Room Database DAO with haptic confirmation.",
    category: "Database",
    icon: "Database",
    block: {
      componentId: "root",
      componentName: "SaveRecordBtn",
      event: "Click",
      eventCategory: "gesture",
      description: "When SaveRecordBtn.Click -> Insert Room DB & Toast",
      enabled: true,
      actions: [
        {
          id: "act_rec_db_1",
          actionType: "databaseInsert",
          tableName: "cached_entries",
          value: "User custom entity",
        },
        {
          id: "act_rec_db_2",
          actionType: "vibrate",
          hapticPattern: "click",
        },
        {
          id: "act_rec_db_3",
          actionType: "toast",
          message: "Saved to local Room Database offline cache!",
          duration: "short",
        },
      ],
    },
  },
];
