<template>
  <form
    :id="formId"
    :action="form.vars.action"
    :required="form.vars.required"
    :method="form.vars.method"
    :enctype="form.vars.multipart"
    v-bind="form.vars.attr"
    @submit.prevent="submit"
  >
    <slot></slot>
  </form>
</template>

<script>
import { mapActions } from 'vuex'
import FormMixin from './_Mixin'
import {
  name as FORMS_MODULE,
  DESTROY_CANCEL_MESSAGE
} from '~/.nuxt/bwstarter/core/storage/form'

export default {
  mixins: [FormMixin],
  props: {
    form: {
      type: Object,
      required: true
    },
    successFn: {
      type: Function,
      required: false
    },
    apiAction: {
      type: Boolean,
      default: true
    },
    extraData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  computed: {
    cancelToken() {
      return this.storeForm ? this.storeForm.cancelToken : null
    }
  },
  methods: {
    ...mapActions({
      init: 'bwstarter/_forms/init',
      submitForm: 'bwstarter/_forms/submitForm'
    }),
    async submit() {
      this.submitForm({
        formId: this.formId,
        apiAction: this.apiAction,
        successFn: this.successFn
      })
    }
  },
  created() {
    this.$bwstarter.$storage.commit(
      'initForm',
      { form: this.form, extraData: this.extraData },
      FORMS_MODULE
    )
  },
  beforeDestroy() {
    if (this.cancelToken) {
      this.cancelToken.cancel(DESTROY_CANCEL_MESSAGE)
    }
    if (this.isValid) {
      this.destroyForm(this.formId)
    }
  }
}
</script>
