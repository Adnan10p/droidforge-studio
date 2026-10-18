import { ProjectConfig, AndroidScreen, AndroidComponent } from "../../types";
import { SymbolTable } from "./symbolTable";
import { NetworkCompiler } from "./networkCompiler";
import { StorageCompiler } from "./storageCompiler";
import { NavigationCompiler } from "./navigationCompiler";
import { HardwareCompiler } from "./hardwareCompiler";
import { ActionCompiler } from "./actionCompiler";
import { GradleBuilder } from "./gradleBuilder";

export {
  SymbolTable,
  NetworkCompiler,
  StorageCompiler,
  NavigationCompiler,
  HardwareCompiler,
  ActionCompiler,
  GradleBuilder,
};

// Escapes strings safely for Java source code literals
function esc(str: any): string {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "");
}

// Master Compilation Function: Compiles Visual Screens & Logic into Production-Grade Native Java MainActivity
export function compileNativeMainActivityJava(
  config: ProjectConfig,
  screens: AndroidScreen[]
): string {
  const packageName = config.packageName || "com.droidforge.quickapp";
  const appTitle = config.appName || "DroidForge App";

  const fallbackScreen: AndroidScreen = {
    id: "screen_main",
    name: "MainScreen",
    title: appTitle,
    rootComponent: { id: "root", type: "ScrollView", category: "Layouts", name: "MainScroll", props: {}, children: [] },
    logicBlocks: [],
    properties: { backgroundColor: "#FFFFFF", titleVisible: true },
  };

  const validScreens = screens && screens.length > 0 ? screens : [fallbackScreen];
  const initialScreen = validScreens.find((s) => s.isInitial) || validScreens[0];

  // 1. Initialize Modular Native Compiler Subsystems
  const symbolTable = new SymbolTable();
  symbolTable.build(validScreens);

  const networkCompiler = new NetworkCompiler(symbolTable);
  const storageCompiler = new StorageCompiler(symbolTable);
  const navigationCompiler = new NavigationCompiler();
  const hardwareCompiler = new HardwareCompiler();
  const actionCompiler = new ActionCompiler(
    symbolTable,
    networkCompiler,
    storageCompiler,
    navigationCompiler
  );

  let compCounter = 0;
  let actCounter = 0;

  const screensCode: string[] = [];
  const eventListeners: string[] = [];

  // 2. Compile each screen into its native UI container
  validScreens.forEach((screen, screenIndex) => {
    const screenProperties = screen.properties || {};
    const isTitleVisible = screenProperties.titleVisible !== false;
    const displayScreenTitle = screenProperties.title || screen.title || screen.name || appTitle;
    const screenBgColor = screenProperties.backgroundColor || "#FFFFFF";
    const primaryThemeColor = (screenProperties as any).appBarBgColor || screenProperties.primaryColor || config.themeColor || "#4F46E5";
    const titleTextColor = (screenProperties as any).appBarTextColor || "#FFFFFF";

    let hGravity = "Gravity.LEFT";
    if (screenProperties.alignHorizontal === "center") hGravity = "Gravity.CENTER_HORIZONTAL";
    if (screenProperties.alignHorizontal === "right") hGravity = "Gravity.RIGHT";

    let vGravity = "Gravity.TOP";
    if (screenProperties.alignVertical === "center") vGravity = "Gravity.CENTER_VERTICAL";
    if (screenProperties.alignVertical === "bottom") vGravity = "Gravity.BOTTOM";

    const screenVar = `screenView_${screenIndex}`;
    const screenContentVar = `contentLayout_${screenIndex}`;
    const componentDecls: string[] = [];

    // Screen Header / Toolbar (Styled to match Visual Designer, Kodular & MIT App Inventor)
    if (isTitleVisible) {
      componentDecls.push(`
        LinearLayout appHeader_${screenIndex} = new LinearLayout(this);
        appHeader_${screenIndex}.setOrientation(LinearLayout.HORIZONTAL);
        appHeader_${screenIndex}.setGravity(Gravity.CENTER_VERTICAL);
        appHeader_${screenIndex}.setBackgroundColor(Color.parseColor("${primaryThemeColor}"));
        appHeader_${screenIndex}.setPadding(40, 32, 40, 32);
        LinearLayout.LayoutParams appHeader_${screenIndex}_lp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        appHeader_${screenIndex}.setLayoutParams(appHeader_${screenIndex}_lp);

        TextView appTitle_${screenIndex} = new TextView(this);
        appTitle_${screenIndex}.setText("${esc(displayScreenTitle)}");
        appTitle_${screenIndex}.setTextColor(Color.parseColor("${titleTextColor}"));
        appTitle_${screenIndex}.setTextSize(19f);
        appTitle_${screenIndex}.setTypeface(null, android.graphics.Typeface.BOLD);
        LinearLayout.LayoutParams appTitle_${screenIndex}_lp = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1.0f);
        appTitle_${screenIndex}.setLayoutParams(appTitle_${screenIndex}_lp);
        appHeader_${screenIndex}.addView(appTitle_${screenIndex});

        ${(screenProperties as any).showMenuButton !== false ? `
        TextView appMenu_${screenIndex} = new TextView(this);
        appMenu_${screenIndex}.setText("⋮");
        appMenu_${screenIndex}.setTextColor(Color.parseColor("${titleTextColor}"));
        appMenu_${screenIndex}.setTextSize(22f);
        appMenu_${screenIndex}.setPadding(16, 0, 16, 0);
        appMenu_${screenIndex}.setTypeface(null, android.graphics.Typeface.BOLD);
        appHeader_${screenIndex}.addView(appMenu_${screenIndex});
        ` : ""}

        ${screenContentVar}.addView(appHeader_${screenIndex});
      `);
    }

    function processComponent(comp: AndroidComponent, parentVar: string, inHorizontal = false) {
      compCounter++;
      const sym = symbolTable.registerComponent(comp, screen);
      const vName = sym.varName;
      const p = comp.props || {};

      const containerTypes = [
        "ScrollView", "Card", "Card Layout", "CardLayout", "Form", "Column", "Row",
        "Horizontal Layout", "HorizontalLayout", "Vertical Layout", "VerticalLayout",
        "Box", "Container", "MainContainer", "LinearLayout", "FrameLayout", "Dialog",
        "Bottom Sheet", "Drawer", "Layouts",
      ];
      const isContainer = (comp.children && comp.children.length > 0) || containerTypes.includes(comp.type);

      switch (comp.type) {
        case "Toolbar": {
          if (isTitleVisible) {
            componentDecls.push(`
        TextView ${vName} = new TextView(this);
        ${vName}.setText("${esc(p.title || displayScreenTitle)}");
        ${vName}.setTextColor(Color.parseColor("${p.textColor || "#FFFFFF"}"));
        ${vName}.setBackgroundColor(Color.parseColor("${p.backgroundColor || primaryThemeColor}"));
        ${vName}.setTextSize(18f);
        ${vName}.setPadding(32, 32, 32, 32);
        ${vName}.setTypeface(null, android.graphics.Typeface.BOLD);
        ${vName}.setLayoutParams(new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT));
        ${parentVar}.addView(${vName});
        registeredViews.put("${comp.id}", ${vName});
        registeredViews.put("${comp.name}", ${vName});
            `);
          }
          break;
        }

        case "Text":
        case "Text Label": {
          const lpWidth = inHorizontal ? "LinearLayout.LayoutParams.WRAP_CONTENT" : "LinearLayout.LayoutParams.MATCH_PARENT";
          componentDecls.push(`
        TextView ${vName} = new TextView(this);
        ${vName}.setText("${esc(p.text || "Text Label")}");
        ${vName}.setTextColor(Color.parseColor("${p.textColor || "#0F172A"}"));
        ${vName}.setTextSize(${p.fontSize || 16}f);
        ${p.fontWeight === "bold" ? `${vName}.setTypeface(null, android.graphics.Typeface.BOLD);` : ""}
        ${vName}.setPadding(${p.padding !== undefined ? p.padding : 16}, ${p.padding !== undefined ? p.padding : 12}, ${p.padding !== undefined ? p.padding : 16}, ${p.padding !== undefined ? p.padding : 12});
        LinearLayout.LayoutParams ${vName}_lp = new LinearLayout.LayoutParams(${lpWidth}, LinearLayout.LayoutParams.WRAP_CONTENT);
        ${vName}_lp.setMargins(${p.margin !== undefined ? p.margin : 8}, ${p.margin !== undefined ? p.margin : 8}, ${p.margin !== undefined ? p.margin : 8}, ${p.margin !== undefined ? p.margin : 8});
        ${vName}.setLayoutParams(${vName}_lp);
        ${parentVar}.addView(${vName});
        registeredViews.put("${comp.id}", ${vName});
        registeredViews.put("${comp.name}", ${vName});
          `);
          break;
        }

        case "Button": {
          const btnText = esc(p.text || "Button");
          const bgHex = p.backgroundColor || "#6750A4";
          const txtColor = p.textColor || "#FFFFFF";
          const cornerRadius = p.cornerRadius !== undefined ? p.cornerRadius : 24;
          const lpWidth = inHorizontal ? "LinearLayout.LayoutParams.WRAP_CONTENT" : "LinearLayout.LayoutParams.MATCH_PARENT";
          componentDecls.push(`
        Button ${vName} = new Button(this);
        ${vName}.setText("${btnText}");
        ${vName}.setTextColor(Color.parseColor("${txtColor}"));
        ${vName}.setTextSize(${p.fontSize || 15}f);
        ${p.fontWeight === "bold" ? `${vName}.setTypeface(null, android.graphics.Typeface.BOLD);` : ""}
        android.graphics.drawable.GradientDrawable ${vName}_bg = new android.graphics.drawable.GradientDrawable();
        ${vName}_bg.setColor(Color.parseColor("${bgHex}"));
        ${vName}_bg.setCornerRadius(${cornerRadius}f);
        ${vName}.setBackground(${vName}_bg);
        ${vName}.setPadding(32, 20, 32, 20);
        LinearLayout.LayoutParams ${vName}_lp = new LinearLayout.LayoutParams(${lpWidth}, LinearLayout.LayoutParams.WRAP_CONTENT);
        ${vName}_lp.setMargins(${p.margin !== undefined ? p.margin : 16}, ${p.margin !== undefined ? p.margin : 12}, ${p.margin !== undefined ? p.margin : 16}, ${p.margin !== undefined ? p.margin : 12});
        ${vName}.setLayoutParams(${vName}_lp);
        ${parentVar}.addView(${vName});
        registeredViews.put("${comp.id}", ${vName});
        registeredViews.put("${comp.name}", ${vName});
          `);
          break;
        }

        case "TextField":
        case "Text Input":
        case "Password Input": {
          const lpCode = inHorizontal
            ? `new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1.0f)`
            : `new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT)`;
          const isPass = comp.type === "Password Input" || p.isPassword === true;
          const initialHint = esc(p.hint || (isPass ? "Enter password..." : "Enter text..."));
          const cornerRad = p.cornerRadius !== undefined ? p.cornerRadius : 12;
          componentDecls.push(`
        EditText ${vName} = new EditText(this);
        ${vName}.setHint("${initialHint}");
        ${p.text ? `${vName}.setText("${esc(p.text)}");` : ""}
        ${vName}.setTextColor(Color.parseColor("${p.textColor || "#0F172A"}"));
        ${vName}.setHintTextColor(Color.parseColor("#94A3B8"));
        ${vName}.setTextSize(${p.fontSize || 15}f);
        android.graphics.drawable.GradientDrawable ${vName}_bg = new android.graphics.drawable.GradientDrawable();
        ${vName}_bg.setColor(Color.WHITE);
        ${vName}_bg.setStroke(2, Color.parseColor("#CBD5E1"));
        ${vName}_bg.setCornerRadius(${cornerRad}f);
        ${vName}.setBackground(${vName}_bg);
        ${vName}.setPadding(28, 22, 28, 22);
        ${isPass ? `${vName}.setInputType(android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD);` : `${vName}.setInputType(android.text.InputType.TYPE_CLASS_TEXT);`}
        LinearLayout.LayoutParams ${vName}_lp = ${lpCode};
        ${vName}_lp.setMargins(${p.margin !== undefined ? p.margin : 16}, 8, ${p.margin !== undefined ? p.margin : 16}, 8);
        ${vName}.setLayoutParams(${vName}_lp);
        ${parentVar}.addView(${vName});
        registeredViews.put("${comp.id}", ${vName});
        registeredViews.put("${comp.name}", ${vName});
          `);
          break;
        }

        case "Checkbox":
        case "Check Box": {
          componentDecls.push(`
        CheckBox ${vName} = new CheckBox(this);
        ${vName}.setText("${esc(p.text || "Checkbox Option")}");
        ${vName}.setPadding(16, 8, 16, 8);
        ${vName}.setChecked(${p.checked !== false});
        ${parentVar}.addView(${vName});
        registeredViews.put("${comp.id}", ${vName});
        registeredViews.put("${comp.name}", ${vName});
          `);
          break;
        }

        case "Switch":
        case "Toggle Switch": {
          componentDecls.push(`
        Switch ${vName} = new Switch(this);
        ${vName}.setText("${esc(p.text || "Enable toggle")}");
        ${vName}.setPadding(16, 8, 16, 8);
        ${vName}.setChecked(${p.checked !== false});
        ${parentVar}.addView(${vName});
        registeredViews.put("${comp.id}", ${vName});
        registeredViews.put("${comp.name}", ${vName});
          `);
          break;
        }

        case "Slider": {
          componentDecls.push(`
        SeekBar ${vName} = new SeekBar(this);
        ${vName}.setMax(100);
        ${vName}.setProgress(${p.value || 50});
        LinearLayout.LayoutParams ${vName}_lp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        ${vName}_lp.setMargins(16, 12, 16, 12);
        ${vName}.setLayoutParams(${vName}_lp);
        ${parentVar}.addView(${vName});
        registeredViews.put("${comp.id}", ${vName});
        registeredViews.put("${comp.name}", ${vName});
          `);
          break;
        }

        case "Progress":
        case "ProgressBar":
        case "Progress Bar":
        case "Circular Loader": {
          componentDecls.push(`
        ProgressBar ${vName} = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        ${vName}.setMax(100);
        ${vName}.setProgress(${p.progress || 60});
        LinearLayout.LayoutParams ${vName}_lp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        ${vName}_lp.setMargins(16, 12, 16, 12);
        ${vName}.setLayoutParams(${vName}_lp);
        ${parentVar}.addView(${vName});
        registeredViews.put("${comp.id}", ${vName});
        registeredViews.put("${comp.name}", ${vName});
          `);
          break;
        }

        case "Banner Ad":
        case "BannerAd":
        case "AdMobBanner":
        case "AdBannerView":
        case "AdBanner": {
          const adUnitId = esc(p.adUnitId || "ca-app-pub-3940256099942544/6300978111");
          const adTitle = esc(comp.name || "Banner Ad");
          componentDecls.push(`
        // [AdMob Banner / Test Ad Card]
        LinearLayout ${vName} = new LinearLayout(this);
        ${vName}.setOrientation(LinearLayout.HORIZONTAL);
        ${vName}.setGravity(Gravity.CENTER_VERTICAL);
        ${vName}.setPadding(20, 16, 20, 16);
        android.graphics.drawable.GradientDrawable ${vName}_bg = new android.graphics.drawable.GradientDrawable();
        ${vName}_bg.setColor(Color.parseColor("#121212"));
        ${vName}_bg.setCornerRadius(14f);
        ${vName}_bg.setStroke(2, Color.parseColor("#3B82F6"));
        ${vName}.setBackground(${vName}_bg);

        // Icon badge: "Ad"
        TextView ${vName}_adBadge = new TextView(this);
        ${vName}_adBadge.setText("Ad");
        ${vName}_adBadge.setTextColor(Color.WHITE);
        ${vName}_adBadge.setTextSize(10f);
        ${vName}_adBadge.setTypeface(null, android.graphics.Typeface.BOLD);
        ${vName}_adBadge.setGravity(Gravity.CENTER);
        android.graphics.drawable.GradientDrawable ${vName}_badgeBg = new android.graphics.drawable.GradientDrawable();
        ${vName}_badgeBg.setColor(Color.parseColor("#2563EB"));
        ${vName}_badgeBg.setCornerRadius(8f);
        ${vName}_adBadge.setBackground(${vName}_badgeBg);
        LinearLayout.LayoutParams ${vName}_badgeLp = new LinearLayout.LayoutParams(52, 52);
        ${vName}_badgeLp.setMargins(0, 0, 16, 0);
        ${vName}_adBadge.setLayoutParams(${vName}_badgeLp);
        ${vName}.addView(${vName}_adBadge);

        // Text details column
        LinearLayout ${vName}_col = new LinearLayout(this);
        ${vName}_col.setOrientation(LinearLayout.VERTICAL);
        LinearLayout.LayoutParams ${vName}_colLp = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1.0f);
        ${vName}_col.setLayoutParams(${vName}_colLp);

        // Row with Title + "320x50" tag
        LinearLayout ${vName}_titleRow = new LinearLayout(this);
        ${vName}_titleRow.setOrientation(LinearLayout.HORIZONTAL);
        ${vName}_titleRow.setGravity(Gravity.CENTER_VERTICAL);

        TextView ${vName}_title = new TextView(this);
        ${vName}_title.setText("${adTitle}");
        ${vName}_title.setTextColor(Color.WHITE);
        ${vName}_title.setTextSize(13f);
        ${vName}_title.setTypeface(null, android.graphics.Typeface.BOLD);
        ${vName}_titleRow.addView(${vName}_title);

        TextView ${vName}_tag = new TextView(this);
        ${vName}_tag.setText(" 320x50 TEST ");
        ${vName}_tag.setTextColor(Color.parseColor("#0F172A"));
        ${vName}_tag.setTextSize(9f);
        ${vName}_tag.setTypeface(null, android.graphics.Typeface.BOLD);
        android.graphics.drawable.GradientDrawable ${vName}_tagBg = new android.graphics.drawable.GradientDrawable();
        ${vName}_tagBg.setColor(Color.parseColor("#F59E0B"));
        ${vName}_tagBg.setCornerRadius(6f);
        ${vName}_tag.setBackground(${vName}_tagBg);
        LinearLayout.LayoutParams ${vName}_tagLp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        ${vName}_tagLp.setMargins(10, 0, 0, 0);
        ${vName}_tag.setLayoutParams(${vName}_tagLp);
        ${vName}_titleRow.addView(${vName}_tag);
        ${vName}_col.addView(${vName}_titleRow);

        // Subtitle: AdMob ad unit ID
        TextView ${vName}_sub = new TextView(this);
        ${vName}_sub.setText("AdMob: ${adUnitId}");
        ${vName}_sub.setTextColor(Color.parseColor("#94A3B8"));
        ${vName}_sub.setTextSize(10f);
        ${vName}_sub.setSingleLine(true);
        ${vName}_sub.setEllipsize(android.text.TextUtils.TruncateAt.END);
        ${vName}_col.addView(${vName}_sub);
        ${vName}.addView(${vName}_col);

        // Action button "INSTALL"
        Button ${vName}_btn = new Button(this);
        ${vName}_btn.setText("INSTALL");
        ${vName}_btn.setTextColor(Color.WHITE);
        ${vName}_btn.setTextSize(10f);
        ${vName}_btn.setTypeface(null, android.graphics.Typeface.BOLD);
        android.graphics.drawable.GradientDrawable ${vName}_btnBg = new android.graphics.drawable.GradientDrawable();
        ${vName}_btnBg.setColor(Color.parseColor("#2563EB"));
        ${vName}_btnBg.setCornerRadius(8f);
        ${vName}_btn.setBackground(${vName}_btnBg);
        ${vName}_btn.setPadding(20, 8, 20, 8);
        LinearLayout.LayoutParams ${vName}_btnLp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, 68);
        ${vName}_btn.setLayoutParams(${vName}_btnLp);
        ${vName}_btn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Toast.makeText(MainActivity.this, "⚡ Google AdMob Test Banner Clicked! [320x50]", Toast.LENGTH_SHORT).show();
            }
        });
        ${vName}.addView(${vName}_btn);

        LinearLayout.LayoutParams ${vName}_lp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        ${vName}_lp.setMargins(16, 12, 16, 12);
        ${vName}.setLayoutParams(${vName}_lp);
        ${parentVar}.addView(${vName});
        registeredViews.put("${comp.id}", ${vName});
        registeredViews.put("${comp.name}", ${vName});
          `);
          break;
        }

        case "Native Ad":
        case "NativeAd":
        case "AdMobNative": {
          const adTitle = esc(comp.name || "Native Ad Unit");
          const adDesc = esc(p.description || p.text || "Build native Android applications with high speed component logic and visual blocks.");
          componentDecls.push(`
        // [AdMob Native Ad Card]
        LinearLayout ${vName} = new LinearLayout(this);
        ${vName}.setOrientation(LinearLayout.VERTICAL);
        ${vName}.setPadding(24, 20, 24, 20);
        android.graphics.drawable.GradientDrawable ${vName}_bg = new android.graphics.drawable.GradientDrawable();
        ${vName}_bg.setColor(Color.parseColor("#0F172A"));
        ${vName}_bg.setCornerRadius(18f);
        ${vName}_bg.setStroke(2, Color.parseColor("#8B5CF6"));
        ${vName}.setBackground(${vName}_bg);

        // Header Row: Violet "Ad" badge + Title + SPONSORED + Rating
        LinearLayout ${vName}_hdr = new LinearLayout(this);
        ${vName}_hdr.setOrientation(LinearLayout.HORIZONTAL);
        ${vName}_hdr.setGravity(Gravity.CENTER_VERTICAL);

        TextView ${vName}_badge = new TextView(this);
        ${vName}_badge.setText("Ad");
        ${vName}_badge.setTextColor(Color.WHITE);
        ${vName}_badge.setTextSize(11f);
        ${vName}_badge.setTypeface(null, android.graphics.Typeface.BOLD);
        ${vName}_badge.setGravity(Gravity.CENTER);
        android.graphics.drawable.GradientDrawable ${vName}_bBg = new android.graphics.drawable.GradientDrawable();
        ${vName}_bBg.setColor(Color.parseColor("#7C3AED"));
        ${vName}_bBg.setCornerRadius(10f);
        ${vName}_badge.setBackground(${vName}_bBg);
        LinearLayout.LayoutParams ${vName}_bLp = new LinearLayout.LayoutParams(56, 56);
        ${vName}_bLp.setMargins(0, 0, 16, 0);
        ${vName}_badge.setLayoutParams(${vName}_bLp);
        ${vName}_hdr.addView(${vName}_badge);

        LinearLayout ${vName}_titleCol = new LinearLayout(this);
        ${vName}_titleCol.setOrientation(LinearLayout.VERTICAL);

        LinearLayout ${vName}_topRow = new LinearLayout(this);
        ${vName}_topRow.setOrientation(LinearLayout.HORIZONTAL);
        ${vName}_topRow.setGravity(Gravity.CENTER_VERTICAL);

        TextView ${vName}_t = new TextView(this);
        ${vName}_t.setText("${adTitle}");
        ${vName}_t.setTextColor(Color.WHITE);
        ${vName}_t.setTextSize(13f);
        ${vName}_t.setTypeface(null, android.graphics.Typeface.BOLD);
        ${vName}_topRow.addView(${vName}_t);

        TextView ${vName}_spon = new TextView(this);
        ${vName}_spon.setText(" SPONSORED ");
        ${vName}_spon.setTextColor(Color.parseColor("#0F172A"));
        ${vName}_spon.setTextSize(8f);
        ${vName}_spon.setTypeface(null, android.graphics.Typeface.BOLD);
        android.graphics.drawable.GradientDrawable ${vName}_sponBg = new android.graphics.drawable.GradientDrawable();
        ${vName}_sponBg.setColor(Color.parseColor("#F59E0B"));
        ${vName}_sponBg.setCornerRadius(6f);
        ${vName}_spon.setBackground(${vName}_sponBg);
        LinearLayout.LayoutParams ${vName}_sponLp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        ${vName}_sponLp.setMargins(10, 0, 0, 0);
        ${vName}_spon.setLayoutParams(${vName}_sponLp);
        ${vName}_topRow.addView(${vName}_spon);
        ${vName}_titleCol.addView(${vName}_topRow);

        TextView ${vName}_rating = new TextView(this);
        ${vName}_rating.setText("★★★★★ 4.9 • Google Play");
        ${vName}_rating.setTextColor(Color.parseColor("#FBBF24"));
        ${vName}_rating.setTextSize(10f);
        ${vName}_titleCol.addView(${vName}_rating);
        ${vName}_hdr.addView(${vName}_titleCol);
        ${vName}.addView(${vName}_hdr);

        // Body Description
        TextView ${vName}_desc = new TextView(this);
        ${vName}_desc.setText("${adDesc}");
        ${vName}_desc.setTextColor(Color.parseColor("#CBD5E1"));
        ${vName}_desc.setTextSize(11f);
        ${vName}_desc.setLineSpacing(4f, 1.1f);
        ${vName}_desc.setPadding(0, 14, 0, 16);
        ${vName}.addView(${vName}_desc);

        // Full width CTA Button
        Button ${vName}_cta = new Button(this);
        ${vName}_cta.setText("DOWNLOAD / INSTALL NOW");
        ${vName}_cta.setTextColor(Color.WHITE);
        ${vName}_cta.setTextSize(12f);
        ${vName}_cta.setTypeface(null, android.graphics.Typeface.BOLD);
        android.graphics.drawable.GradientDrawable ${vName}_ctaBg = new android.graphics.drawable.GradientDrawable(
            android.graphics.drawable.GradientDrawable.Orientation.LEFT_RIGHT,
            new int[]{Color.parseColor("#7C3AED"), Color.parseColor("#4F46E5")}
        );
        ${vName}_ctaBg.setCornerRadius(14f);
        ${vName}_cta.setBackground(${vName}_ctaBg);
        ${vName}_cta.setPadding(0, 20, 0, 20);
        LinearLayout.LayoutParams ${vName}_ctaLp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        ${vName}_cta.setLayoutParams(${vName}_ctaLp);
        ${vName}_cta.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Toast.makeText(MainActivity.this, "⚡ Google AdMob Native Test Ad Clicked!", Toast.LENGTH_SHORT).show();
            }
        });
        ${vName}.addView(${vName}_cta);

        LinearLayout.LayoutParams ${vName}_lp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        ${vName}_lp.setMargins(16, 12, 16, 12);
        ${vName}.setLayoutParams(${vName}_lp);
        ${parentVar}.addView(${vName});
        registeredViews.put("${comp.id}", ${vName});
        registeredViews.put("${comp.name}", ${vName});
          `);
          break;
        }

        case "Medium Rectangle Ad":
        case "MediumRectangleAd":
        case "Medium Rectangle": {
          const adTitle = esc(comp.name || "Medium Rectangle Ad");
          componentDecls.push(`
        // [AdMob Medium Rectangle 300x250 Ad Card]
        LinearLayout ${vName} = new LinearLayout(this);
        ${vName}.setOrientation(LinearLayout.VERTICAL);
        ${vName}.setPadding(20, 16, 20, 16);
        android.graphics.drawable.GradientDrawable ${vName}_bg = new android.graphics.drawable.GradientDrawable();
        ${vName}_bg.setColor(Color.parseColor("#020617"));
        ${vName}_bg.setCornerRadius(18f);
        ${vName}_bg.setStroke(2, Color.parseColor("#334155"));
        ${vName}.setBackground(${vName}_bg);

        // Header Row
        LinearLayout ${vName}_hdr = new LinearLayout(this);
        ${vName}_hdr.setOrientation(LinearLayout.HORIZONTAL);
        ${vName}_hdr.setGravity(Gravity.CENTER_VERTICAL);

        TextView ${vName}_tag = new TextView(this);
        ${vName}_tag.setText(" Ad • Sponsored ");
        ${vName}_tag.setTextColor(Color.parseColor("#FCD34D"));
        ${vName}_tag.setTextSize(9f);
        ${vName}_tag.setTypeface(null, android.graphics.Typeface.BOLD);
        android.graphics.drawable.GradientDrawable ${vName}_tagBg = new android.graphics.drawable.GradientDrawable();
        ${vName}_tagBg.setColor(Color.parseColor("#78350F"));
        ${vName}_tagBg.setCornerRadius(6f);
        ${vName}_tag.setBackground(${vName}_tagBg);
        ${vName}_hdr.addView(${vName}_tag);

        TextView ${vName}_dim = new TextView(this);
        ${vName}_dim.setText("300x250 Medium Rect");
        ${vName}_dim.setTextColor(Color.parseColor("#94A3B8"));
        ${vName}_dim.setTextSize(10f);
        ${vName}_dim.setGravity(Gravity.RIGHT);
        LinearLayout.LayoutParams ${vName}_dimLp = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1.0f);
        ${vName}_dim.setLayoutParams(${vName}_dimLp);
        ${vName}_hdr.addView(${vName}_dim);
        ${vName}.addView(${vName}_hdr);

        // Center Media Surface Frame
        LinearLayout ${vName}_surface = new LinearLayout(this);
        ${vName}_surface.setOrientation(LinearLayout.VERTICAL);
        ${vName}_surface.setGravity(Gravity.CENTER);
        ${vName}_surface.setPadding(16, 28, 16, 28);
        android.graphics.drawable.GradientDrawable ${vName}_sBg = new android.graphics.drawable.GradientDrawable();
        ${vName}_sBg.setColor(Color.parseColor("#0F172A"));
        ${vName}_sBg.setCornerRadius(14f);
        ${vName}_sBg.setStroke(1, Color.parseColor("#1E293B"));
        ${vName}_surface.setBackground(${vName}_sBg);
        LinearLayout.LayoutParams ${vName}_sLp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        ${vName}_sLp.setMargins(0, 14, 0, 14);
        ${vName}_surface.setLayoutParams(${vName}_sLp);

        TextView ${vName}_icon = new TextView(this);
        ${vName}_icon.setText("📢");
        ${vName}_icon.setTextSize(24f);
        ${vName}_icon.setGravity(Gravity.CENTER);
        ${vName}_surface.addView(${vName}_icon);

        TextView ${vName}_stitle = new TextView(this);
        ${vName}_stitle.setText("${adTitle}");
        ${vName}_stitle.setTextColor(Color.WHITE);
        ${vName}_stitle.setTextSize(13f);
        ${vName}_stitle.setTypeface(null, android.graphics.Typeface.BOLD);
        ${vName}_stitle.setGravity(Gravity.CENTER);
        ${vName}_surface.addView(${vName}_stitle);

        TextView ${vName}_ssub = new TextView(this);
        ${vName}_ssub.setText("AdMob 300x250 Surface");
        ${vName}_ssub.setTextColor(Color.parseColor("#818CF8"));
        ${vName}_ssub.setTextSize(10f);
        ${vName}_ssub.setGravity(Gravity.CENTER);
        ${vName}_surface.addView(${vName}_ssub);
        ${vName}.addView(${vName}_surface);

        // CTA Button
        Button ${vName}_btn = new Button(this);
        ${vName}_btn.setText("LEARN MORE");
        ${vName}_btn.setTextColor(Color.WHITE);
        ${vName}_btn.setTextSize(11f);
        ${vName}_btn.setTypeface(null, android.graphics.Typeface.BOLD);
        android.graphics.drawable.GradientDrawable ${vName}_btnBg = new android.graphics.drawable.GradientDrawable();
        ${vName}_btnBg.setColor(Color.parseColor("#2563EB"));
        ${vName}_btnBg.setCornerRadius(10f);
        ${vName}_btn.setBackground(${vName}_btnBg);
        ${vName}_btn.setPadding(0, 16, 0, 16);
        LinearLayout.LayoutParams ${vName}_btnLp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        ${vName}_btn.setLayoutParams(${vName}_btnLp);
        ${vName}_btn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Toast.makeText(MainActivity.this, "⚡ Google AdMob 300x250 Test Ad Clicked!", Toast.LENGTH_SHORT).show();
            }
        });
        ${vName}.addView(${vName}_btn);

        LinearLayout.LayoutParams ${vName}_lp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        ${vName}_lp.setMargins(16, 12, 16, 12);
        ${vName}.setLayoutParams(${vName}_lp);
        ${parentVar}.addView(${vName});
        registeredViews.put("${comp.id}", ${vName});
        registeredViews.put("${comp.name}", ${vName});
          `);
          break;
        }

        case "Location/GPS":
        case "LocationSensor":
        case "Location Manager":
        case "GPS Manager": {
          componentDecls.push(
            hardwareCompiler.compileLocationComponent(
              vName,
              comp.id,
              comp.name,
              compCounter,
              p.text || "GPS Fix: Active Location Sensor"
            )
          );
          break;
        }

        case "Camera":
        case "Camera Controller": {
          componentDecls.push(
            hardwareCompiler.compileCameraComponent(vName, comp.id, comp.name, compCounter)
          );
          break;
        }

        case "Card":
        case "Card Layout":
        case "CardLayout": {
          componentDecls.push(`
        LinearLayout ${vName} = new LinearLayout(this);
        ${vName}.setOrientation(LinearLayout.VERTICAL);
        ${vName}.setPadding(${p.padding || 24}, ${p.padding || 24}, ${p.padding || 24}, ${p.padding || 24});
        ${vName}.setBackgroundColor(Color.parseColor("${p.backgroundColor || "#FFFFFF"}"));
        LinearLayout.LayoutParams ${vName}_lp = new LinearLayout.LayoutParams(${inHorizontal ? "0" : "LinearLayout.LayoutParams.MATCH_PARENT"}, LinearLayout.LayoutParams.WRAP_CONTENT${inHorizontal ? ", 1.0f" : ""});
        ${vName}_lp.setMargins(${p.margin || 16}, 12, ${p.margin || 16}, 12);
        ${vName}.setLayoutParams(${vName}_lp);
        ${parentVar}.addView(${vName});
        registeredViews.put("${comp.id}", ${vName});
        registeredViews.put("${comp.name}", ${vName});
          `);
          if (comp.children && comp.children.length > 0) {
            comp.children.forEach((child) => processComponent(child, vName, false));
          }
          break;
        }

        case "Recycler/List":
        case "Simple List":
        case "SimpleList":
        case "Custom List":
        case "Image List":
        case "Grid List": {
          const items = p.items || ["Item 1", "Item 2", "Item 3", "Item 4"];
          const itemCode = items
            .map(
              (it: string, idx: number) => `
        TextView item_${compCounter}_${idx} = new TextView(this);
        item_${compCounter}_${idx}.setText("• ${esc(it)}");
        item_${compCounter}_${idx}.setPadding(24, 16, 24, 16);
        item_${compCounter}_${idx}.setTextSize(15f);
        ${vName}.addView(item_${compCounter}_${idx});
              `
            )
            .join("\n");

          componentDecls.push(`
        LinearLayout ${vName} = new LinearLayout(this);
        ${vName}.setOrientation(LinearLayout.VERTICAL);
        ${vName}.setPadding(16, 16, 16, 16);
        ${vName}.setBackgroundColor(Color.parseColor("#F1F5F9"));
        LinearLayout.LayoutParams ${vName}_lp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        ${vName}_lp.setMargins(16, 12, 16, 12);
        ${vName}.setLayoutParams(${vName}_lp);
        ${parentVar}.addView(${vName});
        registeredViews.put("${comp.id}", ${vName});
        registeredViews.put("${comp.name}", ${vName});
        
        ${itemCode}
          `);
          break;
        }

        case "Image":
        case "Image View":
        case "ImageView": {
          componentDecls.push(`
        ImageView ${vName} = new ImageView(this);
        ${vName}.setImageResource(android.R.drawable.ic_menu_gallery);
        ${vName}.setPadding(16, 16, 16, 16);
        LinearLayout.LayoutParams ${vName}_lp = new LinearLayout.LayoutParams(${inHorizontal ? "0" : "LinearLayout.LayoutParams.MATCH_PARENT"}, 300${inHorizontal ? ", 1.0f" : ""});
        ${vName}_lp.setMargins(16, 12, 16, 12);
        ${vName}.setLayoutParams(${vName}_lp);
        ${parentVar}.addView(${vName});
        registeredViews.put("${comp.id}", ${vName});
        registeredViews.put("${comp.name}", ${vName});
          `);
          break;
        }

        case "WebView":
        case "Web View": {
          componentDecls.push(`
        WebView ${vName} = new WebView(this);
        ${vName}.getSettings().setJavaScriptEnabled(true);
        ${vName}.loadUrl("${esc(p.url || "https://android.com")}");
        LinearLayout.LayoutParams ${vName}_lp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, 400);
        ${vName}_lp.setMargins(16, 12, 16, 12);
        ${vName}.setLayoutParams(${vName}_lp);
        ${parentVar}.addView(${vName});
        registeredViews.put("${comp.id}", ${vName});
        registeredViews.put("${comp.name}", ${vName});
          `);
          break;
        }

        case "YouTube Player":
        case "YouTubePlayer": {
          componentDecls.push(`
        WebView ${vName} = new WebView(this);
        ${vName}.getSettings().setJavaScriptEnabled(true);
        ${vName}.getSettings().setDomStorageEnabled(true);
        String yUrl_${vName} = "${esc(p.url || p.videoUrl || "")}";
        String videoId_${vName} = "";
        java.util.regex.Matcher m_${vName} = java.util.regex.Pattern.compile("(?:youtu\\\\.be/|youtube\\\\.com/(?:embed/|v/|watch\\\\?v=|watch\\\\?.+&v=))([\\\\w-]{11})").matcher(yUrl_${vName});
        if (m_${vName}.find()) { videoId_${vName} = m_${vName}.group(1); }
        String html_${vName} = "<html><head><meta name=\\"viewport\\" content=\\"width=device-width, initial-scale=1.0\\"><style>body{margin:0;background:#000;display:flex;justify-content:center;align-items:center;height:100vh;}iframe{width:100%;height:100%;border:none;}</style></head><body><iframe src=\\"https://www.youtube.com/embed/" + videoId_${vName} + "?autoplay=1&playsinline=1\\" allow=\\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\\" allowfullscreen></iframe></body></html>";
        ${vName}.loadDataWithBaseURL("https://www.youtube.com", html_${vName}, "text/html", "utf-8", null);
        LinearLayout.LayoutParams ${vName}_lp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, 450);
        ${vName}_lp.setMargins(16, 12, 16, 12);
        ${vName}.setLayoutParams(${vName}_lp);
        ${parentVar}.addView(${vName});
        registeredViews.put("${comp.id}", ${vName});
        registeredViews.put("${comp.name}", ${vName});
          `);
          break;
        }

        default: {
          if (isContainer) {
            const isHorizContainer =
              comp.type === "Row" ||
              comp.type === "Horizontal Layout" ||
              comp.type === "HorizontalLayout" ||
              comp.type === "Horizontal Scroll Layout" ||
              comp.type === "HorizontalScrollLayout" ||
              comp.type.toLowerCase().includes("horizontal") ||
              p.orientation === "horizontal";
            const orient = isHorizContainer ? "LinearLayout.HORIZONTAL" : "LinearLayout.VERTICAL";

            componentDecls.push(`
        LinearLayout ${vName} = new LinearLayout(this);
        ${vName}.setOrientation(${orient});
        ${vName}.setPadding(${p.padding !== undefined ? p.padding : 12}, ${p.padding !== undefined ? p.padding : 12}, ${p.padding !== undefined ? p.padding : 12}, ${p.padding !== undefined ? p.padding : 12});
        ${p.backgroundColor ? `${vName}.setBackgroundColor(Color.parseColor("${p.backgroundColor}"));` : ""}
        LinearLayout.LayoutParams ${vName}_lp = new LinearLayout.LayoutParams(${inHorizontal ? "0" : "LinearLayout.LayoutParams.MATCH_PARENT"}, LinearLayout.LayoutParams.WRAP_CONTENT${inHorizontal ? ", 1.0f" : ""});
        ${vName}_lp.setMargins(${p.margin !== undefined ? p.margin : 8}, ${p.margin !== undefined ? p.margin : 8}, ${p.margin !== undefined ? p.margin : 8}, ${p.margin !== undefined ? p.margin : 8});
        ${vName}.setLayoutParams(${vName}_lp);
        ${parentVar}.addView(${vName});
        registeredViews.put("${comp.id}", ${vName});
        registeredViews.put("${comp.name}", ${vName});
            `);
            if (comp.children && comp.children.length > 0) {
              comp.children.forEach((child) => processComponent(child, vName, isHorizContainer));
            }
          } else {
            componentDecls.push(`
        TextView ${vName} = new TextView(this);
        ${vName}.setText("${esc(p.text || comp.name || comp.type)}");
        ${vName}.setPadding(16, 12, 16, 12);
        ${parentVar}.addView(${vName});
        registeredViews.put("${comp.id}", ${vName});
        registeredViews.put("${comp.name}", ${vName});
            `);
          }
          break;
        }
      }

      // 3. Process and compile logic blocks targeting this component
      const blocks = screen.logicBlocks?.filter(
        (b) =>
          (b as any).targetComponent === comp.id ||
          b.event?.startsWith(`${comp.name}.`) ||
          b.event?.startsWith(`${comp.id}.`) ||
          (b as any).componentName === comp.name
      ) || [];

      blocks.forEach((block) => {
        const actionStatements: string[] = [];
        (block.actions || []).forEach((act) => {
          actCounter++;
          const stmt = actionCompiler.compileAction(act, actCounter);
          if (stmt && stmt.trim().length > 0) {
            actionStatements.push(stmt);
          }
        });

        if (actionStatements.length > 0) {
          eventListeners.push(`
        ${vName}.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                ${actionStatements.join("\n                ")}
            }
        });
          `);
        }
      });
    }

    if (screen.rootComponent) {
      processComponent(screen.rootComponent, screenContentVar);
    }

    const isInitial = screen.isInitial || screenIndex === 0;
    const initialVisibility = isInitial ? "View.VISIBLE" : "View.GONE";

    screensCode.push(`
        // Screen: ${screen.name}
        ScrollView ${screenVar} = new ScrollView(this);
        ${screenVar}.setLayoutParams(new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        ${screenVar}.setBackgroundColor(Color.parseColor("${screenBgColor}"));
        ${screenVar}.setVisibility(${initialVisibility});

        LinearLayout ${screenContentVar} = new LinearLayout(this);
        ${screenContentVar}.setOrientation(LinearLayout.VERTICAL);
        ${screenContentVar}.setGravity(${hGravity} | ${vGravity});
        ${screenContentVar}.setLayoutParams(new ScrollView.LayoutParams(ScrollView.LayoutParams.MATCH_PARENT, ScrollView.LayoutParams.WRAP_CONTENT));
        ${screenVar}.addView(${screenContentVar});

        ${componentDecls.join("\n")}

        masterContainer.addView(${screenVar});
        screensMap.put("${screen.name}", ${screenVar});
        screensMap.put("${screen.id}", ${screenVar});
    `);
  });

  return `package ${packageName};

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.widget.*;
import android.graphics.Color;
import android.view.Gravity;
import android.content.Intent;
import android.net.Uri;
import android.content.Context;
import android.content.ContentValues;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.app.AlertDialog;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.view.WindowManager;
import android.view.inputmethod.InputMethodManager;
import android.media.AudioManager;
import android.media.ToneGenerator;
import android.hardware.camera2.CameraManager;
import android.os.Vibrator;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import java.net.URL;
import java.net.HttpURLConnection;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.BufferedReader;
import java.util.Map;
import java.util.HashMap;
import java.util.Stack;

public class MainActivity extends Activity {
    private WebView activeWebView = null;
    private final Map<String, View> screensMap = new HashMap<>();
    private final Map<String, View> registeredViews = new HashMap<>();
    private final Map<String, String> appVariables = new HashMap<>();
    private final Stack<String> backStack = new Stack<>();
    private SQLiteDatabase appDb = null;
    private SharedPreferences appPrefs = null;
    private ImageView activeCameraPreview = null;
    private LocationListener locListener = null;
    private boolean flashlightState = false;

    ${storageCompiler.generateDatabaseHelperClass()}

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(android.view.Window.FEATURE_NO_TITLE);

        // Initialize Local Storage & SQLite Database
        appPrefs = getSharedPreferences("DroidForgeData", Context.MODE_PRIVATE);
        try {
            DroidForgeDatabaseHelper dbHelper = new DroidForgeDatabaseHelper(this);
            appDb = dbHelper.getWritableDatabase();
        } catch (Exception ignored) {}

        // Master Multi-Screen Container
        final FrameLayout masterContainer = new FrameLayout(this);
        masterContainer.setLayoutParams(new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));

        // Render All Screens
        ${screensCode.join("\n")}

        // Attach Interactive Event Listeners
        ${eventListeners.join("\n")}

        backStack.push("${initialScreen.name}");
        setContentView(masterContainer);
    }

    ${navigationCompiler.generateNavigationMethods()}

    public void openInAppWebView(final String targetUrl) {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    WebView webView = new WebView(MainActivity.this);
                    WebSettings settings = webView.getSettings();
                    settings.setJavaScriptEnabled(true);
                    settings.setDomStorageEnabled(true);
                    settings.setDatabaseEnabled(true);
                    settings.setAllowFileAccess(true);
                    settings.setAllowContentAccess(true);
                    settings.setUseWideViewPort(true);
                    settings.setLoadWithOverviewMode(true);
                    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
                        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
                    }
                    
                    webView.setWebViewClient(new WebViewClient() {
                        @Override
                        public boolean shouldOverrideUrlLoading(WebView view, String url) {
                            view.loadUrl(url);
                            return true;
                        }
                    });
                    
                    activeWebView = webView;
                    webView.loadUrl(targetUrl);
                    setContentView(webView);
                } catch (Exception e) {
                    try {
                        startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(targetUrl)));
                    } catch (Exception ex) {}
                }
            }
        });
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == 101 && resultCode == RESULT_OK && data != null && data.getExtras() != null) {
            android.graphics.Bitmap photo = (android.graphics.Bitmap) data.getExtras().get("data");
            if (photo != null) {
                if (activeCameraPreview != null) {
                    activeCameraPreview.setImageBitmap(photo);
                }
                Toast.makeText(this, "Camera: Photo Captured (" + photo.getWidth() + "x" + photo.getHeight() + "px)", Toast.LENGTH_SHORT).show();
            }
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        try {
            if (locListener != null) {
                LocationManager locMgr = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
                if (locMgr != null) locMgr.removeUpdates(locListener);
            }
            if (appDb != null && appDb.isOpen()) {
                appDb.close();
            }
        } catch (Exception ignored) {}
    }

    @Override
    public void onBackPressed() {
        if (activeWebView != null && activeWebView.canGoBack()) {
            activeWebView.goBack();
        } else if (backStack != null && backStack.size() > 1) {
            popBackScreen();
        } else {
            super.onBackPressed();
        }
    }
}
`;
}
