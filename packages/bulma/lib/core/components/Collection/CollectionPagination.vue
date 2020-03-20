<template>
  <nav
    v-if="!disabledPagination && paginationData.last > 1"
    :class="['pagination is-rounded', { 'is-loading': reloading }]"
    role="navigation"
    aria-label="pagination"
  >
    <a
      :disabled="!paginationData.previous || page === paginationData.previous"
      @click="goToPage(paginationData.previous)"
      class="pagination-previous"
    >Previous</a
    >
    <a
      :disabled="!paginationData.next || page === paginationData.next"
      @click="goToPage(paginationData.next)"
      class="pagination-next"
    >Next</a
    >
    <ul class="pagination-list">
      <li v-if="page !== paginationData.first">
        <a
          :aria-label="goToPageLabel(paginationData.first)"
          @click="goToPage(paginationData.first)"
          class="pagination-link"
        >{{ paginationData.first }}</a
        >
      </li>

      <template
        v-if="
          paginationData.previous &&
            paginationData.previous !== paginationData.first
        "
      >
        <li v-if="paginationData.previous > paginationData.first + 1"><span class="pagination-ellipsis">&hellip;</span></li>
        <li>
          <a
            :aria-label="goToPageLabel(paginationData.previous)"
            @click="goToPage(paginationData.previous)"
            class="pagination-link"
          >{{ paginationData.previous }}</a
          >
        </li>
      </template>

      <li>
        <a
          :aria-label="goToPageLabel(page)"
          @click="goToPage(page)"
          class="pagination-link is-current"
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
            :aria-label="goToPageLabel(paginationData.next)"
            @click="goToPage(paginationData.next)"
            class="pagination-link"
          >{{ paginationData.next }}</a
          >
        </li>
        <li v-if="paginationData.next < paginationData.last - 1"><span class="pagination-ellipsis">&hellip;</span></li>
      </template>

      <li v-if="page !== paginationData.last">
        <a
          :aria-label="goToPageLabel(paginationData.last)"
          @click="goToPage(paginationData.last)"
          class="pagination-link"
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
    },
    reloading: {
      type: Boolean,
      required: false,
      default: false
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
