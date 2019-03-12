<template>
  <form-tag
    :form="form"
    :success-fn="successFn"
    :api-action="apiAction"
    :extra-data="extraData"
  >
    <slot name="errors" v-if="formErrors.length">
      <div>
        <ul class="content">
          <li v-for="(error, index) in formErrors" :key="index"><h4 class="help is-danger" v-html="$t ? $t(error) : error"></h4></li>
        </ul>
      </div>
    </slot>

    <slot name="form" v-if="!formValid || !showSuccess">
      <form-input v-for="input in form.children"
                  :key="input.vars.full_name"
                  :input="input"
                  :formId="formId"
                  :wrapped="true"
      />
      <slot name="form-append"></slot>
    </slot>

    <slot name="success" v-else>
      <div class="content form-result">
        <h1 class="has-text-success has-text-weight-bold">Thank you</h1>
        <p>The form has been successfully submitted. This is just a test form so nothing has happened except validation.</p>
        <p>On a real system you can easily add the functionality to send an email or any other action in the API.</p>
        <p><strong>You now continue your website expedition.</strong></p>
      </div>
    </slot>

  </form-tag>
</template>

<script>
  import ComponentMixin from '~/.nuxt/bwstarter/bulma/components/componentMixin'
  import FormTag from '~/.nuxt/bwstarter/components/Form/Form'
  import FormInput from '~/.nuxt/bwstarter/components/Form/FormInput'
  import FormMixin from '~/.nuxt/bwstarter/components/Form/_Mixin'

  export default {
    mixins: [ ComponentMixin, FormMixin ],
    props: {
      extraData: {
        type: Object,
        default () {
          return {}
        }
      }
    },
    computed: {
      form () {
        return this.component.form
      },
      formErrors () {
        // the form is initialised in the store in the form tag which is a child component
        return this.storeForm ? this.storeForm.vars.errors : []
      },
      formValid () {
        return this.storeForm ? this.storeForm.vars.valid : false
      }
    },
    components: {
      FormTag,
      FormInput
    }
  }
</script>

<style>
  .section ~ .form-section {
    padding-top: 1.5rem;
  }

  .form-container {
    max-width: 800px;
  }
</style>