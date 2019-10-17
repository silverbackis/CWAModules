<template>
  <component :is="dynamicComponent" :to="toRoute" :class="className">
    <div v-if="component.filePath" class="feature-horizontal-item">
      <image-loader
        v-if="image"
        class="image"
        :image="getImageData()"
        :placeholder="getImageData('placeholder', true)"
        :alt="injectDynamicData(component.title)"
      />
    </div>
    <h4 class="title is-4">{{ injectDynamicData(component.title) }}</h4>
    <h5 class="subtitle is-size-6-touch">
      <admin-text-input
        v-if="$bwstarter.isAdmin"
        :model="realComponentData.description"
        :componentId="endpoint"
        componentField="description"
        placeholder="Enter feature description here"
        class="input"
      />
      <template v-else>{{ realComponentData.description }}</template>
    </h5>
  </component>
</template>

<script>
import ComponentMixin from '~/.nuxt/bwstarter/bulma/components/componentMixin'
import ImageDataMixin from '~/.nuxt/bwstarter/bulma/components/imageDataMixin'
import ImageLoader from '~/.nuxt/bwstarter/components/Utils/ImageLoader'
import AppLink from '~/.nuxt/bwstarter/components/Utils/AppLink'

export default {
  mixins: [ComponentMixin, ImageDataMixin],
  components: {
    ImageLoader,
    AppLink
  },
  methods: {
    injectImageData(imageObject) {
      imageObject.publicPath = this.injectDynamicData(imageObject.publicPath)
      return imageObject
    }
  },
  computed: {
    dynamicComponent() {
      return this.toRoute ? 'app-link' : 'div'
    },
    className() {
      return ['column', this.injectDynamicData(this.component.className) || '']
    },
    toRoute() {
      return (
        this.component.url ||
        (this.component.route ? this.component.route.route : null)
      )
    }
  }
}
</script>

<style lang="sass">
@import "~bulma/sass/utilities/mixins"

.feature-horizontal-item
  display: block
  position: relative
  height: 55px
  margin: auto auto 1rem
  min-width: 155px
  width: 100%
  +desktop
    height: 110px
  .image
    height: 100%
</style>
