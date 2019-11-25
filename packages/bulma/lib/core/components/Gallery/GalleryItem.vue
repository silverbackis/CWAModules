<template>
  <li
    v-if="image() || $bwstarter.isAdmin"
    itemscope
    itemtype="https://schema.org/ImageGallery"
    class="gallery-item"
  >
    <div class="gallery-thumb">
      <figure
        itemprop="associatedMedia"
        itemscope
        itemtype="https://schema.org/ImageObject"
      >
        <a
          :class="{
            'gallery-link': true,
            'is-preview': !!preview,
            'no-image': noImage
          }"
          :href="noImage ? '#' : getApiUrl(component.fileData.publicPath)"
          itemprop="contentUrl"
          @click.prevent="image() ? $photoswipe.open(index, items, $el) : null"
        >
          <image-loader
            class="image gallery-image"
            :image="image()"
            :placeholder="placeholder"
            :cover="true"
            :alt="component.title"
          />
          <div
            v-if="uploading || uploadError"
            class="progress-outer has-text-centered"
          >
            <bulma-progress
              :class="['is-small', uploadError ? 'is-danger' : 'is-success']"
              :value="uploadPercentage"
            ></bulma-progress>
            <a
              v-if="uploading"
              class="button is-small is-danger"
              @click.stop.prevent="cancelUpload()"
              >cancel upload</a
            >
            <p
              v-if="uploadError"
              class="has-text-white help has-text-weight-bold"
            >
              {{ uploadError }}
            </p>
          </div>
          <meta itemprop="width" :content="imageFile ? imageFile.width : 0" />
          <meta itemprop="height" :content="imageFile ? imageFile.height : 0" />
        </a>
        <div
          v-if="$bwstarter.isAdmin && !uploading"
          class="file edit-button is-primary"
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
                Upload
              </span>
            </div>
          </label>
        </div>

        <button
          v-if="$bwstarter.isAdmin"
          class="button move-button is-dark is-small"
        >
          <span class="sr-only">Re-order</span>
          <font-awesome-icon :icon="['fas', 'arrows-alt']" />
        </button>

        <button
          v-if="$bwstarter.isAdmin"
          class="button delete-button is-danger is-small"
          @click="deleteItem"
        >
          <span class="sr-only">Delete</span>
          <font-awesome-icon :icon="['fas', 'trash-alt']" />
        </button>

        <figcaption
          v-if="component.caption"
          itemprop="caption description"
          class="sr-only"
        >{{ component.caption }}</figcaption>
      </figure>
    </div>
    <div v-if="$bwstarter.isAdmin" class="field">
      <div class="field-body">
        <div class="field">
          <div class="control">
            <admin-text-input
              :model="injectDynamicData(component.caption)"
              :component-id="endpoint"
              component-field="caption"
              placeholder="Enter caption"
              class="input"
            />
          </div>
        </div>

        <div class="field is-narrow has-addons">
          <div class="control">
            <a class="button is-primary is-outlined" @click="$emit('movedown')">
              <span class="icon is-small">
                <span class="sr-only">Move up</span>
                <font-awesome-icon icon="chevron-down" />
              </span>
            </a>
          </div>
          <div class="control">
            <a class="button is-primary is-outlined" @click="$emit('moveup')">
              <span class="icon is-small">
                <span class="sr-only">Move down</span>
                <font-awesome-icon icon="chevron-up" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </li>
</template>

<script>
import { mapGetters } from 'vuex'
import { name as entitiesModuleName } from '~/.nuxt/bwstarter/core/storage/entities'
import ImageLoader from '~/.nuxt/bwstarter/components/Utils/ImageLoader'
import UploadMixin from '~/.nuxt/bwstarter/bulma/components/Admin/File/UploadMixin'

export default {
  components: {
    ImageLoader,
    AdminTextInput: () => import('~/.nuxt/bwstarter/components/Admin/Text'),
    BulmaProgress: () => import('../../BulmaProgress')
  },
  mixins: [UploadMixin],
  props: {
    items: {
      type: Array,
      required: true
    },
    photoswipe: {
      type: Object,
      required: false,
      default: null
    },
    location: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      file: null,
      preview: null,
      uploadPercentage: 0,
      uploading: false,
      uploadError: null,
      transparentImage:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
    }
  },
  computed: {
    ...mapGetters({ getApiUrl: 'bwstarter/getApiUrl' }),
    imageFile() {
      return this.component.fileData.imageData || this.preview
    },
    // image () {
    //   if (this.preview) {
    //     return this.preview
    //   }
    //   if (this.component.fileData.imagineData) {
    //     return this.component.fileData.imagineData.thumbnail
    //   }
    //   return {
    //     publicPath: this.transparentImage,
    //     width: 1,
    //     height: 1
    //   }
    // },
    placeholder() {
      if (this.preview) {
        return this.preview
      }
      if (this.component.fileData.imagineData) {
        return this.component.fileData.imagineData.placeholderSquare
      }
      return {
        publicPath: this.transparentImage,
        width: 1,
        height: 1
      }
    },
    noImage() {
      return !this.preview && !this.component.filePath
    }
  },
  methods: {
    handleFileUpload() {
      this.file = this.$refs.file.files[0]
      if (this.file && /\.(jpe?g|png|gif)$/i.test(this.file.name)) {
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
      this.submitUpload()
    },
    cancelUpload() {
      this.preview = null
    },
    submitUpload() {
      this.uploadError = null
      this.uploading = true
      this.uploadPercentage = 0
      const formData = new FormData()
      formData.append('file', this.file)
      this.$axios
        .post('/files/filePath/' + this.component['@id'], formData, {
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
          this.$bwstarter.$storage.commit(
            'setEntity',
            [{ id: data['@id'], data }],
            entitiesModuleName
          )
        })
        .catch(error => {
          // eslint-disable-next-line no-console
          console.error(error)
          this.uploading = false
          this.uploadError =
            'Server responded with status code ' + error.statusCode
        })
    },
    deleteItem() {
      const doDelete = () => {
        return this.$axios
          .delete(this.component['@id'], { progress: false })
          .then(() => {
            this.$emit('deleted')
          })
          .catch(error => {
            // eslint-disable-next-line no-console
            console.error('error deleting gallery item', error)
          })
      }
      this.$dialog
        .confirm({
          title: 'Are you sure?',
          body: 'This will permanently delete this image from your gallery.'
        })
        .then(async dialog => {
          await doDelete()
          dialog.close()
        })
        .catch(() => {
          // Cancelled delete
        })
    }
  }
}
</script>

<style lang="sass">
@import "~bulma/sass/utilities/mixins"

.gallery-thumb
  width: 100%
  display: inline-block
  position: relative
  .gallery-link
    box-shadow: 1px 2px 3px rgba($black, .1)
    position: relative
    display: inline-block
    overflow: hidden
    width: 100%
    &.is-preview
      cursor: default
      .gallery-image
        opacity: .5
    &.no-image
      cursor: default
      background: $green
      &:after
        content: 'No Image'
        position: absolute
        width: 100%
        text-align: center
        top: 50%
        line-height: 2rem
        margin-top: -1rem
        font-size: 1.5rem
        color: $white
  /*position: absolute*/
  /*top: 0*/
  /*left: 0*/
  /*width: 100%*/
  /*height: 100%*/
  .edit-button
    position: absolute
    bottom: 10px
    right: 5px
  .move-button
    position: absolute
    top: 5px
    left: 5px
    cursor: move
  .delete-button
    position: absolute
    top: 5px
    right: 5px
  .image-spacer
    line-height: 0
    font-size: 0
    border: 2px dashed $grey-light
    img
      width: 100%
      display: block
      position: relative

.gallery-sort-input
  min-width: 50px
  max-width: 70px
  text-align: center
</style>
