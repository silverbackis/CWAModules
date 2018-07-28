import { Storage } from './storage'
import { name as ADMIN_MODULE } from './storage/admin'
import { BWServer, Utilities }  from './server'
import { name as contentModuleName } from './storage/content'
import { name as entitiesModuleName } from './storage/entities'
import _omit from 'lodash/omit'

const logging = process.env.NODE_ENV === 'development'
const TOKEN_EXPIRE_BUFFER_SECS = 10
const TOKEN_KEY = 'token'
const DEFAULT_LAYOUT = '/layouts/default'

export default class BWStarter {
  constructor (ctx, options) {
    this.error = ctx.error;
    this.$axios = ctx.$axios;
    options.initialState = {
      error: null,
      apiUrl: process.env.API_URL_BROWSER + '/',
      notifications: []
    };
    options.initialState[TOKEN_KEY] = null;
    this.$storage = new Storage(ctx, options);
    if (process.server) {
      this.__initSession(ctx)
    }
    this.__initInterceptor(ctx)
  }

  __initSession ({ req: { session }, res }) {
    if (session && session.authToken) {
      Utilities.setJwtCookie(res, session.authToken);
      this.$storage.setState(TOKEN_KEY, session.authToken)
    }
  }

  __initInterceptor ({ req, res }) {
    // --------
    // Private refresh functions
    // --------
    const handleRefreshError = async (refreshError) => {
      await this.logout()
      logging && console.warn('refreshError', refreshError);
      if (refreshError.statusCode >= 500 && refreshError.statusCode < 600) {
        return Promise.reject(refreshError)
      }
    };

    const serverRefresh = async (config) => {
      try {
        let result = await BWServer.jwtRefresh(req, res, false)
        this.$storage.setState(TOKEN_KEY, result)
      } catch (refreshError) {
        return handleRefreshError(refreshError, config)
      }
    };

    const clientRefresh = async (config) => {
      try {
        let { data } = await this.$axios.post(
          'refresh_token',
          { _action: '/token/refresh' },
          { baseURL: null, refreshTokenRequest: true }
        )
        this.$storage.setState(TOKEN_KEY, data.token)
      } catch (refreshError) {
        return handleRefreshError(refreshError, config)
      }
    };

    // --------
    // Adjust requests to include auth + xsrf headers
    // --------
    const addHeaders = (config) => {
      const token = process.server ? req.session.authToken : this.$storage.getState('token')
      if (token) {
        config.headers.Authorization = 'Bearer ' + token
      }
      if (process.server) {
        let headers = Utilities.cookiesToHeaders(req.cookies)
        config.headers = Object.assign(config.headers, headers)
      }
      return config
    };

    // --------
    // Intercept requests with expired token
    // --------
    this.$axios.interceptors.request.use(async (config) => {
      const noBaseUrl = (config.baseURL === null || config.baseURL === '');
      let isApiRequest = false
      if (!noBaseUrl) {
        const API_URL = process.server ? process.env.API_URL : this.$storage.getState('apiUrl');
        isApiRequest = API_URL.startsWith(config.baseURL)
      }
      if (!isApiRequest) {
        return config
      }

      // Add API request headers
      const authDiff = this.user ? this.user.exp - (Date.now() / 1000) : null;
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
      this.error({statusCode: error.response.status, message: error.response.statusText, url: error.response.config.url})
    } else {
      this.error({statusCode: error.statusCode || 500, message: 'Unexpected server erroror', url: error.message})
      console.error(error)
    }
  }

  logout () {
    this.$axios.post('/logout',
      {},
      {
        baseURL: null
      }
    )
      .then(() => {
        this.$storage.setState(TOKEN_KEY, null)
        this.addNotification('You have successfully logged out')
        // this.$cookie.delete('PHPSESSID')
      })
      .catch((err) => {
        console.warn(err)
      })
  }

  get isAdmin () {
    return this.$storage.get('hasRole', ['ROLE_ADMIN'])
  }

  addNotification (message) {
    this.$storage.commit('addNotification', [message])
  }

  removeNotification (index) {
    this.$storage.commit('removeNotification', [index])
  }

  initAdminInput (data) {
    this.$storage.commit('initAdminInput', [data], ADMIN_MODULE)
  }

  destroyAdminInput (data) {
    this.$storage.commit('destroyAdminInput', [data], ADMIN_MODULE)
  }

  setAdminInputModel (data) {
    this.$storage.commit('setModel', [data], ADMIN_MODULE)
  }

  save (debounce = false) {
    return this.$storage.dispatch(debounce ? 'debouncedSave' : 'save', null, ADMIN_MODULE)
  }

  initRoute ({ route, content }) {
    // NEW
    const stripContent = (obj) => {
      obj = Object.assign({}, obj);
      delete obj.parent;
      delete obj.layout;
      return obj
    };
    let contentData = [stripContent(content)];
    let fetchLayoutPromise = this.initLayoutFromContent(content, true);
    while (content.parent) {
      contentData.unshift(stripContent(content));
      this.initLayoutFromContent(content, false);
      content = content.parent
    }
    this.$storage.commit('setRoute', [{route, data: contentData}], contentModuleName);
    // --------
    // Request all components / layouts and add to a promises array
    // --------
    let promises = [
      fetchLayoutPromise
    ];
    contentData.forEach((content) => {
      if (content.componentLocations && content.componentLocations.length) {
        promises.push(this.getContent(content))
      }
    });
    return Promise.all(promises)
      .then(() => {
        this.$storage.commit('setLoadedRoute', [route], contentModuleName);
      })
    ;
  }

  initLayoutFromContent (content, current = false) {
    this.$storage.commit('setLayout', [{id: content.layout['@id'], data: content.layout}], contentModuleName);
    if (current) {
      this.$storage.commit('setCurrentLayout', [content.layout['@id']], contentModuleName)
    }
    return this.getLayout(content.layout['@id'])
  }

  async getLayout (url = DEFAULT_LAYOUT) {
    let response = await this.request({ url });
    const data = response.data;
    this.$storage.commit('setEntity', [{id: data['@id'], data}], entitiesModuleName);
    if (data.navBar) {
      const locations = [{ component: data.navBar }];
      const entities = getEntitiesFromLocations(locations);
      this.setEntities(entities)
    }
    return response
  }

  async getContent (content) {
    let { data: { componentLocations } } = await this.request({ url: content['@id'] })
    let entities = getEntitiesFromLocations(componentLocations)
    this.setEntities(entities)
  }

  setEntities (components) {
    for(let [componentId, component] of Object.entries(components)) {
      if(component.collection) {
        const collectionObj = component.collection.reduce((obj, item) => {
          obj[item['@id']] = item
          return obj
        }, {})
        this.setEntities(collectionObj)
        component = Object.assign({}, component, {
          collection: Array.from(component.collection, item => item['@id'] || item)
        })
      }
      this.$storage.commit('setEntity', [{id: componentId, data: component}], entitiesModuleName)
    }
  }
}

const getEntitiesFromLocations = function (locations) {
  let entities = {}
  locations.forEach((location) => {
    const component = location.component;
    if (location['@id']) {
      entities[location['@id']] = _omit(location, ['component']);
    }
    entities[component['@id']] = component;

    if (component.componentGroups) {
      component.componentGroups.forEach(({ componentLocations }) => {
        if (componentLocations) {
          entities = Object.assign(entities, getEntitiesFromLocations(componentLocations))
        }
      });
    }

    if (component.childComponentGroup && component.childComponentGroup.componentLocations.length) {
      entities = Object.assign(entities, getEntitiesFromLocations(component.childComponentGroup.componentLocations))
    }
  });
  return entities;
};
