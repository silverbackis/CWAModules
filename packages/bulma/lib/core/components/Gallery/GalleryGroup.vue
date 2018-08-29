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
    />
  </component>
</template>

<script>
  import GalleryItem from './GalleryItem'
  import _sortBy from 'lodash/sortBy'

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
              model: index
            }))

            // this.$bwstarter.$storage.commit(
            //   'setEntity', [
            //     {
            //       id: location[ '@id' ],
            //       data: Object.assign(
            //         {},
            //         location,
            //         {sort: index}
            //       )
            //     }
            //   ], entitiesModuleName)
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
          return {
            src: image.publicPath,
            w: image.width,
            h: image.height
          }
        })
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

