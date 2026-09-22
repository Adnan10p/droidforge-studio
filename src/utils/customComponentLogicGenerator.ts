import {
  CustomComponentDefinition,
  LogicBlock,
  LogicAction,
} from "../types";

/**
 * Definition of a method parameter for @SimpleFunction or @SimpleEvent
 */
export interface SimpleParamDef {
  name: string;
  type: "String" | "Int" | "Float" | "Double" | "Boolean" | "Any";
  defaultValue?: string | number | boolean;
  description?: string;
}

/**
 * Parsed definition of a public @SimpleFunction on a component
 */
export interface SimpleFunctionDef {
  name: string;
  description: string;
  params: SimpleParamDef[];
  returnType: string;
}

/**
 * Parsed definition of a public @SimpleEvent on a component
 */
export interface SimpleEventDef {
  name: string;
  description: string;
  params: SimpleParamDef[];
}

/**
 * Complete Logic Block Schema definition generated for a Custom Component
 */
export interface CustomComponentLogicSchema {
  componentType: string;
  componentName: string;
  category: string;
  iconName: string;
  functions: SimpleFunctionDef[];
  events: SimpleEventDef[];
  propertyGetters: string[];
  propertySetters: string[];
}

/**
 * Logic Block Generator for Custom Components
 * Analyzes custom component code (Kotlin, Java, Compose, or AIX annotations)
 * for @SimpleFunction, @SimpleEvent, and @SimpleProperty annotations,
 * and produces ready-to-use Logic Block and Logic Action definitions for the visual Logic Flow Editor.
 */
export class CustomComponentLogicBlockGenerator {
  /**
   * Generates the schema definition for a custom component
   */
  public static generateSchema(comp: CustomComponentDefinition): CustomComponentLogicSchema {
    const code = comp.composeCodeSnippet || "";
    const functions = this.extractSimpleFunctions(code, comp);
    const events = this.extractSimpleEvents(code, comp);

    const propertyGetters = (comp.properties || []).map((p) => p.key);
    const propertySetters = (comp.properties || []).map((p) => p.key);

    return {
      componentType: comp.type,
      componentName: comp.name,
      category: comp.category,
      iconName: comp.iconName || "Box",
      functions,
      events,
      propertyGetters,
      propertySetters,
    };
  }

  /**
   * Automatically generate Starter Trigger LogicBlocks for all @SimpleEvents of a component instance
   */
  public static generateEventTriggerBlocks(
    comp: CustomComponentDefinition,
    instanceId: string,
    instanceName: string
  ): LogicBlock[] {
    const schema = this.generateSchema(comp);
    return schema.events.map((ev, index) => {
      return {
        id: `block_${instanceId}_${ev.name.toLowerCase()}_${Date.now() + index}`,
        componentId: instanceId,
        componentName: instanceName,
        event: ev.name,
        eventCategory: "gesture",
        description: ev.description || `When ${instanceName}.${ev.name} occurs`,
        enabled: true,
        actions: [],
        position: { x: 100 + index * 40, y: 80 + index * 120 },
        flowMetadata: {
          isCustomComponent: true,
          componentType: comp.type,
          eventParams: ev.params,
        },
      };
    });
  }

  /**
   * Automatically generate a Callable Action object for a @SimpleFunction
   */
  public static generateFunctionCallAction(
    comp: CustomComponentDefinition,
    fn: SimpleFunctionDef,
    targetInstanceId: string,
    targetInstanceName: string,
    argValues?: Record<string, any>
  ): LogicAction {
    const initialArgs: Record<string, any> = {};
    fn.params.forEach((param) => {
      initialArgs[param.name] = argValues?.[param.name] ?? param.defaultValue ?? (param.type === "Int" ? 0 : param.type === "Boolean" ? true : "");
    });

    return {
      id: `act_custom_fn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      actionType: "callCustomFunction" as any,
      targetId: targetInstanceId,
      property: fn.name, // The function name being invoked
      value: initialArgs, // Parameter arguments
      message: `${targetInstanceName}.${fn.name}()`,
      dialogTitle: comp.type,
      dialogBody: fn.description,
    };
  }

  /**
   * Extract @SimpleFunction annotated methods or public action methods
   */
  public static extractSimpleFunctions(code: string, comp: CustomComponentDefinition): SimpleFunctionDef[] {
    const functions: SimpleFunctionDef[] = [];
    const seenNames = new Set<string>();

    // 1. Explicit @SimpleFunction / @Method / @SimpleMethod fun methodName(args...)
    const simpleFnRegex = /@(?:SimpleFunction|Method|SimpleMethod)(?:\s*\(([\s\S]*?)\))?\s*(?:public\s+|open\s+|override\s+|suspend\s+)*fun\s+([A-Za-z0-9_]+)\s*\(([\s\S]*?)\)(?:\s*:\s*([A-Za-z0-9_<>?]+))?/g;
    let match: RegExpExecArray | null;

    while ((match = simpleFnRegex.exec(code)) !== null) {
      const annotArg = match[1] || "";
      const descMatch = annotArg.match(/(?:description\s*=\s*)?["']([^"']*)["']/);
      const desc = descMatch ? descMatch[1] : "";
      const fnName = match[2];
      const rawParams = match[3] || "";
      const retType = match[4] || "Unit";

      if (!seenNames.has(fnName)) {
        seenNames.add(fnName);
        functions.push({
          name: fnName,
          description: desc || `Invokes ${fnName} on ${comp.name}`,
          params: this.parseParamList(rawParams),
          returnType: retType,
        });
      }
    }

    // 2. Also check standard Kodular / App Inventor Java format:
    // @SimpleFunction public void MethodName(...)
    const javaSimpleFnRegex = /@(?:SimpleFunction|Method|SimpleMethod)(?:\s*\(([\s\S]*?)\))?\s*(?:public\s+)?(?:void|String|int|boolean|float|double|Object)\s+([A-Za-z0-9_]+)\s*\(([\s\S]*?)\)/g;
    while ((match = javaSimpleFnRegex.exec(code)) !== null) {
      const annotArg = match[1] || "";
      const descMatch = annotArg.match(/(?:description\s*=\s*)?["']([^"']*)["']/);
      const desc = descMatch ? descMatch[1] : "";
      const fnName = match[2];
      const rawParams = match[3] || "";

      if (!seenNames.has(fnName)) {
        seenNames.add(fnName);
        functions.push({
          name: fnName,
          description: desc || `Calls ${fnName}()`,
          params: this.parseParamList(rawParams),
          returnType: "Unit",
        });
      }
    }

    // 3. Fallback: If no explicit @SimpleFunction found, derive sensible methods from component category
    if (functions.length === 0) {
      const catLower = (comp.category || "").toLowerCase();
      const nameLower = (comp.name + " " + comp.type).toLowerCase();

      if (catLower.includes("navigation") || nameLower.includes("navigation") || nameLower.includes("bottomnav") || nameLower.includes("tab") || nameLower.includes("navbar")) {
        functions.push(
          {
            name: "SelectTab",
            description: "Switches the active navigation tab to the specified index",
            params: [{ name: "index", type: "Int", defaultValue: 0, description: "Tab index (0-based)" }],
            returnType: "Unit",
          },
          {
            name: "SetBadge",
            description: "Sets the notification badge count on a specific tab item",
            params: [
              { name: "index", type: "Int", defaultValue: 0, description: "Tab index" },
              { name: "count", type: "Int", defaultValue: 1, description: "Badge count" },
            ],
            returnType: "Unit",
          },
          {
            name: "ClearBadge",
            description: "Clears the notification badge from the given tab item",
            params: [{ name: "index", type: "Int", defaultValue: 0, description: "Tab index" }],
            returnType: "Unit",
          },
          {
            name: "SetVisible",
            description: "Sets the visibility of the navigation bar",
            params: [{ name: "visible", type: "Boolean", defaultValue: true, description: "True to show, false to hide" }],
            returnType: "Unit",
          }
        );
      } else if (catLower.includes("monetization") || nameLower.includes("ad") || nameLower.includes("banner")) {
        functions.push(
          {
            name: "LoadAd",
            description: "Request and load a new advertisement from the network",
            params: [],
            returnType: "Unit",
          },
          {
            name: "ShowAd",
            description: "Display the loaded ad on screen",
            params: [],
            returnType: "Unit",
          },
          {
            name: "SetTestMode",
            description: "Enable or disable sandbox test advertising",
            params: [{ name: "enabled", type: "Boolean", defaultValue: true, description: "Test mode flag" }],
            returnType: "Unit",
          }
        );
      } else if (catLower.includes("media") || nameLower.includes("audio") || nameLower.includes("player")) {
        functions.push(
          {
            name: "Play",
            description: "Start or resume media playback",
            params: [],
            returnType: "Unit",
          },
          {
            name: "Pause",
            description: "Pause the currently playing media",
            params: [],
            returnType: "Unit",
          },
          {
            name: "SeekTo",
            description: "Seek to position in milliseconds",
            params: [{ name: "positionMs", type: "Int", defaultValue: 0, description: "Timestamp in ms" }],
            returnType: "Unit",
          }
        );
      } else if (nameLower.includes("chart") || nameLower.includes("graph")) {
        functions.push(
          {
            name: "AddDataPoint",
            description: "Append a new numeric coordinate to the chart",
            params: [
              { name: "label", type: "String", defaultValue: "Day 1", description: "X-axis label" },
              { name: "value", type: "Float", defaultValue: 10, description: "Y-axis numeric value" },
            ],
            returnType: "Unit",
          },
          {
            name: "ClearData",
            description: "Reset all series and points from the chart",
            params: [],
            returnType: "Unit",
          }
        );
      } else {
        // Universal fallback methods for any UI component
        functions.push(
          {
            name: "Refresh",
            description: `Force refresh and re-render ${comp.name}`,
            params: [],
            returnType: "Unit",
          },
          {
            name: "SetVisible",
            description: `Toggle visibility of ${comp.name}`,
            params: [{ name: "visible", type: "Boolean", defaultValue: true, description: "True to show, false to hide" }],
            returnType: "Unit",
          }
        );
      }
    }

    return functions;
  }

  /**
   * Extract @SimpleEvent annotated events or callback parameters from code
   */
  public static extractSimpleEvents(code: string, comp: CustomComponentDefinition): SimpleEventDef[] {
    const events: SimpleEventDef[] = [];
    const seenNames = new Set<string>();

    // 1. Explicit @SimpleEvent / @Event fun EventName(args...)
    const simpleEventRegex = /@(?:SimpleEvent|Event)(?:\s*\(([\s\S]*?)\))?\s*(?:public\s+|open\s+|override\s+)*fun\s+([A-Za-z0-9_]+)\s*\(([\s\S]*?)\)/g;
    let match: RegExpExecArray | null;

    while ((match = simpleEventRegex.exec(code)) !== null) {
      const annotArg = match[1] || "";
      const descMatch = annotArg.match(/(?:description\s*=\s*)?["']([^"']*)["']/);
      const desc = descMatch ? descMatch[1] : "";
      const evName = match[2];
      const rawParams = match[3] || "";

      if (!seenNames.has(evName)) {
        seenNames.add(evName);
        events.push({
          name: evName,
          description: desc || `Triggered when ${evName} occurs`,
          params: this.parseParamList(rawParams),
        });
      }
    }

    // 2. Kodular / App Inventor Java event dispatchers
    // @SimpleEvent public void EventName(...)
    const javaSimpleEventRegex = /@(?:SimpleEvent|Event)(?:\s*\(([\s\S]*?)\))?\s*(?:public\s+)?void\s+([A-Za-z0-9_]+)\s*\(([\s\S]*?)\)/g;
    while ((match = javaSimpleEventRegex.exec(code)) !== null) {
      const annotArg = match[1] || "";
      const descMatch = annotArg.match(/(?:description\s*=\s*)?["']([^"']*)["']/);
      const desc = descMatch ? descMatch[1] : "";
      const evName = match[2];
      const rawParams = match[3] || "";

      if (!seenNames.has(evName)) {
        seenNames.add(evName);
        events.push({
          name: evName,
          description: desc || `Dispatched when ${evName} occurs`,
          params: this.parseParamList(rawParams),
        });
      }
    }

    // 3. Compose Lambda Callbacks (e.g. onLoaded: () -> Unit, onFailed: (String) -> Unit, onClick: () -> Unit)
    const lambdaParamRegex = /\b(on[A-Z][A-Za-z0-9_]*)\s*:\s*\(([\s\S]*?)\)\s*->\s*Unit/g;
    while ((match = lambdaParamRegex.exec(code)) !== null) {
      const callbackName = match[1];
      const rawArgs = match[2] || "";

      // Strip "on" prefix for clean event name (e.g., onLoaded -> Loaded or OnLoaded)
      const evName = callbackName.startsWith("on") ? callbackName.substring(2) : callbackName;
      const cleanEventName = evName || callbackName;

      if (!seenNames.has(cleanEventName)) {
        seenNames.add(cleanEventName);
        events.push({
          name: cleanEventName,
          description: `Dispatched when ${callbackName} callback fires`,
          params: this.parseLambdaArgs(rawArgs),
        });
      }
    }

    // 4. Incorporate comp.supportedEvents if already defined
    (comp.supportedEvents || []).forEach((evName) => {
      const clean = evName.trim();
      if (clean && !seenNames.has(clean)) {
        seenNames.add(clean);
        events.push({
          name: clean,
          description: `Triggered by ${comp.name} ${clean} event`,
          params: [],
        });
      }
    });

    // 5. Context-aware fallback events if none found
    if (events.length === 0) {
      events.push({
        name: "Click",
        description: `When user taps or clicks on ${comp.name}`,
        params: [],
      });

      const catLower = (comp.category || "").toLowerCase();
      const nameLower = (comp.name + " " + comp.type).toLowerCase();

      if (catLower.includes("navigation") || nameLower.includes("navigation") || nameLower.includes("bottomnav") || nameLower.includes("tab")) {
        events.push(
          {
            name: "TabSelected",
            description: "Fired when user taps on a navigation tab item",
            params: [
              { name: "tabIndex", type: "Int", defaultValue: 0, description: "Selected tab index" },
              { name: "tabName", type: "String", defaultValue: "Home", description: "Selected tab name" },
            ],
          },
          {
            name: "TabReselected",
            description: "Fired when user taps the already active tab item",
            params: [
              { name: "tabIndex", type: "Int", defaultValue: 0, description: "Reselected tab index" },
              { name: "tabName", type: "String", defaultValue: "Home", description: "Reselected tab name" },
            ],
          }
        );
      } else if (catLower.includes("monetization")) {
        events.push(
          {
            name: "AdLoaded",
            description: "When the ad creative has loaded successfully",
            params: [],
          },
          {
            name: "AdFailed",
            description: "When the ad failed to load from network",
            params: [{ name: "errorMessage", type: "String", defaultValue: "Network timeout" }],
          },
          {
            name: "AdImpression",
            description: "When the ad impression is recorded",
            params: [],
          }
        );
      }
    }

    return events;
  }

  /**
   * Helper to parse Kotlin parameter lists into typed SimpleParamDef objects
   */
  private static parseParamList(paramsStr: string): SimpleParamDef[] {
    if (!paramsStr || !paramsStr.trim()) return [];

    const parts = paramsStr.split(",").map((p) => p.trim()).filter(Boolean);
    const results: SimpleParamDef[] = [];

    parts.forEach((part) => {
      // e.g. "title: String = \"Hello\"" or "val count: Int" or "String message"
      let name = "";
      let type: "String" | "Int" | "Float" | "Double" | "Boolean" | "Any" = "String";
      let defaultValue: string | number | boolean | undefined;

      // Handle Kotlin format: name: Type = default
      if (part.includes(":")) {
        const [left, right] = part.split(":");
        name = left.replace(/\b(?:val|var)\b/g, "").trim();

        if (right) {
          const typeAndDefault = right.split("=");
          const rawType = typeAndDefault[0].trim();
          if (rawType.includes("Int") || rawType.includes("Long")) type = "Int";
          else if (rawType.includes("Float")) type = "Float";
          else if (rawType.includes("Double")) type = "Double";
          else if (rawType.includes("Boolean")) type = "Boolean";
          else type = "String";

          if (typeAndDefault[1]) {
            const rawDef = typeAndDefault[1].trim().replace(/^["']|["']$/g, "");
            defaultValue = type === "Int" || type === "Float" || type === "Double" ? Number(rawDef) : type === "Boolean" ? rawDef === "true" : rawDef;
          }
        }
      } else {
        // Handle Java format: Type name
        const tokens = part.split(/\s+/);
        if (tokens.length >= 2) {
          const rawType = tokens[0].trim();
          name = tokens[1].trim();
          if (rawType.toLowerCase().includes("int")) type = "Int";
          else if (rawType.toLowerCase().includes("float")) type = "Float";
          else if (rawType.toLowerCase().includes("double")) type = "Double";
          else if (rawType.toLowerCase().includes("bool")) type = "Boolean";
          else type = "String";
        } else {
          name = tokens[0] || "param";
        }
      }

      if (name && !name.toLowerCase().includes("modifier") && !name.toLowerCase().includes("context")) {
        results.push({
          name,
          type,
          defaultValue,
          description: `Parameter ${name} (${type})`,
        });
      }
    });

    return results;
  }

  /**
   * Helper to parse callback arguments e.g. (String, Int) or (error: String)
   */
  private static parseLambdaArgs(argsStr: string): SimpleParamDef[] {
    if (!argsStr || !argsStr.trim()) return [];
    const parts = argsStr.split(",").map((p) => p.trim()).filter(Boolean);

    return parts.map((part, index) => {
      if (part.includes(":")) {
        const [n, t] = part.split(":");
        const name = n.trim();
        const typeStr = (t || "").trim();
        const type = typeStr.includes("Int") ? "Int" : typeStr.includes("Boolean") ? "Boolean" : "String";
        return { name, type, description: `Event parameter ${name}` };
      } else {
        const rawType = part.trim();
        const type = rawType.includes("Int") ? "Int" : rawType.includes("Boolean") ? "Boolean" : "String";
        return { name: `param${index + 1}`, type, description: `Event argument ${index + 1}` };
      }
    });
  }
}
