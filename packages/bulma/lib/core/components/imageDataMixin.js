import ComponentMixin from '~/.nuxt/bwstarter/bulma/components/componentMixin'

export default {
  mixins: [ComponentMixin],
  props: {
    imagineKey: {
      type: String,
      default: 'thumbnail'
    }
  },
  methods: {
    getImageData (imagineKey, requiresImagine) {
      if (!imagineKey) {
        imagineKey = this.imagineKey
      }
      const fileData = this.realComponentData.fileData
      if (!fileData) {
        return null
      }
      if (fileData.imagineData && fileData.imagineData[imagineKey]) {
        return fileData.imagineData[imagineKey]
      }
      if (requiresImagine) {
        return null
      }
      if (fileData.imageData) {
        return fileData.imageData
      }
      return fileData
    },
    injectImageData (imageObject) {
      imageObject.publicPath = this.injectDynamicData(imageObject.publicPath)
      return imageObject
    },
    image (imagineKey, requiresImagine) {
      const imageData = this.getImageData(imagineKey, requiresImagine)
      if (!imageData) {
        return null
      }
      return this.injectImageData(imageData)
    }
  }
}
