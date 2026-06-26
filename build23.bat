@echo off
cd /d "%~dp0"
set JH=C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot\bin\java
set SDKS=C:\Users\LENOVO\AppData\Local\Android\Sdk\build-tools\36.1.0\lib\apksigner.jar
set UNSIGNED=android\app\build\outputs\apk\release\app-release-unsigned.apk
set SIGNED=android\app\build\outputs\apk\release\app-release.apk
echo Signing...
"%JH%" -jar "%SDKS%" sign --ks kaoyan-buddy.keystore --ks-pass pass:kaoyan123 --key-pass pass:kaoyan123 --out "%SIGNED%" "%UNSIGNED%"
echo Copying...
copy /Y "%SIGNED%" releases\kaoyan-buddy.apk
copy /Y "%SIGNED%" "C:\Users\LENOVO\Desktop\考研搭子.apk"
echo Pushing...
git add .
git commit -m "build 23: fix APK install flow"
git push
echo Done!
pause
