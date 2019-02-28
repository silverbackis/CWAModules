<template>
  <div class="content quill-editor"
       v-quill:quill="editorOptions"
       :content="dataModel"
       @ready="editorReady"
       ref="quillEditor"
  ></div>
</template>

<script>
  import _Input from './_Input'

  export default {
    mixins: [ _Input ],
    props: {
      editorToolbar: {
        type: Array,
        required: false,
        default: null
      }
    },
    data () {
      return {
        editorOptions: {
          modules: {
            toolbar: this.editorToolbar || [
              [ { 'header': [ 1, 2, 3, 4, false ] } ],
              [ 'bold', 'italic', 'underline', 'strike' ],
              [ 'blockquote' ],
              [ { 'list': 'ordered' }, { 'list': 'bullet' } ],
              [ 'code', 'code-block' ],
              [ 'link' ],
              [ 'clean' ]
            ]
          }
        },
        initialised: false
      }
    },
    methods: {
      editorReady () {
        if (this.initialised) {
          return
        }
        this.initialised = true
        // Initialize again, the innerHTML used to fetch HTML may remove whitespace between tags
        this.$bwstarter.initAdminInput(this.adminInputData({
          model: this.$refs.quillEditor.querySelector('.ql-editor').innerHTML
        }))
      }
    }
  }
</script>

<style src="./css/quill.min.sass" lang="sass"/>

<style lang="sass">
  .ql-container
    font-size: inherit
    height: auto
  .ql-editor
    text-align: inherit
</style>
