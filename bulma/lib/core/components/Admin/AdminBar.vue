<template>
  <div :class="barClass">
    <div class="level">
      <div class="level-left has-padding">
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
        <div class="has-padding" v-if="!isModified">
          All changes saved
        </div>
        <div v-else class="level-item">
          <div class="level-item">
            <a @click="$bwstarter.save()" class="button is-small is-success is-uppercase is-radiusless">
              Save Changes
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { ADMIN_MODULE } from "~/.nuxt/bwstarter/storage";

  export default {
    data () {
      return {
        autoSaveLocal: false,
        cookieExpires: '6M'
      }
    },
    computed: {
      isModified() {
        return this.$bwstarter.$storage.get('isModified', [], ADMIN_MODULE)
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

  @keyframes pulse
    0%
      transform: scale(1)
    6%
      box-shadow: 0 0 0 0 rgba(darken($success, 4%), 1), 0 0 0 0 rgba($success, 1)
    8%
      transform: scale(1.04)
    15%
      transform: scale(1)
    45%, 100%
      box-shadow: 0 .2rem 0 1rem rgba($warning, 0), 0 0 .1rem .4rem rgba($success, -.1)

  .admin-bar
    position: fixed
    background: $success
    height: 2.5rem
    width: 100%
    left: 0
    bottom: 0
    &.is-modified
      background: $warning
    .level
      height: 100%
      .has-padding
        padding: 0 .5rem
      .level-right
        height: 100%
        .level-item,
        .button
          height: 100%
        .button
          backface-visibility: hidden
          -webkit-font-smoothing: subpixel-antialiased
          transform: translateZ(0)
          animation: pulse 2s infinite ease-out
          box-shadow: 0 0 0 0 rgba($success, 0)
    .checkbox
      margin-top: 0
      &:hover
        color: inherit
</style>
