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
  route,
  redirect,
  error,
  res,
  $bwstarter,
  isClient
}) {
  const currentPath = $bwstarter.$storage.get(
    'getCurrentRoute',
    [],
    contentModuleName
  )

  // Middleware defined on pages - prevent route loading for each page depth
  const path = compile(route.path)(route.params) || '/'
  if (path === currentPath) {
    const currentPromise =
      $bwstarter.$storage.state[contentModuleName].pageLoadPromise
    if (!currentPromise) {
      logging &&
        // eslint-disable-next-line no-console
        console.log(
          'Page not loading from API. Not required: already loaded current path',
          path
        )
      await $bwstarter.$storage.state[contentModuleName].pageLoadPromise
      return
    }
  }
  // eslint-disable-next-line no-console
  logging && console.log('Page loading ' + path)
  const qsSplit = route.fullPath.split('?')
  const query = qsSplit.length > 1 ? qsSplit[1] : null

  $bwstarter.$storage.commit('setCurrentRoute', [path], contentModuleName)
  const pageLoadPromise = new Promise(resolve => {
    ;(async () => {
      let routeData, response
      try {
        response = await $bwstarter.getRoute(path, query)
        routeData = response.data
      } catch (err) {
        try {
          response = await $bwstarter.fetchAndStoreLayout(null, true)
        } catch (err) {
          $bwstarter.setResponseErrorPage(err)
          resolve()
          return
        }
        process.server && Utilities.setResponseCookies(res, response)
        $bwstarter.setResponseErrorPage(err)
        resolve()
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
        resolve()
        return
      }
      if (typeof routeData !== 'object') {
        // eslint-disable-next-line no-console
        console.warn(routeData)
        error({ statusCode: 500, message: 'API returned invalid JSON' })
        resolve()
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
          resolve()
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
        resolve()
        return
      }
      await $bwstarter.initRoute(routeData, query)
      resolve()
    })()
  })
  $bwstarter.$storage.commit(
    'setPageLoadPromise',
    [pageLoadPromise],
    contentModuleName
  )
  return pageLoadPromise
}
