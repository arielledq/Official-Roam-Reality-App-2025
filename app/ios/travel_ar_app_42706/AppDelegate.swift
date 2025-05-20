import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

// INFO: react-native-fbsdk-next setup
import FBSDKCoreKit

// INFO: @react-native-google-signin/google-signin setup
import GoogleSignIn

// INFO: react-native-maps setup
import GoogleMaps

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // INFO: react-native-maps setup
    GMSServices.provideAPIKey("AIzaSyAd_EZRrfSjO2OS6p-h89wrT3y8xyREpTA")

    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "travel_ar_app_42706",
      in: window,
      launchOptions: launchOptions
    )

    // INFO: react-native-fbsdk-next setup
    ApplicationDelegate.shared.application(
        application,
        didFinishLaunchingWithOptions: launchOptions
    )

    return true
  }

  func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
      // Facebook handler
      if ApplicationDelegate.shared.application(
          app,
          open: url,
          sourceApplication: options[.sourceApplication] as? String,
          annotation: options[.annotation]
      ) {
          return true
      }

      if GIDSignIn.sharedInstance.handle(url) {
          return true
      }

      if RCTLinkingManager.application(app, open: url, options: options) {
          return true
      }

      return false
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
    #if DEBUG
        RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
    #else
        Bundle.main.url(forResource: "main", withExtension: "jsbundle")
    #endif
  }
}
