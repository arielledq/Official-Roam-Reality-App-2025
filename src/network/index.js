import { Request } from "./request";
import { commonApiRoute } from "./config";
import { removeItemWithListener } from "../util/EventsListener";

/**
 * Login APIS
 */

export const logoutFunc = async () => {
  removeItemWithListener("userToken");
};

export const login = data =>
  Request.call({
    url: `${commonApiRoute}login/`,
    method: "POST",
    data,
  });
export const setDevice = data =>
  Request.callWithToken(
    {
      url: `${commonApiRoute}set-device/`,
      method: "POST",
      data,
    },
    logoutFunc
  );
export const logout = data =>
  Request.callWithToken(
    {
      url: `${commonApiRoute}logout/`,
      method: "POST",
      data,
    },
    logoutFunc
  );
export const signUp = data =>
  Request.call({
    url: `${commonApiRoute}signup/`,
    method: "POST",
    data,
  });
export const sendCode = data =>
  Request.call({
    url: `${commonApiRoute}send-email-otp/`,
    method: "POST",
    data,
  });
export const confirmCode = data =>
  Request.call({
    url: `${commonApiRoute}confirm-email-otp/`,
    method: "POST",
    data,
  });
export const changePassword = data =>
  Request.callWithToken(
    {
      url: `${commonApiRoute}change-password/`,
      method: "POST",
      data,
    },
    logoutFunc
  );
export const terms = () =>
  Request.call({
    url: `${commonApiRoute}content/terms/`,
    method: "GET",
  });
export const saveProfile = payload =>
  Request.callWithToken(
    {
      url: `${commonApiRoute}profile/${payload.id}/`,
      method: "PATCH",
      data: payload.data,
    },
    logoutFunc
  );
export const deleteAccount = () =>
  Request.callWithToken(
    {
      url: `${commonApiRoute}delete-account/`,
      method: "DELETE",
    },
    logoutFunc
  );
export const confirmEmailOtp = data =>
  Request.call(
    {
      url: `${commonApiRoute}confirm-email-otp/token/`,
      method: "POST",
      data,
    },
    logoutFunc
  );
export const resetPassword = data =>
  Request.call({
    url: `${commonApiRoute}reset-password/`,
    method: "POST",
    data,
  });
export const contactUs = data =>
  Request.callWithToken(
    {
      url: `${commonApiRoute}contact-us/`,
      method: "POST",
      data,
    },
    logoutFunc
  );
export const googleLogin = data => {
  return Request.call({
    url: `modules/social-auth/google/login/`,
    method: "POST",
    data,
  });
};
export const appleLogin = data => {
  return Request.call({
    url: `modules/social-auth/apple/login/`,
    method: "POST",
    data,
  });
};
export const fbLogin = data => {
  return Request.call({
    url: `modules/social-auth/facebook/login/`,
    method: "POST",
    data,
  });
};
export const getProfieDetails = payload =>
  Request.callWithToken(
    {
      url: `${commonApiRoute}account-setup/${payload.id}/`,
      method: "GET",
      payload,
    },
    logoutFunc
  );
export const updateProfile = payload =>
  Request.multiPartCall(
    {
      url: `${commonApiRoute}account-setup/${payload.id}/`,
      method: "PATCH",
      data: payload.data,
    },
    logoutFunc
  );
export const getARChallenges = () =>
  Request.callWithToken(
    {
      url: `modules/challenges/user/`,
      method: "GET",
    },
    logoutFunc
  );

export const getARSiteCategories = () =>
  Request.callWithToken(
    {
      url: `modules/challenges/geo-ar-site-categories/`,
      method: "GET",
    },
    logoutFunc
  );

export const getARSposored = () =>
  Request.callAR(
    {
      url: `modules/challenges/sponsor/`,
      method: "GET",
    },
    logoutFunc
  );
export const getAllARSitesStars = payload =>
  Request.callWithToken(
    {
      url: `modules/challenges/geo-ar-star/get-by-site-id/?id=${payload.id}`,
      method: "GET",
    },
    logoutFunc
  );
export const getNextStar = payload =>
  Request.callWithToken(
    {
      url: `modules/challenges/geo-ar-star/get-next-star/?geo_site_id=${payload.geo_site_id}&lat=${payload.lat}&lon=${payload.lon}`,
      method: "GET",
    },
    logoutFunc
  );
export const starFoundAndSaveApi = payload =>
  Request.callWithToken(
    {
      url: `modules/challenges/geo-ar-star-collect/`,
      method: "POST",
      data: payload,
    },
    logoutFunc
  );
export const getARSitesHiddenStars = payload =>
  Request.callWithToken(
    {
      url: `modules/challenges/geo-ar-star/get-hidden-stars/?id=${payload.id}`,
      method: "GET",
    },
    logoutFunc
  );
export const getARSitesStars = payload =>
  Request.callWithToken(
    {
      url: `modules/challenges/geo-ar-star/get-stars-sites/?id=${payload.id}`,
      method: "GET",
    },
    logoutFunc
  );
export const getARProfile = () =>
  Request.callWithToken(
    {
      url: `modules/challenges/ar-profile/`,
      method: "GET",
    },
    logoutFunc
  );
export const postArMemory = payload =>
  Request.multiPartCall(
    {
      url: `modules/challenges/memories/`,
      method: "POST",
      data: payload,
    },
    logoutFunc
  );
export const postGeoArMemory = payload =>
  Request.multiPartCall(
    {
      url: `modules/challenges/memories/check-geo-challenge-create/`,
      method: "POST",
      data: payload,
    },
    logoutFunc
  );
export const checkGeoPinCheckInDoneAPI = payload =>
  Request.callWithToken(
    {
      url: `modules/challenges/check-in/check-in-done/`,
      method: "POST",
      data: payload,
    },
    logoutFunc
  );
export const getCollectedStarCount = payload =>
  Request.callWithToken(
    {
      url: `modules/challenges/geo-ar-star-collect/star-count/`,
      method: "POST",
      data: payload,
    },
    logoutFunc
  );
export const getAllCollectedStars = payload =>
  Request.callWithToken(
    {
      url: `modules/challenges/geo-ar-star-collect/site-stars/`,
      method: "POST",
      data: payload,
    },
    logoutFunc
  );

export const getCheckInCount = payload =>
  Request.callWithToken(
    {
      url: `modules/challenges/check-in/check-in-all-count/`,
      method: "POST",
      data: payload,
    },
    logoutFunc
  );
export const postGeoPinCheckIn = payload =>
  Request.multiPartCall(
    {
      url: `modules/challenges/check-in/`,
      method: "POST",
      data: payload,
    },
    logoutFunc
  );
export const getGeoPinCheckInAPI = payload =>
  Request.callWithToken(
    {
      url: `modules/challenges/check-in/`,
      method: "GET",
    },
    logoutFunc
  );
export const getAllMemories = () =>
  Request.callWithToken(
    {
      url: `modules/challenges/all-memories/`,
      method: "GET",
    },
    logoutFunc
  );
export const checkARChallengeDoneAPI = payload =>
  Request.callWithToken(
    {
      url: `modules/challenges/memories/check-challenge-done/`,
      method: "POST",
      data: payload,
    },
    logoutFunc
  );
export const checkUniqueARChallengeDoneAPI = payload =>
  Request.callWithToken(
    {
      url: `modules/challenges/memories/check-geo-challenge-done/`,
      method: "POST",
      data: payload,
    },
    logoutFunc
  );
export const getProfieARMemoriesAPI = () =>
  Request.callWithToken(
    {
      url: `modules/challenges/memories/`,
      method: "GET",
    },
    logoutFunc
  );
export const getPublicProfieARMemoriesAPI = user_id =>
  Request.callWithToken(
    {
      url: `modules/challenges/memories/public/?user_id=${user_id}`,
      method: "GET",
    },
    logoutFunc
  );

export const getPublicARProfile = user_id =>
  Request.callWithToken(
    {
      url: `modules/challenges/ar-profile/public/?user_id=${user_id}`,
      method: "GET",
    },
    logoutFunc
  );
export const socialPointsARUpdateAPI = payload =>
  Request.callWithToken(
    {
      url: `modules/challenges/ar-profile/update-ar-social-points/`,
      method: "POST",
      data: payload,
    },
    logoutFunc
  );
export const getPrivacyPolicy = payload =>
  Request.callWithToken(
    {
      url: `/modules/privacy-policy/`,
      method: "GET",
      payload,
    },
    logoutFunc
  );
export const getTermsAndConditions = payload =>
  Request.callWithToken(
    {
      url: `/modules/terms-and-conditions/`,
      method: "GET",
      payload,
    },
    logoutFunc
  );
export const getARStettings = () =>
  Request.callWithToken(
    {
      url: `/modules/challenges/settings/`,
      method: "GET",
    },
    logoutFunc
  );
export const sendFeedback = data =>
  Request.callWithToken(
    {
      url: `${commonApiRoute}contact-us/`,
      method: "POST",
      data,
    },
    logoutFunc
  );
export const inviteFriendByEmail = data =>
  Request.callWithToken(
    {
      url: `${commonApiRoute}invite-friend/`,
      method: "POST",
      data,
    },
    logoutFunc
  );
export const getGeoARDestinations = () =>
  Request.callWithToken(
    {
      url: `modules/challenges/geo-ar-location/`,
      method: "GET",
    },
    logoutFunc
  );
export const searchUsers = payload =>
  Request.callWithToken(
    {
      url: `${commonApiRoute}find-friends/`,
      method: "GET",
      params: payload,
    },
    logoutFunc
  );
export const sendFriendRequest = data =>
  Request.callWithToken(
    {
      url: `${commonApiRoute}friends/`,
      method: "POST",
      data,
    },
    logoutFunc
  );
export const getPendingFriendRequests = () =>
  Request.callWithToken(
    {
      url: `${commonApiRoute}friends/`,
      method: "GET",
    },
    logoutFunc
  );
export const acceptFriendRequests = userId =>
  Request.callWithToken(
    {
      url: `${commonApiRoute}friends/${userId}/accept_friend_request/`,
      method: "POST",
    },
    logoutFunc
  );
export const rejectFriendRequests = userId =>
  Request.callWithToken(
    {
      url: `${commonApiRoute}friends/${userId}/`,
      method: "DELETE",
    },
    logoutFunc
  );
export const getUserFriendList = () =>
  Request.callWithToken(
    {
      url: `${commonApiRoute}account-setup/`,
      method: "GET",
    },
    logoutFunc
  );

export const getScoreboardList = (destination) =>
  Request.callWithToken(
    {
      url: `${commonApiRoute}scoreboard/?destination=${destination}`,
      method: "GET",
    },
    logoutFunc
  );

export const findFriends = data =>
  Request.callWithToken(
    {
      url: `${commonApiRoute}find-friends/`,
      method: "POST",
      data,
    },
    logoutFunc
  );
export const getUserNotificationList = () =>
  Request.callWithToken(
    {
      url: `${commonApiRoute}notifications/`,
      method: "GET",
    },
    logoutFunc
  );
export const clearNotificationList = () =>
  Request.callWithToken(
    {
      url: `${commonApiRoute}notifications/clear-all/`,
      method: "PATCH",
    },
    logoutFunc
  );

export const markAllNotificationAsRead = () =>
  Request.callWithToken(
    {
      url: `${commonApiRoute}notifications/read-all/`,
      method: "PATCH",
    },
    logoutFunc
  );
export const markNotificationAsRead = (id, data) =>
  Request.callWithToken(
    {
      url: `${commonApiRoute}notifications/${id}/`,
      method: "PATCH",
      data: data,
    },
    logoutFunc
  );
export const reportContentOrUser = data =>
  Request.callWithToken(
    {
      url: `${commonApiRoute}report-content/`,
      method: "POST",
      data: data,
    },
    logoutFunc
  );
export const updateUserLocation = payload =>
  Request.callWithToken(
    {
      url: `modules/challenges/ar-profile/update-user-location/`,
      method: "POST",
      data: payload,
    },
    logoutFunc
  );
export const getDestinationFacts = payload =>
  Request.callWithToken(
    {
      url: `modules/challenges/geo-destination-fact/by-destination-id/`,
      method: "POST",
      data: payload,
    },
    logoutFunc
  );
export const getDestinationFactsAll = payload =>
  Request.callWithToken(
    {
      url: `modules/challenges/geo-destination-fact/get_all/`,
      method: "GET",
    },
    logoutFunc
  );
export const removeUserFromFriends = id =>
  Request.callWithToken(
    {
      url: `${commonApiRoute}friends/${id}/remove_friend/`,
      method: "POST",
    },
    logoutFunc
  );
export const updateUserPointAPI = payload =>
  Request.callWithToken(
    {
      url: `modules/challenges/ar-profile/update-user-point/`,
      method: "POST",
      data: payload,
    },
    logoutFunc
  );
export const panicMessageAPI = payload =>
  Request.callWithToken(
    {
      url: `modules/challenges/panic-message/`,
      method: "POST",
      data: payload,
    },
    logoutFunc
  );
export const getGeoARExamples = id =>
  Request.callAR(
    {
      url: `modules/challenges/examples/get-by-geo-ar-id/?id=${id}`,
      method: "GET",
    },
    logoutFunc
  );
export const getAnyARExamples = id =>
  Request.callAR(
    {
      url: `modules/challenges/examples/get-by-any-ar-id/?id=${id}`,
      method: "GET",
    },
    logoutFunc
  );
export const getUserCollectedStarCount = payload =>
  Request.callWithToken(
    {
      url: `modules/challenges/geo-ar-star-collect/user-stars-count/`,
      method: "POST",
      data: payload,
    },
    logoutFunc
  );
export const getUserRankCount = payload =>
  Request.callWithToken(
    {
      url: `modules/challenges/ar-profile/get-rank/`,
      method: "POST",
      data: payload,
    },
    logoutFunc
  );
export const getCountryCount = payload =>
  Request.callWithToken(
    {
      url: `modules/challenges/check-in/country-checkins-count/`,
      method: "POST",
      data: payload,
    },
    logoutFunc
  );
export const sendRoamingNotification = payload =>
  Request.callWithToken(
    {
      url: `${commonApiRoute}notifications/send_roaming_notifications/`,
      method: "POST",
      data: payload,
    },
    logoutFunc
  );
