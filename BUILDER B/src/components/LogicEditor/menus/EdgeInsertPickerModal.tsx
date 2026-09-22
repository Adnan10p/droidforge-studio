import React, { useEffect, useRef } from "react";
import { Play, GitFork, Clock, Globe, X, Sparkles, MessageSquare, Navigation, CheckCircle2 } from "lucide-react";

export interface EdgeInsertOption {
  type: "action" | "condition" | "delay" | "callApi";
  subType?: string;
  title: string;
  description: string;
  icon: any;
  colorClass: string;
}

export interface EdgeInsertPickerModalProps {
  isOpen: boolean;
  x: number;
  y: number;
  onClose: () => void;
  onSelectOption: (option: EdgeInsertOption) => void;
}

export const EdgeInsertPickerModal: React.FC<EdgeInsertPickerModalProps> = ({
  isOpen,
  x,
  y,
  onClose,
  onSelectOption,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const adjustedX = Math.max(16, Math.min(x - 140, window.innerWidth - 320));
  const adjustedY = Math.max(16, Math.min(y - 80, window.innerHeight - 380));

  const options: EdgeInsertOption[] = [
    {
      type: "action",
      subType: "setProperty",
      title: "Action: Set Property / State",
      description: "Update text, visibility, or component property",
      icon: Play,
      colorClass: "from-blue-500/20 to-blue-600/10 text-blue-400 border-blue-500/30",
    },
    {
      type: "action",
      subType: "showToast",
      title: "Action: Show Toast Notification",
      description: "Display quick Android Toast message popup",
      icon: MessageSquare,
      colorClass: "from-emerald-500/20 to-emerald-600/10 text-emerald-400 border-emerald-500/30",
    },
    {
      type: "action",
      subType: "navigate",
      title: "Action: Navigate to Screen",
      description: "Switch active screen / route in navigation controller",
      icon: Navigation,
      colorClass: "from-cyan-500/20 to-cyan-600/10 text-cyan-400 border-cyan-500/30",
    },
    {
      type: "condition",
      title: "Condition: If / Else Branch",
      description: "Split flow execution based on logic comparison",
      icon: GitFork,
      colorClass: "from-purple-500/20 to-purple-600/10 text-purple-400 border-purple-500/30",
    },
    {
      type: "delay",
      title: "Delay: Wait Timer",
      description: "Pause flow execution for a duration before continuing",
      icon: Clock,
      colorClass: "from-amber-500/20 to-amber-600/10 text-amber-400 border-amber-500/30",
    },
    {
      type: "callApi",
      title: "Call API: Network Request",
      description: "Make HTTP GET/POST call with Success & Error branches",
      icon: Globe,
      colorClass: "from-sky-500/20 to-sky-600/10 text-sky-400 border-sky-500/30",
    },
  ];

  return (
    <div
      ref={popoverRef}
      style={{ left: adjustedX, top: adjustedY }}
      className="fixed z-50 w-72 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-2.5 text-slate-200 animate-in fade-in zoom-in-95 duration-150 select-none"
    >
      <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-slate-800 px-1.5">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
            Insert Connected Node
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-1 max-h-[320px] overflow-y-auto pr-0.5 custom-scrollbar">
        {options.map((opt, i) => {
          const Icon = opt.icon;
          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                onSelectOption(opt);
                onClose();
              }}
              className="w-full p-2 rounded-xl bg-slate-950/40 hover:bg-slate-800/80 border border-slate-800/60 hover:border-slate-600 text-left transition flex items-start gap-2.5 group cursor-pointer"
            >
              <div
                className={`p-2 rounded-lg bg-gradient-to-br ${opt.colorClass} border shrink-0 group-hover:scale-105 transition-transform`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors">
                  {opt.title}
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                  {opt.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
