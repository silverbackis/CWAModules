<template>
  <component :is="dynamicComponent"
             :to="toRoute"
             :class="className"
  >
    <div v-if="component.filePath" class="feature-horizontal-item">
      <image-loader
        v-if="image"
        class="image"
        :image="image"
        :placeholder="placeholder"
        :alt="injectDynamicData(component.title)"
      />
    </div>
    <h4 class="title is-4">{{ injectDynamicData(component.title) }}</h4>
    <h5 class="subtitle is-size-6-touch">{{ injectDynamicData(component.description) }}</h5>
  </component>
</template>

<script>
  import ComponentMixin from '~/.nuxt/bwstarter/bulma/components/componentMixin'
  import { mapGetters } from 'vuex'
  import ImageLoader from '~/.nuxt/bwstarter/components/Utils/ImageLoader'
  import AppLink from '~/.nuxt/bwstarter/components/Utils/AppLink'

  export default {
    mixins: [ ComponentMixin ],
    components: {
      ImageLoader,
      AppLink
    },
    methods: {
      injectImageData (imageObject) {
        imageObject.publicPath = this.injectDynamicData(imageObject.publicPath)
        return imageObject
      }
    },
    computed: {
      dynamicComponent () {
        return this.toRoute ? 'app-link' : 'div'
      },
      className () {
        return [
          'column',
          this.injectDynamicData(this.component.className) || ''
        ]
      },
      toRoute () {
        return this.component.url || (this.component.route ? this.component.route.route : null)
      },
      image () {
        let image;
        if (this.component[ 'file:imagine' ]) {
          image = this.component[ 'file:imagine' ].thumbnail
        } else if (this.component[ 'file:image' ]) {
          image = this.component[ 'file:image' ]
        } else {
          //svg
          image = {
            publicPath: this.component[ 'file:publicPath' ]
          }
        }
        if (image) {
          return this.injectImageData(image)
        }
        return null
      },
      placeholder () {
        if (this.component[ 'file:imagine' ] && this.component[ 'file:imagine' ].placeholder) {
          return this.injectImageData((this.component[ 'file:imagine' ].placeholder))
        }
        return null
      }
    }
  }
</script>

<style lang="sass">
  @import ~bulma/sass/utilities/mixins

  .feature-horizontal-item
    display: block
    position: relative
    height: 55px
    margin: auto auto 1rem
    min-width: 155px
    width: 100%
    +desktop
      height: 110px
    .image
      height: 100%

</style>
