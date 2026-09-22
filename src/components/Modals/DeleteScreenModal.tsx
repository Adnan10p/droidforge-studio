import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { AndroidScreen } from "../../types";

interface DeleteScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  screen: AndroidScreen | null;
  totalScreens: number;
  onConfirmDelete: (screenId: string) => void;
}

export const DeleteScreenModal: React.FC<DeleteScreenModalProps> = ({
  isOpen,
  onClose,
  screen,
  totalScreens,
  onConfirmDelete,
}) => {
  if (!isOpen || !screen) return null;

  const isOnlyScreen = totalScreens <= 1;

  const handleConfirm = () => {
    if (isOnlyScreen) return;
    onConfirmDelete(screen.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 select-none">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
              isOnlyScreen
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
            }`}
          >
            {isOnlyScreen ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <Trash2 className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {isOnlyScreen ? "Cannot Delete Screen" : "Delete Screen"}
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Target: <span className="text-indigo-400 font-bold">{screen.name}</span>{" "}
              {screen.title ? `(${screen.title})` : ""}
            </p>
          </div>
        </div>

        {/* Body Content */}
        {isOnlyScreen ? (
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs space-y-2 leading-relaxed">
            <p className="font-bold flex items-center gap-1.5 text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Minimum 1 Screen Required</span>
            </p>
            <p>
              Your Android app must contain at least one main launcher screen. Create another screen first before deleting this screen.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs space-y-2 leading-relaxed">
              <p className="font-bold flex items-center gap-1.5 text-rose-300">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Warning: Irreversible Action</span>
              </p>
              <p>
                Are you sure you want to delete screen <strong className="text-white">"{screen.name}"</strong>?
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] pt-1">
                <li>All UI layout components on this screen will be removed.</li>
                <li>Associated logic flows & event handlers will be deleted.</li>
                <li>Screen state variables will be cleaned up.</li>
              </ul>
            </div>
            {screen.isInitial && (
              <div className="p-3 rounded-xl bg-indigo-950/50 border border-indigo-500/30 text-indigo-300 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                <span>
                  This screen is currently your <strong>Launcher Screen</strong>. Deleting it will make another remaining screen the launcher.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
          >
            Cancel
          </button>
          {!isOnlyScreen && (
            <button
              type="button"
              onClick={handleConfirm}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-rose-950"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Screen</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
