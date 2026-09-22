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

console.log('Testing Android SDK tools availability:');
console.log('java:', fs.existsSync(java));
console.log('javac:', fs.existsSync(javac));
console.log('aapt2:', fs.existsSync(aapt2));
console.log('d8.bat:', fs.existsSync(d8Bat));
console.log('platformJar:', fs.existsSync(platformJar));
