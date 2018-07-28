<template>
  <div class="section column-collection">
    <h4 class="is-size-4" v-if="component.title">{{ component.title }}</h4>
    <hr v-if="component.title" />
    <div class="columns is-mobile is-centered"
         :class="containerClass"
         v-for="item in component.collection">
      <component :is="itemComponent"
                 v-if="getEntity(item)"
                 :component="getEntity(item)"
                 :key="item['@id']"
                 type="column"
      />
    </div>
  </div>
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
        getContentById: 'bwstarter/getContentById'
      })
    },
    methods: {
      resolveItemComponent () {
        let resourceParts = this.component.resource.split('\\')
        this.itemComponent = () => ({
          component: import('./Item/' + resourceParts[resourceParts.length - 1])
        })
      }
    },
    created () {
      this.resolveItemComponent()
    }
  }
</script>

<style lang="sass">
  @import "~assets/css/vars"

  .column-collection
    background: $grey-lightest
    padding: 1.5rem
    hr
      margin: .3rem 0 1.5rem 0
</style>
