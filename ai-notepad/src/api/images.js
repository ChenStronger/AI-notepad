import api from './index'

export const imagesAPI = {
  // 上传图片
  upload(file) {
    const formData = new FormData()
    formData.append('image', file)
    return api.post('/images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  
  // 获取图片列表
  getList(params) {
    return api.get('/images', { params })
  },
  
  // 删除图片
  delete(id) {
    return api.delete(`/images/${id}`)
  },
  
  // OCR识别
  ocr(id) {
    return api.post(`/images/${id}/ocr`)
  }
}