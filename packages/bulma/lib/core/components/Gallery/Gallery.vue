<template>
  <component-wrapper :nested="nested" :class="realComponentData.className">
    <div v-for="(locations, index) in childLocationsGrouped"
         :key="index"
         :class="containerClass">
      <gallery-group :locations="locations" :$photoswipe="$photoswipe"></gallery-group>
    </div>
  </component-wrapper>
</template>

<script>
  import Vue from 'vue'
  import ComponentMixin from '~/.nuxt/bwstarter/bulma/components/componentMixin'
  import PhotoSwipeComponent from './PhotoSwipe'
  import GalleryGroup from './GalleryGroup'

  export default {
    mixins: [ComponentMixin],
    components: {
      GalleryGroup
    },
    data () {
      return {
        $photoswipe: null
      }
    },
    methods: {
      initPhotoswipe() {
        if (process.browser) {
          const PhotoSwipe = Vue.extend(PhotoSwipeComponent)
          this.$photoswipe = new PhotoSwipe({el: document.createElement('div')})
          document.body.appendChild(this.$photoswipe.$el)
        } else {
          // Create dummy functions for SSR to avoid errors
          const f = () => {
            console.log('$photoswipe not initialised yet (SSR)')
          }
          this.$photoswipe = { open: f, close: f }
        }
      }
    },
    created () {
      this.initPhotoswipe()
    },
    beforeDestroy () {
      if (this.$photoswipe) {
        document.body.removeChild(this.$photoswipe.$el)
        this.$photoswipe = null
      }
    }
  }
</script>
