import Vue from 'vue'
import { CancelToken } from 'axios'

export const state = () => ({
  endpoints: {},
  submitting: {}
})

export const mutations = {
  initAdminInput (state, { componentId, componentField, model, postSaveFn }) {
    if (!state.endpoints[componentId]) {
      Vue.set(state.endpoints, componentId, {
        submitting: false,
        inputs: {}
      })
    }
    Vue.set(state.endpoints[componentId].inputs, componentField, {
      savedModel: model,
      model,
      postSaveFn
    })
  },
  setModel (state, { componentId, componentField, model }) {
    let field = state.endpoints[componentId].inputs[componentField]
    field.model = model
  },
  setSavedModel (state, { componentId, componentField, model }) {
    state.endpoints[componentId].inputs[componentField].savedModel = model
  },
  destroyAdminInput (state, { componentId, componentField }) {
    if (state.endpoints[componentId]) {
      Vue.delete(state.endpoints[componentId].inputs, componentField)
      if (!Object.keys(state.endpoints[componentId].inputs).length) {
        Vue.delete(state.endpoints, componentId)
      }
    }
  }
}

export const getters = {
  isModified: (state) => (endpointKey = null) => {
    const checkEndpoint = (endpointKey) => {
      const inputs = state.endpoints[endpointKey].inputs
      return Object.keys(inputs).some((inputKey) => {
        const input = inputs[inputKey]
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
  isSubmiting: (state) => {
    return Object.keys(state.submitting).length
  }
}

export const actions = {
  modifiedEndpoints ({ state }) {
    let endpoints = {}
    Object.keys(state.endpoints).some((endpointKey) => {
      const stateInputs = state.endpoints[endpointKey].inputs
      const modifiedInputKeys = Object.keys(stateInputs).filter((inputKey) => {
        const input = stateInputs[inputKey]
        return input.model !== input.savedModel
      })
      if (modifiedInputKeys.length) {
        const endpoint = {}
        modifiedInputKeys.forEach((inputKey) => {
          endpoint[inputKey] = stateInputs[inputKey].model
        })
        endpoints[endpointKey] = endpoint
      }
    })
    return endpoints
  },
  async save ({ state, dispatch }) {
    let patchEndpoints = await dispatch('modifiedEndpoints')
    // Cancel patches we are going to send again if they still exist (therefore not completed)
    Object.keys(state.submitting).forEach((submittingKey) => {
      if (patchEndpoints[submittingKey]) {
        state.submitting[submittingKey].cancel('Duplicate request cancelled: A new request has been to this endpoint')
      }
    })

    // Setup new patch requests
    Object.keys(patchEndpoints).forEach((endpointKey) => {
      // create a cancel token for the request
      const cancel = CancelToken.source()
      state.submitting[endpointKey] = cancel
      this.$axios
        .put(endpointKey, patchEndpoints[endpointKey], { cancelToken: cancel.token })
        .then(({ data }) => {
          console.log('Patch done', data)
        })
    })
  }
}
