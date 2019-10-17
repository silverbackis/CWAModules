<template>
  <div :class="{ field: !input.hidden && inputType !== 'hidden' }">
    <component
      v-if="input.vars.expanded || (!input.children || !input.children.length)"
      :is="inputComponent"
      :form-id="formId"
      :input-name="inputName"
      :wrapped="wrapped"
      :input-type="inputType"
      :parents="parents"
    />
    <form-input
      v-if="!input.vars.expanded"
      v-for="(child, index) of input.children"
      :key="index"
      :input="child"
      :wrapped="wrapped"
      :form-id="formId"
      :disable-validation="disableValidation"
      :css-framework="cssFramework"
      :parents="[input, ...parents]"
    />
  </div>
</template>

<script>
import { name as FORMS_MODULE } from '~/.nuxt/bwstarter/core/storage/form'

export default {
  name: 'form-input',
  props: {
    input: {
      type: Object,
      required: true
    },
    wrapped: {
      type: Boolean,
      default: true
    },
    formId: {
      type: String,
      required: true
    },
    disableValidation: {
      type: Boolean,
      default: false
    },
    cssFramework: {
      type: String,
      default: 'bulma'
    },
    parents: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      availableComponents: [
        'simple',
        'textarea',
        'choice',
        'button',
        'checkbox'
      ],
      inputComponent: null
    }
  },
  computed: {
    inputComponentDir() {
      return this.wrapped ? this.cssFramework : ''
    },
    inputName() {
      return this.input.vars.full_name
    }
  },
  methods: {
    isInputType(InputType) {
      return this.availableComponents.indexOf(InputType) !== -1
    },
    toPascalCase(str) {
      return str
        .split('_')
        .map(function(item) {
          return item.charAt(0).toUpperCase() + item.substring(1)
        })
        .join('')
    },
    resolveInputComponent() {
      let inputComponentType = this.availableComponents[0]
      for (let bp of this.input.vars.block_prefixes) {
        if (this.isInputType(bp)) {
          inputComponentType = bp
        }
        if (bp !== this.input.vars.unique_block_prefix) {
          this.inputType = bp
        }
      }
      this.inputComponent = () => ({
        component: import('~/.nuxt/bwstarter/' +
          this.inputComponentDir +
          '/components/Form/Input/' +
          this.toPascalCase(inputComponentType) +
          '.vue')
      })
    }
  },
  created() {
    let args = {
      formId: this.formId,
      inputVars: this.input.vars,
      children: this.input.children,
      disableValidation: this.disableValidation
    }
    this.$bwstarter.$storage.commit('initInput', args, FORMS_MODULE)
    this.resolveInputComponent()
  }
}
</script>
