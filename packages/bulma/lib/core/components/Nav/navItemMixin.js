import componentMixin from '~/.nuxt/bwstarter/bulma/components/componentMixin'

export default {
  mixins: [ componentMixin ],
  data: () => ({
    activeClass: 'is-active'
  }),
  computed: {
    toRoute () {
      return this.component.route.route + (this.component.fragment ? ('#' + this.component.fragment) : '')
    }
  }
}
