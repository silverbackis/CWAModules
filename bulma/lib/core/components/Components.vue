<template>
  <div class="bulma-components" v-if="_components">
    <component v-for="component in _components"
               :is="name(component)"
               :key="component.id"
               :component="getComponent(component['@id'])"
               :nested="nested"
               :depth="depth"
               :dynamicData="dynamicDataObj"
    />
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import _ from 'lodash'
  import ComponentsMixin from '../components'

  export default {
    mixins: [ComponentsMixin],
    props: {
      pageData: {
        type: Object,
        required: true
      },
      dynamicData: {
        type: Object,
        required: false
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
    methods: {
      name (component) {
        return component.componentName || component['@type']
      }
    },
    computed: {
      ...mapGetters({
        getComponent: 'bwstarter/components/getComponent'
      }),
      _components () {
        return this.pageData.componentLocations.map(loc => loc.component)
      },
      dynamicDataObj () {
        return this.dynamicData || _.omit(this.pageData, ['@type', 'componentLocations', 'parent', 'layout'])
      }
    }
  }
</script>
