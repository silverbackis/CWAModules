<template>
  <component-wrapper :nested="nested">
    <div :class="containerClass">
      <div class="collection-columns columns is-mobile is-multiline">
        <slot name="title">
          <div v-if="component.title" class="column is-12">
            <h4 class="is-size-4">{{ component.title }}</h4>
            <hr />
          </div>
        </slot>
        <div
          v-if="!component.collection['hydra:member'].length"
          class="column is-12"
        >
          <h4 class="subtitle is-size-5 has-text-grey has-text-centered">
            There are no items to display
          </h4>
        </div>
        <div v-else class="column is-12">
          <div
            :class="[
              'columns is-multiline is-mobile item-columns',
              { 'is-loading': reloading, 'is-centered': isCentered }
            ]"
          >
            <component
              :is="itemComponent"
              v-for="item in collectionItems"
              :key="item['@id']"
              :component="getEntity(item)"
              :disabled-admin="disabledAdmin"
              @deleted="reloadCollection"
            />
          </div>
        </div>
      </div>
      <collection-pagination
        :pagination-data="paginationData"
        :disabled-pagination="disabledPagination"
        :page="page"
        @goToPage="goToPage"
        @goToPageLabel="goToPageLabel"
      />
      <collection-admin
        v-bind="collectionAdminProps"
        @reload="reloadCollection"
      />
    </div>
  </component-wrapper>
</template>

<script>
import { mapGetters } from 'vuex'
import CollectionPagination from './CollectionPagination'
import CollectionAdmin from './CollectionAdmin'
import { name as entitiesModuleName } from '~/.nuxt/bwstarter/core/storage/entities'
import ComponentMixin from '~/.nuxt/bwstarter/bulma/components/componentMixin'

export default {
  components: {
    CollectionPagination,
    CollectionAdmin
  },
  mixins: [ComponentMixin],
  props: {
    isCentered: {
      type: Boolean,
      default: false
    },
    disabledPagination: {
      type: Boolean,
      default: false
    },
    disabledAdmin: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      itemComponent: null,
      reloading: false,
      adding: false,
      page: 1
    }
  },
  computed: {
    ...mapGetters({
      getContentById: 'bwstarter/getContentById'
    }),
    paginationData() {
      const parseURL = url => {
        if (!url) {
          return null
        }
        const query = ' ' + url.split('?')[1]
        const page = query.split('page=')[1]
        return page.split('&')[0] / 1
      }
      const hydraView = this.component.collection['hydra:view']
      const keys = ['first', 'last', 'next', 'previous']
      const data = {
        totalItems: this.component.collection['hydra:totalItems']
      }
      for (const key of keys) {
        data[key] = hydraView ? parseURL(hydraView[`hydra:${key}`]) : null
      }
      return data
    },
    collectionItems() {
      return this.component.collection['hydra:member'].filter(
        item => !!this.getEntity(item)
      )
    },
    collectionAdminProps() {
      return {
        'disabled-admin': this.disabledAdmin,
        adding: this.adding,
        'add-item-route': this.component.collectionRoutes.post,
        'current-page': this.page,
        context: `/contexts/${this.component.resource.split('\\').pop()}`
      }
    }
  },
  created() {
    this.resolveItemComponent()
  },
  methods: {
    goToPageLabel(pageNumber) {
      return (this.page === pageNumber ? 'Page ' : 'Go to page ') + pageNumber
    },
    async goToPage(pageNumber) {
      this.page = pageNumber
      await this.reloadCollection()
    },
    resolveItemComponent() {
      const resourceParts = this.component.resource.split('\\')
      this.itemComponent = () => ({
        component: import('./Item/' + resourceParts[resourceParts.length - 1])
      })
    },
    reloadCollection() {
      if (!this.reloading) {
        this.reloading = true
        this.$axios
          .get(`${this.component.collectionRoutes.get}?page=${this.page}`, {
            progress: false
          })
          .then(({ data }) => {
            const members = data['hydra:member'].map(item => {
              this.$bwstarter.$storage.commit(
                'setEntity',
                [{ id: item['@id'], data: item }],
                entitiesModuleName
              )
              return item['@id']
            })
            this.$bwstarter.$storage.commit(
              'setEntity',
              [
                {
                  id: this.component['@id'],
                  data: Object.assign({}, this.component, {
                    collection: Object.assign({}, data, {
                      'hydra:member': members
                    })
                  })
                }
              ],
              entitiesModuleName
            )
            this.reloading = false
          })
          .catch(error => {
            this.reloading = false
            // eslint-disable-next-line no-console
            console.error('updateContentComponents Error', error)
          })
      }
    }
  }
}
</script>

<style lang="sass">
@import "~bulma/sass/utilities/mixins"
.collection-columns
  hr
    margin: .3rem 0 1.5rem 0
  +mobile
    justify-content: center
  .justify-content-center:not(.is-multiline)
    justify-content: center
  .item-columns
    &.is-loading
      opacity: .5
  + .pagination
    margin-top: .5rem
    margin-bottom: 2rem
    &.is-loading
      opacity: .5
</style>
