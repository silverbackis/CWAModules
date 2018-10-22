import { name as contentModuleName } from '~/.nuxt/bwstarter/core/storage/content'

export default {
  computed: {
    structure () {
      return this.$bwstarter.$storage.get('getLayout', [], contentModuleName).structure
    },
    getApiUrl () {
      return this.$bwstarter.$storage.get('getApiUrl')
    },
    token () {
      return this.$bwstarter.$storage.getState('token')
    }
  },
  head () {
    return {
      title: 'Loading...',
      meta: [
        { hid: 'theme', name: 'theme-color', content: '#4770fb' }
      ],
      htmlAttrs: { lang: 'en' }
    }
  }
}
