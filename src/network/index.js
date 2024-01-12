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

export const terms = () =>
  Request.call({
    url: `${commonApiRoute}content/terms/`,
    method: 'GET'
  })

export const changePassword = data =>
  Request.callWithToken({
    url: `${commonApiRoute}change-password/`,
    method: 'PUT',
    data
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
