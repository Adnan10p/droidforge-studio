import React, { useState } from "react";
import {
  FolderArchive,
  Upload,
  Image as ImageIcon,
  Type,
  FileCode,
  Volume2,
  Trash2,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { ProjectAsset } from "../../types";

interface AssetManagerPanelProps {
  assets: ProjectAsset[];
  onAddAsset: (asset: ProjectAsset) => void;
  onDeleteAsset: (id: string) => void;
}

export const AssetManagerPanel: React.FC<AssetManagerPanelProps> = ({
  assets,
  onAddAsset,
  onDeleteAsset,
}) => {
  const [activeDirFilter, setActiveDirFilter] = useState<string>("all");
  const [newAssetName, setNewAssetName] = useState("");
  const [newAssetType, setNewAssetType] = useState<ProjectAsset["type"]>("drawable");
  const [newAssetFormat, setNewAssetFormat] = useState<ProjectAsset["format"]>("png");

  const filterDirs = ["all", "res/drawable", "res/mipmap", "res/font", "res/raw", "assets"];

  const filteredAssets = assets.filter((a) => {
    if (activeDirFilter === "all") return true;
    return a.targetResDir.startsWith(activeDirFilter);
  });

  const handleCreateAsset = () => {
    if (!newAssetName.trim()) return;

    let targetDir = "res/drawable";
    if (newAssetType === "font") targetDir = "res/font";
    else if (newAssetType === "raw") targetDir = "res/raw";
    else if (newAssetType === "mipmap") targetDir = "res/mipmap-xxxhdpi";
    else if (newAssetType === "asset") targetDir = "assets";

    const cleanFileName = newAssetName.includes(".")
      ? newAssetName
      : `${newAssetName}.${newAssetFormat}`;

    const newAsset: ProjectAsset = {
      id: `asset_${Date.now()}`,
      name: cleanFileName,
      fileName: cleanFileName,
      type: newAssetType,
      format: newAssetFormat,
      size: `${Math.floor(10 + Math.random() * 400)} KB`,
      targetResDir: targetDir,
    };

    onAddAsset(newAsset);
    setNewAssetName("");
  };

  return (
    <div
      id="asset-manager-container"
      className="flex-1 bg-slate-950 flex flex-col h-full overflow-y-auto text-slate-200 select-none p-6"
    >
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <FolderArchive className="w-5 h-5 text-blue-400" />
              <span>Project Resource & Asset Manager</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Automatically packages into <span className="font-mono text-cyan-400">res/drawable</span>,{" "}
              <span className="font-mono text-cyan-400">res/mipmap</span>,{" "}
              <span className="font-mono text-cyan-400">res/font</span>,{" "}
              <span className="font-mono text-cyan-400">res/raw</span>, and{" "}
              <span className="font-mono text-cyan-400">assets/</span>.
            </p>
          </div>

          {/* Directory Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start overflow-x-auto">
            {filterDirs.map((dir) => (
              <button
                key={dir}
                onClick={() => setActiveDirFilter(dir)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition whitespace-nowrap ${
                  activeDirFilter === dir ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {dir}
              </button>
            ))}
          </div>
        </div>

        {/* Upload / Add Asset Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-md">
          <span className="text-xs font-semibold text-white uppercase tracking-wider block">
            Import Asset File
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <input
              type="text"
              placeholder="e.g. hero_banner or brand_font"
              value={newAssetName}
              onChange={(e) => setNewAssetName(e.target.value)}
              className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
            />
            <select
              value={newAssetType}
              onChange={(e) => setNewAssetType(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 font-mono"
            >
              <option value="drawable">res/drawable</option>
              <option value="mipmap">res/mipmap</option>
              <option value="font">res/font</option>
              <option value="raw">res/raw</option>
              <option value="asset">assets/</option>
            </select>
            <button
              onClick={handleCreateAsset}
              className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium py-2 rounded-lg transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Asset</span>
            </button>
          </div>
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredAssets.map((asset) => {
            let icon = <ImageIcon className="w-5 h-5 text-blue-400" />;
            if (asset.type === "font") icon = <Type className="w-5 h-5 text-amber-400" />;
            if (asset.type === "raw") icon = <FileCode className="w-5 h-5 text-emerald-400" />;

            return (
              <div
                key={asset.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition shadow-xs group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-lg bg-slate-800 border border-slate-700/80">{icon}</div>
                    <button
                      onClick={() => onDeleteAsset(asset.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 p-1 rounded transition"
                      title="Remove asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-xs font-bold text-white mt-3 truncate font-mono">{asset.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-900/50">
                      {asset.format.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{asset.size}</span>
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="truncate">{asset.targetResDir}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
