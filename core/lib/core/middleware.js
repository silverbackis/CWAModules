import Middleware from '../middleware'
import { compile } from '~/.nuxt/utils'
import { setResponseCookies } from './utilities'

const MAX_REDIRECTS = process.env.MAX_REDIRECTS || 10

Middleware.initErrorHandler = function ({ store: { state }, error }) {
  if (state.error) {
    error(state.error)
  }
};

Middleware.routeLoader = async function ({ store: { state, commit, dispatch }, route, redirect, error, res }) {
  // Middleware defined on pages - prevent route loading for each page depth
  const path = compile(route.path)(route.params) || '/'
  if (path === state.currentRoute) {
    return
  }
  commit('setCurrentRoute', path)
  let routeData, response
  try {
    response = await dispatch('fetchRoute', { path })
    routeData = response.data
  } catch (err) {
    response = await dispatch('layout/init')
    process.server && setResponseCookies(res, response)

    if (err.response && err.response.status) {
      error({statusCode: err.response.status, message: err.response.statusText})
    } else {
      error({statusCode: err.statusCode || 500, message: 'Error fetching from API (routeLoader)'})
      console.warn(err)
    }
    return
  }
  process.server && setResponseCookies(res, response)

  if (!routeData) {
    console.warn(routeData)
    error({statusCode: 500, message: 'Error fetching from API - No Route Data'})
    return
  }
  if (typeof routeData !== 'object') {
    console.warn(routeData)
    error({statusCode: 500, message: 'API returned invalid JSON'})
    return
  }

  if (MAX_REDIRECTS) {
    let redirects = 0
    while (
      routeData.redirect &&
      redirects <= MAX_REDIRECTS
      ) {
      routeData = routeData.redirect
      redirects++
    }
    if (redirects) {
      redirect(routeData.route)
    }
  }

  await dispatch('initRoute', routeData)
};
