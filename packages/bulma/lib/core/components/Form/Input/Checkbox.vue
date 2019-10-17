<template>
  <wrapper
    v-bind="wrapperData"
    :label="''"
    :use-icons="false"
    class="is-checkbox"
  >
    <form-input
      :form-id="formId"
      :input-name="inputName"
      :input-type="inputType"
      input-class=""
    />
  </wrapper>
</template>

<script>
import InputMixin from './_Mixin'
import FormInput from '~/.nuxt/bwstarter/components/Form/Input/Checkbox'

export default {
  components: {
    FormInput
  },
  mixins: [InputMixin]
}
</script>
