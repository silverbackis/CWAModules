import { join } from 'path'
import Vue from 'vue'
import { name as entitiesModuleName } from '../entities'

export const name = ['_content']

export const store = rootNamespace => {
  return {
    state: () => ({
      currentRoute: null,
      routes: {},
      currentLayout: null,
      layouts: {},
      pageLoadPromise: null
    }),
    getters: {
      getCurrentRoute: state => {
        return state.currentRoute
      },
      getDynamicData: (
        state,
        getters,
        rootState,
        rootGetters
      ) => loadedRoute => {
        const loadedRouteObject = state.routes[loadedRoute]
        if (!loadedRouteObject || !loadedRouteObject.dynamicData) {
          return null
        }
        const module = join(rootNamespace, ...entitiesModuleName)
        return rootGetters[`${module}/getEntity`](loadedRouteObject.dynamicData)
      },
      getContentAtDepth: (state, getters, rootState, rootGetters) => (
        depth,
        loadedRoute
      ) => {
        const loadedRouteObject = state.routes[loadedRoute]
        if (!loadedRouteObject) {
          return null
        }
        let content = loadedRouteObject.structure[depth] || null
        if (content && content['@id']) {
          const module = join(rootNamespace, ...entitiesModuleName)
          const entityContent = rootGetters[`${module}/getEntity`](
            content['@id']
          )
          if (entityContent) {
            content = entityContent
          }
        }
        return content
      },
      getLayout: state => id => {
        return (
          (id ? state.layouts[id] : state.layouts[state.currentLayout]) || {
            timestamp: null,
            structure: null
          }
        )
      }
    },
    mutations: {
      setRoute(state, { route, data, redirectedFrom, id, dynamicData }) {
        Vue.set(state.routes, route, {
          timestamp: new Date(),
          structure: data,
          redirectedFrom,
          id,
          dynamicData
        })
      },
      setLayout(state, { id, data }) {
        Vue.set(state.layouts, id, { timestamp: new Date(), structure: data })
      },
      setCurrentRoute(state, route) {
        state.currentRoute = route
      },
      setCurrentLayout(state, layout) {
        state.currentLayout = layout
      },
      setPageLoadPromise(state, promise) {
        state.pageLoadPromise = promise
      }
    }
  }
}

export default {
  name,
  store
}
