import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { endpointApi } from '../api';
import { useAuth } from '../AuthContext';
import './EndpointEditor.css';

// 函数库定义
const FUNCTION_LIBRARY = {
  '时间日期': [
    { name: 'current_date', desc: '当前日期 (YYYY-MM-DD)', example: 'current_date' },
    { name: 'current_time', desc: '当前时间 (HH:MM:SS)', example: 'current_time' },
    { name: 'current_year', desc: '当前年份', example: 'current_year' },
    { name: 'current_month', desc: '当前月份 (1-12)', example: 'current_month' },
    { name: 'current_day', desc: '当前日期 (1-31)', example: 'current_day' },
    { name: 'current_hour', desc: '当前小时 (0-23)', example: 'current_hour' },
    { name: 'current_weekday', desc: '星期几 (0-6, 0=周日)', example: 'current_weekday' },
    { name: 'current_weekday_cn', desc: '星期几 (中文)', example: 'current_weekday_cn' },
    { name: 'is_weekend', desc: '是否周末', example: 'is_weekend' },
    { name: 'get_season()', desc: '获取季节', example: 'season = get_season()' },
    { name: 'greeting()', desc: '根据时间问候', example: 'msg = greeting()' },
    { name: 'chinese_zodiac()', desc: '当前生肖', example: 'zodiac = chinese_zodiac()' },
    { name: 'days_until_weekend()', desc: '距周末天数', example: 'days = days_until_weekend()' },
  ],
  'API调用': [
    { name: 'get_random_quote(repo)', desc: '获取随机语句', example: 'quote = get_random_quote("诗词")' },
  ],
  '随机数': [
    { name: 'random_int(min, max)', desc: '随机整数', example: 'num = random_int(1, 100)' },
    { name: 'random_float(min, max)', desc: '随机浮点数', example: 'num = random_float(0.0, 1.0)' },
    { name: 'random_choice(list)', desc: '随机选择', example: 'item = random_choice([1, 2, 3])' },
    { name: 'shuffle_list(list)', desc: '打乱列表', example: 'shuffled = shuffle_list([1, 2, 3])' },
  ],
  '加密编码': [
    { name: 'md5(text)', desc: 'MD5哈希', example: 'hash = md5("hello")' },
    { name: 'sha256(text)', desc: 'SHA256哈希', example: 'hash = sha256("hello")' },
    { name: 'base64_encode(text)', desc: 'Base64编码', example: 'encoded = base64_encode("hello")' },
    { name: 'base64_decode(text)', desc: 'Base64解码', example: 'decoded = base64_decode(encoded)' },
  ],
  '请求信息': [
    { name: 'ip_address', desc: '访问者IP地址', example: 'ip_address' },
    { name: 'user_agent', desc: '浏览器信息', example: 'user_agent' },
    { name: 'referer', desc: '来源地址', example: 'referer' },
  ],
};

// 示例代码
const EXAMPLES = [
  {
    title: '示例1：星期四返回KFC文案',
    code: `# 判断今天是否星期四
if current_weekday == 4:  # Thursday
    content = get_random_quote('KFC疯狂星期四')
    message = '今天是疯狂星期四！'
else:
    content = get_random_quote('诗词')
    message = '今天是' + current_weekday_cn

result = {
    'content': content,
    'message': message,
    'date': current_date
}`,
  },
  {
    title: '示例2：早晚问候不同内容',
    code: `# 根据时间返回不同问候
if current_hour < 12:
    quote = get_random_quote('早安语录')
    msg = '早上好'
elif current_hour < 18:
    quote = get_random_quote('午后时光')
    msg = '下午好'
else:
    quote = get_random_quote('晚安语录')
    msg = '晚上好'

result = {
    'greeting': msg,
    'quote': quote,
    'time': current_time
}`,
  },
  {
    title: '示例3：周末特别内容',
    code: `# 周末返回休闲内容
if is_weekend:
    content = get_random_quote('周末放松')
    tip = '周末愉快！'
else:
    content = get_random_quote('工作励志')
    tip = f'距离周末还有{days_until_weekend()}天'

result = {
    'content': content,
    'tip': tip,
    'season': get_season()
}`,
  },
  {
    title: '示例4：随机组合',
    code: `# 从多个仓库随机选择
repos = ['诗词', '名言', '段子']
selected_repo = random_choice(repos)
content = get_random_quote(selected_repo)

result = {
    'content': content,
    'from': selected_repo,
    'lucky_number': random_int(1, 100)
}`,
  },
];

const EndpointEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading: authLoading } = useAuth();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: '',
    visibility: 'public'
  });
  const [loading, setLoading] = useState(isEdit);
  const [showLibrary, setShowLibrary] = useState(true);
  const [activeTab, setActiveTab] = useState('editor');

  useEffect(() => {
    // 等待认证状态加载完成后再加载数据
    if (authLoading) return;

    if (isEdit) {
      loadEndpoint();
    } else {
      // 新建时加载示例1
      setFormData({
        ...formData,
        code: EXAMPLES[0].code
      });
    }
  }, [id, authLoading]);

  const loadEndpoint = async () => {
    try {
      const response = await endpointApi.getById(id);
      setFormData({
        name: response.data.name,
        description: response.data.description || '',
        code: response.data.code,
        visibility: response.data.visibility || 'public'
      });
    } catch (err) {
      alert('加载失败');
      navigate('/endpoints');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.code.includes('result')) {
      alert('代码必须包含 result 变量，用于返回结果');
      return;
    }

    try {
      if (isEdit) {
        await endpointApi.update(id, formData);
        alert('更新成功');
      } else {
        await endpointApi.create(formData);
        alert('创建成功');
      }
      navigate('/endpoints');
    } catch (err) {
      alert(err.response?.data?.error || '保存失败');
    }
  };

  const insertFunction = (funcText) => {
    const textarea = document.getElementById('code-editor');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.code;
    const newCode = text.substring(0, start) + funcText + text.substring(end);

    setFormData({ ...formData, code: newCode });

    // 重新设置光标位置
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + funcText.length, start + funcText.length);
    }, 10);
  };

  const loadExample = (example) => {
    if (window.confirm('确定要加载此示例吗？当前代码将被替换。')) {
      setFormData({ ...formData, code: example.code });
      setActiveTab('editor');
    }
  };

  if (loading || authLoading) return <div className="loading">加载中...</div>;

  return (
    <div className="endpoint-editor-page">
      <div className="container-fluid">
        <div className="editor-header">
          <h1>{isEdit ? '编辑端口' : '创建端口'}</h1>
          <button onClick={() => navigate('/endpoints')} className="btn btn-secondary">
            返回列表
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="editor-layout">
            {/* 左侧：表单和编辑器 */}
            <div className="editor-main">
              <div className="form-section card">
                <div className="form-group">
                  <label>端口名称 *</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例如：daily-quote"
                    required
                    disabled={isEdit}
                  />
                  <small>创建后不可修改，只能包含字母、数字、短横线</small>
                </div>

                <div className="form-group">
                  <label>描述</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="简要描述此端口的功能"
                  />
                </div>

                <div className="form-group">
                  <label>可见性</label>
                  <select
                    className="select"
                    value={formData.visibility}
                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                  >
                    <option value="public">公开 - 任何人可访问</option>
                    <option value="restricted">受限 - 需要 API KEY</option>
                    <option value="private">私有 - 仅自己可访问</option>
                  </select>
                </div>
              </div>

              <div className="code-section card">
                <div className="code-header">
                  <h3>Python代码</h3>
                  <button
                    type="button"
                    onClick={() => setShowLibrary(!showLibrary)}
                    className="btn btn-secondary btn-sm"
                  >
                    {showLibrary ? '隐藏' : '显示'}函数库
                  </button>
                </div>

                <textarea
                  id="code-editor"
                  className="code-editor"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="在这里编写Python代码..."
                  required
                  rows={20}
                  spellCheck={false}
                />

                <div className="code-tips">
                  <strong>重要提示：</strong>
                  <ul>
                    <li>代码必须定义 <code>result</code> 变量作为返回值</li>
                    <li><code>result</code> 必须是字典类型（JSON对象）</li>
                    <li>执行超时时间为5秒</li>
                    <li>使用 <code>get_random_quote(仓库名)</code> 调用其他仓库API</li>
                  </ul>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {isEdit ? '保存修改' : '创建端口'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/endpoints')}
                  className="btn btn-secondary"
                >
                  取消
                </button>
              </div>
            </div>

            {/* 右侧：函数库和示例 */}
            {showLibrary && (
              <div className="editor-sidebar">
                <div className="sidebar-tabs">
                  <button
                    type="button"
                    className={`tab ${activeTab === 'functions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('functions')}
                  >
                    函数库
                  </button>
                  <button
                    type="button"
                    className={`tab ${activeTab === 'examples' ? 'active' : ''}`}
                    onClick={() => setActiveTab('examples')}
                  >
                    示例代码
                  </button>
                </div>

                {activeTab === 'functions' && (
                  <div className="functions-list">
                    {Object.entries(FUNCTION_LIBRARY).map(([category, functions]) => (
                      <div key={category} className="function-category">
                        <h4>{category}</h4>
                        {functions.map((func) => (
                          <div key={func.name} className="function-item">
                            <div className="function-header">
                              <code>{func.name}</code>
                              <button
                                type="button"
                                onClick={() => insertFunction(func.example)}
                                className="btn-insert"
                              >
                                插入
                              </button>
                            </div>
                            <p className="function-desc">{func.desc}</p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'examples' && (
                  <div className="examples-list">
                    {EXAMPLES.map((example, index) => (
                      <div key={index} className="example-item card">
                        <h4>{example.title}</h4>
                        <pre className="example-code">{example.code}</pre>
                        <button
                          type="button"
                          onClick={() => loadExample(example)}
                          className="btn btn-secondary btn-sm"
                        >
                          加载此示例
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EndpointEditor;
