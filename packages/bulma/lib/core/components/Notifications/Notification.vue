<template>
  <li class="notification is-success" :data-index="index">
    <button class="delete" @click="hideNotification"></button>
    <span v-html="notification.message"></span>
  </li>
</template>

<script>
export default {
  props: {
    notification: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      removing: false
    }
  },
  mounted() {
    setTimeout(() => {
      this.hideNotification()
    }, 4000)
  },
  methods: {
    hideNotification() {
      if (!this.removing) {
        this.removing = true
        this.$el.removeChild(this.$el.querySelector('.delete'))
        this.$bwstarter.removeNotification(this.index)
      }
    }
  }
}
</script>

<style lang="sass">
.notification
  display: block
  position: relative
</style>
