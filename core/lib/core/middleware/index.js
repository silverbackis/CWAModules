import Middleware from '../../../middleware'
import { compile } from '~/.nuxt/utils'
import { Utilities } from '../server'

const MAX_REDIRECTS = process.env.MAX_REDIRECTS || 10
const logging = process.env.NODE_ENV === 'development'

Middleware.initErrorHandler = function ({ store: { state }, error }) {
  if (state.error) {
    error(state.error)
  }
}

Middleware.routeLoader = async function ({ store: { state, commit, dispatch }, route, redirect, error, res, $bwstarter }) {
  const currentPath = state.bwstarter.currentRoute
  // Middleware defined on pages - prevent route loading for each page depth
  const path = compile(route.path)(route.params) || '/'
  if (path === currentPath) {
    logging && console.log('Page not loading, already at path ' + path)
    return
  }
  commit('bwstarter/SET', { key: 'currentRoute', value: path })
  let routeData, response
  try {
    response = await $bwstarter.getRoute(path)
    routeData = response.data
  } catch (err) {
    try {
      response = await $bwstarter.getLayout()
    } catch (err) {
      $bwstarter.setResponseErrorPage(err)
      return
    }
    process.server && Utilities.setResponseCookies(res, response)
    $bwstarter.setResponseErrorPage(err)
    return
  }
  process.server && Utilities.setResponseCookies(res, response)

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
      return
    }
  }

  await $bwstarter.initRoute(routeData)
}
