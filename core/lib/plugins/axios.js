import { cookiesToHeaders } from '../utilities'
import RefreshToken from '../refresh_token'

const logging = process.env.NODE_ENV === 'development'

export default async function ({ req, res, $axios, store: { getters, commit } }) {
  const axiosRefreshToken = async () => {
    if (process.server) {
      try {
        let result = await RefreshToken(req, res, false)
        commit('setAuthToken', result)
        logging && console.log('Refresh result - token', result)
      } catch (refreshError) {
        commit('setAuthToken', null)
        logging && console.error('refreshError', refreshError)
      }
    } else {
      // Request to the express back-end
      try {
        let { data } = await $axios.post(
          'refresh_token',
          { _action: '/token/refresh' },
          { baseURL: null, refreshTokenRequest: true }
        )
        commit('setAuthToken', data.token)
      } catch (refreshError) {
        logging && console.warn('refreshError', refreshError)
        // It turns out we are not authorized - but the page may not even need authorization...
        commit('setAuthToken', null)
        if (refreshError.statusCode >= 500 && refreshError.statusCode < 600) {
          return Promise.reject(refreshError)
        }
      }
    }
  }

  // Always send through Authorization header if the authToken is available
  $axios.interceptors.request.use(async (config) => {
    const authToken = getters.getAuthToken
    const authDiff = authToken ? getters.getAuthUser.exp - (Date.now() / 1000) : 10
    // Expired or very close to expired (10 secs)
    if (authDiff < 10 && !config.refreshTokenRequest) {
      logging && console.log('Request intercepted - auth token expiry detected')
      await axiosRefreshToken()
    }

    const token = process.server ? req.session.authToken : getters.getAuthToken
    if (token) {
      config.headers.Authorization = 'Bearer ' + token
    }
    if (process.server) {
      let headers = cookiesToHeaders(req.cookies)
      config.headers = Object.assign(config.headers, headers)
    }
    return config
  })
}
