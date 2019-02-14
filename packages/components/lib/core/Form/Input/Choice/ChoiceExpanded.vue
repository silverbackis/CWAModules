<template>
  <div v-if="input">
    <choice-expanded-option
      v-for="(choice, choiceIndex) in input.children"
      :key="choiceIndex"
      :index="choiceIndex"
      :input-name="inputName"
      :form-id="formId"
      input-class=""
    />
  </div>
</template>

<script>
  import InputCommonMixin from '../_CommonMixin'
  import ChoiceExpandedOption from './Option/ChoiceExpandedOption'

  export default {
    mixins: [ InputCommonMixin ],
    data () {
      return {
        is: 'radio'
      }
    },
    components: {
      ChoiceExpandedOption
    },
    created () {
      this.displayErrors = true
    }
  }
</script>
