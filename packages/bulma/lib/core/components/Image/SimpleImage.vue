<template>
  <component-wrapper v-if="component" :nested="nested">
    <div class="image-component">
      <figure
        itemprop="associatedMedia"
        itemscope
        itemtype="https://schema.org/ImageObject"
      >
        <div v-if="uploaderImage || $bwstarter.isAdmin">
          <div class="image-top-wrapper">
            <template v-if="uploaderImage">
              <div class="is-block image-holder">
                <image-loader
                  :image="uploaderImage"
                  :placeholder="uploaderPlaceholder"
                  :cover="false"
                  :alt="caption"
                  class="image simple-image"
                />
              </div>
              <meta :content="uploaderImage.width" itemprop="width" />
              <meta :content="uploaderImage.height" itemprop="height" />
            </template>
            <div
              v-else-if="$bwstarter.isAdmin"
              class="image-admin-placeholder box has-background-grey-light is-marginless"
            >
              <div class="line a has-background-grey"></div>
              <div class="line b has-background-grey"></div>
            </div>
            <upload-progress
              v-if="$bwstarter.isAdmin"
              :uploading="uploading"
              :percent="uploadPercentage"
              :error="uploadError"
            />
          </div>
          <div
            v-if="$bwstarter.isAdmin"
            class="admin-button-holder columns has-text-left"
          >
            <div class="column is-narrow">
              <upload-button
                :component-id="endpoint"
                @preview="
                  newValue => {
                    preview = newValue
                  }
                "
                @uploading="
                  newValue => {
                    uploading = newValue
                  }
                "
                @uploadPercentage="
                  newValue => {
                    uploadPercentage = newValue
                  }
                "
                @uploadError="
                  newValue => {
                    uploadError = newValue
                  }
                "
              />
            </div>
            <div v-if="uploaderImage" class="column">
              <button
                :disabled="removingImage"
                class="button is-danger delete-button"
                @click="removeImage"
              >
                <span class="icon">
                  <font-awesome-icon icon="trash-alt" />
                </span>
                <span>Remove Image</span>
              </button>
            </div>
          </div>
        </div>

        <figcaption
          v-if="caption && !$bwstarter.isAdmin"
          itemprop="caption description"
          v-html="caption"
        />
        <div
          v-else-if="$bwstarter.isAdmin && 'caption' in component"
          class="field caption-field"
        >
          <div class="field-body">
            <div class="field">
              <div class="control">
                <admin-text-input
                  :model="caption"
                  :component-id="endpoint"
                  :component-field="dynamicCaptionField"
                  placeholder="Enter caption"
                />
              </div>
            </div>
          </div>
        </div>
      </figure>
    </div>
  </component-wrapper>
</template>

<script>
import { mapGetters } from 'vuex'
import { name as entitiesModuleName } from '~/.nuxt/bwstarter/core/storage/entities'
import ImageLoader from '~/.nuxt/bwstarter/components/Utils/ImageLoader'
import UploadMixin from '~/.nuxt/bwstarter/bulma/components/Admin/File/UploadMixin'

export default {
  components: {
    ImageLoader,
    AdminTextInput: () => import('~/.nuxt/bwstarter/components/Admin/Text')
  },
  mixins: [UploadMixin],
  data() {
    return {
      removingImage: false
    }
  },
  computed: {
    ...mapGetters({ getApiUrl: 'bwstarter/getApiUrl' }),
    isDynamic() {
      return (
        this.injectDynamicData(this.component.filePath) !==
        this.component.filePath
      )
    },
    caption() {
      return this.realComponentData.caption
    },
    dynamicCaptionField() {
      const dynamicVarArray = this.getDynamicVars(this.component.caption)
      return dynamicVarArray ? dynamicVarArray[0] : 'caption'
    }
  },
  methods: {
    async removeImage() {
      this.removingImage = true
      const { data } = await this.$axios.put(this.endpoint, {
        filePath: null
      })
      this.$bwstarter.$storage.commit(
        'setEntity',
        [{ id: data['@id'], data }],
        entitiesModuleName
      )
      this.removingImage = false
    }
  }
}
</script>

<style lang="sass">
@import "~bulma/sass/utilities/mixins"
@import "../../assets/css/vars"

.image-component
  .image-top-wrapper
    position: relative
    display: inline-block
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
  .image-admin-placeholder
    width: 200px
    height: 200px
    overflow: hidden
    position: relative
    .line
      content: ''
      position: absolute
      height: 300px
      width: 1px
      left: 50%
      top: 50%
      margin-top: -150px
      transform-origin: center
      &.b
        transform: rotate(45deg)
      &.a
        transform: rotate(-45deg)
  .caption-field
    margin-top: 1rem
</style>
