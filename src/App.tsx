import React, { useState, useCallback, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { ComponentPalette } from "./components/VisualEditor/ComponentPalette";
import { Canvas } from "./components/VisualEditor/Canvas";
import { PropertiesPanel } from "./components/VisualEditor/PropertiesPanel";
import { LogicBlocksEditor } from "./components/VisualEditor/LogicBlocksEditor";
import { CodePreview } from "./components/CodeStudio/CodePreview";
import { AppPropertiesPanel, PropertyTab } from "./components/AppProperties/AppPropertiesPanel";
import { AiBuilderModal } from "./components/Modals/AiBuilderModal";
import { BuildApkModal } from "./components/Modals/BuildApkModal";
import { AppPropertiesModal } from "./components/Modals/AppPropertiesModal";
import { DashboardView } from "./components/Dashboard/DashboardView";
import { CreateAppModal } from "./components/Dashboard/CreateAppModal";
import { TemplatesModal } from "./components/Dashboard/TemplatesModal";
import { BuilderSettingsModal } from "./components/Modals/BuilderSettingsModal";
import { ScreenManagerModal } from "./components/Modals/ScreenManagerModal";
import { NewScreenModal } from "./components/Modals/NewScreenModal";
import { RenameScreenModal } from "./components/Modals/RenameScreenModal";
import { DeleteScreenModal } from "./components/Modals/DeleteScreenModal";
import { CustomComponentModal } from "./components/Modals/CustomComponentModal";
import { LiveTestModal } from "./components/Modals/LiveTestModal";
import { UserProfileModal } from "./components/Modals/UserProfileModal";
import { AuthModal } from "./components/Modals/AuthModal";
import { CompanionLiveRunner } from "./components/CompanionLiveRunner";
import { PREBUILT_CUSTOM_COMPONENTS } from "./data/defaultCustomComponents";
import { registerCustomComponent } from "./data/componentRegistry";

import {
  ScreenTemplateId,
  cloneScreen,
  createScreenFromTemplate,
  copyScreenToClipboard,
  getCopiedScreenFromClipboard,
  hasCopiedScreen,
} from "./utils/screenManager";
import { loadUserProfile, saveUserProfile, logoutAccount } from "./utils/profileManager";

import {
  ActiveTab,
  DeviceType,
  Orientation,
  AndroidScreen,
  AndroidComponent,
  ProjectConfig,
  ProjectAsset,
  LogicBlock,
  StateVariable,
  SavedProject,
  ProjectSnapshot,
  BuilderIdeSettings,
  ScreenProperties,
  UserProfile,
} from "./types";
import {
  DEFAULT_PROJECT_CONFIG,
  INITIAL_SCREENS,
  INITIAL_ASSETS,
} from "./data/initialData";
import { DEFAULT_SAVED_PROJECTS } from "./data/defaultProjects";
import { COMPONENT_DEFINITIONS } from "./data/componentRegistry";
import { exportAndroidStudioZip } from "./utils/codeGenerators";
import { loadStoredSnapshots } from "./utils/versionControl";
import {
  loadBuilderSettings,
  saveBuilderSettings,
  resetBuilderSettings,
  THEME_PREVIEW_MAP,
  ACCENT_COLOR_MAP,
  DEFAULT_CUSTOM_THEME_COLORS,
} from "./lib/builderSettings";

const STORAGE_KEY = "droidforge_saved_projects_v2";

const getInitialProjects = (): SavedProject[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed loading saved projects", e);
  }
  return DEFAULT_SAVED_PROJECTS;
};

export default function App() {
  const isCompanionMode =
    typeof window !== "undefined" &&
    (window.location.search.includes("mode=companion") ||
      window.location.search.includes("companion=true") ||
      window.location.pathname.includes("companion"));

  if (isCompanionMode) {
    return <CompanionLiveRunner />;
  }

  // Navigation & Viewport State - default to dashboard as requested by user
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [deviceType, setDeviceType] = useState<DeviceType>("phone");
  const [orientation, setOrientation] = useState<Orientation>("portrait");

  // Project Library & Dashboard Management
  const [projects, setProjects] = useState<SavedProject[]>(getInitialProjects);
  const [currentProjectId, setCurrentProjectId] = useState<string>(() => {
    const initial = getInitialProjects();
    return initial[3]?.id || initial[0]?.id || "proj_quickforge_pro";
  });
  const [isCreateAppOpen, setIsCreateAppOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);

  // Core Data Models
  const [config, setConfig] = useState<ProjectConfig>(() => {
    const initial = getInitialProjects();
    const curr = initial.find((p) => p.id === (initial[3]?.id || initial[0]?.id));
    return curr?.config || DEFAULT_PROJECT_CONFIG;
  });
  const [screens, setScreens] = useState<AndroidScreen[]>(() => {
    const initial = getInitialProjects();
    const curr = initial.find((p) => p.id === (initial[3]?.id || initial[0]?.id));
    return curr?.screens || INITIAL_SCREENS;
  });
  const [currentScreenId, setCurrentScreenId] = useState<string>(() => {
    const initial = getInitialProjects();
    const curr = initial.find((p) => p.id === (initial[3]?.id || initial[0]?.id));
    return curr?.screens[0]?.id || INITIAL_SCREENS[0]?.id || "screen_home";
  });
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(() => {
    const initial = getInitialProjects();
    const curr = initial.find((p) => p.id === (initial[3]?.id || initial[0]?.id));
    return curr?.screens[0]?.rootComponent?.id || INITIAL_SCREENS[0]?.rootComponent?.id || null;
  });
  const [assets, setAssets] = useState<ProjectAsset[]>(() => {
    const initial = getInitialProjects();
    const curr = initial.find((p) => p.id === (initial[3]?.id || initial[0]?.id));
    return curr?.assets || INITIAL_ASSETS;
  });

  // Undo / Redo History
  const [history, setHistory] = useState<AndroidScreen[][]>([screens]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Modals & AI State
  const [userProfile, setUserProfile] = useState<UserProfile>(loadUserProfile);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");
  const [isAiBuilderOpen, setIsAiBuilderOpen] = useState(false);
  const [isLiveTestOpen, setIsLiveTestOpen] = useState(false);
  const [isBuildModalOpen, setIsBuildModalOpen] = useState(false);

  const handleOpenAuth = (mode: "login" | "register" = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLogout = () => {
    const updated = logoutAccount(userProfile);
    setUserProfile(updated);
  };

  // Auto-sync live project state to Companion receiver whenever config, screens, or active screen changes
  useEffect(() => {
    fetch("/api/companion/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config, screens, currentScreenId }),
    }).catch((e) => console.warn("Live companion auto-sync error:", e));
  }, [config, screens, currentScreenId]);
  const [isAppPropertiesOpen, setIsAppPropertiesOpen] = useState(false);
  const [propertiesSubTab, setPropertiesSubTab] = useState<PropertyTab>("general");
  const [isBuilderSettingsOpen, setIsBuilderSettingsOpen] = useState(false);
  const [isScreenManagerOpen, setIsScreenManagerOpen] = useState(false);
  const [screenManagerInitialMode, setScreenManagerInitialMode] = useState<"list" | "create">("list");
  const [isNewScreenModalOpen, setIsNewScreenModalOpen] = useState(false);
  const [isRenameScreenModalOpen, setIsRenameScreenModalOpen] = useState(false);
  const [screenToRename, setScreenToRename] = useState<AndroidScreen | null>(null);
  const [isDeleteScreenModalOpen, setIsDeleteScreenModalOpen] = useState(false);
  const [screenToDelete, setScreenToDelete] = useState<AndroidScreen | null>(null);
  const [hasCopiedScreenState, setHasCopiedScreenState] = useState<boolean>(() => hasCopiedScreen());
  const [isExporting, setIsExporting] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState("");
  const [activeRailTab, setActiveRailTab] = useState<string>("components");
  const [logicTargetComponentId, setLogicTargetComponentId] = useState<string | null>(null);

  // Custom Component Maker Studio State
  const [customComponents, setCustomComponents] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("droidforge_custom_components_v3");
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [];
  });
  const [isCustomComponentModalOpen, setIsCustomComponentModalOpen] = useState(false);
  const [editingCustomComponent, setEditingCustomComponent] = useState<any | null>(null);

  // Register custom components in registry on startup & update
  useEffect(() => {
    customComponents.forEach((c) => {
      registerCustomComponent(c as any);
    });
    try {
      localStorage.setItem("droidforge_custom_components_v3", JSON.stringify(customComponents));
    } catch {
      // ignore
    }
  }, [customComponents]);

  const handleOpenCustomComponentModal = (existing?: any | null) => {
    setEditingCustomComponent(existing || null);
    setIsCustomComponentModalOpen(true);
  };

  const handleSaveCustomComponent = (compDef: any, insertIntoScreen?: boolean) => {
    setCustomComponents((prev) => {
      const idx = prev.findIndex((c) => c.type === compDef.type || c.id === compDef.id);
      let next: any[];
      if (idx !== -1) {
        next = [...prev];
        next[idx] = compDef;
      } else {
        next = [...prev, compDef];
      }
      return next;
    });

    // Register in component registry for live palette search & canvas creation
    registerCustomComponent(compDef);

    // Auto-link dependencies to project config
    if (compDef.requiredLibraries && compDef.requiredLibraries.length > 0) {
      setConfig((prevConfig) => {
        const existingDeps = prevConfig.dependencies || [];
        const newDeps = [...existingDeps];

        compDef.requiredLibraries.forEach((lib: any) => {
          if (!newDeps.some((d) => d.group === lib.group && d.artifact === lib.artifact)) {
            newDeps.push({
              id: lib.id,
              name: lib.name,
              group: lib.group,
              artifact: lib.artifact,
              version: lib.version,
              category: lib.category,
            });
          }
        });

        const next = { ...prevConfig, dependencies: newDeps };
        syncActiveProject(next);
        return next;
      });
    }

    setIsCustomComponentModalOpen(false);

    if (insertIntoScreen) {
      handleAddComponentToScreen(compDef.type);
    }
  };

  const handleDeleteCustomComponent = (id: string) => {
    setCustomComponents((prev) => {
      const next = prev.filter((c) => c.id !== id && c.type !== id);
      try {
        localStorage.setItem("droidforge_custom_components_v3", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };



  // Dedicated Builder IDE Settings (strictly isolated from user's Android project)
  const [builderSettings, setBuilderSettings] = useState<BuilderIdeSettings>(() =>
    loadBuilderSettings()
  );

  const handleUpdateBuilderSettings = (updates: Partial<BuilderIdeSettings>) => {
    setBuilderSettings((prev) => {
      const next = { ...prev, ...updates };
      saveBuilderSettings(next);
      return next;
    });
  };

  const handleResetBuilderSettings = () => {
    const defaults = resetBuilderSettings();
    setBuilderSettings(defaults);
  };

  // Sync builder theme, font, tab, and custom palette settings dynamically to document root
  useEffect(() => {
    const isCustom = builderSettings.theme === "custom";
    const custom = builderSettings.customThemeColors || DEFAULT_CUSTOM_THEME_COLORS;

    const baseTheme = THEME_PREVIEW_MAP[builderSettings.theme] || THEME_PREVIEW_MAP.slate;
    const themeConfig = isCustom
      ? {
          name: "Custom Studio",
          desc: "User defined palette",
          shellBg: custom.shellBg || "#0F172A",
          cardBg: custom.cardBg || "#1E293B",
          cardInnerBg: custom.cardInnerBg || "#0F172A",
          textColor: custom.textColor || "#F8FAFC",
          textMuted: custom.textMutedColor || "#94A3B8",
          border: custom.borderColor || "#334155",
        }
      : baseTheme;

    const baseAccent = ACCENT_COLOR_MAP[builderSettings.accentColor] || ACCENT_COLOR_MAP.indigo;
    const accentHex = isCustom && custom.accentColor ? custom.accentColor : baseAccent.hex;
    const accentText = isCustom && custom.accentTextColor ? custom.accentTextColor : "#FFFFFF";

    // Tab Bar colors
    const isDark = builderSettings.theme !== "light";
    const tabBarBg = isCustom && custom.tabBarBg
      ? custom.tabBarBg
      : isDark
      ? "rgba(15, 23, 42, 0.75)"
      : "rgba(241, 245, 249, 0.9)";

    const tabActiveBg = isCustom && custom.tabActiveBg
      ? custom.tabActiveBg
      : isDark
      ? accentHex
      : "#FFFFFF";

    const tabActiveText = isCustom && custom.tabActiveText
      ? custom.tabActiveText
      : isDark
      ? "#FFFFFF"
      : "#4C1D95";

    const tabInactiveText = isCustom && custom.tabInactiveText
      ? custom.tabInactiveText
      : themeConfig.textMuted;

    const tabIndicator = isCustom && custom.tabIndicatorColor
      ? custom.tabIndicatorColor
      : accentHex;

    const fontFamilies: Record<string, string> = {
      system: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      "plus-jakarta": '"Plus Jakarta Sans", system-ui, sans-serif',
      inter: '"Inter", system-ui, sans-serif',
      jetbrains: '"JetBrains Mono", monospace',
      outfit: '"Outfit", system-ui, sans-serif',
    };

    const targets: HTMLElement[] = [
      document.documentElement,
      document.body,
      document.getElementById("droidforge-app-root"),
    ].filter(Boolean) as HTMLElement[];

    targets.forEach((el) => {
      el.style.setProperty("--ide-shell-bg", themeConfig.shellBg);
      el.style.setProperty("--ide-card-bg", themeConfig.cardBg);
      el.style.setProperty("--ide-card-inner-bg", themeConfig.cardInnerBg || themeConfig.shellBg);
      el.style.setProperty("--ide-text", themeConfig.textColor);
      el.style.setProperty("--ide-text-muted", themeConfig.textMuted || "#94A3B8");
      el.style.setProperty("--ide-border", themeConfig.border);
      el.style.setProperty("--ide-accent", accentHex);
      el.style.setProperty("--ide-accent-text", accentText);
      el.style.setProperty("--ide-tab-bar-bg", tabBarBg);
      el.style.setProperty("--ide-tab-active-bg", tabActiveBg);
      el.style.setProperty("--ide-tab-active-text", tabActiveText);
      el.style.setProperty("--ide-tab-inactive-text", tabInactiveText);
      el.style.setProperty("--ide-tab-indicator", tabIndicator);
      el.style.setProperty("--ide-font-family", fontFamilies[builderSettings.uiFont] || fontFamilies.system);
      el.style.fontFamily = fontFamilies[builderSettings.uiFont] || fontFamilies.system;
    });
  }, [builderSettings.theme, builderSettings.accentColor, builderSettings.uiFont, builderSettings.customThemeColors]);

  // Keyboard shortcut Ctrl+, or Cmd+, to toggle Builder Settings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ",") {
        e.preventDefault();
        setIsBuilderSettingsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Sync projects to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
      console.error("Failed to save projects to localStorage", e);
    }
  }, [projects]);

  // Keep active project in projects list in sync with current state changes
  const syncActiveProject = useCallback(
    (newConfig?: ProjectConfig, newScreens?: AndroidScreen[], newAssets?: ProjectAsset[]) => {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === currentProjectId) {
            return {
              ...p,
              config: newConfig || p.config,
              screens: newScreens || p.screens,
              assets: newAssets || p.assets,
              name: newConfig?.appName || p.name,
              packageName: newConfig?.packageName || p.packageName,
              screensCount: (newScreens || p.screens).length,
              updatedAt: "Just now",
            };
          }
          return p;
        })
      );
    },
    [currentProjectId]
  );

  const handleUpdateConfig = (updates: Partial<ProjectConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...updates };
      syncActiveProject(next);
      return next;
    });
  };

  const handleOpenProject = (project: SavedProject) => {
    setCurrentProjectId(project.id);
    setConfig(project.config);
    setScreens(project.screens);
    setCurrentScreenId(project.screens[0]?.id || "screen_home");
    setSelectedComponentId(project.screens[0]?.rootComponent?.id || null);
    setAssets(project.assets || INITIAL_ASSETS);
    setHistory([project.screens]);
    setHistoryIndex(0);
    setActiveTab("canvas");
  };

  const handleCreateProject = (newProject: SavedProject) => {
    setProjects((prev) => [newProject, ...prev]);
    handleOpenProject(newProject);
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (currentProjectId === projectId) {
      const remaining = projects.filter((p) => p.id !== projectId);
      if (remaining.length > 0) {
        handleOpenProject(remaining[0]);
      }
    }
  };

  const handleDuplicateProject = (project: SavedProject) => {
    const cloned: SavedProject = {
      ...project,
      id: `proj_${Date.now()}`,
      name: `${project.name} (Copy)`,
      packageName: `${project.packageName}.copy`,
      status: "Draft",
      updatedAt: "Just now",
      createdAt: new Date().toISOString().split("T")[0],
      config: {
        ...project.config,
        appName: `${project.config.appName} (Copy)`,
        packageName: `${project.config.packageName}.copy`,
      },
    };
    setProjects((prev) => [cloned, ...prev]);
  };

  const handleDownloadProjectZip = async (project: SavedProject) => {
    setIsExporting(true);
    try {
      await exportAndroidStudioZip(project.config, project.screens, project.assets);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportProjects = (importedProjects: SavedProject[], openFirst = false) => {
    setProjects((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const sanitized = importedProjects.map((p, index) => {
        let uniqueId = p.id;
        if (!uniqueId || existingIds.has(uniqueId)) {
          uniqueId = `proj_imported_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`;
        }
        return {
          ...p,
          id: uniqueId,
          updatedAt: "Just now",
        };
      });
      return [...sanitized, ...prev];
    });

    if (openFirst && importedProjects.length > 0) {
      handleOpenProject(importedProjects[0]);
    }
  };

  // Version Control & Snapshots State
  const [snapshots, setSnapshots] = useState<ProjectSnapshot[]>(() =>
    loadStoredSnapshots(config, screens, assets, projects, currentProjectId)
  );

  const handleRestoreSnapshot = (snapshot: ProjectSnapshot) => {
    setConfig(snapshot.configSnapshot);
    setScreens(snapshot.screensSnapshot);
    setCurrentScreenId(snapshot.screensSnapshot[0]?.id || "screen_home");
    setSelectedComponentId(snapshot.screensSnapshot[0]?.rootComponent?.id || null);
    if (snapshot.assetsSnapshot) {
      setAssets(snapshot.assetsSnapshot);
    }
    syncActiveProject(snapshot.configSnapshot, snapshot.screensSnapshot, snapshot.assetsSnapshot);
    setHistory([snapshot.screensSnapshot]);
    setHistoryIndex(0);
    setActiveTab("canvas");
  };

  const handleForkSnapshotAsNewApp = (snapshot: ProjectSnapshot) => {
    const newApp: SavedProject = {
      id: `proj_fork_${Date.now()}`,
      name: `${snapshot.configSnapshot.appName} (${snapshot.versionTag})`,
      packageName: `${snapshot.configSnapshot.packageName}.fork`,
      category: "Android App",
      status: "Draft",
      gradient: "from-violet-600 via-indigo-600 to-blue-600",
      updatedAt: "Just now",
      createdAt: new Date().toISOString().split("T")[0],
      screensCount: snapshot.screensSnapshot.length,
      deploymentsCount: 0,
      viewsCount: "0",
      config: {
        ...snapshot.configSnapshot,
        appName: `${snapshot.configSnapshot.appName} (${snapshot.versionTag})`,
        packageName: `${snapshot.configSnapshot.packageName}.fork`,
      },
      screens: snapshot.screensSnapshot,
      assets: snapshot.assetsSnapshot || INITIAL_ASSETS,
    };
    setProjects((prev) => [newApp, ...prev]);
    handleOpenProject(newApp);
  };

  const currentScreen =
    screens.find((s) => s.id === currentScreenId) || screens[0] || INITIAL_SCREENS[0];

  // Helper to commit new screens state to history
  const pushScreensState = useCallback(
    (newScreens: AndroidScreen[]) => {
      const nextHistory = history.slice(0, historyIndex + 1);
      nextHistory.push(newScreens);
      setHistory(nextHistory);
      setHistoryIndex(nextHistory.length - 1);
      setScreens(newScreens);
      syncActiveProject(undefined, newScreens);
    },
    [history, historyIndex, syncActiveProject]
  );

  const handleUndo = () => {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      setScreens(history[nextIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setScreens(history[nextIndex]);
    }
  };

  // Find component in tree
  const findComponentInTree = (
    root: AndroidComponent,
    id: string
  ): AndroidComponent | null => {
    if (root.id === id) return root;
    if (root.children) {
      for (const child of root.children) {
        const found = findComponentInTree(child, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Mutate component tree immutably
  const updateTree = (
    root: AndroidComponent,
    targetId: string,
    transform: (comp: AndroidComponent) => AndroidComponent | null
  ): AndroidComponent | null => {
    if (root.id === targetId) {
      return transform(root);
    }
    if (root.children) {
      const updatedChildren: AndroidComponent[] = [];
      for (const child of root.children) {
        const res = updateTree(child, targetId, transform);
        if (res !== null) {
          updatedChildren.push(res);
        }
      }
      return { ...root, children: updatedChildren };
    }
    return root;
  };

  // Add component to current screen
  // Add component to current screen
  const handleAddComponentToScreen = (
    type: string,
    targetContainerId?: string,
    position: "before" | "after" = "after"
  ) => {
    const def = COMPONENT_DEFINITIONS.find((d) => d.type === type);

    // Count how many components of this type already exist in the screen to generate a clean, sequential name (e.g. TextLabel1, TextLabel2)
    let existingCount = 0;
    const countType = (c: AndroidComponent) => {
      if (c.type === type) existingCount++;
      if (c.children && Array.isArray(c.children)) c.children.forEach(countType);
    };
    if (currentScreen?.rootComponent) {
      countType(currentScreen.rootComponent);
    }

    const indexNumber = existingCount + 1;
    const cleanTypeName = type.replace(/[^a-zA-Z0-9]/g, "");
    const newName = `${cleanTypeName}${indexNumber}`;
    const newId = `comp_${type.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${indexNumber}_${Date.now().toString().slice(-4)}`;

    const isNewContainer =
      def?.isContainer ||
      def?.category === "Layouts" ||
      def?.category === "Layout & Containers" ||
      type.includes("Layout") ||
      type === "Card" ||
      type === "ScrollView" ||
      type === "Row" ||
      type === "Column";

    const newComponent: AndroidComponent = {
      id: newId,
      type,
      name: newName,
      category: def?.category || "Basic UI",
      props: { ...(def?.defaultProps || {}) },
      children: isNewContainer ? [] : undefined,
    };

    // Helper to check if a component is a container layout
    const isContainerNode = (c: AndroidComponent): boolean => {
      if (!c) return false;
      if (c.id === currentScreen.rootComponent.id) return true;
      const d = COMPONENT_DEFINITIONS.find((def) => def.type === c.type);
      return (
        c.children !== undefined ||
        d?.isContainer === true ||
        d?.category === "Layouts" ||
        d?.category === "Layout & Containers" ||
        c.type.includes("Layout") ||
        c.type === "Card" ||
        c.type === "ScrollView" ||
        c.type === "Row" ||
        c.type === "Column"
      );
    };

    // Helper to find parent container of any target component ID
    const findParentContainerId = (parent: AndroidComponent, targetId: string): string | null => {
      if (!parent.children) return null;
      for (const child of parent.children) {
        if (child.id === targetId) return parent.id;
        const res = findParentContainerId(child, targetId);
        if (res) return res;
      }
      return null;
    };

    // Determine final container ID and reference ID to insert relative to
    let finalContainerId: string = currentScreen.rootComponent.id;
    let insertRefId: string | null = null;

    if (targetContainerId) {
      const dropTargetComp = findComponentInTree(currentScreen.rootComponent, targetContainerId);
      if (dropTargetComp) {
        if (isContainerNode(dropTargetComp)) {
          finalContainerId = dropTargetComp.id;
          insertRefId = null;
        } else {
          const parentId = findParentContainerId(currentScreen.rootComponent, targetContainerId);
          finalContainerId = parentId || currentScreen.rootComponent.id;
          insertRefId = targetContainerId;
        }
      }
    } else if (selectedComponentId) {
      const selComp = findComponentInTree(currentScreen.rootComponent, selectedComponentId);
      if (selComp) {
        if (isContainerNode(selComp)) {
          finalContainerId = selComp.id;
          insertRefId = null;
        } else {
          const parentId = findParentContainerId(currentScreen.rootComponent, selectedComponentId);
          finalContainerId = parentId || currentScreen.rootComponent.id;
          insertRefId = selectedComponentId;
        }
      }
    }

    const updatedRoot = updateTree(currentScreen.rootComponent, finalContainerId, (target) => {
      const targetChildren = target.children || [];
      const refId = insertRefId || (selectedComponentId && targetChildren.some((c) => c.id === selectedComponentId) ? selectedComponentId : null);
      const refIdx = refId ? targetChildren.findIndex((c) => c.id === refId) : -1;

      if (refIdx !== -1) {
        const nextChildren = [...targetChildren];
        const splicePos = position === "before" ? refIdx : refIdx + 1;
        nextChildren.splice(splicePos, 0, newComponent);
        return { ...target, children: nextChildren };
      }

      return { ...target, children: [...targetChildren, newComponent] };
    });

    if (updatedRoot) {
      const updatedScreens = screens.map((s) =>
        s.id === currentScreen.id ? { ...s, rootComponent: updatedRoot } : s
      );
      pushScreensState(updatedScreens);
      setSelectedComponentId(newId);
    }
  };

  // Update component props
  const handleUpdateComponentProps = (
    id: string,
    newProps: Record<string, any>
  ) => {
    const updatedRoot = updateTree(currentScreen.rootComponent, id, (comp) => ({
      ...comp,
      props: { ...comp.props, ...newProps },
    }));

    if (updatedRoot) {
      const updatedScreens = screens.map((s) =>
        s.id === currentScreen.id ? { ...s, rootComponent: updatedRoot } : s
      );
      pushScreensState(updatedScreens);
    }
  };

  // Update component variable name
  const handleUpdateComponentName = (id: string, newName: string) => {
    const updatedRoot = updateTree(currentScreen.rootComponent, id, (comp) => ({
      ...comp,
      name: newName,
    }));

    if (updatedRoot) {
      const updatedScreens = screens.map((s) =>
        s.id === currentScreen.id ? { ...s, rootComponent: updatedRoot } : s
      );
      pushScreensState(updatedScreens);
    }
  };

  // Delete component
  const handleDeleteComponent = (id: string) => {
    if (id === currentScreen.rootComponent.id) return; // Cannot delete root
    const updatedRoot = updateTree(currentScreen.rootComponent, id, () => null);

    if (updatedRoot) {
      const updatedScreens = screens.map((s) =>
        s.id === currentScreen.id ? { ...s, rootComponent: updatedRoot } : s
      );
      pushScreensState(updatedScreens);
      setSelectedComponentId(null);
    }
  };

  // Duplicate component
  const handleDuplicateComponent = (id: string) => {
    const orig = findComponentInTree(currentScreen.rootComponent, id);
    if (!orig || id === currentScreen.rootComponent.id) return;

    const cloned: AndroidComponent = {
      ...orig,
      id: `comp_${orig.type.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now()}`,
      name: `${orig.name}Copy`,
      props: { ...orig.props },
    };

    // Insert as sibling
    const updatedScreens = screens.map((s) => {
      if (s.id !== currentScreen.id) return s;

      const addSibling = (parent: AndroidComponent): AndroidComponent => {
        if (parent.children && parent.children.some((c) => c.id === id)) {
          const idx = parent.children.findIndex((c) => c.id === id);
          const newChildren = [...parent.children];
          newChildren.splice(idx + 1, 0, cloned);
          return { ...parent, children: newChildren };
        }
        if (parent.children) {
          return { ...parent, children: parent.children.map(addSibling) };
        }
        return parent;
      };

      return { ...s, rootComponent: addSibling(s.rootComponent) };
    });

    pushScreensState(updatedScreens);
    setSelectedComponentId(cloned.id);
  };

  // Move component up/down in parent list
  const handleMoveComponent = (id: string, direction: "up" | "down") => {
    const updatedScreens = screens.map((s) => {
      if (s.id !== currentScreen.id) return s;

      const reorder = (parent: AndroidComponent): AndroidComponent => {
        if (parent.children && parent.children.some((c) => c.id === id)) {
          const idx = parent.children.findIndex((c) => c.id === id);
          const targetIdx = direction === "up" ? idx - 1 : idx + 1;
          if (targetIdx >= 0 && targetIdx < parent.children.length) {
            const copy = [...parent.children];
            const temp = copy[idx];
            copy[idx] = copy[targetIdx];
            copy[targetIdx] = temp;
            return { ...parent, children: copy };
          }
        }
        if (parent.children) {
          return { ...parent, children: parent.children.map(reorder) };
        }
        return parent;
      };

      return { ...s, rootComponent: reorder(s.rootComponent) };
    });

    pushScreensState(updatedScreens);
  };

  // Reorder canvas components by drag-and-drop
  const handleReorderCanvasComponent = (
    draggedId: string,
    targetId: string,
    position: "before" | "after" = "after"
  ) => {
    if (!draggedId || !targetId || draggedId === targetId) return;
    if (draggedId === currentScreen.rootComponent.id) return;

    const updatedScreens = screens.map((s) => {
      if (s.id !== currentScreen.id) return s;

      let draggedComp: AndroidComponent | null = null;
      const removeComp = (node: AndroidComponent): AndroidComponent => {
        if (!node.children) return node;
        const found = node.children.find((c) => c.id === draggedId);
        if (found) {
          draggedComp = found;
          return {
            ...node,
            children: node.children.filter((c) => c.id !== draggedId),
          };
        }
        return { ...node, children: node.children.map(removeComp) };
      };

      const treeWithoutDragged = removeComp(s.rootComponent);
      if (!draggedComp) return s;

      const findParentContainer = (parent: AndroidComponent, id: string): AndroidComponent | null => {
        if (!parent.children) return null;
        if (parent.children.some((c) => c.id === id)) return parent;
        for (const child of parent.children) {
          const res = findParentContainer(child, id);
          if (res) return res;
        }
        return null;
      };

      const isContainer = (c: AndroidComponent): boolean => {
        if (!c) return false;
        if (c.id === s.rootComponent.id) return true;
        const d = COMPONENT_DEFINITIONS.find((def) => def.type === c.type);
        return (
          c.children !== undefined ||
          d?.isContainer === true ||
          d?.category === "Layouts" ||
          d?.category === "Layout & Containers" ||
          c.type.includes("Layout") ||
          c.type === "Card" ||
          c.type === "ScrollView" ||
          c.type === "Row" ||
          c.type === "Column"
        );
      };

      const targetComp = findComponentInTree(treeWithoutDragged, targetId);
      let destContainerId = s.rootComponent.id;
      let insertTargetId: string | null = null;
      let insertBeforeFlag = position === "before";

      if (targetComp) {
        if (isContainer(targetComp)) {
          destContainerId = targetComp.id;
          insertTargetId = null;
        } else {
          const parentContainer = findParentContainer(treeWithoutDragged, targetId);
          destContainerId = parentContainer ? parentContainer.id : s.rootComponent.id;
          insertTargetId = targetId;
        }
      }

      // 2. Insert draggedComp at resolved position
      const insertIntoTree = (parent: AndroidComponent): AndroidComponent => {
        if (parent.id === destContainerId) {
          const children = parent.children || [];
          if (insertTargetId) {
            const idx = children.findIndex((c) => c.id === insertTargetId);
            if (idx !== -1) {
              const next = [...children];
              const splicePos = insertBeforeFlag ? idx : idx + 1;
              next.splice(splicePos, 0, draggedComp!);
              return { ...parent, children: next };
            }
          }
          return { ...parent, children: [...children, draggedComp!] };
        }

        if (parent.children) {
          return { ...parent, children: parent.children.map(insertIntoTree) };
        }

        return parent;
      };

      const updatedRoot = insertIntoTree(treeWithoutDragged);
      return { ...s, rootComponent: updatedRoot };
    });

    pushScreensState(updatedScreens);
    setSelectedComponentId(draggedId);
  };

  // Comprehensive Screen Management Handlers
  const handleCreateScreen = (options: {
    name: string;
    title: string;
    template: ScreenTemplateId;
    isInitial: boolean;
  }) => {
    const newScreen = createScreenFromTemplate(
      options.template,
      options.name,
      options.title,
      options.isInitial
    );

    let updated = screens;
    if (options.isInitial) {
      updated = updated.map((s) => ({ ...s, isInitial: false }));
    }
    updated = [...updated, newScreen];

    pushScreensState(updated);
    setCurrentScreenId(newScreen.id);
    setSelectedComponentId(newScreen.rootComponent.id);
  };

  const handleRenameScreen = (screenId: string, newName: string, newTitle: string) => {
    const updated = screens.map((s) =>
      s.id === screenId ? { ...s, name: newName, title: newTitle } : s
    );
    pushScreensState(updated);
  };

  const handleDeleteScreen = (screenId: string) => {
    if (screens.length <= 1) return;
    const wasInitial = screens.find((s) => s.id === screenId)?.isInitial;
    const remaining = screens.filter((s) => s.id !== screenId);

    // If the deleted screen was the launcher, nominate the first remaining screen as launcher
    let finalized = remaining;
    if (wasInitial && remaining.length > 0) {
      finalized = remaining.map((s, idx) => (idx === 0 ? { ...s, isInitial: true } : s));
    }

    pushScreensState(finalized);

    // If active screen was deleted, switch to the first remaining screen
    if (currentScreenId === screenId && finalized.length > 0) {
      setCurrentScreenId(finalized[0].id);
      setSelectedComponentId(finalized[0].rootComponent.id);
    }
  };

  const handleDuplicateScreen = (screenId: string) => {
    const source = screens.find((s) => s.id === screenId) || currentScreen;
    if (!source) return;
    const duplicated = cloneScreen(source);
    const updated = [...screens, duplicated];
    pushScreensState(updated);
    setCurrentScreenId(duplicated.id);
    setSelectedComponentId(duplicated.rootComponent.id);
  };

  const handleCopyScreen = (screenToCopy: AndroidScreen) => {
    copyScreenToClipboard(screenToCopy);
    setHasCopiedScreenState(true);
  };

  const handlePasteScreen = (sourceScreen?: AndroidScreen) => {
    const source = sourceScreen || getCopiedScreenFromClipboard();
    if (!source) return;
    const pasted = cloneScreen(source);
    const updated = [...screens, pasted];
    pushScreensState(updated);
    setCurrentScreenId(pasted.id);
    setSelectedComponentId(pasted.rootComponent.id);
    setHasCopiedScreenState(true);
  };

  const handleSetLauncherScreen = (screenId: string) => {
    const updated = screens.map((s) => ({
      ...s,
      isInitial: s.id === screenId,
    }));
    pushScreensState(updated);
  };

  // Quick action to add a new screen with prompt
  const handleAddScreen = () => {
    setIsNewScreenModalOpen(true);
  };

  const handleOpenRenameCurrentScreen = () => {
    setScreenToRename(currentScreen);
    setIsRenameScreenModalOpen(true);
  };

  const handleOpenDeleteScreenModal = (targetId?: string) => {
    const target = screens.find((s) => s.id === (targetId || currentScreenId)) || currentScreen;
    if (target) {
      setScreenToDelete(target);
      setIsDeleteScreenModalOpen(true);
    }
  };

  const handleUpdateScreenProperties = (
    screenId: string,
    updatedProps: Partial<ScreenProperties>
  ) => {
    const updated = screens.map((s) => {
      if (s.id !== screenId) return s;
      return {
        ...s,
        properties: {
          ...s.properties,
          ...updatedProps,
        },
      };
    });
    pushScreensState(updated);
  };

  const handleUpdateScreenTitle = (screenId: string, newTitle: string) => {
    const target = screens.find((s) => s.id === screenId);
    if (target) {
      handleRenameScreen(screenId, target.name, newTitle);
    }
  };

  // Logic Blocks Handlers
  const handleAddLogicBlock = (block: LogicBlock) => {
    const updatedScreens = screens.map((s) =>
      s.id === currentScreen.id
        ? { ...s, logicBlocks: [...s.logicBlocks, block] }
        : s
    );
    pushScreensState(updatedScreens);
  };

  const handleUpdateLogicBlock = (block: LogicBlock) => {
    const updatedScreens = screens.map((s) =>
      s.id === currentScreen.id
        ? {
            ...s,
            logicBlocks: s.logicBlocks.map((b) => (b.id === block.id ? block : b)),
          }
        : s
    );
    pushScreensState(updatedScreens);
  };

  const handleDeleteLogicBlock = (blockId: string) => {
    const updatedScreens = screens.map((s) =>
      s.id === currentScreen.id
        ? { ...s, logicBlocks: s.logicBlocks.filter((b) => b.id !== blockId) }
        : s
    );
    pushScreensState(updatedScreens);
  };

  const handleUpdateScreenStateVariables = (variables: StateVariable[]) => {
    const updatedScreens = screens.map((s) =>
      s.id === currentScreen.id ? { ...s, stateVariables: variables } : s
    );
    pushScreensState(updatedScreens);
  };

  const handleUpdateCurrentScreen = (updatedScreen: AndroidScreen) => {
    const updatedScreens = screens.map((s) =>
      s.id === updatedScreen.id ? updatedScreen : s
    );
    pushScreensState(updatedScreens);
  };

  // Export full Android Studio ZIP
  const handleExportZip = async () => {
    setIsExporting(true);
    try {
      await exportAndroidStudioZip(config, screens, assets);
    } catch (err) {
      console.error("Export error:", err);
      alert("Error generating zip: " + (err as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  // AI Application Applicator
  const handleApplyAiGeneratedApp = (
    newScreens: AndroidScreen[],
    configUpdates?: Partial<ProjectConfig>
  ) => {
    if (configUpdates) {
      setConfig((prev) => ({ ...prev, ...configUpdates }));
    }
    pushScreensState(newScreens);
    if (newScreens[0]) {
      setCurrentScreenId(newScreens[0].id);
      setSelectedComponentId(newScreens[0].rootComponent.id);
    }
  };

  const selectedComp = findComponentInTree(
    currentScreen.rootComponent,
    selectedComponentId || ""
  );

  return (
    <div
      id="droidforge-app-root"
      style={{
        backgroundColor: "var(--ide-shell-bg)",
        color: "var(--ide-text)",
        fontFamily: "var(--ide-font-family)",
      }}
      className="ide-theme-container flex flex-col h-screen w-screen overflow-hidden select-none"
    >
      {/* Top Application Bar */}
      <Navbar
        appName={config.appName}
        appIcon={config.appIcon}
        packageName={config.packageName}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        screens={screens}
        currentScreenId={currentScreenId}
        setCurrentScreenId={setCurrentScreenId}
        onAddScreen={handleAddScreen}
        onOpenScreenManager={() => {
          setScreenManagerInitialMode("list");
          setIsScreenManagerOpen(true);
        }}
        onDuplicateCurrentScreen={() => handleDuplicateScreen(currentScreenId)}
        onRenameCurrentScreen={handleOpenRenameCurrentScreen}
        onDeleteCurrentScreen={() => handleOpenDeleteScreenModal(currentScreenId)}
        onPasteScreen={() => handlePasteScreen()}
        hasCopiedScreen={hasCopiedScreenState}
        deviceType={deviceType}
        setDeviceType={setDeviceType}
        orientation={orientation}
        toggleOrientation={() =>
          setOrientation((prev) => (prev === "portrait" ? "landscape" : "portrait"))
        }
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenAiBuilder={() => {
          setAiInitialPrompt("");
          setIsAiBuilderOpen(true);
        }}
        onOpenLiveTest={() => setIsLiveTestOpen(true)}
        onOpenBuildModal={() => setIsBuildModalOpen(true)}
        onOpenAppProperties={() => setActiveTab("properties")}
        onOpenBuilderSettings={() => setIsBuilderSettingsOpen(true)}
        onExportZip={handleExportZip}
        isExporting={isExporting}
        onCreateNewApp={() => setIsCreateAppOpen(true)}
        onBrowseTemplates={() => setIsTemplatesOpen(true)}
        builderSettings={builderSettings}
        userProfile={userProfile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main Studio Work Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Tab 0: Dashboard (Apps Manager, Metrics, Templates, Quick Actions) */}
        {activeTab === "dashboard" && (
          <DashboardView
            projects={projects}
            currentProjectId={currentProjectId}
            onOpenProject={handleOpenProject}
            onDownloadProject={handleDownloadProjectZip}
            onDeleteProject={handleDeleteProject}
            onDuplicateProject={handleDuplicateProject}
            onCreateNewApp={() => setIsCreateAppOpen(true)}
            onBrowseTemplates={() => setIsTemplatesOpen(true)}
            onOpenAppSettings={() => setActiveTab("properties")}
            onOpenBuildModal={() => setIsBuildModalOpen(true)}
            onImportProjects={handleImportProjects}
            onOpenBuilderSettings={() => setIsBuilderSettingsOpen(true)}
            userProfile={userProfile}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {/* Tab 1: Visual Drag & Drop Canvas Studio */}
        {activeTab === "canvas" && (
          <div className="flex-1 flex h-full overflow-hidden">
            {/* Left: Component Library Palette & Hierarchy Rail */}
            <ComponentPalette
              onSelectComponentType={handleAddComponentToScreen}
              activeRailTab={activeRailTab}
              onSelectRailTab={setActiveRailTab}
              onOpenAiModal={() => {
                setAiInitialPrompt("");
                setIsAiBuilderOpen(true);
              }}
              onOpenAppProperties={() => setActiveTab("properties")}
              onOpenBuilderSettings={() => setIsBuilderSettingsOpen(true)}
              onOpenCustomComponentModal={handleOpenCustomComponentModal}
              customComponents={customComponents}
              onDeleteCustomComponent={handleDeleteCustomComponent}
              rootComponent={currentScreen.rootComponent}
              screenName={currentScreen.name}
              selectedComponentId={selectedComponentId}
              onSelectComponent={(id) => setSelectedComponentId(id)}
              onDeleteComponent={handleDeleteComponent}
              onDuplicateComponent={handleDuplicateComponent}
              onMoveUp={(id) => handleMoveComponent(id, "up")}
              onMoveDown={(id) => handleMoveComponent(id, "down")}
              onReorderComponent={handleReorderCanvasComponent}
            />

            {/* Center: Interactive Live Android Frame & Stage */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-100">
              <Canvas
                screen={currentScreen}
                screens={screens}
                theme={config.theme}
                deviceType={deviceType}
                orientation={orientation}
                selectedComponentId={selectedComponentId}
                onSelectComponent={(id) => setSelectedComponentId(id)}
                onDropNewComponent={handleAddComponentToScreen}
                onNavigateToScreen={(targetId) => {
                  const target = screens.find((s) => s.id === targetId);
                  if (target) setCurrentScreenId(target.id);
                }}
                onSelectScreen={(screenId) => setCurrentScreenId(screenId)}
                onOpenScreenManager={() => {
                  setScreenManagerInitialMode("list");
                  setIsScreenManagerOpen(true);
                }}
                onOpenNewScreenModal={() => {
                  setScreenManagerInitialMode("create");
                  setIsScreenManagerOpen(true);
                }}
                onDuplicateCurrentScreen={() => handleDuplicateScreen(currentScreenId)}
                onRenameCurrentScreen={handleOpenRenameCurrentScreen}
                onToggleDeviceType={(type) => setDeviceType(type)}
                onOpenAiModal={() => {
                  setAiInitialPrompt("");
                  setIsAiBuilderOpen(true);
                }}
                onMoveUp={(id) => handleMoveComponent(id, "up")}
                onMoveDown={(id) => handleMoveComponent(id, "down")}
                onDeleteComponent={handleDeleteComponent}
                onDuplicateComponent={handleDuplicateComponent}
                onReorderComponent={handleReorderCanvasComponent}
                builderSettings={builderSettings}
              />
            </div>

            {/* Right: Properties Inspector Panel */}
            <PropertiesPanel
              selectedComponent={selectedComp}
              currentScreen={currentScreen}
              onUpdateComponentProps={handleUpdateComponentProps}
              onUpdateComponentName={handleUpdateComponentName}
              onDeleteComponent={handleDeleteComponent}
              onDuplicateComponent={handleDuplicateComponent}
              onOpenLogicEditorForComponent={(compTargetId) => {
                setLogicTargetComponentId(compTargetId);
                setActiveTab("logic");
              }}
              onUpdateScreenProperties={handleUpdateScreenProperties}
              onUpdateScreenTitle={handleUpdateScreenTitle}
              onDeselectComponent={() => setSelectedComponentId(null)}
              onDeleteScreen={(id) => handleOpenDeleteScreenModal(id)}
              onDuplicateScreen={handleDuplicateScreen}
            />
          </div>
        )}

        {/* Tab 2: Visual Logic & Event Flow Studio (@xyflow/react) */}
        {activeTab === "logic" && (
          <LogicBlocksEditor
            screen={currentScreen}
            screens={screens}
            onAddLogicBlock={handleAddLogicBlock}
            onUpdateLogicBlock={handleUpdateLogicBlock}
            onDeleteLogicBlock={handleDeleteLogicBlock}
            targetComponentId={logicTargetComponentId}
            onUpdateStateVariables={handleUpdateScreenStateVariables}
            onUpdateScreen={handleUpdateCurrentScreen}
            onSelectScreen={(screenId) => {
              setCurrentScreenId(screenId);
              const target = screens.find((s) => s.id === screenId);
              if (target?.rootComponent?.id) {
                setSelectedComponentId(target.rootComponent.id);
              }
            }}
            builderSettings={builderSettings}
            onOpenAiAssistant={(contextPrompt) => {
              setAiInitialPrompt(contextPrompt);
              setIsAiBuilderOpen(true);
            }}
          />
        )}

        {/* Tab 3: Code Studio (Kotlin / Jetpack Compose / Gradle / NDK C++) */}
        {activeTab === "code" && (
          <CodePreview
            screen={currentScreen}
            screens={screens}
            config={config}
            assets={assets}
            builderSettings={builderSettings}
            onUpdateScreen={handleUpdateCurrentScreen}
            onSelectScreen={(screenId) => {
              setCurrentScreenId(screenId);
              const target = screens.find((s) => s.id === screenId);
              if (target?.rootComponent?.id) {
                setSelectedComponentId(target.rootComponent.id);
              }
            }}
            onSwitchToCanvas={() => setActiveTab("canvas")}
            onSwitchToLogic={() => setActiveTab("logic")}
          />
        )}

        {/* App Properties & Publishing Configuration Studio (Includes General, Theme, SDK & NDK, Assets, Version Control, Manifest & Docs) */}
        {(activeTab === "properties" ||
          activeTab === "sdk" ||
          activeTab === "assets" ||
          activeTab === "versions" ||
          activeTab === "docs") && (
          <AppPropertiesPanel
            config={config}
            onUpdateConfig={handleUpdateConfig}
            onOpenBuildModal={() => setIsBuildModalOpen(true)}
            onExportZip={handleExportZip}
            assets={assets}
            onAddAsset={(newAsset) => setAssets((prev) => [...prev, newAsset])}
            onDeleteAsset={(id) => setAssets((prev) => prev.filter((a) => a.id !== id))}
            screens={screens}
            projects={projects}
            currentProjectId={currentProjectId}
            snapshots={snapshots}
            onUpdateSnapshots={setSnapshots}
            onRestoreSnapshot={handleRestoreSnapshot}
            onForkAsNewApp={handleForkSnapshotAsNewApp}
            builderSettings={builderSettings}
            activeSubTab={
              activeTab === "sdk"
                ? "sdk"
                : activeTab === "assets"
                ? "assets"
                : activeTab === "versions"
                ? "versions"
                : activeTab === "docs"
                ? "docs"
                : propertiesSubTab
            }
            onSubTabChange={(newSubTab) => {
              setPropertiesSubTab(newSubTab);
              if (activeTab !== "properties") {
                setActiveTab("properties");
              }
            }}
          />
        )}
      </main>

      {/* AI App Builder & Architecture Advisor Modal */}
      <AiBuilderModal
        isOpen={isAiBuilderOpen}
        onClose={() => setIsAiBuilderOpen(false)}
        config={config}
        onApplyGeneratedApp={handleApplyAiGeneratedApp}
        initialPrompt={aiInitialPrompt}
      />

      {/* Gradle Build APK/AAB Release Modal */}
      <BuildApkModal
        isOpen={isBuildModalOpen}
        onClose={() => setIsBuildModalOpen(false)}
        config={config}
        onExportZip={handleExportZip}
      />

      {/* App Properties & Configuration Modal (Branding, Splash, Package, Ads, APIs) */}
      <AppPropertiesModal
        isOpen={isAppPropertiesOpen}
        onClose={() => setIsAppPropertiesOpen(false)}
        config={config}
        onUpdateConfig={handleUpdateConfig}
      />

      {/* Create New App Modal */}
      <CreateAppModal
        isOpen={isCreateAppOpen}
        onClose={() => setIsCreateAppOpen(false)}
        onCreateProject={handleCreateProject}
        userProfile={userProfile}
      />

      {/* Browse Templates Modal */}
      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={handleCreateProject}
      />

      {/* Builder Settings (IDE Workspace Preferences Modal) */}
      <BuilderSettingsModal
        isOpen={isBuilderSettingsOpen}
        onClose={() => setIsBuilderSettingsOpen(false)}
        settings={builderSettings}
        onUpdateSettings={handleUpdateBuilderSettings}
        onResetSettings={handleResetBuilderSettings}
        onOpenAppTheme={() => {
          setActiveTab("properties");
          setPropertiesSubTab("theme");
        }}
      />

      {/* Screen Manager Modal (Rename, Delete, Copy, Paste, Duplicate, Launcher) */}
      <ScreenManagerModal
        isOpen={isScreenManagerOpen}
        onClose={() => setIsScreenManagerOpen(false)}
        screens={screens}
        currentScreenId={currentScreenId}
        onSelectScreen={(id) => setCurrentScreenId(id)}
        onCreateScreen={handleCreateScreen}
        onRenameScreen={handleRenameScreen}
        onDeleteScreen={(id) => handleOpenDeleteScreenModal(id)}
        onDuplicateScreen={handleDuplicateScreen}
        onCopyScreen={handleCopyScreen}
        onPasteScreen={handlePasteScreen}
        onSetLauncherScreen={handleSetLauncherScreen}
        initialMode={screenManagerInitialMode}
      />

      {/* Quick New Screen Modal */}
      <NewScreenModal
        isOpen={isNewScreenModalOpen}
        onClose={() => setIsNewScreenModalOpen(false)}
        existingScreens={screens}
        onCreateScreen={handleCreateScreen}
      />

      {/* Quick Rename Screen Modal */}
      <RenameScreenModal
        isOpen={isRenameScreenModalOpen}
        onClose={() => {
          setIsRenameScreenModalOpen(false);
          setScreenToRename(null);
        }}
        screen={screenToRename}
        onRename={handleRenameScreen}
      />

      {/* Delete Screen Confirmation Modal */}
      <DeleteScreenModal
        isOpen={isDeleteScreenModalOpen}
        onClose={() => {
          setIsDeleteScreenModalOpen(false);
          setScreenToDelete(null);
        }}
        screen={screenToDelete}
        totalScreens={screens.length}
        onConfirmDelete={handleDeleteScreen}
      />
	   {/* Custom Component Maker & Studio Modal */}
      <CustomComponentModal
        isOpen={isCustomComponentModalOpen}
        onClose={() => setIsCustomComponentModalOpen(false)}
        projectDependencies={config.dependencies || []}
        existingComponent={editingCustomComponent}
        existingComponents={customComponents}
        onSaveComponent={handleSaveCustomComponent}
        onDeleteComponent={handleDeleteCustomComponent}
      />

      {/* App Live Test & Companion Studio Modal */}
      <LiveTestModal
        isOpen={isLiveTestOpen}
        onClose={() => setIsLiveTestOpen(false)}
        config={config}
        screens={screens}
        currentScreenId={currentScreenId}
        appName={config.appName}
        appIcon={config.appIcon}
      />

      {/* User Profile & Developer Identity Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        onUpdateProfile={(updated) => setUserProfile(updated)}
        onLogout={handleLogout}
        onOpenAuth={handleOpenAuth}
        projects={projects}
      />

      {/* User Authentication & Account Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onAuthSuccess={(profile) => {
          setUserProfile(profile);
        }}
      />
    </div>
  );
}
