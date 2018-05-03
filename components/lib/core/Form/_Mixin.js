import { Utilities } from '~/.nuxt/bwstarter/core/server'
import { FORMS_MODULE } from '~/.nuxt/bwstarter/core/storage'

export default {
  computed: {
    formId () {
      return Utilities.getFormId(this.form.vars)
    },
    storeForm () {
      return this.$bwstarter.$storage.get('getForm', [this.formId], FORMS_MODULE)
    }
  }
}
