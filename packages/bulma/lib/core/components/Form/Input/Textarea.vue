<template>
  <wrapper v-bind="wrapperData" :use-icons="true" class="is-textarea">
    <form-input
      :form-id="formId"
      :input-name="inputName"
      :input-type="inputType"
      input-class="textarea"
    />
  </wrapper>
</template>

<script>
import InputMixin from './_Mixin'
import FormInput from '~/.nuxt/bwstarter/components/Form/Input/Textarea'

export default {
  components: {
    FormInput
  },
  mixins: [InputMixin]
}
</script>
