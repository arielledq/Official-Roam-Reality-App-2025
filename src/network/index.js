import { Request } from "./request"
import { commonApiRoute } from "./config"

/**
 * Login APIS
 */

export const login = data =>
  Request.call({
    url: `${commonApiRoute}login/`,
    method: "POST",
    data
  })
export const logout = data =>
  Request.callWithToken({
    url: `${commonApiRoute}logout/`,
    method: "POST",
    data
  })
export const signUp = data =>
  Request.call({
    url: `${commonApiRoute}signup/`,
    method: "POST",
    data
  })
export const sendCode = data =>
  Request.call({
    url: `${commonApiRoute}send-email-otp/`,
    method: "POST",
    data
  })
export const confirmCode = data =>
  Request.call({
    url: `${commonApiRoute}confirm-email-otp/`,
    method: "POST",
    data
  })
export const changePassword = data =>
  Request.callWithToken({
    url: `${commonApiRoute}change-password/`,
    method: "POST",
    data
  })

export const terms = () =>
  Request.call({
    url: `${commonApiRoute}content/terms/`,
    method: "GET"
  })

export const saveProfile = payload =>
  Request.callWithToken({
    url: `${commonApiRoute}profile/${payload.id}/`,
    method: "PATCH",
    data: payload.data
  })

export const deleteAccount = () =>
  Request.callWithToken({
    url: `${commonApiRoute}delete-account/`,
    method: "DELETE"
  })

export const confirmEmailOtp = data =>
  Request.call({
    url: `${commonApiRoute}confirm-email-otp/token/`,
    method: "POST",
    data
  })

export const resetPassword = data =>
  Request.call({
    url: `${commonApiRoute}reset-password/`,
    method: "POST",
    data
  })

export const contactUs = data =>
  Request.callWithToken({
    url: `${commonApiRoute}contact-us/`,
    method: "POST",
    data
  })

export const googleLogin = data => {
  return Request.call({
    url: `modules/social-auth/google/login/`,
    method: "POST",
    data
  })
}

export const appleLogin = data => {
  return Request.call({
    url: `modules/social-auth/apple/login/`,
    method: "POST",
    data
  })
}

export const fbLogin = data => {
  return Request.call({
    url: `modules/social-auth/facebook/login/`,
    method: "POST",
    data
  })
}

export const getProfieDetails = payload =>
  Request.callWithToken({
    url: `${commonApiRoute}account-setup/${payload.id}/`,
    method: "GET",
    payload
  })

export const updateProfile = payload =>
  Request.multiPartCall({
    url: `${commonApiRoute}account-setup/${payload.id}/`,
    method: "PATCH",
    data: payload.data
  })

export const getARChallenges = () =>
  Request.callAR({
    url: `modules/challenges/user/`,
    method: "GET"
  })

export const getARSposored = () =>
  Request.callAR({
    url: `modules/challenges/sponsor/`,
    method: "GET"
  })

export const getAllARSitesStars = payload =>
  Request.callAR({
    url: `modules/challenges/geo-ar-star/get-by-site-id/?id=${payload.id}`,
    method: "GET"
  })

export const getARSitesHiddenStars = payload =>
  Request.callAR({
    url: `modules/challenges/geo-ar-star/get-hidden-stars/?id=${payload.id}`,
    method: "GET"
  })

export const getARSitesStars = payload =>
  Request.callAR({
    url: `modules/challenges/geo-ar-star/get-stars-sites/?id=${payload.id}`,
    method: "GET"
  })

export const getARProfile = () =>
  Request.callWithToken({
    url: `modules/challenges/ar-profile/`,
    method: "GET"
  })

export const postArMemory = payload =>
  Request.multiPartCall({
    url: `modules/challenges/memories/`,
    method: "POST",
    data: payload
  })

export const postGeoArMemory = payload =>
  Request.multiPartCall({
    url: `modules/challenges/memories/check-geo-challenge-create/`,
    method: "POST",
    data: payload
  })

export const checkGeoPinCheckInDoneAPI = payload =>
  Request.callWithToken({
    url: `modules/challenges/check-in/check-in-done/`,
    method: "POST",
    data: payload
  })

export const getCollectedStarCount = payload =>
  Request.callWithToken({
    url: `modules/challenges/geo-ar-star-collect/star-count/`,
    method: "POST",
    data: payload
  })

export const getAllCollectedStars = payload =>
  Request.callWithToken({
    url: `modules/challenges/geo-ar-star-collect/site-stars/`,
    method: "POST",
    data: payload
  })

export const starFoundAndSaveApi = payload =>
  Request.callWithToken({
    url: `modules/challenges/geo-ar-star-collect/`,
    method: "POST",
    data: payload
  })

export const getCheckInCount = payload =>
  Request.callWithToken({
    url: `modules/challenges/check-in/check-in-all-count/`,
    method: "POST",
    data: payload
  })

export const postGeoPinCheckIn = payload =>
  Request.multiPartCall({
    url: `modules/challenges/check-in/`,
    method: "POST",
    data: payload
  })

export const checkARChallengeDoneAPI = payload =>
  Request.callWithToken({
    url: `modules/challenges/memories/check-challenge-done/`,
    method: "POST",
    data: payload
  })

export const checkUniqueARChallengeDoneAPI = payload =>
  Request.callWithToken({
    url: `modules/challenges/memories/check-geo-challenge-done/`,
    method: "POST",
    data: payload
  })

export const getProfieARMemoriesAPI = () =>
  Request.callWithToken({
    url: `modules/challenges/memories/`,
    method: "GET"
  })

export const getPublicProfieARMemoriesAPI = user_id =>
  Request.callWithToken({
    url: `modules/challenges/memories/public/?user_id=${user_id}`,
    method: "GET"
  })

export const getPublicARProfile = user_id =>
  Request.callWithToken({
    url: `modules/challenges/ar-profile/public/?user_id=${user_id}`,
    method: "GET"
  })

export const socialPointsARUpdateAPI = payload =>
  Request.callWithToken({
    url: `modules/challenges/ar-profile/update-ar-social-points/`,
    method: "POST",
    data: payload
  })

export const getPrivacyPolicy = payload =>
  Request.callWithToken({
    url: `/modules/privacy-policy/`,
    method: "GET",
    payload
  })

export const getTermsAndConditions = payload =>
  Request.callWithToken({
    url: `/modules/terms-and-conditions/`,
    method: "GET",
    payload
  })

export const getARStettings = () =>
  Request.callWithToken({
    url: `/modules/challenges/settings/`,
    method: "GET"
  })

export const sendFeedback = data =>
  Request.callWithToken({
    url: `${commonApiRoute}contact-us/`,
    method: "POST",
    data
  })

export const inviteFriendByEmail = data =>
  Request.callWithToken({
    url: `${commonApiRoute}invite-friend/`,
    method: "POST",
    data
  })

export const getGeoARDestinations = () =>
  Request.callAR({
    url: `modules/challenges/geo-ar-location/`,
    method: "GET"
  })

export const searchUsers = payload =>
  Request.callWithToken({
    url: `${commonApiRoute}find-friends/`,
    method: "GET",
    params: payload
  })

export const sendFriendRequest = data =>
  Request.callWithToken({
    url: `${commonApiRoute}friends/`,
    method: "POST",
    data
  })

export const getPendingFriendRequests = () =>
  Request.callWithToken({
    url: `${commonApiRoute}friends/`,
    method: "GET"
  })

export const acceptFriendRequests = userId =>
  Request.callWithToken({
    url: `${commonApiRoute}friends/${userId}/accept_friend_request/`,
    method: "POST"
  })

export const rejectFriendRequests = userId =>
  Request.callWithToken({
    url: `${commonApiRoute}friends/${userId}/`,
    method: "DELETE"
  })

export const getUserFriendList = () =>
  Request.callWithToken({
    url: `${commonApiRoute}account-setup/`,
    method: "GET"
  })

export const findFriends = data =>
  Request.callWithToken({
    url: `${commonApiRoute}find-friends/`,
    method: "POST",
    data
  })

export const getUserNotificationList = () =>
  Request.callWithToken({
    url: `${commonApiRoute}notifications/`,
    method: "GET"
  })

export const clearNotificationList = () =>
  Request.callWithToken({
    url: `${commonApiRoute}notifications/clear-all/`,
    method: "PATCH"
  })

export const markAllNotificationAsRead = () =>
  Request.callWithToken({
    url: `${commonApiRoute}notifications/read-all/`,
    method: "PATCH"
  })

export const markNotificationAsRead = (id, data) =>
  Request.callWithToken({
    url: `${commonApiRoute}notifications/${id}/`,
    method: "PATCH",
    data: data
  })

export const reportContentOrUser = data =>
  Request.callWithToken({
    url: `${commonApiRoute}report-content/`,
    method: "POST",
    data: data
  })

export const updateUserLocation = payload =>
  Request.callWithToken({
    url: `modules/challenges/ar-profile/update-user-location/`,
    method: "POST",
    data: payload
  })

export const getDestinationFacts = payload =>
  Request.callWithToken({
    url: `modules/challenges/geo-destination-fact/by-destination-id/`,
    method: "POST",
    data: payload
  })

export const removeUserFromFriends = id =>
  Request.callWithToken({
    url: `${commonApiRoute}friends/${id}/remove_friend/`,
    method: "POST"
  })

export const updateUserPointAPI = payload =>
  Request.callWithToken({
    url: `modules/challenges/ar-profile/update-user-point/`,
    method: "POST",
    data: payload
  })

export const panicMessageAPI = payload =>
  Request.callWithToken({
    url: `modules/challenges/panic-message/`,
    method: "POST",
    data: payload
  })

export const getGeoARExamples = (id) =>
  Request.callAR({
    url: `modules/challenges/examples/get-by-geo-ar-id/?id=${id}`,
    method: "GET"
  })

export const getAnyARExamples = (id) =>
  Request.callAR({
    url: `modules/challenges/examples/get-by-any-ar-id/?id=${id}`,
    method: "GET"
  })
