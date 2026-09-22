# 🛠️ DroidForge Studio - Visual Android App Builder

[![GitHub Repository](https://img.shields.io/badge/GitHub-Adnan10p%2Fdroidforge--studio-blue?style=for-the-badge&logo=github)](https://github.com/Adnan10p/droidforge-studio)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)]()
[![Node Version](https://img.shields.io/badge/Node.js-18%2B-brightgreen?style=for-the-badge&logo=node.js)]()

**DroidForge Studio** is a full-featured visual drag-and-drop IDE, low-code platform, and APK builder for Android application development created by **[@Adnan10p](https://github.com/Adnan10p)**. It allows developers and non-coders to visually design Android interfaces, attach visual block logic, preview in real-time, generate full UI screens using AI, and compile native Android APK binaries directly for mobile devices.

---

## 📥 Installation & Setup Guide (GitHub Clone)

### 1️⃣ Clone the Repository
Open Command Prompt, PowerShell, or Terminal and run:
```bash
git clone https://github.com/Adnan10p/droidforge-studio.git
cd droidforge-studio
```

---

### 2️⃣ Run the App (2 Options)

#### ⚡ Option A: 1-Click Launch (Windows)
Double-click `START_STUDIO.bat` in the project root folder. It will automatically install missing dependencies and launch the server on **`http://localhost:3000`**.

#### 💻 Option B: Manual Command Line Launch
1. Ensure **Node.js** (LTS version) is installed: [https://nodejs.org/](https://nodejs.org/)
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start local server:
   ```bash
   npm run dev
   ```
4. Open in browser: **`http://localhost:3000`**

---

## 📱 How to Test Built Apps on Your Mobile Phone

For step-by-step details in Roman Urdu & English, read [FRIEND_TESTING_GUIDE.md](file:///c:/Users/SAAB%20PC/Desktop/droidforge-studio---visual-android-app-builder%20%281%29/FRIEND_TESTING_GUIDE.md).

1. **⚡ Companion Live Sync (Instant Preview)**:
   - Download the **Companion APK** directly from the top bar in DroidForge Studio.
   - Install on your phone, scan the QR code displayed on Studio, and watch your visual UI and logic changes sync live in real-time!
2. **📦 Native APK Compilation**:
   - Click **"Build APK"** in the Studio header to compile a native Android `.apk` binary file.
   - Download and install `.apk` on any Android smartphone.
3. **🌐 Mobile Browser Live Receiver**:
   - Connect phone & PC to same Wi-Fi network and open `http://<YOUR_PC_IP>:3000` in your phone browser.

---

## 🧰 Key Features & Capabilities

- 🎨 **Visual Canvas**: Drag & drop UI elements (Cards, Buttons, Inputs, Maps, Camera, Media, Sliders, Switches, ListViews).
- 🧩 **Visual Logic Block Editor**: Event-driven logic (`OnClick`, `OnCreate`), Toast notifications, Navigation, Firebase, API calls.
- ⚙️ **Native Android Compiler**: Compiles Kotlin/Java code into Android DEX & APK packages.
- 🤖 **AI Screen Generator & Assistant**: Built-in Gemini model integration for prompt-driven layout generation.
- 📤 **Code Export**: Export ready-to-use Jetpack Compose Kotlin code or full Android Studio project ZIPs.

---

## 👤 Author & Support
Created by **Adnan** ([@Adnan10p](https://github.com/Adnan10p)).
Feel free to star ⭐️ the repository and test it out!
