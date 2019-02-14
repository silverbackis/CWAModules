<template>
  <wrapper v-bind="wrapperData"
           :useIcons="true"
           class="is-simple"
  >
    <form-input :formId="formId"
                :inputName="inputName"
                :inputType="inputType"
                :parents="parents"
    />
  </wrapper>
</template>

<script>
  import InputMixin from './_Mixin'
  import FormInput from '~/.nuxt/bwstarter/components/Form/Input/Simple'

  export default {
    mixins: [ InputMixin ],
    components: {
      FormInput
    }
  }
</script>
