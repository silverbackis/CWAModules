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
    },
    parents: {
      type: Array,
      default () {
        return []
      }
    }
  },
  methods: {
    ...mapMutations({
      setInputDisplayErrors: 'bwstarter/_forms/setInputDisplayErrors'
    }),
    extendInputId (data, inputName = null) {
      if (!data) {
        data = {}
      }
      return Object.assign(
        {
          formId: this.formId,
          inputName: inputName || this.inputName
        },
        data
      )
    }
  },
  computed: {
    input () {
      return this.$bwstarter.$storage.get('getInput', [ this.formId, this.inputName ], FORMS_MODULE)
    },
    vars () {
      return this.input ? this.input.vars : {}
    },
    firstRepeatInput () {
      if (!this.parents.length) {
        return this.input
      }
      const firstInputName = this.parents[0].children[0].vars.full_name
      return this.$bwstarter.$storage.get('getInput', [ this.formId, firstInputName ], FORMS_MODULE)
    },
    inputId () {
      return this.vars.id
    },
    errors () {
      return this.vars.errors || []
    },
    valid () {
      return this.vars.valid === true && this.firstRepeatInput.vars.valid === true
    },
    validating () {
      return this.input ? this.input.validating : false
    },
    label () {
      return this.vars.label
    },
    displayErrors: {
      get () {
        return this.input ? !!(this.input.displayErrors) : false //  && this.errors.length
      },
      set (displayErrors) {
        this.setInputDisplayErrors(
          this.extendInputId({ displayErrors })
        )
      }
    }
  }
}
