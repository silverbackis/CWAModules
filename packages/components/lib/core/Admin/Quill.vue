<template>
  <div>
    <div ref="quillDom" :class="inputClass" v-html="quillModel"></div>
    <input-errors :errors="errors" :component-id="componentId" />
  </div>
</template>

<script>
import _Input from './_Input'

export default {
  mixins: [_Input],
  props: {
    editorToolbar: {
      type: Array,
      required: false,
      default: null
    },
    inputClass: {
      type: [String, Array, Object],
      required: false,
      default: null
    }
  },
  data() {
    return {
      editor: null,
      theme: 'snow',
      editorOptions: {
        modules: {
          toolbar: this.editorToolbar || [
            [{ header: [1, 2, 3, 4, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['code', 'code-block'],
            ['link'],
            ['clean']
          ]
        }
      },
      quillModel: null
    }
  },
  created() {
    this.quillModel = this.dataModel ? this.dataModel.trim() : this.dataModel
  },
  async mounted() {
    const Quill = await import('quill')

    // eslint-disable-next-line new-cap
    this.editor = new Quill.default(this.$refs.quillDom, {
      editorOptions: this.editorOptions,
      theme: this.theme
    })
    this.editor.enable(false)

    this.$nextTick(() => {
      this.$bwstarter.initAdminInput(
        this.adminInputData({
          model: this.editor.root.innerHTML
        })
      )

      // We will add the update event here
      this.editor.on('text-change', () => {
        this.dataModel = this.editor.root.innerHTML
      })
      this.editor.enable(true)
    })
  }
}
</script>

<style src="./css/quill.min.sass" lang="sass" />

<style lang="sass">
.ql-container
  font-size: inherit
  height: auto
.ql-editor
  text-align: inherit
</style>
