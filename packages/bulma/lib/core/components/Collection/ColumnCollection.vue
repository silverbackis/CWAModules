<template>
  <component-wrapper :nested="nested" class="column-collection">
    <slot name="title">
      <template v-if="component.title">
        <h4
          class="subtitle has-text-primary has-text-weight-normal is-marginless"
        >
          {{ component.title }}
        </h4>
        <hr />
      </template>
    </slot>
    <div
      class="columns is-mobile is-centered"
      :class="containerClass"
      v-for="item in component.collection['hydra:member']"
    >
      <component
        :is="itemComponent"
        v-if="getEntity(item)"
        :component="getEntity(item)"
        :key="item['@id']"
        type="column"
      />
    </div>
  </component-wrapper>
</template>

<script>
import { mapGetters } from 'vuex'
import ComponentMixin from '~/.nuxt/bwstarter/bulma/components/componentMixin'
import ComponentWrapper from '../ComponentWrapper'

export default {
  components: { ComponentWrapper },
  mixins: [ComponentMixin],
  data() {
    return {
      itemComponent: null
    }
  },
  computed: {
    ...mapGetters({
      getContentById: 'bwstarter/getContentById'
    })
  },
  methods: {
    resolveItemComponent() {
      let resourceParts = this.component.resource.split('\\')
      this.itemComponent = () => ({
        component: import('./Item/' + resourceParts[resourceParts.length - 1])
      })
    }
  },
  created() {
    this.resolveItemComponent()
  }
}
</script>

<style lang="sass">
@import "../../assets/css/vars"

.column-collection
  padding: 1.5rem 0
  hr
    margin: .3rem 0 1.5rem 0
</style>
