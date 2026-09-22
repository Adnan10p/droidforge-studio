import React, { memo, useState } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import {
  Type,
  Navigation,
  Bell,
  MessageSquare,
  Globe,
  Database,
  Vibrate,
  Clock,
  ExternalLink,
  Trash2,
  Copy,
  Plus,
  Edit2,
  Flame,
  CheckCircle2,
  Sliders,
  Bug,
  Zap,
  Wrench,
} from "lucide-react";
import { ActionNodeData } from "../types";
import { LogicAction } from "../../../types";
import { NodeErrorContext } from "../NodeErrorContext";
import {
  getValidPropertiesForComponent,
  getValidFunctionsForComponent,
} from "../../../data/componentLogicMetadata";

export const ActionNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as unknown as ActionNodeData;
  const nodeErrorMap = React.useContext(NodeErrorContext);
  const action = nodeData.action || ({} as LogicAction);
  const [isEditing, setIsEditing] = useState(false);

  // Components list & Robust Component Target Resolution
  const compList = nodeData.componentsList || [];
  let targetCompObj = compList.find(
    (c) => c.id === action.targetId || c.name === action.targetId
  );
  if (!targetCompObj && action.targetId) {
    targetCompObj = compList.find(
      (c) => action.targetId?.includes(c.id) || c.id.includes(action.targetId || "")
    );
  }

  const isRootScreen = targetCompObj
    ? targetCompObj.id.startsWith("root") ||
      targetCompObj.type === "Screen" ||
      targetCompObj.name.toLowerCase() === "screen1" ||
      targetCompObj.name.toLowerCase() === "screen"
    : Boolean(!action.targetId || action.targetId.startsWith("root"));

  const isOrphaned = Boolean(
    action.targetId &&
    !action.targetId.startsWith("root") &&
    !action.targetId.toLowerCase().includes("screen") &&
    !targetCompObj
  );

  const targetCompName = targetCompObj
    ? targetCompObj.name
    : isRootScreen
    ? "Screen1"
    : action.targetId
    ? action.targetId.replace(/^comp_/, "").replace(/_\d+_\d+$/, "").replace(/_\d+$/, "")
    : "Screen1";


  const targetCompType = targetCompObj
    ? isRootScreen
      ? "Screen"
      : targetCompObj.type
    : (action.targetId || "").toLowerCase().includes("youtube")
    ? "YouTubePlayer"
    : (action.targetId || "").toLowerCase().includes("button")
    ? "Button"
    : (action.targetId || "").toLowerCase().includes("text")
    ? "TextField"
    : isRootScreen
    ? "Screen"
    : "Screen";

  // Component-aware Property Definitions
  const validProperties = getValidPropertiesForComponent(targetCompType);
  const currentPropDef =
    validProperties.find(
      (p) => p.name.toLowerCase() === (action.property || "").toLowerCase()
    ) || validProperties[0];

  const currentPropName = currentPropDef ? currentPropDef.name : action.property || "text";
  const currentPropLabel = currentPropDef ? currentPropDef.label : currentPropName;
  const propType = currentPropDef?.type || "string";
  const propOptions = currentPropDef?.options || [];

  // Component-aware Method Definitions
  const validFunctions = getValidFunctionsForComponent(targetCompType);
  const currentMethodName = (action as any).methodName || (validFunctions[0]?.id || "Play");
  const currentMethodDef =
    validFunctions.find(
      (f) => f.id === currentMethodName || f.name === currentMethodName
    ) || validFunctions[0];

  // Helper to get action category styling & title
  const getActionMeta = () => {
    switch (action.actionType) {
      case "setProperty":
        return {
          title: "SET PROPERTY",
          icon: <Type className="w-3.5 h-3.5" />,
          color: "border-blue-500/60 bg-blue-950/40 text-blue-400",
          headerBg: "from-blue-600 to-cyan-600",
          subline: `${targetCompName}.${currentPropName}`,
        };
      case "callMethod": {
        const methodName = (action as any).methodName || currentMethodDef?.name || "Play";
        return {
          title: "CALL METHOD",
          icon: <Zap className="w-3.5 h-3.5" />,
          color: "border-purple-500/60 bg-purple-950/40 text-purple-400",
          headerBg: "from-purple-600 via-indigo-600 to-violet-600",
          subline: `${targetCompName}.${methodName}()`,
        };
      }
      case "setVariable":
        return {
          title: "SET VARIABLE",
          icon: <Sliders className="w-3.5 h-3.5" />,
          color: "border-emerald-500/60 bg-emerald-950/40 text-emerald-400",
          headerBg: "from-emerald-600 to-teal-600",
          subline: action.variableOperation || "assign",
        };
      case "navigate":
        return {
          title: "NAVIGATE SCREEN",
          icon: <Navigation className="w-3.5 h-3.5" />,
          color: "border-indigo-500/60 bg-indigo-950/40 text-indigo-400",
          headerBg: "from-indigo-600 to-purple-600",
          subline: action.targetScreen || "Details",
        };
      case "popBack":
        return {
          title: "POP SCREEN BACK",
          icon: <Navigation className="w-3.5 h-3.5 rotate-180" />,
          color: "border-indigo-500/60 bg-indigo-950/40 text-indigo-400",
          headerBg: "from-indigo-600 to-purple-600",
          subline: "Go Back",
        };
      case "toast":
        return {
          title: "SHOW TOAST",
          icon: <Bell className="w-3.5 h-3.5" />,
          color: "border-amber-500/60 bg-amber-950/40 text-amber-400",
          headerBg: "from-amber-600 to-yellow-600",
          subline: "Quick message",
        };
      case "snackbar":
        return {
          title: "SHOW SNACKBAR",
          icon: <MessageSquare className="w-3.5 h-3.5" />,
          color: "border-orange-500/60 bg-orange-950/40 text-orange-400",
          headerBg: "from-orange-600 to-red-600",
          subline: action.actionLabel || "Action",
        };
      case "dialog":
        return {
          title: "ALERT DIALOG",
          icon: <MessageSquare className="w-3.5 h-3.5" />,
          color: "border-purple-500/60 bg-purple-950/40 text-purple-400",
          headerBg: "from-purple-600 to-pink-600",
          subline: action.dialogTitle || "Notice",
        };
      case "callApi":
        return {
          title: "CALL REST API",
          icon: <Globe className="w-3.5 h-3.5" />,
          color: "border-sky-500/60 bg-sky-950/40 text-sky-400",
          headerBg: "from-sky-600 to-blue-600",
          subline: `${action.method || "GET"} ${action.endpoint || "/api"}`,
        };
      case "firebaseWrite":
      case "firebaseRead":
        return {
          title: action.actionType === "firebaseWrite" ? "FIREBASE WRITE" : "FIREBASE READ",
          icon: <Flame className="w-3.5 h-3.5" />,
          color: "border-amber-500/60 bg-amber-950/40 text-amber-400",
          headerBg: "from-amber-600 to-orange-600",
          subline: action.collectionName || "collection",
        };
      case "databaseInsert":
      case "databaseQuery":
        return {
          title: "ROOM DATABASE",
          icon: <Database className="w-3.5 h-3.5" />,
          color: "border-teal-500/60 bg-teal-950/40 text-teal-400",
          headerBg: "from-teal-600 to-emerald-600",
          subline: action.tableName || "table",
        };
      case "vibrate":
        return {
          title: "HAPTIC VIBRATE",
          icon: <Vibrate className="w-3.5 h-3.5" />,
          color: "border-pink-500/60 bg-pink-950/40 text-pink-400",
          headerBg: "from-pink-600 to-rose-600",
          subline: action.hapticPattern || "click",
        };
      case "delay":
        return {
          title: "DELAY TIMER",
          icon: <Clock className="w-3.5 h-3.5" />,
          color: "border-yellow-500/60 bg-yellow-950/40 text-yellow-400",
          headerBg: "from-yellow-600 to-amber-600",
          subline: `${action.delayMs || 1000} ms`,
        };
      case "openBrowser":
        return {
          title: "OPEN BROWSER",
          icon: <ExternalLink className="w-3.5 h-3.5" />,
          color: "border-cyan-500/60 bg-cyan-950/40 text-cyan-400",
          headerBg: "from-cyan-600 to-blue-600",
          subline: action.url || "https://",
        };
      default:
        return {
          title: (action.actionType || "Action").toUpperCase(),
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          color: "border-slate-500/60 bg-slate-950/40 text-slate-400",
          headerBg: "from-slate-600 to-zinc-600",
          subline: "Execute",
        };
    }
  };

  const meta = getActionMeta();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof (window as any).__onFlowDeleteNode === "function") {
      (window as any).__onFlowDeleteNode(id);
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof (window as any).__onFlowDuplicateNode === "function") {
      (window as any).__onFlowDuplicateNode(id);
    }
  };

  const handleAddSubsequentAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof (window as any).__onFlowAddConnectedAction === "function") {
      (window as any).__onFlowAddConnectedAction(id, "bottom");
    }
  };

  const handleUpdateActionField = (field: keyof LogicAction, val: any) => {
    const updatedAction = { ...action, [field]: val };
    if (typeof (window as any).__onFlowUpdateNode === "function") {
      (window as any).__onFlowUpdateNode(id, { action: updatedAction });
    }
  };

  const handleTargetComponentChange = (newCompId: string) => {
    const match = compList.find((c) => c.id === newCompId || c.name === newCompId);
    const isRoot = match
      ? match.id.startsWith("root") || match.type === "Screen" || match.name.toLowerCase() === "screen1"
      : true;
    const newCompType = match ? (isRoot ? "Screen" : match.type) : "Screen";
    const newValidProps = getValidPropertiesForComponent(newCompType);
    const nextProp = newValidProps[0]?.name || "text";

    const updatedAction = {
      ...action,
      targetId: newCompId,
      property: nextProp,
      value: newValidProps[0]?.defaultValue ?? "",
    };
    if (typeof (window as any).__onFlowUpdateNode === "function") {
      (window as any).__onFlowUpdateNode(id, { action: updatedAction });
    }
  };

  const handlePropertyChange = (newPropName: string) => {
    const pDef = validProperties.find((p) => p.name === newPropName);
    const updatedAction = {
      ...action,
      property: newPropName,
      value: pDef?.defaultValue ?? "",
    };
    if (typeof (window as any).__onFlowUpdateNode === "function") {
      (window as any).__onFlowUpdateNode(id, { action: updatedAction });
    }
  };

  const handleMethodChange = (newMethodId: string) => {
    const fnDef = validFunctions.find((f) => f.id === newMethodId || f.name === newMethodId);
    const defaultArgs: Record<string, any> = {};
    if (fnDef?.params) {
      fnDef.params.forEach((p) => {
        if (p.name === "videoId") defaultArgs[p.name] = "dQw4w9WgXcQ";
        else if (p.name === "position" || p.name === "seconds") defaultArgs[p.name] = 30.0;
        else if (p.type === "Number" || p.type === "Float" || p.type === "Int") defaultArgs[p.name] = 0;
        else defaultArgs[p.name] = "";
      });
    }
    const updatedAction = {
      ...action,
      methodName: newMethodId,
      methodArgs: defaultArgs,
    };
    if (typeof (window as any).__onFlowUpdateNode === "function") {
      (window as any).__onFlowUpdateNode(id, { action: updatedAction });
    }
  };

  const handleUpdateMethodArg = (paramName: string, argVal: any) => {
    const currentArgs = (action as any).methodArgs || {};
    const updatedArgs = { ...currentArgs, [paramName]: argVal };
    const updatedAction = {
      ...action,
      methodArgs: updatedArgs,
    };
    if (typeof (window as any).__onFlowUpdateNode === "function") {
      (window as any).__onFlowUpdateNode(id, { action: updatedAction });
    }
  };

  const isSimulatingActive = Boolean((nodeData as any).isSimulatingActive);
  const isPausedAtBreakpoint = Boolean((nodeData as any).isPausedAtBreakpoint);
  const hasBreakpoint = Boolean((nodeData as any).breakpoint);
  const hasError = Boolean((nodeData as any).hasError || nodeErrorMap.has(id));

  const handleToggleBreakpoint = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof (window as any).__onFlowUpdateNode === "function") {
      (window as any).__onFlowUpdateNode(id, {
        breakpoint: !hasBreakpoint,
      });
    }
  };

  return (
    <div
      className={`group relative rounded-2xl transition-all select-none shadow-md ${
        hasError
          ? "node-error-ring ring-2 ring-rose-500 shadow-2xl shadow-rose-500/60 scale-[1.02]"
          : isPausedAtBreakpoint
          ? "ring-4 ring-rose-500 shadow-2xl shadow-rose-500/50 scale-105 animate-pulse"
          : isSimulatingActive
          ? "flow-node-active-sim ring-4 ring-blue-400 shadow-2xl scale-105"
          : selected
          ? "ring-2 ring-blue-400 shadow-blue-500/20 shadow-lg scale-[1.02]"
          : "hover:shadow-lg"
      }`}
      style={{ minWidth: "270px", maxWidth: "360px" }}
    >
      {/* Floating Hover Toolbar */}
      <div className="absolute -top-7 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center bg-slate-900/95 border border-slate-700/90 rounded-lg px-1.5 py-0.5 shadow-xl gap-1 z-40">
        <button
          type="button"
          onClick={handleToggleBreakpoint}
          title={hasBreakpoint ? "Remove Breakpoint" : "Set Breakpoint"}
          className={`px-1.5 py-0.5 rounded transition flex items-center gap-1 text-[10px] font-semibold cursor-pointer ${
            hasBreakpoint
              ? "bg-rose-600 text-white shadow-xs"
              : "text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Bug className={`w-3.5 h-3.5 ${hasBreakpoint ? "fill-current text-white" : "text-rose-400"}`} />
          <span>{hasBreakpoint ? "Breakpoint Active" : "Breakpoint"}</span>
        </button>
        <div className="w-[1px] h-3 bg-slate-700" />
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          title="Edit Parameters"
          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
        >
          <Edit2 className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={handleDuplicate}
          title="Duplicate"
          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
        >
          <Copy className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={handleDelete}
          title="Delete"
          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Top Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="action-in"
        className="!w-4 !h-4 !bg-blue-400 !border-2 !border-slate-950 !rounded-full !top-[-8px] transition hover:scale-125 cursor-crosshair shadow-md shadow-blue-500/50"
      />

      {/* Main Node Card */}
      <div className={`bg-slate-900 border ${hasError ? "border-rose-500/90" : hasBreakpoint ? "border-rose-500/80" : "border-slate-700/80"} rounded-2xl overflow-hidden shadow-2xs`}>
        {/* Action Header Banner */}
        <div
          className={`px-3 py-1.5 flex items-center justify-between text-white ${
            hasError
              ? "bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 font-bold"
              : `bg-gradient-to-r ${meta.headerBg}`
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="p-0.5 rounded-md bg-black/25">{meta.icon}</span>
            <span className="text-[11px] font-bold tracking-tight uppercase">{meta.title}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleToggleBreakpoint}
              className="p-1 rounded transition cursor-pointer hover:bg-black/25 text-white/90"
            >
              <Bug className={`w-3 h-3 ${hasBreakpoint ? "fill-current" : ""}`} />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="p-1 hover:bg-red-600 rounded transition text-white/90 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Action Body */}
        <div className="p-3 bg-slate-900/95 space-y-2">
          {/* Target Component & Property / Method Line */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono text-[11px]">Target Component:</span>
            <span className={`font-mono font-bold px-2 py-0.5 rounded-md border truncate max-w-[180px] ${
              isOrphaned
                ? "bg-rose-950/80 text-rose-300 border-rose-500/80"
                : "text-white bg-slate-800 border-slate-700/60"
            }`}>
              {isOrphaned ? `⚠️ ${targetCompName} (Deleted)` : action.actionType === "setVariable" ? action.variableName || "variable" : targetCompName}
            </span>
          </div>


          {/* Primary Value / Payload Card */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="uppercase font-bold tracking-wider text-blue-400">
                {action.actionType === "setProperty"
                  ? `set ${targetCompName}.${currentPropName}`
                  : action.actionType === "callMethod"
                  ? `call ${targetCompName}.${(action as any).methodName || "Play"}()`
                  : action.actionType === "navigate"
                  ? "Destination Screen"
                  : action.actionType === "callApi"
                  ? "HTTP Endpoint"
                  : action.actionType === "setVariable"
                  ? `Operation: ${action.variableOperation || "assign"}`
                  : "Value / Message"}
              </span>
            </div>

            {/* Render Typed Value Preview */}
            <div className="flex items-center gap-2">
              {propType === "color" && action.actionType === "setProperty" && action.value && (
                <span
                  className="w-4 h-4 rounded-md border border-slate-600 shrink-0 shadow-2xs"
                  style={{ backgroundColor: String(action.value) }}
                />
              )}
              <div className="text-xs font-mono font-semibold text-emerald-300 break-all line-clamp-2">
                {action.actionType === "setProperty"
                  ? String(action.value ?? currentPropDef?.defaultValue ?? "Value")
                  : action.actionType === "callMethod"
                  ? (action as any).methodArgs && Object.keys((action as any).methodArgs).length > 0
                    ? JSON.stringify((action as any).methodArgs)
                    : "No parameters"
                  : action.actionType === "navigate"
                  ? action.targetScreen || "HomeScreen"
                  : action.actionType === "callApi"
                  ? `${action.method || "GET"} ${action.endpoint || "/api/data"}`
                  : action.actionType === "toast" || action.actionType === "snackbar"
                  ? `"${action.message || "Notification sent"}"`
                  : String(action.value ?? meta.subline)}
              </div>
            </div>
          </div>

          {/* Component-Aware Property Setter Controls */}
          {action.actionType === "setProperty" && (
            <div className="space-y-1.5 pt-1.5 border-t border-slate-800">
              <div className="grid grid-cols-2 gap-1.5">
                {/* Target Component Dropdown */}
                <div>
                  <label className="text-[9px] font-semibold text-slate-400 block mb-0.5 uppercase tracking-wider">Target Component</label>
                  <select
                    value={action.targetId || (compList[0]?.id || "root")}
                    onChange={(e) => handleTargetComponentChange(e.target.value)}
                    className="w-full px-2 py-1 text-[11px] font-medium bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-lg focus:outline-none focus:border-blue-400 truncate cursor-pointer"
                    title="Select Target Component"
                  >
                    {compList.map((c) => {
                      const isRoot = c.id.startsWith("root") || c.type === "Screen" || c.name.toLowerCase() === "screen1";
                      const name = isRoot ? "Screen1" : c.name;
                      return (
                        <option key={c.id} value={c.id}>
                          {name} ({isRoot ? "Screen" : c.type})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Component-Aware Property Dropdown */}
                <div>
                  <label className="text-[9px] font-semibold text-slate-400 block mb-0.5 uppercase tracking-wider">Property</label>
                  <select
                    value={currentPropName}
                    onChange={(e) => handlePropertyChange(e.target.value)}
                    className="w-full px-2 py-1 text-[11px] font-medium bg-slate-800/90 text-blue-300 border border-slate-700/80 rounded-lg focus:outline-none focus:border-blue-400 truncate cursor-pointer font-mono"
                    title="Select Component Property"
                  >
                    {validProperties.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.label || p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Typed Value Control */}
              <div>
                <label className="text-[9px] font-semibold text-slate-400 block mb-0.5 uppercase tracking-wider">New Value</label>
                {propType === "boolean" ? (
                  <select
                    value={String(action.value ?? true)}
                    onChange={(e) => handleUpdateActionField("value", e.target.value === "true")}
                    className="w-full px-2 py-1 text-xs font-mono font-bold bg-slate-800 text-emerald-400 border border-slate-700 rounded-lg focus:outline-none cursor-pointer"
                  >
                    <option value="true">true (ON)</option>
                    <option value="false">false (OFF)</option>
                  </select>
                ) : propType === "enum" && propOptions.length > 0 ? (
                  <select
                    value={String(action.value ?? propOptions[0])}
                    onChange={(e) => handleUpdateActionField("value", e.target.value)}
                    className="w-full px-2 py-1 text-xs font-mono font-semibold bg-slate-800 text-emerald-300 border border-slate-700 rounded-lg focus:outline-none cursor-pointer capitalize"
                  >
                    {propOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : propType === "color" ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={String(action.value || "#6750A4")}
                      onChange={(e) => handleUpdateActionField("value", e.target.value)}
                      className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={String(action.value || "#6750A4")}
                      onChange={(e) => handleUpdateActionField("value", e.target.value)}
                      className="w-full px-2 py-1 text-xs bg-slate-800 text-emerald-300 rounded border border-slate-700 font-mono"
                      placeholder="#6750A4"
                    />
                  </div>
                ) : (
                  <input
                    type={propType === "number" ? "number" : "text"}
                    value={action.value ?? ""}
                    onChange={(e) => handleUpdateActionField("value", e.target.value)}
                    placeholder="Enter property value..."
                    className="w-full px-2 py-1 text-xs bg-slate-800 text-emerald-300 rounded border border-slate-700 font-mono"
                  />
                )}
              </div>
            </div>
          )}

          {/* Component-Aware Call Method Controls */}
          {action.actionType === "callMethod" && (
            <div className="space-y-2 pt-1.5 border-t border-slate-800">
              <div className="grid grid-cols-2 gap-1.5">
                {/* Target Component */}
                <div>
                  <label className="text-[9px] font-semibold text-slate-400 block mb-0.5 uppercase tracking-wider">Target Component</label>
                  <select
                    value={action.targetId || (compList[0]?.id || "root")}
                    onChange={(e) => handleTargetComponentChange(e.target.value)}
                    className="w-full px-2 py-1 text-[11px] font-medium bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-lg focus:outline-none focus:border-purple-400 truncate cursor-pointer"
                  >
                    {compList.map((c) => {
                      const isRoot = c.id.startsWith("root") || c.type === "Screen" || c.name.toLowerCase() === "screen1";
                      const name = isRoot ? "Screen1" : c.name;
                      return (
                        <option key={c.id} value={c.id}>
                          {name} ({isRoot ? "Screen" : c.type})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Method / Function Dropdown */}
                <div>
                  <label className="text-[9px] font-semibold text-slate-400 block mb-0.5 uppercase tracking-wider">Method / Function</label>
                  <select
                    value={currentMethodName}
                    onChange={(e) => handleMethodChange(e.target.value)}
                    className="w-full px-2 py-1 text-[11px] font-medium bg-slate-800/90 text-purple-300 border border-slate-700/80 rounded-lg focus:outline-none focus:border-purple-400 truncate cursor-pointer font-mono"
                  >
                    {validFunctions.map((fn) => (
                      <option key={fn.id} value={fn.id}>
                        {fn.name || fn.id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Method Arguments Editor */}
              {currentMethodDef && (currentMethodDef.params || []).length > 0 ? (
                <div className="space-y-1.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[9px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
                    <Wrench className="w-3 h-3" />
                    <span>Method Arguments ({currentMethodDef.params.length})</span>
                  </div>
                  {currentMethodDef.params.map((param) => {
                    const currentArgs = (action as any).methodArgs || {};
                    const argVal =
                      currentArgs[param.name] ??
                      (param.type === "Number" || param.type === "Float" || param.type === "Int"
                        ? param.name === "position" || param.name === "seconds"
                          ? 30.0
                          : 0
                        : "");
                    return (
                      <div key={param.name} className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-300 min-w-[75px] truncate">
                          {param.name} <span className="text-purple-400 text-[9px]">({param.type})</span>:
                        </span>
                        <input
                          type={
                            param.type === "Number" || param.type === "Float" || param.type === "Int"
                              ? "number"
                              : "text"
                          }
                          step={param.type === "Float" || param.type === "Double" ? "0.1" : "1"}
                          value={argVal}
                          onChange={(e) => {
                            const val =
                              param.type === "Number" || param.type === "Float" || param.type === "Int"
                                ? parseFloat(e.target.value) || 0
                                : e.target.value;
                            handleUpdateMethodArg(param.name, val);
                          }}
                          placeholder={param.type === "Number" ? "0" : "value..."}
                          className="flex-1 px-2 py-1 text-xs bg-slate-800 text-purple-200 rounded border border-slate-700 font-mono"
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-1.5 px-2.5 rounded-lg bg-purple-950/30 border border-purple-800/40 text-[10px] font-mono text-purple-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-purple-400 shrink-0" />
                  <span>No arguments required for {currentMethodDef?.name || currentMethodName}()</span>
                </div>
              )}
            </div>
          )}

          {/* Quick inline parameter editor if toggled for other actions */}
          {isEditing && action.actionType !== "setProperty" && action.actionType !== "callMethod" && (
            <div className="pt-2 border-t border-slate-800 space-y-2 animate-in fade-in duration-150">
              {action.actionType === "toast" || action.actionType === "snackbar" ? (
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Message</label>
                  <input
                    type="text"
                    value={action.message ?? ""}
                    onChange={(e) => handleUpdateActionField("message", e.target.value)}
                    placeholder="Enter message..."
                    className="w-full px-2 py-1 text-xs bg-slate-800 text-white rounded border border-slate-700 font-mono"
                  />
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Bottom Bar with "+ Action" Quick Connector */}
        <div className="p-1.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleAddSubsequentAction}
            className="flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition hover:border-blue-400 cursor-pointer shadow-2xs"
            title="Append connected Action step below"
          >
            <Plus className="w-3 h-3" />
            <span>+ Action</span>
          </button>
        </div>
      </div>

      {/* Bottom Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="action-out"
        className="!w-4 !h-4 !bg-blue-400 !border-2 !border-slate-950 !rounded-full !bottom-[-8px] transition hover:scale-125 cursor-crosshair shadow-md shadow-blue-500/50"
      />
    </div>
  );
});

ActionNode.displayName = "ActionNode";
