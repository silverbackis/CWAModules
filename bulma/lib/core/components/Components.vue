<template>
  <div class="bulma-components" v-if="_components">
    <component v-for="component in _components"
               :is="name(component)"
               :key="component.id"
               :component="getComponent(component['@id'])"
               :nested="nested"
               :depth="depth"
               :dynamicData="dynamicData"
    />
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import _ from 'lodash'

  export default {
    props: {
      pageData: {
        type: Object,
        required: true
      },
      depth: {
        type: Number,
        required: true
      },
      nested: {
        type: Boolean,
        required: true
      }
    },
    components: {
      BulmaHero: () => import('./Hero/Hero.vue'),
      BulmaContent: () => import('./Content/Content.vue'),
      BulmaTabs: () => import('./Nav/Tabs/Tabs.vue'),
      BulmaMenu: () => import('./Nav/Menu/Menu.vue'),
      BulmaForm: () => import('./Form/Form.vue'),
      BulmaFeatureColumns: () => import('./Feature/Columns/FeatureColumns.vue'),
      BulmaFeatureStacked: () => import('./Feature/Stacked/FeatureStacked.vue'),
      BulmaFeatureTextList: () => import('./Feature/TextList/FeatureTextList.vue'),
      BulmaGallery: () => import('./Gallery/Gallery.vue'),
      BulmaCollection: () => import('./Collection/Collection.vue')
    },
    methods: {
      name (component) {
        return 'bulma-' + component['@type']
      }
    },
    computed: {
      ...mapGetters({
        getComponent: 'bwstarter/components/getComponent'
      }),
      _components () {
        return this.pageData.componentLocations.map(loc => loc.component)
      },
      dynamicData () {
        return _.omit(this.pageData, ['@id', '@type', 'componentLocations', 'parent', 'layout'])
      }
    }
  }
</script>
