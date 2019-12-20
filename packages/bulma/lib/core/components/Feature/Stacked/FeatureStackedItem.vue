<template>
  <div>
    <figure class="column is-narrow">
      <div class="feature-stacked-item has-text-centered">
        <image-loader
          v-if="getImageData()"
          class="image-loader"
          :image="getImageData()"
          :placeholder="getImageData('placeholder', true)"
          :alt="injectDynamicData(component.title)"
        />
      </div>
    </figure>
    <div class="column has-text-centered-mobile">
      <div class="content">
        <h3>{{ injectDynamicData(component.title) }}</h3>
        <div v-if="$bwstarter.isAdmin">
          <admin-quill-editor
            :model="realComponentData.description"
            :component-id="endpoint"
            :editor-toolbar="['bold', 'italic', 'underline']"
            component-field="description"
            placeholder="Enter feature description here"
          />
        </div>
        <div v-else v-html="realComponentData.description"></div>

        <app-link
          v-if="toRoute && component.buttonText"
          :to="toRoute"
          :class="
            injectDynamicData(component.buttonClass) || 'button is-primary'
          "
        >
          {{ injectDynamicData(component.buttonText) }}
        </app-link>
      </div>
    </div>
  </div>
</template>

<script>
import ComponentMixin from '../../componentMixin'
import ImageDataMixin from '~/.nuxt/bwstarter/bulma/components/imageDataMixin'
import ImageLoader from '~/.nuxt/bwstarter/components/Utils/ImageLoader'
import AppLink from '~/.nuxt/bwstarter/components/Utils/AppLink'

export default {
  components: {
    ImageLoader,
    AppLink
  },
  mixins: [ComponentMixin, ImageDataMixin],
  computed: {
    dynamicComponent() {
      return this.toRoute ? 'app-link' : 'div'
    },
    className() {
      return ['column', this.component.className || '']
    }
  }
}
</script>

<style lang="sass">
@import "~bulma/sass/utilities/mixins"

.feature-stacked-item
  display: block
  position: relative
  margin: auto
  +desktop
    margin: auto auto 1rem
  .image-placeholder,
  .image
    width: 100%
    min-width: 50px
    max-width: 200px !important
    height: 100%
    max-height: 150px !important
    +mobile
      width: 200px
</style>
