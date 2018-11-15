import { Utilities } from '../../server/index'
import axios from 'axios'
import _ from 'lodash'
import Vue from 'vue'

const AxiosCancelToken = axios.CancelToken

export const splitFormName = (path) => {
  return path.replace(/\[\]$/, '').split(/\[(.*?)\]/).filter(String)
}

const getInputNameNestedPath = (inputName, formPrefix = null) => {
  let prefixNameParts = splitFormName(inputName)
  let fullNamePath = ''
  let fullPath = []
  prefixNameParts.forEach((namePart) => {
    fullNamePath += fullNamePath !== '' ? `[${namePart}]` : namePart
    if (fullNamePath === formPrefix) return
    if (fullPath.length) fullPath.push('children')
    fullPath.push(fullNamePath)
  })
  return fullPath
}

const getNestedInput = (state, formId, inputName) => {
  const form = state[ formId ]
  if (!form) return null
  let OBJECT_PATH = getInputNameNestedPath(inputName, form.vars.block_prefixes[1])
  return _.get(form.children, OBJECT_PATH, null)
}

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
    if (!getNestedInput(state, formId, inputVars.full_name)) {
      let value = inputVars.multiple ? [] : (inputVars.block_prefixes[ 1 ] === 'checkbox' ? inputVars.checked : inputVars.value)
      commit('setInput', {
        formId,
        inputData: {
          cancelToken: null,
          debounceValidate: null,
          disableValidation,
          displayErrors: false,
          hidden: false,
          lastValidationValue: null,
          validating: false,
          vars: Object.assign({}, inputVars, {
            valid: false,
            errors: [],
            value
          })
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
  },
  validateFormView ({ commit }, { formId, formData, isSubmit, simulatedInputNames = [] }) {
    const setValidation = (child) => {
      if (child.vars.valid === undefined) {
        return
      }
      if (simulatedInputNames.indexOf(child.vars.full_name) === -1) {
        commit('setInputValidationResult', {
          formId,
          inputName: child.vars.full_name,
          valid: child.vars.valid,
          errors: child.vars.errors
        })
        if (isSubmit === true) {
          commit('setInputDisplayErrors', {
            formId,
            inputName: child.vars.full_name,
            displayErrors: true
          })
        }
      } else {
        commit('setInputValidationResult', {
          formId,
          inputName: child.vars.full_name,
          valid: false
        })
      }
    }
    const doValidation = (item) => {
      setValidation(item)
      for (const child of item.children) {
        doValidation(child)
      }
    }
    doValidation(formData)
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
  getInput: (state) => (formId, inputName) => {
    return getNestedInput(state, formId, inputName)
  },
  getFormSubmitData: (state, getters) => (formId) => {
    let form = getters.getForm(formId)
    if (!form) {
      return {}
    }
    const getDeepFormData = (item) => {
      let submitData = {}
      for (const [inputName, child] of Object.entries(item.children)) {
        submitData = _.merge(
          submitData,
          getters.getInputSubmitData({ formId, inputName })
        )
        if (child.children) {
          submitData = _.merge(
            submitData,
            getDeepFormData(child)
          )
        }
      }
      return submitData
    }
    return getDeepFormData(form)
  },
  getInputSubmitData: (state) => ({ formId, inputName }) => {
    let model = getNestedInput(state, formId, inputName)
    let value = model.vars.value
    if (value === undefined) {
      return {}
    }
    // Remove '[]' from end of name if it exists
    // Split name into parts when using square brackets - e.g. contact[name] = ["contact", "name"]
    let searchResult = splitFormName(inputName)
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
    let OBJECT_PATH = getInputNameNestedPath(inputData.vars.full_name, state[ formId ].vars.block_prefixes[1])
    let finalObjectKey = OBJECT_PATH.splice(-1)[0]
    // Create the parents if they do not currently exist
    let currentNestedObj = state[ formId ].children
    OBJECT_PATH.forEach((pathItem) => {
      if (!currentNestedObj[pathItem]) {
        Vue.set(
          currentNestedObj,
          pathItem,
          {}
        )
      }
      currentNestedObj = currentNestedObj[pathItem]
    })
    Vue.set(
      currentNestedObj,
      finalObjectKey,
      inputData
    )
  },
  setInputValue (state, { formId, inputName, value }) {
    let input = getNestedInput(state, formId, inputName)
    Vue.set(input.vars, 'value', value)
  },
  setInputProp (state, { formId, inputName, property, value }) {
    let input = getNestedInput(state, formId, inputName)
    Vue.set(input, property, value)
  },
  setFormProp (state, { formId, property, value }) {
    Vue.set(state[ formId ], property, value)
  },
  setFormValidationResult (state, { formId, valid, errors }) {
    Vue.set(state[ formId ].vars, 'valid', valid)
    Vue.set(state[ formId ].vars, 'errors', errors)
  },
  setInputValidationResult (state, { formId, inputName, valid, errors }) {
    let input = getNestedInput(state, formId, inputName)
    Vue.set(input.vars, 'valid', valid)
    Vue.set(input.vars, 'errors', errors)
  },
  destroy (state, formId) {
    if (state[formId]) Vue.delete(state, formId)
  },

  // --------
  // Set specific preset keys - probably need to refine all of this!
  // --------
  setInputDisplayErrors (state, { formId, inputName, displayErrors }) {
    let input = getNestedInput(state, formId, inputName)
    Vue.set(input, 'displayErrors', displayErrors)
  },
  setFormDisplayErrors (state, { formId, displayErrors, valid = null }) {
    const setInput = (inputName) => {
      let input = getNestedInput(state, formId, inputName)
      Vue.set(input, 'displayErrors', displayErrors)
      if (valid !== null) {
        Vue.set(input.vars, 'valid', valid)
      }
    }
    const displayErrorsDeep = (item) => {
      for (const [inputName, child] of Object.entries(item.children)) {
        if (child.vars.block_prefixes[1] !== 'submit') {
          setInput(inputName)
        }
        if (child.children) {
          displayErrorsDeep(child)
        }
      }
    }
    displayErrorsDeep(state[ formId ])
  },
  setInputValidating (state, { formId, inputName, validating }) {
    let input = getNestedInput(state, formId, inputName)
    Vue.set(input, 'validating', validating)
  },
  setInputDebounceValidate (state, { formId, inputName, debounce }) {
    let input = getNestedInput(state, formId, inputName)
    Vue.set(input, 'debounceValidate', debounce)
  },
  setInputCancelToken (state, { formId, inputName, cancelToken }) {
    let input = getNestedInput(state, formId, inputName)
    Vue.set(input, 'cancelToken', cancelToken)
  },
  setInputLastValidationValue (state, { formId, inputName, value }) {
    let input = getNestedInput(state, formId, inputName)
    Vue.set(input, 'lastValidationValue', value)
  },
  setFormSubmitting (state, { formId, submitting }) {
    Vue.set(state[ formId ], 'submitting', submitting)
  },
  setFormCancelToken (state, { formId, cancelToken }) {
    Vue.set(state[ formId ], 'cancelToken', cancelToken)
  }
}
