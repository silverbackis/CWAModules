<template>
  <component-wrapper :nested="nested" :class="injectDynamicData(component.className)">
    <div class="container">
      <div class="columns is-tablet">
        <div class="column">
          <bulma-components :pageData="component.componentGroups[0]"
                            :depth="depth"
                            :nested="true"
                            :dynamicData="dynamicData"
          />
        </div>
        <div class="column is-narrow">
          <bulma-components :pageData="component.componentGroups[1]"
                            :depth="depth"
                            :nested="true"
                            :dynamicData="dynamicData"
          />
        </div>
      </div>
    </div>
  </component-wrapper>
</template>

<script>
  import NuxtChildMixin from '~/.nuxt/bwstarter/components/nuxtChildMixin'
  import BulmaComponents from '../Components'

  export default {
    mixins: [NuxtChildMixin],
    components: {
      BulmaComponents
    }
  }
</script>
