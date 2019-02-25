import Vue from 'vue'

export const name = [ '_entities' ]

export const store = {
  state: () => ({}),
  getters: {
    getEntity: state => (id) => {
      return state[ id ] || false
    },
    getEntities: (state, getters) => (entities) => {
      let arr = []
      for (const entity of entities) {
        arr.push(getters.getEntity(entity))
      }
      return arr
    }
  },
  mutations: {
    setEntity (state, { id, data }) {
      if (data.componentLocations) {
        data.componentLocations = data.componentLocations.map((location) => {
          if (typeof location === 'string') {
            return location
          }
          return location['@id']
        })
      }
      Vue.set(state, id, data)
    },
    setEntityProperty (state, { id, property, data }) {
      Vue.set(state[id], property, data)
    }
  }
}

export default {
  name,
  store: () => store
}
