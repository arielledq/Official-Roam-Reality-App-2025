react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res && wait;
cd android && ./gradlew assembleDebug && wait;
cp app/build/outputs/apk/debug/app-debug.apk ../travel_ar_app_42706.apk && wait;
