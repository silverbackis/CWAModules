import _omit from 'lodash/omit'
import { Storage } from './storage'
import { name as ADMIN_MODULE } from './storage/admin'
import { BWServer, Utilities } from './server'
import { name as contentModuleName } from './storage/content'
import { name as entitiesModuleName } from './storage/entities'

const logging = process.env.NODE_ENV === 'development'
// a user must still be authenticated when we try to refresh their token to avoid a 403 on the refresh request
// 30 minutes before the JWT token expires we will refresh it
const TOKEN_EXPIRE_BUFFER_SECS = 1700 // 43300
const TOKEN_KEY = 'token'
const DEFAULT_LAYOUT = '/layouts/default'

const stripContent = obj => {
  obj = Object.assign({}, obj, {
    componentLocations: obj.componentLocations.map(loc => loc['@id'])
  })
  delete obj.parent
  delete obj.layout
  return obj
}

function isObjectEmpty(obj) {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false
    }
  }
  return true
}

export default class BWStarter {
  constructor(ctx, options) {
    this.error = ctx.error
    this.redirect = ctx.redirect
    this.$axios = ctx.$axios
    this.loginRedirect = options.loginRedirect
    options.initialState = {
      error: null,
      apiUrl: process.env.API_URL_BROWSER + '/',
      notifications: []
    }
    options.initialState[TOKEN_KEY] = null
    this.$storage = new Storage(ctx, options)
    if (process.server) {
      this.__initSession(ctx)
    }
    this.__initInterceptor(ctx)
  }

  __initSession({ req: { session }, res }) {
    if (session && session.authToken) {
      Utilities.setJwtCookie(res, session.authToken)
      this.$storage.setState(TOKEN_KEY, session.authToken)
    }
  }

  __initInterceptor({ req, res }) {
    // --------
    // Private refresh functions
    // --------
    const handleRefreshError = async refreshError => {
      // eslint-disable-next-line no-console
      logging && console.warn('refreshError', refreshError)
      this.$storage.setState(TOKEN_KEY, null)
      try {
        // If we use axios to post to 127.0.0.1:80 server-side we get a connection error
        await BWServer.logout(req, res, false)
      } catch (e) {
        if (logging) {
          // eslint-disable-next-line no-console
          console.error(
            'Error logging out after failing to refresh JWT token',
            e
          )
        }
      }
      if (refreshError.statusCode >= 500 && refreshError.statusCode < 600) {
        return Promise.reject(refreshError)
      }
    }

    const serverRefresh = async config => {
      // eslint-disable-next-line no-console
      logging && console.log('Server authorisation refresh...')
      try {
        const result = await BWServer.jwtRefresh(req, res, false)
        this.$storage.setState(TOKEN_KEY, result)
        // eslint-disable-next-line no-console
        logging && console.log('Server authorisation refresh SUCCESS!')
      } catch (refreshError) {
        return handleRefreshError(refreshError, config)
      }
    }

    const clientRefresh = async config => {
      // eslint-disable-next-line no-console
      logging && console.log('Client authorisation refresh...')
      try {
        const { data } = await this.$axios.post(
          '/refresh_token',
          { _action: '/token/refresh' },
          { baseURL: null, refreshTokenRequest: true }
        )
        this.$storage.setState(TOKEN_KEY, data.token)
        // eslint-disable-next-line no-console
        logging && console.log('Client authorisation refresh SUCCESS!')
      } catch (refreshError) {
        return handleRefreshError(refreshError, config)
      }
    }

    // --------
    // Adjust requests to include auth + xsrf headers
    // --------
    const addHeaders = config => {
      const token = process.server
        ? req.session
          ? req.session.authToken
          : null
        : this.$storage.getState('token')
      if (token && config.withCredentials) {
        config.headers.Authorization = 'Bearer ' + token
      }
      if (process.server) {
        const headers = Utilities.cookiesToHeaders(req.cookies)
        config.headers = Object.assign(config.headers, headers)
      }
      return config
    }

    // --------
    // Intercept requests with expired token
    // --------
    let refreshingPromise = null
    this.$axios.interceptors.request.use(async config => {
      const urlRegEx = new RegExp('^https?://')
      const isFullURL = urlRegEx.test(config.url)
      if (isFullURL) {
        config.baseURL = null
      }
      const noBaseUrl = config.baseURL === null || config.baseURL === ''
      let isApiRequest = false
      if (!noBaseUrl) {
        const API_URL =
          (process.server
            ? process.env.API_URL
            : this.$storage.getState('apiUrl')) ||
          // eslint-disable-next-line no-console
          console.warn(
            'Could not find an API_URL variable for the $axios interceptor'
          )
        isApiRequest = API_URL ? API_URL.startsWith(config.baseURL) : false
      }
      if (!isApiRequest) {
        return config
      }

      const defaultConfig = {
        withCredentials: true
      }
      config = Object.assign({}, defaultConfig, config)

      if (refreshingPromise) {
        logging &&
          // eslint-disable-next-line no-console
          console.log(
            'Secondary request awaiting authorisation refresh to complete...'
          )
        await refreshingPromise
        // eslint-disable-next-line no-console
        logging && console.log('Secondary request continuing...')
      } else {
        // Add API request headers
        const authDiff = this.user ? this.user.exp - Date.now() / 1000 : null
        if (
          this.user &&
          authDiff < TOKEN_EXPIRE_BUFFER_SECS &&
          !config.refreshTokenRequest
        ) {
          // eslint-disable-next-line no-console
          logging && console.log('Refreshing authorisation...')
          refreshingPromise = new Promise(resolve => {
            const doRefresh = async () => {
              process.server
                ? await serverRefresh(config)
                : await clientRefresh(config)
            }
            doRefresh().then(() => {
              refreshingPromise = null
              resolve()
            })
          })
          await refreshingPromise
        }
      }
      return addHeaders(config)
    })
  }

  get token() {
    return this.$storage.getState(TOKEN_KEY)
  }

  get user() {
    return this.$storage.get('user')
  }

  request({
    url,
    data,
    cancelToken = null,
    method = 'GET',
    validateStatus = status => status >= 200 && status < 300
  }) {
    return new Promise((resolve, reject) => {
      this.$axios
        .request({
          url,
          method,
          data,
          cancelToken,
          validateStatus,
          progress: false
        })
        .then(response => {
          resolve(response)
        })
        .catch(err => {
          // eslint-disable-next-line no-console
          logging && console.warn(err)
          reject(err)
        })
    })
  }

  getRoute(route) {
    return this.request({ url: '/routes/' + route })
  }

  setResponseErrorPage(error) {
    if (error.response && error.response.status) {
      if (error.response.status === 401 && this.loginRedirect) {
        this.redirect(this.loginRedirect)
        return
      }
      this.error({
        statusCode: error.response.status,
        message: error.response.statusText,
        url: error.response.config.url
      })
    } else {
      this.error({
        statusCode: error.statusCode || 500,
        message: 'Unexpected server error',
        url: error.message
      })
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }

  async logout() {
    try {
      await this.$axios.post(
        '/logout',
        {},
        {
          baseURL: null
        }
      )
      this.$storage.setState(TOKEN_KEY, null)
      this.addNotification('You have successfully logged out')
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(err)
    }
  }

  get isAdmin() {
    return this.$storage.get('hasRole', ['ROLE_ADMIN'])
  }

  addNotification(message) {
    this.$storage.commit('addNotification', [message])
  }

  removeNotification(index) {
    this.$storage.commit('removeNotification', [index])
  }

  initAdminInput(data, force = false) {
    this.$storage.commit(
      'initAdminInput',
      [Object.assign({ force }, data)],
      ADMIN_MODULE
    )
  }

  destroyAdminInput(data) {
    this.$storage.commit('destroyAdminInput', [data], ADMIN_MODULE)
  }

  setAdminInputModel(data) {
    this.$storage.commit('setModel', [data], ADMIN_MODULE)
  }

  getAdminInputModel({ componentId, componentField }) {
    return this.$storage.get(
      'getInputModel',
      [{ componentId, componentField }],
      ADMIN_MODULE
    )
  }

  save(debounce = false) {
    return this.$storage.dispatch(
      debounce ? 'debouncedSave' : 'save',
      null,
      ADMIN_MODULE
    )
  }

  initRoute({ route, staticPage, dynamicContent, redirectedFrom, id }) {
    let content = staticPage || dynamicContent.dynamicPage
    const contentData = [stripContent(content)]
    const promises = [this.storeAndFetchLayout(content.layout, true)]
    while (content.parent) {
      contentData.unshift(stripContent(content.parent))
      promises.push(this.storeAndFetchLayout(content.parent.layout, false))
      content = content.parent
    }
    const dynamicData = _omit(dynamicContent, ['dynamicPage'])
    if (dynamicData) {
      this.$storage.commit(
        'setEntity',
        [{ id: dynamicData['@id'], data: dynamicData }],
        entitiesModuleName
      )
    }
    this.$storage.commit(
      'setRoute',
      [
        {
          route,
          data: contentData,
          dynamicData: dynamicData ? dynamicData['@id'] : null,
          redirectedFrom,
          id
        }
      ],
      contentModuleName
    )

    // --------
    // Request all components / layouts and add to a promises array
    // --------
    contentData.forEach(content => {
      if (content.componentLocations && content.componentLocations.length) {
        promises.push(this.fetchContent(content['@id']))
      }
    })
    return Promise.all(promises)
  }

  storeAndFetchLayout(layout, current = false) {
    if (!layout) {
      return this.fetchAndStoreLayout(layout, current)
    }
    this.storeLayoutContent(layout, current)
    return this.fetchLayout(layout['@id'])
  }

  async fetchAndStoreLayout(layout = null, current = false) {
    if (!layout) {
      layout = DEFAULT_LAYOUT
    }
    const response = await this.fetchLayout(layout)
    this.storeLayoutContent(response.data, current)
    return response
  }

  storeLayoutContent(layout, current = false) {
    this.$storage.commit(
      'setLayout',
      [{ id: layout['@id'], data: layout }],
      contentModuleName
    )
    if (current) {
      this.$storage.commit(
        'setCurrentLayout',
        [layout['@id']],
        contentModuleName
      )
    }
  }

  async fetchLayout(url) {
    // eslint-disable-next-line no-console
    logging && console.log('Fetch layout', url)
    const response = await this.request({ url })
    const layout = response.data
    this.$storage.commit(
      'setEntity',
      [{ id: layout['@id'], data: layout }],
      entitiesModuleName
    )
    if (layout.navBar) {
      const locations = [{ component: layout.navBar }]
      const entities = getEntitiesFromLocations(locations)
      this.setEntities(entities)
    }
    return response
  }

  async fetchContent(id) {
    const { data } = await this.request({ url: id })
    const entities = getEntitiesFromLocations(data.componentLocations)
    // When reloading component group, we want the group itself to update as well with new locations
    if (data['@type'] === 'ComponentGroup' || data.dynamic) {
      entities[data['@id']] = stripContent(data)
    }
    this.setEntities(entities)
    return data.componentLocations
  }

  // async updateContentComponents (contentId) {
  //   const componentLocations = await this.fetchContent(contentId)
  //   const entities = getEntitiesFromLocations(componentLocations)
  //   this.setEntities(entities)
  //   return componentLocations
  // }

  setEntities(components) {
    for (const [componentId, component] of Object.entries(components)) {
      if (component.collection) {
        const collectionEntities = Object.values(
          component.collection['hydra:member']
        )
        const collectionObj = collectionEntities.reduce((obj, item) => {
          obj[item['@id']] = item
          return obj
        }, {})
        this.setEntities(collectionObj)
        component.collection['hydra:member'] = component.collection[
          'hydra:member'
        ].map(item => item['@id'] || item)
      }
      if (componentId) {
        this.$storage.commit(
          'setEntity',
          [{ id: componentId, data: component }],
          entitiesModuleName
        )
      } else if (
        typeof component === 'string' &&
        !this.$storage.get('getEntity', component, entitiesModuleName)
      ) {
        // eslint-disable-next-line no-console
        console.error(
          'Cannot set an entity without a component ID and it does not already exist',
          componentId,
          component
        )
      }
    }
  }
}

const getEntitiesFromLocations = function(locations) {
  let entities = {}

  const processComponentGroup = componentGroup => {
    entities[componentGroup['@id']] = Object.assign({}, componentGroup, {
      componentLocations: componentGroup.componentLocations.map(
        loc => loc['@id']
      )
    })
    if (componentGroup.componentLocations) {
      entities = Object.assign(
        entities,
        getEntitiesFromLocations(componentGroup.componentLocations)
      )
    }
  }

  locations.forEach(_ => {
    const location = Object.assign({}, _)
    const component = Object.assign({}, location.component)
    const isComponentReference = typeof location.component === 'string'
    if (location['@id']) {
      entities[location['@id']] = Object.assign({}, location, {
        component: isComponentReference ? component : component['@id']
      })
    }
    if (isComponentReference) {
      logging &&
        // eslint-disable-next-line no-console
        console.log(
          'component found as string. it is probably already registered',
          component
        )
      return
    }
    if (isObjectEmpty(component)) {
      return
    }
    if (!component['@id']) {
      // eslint-disable-next-line no-console
      console.error(
        'ID not found for component - it is possible the entity was not returned as an API resource and needs to be configured for an IRI',
        component['@id'],
        component
      )
    }
    entities[component['@id']] = component

    if (component.componentGroups) {
      component.componentGroups.forEach(processComponentGroup)
      component.componentGroups = component.componentGroups.map(
        group => group['@id']
      )
    }

    if (
      component.childComponentGroup &&
      component.childComponentGroup.componentLocations.length
    ) {
      processComponentGroup(component.childComponentGroup)
    }
  })
  return entities
}
