<template>
  <component-wrapper
    v-if="component"
    :nested="nested"
    :class="component.className"
  >
    <div :class="containerClass">
      <h3 v-if="$bwstarter.isAdmin || component.title" class="subtitle">
        <admin-text-input
          v-if="$bwstarter.isAdmin"
          :model="component.title"
          :component-id="endpoint"
          component-field="title"
          placeholder="Enter page title here"
        />
        <span v-else v-html="component.title" />
      </h3>
      <div v-if="$bwstarter.isAdmin" class="content">
        <admin-quill-editor
          :model="realComponentData.content"
          :component-id="endpoint"
          component-field="content"
        />
      </div>
      <component
        :is="transformed"
        v-else
        v-bind="$props"
        class="content"
      ></component>
    </div>
  </component-wrapper>
</template>

<script>
import ComponentMixin from '~/.nuxt/bwstarter/bulma/components/componentMixin'

export default {
  mixins: [ComponentMixin],
  data() {
    return {
      isClient: false
    }
  },
  computed: {
    transformed() {
      // Inject dynamic data
      let converted = this.realComponentData.content
      if (this.isClient) {
        const div = document.createElement('div')
        div.innerHTML = converted
        const anchors = div.getElementsByTagName('a')
        Array.from(anchors).forEach(anchor => {
          anchor.parentNode.replaceChild(this.convertAnchor(anchor), anchor)
        })
        converted = div.innerHTML
      }
      return {
        template: '<div>' + converted + '</div>',
        props: this.$options.props,
        components: {
          AppLink: () => import('~/.nuxt/bwstarter/components/Utils/AppLink')
        }
      }
    }
  },
  mounted() {
    this.isClient = true
  },
  methods: {
    convertAnchor(anchor) {
      // console.log(anchor, anchor.attributes, anchor.innerHTML)
      const newLink = document.createElement('app-link')
      newLink.setAttribute('to', anchor.getAttribute('href'))
      for (const attr of anchor.attributes) {
        if (['href', 'target', 'rel'].indexOf(attr.name) === -1) {
          newLink.setAttribute(attr.name, anchor[attr.name])
        }
      }
      newLink.innerHTML = anchor.innerHTML
      return newLink
    }
  }
}
</script>
