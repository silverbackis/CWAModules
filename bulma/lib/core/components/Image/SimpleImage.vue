<template>
  <component-wrapper v-if="component" :nested="nested">
    <div class="image-component"
         itemscope
         itemtype="https://schema.org/ImageGallery"
    >
      <figure itemprop="associatedMedia" itemscope itemtype="https://schema.org/ImageObject">
        <div class="is-block image-holder">
          <image-loader class="image simple-image"
                        :src="getApiUrl(imageData.filePath)"
                        :smallSrc="getApiUrl(imageData.placeholderPath)"
                        :cover="false"
                        :alt="caption"
          />
        </div>
        <meta itemprop="width" :content="imageData.width">
        <meta itemprop="height" :content="imageData.height">
        <figcaption v-if="caption"
                    itemprop="caption description"
                    v-html="caption"
        />
      </figure>
    </div>
  </component-wrapper>
</template>

<script>
  import { mapGetters } from 'vuex'
  import ImageLoader from '~/.nuxt/bwstarter/components/Utils/ImageLoader'
  import ComponentMixin from '~/.nuxt/bwstarter/bulma/components/componentMixin'

  export default {
    mixins: [ ComponentMixin ],
    components: {
      ImageLoader
    },
    computed: {
      ...mapGetters({ getApiUrl: 'bwstarter/getApiUrl' }),
      isDynamic () {
        return this.injectDynamicData(this.component.filePath) !== this.component.filePath
      },
      imageData () {
        return this.isDynamic ? this.dynamicData : this.component
      },
      caption () {
        return this.injectDynamicData(this.component.caption)
      }
    }
  }
</script>

<style lang="sass">
  @import ~bulma/sass/utilities/mixins
  @import "~assets/css/vars"


  .image-component
    figcaption
      font-style: italic
      font-size: .8rem
    .image-holder
      position: relative
      .simple-image
        min-height: 50px
        .image,
        .image-loader .image-placeholder,
        .image-small
          max-width: 100%
          min-width: 100px
          min-height: 50px
</style>
