export default function createPageView (Page, depth) {
  return {
    name: 'page-' + depth,
    middleware: ['routeLoader'],
    asyncData ({ $bwstarter }) {
      let pageData = $bwstarter.$storage.get('getContent', [depth])
      return {
        pageData
      }
    },
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
      title () {
        return this.pageData.title
      },
      metaDescription () {
        return this.pageData.metaDescription
      }
    },
    render (h) {
      if (this.pageData || this.componentGroup) {
        return h(Page, {
          props: {
            depth,
            pageData: this.pageData || this.componentGroup,
            nested: this.nested
          }
        })
      }
    },
    transition () {
      return {
        name: 'page',
        mode: 'out-in'
      }
    }
  }
}
