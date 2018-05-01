<template>
  <section class="container">
    <div class="content error-content">
      <div class="columns is-centered">
        <div class="column is-narrow">
          <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" class="exclamation" viewBox="0 0 48 48"><path d="M22 30h4v4h-4zm0-16h4v12h-4zm1.99-10C12.94 4 4 12.95 4 24s8.94 20 19.99 20S44 35.05 44 24 35.04 4 23.99 4zM24 40c-8.84 0-16-7.16-16-16S15.16 8 24 8s16 7.16 16 16-7.16 16-16 16z"/></svg>
          <h1 class="title is-marginless">
            {{ error.statusCode }}
            <span v-html="error.message"></span>
          </h1>
          <p class="help has-text-grey-light">
            {{ error.url }}
          </p>
          <p v-if="[401, 403].indexOf(error.statusCode) !== -1" class="has-text-success">
            You may need to log out and in again
          </p>
        </div>
      </div>
      <p v-if="error.statusCode === 404">
        <nuxt-link class="button is-secondary is-outlined" to="/">Back to the home page</nuxt-link>
      </p>
    </div>
  </section>
</template>
<script>
export default {
  name: 'nuxt-error',
  props: ['error']
}
</script>

<style lang="sass">
  @import ~assets/css/vars

  .error-content
    padding-top: 3rem;
    text-align: center;
    .exclamation
      fill: $grey-lighter

</style>
