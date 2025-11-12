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

export const MODES = {
  AR: "ar",
  SCAN: "scan",
  HUNT: "hunt",
  CHECKIN: "checkin",
} as const;

export type ModeType = (typeof MODES)[keyof typeof MODES];

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

export const ELEMENTSUNITY = [
  "position",
  "ArMode",
  "screen",
  "loading",
  "timer",
  "Back",
  "points",
  "Stars",
  "Details",
  "CompassArrow",
  "Distancia",
  "Arrow",
];

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

export const SCOREBOARD_TYPE = {
  DESTINATION: "DESTINATION",
  SPONSOR: "SPONSOR",
};

export const AR_MODES = {
  GEO_TAG_MODE: "geo_tag_mode",
  HUNT_MODE: "hunt_mode",
  SCAN_MODE: "scan_mode",
};

export const AR_MODES_MENU = [
  {
    id: 1,
    label: "Geo-Tag",
    name: "Geo-Tag",
    listLabel: "Geo-Tags",
    mode: AR_MODES.GEO_TAG_MODE,
    modeSubTitle1: "The Geo Tag is anchored in front of you, size and position fully customisable",
    modeSubTitle2: "Snap a creative photo/video with the Geo-Tag",
    icon: "pinlocation",
  },
  {
    id: 3,
    label: "Scan",
    name: "Scan",
    listLabel: "Hidden Gems",
    mode: AR_MODES.SCAN_MODE,
    modeSubTitle1: "Users can scan their environment or QR Code to trigger the AR.",
    modeSubTitle2: "Snap a photo/video with the AR",
    icon: "scan",
  },
  {
    id: 2,
    label: "Hunt",
    name: "Hunt",
    listLabel: "Hunts",
    mode: AR_MODES.HUNT_MODE,
    modeSubTitle1: "Users are to follow the arrows to find hidden gems",
    modeSubTitle2: "TAP the AR to Capture",
    icon: "huntMode",
  },
];

export type ARModeMenuType = (typeof AR_MODES_MENU)[keyof typeof AR_MODES_MENU];

export const TEST_HUNT_CHALLENGE = {
  id: 102,
  geo_ar_star: {
    id: 300,
    name: "Parawhyyy",
    fun_facts: "<p>un parawhyy</p>",
    info: "<p>un parawhyy</p>",
    visibility_radius: 10,
    geo_site: {
      id: 772,
      name: "TRIBE UNITE AR PIN",
      image:
        "https://travel-ar-app-42706.s3.amazonaws.com/media/geoar/img/Screenshot_2025-02-01_at_4.20.09_PM.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4KGTUZ6KCVNP3RMO%2F20250715%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20250715T170457Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=71b32d8fa727dc0002d2b4c57010579949cfac568cf7df1be9f1c18126591b92",
      created_at: "2025-02-01T20:29:34.564198Z",
      updated_at: "2025-06-12T19:53:15.184061Z",
      geo_location: 142,
      pin_challenge: {
        id: 202,
        image:
          "https://travel-ar-app-42706.s3.amazonaws.com/media/ar/img/352372481_673412104832421_5523699236616023318_n_Skw23Xi.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4KGTUZ6KCVNP3RMO%2F20250715%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20250715T170457Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=cbd0551947fcf2358024f829f67d81855e4bc0c98f0589f2daffc24e4a516977",
        model_file:
          "https://travel-ar-app-42706.s3.amazonaws.com/media/ar/model/TribePinFinal_8o87Thq.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4KGTUZ6KCVNP3RMO%2F20250715%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20250715T170457Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=726de21a47ea9b1b03c96880c1b1dbc3802a8c6bae40613b5bf09379c270fc9e",
        name: "TRIBE Pin",
        description:
          "<h3><strong>📍 Geo Check-In with Tribe!</strong></h3>\r\n\r\n<p>Capture your party shots with TRIBE&#39;s Geo Check-In Experience&nbsp;for in-app points, climb the scoreboard for a chance to WIN weekly ticket giveways!&nbsp;</p>\r\n\r\n<h3><strong>How to Play</strong></h3>\r\n\r\n<p>✅ <strong>Unlock the Tribe AR Pin</strong> &ndash; It appears when you&#39;re at select events nationwide.&nbsp;<br />\r\n✅ <strong>Customize Your Shot</strong> &ndash; Resize and position the pin for the perfect frame.<br />\r\n✅ <strong>Snap Your Photo</strong> &ndash; Stand in frame with the AR Pin. (Only works while you are at the event)<br />\r\n✅ <strong>Share to Earn Points</strong> &ndash; Use the app&rsquo;s share buttons to post on social media.&nbsp;</p>\r\n\r\n<h3><strong>Scoring</strong></h3>\r\n\r\n<p>🎟️ 3 points for participation<br />\r\n➕ +1 point per extra platform (IG, FB, TikTok)<br />\r\n⛔ No share, NO Points&nbsp;</p>\r\n\r\n<h3><strong>Check-In Limits</strong></h3>\r\n\r\n<p>📍 Max 10 check-ins per 24 hours.</p>\r\n\r\n<p><strong>Have you Geo Checked-In as yet?</strong></p>",
        points: 3,
        challenge_choice: "3DMODEL",
        challenge_requirement: "PHOTO",
        created_at: "2025-01-30T17:01:09.531069Z",
        expiry_date: "2026-07-31T17:01:04Z",
        sponsored: {
          id: 13,
          name: "TRIBE",
          image:
            "https://travel-ar-app-42706.s3.amazonaws.com/media/sponsor/img/352372481_673412104832421_5523699236616023318_n.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4KGTUZ6KCVNP3RMO%2F20250715%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20250715T170457Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=fd3fee1710b9eff99e972386e0c7c28d7785860899a6ebe1179cbafef7d6e84a",
          description: "",
          tags: "@carnivaltribe, @roamreality, #carnivaltribe #roamreality",
          created_at: "2024-12-20T01:51:31.276587Z",
        },
        parameters: {
          id: 206,
          name: "Tribe Pin",
          bloom_threshold: "0.90",
          bloom_intensity: "3.00",
          positionX: "0.000",
          positionY: "0.000",
          positionZ: "0.900",
          scale_object: "1.00000",
          emission_value: "1.00",
          rotation_speed: "0.50",
          scale_speed: "0.0015",
          min_pinch_scale: "0.5000",
          max_pinch_scale: "3.000",
          isRotationEnabled: true,
          loop_animations: false,
          loop_delay: 1000,
          diffuse_text_color: "#ffffff",
          diffuse_intensity: "1.00",
          sound_play_and_pause: false,
          image_opacity: false,
          image_opacity_value: "1.00",
          tracking_and_anchors: false,
          ar_portals: false,
          image_recognition: false,
          image_recognition_file: null,
        },
        info: "<h3><strong>📍 Geo Check-In with Tribe!</strong></h3>\r\n\r\n<p>Capture your party shots with TRIBE&#39;s Geo Check-In Experience&nbsp;for in-app points, climb the scoreboard for a chance to WIN weekly ticket giveways!&nbsp;</p>\r\n\r\n<h3><strong>How to Play</strong></h3>\r\n\r\n<p>✅ <strong>Unlock the Tribe AR Pin</strong> &ndash; It appears when you&#39;re at select events nationwide.&nbsp;<br />\r\n✅ <strong>Customize Your Shot</strong> &ndash; Resize and position the pin for the perfect frame.<br />\r\n✅ <strong>Snap Your Photo</strong> &ndash; Stand in frame with the AR Pin. (Only works while you are at the event)<br />\r\n✅ <strong>Share to Earn Points</strong> &ndash; Use the app&rsquo;s share buttons to post on social media.&nbsp;</p>\r\n\r\n<h3><strong>Scoring</strong></h3>\r\n\r\n<p>🎟️ 3 points for participation<br />\r\n➕ +1 point per extra platform (IG, FB, TikTok)<br />\r\n⛔ No share, NO Points&nbsp;</p>\r\n\r\n<h3><strong>Check-In Limits</strong></h3>\r\n\r\n<p>📍 Max 10 check-ins per 24 hours.</p>\r\n\r\n<p><strong>Have you Geo Checked-In as yet?</strong></p>",
        color: "#f86604",
      },
      address_text: "📍Hasely Crawford Stadium - Training Field",
      lat_long: {
        type: "Point",
        coordinates: [-57.589505910873385, -25.29671858919541],
      },
      geo_site_border: {
        type: "MultiLineString",
        coordinates: [
          [
            [-57.59174823760985, -25.297087189244408],
            [-57.590246200561516, -25.293304135468663],
            [-57.58443117141721, -25.295670982937093],
            [-57.5869846343994, -25.29904657069071],
            [-57.591812610626214, -25.297048389292033],
          ],
        ],
      },
      description:
        '<h3><span style="color:#ffffff">Two crews, ONE mission. TRIBE x SCORCH</span></h3>\r\n\r\n<h3><span style="color:#ffffff">Choose the way you UNITE!</span> 🤩</h3>\r\n\r\n<p>On Carnival Thursday, we UNITE as ONE! 🔥TRIBE X SCORCH🔥</p>\r\n\r\n<p>📅 When:&nbsp;Carnival Thursday, February 27th, 2025 @&nbsp;&nbsp;9:00pm-4:00am</p>\r\n\r\n<p>🎟️ Tickets:&nbsp;https://islandetickets.com/event/UNITE&nbsp;<a href="https://islandetickets.com/event/UNITE ">Island E-Tickets - UNITE</a></p>\r\n\r\n<p>📱 Tribe IG:&nbsp;<a href="https://www.instagram.com/p/DFLUfjoOrsQ/?img_index=1">Unite Post</a></p>',
      info: '<h3><span style="color:#ffffff">Two crews, ONE mission. TRIBE x SCORCH</span></h3>\r\n\r\n<h3><span style="color:#ffffff">Choose the way you UNITE!</span> 🤩</h3>\r\n\r\n<p>- Bring your own cooler 🧊<br />\r\n- ⁠Pre-Stocked cooler package🍻<br />\r\n- Cart with your crew 👯&zwj;♂️👯&zwj;♂️<br />\r\n- Premium Drinks Inclusive Section 🍹<br />\r\n- VIP cabana ⭐️</p>\r\n\r\n<p>On Carnival Thursday, we UNITE as ONE! 🔥TRIBE X SCORCH🔥</p>\r\n\r\n<p>📅 When:&nbsp;Carnival Thursday, February 27th, 2025 @&nbsp;&nbsp;9:00pm-4:00am</p>\r\n\r\n<p>📍Location: Hasely Crawford Stadium - Training Field</p>\r\n\r\n<p>🎟️ Tickets:&nbsp;https://islandetickets.com/event/UNITE&nbsp;<a href="https://islandetickets.com/event/UNITE ">Island E-Tickets - UNITE</a></p>\r\n\r\n<p>📱 Tribe IG:&nbsp;<a href="https://www.instagram.com/p/DFLUfjoOrsQ/?img_index=1">Unite Post</a></p>',
      pro_tips:
        '<p>📍<strong>Location:</strong> Hasely Crawford Stadium - Training Field</p>\r\n\r\n<p>📅 <strong>Date:</strong>&nbsp;Carnival Thursday, February 27th, 2025</p>\r\n\r\n<p>⏰ <strong>Time:</strong>&nbsp;9:00pm-4:00am</p>\r\n\r\n<p><strong>📱 Tribe IG</strong>:&nbsp;<a href="https://www.instagram.com/p/DFLUfjoOrsQ/?img_index=1">Unite Post</a></p>\r\n\r\n<p><strong>🎟️ Tickets:&nbsp;</strong>https://islandetickets.com/event/UNITE&nbsp;<a href="https://islandetickets.com/event/UNITE ">Island E-Tickets - UNITE</a></p>\r\n\r\n<p><strong>🎟️ Price:</strong> Early Bird Cooler Special $400TT&nbsp;</p>\r\n\r\n<p>🍷 Premium Drinks Inclusive: $800TT</p>',
      check_ins: 10,
      check_in_site_radius: 1000,
      category: {
        id: 169,
        name: "The Lost Tribe",
        color: "#000000",
      },
      challenge_attempt: 10,
      user_attempts: 0,
      sponsor: {
        id: 13,
        name: "TRIBE",
        image:
          "https://travel-ar-app-42706.s3.amazonaws.com/media/sponsor/img/352372481_673412104832421_5523699236616023318_n.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4KGTUZ6KCVNP3RMO%2F20250715%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20250715T170457Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=fd3fee1710b9eff99e972386e0c7c28d7785860899a6ebe1179cbafef7d6e84a",
        description: "",
        tags: "@carnivaltribe, @roamreality, #carnivaltribe #roamreality",
        created_at: "2024-12-20T01:51:31.276587Z",
      },
      is_active: true,
      band_user: null,
    },
    challenges: {
      id: 135,
      image: null,
      model_file:
        "https://travel-ar-app-42706.s3.amazonaws.com/media/ar/model/pin1_xUypgMi.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4KGTUZ6KCVNP3RMO%2F20250715%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20250715T170457Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=004aa9983da0f2e4e90a910dd8ff6e2cff0daf5183cf5a5ec73354115d31287d",
      name: "Asuncion - Geo AR Challenge",
      description: "<p>8pala</p>",
      points: 1,
      challenge_choice: "IMAGE",
      challenge_requirement: "PHOTO",
      created_at: "2024-10-07T13:53:45.682952Z",
      expiry_date: null,
      sponsored: {
        id: 12,
        name: "Roam Reality",
        image:
          "https://travel-ar-app-42706.s3.amazonaws.com/media/sponsor/img/ROAM.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4KGTUZ6KCVNP3RMO%2F20250715%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20250715T170457Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=510f403594c76293327395d0b471d483415faa7aafe55a0acda1ee70fc46768a",
        description: "<p>Enjoy your summer with Roam Reality</p>",
        tags: "#RoamReality, @RoamReality",
        created_at: "2024-03-05T01:27:32.504920Z",
      },
      parameters: {
        id: 39,
        name: "Roam Pin 3D Settings",
        bloom_threshold: "0.90",
        bloom_intensity: "3.00",
        positionX: "0.000",
        positionY: "0.000",
        positionZ: "0.900",
        scale_object: "1.00000",
        emission_value: "5.00",
        rotation_speed: "0.10",
        scale_speed: "0.0010",
        min_pinch_scale: "0.5000",
        max_pinch_scale: "3.000",
        isRotationEnabled: true,
        loop_animations: true,
        loop_delay: 10,
        diffuse_text_color: "#ffffff",
        diffuse_intensity: "1.00",
        sound_play_and_pause: false,
        image_opacity: false,
        image_opacity_value: "1.00",
        tracking_and_anchors: false,
        ar_portals: false,
        image_recognition: false,
        image_recognition_file: null,
      },
      info: "<p>10pala</p>",
      color: "#ffffff",
    },
    following_mode: "PROXIMITY",
  },
  location: {
    type: "Point",
    coordinates: [-57.5890983495648, -25.296438110902695],
  },
  order: 2,
  remaining_stars: 2,
  captured_stars: 2,
  total_stars: 4,
  image:
    "https://travel-ar-app-42706.s3.amazonaws.com/media/ar/geo_star_point/2.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4KGTUZ6KCVNP3RMO%2F20250715%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20250715T170457Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=4c9929e80c844fbd51214f87beef6fe709b3203e3bcfa9e7bd4bb3cecab0e0df",
  fun_facts:
    "<p>Built by the British in 1770, Fort James was named after King James Il of England. It was one of the main military outposts in Tobago, guarding the western coastline from invaders and pirates</p>",
  elevation: 1,
  sponsors: [],
  status: 1,
  selectedMode: {
    id: 2,
    label: "Hunt Mode",
    name: "Hunt",
    listLabel: "Hunts",
    mode: "hunt_mode",
    modeSubTitle1: "Users are to follow the arrows to find hidden gems",
    modeSubTitle2: "TAP the AR to Capture",
    icon: "huntMode",
  },
};

export const AR_MODE_MESSAGES = {
  deafultView: [
    {
      id: 1,
      message: "Choose your AR MODE",
    },
    {
      id: 2,
      message: "Be aware of your surroundings",
    },
  ],
  CALIBRATION: [
    {
      id: 1,
      message: "Proper calibration prevents Geo-AR inconsistencies",
    },
    {
      id: 2,
      message:
        "Inconsistencies in cell service can lead to variations in Geo-AR position, up to 15M",
    },
    {
      id: 3,
      message: "Geo-AR works best in wide open outdoor areas, away from buildings or objects",
    },
    {
      id: 4,
      message: "Click RESET to re-calibrate at any point",
    },
  ],
  LIVE_VIEW_HUNT_MODE: [
    {
      id: 1,
      message: "Go on a guided hunt to find hidden AR",
    },
    {
      id: 2,
      message: "Find the AR, and tap/click it.",
    },
    {
      id: 3,
      message: "Any inconsistencies, click reset to re-calibrate.",
    },
  ],
  LIVE_VIEW_SCAN_MODE: [
    {
      id: 1,
      message: "Find the AR, capture image or video",
    },
    {
      id: 2,
      message: "Tap for photo or press for video",
    },
    {
      id: 3,
      message: "Any inconsistencies, click reset to re-calibrate",
    },
  ],
  LIST_VIEW: [
    {
      id: 1,
      message: "Access the AR at this site, in list format",
    },
    {
      id: 2,
      message: "Access a full list, or filter by brand",
    },
    {
      id: 3,
      message: "Users have a limited # of attempts every 24hrs",
    },
    {
      id: 4,
      message: "After the 24hr cooldown period, attempts are reset",
    },
    {
      id: 5,
      message: "To change the AR mode, return to LIST or MAP view",
    },
    {
      id: 6,
      message: "Any inconsistencies, refresh the list",
    },
    {
      id: 7,
      message: "List empty? Try changing modes",
    },
    {
      id: 8,
      message: "List empty in all modes? Then there's no AR available where you're located",
    },
  ],
  MAP_VIEW: [
    {
      id: 1,
      message: "Map displays all the AR around you",
    },
    {
      id: 2,
      message: "Map shows AR related to the selected mode only",
    },
    {
      id: 3,
      message: "Users can change modes to update the AR displayed",
    },
    {
      id: 4,
      message: "Users can zoom in, out or drag the map",
    },
    {
      id: 5,
      message: "Click the AR to load up your pathway",
    },
    {
      id: 6,
      message: "When nearby, switch to LIVE view, to engage the AR",
    },
    {
      id: 7,
      message: "Any inconsistencies, click reset",
    },
  ],
};
