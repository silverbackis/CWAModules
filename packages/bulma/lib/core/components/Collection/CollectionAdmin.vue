<template>
  <div v-if="!disabledAdmin && $bwstarter.isAdmin">
    <button
      class="button is-primary is-fullwidth"
      :class="{ 'is-loading': adding || isLoading }"
      @click="addToCollection"
    >
      <span class="icon is-small">
        <font-awesome-icon icon="plus" />
      </span>
      <span>Add New</span>
    </button>
    <div class="reload-link-row has-text-centered">
      <a
        class="reload-link has-text-grey-light"
        @click.prevent="reloadCollection"
        >reload collection</a
      >
    </div>
    <modal
      v-if="modalComponent && newComponentData"
      :active="modalActive"
      @close="modalActive = false"
    >
      <component :is="modalComponent" :component="newComponentData" />
      <button
        class="button is-primary is-fullwidth"
        :class="{ 'is-loading': adding || isLoading }"
        @click="addCollectionItem"
      >
        <span class="icon is-small">
          <font-awesome-icon icon="plus" />
        </span>
        <span>Add New</span>
      </button>
    </modal>
  </div>
</template>

<script>
import Modal from '../Modal'
import { name as adminModuleName } from '~/.nuxt/bwstarter/core/storage/admin'

export default {
  components: { Modal },
  props: {
    disabledAdmin: {
      type: Boolean,
      required: true
    },
    isLoading: {
      type: Boolean,
      required: false,
      default: false
    },
    modalComponent: {
      type: Function,
      required: false,
      default: null
    },
    addCollectionItemFn: {
      type: Function,
      required: false,
      default: null
    },
    addItemRoute: {
      type: String,
      required: false,
      default: null
    },
    currentPage: {
      type: Number,
      required: false,
      default: null
    },
    context: {
      type: String,
      required: false,
      default: null
    }
  },
  data() {
    return {
      modalActive: false,
      adding: false,
      newComponentData: null,
      errors: null,
      modalErrors: null
    }
  },
  watch: {
    adding(isAdding) {
      this.$emit('adding', isAdding)
    }
  },
  async created() {
    const { data } = await this.$axios.get(`${this.context}`)
    const context = data['@context']
    this.newComponentData = Object.keys(context).reduce(
      function(newComponent, key) {
        if (
          Object.prototype.hasOwnProperty.call(context, key) &&
          key.substr(0, 1) !== '@' &&
          key !== 'hydra'
        ) {
          if (typeof context[key] === 'string') {
            newComponent[key] = ''
          } else if (Array.isArray(context[key])) {
            newComponent[key] = []
          } else {
            newComponent[key] = {}
          }
        }
        return newComponent
      },
      { '@id': `${this.context}/new` }
    )
  },
  methods: {
    addToCollection(evt) {
      if (this.modalComponent) {
        this.modalActive = true
      } else {
        return this.addCollectionItem(evt)
      }
    },
    reloadCollection(evt) {
      this.$emit('reload', evt)
    },
    addCollectionItem(evt) {
      const isModal = this.modalActive
      this.$emit('addCollectionItem', evt)
      if (this.addCollectionItemFn) {
        return this.addCollectionItemFn()
      }
      const resourceInputs = this.$bwstarter.$storage.getState(adminModuleName)
        .endpoints[this.newComponentData['@id']].inputs
      const resourceData = Object.keys(resourceInputs).reduce((obj, key) => {
        obj[key] = resourceInputs[key].model
        return obj
      }, {})
      if (!this.adding) {
        this.adding = true
        this.$axios
          .post(this.addItemRoute, resourceData, { progress: false })
          .then(() => {
            this.adding = false
            this.page = 1
            this.reloadCollection()
          })
          .catch(error => {
            this.adding = false
            // eslint-disable-next-line no-console
            console.error(error.response)
          })
      }
    }
  }
}
</script>
