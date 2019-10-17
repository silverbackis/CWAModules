<template>
  <wrapper v-bind="wrapperData" :use-icons="true" class="is-simple">
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
import FormInput from '~/.nuxt/bwstarter/components/Form/Input/Simple'

export default {
  components: {
    FormInput
  },
  mixins: [InputMixin]
}
</script>
