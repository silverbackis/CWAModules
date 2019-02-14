<template>
  <wrapper v-bind="wrapperData"
           :useIcons="false"
           class="is-choice"
  >
    <form-input :formId="formId"
                :inputName="inputName"
                :inputType="inputType"
    />
  </wrapper>
</template>

<script>
  import InputMixin from './_Mixin'
  import FormInput from '~/.nuxt/bwstarter/components/Form/Input/Choice'

  export default {
    mixins: [ InputMixin ],
    components: {
      FormInput
    }
  }
</script>
