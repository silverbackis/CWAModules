<template>
  <div v-if="!disabledAdmin && $bwstarter.isAdmin">
    <input-errors
      v-if="!modalComponent"
      :errors="errors"
      :component-id="componentId"
    />
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
      <input-errors :errors="errors" :component-id="componentId" />
    </modal>
  </div>
</template>

<script>
import Modal from '../Modal'
import { name as adminModuleName } from '~/.nuxt/bwstarter/core/storage/admin'
import InputErrors from '~/.nuxt/bwstarter/components/Admin/InputErrors'

export default {
  components: { Modal, InputErrors },
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
      newComponentData: null
    }
  },
  computed: {
    componentId() {
      return `${this.context}/new`
    },
    errors() {
      return this.$bwstarter.$storage.get(
        'getEndpointErrors',
        [this.componentId],
        adminModuleName
      )
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
      { '@id': this.componentId }
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
      this.$emit('addCollectionItem', evt)
      if (this.addCollectionItemFn) {
        return this.addCollectionItemFn()
      }
      const endpointData = this.$bwstarter.$storage.getState(adminModuleName)
        .endpoints[this.componentId]
      let resourceData
      if (!endpointData) {
        resourceData = {}
      } else {
        const resourceInputs = endpointData.inputs
        resourceData = Object.keys(resourceInputs).reduce((obj, key) => {
          obj[key] = resourceInputs[key].model
          return obj
        }, {})
      }
      if (!this.adding) {
        this.adding = true
        this.$bwstarter.$storage.commit(
          'resetEndpointErrors',
          this.componentId,
          adminModuleName
        )
        this.$axios
          .post(this.addItemRoute, resourceData, { progress: false })
          .then(() => {
            this.adding = false
            this.page = 1
            this.reloadCollection()
          })
          .catch(error => {
            this.adding = false
            this.$bwstarter.$storage.dispatch(
              'updateErrors',
              {
                response: error.response,
                endpoint: this.componentId
              },
              adminModuleName
            )
          })
      }
    }
  }
}
</script>
