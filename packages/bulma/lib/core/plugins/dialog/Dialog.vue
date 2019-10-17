<template>
  <div class="modal is-active">
    <div class="modal-background" @click="close"></div>
    <div class="modal-card">
      <header class="modal-card-head" v-if="messageHasTitle">
        <h2
          v-if="options.html"
          class="modal-card-title"
          v-html="messageTitle"
        ></h2>
        <h2 v-else class="modal-card-title">{{ messageTitle }}</h2>
        <button class="delete" aria-label="close" @click="close"></button>
      </header>
      <button v-else class="delete" aria-label="close"></button>
      <section class="modal-card-body">
        <div v-if="options.html" class="dg-content" v-html="messageBody"></div>
        <div v-else class="dg-content">{{ messageBody }}</div>
      </section>
      <footer class="modal-card-foot align-content-right">
        <button class="button" @click="cancel">Cancel</button>
        <button
          class="button is-danger"
          :class="{ 'is-loading': loading }"
          @click="submitDialogForm"
          :disabled="okBtnDisabled"
        >
          OK
        </button>
      </footer>
    </div>
  </div>
</template>

<script>
import DialogMixin from 'vuejs-dialog/dist/vuejs-dialog-mixin.min.js'

export default {
  mixins: [DialogMixin]
}
</script>

<style lang="sass">
.modal-card-foot
  justify-content: flex-end // space-between
</style>
