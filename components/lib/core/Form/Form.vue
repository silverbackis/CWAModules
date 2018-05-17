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
  import { mapActions, mapMutations, mapGetters } from 'vuex'
  import FormMixin from './_Mixin'
  import axios from 'axios'
  import { FORMS_MODULE } from '~/.nuxt/bwstarter/core/storage'

  const DUPLICATE_CANCEL_MESSAGE = 'duplicate'
  const DESTROY_CANCEL_MESSAGE = 'destroyed'

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
      }
    },
    computed: {
      ...mapGetters({
        getFormSubmitData: 'bwstarter/forms/getFormSubmitData'
      }),
      submitData () {
        return this.getFormSubmitData(this.formId)
      },
      cancelToken: {
        get () {
          return this.storeForm.cancelToken
        },
        set (token) {
          this.setFormCancelToken({ formId: this.formId, token })
        }
      }
    },
    methods: {
      ...mapActions({
        init: 'bwstarter/forms/init',
        submitForm: 'bwstarter/forms/submit',
        refreshCancelToken: 'bwstarter/forms/refreshCancelToken'
      }),
      ...mapMutations({
        setFormSubmitting: 'bwstarter/forms/setFormSubmitting',
        setFormValidationResult: 'bwstarter/forms/setFormValidationResult',
        setInputValidationResult: 'bwstarter/forms/setInputValidationResult',
        setInputDisplayErrors: 'bwstarter/forms/setInputDisplayErrors',
        setFormCancelToken: 'bwstarter/forms/setFormCancelToken'
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
          if (!this.apiAction) {
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
            let x = form.children.length
            let child
            while (x--) {
              child = form.children[x]
              // E.g. buttons which are not valid/invalid
              if (child.vars.valid === undefined) {
                continue
              }
              this.setInputValidationResult({
                formId: this.formId,
                inputName: child.vars.full_name,
                valid: child.vars.valid,
                errors: child.vars.errors
              })
              this.setInputDisplayErrors({
                formId: this.formId,
                inputName: child.vars.full_name,
                displayErrors: true
              })
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
                error.response.data['hydra:description']
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
