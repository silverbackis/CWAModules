<template>
  <component-wrapper :nested="nested">
    <div
      v-for="(components, index) in childComponents"
      :key="'feature-stacked-cc-' + index"
      :class="containerClass"
    >
      <feature-stacked-item
        v-for="(feature, count) in components"
        :key="feature['@id']"
        :component="feature"
        :class="columnsClass(count)"
      />
    </div>
  </component-wrapper>
</template>

<script>
import FeatureStackedItem from './FeatureStackedItem'
import ComponentMixin from '~/.nuxt/bwstarter/bulma/components/componentMixin'

export default {
  components: {
    FeatureStackedItem
  },
  mixins: [ComponentMixin],
  methods: {
    columnsClass(count) {
      const useCount = this.component.reverse ? count : count + 1
      return {
        'feature-media': true,
        columns: true,
        reversed: useCount % 2 === 0
      }
    }
  }
}
</script>

<style lang="sass">
@import "~bulma/sass/utilities/mixins"

.columns.reversed
  flex-direction: row-reverse

.feature-media + .feature-media
  padding-top: 1.5rem
  margin-top: 1.5rem
  border-top: 1px solid rgba($grey-lighter, .5)
</style>
