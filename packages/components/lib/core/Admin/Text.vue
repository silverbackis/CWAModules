<template>
  <div class="input-wrapper">
    <textarea v-if="isTextarea" v-model="dataModel" v-bind="inputProps" />
    <input
      v-else-if="isNumber"
      v-model.number="dataModel"
      type="number"
      v-bind="inputProps"
    />
    <input v-else v-model="dataModel" type="text" v-bind="inputProps" />
    <input-errors :errors="errors" :component-id="componentId" />
  </div>
</template>

<script>
import _Input from './_Input'

export default {
  mixins: [_Input],
  props: {
    isTextarea: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="sass">
.input-wrapper
  width: 100%
.cms-text-input
  text-align: inherit
  font-size: inherit
</style>
