import axios from 'axios'
import Utilities from './utilities'

export default class BWServer {
  constructor(env, logging) {
    this.env = env
    this.utilities = new Utilities(this.env)
    this.logging =
      logging === undefined ? env.NODE_ENV === 'development' : logging
  }

  postSuccess({ session }, res, loginRes) {
    // eslint-disable-next-line no-console
    this.logging && console.log(loginRes.data)

    // Reference: Auth0: https://auth0.com/docs/tokens/refresh-token/current#restrictions
    // "A Single Page Application (normally implementing Implicit Grant) should not under any circumstances get a refresh token. The reason for that is the sensitivity of this piece of information."
    session.authToken = loginRes.data.token
    session.refreshToken = loginRes.data.refresh_token

    this.utilities.setJwtCookie(res, session.authToken)
    this.utilities.setResponseCookies(res, loginRes)
    if (!res) {
      return session.authToken
    }
    res.status(200).json({ token: session.authToken })
  }

  postError(res, err) {
    if (!res) {
      // eslint-disable-next-line no-console
      this.logging && console.error(err)
      return err
    }
    if (!err.response) {
      // eslint-disable-next-line no-console
      this.logging && console.error(err.message)
      res.status(500).json({ message: err.message })
    } else {
      const response = err.response
      // eslint-disable-next-line no-console
      this.logging && console.error(response)
      if (
        response.status === 401 ||
        response.status === 400 ||
        response.data['@type'] === 'hydra:Error'
      ) {
        res.status(response.status).json(response.data)
        return
      }
      if (response.data) {
        let exception
        const isException =
          response.data.error && (exception = response.data.error.exception)
        res.status(response.status).json({
          message: isException
            ? exception[0].message
            : response.data.message || response.data
        })
        return
      }
      res.status(response.status).json({
        message: 'unknown error'
      })
    }
  }

  post(req, res, data, successFn = null, errorFn = null, extraHeaders = {}) {
    // Only allow post requests to API
    let _action = req.body._action
    // make sure _action is prefixed with a slash
    _action.substr(0, 1) !== '/' && (_action = '/' + _action)
    // concat host and path
    const postPath = this.env.API_URL + _action

    // eslint-disable-next-line no-console
    this.logging && console.log('posting to: ' + postPath)

    const headersPassThru = [
      'accept',
      'accept-encoding',
      'accept-language',
      'cache-control',
      'content-type',
      'dnt',
      'origin',
      'pragma',
      'referer'
    ]
    const initHeaders = {}
    for (const hpu of headersPassThru) {
      if (req.headers[hpu]) {
        initHeaders[hpu] = req.headers[hpu]
      }
    }

    return axios
      .post(postPath, data, {
        headers: Object.assign(
          initHeaders,
          extraHeaders,
          this.utilities.cookiesToHeaders(req.cookies)
        )
      })
      .then(loginRes => {
        this.postSuccess(req, res, loginRes)
      })
      .catch(err => {
        this.postError(res, err)
      })
  }

  login(req, res, extraHeaders = {}) {
    const data = {
      username: req.body.username,
      password: req.body.password
    }
    this.post(req, res, data, this.postSuccess, this.postError, extraHeaders)
  }

  logout(req, res, setResponse = true) {
    if (req.session) {
      req.session.authToken = null
      req.session.destroy()
    }
    this.utilities.clearJwtCookie(res)
    if (setResponse) {
      res.status(200).json({ success: true })
    }
  }

  async jwtRefresh(req, res, sendResult = true, extraHeaders = {}) {
    const session = req.session
    let message
    if (!session.refreshToken) {
      this.utilities.clearJwtCookie(res)
      message = 'Invalid session - no refresh token available'
      // eslint-disable-next-line no-console
      this.logging && console.log(message)
      res.status(400).json({ message })
    }
    const ACTION =
      this.env.API_URL + (this.env.TOKEN_REFRESH_PATH || '/token/refresh')
    try {
      const response = await axios.post(
        ACTION,
        {
          refresh_token: session.refreshToken
        },
        {
          headers: Object.assign(
            extraHeaders,
            this.utilities.cookiesToHeaders(req.cookies)
          ),
          refreshTokenRequest: true
        }
      )
      // eslint-disable-next-line no-console
      this.logging && console.log('jwtRefresh response', response.data)
      const data = response.data
      session.authToken = data.token
      session.refreshToken = data.refresh_token
      this.utilities.setJwtCookie(res, session.authToken)
      if (!sendResult) {
        return session.authToken
      }
      res.status(200).json({ token: session.authToken })
    } catch (err) {
      this.utilities.clearJwtCookie(res)
      if (!sendResult) {
        throw new Error(err)
      }
      // eslint-disable-next-line no-console
      this.logging && console.error('RefreshToken Error', err)

      res.status(500)
      if (err.response === undefined) {
        res.json({ message: err.message || err })
        return
      }
      if (err.response.data === undefined) {
        res.json({ message: err })
        return
      }

      const isException =
        err.response.data.error && err.response.data.error.exception
      const error = isException
        ? err.response.data.error.exception[0].message
        : err.response.data.message || 'unknown error'
      return res.json({
        message: 'Refresh token rejected',
        error
      })
    }
  }
}
