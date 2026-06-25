#!/bin/bash
set -e

echo "📦 Building 考研搭子 APK..."
echo "================================"

# 1. Increment version
VERSION=$(node -e "const p=require('./package.json'); console.log(p.version)")
NEW_CODE=$(( $(node -e "const p=require('./package.json'); console.log(p.versionCode||1)") + 1 ))
node -e "
const p=require('./package.json');
p.versionCode=$NEW_CODE;
fs.writeFileSync('package.json', JSON.stringify(p,null,2)+'\n');
" 2>/dev/null
echo "Version: $VERSION (build $NEW_CODE)"

# 2. Build static export
echo "🔨 Building web app..."
npx next build

# 3. Sync to Capacitor
echo "📱 Syncing to Android..."
npx cap sync android

# 4. Build APK
echo "🤖 Building APK..."
export JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-21.0.11.10-hotspot"
export ANDROID_HOME="/c/Users/LENOVO/AppData/Local/Android/Sdk"
cd android
./gradlew assembleRelease 2>&1 | tail -3
cd ..

# 5. Sign APK
echo "✍️ Signing APK..."
"/c/Program Files/Eclipse Adoptium/jdk-21.0.11.10-hotspot/bin/java" -jar \
  "/c/Users/LENOVO/AppData/Local/Android/Sdk/build-tools/36.1.0/lib/apksigner.jar" sign \
  --ks kaoyan-buddy.keystore --ks-pass pass:kaoyan123 --key-pass pass:kaoyan123 \
  --out android/app/build/outputs/apk/release/app-release.apk \
  android/app/build/outputs/apk/release/app-release-unsigned.apk

# 6. Copy to public/updates for OTA
mkdir -p public/updates
cp android/app/build/outputs/apk/release/app-release.apk public/updates/kaoyan-buddy.apk
cp android/app/build/outputs/apk/release/app-release.apk "C:/Users/LENOVO/Desktop/考研搭子.apk"

# 7. Done
SIZE=$(ls -lh android/app/build/outputs/apk/release/app-release.apk | awk '{print $5}')
echo ""
echo "✅ APK 构建完成！"
echo "  📱 桌面: C:/Users/LENOVO/Desktop/考研搭子.apk ($SIZE)"
echo "  🔄 OTA: public/updates/kaoyan-buddy.apk"
echo "  📊 版本: $VERSION (build $NEW_CODE)"
echo ""
echo "下次发新版，只需运行:"
echo "  1. 改代码"
echo "  2. bash build-apk.sh"
echo "  3. 用户打开 App → 设置 → 检查更新 → 下载安装"
