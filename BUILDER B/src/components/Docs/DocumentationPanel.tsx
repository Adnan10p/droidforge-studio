import React, { useState } from "react";
import {
  BookOpen,
  Cpu,
  Layers,
  FileCode,
  Shield,
  Terminal,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

export const DocumentationPanel: React.FC = () => {
  const [activeDocSection, setActiveDocSection] = useState<string>("arch");

  return (
    <div
      id="documentation-panel-container"
      className="flex-1 bg-slate-950 flex flex-col md:flex-row h-full overflow-hidden text-slate-200 select-none"
    >
      {/* Table of contents sidebar */}
      <div className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 p-3 space-y-1">
        <div className="px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-400" />
          <span>Developer Docs</span>
        </div>

        {[
          { id: "arch", label: "Modern Architecture (MVI)" },
          { id: "compose", label: "Jetpack Compose Guide" },
          { id: "ndk", label: "C/C++ NDK & JNI Integration" },
          { id: "libraries", label: ".aar, .so & Native Libs" },
          { id: "gradle", label: "Gradle KTS & Build Flavors" },
          { id: "export", label: "Android Studio & Play Store" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveDocSection(item.id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-between ${
              activeDocSection === item.id
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <span>{item.label}</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>
        ))}
      </div>

      {/* Main Documentation Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-4xl text-slate-300">
        {activeDocSection === "arch" && (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] uppercase font-mono text-blue-400 font-bold">
                Architecture Standard
              </span>
              <h1 className="text-xl font-bold text-white mt-1">
                Modern Android Architecture (MVVM / MVI + Coroutines)
              </h1>
            </div>

            <p className="text-xs leading-relaxed">
              DroidForge Studio exports production-grade Android projects adhering strictly to Google's official Android Architecture Guide:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
                <span className="text-xs font-bold text-white block">UI Layer</span>
                <p className="text-[11px] text-slate-400 mt-1">
                  100% Declarative Jetpack Compose. Stateless Composable functions observe immutable StateFlows.
                </p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
                <span className="text-xs font-bold text-white block">ViewModel Layer</span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Lifecycle-aware ViewModels handle UI events, dispatch coroutines on Dispatchers.IO, and emit immutable StateFlow states.
                </p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
                <span className="text-xs font-bold text-white block">Data & Native Layer</span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Clean repositories interfacing with Room SQLite, Retrofit2/OkHttp, and JNI C++20 algorithms.
                </p>
              </div>
            </div>

            <pre className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs font-mono text-cyan-300 overflow-x-auto">
{`// Unidirectional Data Flow pattern
@Composable
fun HomeScreen(viewModel: HomeScreenViewModel = viewModel()) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    HomeScreenContent(
        state = uiState,
        onAction = { event -> viewModel.handleEvent(event) }
    )
}`}
            </pre>
          </div>
        )}

        {activeDocSection === "compose" && (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] uppercase font-mono text-blue-400 font-bold">
                UI Engine
              </span>
              <h1 className="text-xl font-bold text-white mt-1">
                Jetpack Compose Material 3 & Edge-to-Edge
              </h1>
            </div>

            <p className="text-xs leading-relaxed">
              Every screen built visually in DroidForge is compiled directly into clean Kotlin Composable functions:
            </p>

            <ul className="list-disc pl-5 text-xs space-y-1 text-slate-300">
              <li>Dynamic Color: Supports Material You system palette extracts on Android 12+.</li>
              <li>Edge-to-Edge: Configured with <code className="text-blue-400">enableEdgeToEdge()</code> in MainActivity.</li>
              <li>Predictive Back Gestures: Handled via Compose Navigation 2.8+.</li>
              <li>Responsive Layouts: Adaptive breakpoints for Phones, Foldables, and Pixel Tablets.</li>
            </ul>
          </div>
        )}

        {activeDocSection === "ndk" && (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] uppercase font-mono text-purple-400 font-bold">
                High Performance Native
              </span>
              <h1 className="text-xl font-bold text-white mt-1">
                C/C++ NDK & JNI Integration
              </h1>
            </div>

            <p className="text-xs leading-relaxed">
              DroidForge includes first-class Android NDK support. When enabled, your project includes:
            </p>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2 text-xs font-mono">
              <div className="text-emerald-400 font-bold">// app/src/main/cpp/native-lib.cpp</div>
              <pre className="text-slate-300 overflow-x-auto">
{`#include <jni.h>
#include <string>

extern "C" JNIEXPORT jstring JNICALL
Java_com_example_app_MainActivity_stringFromJNI(
        JNIEnv* env,
        jobject /* this */) {
    std::string message = "High-Performance Native C++ Engine Ready";
    return env->NewStringUTF(message.c_str());
}`}
              </pre>
            </div>

            <p className="text-xs leading-relaxed">
              The project is pre-configured with <code className="text-blue-400">CMake 3.22.1</code> and targeted at <code className="text-blue-400">arm64-v8a</code>, <code className="text-blue-400">armeabi-v7a</code>, and <code className="text-blue-400">x86_64</code> ABI architectures.
            </p>
          </div>
        )}

        {activeDocSection === "libraries" && (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold">
                Binary Packaging
              </span>
              <h1 className="text-xl font-bold text-white mt-1">
                Working with .so, .aar, and .jar Libraries
              </h1>
            </div>

            <p className="text-xs leading-relaxed">
              DroidForge packages external binary libraries directly into your project's Gradle tree:
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="font-bold text-white font-mono block">.so files</span>
                <span className="text-slate-400">
                  Placed in <code className="text-cyan-400 font-mono">app/src/main/jniLibs/[abi]/libname.so</code>. Automatically bundled into APK/AAB splits.
                </span>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="font-bold text-white font-mono block">.aar files</span>
                <span className="text-slate-400">
                  Placed in <code className="text-cyan-400 font-mono">app/libs/</code> and linked via <code className="text-cyan-400 font-mono">implementation(files("libs/my-lib.aar"))</code>.
                </span>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="font-bold text-white font-mono block">.jar files</span>
                <span className="text-slate-400">
                  Placed in <code className="text-cyan-400 font-mono">app/libs/</code> for pure Java bytecode utilities.
                </span>
              </div>
            </div>
          </div>
        )}

        {activeDocSection === "gradle" && (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] uppercase font-mono text-cyan-400 font-bold">
                Build Engine
              </span>
              <h1 className="text-xl font-bold text-white mt-1">
                Gradle Kotlin DSL (build.gradle.kts)
              </h1>
            </div>

            <p className="text-xs leading-relaxed">
              All build scripts use modern Kotlin DSL with strict type-safety, version catalogs, and ProGuard / R8 optimization rules for maximum APK shrinkage.
            </p>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs font-mono text-slate-300">
              <span className="text-slate-500">// Run from terminal inside exported project:</span>
              <div className="mt-1 text-emerald-400 font-bold">./gradlew assembleRelease</div>
              <div className="mt-1 text-cyan-400">./gradlew bundleRelease  # Produces .aab for Play Console</div>
            </div>
          </div>
        )}

        {activeDocSection === "export" && (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] uppercase font-mono text-amber-400 font-bold">
                Deployment
              </span>
              <h1 className="text-xl font-bold text-white mt-1">
                Android Studio Import & Google Play Release
              </h1>
            </div>

            <p className="text-xs leading-relaxed">
              When you click <strong>Export Project</strong>, DroidForge creates a 100% compliant Android Studio project in a <code className="text-blue-400">.zip</code> archive:
            </p>

            <ol className="list-decimal pl-5 text-xs space-y-2 text-slate-300">
              <li>
                <strong>Unzip the archive</strong> into your projects directory.
              </li>
              <li>
                <strong>Open Android Studio Ladybug (2024.2+)</strong> and select <em>Open</em> &gt; choose the unzipped folder.
              </li>
              <li>
                Android Studio will automatically detect the Gradle wrapper and download dependencies via Maven Central & Google's Maven repository.
              </li>
              <li>
                Connect your Android device or start an emulator, and press <strong>Run (Shift + F10)</strong>.
              </li>
              <li>
                To generate a signed release bundle, navigate to <strong>Build &gt; Generate Signed Bundle / APK</strong>.
              </li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};
