<template>
  <div :class="['page', pageClass]">
    <bulma-components
      v-if="
        realPageData &&
          realPageData.componentLocations &&
          realPageData.componentLocations.length
      "
      :page-data="realPageData"
      :dynamic-data="dynamicData"
      :depth="depth"
      :nested="nested"
    />
    <nuxt-child v-else-if="childKey" :key="childKey" />
    <div v-else>
      <h1 style="margin-bottom: 4rem;">
        No components or children configured for this page
      </h1>
      <component-adder
        v-if="$bwstarter.hasRole('ROLE_SUPER_ADMIN')"
        :page="realPageData"
        @add="showModal"
      />
      <component-modal
        v-if="$bwstarter.hasRole('ROLE_SUPER_ADMIN')"
        v-bind="modalProps"
        @close="closeModal"
      />
    </div>
  </div>
</template>

<script>
import BulmaComponents from '../components/Components'
import pageMixin from '../../components/pageMixin'

export default {
  components: {
    BulmaComponents,
    ComponentModal: () => import('../components/Admin/ComponentModal'),
    ComponentAdder: () => import('../components/Admin/ComponentAdder')
  },
  mixins: [pageMixin],
  data() {
    return {
      componentModalActive: false,
      modalComponentData: {}
    }
  },
  computed: {
    modalProps() {
      return Object.assign(
        {
          active: this.componentModalActive
        },
        this.modalComponentData
      )
    }
  },
  methods: {
    showModal({ page, location, component, remove = false }) {
      this.componentModalActive = true
      this.modalComponentData = { page, location, component, remove }
    },
    closeModal() {
      this.componentModalActive = false
    }
  }
}
</script>
