<template>
  <label class="checkbox is-custom">
    <input type="checkbox" v-model="dataModel" />
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
      Type: String,
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
