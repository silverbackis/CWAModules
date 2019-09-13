import { Utilities } from '../../server/index'
import axios from 'axios'
import _ from 'lodash'
import Vue from 'vue'

const AxiosCancelToken = axios.CancelToken

export const DUPLICATE_CANCEL_MESSAGE = 'duplicate'
export const DESTROY_CANCEL_MESSAGE = 'destroyed'

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

export const getters = {
  getFormByComponent: (state) => ({ form: { vars } }) => {
    const formId = Utilities.getFormId(vars)
    return state[ formId ]
  },
  getForm: (state) => (formId) => {
    return !state[ formId ] ? null : state[ formId ]
  },
  isValid: (state) => (formId) => {
    return state[ formId ].vars.valid
  },
  getInput: (state) => (formId, inputName) => {
    return getNestedInput(state, formId, inputName)
  },
  getFormSubmitData: (state, getters) => (formId) => {
    let form = state[ formId ]
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
    return Object.assign(
      form && form.vars.post_app_proxy ? { _action: form.vars.action } : {},
      form.extraData,
      getDeepFormData(form)
    )
  },
  getInputSubmitData: (state) => ({ formId, inputName }) => {
    let model = getNestedInput(state, formId, inputName)
    if (!model) {
      return {}
    }
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

export const actions = {
  refreshCancelToken ({ commit }, { formId, inputName }) {
    let cancelToken = AxiosCancelToken.source()
    if (inputName) {
      commit('setInputCancelToken', { formId, inputName, cancelToken })
    } else {
      commit('setFormCancelToken', { formId, cancelToken })
    }
  },
  applyFormResultValidation ({ commit }, { formId, formData, isSubmit, simulatedInputNames = [] }) {
    const setValidation = (child, parent) => {
      if (child.vars.valid === undefined) {
        return
      }
      if (parent && parent.vars.full_name === child.vars.full_name.replace('[]', '')) {
        return
      }
      const childNameExists = simulatedInputNames.indexOf(child.vars.full_name) === -1
      if (childNameExists) {
        commit('setInputData', {
          formId,
          inputName: child.vars.full_name,
          data: {
            valid: child.vars.valid,
            errors: child.vars.errors
          }
        })
        if (isSubmit === true) {
          commit('setInputData', {
            formId,
            inputName: child.vars.full_name,
            data: {
              displayErrors: true
            }
          })
        }
      } else {
        commit('setInputData', {
          formId,
          inputName: child.vars.full_name,
          data: {
            valid: false
          }
        })
      }
    }
    const doValidation = (item, parent) => {
      setValidation(item, parent)
      for (const child of item.children) {
        doValidation(child, item)
      }
    }
    doValidation(formData)
  },
  async submitForm ({ commit, state, getters, dispatch }, { formId, apiAction = null, successFn = null }) {
    commit('setFormSubmitting', {
      formId: formId,
      submitting: true
    })

    const form = state[formId]

    if (form.cancelToken) {
      form.cancelToken.cancel(DUPLICATE_CANCEL_MESSAGE)
    }
    dispatch('refreshCancelToken', { formId })
    let ops = {
      url: form.vars.post_app_proxy || form.vars.action,
      data: getters.getFormSubmitData(formId),
      method: 'POST',
      cancelToken: form.cancelToken.token,
      validateStatus (status) {
        return [ 400, 200, 201, 401 ].indexOf(status) !== -1
      },
      progress: false
    }
    if (form.vars.api_request === false || form.vars.post_app_proxy || apiAction === false) {
      ops.baseURL = null
    }

    try {
      let { status, data } = await this.$axios.request(ops)
      if (successFn) {
        successFn(data)
      }
      const form = data.form
      const errors = form ? form.vars.errors : (data.message ? [ data.message ] : [])
      commit('setFormData', {
        formId,
        data: {
          valid: status === 200,
          errors
        }
      })
      if (form) {
        dispatch('applyFormResultValidation', { formId, formData: form, isSubmit: true })
      } else {
        if (errors.length) {
          commit('setFormDisplayErrors', { formId, displayErrors: true, valid: false })
        } else {
          commit('setFormDisplayErrors', { formId, displayErrors: false, valid: true })
        }
      }
    } catch (error) {
      if (error.message === DUPLICATE_CANCEL_MESSAGE) {
        console.log('previous form submission cancelled')
      } else {
        if (axios.isCancel(error)) {
          console.warn(error)
        } else if (error.response) {
          console.warn('validate request error: ', error.response)
          commit('setFormData', {
            formId,
            data: {
              valid: false,
              errors: [
                '<b>' + error.response.status + ' ' + error.response.statusText + ': </b> ' +
                (error.response.data[ 'hydra:description' ] || error.response.data.message)
              ]
            }
          })
        } else {
          console.warn('validate unknown error: ', error)
        }
      }
    }
    commit('setFormSubmitting', {
      formId: formId,
      submitting: false
    })
  }
}

const setPathValue = (stateObject, path, value) => {
  if (typeof path === 'string') {
    let basePath = stateObject.vars[path] !== undefined ? stateObject.vars : stateObject
    Vue.set(basePath, path, value)
  } else if (Array.isArray(path)) {
    const lastPathItem = path.splice(-1)
    Vue.set(_.get(stateObject, path), lastPathItem, value)
  } else {
    console.error('Cannot set value on input. Unknown path.', path)
  }
}

const setData = (stateObject, data) => {
  if (!stateObject) {
    return
  }
  if (Array.isArray(data)) {
    for (const { path, value } of data) {
      setPathValue(stateObject, path, value)
    }
  } else {
    for (const [path, value] of Object.entries(data)) {
      setPathValue(stateObject, path, value)
    }
  }
}

export const mutations = {
  initForm (state, { form: { vars }, extraData = {} }) {
    const formId = Utilities.getFormId(vars)
    if (state[ formId ]) {
      return
    }
    const formData = {
      vars: Object.assign({}, vars, { valid: false }),
      children: {},
      cancelToken: null,
      submitting: false,
      extraData
    }

    Vue.set(
      state,
      formId,
      formData
    )
  },
  setFormData (state, { formId, data }) {
    let form = state[ formId ]
    setData(form, data)
  },
  destroy (state, formId) {
    if (state[formId]) Vue.delete(state, formId)
  },
  initInput (state, { formId, inputVars, children, disableValidation }) {
    /*
     * Ignore if this is already initialised
     */
    if (getNestedInput(state, formId, inputVars.full_name)) {
      return
    }

    /*
     * Create the data object
     */
    let value = inputVars.multiple ? [] : (inputVars.block_prefixes[ 1 ] === 'checkbox' ? inputVars.checked : inputVars.value)
    const inputData = {
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

    /*
     * Create children of parents if required
     */
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

    /*
     * Finally set the initial input data nested correctly
     */
    Vue.set(
      currentNestedObj,
      finalObjectKey,
      Object.assign(inputData.vars.expanded ? { children } : {}, inputData)
    )
  },
  setInputData (state, { formId, inputName, data }) {
    let input = getNestedInput(state, formId, inputName)
    setData(input, data)
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

  // --------
  // Set specific preset keys - probably need to refine all of this!
  // ALL DEPRECATED AND WILL BE REMOVED - USE setInputData INSTEAD
  // NEED TO GO THROUGH AND CONVERT ALL REFERENCES TO THIS METHODS
  // --------
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
