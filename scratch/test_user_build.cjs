const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const androidSdk = process.env.ANDROID_HOME || 'C:\\Users\\SAAB PC\\AppData\\Local\\Android\\Sdk';
const javaHome = process.env.JAVA_HOME || 'C:\\Program Files\\Java\\jdk-17.0.1';
const buildTools = path.join(androidSdk, 'build-tools', '35.0.0');
const platformJar = path.join(androidSdk, 'platforms', 'android-35', 'android.jar');

const java = path.join(javaHome, 'bin', 'java.exe');
const javac = path.join(javaHome, 'bin', 'javac.exe');
const keytool = path.join(javaHome, 'bin', 'keytool.exe');
const aapt2 = path.join(buildTools, 'aapt2.exe');
const d8Bat = path.join(buildTools, 'd8.bat');
const zipalign = path.join(buildTools, 'zipalign.exe');
const apksignerBat = path.join(buildTools, 'apksigner.bat');

const testDir = path.join(__dirname, 'test_user_apk');
if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true, force: true });
fs.mkdirSync(path.join(testDir, 'src', 'com', 'mycustom', 'app'), { recursive: true });
fs.mkdirSync(path.join(testDir, 'res', 'values'), { recursive: true });

// 1. AndroidManifest.xml
const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.mycustom.app"
    android:versionCode="1"
    android:versionName="1.0.0">
    <uses-sdk android:minSdkVersion="21" android:targetSdkVersion="34" />
    <uses-permission android:name="android.permission.INTERNET" />
    <application android:label="@string/app_name" android:hasCode="true" android:icon="@android:drawable/sym_def_app_icon">
        <activity android:name=".MainActivity" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;
fs.writeFileSync(path.join(testDir, 'AndroidManifest.xml'), manifestXml, 'utf8');

// 2. strings.xml
const stringsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">My Custom User App</string>
</resources>`;
fs.writeFileSync(path.join(testDir, 'res', 'values', 'strings.xml'), stringsXml, 'utf8');

// 3. MainActivity.java
const javaCode = `package com.mycustom.app;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.widget.*;
import android.graphics.Color;
import android.view.Gravity;
import android.content.Intent;
import android.net.Uri;
import android.content.Context;

public class MainActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        ScrollView rootScroll = new ScrollView(this);
        rootScroll.setLayoutParams(new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        rootScroll.setBackgroundColor(Color.parseColor("#0F172A"));

        LinearLayout contentLayout = new LinearLayout(this);
        contentLayout.setOrientation(LinearLayout.VERTICAL);
        contentLayout.setLayoutParams(new ScrollView.LayoutParams(ScrollView.LayoutParams.MATCH_PARENT, ScrollView.LayoutParams.WRAP_CONTENT));
        rootScroll.addView(contentLayout);

        TextView tvHeader = new TextView(this);
        tvHeader.setText("My Custom User App");
        tvHeader.setTextColor(Color.WHITE);
        tvHeader.setTextSize(22f);
        tvHeader.setPadding(32, 32, 32, 32);
        tvHeader.setTypeface(null, android.graphics.Typeface.BOLD);
        tvHeader.setBackgroundColor(Color.parseColor("#4F46E5"));
        contentLayout.addView(tvHeader);

        Button btnAction = new Button(this);
        btnAction.setText("Click My Custom Action");
        btnAction.setTextColor(Color.WHITE);
        btnAction.setBackgroundColor(Color.parseColor("#10B981"));
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        lp.setMargins(32, 32, 32, 32);
        btnAction.setLayoutParams(lp);
        contentLayout.addView(btnAction);

        btnAction.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Toast.makeText(MainActivity.this, "Custom User Action Triggered Successfully!", Toast.LENGTH_LONG).show();
            }
        });

        setContentView(rootScroll);
    }
}`;
fs.writeFileSync(path.join(testDir, 'src', 'com', 'mycustom', 'app', 'MainActivity.java'), javaCode, 'utf8');

console.log('1. AAPT2 Compile & Link...');
const compiledZip = path.join(testDir, 'compiled_res.zip');
const unalignedApk = path.join(testDir, 'unaligned.apk');

const r1 = spawnSync(aapt2, ['compile', '--dir', path.join(testDir, 'res'), '-o', compiledZip]);
if (r1.status !== 0) console.error('AAPT2 compile err:', r1.stderr ? r1.stderr.toString() : r1.error);

const r2 = spawnSync(aapt2, ['link', '-o', unalignedApk, '-I', platformJar, '--manifest', path.join(testDir, 'AndroidManifest.xml'), compiledZip, '--auto-add-overlay']);
if (r2.status !== 0) console.error('AAPT2 link err:', r2.stderr ? r2.stderr.toString() : r2.error);

console.log('2. Javac Compile...');
const objDir = path.join(testDir, 'obj');
fs.mkdirSync(objDir, { recursive: true });
const r3 = spawnSync(javac, ['-encoding', 'UTF-8', '-d', objDir, '-classpath', platformJar, path.join(testDir, 'src', 'com', 'mycustom', 'app', 'MainActivity.java')]);
if (r3.status !== 0) console.error('Javac err:', r3.stderr ? r3.stderr.toString() : r3.error);

console.log('3. D8 DEX Compile (All .class files)...');
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach((file) => {
    if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
      arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
    } else if (file.endsWith('.class')) {
      arrayOfFiles.push(path.join(dirPath, file));
    }
  });
  return arrayOfFiles;
}

const classFiles = getAllFiles(objDir, []);
console.log('Class files found:', classFiles);
const classArgs = classFiles.map((f) => `"${f}"`).join(' ');
const d8Cmd = `""${d8Bat}" --output "${testDir}" --lib "${platformJar}" ${classArgs}"`;
const r4 = spawnSync('cmd.exe', ['/c', d8Cmd], { windowsVerbatimArguments: true });
if (r4.status !== 0) console.error('D8 err:', r4.stderr ? r4.stderr.toString() : r4.error);

console.log('4. Adding classes.dex to APK via JSZip...');
const JSZip = require('jszip');
async function pack() {
  const dexBuffer = fs.readFileSync(path.join(testDir, 'classes.dex'));
  const apkBuffer = fs.readFileSync(unalignedApk);
  const zip = await JSZip.loadAsync(apkBuffer);
  zip.file('classes.dex', dexBuffer);
  const updatedBuf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(unalignedApk, updatedBuf);

  console.log('5. ZipAlign...');
  const alignedApk = path.join(testDir, 'aligned.apk');
  const r5 = spawnSync(zipalign, ['-v', '-p', '4', unalignedApk, alignedApk]);
  if (r5.status !== 0) console.error('ZipAlign err:', r5.stderr ? r5.stderr.toString() : r5.error);

  console.log('6. APKSigner...');
  const keystorePath = path.join(testDir, 'debug.keystore');
  spawnSync(keytool, ['-genkeypair', '-v', '-keystore', keystorePath, '-storepass', 'android', '-alias', 'androiddebugkey', '-keypass', 'android', '-keyalg', 'RSA', '-keysize', '2048', '-validity', '10000', '-dname', 'CN=Android Debug,O=Android,C=US']);

  const finalApk = path.join(testDir, 'app-release.apk');
  const signerCmd = `""${apksignerBat}" sign --ks "${keystorePath}" --ks-pass pass:android --key-pass pass:android --ks-key-alias androiddebugkey --out "${finalApk}" "${alignedApk}""`;
  const r6 = spawnSync('cmd.exe', ['/c', signerCmd], { windowsVerbatimArguments: true });
  if (r6.status !== 0) console.error('Signer err:', r6.stderr ? r6.stderr.toString() : r6.error);

  console.log('SUCCESS! Custom App APK generated:', fs.existsSync(finalApk), 'Size:', fs.statSync(finalApk).size);
}
pack();
