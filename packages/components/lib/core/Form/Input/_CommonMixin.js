import { mapMutations } from 'vuex'
import { name as FORMS_MODULE } from '~/.nuxt/bwstarter/core/storage/form'

export default {
  props: {
    formId: {
      type: String,
      required: true
    },
    inputName: {
      type: String,
      required: true
    },
    inputType: {
      type: String,
      require: true
    }
  },
  methods: {
    ...mapMutations({
      setInputDisplayErrors: 'bwstarter/_forms/setInputDisplayErrors'
    }),
    extendInputId (data) {
      if (!data) {
        data = {}
      }
      return Object.assign(
        {
          formId: this.formId,
          inputName: this.inputName
        },
        data
      )
    }
  },
  computed: {
    input () {
      return this.$bwstarter.$storage.get('getInput', [this.formId, this.inputName], FORMS_MODULE)
    },
    inputId () {
      return this.input.vars.id
    },
    errors () {
      return this.input.vars.errors
    },
    valid () {
      return this.input.vars.valid
    },
    validating () {
      return this.input.validating
    },
    label () {
      return this.input.vars.label
    },
    displayErrors: {
      get () {
        return !!(this.input.displayErrors && this.errors.length)
      },
      set (displayErrors) {
        this.setInputDisplayErrors(
          this.extendInputId({ displayErrors })
        )
      }
    }
  }
}
