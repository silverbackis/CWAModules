<template>
  <div v-if="$bwstarter.isAdmin">
    <button class="button is-primary is-fullwidth" @click="$emit('add')">
      <span class="icon is-small">
        <font-awesome-icon :icon="['fas', 'plus']" />
      </span>
      <span>Add New</span>
    </button>

    <div class="reload-link-row has-text-centered">
      <a
        class="reload-link has-text-grey-light"
        @click.prevent="$emit('reload')"
        >reload features</a
      >
    </div>
  </div>
</template>
