import { Storage } from './storage'
import { name as ADMIN_MODULE } from './storage/admin'
import { BWServer, Utilities } from './server'
import { name as contentModuleName } from './storage/content'
import { name as entitiesModuleName } from './storage/entities'

const logging = process.env.NODE_ENV === 'development'
// a user must still be authenticated when we try to refresh their token to avoid a 403 on the refresh request
// 1 day before the JWT token expires we will refresh it
const TOKEN_EXPIRE_BUFFER_SECS = 86400
const TOKEN_KEY = 'token'
const DEFAULT_LAYOUT = '/layouts/default'

const stripContent = (obj) => {
  obj = Object.assign({}, obj, {
    componentLocations: obj.componentLocations.map((loc) => loc[ '@id' ])
  })
  delete obj.parent
  delete obj.layout
  return obj
}

export default class BWStarter {
  constructor (ctx, options) {
    this.error = ctx.error
    this.$axios = ctx.$axios
    options.initialState = {
      error: null,
      apiUrl: process.env.API_URL_BROWSER + '/',
      notifications: []
    }
    options.initialState[ TOKEN_KEY ] = null
    this.$storage = new Storage(ctx, options)
    if (process.server) {
      this.__initSession(ctx)
    }
    this.__initInterceptor(ctx)
  }

  __initSession ({ req: { session }, res }) {
    if (session && session.authToken) {
      Utilities.setJwtCookie(res, session.authToken)
      this.$storage.setState(TOKEN_KEY, session.authToken)
    }
  }

  __initInterceptor ({ req, res }) {
    // --------
    // Private refresh functions
    // --------
    const handleRefreshError = async (refreshError) => {
      logging && console.warn('refreshError', refreshError)
      this.$storage.setState(TOKEN_KEY, null)
      try {
        // If we use axios to post to 127.0.0.1:80 server-side we get a connection error
        await BWServer.logout(req, res, false)
      } catch (e) {
        logging && console.error('Error logging out after failing to refresh JWT token', e)
      }
      if (refreshError.statusCode >= 500 && refreshError.statusCode < 600) {
        return Promise.reject(refreshError)
      }
    }

    const serverRefresh = async (config) => {
      try {
        let result = await BWServer.jwtRefresh(req, res, false)
        this.$storage.setState(TOKEN_KEY, result)
      } catch (refreshError) {
        return handleRefreshError(refreshError, config)
      }
    }

    const clientRefresh = async (config) => {
      try {
        let { data } = await this.$axios.post(
          '/refresh_token',
          { _action: '/token/refresh' },
          { baseURL: null, refreshTokenRequest: true }
        )
        this.$storage.setState(TOKEN_KEY, data.token)
      } catch (refreshError) {
        return handleRefreshError(refreshError, config)
      }
    }

    // --------
    // Adjust requests to include auth + xsrf headers
    // --------
    const addHeaders = (config) => {
      const token = process.server ? (req.session ? req.session.authToken : null) : this.$storage.getState('token')
      if (token) {
        config.headers.Authorization = 'Bearer ' + token
      }
      if (process.server) {
        let headers = Utilities.cookiesToHeaders(req.cookies)
        config.headers = Object.assign(config.headers, headers)
      }
      return config
    }

    // --------
    // Intercept requests with expired token
    // --------
    this.$axios.interceptors.request.use(async (config) => {
      const noBaseUrl = (config.baseURL === null || config.baseURL === '')
      let isApiRequest = false
      if (!noBaseUrl) {
        const API_URL = process.server ? process.env.API_URL : this.$storage.getState('apiUrl')
        isApiRequest = API_URL.startsWith(config.baseURL)
      }
      if (!isApiRequest) {
        return config
      }

      // Add API request headers
      const authDiff = this.user ? this.user.exp - (Date.now() / 1000) : null
      if (
        this.user &&
        authDiff < TOKEN_EXPIRE_BUFFER_SECS &&
        !config.refreshTokenRequest
      ) {
        process.server ? await serverRefresh(config) : await clientRefresh(config)
      }
      return addHeaders(config)
    })
  }

  get token () {
    return this.$storage.getState(TOKEN_KEY)
  }

  get user () {
    return this.$storage.get('user')
  }

  request ({ url, data, cancelToken = null, method = 'GET', validateStatus = status => (status >= 200 && status < 300) }) {
    return new Promise((resolve, reject) => {
      this.$axios
        .request({
          url,
          method,
          data,
          cancelToken,
          validateStatus
        })
        .then((response) => {
          resolve(response)
        })
        .catch((err) => {
          logging && console.warn(err)
          reject(err)
        })
    })
  }

  getRoute (route) {
    return this.request({ url: '/routes/' + route })
  }

  setResponseErrorPage (error) {
    if (error.response && error.response.status) {
      this.error({ statusCode: error.response.status, message: error.response.statusText, url: error.response.config.url })
    } else {
      this.error({ statusCode: error.statusCode || 500, message: 'Unexpected server error', url: error.message })
      console.error(error)
    }
  }

  async logout () {
    try {
      await this.$axios.post('/logout',
        {},
        {
          baseURL: null
        }
      )
      this.$storage.setState(TOKEN_KEY, null)
      this.addNotification('You have successfully logged out')
    } catch (err) {
      console.warn(err)
    }
  }

  get isAdmin () {
    return this.$storage.get('hasRole', [ 'ROLE_ADMIN' ])
  }

  addNotification (message) {
    this.$storage.commit('addNotification', [ message ])
  }

  removeNotification (index) {
    this.$storage.commit('removeNotification', [ index ])
  }

  initAdminInput (data, force = false) {
    this.$storage.commit('initAdminInput', [ Object.assign({ force }, data) ], ADMIN_MODULE)
  }

  destroyAdminInput (data) {
    this.$storage.commit('destroyAdminInput', [ data ], ADMIN_MODULE)
  }

  setAdminInputModel (data) {
    this.$storage.commit('setModel', [ data ], ADMIN_MODULE)
  }

  getAdminInputModel ({ componentId, componentField }) {
    return this.$storage.get('getInputModel', [ { componentId, componentField } ], ADMIN_MODULE)
  }

  save (debounce = false) {
    return this.$storage.dispatch(debounce ? 'debouncedSave' : 'save', null, ADMIN_MODULE)
  }

  initRoute ({ route, content }) {
    let contentData = [ stripContent(content) ]
    let promises = [ this.storeAndFetchLayout(content.layout, true) ]
    while (content.parent) {
      contentData.unshift(stripContent(content.parent))
      promises.push(this.storeAndFetchLayout(content.parent.layout, false))
      content = content.parent
    }
    this.$storage.commit('setRoute', [ { route, data: contentData } ], contentModuleName)
    // --------
    // Request all components / layouts and add to a promises array
    // --------
    contentData.forEach((content) => {
      if (content.componentLocations && content.componentLocations.length) {
        promises.push(this.fetchContent(content[ '@id' ]))
      }
    })
    return Promise.all(promises)
  }

  storeAndFetchLayout (layout, current = false) {
    this.storeLayoutContent(layout, current)
    return this.fetchLayout(layout[ '@id' ])
  }

  async fetchAndStoreLayout (layout = null, current = false) {
    if (!layout) {
      layout = DEFAULT_LAYOUT
    }
    let response = await this.fetchLayout(layout)
    this.storeLayoutContent(response.data, current)
    return response
  }

  storeLayoutContent (layout, current = false) {
    this.$storage.commit('setLayout', [ { id: layout[ '@id' ], data: layout } ], contentModuleName)
    if (current) {
      this.$storage.commit('setCurrentLayout', [ layout[ '@id' ] ], contentModuleName)
    }
  }

  async fetchLayout (url) {
    let response = await this.request({ url })
    const layout = response.data
    this.$storage.commit('setEntity', [ { id: layout[ '@id' ], data: layout } ], entitiesModuleName)
    if (layout.navBar) {
      const locations = [ { component: layout.navBar } ]
      const entities = getEntitiesFromLocations(locations)
      this.setEntities(entities)
    }
    return response
  }

  async fetchContent (id) {
    let { data } = await this.request({ url: id })
    let entities = getEntitiesFromLocations(data.componentLocations)
    // When reloading component group, we want the group itself to update as well with new locations
    if (data[ '@type' ] === 'ComponentGroup') {
      entities[ data[ '@id' ] ] = stripContent(data)
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

  setEntities (components) {
    for (let [ componentId, component ] of Object.entries(components)) {
      if (component.collection) {
        const collectionObj = component.collection.reduce((obj, item) => {
          obj[ item[ '@id' ] ] = item
          return obj
        }, {})
        this.setEntities(collectionObj)
        component = Object.assign({}, component, {
          collection: Array.from(component.collection, item => item[ '@id' ] || item)
        })
      }
      this.$storage.commit('setEntity', [ { id: componentId, data: component } ], entitiesModuleName)
    }
  }
}

const getEntitiesFromLocations = function (locations) {
  let entities = {}

  const processComponentGroup = (componentGroup) => {
    entities[ componentGroup[ '@id' ] ] = Object.assign({}, componentGroup, {
      componentLocations: componentGroup.componentLocations.map((loc) => loc[ '@id' ])
    })
    if (componentGroup.componentLocations) {
      entities = Object.assign(entities, getEntitiesFromLocations(componentGroup.componentLocations))
    }
  }

  locations.forEach((_) => {
    const location = Object.assign({}, _)
    const component = Object.assign({}, location.component)
    if (location[ '@id' ]) {
      entities[ location[ '@id' ] ] = Object.assign({}, location, { component: component[ '@id' ] })
    }
    entities[ component[ '@id' ] ] = component

    if (component.componentGroups) {
      component.componentGroups.forEach(processComponentGroup)
      component.componentGroups = component.componentGroups.map((group) => group[ '@id' ])
    }

    if (component.childComponentGroup && component.childComponentGroup.componentLocations.length) {
      processComponentGroup(component.childComponentGroup)
    }
  })
  return entities
}
