import Vue from 'vue'

export const name = ['_entities']

export const store = {
  state: () => ({}),
  getters: {
    getEntity: state => (id) => {
      return state[id] || false
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
      Vue.set(state, id, data)
    }
  }
}

export default {
  name,
  store
}
