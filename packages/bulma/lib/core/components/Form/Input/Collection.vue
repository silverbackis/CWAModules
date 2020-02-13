<template>
  <wrapper
    v-bind="wrapperData"
    :useIcons="false"
    :label="null"
    class="is-simple"
  >
    <form-input
      :form-id="formId"
      :input-name="inputName"
      :input-type="inputType"
      :parents="parents"
    />
  </wrapper>
</template>

<script>
import InputMixin from './_Mixin'
import FormInput from '~/.nuxt/bwstarter/components/Form/Input/Collection'

export default {
  components: {
    FormInput
  },
  mixins: [InputMixin]
}
</script>
