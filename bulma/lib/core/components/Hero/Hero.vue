<template>
  <div v-if="component">
    <component-wrapper :className="['hero', className]"
                       :extendClass="false"
                       :nested="nested"
    >
      <div class="hero-body">
        <div class="container">
          <h1 class="title">
            <cms-text-input v-if="$bwstarter.isAdmin"
                            :model="injectDynamicData(component.title)"
                            :componentId="component['@id']"
                            componentField="title"
                            placeholder="Enter page title here"
            />
            <span v-else>{{ injectDynamicData(component.title) }}</span>
          </h1>
          <h2 class="subtitle">
            <cms-text-input v-if="$bwstarter.isAdmin"
                            :model="injectDynamicData(component.subtitle)"
                            :componentId="component['@id']"
                            componentField="subtitle"
                            placeholder="Enter optional subtitle here"
            />
            <span v-else>{{ injectDynamicData(component.subtitle) }}</span>
          </h2>
        </div>
      </div>
      <div v-if="tabs"
           class="hero-foot"
      >
        <div class="container">
          <bulma-tabs _style="boxed"
                      :component="tabs"
                      :includeNuxtChild="false"
                      :nested="true"
                      :depth="depth"
          />
        </div>
      </div>
    </component-wrapper>
    <nuxt-child v-if="tabs"
                :key="childKey"
                :componentGroup="tabs.childComponentGroup"
                :nested="false"
    />
  </div>
</template>

<script>
  import NuxtChildMixin from '~/.nuxt/bwstarter/components/nuxtChildMixin'

  export default {
    mixins: [NuxtChildMixin],
    props: ['cid'],
    computed: {
      className () {
        return this.component.className || 'is-primary is-bold'
      },
      tabs () {
        let groups = this.component.componentGroups || []
        if (!groups.length || !groups[0].componentLocations.length) {
          return
        }
        return groups[0].componentLocations[0].component
      }
    },
    components: {
      BulmaTabs: () => import('~/.nuxt/bwstarter/bulma/components/Nav/Tabs/Tabs.vue'),
      cmsTextInput: () => import('~/.nuxt/bwstarter/components/Admin/Text')
    }
  }
</script>

<style lang="sass">
  @import ~assets/css/_vars

  .hero
    h1,
    h2
      .cms-text-input
        display: inline-block
        position: relative
        width: 100%
        background: transparent
        border: 1px solid $grey-light
        color: inherit
        font-size: inherit
        padding: .5rem
        &::placeholder
          color: $grey-light
    h2 .cms-text-input
      margin-top: .5rem
</style>
