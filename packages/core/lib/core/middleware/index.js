import Middleware from '../../../middleware'
import { Utilities } from '../server'
import { name as contentModuleName } from '../storage/content'
import { compile } from '~/.nuxt/utils'

const MAX_REDIRECTS = process.env.MAX_REDIRECTS || 10
const logging = process.env.NODE_ENV === 'development'

Middleware.initErrorHandler = function({ store: { state }, error }) {
  if (state.error) {
    error(state.error)
  }
}

Middleware.routeLoader = async function({
  store: { state, commit, dispatch },
  route,
  redirect,
  error,
  res,
  $bwstarter
}) {
  const currentPath = $bwstarter.$storage.get(
    'getCurrentRoute',
    [],
    contentModuleName
  )

  // Middleware defined on pages - prevent route loading for each page depth
  const path = compile(route.path)(route.params) || '/'
  if (path === currentPath) {
    logging &&
      // eslint-disable-next-line no-console
      console.log(
        'Page not loading from API. Not required: already loaded current path',
        path
      )
    return
  }
  // eslint-disable-next-line no-console
  logging && console.log('Page loading ' + path)

  $bwstarter.$storage.commit('setCurrentRoute', [path], contentModuleName)

  let routeData, response
  try {
    response = await $bwstarter.getRoute(path)
    routeData = response.data
  } catch (err) {
    try {
      response = await $bwstarter.fetchAndStoreLayout(null, true)
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
    // eslint-disable-next-line no-console
    console.warn(routeData)
    error({
      statusCode: 500,
      message: 'Error fetching from API - No Route Data'
    })
    return
  }
  if (typeof routeData !== 'object') {
    // eslint-disable-next-line no-console
    console.warn(routeData)
    error({ statusCode: 500, message: 'API returned invalid JSON' })
    return
  }

  if (MAX_REDIRECTS) {
    let redirects = 0
    while (routeData.redirect && redirects <= MAX_REDIRECTS) {
      routeData = routeData.redirect
      redirects++
    }
    if (redirects > 0) {
      redirect(routeData.route)
      return
    }
  }
  // Sometimes the route can be returned but content is null due to the doctrine SQL Filters - database filters on content
  if (!routeData.staticPage && !routeData.dynamicContent) {
    error({
      statusCode: 404,
      message: 'Page Not Found',
      url: 'No content available'
    })
    return
  }
  await $bwstarter.initRoute(routeData)
}
