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
      v-for="item in collectionItems"
      :key="item['@id']"
      class="columns is-mobile is-centered"
      :class="containerClass"
    >
      <component
        :is="itemComponent"
        v-if="getEntity(item)"
        :key="item['@id']"
        :component="getEntity(item)"
        type="column"
      />
    </div>
  </component-wrapper>
</template>

<script>
import { mapGetters } from 'vuex'
import ComponentWrapper from '../ComponentWrapper'
import ComponentMixin from '~/.nuxt/bwstarter/bulma/components/componentMixin'

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
    }),
    collectionItems() {
      return this.component.collection['hydra:member'].filter(
        item => !!this.getEntity(item)
      )
    }
  },
  created() {
    this.resolveItemComponent()
  },
  methods: {
    resolveItemComponent() {
      const resourceParts = this.component.resource.split('\\')
      this.itemComponent = () => ({
        component: import('./Item/' + resourceParts[resourceParts.length - 1])
      })
    }
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
