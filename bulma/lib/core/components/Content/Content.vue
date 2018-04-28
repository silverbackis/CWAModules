<template>
  <component-wrapper v-if="component" :nested="nested">
    <div :class="containerClass">
      <div v-if="$bwstarter.isAdmin">
        <editor :model="injectDynamicData(component.content)" />
      </div>
      <div v-else
           class="content"
           v-html="injectDynamicData(component.content)"
      ></div>
    </div>
  </component-wrapper>
</template>

<script>
  import ComponentMixin from '~/.nuxt/bwstarter/bulma/components/componentMixin'

  export default {
    mixins: [ComponentMixin],
    components: {
      editor: () => import('~/.nuxt/bwstarter/components/Admin/Quill')
    }
  }
</script>
