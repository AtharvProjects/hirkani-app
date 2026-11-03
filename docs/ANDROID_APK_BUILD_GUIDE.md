# HIRKANI Android APK Build Guide

## Overview
This guide provides step-by-step instructions for building a production-ready Android APK for the HIRKANI Pregnancy Food Intelligence app.

---

## Prerequisites

### Required Software
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Java JDK** 11 or 17 ([Download](https://www.oracle.com/java/technologies/downloads/))
- **Android Studio** ([Download](https://developer.android.com/studio))
- **Android SDK** (installed via Android Studio)
- **Git** ([Download](https://git-scm.com/))

### Environment Setup

#### 1. Install Android Studio
```bash
# Download and install Android Studio
# During installation, ensure these are selected:
# - Android SDK
# - Android SDK Platform
# - Android Virtual Device
```

#### 2. Configure Android SDK
```bash
# Set ANDROID_HOME environment variable
# On macOS/Linux:
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools

# On Windows:
setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk"
setx PATH "%PATH%;%ANDROID_HOME%\platform-tools"
```

#### 3. Install Required SDK Packages
Open Android Studio → SDK Manager → Install:
- Android SDK Platform 33
- Android SDK Build-Tools 33.0.0
- Android SDK Platform-Tools
- Android SDK Command-line Tools

---

## Project Setup

### 1. Clone Repository
```bash
cd /Users/ashitosh/Downloads/hirkani-app-main
```

### 2. Install Dependencies
```bash
cd mobile
npm install
# or
yarn install
```

### 3. Link Native Dependencies (if needed)
```bash
npx react-native link
```

---

## Generating Signing Keys

### 1. Create Release Keystore
```bash
cd android/app

# Generate keystore (keep this file secure!)
keytool -genkeypair -v -storetype PKCS12 \
  -keystore hirkani-release.keystore \
  -alias hirkani-key-alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# You will be prompted for:
# - Keystore password (remember this!)
# - Key password (remember this!)
# - Your name, organization, etc.
```

**IMPORTANT:** Store the keystore file and passwords securely. You cannot publish updates without them!

### 2. Configure Gradle Properties
Create or edit `android/gradle.properties`:

```properties
# HIRKANI Release Signing Configuration
HIRKANI_UPLOAD_STORE_FILE=hirkani-release.keystore
HIRKANI_UPLOAD_KEY_ALIAS=hirkani-key-alias
HIRKANI_UPLOAD_STORE_PASSWORD=your_keystore_password_here
HIRKANI_UPLOAD_KEY_PASSWORD=your_key_password_here

# React Native optimizations
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
org.gradle.parallel=true
org.gradle.configureondemand=true
org.gradle.daemon=true

# Android optimizations
android.useAndroidX=true
android.enableJetifier=true
android.enableR8.fullMode=true

# Hermes engine
hermesEnabled=true
```

**Security Note:** Never commit `gradle.properties` with real passwords to version control!

---

## Building the APK

### Debug Build (for testing)
```bash
cd android

# Build debug APK
./gradlew assembleDebug

# Output location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### Production Release Build

#### Option 1: Release APK (Recommended for direct distribution)
```bash
cd android

# Clean previous builds
./gradlew clean

# Build production release APK
./gradlew assembleRelease

# Output location:
# android/app/build/outputs/apk/production/release/app-production-release.apk
```

#### Option 2: App Bundle (For Google Play Store)
```bash
cd android

# Build Android App Bundle (AAB)
./gradlew bundleRelease

# Output location:
# android/app/build/outputs/bundle/productionRelease/app-production-release.aab
```

---

## Build Variants

HIRKANI supports multiple build variants:

### 1. Production Release
```bash
./gradlew assembleProductionRelease
# Full production build with all optimizations
```

### 2. Staging Release
```bash
./gradlew assembleStagingRelease
# Staging environment for pre-production testing
```

### 3. Debug Build
```bash
./gradlew assembleDebug
# Development build with debugging enabled
```

---

## APK Optimization

### 1. Enable ProGuard/R8
Already configured in `build.gradle`:
```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

### 2. Reduce APK Size
- **Enable code shrinking:** ✓ (ProGuard/R8)
- **Enable resource shrinking:** ✓
- **Use ABI splits:** Configured for armeabi-v7a, arm64-v8a, x86_64
- **Compress images:** Use WebP format
- **Remove unused dependencies:** Audit package.json

### 3. Expected APK Sizes
- **Debug APK:** ~50-80 MB
- **Release APK (universal):** ~30-50 MB
- **Release APK (per ABI):** ~20-30 MB each
- **App Bundle (AAB):** ~25-40 MB

---

## Testing the APK

### 1. Install on Physical Device
```bash
# Enable USB debugging on your Android device
# Connect device via USB

# Install APK
adb install -r android/app/build/outputs/apk/production/release/app-production-release.apk

# Or use:
npm run android:release
```

### 2. Test Critical Flows
- [ ] App launches successfully
- [ ] Camera/barcode scanning works
- [ ] Food analysis completes
- [ ] Personalization displays correctly
- [ ] Consumption tracking saves data
- [ ] Navigation works smoothly
- [ ] No crashes or errors

### 3. Performance Testing
```bash
# Monitor app performance
adb shell dumpsys meminfo com.hirkani.pregnancy.food
adb shell dumpsys cpuinfo | grep hirkani

# Check APK size
ls -lh android/app/build/outputs/apk/production/release/
```

---

## Verification Checklist

### Pre-Release Checklist
- [ ] Version code incremented in `build.gradle`
- [ ] Version name updated (e.g., 1.0.0 → 1.0.1)
- [ ] Release notes prepared
- [ ] All features tested
- [ ] No debug code or logging
- [ ] ProGuard rules verified
- [ ] Signing configuration correct
- [ ] Permissions reviewed (only necessary ones)
- [ ] App icon and name correct
- [ ] Privacy policy linked
- [ ] Terms of service linked

### Build Verification
```bash
# Verify APK signature
jarsigner -verify -verbose -certs android/app/build/outputs/apk/production/release/app-production-release.apk

# Check APK contents
unzip -l android/app/build/outputs/apk/production/release/app-production-release.apk

# Analyze APK size
npx react-native bundle-visualizer
```

---

## Continuous Integration (CI/CD)

### GitHub Actions Example
```yaml
name: Build Android APK

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up JDK 11
      uses: actions/setup-java@v3
      with:
        java-version: '11'
        distribution: 'temurin'
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd mobile
        npm ci
    
    - name: Build Release APK
      run: |
        cd mobile/android
        ./gradlew assembleRelease
    
    - name: Upload APK
      uses: actions/upload-artifact@v3
      with:
        name: app-release
        path: mobile/android/app/build/outputs/apk/production/release/*.apk
```

---

## Distribution

### 1. Direct Distribution (APK)
```bash
# Share APK file directly
# Users must enable "Install from Unknown Sources"
```

### 2. Google Play Store (AAB)
```bash
# Build App Bundle
./gradlew bundleRelease

# Upload to Google Play Console:
# 1. Create app listing
# 2. Upload AAB file
# 3. Complete store listing
# 4. Submit for review
```

### 3. Firebase App Distribution
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy to Firebase App Distribution
firebase appdistribution:distribute \
  android/app/build/outputs/apk/production/release/app-production-release.apk \
  --app YOUR_FIREBASE_APP_ID \
  --groups testers \
  --release-notes "New release with bug fixes"
```

---

## Troubleshooting

### Common Issues

#### 1. Build Fails with "Could not find tools.jar"
```bash
# Ensure JAVA_HOME is set correctly
export JAVA_HOME=$(/usr/libexec/java_home -v 11)
```

#### 2. "SDK location not found"
```bash
# Create or edit android/local.properties
echo "sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk" > android/local.properties
```

#### 3. "Execution failed for task ':app:mergeReleaseResources'"
```bash
# Clean build
cd android
./gradlew clean
./gradlew assembleRelease
```

#### 4. ProGuard/R8 Issues
```bash
# Check proguard-rules.pro
# Add necessary keep rules
# Test with minifyEnabled false first
```

#### 5. Out of Memory During Build
```bash
# Increase Gradle memory in gradle.properties
org.gradle.jvmargs=-Xmx4096m
```

---

## Version Management

### Updating Version
Edit `android/app/build.gradle`:

```gradle
defaultConfig {
    versionCode 2          // Increment for each release
    versionName "1.0.1"    // Semantic versioning
}
```

### Version Naming Convention
- **Major.Minor.Patch** (e.g., 1.2.3)
- **Major:** Breaking changes
- **Minor:** New features
- **Patch:** Bug fixes

---

## Security Best Practices

### 1. Keystore Security
- Store keystore in secure location
- Never commit to version control
- Back up keystore securely
- Use different keystores for debug/release

### 2. API Keys & Secrets
```bash
# Store in gradle.properties (gitignored)
# Or use environment variables
# Never hardcode in source
```

### 3. Code Obfuscation
- Enable ProGuard/R8 (✓ configured)
- Review obfuscation results
- Test thoroughly after obfuscation

### 4. SSL/TLS Pinning
```java
// Implement certificate pinning for API calls
// Prevent man-in-the-middle attacks
```

---

## Performance Optimization

### 1. Hermes Engine
Already enabled in `gradle.properties`:
```properties
hermesEnabled=true
```

### 2. Enable R8 Full Mode
```gradle
android.enableR8.fullMode=true
```

### 3. ABI Splits
Configure per-ABI builds for smaller APKs:
```gradle
splits {
    abi {
        enable true
        reset()
        include "armeabi-v7a", "arm64-v8a", "x86_64"
        universalApk true
    }
}
```

---

## Quick Reference

### Essential Commands
```bash
# Install dependencies
npm install

# Debug build
cd android && ./gradlew assembleDebug

# Release build
cd android && ./gradlew assembleRelease

# App bundle
cd android && ./gradlew bundleRelease

# Install on device
adb install -r path/to/app.apk

# Clean build
cd android && ./gradlew clean
```

### File Locations
```
mobile/
├── android/
│   ├── app/
│   │   ├── build.gradle                    # Build configuration
│   │   ├── proguard-rules.pro              # ProGuard rules
│   │   ├── src/main/AndroidManifest.xml   # App manifest
│   │   └── build/outputs/apk/              # Built APKs
│   ├── build.gradle                        # Root build config
│   └── gradle.properties                   # Gradle settings
└── package.json                            # NPM dependencies
```

---

## Support & Resources

### Documentation
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Android Developer Guide](https://developer.android.com/guide)
- [Gradle Build Guide](https://developer.android.com/studio/build)

### Tools
- [Android Studio](https://developer.android.com/studio)
- [APK Analyzer](https://developer.android.com/studio/build/apk-analyzer)
- [Bundle Tool](https://developer.android.com/studio/command-line/bundletool)

---

## Conclusion

Your HIRKANI Android APK is now ready for production! Follow this guide to build, test, and distribute the app.

**Key Points:**
- ✅ Signing keys configured
- ✅ ProGuard/R8 enabled
- ✅ Hermes engine active
- ✅ Performance optimized
- ✅ Security hardened

**Output:** Production-ready APK at:
`mobile/android/app/build/outputs/apk/production/release/app-production-release.apk`

**Happy Launching! 🚀**
