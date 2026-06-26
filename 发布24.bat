@echo off
cd /d "%~dp0"
echo Copying APK...
copy /Y "android\app\build\outputs\apk\release\app-release.apk" "releases\kaoyan-buddy.apk"
copy /Y "android\app\build\outputs\apk\release\app-release.apk" "C:\Users\LENOVO\Desktop\考研搭子.apk"
echo Pushing to GitHub...
git add .
git commit -m "build 24: fix docx import on phone"
git push
echo Done!
pause
