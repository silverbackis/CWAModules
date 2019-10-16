<template>
  <div v-if="_components" class="bulma-components">
    <template v-for="component in _components">
      <component
        :is="componentName(component['@id'])"
        :key="component['@id']"
        :component="component"
        :nested="nested"
        :depth="depth"
        :dynamic-data="dynamicData"
      />
    </template>
  </div>
</template>

<script>
import components from '../components'

export default {
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
          filtered.push(entity)
        }
        return filtered
      }, [])
    }
  }
}
</script>
