import ImageDataMixin from '~/.nuxt/bwstarter/bulma/components/imageDataMixin'

export default {
  mixins: [ImageDataMixin],
  components: {
    UploadButton: () =>
      import('~/.nuxt/bwstarter/bulma/components/Admin/File/UploadButton'),
    UploadProgress: () =>
      import('~/.nuxt/bwstarter/bulma/components/Admin/File/UploadProgress')
  },
  data() {
    return {
      uploading: false,
      uploadPercentage: 0,
      uploadError: null,
      preview: null
    }
  },
  computed: {
    uploaderImage() {
      if (this.preview) {
        return this.preview
      }
      return this.image()
    },
    uploaderPlaceholder() {
      if (this.preview) {
        return this.preview
      }
      return this.image('placeholder', true)
    }
  }
}
