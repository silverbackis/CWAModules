import { mapGetters } from 'vuex'
import { name as FORMS_MODULE } from '~/.nuxt/bwstarter/core/storage/form'

export default {
  computed: {
    ...mapGetters({
      getInputSubmitData: 'bwstarter/_forms/getInputSubmitData'
    }),
    isRepeated() {
      return (
        this.parents.length &&
        this.parents[0].vars.block_prefixes[1] === 'repeated'
      )
    },
    inputSubmitData() {
      return this.getInputSubmitData(this.extendInputId())
    },
    form() {
      return this.$bwstarter.$storage.state[FORMS_MODULE][this.formId] || { vars: {} }
    },
    action() {
      return this.form.vars.action
    },
    attr() {
      return Object.assign({}, this.vars.attr, {
        required: this.vars.required || false,
        disabled: this.vars.disabled || this.form.submitting
      })
    },
    hasErrors() {
      return !this.valid && this.displayErrors && !this.validating // && !!this.errors.length
    },
    validClass() {
      return {
        'is-success': this.valid && !this.validating,
        'is-danger': this.hasErrors
      }
    },
    classes() {
      const classes = []
      if (this.inputClass !== '') {
        classes.push(this.inputClass)
      }
      // could have classes assigned from API side (this will be a string)
      const apiClasses = this.vars.attr ? this.vars.attr.class : ''
      if (undefined !== apiClasses) {
        classes.push(apiClasses)
      }
      if (this.valid && !this.validating) {
        this.displayErrors = true
      }
      classes.push(this.validClass)
      return classes
    },
    isCheckRadio() {
      return this.vars.checked !== undefined || this.child
    },
    inputModel: {
      get() {
        return this.vars.value
      },
      set(value) {
        this.$bwstarter.$storage.commit(
          'setInputData',
          this.extendInputId({
            data: {
              value
            }
          }),
          FORMS_MODULE
        )
        this.beginValidation()
      }
    },
    validating: {
      get() {
        return this.input.validating
      },
      set(validating) {
        this.setInputValidating(this.extendInputId({ validating }))
      }
    },
    commonProps() {
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
      get() {
        return this.input ? this.input.debounceValidate : {}
      },
      set(debounce) {
        this.setInputDebounceValidate(this.extendInputId({ debounce }))
      }
    },
    cancelToken: {
      get() {
        return this.input ? this.input.cancelToken : null
      },
      set(token) {
        this.setInputCancelToken(this.extendInputId({ token }))
      }
    },
    lastValidationValue: {
      get() {
        return this.input ? this.input.lastValidationValue : null
      },
      set(value) {
        this.setInputLastValidationValue(this.extendInputId({ value }))
      }
    },
    validationEnabled() {
      return (
        this.form.vars.realtime_validate !== false &&
        [null, '', '#'].indexOf(this.action) === -1
      )
    }
  }
}
