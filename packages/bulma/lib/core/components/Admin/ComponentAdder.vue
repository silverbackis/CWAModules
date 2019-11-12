<template>
  <div :class="['component-adder', !!component ? 'has-component' : null]">
    <button
      v-if="component"
      class="button is-secondary is-radiusless is-modify"
      @click="modifyComponent(component)"
    >
      Modify
    </button>
    <button
      v-if="component"
      class="button is-secondary is-danger is-delete"
      @click="deleteComponent(component)"
    >
      Delete
    </button>
    <button
      class="button is-primary is-radiusless is-add"
      @click="addComponent(page, location)"
    >
      + add
    </button>
    <hr class="hr-line" />
  </div>
</template>

<script>
export default {
  props: {
    location: {
      type: Object,
      required: false,
      default: null
    },
    page: {
      type: Object,
      required: true
    },
    component: {
      type: Object,
      required: false,
      default: null
    }
  },
  methods: {
    addComponent(page, location) {
      this.$emit('add', { page, location })
    },
    modifyComponent(component) {
      this.$emit('modify', { component })
    },
    deleteComponent(component) {
      this.$emit('delete', { component })
    }
  }
}
</script>

<style lang="sass">
.component-adder
  z-index: 2
  &:not(.has-component)
    position: relative
  .button
    position: absolute
    border: 1px solid $grey-light
    z-index: 2
    bottom: 0
    &.is-add
      left: 0
      top: 100%
      bottom: auto
      transform: translateY(-50%)
      &:hover
        + .hr-line
          background: $primary
    &.is-modify
      right: 0
      transform: translateY(-50%)
    &.is-delete
      right: 0
      bottom: auto
      top: 0
      transform: translateY(50%)
  .hr-line
    background: $grey-light
    position: absolute
    height: 1px
    bottom: 0
    left: 0
    width: 100%
    margin: 0
.component-adder:first-child .button.is-add
  transform: translateY(0)
  border-top: 0
.bulma-component
  &:nth-last-child(2)
    .component-adder .button.is-add
      transform: translateY(-100%)
      border-bottom: 0
</style>
