import { AndroidComponent, AndroidScreen, LogicAction, LogicBlock } from "../types";

export interface EventOutputDef {
  name: string;
  type: "String" | "Int" | "Float" | "Boolean" | "Long" | "Double";
  description: string;
}

export interface ComponentEventDef {
  id: string;
  name: string;
  category: "gesture" | "lifecycle" | "input" | "sensor" | "network" | "timer";
  description: string;
  outputs: EventOutputDef[];
  badgeColor: string;
}

export interface ComponentPropertyDef {
  name: string;
  label: string;
  type: "string" | "number" | "boolean" | "color" | "enum";
  options?: string[];
  defaultValue: any;
  description: string;
}

export interface ComponentFunctionDef {
  id: string;
  name: string;
  description: string;
  params: { name: string; type: string; description?: string }[];
}

export interface ComponentDependencyDef {
  group: string;
  artifact: string;
  version: string;
}

export interface ComponentLogicMeta {
  componentType: string;
  label: string;
  category: string;
  iconName: string;
  description: string;
  kind?: "VISIBLE" | "NON_VISIBLE";
  dependencies?: ComponentDependencyDef[];
  permissions?: string[];
  supportedEvents: ComponentEventDef[];
  supportedProperties: ComponentPropertyDef[];
  supportedFunctions?: ComponentFunctionDef[];
  recommendedActions: LogicAction["actionType"][];
}


// ---------------------------------------------------------------------------
// Standard Common Properties for all Android UI components
// ---------------------------------------------------------------------------
const COMMON_UI_PROPERTIES: ComponentPropertyDef[] = [
  {
    name: "visibility",
    label: "Visibility",
    type: "enum",
    options: ["visible", "invisible", "gone"],
    defaultValue: "visible",
    description: "Android View visibility mode (View.VISIBLE, INVISIBLE, GONE)",
  },
  {
    name: "enabled",
    label: "Enabled State",
    type: "boolean",
    defaultValue: true,
    description: "Whether the component accepts touch events and user interactions",
  },
];

// ---------------------------------------------------------------------------
// Component Logic Metadata Registry
// ---------------------------------------------------------------------------
export const COMPONENT_LOGIC_META_MAP: Record<string, ComponentLogicMeta> = {
  // 1. Button
  Button: {
    componentType: "Button",
    label: "Action Button",
    category: "Actions",
    iconName: "Button",
    description: "Interactive Material 3 button with ripple animation",
    supportedEvents: [
      {
        id: "Click",
        name: "Click (Tap)",
        category: "gesture",
        description: "Fires immediately when the user taps the button",
        outputs: [
          { name: "clickTimestamp", type: "Long", description: "System timestamp of touch in ms" },
        ],
        badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      },
      {
        id: "LongClick",
        name: "Long Click (Hold)",
        category: "gesture",
        description: "Fires when the button is held for 500ms or longer",
        outputs: [
          { name: "pressDurationMs", type: "Int", description: "Duration of hold in ms" },
        ],
        badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
      },
      {
        id: "DoubleTap",
        name: "Double Tap",
        category: "gesture",
        description: "Fires when user taps twice in rapid succession",
        outputs: [],
        badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      },
    ],
    supportedProperties: [
      {
        name: "text",
        label: "Button Label Text",
        type: "string",
        defaultValue: "Click Action",
        description: "Displayed button text label",
      },
      {
        name: "backgroundColor",
        label: "Background Color",
        type: "color",
        defaultValue: "#2563EB",
        description: "Material container background hex color",
      },
      {
        name: "textColor",
        label: "Text Color",
        type: "color",
        defaultValue: "#FFFFFF",
        description: "Foreground font color",
      },
      {
        name: "variant",
        label: "Button Variant",
        type: "enum",
        options: ["filled", "tonal", "outlined", "elevated", "text"],
        defaultValue: "filled",
        description: "Material 3 button elevation style",
      },
      {
        name: "cornerRadius",
        label: "Corner Radius",
        type: "number",
        defaultValue: 12,
        description: "Corner curvature in density-independent pixels (dp)",
      },
      ...COMMON_UI_PROPERTIES,
    ],
    recommendedActions: [
      "toast",
      "navigate",
      "setProperty",
      "setVariable",
      "callApi",
      "vibrate",
      "dialog",
      "snackbar",
    ],
  },

  // 2. IconButton
  IconButton: {
    componentType: "IconButton",
    label: "Icon Button",
    category: "Actions",
    iconName: "IconButton",
    description: "Compact circular icon button for secondary or toolbar actions",
    supportedEvents: [
      {
        id: "Click",
        name: "Click (Tap)",
        category: "gesture",
        description: "Fires when the icon button is tapped",
        outputs: [{ name: "clickTimestamp", type: "Long", description: "Timestamp of tap" }],
        badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      },
    ],
    supportedProperties: [
      {
        name: "backgroundColor",
        label: "Background Color",
        type: "color",
        defaultValue: "#E8DEF8",
        description: "Button container background color",
      },
      {
        name: "textColor",
        label: "Icon Tint Color",
        type: "color",
        defaultValue: "#1D192B",
        description: "Tint color applied to vector icon",
      },
      ...COMMON_UI_PROPERTIES,
    ],
    recommendedActions: ["vibrate", "popBack", "toast", "setVariable", "setProperty"],
  },

  // 3. FAB / ExtendedFAB
  FAB: {
    componentType: "FAB",
    label: "Floating Action Button (FAB)",
    category: "Actions",
    iconName: "FAB",
    description: "High-emphasis circular action button floating above screen",
    supportedEvents: [
      {
        id: "Click",
        name: "Click (Tap)",
        category: "gesture",
        description: "Fires when the floating button is tapped",
        outputs: [],
        badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      },
    ],
    supportedProperties: [
      {
        name: "backgroundColor",
        label: "FAB Background Color",
        type: "color",
        defaultValue: "#6750A4",
        description: "Container background color",
      },
      {
        name: "textColor",
        label: "Icon Color",
        type: "color",
        defaultValue: "#FFFFFF",
        description: "Icon foreground tint",
      },
      ...COMMON_UI_PROPERTIES,
    ],
    recommendedActions: ["navigate", "dialog", "bottomSheet", "setVariable", "vibrate"],
  },

  ExtendedFAB: {
    componentType: "ExtendedFAB",
    label: "Extended FAB",
    category: "Actions",
    iconName: "ExtendedFAB",
    description: "Pill-shaped floating button combining vector icon with text",
    supportedEvents: [
      {
        id: "Click",
        name: "Click (Tap)",
        category: "gesture",
        description: "Fires when extended FAB is clicked",
        outputs: [],
        badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      },
    ],
    supportedProperties: [
      {
        name: "text",
        label: "Label Text",
        type: "string",
        defaultValue: "Compose",
        description: "Displayed text label",
      },
      {
        name: "backgroundColor",
        label: "Background Color",
        type: "color",
        defaultValue: "#6750A4",
        description: "Container color",
      },
      ...COMMON_UI_PROPERTIES,
    ],
    recommendedActions: ["navigate", "dialog", "bottomSheet", "callApi", "vibrate"],
  },

  // 4. Chip
  Chip: {
    componentType: "Chip",
    label: "Filter / Action Chip",
    category: "Actions",
    iconName: "Chip",
    description: "Compact interactive pill for dynamic filters and tags",
    supportedEvents: [
      {
        id: "Click",
        name: "Click",
        category: "gesture",
        description: "Fires when chip is tapped",
        outputs: [],
        badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      },
      {
        id: "CheckedChange",
        name: "Checked Change",
        category: "input",
        description: "Fires when filter chip toggle state flips",
        outputs: [
          { name: "isChecked", type: "Boolean", description: "New selected state (true/false)" },
        ],
        badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      },
    ],
    supportedProperties: [
      {
        name: "text",
        label: "Chip Text",
        type: "string",
        defaultValue: "Filter",
        description: "Text inside chip",
      },
      {
        name: "checked",
        label: "Selected / Checked",
        type: "boolean",
        defaultValue: false,
        description: "Selection state of the chip",
      },
      ...COMMON_UI_PROPERTIES,
    ],
    recommendedActions: ["setVariable", "setProperty", "vibrate", "callApi"],
  },

  // 5. TextField
  TextField: {
    componentType: "TextField",
    label: "Text Field / Input",
    category: "Inputs",
    iconName: "TextCursorInput",
    description: "Editable text input field with hint, label, and validation",
    supportedEvents: [
      {
        id: "OnTextChanged",
        name: "On Text Changed",
        category: "input",
        description: "Fires on every keystroke as user edits the input",
        outputs: [
          { name: "text", type: "String", description: "Current full input string" },
          { name: "length", type: "Int", description: "Character count of input" },
        ],
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      },
      {
        id: "OnSubmit",
        name: "On Submit / Done",
        category: "input",
        description: "Fires when user presses Enter or the soft keyboard action key",
        outputs: [
          { name: "text", type: "String", description: "Submitted text string" },
        ],
        badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      },
      {
        id: "OnFocusGained",
        name: "On Focus Gained",
        category: "input",
        description: "Fires when user focuses the field to start typing",
        outputs: [],
        badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      },
      {
        id: "OnFocusLost",
        name: "On Focus Lost",
        category: "input",
        description: "Fires when user taps away from the field",
        outputs: [
          { name: "text", type: "String", description: "Final text when focus was lost" },
        ],
        badgeColor: "bg-slate-500/20 text-slate-300 border-slate-500/40",
      },
    ],
    supportedProperties: [
      {
        name: "text",
        label: "Input Content Text",
        type: "string",
        defaultValue: "",
        description: "Text currently typed in the field",
      },
      {
        name: "hint",
        label: "Placeholder / Hint",
        type: "string",
        defaultValue: "Enter text...",
        description: "Ghost hint text when empty",
      },
      {
        name: "textColor",
        label: "Text Color",
        type: "color",
        defaultValue: "#0F172A",
        description: "Color of input text",
      },
      {
        name: "readOnly",
        label: "Read Only",
        type: "boolean",
        defaultValue: false,
        description: "Prevent typing while keeping selectable",
      },
      ...COMMON_UI_PROPERTIES,
    ],
    recommendedActions: ["setVariable", "setProperty", "callApi", "aiQuery", "toast"],
  },

  // 6. Switch
  Switch: {
    componentType: "Switch",
    label: "Toggle Switch",
    category: "Inputs",
    iconName: "ToggleLeft",
    description: "Binary toggle switch for system settings and preferences",
    supportedEvents: [
      {
        id: "OnCheckedChange",
        name: "On Checked Change",
        category: "input",
        description: "Fires whenever switch is toggled on or off",
        outputs: [
          { name: "isChecked", type: "Boolean", description: "Current checked state (true/false)" },
        ],
        badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      },
    ],
    supportedProperties: [
      {
        name: "checked",
        label: "Checked State",
        type: "boolean",
        defaultValue: false,
        description: "Whether switch is in active state",
      },
      {
        name: "text",
        label: "Label Text",
        type: "string",
        defaultValue: "Enable Feature",
        description: "Accompanying label text",
      },
      ...COMMON_UI_PROPERTIES,
    ],
    recommendedActions: [
      "setVariable",
      "preferencesSave",
      "setProperty",
      "vibrate",
      "toast",
    ],
  },

  // 7. Checkbox
  Checkbox: {
    componentType: "Checkbox",
    label: "Checkbox",
    category: "Inputs",
    iconName: "CheckSquare",
    description: "Square checkbox for multi-option selections and agreements",
    supportedEvents: [
      {
        id: "OnCheckedChange",
        name: "On Checked Change",
        category: "input",
        description: "Fires when user checks or unchecks the box",
        outputs: [
          { name: "isChecked", type: "Boolean", description: "Current checked state" },
        ],
        badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      },
    ],
    supportedProperties: [
      {
        name: "checked",
        label: "Checked State",
        type: "boolean",
        defaultValue: false,
        description: "Whether box is ticked",
      },
      {
        name: "text",
        label: "Checkbox Label",
        type: "string",
        defaultValue: "I agree to conditions",
        description: "Label text",
      },
      ...COMMON_UI_PROPERTIES,
    ],
    recommendedActions: ["setVariable", "setProperty", "toast", "vibrate"],
  },

  // 8. Slider
  Slider: {
    componentType: "Slider",
    label: "Value Slider",
    category: "Inputs",
    iconName: "Sliders",
    description: "Draggable slider track for continuous numeric adjustments",
    supportedEvents: [
      {
        id: "OnValueChange",
        name: "On Value Change",
        category: "input",
        description: "Fires continuously as the slider thumb is dragged",
        outputs: [
          { name: "value", type: "Float", description: "Current numeric value" },
          { name: "progressPercent", type: "Int", description: "Percent progress (0-100)" },
        ],
        badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      },
    ],
    supportedProperties: [
      {
        name: "value",
        label: "Current Value",
        type: "number",
        defaultValue: 50,
        description: "Current slider position value",
      },
      {
        name: "min",
        label: "Minimum Value",
        type: "number",
        defaultValue: 0,
        description: "Slider lowest range limit",
      },
      {
        name: "max",
        label: "Maximum Value",
        type: "number",
        defaultValue: 100,
        description: "Slider highest range limit",
      },
      ...COMMON_UI_PROPERTIES,
    ],
    recommendedActions: ["setVariable", "setProperty", "vibrate", "callApi"],
  },

  // 9. Text (TextView / Label)
  Text: {
    componentType: "Text",
    label: "Text Label",
    category: "Content",
    iconName: "Type",
    description: "Typography label for titles, paragraphs, and dynamic status",
    supportedEvents: [
      {
        id: "Click",
        name: "Click (Tap)",
        category: "gesture",
        description: "Fires when user taps the text element",
        outputs: [],
        badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      },
      {
        id: "LongClick",
        name: "Long Click (Hold to Copy)",
        category: "gesture",
        description: "Fires when user presses and holds text",
        outputs: [],
        badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
      },
    ],
    supportedProperties: [
      {
        name: "text",
        label: "Label Text",
        type: "string",
        defaultValue: "Label",
        description: "Visible string displayed",
      },
      {
        name: "textColor",
        label: "Text Color",
        type: "color",
        defaultValue: "#0F172A",
        description: "Color of text glyphs",
      },
      {
        name: "fontSize",
        label: "Font Size (sp)",
        type: "number",
        defaultValue: 16,
        description: "Size in scalable pixels (sp)",
      },
      {
        name: "fontWeight",
        label: "Font Weight",
        type: "enum",
        options: ["normal", "medium", "bold"],
        defaultValue: "normal",
        description: "Typographic font weight",
      },
      ...COMMON_UI_PROPERTIES,
    ],
    recommendedActions: ["copyToClipboard", "toast", "navigate", "dialog"],
  },

  // 10. Image
  Image: {
    componentType: "Image",
    label: "Image / Photo",
    category: "Content",
    iconName: "Image",
    description: "Async loaded image via Coil with caching and transformation",
    supportedEvents: [
      {
        id: "Click",
        name: "Click (Tap)",
        category: "gesture",
        description: "Fires when user taps the image",
        outputs: [],
        badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      },
    ],
    supportedProperties: [
      {
        name: "url",
        label: "Image URL / Asset",
        type: "string",
        defaultValue: "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6",
        description: "Remote HTTP image URL or local drawable",
      },
      {
        name: "alt",
        label: "Content Description",
        type: "string",
        defaultValue: "Android photo",
        description: "Accessibility screen reader text",
      },
      {
        name: "cornerRadius",
        label: "Corner Radius (dp)",
        type: "number",
        defaultValue: 12,
        description: "Rounded corner clip radius",
      },
      ...COMMON_UI_PROPERTIES,
    ],
    recommendedActions: ["dialog", "navigate", "vibrate", "share"],
  },

  // 11. Card
  Card: {
    componentType: "Card",
    label: "Material Card Surface",
    category: "Containment",
    iconName: "CreditCard",
    description: "Elevated container surface with rounded corners and shadow",
    supportedEvents: [
      {
        id: "Click",
        name: "Click (Tap Card)",
        category: "gesture",
        description: "Fires when user taps anywhere on the card surface",
        outputs: [],
        badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      },
    ],
    supportedProperties: [
      {
        name: "backgroundColor",
        label: "Card Background Color",
        type: "color",
        defaultValue: "#FFFFFF",
        description: "Surface container hex color",
      },
      {
        name: "elevation",
        label: "Elevation (dp)",
        type: "number",
        defaultValue: 2,
        description: "Drop shadow elevation height",
      },
      {
        name: "cornerRadius",
        label: "Corner Radius (dp)",
        type: "number",
        defaultValue: 16,
        description: "Corner clip radius",
      },
      ...COMMON_UI_PROPERTIES,
    ],
    recommendedActions: ["navigate", "toast", "vibrate", "setVariable"],
  },

  // 12. Recycler / List
  "Recycler/List": {
    componentType: "Recycler/List",
    label: "Recycler / Lazy Column",
    category: "Containment",
    iconName: "List",
    description: "High-performance scrolling list of dynamic items",
    supportedEvents: [
      {
        id: "OnItemClick",
        name: "On Item Click",
        category: "gesture",
        description: "Fires when user taps any list item row",
        outputs: [
          { name: "selectedItem", type: "String", description: "Text or payload of clicked row" },
          { name: "itemIndex", type: "Int", description: "Zero-based position of clicked row" },
        ],
        badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      },
      {
        id: "OnRefresh",
        name: "On Pull To Refresh",
        category: "input",
        description: "Fires when user pulls down from the top to refresh list",
        outputs: [],
        badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      },
    ],
    supportedProperties: [
      {
        name: "items",
        label: "List Items Data",
        type: "string",
        defaultValue: "Item 1, Item 2, Item 3",
        description: "Comma-separated or JSON list array of items",
      },
      ...COMMON_UI_PROPERTIES,
    ],
    recommendedActions: ["navigate", "toast", "callApi", "databaseQuery", "setVariable"],
  },

  // 13. Location/GPS
  "Location/GPS": {
    componentType: "Location/GPS",
    label: "Location / GPS Sensor Node",
    category: "Sensors & Hardware",
    iconName: "Navigation",
    description: "FusedLocationProviderClient GPS node providing real-time coords",
    supportedEvents: [
      {
        id: "OnLocationChanged",
        name: "On Location Changed",
        category: "sensor",
        description: "Fires when device moves and updates GPS fix",
        outputs: [
          { name: "latitude", type: "Double", description: "Geographic latitude coordinate" },
          { name: "longitude", type: "Double", description: "Geographic longitude coordinate" },
          { name: "accuracy", type: "Float", description: "Horizontal accuracy in meters" },
        ],
        badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      },
      {
        id: "OnProviderDisabled",
        name: "On GPS Disabled",
        category: "sensor",
        description: "Fires if user turns off Location Services in quick settings",
        outputs: [],
        badgeColor: "bg-red-500/20 text-red-300 border-red-500/40",
      },
    ],
    supportedProperties: [
      {
        name: "text",
        label: "Status / Display Coordinates",
        type: "string",
        defaultValue: "GPS Fix: Active",
        description: "Display summary string",
      },
      ...COMMON_UI_PROPERTIES,
    ],
    recommendedActions: ["setProperty", "setVariable", "callApi", "databaseInsert", "toast"],
  },

  // 14. Wi-Fi / Bluetooth
  "Wi-Fi": {
    componentType: "Wi-Fi",
    label: "Wi-Fi Connectivity Node",
    category: "Sensors & Hardware",
    iconName: "Wifi",
    description: "NetworkConnectivityManager monitor for Wi-Fi SSID and link speed",
    supportedEvents: [
      {
        id: "OnNetworkConnected",
        name: "On Wi-Fi Connected",
        category: "network",
        description: "Fires when device connects to a Wi-Fi access point",
        outputs: [
          { name: "ssid", type: "String", description: "Wi-Fi Network Name / SSID" },
          { name: "linkSpeedMbps", type: "Int", description: "Physical link speed in Mbps" },
        ],
        badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
      },
      {
        id: "OnNetworkLost",
        name: "On Wi-Fi Lost",
        category: "network",
        description: "Fires when Wi-Fi drops or disconnects",
        outputs: [],
        badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
      },
    ],
    supportedProperties: [
      {
        name: "text",
        label: "Status Label",
        type: "string",
        defaultValue: "Connected to FastMesh",
        description: "Network state display",
      },
      ...COMMON_UI_PROPERTIES,
    ],
    recommendedActions: ["toast", "snackbar", "setProperty", "setVariable", "callApi"],
  },

  Bluetooth: {
    componentType: "Bluetooth",
    label: "Bluetooth BLE Node",
    category: "Sensors & Hardware",
    iconName: "Bluetooth",
    description: "BluetoothAdapter BLE scanner and peripheral connection monitor",
    supportedEvents: [
      {
        id: "OnDeviceDiscovered",
        name: "On Device Discovered",
        category: "sensor",
        description: "Fires when a new BLE beacon or device is found",
        outputs: [
          { name: "deviceName", type: "String", description: "BLE device name" },
          { name: "macAddress", type: "String", description: "Hardware MAC address" },
        ],
        badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      },
    ],
    supportedProperties: [
      {
        name: "text",
        label: "BLE Status",
        type: "string",
        defaultValue: "BLE Scanning...",
        description: "Device summary",
      },
      ...COMMON_UI_PROPERTIES,
    ],
    recommendedActions: ["toast", "setProperty", "setVariable", "vibrate"],
  },

  // 18. YouTube Player (Kodular Parity)
  YouTubePlayer: {
    componentType: "YouTubePlayer",
    label: "YouTube Player",
    category: "Media",
    iconName: "Youtube",
    description: "High performance YouTube video stream player powered by YouTube IFrame API",
    kind: "VISIBLE",
    dependencies: [
      { group: "com.pierfrancescosoffritti.androidyoutubeplayer", artifact: "core", version: "12.1.0" },
    ],
    supportedEvents: [

      {
        id: "CurrentSecondChanged",
        name: "Current Second Changed",
        category: "gesture",
        description: "Fires periodically (throttled ~500ms) as playback second advances",
        outputs: [
          { name: "second", type: "Float", description: "Current playback position in seconds" },
        ],
        badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      },
      {
        id: "Error",
        name: "Error",
        category: "gesture",
        description: "Fires when a playback or network error occurs in YouTube player",
        outputs: [
          { name: "error", type: "String", description: "YouTube player error code/message" },
        ],
        badgeColor: "bg-red-500/20 text-red-300 border-red-500/40",
      },
      {
        id: "FullscreenChanged",
        name: "Fullscreen Changed",
        category: "gesture",
        description: "Fires when player enters or leaves fullscreen mode",
        outputs: [
          { name: "fullscreen", type: "Boolean", description: "True if player is in fullscreen mode" },
        ],
        badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
      },
      {
        id: "Initialized",
        name: "Initialized",
        category: "lifecycle",
        description: "Fires when YouTube Player is loaded and ready for commands",
        outputs: [],
        badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      },
      {
        id: "LoadedFractionChanged",
        name: "Loaded Fraction Changed",
        category: "gesture",
        description: "Fires when video buffering progress fraction updates (0.0 to 1.0)",
        outputs: [
          { name: "loadedFraction", type: "Float", description: "Buffered fraction of video (0.0 - 1.0)" },
        ],
        badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
      },
      {
        id: "PlaybackQualityChanged",
        name: "Playback Quality Changed",
        category: "gesture",
        description: "Fires when playback quality tier changes (AUTO, HD720, HD1080, etc.)",
        outputs: [
          { name: "quality", type: "String", description: "AUTO | SMALL | MEDIUM | LARGE | HD720 | HD1080 | HIGHRES" },
        ],
        badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      },
      {
        id: "PlaybackRateChanged",
        name: "Playback Rate Changed",
        category: "gesture",
        description: "Fires when video speed rate changes (0.5x, 1.0x, 1.5x, 2.0x)",
        outputs: [
          { name: "rate", type: "Float", description: "Playback speed multiplier" },
        ],
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      },
      {
        id: "StateChanged",
        name: "State Changed",
        category: "gesture",
        description: "Fires when player state changes (PLAYING, PAUSED, ENDED, BUFFERING)",
        outputs: [
          { name: "state", type: "String", description: "UNSTARTED | ENDED | PLAYING | PAUSED | BUFFERING | CUED" },
        ],
        badgeColor: "bg-violet-500/20 text-violet-300 border-violet-500/40",
      },
    ],
    supportedFunctions: [
      {
        id: "GetThumbnailFromVideoId",
        name: "Get Thumbnail From Video Id",
        description: "Returns the YouTube thumbnail image URL for a given video ID",
        params: [{ name: "videoId", type: "String", description: "YouTube video ID string" }],
      },
      {
        id: "InstantLoad",
        name: "Instant Load",
        description: "Loads video by ID and starts playback immediately",
        params: [{ name: "videoId", type: "String", description: "YouTube video ID string" }],
      },
      {
        id: "Load",
        name: "Load",
        description: "Preloads video by ID into YouTube player surface",
        params: [{ name: "videoId", type: "String", description: "YouTube video ID string" }],
      },
      {
        id: "Pause",
        name: "Pause",
        description: "Pauses active YouTube video stream playback",
        params: [],
      },
      {
        id: "Play",
        name: "Play",
        description: "Starts or resumes YouTube video playback",
        params: [],
      },
      {
        id: "SeekTo",
        name: "Seek To",
        description: "Seeks player to specified timestamp in seconds",
        params: [{ name: "position", type: "Float", description: "Position in seconds" }],
      },
    ],
    supportedProperties: [
      {
        name: "videoId",
        label: "Video ID",
        type: "string",
        defaultValue: "",
        description: "YouTube video ID (e.g., dQw4w9WgXcQ)",
      },
      {
        name: "autoPlay",
        label: "Auto Play",
        type: "boolean",
        defaultValue: true,
        description: "Start playback automatically when video loads",
      },
      {
        name: "customVideoTitle",
        label: "Custom Video Title",
        type: "string",
        defaultValue: "",
        description: "Custom video header title string",
      },
      {
        name: "enableLiveVideoUI",
        label: "Enable Live Video UI",
        type: "boolean",
        defaultValue: false,
        description: "Display live broadcast controls UI",
      },
      {
        name: "showBufferingProgress",
        label: "Show Buffering Progress",
        type: "boolean",
        defaultValue: true,
        description: "Display progress spinner while buffering video data",
      },
      {
        name: "showCurrentTime",
        label: "Show Current Time",
        type: "boolean",
        defaultValue: true,
        description: "Display active timestamp counter in player UI",
      },
      {
        name: "showDuration",
        label: "Show Duration",
        type: "boolean",
        defaultValue: true,
        description: "Display total video length in player UI",
      },
      {
        name: "showFullscreenButton",
        label: "Show Fullscreen Button",
        type: "boolean",
        defaultValue: true,
        description: "Display expand to fullscreen button icon",
      },
      {
        name: "showPlayPauseButton",
        label: "Show Play Pause Button",
        type: "boolean",
        defaultValue: true,
        description: "Display center play/pause touch controls",
      },
      {
        name: "showSeekBar",
        label: "Show SeekBar",
        type: "boolean",
        defaultValue: true,
        description: "Display scrubbable playback seek timeline bar",
      },
      {
        name: "showUI",
        label: "Show UI",
        type: "boolean",
        defaultValue: true,
        description: "Master toggle for showing player overlay UI",
      },
      {
        name: "showVideoTitle",
        label: "Show Video Title",
        type: "boolean",
        defaultValue: true,
        description: "Display video title header on player",
      },
      {
        name: "showYouTubeButton",
        label: "Show YouTube Button",
        type: "boolean",
        defaultValue: true,
        description: "Display YouTube logo button linking to video on YouTube",
      },
      {
        name: "startSecond",
        label: "Start Second",
        type: "number",
        defaultValue: 0,
        description: "Initial playback timestamp start offset in seconds",
      },
      {
        name: "volume",
        label: "Volume",
        type: "number",
        defaultValue: 100,
        description: "Playback audio volume (0 to 100)",
      },
      ...COMMON_UI_PROPERTIES,
    ],
    recommendedActions: ["toast", "setProperty", "setVariable", "vibrate"],
  },

  // 19. Video Player
  VideoPlayer: {
    componentType: "VideoPlayer",
    label: "Video Player",
    category: "Media",
    iconName: "PlayCircle",
    description: "ExoPlayer native video playback component",
    supportedEvents: [
      {
        id: "Completed",
        name: "Completed",
        category: "gesture",
        description: "Fires when video reaches the end",
        outputs: [],
        badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      },
      {
        id: "Prepared",
        name: "Prepared",
        category: "lifecycle",
        description: "Fires when video stream is loaded and ready to play",
        outputs: [],
        badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      },
    ],
    supportedFunctions: [
      { id: "Play", name: "Play", description: "Starts video playback", params: [] },
      { id: "Pause", name: "Pause", description: "Pauses video playback", params: [] },
      { id: "SeekTo", name: "Seek To", description: "Seeks to timestamp in seconds", params: [{ name: "position", type: "Number" }] },
    ],
    supportedProperties: [
      { name: "source", label: "Source URL", type: "string", defaultValue: "", description: "Video stream URL" },
      { name: "autoPlay", label: "Auto Play", type: "boolean", defaultValue: true, description: "Start playback automatically" },
      { name: "loop", label: "Loop Playback", type: "boolean", defaultValue: false, description: "Loop video infinitely" },
      ...COMMON_UI_PROPERTIES,
    ],
    recommendedActions: ["toast", "setProperty", "vibrate"],
  },

  // 20. Web View
  WebView: {
    componentType: "WebView",
    label: "Web View",
    category: "Advanced UI",
    iconName: "Globe",
    description: "Embedded Chromium browser Web View",
    supportedEvents: [
      {
        id: "PageLoaded",
        name: "Page Loaded",
        category: "lifecycle",
        description: "Fires when web page finishes loading",
        outputs: [{ name: "url", type: "String", description: "Loaded page URL" }],
        badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      },
    ],
    supportedFunctions: [
      { id: "GoBack", name: "Go Back", description: "Navigates back in browser history", params: [] },
      { id: "GoForward", name: "Go Forward", description: "Navigates forward in browser history", params: [] },
      { id: "Reload", name: "Reload", description: "Reloads current web page", params: [] },
      { id: "LoadUrl", name: "Load URL", description: "Loads specified website URL", params: [{ name: "url", type: "String" }] },
    ],
    supportedProperties: [
      { name: "url", label: "Home URL", type: "string", defaultValue: "https://android.com", description: "Initial URL" },
      { name: "enableJavaScript", label: "Enable JavaScript", type: "boolean", defaultValue: true, description: "Enable JS execution" },
      ...COMMON_UI_PROPERTIES,
    ],
    recommendedActions: ["toast", "setProperty"],
  },

  // 21. Clock / Timer (Non-Visible)
  Clock: {
    componentType: "Clock",
    label: "Clock / Timer",
    category: "Utilities",
    iconName: "Clock",
    description: "Non-visible periodic timer tick and timestamp component",
    kind: "NON_VISIBLE",
    supportedEvents: [
      {
        id: "Timer",
        name: "Timer (Tick)",
        category: "timer",
        description: "Fires periodically whenever the timer interval elapses",
        outputs: [{ name: "systemTimeMs", type: "Long", description: "Current system epoch timestamp in ms" }],
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      },
    ],
    supportedFunctions: [
      { id: "Start", name: "Start Timer", description: "Starts or resumes periodic timer ticks", params: [] },
      { id: "Stop", name: "Stop Timer", description: "Pauses periodic timer ticks", params: [] },
    ],
    supportedProperties: [
      { name: "enabled", label: "Timer Enabled", type: "boolean", defaultValue: true, description: "Whether the timer fires periodically" },
      { name: "interval", label: "Timer Interval (ms)", type: "number", defaultValue: 1000, description: "Timer tick frequency in milliseconds" },
      { name: "timerAlwaysFires", label: "Always Fires", type: "boolean", defaultValue: true, description: "Fire even when app is in background" },
    ],
    recommendedActions: ["toast", "setVariable", "callApi", "vibrate"],
  },

  // 22. Firebase Realtime DB (Non-Visible)
  FirebaseDB: {
    componentType: "FirebaseDB",
    label: "Firebase Realtime Database",
    category: "Backend Services",
    iconName: "Flame",
    description: "Cloud JSON database with realtime data synchronization",
    kind: "NON_VISIBLE",
    dependencies: [
      { group: "com.google.firebase", artifact: "firebase-database-ktx", version: "21.0.0" },
    ],
    supportedEvents: [
      {
        id: "DataChanged",
        name: "Data Changed",
        category: "network",
        description: "Fires when database path value changes",
        outputs: [
          { name: "tag", type: "String", description: "Database node key/tag" },
          { name: "value", type: "String", description: "New JSON string value" },
        ],
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      },
      {
        id: "Error",
        name: "Error",
        category: "network",
        description: "Fires on permission or database operation failure",
        outputs: [{ name: "message", type: "String", description: "Firebase error message" }],
        badgeColor: "bg-red-500/20 text-red-300 border-red-500/40",
      },
    ],
    supportedFunctions: [
      { id: "GetValue", name: "Get Value", description: "Reads value from database node path", params: [{ name: "tag", type: "String" }] },
      { id: "SetValue", name: "Set Value", description: "Writes value to database node path", params: [{ name: "tag", type: "String" }, { name: "value", type: "String" }] },
      { id: "DeleteValue", name: "Delete Value", description: "Removes database node path", params: [{ name: "tag", type: "String" }] },
    ],
    supportedProperties: [
      { name: "firebaseUrl", label: "Firebase URL", type: "string", defaultValue: "https://your-app.firebaseio.com", description: "Database URL endpoint" },
      { name: "projectBucket", label: "Project Bucket", type: "string", defaultValue: "", description: "Storage or database bucket" },
    ],
    recommendedActions: ["toast", "setVariable", "setProperty"],
  },

  // 23. Location Sensor (Non-Visible)
  LocationSensor: {
    componentType: "LocationSensor",
    label: "Location Sensor (GPS)",
    category: "Location",
    iconName: "MapPin",
    description: "Hardware GPS and Fused Location Provider client",
    kind: "NON_VISIBLE",
    dependencies: [
      { group: "com.google.android.gms", artifact: "play-services-location", version: "21.3.0" },
    ],
    permissions: ["android.permission.ACCESS_FINE_LOCATION", "android.permission.ACCESS_COARSE_LOCATION"],
    supportedEvents: [
      {
        id: "LocationChanged",
        name: "Location Changed",
        category: "sensor",
        description: "Fires when device GPS coordinates update",
        outputs: [
          { name: "latitude", type: "Double", description: "Latitude coordinate" },
          { name: "longitude", type: "Double", description: "Longitude coordinate" },
          { name: "altitude", type: "Double", description: "Altitude in meters" },
          { name: "speed", type: "Float", description: "Ground speed in m/s" },
        ],
        badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      },
    ],
    supportedFunctions: [
      { id: "GetLatitude", name: "Get Latitude", description: "Returns current latitude", params: [] },
      { id: "GetLongitude", name: "Get Longitude", description: "Returns current longitude", params: [] },
    ],
    supportedProperties: [
      { name: "enabled", label: "Sensor Enabled", type: "boolean", defaultValue: true, description: "Enable location polling" },
      { name: "timeInterval", label: "Time Interval (ms)", type: "number", defaultValue: 10000, description: "Min polling time in ms" },
      { name: "distanceInterval", label: "Distance Interval (m)", type: "number", defaultValue: 5, description: "Min polling distance in meters" },
    ],
    recommendedActions: ["toast", "callApi", "setVariable"],
  },

  // 24. TinyDB Local Storage (Non-Visible)
  TinyDB: {
    componentType: "TinyDB",
    label: "TinyDB (Preferences)",
    category: "Files & Storage",
    iconName: "Database",
    description: "Lightweight persistent key-value local storage component",
    kind: "NON_VISIBLE",
    supportedEvents: [],
    supportedFunctions: [
      { id: "StoreValue", name: "Store Value", description: "Stores key-value pair in local storage", params: [{ name: "tag", type: "String" }, { name: "valueToStore", type: "String" }] },
      { id: "GetValue", name: "Get Value", description: "Reads value by key tag", params: [{ name: "tag", type: "String" }, { name: "valueIfTagNotThere", type: "String" }] },
      { id: "ClearAll", name: "Clear All", description: "Clears all stored entries", params: [] },
    ],
    supportedProperties: [
      { name: "namespace", label: "Namespace", type: "string", defaultValue: "TinyDB1", description: "SharedPreferences storage file scope" },
    ],
    recommendedActions: ["toast", "setVariable"],
  },

  // 25. Text To Speech (Non-Visible)
  TextToSpeech: {
    componentType: "TextToSpeech",
    label: "Text To Speech (TTS)",
    category: "Audio",
    iconName: "Volume2",
    description: "Android system speech synthesizer engine",
    kind: "NON_VISIBLE",
    supportedEvents: [
      { id: "BeforeSpeaking", name: "Before Speaking", category: "lifecycle", description: "Fires before text-to-speech synthesis begins", outputs: [], badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40" },
      { id: "AfterSpeaking", name: "After Speaking", category: "lifecycle", description: "Fires after text-to-speech audio finishes playing", outputs: [], badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
    ],

    supportedFunctions: [
      { id: "Speak", name: "Speak Text", description: "Synthesizes and speaks text aloud", params: [{ name: "message", type: "String" }] },
    ],
    supportedProperties: [
      { name: "pitch", label: "Speech Pitch", type: "number", defaultValue: 1.0, description: "Audio voice pitch multiplier" },
      { name: "speechRate", label: "Speech Rate", type: "number", defaultValue: 1.0, description: "Audio voice speed multiplier" },
    ],
    recommendedActions: ["toast", "vibrate"],
  },

  // Notifier (Non-Visible UI Controller)
  Notifier: {
    componentType: "Notifier",
    label: "Notifier",
    category: "Dialogs & Messages",
    iconName: "Bell",
    description: "Non-visible controller for displaying alert dialogs, progress dialogs, toasts, and text input prompts",
    kind: "NON_VISIBLE",
    supportedEvents: [
      { id: "AfterChoosing", name: "After Choosing", category: "lifecycle", description: "Fires after user selects a choice button in dialog", outputs: [{ name: "choice", type: "String", description: "Selected button label" }], badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40" },
      { id: "AfterTextInput", name: "After Text Input", category: "lifecycle", description: "Fires after user submits text in prompt dialog", outputs: [{ name: "response", type: "String", description: "Typed text string" }], badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
      { id: "Dismissed", name: "Dismissed", category: "lifecycle", description: "Fires when notification dialog is cancelled or dismissed", outputs: [], badgeColor: "bg-slate-500/20 text-slate-300 border-slate-500/40" },
    ],
    supportedFunctions: [
      { id: "ShowMessageDialog", name: "Show Message Dialog", description: "Displays modal alert dialog with title, message, and button", params: [{ name: "message", type: "String" }, { name: "title", type: "String" }, { name: "buttonText", type: "String" }] },
      { id: "ShowChooseDialog", name: "Show Choose Dialog", description: "Displays dialog with two choice buttons", params: [{ name: "message", type: "String" }, { name: "title", type: "String" }, { name: "button1Text", type: "String" }, { name: "button2Text", type: "String" }, { name: "cancelable", type: "Boolean" }] },
      { id: "ShowTextInputDialog", name: "Show Text Input Dialog", description: "Displays text input prompt dialog", params: [{ name: "message", type: "String" }, { name: "title", type: "String" }, { name: "cancelable", type: "Boolean" }] },
      { id: "ShowProgressDialog", name: "Show Progress Dialog", description: "Displays loading progress spinner dialog", params: [{ name: "message", type: "String" }, { name: "title", type: "String" }] },
      { id: "DismissProgressDialog", name: "Dismiss Progress Dialog", description: "Dismisses active progress dialog", params: [] },
      { id: "ShowAlert", name: "Show Alert (Toast)", description: "Displays floating quick toast notification", params: [{ name: "notice", type: "String" }] },
    ],
    supportedProperties: [
      { name: "backgroundColor", label: "Dialog Background Color", type: "color", defaultValue: "#FFFFFF", description: "Background container color of dialogs" },
      { name: "textColor", label: "Text Color", type: "color", defaultValue: "#000000", description: "Primary text font color of dialogs" },
      { name: "notifierLength", label: "Toast Duration", type: "enum", options: ["long", "short"], defaultValue: "short", description: "Toast display time duration" },
    ],
    recommendedActions: ["toast", "dialog"],
  },

  // Snackbar (Non-Visible UI Controller)
  Snackbar: {
    componentType: "Snackbar",
    label: "Snackbar",
    category: "Dialogs & Messages",
    iconName: "MessageSquare",
    description: "Non-visible controller for bottom Material 3 snackbar banners with optional action buttons",
    kind: "NON_VISIBLE",
    supportedEvents: [
      { id: "Click", name: "Action Clicked", category: "gesture", description: "Fires when user taps the action button on snackbar", outputs: [], badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
      { id: "Dismissed", name: "Dismissed", category: "lifecycle", description: "Fires when snackbar slides away", outputs: [], badgeColor: "bg-slate-500/20 text-slate-300 border-slate-500/40" },
    ],
    supportedFunctions: [
      { id: "ShowSnackbar", name: "Show Snackbar", description: "Displays snackbar message with action button label", params: [{ name: "message", type: "String" }, { name: "actionLabel", type: "String" }] },
    ],
    supportedProperties: [
      { name: "backgroundColor", label: "Background Color", type: "color", defaultValue: "#322F35", description: "Snackbar container color" },
      { name: "textColor", label: "Text Color", type: "color", defaultValue: "#F5EFF7", description: "Snackbar message text color" },
      { name: "actionColor", label: "Action Button Color", type: "color", defaultValue: "#D0BCFF", description: "Action button label text color" },
    ],
    recommendedActions: ["snackbar"],
  },

  // Spotlight (Non-Visible UI Controller)
  Spotlight: {
    componentType: "Spotlight",
    label: "Spotlight Onboarding",
    category: "Utilities",
    iconName: "Sparkles",
    description: "Non-visible controller for onboarding user guide highlight overlays on visual components",
    kind: "NON_VISIBLE",
    supportedEvents: [
      { id: "SpotlightClosed", name: "Spotlight Closed", category: "lifecycle", description: "Fires when spotlight guide overlay closes", outputs: [], badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40" },
    ],
    supportedFunctions: [
      { id: "ShowSpotlight", name: "Show Spotlight", description: "Highlights target UI component with spotlight circle and title/heading text", params: [{ name: "targetComponentId", type: "String" }, { name: "title", type: "String" }, { name: "text", type: "String" }] },
      { id: "CloseSpotlight", name: "Close Spotlight", description: "Dismisses active spotlight overlay", params: [] },
    ],
    supportedProperties: [
      { name: "overlayColor", label: "Overlay Dim Color", type: "color", defaultValue: "#99000000", description: "Background dim overlay color" },
    ],
    recommendedActions: ["toast"],
  },

  // 26. Web HTTP Client (Non-Visible)

  WebHttpClient: {
    componentType: "WebHttpClient",
    label: "Web HTTP Client",
    category: "Networking",
    iconName: "Globe",
    description: "REST API HTTP GET, POST, PUT, DELETE networking engine",
    kind: "NON_VISIBLE",
    supportedEvents: [
      {
        id: "GotText",
        name: "Got Text (Response)",
        category: "network",
        description: "Fires when HTTP server returns response body",
        outputs: [
          { name: "url", type: "String", description: "Target URL" },
          { name: "responseCode", type: "Int", description: "HTTP status code (200, 404, 500)" },
          { name: "responseContent", type: "String", description: "Raw response body string" },
        ],
        badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      },
    ],
    supportedFunctions: [
      { id: "Get", name: "Get Request", description: "Executes HTTP GET request", params: [{ name: "url", type: "String" }] },
      { id: "PostText", name: "Post Text Request", description: "Executes HTTP POST request with body text", params: [{ name: "url", type: "String" }, { name: "text", type: "String" }] },
    ],
    supportedProperties: [
      { name: "baseUrl", label: "Base URL", type: "string", defaultValue: "https://api.example.com", description: "Default host URL prefix" },
      { name: "timeout", label: "Timeout (ms)", type: "number", defaultValue: 10000, description: "Network connection timeout in ms" },
    ],
    recommendedActions: ["toast", "setVariable", "setProperty"],
  },
};


// ---------------------------------------------------------------------------
// Comprehensive Android Screen Metadata (Kodular & App Inventor Parity)
// ---------------------------------------------------------------------------
export const SCREEN_LOGIC_META: ComponentLogicMeta = {
  componentType: "Screen",
  label: "Android Screen Container",
  category: "Screen",
  iconName: "Smartphone",
  description: "Main Activity Screen container lifecycle, properties and methods",
  supportedEvents: [
    {
      id: "BackPressed",
      name: "Back Pressed",
      category: "lifecycle",
      description: "Fires when hardware or gesture back button is pressed",
      outputs: [],
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    },
    {
      id: "ErrorOccurred",
      name: "Error Occurred",
      category: "lifecycle",
      description: "Fires when an uncaught exception or runtime error happens on screen",
      outputs: [
        { name: "component", type: "String", description: "Failing component name" },
        { name: "functionName", type: "String", description: "Function/method name" },
        { name: "errorNumber", type: "Int", description: "Error code number" },
        { name: "message", type: "String", description: "Detailed exception message" },
      ],
      badgeColor: "bg-red-500/20 text-red-300 border-red-500/40",
    },
    {
      id: "GotReceivedShared",
      name: "Got Received Shared",
      category: "lifecycle",
      description: "Fires when an external app shares data or link via Intent to this screen",
      outputs: [
        { name: "type", type: "String", description: "MIME type (text/plain, image/png)" },
        { name: "value", type: "String", description: "Shared URI or string payload" },
      ],
      badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
    },
    {
      id: "Initialize",
      name: "Initialize (On Screen Load)",
      category: "lifecycle",
      description: "Fires automatically when screen enters view tree for the first time",
      outputs: [],
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    },
    {
      id: "KeyboardVisibilityChanged",
      name: "Keyboard Visibility Changed",
      category: "input",
      description: "Fires when Android IME software keyboard expands or collapses",
      outputs: [
        { name: "isKeyboardVisible", type: "Boolean", description: "True if keyboard is active" },
      ],
      badgeColor: "bg-violet-500/20 text-violet-300 border-violet-500/40",
    },
    {
      id: "MenuInitialize",
      name: "Menu Initialize",
      category: "lifecycle",
      description: "Fires when top bar options menu is created",
      outputs: [],
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    },
    {
      id: "MenuItemSelected",
      name: "Menu Item Selected",
      category: "input",
      description: "Fires when user taps an options menu item",
      outputs: [
        { name: "menuItem", type: "String", description: "Selected item title or ID" },
      ],
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    },
    {
      id: "OnAppPause",
      name: "On App Pause",
      category: "lifecycle",
      description: "Fires when app is minimized or placed into background",
      outputs: [],
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    },
    {
      id: "OnAppResume",
      name: "On App Resume",
      category: "lifecycle",
      description: "Fires when app returns from background to active focus",
      outputs: [],
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    },
    {
      id: "OnAppStop",
      name: "On App Stop",
      category: "lifecycle",
      description: "Fires when screen/activity is stopped",
      outputs: [],
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    },
    {
      id: "OtherScreenClosed",
      name: "Other Screen Closed",
      category: "lifecycle",
      description: "Fires when a child screen returns result data to this screen",
      outputs: [
        { name: "otherScreenName", type: "String", description: "Name of closed screen" },
        { name: "result", type: "String", description: "Returned result payload" },
      ],
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    },
    {
      id: "PermissionDenied",
      name: "Permission Denied",
      category: "lifecycle",
      description: "Fires when user denies a requested system permission",
      outputs: [
        { name: "component", type: "String", description: "Requesting component" },
        { name: "functionName", type: "String", description: "Requesting method" },
        { name: "permissionName", type: "String", description: "Denied permission string" },
      ],
      badgeColor: "bg-red-500/20 text-red-300 border-red-500/40",
    },
    {
      id: "PermissionGranted",
      name: "Permission Granted",
      category: "lifecycle",
      description: "Fires when user grants a requested system permission",
      outputs: [
        { name: "permissionName", type: "String", description: "Granted permission string" },
      ],
      badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    },
    {
      id: "ScreenOrientationChanged",
      name: "Screen Orientation Changed",
      category: "lifecycle",
      description: "Fires when device rotates between portrait & landscape modes",
      outputs: [],
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    },
    {
      id: "SideMenuClosed",
      name: "Side Menu Closed",
      category: "lifecycle",
      description: "Fires when side navigation drawer is closed",
      outputs: [],
      badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    },
    {
      id: "SideMenuOpened",
      name: "Side Menu Opened",
      category: "lifecycle",
      description: "Fires when side navigation drawer is opened",
      outputs: [],
      badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    },
    {
      id: "TitleBarBackButtonClicked",
      name: "Title Bar Back Button Clicked",
      category: "gesture",
      description: "Fires when user clicks the back icon on top app bar",
      outputs: [],
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    },
    {
      id: "TitleBarIconSelected",
      name: "Title Bar Icon Selected",
      category: "gesture",
      description: "Fires when an icon on top app bar is tapped",
      outputs: [
        { name: "icon", type: "String", description: "Icon identifier" },
        { name: "name", type: "String", description: "Icon title" },
      ],
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    },
    {
      id: "Click",
      name: "Click (Tap Screen)",
      category: "gesture",
      description: "Fires when user taps background of screen",
      outputs: [],
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    },
    {
      id: "LongClick",
      name: "Long Click (Hold Screen)",
      category: "gesture",
      description: "Fires when user holds down on screen background",
      outputs: [],
      badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
    },
  ],
  supportedFunctions: [
    { id: "AddMenuItem", name: "Add Menu Item", description: "Appends custom item to top options menu", params: [{ name: "menuItem", type: "String" }] },
    { id: "AddMenuItemWithIcon", name: "Add Menu Item With Icon", description: "Appends custom item with icon vector", params: [{ name: "menuItem", type: "String" }, { name: "menuIcon", type: "String" }] },
    { id: "AddTitleBarIcon", name: "Add Title Bar Icon", description: "Adds action icon button to screen top bar", params: [{ name: "icon", type: "String" }, { name: "name", type: "String" }] },
    { id: "ArePermissionsGranted", name: "Are Permissions Granted", description: "Returns true if target permissions are active", params: [] },
    { id: "AskForPermission", name: "Ask For Permission", description: "Prompts Android system permission request dialog", params: [{ name: "permissionName", type: "String" }] },
    { id: "CanWriteSystemSettings", name: "Can Write System Settings", description: "Checks WRITE_SETTINGS permission state", params: [] },
    { id: "HideKeyboard", name: "Hide Keyboard", description: "Dismisses soft input keyboard", params: [] },
    { id: "LockSideMenu", name: "Lock Side Menu", description: "Locks navigation drawer in current state", params: [] },
    { id: "MoveTaskToBack", name: "Move Task To Back", description: "Minimizes app activity to background", params: [] },
    { id: "OpenAppSettings", name: "Open App Settings", description: "Launches Android system Settings page for this app", params: [] },
    { id: "OpenSystemWriteSettings", name: "Open System Write Settings", description: "Launches system write settings prompt", params: [] },
    { id: "RemoveSideMenu", name: "Remove Side Menu", description: "Disables navigation drawer for this screen", params: [] },
    { id: "RemoveTitleBarIcons", name: "Remove Title Bar Icons", description: "Clears custom title bar action icons", params: [] },
    { id: "ResetOptionsMenu", name: "Reset Options Menu", description: "Resets options menu items to default", params: [] },
    { id: "ShowAboutApplication", name: "Show About Application", description: "Displays about dialog with app details", params: [] },
    { id: "ShowKeyboard", name: "Show Keyboard", description: "Opens soft input keyboard", params: [] },
    { id: "SideMenuOpen", name: "Side Menu Open", description: "Opens navigation drawer programmatically", params: [] },
    { id: "SideMenuClose", name: "Side Menu Close", description: "Closes navigation drawer programmatically", params: [] },
    { id: "UnlockSideMenu", name: "Unlock Side Menu", description: "Unlocks navigation drawer gesture", params: [] },
    { id: "VersionCode", name: "Version Code", description: "Gets app android:versionCode", params: [] },
    { id: "VersionName", name: "Version Name", description: "Gets app android:versionName", params: [] },
  ],
  supportedProperties: [
    { name: "aboutScreen", label: "About Screen Text", type: "string", defaultValue: "", description: "Information text shown in about dialog" },
    { name: "aboutScreenBackgroundColor", label: "About Screen Background Color", type: "color", defaultValue: "#FFFFFF", description: "Background color of about dialog" },
    { name: "aboutScreenLightTheme", label: "About Screen Light Theme", type: "boolean", defaultValue: true, description: "Use light theme for about dialog" },
    { name: "aboutScreenTitle", label: "About Screen Title", type: "string", defaultValue: "About", description: "Title of about dialog" },
    { name: "alignHorizontal", label: "Align Horizontal", type: "enum", options: ["left", "center", "right"], defaultValue: "left", description: "Horizontal layout alignment" },
    { name: "alignVertical", label: "Align Vertical", type: "enum", options: ["top", "center", "bottom"], defaultValue: "top", description: "Vertical layout alignment" },
    { name: "backgroundColor", label: "Background Color", type: "color", defaultValue: "#FFFFFF", description: "Screen background color" },
    { name: "backgroundImage", label: "Background Image", type: "string", defaultValue: "", description: "Screen background image URL or asset" },
    { name: "closeScreenAnimation", label: "Close Screen Animation", type: "enum", options: ["default", "fade", "slide", "zoom", "none"], defaultValue: "default", description: "Screen exit transition animation" },
    { name: "drawerArrowIconColor", label: "Drawer Arrow Icon Color", type: "color", defaultValue: "#FFFFFF", description: "Navigation icon color" },
    { name: "height", label: "Height", type: "number", defaultValue: 780, description: "Screen height in dp" },
    { name: "highQualityImages", label: "High Quality Images", type: "boolean", defaultValue: true, description: "Enable HD bitmap rendering" },
    { name: "isCompanion", label: "Is Companion", type: "boolean", defaultValue: false, description: "Companion status flag" },
    { name: "isSideMenuAdded", label: "Is Side Menu Added", type: "boolean", defaultValue: false, description: "Whether side menu drawer is present" },
    { name: "isSideMenuOpen", label: "Is Side Menu Open", type: "boolean", defaultValue: false, description: "State of side menu drawer" },
    { name: "keepScreenOn", label: "Keep Screen On", type: "boolean", defaultValue: false, description: "Prevent screen from dimming/sleeping" },
    { name: "navigationBarColor", label: "Navigation Bar Color", type: "color", defaultValue: "#000000", description: "System bottom nav bar color" },
    { name: "navigationBarLightIcons", label: "Navigation Bar Light Icons", type: "boolean", defaultValue: false, description: "System nav bar icon theme" },
    { name: "navigationIconColor", label: "Navigation Icon Color", type: "color", defaultValue: "#FFFFFF", description: "Back arrow icon tint" },
    { name: "openScreenAnimation", label: "Open Screen Animation", type: "enum", options: ["default", "fade", "slide", "zoom", "none"], defaultValue: "default", description: "Screen entry transition animation" },
    { name: "optionsMenuIconColor", label: "Options Menu Icon Color", type: "color", defaultValue: "#FFFFFF", description: "Top bar action icon tint" },
    { name: "primaryColor", label: "Primary Color", type: "color", defaultValue: "#6750A4", description: "Screen primary brand theme color" },
    { name: "showNavigationBar", label: "Show Navigation Bar", type: "boolean", defaultValue: true, description: "Show system bottom navigation bar" },
    { name: "showOptionsMenu", label: "Show Options Menu", type: "boolean", defaultValue: true, description: "Show top bar overflow menu" },
    { name: "showStatusBar", label: "Show StatusBar", type: "boolean", defaultValue: true, description: "Show top Android status bar" },
    { name: "splashImage", label: "Splash Image", type: "string", defaultValue: "", description: "Splash screen image URL" },
    { name: "statusBarColor", label: "StatusBar Color", type: "color", defaultValue: "#6750A4", description: "Top status bar background color" },
    { name: "statusBarLightIcons", label: "StatusBar Light Icons", type: "boolean", defaultValue: true, description: "Light status bar icons" },
    { name: "title", label: "Screen Title", type: "string", defaultValue: "Screen", description: "Top bar title text" },
    { name: "titleBarAccentColor", label: "Title Bar Accent Color", type: "color", defaultValue: "#6750A4", description: "Title bar background accent" },
    { name: "titleVisible", label: "Title Visible", type: "boolean", defaultValue: true, description: "Show top title bar header" },
    { name: "topic", label: "Topic", type: "string", defaultValue: "", description: "PubSub topic string" },
    { name: "tutorialURL", label: "Tutorial URL", type: "string", defaultValue: "", description: "Tutorial page link" },
    { name: "versionCode", label: "Version Code", type: "number", defaultValue: 1, description: "App build version code" },
    { name: "versionName", label: "Version Name", type: "string", defaultValue: "1.0.0", description: "App semantic version string" },
    { name: "width", label: "Width", type: "number", defaultValue: 380, description: "Screen width in dp" },
    ...COMMON_UI_PROPERTIES,
  ],
  recommendedActions: [
    "toast",
    "navigate",
    "setProperty",
    "setVariable",
    "vibrate",
    "callApi",
    "requestPermission",
    "hideKeyboard",
    "showKeyboard",
  ],
};

// Fallback generic component metadata if a custom component is inspected
export const DEFAULT_GENERIC_LOGIC_META: ComponentLogicMeta = {
  componentType: "GenericComponent",
  label: "UI Element",
  category: "General",
  iconName: "Box",
  description: "Standard Jetpack Compose UI component",
  supportedEvents: [
    {
      id: "Click",
      name: "Click (Tap)",
      category: "gesture",
      description: "Fires when user taps this element",
      outputs: [{ name: "clickTimestamp", type: "Long", description: "Timestamp of tap" }],
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    },
    {
      id: "LongClick",
      name: "Long Click (Hold)",
      category: "gesture",
      description: "Fires when element is held down",
      outputs: [],
      badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
    },
  ],
  supportedProperties: [
    {
      name: "text",
      label: "Text",
      type: "string",
      defaultValue: "",
      description: "Text content",
    },
    {
      name: "backgroundColor",
      label: "Background Color",
      type: "color",
      defaultValue: "#1E293B",
      description: "Surface color",
    },
    ...COMMON_UI_PROPERTIES,
  ],
  recommendedActions: ["toast", "navigate", "setVariable", "setProperty", "vibrate"],
};

/**
 * Dynamically registers or updates logic metadata schema for a custom component
 */
export function registerCustomComponentLogicMeta(meta: ComponentLogicMeta) {
  COMPONENT_LOGIC_META_MAP[meta.componentType] = meta;
}

/**
 * Returns the exact logic metadata (supported events, properties, outputs, recommendations)
 * for any given component type.
 */
export function getComponentLogicMeta(componentType: string): ComponentLogicMeta {
  if (!componentType) return DEFAULT_GENERIC_LOGIC_META;
  
  if (COMPONENT_LOGIC_META_MAP[componentType]) {
    return COMPONENT_LOGIC_META_MAP[componentType];
  }

  // Normalize by stripping trailing digits (e.g. YouTubePlayer1 -> YouTubePlayer) and removing non-alphanumeric chars
  const normInput = componentType.replace(/\d+$/, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

  // Alias Map for Kodular and DroidForge variant names
  const ALIAS_MAP: Record<string, string> = {
    textbox: "TextField",
    textinput: "TextField",
    textlabel: "TextLabel",
    label: "TextLabel",
    datepicker: "DatePicker",
    timepicker: "TimePicker",
    listpicker: "ListPicker",
    floatingactionbutton: "FAB",
    checkbox: "CheckBox",
    radiobutton: "RadioButton",
    toggleswitch: "Switch",
    webviewer: "WebView",
    web: "WebHttpClient",
    firebaserealtimedatabase: "FirebaseDB",
    firebase: "FirebaseDB",
    googlemaps: "GoogleMaps",
    map: "GoogleMaps",
    clock: "Clock",
    notifier: "Notifier",
    snackbar: "Snackbar",
    spotlight: "Spotlight",
    cardview: "Card",
    horizontalarrangement: "Row",
    verticalarrangement: "Column",
    verticalscrollarrangement: "ScrollView",
  };

  if (ALIAS_MAP[normInput] && COMPONENT_LOGIC_META_MAP[ALIAS_MAP[normInput]]) {
    return COMPONENT_LOGIC_META_MAP[ALIAS_MAP[normInput]];
  }

  for (const [key, meta] of Object.entries(COMPONENT_LOGIC_META_MAP)) {
    const normKey = key.replace(/\d+$/, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    if (normKey === normInput) {
      return meta;
    }
  }


  const isScreenType =
    componentType === "Screen" ||
    componentType === "ScreenContainer" ||
    componentType === "MainContainer" ||
    componentType === "RootContainer" ||
    componentType.toLowerCase().includes("screen") ||
    componentType === "Column" ||
    componentType === "Vertical Layout" ||
    componentType === "VerticalLayout" ||
    componentType === "Horizontal Layout" ||
    componentType === "HorizontalLayout" ||
    componentType === "Scroll Layout" ||
    componentType === "ScrollLayout";

  if (isScreenType) {
    return {
      ...SCREEN_LOGIC_META,
      componentType,
      label: componentType,
    };
  }

  return {
    ...DEFAULT_GENERIC_LOGIC_META,
    componentType,
    label: componentType,
  };
}

/**
 * Returns only the valid events for a given component type
 */
export function getValidEventsForComponent(componentType: string): ComponentEventDef[] {
  return getComponentLogicMeta(componentType).supportedEvents;
}

/**
 * Returns only the valid functions/methods for a given component type
 */
export function getValidFunctionsForComponent(componentType: string): ComponentFunctionDef[] {
  return getComponentLogicMeta(componentType).supportedFunctions || [];
}

/**
 * Returns only the valid properties for a given component type
 */
export function getValidPropertiesForComponent(componentType: string): ComponentPropertyDef[] {
  return getComponentLogicMeta(componentType).supportedProperties;
}

/**
 * Returns recommended actions for a given component type
 */
export function getRecommendedActionsForComponent(componentType: string): LogicAction["actionType"][] {
  return getComponentLogicMeta(componentType).recommendedActions;
}

/**
 * Returns output parameters produced when an event fires
 */
export function getOutputsForEvent(componentType: string, eventId: string): EventOutputDef[] {
  const meta = getComponentLogicMeta(componentType);
  const ev = meta.supportedEvents.find((e) => e.id === eventId);
  return ev?.outputs || [];
}

/**
 * Generates an accurate, human-readable 1-line summary for a single logic action step.
 */
export function formatActionStepSummary(
  action: LogicAction,
  allComponents: AndroidComponent[],
  screens: AndroidScreen[]
): string {
  const targetComp = allComponents.find((c) => c.id === action.targetId);
  const targetCompName = targetComp ? targetComp.name : action.targetId || "Component";
  const targetScreen = screens.find((s) => s.id === action.targetScreen);
  const targetScreenName = targetScreen ? targetScreen.name : action.targetScreen || "Screen";

  switch (action.actionType) {
    case "callMethod": {
      const argsStr = action.methodArgs ? Object.values(action.methodArgs).join(", ") : "";
      return `Call ${targetCompName}.${(action as any).methodName || "method"}(${argsStr})`;
    }
    case "toast":
      return `Toast: "${action.message || "Action dispatched"}"`;
    case "snackbar":
      return `Snackbar: "${action.message || "Notification"}" [${action.actionLabel || "OK"}]`;
    case "dialog":
      return `Dialog: "${action.dialogTitle || "Confirm"}"`;
    case "bottomSheet":
      return `Open Bottom Sheet`;
    case "navigate":
      return `Navigate to ${targetScreenName}`;
    case "popBack":
      return `Pop Back (Return)`;
    case "setProperty":
      return `Set ${targetCompName}.${action.property || "property"} = "${action.value ?? ""}"`;
    case "setVariable": {
      const op = action.variableOperation || "assign";
      if (op === "increment") return `Increment ${action.variableName || "var"} (+${action.variableValue || 1})`;
      if (op === "decrement") return `Decrement ${action.variableName || "var"} (-${action.variableValue || 1})`;
      if (op === "toggle") return `Toggle ${action.variableName || "var"}`;
      return `Set ${action.variableName || "var"} = "${action.variableValue ?? ""}"`;
    }
    case "callApi":
      return `Call ${action.method || "GET"} ${action.endpoint ? action.endpoint.split("?")[0] : "/api"}`;
    case "databaseInsert":
      return `Room DB: Insert into ${action.tableName || "table"}`;
    case "databaseQuery":
      return `Room DB: Query ${action.tableName || "table"}`;
    case "preferencesSave":
      return `Save Pref: ${action.variableName || "key"}`;
    case "firebaseWrite":
      return `Firestore: Write ${action.collectionName || "collection"}`;
    case "firebaseRead":
      return `Firestore: Read ${action.collectionName || "collection"}`;
    case "vibrate":
      return `Haptic: ${action.hapticPattern || "click"}`;
    case "playAudio":
      return `Play Audio Cue: ${action.value || "sound"}`;
    case "copyToClipboard":
      return `Copy to Clipboard: "${action.value || ""}"`;
    case "toggleFlashlight":
      return `Toggle Torch / Flashlight`;
    case "openBrowser":
      return `Open URL: ${action.url || "browser"}`;
    case "share":
      return `Share Intent: "${action.message || "content"}"`;
    case "aiQuery":
      return `Gemini AI: "${action.message ? action.message.slice(0, 30) : "Prompt"}..."`;
    case "textToSpeech":
      return `TTS Speak: "${action.ttsText ? action.ttsText.slice(0, 30) : ""}"`;
    case "requestPermission":
      return `Request Permission: ${action.permission ? action.permission.split(".").pop() : "PERMISSION"}`;
    case "delay":
      return `Delay: ${action.delayMs || 1000}ms`;
    default:
      return `${action.actionType}`;
  }
}

/**
 * Generates an accurate, synchronized full logic summary for a block that stays in sync with its steps.
 * e.g. "When ActionTriggerBtn.Click -> Toast '...', Set TitleLabel.text = '...', Navigate to DetailsScreen"
 */
export function generateLiveSummaryForBlock(
  block: LogicBlock,
  allComponents: AndroidComponent[],
  screens: AndroidScreen[]
): string {
  const triggerLabel = `When ${block.componentName || "Component"}.${block.event || "Event"}`;
  if (!block.actions || block.actions.length === 0) {
    return `${triggerLabel} -> (No actions configured)`;
  }

  const stepSummaries = block.actions.map((act) =>
    formatActionStepSummary(act, allComponents, screens)
  );

  return `${triggerLabel} -> ${stepSummaries.join(" -> ")}`;
}

/**
 * Single source of truth for component visibility (VISIBLE vs NON_VISIBLE)
 */
export function isNonVisibleTypeName(componentType: string): boolean {
  if (!componentType) return false;
  const meta = getComponentLogicMeta(componentType);
  return meta.kind === "NON_VISIBLE";
}

