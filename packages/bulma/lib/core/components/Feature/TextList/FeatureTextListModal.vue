<template>
  <div :class="['modal', { 'is-active': !!component }]">
    <div class="modal-background" @click="$emit('close')" />
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Edit Feature</p>
        <button class="delete" aria-label="close" @click="$emit('close')" />
      </header>
      <section v-if="component" class="modal-card-body has-text-left">
        <div class="field">
          <label class="label">Internal route</label>
          <div class="field has-addons">
            <div class="control is-expanded">
              <input
                v-model="routePath"
                type="text"
                placeholder="e.g. /contact"
              />
              <p
                v-if="routeResult !== null"
                :class="['help', routeResult ? 'is-success' : 'is-danger']"
              >
                {{ routeResult ? 'Route found' : 'Route not found' }}
              </p>
            </div>
            <div class="control">
              <button
                :class="[
                  'button',
                  { 'is-loading': validatingRoute },
                  'is-success'
                ]"
                @click="submitRoute"
              >
                Stage Route
              </button>
            </div>
          </div>
        </div>
        <fieldset>
          <div class="field">
            <label class="label">URL/Link</label>
            <div class="control">
              <admin-text
                :component-id="component['@id']"
                :model="component.url"
                component-field="url"
                placeholder="e.g. https://www.website.com"
              />
            </div>
          </div>
        </fieldset>
      </section>
      <footer class="modal-card-foot">
        <button
          :class="['button', 'is-danger', deleting ? 'is-loading' : null]"
          @click="deleteClick"
        >
          Delete
        </button>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  components: {
    AdminText: () => import('~/.nuxt/bwstarter/components/Admin/Text')
  },
  props: {
    componentId: {
      type: String,
      required: false,
      default: null
    },
    deleting: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      routePath:
        this.component && this.component.route
          ? this.component.route.route
          : null,
      confirmDelete: false,
      confirmDeleteTimeout: null,
      validatingRoute: false,
      routeResult: null
    }
  },
  computed: {
    component() {
      return this.getEntity(this.componentId)
    }
  },
  watch: {
    componentId() {
      this.routePath =
        this.component && this.component.route
          ? this.component.route.route
          : null
      this.initRouteInput()
    }
  },
  mounted() {
    this.initRouteInput()
  },
  methods: {
    adminInputData(data = {}) {
      return Object.assign(
        {
          componentId: this.component['@id'],
          componentField: 'route'
        },
        data
      )
    },
    async submitRoute() {
      this.validatingRoute = true
      if (!this.routePath) {
        this.$bwstarter.setAdminInputModel(
          this.adminInputData({
            model: null
          })
        )
        this.routeResult = null
      } else {
        try {
          const { data } = await this.$axios.get(`/routes/${this.routePath}`, {
            progress: false
          })
          this.$bwstarter.setAdminInputModel(
            this.adminInputData({
              model: data['@id']
            })
          )
          this.routeResult = true
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(err)
          this.routeResult = false
        }
      }
      this.validatingRoute = false
    },
    deleteClick() {
      const doDelete = () => {
        this.deleting = true
        return this.$axios
          .delete(this.component['@id'], { progress: false })
          .then(() => {
            this.deleting = false
            this.$emit('deleted')
            this.$emit('close')
          })
          .catch(error => {
            // eslint-disable-next-line no-console
            console.error('error deleting component', error)
          })
      }
      this.$dialog
        .confirm({
          title: 'Are you sure?',
          body: 'This will permanently delete this feature.'
        })
        .then(async dialog => {
          await doDelete()
          dialog.close()
        })
        .catch(() => {
          // cancelled delete
        })
    },
    initRouteInput() {
      if (this.component) {
        this.$bwstarter.initAdminInput(
          this.adminInputData({
            model: this.component.route ? this.component.route['@id'] : null
          })
        )
      }
    }
  }
}
</script>
