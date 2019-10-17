<template>
  <wrapper
    v-if="inputType !== 'hidden'"
    v-bind="wrapperData"
    :use-icons="false"
    label=""
    :errors="[]"
    class="is-button"
  >
    <form-input
      :form-id="formId"
      :input-name="inputName"
      :input-type="inputType"
      input-class="button"
    />
  </wrapper>
</template>

<script>
import InputMixin from './_Mixin'
import FormInput from '~/.nuxt/bwstarter/components/Form/Input/Button'

export default {
  components: {
    FormInput
  },
  mixins: [InputMixin]
}
</script>
