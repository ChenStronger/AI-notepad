<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '请输入内容...'
  }
})

const emit = defineEmits(['update:modelValue'])

const content = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  content.value = newVal
})

const updateContent = () => {
  emit('update:modelValue', content.value)
}
</script>

<template>
  <div class="rich-text-editor">
    <textarea 
      v-model="content" 
      :placeholder="placeholder"
      class="editor-area"
      @input="updateContent"
    ></textarea>
  </div>
</template>

<style scoped>
.rich-text-editor {
  width: 100%;
}

.editor-area {
  width: 100%;
  min-height: 200px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  font-family: inherit;
  box-sizing: border-box;
}

.editor-area:focus {
  outline: none;
  border-color: #4f46e5;
}
</style>