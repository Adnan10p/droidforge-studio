import React, { useState, useEffect } from "react";
import { AndroidScreen, AndroidComponent, ProjectConfig } from "../types";
import { RefreshCw, Wifi, ArrowLeft, Check, Sparkles, Smartphone, Play, Search, Bell, Heart, Share2, Settings, Home } from "lucide-react";

interface CompanionLiveState {
  config: ProjectConfig | null;
  screens: AndroidScreen[];
  currentScreenId: string;
  updatedAt: string;
}

export const CompanionLiveRunner: React.FC = () => {
  const [liveState, setLiveState] = useState<CompanionLiveState | null>(null);
  const [activeScreenId, setActiveScreenId] = useState<string>("");
  const [lastSyncTime, setLastSyncTime] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [checkboxValues, setCheckboxValues] = useState<Record<string, boolean>>({});
  const [activeTabIdx, setActiveTabIdx] = useState<number>(0);

  // Poll server for live state updates from DroidForge Studio
  const fetchLiveState = async () => {
    try {
      const res = await fetch("/api/companion/live-state");
      if (res.ok) {
        const data: CompanionLiveState = await res.json();
        if (data && data.screens && data.screens.length > 0) {
          setLiveState(data);
          setLastSyncTime(new Date().toLocaleTimeString());
        }
      }
    } catch (e) {
      console.warn("Companion live fetch error:", e);
    }
  };

  useEffect(() => {
    fetchLiveState();
    const interval = setInterval(fetchLiveState, 600);
    return () => clearInterval(interval);
  }, []);

  // Sync activeScreenId automatically whenever PC builder switches active screen
  useEffect(() => {
    if (liveState?.currentScreenId && liveState.screens.some((s) => s.id === liveState.currentScreenId)) {
      setActiveScreenId(liveState.currentScreenId);
    } else if (liveState?.screens && liveState.screens.length > 0 && (!activeScreenId || !liveState.screens.some((s) => s.id === activeScreenId))) {
      setActiveScreenId(liveState.screens[0].id);
    }
  }, [liveState?.currentScreenId, liveState?.updatedAt]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const [componentPropOverrides, setComponentPropOverrides] = useState<Record<string, Record<string, any>>>({});

  const handleComponentClick = async (comp: AndroidComponent, currentScreen: AndroidScreen) => {
    const overrideP = componentPropOverrides[comp.id] || {};
    const p = { ...(comp.props || {}), ...overrideP };

    // Execute custom Logic Blocks
    const blocks = currentScreen.logicBlocks?.filter(
      (b) => (b as any).targetComponent === comp.id || b.event?.startsWith(`${comp.name}.`)
    ) || [];

    if (blocks.length === 0) {
      if (comp.type === "Button") {
        showToast(`${p.text || comp.name || "Button"} clicked!`);
      }
      return;
    }

    blocks.forEach((block) => {
      (block.actions || []).forEach((act) => {
        const actTypeStr = act.actionType as string;
        switch (act.actionType) {
          case "toast":
            showToast(act.message || `${p.text || comp.name} clicked!`);
            break;
          case "navigate":
            if (act.targetScreen) {
              const target = liveState?.screens.find((s) => s.name === act.targetScreen || s.id === act.targetScreen);
              if (target) {
                setActiveScreenId(target.id);
                showToast(`Navigated to ${target.name}`);
              } else {
                showToast(`Navigating to: ${act.targetScreen}`);
              }
            }
            break;
          case "setProperty":
          case "setVisibility" as any:
            if (act.targetId) {
              const propName = act.property || (actTypeStr === "setVisibility" ? "visibility" : "text");
              const propVal = act.value !== undefined ? act.value : (actTypeStr === "setVisibility" ? "visible" : "");
              setComponentPropOverrides((prev) => ({
                ...prev,
                [act.targetId!]: { ...(prev[act.targetId!] || {}), [propName]: propVal },
              }));
              showToast(`Updated ${propName} = ${propVal}`);
            }
            break;
          case "openBrowser":
            if (act.url) window.open(act.url, "_blank");
            break;
          case "copyToClipboard":
            if (act.value) {
              navigator.clipboard.writeText(act.value);
              showToast("Copied to clipboard!");
            }
            break;
          default:
            showToast(`Action: ${act.actionType}`);
            break;
        }
      });
    });
  };

  if (!liveState || !liveState.screens || liveState.screens.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-4 text-indigo-400 animate-pulse">
          <Wifi className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white mb-2">
          DroidForge Live Companion
        </h1>
        <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
          Waiting for DroidForge Studio project live stream... Make changes in Studio on your PC and they will appear live right here!
        </p>
        <button
          onClick={fetchLiveState}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 animate-spin-slow" />
          <span>Connect Now</span>
        </button>
      </div>
    );
  }

  const currentScreen = liveState.screens.find((s) => s.id === activeScreenId) || liveState.screens[0];
  const screenProps = currentScreen.properties || {};
  const primaryThemeColor = screenProps.primaryColor || "#4F46E5";
  const screenBgColor = screenProps.backgroundColor || "#FFFFFF";
  const isTitleVisible = screenProps.titleVisible !== false;
  const appName = liveState.config?.appName || "DroidForge App";

  // Component Renderer
  const renderComponent = (comp: AndroidComponent, inHorizontal = false): React.ReactNode => {
    const p = { ...(comp.props || {}), ...(componentPropOverrides[comp.id] || {}) };
    const key = comp.id;

    // Check visibility property (visible | invisible | gone)
    const vis = p.visibility || (p.visible === false ? "gone" : "visible");
    if (vis === "gone") return null;

    const node = renderComponentInner(comp, inHorizontal);
    if (!node) return null;

    if (vis === "invisible") {
      return (
        <div key={`vis-${key}`} style={{ visibility: "hidden" }} className={inHorizontal ? "flex-initial shrink-0" : "w-full"}>
          {node}
        </div>
      );
    }
    return node;
  };

  const renderComponentInner = (comp: AndroidComponent, inHorizontal = false): React.ReactNode => {
    const p = { ...(comp.props || {}), ...(componentPropOverrides[comp.id] || {}) };
    const key = comp.id;
    const typeLower = (comp.type || "").toLowerCase();
    const nameLower = (comp.name || "").toLowerCase();

    // Archetype checks
    const isYouTube =
      typeLower.includes("youtube") ||
      nameLower.includes("youtube") ||
      typeLower.includes("ytplayer") ||
      comp.type === "YouTube Player" ||
      comp.type === "YouTubePlayer";

    if (isYouTube) {
      const videoTitle = p.videoTitle || p.title || p.text || comp.name || "YouTube Video Player";
      const duration = p.duration || "10:24";
      const channel = p.channel || p.author || "DroidForge Studio";

      const urlCandidates = [p.url, p.videoUrl, ...Object.values(inputValues)].filter(Boolean);
      let matchedVideoId = "";
      for (const u of urlCandidates) {
        const m = String(u).match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        if (m && m[1]) {
          matchedVideoId = m[1];
          break;
        }
      }

      if (matchedVideoId) {
        return (
          <div key={key} className="w-full my-2 rounded-2xl overflow-hidden border border-red-500/40 bg-black shadow-xl select-none">
            <div className="px-3 py-2 bg-gradient-to-r from-red-950 via-black to-slate-900 border-b border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-red-600 flex items-center justify-center text-white shadow-xs">
                  <Play className="w-3 h-3 fill-white translate-x-0.5" />
                </div>
                <span className="font-bold tracking-tight text-[11px] text-red-400">Playing YouTube Stream</span>
              </div>
              <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                LIVE STREAM
              </span>
            </div>
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${matchedVideoId}?autoplay=1`}
                title={videoTitle}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        );
      }

      return (
        <div key={key} className="w-full my-2 rounded-2xl overflow-hidden border border-red-500/30 bg-[#0F0F0F] text-white shadow-xl select-none">
          <div className="px-3 py-2 bg-gradient-to-r from-red-950/80 via-black to-slate-900 border-b border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-red-600 flex items-center justify-center text-white shadow-xs">
                <Play className="w-3 h-3 fill-white translate-x-0.5" />
              </div>
              <span className="font-bold tracking-tight text-[11px] text-red-400">YouTube Player</span>
            </div>
            <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800/60">
              4K ULTRA HD
            </span>
          </div>

          <div className="relative aspect-video bg-gradient-to-br from-slate-900 via-zinc-900 to-black flex items-center justify-center group overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-900/30 via-violet-950/20 to-black opacity-80" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative z-10 w-14 h-10 bg-red-600 text-white rounded-xl shadow-2xl flex items-center justify-center border border-red-400/40">
              <Play className="w-6 h-6 fill-white translate-x-0.5" />
            </div>

            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-xs text-[10px] font-mono font-bold text-white border border-white/10">
              {duration}
            </div>

            <div className="absolute top-2 left-2 right-2 text-xs font-semibold drop-shadow-md truncate text-slate-100 flex items-center gap-1.5">
              <span>{videoTitle}</span>
            </div>

            <div className="absolute bottom-2 left-2 text-[10px] text-slate-400 font-medium truncate drop-shadow-sm">
              by {channel}
            </div>
          </div>
        </div>
      );
    }

    switch (comp.type) {
      case "Toolbar":
        if (!isTitleVisible) return null;
        return (
          <div
            key={key}
            style={{ backgroundColor: p.backgroundColor || primaryThemeColor }}
            className="w-full px-4 py-3 text-white flex items-center justify-between shadow-sm sticky top-0 z-20"
          >
            <div className="flex items-center gap-3">
              {p.showBackButton && (
                <button
                  onClick={() => {
                    const initial = liveState.screens.find((s) => s.isInitial) || liveState.screens[0];
                    if (initial) setActiveScreenId(initial.id);
                  }}
                  className="text-white hover:opacity-80 transition cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <h2 className="text-base font-bold tracking-tight truncate max-w-[200px]">
                {p.title || currentScreen.title || appName}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-white/80 cursor-pointer" />
              <Bell className="w-4 h-4 text-white/80 cursor-pointer" />
            </div>
          </div>
        );

      case "Text":
      case "Text Label":
      case "TextView":
        return (
          <div
            key={key}
            onClick={() => handleComponentClick(comp, currentScreen)}
            style={{
              color: p.textColor || "#0F172A",
              fontSize: `${p.fontSize || 16}px`,
              fontWeight: p.fontWeight === "bold" ? 700 : 400,
              padding: `${p.padding !== undefined ? p.padding : 8}px`,
              margin: `${p.margin || 0}px`,
              backgroundColor: p.backgroundColor || "transparent",
              borderRadius: p.cornerRadius !== undefined ? `${p.cornerRadius}px` : undefined,
            }}
            className={`${inHorizontal ? "flex-initial shrink-0" : "w-full"} leading-snug cursor-pointer transition active:opacity-75`}
          >
            {p.text || comp.name || "Text Label"}
          </div>
        );

      case "Button": {
        const variant = p.variant || "filled";
        const radius = p.cornerRadius !== undefined ? p.cornerRadius : 12;
        let bg = p.backgroundColor || "#2563EB";
        let textColor = p.textColor || "#FFFFFF";
        let border = "none";

        if (variant === "outlined") {
          bg = "transparent";
          textColor = p.textColor || "#2563EB";
          border = "1px solid #2563EB";
        } else if (variant === "text") {
          bg = "transparent";
          textColor = p.textColor || "#2563EB";
        }

        return (
          <button
            key={key}
            onClick={() => handleComponentClick(comp, currentScreen)}
            style={{
              backgroundColor: bg,
              color: textColor,
              borderRadius: `${radius}px`,
              padding: `${p.padding !== undefined ? p.padding : 12}px 20px`,
              margin: `${p.margin !== undefined ? p.margin : 6}px 0`,
              fontSize: `${p.fontSize || 14}px`,
              border,
            }}
            className={`${inHorizontal ? "flex-initial shrink-0" : "w-full"} font-bold shadow-md transition active:scale-98 cursor-pointer flex items-center justify-center gap-2`}
          >
            <span>{p.text || comp.name || "Click Action"}</span>
          </button>
        );
      }

      case "TextField":
      case "Text Input":
      case "Password Input":
        return (
          <div key={key} style={{ margin: `${p.margin !== undefined ? p.margin : 6}px 0` }} className={inHorizontal ? "flex-1 min-w-[100px]" : "w-full"}>
            <input
              type={comp.type === "Password Input" ? "password" : "text"}
              placeholder={p.hint || "Enter text..."}
              value={inputValues[comp.id] ?? p.text ?? ""}
              onChange={(e) => setInputValues({ ...inputValues, [comp.id]: e.target.value })}
              style={{
                backgroundColor: p.backgroundColor || "#FFFFFF",
                color: p.textColor || "#0F172A",
                borderRadius: `${p.cornerRadius !== undefined ? p.cornerRadius : 12}px`,
                padding: `${p.padding !== undefined ? p.padding : 10}px 16px`,
                fontSize: `${p.fontSize || 14}px`,
              }}
              className="w-full border border-slate-300 focus:outline-none focus:border-indigo-500 shadow-xs transition"
            />
          </div>
        );

      case "Horizontal Layout":
      case "HorizontalLayout":
      case "Horizontal Scroll Layout":
      case "HorizontalScrollLayout":
      case "Row": {
        const alignH = p.alignHorizontal || p.horizontalAlignment || "left";
        const alignV = p.alignVertical || p.verticalAlignment || "center";
        const justifyClass =
          alignH === "right" ? "justify-end" :
          alignH === "center" ? "justify-center" :
          alignH === "space-between" ? "justify-between" : "justify-start";
        const itemsClass =
          alignV === "bottom" ? "items-end" :
          alignV === "top" ? "items-start" : "items-center";

        return (
          <div
            key={key}
            style={{
              padding: `${p.padding !== undefined ? p.padding : 8}px`,
              backgroundColor: p.backgroundColor || "transparent",
              borderRadius: `${p.cornerRadius !== undefined ? p.cornerRadius : 8}px`,
              margin: `${p.margin !== undefined ? p.margin : 4}px 0`,
              minHeight: `${p.layoutHeight && typeof p.layoutHeight === "number" ? p.layoutHeight + 'px' : 'auto'}`,
              boxShadow: p.elevation ? `0 ${p.elevation * 2}px ${p.elevation * 4}px rgba(0,0,0,0.1)` : "none",
            }}
            className={`w-full flex flex-row items-center gap-2 ${justifyClass} ${itemsClass}`}
          >
            {comp.children && comp.children.length > 0 ? comp.children.map((c) => renderComponent(c, true)) : null}
          </div>
        );
      }

      case "Vertical Layout":
      case "VerticalLayout":
      case "Column":
      case "Container":
      case "Box":
      case "ScrollView":
      case "Scroll Layout":
      case "ScrollLayout": {
        const alignH = p.alignHorizontal || p.horizontalAlignment || "left";
        const alignV = p.alignVertical || p.verticalAlignment || "top";
        const itemsClass =
          alignH === "right" ? "items-end" :
          alignH === "center" ? "items-center" : "items-stretch";
        const justifyClass =
          alignV === "bottom" ? "justify-end" :
          alignV === "center" ? "justify-center" :
          alignV === "space-between" ? "justify-between" : "justify-start";

        return (
          <div
            key={key}
            style={{
              padding: `${p.padding !== undefined ? p.padding : 8}px`,
              backgroundColor: p.backgroundColor || "transparent",
              borderRadius: `${p.cornerRadius !== undefined ? p.cornerRadius : 8}px`,
              margin: `${p.margin !== undefined ? p.margin : 4}px 0`,
              minHeight: `${p.layoutHeight && typeof p.layoutHeight === "number" ? p.layoutHeight + 'px' : 'auto'}`,
              boxShadow: p.elevation ? `0 ${p.elevation * 2}px ${p.elevation * 4}px rgba(0,0,0,0.1)` : "none",
            }}
            className={`w-full flex flex-col gap-2 ${justifyClass} ${itemsClass}`}
          >
            {comp.children && comp.children.length > 0 ? comp.children.map((c) => renderComponent(c, false)) : null}
          </div>
        );
      }

      case "Card":
      case "Card Layout":
      case "CardLayout":
      case "Glassmorphism Card": {
        const radius = p.cornerRadius !== undefined ? p.cornerRadius : 16;
        return (
          <div
            key={key}
            style={{
              backgroundColor: p.backgroundColor || "#FFFFFF",
              color: "#0F172A",
              borderRadius: `${radius}px`,
              padding: `${p.padding !== undefined ? p.padding : 16}px`,
              margin: `${p.margin !== undefined ? p.margin : 6}px 0`,
              boxShadow: p.elevation ? `0 ${p.elevation * 2}px ${p.elevation * 4}px rgba(0,0,0,0.1)` : "0 2px 8px rgba(0,0,0,0.06)",
            }}
            className={`${inHorizontal ? "flex-1 min-w-[120px]" : "w-full"} flex flex-col gap-2 relative transition-all`}
          >
            {comp.children && comp.children.length > 0 ? comp.children.map((c) => renderComponent(c, false)) : null}
          </div>
        );
      }

      case "Checkbox": {
        const isChecked = checkboxValues[comp.id] ?? (p.checked !== false);
        return (
          <label
            key={key}
            onClick={() => setCheckboxValues({ ...checkboxValues, [comp.id]: !isChecked })}
            className="flex items-center gap-3 py-2 cursor-pointer select-none"
          >
            <div
              className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                isChecked ? "bg-indigo-600 border-indigo-600 text-white shadow-xs" : "border-slate-400 bg-white"
              }`}
            >
              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <span className="text-sm font-medium text-slate-800">{p.text || "Option"}</span>
          </label>
        );
      }

      case "Switch": {
        const isSwitched = checkboxValues[comp.id] ?? (p.checked !== false);
        return (
          <div
            key={key}
            onClick={() => setCheckboxValues({ ...checkboxValues, [comp.id]: !isSwitched })}
            className="flex items-center justify-between py-2 cursor-pointer select-none"
          >
            <span className="text-sm font-medium text-slate-800">{p.text || "Enable option"}</span>
            <div
              className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                isSwitched ? "bg-indigo-600 justify-end" : "bg-slate-300 justify-start"
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-md" />
            </div>
          </div>
        );
      }

      case "Recycler/List": {
        const items = p.items || ["Item 1", "Item 2", "Item 3", "Item 4"];
        return (
          <div key={key} className="w-full bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-sm my-2 overflow-hidden">
            {items.map((it: string, idx: number) => (
              <div
                key={idx}
                onClick={() => showToast(`Selected: ${it}`)}
                className="px-4 py-3 text-sm text-slate-700 font-medium hover:bg-slate-50 transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <span>{it}</span>
                </div>
                <span className="text-xs text-slate-400">›</span>
              </div>
            ))}
          </div>
        );
      }

      case "Image":
      case "Image View":
        return (
          <div
            key={key}
            style={{
              margin: `${p.margin !== undefined ? p.margin : 6}px 0`,
              padding: `${p.padding || 0}px`,
              borderRadius: `${p.cornerRadius || 12}px`,
            }}
            className={`${inHorizontal ? "flex-1 min-w-[80px]" : "w-full"} overflow-hidden flex items-center justify-center`}
          >
            {p.url ? (
              <img
                src={p.url}
                alt={p.alt || "Component"}
                style={{
                  height: p.layoutHeight && typeof p.layoutHeight === "number" ? `${p.layoutHeight}px` : "auto",
                  maxHeight: "300px",
                  borderRadius: `${p.cornerRadius || 12}px`,
                }}
                className="w-full object-cover"
              />
            ) : (
              <div className="w-full py-8 bg-slate-100 rounded-xl text-center text-slate-400 text-xs font-semibold flex flex-col items-center gap-1">
                <span>📷 Image Component</span>
              </div>
            )}
          </div>
        );

      case "Video":
      case "ExoPlayer":
      case "WebView":
        return (
          <div key={key} className="w-full my-2 bg-slate-900 rounded-2xl overflow-hidden shadow-md border border-slate-800 p-4 text-center text-white space-y-2">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center mx-auto text-white shadow-md">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
            <div className="text-xs font-bold">{p.title || comp.name || "Media Player Container"}</div>
            <div className="text-[10px] text-slate-400 font-mono">{p.url || "https://youtube.com/..."}</div>
          </div>
        );

      default:
        if (comp.children && comp.children.length > 0) {
          const isRow = p.orientation === "horizontal" || comp.type === "Row" || comp.type?.toLowerCase().includes("horizontal");
          return (
            <div
              key={key}
              style={{
                backgroundColor: p.backgroundColor || "transparent",
                padding: `${p.padding !== undefined ? p.padding : 8}px`,
                margin: `${p.margin !== undefined ? p.margin : 4}px 0`,
                borderRadius: p.cornerRadius !== undefined ? `${p.cornerRadius}px` : undefined,
              }}
              className={`w-full flex ${isRow ? "flex-row gap-2 items-center" : "flex-col gap-2"}`}
            >
              {comp.children.map((c) => renderComponent(c, isRow))}
            </div>
          );
        }

        return (
          <div
            key={key}
            onClick={() => handleComponentClick(comp, currentScreen)}
            style={{
              backgroundColor: p.backgroundColor || "#F8FAFC",
              color: p.textColor || "#334155",
              borderRadius: `${p.cornerRadius || 8}px`,
              padding: `${p.padding || 8}px`,
              margin: `${p.margin || 4}px 0`,
            }}
            className={`${inHorizontal ? "flex-initial shrink-0" : "w-full"} text-xs font-semibold cursor-pointer shadow-2xs transition`}
          >
            {p.text || comp.name || comp.type}
          </div>
        );
    }
  };

  return (
    <div
      style={{ backgroundColor: screenBgColor }}
      className="w-full min-h-screen flex flex-col font-sans relative overflow-x-hidden select-none"
    >
      {/* System Status Bar / Action Bar Header */}
      {isTitleVisible && !currentScreen.rootComponent.children?.some((c) => c.type === "Toolbar") && (
        <div
          style={{ backgroundColor: primaryThemeColor }}
          className="w-full px-4 py-3.5 text-white font-bold text-base shadow-sm flex items-center justify-between shrink-0"
        >
          <span>{currentScreen.title || currentScreen.name || appName}</span>
          {liveState.screens.length > 1 && (
            <select
              value={activeScreenId}
              onChange={(e) => setActiveScreenId(e.target.value)}
              className="bg-white/20 text-white border-0 rounded text-[11px] px-2 py-1 font-bold focus:outline-none"
            >
              {liveState.screens.map((scr) => (
                <option key={scr.id} value={scr.id} className="bg-slate-900 text-white">
                  {scr.name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Dynamic Screen Content - 100% Edge-to-Edge */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {currentScreen.rootComponent.children && currentScreen.rootComponent.children.length > 0 ? (
          currentScreen.rootComponent.children.map(renderComponent)
        ) : (
          <div className="h-56 flex flex-col items-center justify-center text-slate-400 text-xs font-medium italic space-y-2">
            <Smartphone className="w-8 h-8 text-slate-500" />
            <span>Empty Screen layout. Add components in DroidForge Studio!</span>
          </div>
        )}
      </div>

      {/* Material 3 Navigation Bar (Bottom Nav) */}
      {screenProps.showBottomNav && (
        <div className="w-full bg-slate-900 border-t border-slate-800 py-2.5 px-6 flex items-center justify-around text-slate-400 shrink-0 z-30">
          <button onClick={() => setActiveTabIdx(0)} className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeTabIdx === 0 ? "text-indigo-400" : "hover:text-slate-200"}`}>
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
          <button onClick={() => setActiveTabIdx(1)} className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeTabIdx === 1 ? "text-indigo-400" : "hover:text-slate-200"}`}>
            <Search className="w-4 h-4" />
            <span>Explore</span>
          </button>
          <button onClick={() => setActiveTabIdx(2)} className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeTabIdx === 2 ? "text-indigo-400" : "hover:text-slate-200"}`}>
            <Heart className="w-4 h-4" />
            <span>Favorites</span>
          </button>
          <button onClick={() => setActiveTabIdx(3)} className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeTabIdx === 3 ? "text-indigo-400" : "hover:text-slate-200"}`}>
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      )}

      {/* Live Toast Popup Overlay */}
      {toastMessage && (
        <div className="absolute bottom-12 left-4 right-4 z-50 bg-slate-900/95 text-white border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xl flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

