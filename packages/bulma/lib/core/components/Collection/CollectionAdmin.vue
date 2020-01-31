<template>
  <div v-if="!disabledAdmin && $bwstarter.isAdmin">
    <input-errors
      v-if="!modalComponent"
      :errors="errors"
      :component-id="componentId"
    />
    <button
      :class="{ 'is-loading': adding || isLoading }"
      @click="addToCollection"
      class="button is-primary is-fullwidth"
    >
      <span class="icon is-small">
        <font-awesome-icon icon="plus" />
      </span>
      <span>Add New</span>
    </button>
    <div class="reload-link-row has-text-centered">
      <a
        @click.prevent="reloadCollection"
        class="reload-link has-text-grey-light"
        >reload collection</a
      >
    </div>
    <modal
      v-if="modalComponent && newComponentData"
      :active="modalActive"
      @close="modalActive = false"
    >
      <component
        v-if="renderModalComponent"
        :is="modalComponent"
        :component="newComponentData"
      />
      <button
        :class="{ 'is-loading': adding || isLoading }"
        @click="addCollectionItem"
        class="button is-primary is-fullwidth"
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
    },
    query: {
      type: String,
      required: false,
      default: null
    },
    defaultComponentData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      modalActive: false,
      adding: false,
      newComponentData: null,
      originalComponentData: null,
      renderModalComponent: true
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
    const classLabel = this.context.split('contexts/')[1]
    const { data: contextData } = await this.$axios.get(`${this.context}`)
    const { data: docsData } = await this.$axios.get(`docs.jsonld`)
    const context = Object.keys(contextData['@context'])
    const docsProperties = docsData['hydra:supportedClass'].find(
      item => classLabel === item['hydra:title']
    )['hydra:supportedProperty']
    const newComponentData = context.reduce(
      function(newComponent, key) {
        const propMeta = docsProperties.find(
          prop => prop['hydra:title'] === key
        )
        if (
          context.indexOf(key) !== -1 &&
          key.substr(0, 1) !== '@' &&
          key !== 'hydra'
        ) {
          const hydraProp = propMeta['hydra:property']
          const range = hydraProp.range
          const type = range ? range.split('xmls:')[1] : null
          if (['string', 'dateTime'].indexOf(type) !== -1) {
            newComponent[key] = ''
          } else if (type === 'integer') {
            newComponent[key] = 0
          } else if (hydraProp['owl:maxCardinality'] === 1) {
            newComponent[key] = {}
          } else {
            newComponent[key] = []
          }
        }
        return newComponent
      },
      { '@id': this.componentId }
    )
    this.newComponentData = Object.assign(
      {},
      newComponentData,
      this.defaultComponentData
    )
    this.originalComponentData = Object.assign({}, this.newComponentData)
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
    componentAddedListener() {
      this.adding = false
      this.modalActive = false
      this.newComponentData = this.originalComponentData
      this.renderModalComponent = false
      this.$nextTick(() => {
        this.renderModalComponent = true
      })
    },
    addCollectionItem(evt) {
      this.$emit('addCollectionItem', evt)
      if (this.addCollectionItemFn) {
        this.addCollectionItemFn().then(res => {
          this.componentAddedListener()
          return res
        })
      }
      const endpointData = this.$bwstarter.$storage.getState(adminModuleName)
        .endpoints[this.componentId]
      let resourceData = this.defaultComponentData
      if (endpointData) {
        const resourceInputs = endpointData.inputs
        resourceData = Object.keys(resourceInputs).reduce((obj, key) => {
          obj[key] = resourceInputs[key].model
          return obj
        }, resourceData)
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
            this.page = 1
            this.reloadCollection()
            this.componentAddedListener()
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
