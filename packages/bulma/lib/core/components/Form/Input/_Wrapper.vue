<template>
  <div v-if="!hidden" class="field form-wrapper">
    <label
      v-if="label && label !== ''"
      class="label"
      :for="inputId"
      v-html="label"
    ></label>
    <div :class="controlClass">
      <div :class="wrapperClass">
        <slot></slot>
      </div>
      <span
        v-if="useIcons && !validating && iconClass"
        :class="iconWrapperClass"
      >
        <font-awesome-icon :icon="iconClass" />
      </span>
    </div>
    <div
      v-if="displayErrors && errors.length && !validating"
      class="help is-danger"
    >
      <ul>
        <li
          v-for="(error, errorIndex) in errors"
          :key="errorIndex"
          v-html="error"
        ></li>
      </ul>
    </div>
  </div>
  <div v-else>
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    inputId: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: false,
      default: null
    },
    validating: {
      type: Boolean,
      required: true
    },
    // not required for a button
    valid: {
      type: Boolean,
      required: false
    },
    errors: {
      type: Array,
      required: true
    },
    useIcons: {
      type: Boolean,
      required: false,
      default: false
    },
    displayErrors: {
      type: Boolean,
      required: true
    },
    select: {
      type: [Boolean, String],
      default: false,
      validator(value) {
        return value === false || ['single', 'multiple'].indexOf(value) !== -1
      }
    },
    hidden: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    hasErrors() {
      return !this.valid && this.displayErrors && !this.validating // && !!this.errors.length
    },
    controlClass() {
      return [
        'control',
        this.useIcons ? 'has-icons-right' : '',
        this.validating ? 'is-loading' : ''
      ]
    },
    iconWrapperClass() {
      return {
        'icon is-right is-small': true,
        'has-text-danger': this.hasErrors,
        'has-text-success': this.valid
      }
    },
    iconClass() {
      if (this.hasErrors) {
        return ['fas', 'exclamation-triangle']
      }
      if (this.valid) {
        return ['fas', 'check']
      }
      return null
    },
    wrapperClass() {
      return this.select ? this.selectClass : this.fieldClass
    },
    fieldClass() {
      return Object.assign(this.validClass, {
        field: false
      })
    },
    selectClass() {
      return Object.assign(this.validClass, {
        select: true,
        'is-multiple': this.select === 'multiple'
      })
    },
    validClass() {
      return {
        'is-success': this.valid && !this.validating,
        'is-danger': this.hasErrors
      }
    }
  }
}
</script>
