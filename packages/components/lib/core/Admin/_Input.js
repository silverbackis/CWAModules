export default {
  components: {
    InputErrors: () => import('./InputErrors')
  },
  data() {
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
    },
    inputClass: {
      type: [String, Array],
      required: false,
      default: 'input'
    }
  },
  computed: {
    errors: {
      get() {
        return this.$bwstarter.getAdminInputErrors(this.adminInputData())
      },
      set(errors) {
        this.$bwstarter.setAdminInputModel(
          this.adminInputData({
            errors
          })
        )
      }
    },
    dataModel: {
      get() {
        return this.$bwstarter.getAdminInputModel(this.adminInputData())
      },
      set(model) {
        const isFocussed = this.$el === document.activeElement
        this.$bwstarter.setAdminInputModel(
          this.adminInputData({
            model
          })
        )
        this.$nextTick(() => {
          if (isFocussed && this.$el !== document.activeElement) {
            this.$el.focus()
          }
        })
      }
    },
    inputProps() {
      return {
        placeholder: this.placeholder,
        class: ['cms-text-input', this.inputClass]
      }
    }
  },
  watch: {
    model: {
      handler() {
        this.initialise()
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    adminInputData(data = {}) {
      return Object.assign(
        {
          componentId: this.componentId,
          componentField: this.componentField
        },
        data
      )
    },
    initialise() {
      this.$bwstarter.initAdminInput(
        this.adminInputData({
          model: this.model
        })
      )
    }
  },
  // for ssr
  created() {
    this.initialise()
  },
  // for dynamic re-mounts
  mounted() {
    this.initialise()
  },
  beforeDestroy() {
    this.$bwstarter.destroyAdminInput(this.adminInputData())
  }
}
