#!/bin/bash
# Remove dependencies folders
rm -rf node_modules yarn.lock ios/Pods ios/Podfile.lock ios/build ios/DerivedData
rm -rf .expo
rm -rf .turbo
rm -rf .parcel-cache
rm -rf .jest
rm -rf .vscode/.react

# Remove Xcode folders
rm -rf ./ios/travel_ar_app_42706.xcodeproj/xcuserdata ./ios/travel_ar_app_42706.xcworkspace/xcuserdata
cd ios && xcodebuild -workspace travel_ar_app_42706.xcworkspace -scheme travel_ar_app_42706 -configuration Debug clean
pod cache clean --all
pod deintegrate
cd ..

# Remove Xcode DerivedData
rm -rf ~/Library/Developer/Xcode/DerivedData

# Remove Android folders
cd android
rm -rf ./android/app/build
rm -rf ./android/build
rm -rf .gradle
cd ..
