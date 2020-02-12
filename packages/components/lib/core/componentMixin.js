export default {
  components: {
    AdminTextInput: () => import('./Admin/Text'),
    AdminQuillEditor: () => import('./Admin/Quill')
  },
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
    containerClass() {
      return !this.nested ? ['container'] : []
    },
    componentGroups() {
      return this.component.componentGroups.map(groupId => {
        return this.getEntity(groupId)
      })
    },
    childLocationsGrouped() {
      return this.componentGroups.map(({ componentLocations }) => {
        if (!componentLocations) {
          return []
        }
        return componentLocations
      })
    },
    childComponents() {
      return this.childLocationsGrouped.map(locations => {
        if (!locations) {
          return []
        }
        return locations.map(loc =>
          this.getEntity(this.getEntity(loc).component)
        )
      })
    },
    endpoint() {
      return (this.dynamicData && this.dynamicData.dynamic) ? this.dynamicData['@id'] : this.component['@id']
    },
    realComponentData() {
      const tempComponent = Object.assign({}, this.component)
      for (const [key, value] of Object.entries(this.component)) {
        if (this.dynamicData) {
          if (value === null && this.dynamicData[key]) {
            tempComponent[key] = this.dynamicData[key]
          } else if (this.isString(value)) {
            const expr = new RegExp(/{{(\s+)?(\S{1,})(\s+)?}}/g)
            let matches
            while ((matches = expr.exec(value)) !== null) {
              const injectVar =
                matches && matches.length >= 3 ? matches[2] : null
              if (injectVar && injectVar in this.dynamicData) {
                tempComponent[key] = this.dynamicData[injectVar]
              }
            }
          }
        }
      }
      return tempComponent
    },
    toRoute() {
      if (!this.component) {
        return null
      }
      return (
        this.component.url ||
        (this.component.route ? this.component.route.route : null) ||
        (this.component.routes && this.component.routes.length
          ? this.component.routes[0].route || this.component.routes[0] || null
          : null)
      )
    }
  },
  methods: {
    isString(value) {
      return typeof value === 'string' || value instanceof String
    },
    getDynamicVars(string) {
      if (!string || !this.isString(string)) {
        return string
      }
      const re = new RegExp(/{{\s+?(\S{1,})\s+?}}/g)
      const matches = []
      let match
      while ((match = re.exec(string)) !== null) {
        matches.push(match[1])
      }
      return matches.length ? matches : null
    },
    injectDynamicData(string) {
      if (!string || !this.isString(string)) {
        return string
      }
      return string.replace(
        /{{(\s+)?(\S{1,})(\s+)?}}/g,
        (str, space, dynamicVar) => {
          return this.dynamicData[dynamicVar] || str
        }
      )
    }
  }
}
