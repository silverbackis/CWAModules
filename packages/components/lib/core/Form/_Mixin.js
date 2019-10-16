import { Utilities } from '~/.nuxt/bwstarter/core/server'
import { name as FORMS_MODULE } from '~/.nuxt/bwstarter/core/storage/form'

export default {
  props: {
    successFn: {
      type: Function,
      required: false
    },
    apiAction: {
      type: Boolean,
      default: true
    },
    showSuccess: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    formId() {
      return Utilities.getFormId(this.form.vars)
    },
    storeForm() {
      return this.$bwstarter.$storage.get(
        'getForm',
        [this.formId],
        FORMS_MODULE
      )
    },
    isValid() {
      return this.$bwstarter.$storage.get(
        'isValid',
        [this.formId],
        FORMS_MODULE
      )
    }
  },
  methods: {
    destroyForm() {
      this.$bwstarter.$storage.commit('destroy', [this.formId], FORMS_MODULE)
    }
  }
}
