<template>
  <div :class="['page', pageClass]">
    <bulma-components v-if="realPageData && realPageData.componentLocations.length"
                      :pageData="realPageData"
                      :depth="depth"
                      :nested="nested"
    />
    <nuxt-child v-else-if="childKey" :key="childKey"/>
    <h1 v-else>No components or children configured for this page</h1>
  </div>
</template>

<script>
  import BulmaComponents from '../components/Components'
  import pageMixin from '../../components/pageMixin'

  export default {
    mixins: [ pageMixin ],
    computed: {
      pageClass () {
        // const names = [...Array(this.depth+1)].map((_, i) => {
        //   console.log('mapping', _, i)
        //   return this.$route.params['page' + i] || this.$route.name
        // })
        // console.log('names', names)
        // return names.join(' ')
        return this.$route.params[ `page${this.depth}` ] || this.$route.name
      }
    },
    components: {
      BulmaComponents
    }
  }
</script>
