import setCookie from 'set-cookie-parser'

const JWT_COOKIE = process.env.JWT_COOKIE || 'TKN'
const XSRF_COOKIE = process.env.XSRF_HEADER || 'XSRF-TOKEN'
const IS_DEV = process.env.NODE_ENV === 'development'
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || 'localhost'

export const setResponseCookies = function(res, axiosRes) {
  let cookies = setCookie.parse(axiosRes)
  for (let cookie of cookies) {
    const isXsrf = cookie.name === XSRF_COOKIE
    res.cookie(cookie.name, cookie.value, { path: cookie.path, secure: !IS_DEV, httpOnly: !isXsrf, sameSite: isXsrf, domain: COOKIE_DOMAIN })
  }
}

export const setJwtCookie = function(res, token) {
  res.cookie(JWT_COOKIE, token, { path: '/', domain: COOKIE_DOMAIN, secure: !IS_DEV, httpOnly: true })
}

export const clearJwtCookie = function(res) {
  res.clearCookie(JWT_COOKIE, { path: '/', domain: COOKIE_DOMAIN })
}

export const cookiesToHeaders = function(cookies) {
  return {
    'X-XSRF-TOKEN': cookies[XSRF_COOKIE] || '',
    'Cookie': 'PHPSESSID=' + cookies['PHPSESSID'] || ''
  }
}

export function getFormId (formVars) {
  if (formVars.vars) {
    formVars = formVars.vars
  }
  return 'form_' + (formVars.id || formVars.attr.id)
}
