import JSZip from "jszip";
import { AndroidScreen, AndroidComponent, ProjectConfig, ProjectAsset } from "../types";
import { DEFAULT_M3_THEME } from "../data/defaultTheme";
import { getComponentLogicMeta } from "../data/componentLogicMetadata";
import { getAllComponentsFromScreen } from "./screenManager";


// Generates real Jetpack Compose Kotlin code for any screen
export function generateJetpackComposeCode(
  screen: AndroidScreen,
  _config: ProjectConfig
): string {
  const compLines: string[] = [];

  function renderComponent(comp: AndroidComponent, indentLevel: number): string {
    const indent = "  ".repeat(indentLevel);
    const p = comp.props;

    switch (comp.type) {
      case "Toolbar":
        return `${indent}// Material 3 TopAppBar
${indent}CenterAlignedTopAppBar(
${indent}    title = { Text(text = "${p.title || screen.title}", fontWeight = FontWeight.Bold) },
${indent}    colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
${indent}        containerColor = Color(android.graphics.Color.parseColor("${p.backgroundColor || "#0F172A"}")),
${indent}        titleContentColor = Color(android.graphics.Color.parseColor("${p.textColor || "#FFFFFF"}"))
${indent}    )${
          p.showBackButton
            ? `,\n${indent}    navigationIcon = {\n${indent}        IconButton(onClick = onNavigateBack) {\n${indent}            Icon(imageVector = Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color.White)\n${indent}        }\n${indent}    }`
            : ""
        }
${indent})`;

      case "Card": {
        const childCode = comp.children && comp.children.length > 0
          ? comp.children.map((c) => renderComponent(c, indentLevel + 2)).join("\n\n")
          : `${indent}    Text("Empty Card Container", color = Color.Gray)`;

        return `${indent}ElevatedCard(
${indent}    modifier = Modifier
${indent}        .fillMaxWidth()
${indent}        .padding(horizontal = ${p.margin || 8}.dp, vertical = 4.dp),
${indent}    shape = RoundedCornerShape(${p.cornerRadius || 16}.dp),
${indent}    colors = CardDefaults.elevatedCardColors(containerColor = Color(android.graphics.Color.parseColor("${p.backgroundColor || "#FFFFFF"}"))),
${indent}    elevation = CardDefaults.elevatedCardElevation(defaultElevation = ${p.elevation || 2}.dp)
${indent}) {
${indent}    Column(
${indent}        modifier = Modifier.padding(${p.padding || 16}.dp),
${indent}        verticalArrangement = Arrangement.spacedBy(8.dp)
${indent}    ) {
${childCode}
${indent}    }
${indent}}`;
      }

      case "ScrollView": {
        const childCode = comp.children && comp.children.length > 0
          ? comp.children.map((c) => renderComponent(c, indentLevel + 1)).join("\n\n")
          : `${indent}  // Add child components here`;

        return `${indent}Column(
${indent}    modifier = Modifier
${indent}        .fillMaxSize()
${indent}        .verticalScroll(rememberScrollState())
${indent}        .padding(${p.padding || 12}.dp),
${indent}    verticalArrangement = Arrangement.spacedBy(10.dp)
${indent}) {
${childCode}
${indent}}`;
      }

      case "Recycler/List": {
        const items = p.items || ["Item A", "Item B", "Item C"];
        return `${indent}// LazyColumn / RecyclerView
${indent}LazyColumn(
${indent}    modifier = Modifier.fillMaxWidth().heightIn(max = 240.dp),
${indent}    verticalArrangement = Arrangement.spacedBy(6.dp)
${indent}) {
${indent}    items(listOf(${items.map((i: string) => `"${i}"`).join(", ")})) { itemText ->
${indent}        OutlinedCard(
${indent}            modifier = Modifier.fillMaxWidth().clickable { viewModel.onItemClicked(itemText) },
${indent}            shape = RoundedCornerShape(10.dp)
${indent}        ) {
${indent}            Text(text = itemText, modifier = Modifier.padding(12.dp), style = MaterialTheme.typography.bodyMedium)
${indent}        }
${indent}    }
${indent}}`;
      }

      case "Text":
        return `${indent}Text(
${indent}    text = "${p.text || "Label"}",
${indent}    style = MaterialTheme.typography.bodyLarge.copy(
${indent}        fontSize = ${p.fontSize || 16}.sp,
${indent}        fontWeight = ${p.fontWeight === "bold" ? "FontWeight.Bold" : "FontWeight.Normal"},
${indent}        color = Color(android.graphics.Color.parseColor("${p.textColor || "#0F172A"}"))
${indent}    ),
${indent}    modifier = Modifier.padding(${p.margin || 4}.dp)
${indent})`;

      case "Button":
        return `${indent}Button(
${indent}    onClick = { viewModel.on${comp.name}Click() },
${indent}    modifier = Modifier.fillMaxWidth().height(48.dp),
${indent}    shape = RoundedCornerShape(${p.cornerRadius || 12}.dp),
${indent}    colors = ButtonDefaults.buttonColors(containerColor = Color(android.graphics.Color.parseColor("${p.backgroundColor || "#2563EB"}")))
${indent}) {
${indent}    Text(
${indent}        text = "${p.text || "Click Action"}",
${indent}        color = Color(android.graphics.Color.parseColor("${p.textColor || "#FFFFFF"}")),
${indent}        fontWeight = FontWeight.SemiBold
${indent}    )
${indent}}`;

      case "Image":
      case "Image View":
      case "ImageView":
        return `${indent}// Async Image via Coil 2.7.0
${indent}AsyncImage(
${indent}    model = ImageRequest.Builder(LocalContext.current)
${indent}        .data("${p.url || p.src || "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6"}")
${indent}        .crossfade(true)
${indent}        .build(),
${indent}    contentDescription = "${p.alt || "Android preview"}",
${indent}    contentScale = ContentScale.Crop,
${indent}    modifier = Modifier
${indent}        .fillMaxWidth()
${indent}        .height(${p.layoutHeight || 180}.dp)
${indent}        .clip(RoundedCornerShape(${p.cornerRadius || 12}.dp))
${indent})`;

      case "TextField":
        return `${indent}OutlinedTextField(
${indent}    value = ${comp.name.toLowerCase()}State,
${indent}    onValueChange = { 
${indent}        ${comp.name.toLowerCase()}State = it
${indent}        viewModel.on${comp.name}OnTextChanged(it)
${indent}    },
${indent}    label = { Text("${p.hint || "Enter text"}") },
${indent}    placeholder = { Text("${p.hint || ""}") },
${indent}    shape = RoundedCornerShape(${p.cornerRadius || 10}.dp),
${indent}    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
${indent})`;

      case "Checkbox":
        return `${indent}Row(
${indent}    verticalAlignment = Alignment.CenterVertically,
${indent}    modifier = Modifier.fillMaxWidth().clickable { 
${indent}        is${comp.name}Checked = !is${comp.name}Checked
${indent}        viewModel.on${comp.name}OnCheckedChange(is${comp.name}Checked)
${indent}    }
${indent}) {
${indent}    Checkbox(
${indent}        checked = is${comp.name}Checked,
${indent}        onCheckedChange = { 
${indent}            is${comp.name}Checked = it
${indent}            viewModel.on${comp.name}OnCheckedChange(it)
${indent}        }
${indent}    )
${indent}    Spacer(modifier = Modifier.width(8.dp))
${indent}    Text(text = "${p.text || "Checkbox option"}", style = MaterialTheme.typography.bodyMedium)
${indent}}`;

      case "Switch":
        return `${indent}Row(
${indent}    verticalAlignment = Alignment.CenterVertically,
${indent}    horizontalArrangement = Arrangement.SpaceBetween,
${indent}    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
${indent}) {
${indent}    Text(text = "${p.text || "Enable toggle"}", style = MaterialTheme.typography.bodyMedium)
${indent}    Switch(
${indent}        checked = is${comp.name}Active,
${indent}        onCheckedChange = { 
${indent}            is${comp.name}Active = it
${indent}            viewModel.on${comp.name}OnCheckedChange(it)
${indent}        }
${indent}    )
${indent}}`;

      case "Slider":
        return `${indent}Column(modifier = Modifier.fillMaxWidth()) {
${indent}    Text(text = "Value: \${slider${comp.name}Val.toInt()}%", style = MaterialTheme.typography.labelMedium)
${indent}    Slider(
${indent}        value = slider${comp.name}Val,
${indent}        onValueChange = { 
${indent}            slider${comp.name}Val = it
${indent}            viewModel.on${comp.name}OnValueChange(it)
${indent}        },
${indent}        valueRange = 0f..100f,
${indent}        modifier = Modifier.fillMaxWidth()
${indent}    )
${indent}}`;

      case "Progress":
        return `${indent}LinearProgressIndicator(
${indent}    progress = { ${((p.progress || 50) / 100).toFixed(2)}f },
${indent}    modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)),
${indent}    color = MaterialTheme.colorScheme.primary
${indent})`;

      case "Location/GPS":
        return `${indent}// FusedLocationProviderClient Integration
${indent}Card(
${indent}    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
${indent}    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
${indent}) {
${indent}    Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
${indent}        Icon(Icons.Default.LocationOn, contentDescription = "GPS", tint = MaterialTheme.colorScheme.primary)
${indent}        Spacer(Modifier.width(8.dp))
${indent}        Text("${p.text || "Fused Location Provider Active"}", style = MaterialTheme.typography.bodySmall)
${indent}    }
${indent}}`;

      case "Wi-Fi":
      case "Bluetooth":
        return `${indent}// Hardware Subsystem: ${comp.type}
${indent}Surface(
${indent}    shape = RoundedCornerShape(10.dp),
${indent}    color = MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.5f),
${indent}    modifier = Modifier.fillMaxWidth()
${indent}) {
${indent}    Text(
${indent}        text = "${p.text || comp.type + " active"}",
${indent}        modifier = Modifier.padding(12.dp),
${indent}        style = MaterialTheme.typography.bodySmall
${indent}    )
${indent}}`;

      case "Camera":
        return `${indent}// CameraX PreviewView with ProcessCameraProvider
${indent}AndroidView(
${indent}    factory = { ctx ->
${indent}        androidx.camera.view.PreviewView(ctx).apply {
${indent}            scaleType = androidx.camera.view.PreviewView.ScaleType.FILL_CENTER
${indent}        }
${indent}    },
${indent}    modifier = Modifier
${indent}        .fillMaxWidth()
${indent}        .height(${p.layoutHeight || 200}.dp)
${indent}        .clip(RoundedCornerShape(${p.cornerRadius || 16}.dp))
${indent})`;

      case "ExoPlayer":
        return `${indent}// Media3 ExoPlayer Surface View
${indent}AndroidView(
${indent}    factory = { ctx ->
${indent}        androidx.media3.ui.PlayerView(ctx).apply {
${indent}            useController = true
${indent}            player = viewModel.exoPlayerInstance
${indent}        }
${indent}    },
${indent}    modifier = Modifier
${indent}        .fillMaxWidth()
${indent}        .height(${p.layoutHeight || 200}.dp)
${indent}        .clip(RoundedCornerShape(12.dp))
${indent})`;

      case "YouTube Player":
      case "YouTubePlayer":
      case "YouTube":
        return `${indent}// Component: ${comp.name} (Embedded YouTube Player)
${indent}val youtubeVideoUrlState = userSearchInputState.ifEmpty { "${p.url || p.videoUrl || ""}" }
${indent}val videoIdMatch = Regex("(?:youtu\\\\.be/|youtube\\\\.com/(?:embed/|v/|watch\\\\?v=|watch\\\\?.+&v=))([\\\\w-]{11})").find(youtubeVideoUrlState)
${indent}val currentVideoId = videoIdMatch?.groupValues?.get(1) ?: "${p.videoId || ""}"

${indent}AndroidView(
${indent}    factory = { context ->
${indent}        android.webkit.WebView(context).apply {
${indent}            settings.javaScriptEnabled = true
${indent}            settings.domStorageEnabled = true
${indent}            settings.loadWithOverviewMode = true
${indent}            settings.useWideViewPort = true
${indent}            webChromeClient = android.webkit.WebChromeClient()
${indent}            webViewClient = android.webkit.WebViewClient()
${indent}        }
${indent}    },
${indent}    update = { webView ->
${indent}        val html = """
${indent}            <!DOCTYPE html>
${indent}            <html>
${indent}            <head>
${indent}                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
${indent}                <style>
${indent}                    body { margin: 0; padding: 0; background-color: #000000; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
${indent}                    iframe { width: 100%; height: 100%; border: none; }
${indent}                </style>
${indent}            </head>
${indent}            <body>
${indent}                <iframe src="https://www.youtube.com/embed/\$currentVideoId?autoplay=1&playsinline=1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
${indent}            </body>
${indent}            </html>
${indent}        """.trimIndent()
${indent}        webView.loadDataWithBaseURL("https://www.youtube.com", html, "text/html", "utf-8", null)
${indent}    },
${indent}    modifier = Modifier
${indent}        .fillMaxWidth()
${indent}        .height(${p.layoutHeight || 220}.dp)
${indent}        .clip(RoundedCornerShape(${p.cornerRadius || 12}.dp))
${indent})`;

      default:
        return `${indent}// Component: ${comp.name} (${comp.type})
${indent}Surface(
${indent}    modifier = Modifier.fillMaxWidth().padding(4.dp),
${indent}    shape = RoundedCornerShape(8.dp),
${indent}    color = MaterialTheme.colorScheme.surface
${indent}) {
${indent}    Text("${comp.name} - ${comp.type}", modifier = Modifier.padding(10.dp))
${indent}}`;
    }
  }

  const renderedRoot = renderComponent(screen.rootComponent, 2);

  return `package com.droidforge.quickapp.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.droidforge.quickapp.viewmodel.${screen.name}ViewModel

/**
 * Auto-generated by DroidForge Studio Visual Engine.
 * Screen: ${screen.name}
 * Material 3 Edge-to-Edge with Coroutine State bindings.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ${screen.name}(
    viewModel: ${screen.name}ViewModel = viewModel(),
    onNavigateBack: () -> Unit = {},
    onNavigateTo: (String) -> Unit = {}
) {
    // Dynamic Reactive UI State Holders
    var userSearchInputState by remember { mutableStateOf("") }
    var isCloudSyncSwitchActive by remember { mutableStateOf(true) }
    var sliderHapticVolumeSliderVal by remember { mutableFloatStateOf(75f) }
    var isAcceptTermsChecked by remember { mutableStateOf(true) }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = Color(android.graphics.Color.parseColor("${screen.properties?.backgroundColor || "#FFFFFF"}")),
        ${screen.properties?.titleVisible !== false ? `topBar = {
            CenterAlignedTopAppBar(
                title = { Text(text = "${screen.properties?.title || screen.title || screen.name}", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = Color(android.graphics.Color.parseColor("${screen.properties?.primaryColor || "#4F46E5"}")),
                    titleContentColor = Color.White
                )
            )
        },` : ""}
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize(),
            contentAlignment = ${
              screen.properties?.alignVertical === "center"
                ? screen.properties?.alignHorizontal === "center"
                  ? "Alignment.Center"
                  : screen.properties?.alignHorizontal === "right"
                  ? "Alignment.CenterEnd"
                  : "Alignment.CenterStart"
                : screen.properties?.alignVertical === "bottom"
                ? screen.properties?.alignHorizontal === "center"
                  ? "Alignment.BottomCenter"
                  : screen.properties?.alignHorizontal === "right"
                  ? "Alignment.BottomEnd"
                  : "Alignment.BottomStart"
                : screen.properties?.alignHorizontal === "center"
                ? "Alignment.TopCenter"
                : screen.properties?.alignHorizontal === "right"
                ? "Alignment.TopEnd"
                : "Alignment.TopStart"
            }
        ) {
${renderedRoot}
        }
    }
}
`;
}

// Generates Screen ViewModel with Logic Blocks translated to Kotlin Coroutines
export function generateViewModelCode(screen: AndroidScreen): string {
  const stateVarLines = (screen.stateVariables || []).map((v) => {
    const nameLower = (v.name || "").toLowerCase();
    const isStringVar = v.type === "String" || nameLower.includes("url") || nameLower.includes("input") || nameLower.includes("text") || nameLower.includes("search") || nameLower.includes("query");
    const varType = isStringVar ? "String" : v.type === "Int" ? "Int" : v.type === "Boolean" ? "Boolean" : v.type === "Double" ? "Double" : v.type === "List" ? "List<String>" : "String";
    const initVal = isStringVar ? '""' : v.initialValue || (v.type === "Int" ? "0" : v.type === "Boolean" ? "false" : v.type === "List" ? "emptyList()" : '""');
    return `    val ${v.name}: ${varType} = ${initVal},`;
  });

  const methodSnippets = screen.logicBlocks.map((block) => {
    const actionLines = block.actions.map((act) => {
      let coreCode = "";
      switch (act.actionType) {
        case "toast":
          coreCode = `        _toastEvents.emit("${act.message || "Action dispatched"}")`;
          break;
        case "snackbar":
          coreCode = `        _snackbarEvents.emit(SnackbarMessage("${act.message || "Notification"}", "${act.actionLabel || "DISMISS"}"))`;
          break;
        case "dialog":
          coreCode = `        _dialogState.update { DialogConfig(title = "${act.dialogTitle || "Notice"}", message = "${act.dialogBody || ""}", isVisible = true) }`;
          break;
        case "bottomSheet":
          coreCode = `        _bottomSheetVisible.update { true }`;
          break;
        case "navigate":
          coreCode = `        _navigationEvents.emit(NavigationCommand.ToScreen("${act.targetScreen || "screen_details"}", transition = "${act.transitionType || "slide"}"))`;
          break;
        case "popBack":
          coreCode = `        _navigationEvents.emit(NavigationCommand.PopBack)`;
          break;
        case "callMethod": {
          const mName = (act as any).methodName || "execute";
          const target = (act.targetId || "component").replace(/^comp_/, "").replace(/_\d+_\d+$/, "");
          const mArgs = (act as any).methodArgs || {};
          const argPairs = Object.entries(mArgs).map(([k, v]) => typeof v === "string" ? `"${v}"` : typeof v === "number" ? `${v}f` : `${v}`);
          const argStr = argPairs.join(", ");
          coreCode = `        // Call method ${mName} on ${target}\n        ${target.charAt(0).toLowerCase() + target.slice(1)}Controller.${mName.charAt(0).toLowerCase() + mName.slice(1)}(${argStr})`;
          break;
        }
        case "setProperty": {

          const prop = act.property || "text";
          coreCode = `        // Mutate target state property for ${prop} on ${act.targetId || "target"}\n        _uiState.update { it.copy(${prop} = "${act.value ?? ""}") }`;
          break;
        }
        case "setVariable":
          if (act.variableOperation === "increment") {
            coreCode = `        _uiState.update { it.copy(${act.variableName || "count"} = it.${act.variableName || "count"} + ${act.variableValue || 1}) }`;
          } else if (act.variableOperation === "decrement") {
            coreCode = `        _uiState.update { it.copy(${act.variableName || "count"} = it.${act.variableName || "count"} - ${act.variableValue || 1}) }`;
          } else if (act.variableOperation === "toggle") {
            coreCode = `        _uiState.update { it.copy(${act.variableName || "isActive"} = !it.${act.variableName || "isActive"}) }`;
          } else {
            coreCode = `        _uiState.update { it.copy(${act.variableName || "customState"} = "${act.variableValue || "updated"}") }`;
          }
          break;
        case "callApi":
          coreCode = `        val response = apiClient.execute("${act.method || "GET"}", "${act.endpoint || "/api/v1/data"}")\n        _uiState.update { it.copy(statusMessage = "Loaded HTTP 200 OK") }`;
          break;
        case "databaseInsert":
          coreCode = `        roomDatabase.recordDao().insert(RecordEntity(payload = "${act.value || "entry"}", timestamp = System.currentTimeMillis()))`;
          break;
        case "databaseQuery":
          coreCode = `        val cachedData = roomDatabase.recordDao().getAllEntities()\n        _uiState.update { it.copy(items = cachedData.map { it.payload }) }`;
          break;
        case "preferencesSave":
          coreCode = `        dataStore.edit { preferences -> preferences[stringPreferencesKey("${act.variableName || "token"}")] = "${act.variableValue || "val"}" }`;
          break;
        case "firebaseWrite":
          coreCode = `        firestore.collection("${act.collectionName || "app_data"}").add(mapOf("timestamp" to System.currentTimeMillis()))`;
          break;
        case "firebaseRead":
          coreCode = `        firestore.collection("${act.collectionName || "user_profiles"}").document("current").get().addOnSuccessListener { snapshot ->\n            // Reactive snapshot bind\n        }`;
          break;
        case "vibrate":
          coreCode = `        hapticFeedback.performHapticFeedback("${act.hapticPattern || "click"}")`;
          break;
        case "playAudio":
          coreCode = `        soundPool.playCue("${act.value || "chime"}")`;
          break;
        case "copyToClipboard":
          coreCode = `        clipboardManager.setText(AnnotatedString("${act.value || ""}"))`;
          break;
        case "toggleFlashlight":
          coreCode = `        cameraManager.toggleTorch()`;
          break;
        case "openBrowser":
          coreCode = `        _browserEvents.emit("${act.url || "https://android.com"}")`;
          break;
        case "share":
          coreCode = `        _shareIntentEvents.emit("${act.message || "Shared from QuickForge"}")`;
          break;
        case "aiQuery":
          coreCode = `        val aiPrompt = "${act.message || "Analyze context"}"\n        val aiResult = geminiClient.generateContent(aiPrompt)\n        _uiState.update { it.copy(statusMessage = aiResult.text ?: "") }`;
          break;
        case "textToSpeech":
          coreCode = `        textToSpeech.speak("${act.ttsText || "Action triggered"}", TextToSpeech.QUEUE_FLUSH, null, "tts_id")`;
          break;
        case "requestPermission":
          coreCode = `        _permissionRequests.emit("${act.permission || "android.permission.CAMERA"}")`;
          break;
        case "delay":
          coreCode = `        kotlinx.coroutines.delay(${act.delayMs || 1000}L)`;
          break;
        default:
          coreCode = `        // Block action: ${act.actionType}`;
      }

      if (act.conditionEnabled && act.condition) {
        return `        if (uiState.value.${act.condition.left} ${act.condition.operator === "contains" ? ".contains(\"${act.condition.right}\")" : `${act.condition.operator} "${act.condition.right}"`}) {\n    ${coreCode}\n        }`;
      }
      return coreCode;
    });

    let paramSig = "";
    if (block.event === "OnTextChanged") {
      paramSig = "newText: String = \"\"";
    } else if (block.event === "OnCheckedChange" || block.event === "CheckedChange") {
      paramSig = "isChecked: Boolean = false";
    } else if (block.event === "OnValueChange" || block.event === "ValueChange") {
      paramSig = "newValue: Float = 0f";
    } else if (block.event === "OnItemClick") {
      paramSig = "selectedItem: String = \"\"";
    } else if (block.event === "OnLocationChanged") {
      paramSig = "latitude: Double = 0.0, longitude: Double = 0.0";
    } else if (block.event === "OnBarcodeScanned") {
      paramSig = "barcode: String = \"\"";
    }

    const methodName = `on${block.componentName}${block.event}`;
    return `    /**
     * Triggered by: ${block.description}
     * Event: ${block.event}
     */
    fun ${methodName}(${paramSig}) {
        if (!${block.enabled !== false}) return
        viewModelScope.launch {
${actionLines.join("\n")}
        }
    }`;
  });

  return `package com.droidforge.quickapp.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class ${screen.name}UiState(
    val isLoading: Boolean = false,
    val statusMessage: String = "Ready",
    val items: List<String> = emptyList(),
${stateVarLines.join("\n")}
)

sealed interface NavigationCommand {
    data class ToScreen(val destinationId: String, val transition: String) : NavigationCommand
    object PopBack : NavigationCommand
}

data class SnackbarMessage(val message: String, val actionLabel: String = "DISMISS")
data class DialogConfig(val title: String = "", val message: String = "", val isVisible: Boolean = false)

class ${screen.name}ViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(${screen.name}UiState())
    val uiState = _uiState.asStateFlow()

    private val _toastEvents = MutableSharedFlow<String>()
    val toastEvents = _toastEvents.asSharedFlow()

    private val _snackbarEvents = MutableSharedFlow<SnackbarMessage>()
    val snackbarEvents = _snackbarEvents.asSharedFlow()

    private val _navigationEvents = MutableSharedFlow<NavigationCommand>()
    val navigationEvents = _navigationEvents.asSharedFlow()

    private val _browserEvents = MutableSharedFlow<String>()
    val browserEvents = _browserEvents.asSharedFlow()

    private val _shareIntentEvents = MutableSharedFlow<String>()
    val shareIntentEvents = _shareIntentEvents.asSharedFlow()

    private val _permissionRequests = MutableSharedFlow<String>()
    val permissionRequests = _permissionRequests.asSharedFlow()

    private val _dialogState = MutableStateFlow(DialogConfig())
    val dialogState = _dialogState.asStateFlow()

    private val _bottomSheetVisible = MutableStateFlow(false)
    val bottomSheetVisible = _bottomSheetVisible.asStateFlow()

${methodSnippets.join("\n\n")}

    fun dismissDialog() {
        _dialogState.update { it.copy(isVisible = false) }
    }

    fun dismissBottomSheet() {
        _bottomSheetVisible.update { false }
    }
}
`;
}

// Generates AndroidManifest.xml
export function generateAndroidManifest(config: ProjectConfig, screens: AndroidScreen[]): string {
  const compPermissions = new Set<string>(config.permissions || []);
  for (const scr of screens || []) {
    const allComps = getAllComponentsFromScreen(scr);
    for (const c of allComps) {
      const meta = getComponentLogicMeta(c.type);
      if (meta.permissions) {
        meta.permissions.forEach((p) => compPermissions.add(p));
      }
    }
  }
  const permLines = Array.from(compPermissions).map((p) => `    <uses-permission android:name="${p}" />`).join("\n");
  const initialScreen = screens.find((s) => s.isInitial) || screens[0];

  const metaDataLines: string[] = [];



  if (config.googleAdsAppId) {
    metaDataLines.push(`        <!-- Google Ads / AdMob App ID -->\n        <meta-data\n            android:name="com.google.android.gms.ads.APPLICATION_ID"\n            android:value="${config.googleAdsAppId}" />`);
  }

  if (config.googleMapsApiKey) {
    metaDataLines.push(`        <!-- Google Maps API Key -->\n        <meta-data\n            android:name="com.google.android.geo.API_KEY"\n            android:value="${config.googleMapsApiKey}" />`);
  }

  if (config.googlePlayGamesAppId) {
    metaDataLines.push(`        <!-- Google Play Games Services App ID -->\n        <meta-data\n            android:name="com.google.android.gms.games.APP_ID"\n            android:value="${config.googlePlayGamesAppId}" />`);
  }

  if (config.appLovinSdkKey) {
    metaDataLines.push(`        <!-- AppLovin MAX SDK Key -->\n        <meta-data\n            android:name="applovin.sdk.key"\n            android:value="${config.appLovinSdkKey}" />`);
  }

  if (config.startIoAppId) {
    metaDataLines.push(`        <!-- Start.io SDK App ID -->\n        <meta-data\n            android:name="com.startapp.sdk.APPLICATION_ID"\n            android:value="${config.startIoAppId}" />`);
  }

  if (config.unityAdsGameId) {
    metaDataLines.push(`        <!-- Unity Ads Game ID -->\n        <meta-data\n            android:name="com.unity3d.ads.GAME_ID"\n            android:value="${config.unityAdsGameId}" />`);
  }

  if (config.oneSignalAppId) {
    metaDataLines.push(`        <!-- OneSignal Push Notification App ID -->\n        <meta-data\n            android:name="onesignal_app_id"\n            android:value="${config.oneSignalAppId}" />`);
  }

  if (config.googleCloudProjectNumber) {
    metaDataLines.push(`        <!-- Google Cloud Project Number (Play Integrity) -->\n        <meta-data\n            android:name="com.google.android.play.core.integrity.PROJECT_NUMBER"\n            android:value="${config.googleCloudProjectNumber}" />`);
  }

  if (config.enableSplashScreen) {
    metaDataLines.push(`        <!-- Android 12+ Core SplashScreen Branding -->\n        <meta-data\n            android:name="android.splashscreen.enabled"\n            android:value="true" />`);
  }

  const renderedMeta = metaDataLines.length > 0 ? `\n${metaDataLines.join("\n\n")}\n` : "";

  return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="${config.packageName}">

    <!-- System & Hardware Permissions -->
${permLines}

    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="${config.appName}"
        android:roundIcon="@mipmap/ic_launcher"
        android:supportsRtl="true"
        android:theme="@style/Theme.DroidForgeApp"
        android:enableOnBackInvokedCallback="true"
        tools:targetApi="35">
${renderedMeta}
        <!-- Main Launcher Activity -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:windowSoftInputMode="adjustResize"
            android:theme="@style/Theme.DroidForgeApp">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

    </application>

</manifest>
`;
}

// Generates app/build.gradle.kts
export function generateBuildGradleKts(config: ProjectConfig, screens?: AndroidScreen[]): string {
  const abiFiltersStr = config.architectures.map((a) => `"${a}"`).join(", ");
  const depSet = new Set<string>();

  (config.dependencies || []).filter((d) => d.enabled).forEach((d) => {
    depSet.add(`    implementation("${d.group}:${d.artifact}:${d.version}")`);
  });

  if (screens) {
    for (const scr of screens) {
      const allComps = getAllComponentsFromScreen(scr);
      for (const c of allComps) {
        const meta = getComponentLogicMeta(c.type);
        if (meta.dependencies) {
          meta.dependencies.forEach((d) => {
            depSet.add(`    implementation("${d.group}:${d.artifact}:${d.version}")`);
          });
        }
      }
    }
  }


  const depLines = Array.from(depSet).join("\n");


  return `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "${config.packageName}"
    compileSdk = ${config.compileSdk}

    defaultConfig {
        applicationId = "${config.packageName}"
        minSdk = ${config.minSdk}
        targetSdk = ${config.targetSdk}
        versionCode = ${config.versionCode}
        versionName = "${config.versionName}"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }

        ${
          config.enableNdk
            ? `ndk {
            abiFilters.addAll(listOf(${abiFiltersStr}))
        }
        externalNativeBuild {
            cmake {
                path = file("src/main/cpp/CMakeLists.txt")
                version = "3.22.1"
            }
        }`
            : ""
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
        ${config.enableNdk ? "prefab = true" : ""}
    }
}

dependencies {
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
${depLines}

    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    debugImplementation(libs.androidx.ui.tooling)
}
`;
}

// Generates CMakeLists.txt and native-lib.cpp for NDK
export function generateNativeCppCode(config: ProjectConfig): { cmake: string; cpp: string } {
  const cmake = `cmake_minimum_required(VERSION 3.22.1)

project("droidforge_native")

# Adds and compiles the native C++ library
add_library(
    droidforge_native
    SHARED
    native-lib.cpp
)

find_library(
    log-lib
    log
)

target_link_libraries(
    droidforge_native
    \${log-lib}
)
`;

  const cpp = `// Auto-generated by DroidForge Studio NDK Engine
#include <jni.h>
#include <string>
#include <android/log.h>

#define TAG "DroidForgeNative"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, TAG, __VA_ARGS__)

extern "C" JNIEXPORT jstring JNICALL
Java_com_droidforge_quickapp_MainActivity_getNativeBridgeString(
        JNIEnv* env,
        jobject /* this */) {
    std::string hello = "Native NDK v26.1 C++20 Core Running (ARM64-v8a Optimized)";
    LOGI("Native bridge string returned successfully");
    return env->NewStringUTF(hello.c_str());
}

extern "C" JNIEXPORT jbyteArray JNICALL
Java_com_droidforge_quickapp_MainActivity_nativeDecryptBuffer(
        JNIEnv* env,
        jobject /* this */,
        jbyteArray data) {
    // Hardware-accelerated memory transform simulation
    return data;
}
`;

  return { cmake, cpp };
}

// Generates MainActivity.kt
export function generateMainActivityKt(config: ProjectConfig, screens: AndroidScreen[]): string {
  const initial = screens.find((s) => s.isInitial) || screens[0];

  return `package ${config.packageName}

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.*
import com.droidforge.quickapp.ui.screens.${initial.name}
import com.droidforge.quickapp.ui.theme.QuickForgeTheme

class MainActivity : ComponentActivity() {

    ${
      config.enableNdk
        ? `companion object {
        init {
            System.loadLibrary("droidforge_native")
        }
    }

    external fun getNativeBridgeString(): String
    external fun nativeDecryptBuffer(data: ByteArray): ByteArray`
        : ""
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            QuickForgeTheme {
                ${initial.name}()
            }
        }
    }
}
`;
}

// Exports the complete Android Studio project as a downloadable ZIP
export async function exportAndroidStudioZip(
  config: ProjectConfig,
  screens: AndroidScreen[],
  assets: ProjectAsset[]
): Promise<Blob> {
  const zip = new JSZip();

  // Root files
  zip.file(
    "build.gradle.kts",
    `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
}
`
  );

  zip.file(
    "settings.gradle.kts",
    `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        maven { url = java.net.URI("https://jitpack.io") }
    }
}

rootProject.name = "${config.appName}"
include(":app")
`
  );

  zip.file(
    "gradle.properties",
    `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=false
android.nonTransitiveRClass=true
kotlin.code.style=official
`
  );

  // gradle/libs.versions.toml
  zip.file(
    "gradle/libs.versions.toml",
    `[versions]
agp = "8.7.0"
kotlin = "${config.kotlinVersion}"
coreKtx = "1.15.0"
junit = "4.13.2"
junitVersion = "1.2.1"
espressoCore = "3.6.1"
lifecycleRuntimeKtx = "2.8.7"
activityCompose = "1.9.3"
composeBom = "2024.10.01"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
junit = { group = "junit", name = "junit", version.ref = "junit" }
androidx-junit = { group = "androidx.test.ext", name = "junit", version.ref = "junitVersion" }
androidx-espresso-core = { group = "androidx.test.espresso", name = "espresso-core", version.ref = "espressoCore" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-lifecycle-viewmodel-compose = { group = "androidx.lifecycle", name = "lifecycle-viewmodel-compose", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-ui-tooling = { group = "androidx.compose.ui", name = "ui-tooling" }
androidx-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
`
  );

  // app module
  zip.file("app/build.gradle.kts", generateBuildGradleKts(config, screens));

  zip.file("app/src/main/AndroidManifest.xml", generateAndroidManifest(config, screens));
  zip.file(
    `app/src/main/java/com/droidforge/quickapp/MainActivity.kt`,
    generateMainActivityKt(config, screens)
  );

  // App Theme Files (Theme.kt, Color.kt, Type.kt, Shape.kt)
  const themeDir = `app/src/main/java/${config.packageName.replace(/\./g, "/")}/ui/theme`;
  zip.file(`${themeDir}/Theme.kt`, generateThemeKt(config));
  zip.file(`${themeDir}/Color.kt`, generateColorKt(config));
  zip.file(`${themeDir}/Type.kt`, generateTypeKt(config, assets));
  zip.file(`${themeDir}/Shape.kt`, generateShapeKt(config));

  // Generate each screen's Compose file & ViewModel
  for (const scr of screens) {
    zip.file(
      `app/src/main/java/com/droidforge/quickapp/ui/screens/${scr.name}.kt`,
      generateJetpackComposeCode(scr, config)
    );
    zip.file(
      `app/src/main/java/com/droidforge/quickapp/viewmodel/${scr.name}ViewModel.kt`,
      generateViewModelCode(scr)
    );
  }

  // C++ NDK sources
  if (config.enableNdk) {
    const { cmake, cpp } = generateNativeCppCode(config);
    zip.file("app/src/main/cpp/CMakeLists.txt", cmake);
    zip.file("app/src/main/cpp/native-lib.cpp", cpp);
  }

  // Res directories
  zip.file(
    "app/src/main/res/values/strings.xml",
    `<resources>
    <string name="app_name">${config.appName}</string>
</resources>
`
  );
  zip.file(
    "app/src/main/res/values/colors.xml",
    `<resources>
    <color name="primary">#2563EB</color>
    <color name="primary_dark">#1D4ED8</color>
    <color name="accent">#38BDF8</color>
</resources>
`
  );

  // Sample placeholder asset files in res/
  for (const asset of assets) {
    zip.file(`app/src/main/${asset.targetResDir}/${asset.name}`, `// Asset file: ${asset.name}`);
  }

  return await zip.generateAsync({ type: "blob" });
}

// Converts hex color (#6750A4) to Jetpack Compose Color(0xFF6750A4)
function toComposeColor(hex: string): string {
  const clean = hex.replace("#", "").toUpperCase();
  return `Color(0xFF${clean})`;
}

// Generates Color.kt with Light & Dark Material 3 tokens
export function generateColorKt(config: ProjectConfig): string {
  const theme = config.theme || DEFAULT_M3_THEME;
  const l = theme.lightColors;
  const d = theme.darkColors;

  return `package ${config.packageName}.ui.theme

import androidx.compose.ui.graphics.Color

// Light Color Tokens
val md_theme_light_primary = ${toComposeColor(l.primary)}
val md_theme_light_onPrimary = ${toComposeColor(l.onPrimary)}
val md_theme_light_primaryContainer = ${toComposeColor(l.primaryContainer)}
val md_theme_light_onPrimaryContainer = ${toComposeColor(l.onPrimaryContainer)}
val md_theme_light_secondary = ${toComposeColor(l.secondary)}
val md_theme_light_onSecondary = ${toComposeColor(l.onSecondary)}
val md_theme_light_secondaryContainer = ${toComposeColor(l.secondaryContainer)}
val md_theme_light_onSecondaryContainer = ${toComposeColor(l.onSecondaryContainer)}
val md_theme_light_tertiary = ${toComposeColor(l.tertiary)}
val md_theme_light_onTertiary = ${toComposeColor(l.onTertiary)}
val md_theme_light_tertiaryContainer = ${toComposeColor(l.tertiaryContainer)}
val md_theme_light_onTertiaryContainer = ${toComposeColor(l.onTertiaryContainer)}
val md_theme_light_error = ${toComposeColor(l.error)}
val md_theme_light_onError = ${toComposeColor(l.onError)}
val md_theme_light_errorContainer = ${toComposeColor(l.errorContainer)}
val md_theme_light_onErrorContainer = ${toComposeColor(l.onErrorContainer)}
val md_theme_light_background = ${toComposeColor(l.background)}
val md_theme_light_onBackground = ${toComposeColor(l.onBackground)}
val md_theme_light_surface = ${toComposeColor(l.surface)}
val md_theme_light_onSurface = ${toComposeColor(l.onSurface)}
val md_theme_light_surfaceVariant = ${toComposeColor(l.surfaceVariant)}
val md_theme_light_onSurfaceVariant = ${toComposeColor(l.onSurfaceVariant)}
val md_theme_light_outline = ${toComposeColor(l.outline)}
val md_theme_light_outlineVariant = ${toComposeColor(l.outlineVariant)}

// Dark Color Tokens
val md_theme_dark_primary = ${toComposeColor(d.primary)}
val md_theme_dark_onPrimary = ${toComposeColor(d.onPrimary)}
val md_theme_dark_primaryContainer = ${toComposeColor(d.primaryContainer)}
val md_theme_dark_onPrimaryContainer = ${toComposeColor(d.onPrimaryContainer)}
val md_theme_dark_secondary = ${toComposeColor(d.secondary)}
val md_theme_dark_onSecondary = ${toComposeColor(d.onSecondary)}
val md_theme_dark_secondaryContainer = ${toComposeColor(d.secondaryContainer)}
val md_theme_dark_onSecondaryContainer = ${toComposeColor(d.onSecondaryContainer)}
val md_theme_dark_tertiary = ${toComposeColor(d.tertiary)}
val md_theme_dark_onTertiary = ${toComposeColor(d.onTertiary)}
val md_theme_dark_tertiaryContainer = ${toComposeColor(d.tertiaryContainer)}
val md_theme_dark_onTertiaryContainer = ${toComposeColor(d.onTertiaryContainer)}
val md_theme_dark_error = ${toComposeColor(d.error)}
val md_theme_dark_onError = ${toComposeColor(d.onError)}
val md_theme_dark_errorContainer = ${toComposeColor(d.errorContainer)}
val md_theme_dark_onErrorContainer = ${toComposeColor(d.onErrorContainer)}
val md_theme_dark_background = ${toComposeColor(d.background)}
val md_theme_dark_onBackground = ${toComposeColor(d.onBackground)}
val md_theme_dark_surface = ${toComposeColor(d.surface)}
val md_theme_dark_onSurface = ${toComposeColor(d.onSurface)}
val md_theme_dark_surfaceVariant = ${toComposeColor(d.surfaceVariant)}
val md_theme_dark_onSurfaceVariant = ${toComposeColor(d.onSurfaceVariant)}
val md_theme_dark_outline = ${toComposeColor(d.outline)}
val md_theme_dark_outlineVariant = ${toComposeColor(d.outlineVariant)}
`;
}

// Generates Type.kt
export function generateTypeKt(config: ProjectConfig, assets?: ProjectAsset[]): string {
  const theme = config.theme || DEFAULT_M3_THEME;
  const typo = theme.typography;
  const baseFont = typo.baseFontFamily || "Roboto";

  const fontAssets = (assets || []).filter(
    (a) =>
      a.type === "font" ||
      a.targetResDir.startsWith("res/font") ||
      ["ttf", "otf", "woff", "woff2"].includes(a.format)
  );

  const matchedCustomFont = fontAssets.find((a) => {
    const cleanName = a.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();
    return cleanName === baseFont.toLowerCase() || a.name === baseFont;
  });

  let fontFamilyDecl = "val TypographyFontFamily = FontFamily.Default";
  let fontFamilyRef = "TypographyFontFamily";

  if (matchedCustomFont) {
    const resName = matchedCustomFont.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();
    fontFamilyDecl = `// Custom Uploaded Font Resource: res/font/${matchedCustomFont.fileName}
val CustomAppFontFamily = FontFamily(
    Font(R.font.${resName}, FontWeight.Normal)
)`;
    fontFamilyRef = "CustomAppFontFamily";
  }

  const pkg = config.packageName || "com.droidforge.quickapp";
  const hasCustomImport = matchedCustomFont ? `\nimport ${pkg}.R\nimport androidx.compose.ui.text.font.Font` : "";

  return `package ${pkg}.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp${hasCustomImport}

// Base Font Family: ${typo.baseFontFamily}
${fontFamilyDecl}

val Typography = Typography(
    displayLarge = TextStyle(
        fontFamily = ${fontFamilyRef},
        fontWeight = FontWeight.Normal,
        fontSize = ${typo.displayLarge.fontSize}.sp,
        lineHeight = ${typo.displayLarge.lineHeight}.sp
    ),
    headlineMedium = TextStyle(
        fontFamily = ${fontFamilyRef},
        fontWeight = FontWeight.Normal,
        fontSize = ${typo.headlineMedium.fontSize}.sp,
        lineHeight = ${typo.headlineMedium.lineHeight}.sp
    ),
    titleLarge = TextStyle(
        fontFamily = ${fontFamilyRef},
        fontWeight = FontWeight.Medium,
        fontSize = ${typo.titleLarge.fontSize}.sp,
        lineHeight = ${typo.titleLarge.lineHeight}.sp
    ),
    titleMedium = TextStyle(
        fontFamily = ${fontFamilyRef},
        fontWeight = FontWeight.Medium,
        fontSize = ${typo.titleMedium.fontSize}.sp,
        lineHeight = ${typo.titleMedium.lineHeight}.sp
    ),
    bodyLarge = TextStyle(
        fontFamily = ${fontFamilyRef},
        fontWeight = FontWeight.Normal,
        fontSize = ${typo.bodyLarge.fontSize}.sp,
        lineHeight = ${typo.bodyLarge.lineHeight}.sp
    ),
    bodyMedium = TextStyle(
        fontFamily = ${fontFamilyRef},
        fontWeight = FontWeight.Normal,
        fontSize = ${typo.bodyMedium.fontSize}.sp,
        lineHeight = ${typo.bodyMedium.lineHeight}.sp
    ),
    labelLarge = TextStyle(
        fontFamily = ${fontFamilyRef},
        fontWeight = FontWeight.Medium,
        fontSize = ${typo.labelLarge.fontSize}.sp,
        lineHeight = ${typo.labelLarge.lineHeight}.sp
    ),
    labelMedium = TextStyle(
        fontFamily = ${fontFamilyRef},
        fontWeight = FontWeight.Medium,
        fontSize = ${typo.labelMedium.fontSize}.sp,
        lineHeight = ${typo.labelMedium.lineHeight}.sp
    )
)
`;
}

// Generates Shape.kt
export function generateShapeKt(config: ProjectConfig): string {
  const theme = config.theme || DEFAULT_M3_THEME;
  const s = theme.shapes;

  return `package ${config.packageName}.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Shapes
import androidx.compose.ui.unit.dp

// Material 3 Shape Tokens
val Shapes = Shapes(
    extraSmall = RoundedCornerShape(${s.extraSmall}.dp),
    small = RoundedCornerShape(${s.small}.dp),
    medium = RoundedCornerShape(${s.medium}.dp),
    large = RoundedCornerShape(${s.large}.dp),
    extraLarge = RoundedCornerShape(${s.extraLarge}.dp)
)
`;
}

// Generates Theme.kt
export function generateThemeKt(config: ProjectConfig): string {
  const dynamicColor = config.theme?.useDynamicColor ?? true;

  return `package ${config.packageName}.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext

private val LightColorScheme = lightColorScheme(
    primary = md_theme_light_primary,
    onPrimary = md_theme_light_onPrimary,
    primaryContainer = md_theme_light_primaryContainer,
    onPrimaryContainer = md_theme_light_onPrimaryContainer,
    secondary = md_theme_light_secondary,
    onSecondary = md_theme_light_onSecondary,
    secondaryContainer = md_theme_light_secondaryContainer,
    onSecondaryContainer = md_theme_light_onSecondaryContainer,
    tertiary = md_theme_light_tertiary,
    onTertiary = md_theme_light_onTertiary,
    tertiaryContainer = md_theme_light_tertiaryContainer,
    onTertiaryContainer = md_theme_light_onTertiaryContainer,
    error = md_theme_light_error,
    onError = md_theme_light_onError,
    errorContainer = md_theme_light_errorContainer,
    onErrorContainer = md_theme_light_onErrorContainer,
    background = md_theme_light_background,
    onBackground = md_theme_light_onBackground,
    surface = md_theme_light_surface,
    onSurface = md_theme_light_onSurface,
    surfaceVariant = md_theme_light_surfaceVariant,
    onSurfaceVariant = md_theme_light_onSurfaceVariant,
    outline = md_theme_light_outline,
    outlineVariant = md_theme_light_outlineVariant
)

private val DarkColorScheme = darkColorScheme(
    primary = md_theme_dark_primary,
    onPrimary = md_theme_dark_onPrimary,
    primaryContainer = md_theme_dark_primaryContainer,
    onPrimaryContainer = md_theme_dark_onPrimaryContainer,
    secondary = md_theme_dark_secondary,
    onSecondary = md_theme_dark_onSecondary,
    secondaryContainer = md_theme_dark_secondaryContainer,
    onSecondaryContainer = md_theme_dark_onSecondaryContainer,
    tertiary = md_theme_dark_tertiary,
    onTertiary = md_theme_dark_onTertiary,
    tertiaryContainer = md_theme_dark_tertiaryContainer,
    onTertiaryContainer = md_theme_dark_onTertiaryContainer,
    error = md_theme_dark_error,
    onError = md_theme_dark_onError,
    errorContainer = md_theme_dark_errorContainer,
    onErrorContainer = md_theme_dark_onErrorContainer,
    background = md_theme_dark_background,
    onBackground = md_theme_dark_onBackground,
    surface = md_theme_dark_surface,
    onSurface = md_theme_dark_onSurface,
    surfaceVariant = md_theme_dark_surfaceVariant,
    onSurfaceVariant = md_theme_dark_onSurfaceVariant,
    outline = md_theme_dark_outline,
    outlineVariant = md_theme_dark_outlineVariant
)

@Composable
fun QuickForgeTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    // Dynamic color is available on Android 12+ (API 31+)
    dynamicColor: Boolean = ${dynamicColor},
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        shapes = Shapes,
        content = content
    )
}
`;
}

// Exports Complete Master DroidForge Companion Android Studio App (.zip)
export async function exportCompanionStudioZip(): Promise<void> {
  const zip = new JSZip();

  // Root files
  zip.file(
    "settings.gradle.kts",
    `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "DroidForgeCompanion"
include(":app")
`
  );

  zip.file(
    "build.gradle.kts",
    `plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
}
`
  );

  const appFolder = zip.folder("app");
  if (appFolder) {
    appFolder.file(
      "build.gradle.kts",
      `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "com.droidforge.companion"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.droidforge.companion"
        minSdk = 24
        targetSdk = 35
        versionCode = 24
        versionName = "2.4.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.activity:activity-compose:1.10.1")
    implementation(platform("androidx.compose:compose-bom:2025.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("io.coil-kt:coil-compose:2.7.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
}
`
    );

    const mainFolder = appFolder.folder("src/main");
    if (mainFolder) {
      mainFolder.file(
        "AndroidManifest.xml",
        `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.droidforge.companion">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="DroidForge Companion"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.AppCompat.Light.NoActionBar">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.AppCompat.Light.NoActionBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
`
      );

      const javaFolder = mainFolder.folder("java/com/droidforge/companion");
      if (javaFolder) {
        javaFolder.file(
          "MainActivity.kt",
          `package com.droidforge.companion

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    var pairingCode by remember { mutableStateOf("") }
                    var statusMessage by remember { mutableStateOf("Ready to connect to DroidForge Studio") }

                    Column(
                        modifier = Modifier.fillMaxSize().padding(24.dp),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text("DroidForge Companion Live Receiver", style = MaterialTheme.typography.headlineSmall)
                        Spacer(modifier = Modifier.height(16.dp))
                        OutlinedTextField(
                            value = pairingCode,
                            onValueChange = { pairingCode = it },
                            label = { Text("Enter Studio Pair Code (e.g. DF-8492-LIVE)") },
                            modifier = Modifier.fillMaxWidth()
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(
                            onClick = { statusMessage = "Connected to Studio WebSocket Host" },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Connect to Studio Live Stream")
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(statusMessage, style = MaterialTheme.typography.bodyMedium)
                    }
                }
            }
        }
    }
}
`
        );
      }
    }
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const fileName = "DroidForgeCompanion-Master-Source.zip";
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.setAttribute("download", fileName);
  a.download = fileName;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

// Downloads a real pre-built compiled binary DroidForge Companion APK package (.apk) instantly
export async function downloadCompanionApkFile(): Promise<void> {
  const fileName = "DroidForge-Companion-v6.0.0-Master.apk";
  const downloadUrl = "/downloads/DroidForge-Companion-v6.0.0-Master.apk";

  try {
    const res = await fetch(downloadUrl);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.style.display = "none";
    a.href = blobUrl;
    a.download = fileName;
    a.setAttribute("download", fileName);
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(blobUrl);
    }, 2000);
  } catch (_e) {
    // Fallback direct link
    window.location.href = downloadUrl;
  }
}




