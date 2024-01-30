import { Request } from './request'
import { commonApiRoute } from './config'

/**
 * Login APIS
 */

export const login = data =>
  Request.call({
    url: `${commonApiRoute}login/`,
    method: 'POST',
    data
  })
export const logout = data =>
  Request.callWithToken({
    url: `${commonApiRoute}logout/`,
    method: 'POST',
    data
  })
export const signUp = data =>
  Request.call({
    url: `${commonApiRoute}signup/`,
    method: 'POST',
    data
  })
export const sendCode = data =>
  Request.call({
    url: `${commonApiRoute}send-email-otp/`,
    method: 'POST',
    data
  })
export const confirmCode = data =>
  Request.call({
    url: `${commonApiRoute}confirm-email-otp/`,
    method: 'POST',
    data
  })
export const changePassword = data =>
  Request.callWithToken({
    url: `${commonApiRoute}change-password/`,
    method: 'POST',
    data
  })

export const terms = () =>
  Request.call({
    url: `${commonApiRoute}content/terms/`,
    method: 'GET'
  })

export const saveProfile = payload =>
  Request.callWithToken({
    url: `${commonApiRoute}profile/${payload.id}/`,
    method: 'PATCH',
    data: payload.data
  })

export const deleteAccount = () =>
  Request.callWithToken({
    url: `${commonApiRoute}delete-account/`,
    method: 'DELETE'
  })

export const confirmEmailOtp = data =>
  Request.call({
    url: `${commonApiRoute}confirm-email-otp/token/`,
    method: 'POST',
    data
  })

export const resetPassword = data =>
  Request.call({
    url: `${commonApiRoute}reset-password/`,
    method: 'POST',
    data
  })

export const googleLogin = data => {
  return Request.call({
    url: `modules/social-auth/google/login/`,
    method: 'POST',
    data
  })
}

export const appleLogin = data => {
  return Request.call({
    url: `modules/social-auth/apple/login/`,
    method: 'POST',
    data
  })
}

export const fbLogin = data => {
  return Request.call({
    url: `modules/social-auth/facebook/login/`,
    method: 'POST',
    data
  })
}

export const getProfieDetails = payload =>
  Request.callWithToken({
    url: `${commonApiRoute}account-setup/${payload.id}/`,
    method: 'GET',
    payload
  })

export const updateProfile = payload =>
  Request.multiPartCall({
    url: `${commonApiRoute}account-setup/${payload.id}/`,
    method: 'PATCH',
    data: payload.data
  })

export const getARChallenges = () =>
  Request.callAR({
    url: `modules/challenges/user/`,
    method: 'GET'
  })

export const getARSposored = () =>
  Request.callAR({
    url: `modules/challenges/sponsor/`,
    method: 'GET'
  })

export const getARProfile = () =>
  Request.callWithToken({
    url: `modules/challenges/ar-profile/`,
    method: 'GET'
  })

export const getPrivacyPolicy = payload =>
  Request.callWithToken({
    url: `/modules/privacy-policy/`,
    method: 'GET',
    payload
  })
export const getTermsAndConditions = payload =>
  Request.callWithToken({
    url: `/modules/terms-and-conditions/`,
    method: 'GET',
    payload
  })
