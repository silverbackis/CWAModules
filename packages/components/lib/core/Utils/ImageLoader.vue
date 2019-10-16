<template>
  <div :class="loaderClass">
    <img
      v-if="placeholderDataUrl"
      :src="placeholderDataUrl"
      class="image-placeholder"
    />

    <transition-group
      :class="{ inner: true, 'no-placeholder': !placeholderDataUrl }"
      name="fade"
      tag="div"
    >
      <div
        v-show="loadedRes === null"
        :key="'placeholder'"
        class="background"
      />
      <transition-group
        v-show="true"
        :key="'image-holder'"
        name="fade"
        tag="div"
        class="image-holder"
      >
        <img
          v-show="loadedRes === 'high'"
          :key="'image'"
          :src="imagePath"
          :alt="alt"
          class="image"
        />
      </transition-group>
      <canvas
        ref="canvas_dom"
        v-show="loadedRes === 'low'"
        :key="'canvas'"
        class="image-small"
      />
      <div v-show="loadedRes !== 'high'" :key="'loader'" class="loader-outer">
        <div class="loader"></div>
      </div>
    </transition-group>
    <slot></slot>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import canvasCover from './canvasCover.js'
import stackBlur from './stackBlur.js'

export default {
  props: {
    image: {
      type: Object,
      required: true
    },
    placeholder: {
      type: Object,
      required: false,
      default: null
    },
    alt: {
      type: String,
      required: false,
      default: null
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
    loaderClass() {
      return [
        'image-loader',
        this.cover ? 'cover' : 'contain',
        this.portrait ? 'portrait' : 'landscape'
      ]
    },
    isDataString() {
      return this.image.publicPath
        ? this.image.publicPath.substring(0, 5) === 'data:'
        : false
    },
    imagePath() {
      if (!this.image) {
        return null
      }
      if (this.isDataString) {
        return this.image.publicPath
      }
      return this.getApiUrl(this.image.publicPath)
    },
    placeholderPath() {
      if (!this.placeholder) {
        return null
      }
      if (this.placeholder.publicPath.substring(0, 5) === 'data:') {
        return this.placeholder.publicPath
      }
      return this.getApiUrl(this.placeholder.publicPath)
    },
    canvasSize() {
      return {
        width:
          this.cover && this.placeholder
            ? this.placeholder.width
            : this.image.width,
        height:
          this.cover && this.placeholder
            ? this.placeholder.height
            : this.image.height
      }
    },
    placeholderDataUrl() {
      if (this.canvasSize.width || this.canvasSize.height) {
        return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ${
          this.canvasSize.width
        } ${this.canvasSize.height}" width="${this.canvasSize.width}" height="${
          this.canvasSize.height
        }"></svg>`
      }
      return this.imagePath
    }
  },
  watch: {
    image() {
      this.initImage()
    },
    placeholder() {
      this.initImage()
    }
  },
  mounted() {
    this.initImage()
  },
  methods: {
    setupPlaceholder() {
      if (this.placeholderPath) {
        const loResImg = new Image()
        // HTML5 - send Origin header - no credentials though
        loResImg.crossOrigin = 'anonymous'
        const loResCanvas = this.$refs.canvas

        loResImg.onload = () => {
          const matchSizeEl = this.cover ? this.$el : loResImg
          const ctx = loResCanvas.getContext('2d')
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
    initImage() {
      this.loadedRes = null
      this.portrait = this.image.width < this.image.height

      const hiResImg = new Image()
      const loResImg = this.setupPlaceholder()

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
    overflow: hidden
    .image-placeholder
      width: 100%
    .inner
      overflow: hidden
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
