<template>
  <component-wrapper
    :class-name="[
      'section',
      'feature-list',
      className,
      { 'is-admin': $bwstarter.isAdmin, 'is-loading': reloading }
    ]"
    :extend-class="false"
    :nested="nested"
  >
    <div class="container has-text-centered">
      <h3
        v-if="component.title"
        class="subtitle features-title"
        v-html="component.title"
      ></h3>
      <div class="is-inline-block-mobile">
        <div class="columns is-centered has-text-left">
          <div
            v-for="(features, index) in featureChunks"
            :key="'fc-' + index"
            class="column is-narrow"
          >
            <ul class="fa-ul">
              <feature-text-list-item
                v-for="feature in features"
                :key="feature['@id']"
                :component="feature"
                :class="injectDynamicData(feature.className)"
                @edit="setEditComponent"
              />
            </ul>
          </div>
        </div>
        <feature-text-list-admin
          v-if="$bwstarter.isAdmin"
          @add="addNew"
          @reload="reload"
        />
      </div>
    </div>
    <feature-text-list-modal
      :component-id="editComponent ? editComponent['@id'] : null"
      @close="closeEditModal"
      @deleted="reload"
    />
  </component-wrapper>
</template>

<script>
import _ from 'lodash'
import FeatureTextListItem from './FeatureTextListItem'
import FeatureTextListModal from './FeatureTextListModal'
import FeatureTextListAdmin from './FeatureTextListAdmin'
import ComponentMixin from '~/.nuxt/bwstarter/bulma/components/componentMixin'

export default {
  components: {
    FeatureTextListItem,
    FeatureTextListModal,
    FeatureTextListAdmin
  },
  mixins: [ComponentMixin],
  data() {
    return {
      editComponent: null,
      reloading: false
    }
  },
  computed: {
    className() {
      return this.injectDynamicData(this.component.className) || ''
    },
    componentGroup() {
      return this.component.componentGroups[0]
    },
    featureChunks() {
      if (!this.childComponents.length) {
        return []
      }
      return _.chunk(
        this.childComponents[0],
        Math.ceil(
          this.childComponents[0].length / (this.component.columns || 1)
        )
      )
    }
  },
  methods: {
    setEditComponent(editComponent) {
      this.editComponent = editComponent
    },
    closeEditModal() {
      this.editComponent = null
    },
    reload() {
      if (!this.reloading) {
        this.reloading = true
        this.$bwstarter
          .fetchContent(this.componentGroup)
          .then(componentLocations => {
            this.initAdminInputLocations(componentLocations, true)
            this.reloading = false
          })
          .catch(error => {
            this.reloading = false
            // eslint-disable-next-line no-console
            console.error('updateContentComponents Error', error)
          })
      }
    },
    addNew() {
      if (!this.reloading) {
        this.reloading = true
        this.$axios
          .post(
            '/feature_text_list_items',
            {
              title: 'New Feature',
              parentComponentGroup: this.componentGroup
            },
            { progress: false }
          )
          .then(() => {
            this.reloading = false
            this.reload()
          })
          .catch(error => {
            this.reloading = false
            // eslint-disable-next-line no-console
            console.error(error)
          })
      }
    }
  }
}
</script>

<style lang="sass">
@import "~bulma/sass/utilities/mixins"
.feature-list
  &.is-loading
    opacity: .5
  +mobile
    .column
      padding-top: 0
      padding-bottom: 0
</style>
