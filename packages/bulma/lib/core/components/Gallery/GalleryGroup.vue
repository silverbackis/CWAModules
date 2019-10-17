<template>
  <div :class="{ 'gallery-group': true, 'is-loading': reloading }">
    <component
      v-bind="containerProps"
      v-model="sortableLocations"
      class="columns is-multiline"
    >
      <gallery-item
        v-for="(location, index) in sortedLocations"
        :key="location['@id']"
        class="column is-4 is-3-desktop"
        :items="psItems"
        :component="getEntity(location.component)"
        :location="location"
        :$photoswipe="$photoswipe"
        :index="index"
        @moveup="moveLocationUp(location)"
        @movedown="moveLocationDown(location)"
        @deleted="reloadCollection"
      />
    </component>
    <div v-if="$bwstarter.isAdmin">
      <button class="button is-primary is-fullwidth" @click="addGalleryItem">
        <span class="icon is-small">
          <font-awesome-icon :icon="['fas', 'plus']" />
        </span>
        <span>Add New</span>
      </button>
      <div class="reload-link-row has-text-centered">
        <a
          @click.prevent="reloadCollection"
          class="reload-link has-text-grey-light"
          >reload gallery</a
        >
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import GalleryItem from './GalleryItem'
import _sortBy from 'lodash/sortBy'
import _findIndex from 'lodash/findIndex'

export default {
  data() {
    return {
      reloading: false
    }
  },
  props: {
    componentGroup: {
      required: true,
      type: Object
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
    componentGroupId() {
      return this.componentGroup['@id']
    },
    locations() {
      return this.getEntities(this.componentGroup.componentLocations)
    },
    sortableLocations: {
      get() {
        if (!this.$bwstarter.isAdmin) {
          return null
        }
        return this.sortedLocations
      },
      set(locations) {
        for (const [index, location] of locations.entries()) {
          // update the entities
          this.$bwstarter.setAdminInputModel(
            this.adminInputData(location, {
              model: index + 1
            })
          )
        }
      }
    },
    sortedLocations() {
      return _sortBy(
        this.$bwstarter.isAdmin ? this.adminLocationEntities : this.locations,
        'sort'
      )
    },
    adminLocationEntities() {
      // Update the sort value of locationEntities with the value in temp storage for admin inputs / draggable
      let sortableLocations = []
      for (const location of this.locations) {
        const sortValue = this.$bwstarter.getAdminInputModel(
          this.adminInputData(location)
        )
        sortableLocations.push(
          Object.assign({}, location, {
            sort: sortValue !== null ? sortValue : location.sort
          })
        )
      }
      return sortableLocations
    },
    psItems() {
      return this.sortedLocations
        .map(({ component }) => {
          const entityComponent = this.getEntity(component)
          const image = entityComponent.fileData.imageData
          if (!image) {
            return null
          }
          return {
            src: this.getApiUrl(image.publicPath),
            w: image.width,
            h: image.height
          }
        })
        .filter(data => data !== null)
    },
    containerProps() {
      if (this.$bwstarter && this.$bwstarter.isAdmin) {
        return {
          is: 'draggable',
          element: 'ul',
          options: {
            handle: '.move-button',
            ignore: 'a,img,button'
          }
        }
      }
      return {
        is: 'ul'
      }
    }
  },
  methods: {
    adminInputData(location, data = {}) {
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
      this.sortableLocations = this.move(
        this.sortableLocations,
        index,
        index - 1
      )
    },
    moveLocationDown(location) {
      const index = this.findLocationIndex(location)
      this.sortableLocations = this.move(
        this.sortableLocations,
        index,
        index + 1
      )
    },
    findLocationIndex(location) {
      return _findIndex(
        this.sortableLocations,
        loc => loc['@id'] === location['@id']
      )
    },
    move(arr, pos1, pos2) {
      arr.splice(pos2, 0, arr.splice(pos1, 1)[0])
      return arr
    },
    reloadCollection() {
      if (!this.reloading) {
        this.reloading = true
        this.$bwstarter
          .fetchContent(this.componentGroup['@id'])
          .then(componentLocations => {
            this.initAdminInputLocations(componentLocations, true)
            this.reloading = false
          })
          .catch(error => {
            this.reloading = false
            console.error('updateContentComponents Error', error)
          })
      }
    },
    initAdminInputLocations(locations, force = false) {
      for (const location of locations) {
        this.$bwstarter.initAdminInput(
          this.adminInputData(location, { model: location.sort }),
          force
        )
      }
    },
    addGalleryItem() {
      if (!this.reloading) {
        this.reloading = true
        this.$axios
          .post(
            '/gallery_items',
            {
              title: 'New Image',
              parentComponentGroup: this.componentGroup['@id']
            },
            { progress: false }
          )
          .then(() => {
            this.reloading = false
            this.reloadCollection()
          })
          .catch(error => {
            this.reloading = false
            console.error(error)
          })
      }
    }
  },
  created() {
    this.initAdminInputLocations(this.locations)
  },
  beforeDestory() {
    for (const location of this.locations) {
      this.$bwstarter.destroyAdminInput(this.adminInputData(location))
    }
  }
}
</script>

<style lang="sass">
.gallery-group
  &.is-loading
    opacity: .5
  .reload-link-row
    padding-top: 1.5rem
</style>
