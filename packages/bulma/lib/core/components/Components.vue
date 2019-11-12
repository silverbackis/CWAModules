<template>
  <div v-if="_components" class="bulma-components">
    <component-adder :page="pageData" @add="showModal" />
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
          v-if="$bwstarter.isAdmin"
          :page="pageData"
          :location="component.location"
          :component="component.entity"
          @add="showModal"
          @modify="showModal"
        />
      </div>
    </template>
    <component-modal
      v-if="$bwstarter.isAdmin"
      v-bind="modalProps"
      @close="closeModal"
    />
  </div>
</template>

<script>
import components from '../components'

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
      modalComponentData: {}
    }
  },
  computed: {
    _components() {
      return this.pageData.componentLocations.reduce((filtered, location) => {
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
    },
    modalProps() {
      return Object.assign(
        {
          active: this.componentModalActive
        },
        this.modalComponentData
      )
    }
  },
  methods: {
    showModal({ page, location, component }) {
      this.componentModalActive = true
      this.modalComponentData = { page, location, component }
    },
    closeModal() {
      this.componentModalActive = false
    }
  }
}
</script>

<style lang="sass">
.bulma-component
  position: relative
</style>
