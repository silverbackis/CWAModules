<template>
  <div class="content quill-editor"
       v-quill:cmsQuill="editorOption"
       @ready="onEditorReady()"
       v-html="model"
  ></div>
</template>

<script>
  import _Input from './_Input'

  export default {
    name: 'admin-quill',
    mixins: [_Input],
    data () {
      return {
        editorOption: {
          modules: {
            toolbar: [
              [{ 'header': [1, 2, 3, 4, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              ['blockquote'],
              [{ 'list': 'ordered' }, { 'list': 'bullet' }],
              ['code', 'code-block'],
              ['clean']
            ]
          }
        }
      }
    },
    methods: {
      onEditorReady: function () {

      }
    }
  }
</script>

<style src="./css/quill.min.sass" lang="sass" />

<style lang="sass">
  .ql-container
    font-size: inherit
    height: auto
</style>
