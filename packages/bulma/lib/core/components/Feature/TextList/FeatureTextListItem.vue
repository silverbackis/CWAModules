<template>
  <li v-if="component" class="feature-text-list-item">
    <div v-if="$bwstarter.isAdmin" class="field has-addons">
      <div class="control is-expanded has-icons-left">
        <admin-text-input
          :model="component.title"
          :component-id="endpoint"
          component-field="title"
          placeholder="Enter feature"
          class="input cms-text-input"
        />
        <span class="icon is-small is-left">
          <font-awesome-icon icon="check-circle" class="check-icon" />
        </span>
      </div>
      <span class="control">
        <a class="button is-light" @click="$emit('edit', component)">
          <font-awesome-icon icon="cog" />
        </a>
      </span>
    </div>
    <template v-else>
      <span class="fa-li">
        <font-awesome-icon icon="check-circle" class="check-icon" />
      </span>
      <app-link v-if="component.route" :to="component.route.route">
        <strong>{{ injectDynamicData(component.title) }}</strong>
      </app-link>
      <app-link v-else-if="component.url" :to="component.url">
        <strong>{{ injectDynamicData(component.title) }}</strong>
      </app-link>
      <span v-else>
        {{ injectDynamicData(component.title) }}
      </span>
    </template>
  </li>
</template>

<script>
import ComponentMixin from '~/.nuxt/bwstarter/bulma/components/componentMixin'
import AppLink from '~/.nuxt/bwstarter/components/Utils/AppLink'
export default {
  components: {
    AppLink
  },
  mixins: [ComponentMixin]
}
</script>

<style lang="sass">
.feature-text-list-item
  + .feature-text-list-item
    margin-top: .5em
  .cms-text-input
    font-size: inherit
    color: inherit
    font-family: inherit
</style>
