<template>
  <div
    v-if="_components"
    :class="['bulma-components', isLoading ? 'is-loading' : null]"
  >
    <component-adder
      v-if="$bwstarter.hasRole('ROLE_SUPER_ADMIN')"
      :page="pageData"
      @add="showModal"
    />
    <template v-for="component in _components">
      <div :key="component.entity['@id']" class="bulma-component">
        <component
          :is="componentName(component.entity['@id'])"
          :component="component.entity"
          :nested="nested"
          :depth="depth"
          :dynamic-data="dynamicData"
        />
        <component-adder
          v-if="$bwstarter.hasRole('ROLE_SUPER_ADMIN')"
          :page="pageData"
          :location="component.location"
          :component="component.entity"
          @add="showModal"
          @modify="showModal"
          @moveLocation="updateLocationOrder"
        />
      </div>
    </template>
    <component-modal
      v-if="$bwstarter.hasRole('ROLE_SUPER_ADMIN')"
      v-bind="modalProps"
      @close="closeModal"
      @moveLocation="updateLocationOrder"
    />
  </div>
</template>

<script>
import components from '../components'
import { name as entitiesModuleName } from '~/.nuxt/bwstarter/core/storage/entities'

export default {
  components: {
    ComponentModal: () => import('./Admin/ComponentModal'),
    ComponentAdder: () => import('./Admin/ComponentAdder')
  },
  mixins: [components],
  props: {
    pageData: {
      type: Object,
      required: true
    },
    dynamicData: {
      type: Object,
      required: false,
      default: null
    },
    depth: {
      type: Number,
      required: true
    },
    nested: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      componentModalActive: false,
      modalComponentData: {},
      isLoading: false
    }
  },
  computed: {
    _components() {
      return this.pageData.componentLocations
        .reduce((filtered, location) => {
          const locationResource = this.getEntity(location)
          let entity
          if (
            locationResource &&
            locationResource.component &&
            (entity = this.getEntity(locationResource.component))
          ) {
            filtered.push({ entity, location: locationResource })
          }
          return filtered
        }, [])
        .sort((dataA, dataB) => dataA.location.sort - dataB.location.sort)
    },
    modalProps() {
      return Object.assign(
        {
          active: this.componentModalActive
        },
        this.modalComponentData
      )
    },
    locations() {
      return this._components.map(data => data.location)
    }
  },
  methods: {
    showModal({ page, location, component }) {
      this.componentModalActive = true
      this.modalComponentData = { page, location, component }
    },
    closeModal() {
      this.componentModalActive = false
    },
    arrayMove(arr, oldIndex, newIndex) {
      const tmp = [...arr]
      while (oldIndex < 0) {
        oldIndex += tmp.length
      }
      while (newIndex < 0) {
        newIndex += tmp.length
      }
      if (newIndex >= tmp.length) {
        let k = newIndex - tmp.length + 1
        while (k--) {
          tmp.push(undefined)
        }
      }
      tmp.splice(newIndex, 0, tmp.splice(oldIndex, 1)[0])
      return tmp
    },
    async updateLocationOrder({ oldSort, newSort }) {
      this.isLoading = true
      const locations = this.locations
      const reorderedLocations = this.arrayMove(locations, oldSort, newSort)
      const reqPromises = []
      reorderedLocations.forEach((location, sort) => {
        if (location.sort === sort) {
          return
        }
        const promise = async () => {
          try {
            const { data } = await this.$axios.patch(location['@id'], {
              sort
            })
            const newData = Object.assign({}, data, {
              component: data.component['@id'],
              content: data.content['@id']
            })
            this.$bwstarter.$storage.commit(
              'setEntity',
              [{ id: data['@id'], data: newData }],
              entitiesModuleName
            )
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Error moving component location', e)
          }
        }
        reqPromises.push(promise())
      })
      await Promise.all(reqPromises)
      this.isLoading = false
    }
  }
}
</script>

<style lang="sass">
.bulma-components.is-loading
  opacity: .5
.bulma-component
  position: relative
</style>
