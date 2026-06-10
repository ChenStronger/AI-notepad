export async function uploadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(e.target.result)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function validateImage(file) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const maxSize = 5 * 1024 * 1024
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, message: '不支持的图片格式，请上传 JPG、PNG、GIF 或 WebP 格式' }
  }
  
  if (file.size > maxSize) {
    return { valid: false, message: '图片大小不能超过 5MB' }
  }
  
  return { valid: true, message: '' }
}