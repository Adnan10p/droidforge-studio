import React, { useState } from "react";
import { X, Copy, Check, Code2, Download } from "lucide-react";
import { AndroidScreen, LogicBlock } from "../../types";

interface CodePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  screen: AndroidScreen;
  blocks: LogicBlock[];
}

export const CodePreviewModal: React.FC<CodePreviewModalProps> = ({
  isOpen,
  onClose,
  screen,
  blocks,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate Kotlin Jetpack Compose ViewModel & event handler code
  const generateKotlinCode = () => {
    const screenName = screen.name.replace(/[^a-zA-Z0-9]/g, "");
    let code = `// =========================================================\n`;
    code += `// Generated Jetpack Compose Logic Flow for ${screen.name}\n`;
    code += `// Powered by Android Builder Visual Logic Studio\n`;
    code += `// =========================================================\n\n`;
    code += `package com.example.androidbuilder.presentation.${screenName.toLowerCase()}\n\n`;
    code += `import androidx.compose.runtime.*\n`;
    code += `import androidx.lifecycle.ViewModel\n`;
    code += `import androidx.lifecycle.viewModelScope\n`;
    code += `import kotlinx.coroutines.flow.MutableStateFlow\n`;
    code += `import kotlinx.coroutines.flow.asStateFlow\n`;
    code += `import kotlinx.coroutines.launch\n\n`;

    // State class
    code += `data class ${screenName}UiState(\n`;
    (screen.stateVariables || []).forEach((v) => {
      const type = v.type === "Int" ? "Int" : v.type === "Boolean" ? "Boolean" : "String";
      const val = v.initialValue ? (v.type === "String" ? `"${v.initialValue}"` : v.initialValue) : (v.type === "Int" ? "0" : v.type === "Boolean" ? "false" : `""`);
      code += `    val ${v.name}: ${type} = ${val},\n`;
    });
    code += `    val isLoading: Boolean = false,\n`;
    code += `    val errorMessage: String? = null\n`;
    code += `)\n\n`;

    // ViewModel
    code += `class ${screenName}ViewModel : ViewModel() {\n`;
    code += `    private val _uiState = MutableStateFlow(${screenName}UiState())\n`;
    code += `    val uiState = _uiState.asStateFlow()\n\n`;

    // Logic Blocks
    blocks.forEach((b) => {
      const fnName = `on${b.componentName.replace(/[^a-zA-Z0-9]/g, "")}${b.event}`;
      code += `    // ⚡ Trigger: ${b.componentName} • ${b.event}\n`;
      code += `    fun ${fnName}() {\n`;
      code += `        viewModelScope.launch {\n`;

      b.actions.forEach((a) => {
        if (a.conditionEnabled && a.condition) {
          code += `            // ◇ Condition Check: ${a.condition.left} ${a.condition.operator} ${a.condition.right}\n`;
          if (a.condition.operator === "isEmpty") {
            code += `            if (${a.condition.left}.isEmpty()) {\n`;
          } else {
            code += `            if (${a.condition.left} ${a.condition.operator} ${a.condition.right}) {\n`;
          }
          (a.subActions || []).forEach((sub) => {
            code += `                // YES Branch\n`;
            if (sub.actionType === "toast" || sub.actionType === "snackbar") {
              code += `                showToast("${sub.message || "Alert"}")\n`;
            } else if (sub.actionType === "navigate") {
              code += `                navController.navigate("${sub.targetScreen}")\n`;
            }
          });
          code += `            } else {\n`;
          (a.elseActions || []).forEach((el) => {
            code += `                // NO Branch\n`;
            if (el.actionType === "callApi") {
              code += `                // Retrofit / Ktor Call\n`;
              code += `                val response = apiService.${el.endpoint?.replace(/[^a-zA-Z0-9]/g, "_")}()\n`;
            } else if (el.actionType === "navigate") {
              code += `                navController.navigate("${el.targetScreen}")\n`;
            }
          });
          code += `            }\n`;
        } else if (a.actionType === "setProperty") {
          code += `            // Set Property: ${a.targetId}.${a.property} = "${a.value}"\n`;
          code += `            _uiState.value = _uiState.value.copy(\n`;
          code += `                // Target widget text mutation\n`;
          code += `            )\n`;
        } else if (a.actionType === "setVariable") {
          code += `            // Set Variable: ${a.variableName} ${a.variableOperation} ${a.variableValue}\n`;
          code += `            _uiState.value = _uiState.value.copy(\n`;
          code += `                ${a.variableName} = _uiState.value.${a.variableName} + ${a.variableValue || "1"}\n`;
          code += `            )\n`;
        } else if (a.actionType === "navigate") {
          code += `            navController.navigate("${a.targetScreen || "Details"}")\n`;
        } else if (a.actionType === "toast") {
          code += `            showToast("${a.message || "Notice"}")\n`;
        } else if (a.actionType === "vibrate") {
          code += `            vibrator.vibrate(VibrationEffect.createPredefined(VibrationEffect.EFFECT_CLICK))\n`;
        } else if (a.actionType === "callApi") {
          code += `            val result = apiService.call("${a.endpoint}")\n`;
        }
      });

      code += `        }\n`;
      code += `    }\n\n`;
    });

    code += `}\n`;
    return code;
  };

  const codeString = generateKotlinCode();

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] text-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Generated Jetpack Compose ViewModel
              </h3>
              <p className="text-xs text-slate-400">
                Kotlin coroutines & reactive state derived from your visual diagram
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Code View */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed border-b border-slate-800">
          <pre className="whitespace-pre overflow-x-auto selection:bg-indigo-600">
            {codeString}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-900 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            {blocks.length} Trigger Block{blocks.length === 1 ? "" : "s"} Transpiled
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy Kotlin Code"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
