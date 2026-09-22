# 🚀 DroidForge Studio - Friend Testing & Setup Guide
*(Guide in Roman Urdu & English)*

Aap ka friend DroidForge Studio ko kitni aasani se apne PC par setup karke test kar sakta hai, niche diye gaye steps ko follow karein:

---

## 📋 Prerequisites (Requirements)
1. **Node.js**: Phone / PC par app builder run karne ke liye Node.js installed hona chahiye.
   - Download link: [https://nodejs.org/](https://nodejs.org/) (Download **LTS Version**)
2. **Web Browser**: Google Chrome, Edge, ya Brave browser.

---

## 🛠️ Step 1: Install & Run on Localhost (PC par Chalanay Ka Tarika)

### Tarika 1: Double-Click Batch File (Sab Se Aasan Method)
1. Project folder open karein.
2. `START_STUDIO.bat` file par **Double Click** karein.
3. Pehli baar yeh dependencies automatic install karega (`npm install`).
4. Terminal mein jab yeh message aaye:
   `DroidForge Server running on http://0.0.0.0:3000`
5. Apne browser mein open karein: **`http://localhost:3000`**

### Tarika 2: Command Prompt / Terminal Se
1. Project folder mein Command Prompt (CMD) ya Terminal open karein.
2. Niche di gayi commands run karein:
   ```bash
   npm install
   npm run dev
   ```
3. Browser mein open karein: **`http://localhost:3000`**

---

## 📱 Step 2: Phone Par App Test Karne Ke 3 Tarike (Mobile Testing)

DroidForge Studio mein aap 3 simple tarikon se app ko phone par test kar sakte hain:

### ⚡ Method 1: DroidForge Companion App (Live Sync - Recommended)
1. Studio Header mein **"Download Companion APK"** par click karein.
2. App ko apne Android Phone par install karein.
3. Phone par Companion App open karein aur Studio ka **QR Code scan karein** (ya Sync Code enter karein).
4. **Fayda**: PC par jab bhi aap UI ya Logic change karenge, phone par **Live Real-time update** dikhega!

### 📦 Method 2: Compile & Build Real Native APK File
1. Studio Header mein **"Build APK"** button par click karein.
2. Studio backend project ko compile karke real **`.apk`** build karega.
3. Build complete hone par **"Download APK"** button aayega ya QR Code scan karke APK phone par download karke install kar lein!

*(Note: Agar PC par Android SDK / Java JDK installed ho to local native compilation hoti hai, warna studio universal standalone binary package generate karta hai).*

### 🌐 Method 3: Mobile Browser Live Preview
1. PC aur Phone ko **SAME Wi-Fi** se connect karein.
2. PC par Command Prompt khol kar `ipconfig` likhein aur apna local IP address dekhein (e.g., `192.168.1.10`).
3. Phone browser par open karein: **`http://192.168.1.10:3000`**

---

## 🎨 Step 3: Visual App Creation Features

Friend in features ko test kar sakta hai:
- **Drag & Drop UI Components**: Buttons, Cards, Lists, Input fields, Images, Videos, Maps, Camera, Switch, Sliders, etc.
- **Visual Logic Block Editor**: Event blocks (`OnClick`, `OnCreate`), Actions (`Show Toast`, `Navigate Screen`, `API Call`, `Firebase Write`).
- **Multi-Screen Support**: Multiple screens create karein aur screen navigation setup karein.
- **AI App Generator**: Prompt likhein (e.g. *"Create a modern E-commerce screen with products and buy button"*) aur AI automatic poora screen UI create kar dega.
- **Export Options**: Kotlin / Jetpack Compose code export, Android Studio Zip export, aur compiled APK export.

---

## 🔧 Troubleshooting & Tips

- **Port 3000 busy error**: Agar port 3000 already in use ho, to `server.ts` mein `PORT = 3000` ko `PORT = 3001` change kar sakte hain.
- **Gemini AI Key (Optional)**: AI features test karne ke liye Settings -> Secrets mein `GEMINI_API_KEY` set kar sakte hain (Offline fallback templates key ke bina bhi kaam karte hain!).

---

Happy Testing with DroidForge Studio! 🚀
