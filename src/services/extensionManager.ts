import JSZip from "jszip";
import {
  ComponentLogicMeta,
  ComponentPropertyDef,
  ComponentEventDef,
  ComponentFunctionDef,
  registerCustomComponentLogicMeta
} from "../data/componentLogicMetadata";
import { ComponentCategory } from "../types";

export interface AixComponentProperty {
  name: string;
  editorType: string;
  defaultValue?: string;
  description?: string;
}

export interface AixComponentParameter {
  name: string;
  type: string;
}

export interface AixComponentMethod {
  name: string;
  description?: string;
  params: AixComponentParameter[];
  returnType?: string;
}

export interface AixComponentEvent {
  name: string;
  description?: string;
  params: AixComponentParameter[];
}

export interface AixComponentDescriptor {
  type: string;
  name: string;
  categoryString?: string;
  helpString?: string;
  showOnPalette?: boolean;
  nonVisible?: boolean;
  iconName?: string;
  properties?: AixComponentProperty[];
  blockProperties?: AixComponentProperty[];
  events?: AixComponentEvent[];
  methods?: AixComponentMethod[];
  permissions?: string[];
  libraries?: string[];
  nativeLibraries?: string[];
}

export interface ExtensionValidationResult {
  valid: boolean;
  componentName: string;
  version?: string;
  author?: string;
  warnings: string[];
  errors: string[];
  permissions: string[];
  descriptor?: AixComponentDescriptor;
}

export class ExtensionManager {
  private static prohibitedPermissions = new Set([
    "android.permission.BIND_ACCESSIBILITY_SERVICE",
    "android.permission.BIND_DEVICE_ADMIN",
    "android.permission.WRITE_SECURE_SETTINGS",
    "android.permission.INSTALL_PACKAGES"
  ]);

  /**
   * Safely imports and verifies an MIT App Inventor / Kodular .aix extension file
   */
  public static async importAixExtension(
    aixBuffer: Buffer | ArrayBuffer
  ): Promise<ExtensionValidationResult> {
    const warnings: string[] = [];
    const errors: string[] = [];
    const permissions: string[] = [];

    try {
      const zip = await JSZip.loadAsync(aixBuffer);

      // 1. Locate components.json
      let descriptorFile: any = null;
      zip.forEach((relativePath, file) => {
        if (relativePath.endsWith("components.json") || relativePath.endsWith("component.json")) {
          descriptorFile = file;
        }
      });

      if (!descriptorFile) {
        return {
          valid: false,
          componentName: "Unknown",
          warnings,
          errors: ["Invalid AIX package: Missing components.json descriptor archive."],
          permissions: []
        };
      }

      const descriptorText = await (descriptorFile as any).async("text");
      let parsedDescriptors: AixComponentDescriptor[] = [];

      try {
        const rawJson = JSON.parse(descriptorText);
        parsedDescriptors = Array.isArray(rawJson) ? rawJson : [rawJson];
      } catch (e: any) {
        return {
          valid: false,
          componentName: "Corrupted",
          warnings,
          errors: [`Malformed components.json JSON schema: ${e?.message}`],
          permissions: []
        };
      }

      if (parsedDescriptors.length === 0) {
        return {
          valid: false,
          componentName: "Empty",
          warnings,
          errors: ["No valid component descriptors found in AIX."],
          permissions: []
        };
      }

      const desc = parsedDescriptors[0];
      const compName = desc.name || desc.type.split(".").pop() || "ExtensionComponent";

      // 2. Security validation: Check requested permissions
      if (desc.permissions) {
        for (const perm of desc.permissions) {
          permissions.push(perm);
          if (this.prohibitedPermissions.has(perm)) {
            errors.push(`Security Alert: Extension requests high-risk permission '${perm}'. Rejected for safety.`);
          }
        }
      }

      // 3. Security validation: Check for suspicious native binaries
      zip.forEach((path) => {
        if (path.endsWith(".so")) {
          warnings.push(`Native dynamic library detected (${path}). Ensure target ABI arm64-v8a compatibility.`);
        }
      });

      if (errors.length > 0) {
        return {
          valid: false,
          componentName: compName,
          warnings,
          errors,
          permissions,
          descriptor: desc
        };
      }

      // 4. Register into DroidForge Studio Component Logic Metadata
      const supportedProperties: ComponentPropertyDef[] = (desc.properties || []).map((p) => {
        let pType: ComponentPropertyDef["type"] = "string";
        if (p.editorType?.toLowerCase().includes("boolean")) pType = "boolean";
        else if (p.editorType?.toLowerCase().includes("number") || p.editorType?.toLowerCase().includes("integer")) pType = "number";
        else if (p.editorType?.toLowerCase().includes("color")) pType = "color";

        return {
          name: p.name,
          label: p.name,
          type: pType,
          defaultValue: p.defaultValue ?? "",
          description: p.description || `Property ${p.name}`
        };
      });

      const supportedEvents: ComponentEventDef[] = (desc.events || []).map((e) => ({
        id: e.name,
        name: e.name,
        category: "sensor",
        description: e.description || `Event ${e.name}`,
        outputs: (e.params || []).map((param) => ({
          name: param.name,
          type: (param.type === "int" || param.type === "long") ? "Int" : param.type === "boolean" ? "Boolean" : "String",
          description: `Parameter ${param.name}`
        })),
        badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40"
      }));

      const supportedFunctions: ComponentFunctionDef[] = (desc.methods || []).map((m) => ({
        id: m.name,
        name: m.name,
        description: m.description || `Method ${m.name}`,
        params: (m.params || []).map((param) => ({
          name: param.name,
          type: param.type || "String"
        }))
      }));

      const logicMeta: ComponentLogicMeta = {
        componentType: compName,
        label: compName,
        category: (desc.categoryString || "Dynamic Components") as ComponentCategory,
        iconName: desc.iconName || "Extension",
        description: desc.helpString || `Imported AIX Extension: ${compName}`,
        kind: desc.nonVisible !== false ? "NON_VISIBLE" : "VISIBLE",
        permissions: desc.permissions || [],
        supportedEvents,
        supportedProperties,
        supportedFunctions,
        recommendedActions: ["toast", "setProperty", "setVariable"]
      };

      registerCustomComponentLogicMeta(logicMeta);

      return {
        valid: true,
        componentName: compName,
        warnings,
        errors: [],
        permissions,
        descriptor: desc
      };
    } catch (err: any) {
      return {
        valid: false,
        componentName: "Error",
        warnings,
        errors: [`Failed to unpack or inspect AIX archive: ${err?.message}`],
        permissions: []
      };
    }
  }
}
