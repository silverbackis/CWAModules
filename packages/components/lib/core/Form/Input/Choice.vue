<template>
  <div>
    <choice-select v-if="!input.vars.expanded" v-bind="$props" />
    <choice-expanded v-else v-bind="$props" />
  </div>
</template>

<script>
import InputCommonMixin from './_CommonMixin'
import ChoiceSelect from './Choice/ChoiceSelect'
import ChoiceExpanded from './Choice/ChoiceExpanded'

export default {
  components: {
    ChoiceSelect,
    ChoiceExpanded
  },
  mixins: [InputCommonMixin]
}
</script>
