<template>
  <ul v-if="errors.length" class="errors help is-danger">
    <li v-for="(error, index) in errors" :key="componentId + '-error-' + index">
      {{ error }}
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    errors: {
      type: Array,
      required: true
    },
    componentId: {
      type: String,
      required: true
    }
  }
}
</script>
