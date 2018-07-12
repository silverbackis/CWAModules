import Vue from 'vue'

const name = ['components']

const store = {
  state: () => ({}),
  getters: {
    getComponent: state => (id) => {
      return state[id] || null
    }
  },
  mutations: {
    SET (state, { key, value }) {
      Vue.set(state, key, value)
    },
    setComponent (state, { id, data }) {
      Vue.set(state, id, data)
    }
  }
}

export default {
  name,
  store
}
