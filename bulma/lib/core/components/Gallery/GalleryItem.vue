<template>
  <li itemscope
      itemtype="https://schema.org/ImageGallery"
  >
    <div class="gallery-thumb">
      <figure itemprop="associatedMedia" itemscope itemtype="https://schema.org/ImageObject">
        <a class="gallery-link"
           :href="getApiUrl(item.filePath)"
           itemprop="contentUrl"
           @click.prevent="$photoswipe.open(index, items, $el)"
        >
          <image-loader class="image gallery-image"
                        :src="getApiUrl(item.thumbnailPath)"
                        :smallSrc="getApiUrl(item.placeholderPath)"
                        :cover="true"
                        :alt="item.title"
          />
          <img src="/img/1x1.png" class="square-space" />
        </a>
        <meta itemprop="width" :content="item.width">
        <meta itemprop="height" :content="item.height">
        <figcaption v-if="item.caption"
                    itemprop="caption description" class="sr-only"
                    v-html="item.caption"
        />
      </figure>
    </div>
  </li>
</template>

<script>
  import { mapGetters } from 'vuex'
  import ImageLoader from '~/.nuxt/bwstarter/components/Utils/ImageLoader'

  export default {
    props: {
      item: {
        type: Object,
        required: true
      },
      items: {
        type: Array,
        required: true
      },
      index: {
        type: Number,
        required: true
      },
      $photoswipe: {
        type: Object
      }
    },
    components: {
      ImageLoader
    },
    computed: {
      ...mapGetters({ getApiUrl: 'bwstarter/getApiUrl' })
    }
  }
</script>

<style lang="sass">
  @import ~bulma/sass/utilities/mixins

  .gallery-thumb
    width: 100%
    display: inline-block
    .gallery-link
      box-shadow: 1px 2px 3px rgba($black, .1)
      position: relative
      display: inline-block
      overflow: hidden
      width: 100%
      .square-space
        display: block
        width: 100%
      .gallery-image
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
</style>
