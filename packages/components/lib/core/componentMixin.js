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
    containerClass () {
      return !this.nested ? [ 'container' ] : []
    },
    componentGroups () {
      return this.component.componentGroups.map((groupId) => {
        return this.getEntity(groupId)
      })
    },
    childLocationsGrouped () {
      return this.componentGroups.map(({ componentLocations }) => {
        return componentLocations
      })
    },
    childComponents () {
      return this.childLocationsGrouped.map((locations) => {
        return locations.map(loc => this.getEntity(this.getEntity(loc).component))
      })
    },
    endpoint () {
      return (this.dynamicData && this.dynamicData.dynamic) ? this.dynamicData[ '@id' ] : this.component[ '@id' ]
    },
    realComponentData () {
      let tempComponent = Object.assign({}, this.component)
      for (let [ key, value ] of Object.entries(this.component)) {
        if (this.isString(value) && this.dynamicData) {
          const expr = new RegExp(/{{(\s+)?(\S{1,})(\s+)?}}/g)
          const matches = expr.exec(value)
          const injectVar = matches && matches.length >= 3 ? matches[ 2 ] : null
          if (injectVar && this.dynamicData[ injectVar ]) {
            tempComponent[ key ] = this.dynamicData[ injectVar ]
          }
        }
      }
      return tempComponent
    }
  },
  methods: {
    isString (value) {
      return typeof value === 'string' || value instanceof String
    },
    injectDynamicData (string) {
      if (!string || !this.isString(string)) {
        return string
      }
      return string.replace(/{{(\s+)?(\S{1,})(\s+)?}}/g, (str, space, dynamicVar) => {
        return this.dynamicData[ dynamicVar ] || str
      })
    }
  }
}
