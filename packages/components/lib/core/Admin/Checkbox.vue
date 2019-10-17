<template>
  <label class="checkbox is-custom">
    <input v-model="dataModel" type="checkbox" />
    <span v-if="dataModel" class="custom-control-label">
      {{ checkedLabel || label }}
    </span>
    <span v-else class="custom-control-label">
      {{ label }}
    </span>
  </label>
</template>

<script>
import _Input from './_Input'

export default {
  mixins: [_Input],
  props: {
    label: {
      type: String,
      required: true
    },
    checkedLabel: {
      type: String,
      required: false,
      default: null
    }
  }
}
</script>
