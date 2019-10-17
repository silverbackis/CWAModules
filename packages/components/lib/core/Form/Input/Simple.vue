<template>
  <div>
    <input
      v-if="inputType === 'hidden'"
      v-model="inputModel"
      v-bind="commonProps"
      type="hidden"
      v-on="events"
    />
    <input
      v-else-if="inputType === 'password'"
      v-model="inputModel"
      v-bind="commonProps"
      :type="'password'"
      v-on="events"
    />
    <input
      v-else-if="inputType === 'submit'"
      v-model="inputModel"
      v-bind="commonProps"
      :type="'submit'"
      v-on="events"
    />
    <input
      v-else-if="inputType === 'button'"
      v-model="inputModel"
      v-bind="commonProps"
      :type="'button'"
      v-on="events"
    />
    <input
      v-else-if="inputType === 'date'"
      v-model="inputModel"
      v-bind="commonProps"
      :type="'date'"
      v-on="events"
    />
    <input
      v-else-if="inputType === 'time'"
      v-model="inputModel"
      v-bind="commonProps"
      :type="'time'"
      v-on="events"
    />
    <input
      v-else-if="inputType === 'datetime-local'"
      v-model="inputModel"
      v-bind="commonProps"
      :type="'datetime-local'"
      v-on="events"
    />
    <input
      v-else-if="inputType === 'email'"
      v-model="inputModel"
      v-bind="commonProps"
      :type="'email'"
      v-on="events"
    />
    <input
      v-else-if="inputType === 'number'"
      v-model.number="inputModel"
      v-bind="commonProps"
      :type="'number'"
      v-on="events"
    />
    <input
      v-else-if="inputType === 'url'"
      v-model="inputModel"
      v-bind="commonProps"
      :type="'url'"
      v-on="events"
    />
    <input
      v-else
      v-model="inputModel"
      v-bind="commonProps"
      :type="'text'"
      v-on="events"
    />
  </div>
</template>

<script>
import InputCommonMixin from './_CommonMixin'
import InputMixin from './Mixin'

export default {
  mixins: [InputCommonMixin, InputMixin],
  data() {
    return {
      events: {
        blur: this.inputBlur,
        'keypress.enter': this.inputBlur
      }
    }
  }
}
</script>
