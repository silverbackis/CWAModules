<template>
  <div>
    <form-input
      v-for="(child, index) of collectionChildren"
      :key="index"
      :input="child"
      :wrapped="true"
      :form-id="formId"
      :disable-validation="disableValidation"
      :css-framework="'bulma'"
      :parents="[input, ...parents]"
    />
    <div>
      <button @click="addPrototype" class="button" type="button">Add X</button>
    </div>
  </div>
</template>

<script>
import _cloneDeep from 'lodash/cloneDeep'
import FormInput from '../FormInput'
import InputCommonMixin from './_CommonMixin'
import InputMixin from './Mixin'

export default {
  components: { FormInput },
  mixins: [InputCommonMixin, InputMixin],
  data() {
    return {
      events: {
        blur: this.inputBlur,
        'keypress.enter': this.inputBlur
      },
      collectionChildren: []
    }
  },
  computed: {
    prototypeChildren() {
      return this.input.children[0].children
    }
  },
  methods: {
    addPrototype() {
      const currentCount = this.collectionChildren.length
      const newChildren = [...this.prototypeChildren].map(item => {
        const newItem = _cloneDeep(item)
        newItem.vars.full_name = newItem.vars.full_name.replace(
          '__name__',
          currentCount
        )
        return newItem
      })
      this.collectionChildren.push(
        Object.assign({}, this.input.children[0], { children: newChildren })
      )
    }
  }
}
</script>
