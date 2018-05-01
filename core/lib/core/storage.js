import Vue from 'vue'
import jwtDecode from 'jwt-decode'
import _ from 'lodash'
import { actions as formActions, getters as formGetters, mutations as formMutations } from './storage_form'
import { state as adminState, actions as adminActions, getters as adminGetters, mutations as adminMutations } from './storage_admin'
const { join } = require('path')

export const LAYOUTS_MODULE = ['layouts']
export const COMPONENTS_MODULE = ['components']
export const FORMS_MODULE = ['forms']
export const ADMIN_MODULE = ['admin']

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
        }
      }
    }
    this.ctx.store.registerModule(this.options.vuex.namespace, storeModule, {
      preserveState: this.preserveModuleState()
    })
    this.__initComponentsModule()
    this.__initLayoutsModule()
    this.__initFormsModule()
    this.__initAdminModule()
    this.state = this.ctx.store.state[this.options.vuex.namespace]
  }

  __initComponentsModule () {
    const componentsModule = {
      namespaced: true,
      state: () => ({}),
      getters: {
        getComponent: state => (id) => {
          return state[id] || null
        }
      },
      mutations: {
        SET (state, { key, value }) {
          Vue.set(state, key, value)
        }
      }
    }
    this.ctx.store.registerModule([this.options.vuex.namespace, ...COMPONENTS_MODULE], componentsModule, {
      preserveState: this.preserveModuleState(COMPONENTS_MODULE)
    })
  }

  __initLayoutsModule () {
    const layoutsModule = {
      namespaced: true,
      state: () => {
        return {
          current: null,
          data: {}
        }
      },
      getters: {
        getLayout (state) {
          return state.current ? state.data[state.current] : null
        }
      },
      mutations: {
        SET (state, { key, value }) {
          let isData = state[key] === undefined
          if (isData) {
            Vue.set(state.data, key, value)
            Vue.set(state, 'current', key)
          } else {
            Vue.set(state, key, value)
          }
        }
      }
    }
    this.ctx.store.registerModule([this.options.vuex.namespace, ...LAYOUTS_MODULE], layoutsModule, {
      preserveState: this.preserveModuleState(LAYOUTS_MODULE)
    })
  }

  __initFormsModule () {
    const storeModule = {
      namespaced: true,
      state: () => ({}),
      getters: formGetters,
      mutations: formMutations,
      actions: formActions
    }
    this.ctx.store.registerModule([this.options.vuex.namespace, ...FORMS_MODULE], storeModule, {
      preserveState: this.preserveModuleState(FORMS_MODULE)
    })
  }

  __initAdminModule () {
    const storeModule = {
      namespaced: true,
      state: adminState,
      getters: adminGetters,
      mutations: adminMutations,
      actions: adminActions
    }
    this.ctx.store.registerModule([this.options.vuex.namespace, ...ADMIN_MODULE], storeModule, {
      preserveState: this.preserveModuleState(ADMIN_MODULE)
    })
  }

  commit (mutation, args = [], modules = []) {
    let path = [ this.options.vuex.namespace, ...modules, mutation ]
    this.ctx.store.commit(join(...path), ...args)
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
