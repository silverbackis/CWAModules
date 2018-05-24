<template>
  <component-wrapper :nested="nested">
    <div :class="containerClass">
      <div class="collection-columns columns is-mobile is-multiline">
        <div class="column is-12" v-if="component.title">
          <h4 class="is-size-4">{{ component.title }}</h4>
          <hr />
        </div>
        <component :is="itemComponent"
                   v-for="item in component.collection"
                   v-if="getComponentObject(item) instanceof Object"
                   :component="getComponentObject(item)"
                   :key="item['@id']"
        />
      </div>
    </div>
  </component-wrapper>
</template>

<script>
  import { mapGetters } from 'vuex'
  import ComponentMixin from '~/.nuxt/bwstarter/bulma/components/componentMixin'

  export default {
    mixins: [ComponentMixin],
    data () {
      return {
        itemComponent: null
      }
    },
    computed: {
      ...mapGetters({
        getStoreComponent: 'bwstarter/components/getComponent',
        getContentById: 'bwstarter/getContentById'
      })
    },
    methods: {
      resolveItemComponent () {
        let resourceParts = this.component.resource.split('\\')
        this.itemComponent = () => ({
          component: import('./Item/' + resourceParts[resourceParts.length - 1])
        })
      },
      getComponentObject (item) {
        if (item instanceof Object) {
          return item
        }
        return this.getStoreComponent(item)
      }
    },
    created () {
      this.resolveItemComponent()
    }
  }
</script>

<style lang="sass">
  @import ~bulma/sass/utilities/mixins
  .collection-columns
    hr
      margin: .3rem 0 1.5rem 0
    +mobile
      justify-content: center
</style>
