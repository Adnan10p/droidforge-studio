import { ProjectConfig, AndroidScreen, AndroidComponent, LogicBlock, LogicAction } from "../types";
import { getAllComponentsFromScreen } from "../utils/screenManager";
import { getComponentLogicMeta } from "../data/componentLogicMetadata";

export interface ComponentIR {
  id: string;
  type: string;
  name: string;
  category: string;
  isContainer: boolean;
  isVisible: boolean;
  props: Record<string, any>;
  children?: ComponentIR[];
}

export interface LogicActionIR {
  id: string;
  actionType: string;
  targetId?: string;
  property?: string;
  value?: any;
  endpoint?: string;
  method?: string;
  targetScreen?: string;
  dialogTitle?: string;
  dialogBody?: string;
  variableName?: string;
  variableOperation?: string;
  variableValue?: string;
  delayMs?: number;
}

export interface LogicBlockIR {
  id: string;
  componentId: string;
  componentName: string;
  event: string;
  actions: LogicActionIR[];
}

export interface ScreenIR {
  id: string;
  name: string;
  title: string;
  isInitial: boolean;
  backgroundColor: string;
  titleVisible: boolean;
  components: ComponentIR[];
  logicBlocks: LogicBlockIR[];
  stateVariables: Array<{ name: string; type: string; initialValue: string }>;
}

export interface AppIR {
  schemaVersion: "1.0.0";
  appName: string;
  packageName: string;
  versionCode: number;
  versionName: string;
  minSdk: number;
  targetSdk: number;
  compileSdk: number;
  permissions: string[];
  dependencies: Array<{ group: string; artifact: string; version: string }>;
  screens: ScreenIR[];
  recommendedEngine: "FAST_JAVA" | "PRODUCTION_GRADLE";
  reasonForEngine: string;
}

export interface PreBuildDiagnostic {
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
  remediation?: string;
}

export interface PreBuildValidationResult {
  valid: boolean;
  ir: AppIR;
  diagnostics: PreBuildDiagnostic[];
  recommendedEngine: "FAST_JAVA" | "PRODUCTION_GRADLE";
}

/**
 * Transforms DroidForge Visual Project into strongly typed JSON Intermediate Representation (IR)
 * and executes comprehensive pre-build safety validation.
 */
export function buildIntermediateRepresentation(
  config: ProjectConfig,
  screens: AndroidScreen[]
): PreBuildValidationResult {
  const diagnostics: PreBuildDiagnostic[] = [];

  // 1. Validate Package Name (must match Java/Android package naming conventions)
  const pkg = config.packageName || "com.droidforge.quickapp";
  const pkgRegex = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/i;
  if (!pkgRegex.test(pkg)) {
    diagnostics.push({
      severity: "error",
      code: "INVALID_PACKAGE_NAME",
      message: `Invalid Android package name: "${pkg}". Must contain at least two segments (e.g. com.example.myapp).`,
      remediation: "Update Package Name in Project Settings to standard reverse-domain format (e.g. com.mycompany.app).",
    });
  }

  // 2. Validate Target & Min SDK
  const minSdk = config.minSdk || 24;
  const targetSdk = config.targetSdk || 34;
  if (minSdk > targetSdk) {
    diagnostics.push({
      severity: "error",
      code: "INVALID_SDK_BOUNDS",
      message: `Min SDK (${minSdk}) cannot be greater than Target SDK (${targetSdk}).`,
      remediation: "Set Min SDK <= Target SDK in Project Settings.",
    });
  }

  // 3. Collect all components and required permissions
  const collectedPermissions = new Set<string>(config.permissions || []);
  let hasComplexComponents = false;
  let complexReason = "";

  const allCompsAcrossScreens: AndroidComponent[] = [];
  for (const s of screens) {
    const screenComps = getAllComponentsFromScreen(s);
    allCompsAcrossScreens.push(...screenComps);

    for (const comp of screenComps) {
      const meta = getComponentLogicMeta(comp.type);
      if (meta.permissions) {
        meta.permissions.forEach((p) => collectedPermissions.add(p));
      }

      // Check if component requires full Gradle dependency resolution
      if (
        comp.type.includes("AdMob") ||
        comp.type.includes("Firebase") ||
        comp.type.includes("Biometric") ||
        comp.type.includes("GoogleMap") ||
        comp.type.includes("Lottie")
      ) {
        hasComplexComponents = true;
        complexReason = `Project contains complex native SDK components (${comp.type}) requiring full Maven dependency resolution.`;
      }
    }
  }

  // 4. Map screens to ScreenIR
  const screenIRs: ScreenIR[] = (screens.length > 0 ? screens : []).map((scr, idx) => {
    const rawComps = scr.rootComponent?.children || [];
    
    function mapComp(c: AndroidComponent): ComponentIR {
      return {
        id: c.id,
        type: c.type,
        name: c.name || c.id,
        category: c.category || "General",
        isContainer: Boolean(c.children && c.children.length > 0),
        isVisible: true,
        props: c.props || {},
        children: c.children ? c.children.map(mapComp) : [],
      };
    }

    const logicBlocksIR: LogicBlockIR[] = (scr.logicBlocks || []).map((b) => ({
      id: b.id,
      componentId: b.componentId,
      componentName: b.componentName || "Component",
      event: b.event,
      actions: (b.actions || []).map((a) => ({
        id: a.id,
        actionType: a.actionType,
        targetId: a.targetId,
        property: a.property,
        value: a.value,
        endpoint: a.endpoint,
        method: a.method,
        targetScreen: a.targetScreen,
        dialogTitle: a.dialogTitle,
        dialogBody: a.dialogBody || a.message,
        variableName: a.variableName,
        variableOperation: a.variableOperation,
        variableValue: a.variableValue,
        delayMs: a.delayMs,
      })),
    }));

    return {
      id: scr.id,
      name: scr.name || `Screen_${idx}`,
      title: scr.title || scr.name || "Screen",
      isInitial: scr.isInitial || idx === 0,
      backgroundColor: scr.properties?.backgroundColor || "#FFFFFF",
      titleVisible: scr.properties?.titleVisible !== false,
      components: rawComps.map(mapComp),
      logicBlocks: logicBlocksIR,
      stateVariables: (scr.stateVariables || []).map((v) => ({
        name: v.name,
        type: v.type,
        initialValue: v.initialValue,
      })),
    };
  });

  // 5. Determine recommended engine
  const recommendedEngine: "FAST_JAVA" | "PRODUCTION_GRADLE" = hasComplexComponents
    ? "PRODUCTION_GRADLE"
    : "FAST_JAVA";

  const appIR: AppIR = {
    schemaVersion: "1.0.0",
    appName: config.appName || "DroidForge App",
    packageName: pkg,
    versionCode: config.versionCode || 1,
    versionName: config.versionName || "1.0.0",
    minSdk: minSdk,
    targetSdk: targetSdk,
    compileSdk: config.compileSdk || 35,
    permissions: Array.from(collectedPermissions),
    dependencies: (config.dependencies || []).filter((d) => d.enabled),
    screens: screenIRs,
    recommendedEngine,
    reasonForEngine: hasComplexComponents ? complexReason : "Lightweight project compatible with fast 3-second offline Java compiler.",
  };

  const hasFatalErrors = diagnostics.some((d) => d.severity === "error");

  return {
    valid: !hasFatalErrors,
    ir: appIR,
    diagnostics,
    recommendedEngine,
  };
}
