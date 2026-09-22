import React from "react";
import { AlertTriangle, Trash2, X, ArrowDown } from "lucide-react";

export type DeleteConfirmationType = "trigger" | "action" | "condition" | "multi";

export interface DeleteConfirmationModalProps {
  isOpen: boolean;
  type: DeleteConfirmationType;
  nodeTitle: string;
  downstreamCount: number;
  onClose: () => void;
  onDeleteSingle: () => void;
  onDeleteCascade: () => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  type,
  nodeTitle,
  downstreamCount,
  onClose,
  onDeleteSingle,
  onDeleteCascade,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Confirm Deletion</h3>
              <p className="text-xs text-slate-400 truncate max-w-[260px]">
                {nodeTitle}
              </p>
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

        {/* Message */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 space-y-2">
          {type === "multi" ? (
            <p>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-rose-400">{downstreamCount}</span> selected
              elements and all their associated connections?
            </p>
          ) : (
            <>
              <p>
                This node has{" "}
                <span className="font-semibold text-amber-400">
                  {downstreamCount} connected downstream {downstreamCount === 1 ? "node" : "nodes"}
                </span>
                .
              </p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Choose whether you want to remove only this specific node or delete the entire
                connected flow downstream.
              </p>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          {type !== "multi" && (
            <button
              type="button"
              onClick={() => {
                onDeleteSingle();
                onClose();
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Delete Only This Node</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onDeleteCascade();
              onClose();
            }}
            className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 transition cursor-pointer"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span>
              {type === "multi"
                ? `Delete Selected (${downstreamCount})`
                : "Delete Complete Connected Flow"}
            </span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 px-3 rounded-xl bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 text-xs font-medium transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
