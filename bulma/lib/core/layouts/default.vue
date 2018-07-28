<template>
  <div class="layout">
    <div class="site-content">
      <header>
        <bulma-navbar v-if="structure && structure.navBar"
                      :component="getEntity(structure.navBar['@id'])"
                      :class="navbarClass"
        />
      </header>
      <nuxt />
    </div>
    <footer :class="{'footer': true, 'authorized': !!token, 'admin': $bwstarter.isAdmin}">
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
    <admin-bar v-if="$bwstarter.isAdmin" />
  </div>
</template>

<script>
  import { mapMutations } from 'vuex'
  import { name as contentModuleName } from '~/.nuxt/bwstarter/core/storage/content'
  import AppLink from '~/.nuxt/bwstarter/components/Utils/AppLink'
  import Notifications from '../components/Notifications/Notifications'

  export default {
    components: {
      BulmaNavbar: () => import('../components/Nav/Navbar/Navbar.vue'),
      AdminBar: () => import('../components/Admin/AdminBar'),
      AppLink,
      Notifications
    },
    computed: {
      structure () {
        return this.$bwstarter.$storage.get('fetchLayout', [], contentModuleName).structure
      },
      getApiUrl () {
        return this.$bwstarter.$storage.get('getApiUrl')
      },
      navbarClass () {
        return this.token ? 'is-dark' : ''
      },
      token () {
        return this.$bwstarter.$storage.getState('token')
      }
    },
    methods: {
      ...mapMutations({
        setAuthToken: 'setAuthToken',
        addNotification: 'bwstarter/notifications/addNotification'
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
      &.admin
        margin-bottom: 2.5rem
</style>
