<template>
  <div class="bw-starter-default layout">
    <div class="site-content">
      <header>
        <bulma-navbar v-if="structure && structure.navBar"
                      :component="getEntity(structure.navBar['@id'])"
                      :class="navbarClass"
        >
          <slot name="navbar-end">
            <div class="navbar-item">
              <div class="field is-grouped">
                <p class="control">
                  <a class="button is-primary" :href="getApiUrl('')" rel="noopener" target="_blank">
                  <span class="icon">
                    <font-awesome-icon icon="book"/>
                  </span>
                    <span>
                    API Docs
                  </span>
                  </a>
                </p>
                <p class="control">
                  <a class="button is-outlined" href="https://github.com/silverbackis/ComponentsWebApp" rel="noopener" target="_blank">
                  <span class="icon">
                    <font-awesome-icon :icon="['fab', 'github']" size="lg"/>
                  </span>
                    <span>GitHub</span>
                  </a>
                </p>
              </div>
            </div>
          </slot>
        </bulma-navbar>
      </header>
      <nuxt/>
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
    <notifications/>
    <admin-bar v-if="$bwstarter.isAdmin"/>
  </div>
</template>

<script>
  import LayoutMixin from '~/.nuxt/bwstarter/components/layoutMixin'
  import AppLink from '~/.nuxt/bwstarter/components/Utils/AppLink'
  import Notifications from '../components/Notifications/Notifications'

  export default {
    mixins: [ LayoutMixin ],
    components: {
      BulmaNavbar: () => import('../components/Nav/Navbar/Navbar.vue'),
      AdminBar: () => import('../components/Admin/AdminBar'),
      AppLink,
      Notifications
    },
    computed: {
      navbarClass () {
        return this.token ? 'is-dark' : ''
      }
    }
  }
</script>

<style lang="sass">
  @import "../assets/css/_vars.sass"

  .layout.bw-starter-default
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
