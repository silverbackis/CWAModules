<template>
  <li class="notification is-success" :data-index="index">
    <button class="delete" @click="hideNotification"></button>
    <span v-html="notification.message"></span>
  </li>
</template>

<script>
  import { mapMutations } from 'vuex'

  export default {
    props: [ 'notification', 'index' ],
    data () {
      return {
        removing: false
      }
    },
    methods: {
      hideNotification () {
        if (!this.removing) {
          this.removing = true
          this.$el.removeChild(this.$el.querySelector('.delete'))
          this.$bwstarter.removeNotification(this.index)
        }
      }
    },
    mounted () {
      setTimeout(() => {
        this.hideNotification()
      }, 4000)
    }
  }
</script>

<style lang="sass">
  @import '../../assets/css/_vars'

  .notification
    display: block
    position: relative
</style>
