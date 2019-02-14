<template>
  <component-wrapper :nested="nested"
                     :className="['form-section']"
  >
    <div :class="[...containerClass, 'form-container']">
      <div class="card">
        <div class="card-content">
          <form-inner v-bind="$props">
            <template slot="success">
              <slot name="success" />
            </template>
          </form-inner>
        </div>
      </div>
    </div>
  </component-wrapper>
</template>

<script>
  import ComponentMixin from '~/.nuxt/bwstarter/bulma/components/componentMixin'
  import FormInner from './FormInner'

  export default {
    mixins: [ ComponentMixin ],
    props: {
      extraData: {
        type: Object,
        default () {
          return {}
        }
      }
    },
    components: {
      FormInner
    }
  }
</script>
