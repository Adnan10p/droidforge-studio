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
  projects?: SavedProject[],
  currentProjectId?: string
): ProjectSnapshot[] {
  const now = Date.now();
  const totalComponents = countComponentsInScreens(currentScreens);
  const pid = currentProjectId || "proj_current";

  return [
    {
      id: `snap_init_${now}`,
      projectId: pid,
      projectName: currentConfig.appName || "My Android App",
      versionTag: `v${currentConfig.versionName || "1.0.0"}`,
      commitMessage: `Initial Project Creation - ${currentConfig.appName || "App Setup"}`,
      description: `Baseline project architecture created with ${currentScreens.length} initial screen(s) and Target SDK ${currentConfig.targetSdk || 35}.`,
      timestamp: new Date(now).toISOString(),
      formattedDate: new Date(now).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "milestone",
      screensCount: currentScreens.length,
      componentsCount: totalComponents,
      configSnapshot: JSON.parse(JSON.stringify(currentConfig)),
      screensSnapshot: JSON.parse(JSON.stringify(currentScreens)),
      assetsSnapshot: JSON.parse(JSON.stringify(currentAssets)),
      projectsSnapshot: projects ? JSON.parse(JSON.stringify(projects)) : undefined,
    },
  ];
}

export function loadStoredSnapshots(
  fallbackConfig: ProjectConfig,
  fallbackScreens: AndroidScreen[],
  fallbackAssets: ProjectAsset[],
  projects?: SavedProject[],
  currentProjectId?: string
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

  const initial = generateInitialSnapshots(fallbackConfig, fallbackScreens, fallbackAssets, projects, currentProjectId);
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
