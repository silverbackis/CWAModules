import Vue from 'vue'

export const name = ['_entities']

export const store = {
  state: () => ({
    loading: {}
  }),
  getters: {
    getEntity: state => id => {
      return state[id] || false
    },
    getEntities: (state, getters) => entities => {
      const arr = []
      for (const entity of entities) {
        arr.push(getters.getEntity(entity))
      }
      return arr
    }
  },
  mutations: {
    setEntity(state, { id, data }) {
      if (data.componentLocations) {
        data.componentLocations = data.componentLocations.map(location => {
          if (typeof location === 'string') {
            return location
          }
          return location['@id']
        })
      }
      Vue.set(state, id, data)
    },
    setEntityProperty(state, { id, property, data }) {
      Vue.set(state[id], property, data)
    },
    addLoading(state, { url, promise }) {
      Vue.set(state.loading, url, promise)
    },
    removeLoading(state, url) {
      Vue.delete(state.loading, url)
    }
  }
}

export default {
  name,
  store: () => store
}
