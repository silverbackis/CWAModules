<template>
  <div :class="cardClass">
    <div class="card is-inline-block">
      <component :is="linkComponent" class="card-image" :to="toRoute">
        <image-loader
          class="article-image"
          :image="component['file:imagine'].thumbnail || component['file:image']"
          :placeholder="component['file:imagine'].placeholderSquare || null"
          :alt="component.title"
          :cover="true"
        />
        <img src="/img/1x1.png" class="square-space" />
      </component>
      <div class="card-content">
        <h4 class="title is-4">{{ component.title }}</h4>
        <h5 class="subtitle is-6">{{ component.subtitle }}</h5>
        <app-link v-if="component.routes.length"
                  :to="toRoute"
                  class="button is-primary"
        >View</app-link>
      </div>
    </div>
  </div>
</template>

<script>
  import ComponentMixin from '~/.nuxt/bwstarter/bulma/components/componentMixin'
  import ImageLoader from '~/.nuxt/bwstarter/components/Utils/ImageLoader'
  import AppLink from '~/.nuxt/bwstarter/components/Utils/AppLink'

  export default {
    mixins: [ ComponentMixin ],
    components: {
      ImageLoader,
      AppLink
    },
    props: {
      type: {
        type: String,
        required: false
      }
    },
    computed: {
      linkComponent () {
        return (this.component.routes.length) ? 'app-link' : 'div'
      },
      toRoute () {
        if (this.component.routes.length) return this.component.routes[0].route
        return null
      },
      cardClass() {
        return {
          'article-card column': true,
          'is-10-mobile is-6-tablet is-4-desktop is-3-fullhd': this.type !== 'column',
          'is-12 has-text-centered-mobile': this.type === 'column'
        };
      }
    }
  }
</script>

<style lang="sass">
  @import ~bulma/sass/utilities/mixins
  .article-card
    .card
      width: 100%
      .card-image
        position: relative
        display: inline-block
        overflow: hidden
        width: 100%
        .square-space
          display: block
          width: 100%
        .article-image
          position: absolute
          top: 0
          left: 0
          width: 100%
          height: 100%
    &.is-12
      .card
        max-width: 250px
        +desktop
          max-width: 350px
  /*.card-image*/
    /*height: 100px*/
    /*.image,*/
    /*.image-loader .image-placeholder,*/
    /*.image-small*/
      /*width: 100%*/
      /*min-height: 50px*/
</style>
