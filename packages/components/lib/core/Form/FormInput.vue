<template>
  <component :is="inputComponent"
             :formId="formId"
             :inputName="inputName"
             :wrapped="wrapped"
             :inputType="inputType"
  />
</template>

<script>
  import { name as FORMS_MODULE } from '~/.nuxt/bwstarter/core/storage/form'
  export default {
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
      }
    },
    data () {
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
      inputComponentDir () {
        return this.wrapped ? this.cssFramework : ''
      },
      inputName () {
        return this.input.vars.full_name
      }
    },
    methods: {
      isInputType (InputType) {
        return this.availableComponents.indexOf(InputType) !== -1
      },
      toPascalCase (str) {
        return str.split('_').map(function (item) {
          return item.charAt(0).toUpperCase() + item.substring(1)
        }).join('')
      },
      resolveInputComponent () {
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
          component: import('~/.nuxt/bwstarter/' + this.inputComponentDir + '/components/Form/Input/' + this.toPascalCase(inputComponentType) + '.vue')
        })
      }
    },
    created () {
      let args = {
        formId: this.formId,
        inputVars: this.input.vars,
        children: this.input.children,
        disableValidation: this.disableValidation
      }
      this.$bwstarter.$storage.dispatch('initInput', args, FORMS_MODULE)
      this.resolveInputComponent()
    }
  }
</script>