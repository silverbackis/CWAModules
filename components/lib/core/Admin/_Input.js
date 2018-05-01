export default {
  data () {
    return {
      debounce: null
    }
  },
  props: {
    model: {
      required: true
    },
    placeholder: {
      type: String,
      required: false
    },
    componentId: {
      type: String,
      required: true
    },
    componentField: {
      type: String,
      required: true
    }
  },
  computed: {
    dataModel: {
      get () {
        return this.model
      },
      set (model) {
        this.$bwstarter.setAdminInputModel(this.adminInputData({
          model
        }))
      }
    }
  },
  methods: {
    adminInputData (data = {}) {
      return Object.assign(
        {
          componentId: this.componentId,
          componentField: this.componentField
        },
        data
      )
    }
  },
  created () {
    this.$bwstarter.initAdminInput(this.adminInputData({
      model: this.model
    }))
  },
  beforeDestroy () {
    this.$bwstarter.destroyAdminInput(this.adminInputData())
  }
}
