import { cookiesToHeaders, setJwtCookie, clearJwtCookie, setResponseCookies } from './utilities'
import axios from 'axios'
import RefreshToken from './refresh_token'

const logging = process.env.NODE_ENV === 'development'

export default function (router) {
  router.post('/login', (req, res = null) => {
    // Only allow post requests to API
    let session = req.session
    logging && console.log(process.env.API_URL + req.body._action)
    // Post login credentials with Session ID and XSRF Header
    return axios.post(
      process.env.API_URL + req.body._action,
      {
        username: req.body.username,
        password: req.body.password
      },
      {
        headers: cookiesToHeaders(req.cookies)
      }
    )
      .then((loginRes) => {
        logging && console.error(loginRes)

        // Set the session variable for subsequent page refreshes - cookie is http only
        // save the refresh token to the session (NEVER to the client/browser)
        // Reference: Auth0: https://auth0.com/docs/tokens/refresh-token/current#restrictions
        // "A Single Page Application (normally implementing Implicit Grant) should not under any circumstances get a refresh token. The reason for that is the sensitivity of this piece of information."

        session.authToken = loginRes.data.token
        session.refreshToken = loginRes.data.refresh_token
        setJwtCookie(res, session.authToken)
        setResponseCookies(res, loginRes)
        if (!res) {
          return session.authToken
        }
        res.status(200).json({ token: session.authToken })
      })
      .catch((err) => {
        logging && console.error(err)
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
              message: !err.response.data ? err.message : ((err.response.data.error && err.response.data.error.exception) ? err.response.data.error.exception[0].message : err.response.data.message)
            })
          }
        }
      })
  })

  router.post('/logout', (req, res) => {
    req.session.authToken = null
    req.session.destroy()
    clearJwtCookie(res)
    res
      .status(200)
      .json({ success: true })
  })

  router.post('/refresh_token', (req, res) => RefreshToken(req, res))

  return router
}
