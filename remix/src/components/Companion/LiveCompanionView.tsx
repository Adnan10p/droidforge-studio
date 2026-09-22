import React, { useState, useEffect } from "react";
import {
  Wifi,
  Battery,
  RotateCw,
  Power,
  Layers,
  Sparkles,
  Smartphone,
  CheckCircle2,
  Terminal,
  Volume2,
  Zap,
} from "lucide-react";
import { AndroidScreen, AndroidComponent, CompanionPayload } from "../../types";

interface LiveCompanionViewProps {
  payload: CompanionPayload | null;
  onRefreshScreen?: () => void;
  onResetConnection?: () => void;
  standalone?: boolean;
}

export const LiveCompanionView: React.FC<LiveCompanionViewProps> = ({
  payload,
  onRefreshScreen,
  onResetConnection,
  standalone = false,
}) => {
  const [showBounds, setShowBounds] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [clickCount, setClickCount] = useState(0);
  const [currentTime, setCurrentTime] = useState("12:00");
  const [isFlashingRefresh, setIsFlashingRefresh] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Flash refresh animation when payload changes
  useEffect(() => {
    if (payload) {
      setIsFlashingRefresh(true);
      const timer = setTimeout(() => setIsFlashingRefresh(false), 500);
      return () => clearTimeout(timer);
    }
  }, [payload?.timestamp]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleComponentClick = (comp: AndroidComponent) => {
    setClickCount((prev) => prev + 1);
    const logicBlock = payload?.screen.logicBlocks?.find(
      (b) => b.targetComponent === comp.id || b.event?.includes(comp.name)
    );

    if (logicBlock && logicBlock.actions?.length > 0) {
      const toastAction = logicBlock.actions.find((a) => a.actionType === "toast");
      if (toastAction?.message) {
        showToast(`[Logic] ${toastAction.message}`);
        return;
      }
    }

    if (comp.props.text) {
      showToast(`Clicked: ${comp.props.text}`);
    } else {
      showToast(`Clicked: ${comp.name} (${comp.type})`);
    }
  };

  if (!payload || !payload.screen) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[350px] bg-slate-950 text-slate-400 rounded-2xl border border-slate-800">
        <Smartphone className="w-12 h-12 text-slate-600 mb-3 animate-pulse" />
        <h4 className="text-sm font-bold text-slate-200">Companion Waiting for Screen Data</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Connect your device or click "Refresh Companion Screen" to stream your Android app layout.
        </p>
      </div>
    );
  }

  const screen = payload.screen;
  const rootComp = screen.rootComponent;
  const theme = payload.theme;
  const bgColor = screen.properties?.backgroundColor || theme?.lightColors.background || "#0F172A";

  const renderComponentTree = (comp: AndroidComponent): React.ReactNode => {
    const p = comp.props || {};
    const boundClass = showBounds
      ? "outline-1 outline-dashed outline-sky-400/80 bg-sky-500/5 relative"
      : "";

    switch (comp.type) {
      case "Toolbar":
        return (
          <div
            key={comp.id}
            id={`companion-${comp.id}`}
            style={{ backgroundColor: p.backgroundColor || "#1E293B" }}
            className={`w-full px-4 py-3 flex items-center justify-between text-white shadow-sm shrink-0 ${boundClass}`}
          >
            <div className="flex items-center gap-2">
              {p.showBackButton && <span className="text-sm cursor-pointer">←</span>}
              <span className="font-bold text-sm">{p.title || screen.name}</span>
            </div>
            {showBounds && (
              <span className="text-[9px] font-mono bg-blue-600 text-white px-1 rounded">
                Toolbar
              </span>
            )}
          </div>
        );

      case "Card":
        return (
          <div
            key={comp.id}
            id={`companion-${comp.id}`}
            onClick={() => handleComponentClick(comp)}
            style={{
              backgroundColor: p.backgroundColor || "#1E293B",
              borderRadius: p.cornerRadius ? `${p.cornerRadius}px` : "16px",
              padding: p.padding ? `${p.padding}px` : "14px",
            }}
            className={`border border-slate-700/60 shadow-md flex flex-col gap-2 my-1.5 transition active:scale-[0.99] cursor-pointer ${boundClass}`}
          >
            {showBounds && (
              <span className="text-[9px] font-mono text-amber-400 self-end">
                Card #{comp.name}
              </span>
            )}
            {comp.children?.map(renderComponentTree)}
          </div>
        );

      case "Text":
        return (
          <div
            key={comp.id}
            id={`companion-${comp.id}`}
            onClick={() => handleComponentClick(comp)}
            style={{
              color: p.textColor || "#F8FAFC",
              fontSize: p.fontSize ? `${p.fontSize}px` : "14px",
              fontWeight: p.fontWeight === "bold" ? "700" : "400",
            }}
            className={`leading-snug cursor-pointer ${boundClass}`}
          >
            {p.text || "Sample Label"}
          </div>
        );

      case "Button":
        return (
          <button
            key={comp.id}
            id={`companion-${comp.id}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleComponentClick(comp);
            }}
            style={{
              backgroundColor: p.backgroundColor || "#6366F1",
              color: p.textColor || "#FFFFFF",
              borderRadius: p.cornerRadius ? `${p.cornerRadius}px` : "10px",
            }}
            className={`w-full py-2.5 px-4 font-semibold text-xs tracking-wide shadow-sm hover:opacity-90 active:scale-95 transition flex items-center justify-center gap-2 ${boundClass}`}
          >
            {p.text || "Click Button"}
          </button>
        );

      case "TextField":
        return (
          <div key={comp.id} id={`companion-${comp.id}`} className={`space-y-1 ${boundClass}`}>
            {p.label && <span className="text-[11px] text-slate-400 font-medium">{p.label}</span>}
            <input
              type="text"
              placeholder={p.hint || "Enter text..."}
              defaultValue={p.text || ""}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        );

      case "Image":
        return (
          <div
            key={comp.id}
            id={`companion-${comp.id}`}
            onClick={() => handleComponentClick(comp)}
            className={`overflow-hidden rounded-xl bg-slate-800 my-1 ${boundClass}`}
          >
            {p.url ? (
              <img
                src={p.url}
                alt=""
                className="w-full h-36 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-24 flex items-center justify-center text-slate-500 text-xs font-mono">
                [Android ImageView]
              </div>
            )}
          </div>
        );

      case "Switch":
        return (
          <div
            key={comp.id}
            id={`companion-${comp.id}`}
            onClick={() => handleComponentClick(comp)}
            className={`flex items-center justify-between py-1.5 cursor-pointer ${boundClass}`}
          >
            <span className="text-xs text-slate-200 font-medium">{p.label || "Switch Option"}</span>
            <div
              className={`w-9 h-5 rounded-full p-0.5 transition ${
                p.checked ? "bg-indigo-600" : "bg-slate-700"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition transform ${
                  p.checked ? "translate-x-4" : ""
                }`}
              />
            </div>
          </div>
        );

      case "Checkbox":
        return (
          <div
            key={comp.id}
            id={`companion-${comp.id}`}
            onClick={() => handleComponentClick(comp)}
            className={`flex items-center gap-2 py-1 cursor-pointer ${boundClass}`}
          >
            <input
              type="checkbox"
              defaultChecked={p.checked}
              className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
            />
            <span className="text-xs text-slate-200">{p.label || "Checkbox Label"}</span>
          </div>
        );

      case "Progress":
        return (
          <div key={comp.id} id={`companion-${comp.id}`} className={`w-full py-1.5 ${boundClass}`}>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${p.value ?? 65}%` }}
              />
            </div>
          </div>
        );

      default:
        // Generic container or unhandled component
        return (
          <div
            key={comp.id}
            id={`companion-${comp.id}`}
            onClick={() => handleComponentClick(comp)}
            className={`flex flex-col gap-2 p-1 ${boundClass}`}
          >
            {showBounds && (
              <span className="text-[9px] font-mono text-slate-400">
                {comp.type} #{comp.name}
              </span>
            )}
            {comp.children?.map(renderComponentTree)}
          </div>
        );
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center select-none ${
        standalone ? "min-h-screen bg-slate-950 p-4" : "w-full"
      }`}
    >
      {/* Companion Phone Bezel Frame */}
      <div className="relative w-full max-w-[340px] bg-black rounded-[42px] p-3 shadow-2xl border-4 border-slate-700/80 ring-1 ring-white/10 overflow-hidden">
        {/* Notch / Dynamic Island */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center gap-2 bg-black px-3 py-1 rounded-full border border-slate-800">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700" />
          <div className="w-2 h-2 rounded-full bg-blue-900/60" />
        </div>

        {/* Screen Container */}
        <div
          style={{ backgroundColor: bgColor }}
          className={`relative w-full h-[580px] rounded-[32px] overflow-hidden flex flex-col transition-all duration-300 ${
            isFlashingRefresh ? "ring-2 ring-emerald-400 shadow-emerald-500/30" : ""
          }`}
        >
          {/* Android Status Bar */}
          <div className="px-5 pt-3 pb-1 flex items-center justify-between text-slate-400 text-[11px] font-semibold tracking-tight shrink-0 select-none z-20">
            <span>{currentTime}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                LIVE
              </span>
              <Wifi className="w-3 h-3 text-slate-300" />
              <Battery className="w-3.5 h-3.5 text-slate-300" />
            </div>
          </div>

          {/* Screen Content Scrollable Canvas */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 flex flex-col">
            {rootComp ? (
              renderComponentTree(rootComp)
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
                Screen is empty
              </div>
            )}
          </div>

          {/* In-Companion Floating Toast Notification */}
          {toastMessage && (
            <div className="absolute bottom-12 left-4 right-4 bg-slate-900/95 backdrop-blur-md border border-slate-700 text-white text-xs px-3.5 py-2 rounded-xl shadow-2xl text-center z-40 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <span className="font-semibold">{toastMessage}</span>
            </div>
          )}

          {/* Android Navigation Bar Pill */}
          <div className="h-5 flex items-center justify-center shrink-0 pb-1">
            <div className="w-28 h-1 rounded-full bg-slate-600/70" />
          </div>
        </div>

        {/* Companion Control Dock under Phone Frame */}
        <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between px-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-emerald-400 font-bold">Connected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowBounds(!showBounds)}
              title="Toggle Layout Bounds (Android Dev Mode)"
              className={`p-1 rounded transition ${
                showBounds ? "bg-indigo-600 text-white" : "hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
            </button>

            {onRefreshScreen && (
              <button
                type="button"
                onClick={onRefreshScreen}
                title="Refresh Companion Screen"
                className="p-1 hover:text-emerald-400 active:rotate-180 transition duration-300"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            )}

            {onResetConnection && (
              <button
                type="button"
                onClick={onResetConnection}
                title="Reset Connection"
                className="p-1 hover:text-rose-400 transition"
              >
                <Power className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
