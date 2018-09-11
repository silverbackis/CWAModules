<template>
  <div>
    <figure class="column is-narrow">
      <component :is="dynamicComponent"
                 :to="toRoute"
                 class="feature-stacked-item has-text-centered"
      >
        <image-loader
          v-if="image"
          class="image-loader"
          :image="image"
          :placeholder="placeholder"
          :alt="injectDynamicData(component.title)"
        />
      </component>
    </figure>
    <div class="column has-text-centered-mobile">
      <div class="content">
        <h3>{{ injectDynamicData(component.title) }}</h3>
        <p v-html="injectDynamicData(component.description)"></p>
        <app-link v-if="toRoute && component.buttonText"
                  :to="toRoute"
                  :class="injectDynamicData(component.buttonClass) || 'button is-primary'"
        >
          {{ injectDynamicData(component.buttonText) }}
        </app-link>
      </div>
    </div>
  </div>
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
          this.component.className || ''
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

  .feature-stacked-item
    display: block
    position: relative
    margin: auto
    +desktop
      margin: auto auto 1rem
    .image-placeholder,
    .image
      width: 100%
      min-width: 50px
      max-width: 200px !important
      height: 100%
      max-height: 150px !important
      +mobile
        width: 200px
</style>
