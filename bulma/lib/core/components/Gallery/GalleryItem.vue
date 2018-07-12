<template>
  <li itemscope
      itemtype="https://schema.org/ImageGallery"
      class="gallery-item"
  >
    <div class="gallery-thumb">
      <figure itemprop="associatedMedia" itemscope itemtype="https://schema.org/ImageObject">
        <a class="gallery-link"
           :href="getApiUrl(component['file:image'].publicPath)"
           itemprop="contentUrl"
           @click.prevent="$photoswipe.open(index, items, $el)"
        >
          <image-loader class="image gallery-image"
                        :image="component['file:imagine'].thumbnail"
                        :placeholder="component['file:imagine'].placeholderSquare || null"
                        :cover="true"
                        :alt="component.title"
          />
        </a>
        <div v-if="$bwstarter.isAdmin"
             class="button edit-button is-primary">Change</div>
        <button v-if="$bwstarter.isAdmin"
                class="button move-button is-dark is-small">
          <span class="sr-only">Re-order</span>
          <font-awesome-icon :icon="['fas', 'bars']" size="lg" />
        </button>

        <meta itemprop="width" :content="component['file:image'].width">
        <meta itemprop="height" :content="component['file:image'].height">
        <figcaption v-if="component.caption"
                    itemprop="caption description" class="sr-only"
                    v-html="component.caption"
        />
      </figure>
    </div>
    <div v-if="$bwstarter.isAdmin"
         class="field"
    >
      <div class="control">
        <admin-text-input :model="location.sort"
                          :componentId="location['@id']"
                          componentField="sort"
                          placeholder="Sort order value"
                          class="input"
        />
        <admin-text-input :model="injectDynamicData(component.caption)"
                          :componentId="endpoint"
                          componentField="caption"
                          placeholder="Enter caption"
                          class="input"
        />
      </div>
    </div>
  </li>
</template>

<script>
  import { mapGetters } from 'vuex'
  import ImageLoader from '~/.nuxt/bwstarter/components/Utils/ImageLoader'
  import ComponentMixin from '~/.nuxt/bwstarter/bulma/components/componentMixin'

  export default {
    mixins: [ComponentMixin],
    props: {
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
      },
      location: {
        type: Object,
        required: true
      }
    },
    components: {
      ImageLoader,
      AdminTextInput: () => import('~/.nuxt/bwstarter/components/Admin/Text')
    },
    computed: {
      ...mapGetters({ getApiUrl: 'bwstarter/getApiUrl' })
    },
    watch: {
      index (newVal, oldVal) {
        console.log('index changed...', index)
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
</style>
