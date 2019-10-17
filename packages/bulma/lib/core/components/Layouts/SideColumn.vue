<template>
  <component-wrapper
    :nested="nested"
    :class="injectDynamicData(component.className)"
  >
    <div class="container">
      <div class="columns is-tablet">
        <div class="column">
          <bulma-components
            :page-data="componentGroups[0]"
            :depth="depth"
            :nested="true"
            :dynamic-data="dynamicData"
          />
        </div>
        <div class="column is-narrow is-right">
          <bulma-components
            :page-data="componentGroups[1]"
            :depth="depth"
            :nested="true"
            :dynamic-data="dynamicData"
          />
        </div>
      </div>
    </div>
  </component-wrapper>
</template>

<script>
import BulmaComponents from '../Components'
import NuxtChildMixin from '~/.nuxt/bwstarter/bulma/components/nuxtChildMixin'

export default {
  components: {
    BulmaComponents
  },
  mixins: [NuxtChildMixin]
}
</script>

<style lang="sass">
@import "~bulma/sass/utilities/mixins"
+tablet
  .column.is-right .bulma-components
    padding-left: 1rem
</style>
