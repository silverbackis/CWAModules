<template>
  <component-wrapper v-if="component" :nested="nested">
    <div class="image-component"
         itemscope
         itemtype="https://schema.org/ImageGallery"
    >
      <figure itemprop="associatedMedia" itemscope itemtype="https://schema.org/ImageObject" v-if="getImageData()">
        <div class="is-block image-holder">
          <image-loader class="image simple-image"
                        :image="getImageData()"
                        :placeholder="getImageData('placeholder', true)"
                        :cover="false"
                        :alt="caption"
          />
        </div>
        <meta itemprop="width" :content="getImageData().width">
        <meta itemprop="height" :content="getImageData().height">
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
  import ImageDataMixin from '~/.nuxt/bwstarter/bulma/components/imageDataMixin'

  export default {
    mixins: [ ComponentMixin, ImageDataMixin ],
    components: {
      ImageLoader
    },
    computed: {
      ...mapGetters({ getApiUrl: 'bwstarter/getApiUrl' }),
      isDynamic () {
        return this.injectDynamicData(this.component.filePath) !== this.component.filePath
      },
      caption () {
        return this.injectDynamicData(this.component.caption)
      }
    }
  }
</script>

<style lang="sass">
  @import ~bulma/sass/utilities/mixins
  @import "../../assets/css/vars"

  .image-component
    figcaption
      font-style: italic
      font-size: .8rem
    .image-holder
      position: relative
      line-height: 0
      .simple-image
        min-height: 50px
        .image,
        .image-loader .image-placeholder,
        .image-small
          max-width: 100%
          min-width: 100px
          min-height: 50px
        .portrait ~ .image-small
          height: 100%
        .landscape ~ .image-small
          width: 100%
</style>
