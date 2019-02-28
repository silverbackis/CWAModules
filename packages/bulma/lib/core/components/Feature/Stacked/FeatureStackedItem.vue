<template>
  <div>
    <figure class="column is-narrow">
      <component :is="dynamicComponent"
                 :to="toRoute"
                 class="feature-stacked-item has-text-centered"
      >
        <image-loader
          v-if="getImageData()"
          class="image-loader"
          :image="getImageData()"
          :placeholder="getImageData('placeholder', true)"
          :alt="injectDynamicData(component.title)"
        />
      </component>
    </figure>
    <div class="column has-text-centered-mobile">
      <div class="content">
        <h3>{{ injectDynamicData(component.title) }}</h3>
        <div v-if="$bwstarter.isAdmin">
          <admin-quill-editor :model="realComponentData.description"
                        :componentId="endpoint"
                        :editor-toolbar="[ 'bold', 'italic', 'underline' ]"
                        componentField="description"
                        placeholder="Enter feature description here"
                        class="input"
          />
        </div>
        <p v-else v-html="realComponentData.description"></p>

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
  import ImageDataMixin from '~/.nuxt/bwstarter/bulma/components/imageDataMixin'
  import ImageLoader from '~/.nuxt/bwstarter/components/Utils/ImageLoader'
  import AppLink from '~/.nuxt/bwstarter/components/Utils/AppLink'

  export default {
    mixins: [ ComponentMixin, ImageDataMixin ],
    components: {
      ImageLoader,
      AppLink,
      AdminTextInput: () => import('~/.nuxt/bwstarter/components/Admin/Text')
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
