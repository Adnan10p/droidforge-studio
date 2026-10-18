import { LogicAction } from "../../types";
import { SymbolTable } from "./symbolTable";
import { NetworkCompiler } from "./networkCompiler";
import { StorageCompiler } from "./storageCompiler";
import { NavigationCompiler } from "./navigationCompiler";

export class ActionCompiler {
  private symbolTable: SymbolTable;
  private networkCompiler: NetworkCompiler;
  private storageCompiler: StorageCompiler;
  private navigationCompiler: NavigationCompiler;

  constructor(
    symbolTable: SymbolTable,
    networkCompiler: NetworkCompiler,
    storageCompiler: StorageCompiler,
    navigationCompiler: NavigationCompiler
  ) {
    this.symbolTable = symbolTable;
    this.networkCompiler = networkCompiler;
    this.storageCompiler = storageCompiler;
    this.navigationCompiler = navigationCompiler;
  }

  // Compile a single LogicAction into valid Java statements
  public compileAction(act: LogicAction, actionIdx: number): string {
    let coreCode = "";

    switch (act.actionType) {
      case "setProperty": {
        coreCode = this.compileSetProperty(act);
        break;
      }

      case "callApi": {
        coreCode = this.networkCompiler.compileCallApi(act, actionIdx);
        break;
      }

      case "navigate": {
        coreCode = this.navigationCompiler.compileNavigate(act);
        break;
      }

      case "popBack": {
        coreCode = this.navigationCompiler.compilePopBack();
        break;
      }

      case "databaseInsert": {
        coreCode = this.storageCompiler.compileDatabaseInsert(act, actionIdx);
        break;
      }

      case "databaseQuery": {
        coreCode = this.storageCompiler.compileDatabaseQuery(act, actionIdx);
        break;
      }

      case "preferencesSave": {
        coreCode = this.storageCompiler.compilePreferencesSave(act);
        break;
      }

      case "preferencesLoad" as any: {
        coreCode = this.storageCompiler.compilePreferencesLoad(act);
        break;
      }

      case "toast": {
        const msg = (act.message || "Action executed").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        coreCode = `Toast.makeText(MainActivity.this, "${msg}", Toast.LENGTH_SHORT).show();`;
        break;
      }

      case "share": {
        const msg = (act.message || "Shared from app").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        coreCode = `try { Intent sendIntent = new Intent(Intent.ACTION_SEND); sendIntent.setType("text/plain"); sendIntent.putExtra(Intent.EXTRA_TEXT, "${msg} "); startActivity(Intent.createChooser(sendIntent, "Share")); } catch(Exception ignored){}`;
        break;
      }

      case "copyToClipboard": {
        const val = (act.value !== undefined ? String(act.value) : "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        coreCode = `try { ClipboardManager cb = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE); cb.setPrimaryClip(ClipData.newPlainText("label", "${val}")); Toast.makeText(MainActivity.this, "Copied to clipboard!", Toast.LENGTH_SHORT).show(); } catch(Exception ignored){}`;
        break;
      }

      case "vibrate": {
        coreCode = `try { Vibrator vib = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE); if (vib != null) vib.vibrate(200); } catch(Exception ignored){}`;
        break;
      }

      case "openBrowser": {
        const url = (act.url || "https://android.com").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        coreCode = `openInAppWebView("${url}");`;
        break;
      }

      case "dialog": {
        const title = (act.dialogTitle || "Notice").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        const body = (act.dialogBody || act.message || "Operation completed.").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        const confirm = (act.dialogConfirmText || "OK").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        const dismiss = (act.dialogDismissText || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        const dismissBtn = dismiss ? `ab.setNegativeButton("${dismiss}", null);` : "";
        coreCode = `try { AlertDialog.Builder ab = new AlertDialog.Builder(MainActivity.this); ab.setTitle("${title}"); ab.setMessage("${body}"); ab.setPositiveButton("${confirm}", null); ${dismissBtn} ab.show(); } catch(Exception ignored){}`;
        break;
      }

      case "snackbar": {
        const msg = (act.message || "Notification").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        coreCode = `Toast.makeText(MainActivity.this, "${msg}", Toast.LENGTH_LONG).show();`;
        break;
      }

      case "setVariable": {
        const varName = (act.variableName || "stateVar").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        const varVal = (act.variableValue !== undefined ? String(act.variableValue) : "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        const op = act.variableOperation || "assign";
        if (op === "increment") {
          coreCode = `try { int cur = Integer.parseInt(appVariables.getOrDefault("${varName}", "0")); appVariables.put("${varName}", String.valueOf(cur + 1)); } catch(Exception e) { appVariables.put("${varName}", "1"); }`;
        } else if (op === "decrement") {
          coreCode = `try { int cur = Integer.parseInt(appVariables.getOrDefault("${varName}", "0")); appVariables.put("${varName}", String.valueOf(cur - 1)); } catch(Exception e) { appVariables.put("${varName}", "-1"); }`;
        } else {
          coreCode = `appVariables.put("${varName}", "${varVal}");`;
        }
        break;
      }

      case "hideKeyboard": {
        coreCode = `try { InputMethodManager imm = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE); if (imm != null && getCurrentFocus() != null) imm.hideSoftInputFromWindow(getCurrentFocus().getWindowToken(), 0); } catch(Exception ignored){}`;
        break;
      }

      case "showKeyboard": {
        coreCode = `try { InputMethodManager imm = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE); if (imm != null) imm.toggleSoftInput(InputMethodManager.SHOW_FORCED, 0); } catch(Exception ignored){}`;
        break;
      }

      case "setKeepScreenOn": {
        coreCode = `try { getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON); } catch(Exception ignored){}`;
        break;
      }

      case "toggleFlashlight": {
        coreCode = `try { if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) { CameraManager cm = (CameraManager) getSystemService(Context.CAMERA_SERVICE); if (cm != null && cm.getCameraIdList().length > 0) { flashlightState = !flashlightState; cm.setTorchMode(cm.getCameraIdList()[0], flashlightState); } } } catch(Exception ignored){}`;
        break;
      }

      case "playAudio": {
        coreCode = `try { ToneGenerator tg = new ToneGenerator(AudioManager.STREAM_NOTIFICATION, 100); tg.startTone(ToneGenerator.TONE_PROP_BEEP, 200); } catch(Exception ignored){}`;
        break;
      }

      case "delay": {
        const delayMs = act.delayMs || 1000;
        coreCode = `try { Thread.sleep(${delayMs}); } catch(Exception ignored){}`;
        break;
      }

      case "callMethod": {
        const mName = act.methodName || "run";
        coreCode = `// Invoked method ${mName} on target ${act.targetId || "this"}\nToast.makeText(MainActivity.this, "Method '${mName}' called", Toast.LENGTH_SHORT).show();`;
        break;
      }

      default: {
        console.warn(`[ActionCompiler Warning] Unsupported actionType: "${act.actionType}" on target: "${act.targetId}"`);
        coreCode = `// [Action]: ${act.actionType} on target ${act.targetId || "none"}\nToast.makeText(MainActivity.this, "Notice: Action '${act.actionType}' executed", Toast.LENGTH_SHORT).show();`;
        break;
      }
    }

    // Condition wrapper if condition is enabled
    if (act.conditionEnabled && act.condition) {
      const cond = act.condition;
      const left = cond.left || "";
      const right = (cond.right || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      const op = cond.operator || "==";

      if (op === "contains") {
        return `if ("${left}".contains("${right}")) {\n    ${coreCode}\n}`;
      } else {
        return `if ("${left}".equals("${right}")) {\n    ${coreCode}\n}`;
      }
    }

    return coreCode;
  }

  // Type-aware property mutation compiler
  private compileSetProperty(act: LogicAction): string {
    const targetId = act.targetId || "";
    const targetSymbol = this.symbolTable.lookup(targetId);
    const prop = act.property || "text";
    const rawVal = act.value !== undefined ? String(act.value) : "";
    const val = rawVal.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");

    const lookupKey = targetSymbol ? targetSymbol.id : targetId;

    switch (prop) {
      case "text":
        return `
            {
                View targetV = registeredViews.get("${lookupKey}");
                if (targetV instanceof TextView) {
                    ((TextView) targetV).setText("${val}");
                }
            }
        `;

      case "visibility": {
        const visConst = rawVal === "gone" ? "View.GONE" : rawVal === "invisible" ? "View.INVISIBLE" : "View.VISIBLE";
        return `
            {
                View targetV = registeredViews.get("${lookupKey}");
                if (targetV != null) {
                    targetV.setVisibility(${visConst});
                }
            }
        `;
      }

      case "textColor":
        return `
            {
                View targetV = registeredViews.get("${lookupKey}");
                if (targetV instanceof TextView) {
                    try { ((TextView) targetV).setTextColor(Color.parseColor("${val}")); } catch(Exception ignored){}
                }
            }
        `;

      case "backgroundColor":
        return `
            {
                View targetV = registeredViews.get("${lookupKey}");
                if (targetV != null) {
                    try { targetV.setBackgroundColor(Color.parseColor("${val}")); } catch(Exception ignored){}
                }
            }
        `;

      case "enabled": {
        const isEnabled = rawVal !== "false" && rawVal !== "0";
        return `
            {
                View targetV = registeredViews.get("${lookupKey}");
                if (targetV != null) {
                    targetV.setEnabled(${isEnabled});
                }
            }
        `;
      }

      case "checked": {
        const isChecked = rawVal === "true" || rawVal === "1";
        return `
            {
                View targetV = registeredViews.get("${lookupKey}");
                if (targetV instanceof CompoundButton) {
                    ((CompoundButton) targetV).setChecked(${isChecked});
                }
            }
        `;
      }

      case "progress":
      case "value": {
        const numVal = parseInt(rawVal, 10) || 50;
        return `
            {
                View targetV = registeredViews.get("${lookupKey}");
                if (targetV instanceof ProgressBar) {
                    ((ProgressBar) targetV).setProgress(${numVal});
                }
            }
        `;
      }

      default:
        return `
            {
                View targetV = registeredViews.get("${lookupKey}");
                if (targetV instanceof TextView) {
                    ((TextView) targetV).setText("${val}");
                }
            }
        `;
    }
  }
}
