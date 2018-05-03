<template>
  <div class="content quill-editor"
       v-quill:quill="editorOptions"
       v-model="dataModel"
       @ready="editorReady"
       ref="quillEditor"
  ></div>
</template>

<script>
  import _Input from './_Input'

  export default {
    name: 'admin-quill',
    mixins: [_Input],
    data () {
      return {
        editorOptions: {
          modules: {
            toolbar: [
              [{ 'header': [1, 2, 3, 4, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              ['blockquote'],
              [{ 'list': 'ordered' }, { 'list': 'bullet' }],
              ['code', 'code-block'],
              ['link'],
              ['clean']
            ]
          }
        }
      }
    },
    methods: {
      editorReady() {
        // Initialize again, the innerHTML used to fetch HTML may remove whitespace between tags
        this.$bwstarter.initAdminInput(this.adminInputData({
          model: this.$refs.quillEditor.querySelector('.ql-editor').innerHTML
        }));
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
