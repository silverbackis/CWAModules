<template>
  <div class="layout">
    <div class="site-content">
      <header v-if="layout">
        <bulma-navbar v-if="layout.navBar"
                      :component="layout.navBar"
                      :class="navbarClass"
        />
      </header>
      <nuxt />
    </div>
    <footer :class="{'footer': true, 'authorized': !!token}">
      <div class="container has-text-centered has-text-weight-bold">
        <div v-if="!token">
          Try out the admin?&nbsp;&nbsp;<app-link class="button is-small is-dark is-outlined" to="/login">Login</app-link>
        </div>
        <div v-else>
          You are logged in&nbsp;&nbsp;<a class="button is-small is-light is-outlined" href="#" @click.prevent="$bwstarter.logout">Logout</a>
        </div>
      </div>
    </footer>
    <notifications />
  </div>
</template>

<script>
  import { mapGetters, mapMutations, mapState } from 'vuex'
  import BulmaNavbar from '../components/Nav/Navbar/Navbar.vue'
  import AppLink from '~/.nuxt/bwstarter/components/Utils/AppLink'
  import Notifications from '../components/Notifications/Notifications'

  export default {
    components: {
      BulmaNavbar,
      AppLink,
      Notifications
    },
    computed: {
      ...mapGetters({
        layout: 'bwstarter/layouts/getLayout',
        getApiUrl: 'bwstarter/getApiUrl'
      }),
      ...mapState({ token: state => state.bwstarter.token }),
      navbarClass () {
        return this.token ? 'is-dark' : ''
      }
    },
    methods: {
      ...mapMutations({
        setAuthToken: 'setAuthToken',
        addNotification: 'notifications/addNotification'
      })
    },
    head () {
      return {
        title: 'Loading...',
        meta: [
          { hid: 'theme', name: 'theme-color', content: '#4770fb' }
        ],
        htmlAttrs: { lang: 'en' }
      }
    }
  }
</script>

<style lang="sass">
  @import assets/css/_vars.sass

  a
    transition: color .25s, border .25s, background-color .25s

  .appear-active
    transition: opacity .4s ease
  .page-enter-active, .page-leave-active
    transition: all .2s ease
  .appear, .page-enter, .page-leave-active
    opacity: 0

  =selection
    color: $white
    background: $primary

  ::selection
    +selection

  ::-moz-selection
    +selection

  body,
  html
    height: 100%

  .layout
    padding-top: 3.75rem
    display: flex
    min-height: 100vh
    flex-direction: column
    .site-content
      flex: 1 0 auto
    .footer
      margin-top: 3rem
      padding-bottom: 3rem
      &.authorized
        background-color: $grey-dark
        color: $white
</style>
