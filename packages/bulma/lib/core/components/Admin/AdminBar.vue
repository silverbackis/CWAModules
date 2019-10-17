<template>
  <div class="admin-bar-wrapper">
    <div :class="barClass">
      <div class="level is-mobile">
        <div class="level-left">
          <div class="level-item">
            <label
              class="checkbox is-custom checkbox-autosave has-padding is-toggle"
            >
              <input v-model="autoSaveLocal" type="checkbox" class="custom" />
              <span class="custom-control-label">
                Auto<span class="is-hidden-mobile">-Save</span>
                {{ autoSaveLocal ? 'On' : 'Off' }}
              </span>
            </label>
            <div
              v-if="publishData && 'published' in publishData"
              class="published-checkbox-wrapper"
              @mouseover.prevent="showPublishedTooltip = true"
              @mouseout.prevent="showPublishedTooltip = false"
            >
              <div
                v-if="publishData.published && showPublishedTooltip"
                class="tag is-info"
              >
                * This status is based on your computer's current time, however
                availability is determined by the server's time which may
                differ.
              </div>
              <admin-checkbox
                :component-id="publishData['@id']"
                :model="publishData.published"
                :checked-label="publishedLabel"
                component-field="published"
                label="Draft"
                class="checkbox-autosave has-padding is-toggle is-warning"
              />
            </div>
          </div>
        </div>
        <div class="level-right">
          <div v-if="!isModified" class="has-padding">
            <span class="is-hidden-touch">All changes saved</span>
            <span class="is-hidden-desktop">Saved</span>
          </div>
          <div v-else class="level-item is-marginless">
            <button
              class="button button-save is-small is-success is-uppercase is-radiusless"
              :disabled="isSubmitting == 1"
              @click="$bwstarter.save()"
            >
              <span class="icon">
                <font-awesome-icon icon="save" />
              </span>
              <span class="is-hidden-mobile">
                <span v-if="isSubmitting">Saving...</span>
                <span v-else>
                  Save Changes
                </span>
              </span>
            </button>
          </div>
          <div class="level-item">
            <button
              class="button is-small is-dark is-uppercase is-radiusless"
              @click="showEditPage = true"
            >
              <span class="icon">
                <font-awesome-icon icon="edit" />
              </span>
              <span class="is-hidden-mobile">
                Edit Page
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="rootPageData" :class="['modal', { 'is-active': showEditPage }]">
      <div class="modal-background" @click="showEditPage = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Edit Page</p>
          <button
            class="delete"
            aria-label="close"
            @click="showEditPage = false"
          ></button>
        </header>
        <section class="modal-card-body">
          <nav class="tabs">
            <ul>
              <li :class="{ 'is-active': currentTab === 'page' }">
                <a @click="currentTab = 'page'">
                  Page
                </a>
              </li>
              <li :class="{ 'is-active': currentTab === 'routing' }">
                <a @click="currentTab = 'routing'">
                  Routing
                </a>
              </li>
            </ul>
          </nav>
          <div v-show="currentTab === 'page'">
            <div class="field">
              <label class="label">Page Title</label>
              <div class="control">
                <admin-text
                  :component-id="rootPageData['@id']"
                  :model="rootPageData.title"
                  component-field="title"
                  placeholder="Enter the title for the page"
                  class="input"
                />
              </div>
            </div>
            <div class="field">
              <label class="label">Page Meta Description</label>
              <div class="control">
                <admin-text
                  :component-id="rootPageData['@id']"
                  :model="rootPageData.meta_description"
                  component-field="meta_description"
                  placeholder="Enter the meta description for the page"
                  class="input"
                />
              </div>
            </div>
            <div
              v-if="publishData && 'publishedDate' in publishData"
              class="field"
            >
              <label class="label">Publish Date</label>
              <div class="control">
                <admin-date
                  :component-id="publishData['@id']"
                  :model="publishData.publishedDate"
                  component-field="publishedDate"
                  placeholder="Enter the date this page was published"
                  class="input"
                />
              </div>
            </div>
          </div>
          <div v-show="currentTab === 'routing'">
            <div v-if="regenerateRouteError" class="message is-danger">
              <div class="message-body">
                {{ regenerateRouteError }}
              </div>
            </div>
            <div class="field">
              <div class="control">
                <a
                  :class="['button', 'is-primary']"
                  :disabled="regenerating"
                  @click="regenerateRoute"
                >
                  <span class="icon">
                    <font-awesome-icon icon="sync" />
                  </span>
                  <span
                    >Regenerate route using page title & create redirect</span
                  >
                </a>
              </div>
            </div>
            <div class="field has-text-danger">
              <label class="label">Page Route</label>
              <div class="control">
                <div class="field has-addons">
                  <div class="control is-expanded">
                    <input
                      v-model="routePath"
                      type="text"
                      :class="['input', { 'is-danger': saveRouteError }]"
                    />
                  </div>
                  <div class="control">
                    <a
                      :class="[
                        'button is-danger',
                        { 'is-loading': savingRoute }
                      ]"
                      :disabled="savingRoute"
                      @click="saveRoute"
                    >
                      Save
                    </a>
                  </div>
                </div>
                <p
                  v-if="saveRouteError"
                  class="help has-text-danger has-text-weight-bold"
                >
                  {{ saveRouteError }}
                </p>
              </div>
              <p class="help">
                Changing page routes can cause broken links from websites other
                than your own including social media and search engines. It is
                usually best to create a redirect from your old route if you
                think this is a possibility.
              </p>
            </div>

            <div v-if="routeListError" class="message is-danger">
              <div class="message-body">
                {{ routeListError }}
              </div>
            </div>

            <div
              :class="[
                'panel',
                { 'is-loading': deletingRoute || reloadingRedirects }
              ]"
            >
              <p class="panel-heading">
                Routes redirecting to this page
              </p>
              <p v-if="redirectedFrom.length === 0" class="panel-block">
                There are no redirects to this page
              </p>
              <span
                v-for="route of redirectedFrom"
                :key="route['@id']"
                class="panel-block justify-space-between"
              >
                {{ route.route }}
                <a
                  class="panel-icon has-text-danger"
                  @click="deleteRoute(route)"
                >
                  <font-awesome-icon icon="trash-alt" />
                </a>
              </span>
              <div class="panel-block">
                <div class="control">
                  <div class="field has-addons">
                    <p class="control is-expanded">
                      <input
                        v-model="newRedirectModel"
                        :class="['input', { 'is-danger': addRouteError }]"
                        type="text"
                        placeholder="Type route to redirect to this page"
                      />
                    </p>
                    <p class="control">
                      <button
                        :class="[
                          'button',
                          addRouteError ? 'is-danger' : 'is-success',
                          { 'is-loading': addingRedirect }
                        ]"
                        :disabled="addingRedirect"
                        @click="addRedirect"
                      >
                        Add
                      </button>
                    </p>
                  </div>

                  <p
                    v-if="addRouteError"
                    class="help has-text-danger has-text-weight-bold"
                  >
                    {{ addRouteError }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button class="button" @click="showEditPage = false">Hide</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
import _omit from 'lodash/omit'
import { name as ADMIN_MODULE } from '~/.nuxt/bwstarter/core/storage/admin'
import { name as contentModuleName } from '~/.nuxt/bwstarter/core/storage/content'

export default {
  components: {
    AdminCheckbox: () => import('~/.nuxt/bwstarter/components/Admin/Checkbox'),
    AdminText: () => import('~/.nuxt/bwstarter/components/Admin/Text'),
    AdminDate: () => import('~/.nuxt/bwstarter/components/Admin/Date')
  },
  props: {
    autoSave: {
      type: Boolean,
      required: false,
      default: false
    },
    autoSaveCookie: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  data() {
    return {
      autoSaveLocal: false,
      cookieExpires: '6M',
      cookieName: 'autosave',
      saveDebounced: null,
      showEditPage: false,
      now: new Date(),
      showPublishedTooltip: false,
      currentTab: 'page',
      routePath: this.$route.path,
      regenerating: false,
      savingRoute: false,
      newRedirectModel: null,
      addingRedirect: false,
      deletingRoute: false,
      reloadingRedirects: false,
      regenerateRouteError: null,
      saveRouteError: null,
      routeListError: null,
      addRouteError: null
    }
  },
  computed: {
    isModified() {
      return this.$bwstarter.$storage.get('isModified', [], ADMIN_MODULE)
    },
    isSubmitting() {
      return this.$bwstarter.$storage.get('isSubmitting', [], ADMIN_MODULE)
    },
    barClass() {
      return {
        'admin-bar': true,
        'has-text-weight-bold': true,
        'is-modified': this.isModified,
        'has-text-white': !this.isModified,
        'is-submitting': this.isSubmitting
      }
    },
    autoSaveVars() {
      return [this.isModified, this.autoSaveLocal]
    },
    rootPageData() {
      return this.$bwstarter.$storage.get(
        'getContentAtDepth',
        [0, this.$route.path],
        contentModuleName
      )
    },
    publishData() {
      return (
        this.$bwstarter.$storage.get(
          'getDynamicData',
          [this.$route.path],
          contentModuleName
        ) || this.rootPageData
      )
    },
    publishedLabel() {
      const publishedText = 'Published *'
      if (!this.rootPageData.publishedDate) {
        return publishedText
      }
      const publishedDate = new Date(this.rootPageData.publishedDate)
      if (this.now >= publishedDate) {
        return publishedText
      }
      return (
        'Available ' +
        publishedDate.toLocaleString('en-GB', { hour12: false }) +
        ' *'
      )
    },
    currentRoute() {
      const rootState = this.$bwstarter.$storage.getRootState()
      const contentState = rootState[contentModuleName]
      return contentState.routes[contentState.currentRoute]
    },
    redirectedFrom() {
      return this.getRedirectedFrom(this.currentRoute)
    }
  },
  watch: {
    autoSaveVars: function() {
      if (this.autoSaveLocal && this.isModified) {
        this.$bwstarter.save(true)
      }
    },
    autoSaveLocal: function(newVal) {
      if (newVal) {
        this.$cookie.set(this.cookieName, true, { expires: this.cookieExpires })
      } else {
        this.$cookie.set(this.cookieName, false, {
          expires: this.cookieExpires
        })
      }
    },
    '$route.path': function(newVal) {
      this.routePath = newVal
    }
  },
  mounted() {
    this.autoSaveLocal = this.autoSave
    setInterval(() => (this.now = new Date()), 5000)
    if (this.autoSaveCookie) {
      const curCookie = this.$cookie.get(this.cookieName)
      if (curCookie !== null) {
        this.$cookie.set(this.cookieName, curCookie, {
          expires: this.cookieExpires
        })
        this.autoSaveLocal = curCookie === 'true'
      }
    }
  },
  methods: {
    errorFromResponse(error) {
      if (error.response && error.response.data) {
        const data = error.response.data
        return data['hydra:description'] || data['hydra:title'] || data
      }
    },
    async regenerateRoute() {
      this.regenerateRouteError = null
      this.regenerating = true
      try {
        const { data } = await this.$axios.put(
          this.rootPageData['@id'],
          {
            regenerateRoute: true
          },
          {
            progress: false
          }
        )
        const key = Object.keys(data.routes)[0]
        const route = data.routes[key]
        await this.reloadRoute()
        this.routePath = route.route
        this.replaceRoute()
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
        this.regenerateRouteError = this.errorFromResponse(error)
      }
      this.regenerating = false
    },
    async saveRoute() {
      this.saveRouteError = null
      this.savingRoute = true
      try {
        await this.$axios.put(
          '/routes/' + encodeURI(this.$route.path),
          {
            route: this.routePath
          },
          { progress: false }
        )
        this.replaceRoute()
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
        this.saveRouteError = this.errorFromResponse(error)
      }
      this.savingRoute = false
    },
    replaceRoute() {
      window.history.replaceState(
        {},
        document.getElementsByTagName('title')[0].innerHTML,
        this.routePath
      )
    },
    async deleteRoute(route) {
      this.routeListError = null
      this.deletingRoute = true
      try {
        await this.$axios.delete(decodeURI(route['@id']), { progress: false })
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
        this.routeListError = this.errorFromResponse(error)
      }
      this.deletingRoute = false
      await this.reloadRoute()
    },
    async addRedirect() {
      this.addRouteError = null
      this.addingRedirect = true
      try {
        await this.$axios.post(
          '/routes',
          {
            route: this.newRedirectModel,
            redirectRoute: `/routes/${encodeURI(this.$route.path)}`
          },
          {
            progress: false
          }
        )
        this.newRedirectModel = null
        await this.reloadRoute()
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
        this.addRouteError = this.errorFromResponse(error)
      }
      this.addingRedirect = false
    },
    getRedirectedFrom(routeEntity) {
      const childRoutes = []
      if (!routeEntity) {
        return childRoutes
      }
      for (const route of routeEntity.redirectedFrom) {
        childRoutes.push(_omit(route, ['redirectedFrom']))
        childRoutes.push(...this.getRedirectedFrom(route))
      }
      return childRoutes
    },
    async reloadRoute() {
      this.reloadingRedirects = true
      try {
        const { data } = await this.$axios.get(
          '/routes/' + encodeURI(this.$route.path),
          {
            progress: false
          }
        )
        this.$bwstarter.initRoute(data)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
        this.routeListError = this.errorFromResponse(error)
      }
      this.reloadingRedirects = false
    }
  }
}
</script>

<style lang="sass">
@import '../../assets/css/vars'

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
.admin-bar-wrapper
  .modal
    padding-bottom: 2.5rem
    .modal-card
      margin-top: .5rem
      margin-bottom: .5rem
      .justify-space-between
        justify-content: space-between
    .panel.is-loading
      .panel-block
        opacity: .5
.admin-bar
  position: fixed
  background: rgba($success, .95)
  height: 2.5rem
  width: 100%
  left: 0
  bottom: 0
  z-index: 50
  +mobile
    .custom-control-label
      font-size: .8rem
  .published-checkbox-wrapper
    position: relative
    .tag
      position: absolute
      bottom: 100%
      margin-bottom: .2rem
      left: 0
      max-width: 70vw
      width: 350px
      white-space: normal
      height: auto
      padding: .3rem
  &.is-modified
    background: rgba($warning, .95)
  .level
    height: 100%
    .has-padding
      padding: 0 .5rem
    .level-item
      margin: 0
      height: 100%
      .button
        height: 100%
        backface-visibility: hidden
        -webkit-font-smoothing: subpixel-antialiased
        transform: translateZ(0)
        box-shadow: 0 0 0 0 rgba($success, 0)
        .icon
          margin-left: 0
        &.button-save
          z-index: 2
          &:not([disabled])
            animation: pulse 2s infinite ease-out
    .level-right,
    .level-left
      height: 100%
  .checkbox-autosave
    margin-top: 0
    &:hover
      color: inherit
</style>
