// 图片控制器
const imagesService = require('../services/imagesService');

const imagesController = {
  // 上传图片
  async upload(req, res) {
    try {
      const { note_id } = req.query;
      const result = await imagesService.upload(req.user.id, req.files, note_id);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  // 获取图片列表
  async getList(req, res) {
    try {
      const { note_id } = req.query;
      const images = await imagesService.getList(req.user.id, note_id);
      res.json({ success: true, data: images });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 删除图片
  async delete(req, res) {
    try {
      const { id } = req.params;
      await imagesService.delete(req.user.id, id);
      res.json({ success: true, message: '图片删除成功' });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  // OCR识别
  async ocr(req, res) {
    try {
      const { id } = req.params;
      const result = await imagesService.ocr(req.user.id, id);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = imagesController;
