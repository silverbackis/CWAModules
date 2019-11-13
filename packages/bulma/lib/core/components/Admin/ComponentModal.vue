<template>
  <modal
    :active="active"
    :class="['component-modal', isLoading ? 'is-loading' : null]"
    @close="closeModal"
  >
    <h2 class="title">{{ component ? 'Modify' : 'Add' }} Component</h2>
    <div class="field">
      <label class="label">Component</label>
      <div class="control">
        <div class="select">
          <select v-model="componentType" :disabled="!!component">
            <option :value="null" disabled>Please select</option>
            <option
              v-for="(name, index) of availableComponents"
              :key="`${name}-${index}`"
              :value="name"
            >
              {{ name }}
            </option>
          </select>
        </div>
      </div>
    </div>
    <div class="field">
      <label class="label">Custom UI component</label>
      <div class="control">
        <input v-model="componentName" class="input" type="text" />
      </div>
    </div>
    <div class="field">
      <label class="label">Class name(s)</label>
      <div class="control">
        <input v-model="componentClassNames" class="input" type="text" />
      </div>
    </div>
    <div v-if="!!component" class="field location-move-container">
      <div class="button-group">
        <button class="button is-secondary" @click="moveLocation(-1)">
          Move Up
        </button>
        <button class="button is-secondary" @click="moveLocation(+1)">
          Move Down
        </button>
      </div>
    </div>
    <div class="field">
      <div class="control">
        <button class="button is-primary" :disabled="!endpoint" @click="submit">
          Submit
        </button>
      </div>
    </div>
    <ul v-if="errors" class="help is-danger">
      <li v-for="(error, errorIndex) in errors" :key="'error' + errorIndex">
        {{ error }}
      </li>
    </ul>
  </modal>
</template>

<script>
import componentsMixin from '../../components'
import Modal from '../Modal'
import { name as entitiesModuleName } from '~/.nuxt/bwstarter/core/storage/entities'

export default {
  components: { Modal },
  props: {
    active: {
      type: Boolean,
      required: true
    },
    component: {
      type: Object,
      required: false,
      default: null
    },
    page: {
      type: Object,
      required: false,
      default: null
    },
    location: {
      type: Object,
      required: false,
      default: null
    }
  },
  data() {
    return {
      components: Object.keys(componentsMixin.components),
      componentType: null,
      apiComponents: null,
      isLoading: false,
      componentName: null,
      componentClassNames: null,
      errors: null
    }
  },
  computed: {
    availableComponents() {
      if (!this.apiComponents) {
        return []
      }
      const apiComponentKeys = Object.keys(this.apiComponents)
      return this.components.filter(
        componentType => apiComponentKeys.indexOf(componentType) !== -1
      )
    },
    endpoint() {
      return this.apiComponents
        ? this.apiComponents[this.componentType] || null
        : null
    }
  },
  watch: {
    component: {
      handler(component) {
        if (component) {
          this.componentType = component['@type']
          this.componentName =
            component.componentName !== component['@type']
              ? component.componentName
              : null
          this.componentClassNames = component.className
        } else {
          this.componentType = null
          this.componentName = null
          this.componentClassNames = null
        }
      },
      deep: true,
      immediate: true
    },
    active: {
      async handler(isActive) {
        if (isActive && !this.apiComponents) {
          this.isLoading = true
          const { data: contexts } = await this.$axios.get('/index.jsonld', {
            progress: false
          })
          const camelContexts = Object.keys(contexts).reduce((obj, ctxKey) => {
            const newKey = ctxKey.charAt(0).toUpperCase() + ctxKey.slice(1)
            obj[newKey] = contexts[ctxKey]
            return obj
          }, {})

          const { data } = await this.$axios.get('/docs.jsonld', {
            progress: false
          })

          this.apiComponents = data['hydra:supportedClass'].reduce(
            (obj, cls) => {
              if (!cls['rdfs:label']) {
                return obj
              }
              obj[cls['rdfs:label']] = camelContexts[cls['rdfs:label']]
              return obj
            },
            {}
          )
          this.isLoading = false
        }
      }
    }
  },
  methods: {
    closeModal() {
      this.$emit('close')
    },
    async submit() {
      this.isLoading = true
      this.errors = null
      const componentData = {
        componentName: this.componentName,
        className: this.componentClassNames
      }
      try {
        if (this.component) {
          const { data } = await this.$axios.put(
            this.component['@id'],
            componentData
          )
          this.$bwstarter.$storage.commit(
            'setEntity',
            [{ id: this.component['@id'], data }],
            entitiesModuleName
          )
          this.closeModal()
        } else {
          try {
            const { data } = await this.$axios.post(this.endpoint, {
              location: {
                sort: this.location ? this.location.sort + 1 : 0,
                content: this.page['@id']
              },
              component: {
                componentData
              }
            })
            // eslint-disable-next-line no-console
            console.log(data)
          } catch (e) {
            this.errors = [
              'An error has occurred, please check developer logs.'
            ]
            // eslint-disable-next-line no-console
            console.error(e)
          }
        }
      } catch (e) {
        this.errors = [
          'There was an error. Please check the developer logs. This is not intended for use by a regular website admin. Please contact your web developers for more information or assistance.'
        ]
        // eslint-disable-next-line no-console
        console.error(e)
      }
      this.isLoading = false
    },
    moveLocation(moveBy) {
      this.$emit('moveLocation', {
        oldSort: this.location.sort,
        newSort: this.location.sort + moveBy
      })
    }
  }
}
</script>

<style lang="sass">
.component-modal
  &.is-loading
    .modal-content .card
      position: relative
      &:before
        content: ''
        position: absolute
        top: 0
        left: 0
        right: 0
        bottom: 0
        background: $grey
        z-index: 10
      &:after
        +loader
        position: absolute
        top: 50%
        left: 50%
        transform: translate(-50%, -50%)
        z-index: 11
</style>
