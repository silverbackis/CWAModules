<template>
  <div
    :class="['file', 'edit-button', 'is-primary', { 'is-disabled': uploading }]"
  >
    <label class="file-label">
      <input
        ref="file"
        class="file-input"
        type="file"
        name="image"
        accept="image/*"
        :disabled="uploading"
        @change="handleFileUpload()"
      />
      <div class="file-cta">
        <span class="file-icon">
          <font-awesome-icon :icon="['fas', 'upload']" />
        </span>
        <span class="file-label">
          {{ buttonText }}
        </span>
      </div>
    </label>
  </div>
</template>

<script>
import { name as entitiesModuleName } from '~/.nuxt/bwstarter/core/storage/entities'

export default {
  props: {
    buttonText: {
      type: String,
      default: 'Upload'
    },
    componentId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      file: null,
      preview: null,
      uploadPercentage: 0,
      uploading: false,
      uploadError: null
    }
  },
  watch: {
    preview(newValue) {
      this.$emit('preview', newValue)
    },
    uploading(newValue) {
      this.$emit('uploading', newValue)
    },
    uploadPercentage(newValue) {
      this.$emit('uploadPercentage', newValue)
    },
    uploadError(newValue) {
      this.$emit('uploadError', newValue)
    }
  },
  methods: {
    handleFileUpload() {
      this.file = this.$refs.file.files[0]
      if (this.file && /\.(jpe?g|png|gif|svg)$/i.test(this.file.name)) {
        const reader = new FileReader()
        reader.addEventListener(
          'load',
          function(file) {
            const image = new Image()
            image.src = file.target.result
            image.onload = () => {
              this.preview = {
                publicPath: image.src,
                width: image.width,
                height: image.height
              }
            }
          }.bind(this),
          false
        )
        reader.readAsDataURL(this.file)
      } else {
        this.preview = null
      }
      if (this.file) {
        this.submitUpload()
      }
    },
    cancelUpload() {
      this.preview = null
      this.file = null
    },
    submitUpload() {
      this.uploadError = null
      this.uploading = true
      this.uploadPercentage = 0
      const formData = new FormData()
      formData.append('file', this.file)
      this.$axios
        .post('/files/filePath/' + this.componentId, formData, {
          progress: false,
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: function(progressEvent) {
            this.uploadPercentage = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
          }.bind(this)
        })
        .then(({ data }) => {
          this.uploading = false
          this.preview = null
          this.$refs.file.value = ''
          this.$bwstarter.$storage.commit(
            'setEntity',
            [{ id: data['@id'], data }],
            entitiesModuleName
          )
        })
        .catch(error => {
          let status = 'An unknown error occurred'
          let response
          if ((response = error.response)) {
            const responseData = response.data
            let statusText
            if (typeof responseData === 'string') {
              statusText = responseData
            } else {
              statusText = response.statusText
              // eslint-disable-next-line no-console
              console.error(response.data)
            }
            status = `(${response.status}) ${statusText}`
          } else if (error.statusCode) {
            status = `(${error.statusCode}) Unknown error`
          } else {
            // eslint-disable-next-line no-console
            console.error(error)
          }
          this.uploading = false
          this.uploadError = status
          this.file = null
          this.$refs.file.value = ''
        })
    }
  }
}
</script>
