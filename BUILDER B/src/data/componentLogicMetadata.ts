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

export interface ComponentLogicMeta {
  componentType: string;
  label: string;
  category: string;
  iconName: string;
  description: string;
  supportedEvents: ComponentEventDef[];
  supportedProperties: ComponentPropertyDef[];
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

  // 15. Camera
  Camera: {
    componentType: "Camera",
    label: "CameraX Viewfinder & Scanner",
    category: "Sensors & Hardware",
    iconName: "Camera",
    description: "CameraX hardware preview with ML Kit QR/Barcode analysis",
    supportedEvents: [
      {
        id: "OnBarcodeScanned",
        name: "On Barcode Scanned",
        category: "sensor",
        description: "Fires when ML Kit detects a valid QR code or barcode",
        outputs: [
          { name: "barcodePayload", type: "String", description: "Decoded text payload or URL" },
          { name: "format", type: "String", description: "Format (QR_CODE, EAN_13, etc.)" },
        ],
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      },
      {
        id: "OnPictureTaken",
        name: "On Picture Taken",
        category: "sensor",
        description: "Fires when a photo is captured and saved to storage",
        outputs: [
          { name: "imageUri", type: "String", description: "Android content:// URI of photo" },
        ],
        badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      },
    ],
    supportedProperties: [
      {
        name: "layoutHeight",
        label: "Preview Height (dp)",
        type: "number",
        defaultValue: 200,
        description: "Height of viewfinder in dp",
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
    recommendedActions: [
      "vibrate",
      "toast",
      "navigate",
      "callApi",
      "databaseInsert",
      "setVariable",
      "copyToClipboard",
    ],
  },

  // 16. Toolbar / TopAppBar
  Toolbar: {
    componentType: "Toolbar",
    label: "Top App Bar / Toolbar",
    category: "Navigation",
    iconName: "PanelTop",
    description: "Material 3 Top App Bar with navigation arrow and action buttons",
    supportedEvents: [
      {
        id: "NavigationClick",
        name: "Navigation Icon Click (Back)",
        category: "gesture",
        description: "Fires when the left navigation arrow is pressed",
        outputs: [],
        badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      },
      {
        id: "ActionClick",
        name: "Action Button Click",
        category: "gesture",
        description: "Fires when top-right overflow or action button is clicked",
        outputs: [
          { name: "actionId", type: "String", description: "Identifier of clicked action" },
        ],
        badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      },
    ],
    supportedProperties: [
      {
        name: "title",
        label: "Screen Header Title",
        type: "string",
        defaultValue: "Screen Title",
        description: "Title in top app bar",
      },
      {
        name: "backgroundColor",
        label: "Bar Background Color",
        type: "color",
        defaultValue: "#1E293B",
        description: "Header surface color",
      },
      {
        name: "textColor",
        label: "Title Text Color",
        type: "color",
        defaultValue: "#FFFFFF",
        description: "Header typography color",
      },
      {
        name: "showBackButton",
        label: "Show Back Arrow",
        type: "boolean",
        defaultValue: true,
        description: "Render navigation arrow icon",
      },
      ...COMMON_UI_PROPERTIES,
    ],
    recommendedActions: ["popBack", "navigate", "dialog", "toast", "vibrate"],
  },

  // 17. Screen / Root Container
  Screen: {
    componentType: "Screen",
    label: "Screen Lifecycle & Background",
    category: "Lifecycle",
    iconName: "Smartphone",
    description: "Jetpack Compose Screen LaunchedEffect and lifecycle hooks",
    supportedEvents: [
      {
        id: "OnScreenLoad",
        name: "On Screen Load (LaunchedEffect)",
        category: "lifecycle",
        description: "Fires exactly once when screen composable enters the composition",
        outputs: [],
        badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      },
      {
        id: "OnResume",
        name: "On Resume (Foreground)",
        category: "lifecycle",
        description: "Fires when the app returns from background to active foreground",
        outputs: [],
        badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      },
      {
        id: "OnBackPress",
        name: "On System Back Gesture",
        category: "lifecycle",
        description: "Fires when user presses Android back button or swipes from edge",
        outputs: [],
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      },
      {
        id: "OnTimerInterval",
        name: "On Periodic Timer (Interval)",
        category: "timer",
        description: "Fires cyclically on a specified background coroutine delay",
        outputs: [
          { name: "tickCount", type: "Int", description: "Total elapsed ticks" },
        ],
        badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      },
    ],
    supportedProperties: [
      {
        name: "title",
        label: "Screen Display Title",
        type: "string",
        defaultValue: "Screen",
        description: "Screen destination title",
      },
      {
        name: "backgroundColor",
        label: "Screen Canvas Color",
        type: "color",
        defaultValue: "#0F172A",
        description: "Full-screen background surface color",
      },
    ],
    recommendedActions: [
      "callApi",
      "databaseQuery",
      "setVariable",
      "toast",
      "delay",
      "requestPermission",
    ],
  },
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
 * Returns the exact logic metadata (supported events, properties, outputs, recommendations)
 * for any given component type.
 */
export function getComponentLogicMeta(componentType: string): ComponentLogicMeta {
  if (!componentType) return DEFAULT_GENERIC_LOGIC_META;
  return COMPONENT_LOGIC_META_MAP[componentType] || {
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
