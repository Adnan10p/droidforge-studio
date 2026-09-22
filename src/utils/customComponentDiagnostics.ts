import {
  CustomComponentRequiredLib,
  CustomPropertyDef,
  ComponentCategory,
} from "../types";
import { RECOMMENDED_ANDROID_LIBRARIES } from "../data/defaultCustomComponents";

export type DiagnosticSeverity = "error" | "warning" | "info" | "missing_lib";
export type ComponentArchetype = "AndroidViewComponent" | "AndroidNonvisibleComponent" | "ComposableLayout";

export interface DiagnosticQuickFix {
  label: string;
  actionType: "add_lib" | "insert_code" | "add_permission" | "fix_override";
  type?: string;
  data?: any;
}

export interface DiagnosticItem {
  id: string;
  severity: DiagnosticSeverity;
  title: string;
  message: string;
  line?: number;
  snippet?: string;
  category?: string;
  suggestion?: string;
  quickFix?: DiagnosticQuickFix;
}

export interface DiagnosticReport {
  isValid: boolean;
  canSaveSafely: boolean;
  hasErrors: boolean;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  missingLibCount: number;
  missingLibraryCount?: number;
  archetype?: string;
  items: DiagnosticItem[];
  detectedClassType?: "AndroidViewComponent" | "AndroidNonvisibleComponent" | "ComposableFunction" | "GenericClass";
  detectedClassName?: string;
  implementedLifecycleListeners: string[];
}

/**
 * Validates Kotlin / Java code against expected Android component structure:
 * - Proper class hierarchy (AndroidViewComponent, AndroidNonvisibleComponent, or @Composable)
 * - Mandatory overrides (e.g. getView(): View)
 * - Lifecycle listeners (OnResumeListener, OnPauseListener, OnDestroyListener, LifecycleObserver)
 * - Missing Gradle library dependencies
 * - Missing imports and permissions
 */
export function validateAndroidComponentCode(
  rawCode: string,
  selectedLibraries: CustomComponentRequiredLib[] = [],
  currentPermissions: string[] = []
): DiagnosticReport {
  const code = (rawCode || "").trim();
  const items: DiagnosticItem[] = [];

  if (!code) {
    return {
      isValid: false,
      canSaveSafely: false,
      hasErrors: true,
      errorCount: 1,
      warningCount: 0,
      infoCount: 0,
      missingLibCount: 0,
      items: [
        {
          id: "err_empty_code",
          severity: "error",
          title: "Empty Source Code",
          message: "Please write or paste Kotlin code, or use 'Generate Skeleton' to create a boilerplate component.",
        },
      ],
      implementedLifecycleListeners: [],
    };
  }

  const codeLower = code.toLowerCase();
  const lines = code.split("\n");

  // 1. Identify Component Type & Class Hierarchy
  const classMatch = code.match(/class\s+([A-Za-z0-9_]+)(?:\s*\(([\s\S]*?)\))?\s*(?::\s*([^{]+))?/);
  const composableMatch = code.match(/@Composable\s+(?:inline\s+)?fun\s+([A-Za-z0-9_]+)/);

  let detectedClassName = "";
  let detectedClassType: DiagnosticReport["detectedClassType"] = "GenericClass";
  let superTypesStr = "";

  if (classMatch) {
    detectedClassName = classMatch[1];
    superTypesStr = classMatch[3] || "";

    if (superTypesStr.includes("AndroidViewComponent")) {
      detectedClassType = "AndroidViewComponent";
    } else if (superTypesStr.includes("AndroidNonvisibleComponent")) {
      detectedClassType = "AndroidNonvisibleComponent";
    } else {
      detectedClassType = "GenericClass";
    }
  } else if (composableMatch) {
    detectedClassName = composableMatch[1];
    detectedClassType = "ComposableFunction";
  }

  // 2. Validate Class Hierarchy & Primary Constructor
  if (detectedClassType === "AndroidViewComponent") {
    // Check primary constructor signature
    const ctorArgs = classMatch?.[2] || "";
    if (!ctorArgs.includes("ComponentContainer") && !ctorArgs.includes("container")) {
      items.push({
        id: "err_view_comp_ctor",
        severity: "error",
        title: "Invalid Constructor Signature",
        message:
          "AndroidViewComponent must take 'container: ComponentContainer' in its primary constructor: `class " +
          detectedClassName +
          "(container: ComponentContainer) : AndroidViewComponent(container)`",
        quickFix: {
          label: "Fix Constructor Signature",
          actionType: "fix_override",
          data: {
            search: new RegExp(`class\\s+${detectedClassName}(?:\\([^)]*\\))?`),
            replace: `class ${detectedClassName}(container: ComponentContainer) : AndroidViewComponent(container)`,
          },
        },
      });
    }

    // Check mandatory getView(): View override
    const hasGetView =
      /override\s+fun\s+getView\s*\(\s*\)\s*:\s*View/.test(code) ||
      /override\s+public\s+View\s+getView\s*\(/.test(code) ||
      /fun\s+getView\s*\(\s*\)\s*:\s*View/.test(code) ||
      /public\s+View\s+getView\s*\(/.test(code);

    if (!hasGetView) {
      items.push({
        id: "err_missing_get_view",
        severity: "error",
        title: "Missing Mandatory Override: getView()",
        message:
          "Classes extending AndroidViewComponent must implement 'override fun getView(): View' to return the native Android View hierarchy.",
        quickFix: {
          label: "Add override fun getView(): View",
          actionType: "insert_code",
          data: `\n    // Mandatory override for AndroidViewComponent\n    override fun getView(): View {\n        return view\n    }\n`,
        },
      });
    }

    // Check container.$add(this)
    const hasContainerAdd = code.includes("container.$add(this)") || code.includes("$add(this)");
    if (!hasContainerAdd) {
      items.push({
        id: "warn_missing_container_add",
        severity: "warning",
        title: "Recommended: container.$add(this)",
        message:
          "In App Inventor / Kodular components, `container.$add(this)` is normally called in the `init` block so the parent container mounts the view.",
        quickFix: {
          label: "Add container.$add(this) to init",
          actionType: "insert_code",
          data: `\n        container.\$add(this)`,
        },
      });
    }
  } else if (detectedClassType === "AndroidNonvisibleComponent") {
    // Check primary constructor signature
    const ctorArgs = classMatch?.[2] || "";
    if (!ctorArgs.includes("ComponentContainer") && !ctorArgs.includes("Form") && !ctorArgs.includes("form")) {
      items.push({
        id: "warn_nonvis_comp_ctor",
        severity: "warning",
        title: "Check Nonvisible Component Constructor",
        message:
          "AndroidNonvisibleComponent constructor should accept `container: ComponentContainer` and call `super(container.$form())`.",
      });
    }
  } else if (detectedClassType === "GenericClass" && !composableMatch) {
    items.push({
      id: "info_generic_class",
      severity: "info",
      title: "Class Does Not Extend Android Component Base",
      message:
        "For standard App Inventor / Kodular extension integration, components typically extend `AndroidViewComponent` or `AndroidNonvisibleComponent`.",
    });
  }

  // 3. Validate Lifecycle Listeners
  const implementedLifecycle: string[] = [];

  const implementsResume = superTypesStr.includes("OnResumeListener") || code.includes("OnResumeListener");
  const implementsPause = superTypesStr.includes("OnPauseListener") || code.includes("OnPauseListener");
  const implementsDestroy = superTypesStr.includes("OnDestroyListener") || code.includes("OnDestroyListener");
  const implementsLifecycleDelegate = superTypesStr.includes("LifecycleDelegate") || code.includes("LifecycleDelegate");

  if (implementsResume) implementedLifecycle.push("OnResumeListener");
  if (implementsPause) implementedLifecycle.push("OnPauseListener");
  if (implementsDestroy) implementedLifecycle.push("OnDestroyListener");
  if (implementsLifecycleDelegate) implementedLifecycle.push("LifecycleDelegate");

  // Verify onResume() method
  if (implementsResume || implementsLifecycleDelegate) {
    const hasOnResumeMethod = /(?:override\s+)?fun\s+onResume\s*\(\s*\)/.test(code) || /void\s+onResume\s*\(/.test(code);
    if (!hasOnResumeMethod) {
      items.push({
        id: "err_missing_on_resume",
        severity: "error",
        title: "Missing Mandatory Method: onResume()",
        message: "OnResumeListener requires implementing `override fun onResume()`.",
        quickFix: {
          label: "Add override fun onResume()",
          actionType: "insert_code",
          data: `\n    override fun onResume() {\n        // Resume animations, timers, or active tasks\n    }\n`,
        },
      });
    }

    const registersOnResume = code.includes("registerForOnResume");
    if (!registersOnResume) {
      items.push({
        id: "warn_unregistered_on_resume",
        severity: "warning",
        title: "Lifecycle Listener Not Registered: OnResume",
        message: "Call `container.$form().registerForOnResume(this)` in the init block to receive onResume callbacks.",
        quickFix: {
          label: "Register onResume in init",
          actionType: "insert_code",
          data: `\n        container.\$form().registerForOnResume(this)`,
        },
      });
    }
  }

  // Verify onPause() method
  if (implementsPause || implementsLifecycleDelegate) {
    const hasOnPauseMethod = /(?:override\s+)?fun\s+onPause\s*\(\s*\)/.test(code) || /void\s+onPause\s*\(/.test(code);
    if (!hasOnPauseMethod) {
      items.push({
        id: "err_missing_on_pause",
        severity: "error",
        title: "Missing Mandatory Method: onPause()",
        message: "OnPauseListener requires implementing `override fun onPause()`.",
        quickFix: {
          label: "Add override fun onPause()",
          actionType: "insert_code",
          data: `\n    override fun onPause() {\n        // Pause animations or transient operations\n    }\n`,
        },
      });
    }

    const registersOnPause = code.includes("registerForOnPause");
    if (!registersOnPause) {
      items.push({
        id: "warn_unregistered_on_pause",
        severity: "warning",
        title: "Lifecycle Listener Not Registered: OnPause",
        message: "Call `container.$form().registerForOnPause(this)` in the init block to receive onPause callbacks.",
        quickFix: {
          label: "Register onPause in init",
          actionType: "insert_code",
          data: `\n        container.\$form().registerForOnPause(this)`,
        },
      });
    }
  }

  // Verify onDestroy() method
  if (implementsDestroy || implementsLifecycleDelegate) {
    const hasOnDestroyMethod = /(?:override\s+)?fun\s+onDestroy\s*\(\s*\)/.test(code) || /void\s+onDestroy\s*\(/.test(code);
    if (!hasOnDestroyMethod) {
      items.push({
        id: "err_missing_on_destroy",
        severity: "error",
        title: "Missing Mandatory Method: onDestroy()",
        message: "OnDestroyListener requires implementing `override fun onDestroy()`.",
        quickFix: {
          label: "Add override fun onDestroy()",
          actionType: "insert_code",
          data: `\n    override fun onDestroy() {\n        // Unregister listeners and release resources\n    }\n`,
        },
      });
    }

    const registersOnDestroy = code.includes("registerForOnDestroy");
    if (!registersOnDestroy) {
      items.push({
        id: "warn_unregistered_on_destroy",
        severity: "warning",
        title: "Lifecycle Listener Not Registered: OnDestroy",
        message: "Call `container.$form().registerForOnDestroy(this)` in the init block to receive onDestroy callbacks.",
        quickFix: {
          label: "Register onDestroy in init",
          actionType: "insert_code",
          data: `\n        container.\$form().registerForOnDestroy(this)`,
        },
      });
    }
  }

  // 4. Missing Gradle Dependencies Validation
  const hasLib = (artifact: string) =>
    selectedLibraries.some((l) => l.artifact.toLowerCase() === artifact.toLowerCase());

  // Check Start.io Ads SDK
  if (
    codeLower.includes("startapp") ||
    codeLower.includes("startio") ||
    codeLower.includes("bannerlistener") ||
    codeLower.includes("com.startapp")
  ) {
    if (!hasLib("inapp-sdk")) {
      const defLib = RECOMMENDED_ANDROID_LIBRARIES.find((l) => l.artifact === "inapp-sdk");
      items.push({
        id: "dep_startio_missing",
        severity: "missing_lib",
        title: "Missing Dependency: Start.io Ads SDK",
        message:
          "Your code references Start.io / StartApp banner or listener APIs, but `com.startapp:inapp-sdk:5.1.0` is not yet linked in Required Libraries.",
        quickFix: defLib
          ? {
              label: "Add Start.io In-App SDK (5.1.0)",
              actionType: "add_lib",
              data: defLib,
            }
          : undefined,
      });
    }
  }

  // Check Airbnb Lottie Animation
  if (
    codeLower.includes("lottie") ||
    codeLower.includes("lottieanimation") ||
    codeLower.includes("rememberlottiecomposition")
  ) {
    if (!hasLib("lottie-compose")) {
      const defLib = RECOMMENDED_ANDROID_LIBRARIES.find((l) => l.artifact === "lottie-compose");
      items.push({
        id: "dep_lottie_missing",
        severity: "missing_lib",
        title: "Missing Dependency: Lottie Compose",
        message:
          "Your code references Lottie Compose animation APIs, but `com.airbnb.android:lottie-compose:6.4.0` is not linked in Required Libraries.",
        quickFix: defLib
          ? {
              label: "Add Lottie Compose (6.4.0)",
              actionType: "add_lib",
              data: defLib,
            }
          : undefined,
      });
    }
  }

  // Check MPAndroidChart
  if (
    codeLower.includes("mpandroidchart") ||
    codeLower.includes("linechart") ||
    codeLower.includes("barchart") ||
    codeLower.includes("piechart")
  ) {
    if (!hasLib("mpandroidchart")) {
      items.push({
        id: "dep_mpchart_missing",
        severity: "missing_lib",
        title: "Missing Dependency: MPAndroidChart",
        message:
          "Your code references MPAndroidChart charting APIs, but `com.github.PhilJay:MPAndroidChart:v3.1.0` is not linked.",
        quickFix: {
          label: "Add MPAndroidChart (v3.1.0)",
          actionType: "add_lib",
          data: {
            id: "lib_mpandroidchart",
            name: "MPAndroidChart",
            group: "com.github.PhilJay",
            artifact: "MPAndroidChart",
            version: "v3.1.0",
            description: "Line, bar, pie, and radar charts library",
            required: true,
            category: "Media",
          },
        },
      });
    }
  }

  // Check Coil Image Loader
  if (
    codeLower.includes("asyncimage") ||
    codeLower.includes("rememberasyncimagepainter") ||
    codeLower.includes("io.coil-kt")
  ) {
    if (!hasLib("coil-compose")) {
      const defLib = RECOMMENDED_ANDROID_LIBRARIES.find((l) => l.artifact === "coil-compose");
      items.push({
        id: "dep_coil_missing",
        severity: "missing_lib",
        title: "Missing Dependency: Coil Compose",
        message:
          "Your code references Coil asynchronous image loading, but `io.coil-kt:coil-compose:2.7.0` is not linked.",
        quickFix: defLib
          ? {
              label: "Add Coil Compose (2.7.0)",
              actionType: "add_lib",
              data: defLib,
            }
          : undefined,
      });
    }
  }

  // Check ExoPlayer / Media3
  if (
    codeLower.includes("exoplayer") ||
    codeLower.includes("mediaitem") ||
    codeLower.includes("androidx.media3")
  ) {
    if (!hasLib("media3-exoplayer")) {
      const defLib = RECOMMENDED_ANDROID_LIBRARIES.find((l) => l.artifact === "media3-exoplayer");
      items.push({
        id: "dep_exoplayer_missing",
        severity: "missing_lib",
        title: "Missing Dependency: Media3 ExoPlayer",
        message: "Your code references ExoPlayer, but `androidx.media3:media3-exoplayer:1.4.1` is not linked.",
        quickFix: defLib
          ? {
              label: "Add AndroidX Media3 ExoPlayer",
              actionType: "add_lib",
              data: defLib,
            }
          : undefined,
      });
    }
  }

  // Check Material3 Compose
  if (
    composableMatch &&
    (codeLower.includes("elevatedcard") ||
      codeLower.includes("carddefaults") ||
      codeLower.includes("materialtheme") ||
      codeLower.includes("scaffold") ||
      codeLower.includes("buttondefaults"))
  ) {
    if (!hasLib("material3")) {
      items.push({
        id: "dep_material3_missing",
        severity: "missing_lib",
        title: "Missing Dependency: Compose Material 3",
        message: "Jetpack Compose Material 3 UI tokens are referenced, but `material3` library is not linked.",
        quickFix: {
          label: "Add Compose Material 3",
          actionType: "add_lib",
          data: {
            id: "lib_compose_m3",
            name: "Compose Material 3",
            group: "androidx.compose.material3",
            artifact: "material3",
            version: "1.3.1",
            description: "Material 3 tokens, surface and colors",
            required: true,
            category: "Compose",
          },
        },
      });
    }
  }

  // 5. Check Required Imports
  const hasAnnotationImports =
    code.includes("import com.google.appinventor.components.annotations.*") ||
    code.includes("import com.google.appinventor.components.annotations.");
  const usesSimpleAnnotations =
    code.includes("@SimpleProperty") ||
    code.includes("@SimpleFunction") ||
    code.includes("@SimpleEvent") ||
    code.includes("@DesignerComponent") ||
    code.includes("@SimpleObject");

  if (usesSimpleAnnotations && !hasAnnotationImports) {
    items.push({
      id: "warn_missing_annotation_import",
      severity: "warning",
      title: "Missing Import: Component Annotations",
      message:
        "Component annotations (@SimpleProperty, @SimpleFunction, @DesignerComponent) require `import com.google.appinventor.components.annotations.*`.",
      quickFix: {
        label: "Add Annotation Imports",
        actionType: "insert_code",
        data: "import com.google.appinventor.components.annotations.*\n",
      },
    });
  }

  const hasRuntimeImports =
    code.includes("import com.google.appinventor.components.runtime.*") ||
    code.includes("import com.google.appinventor.components.runtime.");
  if (
    (detectedClassType === "AndroidViewComponent" || detectedClassType === "AndroidNonvisibleComponent") &&
    !hasRuntimeImports
  ) {
    items.push({
      id: "warn_missing_runtime_import",
      severity: "warning",
      title: "Missing Import: Component Runtime",
      message:
        "Component base classes and interfaces require `import com.google.appinventor.components.runtime.*`.",
      quickFix: {
        label: "Add Runtime Imports",
        actionType: "insert_code",
        data: "import com.google.appinventor.components.runtime.*\n",
      },
    });
  }

  // 6. Check Required Permissions
  const checkPerm = (name: string, reason: string) => {
    const full = `android.permission.${name}`;
    if (!currentPermissions.includes(full)) {
      items.push({
        id: `perm_${name.toLowerCase()}_missing`,
        severity: "warning",
        title: `Recommended Permission: ${name}`,
        message: `${reason} requires \`${full}\` declared in AndroidManifest.xml.`,
        quickFix: {
          label: `Add ${name} Permission`,
          actionType: "add_permission",
          data: full,
        },
      });
    }
  };

  if (
    codeLower.includes("startapp") ||
    codeLower.includes("startio") ||
    codeLower.includes("http") ||
    codeLower.includes("url") ||
    codeLower.includes("api")
  ) {
    checkPerm("INTERNET", "Network operations & Ad SDKs");
    checkPerm("ACCESS_NETWORK_STATE", "Network state checking");
  }

  if (codeLower.includes("camera") || codeLower.includes("qrcode") || codeLower.includes("barcode")) {
    checkPerm("CAMERA", "Camera hardware access");
  }

  // Calculate totals
  const errorCount = items.filter((i) => i.severity === "error").length;
  const warningCount = items.filter((i) => i.severity === "warning").length;
  const infoCount = items.filter((i) => i.severity === "info").length;
  const missingLibCount = items.filter((i) => i.severity === "missing_lib").length;

  return {
    isValid: errorCount === 0 && missingLibCount === 0,
    canSaveSafely: errorCount === 0,
    hasErrors: errorCount > 0,
    errorCount,
    warningCount,
    infoCount,
    missingLibCount,
    missingLibraryCount: missingLibCount,
    archetype: detectedClassType,
    items,
    detectedClassType,
    detectedClassName,
    implementedLifecycleListeners: implementedLifecycle,
  };
}

/**
 * Generates a standard boilerplate Kotlin class including necessary imports,
 * lifecycle listeners, and standard AndroidViewComponent structure to get the user started.
 */
export function generateBoilerplateSkeleton(options: {
  componentName: string;
  archetype?: "AndroidViewComponent" | "AndroidNonvisibleComponent" | "ComposableLayout";
  description?: string;
  category?: ComponentCategory;
  isContainer?: boolean;
}): {
  code: string;
  typeId: string;
  name: string;
  suggestedName: string;
  suggestedTypeId: string;
  suggestedCategory: ComponentCategory;
  isContainer: boolean;
  category: ComponentCategory;
  description: string;
  requiredLibraries: CustomComponentRequiredLib[];
  recommendedLibraries: CustomComponentRequiredLib[];
  permissions: string[];
} {
  const rawInput = (options.componentName || "BannerView").trim();
  const sanitizedName = rawInput.replace(/[^a-zA-Z0-9]/g, "") || "BannerView";
  const typeId = sanitizedName.charAt(0).toUpperCase() + sanitizedName.slice(1);
  const humanName = rawInput.replace(/([A-Z])/g, " $1").trim() || "Banner View";
  const archetype = options.archetype || "AndroidViewComponent";
  const category = options.category || (typeId.toLowerCase().includes("banner") ? "Monetization" : "Basic UI");
  const isContainer = Boolean(options.isContainer);
  const description =
    options.description ||
    `${humanName} - Custom Android extension component with lifecycle listeners, configurable properties, and logic blocks.`;

  if (archetype === "AndroidNonvisibleComponent") {
    const code = `package com.droidforge.components.custom

import android.content.Context
import android.util.Log
import com.google.appinventor.components.annotations.*
import com.google.appinventor.components.common.ComponentCategory
import com.google.appinventor.components.common.PropertyTypeConstants
import com.google.appinventor.components.runtime.*

/**
 * Custom Non-Visible Component: ${typeId}
 * ${description}
 */
@DesignerComponent(
    version = 1,
    description = "${description}",
    category = ComponentCategory.EXTENSION,
    nonVisible = true,
    iconName = "images/extension.png"
)
@SimpleObject(external = true)
@UsesPermissions(permissionNames = "android.permission.INTERNET")
class ${typeId}(container: ComponentContainer) : AndroidNonvisibleComponent(container.\$form()),
    LifecycleDelegate,
    OnResumeListener,
    OnPauseListener,
    OnDestroyListener {

    private val context: Context = container.\$context()
    private val TAG = "${typeId}"

    // Configurable Properties
    private var apiKey: String = "demo_key_12345"
    private var isEnabled: Boolean = true
    private var timeoutSeconds: Int = 30

    init {
        // Register standard Android lifecycle listeners with the Host Form
        form.registerForOnResume(this)
        form.registerForOnPause(this)
        form.registerForOnDestroy(this)
        Log.d(TAG, "${typeId} initialized successfully")
    }

    // --- Lifecycle Listeners ---
    override fun onResume() {
        Log.d(TAG, "${typeId} onResume: resumed active operations")
    }

    override fun onPause() {
        Log.d(TAG, "${typeId} onPause: paused active operations")
    }

    override fun onDestroy() {
        Log.d(TAG, "${typeId} onDestroy: cleaning up lifecycle observers")
        form.unregisterForOnResume(this)
        form.unregisterForOnPause(this)
        form.unregisterForOnDestroy(this)
    }

    // --- Simple Properties (Property Inspector) ---
    @DesignerProperty(editorType = PropertyTypeConstants.PROPERTY_TYPE_STRING, defaultValue = "demo_key_12345")
    @SimpleProperty(description = "API or Client Key for backend synchronization")
    fun ApiKey(key: String) {
        this.apiKey = key
    }

    @SimpleProperty
    fun ApiKey(): String = this.apiKey

    @DesignerProperty(editorType = PropertyTypeConstants.PROPERTY_TYPE_BOOLEAN, defaultValue = "True")
    @SimpleProperty(description = "Whether this background service is actively enabled")
    fun Enabled(enabled: Boolean) {
        this.isEnabled = enabled
    }

    @SimpleProperty
    fun Enabled(): Boolean = this.isEnabled

    @DesignerProperty(editorType = PropertyTypeConstants.PROPERTY_TYPE_INTEGER, defaultValue = "30")
    @SimpleProperty(description = "Operation timeout in seconds")
    fun TimeoutSeconds(timeout: Int) {
        this.timeoutSeconds = timeout
    }

    @SimpleProperty
    fun TimeoutSeconds(): Int = this.timeoutSeconds

    // --- Simple Functions (Callable Logic Block Actions) ---
    @SimpleFunction(description = "Starts the background synchronization task")
    fun StartService() {
        if (!isEnabled) return
        Log.d(TAG, "Starting service...")
        OnServiceStarted(true)
    }

    @SimpleFunction(description = "Sends a custom payload to the native handler")
    fun SendData(payload: String) {
        Log.d(TAG, "Sending payload: \$payload")
        OnDataReceived(payload, 200)
    }

    // --- Simple Events (Logic Block Trigger Blocks) ---
    @SimpleEvent(description = "Fired when the service successfully initializes")
    fun OnServiceStarted(success: Boolean) {
        EventDispatcher.dispatchEvent(this, "OnServiceStarted", success)
    }

    @SimpleEvent(description = "Fired when incoming data or result is received")
    fun OnDataReceived(result: String, statusCode: Int) {
        EventDispatcher.dispatchEvent(this, "OnDataReceived", result, statusCode)
    }

    @SimpleEvent(description = "Fired when an error occurs during operation")
    fun OnError(errorMessage: String) {
        EventDispatcher.dispatchEvent(this, "OnError", errorMessage)
    }
}
`;
    return {
      code,
      typeId,
      name: humanName,
      suggestedName: humanName,
      suggestedTypeId: typeId,
      suggestedCategory: "System & Services",
      isContainer: false,
      category: "System & Services",
      description,
      requiredLibraries: [],
      recommendedLibraries: [],
      permissions: ["android.permission.INTERNET"],
    };
  }

  // Default: AndroidViewComponent (Standard Android View Extension with Lifecycle Listeners)
  const isBanner = typeId.toLowerCase().includes("banner");
  const code = `package com.droidforge.components.custom

import android.content.Context
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.view.Gravity
import android.view.View
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import com.google.appinventor.components.annotations.*
import com.google.appinventor.components.common.ComponentCategory
import com.google.appinventor.components.common.PropertyTypeConstants
import com.google.appinventor.components.runtime.*

/**
 * Boilerplate AndroidViewComponent: ${typeId}
 * ${description}
 */
@DesignerComponent(
    version = 1,
    description = "${description}",
    category = ComponentCategory.USERINTERFACE,
    nonVisible = false,
    iconName = "images/extension.png"
)
@SimpleObject(external = true)
@UsesPermissions(permissionNames = "android.permission.INTERNET, android.permission.ACCESS_NETWORK_STATE")
class ${typeId}(container: ComponentContainer) : AndroidViewComponent(container),
    LifecycleDelegate,
    OnResumeListener,
    OnPauseListener,
    OnDestroyListener {

    private val context: Context = container.\$context()
    private val hostLayout: FrameLayout = FrameLayout(context)
    private val contentContainer: LinearLayout = LinearLayout(context)
    private val titleView: TextView = TextView(context)
    private val subtitleView: TextView = TextView(context)

    // Configurable View Properties
    private var titleText: String = "${humanName}"
    private var subtitleText: String = "Interactive custom view with lifecycle management"
    private var bannerBgColor: Int = Color.parseColor("#6366F1")
    private var titleColor: Int = Color.WHITE
    private var subtitleColor: Int = Color.parseColor("#E0E7FF")
    private var cornerRadiusPx: Float = 36f
    private var isViewEnabled: Boolean = true

    init {
        // 1. Configure Android View Layout Parameters
        hostLayout.layoutParams = FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.WRAP_CONTENT
        )
        hostLayout.setPadding(24, 20, 24, 20)

        contentContainer.orientation = LinearLayout.VERTICAL
        contentContainer.gravity = Gravity.CENTER_VERTICAL
        contentContainer.layoutParams = LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        )

        // Setup Title
        titleView.text = titleText
        titleView.setTextColor(titleColor)
        titleView.textSize = 17f
        titleView.paint.isFakeBoldText = true

        // Setup Subtitle
        subtitleView.text = subtitleText
        subtitleView.setTextColor(subtitleColor)
        subtitleView.textSize = 13f
        subtitleView.setPadding(0, 6, 0, 0)

        contentContainer.addView(titleView)
        contentContainer.addView(subtitleView)
        hostLayout.addView(contentContainer)

        updateBackgroundDrawable()

        // 2. Click Handling & Event Dispatch
        hostLayout.setOnClickListener {
            if (isViewEnabled) {
                Click()
            }
        }

        // 3. Register standard Android Lifecycle Listeners with the Host Form
        container.\$form().registerForOnResume(this)
        container.\$form().registerForOnPause(this)
        container.\$form().registerForOnDestroy(this)

        // 4. Add this component view to the parent container
        container.\$add(this)
    }

    private fun updateBackgroundDrawable() {
        val drawable = GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            cornerRadius = cornerRadiusPx
            setColor(bannerBgColor)
        }
        hostLayout.background = drawable
    }

    // Mandatory override for AndroidViewComponent
    override fun getView(): View {
        return hostLayout
    }

    // --- Lifecycle Listeners ---
    override fun onResume() {
        // Called when the enclosing Android Activity / Form resumes
        // Resume animations, refresh banner data, or re-establish network state
    }

    override fun onPause() {
        // Called when the enclosing Android Activity / Form pauses
        // Pause active timers, animations, or transient background tasks
    }

    override fun onDestroy() {
        // Called when the enclosing Android Activity / Form is destroyed
        // Release listeners to prevent Activity memory leaks
        container.\$form().unregisterForOnResume(this)
        container.\$form().unregisterForOnPause(this)
        container.\$form().unregisterForOnDestroy(this)
    }

    // --- Simple Properties (Property Inspector) ---

    @DesignerProperty(editorType = PropertyTypeConstants.PROPERTY_TYPE_STRING, defaultValue = "${humanName}")
    @SimpleProperty(description = "The primary headline text displayed in the view")
    fun Title(value: String) {
        this.titleText = value
        titleView.text = value
    }

    @SimpleProperty
    fun Title(): String = this.titleText

    @DesignerProperty(editorType = PropertyTypeConstants.PROPERTY_TYPE_STRING, defaultValue = "Interactive custom view with lifecycle management")
    @SimpleProperty(description = "The supportive description or subtitle")
    fun Subtitle(value: String) {
        this.subtitleText = value
        subtitleView.text = value
    }

    @SimpleProperty
    fun Subtitle(): String = this.subtitleText

    @DesignerProperty(editorType = PropertyTypeConstants.PROPERTY_TYPE_COLOR, defaultValue = "&HFF6366F1")
    @SimpleProperty(description = "The background color of the view container")
    fun BackgroundColor(color: Int) {
        this.bannerBgColor = color
        updateBackgroundDrawable()
    }

    @SimpleProperty
    fun BackgroundColor(): Int = this.bannerBgColor

    @DesignerProperty(editorType = PropertyTypeConstants.PROPERTY_TYPE_COLOR, defaultValue = "&HFFFFFFFF")
    @SimpleProperty(description = "Text color of the headline")
    fun TitleColor(color: Int) {
        this.titleColor = color
        titleView.setTextColor(color)
    }

    @SimpleProperty
    fun TitleColor(): Int = this.titleColor

    @DesignerProperty(editorType = PropertyTypeConstants.PROPERTY_TYPE_FLOAT, defaultValue = "16")
    @SimpleProperty(description = "Corner radius of the view in dp")
    fun CornerRadius(radius: Float) {
        this.cornerRadiusPx = radius * 2.5f
        updateBackgroundDrawable()
    }

    @SimpleProperty
    fun CornerRadius(): Float = this.cornerRadiusPx / 2.5f

    @DesignerProperty(editorType = PropertyTypeConstants.PROPERTY_TYPE_BOOLEAN, defaultValue = "True")
    @SimpleProperty(description = "Whether the view is interactive and enabled")
    fun Enabled(enabled: Boolean) {
        this.isViewEnabled = enabled
        hostLayout.isEnabled = enabled
        hostLayout.alpha = if (enabled) 1.0f else 0.55f
    }

    @SimpleProperty
    fun Enabled(): Boolean = this.isViewEnabled

    // --- Simple Functions (Callable Logic Block Actions) ---

    @SimpleFunction(description = "Refreshes the view and redraws its UI content")
    fun Refresh() {
        titleView.text = this.titleText
        subtitleView.text = this.subtitleText
        updateBackgroundDrawable()
        OnRefreshed()
    }

    @SimpleFunction(description = "Updates the banner text and background color dynamically")
    fun UpdateContent(newTitle: String, newColorHex: String) {
        this.titleText = newTitle
        titleView.text = newTitle
        try {
            this.bannerBgColor = Color.parseColor(newColorHex)
            updateBackgroundDrawable()
        } catch (_: Exception) {}
        OnRefreshed()
    }

    // --- Simple Events (Logic Block Trigger Blocks) ---

    @SimpleEvent(description = "Triggered when user clicks or taps on the view")
    fun Click() {
        EventDispatcher.dispatchEvent(this, "Click")
    }

    @SimpleEvent(description = "Triggered when the view completes a refresh operation")
    fun OnRefreshed() {
        EventDispatcher.dispatchEvent(this, "OnRefreshed")
    }
}
`;

  const requiredLibraries: CustomComponentRequiredLib[] = [
    {
      id: "lib_compose_m3",
      name: "Compose Material 3",
      group: "androidx.compose.material3",
      artifact: "material3",
      version: "1.3.1",
      description: "Material 3 tokens, surface and colors",
      required: true,
      category: "Compose" as const,
    },
  ];

  return {
    code,
    typeId,
    name: humanName,
    suggestedName: humanName,
    suggestedTypeId: typeId,
    suggestedCategory: category,
    isContainer: Boolean(options.isContainer),
    category,
    description,
    requiredLibraries,
    recommendedLibraries: requiredLibraries,
    permissions: ["android.permission.INTERNET", "android.permission.ACCESS_NETWORK_STATE"],
  };
}
