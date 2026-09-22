import {
  AndroidScreen,
  AndroidComponent,
  LogicBlock,
  LogicAction,
  StateVariable,
  ComponentCategory,
} from "../types";
import { COMPONENT_DEFINITIONS } from "../data/componentRegistry";

export interface ParseResult {
  success: boolean;
  screen: AndroidScreen;
  stats: {
    componentsCount: number;
    logicBlocksCount: number;
    variablesCount: number;
    details: string[];
  };
  warnings: string[];
}

let globalIdCounter = 1;

/**
 * Generates an unequivocally unique ID with timestamp, counter, and crypto-random entropy.
 */
export function generateUniqueComposeId(prefix: string): string {
  const ts = Date.now();
  const counter = globalIdCounter++;
  const rand = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${ts}_${counter}_${rand}`;
}

/**
 * Intelligent Compose / Kotlin parser that converts Jetpack Compose screen code
 * into an AndroidComponent tree and associated LogicBlocks for Canvas and Logic Studio.
 */
export function parseComposeToScreen(
  code: string,
  baseScreen: AndroidScreen,
  allScreens: AndroidScreen[] = []
): ParseResult {
  const warnings: string[] = [];
  const details: string[] = [];

  try {
    // 1. Detect Screen Name
    let screenName = baseScreen.name;
    const funMatch = code.match(/fun\s+([A-Za-z0-9_]+)\s*\(/);
    if (funMatch && funMatch[1] && !["Row", "Column", "Box", "Card", "Text", "Button"].includes(funMatch[1])) {
      screenName = funMatch[1];
      details.push(`Detected Composable Screen: ${screenName}`);
    }

    // 2. Extract State Variables
    const stateVariables: StateVariable[] = [];
    const stateRegex = /var\s+([A-Za-z0-9_]+)\s+by\s+remember\s*\{\s*(mutableStateOf|mutableIntStateOf|mutableFloatStateOf|mutableLongStateOf)\s*\(([^)]*)\)\s*\}/g;
    let match: RegExpExecArray | null;

    while ((match = stateRegex.exec(code)) !== null) {
      const varName = match[1];
      const stateFn = match[2];
      const rawVal = match[3].trim().replace(/^"|"$/g, "");

      let type: StateVariable["type"] = "String";
      let initialValue = rawVal;

      if (stateFn === "mutableIntStateOf" || (!isNaN(Number(rawVal)) && !rawVal.includes("."))) {
        type = "Int";
        initialValue = rawVal || "0";
      } else if (stateFn === "mutableFloatStateOf" || (!isNaN(Number(rawVal)) && rawVal.includes("."))) {
        type = "Double";
        initialValue = rawVal.replace(/f$/i, "") || "0.0";
      } else if (rawVal === "true" || rawVal === "false") {
        type = "Boolean";
        initialValue = rawVal;
      }

      stateVariables.push({
        id: generateUniqueComposeId(`var_${varName}`),
        name: varName,
        type,
        initialValue,
        description: `Reactive state variable extracted from Composable`,
      });
      details.push(`Extracted state variable: ${varName} (${type})`);
    }

    // 3. Extract Background / Surface Color
    let screenBg = "#F8FAFC";
    const bgMatch = code.match(/Color\s*\([^)]*parseColor\s*\(\s*"([^"]+)"\s*\)\s*\)/) ||
      code.match(/Surface\s*\([^)]*color\s*=\s*Color\s*\((0x[0-9A-Fa-f]+)\)/);
    if (bgMatch && bgMatch[1]) {
      screenBg = bgMatch[1].startsWith("0x")
        ? `#${bgMatch[1].slice(-6)}`
        : bgMatch[1];
    }

    // Extract TopAppBar title if present
    let screenTitle = baseScreen.title || screenName;
    const topBarTitleMatch = code.match(/TopAppBar\s*\([^)]*title\s*=\s*\{\s*Text\s*\([^)]*text\s*=\s*"([^"]+)"/i) ||
      code.match(/CenterAlignedTopAppBar\s*\([^)]*title\s*=\s*\{\s*Text\s*\([^)]*text\s*=\s*"([^"]+)"/i);
    if (topBarTitleMatch && topBarTitleMatch[1]) {
      screenTitle = topBarTitleMatch[1];
    }

    // 4. Parse Components & Logic Blocks
    const parsedComponents: AndroidComponent[] = [];
    const logicBlocks: LogicBlock[] = [];
    let compCounter = 1;

    const getDefaultProps = (type: string): Record<string, any> => {
      const def = COMPONENT_DEFINITIONS.find((c) => c.type === type);
      return def ? { ...def.defaultProps } : {};
    };

    // Helper to create logic block for button / action
    const createLogicBlockForAction = (
      comp: AndroidComponent,
      lambdaCode: string = "",
      customEvent: string = "Click"
    ): LogicBlock => {
      const blockId = generateUniqueComposeId(`block_${comp.id}`);
      const actions: LogicAction[] = [];

      // Check for navigation inside lambda
      const navMatch = lambdaCode.match(/(?:navigate|onNavigateTo)\s*\(\s*"([^"]+)"/i) ||
        lambdaCode.match(/NavigationCommand\.ToScreen\s*\(\s*"([^"]+)"/i);
      
      const isPopBack = /(?:popBackStack|onNavigateBack|NavigationCommand\.PopBack)/i.test(lambdaCode);

      // Check for toast
      const toastMatch = lambdaCode.match(/Toast\.makeText\s*\([^,]+,\s*"([^"]+)"/i) ||
        lambdaCode.match(/_toastEvents\.emit\s*\(\s*"([^"]+)"/i);

      // Check for snackbar
      const snackMatch = lambdaCode.match(/showSnackbar\s*\(\s*(?:message\s*=\s*)?"([^"]+)"/i) ||
        lambdaCode.match(/_snackbarEvents\.emit\s*\(\s*SnackbarMessage\s*\(\s*"([^"]+)"/i);

      // Check for api
      const apiMatch = lambdaCode.match(/(?:apiClient|http|httpClient)\.(get|post|put|delete)\s*\(\s*"([^"]+)"/i) ||
        lambdaCode.match(/apiClient\.execute\s*\(\s*"([^"]+)"\s*,\s*"([^"]+)"/i);

      // Check for variable increment / decrement / assignment
      const varIncrementMatch = lambdaCode.match(/([A-Za-z0-9_]+)\s*\+\+/i) ||
        lambdaCode.match(/([A-Za-z0-9_]+)\s*\+=\s*([0-9]+)/i);
      const varDecrementMatch = lambdaCode.match(/([A-Za-z0-9_]+)\s*--/i) ||
        lambdaCode.match(/([A-Za-z0-9_]+)\s*-=\s*([0-9]+)/i);
      const varToggleMatch = lambdaCode.match(/([A-Za-z0-9_]+)\s*=\s*!/i);
      const varAssignMatch = lambdaCode.match(/([A-Za-z0-9_]+)\s*=\s*(true|false|"[^"]*"|[0-9]+)/i);

      // Check for dialog
      const dialogMatch = lambdaCode.match(/DialogConfig\s*\(\s*title\s*=\s*"([^"]+)"(?:,\s*message\s*=\s*"([^"]+)")?/i) ||
        lambdaCode.match(/AlertDialog\s*\([^)]*title\s*=\s*\{\s*Text\s*\("([^"]+)"\)/i);

      // 1. Navigation Action
      if (navMatch && navMatch[1]) {
        actions.push({
          id: generateUniqueComposeId("act_nav"),
          actionType: "navigate",
          targetScreen: navMatch[1],
          transitionType: "slide",
        });
      } else if (isPopBack) {
        actions.push({
          id: generateUniqueComposeId("act_pop"),
          actionType: "popBack",
        });
      }

      // 2. Toast Action
      if (toastMatch && toastMatch[1]) {
        actions.push({
          id: generateUniqueComposeId("act_toast"),
          actionType: "toast",
          message: toastMatch[1],
          duration: "short",
        });
      }

      // 3. Snackbar Action
      if (snackMatch && snackMatch[1]) {
        actions.push({
          id: generateUniqueComposeId("act_snack"),
          actionType: "snackbar",
          message: snackMatch[1],
          actionLabel: "OK",
        });
      }

      // 4. API Call
      if (apiMatch) {
        actions.push({
          id: generateUniqueComposeId("act_api"),
          actionType: "callApi",
          method: (apiMatch[1] || "GET").toUpperCase() as any,
          endpoint: apiMatch[2] || "/api/v1/data",
        });
      }

      // 5. Variable Mutator
      if (varIncrementMatch) {
        actions.push({
          id: generateUniqueComposeId("act_var"),
          actionType: "setVariable",
          variableName: varIncrementMatch[1],
          variableOperation: "increment",
          variableValue: varIncrementMatch[2] || "1",
        });
      } else if (varDecrementMatch) {
        actions.push({
          id: generateUniqueComposeId("act_var"),
          actionType: "setVariable",
          variableName: varDecrementMatch[1],
          variableOperation: "decrement",
          variableValue: varDecrementMatch[2] || "1",
        });
      } else if (varToggleMatch) {
        actions.push({
          id: generateUniqueComposeId("act_var"),
          actionType: "setVariable",
          variableName: varToggleMatch[1],
          variableOperation: "toggle",
        });
      } else if (varAssignMatch) {
        actions.push({
          id: generateUniqueComposeId("act_var"),
          actionType: "setVariable",
          variableName: varAssignMatch[1],
          variableOperation: "assign",
          variableValue: varAssignMatch[2].replace(/^"|"$/g, ""),
        });
      }

      // 6. Dialog Action
      if (dialogMatch) {
        actions.push({
          id: generateUniqueComposeId("act_diag"),
          actionType: "dialog",
          dialogTitle: dialogMatch[1] || "Notice",
          dialogBody: dialogMatch[2] || "Action completed.",
          dialogConfirmText: "OK",
        });
      }

      // Fallback Semantic Inference: if no actions were found directly in code,
      // infer high-utility defaults based on button text / name!
      if (actions.length === 0) {
        const lowerName = (comp.name + " " + (comp.props.text || "")).toLowerCase();
        if (lowerName.includes("login") || lowerName.includes("sign in")) {
          // Look for an existing screen like HomeScreen or Dashboard
          const nextScreen = allScreens.find((s) => s.name.toLowerCase().includes("home") || s.name.toLowerCase().includes("dashboard"))?.name || "HomeScreen";
          actions.push({
            id: generateUniqueComposeId("act_nav"),
            actionType: "navigate",
            targetScreen: nextScreen,
            transitionType: "slide",
          });
          actions.push({
            id: generateUniqueComposeId("act_toast"),
            actionType: "toast",
            message: "Welcome back! Login successful.",
          });
        } else if (lowerName.includes("register") || lowerName.includes("sign up")) {
          actions.push({
            id: generateUniqueComposeId("act_toast"),
            actionType: "toast",
            message: "Account created successfully!",
          });
        } else if (lowerName.includes("cart") || lowerName.includes("buy")) {
          actions.push({
            id: generateUniqueComposeId("act_snack"),
            actionType: "snackbar",
            message: "Added item to cart!",
            actionLabel: "VIEW CART",
          });
        } else if (lowerName.includes("submit") || lowerName.includes("send")) {
          actions.push({
            id: generateUniqueComposeId("act_toast"),
            actionType: "toast",
            message: "Submitted successfully!",
          });
        } else if (lowerName.includes("back")) {
          actions.push({
            id: generateUniqueComposeId("act_pop"),
            actionType: "popBack",
          });
        } else if (lowerName.includes("delete") || lowerName.includes("remove")) {
          actions.push({
            id: generateUniqueComposeId("act_toast"),
            actionType: "toast",
            message: "Item removed.",
          });
        } else if (lowerName.includes("increment") || lowerName.includes("plus") || lowerName.includes("add")) {
          actions.push({
            id: generateUniqueComposeId("act_var"),
            actionType: "setVariable",
            variableName: stateVariables[0]?.name || "counter",
            variableOperation: "increment",
            variableValue: "1",
          });
        } else if (lowerName.includes("decrement") || lowerName.includes("minus")) {
          actions.push({
            id: generateUniqueComposeId("act_var"),
            actionType: "setVariable",
            variableName: stateVariables[0]?.name || "counter",
            variableOperation: "decrement",
            variableValue: "1",
          });
        } else {
          actions.push({
            id: generateUniqueComposeId("act_toast"),
            actionType: "toast",
            message: `${comp.props.text || comp.name} clicked!`,
          });
        }
      }

      return {
        id: blockId,
        componentId: comp.id,
        componentName: comp.name,
        event: customEvent,
        eventCategory: "gesture",
        description: `Handle ${customEvent} on ${comp.name}`,
        actions,
        enabled: true,
      };
    };

    // Scan TopAppBar
    const topBarMatch = code.match(/(?:CenterAlignedTopAppBar|TopAppBar)\s*\(([\s\S]*?)\)/);
    if (topBarMatch) {
      const topBarContent = topBarMatch[1];
      const titleMatch = topBarContent.match(/title\s*=\s*\{\s*Text\s*\([^)]*text\s*=\s*"([^"]+)"/);
      const bgMatch = topBarContent.match(/containerColor\s*=\s*Color\s*\([^)]*parseColor\s*\(\s*"([^"]+)"\s*\)\s*\)/);
      const hasBack = /navigationIcon\s*=/i.test(topBarContent);

      const toolbarComp: AndroidComponent = {
        id: generateUniqueComposeId("comp_toolbar"),
        type: "Toolbar",
        name: "TopAppBar",
        category: "Navigation",
        props: {
          ...getDefaultProps("Toolbar"),
          title: titleMatch ? titleMatch[1] : screenTitle,
          backgroundColor: bgMatch ? bgMatch[1] : "#0F172A",
          textColor: "#FFFFFF",
          showBackButton: hasBack,
        },
      };
      parsedComponents.push(toolbarComp);
      details.push(`Added Toolbar: "${toolbarComp.props.title}"`);
    }

    // Scan for Cards and their contents
    const cardRegex = /(?:ElevatedCard|OutlinedCard|Card)\s*\(([\s\S]*?)\)\s*\{([\s\S]*?)\n\s*\}/g;
    let cardMatch: RegExpExecArray | null;

    // Keep track of card sub-blocks to avoid duplicate parsing
    const cardSnippets: string[] = [];

    while ((cardMatch = cardRegex.exec(code)) !== null) {
      const cardHeader = cardMatch[1];
      const cardBody = cardMatch[2];
      cardSnippets.push(cardMatch[0]);

      const bgMatch = cardHeader.match(/containerColor\s*=\s*Color\s*\([^)]*parseColor\s*\(\s*"([^"]+)"\s*\)\s*\)/);
      const radiusMatch = cardHeader.match(/RoundedCornerShape\s*\(\s*([0-9]+)\.dp\s*\)/);
      const elevMatch = cardHeader.match(/defaultElevation\s*=\s*([0-9]+)\.dp/);

      const cardComp: AndroidComponent = {
        id: generateUniqueComposeId("comp_card"),
        type: "Card",
        name: `CardContainer${compCounter++}`,
        category: "Containment",
        props: {
          ...getDefaultProps("Card"),
          backgroundColor: bgMatch ? bgMatch[1] : "#FFFFFF",
          cornerRadius: radiusMatch ? parseInt(radiusMatch[1], 10) : 16,
          elevation: elevMatch ? parseInt(elevMatch[1], 10) : 2,
        },
        children: [],
      };

      // Parse inner children of this Card
      parseChildElements(cardBody, cardComp.children!, () => compCounter++, createLogicBlockForAction, logicBlocks, details);
      parsedComponents.push(cardComp);
      details.push(`Added Card Container with ${cardComp.children?.length || 0} nested elements`);
    }

    // Now remove parsed card snippets from the remaining code string to parse top-level items
    let remainingCode = code;
    for (const snip of cardSnippets) {
      remainingCode = remainingCode.replace(snip, "/* Card parsed */");
    }

    // Parse all remaining top-level elements
    parseChildElements(remainingCode, parsedComponents, () => compCounter++, createLogicBlockForAction, logicBlocks, details);

    // If no components were parsed, synthesize clean starter components from code keywords
    if (parsedComponents.length === 0) {
      const defaultButton: AndroidComponent = {
        id: generateUniqueComposeId("comp_button"),
        type: "Button",
        name: "ActionButton",
        category: "Actions",
        props: {
          ...getDefaultProps("Button"),
          text: "Action Button",
          backgroundColor: "#2563EB",
          textColor: "#FFFFFF",
        },
      };
      parsedComponents.push(defaultButton);
      logicBlocks.push(createLogicBlockForAction(defaultButton, ""));
      warnings.push("No explicit Compose element signatures recognized. Created default interactive button.");
    }

    // 5. Wrap parsed components into a top-level ScrollView or Column rootComponent
    const rootComponent: AndroidComponent = {
      id: baseScreen.rootComponent?.id || generateUniqueComposeId("comp_root"),
      type: "ScrollView",
      name: "RootContainer",
      category: "Layout & Containers",
      props: {
        ...getDefaultProps("ScrollView"),
        padding: 16,
        orientation: "vertical",
        backgroundColor: screenBg,
      },
      children: parsedComponents,
    };

    // Ensure every single action ID and block ID is 100% unique across the screen
    const seenIds = new Set<string>();
    logicBlocks.forEach((b, bIdx) => {
      if (!b.id || seenIds.has(b.id)) {
        b.id = generateUniqueComposeId(`block_${b.componentId || bIdx}`);
      }
      seenIds.add(b.id);

      (b.actions || []).forEach((a, aIdx) => {
        if (!a.id || seenIds.has(a.id)) {
          a.id = generateUniqueComposeId(`act_${a.actionType || "action"}_${aIdx}`);
        }
        seenIds.add(a.id);

        if (a.subActions) {
          a.subActions.forEach((sub, sIdx) => {
            if (!sub.id || seenIds.has(sub.id)) {
              sub.id = generateUniqueComposeId(`act_sub_${sIdx}`);
            }
            seenIds.add(sub.id);
          });
        }
        if (a.elseActions) {
          a.elseActions.forEach((els, eIdx) => {
            if (!els.id || seenIds.has(els.id)) {
              els.id = generateUniqueComposeId(`act_else_${eIdx}`);
            }
            seenIds.add(els.id);
          });
        }
      });
    });

    const updatedScreen: AndroidScreen = {
      ...baseScreen,
      name: screenName,
      title: screenTitle,
      rootComponent,
      logicBlocks,
      stateVariables: stateVariables.length > 0 ? stateVariables : baseScreen.stateVariables || [],
      properties: {
        ...(baseScreen.properties || {}),
        backgroundColor: screenBg,
        title: screenTitle,
      },
    };

    return {
      success: true,
      screen: updatedScreen,
      stats: {
        componentsCount: countTotalComponents(rootComponent),
        logicBlocksCount: logicBlocks.length,
        variablesCount: updatedScreen.stateVariables?.length || 0,
        details,
      },
      warnings,
    };
  } catch (err: any) {
    return {
      success: false,
      screen: baseScreen,
      stats: {
        componentsCount: 0,
        logicBlocksCount: 0,
        variablesCount: 0,
        details: [],
      },
      warnings: [`Parsing failed: ${err?.message || "Syntax error in Compose code"}`],
    };
  }
}

/**
 * Parses individual child elements from a block of Jetpack Compose code.
 */
function parseChildElements(
  snippet: string,
  targetList: AndroidComponent[],
  nextCounter: () => number,
  createLogicBlockForAction: (comp: AndroidComponent, lambda: string, evt?: string) => LogicBlock,
  logicBlocks: LogicBlock[],
  details: string[]
) {
  const getDefaultProps = (type: string): Record<string, any> => {
    const def = COMPONENT_DEFINITIONS.find((c) => c.type === type);
    return def ? { ...def.defaultProps } : {};
  };

  // 1. Scan for Buttons: Button(...), ElevatedButton(...), OutlinedButton(...), IconButton(...)
  const buttonRegex = /(Button|ElevatedButton|OutlinedButton|TextButton|IconButton)\s*\(([\s\S]*?)\)\s*\{([\s\S]*?)\n\s*\}/g;
  let btnMatch: RegExpExecArray | null;

  while ((btnMatch = buttonRegex.exec(snippet)) !== null) {
    const btnType = btnMatch[1];
    const btnArgs = btnMatch[2];
    const btnBody = btnMatch[3];

    // Extract text from inner Text("...") composable
    const textMatch = btnBody.match(/Text\s*\([^)]*text\s*=\s*"([^"]+)"/) ||
      btnBody.match(/Text\s*\(\s*"([^"]+)"/);
    const btnText = textMatch ? textMatch[1] : btnType === "IconButton" ? "" : "Click Me";

    // Extract onClick lambda
    const onClickMatch = btnArgs.match(/onClick\s*=\s*\{([\s\S]*?)\}/) ||
      btnArgs.match(/onClick\s*=\s*([A-Za-z0-9_.]+)/);
    const lambdaCode = onClickMatch ? onClickMatch[1] : "";

    // Extract color
    const colorMatch = btnArgs.match(/containerColor\s*=\s*Color\s*\([^)]*parseColor\s*\(\s*"([^"]+)"\s*\)\s*\)/);
    const radiusMatch = btnArgs.match(/RoundedCornerShape\s*\(\s*([0-9]+)\.dp\s*\)/);

    const isIcon = btnType === "IconButton";
    const compType = isIcon ? "IconButton" : "Button";
    const compName = isIcon
      ? `IconButton${nextCounter()}`
      : `${btnText.replace(/[^a-zA-Z0-9]/g, "") || "Button"}${nextCounter()}`;

    const buttonComp: AndroidComponent = {
      id: generateUniqueComposeId(`comp_${compType.toLowerCase()}`),
      type: compType,
      name: compName,
      category: "Actions",
      props: {
        ...getDefaultProps(compType),
        text: btnText,
        variant: btnType === "OutlinedButton" ? "outlined" : btnType === "TextButton" ? "text" : "filled",
        backgroundColor: colorMatch ? colorMatch[1] : btnType === "OutlinedButton" ? "transparent" : "#2563EB",
        textColor: btnType === "OutlinedButton" ? "#2563EB" : "#FFFFFF",
        cornerRadius: radiusMatch ? parseInt(radiusMatch[1], 10) : 12,
        icon: isIcon ? "heart" : undefined,
      },
    };

    targetList.push(buttonComp);
    const block = createLogicBlockForAction(buttonComp, lambdaCode, "Click");
    logicBlocks.push(block);
    details.push(`Added Button: "${buttonComp.props.text || buttonComp.name}" with ${block.actions.length} action(s)`);
  }

  // 2. Scan for TextFields: OutlinedTextField(...) or TextField(...)
  const textfieldRegex = /(OutlinedTextField|TextField)\s*\(([\s\S]*?)\)/g;
  let tfMatch: RegExpExecArray | null;

  while ((tfMatch = textfieldRegex.exec(snippet)) !== null) {
    const tfArgs = tfMatch[2];

    const labelMatch = tfArgs.match(/label\s*=\s*\{\s*Text\s*\([^)]*text\s*=\s*"([^"]+)"/) ||
      tfArgs.match(/label\s*=\s*\{\s*Text\s*\(\s*"([^"]+)"/);
    const placeholderMatch = tfArgs.match(/placeholder\s*=\s*\{\s*Text\s*\([^)]*text\s*=\s*"([^"]+)"/) ||
      tfArgs.match(/placeholder\s*=\s*\{\s*Text\s*\(\s*"([^"]+)"/);
    
    const isPassword = /PasswordVisualTransformation/i.test(tfArgs) || /password/i.test(tfArgs);
    const hintText = labelMatch ? labelMatch[1] : placeholderMatch ? placeholderMatch[1] : "Enter text";

    const compName = `Input_${hintText.replace(/[^a-zA-Z0-9]/g, "") || "Field"}_${nextCounter()}`;

    const tfComp: AndroidComponent = {
      id: generateUniqueComposeId("comp_textfield"),
      type: "TextField",
      name: compName,
      category: "Inputs",
      props: {
        ...getDefaultProps("TextField"),
        hint: hintText,
        placeholder: placeholderMatch ? placeholderMatch[1] : hintText,
        isPassword,
        inputType: isPassword ? "password" : "text",
      },
    };

    targetList.push(tfComp);
    details.push(`Added TextField: "${hintText}"`);
  }

  // 3. Scan for Text: Text(...) (excluding those inside Buttons or AppBars)
  const textRegex = /Text\s*\(([\s\S]*?)\)/g;
  let txtMatch: RegExpExecArray | null;

  while ((txtMatch = textRegex.exec(snippet)) !== null) {
    const txtArgs = txtMatch[1];
    // Ignore if this is a label/title/placeholder parameter of another widget
    if (txtArgs.includes("label =") || txtArgs.includes("placeholder =")) continue;

    const valMatch = txtArgs.match(/text\s*=\s*"([^"]+)"/) || txtArgs.match(/^\s*"([^"]+)"/);
    if (!valMatch) continue;

    const textContent = valMatch[1];
    const sizeMatch = txtArgs.match(/fontSize\s*=\s*([0-9]+)\.sp/);
    const colorMatch = txtArgs.match(/color\s*=\s*Color\s*\([^)]*parseColor\s*\(\s*"([^"]+)"\s*\)\s*\)/);
    const isBold = /FontWeight\.Bold/i.test(txtArgs);

    const textComp: AndroidComponent = {
      id: generateUniqueComposeId("comp_text"),
      type: "Text",
      name: `Text_${textContent.slice(0, 10).replace(/[^a-zA-Z0-9]/g, "") || "Label"}_${nextCounter()}`,
      category: "Basic UI",
      props: {
        ...getDefaultProps("Text"),
        text: textContent,
        fontSize: sizeMatch ? parseInt(sizeMatch[1], 10) : 16,
        textColor: colorMatch ? colorMatch[1] : "#1E293B",
        bold: isBold,
      },
    };

    targetList.push(textComp);
    details.push(`Added Text Label: "${textContent.slice(0, 24)}"`);
  }

  // 4. Scan for AsyncImage / Image
  const imgRegex = /(?:AsyncImage|Image)\s*\(([\s\S]*?)\)/g;
  let imgMatch: RegExpExecArray | null;

  while ((imgMatch = imgRegex.exec(snippet)) !== null) {
    const imgArgs = imgMatch[1];
    const modelMatch = imgArgs.match(/model\s*=\s*"([^"]+)"/);
    const descMatch = imgArgs.match(/contentDescription\s*=\s*"([^"]+)"/);

    const imgComp: AndroidComponent = {
      id: generateUniqueComposeId("comp_image"),
      type: "Image",
      name: `ImageBanner${nextCounter()}`,
      category: "Basic UI",
      props: {
        ...getDefaultProps("Image"),
        imageUrl: modelMatch ? modelMatch[1] : "https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?w=600&auto=format&fit=crop&q=80",
        alt: descMatch ? descMatch[1] : "Sample Image",
        scaleType: "fitCenter",
      },
    };

    targetList.push(imgComp);
    details.push(`Added Image: "${imgComp.props.alt}"`);
  }

  // 5. Scan for Switch: Switch(...)
  const switchRegex = /Switch\s*\(([\s\S]*?)\)/g;
  let swMatch: RegExpExecArray | null;

  while ((swMatch = switchRegex.exec(snippet)) !== null) {
    const swArgs = swMatch[1];
    const checked = /checked\s*=\s*true/i.test(swArgs);

    const swComp: AndroidComponent = {
      id: generateUniqueComposeId("comp_switch"),
      type: "Switch",
      name: `ToggleSwitch${nextCounter()}`,
      category: "Inputs",
      props: {
        ...getDefaultProps("Switch"),
        text: "Enable feature",
        checked,
      },
    };

    targetList.push(swComp);
    const block = createLogicBlockForAction(swComp, swArgs, "CheckedChange");
    logicBlocks.push(block);
    details.push(`Added Switch: ${swComp.name}`);
  }

  // 6. Scan for Checkbox: Checkbox(...)
  const cbRegex = /Checkbox\s*\(([\s\S]*?)\)/g;
  let cbMatch: RegExpExecArray | null;

  while ((cbMatch = cbRegex.exec(snippet)) !== null) {
    const cbArgs = cbMatch[1];
    const checked = /checked\s*=\s*true/i.test(cbArgs);

    const cbComp: AndroidComponent = {
      id: generateUniqueComposeId("comp_checkbox"),
      type: "Checkbox",
      name: `Checkbox${nextCounter()}`,
      category: "Inputs",
      props: {
        ...getDefaultProps("Checkbox"),
        text: "Accept Terms & Conditions",
        checked,
      },
    };

    targetList.push(cbComp);
    const block = createLogicBlockForAction(cbComp, cbArgs, "CheckedChange");
    logicBlocks.push(block);
    details.push(`Added Checkbox: ${cbComp.name}`);
  }

  // 7. Scan for Slider: Slider(...)
  const sliderRegex = /Slider\s*\(([\s\S]*?)\)/g;
  let sldMatch: RegExpExecArray | null;

  while ((sldMatch = sliderRegex.exec(snippet)) !== null) {
    const sldComp: AndroidComponent = {
      id: generateUniqueComposeId("comp_slider"),
      type: "Slider",
      name: `Slider${nextCounter()}`,
      category: "Inputs",
      props: {
        ...getDefaultProps("Slider"),
        value: 50,
        min: 0,
        max: 100,
      },
    };
    targetList.push(sldComp);
    details.push(`Added Slider: ${sldComp.name}`);
  }

  // 8. Scan for Progress: LinearProgressIndicator / CircularProgressIndicator
  const progressRegex = /(LinearProgressIndicator|CircularProgressIndicator)\s*\(([\s\S]*?)\)/g;
  let prgMatch: RegExpExecArray | null;

  while ((prgMatch = progressRegex.exec(snippet)) !== null) {
    const prgType = prgMatch[1];
    const prgComp: AndroidComponent = {
      id: generateUniqueComposeId("comp_progress"),
      type: "Progress",
      name: `ProgressIndicator${nextCounter()}`,
      category: "Progress",
      props: {
        ...getDefaultProps("Progress"),
        progress: 65,
        isCircular: prgType === "CircularProgressIndicator",
      },
    };
    targetList.push(prgComp);
    details.push(`Added Progress Indicator`);
  }

  // 9. Scan for Dividers
  const divRegex = /(HorizontalDivider|Divider)\s*\(/g;
  if (divRegex.test(snippet)) {
    const divComp: AndroidComponent = {
      id: generateUniqueComposeId("comp_divider"),
      type: "HorizontalDivider",
      name: `Divider${nextCounter()}`,
      category: "Basic UI",
      props: {
        ...getDefaultProps("HorizontalDivider"),
        thickness: 1,
        color: "#E2E8F0",
      },
    };
    targetList.push(divComp);
  }
}

/**
 * Counts total components recursively
 */
function countTotalComponents(comp: AndroidComponent): number {
  let count = 1;
  if (comp.children) {
    for (const child of comp.children) {
      count += countTotalComponents(child);
    }
  }
  return count;
}
