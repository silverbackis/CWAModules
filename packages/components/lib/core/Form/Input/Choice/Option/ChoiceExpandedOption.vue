<template>
  <label v-if="input" :class="labelClass" :for="child.vars.id">
    <input
      v-if="!input.vars.multiple"
      :id="child.vars.id"
      v-model="inputModel"
      v-bind="localProps"
      :value="child.vars.value"
    />
    <input
      v-else
      :id="child.vars.id"
      v-model="inputModel"
      v-bind="localProps"
      :value="child.vars.value"
    />
    <span :class="labelTextClass" v-html="child.vars.label"></span>
  </label>
</template>

<script>
import InputCommonMixin from '../../_CommonMixin'
import InputMixin from '../../Mixin/index'

export default {
  mixins: [InputCommonMixin, InputMixin],
  props: {
    index: {
      type: Number,
      required: true
    }
  },
  computed: {
    child() {
      return this.input.children[this.index]
    },
    isCustom() {
      const inputClasses = this.child.vars.attr.class
      return (
        inputClasses &&
        (inputClasses.indexOf('is-custom') !== -1 ||
          inputClasses.indexOf('custom') !== -1)
      )
    },
    labelClass() {
      return {
        radio: !this.input.vars.multiple,
        checkbox: this.input.vars.multiple,
        'is-custom': this.isCustom
      }
    },
    localProps() {
      const localProps = Object.assign(
        {
          type: this.input.vars.multiple ? 'checkbox' : 'radio'
        },
        this.commonProps
      )
      localProps.class.push(this.child.vars.attr.class)
      return localProps
    },
    labelTextClass() {
      return {
        'input-label': true,
        'custom-control-label': this.isCustom
      }
    }
  }
}
</script>
