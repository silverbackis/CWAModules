import { name as contentModuleName } from '~/.nuxt/bwstarter/core/storage/content'

export default {
  middleware: 'routeLoader',
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
      // this is computed while middleware
      return this.$bwstarter.$storage.get('getContentAtDepth', [ this.depth, this.loadedRoute ], contentModuleName)
    },
    pageClass () {
      return this.$route.params[ `page${this.depth}` ] || this.$route.name
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
      return this.$route.params[ 'page' + (this.depth + 1) ]
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
  },
  asyncData ({ route }) {
    return {
      loadedRoute: route.path
    }
  }
}
