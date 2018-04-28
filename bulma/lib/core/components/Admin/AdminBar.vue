<template>
  <div :class="barClass">
    <div class="level">
      <div class="level-left">
        <div class="level-item">
          <label class="checkbox custom">
            <input type="checkbox" v-model="autoSaveLocal" class="custom">
            <div class="indicator"></div>
            <span class="input-label">
              Auto-save
            </span>
          </label>
        </div>
      </div>
      <div class="level-right">
        <div v-if="!isModified">
          All changes saved
        </div>
        <div v-else class="level-item">
          <div class="level-item">
            <a href="#">show changes</a>
          </div>
          <div class="level-item">
            <a href="#" class="button is-small is-success">
              Save
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        autoSaveLocal: false,
        cookieExpires: '6M'
      }
    },
    computed: {
      isModified() {
        return this.autoSaveLocal
      },
      barClass () {
        return {
          'admin-bar': true,
          'has-text-white': !this.isModified,
          'has-text-weight-bold': true,
          'is-modified': this.isModified
        }
      }
    }
  }
</script>

<style lang="sass">
  @import '~assets/css/_vars'

  .admin-bar
    position: fixed
    background: $success
    height: 2.5rem
    width: 100%
    left: 0
    bottom: 0
    padding: .2rem .5rem
    &.is-modified
      background: $warning
    .level
      height: 100%
    .checkbox
      margin-top: 0
      &:hover
        color: inherit
</style>
