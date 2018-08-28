import { Utilities } from '../../server/index'
import axios from 'axios'
import _ from 'lodash'
import Vue from 'vue'

const AxiosCancelToken = axios.CancelToken

export const actions = {
  init ({ commit, state }, module) {
    const formData = module.vars
    const formId = Utilities.getFormId(formData)
    if (!state[ formId ]) {
      commit('setForm', {
        formData: {
          vars: Object.assign({}, formData, { valid: false }),
          children: {},
          cancelToken: null,
          submitting: false
        }
      })
    }
  },
  initInput ({ commit, state }, { formId, inputVars, children, disableValidation }) {
    if (!state[ formId ].children[ inputVars.full_name ]) {
      let value = inputVars.multiple ? [] : (inputVars.block_prefixes[ 1 ] === 'checkbox' ? inputVars.checked : inputVars.value)
      commit('setInput', {
        formId,
        inputData: {
          disableValidation,
          validating: false,
          displayErrors: false,
          debounceValidate: null,
          cancelToken: null,
          lastValidationValue: null,
          vars: Object.assign({}, inputVars, {
            valid: false,
            errors: [],
            value
          }),
          children
        }
      })
    }
  },
  refreshCancelToken ({ commit }, { formId, inputName }) {
    let cancelToken = AxiosCancelToken.source()
    if (inputName) {
      commit('setInputCancelToken', { formId, inputName, cancelToken })
    } else {
      commit('setFormCancelToken', { formId, cancelToken })
    }
  }
}

export const getters = {
  getForm: (state) => (formId) => {
    return !state[ formId ] ? null : state[ formId ]
  },
  isValid: (state, getters) => (formId) => {
    let form = getters.getForm(formId)
    return form ? form.vars.valid : null
  },
  getInput: (state, getters) => (formId, inputName) => {
    let form = getters.getForm(formId)
    return !form ? null : form.children[ inputName ]
  },
  getFormSubmitData: (state, getters) => (formId) => {
    let form = getters.getForm(formId)
    if (!form) {
      return {}
    }

    let keys = _.keys(form.children)
    let x = keys.length
    let inputName
    let submit = {}
    while (x--) {
      inputName = form.children[ keys[ x ] ].vars.full_name
      submit = _.merge(
        submit,
        getters.getInputSubmitData({ formId, inputName })
      )
    }
    return submit
  },
  getInputSubmitData: (state) => ({ formId, inputName }) => {
    let model = state[ formId ].children[ inputName ]
    let value = model.vars.value
    if (value === undefined) {
      return {}
    }
    // Remove '[]' from end of name if it exists
    // Split name into parts when using square brackets - e.g. contact[name] = ["contact", "name"]
    let searchResult = inputName.replace(/\[\]$/, '').split(/\[(.*?)\]/).filter(String)
    let submitObj = {}
    _.set(submitObj, searchResult, value)
    return submitObj
  }
}

export const mutations = {
  setForm (state, { formData }) {
    let formId = Utilities.getFormId(formData.vars)
    Vue.set(
      state,
      formId,
      formData
    )
  },
  setInput (state, { formId, inputData }) {
    Vue.set(
      state[ formId ].children,
      inputData.vars.full_name,
      inputData
    )
  },
  setInputValue (state, { formId, inputName, value }) {
    Vue.set(state[ formId ].children[ inputName ].vars, 'value', value)
  },
  setInputKey (state, { formId, inputName, key, value }) {
    Vue.set(state[ formId ].children[ inputName ], key, value)
  },
  setFormKey (state, { formId, key, value }) {
    Vue.set(state[ formId ], key, value)
  },
  setFormValidationResult (state, { formId, valid, errors }) {
    Vue.set(state[ formId ].vars, 'valid', valid)
    Vue.set(state[ formId ].vars, 'errors', errors)
  },
  setInputValidationResult (state, { formId, inputName, valid, errors }) {
    Vue.set(state[ formId ].children[ inputName ].vars, 'valid', valid)
    Vue.set(state[ formId ].children[ inputName ].vars, 'errors', errors)
  },
  destroy (state, formId) {
    Vue.delete(state, formId)
  },

  // --------
  // Set specific preset keys - probably need to refine all of this!
  // --------
  setInputDisplayErrors (state, { formId, inputName, displayErrors }) {
    Vue.set(state[ formId ].children[ inputName ], 'displayErrors', displayErrors)
  },
  setInputValidating (state, { formId, inputName, validating }) {
    Vue.set(state[ formId ].children[ inputName ], 'validating', validating)
  },
  setInputDebounceValidate (state, { formId, inputName, debounce }) {
    Vue.set(state[ formId ].children[ inputName ], 'debounceValidate', debounce)
  },
  setInputCancelToken (state, { formId, inputName, cancelToken }) {
    Vue.set(state[ formId ].children[ inputName ], 'cancelToken', cancelToken)
  },
  setInputLastValidationValue (state, { formId, inputName, value }) {
    Vue.set(state[ formId ].children[ inputName ], 'lastValidationValue', value)
  },
  setFormSubmitting (state, { formId, submitting }) {
    Vue.set(state[ formId ], 'submitting', submitting)
  },
  setFormCancelToken (state, { formId, cancelToken }) {
    Vue.set(state[ formId ], 'cancelToken', cancelToken)
  }
}
