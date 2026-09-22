import { useState, useEffect, useCallback, useRef } from "react";
import { StateVariable, LogicAction } from "../../types";

export interface VariableChangeRecord {
  id: string;
  varName: string;
  oldValue: any;
  newValue: any;
  timestamp: number;
  reason: string;
}

export interface UseVariablesWatchReturn {
  variables: StateVariable[];
  values: Record<string, any>;
  lastChangedVar: string | null;
  changeHistory: VariableChangeRecord[];
  setVariableValue: (varName: string, nextValue: any) => void;
  resetToDefaults: () => void;
  observeStep: (action: LogicAction | undefined) => void;
  clearHistory: () => void;
}

/**
 * Reactive hook that observes the project's state variables during simulation.
 * Automatically updates reactive UI states when logic flow actions modify variables,
 * tracks step-by-step diff histories, and manages live value overrides.
 */
export function useVariablesWatch(
  projectVariables: StateVariable[],
  isSimulating: boolean
): UseVariablesWatchReturn {
  const serializedVars = JSON.stringify(projectVariables || []);
  const projectVarsRef = useRef(projectVariables);
  projectVarsRef.current = projectVariables;

  // Compute baseline default values
  const computeDefaults = useCallback(() => {
    const defaults: Record<string, any> = {};
    (projectVarsRef.current || []).forEach((v) => {
      defaults[v.name] = (v as any).defaultValue ?? v.initialValue ?? "";
    });
    return defaults;
  }, []);

  const [values, setValues] = useState<Record<string, any>>(() => {
    const defaults: Record<string, any> = {};
    (projectVariables || []).forEach((v) => {
      defaults[v.name] = (v as any).defaultValue ?? v.initialValue ?? "";
    });
    return defaults;
  });
  const [lastChangedVar, setLastChangedVar] = useState<string | null>(null);
  const [changeHistory, setChangeHistory] = useState<VariableChangeRecord[]>([]);

  // Keep values updated when project variables change and not actively simulating
  const isSimulatingRef = useRef(isSimulating);
  isSimulatingRef.current = isSimulating;

  useEffect(() => {
    if (!isSimulatingRef.current) {
      setValues(computeDefaults());
    }
  }, [serializedVars, computeDefaults]);

  // Set variable value manually or programmatically
  const setVariableValue = useCallback((varName: string, nextValue: any) => {
    setValues((prev) => {
      const oldVal = prev[varName];
      const record: VariableChangeRecord = {
        id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        varName,
        oldValue: oldVal,
        newValue: nextValue,
        timestamp: Date.now(),
        reason: "Manual / Live Override",
      };
      setChangeHistory((h) => [record, ...h.slice(0, 49)]);
      setLastChangedVar(varName);
      return { ...prev, [varName]: nextValue };
    });

    // Clear highlight after 1.8s
    setTimeout(() => {
      setLastChangedVar((curr) => (curr === varName ? null : curr));
    }, 1800);
  }, []);

  // Reset to initial project defaults
  const resetToDefaults = useCallback(() => {
    setValues(computeDefaults());
    setLastChangedVar(null);
    setChangeHistory([]);
  }, [computeDefaults]);

  // Clear change history
  const clearHistory = useCallback(() => {
    setChangeHistory([]);
  }, []);

  // Reactively observe and execute a logic flow action on the state variables
  const observeStep = useCallback((action: LogicAction | undefined) => {
    if (!action) return;

    const actionType = action.actionType as string;
    const isSetVar = actionType === "setVariable" || actionType === "SetVariable";
    const isIncVar = actionType === "IncrementVariable";

    if (isSetVar && action.variableName) {
      const varName = action.variableName;
      const op = action.variableOperation || "assign";
      const targetVal = action.variableValue ?? action.value;

      setValues((prev) => {
        const oldVal = prev[varName];
        let nextVal: any;

        if (op === "increment") {
          const inc = Number(targetVal ?? 1);
          nextVal = Number(oldVal ?? 0) + inc;
        } else if (op === "decrement") {
          const dec = Number(targetVal ?? 1);
          nextVal = Number(oldVal ?? 0) - dec;
        } else if (op === "toggle") {
          nextVal = typeof oldVal === "boolean" ? !oldVal : oldVal === "true" ? "false" : "true";
        } else {
          nextVal = targetVal;
        }

        const record: VariableChangeRecord = {
          id: `step_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          varName,
          oldValue: oldVal,
          newValue: nextVal,
          timestamp: Date.now(),
          reason: `setVariable (${op}) -> "${nextVal}"`,
        };
        setChangeHistory((h) => [record, ...h.slice(0, 49)]);
        return { ...prev, [varName]: nextVal };
      });

      setLastChangedVar(varName);
      setTimeout(() => {
        setLastChangedVar((curr) => (curr === varName ? null : curr));
      }, 2000);
    } else if (isIncVar && action.variableName) {
      const varName = action.variableName;
      setValues((prev) => {
        const curNum = Number(prev[varName] ?? 0);
        const incBy = Number(action.value ?? 1);
        const nextVal = curNum + incBy;
        const record: VariableChangeRecord = {
          id: `step_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          varName,
          oldValue: curNum,
          newValue: nextVal,
          timestamp: Date.now(),
          reason: `IncrementVariable (+${incBy})`,
        };
        setChangeHistory((h) => [record, ...h.slice(0, 49)]);
        return { ...prev, [varName]: nextVal };
      });

      setLastChangedVar(varName);
      setTimeout(() => {
        setLastChangedVar((curr) => (curr === varName ? null : curr));
      }, 2000);
    }
  }, []);

  return {
    variables: projectVariables,
    values,
    lastChangedVar,
    changeHistory,
    setVariableValue,
    resetToDefaults,
    observeStep,
    clearHistory,
  };
}
