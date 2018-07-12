import Vue from 'vue'
import jwtDecode from 'jwt-decode'
import _ from 'lodash'
import ADMIN_STORE from './admin'
import FORM_STORE from './form'
import COMPONENT_STORE from './components'
import LAYOUT_STORE from './layouts'
const { join } = require('path')

// DEPRECATED CONSTANTS - NEED TO REFACTOR VARS IN ALL MODULES
export const LAYOUTS_MODULE = LAYOUT_STORE.name
export const COMPONENTS_MODULE = COMPONENT_STORE.name
export const FORMS_MODULE = FORM_STORE.name
export const ADMIN_MODULE = ADMIN_STORE.name

export class Storage {
  constructor (ctx, options) {
    this.ctx = ctx
    this.options = options
    this.__initModules()
  }

  preserveModuleState (modules = []) {
    const BreakException = {}
    let state = this.ctx.store.state[this.options.vuex.namespace]
    try {
      modules.forEach((m) => {
        if (!state[m]) {
          throw BreakException
        }
        state = state[m]
      })
    } catch (BreakException) {
      return false
    }
    return Boolean(state)
  }

  __initModules () {
    const storeModule = {
      namespaced: true,
      state: () => this.options.initialState,
      getters: {
        user: state => state.token ? jwtDecode(state.token) : null,
        getApiUrl: (state) => (path) => {
          return state.apiUrl + _.trimStart(path, '/')
        },
        getContent: state => (depth) => {
          return state.content ? (state.content[depth] || false) : false
        },
        getContentById: state => (id) => {
          if (!state.content) {
            return null
          }
          for(let content of state.content) {
            if (content['@id'] === id) {
              return content
            }
          }
          return null
        },
        userRoles: (state, getters) => {
          const user = getters.user
          return user ? user.roles : []
        },
        hasRole: (state, getters) => (role) => {
          const roles = getters.userRoles
          return roles.indexOf(role) !== -1
        }
      },
      mutations: {
        SET (state, { key, value }) {
          Vue.set(state, key, value)
        },
        addNotification (state, msg) {
          let noti = {
            id: new Date().getTime() + ':' + state.notifications.length,
            message: msg
          }
          state.notifications.push(noti)
        },
        removeNotification (state, index) {
          state.notifications.splice(index, 1)
        },
        clearNotifications (state) {
          state.notifications = {}
        },
        setContentById (state, { id, data }) {
          for(const [ key, content ] of Object.entries(state.content)) {
            if(content['@id'] === id) {
              Vue.set(state['content'], key, data)
              return
            }
          }
        }
      }
    }
    this.ctx.store.registerModule(this.options.vuex.namespace, storeModule, {
      preserveState: this.preserveModuleState()
    })

    const modules = [ COMPONENT_STORE, LAYOUT_STORE, FORM_STORE, ADMIN_STORE ]
    modules.forEach((store) => {
      this.ctx.store.registerModule([this.options.vuex.namespace, store.name], Object.assign({ namespaced: true }, store.store), {
        preserveState: this.preserveModuleState(store.name)
      })
    })

    this.state = this.ctx.store.state[this.options.vuex.namespace]
  }

  setState (key, value, modules = []) {
    this.commit('SET', [{
      key,
      value
    }], modules)
    return value
  }

  getState (key) {
    return this.state[key]
  }

  commit (mutation, args = [], modules = []) {
    let path = [ this.options.vuex.namespace, ...modules, mutation ]
    this.ctx.store.commit(join(...path), ...args)
  }

  get (method, args = [], modules = []) {
    let path = [ this.options.vuex.namespace, ...modules, method ]
    let value = this.ctx.store.getters[join(...path)]
    if (!(value instanceof Function)) {
      return value
    }
    return value(...args)
  }

  dispatch (action, args = {}, modules = []) {
    let path = [ this.options.vuex.namespace, ...modules, action ]
    return this.ctx.store.dispatch(join(...path), args)
  }
}

export default Storage
