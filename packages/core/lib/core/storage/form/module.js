import axios from 'axios'
import _ from 'lodash'
import Vue from 'vue'
import _cloneDeep from 'lodash/cloneDeep'
import { Utilities } from '../../server/index'

const AxiosCancelToken = axios.CancelToken

export const DUPLICATE_CANCEL_MESSAGE = 'duplicate'
export const DESTROY_CANCEL_MESSAGE = 'destroyed'

export const splitFormName = path => {
  return path
    .replace(/\[\]$/, '')
    .split(/\[(.*?)\]/)
    .filter(String)
}

const getInputNameNestedPath = (inputName, formPrefix = null) => {
  const prefixNameParts = splitFormName(inputName)
  let fullNamePath = ''
  const fullPath = []
  prefixNameParts.forEach(namePart => {
    fullNamePath += fullNamePath !== '' ? `[${namePart}]` : namePart
    if (fullNamePath === formPrefix) return
    if (fullPath.length) fullPath.push('children')
    fullPath.push(fullNamePath)
  })
  return fullPath
}

const getNestedInput = (state, formId, inputName) => {
  const form = state[formId]
  if (!form) return null
  const OBJECT_PATH = getInputNameNestedPath(
    inputName,
    form.vars.block_prefixes[1]
  )
  return _.get(form.children, OBJECT_PATH, null)
}

export const getters = {
  getFormByComponent: state => ({ form: { vars } }) => {
    const formId = Utilities.getFormId(vars)
    return state[formId]
  },
  getForm: state => formId => {
    return !state[formId] ? null : state[formId]
  },
  isValid: state => formId => {
    return state[formId].vars.valid
  },
  getInput: state => (formId, inputName) => {
    return getNestedInput(state, formId, inputName)
  },
  getFormSubmitData: (state, getters) => formId => {
    const form = state[formId]
    if (!form) {
      return {}
    }
    const getDeepFormData = item => {
      let submitData = {}
      for (const [inputName, child] of Object.entries(item.children)) {
        submitData = _.merge(
          submitData,
          getters.getInputSubmitData({ formId, inputName })
        )
        if (child.children) {
          submitData = _.merge(submitData, getDeepFormData(child))
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
  getInputSubmitData: state => ({ formId, inputName }) => {
    const model = getNestedInput(state, formId, inputName)
    if (!model || !model.vars) {
      return {}
    }
    const value = model.vars.value
    if (value === undefined) {
      return {}
    }
    // Remove '[]' from end of name if it exists
    // Split name into parts when using square brackets - e.g. contact[name] = ["contact", "name"]
    const searchResult = splitFormName(inputName)
    const submitObj = {}
    _.set(submitObj, searchResult, value)

    // If a collection, we want to ensure the other array values are not null otherwise API will validate as the first entry always
    for (const [partIndex, partKey] of searchResult.entries()) {
      const keyAsNumber = partKey / 1
      if (!isNaN(keyAsNumber) && Number.isInteger(keyAsNumber)) {
        let countdown = partKey - 1
        while (countdown >= 0) {
          const newSearchResult = searchResult
          newSearchResult[partIndex] = countdown
          newSearchResult.length = partIndex + 1
          _.set(submitObj, newSearchResult, {})
          countdown--
        }
      }
    }

    return submitObj
  }
}

export const actions = {
  refreshCancelToken({ commit }, { formId, inputName }) {
    const cancelToken = AxiosCancelToken.source()
    if (inputName) {
      commit('setInputCancelToken', { formId, inputName, cancelToken })
    } else {
      commit('setFormCancelToken', { formId, cancelToken })
    }
  },
  applyFormResultValidation(
    { commit },
    { formId, formData, isSubmit, simulatedInputNames = [] }
  ) {
    const setValidation = (child, parent) => {
      if (child.vars.valid === undefined) {
        return
      }
      if (
        parent &&
        parent.vars.full_name === child.vars.full_name.replace('[]', '')
      ) {
        return
      }
      const childNameExists =
        simulatedInputNames.indexOf(child.vars.full_name) === -1
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
  async submitForm(
    { commit, state, getters, dispatch },
    { formId, apiAction = null, successFn = null }
  ) {
    commit('setFormSubmitting', {
      formId: formId,
      submitting: true
    })

    const form = state[formId]

    if (form.cancelToken) {
      form.cancelToken.cancel(DUPLICATE_CANCEL_MESSAGE)
    }
    dispatch('refreshCancelToken', { formId })
    const ops = {
      url: form.vars.post_app_proxy || form.vars.action,
      data: getters.getFormSubmitData(formId),
      method: 'POST',
      cancelToken: form.cancelToken.token,
      validateStatus(status) {
        return [400, 200, 201, 401].indexOf(status) !== -1
      },
      progress: false
    }
    if (
      form.vars.api_request === false ||
      form.vars.post_app_proxy ||
      apiAction === false
    ) {
      ops.baseURL = null
    }

    try {
      const { status, data } = await this.$axios.request(ops)
      if (successFn) {
        successFn(data)
      }
      const form = data.form
      const errors = form
        ? form.vars.errors
        : data.message
        ? [data.message]
        : []
      commit('setFormData', {
        formId,
        data: {
          valid: status === 200,
          errors
        }
      })
      if (form) {
        dispatch('applyFormResultValidation', {
          formId,
          formData: form,
          isSubmit: true
        })
      } else if (errors.length) {
        commit('setFormDisplayErrors', {
          formId,
          displayErrors: true,
          valid: false
        })
      } else {
        commit('setFormDisplayErrors', {
          formId,
          displayErrors: false,
          valid: true
        })
      }
    } catch (error) {
      if (error.message === DUPLICATE_CANCEL_MESSAGE) {
        // console.log('previous form submission cancelled')
        return
      } else if (axios.isCancel(error)) {
        // eslint-disable-next-line no-console
        console.warn(error)
      } else if (error.response) {
        // console.warn('validate request error: ', error.response)
        commit('setFormData', {
          formId,
          data: {
            valid: false,
            errors: [
              '<b>' +
                error.response.status +
                ' ' +
                error.response.statusText +
                ': </b> ' +
                (error.response.data['hydra:description'] ||
                  error.response.data.message)
            ]
          }
        })
      } else {
        // eslint-disable-next-line no-console
        console.warn('validate unknown error: ', error)
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
    const basePath =
      stateObject.vars[path] !== undefined ? stateObject.vars : stateObject
    Vue.set(basePath, path, value)
  } else if (Array.isArray(path)) {
    const lastPathItem = path.splice(-1)
    Vue.set(_.get(stateObject, path), lastPathItem, value)
  } else {
    // eslint-disable-next-line no-console
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
  initForm(
    state,
    {
      form: { vars },
      extraData = {}
    }
  ) {
    const formId = Utilities.getFormId(vars)
    if (state[formId]) {
      return
    }
    const formData = {
      vars: Object.assign({}, vars, { valid: false }),
      children: {},
      cancelToken: null,
      submitting: false,
      extraData
    }

    Vue.set(state, formId, formData)
  },
  setFormData(state, { formId, data }) {
    const form = state[formId]
    setData(form, data)
  },
  destroy(state, formId) {
    if (state[formId]) Vue.delete(state, formId)
  },
  initInput(
    state,
    { formId, inputVars, children, disableValidation, inputType }
  ) {
    /*
     * Ignore if this is already initialised
     */
    if (getNestedInput(state, formId, inputVars.full_name)) {
      return
    }

    /*
     * Create the data object
     */
    const value = inputVars.multiple
      ? []
      : inputVars.block_prefixes[1] === 'checkbox'
      ? inputVars.checked
      : inputVars.value
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
    const OBJECT_PATH = getInputNameNestedPath(
      inputData.vars.full_name,
      state[formId].vars.block_prefixes[1]
    )
    const finalObjectKey = OBJECT_PATH.splice(-1)[0]

    // Create the parents if they do not currently exist
    let currentNestedObj = state[formId].children
    OBJECT_PATH.forEach(pathItem => {
      if (!currentNestedObj[pathItem]) {
        Vue.set(currentNestedObj, pathItem, {})
      }
      currentNestedObj = currentNestedObj[pathItem]
    })

    inputData.prototype = inputType === 'collection' ? children[0] : null
    if (inputData.vars.expanded) {
      inputData.children = children
    } else if (inputType === 'collection') {
      inputData.children = {}
    }

    /*
     * Finally set the initial input data nested correctly
     */
    Vue.set(currentNestedObj, finalObjectKey, Object.assign({}, inputData))
  },
  setInputData(state, { formId, inputName, data }) {
    const input = getNestedInput(state, formId, inputName)
    if (!input || !input.vars) return
    setData(input, data)
  },
  setFormDisplayErrors(state, { formId, displayErrors, valid = null }) {
    const setInput = inputName => {
      const input = getNestedInput(state, formId, inputName)
      Vue.set(input, 'displayErrors', displayErrors)
      if (valid !== null) {
        Vue.set(input.vars, 'valid', valid)
      }
    }
    const displayErrorsDeep = item => {
      for (const [inputName, child] of Object.entries(item.children)) {
        if (child.vars.block_prefixes[1] !== 'submit') {
          setInput(inputName)
        }
        if (child.children) {
          displayErrorsDeep(child)
        }
      }
    }
    displayErrorsDeep(state[formId])
  },

  // --------
  // Set specific preset keys - probably need to refine all of this!
  // ALL DEPRECATED AND WILL BE REMOVED - USE setInputData INSTEAD
  // NEED TO GO THROUGH AND CONVERT ALL REFERENCES TO THIS METHODS
  // --------
  setInputValidating(state, { formId, inputName, validating }) {
    const input = getNestedInput(state, formId, inputName)
    Vue.set(input, 'validating', validating)
  },
  setInputDebounceValidate(state, { formId, inputName, debounce }) {
    const input = getNestedInput(state, formId, inputName)
    Vue.set(input, 'debounceValidate', debounce)
  },
  setInputCancelToken(state, { formId, inputName, cancelToken }) {
    const input = getNestedInput(state, formId, inputName)
    Vue.set(input, 'cancelToken', cancelToken)
  },
  setInputLastValidationValue(state, { formId, inputName, value }) {
    const input = getNestedInput(state, formId, inputName)
    Vue.set(input, 'lastValidationValue', value)
  },
  setFormSubmitting(state, { formId, submitting }) {
    Vue.set(state[formId], 'submitting', submitting)
  },
  setFormCancelToken(state, { formId, cancelToken }) {
    Vue.set(state[formId], 'cancelToken', cancelToken)
  },
  deleteCollectionChild(state, { formId, inputName, childName }) {
    const input = getNestedInput(state, formId, inputName)
    const children = _cloneDeep(input.children)
    const replaceKeys = ['full_name', 'id', 'label', 'name']
    let previousName = null
    for (const [name, child] of Object.entries(children)) {
      if (!previousName) {
        if (name === childName) {
          delete children[name]
          previousName = name
        }
        continue
      }

      // Move up
      const newChildren = Object.entries(child.children).reduce(
        (obj, [key, value]) => {
          const newKey = key.replace(name, previousName)
          for (const replaceKey of replaceKeys) {
            value.vars[replaceKey] = value.vars[replaceKey].replace(
              name,
              previousName
            )
          }
          obj[newKey] = value
          return obj
        },
        {}
      )
      children[previousName] = Object.assign(child, {
        children: newChildren
      })
      previousName = name
    }
    if (previousName) {
      delete children[previousName]
    }
    setData(input, Object.assign({}, input, { children }))
  }
}
