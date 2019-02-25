<template>
  <div class="progress-outer has-text-centered" v-if="uploading || error">
    <bulma-progress :class="['is-small', error ? 'is-danger' : 'is-success']" :value="percent"></bulma-progress>
    <a v-if="uploading && !error" class="button is-small is-danger" @click.stop.prevent="cancelUpload()">cancel upload</a>
    <p v-if="error" class="has-text-white help has-text-weight-bold has-background-danger">{{ error }}</p>
  </div>
</template>

<script>
import BulmaProgress from '../../../BulmaProgress'
export default {
  components: {
    BulmaProgress
  },
  props: {
    uploading: {
      type: Boolean,
      required: true
    },
    error: {
      type: String,
      required: false,
      default: null
    },
    percent: {
      type: Number,
      required: true
    }
  }
}
</script>

<style lang="sass">
  .progress-outer
    z-index: 10
    width: 80%
    top: 50%
    left: 50%
    transform: translateY(-50%) translateX(-50%)
    position: absolute
    min-width: 120px
    max-width: 700px
    .progress
      width: 100%
      margin-bottom: .5rem
    .help,
    .button
      position: absolute
      top: 100%
      margin-top: .2rem
      padding: .2rem
    .help
      width: 100%
    .button
      transform: translateX(-50%)
</style>
