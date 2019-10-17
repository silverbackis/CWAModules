<template>
  <component-wrapper
    :class-name="['feature-horizontal', className]"
    :extend-class="false"
    :nested="nested"
  >
    <div class="container has-text-centered">
      <h3
        v-if="component.title"
        class="subtitle features-title"
        v-html="component.title"
      />
      <nav
        v-for="(components, index) in childComponents"
        :key="'feature-columns-cc-' + index"
        class="columns"
      >
        <feature-column-item
          v-for="feature in components"
          :key="feature['@id']"
          :component="feature"
        />
      </nav>
    </div>
  </component-wrapper>
</template>

<script>
import FeatureColumnItem from './FeatureColumnItem'
import ComponentMixin from '~/.nuxt/bwstarter/bulma/components/componentMixin'

export default {
  components: {
    FeatureColumnItem
  },
  mixins: [ComponentMixin],
  data() {
    return {
      imageClass: 'image feature-columns-item'
    }
  },
  computed: {
    className() {
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
