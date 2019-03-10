<template>
  <component-wrapper :className="['feature-horizontal', className]"
                     :extendClass="false"
                     :nested="nested"
  >
    <div class="container has-text-centered">
      <h3 class="subtitle features-title" v-if="component.title" v-html="component.title" />
      <nav class="columns"
           v-for="(components, index) in this.childComponents"
           :key="index"
      >
        <feature-column-item v-for="(feature, count) in components"
                             :component="feature"
                             :key="count"
        />
      </nav>
    </div>
  </component-wrapper>
</template>

<script>
  import ComponentMixin from '~/.nuxt/bwstarter/bulma/components/componentMixin'
  import FeatureColumnItem from './FeatureColumnItem'

  export default {
    mixins: [ ComponentMixin ],
    components: {
      FeatureColumnItem
    },
    data () {
      return {
        imageClass: 'image feature-columns-item'
      }
    },
    computed: {
      className () {
        return this.component.className || ''
      }
    }
  }
</script>

<style lang="sass">
  .feature-horizontal
    .features-title
      margin-bottom: 1.5rem
    .column
      margin-top: auto
</style>
