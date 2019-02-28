import Vue from 'vue'
import { CancelToken } from 'axios'
import _debounce from 'lodash/debounce'
import { name as ENTITIES_MODULE } from '../entities'

export const state = () => ({
  endpoints: {},
  submitting: {},
  waitingToSubmit: {},
  saveDebounce: null
})

export const mutations = {
  initAdminInput (state, { componentId, componentField, model, postSaveFn, force = false }) {
    if (!state.endpoints[ componentId ]) {
      Vue.set(state.endpoints, componentId, {
        inputs: {}
      })
    }
    if (force || !state.endpoints[ componentId ].inputs[ componentField ]) {
      Vue.set(state.endpoints[ componentId ].inputs, componentField, {
        savedModel: model,
        model,
        postSaveFn
      })
    }
  },
  setModel (state, { componentId, componentField, model }) {
    console.trace();
    let field = state.endpoints[ componentId ].inputs[ componentField ]
    field.model = model
  },
  updateComponent (state, data) {
    const id = data[ '@id' ]
    let endpoint = state.endpoints[ id ]
    if (endpoint) {
      const componentFields = Object.keys(data)
      componentFields.forEach((field) => {
        if (endpoint.inputs[ field ]) {
          Vue.set(endpoint.inputs[ field ], 'savedModel', data[ field ])
        }
      })
    }
  },
  destroyAdminInput (state, { componentId, componentField }) {
    if (state.endpoints[ componentId ]) {
      Vue.delete(state.endpoints[ componentId ].inputs, componentField)
      if (!Object.keys(state.endpoints[ componentId ].inputs).length) {
        Vue.delete(state.endpoints, componentId)
      }
    }
  },
  setSubmitting (state, { endpointKey, value }) {
    Vue.set(state.submitting, endpointKey, value)
  },
  deleteSubmitting (state, endpointKey) {
    Vue.delete(state.submitting, endpointKey)
  },
  setWaitingToSubmit (state, { endpointKey, value = true }) {
    Vue.set(state.waitingToSubmit, endpointKey, value)
  },
  deleteWaitingToSubmit (state, endpointKey) {
    Vue.delete(state.waitingToSubmit, endpointKey)
  },
  updateSaveDebounce (state, value) {
    state.saveDebounce = value
  }
}

export const getters = {
  isModified: (state) => (endpointKey = null) => {
    const checkEndpoint = (endpointKey) => {
      const inputs = state.endpoints[ endpointKey ].inputs
      return Object.keys(inputs).some((inputKey) => {
        const input = inputs[ inputKey ]
        return input.model !== input.savedModel
      })
    }
    if (!endpointKey) {
      return Object.keys(state.endpoints).some((endpointKey) => {
        return checkEndpoint(endpointKey)
      })
    }
    return checkEndpoint(endpointKey)
  },
  isSubmitting: (state) => (endpointKey = null) => {
    if (!endpointKey) {
      return Object.keys(state.submitting).length > 0 || Object.keys(state.waitingToSubmit).length > 0
    }
    return Boolean(state.submitting[ endpointKey ]) || Boolean(state.waitingToSubmit[ endpointKey ])
  },
  getInputModel: (state) => ({ componentId, componentField }) => {
    const endpoint = state.endpoints[ componentId ]
    if (!endpoint || !endpoint.inputs[ componentField ]) {
      return null
    }
    return endpoint.inputs[ componentField ].model
  }
}

export const actions = {
  modifiedEndpoints ({ state }) {
    let endpoints = {}
    Object.keys(state.endpoints).some((endpointKey) => {
      const stateInputs = state.endpoints[ endpointKey ].inputs
      const modifiedInputKeys = Object.keys(stateInputs).filter((inputKey) => {
        const input = stateInputs[ inputKey ]
        return input.model !== input.savedModel
      })
      if (modifiedInputKeys.length) {
        const endpoint = {}
        modifiedInputKeys.forEach((inputKey) => {
          endpoint[ inputKey ] = stateInputs[ inputKey ].model
        })
        endpoints[ endpointKey ] = endpoint
      }
    })
    return endpoints
  },
  async cancelSubmits ({ state }, patchEndpoints) {
    Object.keys(state.submitting).forEach(async (submittingKey) => {
      if (submittingKey in patchEndpoints) {
        await state.submitting[ submittingKey ].cancel(
          'Original request cancelled, a new request will be made'
        )
      }
    })
  },
  async save ({ state, dispatch, commit }, patchEndpoints) {
    if (!patchEndpoints) {
      patchEndpoints = await dispatch('modifiedEndpoints')
    }
    // Cancel patches we are going to send again if they still exist (therefore not completed)
    dispatch('cancelSubmits', patchEndpoints)

    // Setup new patch requests
    Object.keys(patchEndpoints).forEach((endpointKey) => {
      // create a cancel token for the request
      const cancel = CancelToken.source()
      commit('setSubmitting', { endpointKey, value: cancel })

      this.$axios
        .put(endpointKey, patchEndpoints[ endpointKey ], { cancelToken: cancel.token, progress: false })
        .then(({ data }) => {
          commit('updateComponent', data)
          commit('deleteSubmitting', endpointKey)
          const component = this.$bwstarter.$storage.get('getEntity', [ endpointKey ], ENTITIES_MODULE)
          if (component) {
            this.$bwstarter.$storage.commit('setEntity', [ { id: endpointKey, data } ], ENTITIES_MODULE)
          }
          const content = this.$bwstarter.$storage.get('getContentById', [ endpointKey ])
          if (content) {
            this.$bwstarter.$storage.commit('setContentById', [ { id: endpointKey, data } ])
          }
        })
        .catch(() => {
          commit('deleteSubmitting', endpointKey)
        })
    })
  },
  async debouncedSave ({ dispatch, commit, state: { saveDebounce } }) {
    let patchEndpoints = await dispatch('modifiedEndpoints')
    if (saveDebounce) {
      saveDebounce.cancel()
    }
    dispatch('cancelSubmits', patchEndpoints)
    const newSaveDebounce = _debounce(async () => {
      Object.keys(patchEndpoints).forEach((endpointKey) => {
        commit('deleteWaitingToSubmit', endpointKey)
      })
      dispatch('save', patchEndpoints)
    }, 250)
    commit('updateSaveDebounce', newSaveDebounce)
    Object.keys(patchEndpoints).forEach((endpointKey) => {
      commit('setWaitingToSubmit', { endpointKey, value: newSaveDebounce })
    })
    newSaveDebounce()
  }
}
