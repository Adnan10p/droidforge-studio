/**
 * Generates live, context-aware Kotlin / Jetpack Compose code snippets
 * for individual logic nodes in the Logic Studio.
 */

export interface GeneratedSnippet {
  title: string;
  scope: string;
  code: string;
}

export function generateKotlinForNode(nodeType: string, data: any): GeneratedSnippet {
  switch (nodeType) {
    case "trigger": {
      const compName = (data.componentName || "Button").replace(/[^a-zA-Z0-9]/g, "");
      const event = (data.event || "Click").replace(/[^a-zA-Z0-9]/g, "");
      const fnName = `on${compName}${event}`;

      return {
        title: `Trigger: ${data.componentName} • ${data.event}`,
        scope: "Screen Composable & ViewModel",
        code: `// In Compose UI
Button(
    onClick = { viewModel.${fnName}() },
    enabled = ${data.enabled !== false}
) {
    Text("${data.componentName}")
}

// In ViewModel
fun ${fnName}() {
    viewModelScope.launch {
        // Connected flow actions execute sequentially
    }
}`,
      };
    }

    case "note": {
      return {
        title: `Comment: ${data.title || "Flow Note"}`,
        scope: "Non-Executable Documentation Node",
        code: `/*
 * NOTE / COMMENT (Non-Executable)
 * ${data.title || "Flow Note"}
 * ${(data.text || "").replace(/\n/g, "\n * ")}
 *
 * This block is excluded from Jetpack Compose code generation.
 */`,
      };
    }

    case "condition": {
      const cond = data.condition || {
        left: "emailInput.text",
        operator: "isEmpty",
        right: "",
      };

      let expr = "";
      if (cond.operator === "isEmpty") {
        expr = `${cond.left}.isEmpty()`;
      } else if (cond.operator === "isNotEmpty") {
        expr = `${cond.left}.isNotEmpty()`;
      } else if (cond.operator === "contains") {
        expr = `${cond.left}.contains("${cond.right}")`;
      } else {
        const isNumeric = !isNaN(Number(cond.right)) && cond.right !== "";
        const rightVal = isNumeric ? cond.right : `"${cond.right}"`;
        expr = `${cond.left} ${cond.operator} ${rightVal}`;
      }

      return {
        title: `Decision: ${cond.left} ${cond.operator}?`,
        scope: "Conditional Branching",
        code: `if (${expr}) {
    // ➔ YES Branch executes
    handleConditionYesPath()
} else {
    // ➔ NO Branch executes
    handleConditionNoPath()
}`,
      };
    }

    case "apiBranch": {
      const action = data.action || {
        method: "POST",
        endpoint: "/api/v1/auth/login",
      };
      const method = (action.method || "POST").toUpperCase();
      const endpoint = action.endpoint || "/api/v1/data";

      return {
        title: `API Branch: ${method} ${endpoint}`,
        scope: "Ktor / Retrofit Network Coroutine",
        code: `viewModelScope.launch {
    _uiState.update { it.copy(isLoading = true) }
    
    val result = runCatching {
        apiClient.${method.toLowerCase()}("${endpoint}")
    }
    
    result.onSuccess { response ->
        _uiState.update { it.copy(isLoading = false) }
        // ➔ SUCCESS Branch (200 OK)
    }.onFailure { error ->
        _uiState.update { it.copy(isLoading = false, error = error.message) }
        // ➔ FAILURE Branch (HTTP Error / Network failure)
    }
}`,
      };
    }

    case "note": {
      return {
        title: `Flow Documentation Note: ${data.title || "Note"}`,
        scope: "Code Documentation",
        code: `/**
 * [Flow Note: ${data.title || "Workflow"}]
 * ${data.text || "No details provided."}
 */`,
      };
    }

    case "action":
    default: {
      const act = data.action || {};
      const type = act.actionType || "setProperty";

      switch (type) {
        case "setProperty": {
          const prop = act.property || "text";
          const val = act.value ?? "Hello World";
          return {
            title: `Action: Set Property (${prop})`,
            scope: "StateFlow Mutation",
            code: `// Mutate UI State for ${act.targetId || "component"}
_uiState.update { state ->
    state.copy(
        ${prop} = "${val}"
    )
}`,
          };
        }

        case "setVariable": {
          const varName = act.variableName || "counter";
          const op = act.variableOperation || "increment";
          const val = act.variableValue ?? "1";

          let assignCode = `"${val}"`;
          if (op === "increment") {
            assignCode = `state.${varName} + ${val || 1}`;
          } else if (op === "decrement") {
            assignCode = `state.${varName} - ${val || 1}`;
          } else if (op === "toggle") {
            assignCode = `!state.${varName}`;
          }

          return {
            title: `Action: ${op} Variable (${varName})`,
            scope: "MutableStateFlow State Update",
            code: `// Reactive State Variable mutation
_uiState.update { state ->
    state.copy(
        ${varName} = ${assignCode}
    )
}`,
          };
        }

        case "navigate": {
          const target = act.targetScreen || "DetailScreen";
          return {
            title: `Action: Navigate to ${target}`,
            scope: "Jetpack Navigation Compose",
            code: `// Navigate with state restoration
navController.navigate("${target}") {
    launchSingleTop = true
    restoreState = true
}`,
          };
        }

        case "popBack": {
          return {
            title: `Action: Pop Screen Back`,
            scope: "NavController Backstack",
            code: `// Pop current screen off navigation stack
navController.popBackStack()`,
          };
        }

        case "toast": {
          const msg = act.message || "Action finished";
          return {
            title: `Action: Show Toast`,
            scope: "Android System Toast",
            code: `// Display short toast notification
Toast.makeText(
    context,
    "${msg}",
    Toast.LENGTH_SHORT
).show()`,
          };
        }

        case "snackbar": {
          const msg = act.message || "Action succeeded";
          const label = act.actionLabel || "UNDO";
          return {
            title: `Action: Show Snackbar`,
            scope: "Material3 Scaffold Host",
            code: `scope.launch {
    snackbarHostState.showSnackbar(
        message = "${msg}",
        actionLabel = "${label}",
        duration = SnackbarDuration.Short
    )
}`,
          };
        }

        case "callApi": {
          const method = (act.method || "GET").toLowerCase();
          const endpoint = act.endpoint || "/api/v1/data";
          return {
            title: `Action: Call API (${method.toUpperCase()})`,
            scope: "Ktor / Retrofit Network Client",
            code: `viewModelScope.launch {
    try {
        _uiState.update { it.copy(isLoading = true) }
        val response = httpClient.${method}("${endpoint}")
        _uiState.update { it.copy(isLoading = false, apiResult = response) }
    } catch (e: Exception) {
        _uiState.update { it.copy(isLoading = false, error = e.localizedMessage) }
    }
}`,
          };
        }

        case "vibrate": {
          const pattern = act.hapticPattern || "click";
          return {
            title: `Action: Haptic Feedback (${pattern})`,
            scope: "Android Vibrator Service",
            code: `val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
    vibrator.vibrate(
        VibrationEffect.createPredefined(VibrationEffect.EFFECT_CLICK)
    )
}`,
          };
        }

        case "delay": {
          const ms = act.delayMs || 1000;
          return {
            title: `Action: Delay (${ms}ms)`,
            scope: "Coroutines Delay",
            code: `// Suspend execution for ${ms}ms without blocking UI thread
kotlinx.coroutines.delay(${ms}L)`,
          };
        }

        case "openBrowser": {
          const url = act.url || "https://android.com";
          return {
            title: `Action: Open Browser`,
            scope: "Android Intent (ACTION_VIEW)",
            code: `val intent = Intent(Intent.ACTION_VIEW, Uri.parse("${url}"))
context.startActivity(intent)`,
          };
        }

        case "firebaseWrite": {
          const col = act.collectionName || "app_records";
          return {
            title: `Action: Firebase Write (${col})`,
            scope: "Firebase Firestore SDK",
            code: `Firebase.firestore.collection("${col}")
    .add(
        mapOf(
            "timestamp" to System.currentTimeMillis(),
            "userId" to currentUserId
        )
    )
    .await()`,
          };
        }

        default: {
          return {
            title: `Action: ${type}`,
            scope: "Jetpack Compose Logic Action",
            code: `// Executing action: ${type}
executeLogicAction("${type}")`,
          };
        }
      }
    }
  }
}
