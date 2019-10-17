<template>
  <tab-page-wrapper
    :nested="nested"
    :include-nuxt-child="includeNuxtChild"
    :depth="depth"
    :component="component"
  >
    <nav class="tabs" :class="classModifiers">
      <ul>
        <bulma-tab-item
          v-for="(component, index) in _items"
          :key="index"
          :component="getEntity(component)"
        />
      </ul>
    </nav>
  </tab-page-wrapper>
</template>

<script>
import BulmaTabItem from './TabsItem'
import TabPageWrapper from './TabPageWrapper'
import NuxtChildMixin from '~/.nuxt/bwstarter/bulma/components/nuxtChildMixin'

export default {
  components: {
    BulmaTabItem,
    TabPageWrapper
  },
  mixins: [NuxtChildMixin],
  props: {
    includeNuxtChild: {
      type: Boolean,
      default: true
    },
    align: {
      type: String,
      default: null,
      validator: function(value) {
        return ['centered', 'right'].indexOf(value) !== false
      }
    },
    size: {
      type: String,
      default: null,
      validator: function(value) {
        return ['small', 'medium', 'large'].indexOf(value) !== false
      }
    },
    style: {
      type: String,
      default: null,
      validator: function(value) {
        return ['boxed', 'toggle', 'toggle-rounded'].indexOf(value) !== false
      }
    },
    fullwidth: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    classModifiers() {
      return [
        this.isser(this.align),
        this.isser(this.size),
        this.isser(this.styleClassFixer(this._style)),
        this.isser(this.fullwidthClassFixer(this.fullwidth))
      ]
    },
    _items() {
      if (!this.component.componentGroups.length) {
        return []
      }
      const locations = this.getEntity(this.component.componentGroups[0])
        .componentLocations
      return this.getEntities(locations).map(location => location.component)
    }
  },
  methods: {
    isser(values) {
      if (!values) {
        return false
      }
      if (typeof values === 'string') {
        values = [values]
      }
      const classes = []
      values.map(value => {
        if (value) {
          classes.push('is-' + value)
        }
      })
      return classes
    },
    styleClassFixer(cls) {
      return cls === 'toggle-rounded' ? ['toggle', cls] : cls
    },
    fullwidthClassFixer(cls) {
      return cls ? 'fullwidth' : false
    }
  }
}
</script>
