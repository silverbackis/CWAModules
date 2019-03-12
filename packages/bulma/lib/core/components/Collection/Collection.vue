<template>
  <component-wrapper :nested="nested">
    <div :class="containerClass">
      <div class="collection-columns columns is-mobile is-multiline">
        <slot name="title">
          <div class="column is-12" v-if="component.title">
            <h4 class="is-size-4">{{ component.title }}</h4>
            <hr/>
          </div>
        </slot>
        <div v-if="!component.collection['hydra:member'].length" class="column is-12">
          <h4 class="subtitle is-size-5 has-text-grey has-text-centered">There are no items to display</h4>
        </div>
        <div v-else class="column is-12">
          <div :class="['columns is-multiline is-mobile item-columns', {'is-loading': reloading, 'is-centered': isCentered}]">
            <component :is="itemComponent"
                       v-for="item in component.collection['hydra:member']"
                       v-if="getEntity(item)"
                       :component="getEntity(item)"
                       :key="item['@id']"
                       :disabled-admin="disabledAdmin"
                       @deleted="reloadCollection"
            />
          </div>
        </div>
      </div>
      <nav v-if="!disabledPagination && paginationData.last > 1"  :class="['pagination is-rounded', { 'is-loading': reloading }]" role="navigation" aria-label="pagination">
        <a class="pagination-previous" :disabled="!paginationData.previous || page === paginationData.previous" @click="goToPage(paginationData.previous)">Previous</a>
        <a class="pagination-next" :disabled="!paginationData.next || page === paginationData.next" @click="goToPage(paginationData.next)">Next</a>
        <ul class="pagination-list">
          <li v-if="page !== paginationData.first"><a class="pagination-link" :aria-label="goToPageLabel(paginationData.first)" @click="goToPage(paginationData.first)">{{ paginationData.first }}</a></li>

          <template v-if="paginationData.previous && paginationData.previous !== paginationData.first">
            <li><span class="pagination-ellipsis">&hellip;</span></li>
            <li><a class="pagination-link" :aria-label="goToPageLabel(paginationData.previous)">{{ paginationData.previous }}</a></li>
          </template>

          <li><a class="pagination-link is-current" :aria-label="goToPageLabel(page)" aria-current="page">{{ page }}</a></li>

          <template v-if="paginationData.next && paginationData.next !== paginationData.last">
            <li><a class="pagination-link" :aria-label="goToPageLabel(paginationData.next)">{{ paginationData.next }}</a></li>
            <li><span class="pagination-ellipsis">&hellip;</span></li>
          </template>

          <li v-if="page !== paginationData.last"><a class="pagination-link" :aria-label="goToPageLabel(paginationData.last)" @click="goToPage(paginationData.last)">{{ paginationData.last }}</a></li>
        </ul>
      </nav>

      <div v-if="!disabledAdmin && $bwstarter.isAdmin">
        <button class="button is-primary is-fullwidth" :class="{'is-loading': adding}" @click="addCollectionItem">
        <span class="icon is-small">
          <font-awesome-icon icon="plus"/>
        </span>
          <span>Add New</span>
        </button>
        <div class="reload-link-row has-text-centered">
          <a @click.prevent="reloadCollection" class="reload-link has-text-grey-light">reload collection</a>
        </div>
      </div>
    </div>
  </component-wrapper>
</template>

<script>
import { name as entitiesModuleName } from '~/.nuxt/bwstarter/core/storage/entities'
import { mapGetters } from 'vuex'
import ComponentMixin from '~/.nuxt/bwstarter/bulma/components/componentMixin'

export default {
  mixins: [ ComponentMixin ],
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
  data () {
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
    paginationData () {
      const parseURL = (url) => {
        if (!url) {
          return null
        }
        const query = ' ' + url.split('?')[1]
        const page = query.split('page=')[1]
        return page.split('&')[0] / 1
      }
      const hydraView = this.component.collection['hydra:view']
      const keys = ['first', 'last', 'next', 'previous']
      let data = {
        totalItems: this.component.collection['hydra:totalItems']
      }
      for (const key of keys) {
        data[key] = hydraView ? parseURL(hydraView[`hydra:${key}`]) : null
      }
      return data
    }
  },
  methods: {
    goToPageLabel (pageNumber) {
      return (this.page === pageNumber ? 'Page ' : 'Go to page ') + pageNumber
    },
    async goToPage (pageNumber) {
      this.page = pageNumber
      await this.reloadCollection()
    },
    resolveItemComponent () {
      let resourceParts = this.component.resource.split('\\')
      this.itemComponent = () => ({
        component: import('./Item/' + resourceParts[ resourceParts.length - 1 ])
      })
    },
    reloadCollection () {
      if (!this.reloading) {
        this.reloading = true
        this.$axios.get(`${this.component.collectionRoutes.get}?page=${this.page}`, { progress: false })
          .then(({ data }) => {
            const members = data['hydra:member'].map((item) => {
              this.$bwstarter.$storage.commit('setEntity', [ { id: item[ '@id' ], data: item } ], entitiesModuleName)
              return item['@id']
            })
            this.$bwstarter.$storage.commit(
              'setEntity', [
                {
                  id: this.component['@id'],
                  data: Object.assign(
                    {},
                    this.component,
                    {
                      collection: Object.assign({}, data, {'hydra:member': members})
                    }
                  )
                }
              ], entitiesModuleName)
            this.reloading = false
          })
          .catch((error) => {
            this.reloading = false
            console.error('updateContentComponents Error', error)
          })
      }
    },
    addCollectionItem () {
      if (!this.adding) {
        this.adding = true
        this.$axios.post(this.component.collectionRoutes.post, {}, { progress: false })
          .then(() => {
            this.adding = false
            this.page = 1
            this.reloadCollection()
          })
          .catch((error) => {
            this.adding = false
            console.error(error)
          })
      }
    }
  },
  created () {
    this.resolveItemComponent()
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
