#!/bin/bash

# HIRKANI Android APK Build Script
# This script builds the Android APK for the Hirkani mobile app

echo "=========================================="
echo "HIRKANI Android APK Build Script"
echo "=========================================="
echo ""

# Navigate to mobile directory
cd "$(dirname "$0")/mobile"

echo "Current directory: $(pwd)"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules not found. Installing dependencies..."
    npm install
    echo ""
fi

# Check if android/gradlew exists
if [ ! -f "android/gradlew" ]; then
    echo "❌ Error: android/gradlew not found!"
    exit 1
fi

# Make gradlew executable
chmod +x android/gradlew

echo "Select build type:"
echo "1) Debug APK (fast, for testing)"
echo "2) Production Release APK (optimized, requires signing)"
echo "3) Staging Release APK (staging environment)"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🔨 Building DEBUG APK..."
        echo ""
        cd android
        ./gradlew assembleProductionDebug
        echo ""
        echo "✅ Debug APK built successfully!"
        echo "📦 Location: mobile/android/app/build/outputs/apk/production/debug/app-production-debug.apk"
        ;;
    2)
        echo ""
        echo "🔨 Building PRODUCTION RELEASE APK..."
        echo ""
        cd android
        ./gradlew clean
        ./gradlew assembleProductionRelease
        echo ""
        echo "✅ Production Release APK built successfully!"
        echo "📦 Location: mobile/android/app/build/outputs/apk/production/release/app-production-release.apk"
        ;;
    3)
        echo ""
        echo "🔨 Building STAGING RELEASE APK..."
        echo ""
        cd android
        ./gradlew clean
        ./gradlew assembleStagingRelease
        echo ""
        echo "✅ Staging Release APK built successfully!"
        echo "📦 Location: mobile/android/app/build/outputs/apk/staging/release/app-staging-release.apk"
        ;;
    *)
        echo "❌ Invalid choice!"
        exit 1
        ;;
esac

echo ""
echo "=========================================="
echo "Build Complete!"
echo "=========================================="
