// 图片服务
const NoteImage = require('../models/NoteImage');
const fileUploader = require('../utils/fileUploader');

const imagesService = {
  // 上传图片
  async upload(userId, files, noteId) {
    if (!files || !files.image) {
      throw new Error('请选择要上传的图片');
    }

    const image = files.image;
    const url = fileUploader.getFileUrl(image.filename);

    const noteImage = await NoteImage.create({
      noteId: noteId || null,
      imageUrl: url,
      fileName: image.originalname,
      fileSize: image.size
    });

    return {
      id: noteImage.id,
      url,
      fileName: image.originalname,
      fileSize: image.size
    };
  },

  // 获取图片列表
  async getList(userId, noteId) {
    const where = {};
    
    if (noteId) {
      where.noteId = noteId;
    }

    const images = await NoteImage.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    return images;
  },

  // 删除图片
  async delete(userId, id) {
    const image = await NoteImage.findByPk(id);
    
    if (!image) {
      throw new Error('图片不存在');
    }

    // 删除文件
    const filename = image.imageUrl.split('/').pop();
    fileUploader.deleteFile(filename);

    await image.destroy();
    return true;
  },

  // OCR识别
  async ocr(userId, id) {
    const image = await NoteImage.findByPk(id);
    
    if (!image) {
      throw new Error('图片不存在');
    }

    // 模拟OCR识别（实际应用中调用OCR API）
    const ocrResult = {
      text: '这是一段模拟的OCR识别结果。图片中的文字内容将被提取到这里。',
      confidence: 0.95
    };

    return ocrResult;
  }
};

module.exports = imagesService;
