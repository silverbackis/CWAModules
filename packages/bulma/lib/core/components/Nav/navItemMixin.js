import componentMixin from '~/.nuxt/bwstarter/bulma/components/componentMixin'

export default {
  mixins: [componentMixin],
  data: () => ({
    activeClass: 'is-active'
  }),
  computed: {
    toRoute() {
      return (
        this.component.route.route +
        (this.component.fragment ? '#' + this.component.fragment : '')
      )
    },
    hasPermittedRole() {
      if (!this.component.roles && !this.component.excludeRoles) {
        return true
      }
      if (this.component.excludeRoles) {
        return !this.$bwstarter.$storage.get('hasRole', [
          this.component.excludeRoles
        ])
      }
      if (this.component.roles) {
        return this.$bwstarter.$storage.get('hasRole', [this.component.roles])
      }
    }
  }
}
