import Vue from 'vue';

export const name = ['_entities'];

export const store = {
  state: () => ({}),
  getters: {
    getEntity: state => (id) => {
      return state[id] || false
    }
  },
  mutations: {
    setEntity (state, { id, data }) {
      Vue.set(state, id, data)
    }
  }
};

export default {
  name,
  store
}
