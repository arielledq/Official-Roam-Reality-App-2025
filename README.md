# AR React Native Project Setup

## Prerequisites

- Node.js and Yarn installed
- Unity Editor
- Xcode (for iOS development)
- Android Studio (for Android development)

## Getting Started

### Initial Setup

1. Install dependencies:

```bash
yarn install
```

2. Fix dependencies:

```bash
yarn fix-deps
```

3. Start the development server:

```bash
yarn start
```

### iOS Additional Setup

#### iOS Add frameworks

1.  Go to `travel_ar_app425706 > Targets > travel_ar_app425706 > Build Phases > +`
2.  Add `New Copy Files PHase`
3.  Select the `MvnCorder, NativeScreenRecorder` folders inside the compiled iOS build from Unity.
4.  Move the added files into the `Frameworks`
5.  Go to `travel_ar_app425706 > Targets > travel_ar_app425706 > Build Settings > Search Path`
6.  Add the full path of the Framework folder from the built iOS Unity compilation on the `Debug` and `Release` fields

## Unity Configuration

### Opening the Project

1. Open the `ARReactNative` folder with Unity
2. Navigate to the `Scenes` folder in the Project tab
3. Open `ArReactNativeUnity.unity` scene

### Building for Android

1. In Unity, go to `File > Build Settings`
2. Follow the integration guide [here](https://medium.com/@selvaannies/integrating-unity-into-react-native-android-using-azesmway-react-native-unity-2905f47aa14d)

### Building for iOS

1. In Unity, go to `File > Build Settings`
2. Follow the integration steps from the [official documentation](https://github.com/azesmway/react-native-unity?tab=readme-ov-file#export-ios-unity-project)
3. Important: Add required descriptions for:
   - Microphone usage
   - Location usage in Player Settings

### iOS Additional Setup

1. In Xcode, configure the Marevo framework:
   - Navigate to `Unity-iPhone > Frameworks > Marevo`
   - Set the full path to the appropriate folder
2. Configure framework embedding:
   - Navigate to `Unity-iPhone > Targets > UnityFramework > General > Frameworks and Libraries`
   - Set the following frameworks to 'Embed & Sign':
     - `MvnCorder.framework`
     - `NativeScreenRecorder.framework`
3. Add a `Run script` with the following code:

```
   cd "${CONFIGURATION_BUILD_DIR}/${UNLOCALIZED_RESOURCES_FOLDER_PATH}/Frameworks/UnityFramework.framework/"
   if [[ -d "Frameworks" ]]; then
      rm -fr Frameworks
   fi
```

## Release Builds

### Android Release

#### Debug APK

```bash
yarn build-apk
```

#### Production AAB

1. Ensure the keystore file is present at `android/app/rooamar.keystore`
2. Configure Gradle variables for signing:
   - Follow the [React Native documentation](https://reactnative.dev/docs/signed-apk-android#setting-up-gradle-variables)
3. Build the AAB:

```bash
yarn build-aab
```

### iOS Release

Follow standard iOS release procedures through Xcode.

## Troubleshooting

If you encounter any issues during setup or building, please check the following:

- Ensure all dependencies are correctly installed
- Verify Unity version compatibility
- Check that all required frameworks are properly linked
- Confirm signing certificates are properly configured

## Contributing

Please follow the project's coding standards and submit PRs for any improvements.
