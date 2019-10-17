<template>
  <nav
    v-if="!disabledPagination && paginationData.last > 1"
    :class="['pagination is-rounded', { 'is-loading': reloading }]"
    role="navigation"
    aria-label="pagination"
  >
    <a
      class="pagination-previous"
      :disabled="!paginationData.previous || page === paginationData.previous"
      @click="goToPage(paginationData.previous)"
      >Previous</a
    >
    <a
      class="pagination-next"
      :disabled="!paginationData.next || page === paginationData.next"
      @click="goToPage(paginationData.next)"
      >Next</a
    >
    <ul class="pagination-list">
      <li v-if="page !== paginationData.first">
        <a
          class="pagination-link"
          :aria-label="goToPageLabel(paginationData.first)"
          @click="goToPage(paginationData.first)"
          >{{ paginationData.first }}</a
        >
      </li>

      <template
        v-if="
          paginationData.previous &&
            paginationData.previous !== paginationData.first
        "
      >
        <li><span class="pagination-ellipsis">&hellip;</span></li>
        <li>
          <a
            class="pagination-link"
            :aria-label="goToPageLabel(paginationData.previous)"
            >{{ paginationData.previous }}</a
          >
        </li>
      </template>

      <li>
        <a
          class="pagination-link is-current"
          :aria-label="goToPageLabel(page)"
          aria-current="page"
          >{{ page }}</a
        >
      </li>

      <template
        v-if="
          paginationData.next && paginationData.next !== paginationData.last
        "
      >
        <li>
          <a
            class="pagination-link"
            :aria-label="goToPageLabel(paginationData.next)"
            >{{ paginationData.next }}</a
          >
        </li>
        <li><span class="pagination-ellipsis">&hellip;</span></li>
      </template>

      <li v-if="page !== paginationData.last">
        <a
          class="pagination-link"
          :aria-label="goToPageLabel(paginationData.last)"
          @click="goToPage(paginationData.last)"
          >{{ paginationData.last }}</a
        >
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  props: {
    disabledPagination: {
      type: Boolean,
      required: true
    },
    paginationData: {
      type: Object,
      required: true
    },
    page: {
      type: Number,
      required: true
    }
  },
  methods: {
    goToPage(val) {
      this.$emit('goToPage', val)
    },
    goToPageLabel(val) {
      this.$emit('goToPageLabel', val)
    }
  }
}
</script>
