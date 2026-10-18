import { AndroidComponent, AndroidScreen } from "../../types";

export interface SymbolEntry {
  id: string;             // Original component id (e.g. "txt_display")
  name: string;           // Original component name (e.g. "DisplayLabel")
  type: string;           // Component type (e.g. "Text", "Button", "Card")
  varName: string;        // Sanitized deterministic Java identifier (e.g. "view_txt_display")
  javaType: string;       // Exact Android View type (e.g. "TextView", "Button")
  screenId: string;       // Screen this component belongs to
  screenName: string;     // Screen name
}

// Map DroidForge component type to standard Android View class
export function mapComponentToJavaType(compType: string): string {
  switch (compType) {
    case "Text":
    case "Text Label":
    case "Toolbar":
    case "Location/GPS":
    case "LocationSensor":
      return "TextView";
    case "Button":
      return "Button";
    case "TextField":
    case "Text Input":
    case "Password Input":
      return "EditText";
    case "Checkbox":
      return "CheckBox";
    case "Switch":
      return "Switch";
    case "Slider":
      return "SeekBar";
    case "Progress":
      return "ProgressBar";
    case "Image":
    case "ImageView":
      return "ImageView";
    case "WebView":
    case "YouTube Player":
    case "YouTubePlayer":
      return "WebView";
    case "Card":
    case "Column":
    case "Row":
    case "Horizontal Layout":
    case "HorizontalLayout":
    case "Vertical Layout":
    case "VerticalLayout":
    case "Box":
    case "Container":
    case "Camera":
      return "LinearLayout";
    case "ScrollView":
      return "ScrollView";
    default:
      return "View";
  }
}

export class SymbolTable {
  private idToSymbol = new Map<string, SymbolEntry>();
  private nameToSymbol = new Map<string, SymbolEntry>();
  private usedVarNames = new Set<string>();

  // Sanitize any arbitrary string into a safe, valid Java identifier
  public sanitizeJavaIdentifier(raw: string): string {
    let clean = raw.replace(/[^a-zA-Z0-9_]/g, "_");
    if (/^[0-9]/.test(clean)) {
      clean = "_" + clean;
    }
    if (!clean || clean === "_") {
      clean = "view_comp";
    }
    return clean;
  }

  // Register a component with collision detection and deterministic naming
  public registerComponent(comp: AndroidComponent, screen: AndroidScreen): SymbolEntry {
    if (this.idToSymbol.has(comp.id)) {
      return this.idToSymbol.get(comp.id)!;
    }

    const baseName = "view_" + this.sanitizeJavaIdentifier(comp.id || comp.name);
    let uniqueName = baseName;
    let collisionCounter = 1;

    while (this.usedVarNames.has(uniqueName)) {
      collisionCounter++;
      uniqueName = `${baseName}_${collisionCounter}`;
    }

    this.usedVarNames.add(uniqueName);

    const entry: SymbolEntry = {
      id: comp.id,
      name: comp.name,
      type: comp.type,
      varName: uniqueName,
      javaType: mapComponentToJavaType(comp.type),
      screenId: screen.id,
      screenName: screen.name,
    };

    this.idToSymbol.set(comp.id, entry);
    // Also index by component name for friendly lookups
    if (comp.name && !this.nameToSymbol.has(comp.name)) {
      this.nameToSymbol.set(comp.name, entry);
    }

    return entry;
  }

  // Build the complete symbol table for all screens
  public build(screens: AndroidScreen[]): void {
    const walk = (comp: AndroidComponent, scr: AndroidScreen) => {
      this.registerComponent(comp, scr);
      if (comp.children && comp.children.length > 0) {
        comp.children.forEach((child) => walk(child, scr));
      }
    };

    screens.forEach((scr) => {
      if (scr.rootComponent) {
        walk(scr.rootComponent, scr);
      }
    });
  }

  public getById(id: string): SymbolEntry | undefined {
    return this.idToSymbol.get(id);
  }

  public getByName(name: string): SymbolEntry | undefined {
    return this.nameToSymbol.get(name);
  }

  public lookup(idOrName: string): SymbolEntry | undefined {
    return this.idToSymbol.get(idOrName) || this.nameToSymbol.get(idOrName);
  }

  public getAllEntries(): SymbolEntry[] {
    return Array.from(this.idToSymbol.values());
  }
}
