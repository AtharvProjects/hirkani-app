#!/bin/bash

##############################################################################
# HIRKANI Android APK Build Script
#
# This script automates the process of building a production-ready Android APK
# for the HIRKANI Pregnancy Food Intelligence app.
##############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="/Users/ashitosh/Downloads/hirkani-app-main"
MOBILE_DIR="$PROJECT_ROOT/mobile"
ANDROID_DIR="$MOBILE_DIR/android"
OUTPUT_DIR="$ANDROID_DIR/app/build/outputs/apk/production/release"

##############################################################################
# Helper Functions
##############################################################################

print_header() {
    echo -e "${BLUE}"
    echo "=============================================================================="
    echo "$1"
    echo "=============================================================================="
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

##############################################################################
# Check Prerequisites
##############################################################################

check_prerequisites() {
    print_header "Checking Prerequisites"

    local all_ok=true

    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js installed: $NODE_VERSION"
    else
        print_error "Node.js not found. Please install Node.js 18+"
        all_ok=false
    fi

    # Check Java
    if command -v java &> /dev/null; then
        JAVA_VERSION=$(java -version 2>&1 | head -n 1)
        print_success "Java installed: $JAVA_VERSION"
    else
        print_error "Java not found. Please install JDK 11+"
        all_ok=false
    fi

    # Check Android SDK
    if [ -z "$ANDROID_HOME" ]; then
        print_error "ANDROID_HOME not set. Please set environment variable."
        print_info "Example: export ANDROID_HOME=\$HOME/Library/Android/sdk"
        all_ok=false
    else
        print_success "ANDROID_HOME set: $ANDROID_HOME"
    fi

    # Check if Android SDK exists
    if [ -d "$ANDROID_HOME" ]; then
        print_success "Android SDK found"
    else
        print_error "Android SDK directory not found at: $ANDROID_HOME"
        all_ok=false
    fi

    # Check gradle wrapper
    if [ -f "$ANDROID_DIR/gradlew" ]; then
        print_success "Gradle wrapper found"
    else
        print_error "Gradle wrapper not found. Run: npx react-native init"
        all_ok=false
    fi

    if [ "$all_ok" = false ]; then
        print_error "Prerequisites check failed. Please install missing components."
        exit 1
    fi

    print_success "All prerequisites satisfied!"
    echo ""
}

##############################################################################
# Check Signing Configuration
##############################################################################

check_signing_config() {
    print_header "Checking Signing Configuration"

    GRADLE_PROPS="$ANDROID_DIR/gradle.properties"
    KEYSTORE_FILE="$ANDROID_DIR/app/hirkani-release.keystore"

    if [ ! -f "$GRADLE_PROPS" ]; then
        print_warning "gradle.properties not found"
        print_info "Creating template gradle.properties..."
        create_gradle_properties_template
    fi

    # Check if keystore exists
    if [ ! -f "$KEYSTORE_FILE" ]; then
        print_warning "Release keystore not found"
        print_info "You need to generate a signing keystore"
        echo ""
        echo "Run this command:"
        echo "cd $ANDROID_DIR/app"
        echo "keytool -genkeypair -v -storetype PKCS12 \\"
        echo "  -keystore hirkani-release.keystore \\"
        echo "  -alias hirkani-key-alias \\"
        echo "  -keyalg RSA -keysize 2048 -validity 10000"
        echo ""
        read -p "Generate keystore now? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            generate_keystore
        else
            print_warning "Skipping keystore generation. You'll need to create it manually."
        fi
    else
        print_success "Release keystore found"
    fi

    echo ""
}

create_gradle_properties_template() {
    cat > "$GRADLE_PROPS" <<EOL
# HIRKANI Android Build Configuration

# Signing Configuration (REQUIRED FOR RELEASE BUILD)
HIRKANI_UPLOAD_STORE_FILE=hirkani-release.keystore
HIRKANI_UPLOAD_KEY_ALIAS=hirkani-key-alias
HIRKANI_UPLOAD_STORE_PASSWORD=CHANGE_ME
HIRKANI_UPLOAD_KEY_PASSWORD=CHANGE_ME

# Gradle Optimization
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
org.gradle.parallel=true
org.gradle.configureondemand=true
org.gradle.daemon=true

# Android Configuration
android.useAndroidX=true
android.enableJetifier=true
android.enableR8.fullMode=true

# React Native
hermesEnabled=true
EOL

    print_success "Created gradle.properties template"
    print_warning "Please edit $GRADLE_PROPS and update passwords!"
}

generate_keystore() {
    cd "$ANDROID_DIR/app"

    print_info "Generating release keystore..."
    print_warning "Keep the passwords secure! You'll need them to sign future updates."
    echo ""

    keytool -genkeypair -v -storetype PKCS12 \
        -keystore hirkani-release.keystore \
        -alias hirkani-key-alias \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000

    if [ $? -eq 0 ]; then
        print_success "Keystore generated successfully!"
        print_warning "Remember to update gradle.properties with your keystore passwords"
    else
        print_error "Keystore generation failed"
        exit 1
    fi

    cd - > /dev/null
}

##############################################################################
# Install Dependencies
##############################################################################

install_dependencies() {
    print_header "Installing Dependencies"

    cd "$MOBILE_DIR"

    if [ -d "node_modules" ]; then
        print_info "node_modules exists. Skipping npm install."
        print_info "Run 'npm install' manually if you need to update dependencies."
    else
        print_info "Installing npm packages..."
        npm install

        if [ $? -eq 0 ]; then
            print_success "Dependencies installed"
        else
            print_error "Failed to install dependencies"
            exit 1
        fi
    fi

    cd - > /dev/null
    echo ""
}

##############################################################################
# Build APK
##############################################################################

build_apk() {
    print_header "Building Production APK"

    cd "$ANDROID_DIR"

    # Clean previous builds
    print_info "Cleaning previous builds..."
    ./gradlew clean

    # Build release APK
    print_info "Building production release APK..."
    print_warning "This may take 5-15 minutes depending on your system..."
    echo ""

    ./gradlew assembleProductionRelease

    BUILD_EXIT_CODE=$?

    cd - > /dev/null

    if [ $BUILD_EXIT_CODE -eq 0 ]; then
        print_success "Build completed successfully!"
        echo ""
        show_build_output
    else
        print_error "Build failed with exit code $BUILD_EXIT_CODE"
        print_info "Check the error messages above for details"
        exit 1
    fi
}

##############################################################################
# Show Build Output
##############################################################################

show_build_output() {
    print_header "Build Output"

    APK_FILE="$OUTPUT_DIR/app-production-release.apk"

    if [ -f "$APK_FILE" ]; then
        FILE_SIZE=$(du -h "$APK_FILE" | cut -f1)

        print_success "APK created successfully!"
        echo ""
        echo "📱 APK Location:"
        echo "   $APK_FILE"
        echo ""
        echo "📊 APK Size: $FILE_SIZE"
        echo ""

        # Show APK info
        if command -v aapt &> /dev/null; then
            print_info "APK Information:"
            aapt dump badging "$APK_FILE" | grep -E "package:|version|sdkVersion" | head -5
            echo ""
        fi

        print_info "Installation Instructions:"
        echo "   adb install -r \"$APK_FILE\""
        echo ""

    else
        print_error "APK file not found at expected location"
        print_info "Check: $OUTPUT_DIR"
    fi
}

##############################################################################
# Main Build Process
##############################################################################

main() {
    clear

    print_header "HIRKANI Android APK Build"
    echo "Building production-ready APK for HIRKANI Pregnancy Food Intelligence"
    echo ""

    # Check if we're in the right directory
    if [ ! -d "$PROJECT_ROOT" ]; then
        print_error "Project directory not found: $PROJECT_ROOT"
        exit 1
    fi

    # Run build steps
    check_prerequisites
    check_signing_config
    install_dependencies
    build_apk

    print_header "Build Complete! 🎉"
    print_success "Your production APK is ready for distribution"
    echo ""
    print_info "Next steps:"
    echo "   1. Test the APK on a physical device"
    echo "   2. Verify all features work correctly"
    echo "   3. Distribute via Play Store or direct download"
    echo ""
}

##############################################################################
# Run Main
##############################################################################

# Check for help flag
if [[ "$1" == "-h" ]] || [[ "$1" == "--help" ]]; then
    echo "HIRKANI Android APK Build Script"
    echo ""
    echo "Usage: ./build-android.sh [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  --clean        Clean build (removes node_modules and build folders)"
    echo "  --debug        Build debug APK instead of release"
    echo ""
    echo "Prerequisites:"
    echo "  - Node.js 18+"
    echo "  - Java JDK 11+"
    echo "  - Android SDK"
    echo "  - ANDROID_HOME environment variable set"
    echo ""
    exit 0
fi

# Handle clean flag
if [[ "$1" == "--clean" ]]; then
    print_warning "Cleaning build directories..."
    rm -rf "$MOBILE_DIR/node_modules"
    rm -rf "$ANDROID_DIR/build"
    rm -rf "$ANDROID_DIR/app/build"
    print_success "Clean complete"
    echo ""
fi

# Run main build
main
