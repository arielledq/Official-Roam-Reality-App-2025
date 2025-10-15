/**
 * These are configuration settings for the production environment.
 *
 * Do not include API secrets in this file or anywhere in your JS.
 *
 * https://reactnative.dev/docs/security#storing-sensitive-info
 */
export default {
  APPLE_CLIENT_ID: "com.roam.reality.services",
  // BASE_URL: "https://travel-ar-app-42706-32103.azurewebsites.net/", // Production Azure
  // APPLE_REDIRECT_URL:
  //   "https://travel-ar-app-42706-32103.azurewebsites.net/accounts/apple/login/callback/", // Production Azure
  BASE_URL: "https://travel-ar-app-42706-staging.azurewebsites.net/", // Staging Azure
  // BASE_URL: "https://689d0cbed73f.ngrok-free.app/",
  APPLE_REDIRECT_URL:
    "https://travel-ar-app-42706-staging.azurewebsites.net/accounts/apple/login/callback/", // Staging Azure
  ONE_SIGNAL_APP_ID: "ceda5dd2-8fd2-4180-9532-7b7f127a612d",
  SENTRY_DSN: "https://8a0ac5dac07d4ed0b64bd75ab3c5a765@sentry.innovatica.com.py//58",
  GEOCODER_API_KEY: "AIzaSyCLsHGta-x3ABgEwr-D4XEdA92OyiSYoTU",
  FACEBOOK_APP_ID: "1735456000569385",
  DEV_EMAIL: "",
  DEV_PASSWORD: "",
};
