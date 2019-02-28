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
    },
    isNumber: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    dataModel: {
      get () {
        return this.$bwstarter.getAdminInputModel(this.adminInputData())
      },
      set (model) {
        const isFocussed = this.$el === document.activeElement
        this.$bwstarter.setAdminInputModel(this.adminInputData({
          model
        }))
        this.$nextTick(() => {
          if (isFocussed && this.$el !== document.activeElement) {
            this.$el.focus()
          }
        })
      }
    },
    inputProps () {
      return {
        placeholder: this.placeholder,
        class: 'cms-text-input'
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
