<template>
  <form :id="formId"
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
  import { mapActions, mapGetters, mapMutations } from 'vuex'
  import FormMixin from './_Mixin'
  import axios from 'axios'
  import { name as FORMS_MODULE } from '~/.nuxt/bwstarter/core/storage/form'

  const DUPLICATE_CANCEL_MESSAGE = 'duplicate'
  const DESTROY_CANCEL_MESSAGE = 'destroyed'

  export default {
    mixins: [ FormMixin ],
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
      }
    },
    computed: {
      ...mapGetters({
        getFormSubmitData: 'bwstarter/_forms/getFormSubmitData'
      }),
      submitData () {
        return this.getFormSubmitData(this.formId)
      },
      cancelToken: {
        get () {
          return this.storeForm ? this.storeForm.cancelToken : null
        },
        set (token) {
          this.setFormCancelToken({ formId: this.formId, token })
        }
      }
    },
    methods: {
      ...mapActions({
        init: 'bwstarter/_forms/init',
        submitForm: 'bwstarter/_forms/submit',
        refreshCancelToken: 'bwstarter/_forms/refreshCancelToken',
        validateFormView: 'bwstarter/_forms/validateFormView'
      }),
      ...mapMutations({
        setFormSubmitting: 'bwstarter/_forms/setFormSubmitting',
        setFormValidationResult: 'bwstarter/_forms/setFormValidationResult',
        setInputDisplayErrors: 'bwstarter/_forms/setInputDisplayErrors',
        setFormDisplayErrors: 'bwstarter/_forms/setFormDisplayErrors',
        setFormCancelToken: 'bwstarter/_forms/setFormCancelToken'
      }),
      async submit () {
        this.setFormSubmitting({
          formId: this.formId,
          submitting: true
        })

        if (this.cancelToken) {
          this.cancelToken.cancel(DUPLICATE_CANCEL_MESSAGE)
        }
        this.refreshCancelToken({ formId: this.formId })
        try {
          let ops = {
            url: this.form.vars.action,
            data: this.submitData,
            method: 'POST',
            cancelToken: this.cancelToken.token,
            validateStatus (status) {
              return [ 400, 200, 201, 401 ].indexOf(status) !== -1
            },
            headers: {
              'X-XSRF-TOKEN': this.$cookie.get('XSRF-TOKEN')
            }
          }
          if (!this.apiAction || this.form.vars.api_request === false) {
            ops.baseURL = null
          }
          let { status, data } = await this.$axios.request(ops)
          if (this.successFn) {
            this.successFn(data)
          }
          const form = data.form
          const errors = form ? form.vars.errors : (data.message ? [ data.message ] : [])
          this.setFormValidationResult({
            formId: this.formId,
            valid: status === 200,
            errors: errors
          })
          if (form) {
            this.validateFormView({ formId: this.formId, formData: form, isSubmit: true })
          } else {
            if (errors.length) {
              this.setFormDisplayErrors({ formId: this.formId, displayErrors: true, valid: false })
            } else {
              this.setFormDisplayErrors({ formId: this.formId, displayErrors: false, valid: true })
            }
          }
        } catch (error) {
          this.submitError(error)
        }

        this.setFormSubmitting({
          formId: this.formId,
          submitting: false
        })
      },
      submitError (error) {
        if (error.message === DUPLICATE_CANCEL_MESSAGE) {
          console.log('previous form submission cancelled')
        } else {
          if (axios.isCancel(error)) {
            console.warn(error)
          } else if (error.response) {
            console.warn('validate request error: ', error.response)
            this.setFormValidationResult({
              formId: this.formId,
              valid: false,
              errors: [
                '<b>' + error.response.status + ' ' + error.response.statusText + ':</b> ' +
                error.response.data[ 'hydra:description' ]
              ]
            })
          } else {
            console.warn('validate unknown error: ', error)
          }
        }
      }
    },
    created () {
      this.$bwstarter.$storage.dispatch('init', this.form, FORMS_MODULE)
    },
    beforeDestroy () {
      if (this.cancelToken) {
        this.cancelToken.cancel(DESTROY_CANCEL_MESSAGE)
      }
      if (this.isValid) {
        this.destroyForm(this.formId)
      }
    }
  }
</script>
