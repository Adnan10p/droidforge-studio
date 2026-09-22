import React, { useState, useMemo, useRef } from "react";
import {
  GitBranch,
  GitCommit,
  RotateCcw,
  Plus,
  Trash2,
  Download,
  Upload,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Smartphone,
  Eye,
  Copy,
  ChevronDown,
  ChevronUp,
  FolderGit2,
  History,
  HardDrive,
  Info,
  Check,
  Package,
  ArrowUpRight,
  ShieldCheck,
  Cpu,
  Wrench,
  RefreshCw,
  FileCode,
  BookOpen,
} from "lucide-react";
import { AndroidScreen, ProjectAsset, ProjectConfig, ProjectSnapshot, SavedProject, AndroidDependency } from "../../types";
import { createNewSnapshot, saveStoredSnapshots, countComponentsInScreens } from "../../utils/versionControl";

interface VersionControlPanelProps {
  currentConfig: ProjectConfig;
  currentScreens: AndroidScreen[];
  currentAssets: ProjectAsset[];
  projects: SavedProject[];
  currentProjectId: string;
  snapshots: ProjectSnapshot[];
  onUpdateSnapshots: (snapshots: ProjectSnapshot[]) => void;
  onRestoreSnapshot: (snapshot: ProjectSnapshot) => void;
  onForkAsNewApp: (snapshot: ProjectSnapshot) => void;
  onUpdateConfig?: (updates: Partial<ProjectConfig>) => void;
}

const RECOMMENDED_DEPENDENCY_VERSIONS: Record<string, string> = {
  "material3": "1.3.1",
  "coil-compose": "2.7.0",
  "retrofit": "2.11.0",
  "room-ktx": "2.6.1",
  "media3-exoplayer": "1.4.1",
  "maps-compose": "4.3.3",
  "kotlinx-coroutines-android": "1.9.0",
  "play-services-ads": "23.3.0",
  "core-ktx": "1.13.1",
  "lifecycle-runtime-ktx": "2.8.5",
  "activity-compose": "1.9.2",
  "navigation-compose": "2.8.1",
};

const LATEST_TOOLCHAIN = {
  kotlinVersion: "2.0.21",
  composeVersion: "1.7.5",
  gradleVersion: "8.9",
  targetSdk: 35,
};

export const VersionControlPanel: React.FC<VersionControlPanelProps> = ({
  currentConfig,
  currentScreens,
  currentAssets,
  projects,
  currentProjectId,
  snapshots,
  onUpdateSnapshots,
  onRestoreSnapshot,
  onForkAsNewApp,
  onUpdateConfig,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "milestone" | "manual" | "auto">("all");
  const [filterProject, setFilterProject] = useState<"current" | "all">("current");
  const [expandedDiffId, setExpandedDiffId] = useState<string | null>(null);

  // Modal & Tab States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [restoreCandidate, setRestoreCandidate] = useState<ProjectSnapshot | null>(null);
  const [backupBeforeRestore, setBackupBeforeRestore] = useState(true);
  const [snapshotSuccessToast, setSnapshotSuccessToast] = useState<string | null>(null);
  const [showAuditPanel, setShowAuditPanel] = useState(true);
  const [isAddDepOpen, setIsAddDepOpen] = useState(false);

  // New Dependency Form
  const [depName, setDepName] = useState("");
  const [depGroup, setDepGroup] = useState("");
  const [depArtifact, setDepArtifact] = useState("");
  const [depVersion, setDepVersion] = useState("");
  const [depCategory, setDepCategory] = useState<AndroidDependency["category"]>("Utility");
  const [depDesc, setDepDesc] = useState("");

  // Form State for new snapshot
  const [newVersionTag, setNewVersionTag] = useState("");
  const [newCommitMessage, setNewCommitMessage] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newType, setNewType] = useState<"manual" | "milestone">("manual");
  const [includeAllProjects, setIncludeAllProjects] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute stats & sizes
  const liveComponentCount = useMemo(() => countComponentsInScreens(currentScreens), [currentScreens]);

  const liveProjectBytes = useMemo(() => {
    try {
      const raw = JSON.stringify({
        config: currentConfig,
        screens: currentScreens,
        assets: currentAssets,
      });
      return raw.length;
    } catch {
      return 0;
    }
  }, [currentConfig, currentScreens, currentAssets]);

  const liveProjectSizeFormatted = useMemo(() => {
    if (liveProjectBytes < 1024) return `${liveProjectBytes} B`;
    if (liveProjectBytes < 1024 * 1024) return `${(liveProjectBytes / 1024).toFixed(1)} KB`;
    return `${(liveProjectBytes / (1024 * 1024)).toFixed(2)} MB`;
  }, [liveProjectBytes]);

  const currentProjectSnapshots = useMemo(() => {
    return snapshots.filter((s) => (filterProject === "current" ? s.projectId === currentProjectId : true));
  }, [snapshots, filterProject, currentProjectId]);

  const filteredSnapshots = useMemo(() => {
    return currentProjectSnapshots.filter((snap) => {
      const matchesType = filterType === "all" ? true : snap.type === filterType;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        snap.versionTag.toLowerCase().includes(q) ||
        snap.commitMessage.toLowerCase().includes(q) ||
        (snap.description && snap.description.toLowerCase().includes(q)) ||
        snap.projectName.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [currentProjectSnapshots, filterType, searchQuery]);

  // Approximate storage estimate in KB
  const estimatedStorageKb = useMemo(() => {
    try {
      return (JSON.stringify(snapshots).length / 1024).toFixed(1);
    } catch {
      return "0.0";
    }
  }, [snapshots]);

  const showToast = (message: string) => {
    setSnapshotSuccessToast(message);
    setTimeout(() => {
      setSnapshotSuccessToast(null);
    }, 4000);
  };

  const handleUpgradeSingleDependency = (depId: string, latestVersion: string) => {
    if (!onUpdateConfig) return;
    const updatedDeps = (currentConfig.dependencies || []).map((dep) => {
      if (dep.id === depId) {
        return { ...dep, version: latestVersion };
      }
      return dep;
    });
    onUpdateConfig({ dependencies: updatedDeps });
    showToast(`Updated dependency version to v${latestVersion}!`);
  };

  const handleUpgradeAllDependencies = () => {
    if (!onUpdateConfig) return;
    const updatedDeps = (currentConfig.dependencies || []).map((dep) => {
      const rec = RECOMMENDED_DEPENDENCY_VERSIONS[dep.artifact] || dep.version;
      return { ...dep, version: rec };
    });

    onUpdateConfig({
      kotlinVersion: LATEST_TOOLCHAIN.kotlinVersion,
      composeVersion: LATEST_TOOLCHAIN.composeVersion,
      gradleVersion: LATEST_TOOLCHAIN.gradleVersion,
      targetSdk: LATEST_TOOLCHAIN.targetSdk,
      compileSdk: LATEST_TOOLCHAIN.targetSdk,
      dependencies: updatedDeps,
    });

    showToast("All Android dependencies & SDK toolchains upgraded to latest stable versions!");
  };

  const handleAddDependencySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depGroup || !depArtifact || !depVersion || !onUpdateConfig) return;

    const newDep: AndroidDependency = {
      id: `dep_${Date.now()}`,
      name: depName || depArtifact,
      group: depGroup.trim(),
      artifact: depArtifact.trim(),
      version: depVersion.trim(),
      description: depDesc || `${depGroup.trim()}:${depArtifact.trim()}:${depVersion.trim()}`,
      enabled: true,
      category: depCategory,
    };

    const existing = currentConfig.dependencies || [];
    onUpdateConfig({ dependencies: [...existing, newDep] });
    setIsAddDepOpen(false);
    setDepName("");
    setDepGroup("");
    setDepArtifact("");
    setDepVersion("");
    setDepDesc("");
    showToast(`Added dependency ${newDep.group}:${newDep.artifact}:${newDep.version}`);
  };

  const handleOpenCreateModal = () => {
    const nextVersion = `v${currentConfig.versionName || "1.0.0"}.${snapshots.length + 1}`;
    setNewVersionTag(nextVersion);
    setNewCommitMessage("");
    setNewDescription("");
    setNewType("manual");
    setIsCreateModalOpen(true);
  };

  const handleCreateSnapshotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommitMessage.trim()) return;

    const newSnap = createNewSnapshot({
      projectId: currentProjectId,
      projectName: currentConfig.appName,
      versionTag: newVersionTag || `v1.0.${Date.now().toString().slice(-4)}`,
      commitMessage: newCommitMessage,
      description: newDescription,
      type: newType,
      config: currentConfig,
      screens: currentScreens,
      assets: currentAssets,
      projects: includeAllProjects ? projects : undefined,
    });

    const updated = [newSnap, ...snapshots];
    onUpdateSnapshots(updated);
    saveStoredSnapshots(updated);
    setIsCreateModalOpen(false);
    showToast(`Snapshot ${newSnap.versionTag} logged to Local Storage!`);
  };

  const handleDeleteSnapshot = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to permanently delete this snapshot?")) {
      const updated = snapshots.filter((s) => s.id !== id);
      onUpdateSnapshots(updated);
      saveStoredSnapshots(updated);
      showToast("Snapshot deleted.");
    }
  };

  const handleConfirmRestore = () => {
    if (!restoreCandidate) return;

    // Optionally create a backup checkpoint before rolling back
    if (backupBeforeRestore) {
      const backupSnap = createNewSnapshot({
        projectId: currentProjectId,
        projectName: currentConfig.appName,
        versionTag: `pre-restore-${Date.now().toString().slice(-4)}`,
        commitMessage: `Auto-backup before restoring ${restoreCandidate.versionTag}`,
        type: "auto",
        config: currentConfig,
        screens: currentScreens,
        assets: currentAssets,
        projects: projects,
      });
      const updated = [backupSnap, ...snapshots];
      onUpdateSnapshots(updated);
      saveStoredSnapshots(updated);
    }

    onRestoreSnapshot(restoreCandidate);
    setRestoreCandidate(null);
    showToast(`Successfully restored application state to ${restoreCandidate.versionTag}!`);
  };

  const handleExportJson = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snapshots, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `droidforge-snapshots-${currentConfig.appName.replace(/\s+/g, "_")}-${new Date().toISOString().split("T")[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast("Exported snapshots history as JSON file!");
    } catch (err) {
      console.error("Failed to export JSON", err);
    }
  };

  const handleExportSingleSnapshot = (snap: ProjectSnapshot, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snap, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `snapshot-${snap.versionTag}-${snap.projectName.replace(/\s+/g, "_")}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast(`Exported ${snap.versionTag} snapshot!`);
    } catch (err) {
      console.error("Failed to export snapshot", err);
    }
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          const merged = [...parsed, ...snapshots];
          onUpdateSnapshots(merged);
          saveStoredSnapshots(merged);
          showToast(`Imported ${parsed.length} snapshots successfully!`);
        } else if (parsed.id && parsed.configSnapshot) {
          const merged = [parsed, ...snapshots];
          onUpdateSnapshots(merged);
          saveStoredSnapshots(merged);
          showToast(`Imported snapshot ${parsed.versionTag} successfully!`);
        } else {
          alert("Invalid snapshot JSON format.");
        }
      } catch (err) {
        alert("Could not parse the JSON file.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClearAllHistory = () => {
    if (confirm("Are you sure you want to clear all snapshot history? This cannot be undone.")) {
      onUpdateSnapshots([]);
      saveStoredSnapshots([]);
      showToast("Version control history cleared.");
    }
  };

  return (
    <div id="version-control-panel-root" className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto">
      {/* Toast Notification */}
      {snapshotSuccessToast && (
        <div className="fixed top-16 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span className="text-xs font-medium">{snapshotSuccessToast}</span>
        </div>
      )}

      {/* Hidden File Input for JSON Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleImportJson}
      />

      {/* Main Container */}
      <div className="max-w-7xl w-full mx-auto p-6 md:p-8 space-y-6">
        {/* Header Title & Primary Action Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-xs">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    Version Control & Snapshots
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 text-[11px] font-mono font-semibold">
                    Local Storage
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Track full configuration snapshots, inspect screen layout changes, and restore previous versions.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportJson}
              title="Download entire snapshot history as JSON"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Import snapshots from JSON file"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import</span>
            </button>

            <button
              id="take-snapshot-btn"
              type="button"
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Take Snapshot</span>
            </button>
          </div>
        </div>

        {/* Live Project Banner & Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Card 1: Active App Status */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Active Target App</span>
              <Smartphone className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3.5 h-3.5 rounded-full ring-2 ring-slate-100 shrink-0"
                style={{ backgroundColor: currentConfig.primaryColor || "#6750A4" }}
              />
              <span className="font-bold text-slate-900 text-sm truncate">
                {currentConfig.appName}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono truncate">
              {currentConfig.packageName} (v{currentConfig.versionName})
            </div>
          </div>

          {/* Card 2: Screens & Components in Live State */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Current Live Layout</span>
              <Layers className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-900">
                {currentScreens.length}
              </span>
              <span className="text-xs text-slate-500">screens</span>
              <span className="text-slate-300">•</span>
              <span className="text-sm font-semibold text-slate-700">
                {liveComponentCount}
              </span>
              <span className="text-xs text-slate-500">components</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono truncate">
              Launcher: {currentScreens[0]?.name || "Home"}
            </div>
          </div>

          {/* Card 3: Total Saved Snapshots */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Saved Snapshots</span>
              <History className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-900">
                {snapshots.length}
              </span>
              <span className="text-xs text-slate-500">versions logged</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Persistent in browser</span>
            </div>
          </div>

          {/* Card 4: Local Storage Footprint */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Storage Footprint</span>
              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-slate-900">
                {estimatedStorageKb}
              </span>
              <span className="text-xs text-slate-500">KB used</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Key: droidforge_snapshots_history_v1
            </div>
          </div>
        </div>

        {/* Project Architecture & Library Version Audit Dashboard */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden space-y-0">
          <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-900 to-violet-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600/30 border border-violet-500/40 text-violet-400 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-white tracking-tight">
                    Project Architecture & Library Audit
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-400/30 text-[10px] font-mono font-semibold">
                    Live System Audit
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Project Payload Size: <strong className="text-emerald-400 font-mono">{liveProjectSizeFormatted}</strong> • {currentScreens.length} Active Screens • {currentConfig.dependencies?.length || 0} Dependencies
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddDepOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Dependency</span>
              </button>

              <button
                type="button"
                onClick={handleUpgradeAllDependencies}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-xs transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Upgrade All to Latest</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAuditPanel(!showAuditPanel)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                {showAuditPanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {showAuditPanel && (
            <div className="p-6 space-y-6 bg-slate-50/50">
              {/* Row 1: Payload Size, Screen Breakdown & SDK Toolchains */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Box 1: Payload & Storage Calculation */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-violet-600" />
                      App Memory & Payload Size
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Calculated
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      {liveProjectSizeFormatted}
                    </span>
                    <span className="text-xs text-slate-500">JSON footprint</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Includes {currentScreens.length} layout structure models, state logic blocks, assets metadata & M3 design system tokens.
                  </p>
                </div>

                {/* Box 2: Screen Count & Name Breakdown */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                      Screens & Layout Breakdown
                    </span>
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {currentScreens.length} Screens
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1 max-h-24 overflow-y-auto">
                    {currentScreens.map((scr, idx) => (
                      <span
                        key={scr.id || idx}
                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200/80"
                      >
                        <span>{scr.name}</span>
                        {scr.isInitial && (
                          <span className="text-[9px] font-bold px-1 rounded bg-violet-100 text-violet-700">Launcher</span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({scr.rootComponent ? countComponentsInScreens([scr]) : 0} UI)
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Box 3: Toolchain & SDK Versions */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-amber-600" />
                      SDK & Toolchain Versions
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      Target SDK {currentConfig.targetSdk || 35}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                      <span className="text-[10px] text-slate-400 block">Kotlin Compiler</span>
                      <span className="font-bold text-slate-800">v{currentConfig.kotlinVersion || "2.0.21"}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                      <span className="text-[10px] text-slate-400 block">Jetpack Compose</span>
                      <span className="font-bold text-slate-800">v{currentConfig.composeVersion || "1.7.5"}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                      <span className="text-[10px] text-slate-400 block">Gradle Plugin</span>
                      <span className="font-bold text-slate-800">v{currentConfig.gradleVersion || "8.9"}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                      <span className="text-[10px] text-slate-400 block">Compile / Min SDK</span>
                      <span className="font-bold text-slate-800">API {currentConfig.compileSdk || 35} / {currentConfig.minSdk || 24}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Dependencies Audit Table */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-violet-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Active Libraries & Linked Dependencies Audit
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {currentConfig.dependencies?.length || 0} libraries registered in build.gradle.kts
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100/60 border-b border-slate-200/80 text-[11px] font-semibold text-slate-600 font-mono">
                        <th className="py-2.5 px-4">Library / Artifact Name</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Installed Version</th>
                        <th className="py-2.5 px-3">Recommended Version</th>
                        <th className="py-2.5 px-3">Linked Dependencies & Notes</th>
                        <th className="py-2.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {(currentConfig.dependencies || []).map((dep) => {
                        const recVersion = RECOMMENDED_DEPENDENCY_VERSIONS[dep.artifact] || dep.version;
                        const isOutdated = recVersion !== dep.version;

                        return (
                          <tr key={dep.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3 px-4 font-semibold text-slate-900 font-sans">
                              <div className="flex flex-col">
                                <span>{dep.name}</span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {dep.group}:{dep.artifact}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                {dep.category}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-slate-800">
                              v{dep.version}
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                                  isOutdated
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                }`}
                              >
                                v{recVersion}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-sans text-[11px] text-slate-600 max-w-xs truncate">
                              {dep.description || `${dep.name} framework module`}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {isOutdated ? (
                                <button
                                  type="button"
                                  onClick={() => handleUpgradeSingleDependency(dep.id, recVersion)}
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-violet-50 hover:bg-violet-600 text-violet-700 hover:text-white border border-violet-200 hover:border-violet-600 transition cursor-pointer inline-flex items-center gap-1"
                                >
                                  <ArrowUpRight className="w-3 h-3" />
                                  <span>Upgrade to v{recVersion}</span>
                                </button>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Latest</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filter, Search & History Controls */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by version tag, commit message, description..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9.5 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by Type */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setFilterType("all")}
                className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                  filterType === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Types
              </button>
              <button
                type="button"
                onClick={() => setFilterType("milestone")}
                className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                  filterType === "milestone" ? "bg-white text-violet-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Milestones
              </button>
              <button
                type="button"
                onClick={() => setFilterType("manual")}
                className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                  filterType === "manual" ? "bg-white text-blue-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Manual
              </button>
              <button
                type="button"
                onClick={() => setFilterType("auto")}
                className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                  filterType === "auto" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Auto-Saved
              </button>
            </div>

            {/* Filter by Scope */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setFilterProject("current")}
                className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                  filterProject === "current" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Current App
              </button>
              <button
                type="button"
                onClick={() => setFilterProject("all")}
                className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                  filterProject === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Projects
              </button>
            </div>

            {snapshots.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllHistory}
                title="Clear all snapshot history"
                className="text-xs text-rose-600 hover:text-rose-700 px-2 py-1 font-medium hover:bg-rose-50 rounded-lg transition"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Snapshots Timeline & Cards */}
        <div className="space-y-4">
          {filteredSnapshots.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-200/80 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <GitCommit className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                No Snapshots Found
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {searchQuery || filterType !== "all"
                  ? "No version snapshots match your current filters. Try resetting the search or filter settings."
                  : "You haven't recorded any state snapshots yet. Take a snapshot to bookmark your screen layouts and configurations."}
              </p>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Take First Snapshot</span>
              </button>
            </div>
          ) : (
            <div className="relative pl-6 space-y-4 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              {filteredSnapshots.map((snap, idx) => {
                const isExpanded = expandedDiffId === snap.id;
                const isMilestone = snap.type === "milestone";
                const isManual = snap.type === "manual";

                // Compare with current live
                const screensDiffCount = snap.screensCount - currentScreens.length;
                const isColorChanged = snap.configSnapshot.primaryColor !== currentConfig.primaryColor;

                return (
                  <div key={snap.id} className="relative group">
                    {/* Node Circle on Timeline */}
                    <div
                      className={`absolute -left-6 top-5 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-xs ${
                        isMilestone
                          ? "bg-amber-500 text-white ring-2 ring-amber-100"
                          : isManual
                          ? "bg-blue-600 text-white ring-2 ring-blue-100"
                          : "bg-slate-400 text-white ring-2 ring-slate-100"
                      }`}
                    >
                      <GitCommit className="w-3 h-3" />
                    </div>

                    {/* Snapshot Card */}
                    <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition overflow-hidden">
                      <div className="p-5 space-y-3">
                        {/* Row 1: Badges, Title, Time & Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                              {snap.versionTag}
                            </span>

                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                isMilestone
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : isManual
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-slate-100 text-slate-600 border border-slate-200"
                              }`}
                            >
                              {isMilestone ? "Milestone Release" : isManual ? "Manual Checkpoint" : "Auto-Snapshot"}
                            </span>

                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{snap.formattedDate}</span>
                            </span>

                            {idx === 0 && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Latest
                              </span>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => setExpandedDiffId(isExpanded ? null : snap.id)}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span>{isExpanded ? "Hide Diff" : "Inspect Diff"}</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => onForkAsNewApp(snap)}
                              title="Fork this version into a new separate project"
                              className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition flex items-center gap-1 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span className="hidden sm:inline">Fork New App</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleExportSingleSnapshot(snap, e)}
                              title="Export this snapshot as JSON"
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleDeleteSnapshot(snap.id, e)}
                              title="Delete snapshot"
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setRestoreCandidate(snap)}
                              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-violet-50 hover:bg-violet-600 text-violet-700 hover:text-white border border-violet-200 hover:border-violet-600 transition shadow-2xs cursor-pointer ml-1"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Restore</span>
                            </button>
                          </div>
                        </div>

                        {/* Row 2: Commit Message & Description */}
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 leading-snug">
                            {snap.commitMessage}
                          </h4>
                          {snap.description && (
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                              {snap.description}
                            </p>
                          )}
                        </div>

                        {/* Row 3: Metadata chips (screens, components, colors, package) */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs text-slate-600">
                          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-200/60">
                            <Layers className="w-3 h-3 text-slate-400" />
                            <span>{snap.screensCount} screens</span>
                          </div>

                          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-200/60">
                            <Smartphone className="w-3 h-3 text-slate-400" />
                            <span>{snap.componentsCount} components</span>
                          </div>

                          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-200/60 font-mono text-[11px]">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: snap.configSnapshot.primaryColor || "#6750A4" }}
                            />
                            <span>{snap.configSnapshot.primaryColor || "#6750A4"}</span>
                          </div>

                          <span className="text-slate-400 text-xs font-mono truncate max-w-[200px]">
                            {snap.configSnapshot.packageName}
                          </span>

                          {snap.projectsSnapshot && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Workspace Snapshot ({snap.projectsSnapshot.length} apps)
                            </span>
                          )}
                        </div>

                        {/* Screens Chips Preview */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {snap.screensSnapshot.map((scr, sIdx) => (
                            <span
                              key={scr.id || sIdx}
                              className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60"
                            >
                              <span>{scr.name}</span>
                              {scr.isInitial && <span className="text-[9px] text-violet-600 font-bold">(Launcher)</span>}
                            </span>
                          ))}
                        </div>

                        {/* Expandable Side-by-Side Diff Section */}
                        {isExpanded && (
                          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in duration-150">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-800 border-b border-slate-200 pb-2">
                              <span>Snapshot Comparison with Live Application State</span>
                              <span className="text-slate-500 font-mono text-[11px]">
                                Target: {snap.versionTag} vs Current Live
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              {/* Left Column: Snapshot Configuration */}
                              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                                <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider block">
                                  In Snapshot ({snap.versionTag})
                                </span>
                                <div className="space-y-1 font-mono text-[11px] text-slate-600">
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">App Name:</span>
                                    <span className="font-semibold text-slate-800">{snap.configSnapshot.appName}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Version:</span>
                                    <span>{snap.configSnapshot.versionName} ({snap.configSnapshot.versionCode})</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Primary Color:</span>
                                    <div className="flex items-center gap-1">
                                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: snap.configSnapshot.primaryColor }} />
                                      <span>{snap.configSnapshot.primaryColor}</span>
                                    </div>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Screens:</span>
                                    <span className="font-semibold">{snap.screensCount}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Target SDK:</span>
                                    <span>{snap.configSnapshot.targetSdk || 34}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Right Column: Live Configuration */}
                              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                                <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider block">
                                  Current Live Application
                                </span>
                                <div className="space-y-1 font-mono text-[11px] text-slate-600">
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">App Name:</span>
                                    <span className="font-semibold text-slate-800">{currentConfig.appName}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Version:</span>
                                    <span>{currentConfig.versionName} ({currentConfig.versionCode})</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Primary Color:</span>
                                    <div className="flex items-center gap-1">
                                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentConfig.primaryColor }} />
                                      <span className={isColorChanged ? "text-amber-600 font-bold" : ""}>
                                        {currentConfig.primaryColor}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Screens:</span>
                                    <span className={screensDiffCount !== 0 ? "text-blue-600 font-bold" : "font-semibold"}>
                                      {currentScreens.length}
                                      {screensDiffCount !== 0 && ` (${screensDiffCount > 0 ? `-${screensDiffCount}` : `+${Math.abs(screensDiffCount)}`} delta)`}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Target SDK:</span>
                                    <span>{currentConfig.targetSdk || 34}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Screen Layout Comparison Summary */}
                            <div className="pt-2 text-[11px] text-slate-600 flex items-center justify-between">
                              <span className="flex items-center gap-1 text-slate-500">
                                <Info className="w-3.5 h-3.5" />
                                Restoring this version will replace your active screens layout and config values with this snapshot.
                              </span>
                              <button
                                type="button"
                                onClick={() => setRestoreCandidate(snap)}
                                className="font-bold text-violet-700 hover:text-violet-900 cursor-pointer underline"
                              >
                                Restore to this version &rarr;
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* CREATE SNAPSHOT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center">
                  <GitCommit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Take Version Snapshot
                  </h3>
                  <p className="text-xs text-slate-500">
                    Bookmark your app configuration and screen layouts to Local Storage.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateSnapshotSubmit} className="space-y-4 text-xs">
              {/* Version Tag */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">
                  Version Tag / Identifier
                </label>
                <input
                  type="text"
                  required
                  value={newVersionTag}
                  onChange={(e) => setNewVersionTag(e.target.value)}
                  placeholder="e.g. v1.0.4 or v1.1-checkout-redesign"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Snapshot Type */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">
                  Snapshot Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewType("manual")}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition ${
                      newType === "manual"
                        ? "bg-blue-50 border-blue-400 text-blue-900 font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                    <div>
                      <div className="text-xs">Manual Checkpoint</div>
                      <div className="text-[10px] text-slate-500 font-normal">Standard work in progress</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewType("milestone")}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition ${
                      newType === "milestone"
                        ? "bg-amber-50 border-amber-400 text-amber-900 font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <div>
                      <div className="text-xs">Milestone Release</div>
                      <div className="text-[10px] text-slate-500 font-normal">Key feature or build release</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Commit Message */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">
                  Commit Message <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCommitMessage}
                  onChange={(e) => setNewCommitMessage(e.target.value)}
                  placeholder="e.g. Added Checkout screen and refined M3 theme tokens"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Optional Description */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">
                  Detailed Notes / Changelog <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Document modifications, component additions, or bug fixes..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                />
              </div>

              {/* Full workspace snapshot checkbox */}
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAllProjects}
                  onChange={(e) => setIncludeAllProjects(e.target.checked)}
                  className="rounded text-violet-600 focus:ring-violet-500"
                />
                <span className="text-xs text-slate-700 font-medium">
                  Also preserve full workspace projects state ({projects.length} apps)
                </span>
              </label>

              {/* Current Context Summary */}
              <div className="p-3 bg-violet-50/60 rounded-xl border border-violet-100 flex items-center justify-between text-[11px] text-violet-900">
                <span>Saving: <strong>{currentScreens.length} screens</strong>, <strong>{liveComponentCount} components</strong></span>
                <span className="font-mono">{currentConfig.packageName}</span>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save Snapshot</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESTORE CONFIRMATION MODAL */}
      {restoreCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-base">
                Restore Snapshot {restoreCandidate.versionTag}?
              </h3>
              <p className="text-xs text-slate-500">
                You are about to roll back the active application configuration and screen layouts to:
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 font-mono">
              <div className="font-bold text-slate-900">{restoreCandidate.commitMessage}</div>
              <div className="text-[11px] text-slate-500">Recorded: {restoreCandidate.formattedDate}</div>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-700">
                <span>{restoreCandidate.screensCount} screens</span>
                <span>•</span>
                <span>{restoreCandidate.componentsCount} components</span>
                <span>•</span>
                <span>{restoreCandidate.configSnapshot.appName}</span>
              </div>
            </div>

            {/* Auto backup safety option */}
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 cursor-pointer">
              <input
                type="checkbox"
                checked={backupBeforeRestore}
                onChange={(e) => setBackupBeforeRestore(e.target.checked)}
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <div className="text-xs">
                <span className="font-bold text-emerald-900 block">Create safety checkpoint first (Recommended)</span>
                <span className="text-[11px] text-emerald-700">
                  Takes a snapshot of your current state before replacing it, so nothing is ever lost.
                </span>
              </div>
            </label>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRestoreCandidate(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Confirm Restore</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CUSTOM DEPENDENCY MODAL */}
      {isAddDepOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Add New Android Dependency
                  </h3>
                  <p className="text-xs text-slate-500">
                    Register a new Gradle dependency into build.gradle.kts configuration.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleAddDependencySubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">
                  Library Display Name
                </label>
                <input
                  type="text"
                  value={depName}
                  onChange={(e) => setDepName(e.target.value)}
                  placeholder="e.g. Moshi JSON Converter"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-700">
                    Group ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={depGroup}
                    onChange={(e) => setDepGroup(e.target.value)}
                    placeholder="com.squareup.moshi"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-700">
                    Artifact ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={depArtifact}
                    onChange={(e) => setDepArtifact(e.target.value)}
                    placeholder="moshi-kotlin"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-700">
                    Version Tag <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={depVersion}
                    onChange={(e) => setDepVersion(e.target.value)}
                    placeholder="1.15.1"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-700">
                    Category
                  </label>
                  <select
                    value={depCategory}
                    onChange={(e) => setDepCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="Compose">Compose</option>
                    <option value="Networking">Networking</option>
                    <option value="Database">Database</option>
                    <option value="Media">Media</option>
                    <option value="Firebase">Firebase</option>
                    <option value="Native">Native</option>
                    <option value="Utility">Utility</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">
                  Description / Notes
                </label>
                <textarea
                  rows={2}
                  value={depDesc}
                  onChange={(e) => setDepDesc(e.target.value)}
                  placeholder="Notes about linked dependencies or purpose..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                />
              </div>

              <div className="p-3 bg-violet-50 rounded-xl border border-violet-100 font-mono text-[11px] text-violet-900">
                implementation("{depGroup || 'group'}:{depArtifact || 'artifact'}:{depVersion || '1.0.0'}")
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddDepOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Dependency</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
