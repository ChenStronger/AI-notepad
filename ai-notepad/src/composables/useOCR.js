import { ref } from 'vue'

export function useOCR() {
  const isProcessing = ref(false)
  const result = ref(null)
  const error = ref(null)

  const processImage = async (imageData) => {
    isProcessing.value = true
    error.value = null
    result.value = null

    try {
      // 模拟OCR处理（实际项目中应调用后端API）
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 模拟返回结果
      result.value = {
        text: '这是识别出的文本内容',
        confidence: 0.95,
        blocks: [
          { text: '第一段文本', position: { x: 0, y: 0 } },
          { text: '第二段文本', position: { x: 0, y: 50 } }
        ]
      }
      
      return result.value
    } catch (e) {
      error.value = e.message || 'OCR处理失败'
      throw e
    } finally {
      isProcessing.value = false
    }
  }

  const clearResult = () => {
    result.value = null
    error.value = null
  }

  return {
    isProcessing,
    result,
    error,
    processImage,
    clearResult
  }
}