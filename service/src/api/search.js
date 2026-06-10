const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// 语义搜索
router.post('/semantic', authMiddleware, async (req, res) => {
  try {
    const { query, sources } = req.body;
    const searchService = require('../services/searchService');
    const results = await searchService.semanticSearch(query, sources);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 关键词搜索
router.get('/keyword', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    const searchService = require('../services/searchService');
    const results = await searchService.keywordSearch(q);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
