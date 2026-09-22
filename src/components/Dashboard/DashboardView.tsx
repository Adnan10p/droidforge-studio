import React, { useState, useRef } from "react";
import {
  Plus,
  Zap,
  Palette,
  Globe,
  TrendingUp,
  Download,
  Upload,
  FileJson,
  Check,
  X,
  FileCode,
  Trash2,
  Edit3,
  Copy,
  Search,
  CheckCircle2,
  Clock,
  Laptop,
  Tablet,
  Smartphone,
  ExternalLink,
  Filter,
  BarChart3,
  AlertTriangle,
  FolderPlus,
  Sparkles,
  ArrowRight,
  Layers,
  Sliders,
} from "lucide-react";
import { SavedProject, AndroidScreen, UserProfile } from "../../types";
import { AVATAR_PRESETS } from "../../utils/profileManager";

interface DashboardViewProps {
  projects: SavedProject[];
  currentProjectId: string;
  onOpenProject: (project: SavedProject) => void;
  onDownloadProject: (project: SavedProject) => void;
  onDeleteProject: (projectId: string) => void;
  onDuplicateProject: (project: SavedProject) => void;
  onCreateNewApp: () => void;
  onBrowseTemplates?: () => void;
  onOpenAppSettings?: () => void;
  onOpenBuildModal?: () => void;
  onImportProjects?: (projects: SavedProject[], openFirst?: boolean) => void;
  onOpenBuilderSettings?: () => void;
  userProfile?: UserProfile;
  onOpenProfile?: () => void;
  onOpenAuth?: (mode?: "login" | "register") => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  currentProjectId,
  onOpenProject,
  onDownloadProject,
  onDeleteProject,
  onDuplicateProject,
  onCreateNewApp,
  onImportProjects,
  onOpenBuilderSettings,
  userProfile,
  onOpenProfile,
  onOpenAuth,
}) => {
  const avatarPreset = AVATAR_PRESETS.find((p) => p.id === userProfile?.avatar) || AVATAR_PRESETS[0];
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Published" | "Draft">("All");
  const [projectToDelete, setProjectToDelete] = useState<SavedProject | null>(null);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Import/Export States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importedProjectsPending, setImportedProjectsPending] = useState<SavedProject[] | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [openAfterImport, setOpenAfterImport] = useState(true);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Export All Projects to JSON file
  const handleExportAllProjects = () => {
    try {
      const dataStr =
        "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projects, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute(
        "download",
        `droidforge-projects-backup-${new Date().toISOString().split("T")[0]}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast(`Exported all ${projects.length} projects as JSON!`);
    } catch (err) {
      console.error("Export all failed", err);
      showToast("Failed to export projects.");
    }
  };

  // Export Single Project to JSON file
  const handleExportSingleProject = (project: SavedProject) => {
    try {
      const dataStr =
        "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute(
        "download",
        `project-${project.name.replace(/[^a-zA-Z0-9_-]/g, "_")}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast(`Exported "${project.name}" as JSON!`);
    } catch (err) {
      console.error("Export single project failed", err);
      showToast("Failed to export project.");
    }
  };

  // Robust parser for any imported project, snapshot, or project array
  const parseImportedData = (jsonData: any): SavedProject[] => {
    const normalize = (item: any, index: number): SavedProject | null => {
      if (!item || typeof item !== "object") return null;

      // Format 1: Version Control Snapshot
      if (item.configSnapshot && item.screensSnapshot) {
        return {
          id: `proj_imported_${Date.now()}_${index}`,
          name: item.projectName || item.configSnapshot.appName || "Imported App",
          packageName: item.configSnapshot.packageName || "com.example.importedapp",
          category: "Android App",
          status: "Draft",
          gradient: "from-blue-600 via-indigo-600 to-violet-600",
          updatedAt: "Just now",
          createdAt: new Date().toISOString().split("T")[0],
          screensCount: Array.isArray(item.screensSnapshot) ? item.screensSnapshot.length : 1,
          deploymentsCount: 0,
          viewsCount: "0",
          description: item.commitMessage || item.description || "Imported snapshot",
          config: item.configSnapshot,
          screens: item.screensSnapshot,
          assets: item.assetsSnapshot || [],
        };
      }

      // Format 2: SavedProject or raw app schema
      const name =
        item.name || item.appName || item.config?.appName || `Imported App ${index + 1}`;
      const packageName =
        item.packageName || item.config?.packageName || "com.example.importedapp";
      const screens = Array.isArray(item.screens)
        ? item.screens
        : Array.isArray(item.screensSnapshot)
        ? item.screensSnapshot
        : [];
      const config = item.config || {
        appName: name,
        packageName: packageName,
        versionCode: 1,
        versionName: "1.0.0",
        minSdk: 26,
        targetSdk: 34,
        theme: "system",
        primaryColor: "#6750A4",
        secondaryColor: "#625B71",
        tertiaryColor: "#7D5260",
        backgroundColor: "#FEF7FF",
        surfaceColor: "#FEF7FF",
        fontFamily: "Roboto",
      };
      const assets = Array.isArray(item.assets) ? item.assets : [];

      return {
        id:
          item.id && typeof item.id === "string" && item.id.length > 3
            ? `proj_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 6)}`
            : `proj_imported_${Date.now()}_${index}`,
        name: name,
        packageName: packageName,
        category: item.category || "Android App",
        status: item.status === "Published" ? "Published" : "Draft",
        gradient: item.gradient || "from-blue-600 via-indigo-600 to-violet-600",
        updatedAt: "Just now",
        createdAt: item.createdAt || new Date().toISOString().split("T")[0],
        screensCount: screens.length,
        deploymentsCount: item.deploymentsCount || 0,
        viewsCount: item.viewsCount || "0",
        description: item.description || "Imported Android Project",
        config: config,
        screens: screens,
        assets: assets,
      };
    };

    if (Array.isArray(jsonData)) {
      return jsonData.map((p, idx) => normalize(p, idx)).filter(Boolean) as SavedProject[];
    } else if (jsonData && typeof jsonData === "object") {
      // Check if wrapped in { projects: [...] }
      if (Array.isArray(jsonData.projects)) {
        return jsonData.projects.map((p: any, idx: number) => normalize(p, idx)).filter(Boolean) as SavedProject[];
      }
      const single = normalize(jsonData, 0);
      return single ? [single] : [];
    }
    return [];
  };

  const processJsonFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        const results = parseImportedData(parsed);
        if (results.length === 0) {
          setImportError("The file does not contain a valid Android app configuration or screen layouts.");
          setImportedProjectsPending(null);
        } else {
          setImportError(null);
          setImportedProjectsPending(results);
        }
        setIsImportModalOpen(true);
      } catch (err) {
        setImportError("Could not read JSON file. Please make sure it is a valid JSON format.");
        setImportedProjectsPending(null);
        setIsImportModalOpen(true);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processJsonFile(file);
    }
  };

  const handleConfirmImport = () => {
    if (!importedProjectsPending || importedProjectsPending.length === 0) return;
    if (onImportProjects) {
      onImportProjects(importedProjectsPending, openAfterImport);
    }
    showToast(
      `Imported ${importedProjectsPending.length} project(s) successfully!`
    );
    setIsImportModalOpen(false);
    setImportedProjectsPending(null);
  };

  // Metrics calculation
  const totalAppsCount = projects.length;
  const activeProjectsCount = projects.filter((p) => p.status === "Published" || p.status === "Draft").length;
  const totalDeployments = projects.reduce((acc, p) => acc + (p.deploymentsCount || 1), 0);

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === "All" || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const displayedProjects = showAllProjects ? filteredProjects : filteredProjects.slice(0, 6);

  const confirmDelete = () => {
    if (projectToDelete) {
      onDeleteProject(projectToDelete.id);
      showToast(`"${projectToDelete.name}" was deleted.`);
      setProjectToDelete(null);
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-50 text-slate-800 p-6 md:p-8 lg:p-10 font-sans selection:bg-blue-100">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 1. Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Dashboard
            </h1>
            <p className="text-xs md:text-sm text-slate-500 font-mono mt-1">
              Manage your apps, export backups, and import project configurations
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Hidden File Input for Import */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Export All Projects */}
            <button
              id="dashboard-export-all-btn"
              type="button"
              onClick={handleExportAllProjects}
              title="Export all projects library as a JSON backup file"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 active:scale-98 text-slate-700 font-medium text-xs md:text-sm border border-slate-200/80 shadow-2xs transition duration-150 shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export Projects</span>
            </button>

            {/* Import Project File */}
            <button
              id="dashboard-import-btn"
              type="button"
              onClick={() => {
                setImportError(null);
                setImportedProjectsPending(null);
                setIsImportModalOpen(true);
              }}
              title="Import an Android project from JSON file"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 active:scale-98 text-blue-700 font-medium text-xs md:text-sm border border-blue-200/80 shadow-2xs transition duration-150 shrink-0 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Import Project</span>
            </button>

            {/* Create New App */}
            <button
              id="dashboard-create-app-btn"
              type="button"
              onClick={onCreateNewApp}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-medium text-xs md:text-sm shadow-xs transition duration-150 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create New App</span>
            </button>
          </div>
        </div>

        {/* 2. Stat Metric Cards (4 Cards in a row, Exact match to screenshot) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {/* Card 1: Total Apps */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Apps</span>
              <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <Zap className="w-4 h-4 fill-violet-600/10 stroke-[2.5]" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl md:text-3xl font-bold text-slate-900 font-mono">
                {totalAppsCount}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-1">+2 this month</div>
            </div>
          </div>

          {/* Card 2: Active Projects */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Active Projects</span>
              <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <Palette className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl md:text-3xl font-bold text-slate-900 font-mono">
                {activeProjectsCount}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-1">+1 this week</div>
            </div>
          </div>

          {/* Card 3: Deployments */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Deployments</span>
              <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <Globe className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl md:text-3xl font-bold text-slate-900 font-mono">
                {totalDeployments}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-1">+5 this month</div>
            </div>
          </div>

          {/* Card 4: Page Views / Installs */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Page Views</span>
              <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl md:text-3xl font-bold text-slate-900 font-mono">1.2K</div>
              <div className="text-[11px] text-slate-400 font-mono mt-1">+12% this week</div>
            </div>
          </div>
        </div>

        {/* 3. Recent Projects Section (Exact Match to screenshot layout) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-lg md:text-xl font-bold text-slate-900">Recent Projects</h2>
              <span className="text-xs font-mono text-slate-400">({filteredProjects.length})</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search apps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs w-36 sm:w-48"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-2xs">
                {(["All", "Published", "Draft"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition ${
                      filterStatus === st
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowAllProjects(!showAllProjects)}
                className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-xs font-medium text-slate-700 transition shadow-2xs cursor-pointer shrink-0"
              >
                {showAllProjects ? "Show Less" : "View All"}
              </button>
            </div>
          </div>

          {/* Project Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedProjects.map((project) => {
              const isActive = project.id === currentProjectId;

              return (
                <div
                  key={project.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col group hover:shadow-md ${
                    isActive ? "border-blue-500 ring-2 ring-blue-500/20 shadow-xs" : "border-slate-200/90"
                  }`}
                >
                  {/* Top Colorful Gradient Banner */}
                  <div
                    className={`h-36 bg-gradient-to-r ${project.gradient} relative p-4 flex flex-col justify-between`}
                  >
                    {/* Top Row: Active tag + Status Badge */}
                    <div className="flex items-center justify-between">
                      {isActive ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 text-blue-700 shadow-xs flex items-center gap-1 backdrop-blur-xs">
                          <CheckCircle2 className="w-3 h-3 text-blue-600" />
                          <span>Active in Studio</span>
                        </span>
                      ) : (
                        <span />
                      )}

                      {/* Status Badge (Matches "Published" / "Draft" in screenshot) */}
                      <span
                        className={`px-3 py-0.5 rounded-full text-[11px] font-semibold backdrop-blur-xs shadow-2xs ${
                          project.status === "Published"
                            ? "bg-blue-600/90 text-white"
                            : "bg-white/95 text-slate-800"
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>

                    {/* Banner Overlay Action on Hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          onOpenProject(project);
                          showToast(`Opened "${project.name}" in Studio Builder.`);
                        }}
                        title="Open project in Visual Builder"
                        className="px-3 py-1.5 rounded-lg bg-white/95 text-slate-800 hover:bg-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Open in Builder</span>
                      </button>
                    </div>
                  </div>

                  {/* Card Content (Matches screenshot) */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    {/* Row 1: Title and Category Pill */}
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        onClick={() => onOpenProject(project)}
                        className="font-bold text-slate-900 text-sm md:text-base leading-snug hover:text-blue-600 transition cursor-pointer line-clamp-1"
                      >
                        {project.name}
                      </h3>
                      <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                        {project.category}
                      </span>
                    </div>

                    {/* Short Description */}
                    {project.description && (
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {project.description}
                      </p>
                    )}

                    {/* Row 2: Bottom Meta: Last updated time + Device Responsive Icons */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <span className="font-mono text-[11px]">{project.updatedAt}</span>

                      {/* Device Icons matching screenshot */}
                      <div className="flex items-center gap-2 text-slate-400">
                        <Laptop className="w-3.5 h-3.5 hover:text-slate-600 transition" />
                        <Smartphone className="w-3.5 h-3.5 hover:text-slate-600 transition" />
                      </div>
                    </div>

                    {/* Action Buttons Bar: View/Open ("sk sko"), Download ("downlaod kr sko"), Delete ("del kr sko") */}
                    <div className="pt-2 border-t border-slate-100/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        {/* Download Android Studio Zip */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDownloadProject(project);
                            showToast(`Downloading Android project ZIP for "${project.name}"...`);
                          }}
                          title="Download Android Studio Project ZIP"
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center gap-1 text-[11px] font-medium"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>

                        {/* Export Project JSON */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportSingleProject(project);
                          }}
                          title="Export Project as JSON file"
                          className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition flex items-center gap-1 text-[11px] font-medium"
                        >
                          <FileJson className="w-3.5 h-3.5 text-amber-500" />
                          <span>JSON</span>
                        </button>

                        {/* Clone / Duplicate */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateProject(project);
                            showToast(`Duplicated "${project.name}".`);
                          }}
                          title="Duplicate App Project"
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Delete App */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProjectToDelete(project);
                          }}
                          title="Delete App"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Open in Builder Button */}
                        <button
                          type="button"
                          onClick={() => {
                            onOpenProject(project);
                            showToast(`Opening "${project.name}" in Builder...`);
                          }}
                          className="px-3 py-1 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1 shadow-2xs"
                        >
                          <span>Open in Builder</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProjects.length === 0 && (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 space-y-3">
              <FolderPlus className="w-10 h-10 text-slate-400 mx-auto stroke-1" />
              <div className="text-sm font-semibold text-slate-700">No projects found</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No apps matched your current search or filter. Create a new app, or import an existing project from JSON.
              </p>
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setImportError(null);
                    setImportedProjectsPending(null);
                    setIsImportModalOpen(true);
                  }}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition flex items-center gap-1.5 shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>Import Project</span>
                </button>
                <button
                  type="button"
                  onClick={onCreateNewApp}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
                >
                  + Create New App
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Import Project Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Upload className="w-4.5 h-4.5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Import Android Project</h3>
                  <p className="text-xs text-slate-500">Import any project JSON file, snapshot, or backup</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportedProjectsPending(null);
                  setImportError(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {!importedProjectsPending ? (
                /* Drop Zone */
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingFile(true);
                  }}
                  onDragLeave={() => setIsDraggingFile(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingFile(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) processJsonFile(file);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    isDraggingFile
                      ? "border-blue-500 bg-blue-50/50 scale-99"
                      : "border-slate-200 hover:border-blue-400 hover:bg-slate-50/60 bg-white"
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center mb-3">
                    <FileJson className="w-6 h-6 stroke-[2]" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800">
                    Click to browse or drag & drop JSON file
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Supports DroidForge project exports, backup archives, or Version Control snapshots (.json)
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Select Project JSON</span>
                  </div>
                </div>
              ) : (
                /* Project Preview */
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1.5 text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                      Valid project file recognized ({importedProjectsPending.length} app{importedProjectsPending.length > 1 ? "s" : ""})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setImportedProjectsPending(null);
                        setImportError(null);
                      }}
                      className="text-blue-600 hover:underline text-[11px]"
                    >
                      Choose another file
                    </button>
                  </div>

                  {/* List of projects to be imported */}
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {importedProjectsPending.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-3"
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 font-bold text-sm shadow-2xs"
                          style={{
                            backgroundColor: p.config?.primaryColor || "#3B82F6",
                          }}
                        >
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-bold text-slate-900 truncate">{p.name}</h4>
                            <span className="text-[10px] font-mono px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-600 shrink-0">
                              {p.screens.length} Screen{p.screens.length === 1 ? "" : "s"}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 truncate mt-0.5">
                            {p.packageName}
                          </div>
                          {p.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                              {p.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Options */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={openAfterImport}
                        onChange={(e) => setOpenAfterImport(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                      <span>Open first imported app in Studio Builder right away</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Error Box */}
              {importError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <div className="flex-1">{importError}</div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportedProjectsPending(null);
                  setImportError(null);
                }}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200/70 font-medium text-xs transition"
              >
                Cancel
              </button>

              {importedProjectsPending && (
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    Import {importedProjectsPending.length > 1 ? `${importedProjectsPending.length} Projects` : "Project"}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Project?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-slate-800">"{projectToDelete.name}"</span>?
                This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete App</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-800 text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
