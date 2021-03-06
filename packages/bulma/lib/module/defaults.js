export default {
  pagesDepth: 5,
  components: {
    Hero: '~/.nuxt/bwstarter/bulma/components/Hero/Hero.vue',
    Content: '~/.nuxt/bwstarter/bulma/components/Content/Content.vue',
    Tabs: '~/.nuxt/bwstarter/bulma/components/Nav/Tabs/Tabs.vue',
    Menu: '~/.nuxt/bwstarter/bulma/components/Nav/Menu/Menu.vue',
    Form: '~/.nuxt/bwstarter/bulma/components/Form/Form.vue',
    FeatureColumns:
      '~/.nuxt/bwstarter/bulma/components/Feature/Columns/FeatureColumns.vue',
    FeatureStacked:
      '~/.nuxt/bwstarter/bulma/components/Feature/Stacked/FeatureStacked.vue',
    FeatureTextList:
      '~/.nuxt/bwstarter/bulma/components/Feature/TextList/FeatureTextList.vue',
    Gallery: '~/.nuxt/bwstarter/bulma/components/Gallery/Gallery.vue',
    Collection: '~/.nuxt/bwstarter/bulma/components/Collection/Collection.vue',
    ColumnCollection:
      '~/.nuxt/bwstarter/bulma/components/Collection/ColumnCollection.vue',
    SideColumn: '~/.nuxt/bwstarter/bulma/components/Layouts/SideColumn.vue',
    SimpleImage: '~/.nuxt/bwstarter/bulma/components/Image/SimpleImage.vue'
  },
  enabledComponents: null,
  disabledComponents: null,
  photoswipeInstalled: null,
  componentEnabledVoter(
    {
      enabledComponents,
      disabledComponents,
      components,
      componentEnabledVoter,
      photoswipeInstalled
    },
    { key = null, component }
  ) {
    if (component && !key) {
      if (!photoswipeInstalled && component.startsWith('components/Gallery/')) {
        return false
      }
      const matchedKeys = Object.entries(components)
        .map(([key, path]) => {
          return path.endsWith(component) ? key : null
        })
        .filter(val => val !== null)
      if (matchedKeys.length) {
        const BreakException = {}
        try {
          matchedKeys.forEach(key => {
            if (
              componentEnabledVoter(
                {
                  enabledComponents,
                  disabledComponents,
                  components,
                  componentEnabledVoter,
                  photoswipeInstalled
                },
                { key }
              )
            ) {
              throw BreakException
            }
          })
          return false
        } catch (e) {
          // if we threw a break exception the voter said the matched key was OK
          return true
        }
      }
      // enable if it wasn't setup as a configured component - otherwise enabling would be very hard work...
      return true
    }

    if (!photoswipeInstalled && key === 'Gallery') {
      return false
    }

    if (key) {
      return (
        (enabledComponents &&
          Array.isArray(enabledComponents) &&
          enabledComponents.indexOf(key) !== -1) ||
        (disabledComponents &&
          Array.isArray(disabledComponents) &&
          disabledComponents.indexOf(key) === -1) ||
        true
      )
    }
    return true
  }
}
