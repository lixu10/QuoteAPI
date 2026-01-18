import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { endpointApi } from '../api';
import { useAuth } from '../AuthContext';
import './EndpointEditor.css';

// 函数库定义
const FUNCTION_LIBRARY = {
  '输入参数': [
    { name: 'params', desc: '访问输入参数（字典）', example: "name = params.get('name', '默认值')" },
    { name: "params.get(key, default)", desc: '获取参数（带默认值）', example: "age = params.get('age', 18)" },
  ],
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
    { name: 'time_ago(timestamp)', desc: '时间距离', example: "ago = time_ago('2024-01-01')" },
    { name: 'countdown_to(date)', desc: '倒计时', example: "cd = countdown_to('2025-01-01')" },
  ],
  '中国特色': [
    { name: 'get_lunar_date()', desc: '获取农历日期', example: 'lunar = get_lunar_date()' },
    { name: 'get_solar_term()', desc: '获取节气', example: 'term = get_solar_term()' },
    { name: 'get_chinese_festival()', desc: '获取中国节日', example: 'festival = get_chinese_festival()' },
    { name: 'is_workday()', desc: '是否工作日', example: 'workday = is_workday()' },
    { name: 'chinese_number(num)', desc: '数字转中文', example: "cn = chinese_number(123)" },
    { name: 'text_to_pinyin(text)', desc: '汉字转拼音', example: "py = text_to_pinyin('你好')" },
    { name: 'get_constellation(m, d)', desc: '获取星座', example: "sign = get_constellation(1, 20)" },
  ],
  'API调用': [
    { name: 'get_random_quote(repo)', desc: '获取随机语句', example: 'quote = get_random_quote("诗词")' },
    { name: 'call_endpoint(name)', desc: '调用其他端口', example: 'data = call_endpoint("my-endpoint")' },
    { name: 'call_endpoint(name, params)', desc: '带参数调用端口', example: 'data = call_endpoint("my-endpoint", {"key": "value"})' },
    { name: 'fetch_json(url)', desc: '调用外部API (GET)', example: 'data = fetch_json("https://api.example.com/data")' },
    { name: 'fetch_json(url, method, body)', desc: '调用外部API (POST)', example: 'data = fetch_json("https://api.example.com", "POST", {"key": "value"})' },
  ],
  'AI 大模型': [
    { name: 'ask_ai(prompt)', desc: '调用AI大模型', example: 'response = ask_ai("写一首诗")' },
    { name: 'ask_ai(prompt, max_tokens)', desc: '指定最大token', example: 'response = ask_ai("写一首诗", 500)' },
  ],
  '随机数': [
    { name: 'random_int(min, max)', desc: '随机整数', example: 'num = random_int(1, 100)' },
    { name: 'random_float(min, max)', desc: '随机浮点数', example: 'num = random_float(0.0, 1.0)' },
    { name: 'random_choice(list)', desc: '随机选择', example: 'item = random_choice([1, 2, 3])' },
    { name: 'shuffle_list(list)', desc: '打乱列表', example: 'shuffled = shuffle_list([1, 2, 3])' },
  ],
  '文本处理': [
    { name: 'word_count(text)', desc: '统计字数', example: 'count = word_count("Hello 你好")' },
    { name: 'truncate(text, len)', desc: '截断文本', example: 'short = truncate("很长的文本", 5)' },
    { name: 'regex_match(pattern, text)', desc: '正则匹配', example: 'matches = regex_match(r"\\d+", "abc123")' },
    { name: 'regex_replace(pattern, repl, text)', desc: '正则替换', example: 'result = regex_replace(r"\\d+", "X", "abc123")' },
    { name: 'html_escape(text)', desc: 'HTML转义', example: 'safe = html_escape("<script>")' },
    { name: 'remove_html(text)', desc: '移除HTML标签', example: 'text = remove_html("<p>Hello</p>")' },
  ],
  '实用工具': [
    { name: 'uuid()', desc: '生成UUID', example: 'id = uuid()' },
    { name: 'short_id(length)', desc: '生成短ID', example: 'id = short_id(8)' },
    { name: 'url_encode(text)', desc: 'URL编码', example: 'encoded = url_encode("你好")' },
    { name: 'url_decode(text)', desc: 'URL解码', example: 'decoded = url_decode("%E4%BD%A0%E5%A5%BD")' },
    { name: 'generate_password(len)', desc: '生成密码', example: 'pwd = generate_password(16)' },
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
    title: '示例1：使用输入参数',
    code: `# 调用方式: GET /endpoints/run/greeting?name=张三&language=cn
# 或 POST with JSON body: {"name": "张三", "language": "cn"}

name = params.get('name', '朋友')
language = params.get('language', 'cn')

if language == 'cn':
    message = f'你好，{name}！'
else:
    message = f'Hello, {name}!'

result = {
    'message': message,
    'greeting': greeting(),
    'date': current_date
}`,
  },
  {
    title: '示例2：调用外部API',
    code: `# 调用外部 API 获取数据
data = fetch_json('https://httpbin.org/json')

if 'error' in data:
    result = {'error': data['error']}
else:
    result = {
        'external_data': data,
        'fetched_at': current_datetime
    }`,
  },
  {
    title: '示例3：星期四返回KFC文案',
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
    title: '示例4：农历与节气',
    code: `# 获取农历信息和节气
lunar = get_lunar_date()
solar_term = get_solar_term()
festival = get_chinese_festival()

result = {
    'lunar': lunar,
    'solar_term': solar_term,
    'festival': festival,
    'is_workday': is_workday(),
    'zodiac': chinese_zodiac()
}`,
  },
  {
    title: '示例5：文本处理',
    code: `# 获取传入的文本并处理
text = params.get('text', '这是一段示例文本 Hello World!')

stats = word_count(text)
short_text = truncate(text, 10)
numbers = regex_match(r'\\d+', text)

result = {
    'original': text,
    'stats': stats,
    'truncated': short_text,
    'numbers_found': numbers,
    'safe_html': html_escape(text)
}`,
  },
  {
    title: '示例6：生成工具',
    code: `# 生成各种ID和密码
new_uuid = uuid()
short = short_id(8)
password = generate_password(16)

# 获取星座
month = int(params.get('month', current_month))
day = int(params.get('day', current_day))
constellation = get_constellation(month, day)

result = {
    'uuid': new_uuid,
    'short_id': short,
    'password': password,
    'constellation': constellation
}`,
  },
  {
    title: '示例7：倒计时功能',
    code: `# 倒计时到指定日期
target_date = params.get('date', '2025-01-01')
countdown = countdown_to(target_date)

result = {
    'target': target_date,
    'countdown': countdown,
    'current_time': current_datetime
}`,
  },
  {
    title: '示例8：AI生成内容',
    code: `# 使用AI大模型生成内容（需管理员配置AI）
quote = get_random_quote('诗词')
prompt = f"请用现代语言解释这句诗：{quote['content']}"
ai_response = ask_ai(prompt)

result = {
    'original': quote['content'],
    'explanation': ai_response,
    'generated_at': current_datetime
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
    visibility: 'public',
    metadata: {
      params: [],
      response: { example: {} },
      description: ''
    }
  });
  const [loading, setLoading] = useState(isEdit);
  const [showLibrary, setShowLibrary] = useState(true);
  const [activeTab, setActiveTab] = useState('editor');
  const [showMetadata, setShowMetadata] = useState(false);

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
      let metadata = { params: [], response: { example: {} }, description: '' };
      try {
        if (response.data.metadata) {
          metadata = typeof response.data.metadata === 'string'
            ? JSON.parse(response.data.metadata)
            : response.data.metadata;
        }
      } catch (e) {
        console.error('Failed to parse metadata', e);
      }
      setFormData({
        name: response.data.name,
        description: response.data.description || '',
        code: response.data.code,
        visibility: response.data.visibility || 'public',
        metadata: metadata
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

    const submitData = {
      ...formData,
      metadata: JSON.stringify(formData.metadata)
    };

    try {
      if (isEdit) {
        await endpointApi.update(id, submitData);
        alert('更新成功');
      } else {
        await endpointApi.create(submitData);
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

  // 元数据参数管理函数
  const addParam = () => {
    const newParams = [...(formData.metadata.params || []), {
      name: '',
      type: 'string',
      required: false,
      default: '',
      description: ''
    }];
    setFormData({
      ...formData,
      metadata: { ...formData.metadata, params: newParams }
    });
  };

  const updateParam = (index, field, value) => {
    const newParams = [...formData.metadata.params];
    newParams[index] = { ...newParams[index], [field]: value };
    setFormData({
      ...formData,
      metadata: { ...formData.metadata, params: newParams }
    });
  };

  const removeParam = (index) => {
    const newParams = formData.metadata.params.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      metadata: { ...formData.metadata, params: newParams }
    });
  };

  const updateMetadataDescription = (value) => {
    setFormData({
      ...formData,
      metadata: { ...formData.metadata, description: value }
    });
  };

  const updateResponseExample = (value) => {
    try {
      const parsed = JSON.parse(value);
      setFormData({
        ...formData,
        metadata: { ...formData.metadata, response: { example: parsed } }
      });
    } catch (e) {
      // 保持字符串形式以便用户继续编辑
      setFormData({
        ...formData,
        metadata: { ...formData.metadata, response: { example: value, invalid: true } }
      });
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
                    <li>使用 <code>params.get('name', default)</code> 获取输入参数</li>
                  </ul>
                </div>
              </div>

              {/* API 文档配置 */}
              <div className="metadata-section card">
                <div className="metadata-header">
                  <h3>API 文档配置</h3>
                  <button
                    type="button"
                    onClick={() => setShowMetadata(!showMetadata)}
                    className="btn btn-secondary btn-sm"
                  >
                    {showMetadata ? '收起' : '展开'}
                  </button>
                </div>

                {showMetadata && (
                  <div className="metadata-content">
                    <div className="form-group">
                      <label>API 详细描述</label>
                      <textarea
                        className="input"
                        rows={3}
                        value={formData.metadata.description || ''}
                        onChange={(e) => updateMetadataDescription(e.target.value)}
                        placeholder="详细描述此端口的功能、用途、注意事项等"
                      />
                    </div>

                    <div className="params-section">
                      <div className="params-header">
                        <label>输入参数</label>
                        <button type="button" onClick={addParam} className="btn btn-sm btn-secondary">
                          + 添加参数
                        </button>
                      </div>

                      {formData.metadata.params && formData.metadata.params.length > 0 && (
                        <table className="params-table">
                          <thead>
                            <tr>
                              <th>参数名</th>
                              <th>类型</th>
                              <th>必填</th>
                              <th>默认值</th>
                              <th>描述</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {formData.metadata.params.map((param, index) => (
                              <tr key={index}>
                                <td>
                                  <input
                                    type="text"
                                    className="input input-sm"
                                    value={param.name}
                                    onChange={(e) => updateParam(index, 'name', e.target.value)}
                                    placeholder="参数名"
                                  />
                                </td>
                                <td>
                                  <select
                                    className="select select-sm"
                                    value={param.type}
                                    onChange={(e) => updateParam(index, 'type', e.target.value)}
                                  >
                                    <option value="string">string</option>
                                    <option value="number">number</option>
                                    <option value="boolean">boolean</option>
                                    <option value="array">array</option>
                                    <option value="object">object</option>
                                  </select>
                                </td>
                                <td>
                                  <input
                                    type="checkbox"
                                    checked={param.required}
                                    onChange={(e) => updateParam(index, 'required', e.target.checked)}
                                  />
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    className="input input-sm"
                                    value={param.default}
                                    onChange={(e) => updateParam(index, 'default', e.target.value)}
                                    placeholder="默认值"
                                  />
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    className="input input-sm"
                                    value={param.description}
                                    onChange={(e) => updateParam(index, 'description', e.target.value)}
                                    placeholder="描述"
                                  />
                                </td>
                                <td>
                                  <button
                                    type="button"
                                    onClick={() => removeParam(index)}
                                    className="btn btn-sm btn-danger"
                                  >
                                    删除
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>

                    <div className="form-group">
                      <label>响应示例 (JSON)</label>
                      <textarea
                        className="input code-input"
                        rows={4}
                        value={typeof formData.metadata.response?.example === 'object'
                          ? JSON.stringify(formData.metadata.response.example, null, 2)
                          : (formData.metadata.response?.example || '')}
                        onChange={(e) => updateResponseExample(e.target.value)}
                        placeholder='{"message": "Hello", "data": {}}'
                        spellCheck={false}
                      />
                      {formData.metadata.response?.invalid && (
                        <small className="error-text">JSON 格式不正确</small>
                      )}
                    </div>
                  </div>
                )}
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
