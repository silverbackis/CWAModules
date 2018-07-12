import Vue from 'vue'

const name = ['layouts']

const store = {
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
      let isData = state[key] === undefined
      if (isData) {
        Vue.set(state.data, key, value)
        Vue.set(state, 'current', key)
      } else {
        Vue.set(state, key, value)
      }
    }
  }
}

export default {
  name,
  store
}
