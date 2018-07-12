<template>
  <component-wrapper :nested="nested" :class="injectDynamicData(component.className)">
    <div v-for="(locations, index) in this.childLocationsGrouped"
         :key="index"
         :class="containerClass">
      <component v-bind="containerProps"
                 :list="itemList"
                 class="columns is-multiline"
      >
        <gallery-item v-for="(location, index) in locations"
                      :key="index"
                      class="column is-4 is-3-desktop"
                      :items="convertLocationsToItems(locations)"
                      :component="location.component"
                      :location="location"
                      :index="index"
                      :$photoswipe="$photoswipe"
        />
      </component>
    </div>
  </component-wrapper>
</template>

<script>
  import Vue from 'vue'
  import ComponentMixin from '~/.nuxt/bwstarter/bulma/components/componentMixin'
  import PhotoSwipeComponent from './PhotoSwipe'
  import GalleryItem from './GalleryItem'
  import draggable from 'vuedraggable'
  export default {
    mixins: [ComponentMixin],
    components: {
      draggable,
      GalleryItem
    },
    data () {
      return {
        $photoswipe: null,
        // dragGhost: null
      }
    },
    computed: {
      itemList: {
        get() {
          return this.$bwstarter.isAdmin ? this.locations : null
        },
        set(locations) {
          if (this.$bwstarter.isAdmin) {}
          console.log('set locations to...', locations)
          //this.$store.commit('updateList', value)
        }
      },
      containerProps () {
        if (this.$bwstarter && this.$bwstarter.isAdmin) {
          return {
            is: 'draggable',
            element: 'ul',
            options: {
              handle: '.move-button',
              ignore: 'a,img,button',
              // setData (dataTransfer, dragEl) {
              //   let rect = dragEl.getBoundingClientRect();
              //   console.log(rect)
              //
              //   // Create the clone (with content)
              //   this.dragGhost = dragEl.cloneNode(true);
              //   this.dragGhost.style.width = rect.width +'px'
              //   this.dragGhost.style.height = rect.height +'px'
              //   // Stylize it
              //   this.dragGhost.classList.add('custom-drag-ghost');
              //   // Place it into the DOM tree
              //   document.body.appendChild(this.dragGhost);
              //   // Set the new stylized "drag image" of the dragged element
              //   dataTransfer.setDragImage(this.dragGhost, 20, 20);
              // },
              // // Don't forget to remove the ghost DOM object when done dragging
              // onEnd () {
              //   this.dragGhost.parentNode.removeChild(this.dragGhost);
              // }
            }
          }
        }
        return {
          is: 'ul'
        }
      }
    },
    methods: {
      convertLocationsToItems (locations) {
        return locations.map(({ component }) => {
          const image = component['file:image']
          return {
            src: image.publicPath,
            w: image.width,
            h: image.height
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
