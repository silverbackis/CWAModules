<template>
  <component-wrapper :nested="nested" :class-name="['form-section']">
    <div :class="[...containerClass, 'form-container']">
      <div class="card">
        <div class="card-content">
          <form-inner v-bind="$props">
            <template slot="success">
              <slot name="success" />
            </template>
            <template slot="errors">
              <slot name="errors" />
            </template>
            <template slot="form">
              <slot name="form" />
            </template>
            <template slot="form-append">
              <slot name="form-append" />
            </template>
          </form-inner>
        </div>
      </div>
    </div>
  </component-wrapper>
</template>

<script>
import FormInner from './FormInner'
import ComponentMixin from '~/.nuxt/bwstarter/bulma/components/componentMixin'
import FormMixin from '~/.nuxt/bwstarter/components/Form/_Mixin'

export default {
  components: {
    FormInner
  },
  mixins: [ComponentMixin, FormMixin],
  props: {
    extraData: {
      type: Object,
      default() {
        return {}
      }
    }
  }
}
</script>
