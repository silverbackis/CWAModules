<template>
  <div class="admin-bar-wrapper">
    <div :class="barClass">
      <div class="level is-mobile">
        <div class="level-left">
          <div class="level-item">
            <label class="checkbox is-custom checkbox-autosave has-padding is-toggle">
              <input type="checkbox" v-model="autoSaveLocal" class="custom">
              <span class="custom-control-label">
                Auto-Save {{ autoSaveLocal ? 'On' : 'Off' }}
              </span>
            </label>
            <div
              class="published-checkbox-wrapper"
              v-if="('published' in rootPageData)"
              @mouseover.prevent="showPublishedTooltip = true"
              @mouseout.prevent="showPublishedTooltip = false"
            >
              <div v-if="rootPageData.published && showPublishedTooltip" class="tag is-info">* This status is based on your computer's current time, however availability is determined by the server's time which may differ.</div>
              <admin-checkbox
                :component-id="rootPageData['@id']"
                :model="rootPageData.published"
                :checked-label="publishedLabel"
                component-field="published"
                label="Draft"
                class="checkbox-autosave has-padding is-toggle is-warning"
              />
            </div>
          </div>
        </div>
        <div class="level-right">
          <div class="has-padding" v-if="!isModified">
            All changes saved
          </div>
          <div v-else class="level-item is-marginless">
            <button @click="$bwstarter.save()"
                    class="button button-save is-small is-success is-uppercase is-radiusless"
                    :disabled="isSubmitting == 1"
            />
          </div>
          <div class="level-item">
            <button @click="showEditPage = true" class="button is-small is-dark is-uppercase is-radiusless">
              <span class="icon">
                <font-awesome-icon icon="edit"/>
              </span>
                <span>
                Edit Page
            </span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div :class="['modal', { 'is-active': showEditPage }]">
      <div class="modal-background" @click="showEditPage = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Page Settings</p>
          <button class="delete" aria-label="close" @click="showEditPage = false"></button>
        </header>
        <section class="modal-card-body">
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
          <div class="field" v-if="('publishedDate' in rootPageData)">
            <label class="label">Publish Date</label>
            <div class="control">
              <admin-date
                :component-id="rootPageData['@id']"
                :model="rootPageData.publishedDate"
                component-field="publishedDate"
                placeholder="Enter the date this page was published"
                class="input"
              />
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
  data () {
    return {
      autoSaveLocal: false,
      cookieExpires: '6M',
      cookieName: 'autosave',
      saveDebounced: null,
      showEditPage: false,
      now: new Date(),
      showPublishedTooltip: false
    }
  },
  computed: {
    isModified () {
      return this.$bwstarter.$storage.get('isModified', [], ADMIN_MODULE)
    },
    isSubmitting () {
      return this.$bwstarter.$storage.get('isSubmitting', [], ADMIN_MODULE)
    },
    barClass () {
      return {
        'admin-bar': true,
        'has-text-weight-bold': true,
        'is-modified': this.isModified,
        'has-text-white': !this.isModified,
        'is-submitting': this.isSubmitting
      }
    },
    autoSaveVars () {
      return [ this.isModified, this.autoSaveLocal ]
    },
    rootPageData () {
      return this.$bwstarter.$storage.get('getContentAtDepth', [ 0, this.$route.path ], contentModuleName)
    },
    publishedLabel () {
      const publishedText = 'Published *'
      if (!this.rootPageData.publishedDate) {
        return publishedText
      }
      const publishedDate = new Date(this.rootPageData.publishedDate)
      if (this.now >= publishedDate) {
        return publishedText
      }
      return 'Available ' + publishedDate.toLocaleString('en-GB', { hour12: false }) + ' *'
    }
  },
  watch: {
    autoSaveVars: function () {
      if (this.autoSaveLocal && this.isModified) {
        this.$bwstarter.save(true)
      }
    },
    autoSaveLocal: function (newVal) {
      if (newVal) {
        this.$cookie.set(this.cookieName, true, { expires: this.cookieExpires })
      } else {
        this.$cookie.set(this.cookieName, false, { expires: this.cookieExpires })
      }
    }
  },
  mounted () {
    this.autoSaveLocal = this.autoSave
    setInterval(() => (this.now = new Date()), 5000)
    if (this.autoSaveCookie) {
      let curCookie = this.$cookie.get(this.cookieName)
      if (curCookie !== null) {
        this.$cookie.set(this.cookieName, curCookie, { expires: this.cookieExpires })
        this.autoSaveLocal = curCookie === 'true'
      }
    }
  }
}
</script>

<style lang="sass">
  @import '../../assets/css/_vars'

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
  .admin-bar-wrapper .modal
    padding-bottom: 2.5rem
    .modal-card
      margin-top: .5rem
      margin-bottom: .5rem
  .admin-bar
    position: fixed
    background: rgba($success, .95)
    height: 2.5rem
    width: 100%
    left: 0
    bottom: 0
    z-index: 50
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
            &[disabled]:before
              content: 'Saving...'
            &:not([disabled])
              animation: pulse 2s infinite ease-out
              &:before
                content: 'Save Changes'
      .level-right,
      .level-left
        height: 100%
    .checkbox-autosave
      margin-top: 0
      &:hover
        color: inherit
</style>
