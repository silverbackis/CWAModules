import Vue from 'vue'
export const name = ['_content']

export const store = {
  state: () => ({
    currentRoute: null,
    routes: {},
    currentLayout: null,
    layouts: {}
  }),
  getters: {
    getCurrentRoute: state => {
      return state.currentRoute
    },
    getContentAtDepth: state => (depth, loadedRoute) => {
      return state.routes[loadedRoute].structure[depth] || null
    },
    getLayout: state => (id) => {
      return (id ? state.layouts[id] : state.layouts[state.currentLayout]) || { timestamp: null, structure: null }
    }
  },
  mutations: {
    setRoute (state, {route, data}) {
      Vue.set(state.routes, route, { timestamp: new Date(), structure: data })
    },
    setLayout (state, {id, data}) {
      Vue.set(state.layouts, id, { timestamp: new Date(), structure: data })
    },
    setCurrentRoute (state, route) {
      state.currentRoute = route
    },
    setCurrentLayout (state, layout) {
      state.currentLayout = layout
    }
  }
}

export default {
  name,
  store
}
