import { state, actions, getters, mutations } from './module'

export const name = ['_admin'];

const store = {
  state,
  getters,
  mutations,
  actions
};

export default {
  name,
  store
}
