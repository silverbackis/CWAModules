<template>
  <component-wrapper :nested="nested">
    <div class="container">
      <div class="columns">
        <div class="column is-narrow">
          <aside class="menu">
            <bulma-menu-item-group
              v-for="(itemGroup, index) in navItemsGrouped"
              :key="index"
              :nav-items="itemGroup"
            />
          </aside>
        </div>
        <div class="column">
          <nuxt-child
            :key="childKey"
            :component-group="getEntity(component.childComponentGroup['@id'])"
            :nested="true"
          />
        </div>
      </div>
    </div>
  </component-wrapper>
</template>

<script>
import BulmaMenuItemGroup from './MenuItemGroup'
import NuxtChildMixin from '~/.nuxt/bwstarter/bulma/components/nuxtChildMixin'

export default {
  components: {
    BulmaMenuItemGroup
  },
  mixins: [NuxtChildMixin],
  computed: {
    navItems() {
      return this.childComponents[0]
    },
    navItemsGrouped() {
      const groups = []
      let currentGroup = []
      let previousItem
      this.navItems.forEach(navItem => {
        navItem = this.getEntity(navItem['@id'])
        if (previousItem && (previousItem.menuLabel || navItem.menuLabel)) {
          groups.push(currentGroup)
          currentGroup = []
        }
        currentGroup.push(navItem)
        previousItem = navItem
      })
      groups.push(currentGroup)
      return groups
    }
  }
}
</script>

<style lang="sass">
@import "../../../assets/css/vars"

aside.menu
  padding: .75rem
  border: 1px solid $grey-lighter
  min-width: 250px
</style>
