<template>
  <component v-bind="containerProps"
             v-model="sortableLocations"
             class="columns is-multiline"
  >
    <gallery-item v-for="(location, index) in sortedLocations"
                  :key="location['@id']"
                  class="column is-4 is-3-desktop"
                  :items="psItems"
                  :component="getEntity(location.component)"
                  :location="location"
                  :$photoswipe="$photoswipe"
                  :index="index"
                  @moveup="moveLocationUp(location)"
                  @movedown="moveLocationDown(location)"
    />
  </component>
</template>

<script>
  import { mapGetters } from 'vuex'
  import GalleryItem from './GalleryItem'
  import _sortBy from 'lodash/sortBy'
  import _findIndex from 'lodash/findIndex'

  export default {
    props: {
      locations: {
        required: true,
        type: Array
      },
      $photoswipe: {
        required: true,
        type: Object
      }
    },
    components: {
      draggable: () => import('vuedraggable'),
      GalleryItem
    },
    computed: {
      ...mapGetters({ getApiUrl: 'bwstarter/getApiUrl' }),
      sortableLocations: {
        get() {
          if (!this.$bwstarter.isAdmin) {
            return null
          }
          return this.sortedLocations
        },
        set(locations) {
          for (const [index,location] of locations.entries()) {
            // update the entities
            this.$bwstarter.setAdminInputModel(this.adminInputData(location, {
              model: index+1
            }))
          }
        }
      },
      sortedLocations() {
        return _sortBy(this.$bwstarter.isAdmin ? this.adminLocationEntities : this.userLocationEntities, 'sort')
      },
      userLocationEntities() {
        const locationIds = this.locations.map(loc => loc['@id'])
        return this.getEntities(locationIds)
      },
      adminLocationEntities() {
        // Update the sort value of locationEntities with the value in temp storage for admin inputs / draggable
        let sortableLocations = []
        for (const location of this.userLocationEntities) {
          const sortValue = this.$bwstarter.getAdminInputModel(this.adminInputData(location))
          sortableLocations.push(Object.assign({}, location, { sort: sortValue !== null ? sortValue : location.sort }))
        }
        return sortableLocations
      },
      psItems() {
        return this.sortedLocations.map(({ component }) => {
          const entityComponent = this.getEntity(component)
          const image = entityComponent[ 'file:image' ]
          if (!image) {
            return null
          }
          return {
            src: this.getApiUrl(image.publicPath),
            w: image.width,
            h: image.height
          }
        }).filter((data) => data !== null)
      },
      containerProps() {
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
      adminInputData (location, data = {}) {
        return Object.assign(
          {
            componentId: location['@id'],
            componentField: 'sort'
          },
          data
        )
      },
      moveLocationUp(location) {
        const index = this.findLocationIndex(location)
        this.sortableLocations = this.move(this.sortableLocations, index, index-1);
      },
      moveLocationDown(location) {
        const index = this.findLocationIndex(location)
        this.sortableLocations = this.move(this.sortableLocations, index, index+1);
      },
      findLocationIndex(location) {
        return _findIndex(this.sortableLocations, (loc) => loc['@id']=== location['@id'])
      },
      move(arr, pos1, pos2) {
        arr.splice(pos2, 0, arr.splice(pos1, 1)[0])
        return arr
      }
    },
    created() {
      for (const location of this.locations) {
        this.$bwstarter.initAdminInput(this.adminInputData(location, { model: location.sort }))
      }
    },
    beforeDestory() {
      for (const location of this.locations) {
        this.$bwstarter.destroyAdminInput(this.adminInputData(location))
      }
    }
  }
</script>

