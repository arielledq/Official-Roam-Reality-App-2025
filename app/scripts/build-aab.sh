# Steps to fix duplicate resources
# node ./scripts/android-release-fix.js && wait; 
# rm -rf ./android/app/src/main/res/drawable-* && wait; 

# Bundle AAB file
cd android && ./gradlew bundleRelease && wait;
cp ./app/build/outputs/bundle/release/app-release.aab ../roam_reality.aab && wait;
cd ..