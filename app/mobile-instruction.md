# React Native Project Setup

## Prerequisites

- Node.js and Yarn installed
- Unity Hub
- Xcode (for iOS development)
- Android Studio (for Android development)

## Getting Started

### Initial Setup

> **Note:** All commands should be run from the `app` folder. Navigate to the app directory from the root project directory:
>
> ```bash
> cd app
> ```

1. **Install dependencies:**

```bash
yarn install
```

2. **Fix dependencies:**

```bash
yarn fix-deps
```

3. **Start the development server:**

```bash
yarn start
```

## Additional Instructions

### Platform-Specific Branch Setup

The project requires different configurations for **Android** and **iOS** development due to platform-specific dependencies.

#### For iOS Development:

- Keep your current branch and continue development as usual.

#### For Android Development:

1. **Pull all changes** from your current branch to the `patch-android` branch.

2. **Switch to the `patch-android` branch:**

   ```bash
   git checkout patch-android
   ```

3. **Update the branch name** in `package.json` to ensure proper linking.

4. **Clean and reinstall dependencies:**

   ```bash
   # Remove node_modules
   rm -rf node_modules

   # Remove package-lock.json (if it exists)
   rm -f package-lock.json

   # Install packages again
   yarn install
   ```

5. **Clean Gradle files:**

   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

6. **Push your changes** to the `patch-android` branch:
   ```bash
   git push origin patch-android
   ```

> **Why the branch separation is necessary:**  
> Android requires Google Maps version `1.20.1` while iOS requires version `1.24.3`. Due to this version incompatibility, separate branches are maintained for each platform.
>
> You can check out the scripts in the `package.json` file for more details on the configuration.

## Unity Configuration

### Initial Unity Setup

1. **Open Unity Project:**

   - Open Unity Hub
   - Open your Unity project from Unity Hub to Unity Editor

2. **Link Project to Unity Cloud:**
   - In Unity Editor, go to `Edit > Project Settings`
   - Navigate to the `Services` tab
   - Set up your Unity project to link with Unity Cloud

### Building for iOS

1. **Create build directory structure:**

   ```bash
   # From the app directory
   unity/build/ios
   ```

2. **Export Unity Project:**

   - In Unity Editor, go to `File > Build Settings`
   - Configure your build settings for iOS
   - **Important:** Export the Unity project to your Desktop first (do NOT export directly to the `unity/build/ios` folder)
   - After the export is complete follow the bellow link

3. **Follow the integration guide:**
   - Complete the iOS integration by following the official documentation: [React Native Unity - iOS Export Guide](https://github.com/azesmway/react-native-unity?tab=readme-ov-file#export-ios-unity-project)

Before you run the unity ios project plesee follow this as well

### iOS Additional Setup

1. In Xcode, configure the Marevo framework:
   - Navigate to `Unity-iPhone > Frameworks > Marevo`
   - Set the full path to the appropriate folder
2. Configure framework embedding:
   - Navigate to `Unity-iPhone > Targets > UnityFramework > General > Frameworks and Libraries`
   - Set the following frameworks to 'Embed & Sign':
     - `MvnCorder.framework`
     - `NativeScreenRecorder.framework`

### Building for Android

1. **Create build directory structure:**

   ```bash
   # From the app directory
   unitybuild/android
   ```

2. **Set up Android Unity project:**
   - Follow the comprehensive integration guide: [Integrating Unity into React Native Android](https://medium.com/@selvaannies/integrating-unity-into-react-native-android-using-azesmway-react-native-unity-2905f47aa14d)
   - This guide will walk you through the complete setup process for Android

### Androd Additional Setup

1.  Go to unity/build/android/unityLibrary/build.gradle:

- Change this file to
  implementation fileTree(dir: 'libs', include: ['*.jar'])
  implementation(name: 'MvnCorder', ext:'aar')
  implementation(name: 'arcore_client', ext:'aar')
  implementation(name: 'ARPresto', ext:'aar')
  implementation(name: 'unityandroidpermissions', ext:'aar')
  implementation(name: 'UnityARCore', ext:'aar')
  implementation project(':unityLibrary:xrmanifest.androidlib')
- To this
  implementation fileTree(dir: 'libs', include: ['*.jar'])
  <!-- implementation(name: 'MvnCorder', ext:'aar')
  implementation(name: 'arcore_client', ext:'aar')
  implementation(name: 'ARPresto', ext:'aar')
  implementation(name: 'unityandroidpermissions', ext:'aar')
  implementation(name: 'UnityARCore', ext:'aar') -->
  implementation project(':unityLibrary:xrmanifest.androidlib')

2.  To go android/app/local.properties create it if not exist
    and paste ths
    sdk.dir=/Users/abdulbasit/Library/Android/sdk

### Patching the Unity Library

After cleaning Gradle and before running the project on Android, you need to patch the Unity library:

1. **Navigate to the UPlayer.java file:**

   ```
   node_modules/@azesmway/react-native-unity/android/src/main/java/com/azesmway/rn/unity/view/UPlayer.java
   ```

2. **Locate line 100** and replace the existing code with the following:

   ```
   if (FrameLayout.class.isInstance(unityPlayer)) {
              return FrameLayout.class.cast(unityPlayer);
          } else {
              return null;
          }

   ```

> **Note:** This patch is necessary after each Gradle clean to ensure proper Unity integration with React Native on Android.

Things you need to make sure before run the ios project

#### iOS Add frameworks

1.  1️⃣ - Go to `travel_ar_app425706 > Targets > travel_ar_app425706 > Build Phases > +`.
2.  1️⃣ - Add `New Copy Files Phase`.
3.  1️⃣ - Select `Add Other...` and then the `MvnCorder, NativeScreenRecorder` folders inside the compiled iOS build from Unity.
4.  ⚠️ - Make sure that these folders are moved outside of the `ios` folder from the `unity/builds` folder, e.g. `unity/builds/Frameworks/MvnCorder` and `unity/builds/Frameworks/NativeScreenRecorder`. The empty `Frameworks` folder from the `ios` folder should be kept.
5.  1️⃣ - Choose the `Frameworks` option.
6.  1️⃣ - Move the added files into the `Frameworks`.
7.  1️⃣ - Add a `Run script` with the following code:

```
   cd "${CONFIGURATION_BUILD_DIR}/${UNLOCALIZED_RESOURCES_FOLDER_PATH}/Frameworks/UnityFramework.framework/"
   if [[ -d "Frameworks" ]]; then
      rm -fr Frameworks
   fi
```

8.  1️⃣ - Go to `travel_ar_app425706 > Targets > travel_ar_app425706 > Build Settings > Search Path`.
9.  1️⃣ - Add the full path of the Framework folder from the built iOS Unity compilation on the `Debug` and `Release` fields.

### iOS Release

Follow standard iOS release procedures through Xcode.

- Open the bundle from the `Organizer` in Xcode
- `Show the content` of the bundle and navigate to `Products > Applications > travel_ar_app_42706`
- `Show the content` again and navigate to `Frameworks > UnityFramework.framework > Frameworks`
- Delete the `Frameworks` folder.
- Upload the bundle to the App Store
