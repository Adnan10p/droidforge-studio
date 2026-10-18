# 📋 DroidForge Studio - Changelog & Version History

All notable changes and technical comparisons between versions of **DroidForge Studio** are documented in this file.

---

## 🚀 [v1.1.0] - Critical Fixes, Electron Runtime & Performance Upgrade
*Release Date: October 2026*

### 📊 Previous Version (v1.0.0) vs Current Version (v1.1.0) Comparison

| Feature / Component | ❌ Previous Version (v1.0.0) | ✅ Updated Version (v1.1.0) |
| :--- | :--- | :--- |
| **TypeScript Compilation** | `tsc --noEmit` failed with **1,000+ type errors**; missing JSX intrinsics. | **0 Errors (Exit Code 0)**; 100% clean typecheck across all 170+ components. |
| **React 19 Types** | Missing `@types/react` and `@types/react-dom` in `devDependencies`. | Installed official `@types/react@^19.0.10` and `@types/react-dom@^19.0.4`. |
| **Type Re-Export Collision** | Duplicate `UserProfile` export in `src/types.ts` and `src/types/auth.ts` caused ambiguity. | Disambiguated in `src/types/index.ts` with clean modular type exports. |
| **Project Schema Completeness** | Missing `primaryColor`, `themeColor`, `defaultValue`, `name`, and `components` properties. | Added missing properties to `ProjectConfig`, `StateVariable`, `Material3Theme`, and `AndroidScreen`. |
| **Desktop App (.exe) Runtime** | Electron crashed or failed to spawn Express backend due to missing `ELECTRON_RUN_AS_NODE`. | Added `ELECTRON_RUN_AS_NODE: '1'` in `electron/main.cjs` for guaranteed background server execution. |
| **Packaged Distribution Assets** | `public/` folder was omitted from `electron-builder.json`, causing 404 for companion APK and icons. | Added `"public/**/*"` to `electron-builder.json` bundle manifest. |
| **Host Machine Portability** | Hardcoded personal path (`C:\Users\SAAB PC\...`) inside `apkBuilder.ts`. | Dynamically discovers Android SDK via `ANDROID_HOME` and `USERPROFILE` on any PC. |
| **Bundle Architecture** | Single monolithic **1.93 MB** JS bundle (`index.js`) caused high initial load times. | Configured Vite Rollup chunk splitting (`vendor`, `flow`, `icons`, `motion`) for faster loading. |
| **Visual Logic Flow Editor** | Unhandled closure narrowing on AIX extensions and broken edge styling types. | Resolved closure narrowing in `extensionManager.ts` and stabilized edge coordinates in `LogicFlowEditor.tsx`. |
| **Companion Live Sync** | Map callback type collision in `CompanionLiveRunner.tsx` caused runtime type warnings. | Fixed callback signature to `(c) => renderComponent(c)` for seamless preview. |
| **Cross-Platform Scripting** | `clean` command used Unix-only `rm -rf` which crashed on Windows CMD. | Cross-platform Node.js cleanup script added to `package.json`. |

---

### 🔧 Detailed Technical Breakdown of Fixes

#### 1. Core Types & Strict Safety
- **`src/types.ts`**:
  - Added `primaryColor?: string;` and `themeColor?: string;` to `ProjectConfig`.
  - Added `components?: AndroidComponent[];` to `AndroidScreen` for downstream flow editor compatibility.
  - Added `defaultValue?: string;` to `StateVariable`.
  - Added `"wav"` support to `ProjectAsset.format`.
  - Added `name?: string;` to `Material3Theme`.
  - Extended `layoutWidth` and `layoutHeight` to accept `"fill_max_width"`, `"100%"`, and strings.
- **`src/types/index.ts`**: Resolved export collision by cleanly exporting `AuthState` without clashing with `UserProfile`.

#### 2. Electron Desktop Packaging
- **`electron/main.cjs`**: Set `ELECTRON_RUN_AS_NODE: '1'` when spawning the packaged `server.cjs` backend process. In packaged Electron binaries, `process.execPath` points to the app executable; this flag instructs Electron to run strictly as Node.js for the backend.
- **`electron-builder.json`**: Included `public/**/*` in the packaging list so that `DroidForge-Companion-v6.0.0-Master.apk`, launcher icons, and screenshots are bundled in Windows installers and portable builds.

#### 3. Frontend & Build Performance
- **`vite.config.ts`**: Configured `build.rollupOptions.output.manualChunks` to isolate heavy libraries:
  - `vendor`: React core
  - `flow`: @xyflow/react & D3 graph calculations
  - `icons`: Lucide React icon suite
  - `motion`: Motion animation engine
- **`package.json`**: Upgraded `version` to `1.1.0`.

#### 4. Logic Editor & Modals
- **`src/components/LogicEditor/LogicFlowEditor.tsx`**: Fixed `handleNodeChangeEvent` argument signature and edge insert coordinates.
- **`src/components/LogicEditor/menus/EdgeInsertPickerModal.tsx`**: Supported both explicit `x/y` coordinates and `position` objects.
- **`src/components/LogicEditor/GlobalSearchModal.tsx`**: Made `onSelectComponent` optional.
- **`src/components/Modals/ScreenManagerModal.tsx`**: Added `onCopyScreen` support.
- **`src/components/Modals/CustomComponentModal.tsx`**: Fixed `ComponentCategory` type casting.
- **`src/services/extensionManager.ts`**: Fixed TypeScript closure narrowing error on `descriptorFile.async("text")`.

---

## 📦 [v1.0.0] - Initial Release
*Initial release of DroidForge Studio - Visual Android App Builder featuring 170+ Material 3 components, visual logic blocks, Gemini AI assistant, Jetpack Compose code generator, and native companion APK integration.*
