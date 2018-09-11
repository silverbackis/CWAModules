<template>
  <input v-if="isNumber"
         v-model.number="dataModel"
         type="number"
         v-bind="inputProps"
  />
  <input v-else
         v-model="dataModel"
         type="text"
         v-bind="inputProps"
  />
</template>

<script>
  import _Input from './_Input'

  export default {
    mixins: [ _Input ]
  }
</script>
