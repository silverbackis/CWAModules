import Vue from 'vue'
import { mapGetters } from 'vuex'
import { name as entityModuleName } from '~/.nuxt/bwstarter/core/storage/entities'
import { options } from '~/.nuxt/bwstarter/core/plugin'

Vue.mixin({
  computed: {
    ...mapGetters({
      getEntity: options.vuex.namespace + '/' + entityModuleName + '/getEntity',
      getEntities:
        options.vuex.namespace + '/' + entityModuleName + '/getEntities'
    })
  }
})
