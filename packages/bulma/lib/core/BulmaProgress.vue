<template>
  <progress class="progress" :value.prop="value" :max="max"
    >{{ value }}%</progress
  >
</template>

<script>
export default {
  props: {
    value: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      default: 100
    }
  }
}
</script>
