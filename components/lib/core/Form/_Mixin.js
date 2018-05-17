import { Utilities } from '~/.nuxt/bwstarter/core/server'
import { FORMS_MODULE } from '~/.nuxt/bwstarter/core/storage'
import { mapMutations } from 'vuex'

export default {
  computed: {
    formId () {
      return Utilities.getFormId(this.form.vars)
    },
    storeForm () {
      return this.$bwstarter.$storage.get('getForm', [this.formId], FORMS_MODULE)
    },
    isValid () {
      return this.$bwstarter.$storage.get('isValid', [this.formId], FORMS_MODULE)
    }
  },
  methods: {
    destroyForm() {
      this.$bwstarter.$storage.commit('destroy', [this.formId], FORMS_MODULE)
    }
  }
}
