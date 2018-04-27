import { getFormId } from '~/.nuxt/bwstarter/utilities'
import { FORMS_MODULE } from '~/.nuxt/bwstarter/storage'

export default {
  computed: {
    formId () {
      return getFormId(this.form.vars)
    },
    storeForm () {
      return this.$bwstarter.$storage.get('getForm', [this.formId], FORMS_MODULE)
    }
  }
}
