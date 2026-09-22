import { AndroidScreen, ProjectAsset, ProjectConfig, ProjectSnapshot, SavedProject } from "../types";

export const SNAPSHOTS_STORAGE_KEY = "droidforge_snapshots_history_v1";

export function countComponentsInScreens(screens: AndroidScreen[]): number {
  let count = 0;
  const countInTree = (comp: any) => {
    if (!comp) return;
    count++;
    if (comp.children && Array.isArray(comp.children)) {
      comp.children.forEach(countInTree);
    }
  };

  screens.forEach((screen) => {
    if (screen.rootComponent) {
      countInTree(screen.rootComponent);
    }
  });
  return count;
}

export function generateInitialSnapshots(
  currentConfig: ProjectConfig,
  currentScreens: AndroidScreen[],
  currentAssets: ProjectAsset[],
  projects?: SavedProject[]
): ProjectSnapshot[] {
  const now = Date.now();
  const totalComponents = countComponentsInScreens(currentScreens);

  return [
    {
      id: "snap_v1_0_3",
      projectId: "proj_quickforge_pro",
      projectName: currentConfig.appName || "DroidForge Studio App",
      versionTag: "v1.0.3",
      commitMessage: "Updated Material 3 theme palette & responsive drawer navigation",
      description: "Synchronized dynamic color scheme, updated container shapes, and validated navigation flows.",
      timestamp: new Date(now - 1000 * 60 * 25).toISOString(),
      formattedDate: new Date(now - 1000 * 60 * 25).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "auto",
      screensCount: currentScreens.length,
      componentsCount: totalComponents,
      configSnapshot: JSON.parse(JSON.stringify(currentConfig)),
      screensSnapshot: JSON.parse(JSON.stringify(currentScreens)),
      assetsSnapshot: JSON.parse(JSON.stringify(currentAssets)),
      projectsSnapshot: projects ? JSON.parse(JSON.stringify(projects)) : undefined,
    },
    {
      id: "snap_v1_0_2",
      projectId: "proj_quickforge_pro",
      projectName: currentConfig.appName || "DroidForge Studio App",
      versionTag: "v1.0.2",
      commitMessage: "Implemented visual logic blocks and screen state bindings",
      description: "Connected interactive click triggers, count state variables, and toast notifications.",
      timestamp: new Date(now - 1000 * 60 * 60 * 4).toISOString(),
      formattedDate: new Date(now - 1000 * 60 * 60 * 4).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "manual",
      screensCount: currentScreens.length,
      componentsCount: Math.max(1, totalComponents - 2),
      configSnapshot: JSON.parse(JSON.stringify(currentConfig)),
      screensSnapshot: JSON.parse(JSON.stringify(currentScreens)),
      assetsSnapshot: JSON.parse(JSON.stringify(currentAssets)),
      projectsSnapshot: projects ? JSON.parse(JSON.stringify(projects)) : undefined,
    },
    {
      id: "snap_v1_0_1",
      projectId: "proj_quickforge_pro",
      projectName: currentConfig.appName || "DroidForge Studio App",
      versionTag: "v1.0.1",
      commitMessage: "Added secondary screen routes and initial compose components",
      description: "Introduced details screen, product list layout, and Jetpack Compose 1.7 baseline components.",
      timestamp: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
      formattedDate: new Date(now - 1000 * 60 * 60 * 24).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "manual",
      screensCount: Math.max(1, currentScreens.length - 1),
      componentsCount: Math.max(1, totalComponents - 5),
      configSnapshot: JSON.parse(JSON.stringify(currentConfig)),
      screensSnapshot: JSON.parse(JSON.stringify(currentScreens)),
      assetsSnapshot: JSON.parse(JSON.stringify(currentAssets)),
      projectsSnapshot: projects ? JSON.parse(JSON.stringify(projects)) : undefined,
    },
    {
      id: "snap_v1_0_0",
      projectId: "proj_quickforge_pro",
      projectName: currentConfig.appName || "DroidForge Studio App",
      versionTag: "v1.0.0",
      commitMessage: "Initial project setup with Gradle 8.5 & Compose Compiler 1.7",
      description: "Initial application scaffold with Android Manifest, launcher icon, and primary launcher activity.",
      timestamp: new Date(now - 1000 * 60 * 60 * 48).toISOString(),
      formattedDate: new Date(now - 1000 * 60 * 60 * 48).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "milestone",
      screensCount: 1,
      componentsCount: 4,
      configSnapshot: {
        ...JSON.parse(JSON.stringify(currentConfig)),
        versionCode: 1,
        versionName: "1.0.0",
      },
      screensSnapshot: [JSON.parse(JSON.stringify(currentScreens[0]))],
      assetsSnapshot: JSON.parse(JSON.stringify(currentAssets)),
      projectsSnapshot: projects ? JSON.parse(JSON.stringify(projects)) : undefined,
    },
  ];
}

export function loadStoredSnapshots(
  fallbackConfig: ProjectConfig,
  fallbackScreens: AndroidScreen[],
  fallbackAssets: ProjectAsset[],
  projects?: SavedProject[]
): ProjectSnapshot[] {
  try {
    const raw = localStorage.getItem(SNAPSHOTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Failed to parse stored snapshots", err);
  }

  const initial = generateInitialSnapshots(fallbackConfig, fallbackScreens, fallbackAssets, projects);
  saveStoredSnapshots(initial);
  return initial;
}

export function saveStoredSnapshots(snapshots: ProjectSnapshot[]): void {
  try {
    localStorage.setItem(SNAPSHOTS_STORAGE_KEY, JSON.stringify(snapshots));
  } catch (err) {
    console.error("Failed to save snapshots to localStorage", err);
  }
}

export function createNewSnapshot(params: {
  projectId: string;
  projectName: string;
  versionTag: string;
  commitMessage: string;
  description?: string;
  type?: "manual" | "auto" | "milestone";
  config: ProjectConfig;
  screens: AndroidScreen[];
  assets: ProjectAsset[];
  projects?: SavedProject[];
}): ProjectSnapshot {
  const now = new Date();
  return {
    id: `snap_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    projectId: params.projectId,
    projectName: params.projectName,
    versionTag: params.versionTag.trim() || `v${params.config.versionName || "1.0.0"}.${Date.now().toString().slice(-4)}`,
    commitMessage: params.commitMessage.trim() || "Snapshot checkpoint",
    description: params.description?.trim(),
    timestamp: now.toISOString(),
    formattedDate: now.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    type: params.type || "manual",
    screensCount: params.screens.length,
    componentsCount: countComponentsInScreens(params.screens),
    configSnapshot: JSON.parse(JSON.stringify(params.config)),
    screensSnapshot: JSON.parse(JSON.stringify(params.screens)),
    assetsSnapshot: JSON.parse(JSON.stringify(params.assets)),
    projectsSnapshot: params.projects ? JSON.parse(JSON.stringify(params.projects)) : undefined,
  };
}
