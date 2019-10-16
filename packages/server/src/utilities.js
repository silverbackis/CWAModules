import setCookie from 'set-cookie-parser'

export default class Utilities {
  constructor(env) {
    this.env = {
      JWT_COOKIE: env.JWT_COOKIE || 'TKN',
      XSRF_COOKIE: env.XSRF_HEADER || 'XSRF-TOKEN',
      IS_DEV: (env.NODE_ENV || 'production') === 'development',
      COOKIE_DOMAIN: env.COOKIE_DOMAIN || 'localhost'
    }
  }

  setResponseCookies(res, axiosRes) {
    const cookies = setCookie.parse(axiosRes)
    for (const cookie of cookies) {
      const isXsrf = cookie.name === this.env.XSRF_COOKIE
      res.cookie(cookie.name, cookie.value, {
        path: cookie.path,
        secure: !this.env.IS_DEV,
        httpOnly: !isXsrf,
        sameSite: isXsrf,
        domain: this.env.COOKIE_DOMAIN
      })
    }
  }

  setJwtCookie(res, token) {
    res.cookie(this.env.JWT_COOKIE, token, {
      path: '/',
      domain: this.env.COOKIE_DOMAIN,
      secure: !this.env.IS_DEV,
      httpOnly: true
    })
  }

  clearJwtCookie(res) {
    res.clearCookie(this.env.JWT_COOKIE, {
      path: '/',
      domain: this.env.COOKIE_DOMAIN
    })
  }

  cookiesToHeaders(cookies) {
    return {
      'X-XSRF-TOKEN': cookies ? cookies[this.env.XSRF_COOKIE] || '' : ''
    }
  }

  getFormId(formVars) {
    if (formVars.vars) {
      formVars = formVars.vars
    }
    return 'form_' + (formVars.id || formVars.attr.id)
  }
}
