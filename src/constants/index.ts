export const CHALLENGES_TYPE = {
  PHOTO_VIDEO: "PHOTO_VIDEO",
  PHOTO_VIDEO_TITLE: "AR Challenge",
  PIN_CHECK_IN: "PIN_CHECK_IN",
  PIN_CHECK_IN_TITLE: "Location Check In Challenge",
  STAR: "STAR",
  STAR_TITLE: "AR Star",
};

export const CAPTURE_CHALLENGE_TYPE = {
  PHOTOVIDEO: "PHOTOVIDEO",
  VIDEO: "VIDEO",
  PHOTO: "PHOTO",
};

export type SSNN_TYPE = "INSTAGRAM" | "FACEBOOK" | "OTHERS";

export const SSNN: {
  INSTAGRAM: SSNN_TYPE;
  FACEBOOK: SSNN_TYPE;
  OTHERS: SSNN_TYPE;
} = {
  INSTAGRAM: "INSTAGRAM",
  FACEBOOK: "FACEBOOK",
  OTHERS: "OTHERS",
};

export const EXPERIENCE_TYPE_CHOICES = {
  AR_CHALLENGE: "AR_CHALLENGE",
  GEO_AR_CHALLENGE: "GEO_AR_CHALLENGE",
  EVENT: "EVENT",
  BAND: "BAND",
};

export const MAP_MODE = {
  DRIVING: "DRIVING",
  WALKING: "WALKING",
};

export const CAMERA_NOTIFICATION = {
  PHOTO: "Tap the button once to take a photo.",
  VIDEO: "Press and hold the button to record. Release to stop recording.",
  PHOTOVIDEO: "Tap once to take a photo. Press and hold to record a video.",
};

export const PIN_CHALLENGE_CONFIG = {
  CUSTOM_INSTRUCTIONS: "Users cannot take pictures unless you are within range of the AR ",
};

export const AR_TIPS_AUTO_SLIDE_SECONDS = 60 * 10;
export const AR_TIPS_AUTO_SLIDE_PAUSE_SECONDS = 10;

type USER_TYPE = 1 | 2;

export const USER_TYPES: {
  PLAYER: USER_TYPE;
  BAND: USER_TYPE;
} = {
  PLAYER: 1,
  BAND: 2,
};

export const ENABLED_LOCATION_TEXT = "Location sharing is ON. Users can see your band's location.";
export const DISABLED_LOCATION_TEXT =
  "Location sharing is OFF. Your location is not being broadcast.";

export const SHARE_CONDITIONS_TEXT =
  "Must share to at least one social media platform and tag @roamreality as well as the brand sponsor to earn your points. Users earn one additional point per social platform.";

export const GIFT_POINTS = 25;
export const USERS_LIMIT = 25;

export const PUBLIC_APP_STORE_URL = "https://apps.apple.com/py/app/roam-reality/id6477857812";
