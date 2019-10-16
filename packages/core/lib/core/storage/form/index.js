import {
  actions,
  getters,
  mutations,
  DESTROY_CANCEL_MESSAGE as DEST_MESSAGE,
  DUPLICATE_CANCEL_MESSAGE as DUPE_MESSAGE
} from './module'

export const name = ['_forms']
export const DESTROY_CANCEL_MESSAGE = DEST_MESSAGE
export const DUPLICATE_CANCEL_MESSAGE = DUPE_MESSAGE

const store = {
  state: () => ({}),
  getters,
  mutations,
  actions
}

export default {
  name,
  store: () => store
}
