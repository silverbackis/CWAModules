import Vue from 'vue'
import jwtDecode from 'jwt-decode'
const { join } = require('path');
import _ from 'lodash'

export const LAYOUTS_MODULE = ['layouts']
export const COMPONENTS_MODULE = ['components']

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
        }
      }
    };
    this.ctx.store.registerModule(this.options.vuex.namespace, storeModule, {
      preserveState: this.preserveModuleState()
    });


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

    this.state = this.ctx.store.state[this.options.vuex.namespace]
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

  get (method, modules = []) {
    let path = [ this.options.vuex.namespace, ...modules, method ]
    return this.ctx.store.getters[join(...path)]
  }
}

export default Storage
