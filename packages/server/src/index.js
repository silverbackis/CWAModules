import axios from 'axios'
import Utilities from './utilities'

export default class BWServer {
  constructor (env) {
    this.env = env
    this.utilities = new Utilities(this.env)
    this.logging = env.NODE_ENV === 'development'
  }

  loginSuccess ({ session }, res, loginRes) {
    this.logging && console.log(loginRes)

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

  loginError (res, err) {
    if (!res) {
      this.logging && console.error(err)
      return err
    }
    if (!err.response) {
      this.logging && console.error(err.message)
      res.status(500).json({ message: err.message })
    } else {
      const response = err.response
      this.logging && console.error(response)
      if (response.status === 401 || response.status === 400 || response.data['@type'] === 'hydra:Error') {
        res.status(response.status).json(response.data)
        return
      }
      if (response.data) {
        let exception
        const isException = (response.data.error && (exception = response.data.error.exception))
        res.status(response.status).json({
          message:
            (isException ? exception[ 0 ].message : response.data.message)
        })
        return
      }
      res.status(response.status).json({
        message: 'unknown error'
      })
    }
  }

  post (req, res, data, successFn = null, errorFn = null, extraHeaders = {}) {
    // Only allow post requests to API
    let _action = req.body._action
    // make sure _action is prefixed with a slash
    _action.substr(0, 1) !== '/' && (_action = '/' + _action)
    // concat host and path
    const postPath = this.env.API_URL + _action

    this.logging && console.log('login posting to: ' + postPath)
    return axios.post(
      postPath,
      data,
      {
        headers: Object.assign(extraHeaders, this.utilities.cookiesToHeaders(req.cookies))
      }
    )
      .then((loginRes) => {
        this.loginSuccess(req, res, loginRes)
      })
      .catch((err) => {
        this.loginError(res, err)
      })
  }

  login (req, res, extraHeaders = {}) {
    const data = {
      username: req.body.username,
      password: req.body.password
    }
    this.post(req, res, data, this.loginSuccess, this.loginError, extraHeaders)
  }

  logout (req, res, setResponse = true) {
    req.session.authToken = null
    req.session.destroy()
    this.utilities.clearJwtCookie(res)
    if (setResponse) {
      res
        .status(200)
        .json({ success: true })
    }
  }

  async jwtRefresh (req, res, sendResult = true) {
    let session = req.session
    let message
    if (!session.refreshToken) {
      this.utilities.clearJwtCookie(res)
      message = 'Invalid session - no refresh token available'
      this.logging && console.log(message)
      res.status(400).json({ message })
    }
    const ACTION = this.env.API_URL + '/token/refresh'
    try {
      let response = await axios.post(
        ACTION,
        {
          refresh_token: session.refreshToken
        },
        {
          headers: this.utilities.cookiesToHeaders(req.cookies),
          refreshTokenRequest: true
        })
      this.logging && console.error('jwtRefresh response', response)
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

      let isException = (err.response.data.error && err.response.data.error.exception)
      let error = isException ? err.response.data.error.exception[ 0 ].message : (err.response.data.message || 'unknown error')
      return res.json({
        message: 'Refresh token rejected',
        error
      })
    }
  }
}
