<template>
  <wrapper v-if="inputType !== 'hidden'"
           v-bind="wrapperData"
           :useIcons="true"
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
