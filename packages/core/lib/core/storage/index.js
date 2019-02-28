import Vue from 'vue'
import jwtDecode from 'jwt-decode'
import _trimStart from 'lodash/trimStart'
import ADMIN_STORE from './admin'
import FORM_STORE from './form'

import CONTENT_STORE from './content'
import ENTITIES_STORE from './entities'

import { join } from 'path'

const MODULES = [ CONTENT_STORE, ENTITIES_STORE, FORM_STORE, ADMIN_STORE ]

export class Storage {
  constructor (ctx, options) {
    this.ctx = ctx
    this.options = options
    this.__initModules()
  }

  preserveModuleState (modules = []) {
    const BreakException = {}
    let state = this.ctx.store.state[ this.options.vuex.namespace ]
    try {
      modules.forEach((m) => {
        if (!state[ m ]) {
          throw BreakException
        }
        state = state[ m ]
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
          return state.apiUrl + _trimStart(path, '/')
        },
        userRoles: (state, getters) => {
          const user = getters.user
          return user ? user.roles : [ 'ROLE_ANONYMOUS' ]
        },
        hasRole: (state, getters) => (role) => {
          const checkRole = (role) => {
            const roles = getters.userRoles
            return roles.indexOf(role) !== -1
          }
          if (Array.isArray(role)) {
            const BreakException = {}
            try {
              role.forEach((r) => {
                if (checkRole(r)) {
                  throw BreakException
                }
              })
              return false
            } catch (e) {
              return true
            }
          } else {
            return checkRole(role)
          }
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

    if (!this.ctx.store) {
      console.error('Cannot initialise store modules - the store does not exist')
      return
    }
    this.ctx.store.registerModule(this.options.vuex.namespace, storeModule, {
      preserveState: this.preserveModuleState(),
      strict: false
    })

    MODULES.forEach((store) => {
      this.ctx.store.registerModule([ this.options.vuex.namespace, store.name ], Object.assign({ namespaced: true }, store.store(this.options.vuex.namespace)), {
        preserveState: this.preserveModuleState(store.name),
        strict: false
      })
    })

    this.state = this.ctx.store.state[ this.options.vuex.namespace ]
  }

  setState (key, value, modules = []) {
    this.commit('SET', [ {
      key,
      value
    } ], modules)
    return value
  }

  getState (key) {
    return this.state[ key ]
  }

  getRootState () {
    return this.ctx.store.state[this.options.vuex.namespace]
  }

  commit (mutation, args = [], modules = []) {
    if (!Array.isArray(args)) {
      args = [args]
    }
    let path = [ this.options.vuex.namespace, ...modules, mutation ]
    this.ctx.store.commit(join(...path), ...args)
  }

  get (method, args = [], modules = []) {
    let path = [ this.options.vuex.namespace, ...modules, method ]
    let value = this.ctx.store.getters[ join(...path) ]
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
