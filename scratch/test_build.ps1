$ErrorActionPreference = "Stop"

$androidSdk = $env:ANDROID_HOME
$javaHome = $env:JAVA_HOME
$buildTools = "$androidSdk\build-tools\35.0.0"
$platformJar = "$androidSdk\platforms\android-35\android.jar"
$java = "$javaHome\bin\java.exe"
$javac = "$javaHome\bin\javac.exe"
$keytool = "$javaHome\bin\keytool.exe"
$aapt2 = "$buildTools\aapt2.exe"
$d8Bat = "$buildTools\d8.bat"
$zipalign = "$buildTools\zipalign.exe"
$apksignerBat = "$buildTools\apksigner.bat"

$workDir = "c:\Users\SAAB PC\Desktop\droidforge-studio---visual-android-app-builder (1)\scratch\test_apk_build"
if (Test-Path $workDir) { Remove-Item -Recurse -Force $workDir }
New-Item -ItemType Directory -Path "$workDir\src\com\droidforge\quickapp" -Force | Out-Null
New-Item -ItemType Directory -Path "$workDir\res\values" -Force | Out-Null

# Write UTF-8 files without BOM
function Write-NoBom {
    param([string]$path, [string]$content)
    [System.IO.File]::WriteAllText($path, $content, (New-Object System.Text.UTF8Encoding $false))
}

# 1. AndroidManifest.xml
Write-NoBom "$workDir\AndroidManifest.xml" @"
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.droidforge.quickapp"
    android:versionCode="1"
    android:versionName="1.0.0">
    <uses-sdk android:minSdkVersion="21" android:targetSdkVersion="34" />
    <uses-permission android:name="android.permission.INTERNET" />
    <application android:label="DroidForge Demo App" android:hasCode="true">
        <activity android:name=".MainActivity" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
"@

# 2. strings.xml
Write-NoBom "$workDir\res\values\strings.xml" @"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">DroidForge Demo App</string>
</resources>
"@

# 3. Java Activity Source
Write-NoBom "$workDir\src\com\droidforge\quickapp\MainActivity.java" @"
package com.droidforge.quickapp;

import android.app.Activity;
import android.os.Bundle;
import android.widget.TextView;
import android.widget.LinearLayout;
import android.graphics.Color;
import android.view.Gravity;

public class MainActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setGravity(Gravity.CENTER);
        layout.setBackgroundColor(Color.parseColor("#0F172A"));
        
        TextView tv = new TextView(this);
        tv.setText("Welcome to DroidForge Studio!\nYour APK was successfully built & installed!");
        tv.setTextColor(Color.WHITE);
        tv.setTextSize(18f);
        tv.setGravity(Gravity.CENTER);
        tv.setPadding(32, 32, 32, 32);
        
        layout.addView(tv);
        setContentView(layout);
    }
}
"@

Write-Host "--- 1. Compiling resources with AAPT2 ---"
& $aapt2 compile --dir "$workDir\res" -o "$workDir\compiled_res.zip"
& $aapt2 link -o "$workDir\unaligned.apk" -I $platformJar --manifest "$workDir\AndroidManifest.xml" "$workDir\compiled_res.zip" --auto-add-overlay

Write-Host "--- 2. Compiling Java Source to Bytecode ---"
New-Item -ItemType Directory -Path "$workDir\obj" -Force | Out-Null
& $javac -encoding UTF-8 -d "$workDir\obj" -classpath "$platformJar" "$workDir\src\com\droidforge\quickapp\MainActivity.java"

Write-Host "--- 3. Converting Bytecode to Dalvik Executable (classes.dex) ---"
$classFile = "$workDir\obj\com\droidforge\quickapp\MainActivity.class"
cmd /c "`"$d8Bat`" --output `"$workDir`" --lib `"$platformJar`" `"$classFile`""

Write-Host "--- 4. Adding classes.dex to APK ---"
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::Open("$workDir\unaligned.apk", [System.IO.Compression.ZipArchiveMode]::Update)
[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, "$workDir\classes.dex", "classes.dex")
$zip.Dispose()

Write-Host "--- 5. Aligning APK with ZipAlign ---"
& $zipalign -v -p 4 "$workDir\unaligned.apk" "$workDir\aligned.apk"

Write-Host "--- 6. Generating Keystore & Signing APK with APKSigner ---"
$keystorePath = "$workDir\debug.keystore"
if (-not (Test-Path $keystorePath)) {
    & $keytool -genkeypair -v -keystore $keystorePath -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
}

cmd /c "`"$apksignerBat`" sign --ks `"$keystorePath`" --ks-pass pass:android --key-pass pass:android --ks-key-alias androiddebugkey --out `"$workDir\app-release.apk`" `"$workDir\aligned.apk`""

Write-Host "--- BUILD SUCCESSFUL! ---"
Get-Item "$workDir\app-release.apk" | Select-Object Name, Length
