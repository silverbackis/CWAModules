<template>
  <div v-if="component">
    <component-wrapper :className="className"
                       :extendClass="false"
                       :nested="nested"
    >
      <div class="hero-body">
        <div class="container">
          <div class="columns is-vcentered">
            <div class="column">
              <h1 class="title">
                <admin-text-input v-if="$bwstarter.isAdmin"
                                  :model="realComponentData.title"
                                  :componentId="endpoint"
                                  componentField="title"
                                  placeholder="Enter page title here"
                />
                <span v-else>{{ realComponentData.title }}</span>
              </h1>
              <h2 v-if="realComponentData.subtitle || $bwstarter.isAdmin" class="subtitle">
                <admin-text-input v-if="$bwstarter.isAdmin"
                                  :model="realComponentData.subtitle"
                                  :componentId="endpoint"
                                  componentField="subtitle"
                                  placeholder="Enter optional subtitle here"
                />
                <span v-else>{{ realComponentData.subtitle }}</span>
              </h2>
              <slot name="title-end" />
            </div>
            <div v-if="hasImage"
                 class="column is-narrow"
            >
              <image-loader class="image hero-image"
                            :image="imageData['file:imagine'].thumbnail.publicPath"
                            :placeholder="imageData['file:imagine'].placeholder.publicPath"
                            :alt="component.title"
              />
            </div>
          </div>
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
  import { mapGetters } from 'vuex'
  import NuxtChildMixin from '~/.nuxt/bwstarter/bulma/components/nuxtChildMixin'

  export default {
    mixins: [
      NuxtChildMixin
    ],
    props: [ 'cid' ],
    computed: {
      ...mapGetters({ getApiUrl: 'bwstarter/getApiUrl' }),
      hasImage () {
        return (this.component && this.component.publicPath)
      },
      className () {
        let className = [ 'hero' ]
        if (this.component.className) {
          className.push(this.component.className)
        } else {
          className.push(...[ 'is-primary', 'is-bold' ])
        }
        if (this.hasImage) {
          className.push('has-image')
        }
        return className
      },
      tabs () {
        const groups = this.componentGroups || []
        if (!groups.length || !groups[ 0 ].componentLocations.length) {
          return
        }
        return this.getEntity(this.getEntity(groups[ 0 ].componentLocations[ 0 ]).component)
      },
      imageData () {
        if (!this.component) {
          return {}
        }
        let imagePath = this.injectDynamicData(this.component.publicPath)
        if (imagePath !== this.component.publicPath) {
          //injected from the dynamic page
          return this.dynamicData
        }
        return this.component
      }
    },
    components: {
      BulmaTabs: () => import('~/.nuxt/bwstarter/bulma/components/Nav/Tabs/Tabs.vue'),
      AdminTextInput: () => import('~/.nuxt/bwstarter/components/Admin/Text'),
      ImageLoader: () => import('~/.nuxt/bwstarter/components/Utils/ImageLoader')
    }
  }
</script>

<style lang="sass">
  @import ../../assets/css/_vars

  .hero
    +tablet
      &.has-image
        .column.is-narrow
          max-width: 30%
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
