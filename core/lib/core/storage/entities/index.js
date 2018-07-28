import Vue from 'vue'

const name = ['locations']

const store = {
  state: () => ({}),
  getters: {
    getLocation: state => (id) => {
      return state[id] || false
    }
  },
  mutations: {
    SET (state, { key, value }) {
      Vue.set(state, key, value)
    },
    setLocation (state, { id, data }) {
      Vue.set(state, id, data)
    }
  }
}

export default {
  name,
  store
}
