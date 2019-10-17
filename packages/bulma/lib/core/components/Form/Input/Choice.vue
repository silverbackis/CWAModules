<template>
  <wrapper v-bind="wrapperData" :use-icons="false" class="is-choice">
    <form-input
      :form-id="formId"
      :input-name="inputName"
      :input-type="inputType"
    />
  </wrapper>
</template>

<script>
import InputMixin from './_Mixin'
import FormInput from '~/.nuxt/bwstarter/components/Form/Input/Choice'

export default {
  components: {
    FormInput
  },
  mixins: [InputMixin]
}
</script>
