import Vue from 'vue'
import VuejsDialog from 'vuejs-dialog'
import Dialog from './Dialog'

const VIEW_NAME = 'bulma-dialog'
Vue.use(VuejsDialog, {
  view: VIEW_NAME,
  loader: true
})
Vue.dialog.registerComponent(VIEW_NAME, Dialog)
