<template>
  <div v-if="!disabledAdmin && $bwstarter.isAdmin">
    <button
      class="button is-primary is-fullwidth"
      :class="{ 'is-loading': adding }"
      @click="addCollectionItem"
    >
      <span class="icon is-small">
        <font-awesome-icon icon="plus" />
      </span>
      <span>Add New</span>
    </button>
    <div class="reload-link-row has-text-centered">
      <a
        class="reload-link has-text-grey-light"
        @click.prevent="reloadCollection"
        >reload collection</a
      >
    </div>
  </div>
</template>

<script>
export default {
  props: {
    disabledAdmin: {
      type: Boolean,
      required: true
    },
    adding: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    addCollectionItem(evt) {
      this.$emit('addCollectionItem', evt)
    },
    reloadCollection(evt) {
      this.$emit('reloadCollection', evt)
    }
  }
}
</script>
