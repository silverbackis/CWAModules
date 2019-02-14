<template>
  <label :class="labelClass" :for="input.vars.id">
    <input v-model="inputModel"
           v-bind="commonProps"
           :type="'checkbox'"
    >
    <span :class="labelTextClass" v-html="input.vars.label"></span>
  </label>
</template>

<script>
  import InputCommonMixin from './_CommonMixin'
  import InputMixin from './Mixin'

  export default {
    mixins: [ InputCommonMixin, InputMixin ],
    data () {
      return {
        checked: []
      }
    },
    computed: {
      isCustom () {
        const inputClasses = this.input.vars.attr.class
        return inputClasses && (inputClasses.indexOf('is-custom') !== -1 || inputClasses.indexOf('custom') !== -1)
      },
      labelClass () {
        return {
          checkbox: true,
          'is-custom': this.isCustom
        }
      },
      labelTextClass () {
        return {
          'input-label': true,
          'custom-control-label': this.isCustom
        }
      }
    }
  }
</script>
