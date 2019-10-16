export default {
  props: {
    depth: {
      type: Number,
      required: true
    }
  },
  computed: {
    childKey() {
      return this.$route.params['page' + (this.depth + 1)]
    }
  }
}
