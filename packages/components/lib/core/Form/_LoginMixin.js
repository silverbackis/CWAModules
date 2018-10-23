import FormMixin from '~/.nuxt/bwstarter/components/Form/_Mixin'
import { mapGetters, mapState, mapMutations } from 'vuex'
import { Utilities } from '~/.nuxt/bwstarter/core/server'
import FormTag from '~/.nuxt/bwstarter/components/Form/Form'
import FormInput from '~/.nuxt/bwstarter/components/Form/FormInput'

export default {
  mixins: [ FormMixin ],
  components: {
    FormTag,
    FormInput
  },
  data () {
    return {
      loginSuccessRedirect: '/'
    }
  },
  computed: {
    ...mapGetters({
      getApiUrl: 'bwstarter/getApiUrl'
    }),
    ...mapState({ token: state => state.bwstarter.token }),
    formErrors () {
      return this.storeForm ? this.storeForm.vars.errors : []
    }
  },
  methods: {
    ...mapMutations({
      setAuthToken: 'setAuthToken',
      addNotification: 'notifications/addNotification'
    }),
    formSuccess (data) {
      if (data.token) {
        this.$bwstarter.$storage.setState('token', data.token)
        this.$router.replace(this.loginSuccessRedirect)
      }
    }
  },
  async asyncData ({ store: { dispatch, getters }, app: { $axios, $bwstarter }, res }) {
    let response = await $bwstarter.fetchAndStoreLayout(null, true)

    if (process.server) {
      Utilities.setResponseCookies(res, response)
    }

    try {
      let { data: { form } } = await $axios.get('login_form')
      form.vars.action = '/login'
      return {
        form
      }
    } catch (err) {
      console.error('Could not load form', err)
    }
  },
  beforeDestroy () {
    this.destroyForm(this.formId)
  }
}
