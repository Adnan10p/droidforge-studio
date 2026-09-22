import React from "react";
import { HelpCircle, X, Zap, ArrowRight, ShieldCheck, Cpu } from "lucide-react";

export interface TriggerHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TriggerHelpModal: React.FC<TriggerHelpModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Trigger Node Guide</h3>
              <p className="text-[11px] text-slate-400">Reactive Events in Jetpack Compose</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            A <strong className="text-amber-300">Trigger Node</strong> represents the entry point of
            an execution flow. It binds directly to a UI component event (like a button click, text input change, or screen lifecycle).
          </p>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-[11px]">
              <Cpu className="w-3.5 h-3.5" />
              <span>Key Capabilities</span>
            </div>
            <ul className="space-y-1.5 text-slate-400 text-[11px]">
              <li className="flex items-center gap-1.5">
                <ArrowRight className="w-3 h-3 text-amber-500" />
                <span>Supports Click, LongClick, OnCreate, TextChanged, ValueChanged</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ArrowRight className="w-3 h-3 text-amber-500" />
                <span>Connect downstream actions sequentially or with conditions</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ArrowRight className="w-3 h-3 text-amber-500" />
                <span>Toggle enable/disable to temporarily mute flow without deleting</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold transition cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
