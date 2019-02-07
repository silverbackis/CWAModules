export default {
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
      const fileData = this.component.fileData
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
    image (imagineKey, requiresImagine) {
      const imageData = this.imageData(imagineKey, requiresImagine)
      if (!imageData) {
        return null
      }
      return this.injectImageData(imageData)
    }
  }
}
