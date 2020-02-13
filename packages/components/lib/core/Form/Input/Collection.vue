<template>
  <div class="form-input-collection">
    <div
      v-for="(rootInput, rootIndex) of collectionChildren"
      :key="rootIndex"
      class="collection-item"
    >
      <div class="delete-row">
        <button
          @click="confirmDeleteChildItem(rootIndex)"
          class="button is-danger is-small"
          type="button"
        >
          {{ deleteTimeouts[rootIndex] ? 'Are you sure?' : 'Delete' }}
        </button>
      </div>
      <form-input
        v-for="(child, index) of rootInput.children"
        :key="rootIndex + '_' + index"
        :input="child"
        :wrapped="true"
        :form-id="formId"
        :disable-validation="disableValidation"
        :css-framework="'bulma'"
        :parents="[input, ...parents]"
      />
    </div>
    <div>
      <button
        @click="addPrototype"
        class="button add-collection-button"
        type="button"
      >
        Add {{ vars.label }}
      </button>
    </div>
  </div>
</template>

<script>
import _cloneDeep from 'lodash/cloneDeep'
import _size from 'lodash/size'
import FormInput from '../FormInput'
import InputCommonMixin from './_CommonMixin'
import InputMixin from './Mixin'
import { name as FORMS_MODULE } from '~/.nuxt/bwstarter/core/storage/form'

export default {
  components: { FormInput },
  mixins: [InputCommonMixin, InputMixin],
  data() {
    return {
      events: {
        blur: this.inputBlur,
        'keypress.enter': this.inputBlur
      },
      collectionChildren: {},
      deleteTimeouts: {}
    }
  },
  computed: {
    prototype() {
      return this.input.prototype
    },
    formChildren() {
      return this.input.children
    }
  },
  watch: {
    'input.children'(newChildren) {
      this.collectionChildren = _cloneDeep(newChildren)
    }
  },
  mounted() {
    this.collectionChildren = _cloneDeep(this.input.children)
  },
  methods: {
    addPrototype() {
      const currentCount = _size(this.input.children)
      const replaceVars = ({ vars }) => {
        const replaceKeys = ['full_name', 'id', 'label', 'name']
        for (const replaceKey of replaceKeys) {
          vars[replaceKey] = vars[replaceKey].replace('__name__', currentCount)
        }
      }
      const newChild = _cloneDeep(this.prototype)
      replaceVars(newChild)
      newChild.children = [...newChild.children].map(item => {
        replaceVars(item)
        return item
      })
      this.$set(this.collectionChildren, newChild.vars.full_name, newChild)
    },
    confirmDeleteChildItem(childName) {
      if (!this.deleteTimeouts[childName]) {
        this.$set(this.deleteTimeouts, childName, setTimeout(() => {
          this.$delete(this.deleteTimeouts, childName)
        }, 3000))
        return
      }
      this.$delete(this.deleteTimeouts, childName)
      this.deleteCollectionItem(childName)
    },
    deleteCollectionItem(childName) {
      this.$bwstarter.$storage.commit(
        'deleteCollectionChild',
        { formId: this.formId, inputName: this.inputName, childName },
        FORMS_MODULE
      )
    }
  }
}
</script>

<style lang="sass">
.form-input-collection
  .add-collection-button
    text-transform: capitalize
  .delete-row
    display: flex
    justify-content: flex-end
</style>
