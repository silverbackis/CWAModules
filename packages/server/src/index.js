import axios from 'axios'
import Utilities from './utilities'

export default class BWServer {
  constructor (env) {
    this.env = env
    this.utilities = new Utilities(this.env)
    this.logging = env.NODE_ENV === 'development'
  }

  login (req, res = null, extraHeaders = {}) {
    // Only allow post requests to API
    let session = req.session
    let _action = req.body._action
    _action.substr(0, 1) !== '/' && (_action = '/' + _action)
    const postPath = this.env.API_URL + _action
    this.logging && console.log('login posting to: ' + postPath)
    // Post login credentials with Session ID and XSRF Header
    return axios.post(
      postPath,
      {
        username: req.body.username,
        password: req.body.password
      },
      {
        headers: Object.assign(extraHeaders, this.utilities.cookiesToHeaders(req.cookies))
      }
    )
      .then((loginRes) => {
        this.logging && console.error(loginRes)

        // Set the session variable for subsequent page refreshes - cookie is http only
        // save the refresh token to the session (NEVER to the client/browser)
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
      })
      .catch((err) => {
        this.logging && console.error(err)
        if (!res) {
          return err
        }
        if (!err.response) {
          res.status(500).json({ message: err.message })
        } else {
          if (err.response.status === 401) {
            res.status(401).json(err.response.data)
          } else {
            res.status(err.response.status).json({
              message: !err.response.data ? err.message : ((err.response.data.error && err.response.data.error.exception) ? err.response.data.error.exception[ 0 ].message : err.response.data.message)
            })
          }
        }
      })
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
