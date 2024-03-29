<template>
  <div :class="cardClass">
    <div class="card is-inline-block">
      <component
        :is="linkComponent"
        v-if="showImage && getImageData()"
        class="card-image"
        :to="toRoute"
      >
        <image-loader
          class="article-image"
          :image="getImageData()"
          :placeholder="getImageData('placeholderSquare', true)"
          :alt="component.title"
          :cover="true"
        />
        <img :src="transparentImage" class="square-space" />
      </component>
      <div class="card-content">
        <h4 class="title is-spaced">
          {{ component.title }}
        </h4>
        <h5 v-if="component.subtitle" class="subtitle">
          {{ component.subtitle }}
        </h5>

        <div class="columns is-gapless is-mobile card-bottom-columns">
          <div class="column">
            <app-link
              v-if="toRoute"
              :to="toRoute"
              class="button is-primary is-rounded is-outlined"
              >Read More</app-link
            >
          </div>
          <div v-if="$bwstarter.isAdmin" class="column is-narrow">
            <div class="tags has-addons">
              <span class="tag is-rounded">
                status
              </span>
              <span
                :class="[
                  'tag',
                  'is-rounded',
                  component.published ? 'is-success' : 'is-warning'
                ]"
                >{{ component.published ? publishedLabel : 'draft' }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <button
        v-if="!disabledAdmin && $bwstarter.isAdmin"
        class="button delete-button is-danger is-small"
        @click="deleteItem"
      >
        <span class="sr-only">Delete</span>
        <font-awesome-icon icon="trash-alt" />
      </button>
    </div>
  </div>
</template>

<script>
import ComponentMixin from '~/.nuxt/bwstarter/bulma/components/componentMixin'
import ImageDataMixin from '~/.nuxt/bwstarter/bulma/components/imageDataMixin'
import ImageLoader from '~/.nuxt/bwstarter/components/Utils/ImageLoader'
import AppLink from '~/.nuxt/bwstarter/components/Utils/AppLink'

export default {
  components: {
    ImageLoader,
    AppLink
  },
  mixins: [ComponentMixin, ImageDataMixin],
  props: {
    type: {
      type: String,
      required: false,
      default: null
    },
    showImage: {
      type: Boolean,
      default: true
    },
    disabledAdmin: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      transparentImage:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
    }
  },
  computed: {
    linkComponent() {
      return this.toRoute ? 'app-link' : 'div'
    },
    toRoute() {
      // the object is changing to a string during route changing - have not traced why yet.
      if (this.component.routes.length)
        return this.component.routes[0].route || this.component.routes[0]
      return null
    },
    cardClass() {
      return {
        'article-card column': true,
        'is-10-touch is-4-desktop': this.type !== 'column',
        'is-12': this.type === 'column'
      }
    },
    publishedLabel() {
      const publishedText = 'published'
      if (!this.component.publishedDate) {
        return publishedText
      }
      const publishedDate = new Date(this.component.publishedDate)
      if (this.now >= publishedDate) {
        return publishedText
      }
      return 'coming soon'
    }
  },
  methods: {
    deleteItem() {
      const doDelete = () => {
        return this.$axios
          .delete(this.component['@id'], { progress: false })
          .then(() => {
            this.$emit('deleted')
          })
          .catch(error => {
            // eslint-disable-next-line no-console
            console.error('error deleting gallery item', error)
          })
      }
      this.$dialog
        .confirm({
          title: 'Are you sure?',
          body: 'This will permanently delete this article.'
        })
        .then(async dialog => {
          await doDelete()
          dialog.close()
        })
        .catch(() => {
          // cancelled delete
        })
    }
  }
}
</script>

<style lang="sass">
@import "~bulma/sass/utilities/mixins"
.article-card
  .delete-button
    position: absolute
    top: 5px
    right: 5px
  .card-bottom-columns
    align-items: flex-end
  .card
    width: 100%
    .card-image
      position: relative
      display: inline-block
      overflow: hidden
      width: 100%
      .square-space
        display: block
        width: 100%
      .article-image
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
    .card-content
      .button
        min-width: 100px
      .title:not(:last-child)
        margin-bottom: 1rem
      .subtitle
        white-space: nowrap
        overflow: hidden
        text-overflow: ellipsis
  &.is-12
    text-align: center
    .card
      text-align: left
      +tablet
        max-width: 350px
</style>
