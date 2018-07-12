import { mapGetters } from 'vuex'

export default {
  props: {
    component: {
      type: Object,
      required: true
    },
    nested: {
      type: Boolean,
      required: false,
      default: false
    },
    dynamicData: {
      type: Object,
      required: false
    }
  },
  computed: {
    ...mapGetters({
      getComponent: 'bwstarter/components/getComponent'
    }),
    containerClass () {
      return !this.nested ? ['container'] : []
    },
    childLocationsGrouped () {
      return this.component.componentGroups.map(({ componentLocations }) => {
        return componentLocations
      })
    },
    childComponents () {
      return this.childLocationsGrouped.map((locations) => {
        return locations.map(loc => loc.component)
      })
    },
    endpoint () {
      return (this.dynamicData && this.dynamicData.dynamic) ? this.dynamicData['@id'] : this.component['@id']
    }
  },
  methods: {
    injectDynamicData (string) {
      if (!string) {
        return string
      }
      return string.replace(/{{(\s+)?(\S{1,})(\s+)?}}/g, (str, space, dynamicVar) => {
        return this.dynamicData[dynamicVar] || str
      })
    }
  }
}
