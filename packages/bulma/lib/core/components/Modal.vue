<template>
  <div :class="['modal', active ? 'is-active' : null]">
    <div class="modal-background" @click="close"></div>
    <div tabindex="0"></div>
    <div ref="dialog" role="dialog" aria-modal="true" class="modal-content">
      <div class="card">
        <div class="card-content">
          <slot name="modal-close">
            <button
              class="modal-close is-large"
              aria-label="close"
              @click="close"
            ></button>
          </slot>
          <slot />
        </div>
      </div>
    </div>
    <div tabindex="0"></div>
  </div>
</template>
<script>
export default {
  props: {
    active: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      ignoreUtilFocusChanges: false,
      lastFocus: null
    }
  },
  watch: {
    active: {
      immediate: true,
      handler(newValue) {
        this.$root.$emit('modalShowing', newValue)
      },
      deep: true
    }
  },
  mounted() {
    document.addEventListener('focus', this.trapFocus, true)
  },
  beforeDestroy() {
    document.removeEventListener('focus', this.trapFocus, true)
  },
  methods: {
    close() {
      this.$emit('close')
      this.$root.$emit('modalShowing', false)
      document.removeEventListener('focus', this.trapFocus, true)
    },
    trapFocus(event) {
      if (!this.active) {
        return
      }
      const dialogNode = this.$refs.dialog
      if (dialogNode.contains(event.target)) {
        this.lastFocus = event.target
      } else {
        if (this.lastFocus === document.activeElement) {
          this.focusLastDescendant(dialogNode)
        } else {
          this.focusFirstDescendant(dialogNode)
        }
        this.lastFocus = document.activeElement
      }
    },
    focusFirstDescendant(element) {
      for (let i = 0; i < element.childNodes.length; i++) {
        const child = element.childNodes[i]
        if (this.attemptFocus(child) || this.focusFirstDescendant(child)) {
          return true
        }
      }
      return false
    },
    focusLastDescendant(element) {
      for (let i = element.childNodes.length - 1; i >= 0; i--) {
        const child = element.childNodes[i]
        if (this.attemptFocus(child) || this.focusLastDescendant(child)) {
          return true
        }
      }
      return false
    },
    attemptFocus(element) {
      if (!this.isFocusable(element)) {
        return false
      }

      this.ignoreUtilFocusChanges = true
      try {
        element.focus()
      } catch (e) {}
      this.ignoreUtilFocusChanges = false
      return document.activeElement === element
    },
    isFocusable(element) {
      if (
        element.tabIndex > 0 ||
        (element.tabIndex === 0 && element.getAttribute('tabIndex') !== null)
      ) {
        return true
      }

      if (element.disabled) {
        return false
      }

      switch (element.nodeName) {
        case 'A':
          return !!element.href && element.rel !== 'ignore'
        case 'INPUT':
          return element.type !== 'hidden' && element.type !== 'file'
        case 'BUTTON':
        case 'SELECT':
        case 'TEXTAREA':
          return true
        default:
          return false
      }
    }
  }
}
</script>
