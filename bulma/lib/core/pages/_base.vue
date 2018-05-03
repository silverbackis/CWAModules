<template>
  <div>
    <bulma-components v-if="pageData && pageData.componentLocations.length"
                      :pageData="pageData"
                      :depth="depth"
                      :nested="nested"
    />
    <nuxt-child v-else-if="childKey" :key="childKey" />
    <h1 v-else>No components or children configured for this page</h1>
  </div>
</template>

<script>
  import BulmaComponents from '../components/Components'
  import pageMixin from '../../components/pageMixin'

  export default {
    mixins: [pageMixin],
    components: {
      BulmaComponents
    }
  }
</script>
