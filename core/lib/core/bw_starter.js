import { Storage, LAYOUTS_MODULE, COMPONENTS_MODULE } from './storage'
import RefreshToken from './refresh_token'
import { cookiesToHeaders } from './utilities'

const logging = process.env.NODE_ENV === 'development';
const TOKEN_EXPIRE_BUFFER_SECS = 10;
const TOKEN_KEY = 'token';
const DEFAULT_LAYOUT = '/layouts/default'

const flattenComponentData = function (locations) {
  let components = {}
  locations.forEach(({ component }) => {
    components[component['@id']] = component
    component.componentGroups.forEach(({ componentLocations }) => {
      if (componentLocations) {
        components = Object.assign(components, flattenComponentData(componentLocations))
      }
    })
    if (component.childComponentGroup) {
      components = Object.assign(components, flattenComponentData(component.childComponentGroup.componentLocations))
    }
  })
  return components
};

export default class BWStarter {
  constructor (ctx, options) {
    // this.options = options
    this.$axios = ctx.$axios
    options.initialState = {
      error: null,
      apiUrl: process.env.API_URL_BROWSER + '/',
      content: []
    };
    options.initialState[TOKEN_KEY] = null;
    this.$storage = new Storage(ctx, options);
    this.__initInterceptor(ctx);
  }

  __initInterceptor({ req, res }) {
    // --------
    // Private refresh functions
    // --------
    const handleRefreshError = (refreshError) => {
      this.$storage.setState(TOKEN_KEY, null);
      logging && console.warn('refreshError', refreshError);
      if (refreshError.statusCode >= 500 && refreshError.statusCode < 600) {
        return Promise.reject(refreshError)
      }
    };

    const serverRefresh = async () => {
      try {
        let result = await RefreshToken(req, res, false);
        this.$storage.setState(TOKEN_KEY, result)
      } catch (refreshError) {
        return handleRefreshError(refreshError)
      }
    };

    const clientRefresh = async () => {
      try {
        let { data } = await this.$axios.post(
          'refresh_token',
          { _action: '/token/refresh' },
          { baseURL: null, refreshTokenRequest: true }
        )
        this.$storage.setState(TOKEN_KEY, data.token)
      } catch (refreshError) {
        return handleRefreshError(refreshError)
      }
    };

    // --------
    // Adjust requests to include auth + xsrf headers
    // --------
    const addHeaders = (config) => {
      const token = process.server ? req.session.authToken : this.$storage.getState('token');
      if (token) {
        config.headers.Authorization = 'Bearer ' + token
      }
      if (process.server) {
        let headers = cookiesToHeaders(req.cookies);
        config.headers = Object.assign(config.headers, headers)
      }
      return config
    };

    // --------
    // Intercept requests with expired token
    // --------
    this.$axios.interceptors.request.use(async (config) => {
      const authDiff = this.user ? this.user.exp - (Date.now() / 1000) : null;
      if (
        this.user &&
        authDiff < TOKEN_EXPIRE_BUFFER_SECS &&
        !config.refreshTokenRequest
      ) {
        process.server ? await serverRefresh() : await clientRefresh()
      }
      return addHeaders(config)
    })
  }

  get token () {
    return this.$storage.getState(TOKEN_KEY);
  }

  get user () {
    return this.$storage.get('user');
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
          reject(err)
        })
    })
  }

  getAll (urls) {
    return Promise.all(urls.map(url => this.request({ url })))
  }

  getRoute (route) {
    return this.request({ url: '/routes/' + route })
  }

  async getLayout (url=DEFAULT_LAYOUT) {
    let response = await this.request({ url })
    const data = response.data
    this.$storage.setState(data['@id'], data, LAYOUTS_MODULE)
    if (data.navBar) {
      const components = flattenComponentData([{ component: data.navBar }])
      this.setComponents(components)
    }
    return response
  }

  initRoute ({ content }) {
    // --------
    // Reverse content nesting
    // --------
    const withoutParent = (obj) => {
      obj = Object.assign({}, obj)
      delete obj.parent
      return obj
    };
    let contentArray = [withoutParent(content)]
    while (content.parent) {
      contentArray.unshift(withoutParent(content.parent))
      content = content.parent
    }

    this.$storage.setState('content', contentArray)

    // --------
    // Request all components / layouts and add to a promises array
    // --------
    let promises = []
    contentArray.forEach((page) => {
      if (page.componentLocations.length) {
        promises.push(this.initPage(page))
      }
    })

    if (!content.layout) {
      console.warn('No layout set and no default layout found')
    } else {
      if (content.layout) {
        promises.push(this.getLayout(content.layout['@id']))
      }
    }

    return Promise.all(promises)
  }

  async initPage (page) {
    let { data: { componentLocations } } = await this.request({ url: page['@id'] })
    let components = flattenComponentData(componentLocations)
    this.setComponents(components)
  }

  setComponents (components) {
    Object.keys(components).forEach((componentId) => {
      this.$storage.setState(componentId, components[componentId], COMPONENTS_MODULE);
    })
  }
}
