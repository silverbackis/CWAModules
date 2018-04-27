import Vue from 'vue'
import jwtDecode from 'jwt-decode'
const { join } = require('path');
import _ from 'lodash'
import { actions as form_actions, getters as form_getters, mutations as form_mutations } from "./storage_form";

export const LAYOUTS_MODULE = ['layouts']
export const COMPONENTS_MODULE = ['components']
export const FORMS_MODULE = ['forms']

export class Storage {
  constructor(ctx, options) {
    this.ctx = ctx
    this.options = options
    this.__initModules();
  }

  preserveModuleState(modules = []) {
    const BreakException = {};
    let state = this.ctx.store.state[this.options.vuex.namespace]
    try{
      modules.forEach((m) => {
        if (!state[m]) {
          throw BreakException
        }
        state = state[m]
      })
    } catch(BreakException){
      return false
    }
    return Boolean(state)
  }

  __initModules() {
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
        getComponent: state => (id) => {
          return state.components[id] || null
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
    };
    this.ctx.store.registerModule(this.options.vuex.namespace, storeModule, {
      preserveState: this.preserveModuleState()
    });
    this.__initComponentsModule();
    this.__initLayoutsModule();
    this.__initFormsModule();
    this.state = this.ctx.store.state[this.options.vuex.namespace]
  }

  __initComponentsModule() {
    const componentsModule = {
      namespaced: true,
      state: () => {
        return {}
      },
      mutations: {
        SET (state, { key, value }) {
          Vue.set(state, key, value)
        }
      }
    };
    this.ctx.store.registerModule([this.options.vuex.namespace, ...COMPONENTS_MODULE], componentsModule, {
      preserveState: this.preserveModuleState(COMPONENTS_MODULE)
    });
  }

  __initLayoutsModule() {
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
          let isData = state[key] === undefined;
          if (isData) {
            Vue.set(state.data, key, value)
            Vue.set(state, 'current', key)
          } else {
            Vue.set(state, key, value)
          }
        }
      }
    };
    this.ctx.store.registerModule([this.options.vuex.namespace, ...LAYOUTS_MODULE], layoutsModule, {
      preserveState: this.preserveModuleState(LAYOUTS_MODULE)
    });
  }

  __initFormsModule() {
    const storeModule = {
      namespaced: true,
      state: () => ({}),
      getters: form_getters,
      mutations: form_mutations,
      actions: form_actions
    };
    this.ctx.store.registerModule([this.options.vuex.namespace, ...FORMS_MODULE], storeModule, {
      preserveState: this.preserveModuleState(FORMS_MODULE)
    });
  }

  setState (key, value, modules = []) {
    let path = [ this.options.vuex.namespace, ...modules, 'SET' ];
    this.ctx.store.commit(join(...path), {
      key,
      value
    })
    return value
  }

  getState (key) {
    return this.state[key]
  }

  watchState (key, fn) {
    return this.ctx.store.watch(
      state => getProp(state[this.options.vuex.namespace], key),
      fn
    )
  }

  get (method, args = [], modules = []) {
    let path = [ this.options.vuex.namespace, ...modules, method ]
    let value = this.ctx.store.getters[join(...path)]
    if (!(value instanceof Function)) {
      return value
    }
    return value(...args)
  }

  action (action, args = {}, modules = []) {
    let path = [ this.options.vuex.namespace, ...modules, action ]
    this.ctx.store.dispatch(join(...path), args)
  }
}

export default Storage
