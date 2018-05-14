<template>
  <component-wrapper v-if="component" :nested="nested">
    <div :class="containerClass">
      <div v-if="$bwstarter.isAdmin">
        <editor :model="injectDynamicData(component.content)"
                :componentId="endpoint"
                componentField="content"
        />
      </div>
      <component v-else
                 :is="transformed"
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
    components: {
      editor: () => import('~/.nuxt/bwstarter/components/Admin/Quill')
    },
    methods: {
      convertAnchor(anchor) {
        // console.log(anchor, anchor.attributes, anchor.innerHTML)
        const newLink = document.createElement('app-link')
        newLink.setAttribute('to', anchor.href)
        for(let attr of anchor.attributes) {
          if (attr.name !== 'href') {
            newLink.setAttribute(attr.name, anchor[attr.name])
          }
        }
        newLink.innerHTML = anchor.innerHTML
        console.log(newLink)
        return newLink
      }
    },
    computed: {
      transformed() {
        // Inject dynamic data
        let converted = this.injectDynamicData(this.component.content)
        if (process.client) {
          const div = document.createElement('div')
          div.innerHTML = converted
          const anchors = div.getElementsByTagName('a')
          Array.from(anchors).forEach((anchor) => {
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
    }
  }
</script>
