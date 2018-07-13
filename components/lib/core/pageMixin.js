export default {
  middleware: ['routeLoader'],
  data: () => ({}),
  head () {
    if (!this.pageData) {
      return {}
    }
    return {
      title: this.title,
      meta: [
        { name: 'description', content: this.metaDescription }
      ]
    }
  },
  props: {
    componentGroup: {
      type: Object,
      required: false
    },
    nested: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    pageData () {
      return this.$bwstarter.$storage.get('getContent', [this.depth])
    },
    title () {
      return this.pageData.title
    },
    metaDescription () {
      return this.pageData.metaDescription
    },
    depth () {
      return this.$vnode.data.nuxtChildDepth
    },
    childKey () {
      return this.$route.params['page' + (this.depth+1)]
    },
    realPageData () {
      if (
        this.componentGroup &&
        this.componentGroup.componentLocations &&
        this.componentGroup.componentLocations.length
      ) {
        return this.componentGroup
      }
      return this.pageData
    }
  },
  transition () {
    return {
      name: 'page',
      mode: 'out-in'
    }
  }
}
