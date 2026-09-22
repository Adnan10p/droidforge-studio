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
  Eye,
  X,
  Maximize2,
  FileImage,
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
  const [previewAsset, setPreviewAsset] = useState<ProjectAsset | null>(null);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";

      let assetType: ProjectAsset["type"] = "drawable";
      let formatType: ProjectAsset["format"] = "png";
      let targetDir = "res/drawable";

      if (["ttf", "otf", "woff", "woff2"].includes(ext)) {
        assetType = "font";
        formatType = "ttf";
        targetDir = "res/font";
      } else if (["mp3", "wav", "ogg", "flac"].includes(ext)) {
        assetType = "raw";
        formatType = "mp3";
        targetDir = "res/raw";
      } else if (["mp4", "webm", "mkv"].includes(ext)) {
        assetType = "raw";
        formatType = "mp4";
        targetDir = "res/raw";
      } else if (["json", "xml", "txt"].includes(ext)) {
        assetType = "asset";
        formatType = "json";
        targetDir = "assets";
      } else if (["svg"].includes(ext)) {
        assetType = "drawable";
        formatType = "svg";
        targetDir = "res/drawable";
      } else if (["webp"].includes(ext)) {
        assetType = "drawable";
        formatType = "webp";
        targetDir = "res/drawable";
      }

      const sizeKb = (file.size / 1024).toFixed(1);

      reader.onload = () => {
        const newAsset: ProjectAsset = {
          id: `asset_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          fileName: file.name,
          type: assetType,
          format: formatType,
          size: `${sizeKb} KB`,
          url: reader.result as string,
          targetResDir: targetDir,
        };
        onAddAsset(newAsset);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  return (
    <div
      id="asset-manager-container"
      className="flex-1 bg-slate-950 flex flex-col h-full overflow-y-auto text-slate-200 select-none p-6 relative"
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

        {/* Upload / Add Asset Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Option A: Direct File Upload from PC */}
          <div className="md:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-md flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider block mb-1">
                Upload Files from PC
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Select images (.png, .webp, .svg), fonts (.ttf), audio (.mp3), or raw files from your local storage.
              </p>
            </div>
            <label className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg cursor-pointer flex items-center justify-center gap-2 transition active:scale-95 shadow-xs">
              <Upload className="w-4 h-4" />
              <span>Browse PC Files</span>
              <input
                type="file"
                multiple
                accept="image/*,.svg,.ttf,.otf,.mp3,.mp4,.json,.xml,.txt"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {/* Option B: Manual Register Asset */}
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-md">
            <span className="text-xs font-semibold text-white uppercase tracking-wider block">
              Or Register Custom Path Asset
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="e.g. hero_banner or brand_font"
                value={newAssetName}
                onChange={(e) => setNewAssetName(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
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
                className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium py-2 rounded-lg transition border border-slate-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register Entry</span>
              </button>
            </div>
          </div>
        </div>

        {/* Assets Grid with Live Image & SVG Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredAssets.map((asset) => {
            const isImageOrSvg =
              ["png", "webp", "svg", "jpeg", "jpg"].includes(asset.format.toLowerCase()) ||
              asset.type === "drawable" ||
              asset.type === "mipmap";

            let icon = <ImageIcon className="w-5 h-5 text-blue-400" />;
            if (asset.type === "font") icon = <Type className="w-5 h-5 text-amber-400" />;
            if (asset.type === "raw") icon = <FileCode className="w-5 h-5 text-emerald-400" />;

            return (
              <div
                key={asset.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-blue-500/50 transition shadow-xs group relative overflow-hidden"
              >
                <div>
                  {/* Card Header & Preview Button */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700/80">{icon}</div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-900/50 uppercase font-bold">
                        {asset.format}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPreviewAsset(asset)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white transition"
                        title="View Live Image & Asset Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteAsset(asset.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600/80 text-slate-400 hover:text-white transition"
                        title="Remove asset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Live Thumbnail Box */}
                  <div
                    onClick={() => setPreviewAsset(asset)}
                    className="w-full h-32 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-center overflow-hidden cursor-pointer relative group/thumb"
                  >
                    {isImageOrSvg && asset.url ? (
                      <div className="w-full h-full flex items-center justify-center bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] p-2">
                        <img
                          src={asset.url}
                          alt={asset.name}
                          className="max-w-full max-h-full object-contain transition group-hover/thumb:scale-105"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : asset.type === "font" ? (
                      <div className="p-3 text-center">
                        <span className="text-xl font-bold text-amber-400 font-serif block">Aa Bb Cc</span>
                        <span className="text-[10px] text-slate-500 font-mono mt-1 block">Font Specimen</span>
                      </div>
                    ) : asset.format === "mp3" || asset.format === "wav" ? (
                      <div className="flex flex-col items-center gap-1.5">
                        <Volume2 className="w-8 h-8 text-emerald-400 animate-pulse" />
                        <span className="text-[10px] text-slate-400 font-mono">Audio Clip</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-500">
                        <FileCode className="w-8 h-8" />
                        <span className="text-[10px] font-mono">{asset.fileName}</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center gap-1 text-white text-xs font-semibold transition">
                      <Eye className="w-4 h-4 text-blue-400" />
                      <span>Preview</span>
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-white mt-3 truncate font-mono">{asset.name}</h4>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 font-mono">
                    <span>{asset.size}</span>
                    <span className="text-slate-500">{asset.targetResDir}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="truncate text-cyan-400">@{asset.type}/{asset.name.replace(/\.[^/.]+$/, "")}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FULL ASSET PREVIEW MODAL */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col text-slate-100">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  <FileImage className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">{previewAsset.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Target: {previewAsset.targetResDir} • Size: {previewAsset.size}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewAsset(null)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Preview Area */}
            <div className="p-6 bg-slate-950 flex flex-col items-center justify-center min-h-[300px]">
              {previewAsset.url &&
              ["png", "webp", "svg", "jpeg", "jpg"].includes(previewAsset.format.toLowerCase()) ? (
                <div className="w-full max-h-[420px] flex items-center justify-center bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] rounded-xl p-4 border border-slate-800">
                  <img
                    src={previewAsset.url}
                    alt={previewAsset.name}
                    className="max-w-full max-h-[380px] object-contain rounded drop-shadow-md"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : previewAsset.url && (previewAsset.format === "mp3" || previewAsset.format === "wav") ? (
                <div className="w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-xl flex flex-col items-center gap-4">
                  <Volume2 className="w-12 h-12 text-emerald-400 animate-pulse" />
                  <span className="text-sm font-semibold text-white">{previewAsset.fileName}</span>
                  <audio controls src={previewAsset.url} className="w-full" />
                </div>
              ) : (
                <div className="text-center py-8 space-y-2">
                  <FileCode className="w-12 h-12 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-400 font-mono">
                    Resource file registered at: <span className="text-cyan-400">{previewAsset.targetResDir}/{previewAsset.fileName}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-cyan-400">
                Resource Reference: R.{previewAsset.type}.{previewAsset.name.replace(/\.[^/.]+$/, "")}
              </span>
              <button
                onClick={() => setPreviewAsset(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

