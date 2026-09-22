import { AndroidScreen, ProjectConfig } from "../types";
import { DEFAULT_PROJECT_CONFIG, INITIAL_ASSETS } from "./initialData";

export interface ProjectTemplate {
  id: string;
  name: string;
  category: "E-Commerce" | "SaaS App" | "Android App" | "Landing Page" | "Social" | "Tools";
  description: string;
  badge: string;
  gradient: string;
  iconName: string;
  screensCount: number;
  config: ProjectConfig;
  screens: AndroidScreen[];
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: "tpl_ecommerce",
    name: "Modern E-Commerce Store",
    category: "E-Commerce",
    description: "Product catalog with filtering, discount cards, shopping cart badge and checkout flow.",
    badge: "Trending",
    gradient: "from-cyan-500 via-blue-600 to-indigo-700",
    iconName: "ShoppingBag",
    screensCount: 3,
    config: {
      ...DEFAULT_PROJECT_CONFIG,
      appName: "Modern E-Commerce Store",
      packageName: "com.droidforge.ecommerce.store",
    },
    screens: [
      {
        id: "screen_shop_home",
        name: "ShopHome",
        title: "Trend Store",
        isInitial: true,
        rootComponent: {
          id: "root_ecom_tpl",
          type: "ScrollView",
          name: "ShopContainer",
          category: "Layout & Containers",
          props: { padding: 12, layoutWidth: "match_parent", layoutHeight: "match_parent" },
          children: [
            {
              id: "comp_sh1",
              type: "Toolbar",
              name: "ShopBar",
              category: "Layout & Containers",
              props: { title: "TrendShop M3", backgroundColor: "#0284C7", textColor: "#FFFFFF" },
            },
            {
              id: "comp_sh2",
              type: "Card",
              name: "PromoCard",
              category: "Layout & Containers",
              props: { padding: 14, backgroundColor: "#E0F2FE", cornerRadius: 16 },
              children: [
                {
                  id: "comp_sh3",
                  type: "TextView",
                  name: "PromoTitle",
                  category: "Basic UI",
                  props: { text: "Weekend Deals: 40% OFF", fontSize: 17, fontWeight: "bold", textColor: "#0369A1" },
                },
                {
                  id: "comp_sh4",
                  type: "Button",
                  name: "ShopBtn",
                  category: "Actions",
                  props: { text: "Shop Collection", backgroundColor: "#0284C7", textColor: "#FFFFFF" },
                },
              ],
            },
            {
              id: "comp_sh5",
              type: "Recycler/List",
              name: "TrendingProducts",
              category: "Containment",
              props: {
                items: ["Air Pulse ANC Headphones", "Ultra Series Smartwatch", "HyperSpeed Mechanical Keyboard"],
              },
            },
          ],
        },
        logicBlocks: [],
      },
    ],
  },
  {
    id: "tpl_task_manager",
    name: "Task & Productivity Tracker",
    category: "SaaS App",
    description: "Keep track of sprint tasks, checklists, deadlines, and project priorities.",
    badge: "Popular",
    gradient: "from-emerald-500 via-teal-600 to-green-700",
    iconName: "CheckSquare",
    screensCount: 2,
    config: {
      ...DEFAULT_PROJECT_CONFIG,
      appName: "Task & Productivity Tracker",
      packageName: "com.droidforge.tasks.tracker",
    },
    screens: [
      {
        id: "screen_task_tpl",
        name: "TasksView",
        title: "Daily Tasks",
        isInitial: true,
        rootComponent: {
          id: "root_task_tpl",
          type: "ScrollView",
          name: "TasksContainer",
          category: "Layout & Containers",
          props: { padding: 14, layoutWidth: "match_parent", layoutHeight: "match_parent" },
          children: [
            {
              id: "comp_tb1",
              type: "Toolbar",
              name: "TaskHeader",
              category: "Layout & Containers",
              props: { title: "My Sprint Tasks", backgroundColor: "#059669", textColor: "#FFFFFF" },
            },
            {
              id: "comp_tb2",
              type: "Card",
              name: "DailyGoalCard",
              category: "Layout & Containers",
              props: { padding: 14, backgroundColor: "#ECFDF5", cornerRadius: 14 },
              children: [
                {
                  id: "comp_tb3",
                  type: "TextView",
                  name: "ProgressTitle",
                  category: "Basic UI",
                  props: { text: "Sprint Progress: 80%", fontSize: 16, fontWeight: "bold", textColor: "#065F46" },
                },
                {
                  id: "comp_tb4",
                  type: "Progress",
                  name: "SprintBar",
                  category: "Progress",
                  props: { progress: 80, backgroundColor: "#059669" },
                },
              ],
            },
            {
              id: "comp_tb5",
              type: "Checkbox",
              name: "TaskCheck1",
              category: "Inputs",
              props: { text: "Finalize Compose Navigation 2.8", checked: true },
            },
            {
              id: "comp_tb6",
              type: "Checkbox",
              name: "TaskCheck2",
              category: "Inputs",
              props: { text: "Test Room database migration", checked: false },
            },
          ],
        },
        logicBlocks: [],
      },
    ],
  },
  {
    id: "tpl_crypto_wallet",
    name: "Fintech & Crypto Portfolio",
    category: "Android App",
    description: "Financial portfolio tracker with asset balances, transaction history and chart indicators.",
    badge: "Fintech",
    gradient: "from-violet-600 via-indigo-600 to-purple-800",
    iconName: "Wallet",
    screensCount: 3,
    config: {
      ...DEFAULT_PROJECT_CONFIG,
      appName: "Fintech Crypto Hub",
      packageName: "com.droidforge.fintech.wallet",
    },
    screens: [
      {
        id: "screen_wallet_home",
        name: "WalletHome",
        title: "My Portfolio",
        isInitial: true,
        rootComponent: {
          id: "root_wallet",
          type: "ScrollView",
          name: "WalletContainer",
          category: "Layout & Containers",
          props: { padding: 16, layoutWidth: "match_parent", layoutHeight: "match_parent" },
          children: [
            {
              id: "comp_w1",
              type: "Toolbar",
              name: "WalletNav",
              category: "Layout & Containers",
              props: { title: "CryptoVault", backgroundColor: "#4F46E5", textColor: "#FFFFFF" },
            },
            {
              id: "comp_w2",
              type: "Card",
              name: "BalanceCard",
              category: "Layout & Containers",
              props: { padding: 18, backgroundColor: "#EEF2FF", cornerRadius: 20 },
              children: [
                {
                  id: "comp_w3",
                  type: "TextView",
                  name: "BalanceLabel",
                  category: "Basic UI",
                  props: { text: "Total Portfolio Balance", fontSize: 12, textColor: "#6366F1" },
                },
                {
                  id: "comp_w4",
                  type: "TextView",
                  name: "BalanceValue",
                  category: "Basic UI",
                  props: { text: "$24,580.45", fontSize: 26, fontWeight: "bold", textColor: "#312E81" },
                },
                {
                  id: "comp_w5",
                  type: "Button",
                  name: "DepositBtn",
                  category: "Actions",
                  props: { text: "+ Deposit Funds", backgroundColor: "#4F46E5", textColor: "#FFFFFF" },
                },
              ],
            },
          ],
        },
        logicBlocks: [],
      },
    ],
  },
  {
    id: "tpl_fitness_health",
    name: "Fitness & Calorie Tracker",
    category: "Android App",
    description: "Daily step counter, calorie log, hydration goals, and workout interval timers.",
    badge: "Health",
    gradient: "from-amber-500 via-orange-600 to-red-600",
    iconName: "Activity",
    screensCount: 3,
    config: {
      ...DEFAULT_PROJECT_CONFIG,
      appName: "Pulse Fit & Health",
      packageName: "com.droidforge.health.pulse",
    },
    screens: [
      {
        id: "screen_fit_home",
        name: "FitnessHome",
        title: "Today's Activity",
        isInitial: true,
        rootComponent: {
          id: "root_fit",
          type: "ScrollView",
          name: "FitContainer",
          category: "Layout & Containers",
          props: { padding: 14, layoutWidth: "match_parent", layoutHeight: "match_parent" },
          children: [
            {
              id: "comp_f1",
              type: "Toolbar",
              name: "FitBar",
              category: "Layout & Containers",
              props: { title: "Pulse Tracker", backgroundColor: "#EA580C", textColor: "#FFFFFF" },
            },
            {
              id: "comp_f2",
              type: "Card",
              name: "ActivityCard",
              category: "Layout & Containers",
              props: { padding: 16, backgroundColor: "#FFF7ED", cornerRadius: 18 },
              children: [
                {
                  id: "comp_f3",
                  type: "TextView",
                  name: "StepsCount",
                  category: "Basic UI",
                  props: { text: "8,432 / 10,000 Steps", fontSize: 18, fontWeight: "bold", textColor: "#9A3412" },
                },
                {
                  id: "comp_f4",
                  type: "Progress",
                  name: "StepsProgress",
                  category: "Progress",
                  props: { progress: 84, backgroundColor: "#EA580C" },
                },
              ],
            },
          ],
        },
        logicBlocks: [],
      },
    ],
  },
];
