<template>
  <div>
    <div v-if="!nested" class="navbar has-shadow">
      <div class="container">
        <div class="column is-paddingless">
          <slot></slot>
        </div>
      </div>
    </div>
    <slot v-else></slot>
    <nuxt-child
      v-if="includeNuxtChild"
      :key="childKey"
      :component-group="component.childComponentGroup"
    />
  </div>
</template>

<script>
import NuxtChildMixin from '~/.nuxt/bwstarter/bulma/components/nuxtChildMixin'

export default {
  mixins: [NuxtChildMixin],
  props: {
    includeNuxtChild: {
      type: Boolean,
      default: true
    }
  }
}
</script>
