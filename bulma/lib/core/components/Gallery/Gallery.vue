<template>
  <component-wrapper :nested="nested" :class="injectDynamicData(component.className)">
    <div v-for="(components, index) in this.childComponents"
         :key="index"
         :class="containerClass">
      <ul class="columns is-multiline">
        <gallery-item v-for="(item, index) in components"
                      :key="index"
                      class="column is-4 is-3-desktop"
                      :items="convertComponentsToItems(components)"
                      :item="item"
                      :index="index"
                      :$photoswipe="$photoswipe"
        />
      </ul>
    </div>
  </component-wrapper>
</template>

<script>
  import Vue from 'vue'
  import ComponentMixin from '~/.nuxt/bwstarter/bulma/components/componentMixin'
  import PhotoSwipeComponent from './PhotoSwipe'
  import GalleryItem from './GalleryItem'

  export default {
    mixins: [ComponentMixin],
    components: {
      GalleryItem
    },
    data () {
      return {
        $photoswipe: null
      }
    },
    methods: {
      convertComponentsToItems (components) {
        return components.map((component) => {
          return {
            src: component.filePath,
            w: component.width,
            h: component.height
          }
        })
      }
    },
    created () {
      if (process.browser) {
        const PhotoSwipe = Vue.extend(PhotoSwipeComponent)
        this.$photoswipe = new PhotoSwipe({el: document.createElement('div')})
        document.body.appendChild(this.$photoswipe.$el)
      } else {
        // Create dummy functions for SSR to avoid errors
        const f = () => {
          console.log('Not initialised')
        }
        this.$photoswipe = { open: f, close: f }
      }
    },
    beforeDestroy () {
      if (this.$photoswipe) {
        document.body.removeChild(this.$photoswipe.$el)
        this.$photoswipe = null
      }
    }
  }
</script>
