<template>
  <wrapper v-bind="wrapperData" :useIcons="true" class="is-textarea">
    <form-input
      :formId="formId"
      :inputName="inputName"
      :inputType="inputType"
      inputClass="textarea"
    />
  </wrapper>
</template>

<script>
import InputMixin from './_Mixin'
import FormInput from '~/.nuxt/bwstarter/components/Form/Input/Textarea'

export default {
  mixins: [InputMixin],
  components: {
    FormInput
  }
}
</script>
