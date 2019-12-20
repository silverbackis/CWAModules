<template>
  <component-wrapper :nested="nested" :class="realComponentData.className">
    <div
      v-for="(group, index) in componentGroups"
      :key="index"
      :class="containerClass"
    >
      <gallery-group
        :component-group="group"
        :photoswipe="photoswipe"
      ></gallery-group>
    </div>
  </component-wrapper>
</template>

<script>
import Vue from 'vue'
import PhotoSwipeComponent from './PhotoSwipe'
import GalleryGroup from './GalleryGroup'
import ComponentMixin from '~/.nuxt/bwstarter/bulma/components/componentMixin'

export default {
  components: {
    GalleryGroup
  },
  mixins: [ComponentMixin],
  data() {
    return {
      photoswipe: null
    }
  },
  created() {
    this.initPhotoswipe()
  },
  beforeDestroy() {
    if (this.photoswipe) {
      document.body.removeChild(this.photoswipe.$el)
      this.photoswipe = null
    }
  },
  methods: {
    initPhotoswipe() {
      if (process.browser) {
        const PhotoSwipe = Vue.extend(PhotoSwipeComponent, 0)
        this.photoswipe = new PhotoSwipe({ el: document.createElement('div') })
        document.body.appendChild(this.photoswipe.$el)
      } else {
        // Create dummy functions for SSR to avoid errors
        const f = () => {
          // eslint-disable-next-line no-console
          console.log('photoswipe not initialised yet (SSR)')
        }
        this.photoswipe = { open: f, close: f }
      }
    }
  }
}
</script>
