<template>
  <div>
    <input v-model="dataModel" type="text" v-bind="inputProps" />
    <input-errors :errors="errors" :component-id="componentId" />
  </div>
</template>

<script>
import flatpickr from 'flatpickr'
import _Input from './_Input'
export default {
  mixins: [_Input],
  props: {
    theme: {
      type: String,
      default: 'light'
    }
  },
  data() {
    return {
      flatpickr: null
    }
  },
  mounted() {
    this.flatpickr = flatpickr(this.$el, {
      altInput: true,
      altFormat: 'D F j, Y H:i',
      dateFormat: 'Y-m-d H:i:S',
      enableTime: true
    })
  },
  beforeDestroy() {
    this.flatpickr.destroy()
  }
}
</script>
