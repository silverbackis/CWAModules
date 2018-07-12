import { state, actions, getters, mutations } from './module'

const name = ['admin']

const store = {
  state,
  getters,
  mutations,
  actions
}

export default {
  name,
  store
}
