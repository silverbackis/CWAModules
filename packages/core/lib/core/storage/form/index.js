import { actions, getters, mutations } from './module'

export const name = [ '_forms' ]

const store = {
  state: () => ({}),
  getters,
  mutations,
  actions
}

export default {
  name,
  store
}
