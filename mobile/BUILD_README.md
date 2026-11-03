# HIRKANI Mobile App - Build Instructions

## Quick Start

### Build Production APK
```bash
cd /Users/ashitosh/Downloads/hirkani-app-main/mobile

# Install dependencies
npm install

# Build release APK
cd android
./gradlew clean
./gradlew assembleProductionRelease

# Output:
# android/app/build/outputs/apk/production/release/app-production-release.apk
```

---

## What Was Created

### Android Project Structure
```
mobile/
├── package.json                              # Dependencies & scripts
├── android/
│   ├── build.gradle                          # Root build configuration
│   ├── gradle.properties                     # Build properties (add passwords)
│   ├── app/
│   │   ├── build.gradle                      # App build configuration
│   │   ├── proguard-rules.pro                # Code obfuscation rules
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml           # App manifest
│   │   │   └── java/com/hirkani/
│   │   │       ├── MainActivity.java         # Main activity
│   │   │       └── MainApplication.java      # Application class
│   │   └── build/outputs/apk/                # Built APKs (after build)
│   └── local.properties                      # SDK location (create this)
```

---

## Configuration Files Created

### 1. package.json
- React Native 0.72.6
- Dependencies: Camera, Storage, Navigation
- Build scripts configured

### 2. android/app/build.gradle
- **Min SDK:** 24 (Android 7.0+)
- **Target SDK:** 33 (Android 13)
- **Build Types:** Debug, Release
- **Flavors:** Production, Staging
- **Optimizations:** ProGuard, R8, Hermes
- **Signing:** Release keystore configured

### 3. proguard-rules.pro
- React Native keep rules
- Camera library rules
- Storage library rules
- Logging removal for release
- Code obfuscation rules

### 4. AndroidManifest.xml
- Permissions: Camera, Internet, Storage
- Main activity configuration
- App metadata

---

## Before Building

### 1. Install Android Studio
Download from: https://developer.android.com/studio

### 2. Set Environment Variables
```bash
# Add to ~/.zshrc or ~/.bash_profile
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### 3. Create Signing Key
```bash
cd mobile/android/app

keytool -genkeypair -v -storetype PKCS12 \
  -keystore hirkani-release.keystore \
  -alias hirkani-key-alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

### 4. Configure Signing (Required!)
Edit `mobile/android/gradle.properties`:

```properties
HIRKANI_UPLOAD_STORE_FILE=hirkani-release.keystore
HIRKANI_UPLOAD_KEY_ALIAS=hirkani-key-alias
HIRKANI_UPLOAD_STORE_PASSWORD=YOUR_PASSWORD_HERE
HIRKANI_UPLOAD_KEY_PASSWORD=YOUR_PASSWORD_HERE
```

### 5. Set SDK Location
Create `mobile/android/local.properties`:

```properties
sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
```

---

## Build Commands

### Install Dependencies
```bash
cd mobile
npm install
```

### Debug Build (for testing)
```bash
cd android
./gradlew assembleDebug
# Output: android/app/build/outputs/apk/debug/app-debug.apk
```

### Production Release Build
```bash
cd android
./gradlew clean
./gradlew assembleProductionRelease
# Output: android/app/build/outputs/apk/production/release/app-production-release.apk
```

### App Bundle (for Play Store)
```bash
cd android
./gradlew bundleProductionRelease
# Output: android/app/build/outputs/bundle/productionRelease/app-production-release.aab
```

---

## Installing the APK

### On Physical Device
```bash
# Enable USB debugging on device
# Connect via USB
adb install -r android/app/build/outputs/apk/production/release/app-production-release.apk
```

### On Emulator
```bash
# Start emulator from Android Studio
# Or via command line:
emulator -avd YOUR_AVD_NAME

# Install APK
adb install -r path/to/app.apk
```

---

## Expected APK Size

- **Debug APK:** ~60-80 MB
- **Release APK:** ~30-50 MB (with ProGuard/R8)
- **App Bundle:** ~25-40 MB

---

## Optimizations Enabled

✅ **ProGuard/R8** - Code shrinking and obfuscation  
✅ **Resource Shrinking** - Remove unused resources  
✅ **Hermes Engine** - Faster startup, smaller bundle  
✅ **ABI Filters** - Support arm64-v8a, armeabi-v7a, x86_64  
✅ **Code Minification** - Optimized bytecode  

---

## Troubleshooting

### "SDK location not found"
Create `android/local.properties`:
```properties
sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
```

### "Keystore not found"
1. Generate keystore (see instructions above)
2. Update `gradle.properties` with correct paths/passwords

### "Build failed with OutOfMemoryError"
Edit `android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m
```

### Clean Build
```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

---

## Next Steps

1. ✅ Configuration files created
2. ⏳ Install Android Studio & SDK
3. ⏳ Generate signing keystore
4. ⏳ Configure gradle.properties with passwords
5. ⏳ Run build command
6. ⏳ Install and test APK
7. ⏳ Distribute or publish

---

## Full Documentation

See `ANDROID_APK_BUILD_GUIDE.md` for complete instructions including:
- Detailed environment setup
- CI/CD configuration
- Play Store submission
- Performance optimization
- Security best practices

---

**Status:** Configuration complete, ready to build!  
**Next:** Follow setup steps above, then run build command.
