@echo off
cd /d "%~dp0"
echo === 1. Signing APK ===
"C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot\bin\java" -jar "C:\Users\LENOVO\AppData\Local\Android\Sdk\build-tools\36.1.0\lib\apksigner.jar" sign --ks kaoyan-buddy.keystore --ks-pass pass:kaoyan123 --key-pass pass:kaoyan123 --out android\app\build\outputs\apk\release\app-release.apk android\app\build\outputs\apk\release\app-release-unsigned.apk
echo === 2. Copying APK ===
copy /Y android\app\build\outputs\apk\release\app-release.apk releases\kaoyan-buddy.apk
copy /Y android\app\build\outputs\apk\release\app-release.apk "C:\Users\LENOVO\Desktop\考研搭子.apk"
echo === 3. Pushing to GitHub ===
git add .
git commit -m "build 20: fix OTA"
git push
echo === Done ===
pause
