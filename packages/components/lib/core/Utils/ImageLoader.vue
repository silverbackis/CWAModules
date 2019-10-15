<!--
This component was inspired by: Louis Zawadzki
Github: https://github.com/louiszawadzki/vue-lazy-img-loading
Medium blog post: https://www.theodo.fr/blog/2017/02/medium-like-image-loading-with-vue-js-part-2/

Author modified significantly: Daniel <daniel@silverback.is>
-->
<template>
  <div :class="loaderClass">
    <img v-if="placeholderDataUrl" class="image-placeholder" :src="placeholderDataUrl" />

    <transition-group
      name="fade"
      tag="div"
      :class="{inner: true, 'no-placeholder': !placeholderDataUrl}"
    >
      <div v-show="loadedRes === null"
           :key="'placeholder'"
           class="background"
      />
      <transition-group name="fade"
                        tag="div"
                        class="image-holder"
                        :key="'image-holder'"
                        v-show="true"
      >
        <img v-show="loadedRes === 'high'"
             :key="'image'"
             :src="imagePath"
             :alt="alt"
             class="image"/>
      </transition-group>
      <canvas v-show="loadedRes === 'low'"
              :key="'canvas'"
              ref="canvas"
              class="image-small" />
      <div v-show="loadedRes !== 'high'"
           :key="'loader'"
           class="loader-outer"
      >
        <div class="loader"></div>
      </div>
    </transition-group>
    <slot></slot>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import canvasCover from './canvasCover'
import stackBlur from './stackBlur'

export default {
  props: {
    image: {
      type: Object,
      required: true
    },
    placeholder: {
      type: Object,
      required: false
    },
    alt: {
      type: String,
      required: false
    },
    cover: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    currentSrc: null,
    loadedRes: null,
    portrait: false
  }),
  computed: {
    ...mapGetters({ getApiUrl: 'bwstarter/getApiUrl' }),
    loaderClass () {
      return [
        'image-loader',
        this.cover ? 'cover' : 'contain',
        this.portrait ? 'portrait' : 'landscape'
      ]
    },
    isDataString () {
      return this.image.publicPath ? this.image.publicPath.substring(0, 5) === 'data:' : false
    },
    imagePath () {
      if (!this.image) {
        return null
      }
      if (this.isDataString) {
        return this.image.publicPath
      }
      return this.getApiUrl(this.image.publicPath)
    },
    placeholderPath () {
      if (!this.placeholder) {
        return null
      }
      if (this.placeholder.publicPath.substring(0, 5) === 'data:') {
        return this.placeholder.publicPath
      }
      return this.getApiUrl(this.placeholder.publicPath)
    },
    canvasSize () {
      return {
        width: this.cover && this.placeholder ? this.placeholder.width : this.image.width,
        height: this.cover && this.placeholder ? this.placeholder.height : this.image.height
      }
    },
    placeholderDataUrl () {
      if (this.canvasSize.width || this.canvasSize.height) {
        return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ${this.canvasSize.width} ${this.canvasSize.height}" width="${this.canvasSize.width}" height="${this.canvasSize.height}"></svg>`
      }
      return this.imagePath
    }
  },
  methods: {
    setupPlaceholder () {
      if (this.placeholderPath) {
        let loResImg = new Image()
        // HTML5 - send Origin header - no credentials though
        loResImg.crossOrigin = 'anonymous'
        let loResCanvas = this.$refs.canvas

        loResImg.onload = () => {
          let matchSizeEl = this.cover ? this.$el : loResImg
          let ctx = loResCanvas.getContext('2d')
          loResCanvas.width = matchSizeEl.clientWidth || matchSizeEl.width
          loResCanvas.height = matchSizeEl.clientHeight || matchSizeEl.height
          if (this.cover) {
            canvasCover(ctx, loResImg)
          } else {
            ctx.drawImage(loResImg, 0, 0)
          }
          stackBlur(ctx, 0, 0, loResCanvas.width, loResCanvas.height, 8)
          this.currentSrc = this.placeholderPath
          this.loadedRes = 'low'
        }
        loResImg.src = this.placeholderPath
        return loResImg
      }
      return null
    },
    initImage () {
      this.loadedRes = null
      this.portrait = this.image.width < this.image.height

      let hiResImg = new Image();
      let loResImg = this.setupPlaceholder();

      hiResImg.onload = () => {
        if (loResImg) {
          loResImg.onload = null
        }
        this.portrait = hiResImg.width < hiResImg.height
        this.currentSrc = this.imagePath
        this.loadedRes = 'high'
      }

      hiResImg.src = this.imagePath
    }
  },
  watch: {
    image () {
      this.initImage()
    },
    placeholder () {
      this.initImage()
    }
  },
  mounted () {
    this.initImage()
  }
}
</script>

<style lang="sass">
  .image-loader
    display: inline-block
    line-height: 0

    .fade-enter-active,
    .fade-leave-active
      transition: opacity .8s

    .fade-enter,
    .fade-leave-to
      opacity: 0

    .image-placeholder
      position: relative
      display: block
      max-width: 100%
      max-height: 100%
      opacity: 0
    .inner
      position: absolute
      top: 0
      left: 0
      width: 100%
      height: 100%
      min-width: 30px
      min-height: 30px
      &.no-placeholder
        position: relative
      .background
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        min-width: 30px
        min-height: 30px
      .image-small
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
      .image-holder
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        .image
          position: relative
          display: block
      .loader-outer
        position: absolute
        top: 50%
        left: 50%
        width: 16px
        height: 16px
        margin-top: -8px
        margin-left: -8px

    &.contain
      position: relative
      .image-placeholder
        display: inline-block
      .inner
        .image-holder
          max-width: 100%
          max-height: 100%
          .image
            max-width: 100%
            max-height: 100%
    &.cover
      display: block
      .image-placeholder
        width: 100%
      .inner
        .image-holder
          min-width: 100%
          min-height: 100%
      &.landscape
        .inner
          .image-holder
            height: 100%
            width: auto
            left: 50%
            top: 50%
            .image
              min-height: 100%
              max-width: none
              max-height: none
              height: auto
              transform: translate(-50%, -50%)
    /*&.landscape*/
      /*.image-placeholder*/
        /*height: 100%*/
    &.portrait
      .image-placeholder
        max-width: 100%
      .inner
        .image-holder
          width: 100%
          height: 100%
          .image
            position: absolute
            top: -50%
            bottom: -50%
            width: 100%
            height: auto
            margin: auto
</style>
