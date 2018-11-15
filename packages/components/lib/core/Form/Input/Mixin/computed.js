import { mapGetters } from 'vuex'
import { splitFormName } from '~/.nuxt/bwstarter/core/storage/form/module'

export default {
  computed: {
    ...mapGetters({
      getForm: 'bwstarter/_forms/getForm',
      getInputSubmitData: 'bwstarter/_forms/getInputSubmitData'
    }),
    isRepeated () {
      return this.parents.length && this.parents[0].vars.block_prefixes[1] === 'repeated'
    },
    isSecondRepeated () {
      return this.isRepeated && this.vars.name === 'second'
    },
    splitFormName () {
      return splitFormName(this.inputName)
    },
    inputSubmitData () {
      return this.getInputSubmitData(this.extendInputId())
    },
    form () {
      return this.getForm(this.formId)
    },
    action () {
      return this.form.vars.action
    },
    attr () {
      return Object.assign({}, this.vars.attr, {
        required: this.vars.required || false,
        disabled: this.vars.disabled || this.form.submitting
      })
    },
    classes () {
      let classes = []
      if (this.inputClass !== '') {
        classes.push(this.inputClass)
      }
      // could have classes assigned from API side (this will be a string)
      let apiClasses = this.vars.attr ? this.vars.attr.class : ''
      if (undefined !== apiClasses) {
        classes.push(apiClasses)
      }
      if (this.valid) {
        classes.push('is-success')
        this.displayErrors = true
      } else if (this.displayErrors) {
        classes.push('is-danger')
      }
      return classes
    },
    isCheckRadio () {
      return this.vars.checked !== undefined || this.child
    },
    inputModel: {
      get () {
        return this.vars.value
      },
      set (value) {
        this.setInputValue(this.extendInputId({
          value
        }))
        this.beginValidation()
      }
    },
    validating: {
      get () {
        return this.validating
      },
      set (validating) {
        this.setInputValidating(
          this.extendInputId({ validating })
        )
      }
    },
    commonProps () {
      return Object.assign(this.attr, {
        id: this.inputId,
        name: this.inputName,
        class: this.classes
      })
    },
    /**
     * These need to be in the store because individual radios should share the debounce/cancel tokens and
     * last validation values but are outputted as child inputs/components
     */
    debounceValidate: {
      get () {
        return this.input ? this.input.debounceValidate : {}
      },
      set (debounce) {
        this.setInputDebounceValidate(
          this.extendInputId({ debounce })
        )
      }
    },
    cancelToken: {
      get () {
        return this.input ? this.input.cancelToken : null
      },
      set (token) {
        this.setInputCancelToken(
          this.extendInputId({ token })
        )
      }
    },
    lastValidationValue: {
      get () {
        return this.input ? this.input.lastValidationValue : null
      },
      set (value) {
        this.setInputLastValidationValue(
          this.extendInputId({ value })
        )
      }
    }
  }
}
