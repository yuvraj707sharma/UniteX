#!/bin/bash
# =====================================================
# UniteX Production Build Script
# =====================================================
# This script builds an optimized production APK
# Usage: ./build-production.sh
# =====================================================

set -e # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Start build
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║           UniteX Production Build                         ║"
echo "║           Optimized for Performance                       ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Step 1: Clean previous builds
print_status "Step 1/6: Cleaning previous builds..."
npm run clean:all > /dev/null 2>&1 || true
rm -rf android/build android/app/build > /dev/null 2>&1 || true
print_success "Clean complete"

# Step 2: Install dependencies
print_status "Step 2/6: Installing dependencies..."
if [ ! -d "node_modules" ]; then
    npm ci
else
    print_warning "node_modules exists, skipping npm install. Run with --clean to force reinstall."
fi
print_success "Dependencies ready"

# Step 3: Build web app
print_status "Step 3/6: Building optimized React app..."
npm run build:prod
if [ $? -ne 0 ]; then
    print_error "React build failed"
    exit 1
fi
print_success "React build complete"

# Step 4: Sync with Capacitor
print_status "Step 4/6: Syncing with Capacitor..."
npx cap sync android
if [ $? -ne 0 ]; then
    print_error "Capacitor sync failed"
    exit 1
fi
print_success "Capacitor sync complete"

# Step 5: Build Android APK
print_status "Step 5/6: Building Android release APK..."
cd android
./gradlew clean
./gradlew assembleRelease --no-daemon --parallel --build-cache
if [ $? -ne 0 ]; then
    print_error "Android build failed"
    cd ..
    exit 1
fi
cd ..
print_success "Android build complete"

# Step 6: Report results
print_status "Step 6/6: Generating build report..."
APK_PATH="android/app/build/outputs/apk/release/app-release-unsigned.apk"

if [ -f "$APK_PATH" ]; then
    APK_SIZE=$(ls -lh "$APK_PATH" | awk '{print $5}')
    echo ""
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                  BUILD SUCCESSFUL                         ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo ""
    print_success "APK Location: $APK_PATH"
    print_success "APK Size: $APK_SIZE"
    echo ""
    echo "Next steps:"
    echo "  1. Sign the APK (see documentation)"
    echo "  2. Test on physical device"
    echo "  3. Upload to Play Store or distribute"
    echo ""
else
    print_error "APK not found at expected location"
    exit 1
fi

print_success "Build process completed successfully!"
