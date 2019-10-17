<template>
  <select
    v-if="input"
    v-model="inputModel"
    v-bind="commonProps"
    :multiple="input.vars.multiple"
    @change="displayErrors = true"
  >
    <select-option
      v-for="(choice, choiceIndex) in input.vars.choices"
      :key="choiceIndex"
      :option="choice"
    />
  </select>
</template>

<script>
import InputCommonMixin from '../_CommonMixin'
import InputMixin from '../Mixin/index'
import SelectOption from './Option/ChoiceSelectOption'

export default {
  components: {
    SelectOption
  },
  mixins: [InputCommonMixin, InputMixin]
}
</script>

<style lang="sass">
.select
  width: 100%
  select
    width: 100%
</style>
