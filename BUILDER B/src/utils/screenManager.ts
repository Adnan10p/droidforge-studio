import { AndroidComponent, AndroidScreen, LogicBlock, LogicAction } from "../types";

/**
 * Normalizes any string into a valid Kotlin Jetpack Compose composable name.
 * e.g. "my custom screen" -> "MyCustomScreen", "checkout-page" -> "CheckoutPageScreen"
 */
export function formatComposableName(raw: string): string {
  if (!raw || !raw.trim()) return "NewScreen";
  
  // Clean special characters
  const cleaned = raw.replace(/[^a-zA-Z0-9\s_-]/g, " ");
  const parts = cleaned.split(/[\s_-]+/).filter(Boolean);
  
  if (parts.length === 0) return "NewScreen";
  
  let result = parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");

  // Ensure it doesn't start with a number
  if (/^[0-9]/.test(result)) {
    result = "Screen" + result;
  }

  // Ensure it ends with Screen if user didn't write it
  if (!result.toLowerCase().endsWith("screen")) {
    result += "Screen";
  }

  return result;
}

/**
 * Creates human-friendly screen title from a composable name.
 * e.g. "UserProfileScreen" -> "User Profile"
 */
export function formatScreenTitle(name: string): string {
  const base = name.replace(/Screen$/i, "");
  // Insert spaces before capital letters
  const spaced = base.replace(/([A-Z])/g, " $1").trim();
  return spaced || name;
}

/**
 * Recursively clones an AndroidComponent tree and generates guaranteed fresh IDs.
 */
export function cloneComponentTree(
  root: AndroidComponent,
  seed: string = Date.now().toString(36)
): { newRoot: AndroidComponent; idMap: Record<string, string> } {
  const idMap: Record<string, string> = {};
  let counter = 0;

  function traverse(comp: AndroidComponent): AndroidComponent {
    counter++;
    const randomHex = Math.random().toString(36).substring(2, 6);
    const newId = `comp_${comp.type.toLowerCase()}_${seed}_${counter}_${randomHex}`;
    idMap[comp.id] = newId;

    const clonedProps = JSON.parse(JSON.stringify(comp.props || {}));

    const clonedComp: AndroidComponent = {
      id: newId,
      type: comp.type,
      name: `${comp.name}_Copy`,
      category: comp.category,
      props: clonedProps,
    };

    if (comp.children && Array.isArray(comp.children)) {
      clonedComp.children = comp.children.map((child) => traverse(child));
    }

    return clonedComp;
  }

  const newRoot = traverse(root);
  return { newRoot, idMap };
}

/**
 * Deep clones an entire AndroidScreen, remapping all component IDs,
 * logic block target IDs, and action references so it can be safely added.
 */
export function cloneScreen(
  sourceScreen: AndroidScreen,
  customName?: string,
  customTitle?: string
): AndroidScreen {
  const seed = Date.now().toString(36);
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  const newScreenId = `screen_${seed}_${randomSuffix}`;

  // Clone component tree with new IDs
  const { newRoot, idMap } = cloneComponentTree(sourceScreen.rootComponent, seed);

  // Clone logic blocks and remap componentId
  const newLogicBlocks: LogicBlock[] = (sourceScreen.logicBlocks || []).map(
    (block, index) => {
      const newBlockId = `block_${seed}_${index}_${Math.random().toString(36).substring(2, 5)}`;
      const remappedComponentId = idMap[block.componentId] || block.componentId;

      const newActions: LogicAction[] = (block.actions || []).map((action, aIdx) => ({
        ...JSON.parse(JSON.stringify(action)),
        id: `act_${seed}_${index}_${aIdx}_${Math.random().toString(36).substring(2, 5)}`,
      }));

      return {
        id: newBlockId,
        componentId: remappedComponentId,
        componentName: `${block.componentName || "Component"}_Copy`,
        event: block.event,
        eventCategory: block.eventCategory,
        description: block.description ? `${block.description} (Cloned)` : "",
        enabled: block.enabled !== undefined ? block.enabled : true,
        actions: newActions,
      };
    }
  );

  // Clone state variables
  const newStateVariables = (sourceScreen.stateVariables || []).map((sv, idx) => ({
    ...JSON.parse(JSON.stringify(sv)),
    id: `state_${seed}_${idx}_${Math.random().toString(36).substring(2, 5)}`,
  }));

  const calculatedName =
    customName && customName.trim()
      ? formatComposableName(customName)
      : `${sourceScreen.name.replace(/Screen$/i, "")}CopyScreen`;

  const calculatedTitle =
    customTitle && customTitle.trim()
      ? customTitle.trim()
      : `${sourceScreen.title || formatScreenTitle(sourceScreen.name)} (Copy)`;

  return {
    id: newScreenId,
    name: calculatedName,
    title: calculatedTitle,
    isInitial: false, // cloned screens should never automatically hijack the launcher
    rootComponent: newRoot,
    logicBlocks: newLogicBlocks,
    stateVariables: newStateVariables,
  };
}

/**
 * Screen Template options
 */
export type ScreenTemplateId =
  | "blank"
  | "dashboard"
  | "auth"
  | "profile"
  | "ecommerce"
  | "settings";

export interface ScreenTemplateOption {
  id: ScreenTemplateId;
  name: string;
  description: string;
  badge: string;
  accentColor: string;
}

export const SCREEN_TEMPLATES: ScreenTemplateOption[] = [
  {
    id: "blank",
    name: "Blank Canvas",
    description: "Empty clean canvas with top app bar. Best for starting from scratch.",
    badge: "Minimal",
    accentColor: "violet",
  },
  {
    id: "dashboard",
    name: "Dashboard & Bento",
    description: "Modern analytics dashboard with search, metrics cards, and quick action buttons.",
    badge: "Popular",
    accentColor: "blue",
  },
  {
    id: "auth",
    name: "Login & Authentication",
    description: "Sign in screen with logo, text fields, password input, remember switch, and button.",
    badge: "Essential",
    accentColor: "emerald",
  },
  {
    id: "profile",
    name: "User Account & Profile",
    description: "User avatar header, statistics row, account details list, and action buttons.",
    badge: "Social",
    accentColor: "amber",
  },
  {
    id: "ecommerce",
    name: "Product & Store Detail",
    description: "Product image gallery, title, price badge, rating stars, and Add to Cart action.",
    badge: "Commerce",
    accentColor: "rose",
  },
  {
    id: "settings",
    name: "Preferences & Settings",
    description: "Grouped preference switches, dark mode toggle, volume slider, and system info.",
    badge: "Utility",
    accentColor: "indigo",
  },
];

/**
 * Generates an AndroidScreen based on one of the starter templates.
 */
export function createScreenFromTemplate(
  templateId: ScreenTemplateId,
  rawName: string,
  rawTitle?: string,
  isInitial: boolean = false
): AndroidScreen {
  const name = formatComposableName(rawName);
  const title = rawTitle && rawTitle.trim() ? rawTitle.trim() : formatScreenTitle(name);
  const seed = Date.now().toString(36);
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  const screenId = `screen_${seed}_${randomSuffix}`;

  let rootComponent: AndroidComponent;

  switch (templateId) {
    case "dashboard":
      rootComponent = {
        id: `root_${screenId}`,
        type: "ScrollView",
        name: "DashboardContainer",
        category: "Layout & Containers",
        props: {
          padding: 16,
          layoutWidth: "match_parent",
          layoutHeight: "match_parent",
        },
        children: [
          {
            id: `bar_${screenId}`,
            type: "Toolbar",
            name: "DashboardAppBar",
            category: "Layout & Containers",
            props: {
              title: title,
              showBackButton: !isInitial,
              backgroundColor: "#0F172A",
              textColor: "#FFFFFF",
              elevation: 4,
            },
          },
          {
            id: `hero_${screenId}`,
            type: "Card",
            name: "WelcomeHeroCard",
            category: "Containment",
            props: {
              backgroundColor: "#4F46E5",
              textColor: "#FFFFFF",
              cornerRadius: 16,
              elevation: 4,
              padding: 16,
              margin: 12,
            },
            children: [
              {
                id: `hero_text_${screenId}`,
                type: "Text",
                name: "HeroGreeting",
                category: "Basic UI",
                props: {
                  text: "Overview & Analytics",
                  fontSize: 18,
                  fontWeight: "bold",
                  textColor: "#FFFFFF",
                },
              },
              {
                id: `hero_sub_${screenId}`,
                type: "Text",
                name: "HeroSubtext",
                category: "Basic UI",
                props: {
                  text: "Real-time performance across your Android application devices.",
                  fontSize: 12,
                  textColor: "#C7D2FE",
                  margin: 4,
                },
              },
            ],
          },
          {
            id: `btn_quick_action_${screenId}`,
            type: "Button",
            name: "QuickActionButton",
            category: "Basic UI",
            props: {
              text: "Launch Quick Scan",
              backgroundColor: "#10B981",
              textColor: "#FFFFFF",
              cornerRadius: 12,
              padding: 12,
              margin: 8,
            },
          },
        ],
      };
      break;

    case "auth":
      rootComponent = {
        id: `root_${screenId}`,
        type: "ScrollView",
        name: "AuthContainer",
        category: "Layout & Containers",
        props: {
          padding: 20,
          layoutWidth: "match_parent",
          layoutHeight: "match_parent",
        },
        children: [
          {
            id: `bar_${screenId}`,
            type: "Toolbar",
            name: "AuthAppBar",
            category: "Layout & Containers",
            props: {
              title: "Sign In",
              showBackButton: !isInitial,
              backgroundColor: "#0F172A",
              textColor: "#FFFFFF",
            },
          },
          {
            id: `logo_${screenId}`,
            type: "Image",
            name: "AppLogoImage",
            category: "Media & Display",
            props: {
              url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=256&auto=format&fit=crop&q=80",
              layoutWidth: 80,
              layoutHeight: 80,
              cornerRadius: 20,
              margin: 24,
            },
          },
          {
            id: `title_${screenId}`,
            type: "Text",
            name: "WelcomeHeader",
            category: "Basic UI",
            props: {
              text: "Welcome Back",
              fontSize: 22,
              fontWeight: "bold",
              textColor: "#0F172A",
              margin: 6,
            },
          },
          {
            id: `email_input_${screenId}`,
            type: "TextInput",
            name: "EmailInputField",
            category: "Input & Controls",
            props: {
              hint: "Email address (e.g. user@example.com)",
              textColor: "#1E293B",
              padding: 12,
              margin: 8,
            },
          },
          {
            id: `pass_input_${screenId}`,
            type: "TextInput",
            name: "PasswordInputField",
            category: "Input & Controls",
            props: {
              hint: "Password (min 8 characters)",
              textColor: "#1E293B",
              padding: 12,
              margin: 8,
            },
          },
          {
            id: `remember_${screenId}`,
            type: "Switch",
            name: "RememberMeSwitch",
            category: "Input & Controls",
            props: {
              text: "Keep me signed in",
              checked: true,
              margin: 8,
            },
          },
          {
            id: `submit_btn_${screenId}`,
            type: "Button",
            name: "SignInSubmitBtn",
            category: "Basic UI",
            props: {
              text: "Sign In to Account",
              backgroundColor: "#4F46E5",
              textColor: "#FFFFFF",
              cornerRadius: 12,
              padding: 14,
              margin: 12,
            },
          },
        ],
      };
      break;

    case "profile":
      rootComponent = {
        id: `root_${screenId}`,
        type: "ScrollView",
        name: "ProfileContainer",
        category: "Layout & Containers",
        props: {
          padding: 16,
          layoutWidth: "match_parent",
          layoutHeight: "match_parent",
        },
        children: [
          {
            id: `bar_${screenId}`,
            type: "Toolbar",
            name: "ProfileAppBar",
            category: "Layout & Containers",
            props: {
              title: "My Profile",
              showBackButton: !isInitial,
              backgroundColor: "#0F172A",
              textColor: "#FFFFFF",
            },
          },
          {
            id: `avatar_${screenId}`,
            type: "Image",
            name: "UserAvatar",
            category: "Media & Display",
            props: {
              url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&auto=format&fit=crop&q=80",
              layoutWidth: 90,
              layoutHeight: 90,
              cornerRadius: 45,
              margin: 16,
            },
          },
          {
            id: `name_${screenId}`,
            type: "Text",
            name: "UserNameText",
            category: "Basic UI",
            props: {
              text: "Alex Morgan",
              fontSize: 20,
              fontWeight: "bold",
              textColor: "#0F172A",
            },
          },
          {
            id: `email_${screenId}`,
            type: "Text",
            name: "UserEmailText",
            category: "Basic UI",
            props: {
              text: "alex.morgan@droidforge.dev",
              fontSize: 13,
              textColor: "#64748B",
              margin: 4,
            },
          },
          {
            id: `edit_btn_${screenId}`,
            type: "Button",
            name: "EditProfileBtn",
            category: "Basic UI",
            props: {
              text: "Edit Personal Profile",
              backgroundColor: "#0F172A",
              textColor: "#FFFFFF",
              cornerRadius: 12,
              padding: 10,
              margin: 12,
            },
          },
        ],
      };
      break;

    case "ecommerce":
      rootComponent = {
        id: `root_${screenId}`,
        type: "ScrollView",
        name: "ProductContainer",
        category: "Layout & Containers",
        props: {
          padding: 16,
          layoutWidth: "match_parent",
          layoutHeight: "match_parent",
        },
        children: [
          {
            id: `bar_${screenId}`,
            type: "Toolbar",
            name: "ProductAppBar",
            category: "Layout & Containers",
            props: {
              title: "Item Details",
              showBackButton: !isInitial,
              backgroundColor: "#0F172A",
              textColor: "#FFFFFF",
            },
          },
          {
            id: `prod_img_${screenId}`,
            type: "Image",
            name: "ProductImage",
            category: "Media & Display",
            props: {
              url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
              layoutHeight: 220,
              cornerRadius: 16,
              margin: 12,
            },
          },
          {
            id: `prod_title_${screenId}`,
            type: "Text",
            name: "ProductTitle",
            category: "Basic UI",
            props: {
              text: "Wireless Pro Noise-Cancelling Headphones",
              fontSize: 18,
              fontWeight: "bold",
              textColor: "#0F172A",
              margin: 8,
            },
          },
          {
            id: `prod_price_${screenId}`,
            type: "Text",
            name: "ProductPrice",
            category: "Basic UI",
            props: {
              text: "$249.99 USD",
              fontSize: 22,
              fontWeight: "bold",
              textColor: "#10B981",
              margin: 4,
            },
          },
          {
            id: `cart_btn_${screenId}`,
            type: "Button",
            name: "AddToCartBtn",
            category: "Basic UI",
            props: {
              text: "Add to Shopping Cart",
              backgroundColor: "#0F172A",
              textColor: "#FFFFFF",
              cornerRadius: 12,
              padding: 14,
              margin: 14,
            },
          },
        ],
      };
      break;

    case "settings":
      rootComponent = {
        id: `root_${screenId}`,
        type: "ScrollView",
        name: "SettingsContainer",
        category: "Layout & Containers",
        props: {
          padding: 16,
          layoutWidth: "match_parent",
          layoutHeight: "match_parent",
        },
        children: [
          {
            id: `bar_${screenId}`,
            type: "Toolbar",
            name: "SettingsAppBar",
            category: "Layout & Containers",
            props: {
              title: title,
              showBackButton: !isInitial,
              backgroundColor: "#0F172A",
              textColor: "#FFFFFF",
            },
          },
          {
            id: `switch_notif_${screenId}`,
            type: "Switch",
            name: "PushNotifSwitch",
            category: "Input & Controls",
            props: {
              text: "Push Notifications",
              checked: true,
              margin: 8,
            },
          },
          {
            id: `switch_dark_${screenId}`,
            type: "Switch",
            name: "DarkModeSwitch",
            category: "Input & Controls",
            props: {
              text: "Dark Theme Mode",
              checked: true,
              margin: 8,
            },
          },
          {
            id: `slider_sound_${screenId}`,
            type: "Slider",
            name: "SoundVolumeSlider",
            category: "Input & Controls",
            props: {
              value: 75,
              min: 0,
              max: 100,
              margin: 8,
            },
          },
        ],
      };
      break;

    case "blank":
    default:
      rootComponent = {
        id: `root_${screenId}`,
        type: "ScrollView",
        name: "ScreenContainer",
        category: "Layout & Containers",
        props: {
          padding: 16,
          layoutWidth: "match_parent",
          layoutHeight: "match_parent",
        },
        children: [
          {
            id: `bar_${screenId}`,
            type: "Toolbar",
            name: "TopBar",
            category: "Layout & Containers",
            props: {
              title: title,
              showBackButton: !isInitial,
              backgroundColor: "#0F172A",
              textColor: "#FFFFFF",
            },
          },
          {
            id: `head_${screenId}`,
            type: "Text",
            name: "ScreenHeading",
            category: "Basic UI",
            props: {
              text: `Welcome to ${title}`,
              fontSize: 20,
              fontWeight: "bold",
              textColor: "#0F172A",
              margin: 12,
            },
          },
          {
            id: `desc_${screenId}`,
            type: "Text",
            name: "ScreenSubtext",
            category: "Basic UI",
            props: {
              text: "Drag and drop Android components from the palette on the left to build this screen.",
              fontSize: 13,
              textColor: "#64748B",
              margin: 4,
            },
          },
        ],
      };
      break;
  }

  return {
    id: screenId,
    name: name,
    title: title,
    isInitial: isInitial,
    rootComponent: rootComponent,
    logicBlocks: [],
    stateVariables: [],
  };
}

// In-Memory & LocalStorage Screen Clipboard
const CLIPBOARD_STORAGE_KEY = "droidforge_screen_clipboard_v1";
let memoryCopiedScreen: AndroidScreen | null = null;

export function copyScreenToClipboard(screen: AndroidScreen): void {
  try {
    const serialized = JSON.stringify(screen);
    memoryCopiedScreen = JSON.parse(serialized);
    localStorage.setItem(CLIPBOARD_STORAGE_KEY, serialized);
  } catch (err) {
    console.error("Failed to copy screen to storage:", err);
  }
}

export function getCopiedScreenFromClipboard(): AndroidScreen | null {
  if (memoryCopiedScreen) {
    return memoryCopiedScreen;
  }
  try {
    const raw = localStorage.getItem(CLIPBOARD_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id && parsed.name && parsed.rootComponent) {
        memoryCopiedScreen = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error("Failed to read screen clipboard:", err);
  }
  return null;
}

export function hasCopiedScreen(): boolean {
  return getCopiedScreenFromClipboard() !== null;
}
