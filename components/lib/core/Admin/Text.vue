<template>
  <input v-model="model"
         :placeholder="placeholder"
         class="cms-text-input"
  />
</template>

<script>
  import _Input from './_Input'
  export default {
    mixins: [_Input]
  }
</script>
