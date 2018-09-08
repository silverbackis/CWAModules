<template>
  <li itemscope
      itemtype="https://schema.org/ImageGallery"
      class="gallery-item"
  >
    <div class="gallery-thumb">
      <figure itemprop="associatedMedia" itemscope itemtype="https://schema.org/ImageObject">
        <a :class="{'gallery-link': true, 'is-preview': !!preview}"
           :href="(preview || !component['file:image']) ? '#' : getApiUrl(imageFile.publicPath)"
           itemprop="contentUrl"
           @click.prevent="$photoswipe.open(index, items, $el)"
        >
          <image-loader v-if="preview || component['file:imagine']"
                        class="image gallery-image"
                        :image="preview ? preview : component['file:imagine'].thumbnail"
                        :placeholder="component['file:imagine'] ? component['file:imagine'].placeholderSquare : null"
                        :cover="true"
                        :alt="component.title"
          />
          <div class="progress-outer has-text-centered" v-if="uploading || uploadError">
            <bulma-progress :class="['is-small', uploadError ? 'is-danger' : 'is-success']" :value="uploadPercentage"></bulma-progress>
            <a v-if="uploading" class="button is-small is-danger" @click.stop.prevent="cancelUpload()">cancel upload</a>
            <p v-if="uploadError" class="has-text-white help has-text-weight-bold">{{ uploadError }}</p>
          </div>
          <meta itemprop="width" :content="imageFile ? imageFile.width : 0">
          <meta itemprop="height" :content="imageFile ? imageFile.height : 0">
        </a>
        <div v-if="$bwstarter.isAdmin && !uploading" class="file edit-button is-primary">
          <label class="file-label">
            <input class="file-input" type="file" name="image" accept="image/*" @change="handleFileUpload()" ref="file" :disabled="uploading"/>
            <div class="file-cta">
              <span class="file-icon">
                <font-awesome-icon :icon="['fas', 'upload']"/>
              </span>
              <span class="file-label">
                Upload
              </span>
            </div>
          </label>
        </div>

        <button v-if="$bwstarter.isAdmin"
                class="button move-button is-dark is-small">
          <span class="sr-only">Re-order</span>
          <font-awesome-icon :icon="['fas', 'arrows-alt']"/>
        </button>

        <figcaption v-if="component.caption"
                    itemprop="caption description" class="sr-only"
                    v-html="component.caption"
        />
      </figure>
    </div>
    <div v-if="$bwstarter.isAdmin" class="field">
      <div class="field-body">
        <div class="field">
          <div class="control">
            <admin-text-input :model="injectDynamicData(component.caption)"
                              :componentId="endpoint"
                              componentField="caption"
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
                <font-awesome-icon icon="chevron-down"/>
              </span>
            </a>
          </div>
          <div class="control">
            <a class="button is-primary is-outlined" @click="$emit('moveup')">
              <span class="icon is-small">
                <span class="sr-only">Move down</span>
                <font-awesome-icon icon="chevron-up"/>
              </span>
            </a>
          </div>
        </div>

      </div>
    </div>
  </li>
</template>

<script>
  import { name as entitiesModuleName } from '~/.nuxt/bwstarter/core/storage/entities'
  import { mapGetters } from 'vuex'
  import ImageLoader from '~/.nuxt/bwstarter/components/Utils/ImageLoader'
  import ComponentMixin from '~/.nuxt/bwstarter/bulma/components/componentMixin'

  export default {
    mixins: [ ComponentMixin ],
    data() {
      return {
        file: null,
        preview: null,
        uploadPercentage: 0,
        uploading: false,
        uploadError: null
      }
    },
    props: {
      items: {
        type: Array,
        required: true
      },
      $photoswipe: {
        type: Object
      },
      location: {
        type: Object,
        required: true
      }
    },
    components: {
      ImageLoader,
      AdminTextInput: () => import('~/.nuxt/bwstarter/components/Admin/Text'),
      BulmaProgress: () => import('../../BulmaProgress')
    },
    computed: {
      ...mapGetters({ getApiUrl: 'bwstarter/getApiUrl' }),
      imageFile() {
        return this.component['file:image'] || this.preview
      }
    },
    methods: {
      handleFileUpload() {
        this.file = this.$refs.file.files[ 0 ];
        if (this.file && /\.(jpe?g|png|gif)$/i.test(this.file.name)) {
          let reader = new FileReader()
          reader.addEventListener("load", function (file) {
            const image = new Image()
            image.src = file.target.result
            image.onload = () => {
              this.preview = {
                publicPath: image.src,
                width: image.width,
                height: image.height
              }
            }
          }.bind(this), false)
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
        this.$axios.post('/files/filePath/' + this.component['@id'],
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: function (progressEvent) {
              this.uploadPercentage = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            }.bind(this)
          }
        )
        .then(({ data }) => {
          this.uploading = false
          this.preview = null
          this.$bwstarter.$storage.commit('setEntity', [ { id: data['@id'], data } ], entitiesModuleName)
        })
        .catch((error) => {
          console.warn(error)
          this.uploading = false
          this.uploadError = 'Server responded with status code ' + error.statusCode
        })
      }
    }
  }
</script>

<style lang="sass">
  @import ~bulma/sass/utilities/mixins

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
        .gallery-image
          opacity: .5
    /*.gallery-image*/
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

  .gallery-sort-input
    min-width: 50px
    max-width: 70px
    text-align: center

  .gallery-item
    .progress-outer
      z-index: 10
      width: 60%
      top: 50%
      left: 20%
      margin-top: -.375rem
      position: absolute
      .progress
        margin-bottom: .5rem
      .help
        background-color: $red
        padding: .2rem
</style>
