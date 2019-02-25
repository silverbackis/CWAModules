import { actions, getters, mutations, state } from './module'

export const name = [ '_admin' ]

const store = {
  state,
  getters,
  mutations,
  actions
}

export default {
  name,
  store: () => store
}
