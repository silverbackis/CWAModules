import _ from 'lodash'
import { mapActions, mapMutations } from 'vuex'
import axios from 'axios'
import { splitFormName } from '~/.nuxt/bwstarter/core/storage/form/module'
import { name as FORMS_MODULE } from '~/.nuxt/bwstarter/core/storage/form'

const DUPLICATE_CANCEL_MESSAGE = 'duplicate'

export default {
  methods: {
    ...mapMutations({
      setInputValidating: 'bwstarter/_forms/setInputValidating',
      setInputDebounceValidate: 'bwstarter/_forms/setInputDebounceValidate',
      setInputCancelToken: 'bwstarter/_forms/setInputCancelToken',
      setInputLastValidationValue: 'bwstarter/_forms/setInputLastValidationValue'
    }),
    ...mapActions({
      submit: 'bwstarter/_forms/submit',
      refreshCancelToken: 'bwstarter/_forms/refreshCancelToken',
      applyFormResultValidation: 'bwstarter/_forms/applyFormResultValidation'
    }),
    async inputBlur () {
      if (this.validationEnabled) {
        this.displayErrors = true
        await this.beginValidation()
      }
    },
    beginValidation () {
      if (!this.validationEnabled || this.input.disableValidation) {
        return
      }
      const localValue = this.child ? this.child.vars.value : this.inputModel
      if (this.lastValidationValue !== localValue) {
        this.lastValidationValue = this.inputModel
        this.validating = true
        if (this.cancelToken) {
          this.cancelToken.cancel(DUPLICATE_CANCEL_MESSAGE)
        }
        if (this.isCheckRadio) {
          return this.validate()
        } else {
          if (this.debounceValidate) {
            this.debounceValidate.cancel()
          }
          this.debounceValidate = _.debounce(() => {
            return this.validate()
          }, 350)
          return this.debounceValidate()
        }
      }
    },
    async validate () {
      this.refreshCancelToken({ formId: this.formId, inputName: this.inputName })
      let postObj = this.inputSubmitData
      let simulatedInputNames = []
      if (this.isRepeated) {
        for (const child of this.parents[0].children) {
          const childName = child.vars.full_name
          if (childName !== this.inputName) {
            const repeatedFieldPostObj = this.getInputSubmitData(this.extendInputId({}, childName))
            const splitChildName = splitFormName(childName)
            _.merge(postObj, repeatedFieldPostObj)

            // Simulate if empty and validating
            const otherValue = _.get(postObj, splitChildName)
            if (!otherValue || otherValue === '') {
              _.set(postObj, splitChildName, this.inputModel)
              simulatedInputNames.push(childName)
            }
          }
        }
      }
      try {
        let { data } = await this.$axios.request(
          {
            url: this.action,
            data: postObj,
            method: 'PATCH',
            cancelToken: this.cancelToken.token,
            validateStatus (status) {
              return [ 400, 200, 201 ].indexOf(status) !== -1
            },
            progress: false
          }
        )
        this.validating = false
        this.applyFormResultValidation({ formId: this.formId, formData: data.form, simulatedInputNames })
      } catch (error) {
        this.validateError(error)
      }
    },
    validateError (error) {
      if (error.message === DUPLICATE_CANCEL_MESSAGE) {
        console.log('previous input validation request cancelled')
      } else {
        this.validating = false
        if (axios.isCancel(error)) {
          console.warn(error)
        } else if (error.response) {
          console.warn('validate request error: ', error.response)
          this.$bwstarter.$storage.commit('setInputData', this.extendInputId({
            data: {
              valid: false,
              errors: [
                '<b>' + error.response.status + ' ' + error.response.statusText + ':</b> ' +
                error.response.data[ 'hydra:description' ]
              ]
            }
          }), FORMS_MODULE)
        } else {
          console.warn('validate unknown error: ', error)
        }
      }
    }
  }
}
