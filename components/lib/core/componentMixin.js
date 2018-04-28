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
    childComponents () {
      return this.component.componentGroups.map(({ componentLocations }) => {
        return componentLocations.map(loc => loc.component)
      })
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
