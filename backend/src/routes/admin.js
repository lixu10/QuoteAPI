import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { Repository } from '../models/Repository.js';
import { Endpoint } from '../models/Endpoint.js';
import systemConfig from '../models/SystemConfig.js';
import dbManager from '../config/database.js';

const router = express.Router();
const repoModel = new Repository();
const endpointModel = new Endpoint();

// 所有路由都需要管理员权限
router.use(authMiddleware);
router.use(adminMiddleware);

// 获取所有仓库（包含用户信息）
router.get('/repositories', (req, res) => {
  try {
    const db = dbManager.getDb();
    const stmt = db.prepare(`
      SELECT r.*, u.username,
             COUNT(DISTINCT q.id) as quote_count
      FROM repositories r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN quotes q ON r.id = q.repository_id
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `);
    const repos = stmt.all();
    res.json(repos);
  } catch (error) {
    console.error('Error fetching repositories:', error);
    res.status(500).json({ error: '获取仓库列表失败' });
  }
});

// 获取所有端口（包含用户信息）
router.get('/endpoints', (req, res) => {
  try {
    const db = dbManager.getDb();
    const stmt = db.prepare(`
      SELECT e.*, u.username
      FROM endpoints e
      LEFT JOIN users u ON e.user_id = u.id
      ORDER BY e.created_at DESC
    `);
    const endpoints = stmt.all();
    res.json(endpoints);
  } catch (error) {
    console.error('Error fetching endpoints:', error);
    res.status(500).json({ error: '获取端口列表失败' });
  }
});

// 更新仓库的 visibility
router.put('/repositories/:id/visibility', (req, res) => {
  try {
    const { id } = req.params;
    const { visibility } = req.body;

    if (!['public', 'restricted', 'private'].includes(visibility)) {
      return res.status(400).json({ error: '无效的可见性设置' });
    }

    const repo = repoModel.findById(parseInt(id));
    if (!repo) {
      return res.status(404).json({ error: '仓库不存在' });
    }

    repoModel.update(parseInt(id), { visibility });
    res.json({ message: '更新成功', visibility });
  } catch (error) {
    console.error('Error updating repository visibility:', error);
    res.status(500).json({ error: '更新失败' });
  }
});

// 更新端口的 visibility
router.put('/endpoints/:id/visibility', (req, res) => {
  try {
    const { id } = req.params;
    const { visibility } = req.body;

    if (!['public', 'restricted', 'private'].includes(visibility)) {
      return res.status(400).json({ error: '无效的可见性设置' });
    }

    const endpoint = endpointModel.findById(parseInt(id));
    if (!endpoint) {
      return res.status(404).json({ error: '端口不存在' });
    }

    endpointModel.updateEndpoint(parseInt(id), { visibility });
    res.json({ message: '更新成功', visibility });
  } catch (error) {
    console.error('Error updating endpoint visibility:', error);
    res.status(500).json({ error: '更新失败' });
  }
});

// 删除仓库（管理员）
router.delete('/repositories/:id', (req, res) => {
  try {
    const { id } = req.params;
    const repo = repoModel.findById(parseInt(id));
    if (!repo) {
      return res.status(404).json({ error: '仓库不存在' });
    }
    repoModel.delete(parseInt(id));
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('Error deleting repository:', error);
    res.status(500).json({ error: '删除失败' });
  }
});

// 删除端口（管理员）
router.delete('/endpoints/:id', (req, res) => {
  try {
    const { id } = req.params;
    const endpoint = endpointModel.findById(parseInt(id));
    if (!endpoint) {
      return res.status(404).json({ error: '端口不存在' });
    }
    endpointModel.delete(parseInt(id));
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('Error deleting endpoint:', error);
    res.status(500).json({ error: '删除失败' });
  }
});

// ========== AI 配置管理 ==========

// 获取 AI 配置
router.get('/ai-config', (req, res) => {
  try {
    const config = systemConfig.getAiConfig();
    // 隐藏 API Key 的中间部分
    if (config.apiKey) {
      const key = config.apiKey;
      if (key.length > 8) {
        config.apiKeyMasked = key.substring(0, 4) + '****' + key.substring(key.length - 4);
      } else {
        config.apiKeyMasked = '****';
      }
    } else {
      config.apiKeyMasked = '';
    }
    res.json(config);
  } catch (error) {
    console.error('Error getting AI config:', error);
    res.status(500).json({ error: '获取配置失败' });
  }
});

// 设置 AI 配置
router.post('/ai-config', (req, res) => {
  try {
    const { apiUrl, apiKey, model } = req.body;

    if (!apiUrl || !model) {
      return res.status(400).json({ error: 'API 地址和模型名称不能为空' });
    }

    // 如果 apiKey 是 masked 的（包含 ****），则使用旧的 key
    let finalApiKey = apiKey;
    if (apiKey && apiKey.includes('****')) {
      finalApiKey = systemConfig.get('ai_api_key') || '';
    }

    systemConfig.setAiConfig(apiUrl, finalApiKey, model);
    res.json({ message: '配置保存成功' });
  } catch (error) {
    console.error('Error saving AI config:', error);
    res.status(500).json({ error: '保存配置失败' });
  }
});

// 测试 AI 配置
router.post('/ai-config/test', async (req, res) => {
  try {
    const config = systemConfig.getAiConfig();

    if (!config.apiUrl || !config.apiKey || !config.model) {
      return res.status(400).json({ error: 'AI 配置不完整，请先完成配置' });
    }

    // 发送测试请求
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: 'Hello, this is a test. Please respond with "OK".' }],
        max_tokens: 10
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(400).json({
        error: `API 请求失败: ${response.status} ${response.statusText}`,
        details: errorData
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 'No response';

    res.json({
      success: true,
      message: '连接成功',
      response: content
    });
  } catch (error) {
    console.error('Error testing AI config:', error);
    res.status(500).json({ error: `测试失败: ${error.message}` });
  }
});

export default router;
