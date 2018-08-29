import Vue from 'vue'
import { name as entityModuleName } from '~/.nuxt/bwstarter/core/storage/entities'
import { options } from '~/.nuxt/bwstarter/core/plugin'
import { mapGetters } from 'vuex'

Vue.mixin({
  computed: {
    ...mapGetters({
      getEntity: options.vuex.namespace + '/' + entityModuleName + '/getEntity',
      getEntities: options.vuex.namespace + '/' + entityModuleName + '/getEntities'
    })
  }
})
