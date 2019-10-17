<template>
  <component-wrapper
    ref="nav"
    dom-tag="nav"
    :extendClass="false"
    :class-name="['navbar', 'is-fixed-top', component.className]"
    :style="{ transform: 'translateY(' + this.navY + 'px)' }"
  >
    <div class="navbar-brand">
      <slot name="logo">
        <nuxt-link class="navbar-item" to="/" exact>
          <img
            src="data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjEyMDAiIHZpZXdCb3g9IjAgMCA4NDAgMTIwMCIgd2lkdGg9Ijg0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJtNTAwLjY2MDA4NyA0NTMuNDcwNjg0aC0xNjMuOTQ1NzA5Yy0yMS44NTA0NjYgMC0zNy44OTg5MTktNi4zMTc5NDEtNDguMTU1OTA2LTE5LjAyNzg5My0xMC4zNTk3OTMtMTIuNzA3MjA5LTE1LjUwMDE0OS0yNi40MDc1MTEtMTUuNTAwMTQ5LTQxLjE1MDI4OCAwLTE0LjcxMjU5OSA1LjE0MDM1Ni0yOC40MTI5MDIgMTUuNTAwMTQ5LTQxLjEyMjg1NCAxMC4yNTY5ODctMTIuNzA5OTUyIDI2LjMwNTQ0LTE5LjA5OTIyIDQ4LjE1NTkwNi0xOS4wOTkyMmgyNzMuODI4MDU4YzEwMC4yMTU4NDUgMCAxNTEuNjM1MjE3LTU1LjQ3ODgxOCAxNTQuMjEwNjY3LTE2Ni41NjUzOTJ2LTYuMDA3OTQyYzAtLjUzMjIxLS4wNTI3MjItMS4wMjMyNy0uMDUyNzIyLTEuNTUyNzM3di0xNTguODEyNjc3MDhoLTE0OC40MDg2NTVjLTEuMjk2OTUxLS4wMTkyMDM0Ny0yLjUwMTY0LS4xMzE2ODA5Mi0zLjgxOTY3OS0uMTMxNjgwOTJoLTI1NC41MjY2ODNjLTIxNC40MTYwOTMgMC0zMzMuNzU0MDU5OSAxMDAuNTU3NTg2LTM1Ny45NDUzNjQgMzAxLjcxMzkwOSAxMy4xODAzOTg5IDUuNjIzODczIDEwMC4xODk0ODQgNDMuNDEwODExIDEyMS40MTc4MzQgNjkuNjY3NDM4IDIzLjg2NzA2Ny0xLjM0OTczIDM5LjQ1OTQ3OCAxNC45MDE4OSA0NC4yMzA3ODMgMjMuNDc0ODY3IDkuMTI4NzQ0IDEuNzk0MTUzIDcuODE4NjEyIDEwLjgzODk4NiA3LjgxODYxMiAxMC44Mzg5ODZzLTMuOTA0MDM0IDI0LjgxMDg4LTExLjI4MjQyMSAzMS41ODY5NjFjNC43ODQ0ODUgOC4xMTIwOTMtMS43Mzk4MTMgMTEuNzI3ODMyLTEuNzM5ODEzIDExLjcyNzgzMnMtMy4wMzQxMjcgMTQuNDQzNzUxIDE0Ljc0ODg2NyAyOC44ODQ3NThjMTcuMzUzMzEzIDguMTI1ODEgMjguNjI1MTkgNC41MTAwNzIgNDkuNDU1NDkyIDMwLjY4NDM5OCAxMi41NTgyODQgMy42MTU3MzkgMTguMTk2ODU5IDkuOTQ3Mzk2IDE4LjE5Njg1OSA5Ljk0NzM5NnMyLjE3NzQwMiAxNC40MzAwMzUgMTYuNDg4Njc5IDI0LjM2MzcxNGMxMy44ODY4NjggMTguOTUxMDc5IDcuMzc4Mzg3IDI1LjI2OTAyIDI1LjE2MTM4MSA1NS4wNzI4MDIgMTUuMTYyNzMxIDcuMjA5NTMgMTguNjM3MDg0IDE2LjY5NjA0MyAxMS4yNjkyNDEgMjguODcxMDQyLTUuMTk4MzQ5IDQuNTEwMDcxLTMyLjUyNjU4OCA2MC4wNDEwMTMtNzQuNjAzNjkzIDU1LjA2MTgyOC0xNy4yMTYyMzcgMTEuNjY3NDc4LTQ4LjEwMDU0OCAxNi40MjcxOTUtNzAuODI4ODI4IDI2LjMyMjQ2NyA0OS41ODcyOTcgMjUuNDcyMDI4IDExMS4wNjMzMTMgMzguMjIzMTMxIDE4NC40NTQ0MSAzOC4yMjMxMzFoMTYzLjg2OTI2M2MyMS45MDMxODcgMCAzNy45NDYzNjkgNi4zOTIwMTEgNDguMjMyMzUyIDE5LjEyNjY1NCAxMC4yNTY5ODYgMTIuNzA3MjA4IDE1LjM5OTk3OCAyNi4zODI4MjEgMTUuMzk5OTc4IDQxLjEyMjg1NCAwIDE0Ljc0Mjc3Ni01LjE0Mjk5MiAyOC40MTU2NDUtMTUuMzk5OTc4IDQxLjEyNTU5Ny0xMC4yODU5ODMgMTIuNzM0NjQzLTI2LjMyOTE2NSAxOS4wNDk4NC00OC4yMzIzNTIgMTkuMDQ5ODRoLTMzMS42MjQxMDdjLTEwMC4yNDIyMDU4IDAtMTUxLjczMjc1MiA1NS41NDE5MTUtMTU0LjIzMTc1NTYgMTY2LjU1NDQxNnYxLjI1MzcxaC0uMTk3NzA2djE2NC44OTc0NGgxMzkuOTQ0MjAyNmM0LjE0MzkxOC4xOTIwMyA4LjI0ODI5NC40Mjc5NiAxMi41ODIwMDkuNDI3OTZoMzE2LjIyNDEzYzIzOS4wNDc2MjIgMCAzNTguNjQ2NTYxLTEyNy43MTEyOSAzNTguNjQ2NTYxLTM4My4yNzM3OCAwLTI0Mi4xMTQ1NzYtMTEzLjE0NTgxNi0zNjMuMjU1NTM2LTMzOS4zMzk5MTMtMzYzLjI1NTUzNiIgZmlsbD0iIzQ4YTJhMiIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+"
            alt="Silverback CWA Logo"
            class="logo"
          />
        </nuxt-link>
      </slot>
      <div
        class="navbar-burger burger"
        @click="isActive = !isActive"
        :class="{ 'is-active': isActive }"
      >
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
    <div class="navbar-menu" :class="{ 'is-active': isActive }">
      <div
        v-if="$slots['navbar-start'] || (!itemsAtEnd && childComponents.length)"
        class="navbar-start"
      >
        <bulma-navbar-item
          v-if="!itemsAtEnd && childComponents.length"
          v-for="(component, index) in childComponents[0]"
          :component="component"
          :key="index"
        />
        <slot name="navbar-start"> </slot>
      </div>

      <div
        v-if="$slots['navbar-end'] || (itemsAtEnd && childComponents.length)"
        class="navbar-end"
      >
        <bulma-navbar-item
          v-if="itemsAtEnd && childComponents.length"
          v-for="(component, index) in childComponents[0]"
          :component="component"
          :key="index"
        />
        <slot name="navbar-end"> </slot>
      </div>
    </div>
  </component-wrapper>
</template>

<script>
import { mapGetters } from 'vuex'
import BulmaNavbarItem from './NavbarItem'
import componentMixin from '~/.nuxt/bwstarter/bulma/components/componentMixin'

export default {
  props: {
    itemsAtEnd: {
      type: Boolean,
      default: false
    }
  },
  components: {
    BulmaNavbarItem
  },
  mixins: [componentMixin],
  data() {
    return {
      isActive: false,
      windowY: 0,
      lastWindowY: 0,
      yTicking: false,
      navY: 0
    }
  },
  computed: {
    ...mapGetters({ getApiUrl: 'bwstarter/getApiUrl' })
  },
  watch: {
    // whenever question changes, this function will run
    isActive: function(isActive) {
      if (isActive) {
        this.navY = 0
      }
    },
    $route() {
      this.isActive = false
    }
  },
  methods: {
    updateWindowY() {
      this.windowY = Math.max(window.scrollY, 0)
      this.requestYTick()
    },
    requestYTick() {
      if (!this.yTicking) {
        this.yTicking = true
        requestAnimationFrame(this.updateNavY)
      }
    },
    updateNavY() {
      let diff = this.windowY - this.lastWindowY
      this.lastWindowY = this.windowY
      // iOS does not always trigger a scroll event (e.g. when bouncing)
      // so we stop ticking when we see there has been no movement
      this.yTicking = diff !== 0
      if (this.yTicking) {
        requestAnimationFrame(this.updateNavY)
      }
      this.navY = this.isActive
        ? 0
        : Math.min(
            Math.max(this.navY - diff, this.$refs.nav.$el.clientHeight * -1),
            0
          )
    }
  },
  mounted() {
    window.addEventListener('scroll', this.updateWindowY)
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.updateWindowY)
  }
}
</script>

<style lang="sass">
@import "../../../assets/css/vars"

.logo
  width: auto
  height: 28px

.navbar
  .tabs
    &:not(.is-boxed):not(.is-toggle)
      > ul
        border: 0
      li
        a
          margin-bottom: 0
          min-height: $navbar-height
          border-bottom-color: transparent
          &:hover
            color: $primary
            border-color: $primary
        &.is-active
          a
            border-bottom-width: 2px
            border-color: $primary
</style>
