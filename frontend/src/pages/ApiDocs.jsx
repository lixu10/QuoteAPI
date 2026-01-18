import React, { useState } from 'react';
import './ApiDocs.css';

const ApiDocs = () => {
  const [activeTab, setActiveTab] = useState('quick-start');
  const [selectedRepo, setSelectedRepo] = useState('my-quotes');
  const [selectedEndpoint, setSelectedEndpoint] = useState('daily-quote');
  const baseUrl = window.location.origin;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    const btn = document.activeElement;
    const originalText = btn.textContent;
    btn.textContent = '已复制!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = originalText;
      btn.classList.remove('copied');
    }, 1500);
  };

  const tabs = [
    { id: 'quick-start', label: '快速开始', icon: '01' },
    { id: 'repository', label: '仓库 API', icon: '02' },
    { id: 'endpoint', label: '端口 API', icon: '03' },
    { id: 'auth', label: '认证与权限', icon: '04' },
    { id: 'examples', label: '代码示例', icon: '05' },
  ];

  return (
    <div className="api-docs-page">
      <div className="docs-hero">
        <div className="container">
          <div className="hero-content">
            <span className="hero-badge">API Documentation</span>
            <h1>QuoteAPI 开发文档</h1>
            <p className="hero-desc">
              强大且灵活的语句 API 服务，支持自定义仓库、动态端口、多级权限控制
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-value">RESTful</span>
                <span className="stat-label">接口规范</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">JSON</span>
                <span className="stat-label">数据格式</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">CORS</span>
                <span className="stat-label">跨域支持</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="docs-container">
        <div className="container">
          <div className="docs-layout">
            {/* 侧边导航 */}
            <nav className="docs-nav">
              <div className="nav-sticky">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span className="nav-icon">{tab.icon}</span>
                    <span className="nav-label">{tab.label}</span>
                  </button>
                ))}
              </div>
            </nav>

            {/* 主要内容 */}
            <main className="docs-content">
              {/* 快速开始 */}
              {activeTab === 'quick-start' && (
                <section className="docs-section">
                  <div className="section-header">
                    <h2>快速开始</h2>
                    <p>只需一行代码，即可获取随机语句</p>
                  </div>

                  <div className="quick-demo">
                    <div className="demo-input-group">
                      <label>仓库名称</label>
                      <input
                        type="text"
                        value={selectedRepo}
                        onChange={(e) => setSelectedRepo(e.target.value)}
                        placeholder="输入仓库名"
                      />
                    </div>
                    <div className="demo-url">
                      <code>{baseUrl}/api/random/{selectedRepo}</code>
                      <button
                        className="copy-btn"
                        onClick={() => copyToClipboard(`${baseUrl}/api/random/${selectedRepo}`)}
                      >
                        复制
                      </button>
                    </div>
                  </div>

                  <div className="info-cards">
                    <div className="info-card">
                      <div className="info-icon-text">01</div>
                      <h3>仓库 (Repository)</h3>
                      <p>存储语句的容器，每个仓库可包含无限条语句。通过仓库名调用 API 获取随机语句。</p>
                    </div>
                    <div className="info-card">
                      <div className="info-icon-text">02</div>
                      <h3>端口 (Endpoint)</h3>
                      <p>自定义逻辑处理器，使用 Python 编写代码，可组合多个仓库、添加时间判断等动态逻辑。</p>
                    </div>
                    <div className="info-card">
                      <div className="info-icon-text">03</div>
                      <h3>API KEY</h3>
                      <p>用于访问受限资源的密钥。支持 Header 和 Query 参数两种传递方式。</p>
                    </div>
                  </div>

                  <div className="response-example">
                    <h3>响应格式</h3>
                    <div className="code-block-wrapper">
                      <div className="code-header">
                        <span className="code-lang">JSON</span>
                        <button
                          className="copy-btn-sm"
                          onClick={() => copyToClipboard(`{
  "content": "落霞与孤鹜齐飞，秋水共长天一色。",
  "link": "/quote/42"
}`)}
                        >
                          复制
                        </button>
                      </div>
                      <pre className="code-block">{`{
  "content": "落霞与孤鹜齐飞，秋水共长天一色。",
  "link": "/quote/42"
}`}</pre>
                    </div>
                  </div>
                </section>
              )}

              {/* 仓库 API */}
              {activeTab === 'repository' && (
                <section className="docs-section">
                  <div className="section-header">
                    <h2>仓库 API</h2>
                    <p>从仓库中获取随机语句</p>
                  </div>

                  <div className="api-endpoint-card">
                    <div className="endpoint-header">
                      <span className="method get">GET</span>
                      <code>/api/random/{'{repoName}'}</code>
                    </div>
                    <p className="endpoint-desc">从指定仓库获取一条随机语句</p>

                    <div className="endpoint-details">
                      <h4>路径参数</h4>
                      <table className="params-table">
                        <thead>
                          <tr>
                            <th>参数</th>
                            <th>类型</th>
                            <th>必填</th>
                            <th>说明</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><code>repoName</code></td>
                            <td>string</td>
                            <td><span className="required">是</span></td>
                            <td>仓库名称</td>
                          </tr>
                        </tbody>
                      </table>

                      <h4>响应字段</h4>
                      <table className="params-table">
                        <thead>
                          <tr>
                            <th>字段</th>
                            <th>类型</th>
                            <th>说明</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><code>content</code></td>
                            <td>string</td>
                            <td>语句内容</td>
                          </tr>
                          <tr>
                            <td><code>link</code></td>
                            <td>string</td>
                            <td>语句详情页链接</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="api-endpoint-card">
                    <div className="endpoint-header">
                      <span className="method get">GET</span>
                      <code>/api/quote/{'{id}'}</code>
                    </div>
                    <p className="endpoint-desc">获取指定 ID 的语句详情</p>
                  </div>

                  <div className="visibility-section">
                    <h3>可见性级别</h3>
                    <div className="visibility-cards">
                      <div className="visibility-card public">
                        <div className="vis-header">
                          <span className="vis-badge">公开 (public)</span>
                        </div>
                        <p>任何人都可以访问，无需认证</p>
                        <code>无需 API KEY</code>
                      </div>
                      <div className="visibility-card restricted">
                        <div className="vis-header">
                          <span className="vis-badge">受限 (restricted)</span>
                        </div>
                        <p>需要登录或提供有效的 API KEY</p>
                        <code>需要 API KEY</code>
                      </div>
                      <div className="visibility-card private">
                        <div className="vis-header">
                          <span className="vis-badge">私有 (private)</span>
                        </div>
                        <p>仅创建者或管理员可以访问</p>
                        <code>仅限所有者</code>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* 端口 API */}
              {activeTab === 'endpoint' && (
                <section className="docs-section">
                  <div className="section-header">
                    <h2>端口 API</h2>
                    <p>调用自定义端口获取动态内容</p>
                  </div>

                  <div className="api-endpoint-card">
                    <div className="endpoint-header">
                      <span className="method get">GET</span>
                      <code>/endpoints/run/{'{endpointName}'}</code>
                    </div>
                    <p className="endpoint-desc">执行指定端口并返回结果</p>

                    <div className="endpoint-details">
                      <h4>路径参数</h4>
                      <table className="params-table">
                        <thead>
                          <tr>
                            <th>参数</th>
                            <th>类型</th>
                            <th>必填</th>
                            <th>说明</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><code>endpointName</code></td>
                            <td>string</td>
                            <td><span className="required">是</span></td>
                            <td>端口名称</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="feature-box">
                    <h3>端口能力</h3>
                    <p>端口使用 Python 编写，可以实现以下功能：</p>
                    <ul className="feature-list">
                      <li>
                        <span className="feature-num">01</span>
                        <div>
                          <strong>组合多个仓库</strong>
                          <p>从多个仓库获取语句并组合</p>
                        </div>
                      </li>
                      <li>
                        <span className="feature-num">02</span>
                        <div>
                          <strong>时间判断</strong>
                          <p>根据时间返回不同内容（早安/晚安）</p>
                        </div>
                      </li>
                      <li>
                        <span className="feature-num">03</span>
                        <div>
                          <strong>随机逻辑</strong>
                          <p>自定义随机选择逻辑</p>
                        </div>
                      </li>
                      <li>
                        <span className="feature-num">04</span>
                        <div>
                          <strong>数据处理</strong>
                          <p>对语句进行格式化、拼接等处理</p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="code-example-block">
                    <h3>端口代码示例</h3>
                    <div className="code-block-wrapper">
                      <div className="code-header">
                        <span className="code-lang">Python</span>
                        <button
                          className="copy-btn-sm"
                          onClick={() => copyToClipboard(`# 根据时间返回不同问候语
quote = get_random_quote("诗词")

if current_hour < 12:
    greeting_text = "早安"
elif current_hour < 18:
    greeting_text = "午安"
else:
    greeting_text = "晚安"

result = {
    "greeting": f"{greeting_text}，{current_weekday_cn}",
    "quote": quote["content"],
    "link": quote["link"]
}`)}
                        >
                          复制
                        </button>
                      </div>
                      <pre className="code-block">{`# 根据时间返回不同问候语
quote = get_random_quote("诗词")

if current_hour < 12:
    greeting_text = "早安"
elif current_hour < 18:
    greeting_text = "午安"
else:
    greeting_text = "晚安"

result = {
    "greeting": f"{greeting_text}，{current_weekday_cn}",
    "quote": quote["content"],
    "link": quote["link"]
}`}</pre>
                    </div>
                  </div>

                  <div className="builtin-vars">
                    <h3>内置变量</h3>
                    <div className="vars-grid">
                      <div className="var-item">
                        <code>current_date</code>
                        <span>当前日期 (YYYY-MM-DD)</span>
                      </div>
                      <div className="var-item">
                        <code>current_time</code>
                        <span>当前时间 (HH:MM:SS)</span>
                      </div>
                      <div className="var-item">
                        <code>current_hour</code>
                        <span>当前小时 (0-23)</span>
                      </div>
                      <div className="var-item">
                        <code>current_weekday_cn</code>
                        <span>星期几（中文）</span>
                      </div>
                      <div className="var-item">
                        <code>is_weekend</code>
                        <span>是否周末</span>
                      </div>
                      <div className="var-item">
                        <code>ip_address</code>
                        <span>请求者 IP</span>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* 认证与权限 */}
              {activeTab === 'auth' && (
                <section className="docs-section">
                  <div className="section-header">
                    <h2>认证与权限</h2>
                    <p>使用 API KEY 访问受限资源</p>
                  </div>

                  <div className="auth-intro">
                    <div className="auth-card">
                      <h3>什么是 API KEY?</h3>
                      <p>
                        API KEY 是一个以 <code>qak_</code> 开头的唯一密钥，用于标识您的身份并授权访问受限的仓库和端口。
                      </p>
                    </div>
                  </div>

                  <div className="auth-methods">
                    <h3>传递方式</h3>

                    <div className="method-card">
                      <div className="method-header">
                        <span className="method-badge recommended">推荐</span>
                        <h4>方式一：HTTP Header</h4>
                      </div>
                      <div className="code-block-wrapper">
                        <div className="code-header">
                          <span className="code-lang">HTTP</span>
                          <button
                            className="copy-btn-sm"
                            onClick={() => copyToClipboard('X-API-Key: qak_your_api_key_here')}
                          >
                            复制
                          </button>
                        </div>
                        <pre className="code-block">X-API-Key: qak_your_api_key_here</pre>
                      </div>
                    </div>

                    <div className="method-card">
                      <div className="method-header">
                        <h4>方式二：Query 参数</h4>
                      </div>
                      <div className="code-block-wrapper">
                        <div className="code-header">
                          <span className="code-lang">URL</span>
                          <button
                            className="copy-btn-sm"
                            onClick={() => copyToClipboard(`${baseUrl}/api/random/my-repo?api_key=qak_your_api_key_here`)}
                          >
                            复制
                          </button>
                        </div>
                        <pre className="code-block">{`${baseUrl}/api/random/my-repo?api_key=qak_your_api_key_here`}</pre>
                      </div>
                    </div>
                  </div>

                  <div className="curl-examples">
                    <h3>cURL 示例</h3>
                    <div className="code-block-wrapper">
                      <div className="code-header">
                        <span className="code-lang">Bash</span>
                        <button
                          className="copy-btn-sm"
                          onClick={() => copyToClipboard(`# 使用 Header
curl -H "X-API-Key: qak_your_api_key_here" \\
  ${baseUrl}/api/random/private-repo

# 使用 Query 参数
curl "${baseUrl}/api/random/private-repo?api_key=qak_your_api_key_here"`)}
                        >
                          复制
                        </button>
                      </div>
                      <pre className="code-block">{`# 使用 Header
curl -H "X-API-Key: qak_your_api_key_here" \\
  ${baseUrl}/api/random/private-repo

# 使用 Query 参数
curl "${baseUrl}/api/random/private-repo?api_key=qak_your_api_key_here"`}</pre>
                    </div>
                  </div>

                  <div className="error-codes">
                    <h3>错误响应</h3>
                    <table className="params-table">
                      <thead>
                        <tr>
                          <th>状态码</th>
                          <th>说明</th>
                          <th>可能原因</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><code>401</code></td>
                          <td>未授权</td>
                          <td>访问受限资源但未提供 API KEY，或 API KEY 无效</td>
                        </tr>
                        <tr>
                          <td><code>403</code></td>
                          <td>禁止访问</td>
                          <td>API KEY 有效但无权访问该私有资源</td>
                        </tr>
                        <tr>
                          <td><code>404</code></td>
                          <td>未找到</td>
                          <td>仓库或端口不存在</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* 代码示例 */}
              {activeTab === 'examples' && (
                <section className="docs-section">
                  <div className="section-header">
                    <h2>代码示例</h2>
                    <p>各种语言和场景的完整示例</p>
                  </div>

                  <div className="example-config">
                    <div className="config-item">
                      <label>仓库名</label>
                      <input
                        type="text"
                        value={selectedRepo}
                        onChange={(e) => setSelectedRepo(e.target.value)}
                        placeholder="仓库名"
                      />
                    </div>
                  </div>

                  {/* HTML 美观示例 */}
                  <div className="example-block">
                    <div className="example-header">
                      <div className="example-title">
                        <span className="lang-badge">HTML</span>
                        <h3>HTML - 精美卡片样式</h3>
                      </div>
                      <button
                        className="copy-btn"
                        onClick={() => copyToClipboard(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>每日一句</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Noto Serif SC', serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            padding: 20px;
        }

        .quote-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            padding: 60px 50px;
            max-width: 600px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .quote-card::before {
            content: '"';
            position: absolute;
            top: 20px;
            left: 30px;
            font-size: 120px;
            color: rgba(255, 255, 255, 0.05);
            font-family: Georgia, serif;
            line-height: 1;
        }

        .quote-content {
            font-size: 24px;
            line-height: 2;
            color: #fff;
            margin-bottom: 40px;
            position: relative;
            z-index: 1;
            white-space: pre-wrap;
        }

        .quote-actions {
            display: flex;
            gap: 16px;
            justify-content: center;
        }

        .btn {
            padding: 14px 32px;
            border-radius: 50px;
            font-size: 15px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
            border: none;
        }

        .btn-primary:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
            background: transparent;
            color: #fff;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.1);
        }

        .loading {
            color: rgba(255, 255, 255, 0.5);
        }
    </style>
</head>
<body>
    <div class="quote-card">
        <div id="quote" class="quote-content loading">加载中...</div>
        <div class="quote-actions">
            <button class="btn btn-primary" onclick="loadQuote()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                </svg>
                换一句
            </button>
            <a id="detailLink" href="#" class="btn btn-secondary" target="_blank">查看详情</a>
        </div>
    </div>

    <script>
        async function loadQuote() {
            const quoteEl = document.getElementById('quote');
            const linkEl = document.getElementById('detailLink');

            quoteEl.classList.add('loading');
            quoteEl.textContent = '加载中...';

            try {
                const response = await fetch('${baseUrl}/api/random/${selectedRepo}');
                const data = await response.json();

                quoteEl.classList.remove('loading');
                quoteEl.textContent = data.content;
                linkEl.href = '${baseUrl}' + data.link;
            } catch (error) {
                quoteEl.classList.remove('loading');
                quoteEl.textContent = '加载失败，请重试';
            }
        }

        loadQuote();
    </script>
</body>
</html>`)}
                      >
                        复制代码
                      </button>
                    </div>
                    <pre className="code-block">{`<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>每日一句</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Noto Serif SC', serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            padding: 20px;
        }

        .quote-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            padding: 60px 50px;
            max-width: 600px;
            text-align: center;
            position: relative;
        }

        .quote-card::before {
            content: '"';
            position: absolute;
            top: 20px;
            left: 30px;
            font-size: 120px;
            color: rgba(255, 255, 255, 0.05);
        }

        .quote-content {
            font-size: 24px;
            line-height: 2;
            color: #fff;
            margin-bottom: 40px;
            white-space: pre-wrap;
        }

        .btn {
            padding: 14px 32px;
            border-radius: 50px;
            font-size: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
            border: none;
        }

        .btn-primary:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }
    </style>
</head>
<body>
    <div class="quote-card">
        <div id="quote" class="quote-content">加载中...</div>
        <button class="btn btn-primary" onclick="loadQuote()">换一句</button>
    </div>

    <script>
        async function loadQuote() {
            try {
                const response = await fetch('${baseUrl}/api/random/${selectedRepo}');
                const data = await response.json();
                document.getElementById('quote').textContent = data.content;
            } catch (error) {
                document.getElementById('quote').textContent = '加载失败';
            }
        }
        loadQuote();
    </script>
</body>
</html>`}</pre>
                  </div>

                  {/* JavaScript 示例 */}
                  <div className="example-block">
                    <div className="example-header">
                      <div className="example-title">
                        <span className="lang-badge">JS</span>
                        <h3>JavaScript - 带 API KEY</h3>
                      </div>
                      <button
                        className="copy-btn"
                        onClick={() => copyToClipboard(`// 使用 Fetch API 访问受限仓库
const API_KEY = 'qak_your_api_key_here';

async function getQuote(repoName) {
    try {
        const response = await fetch(\`${baseUrl}/api/random/\${repoName}\`, {
            headers: {
                'X-API-Key': API_KEY
            }
        });

        if (!response.ok) {
            throw new Error(\`HTTP error! status: \${response.status}\`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('获取语句失败:', error);
        return null;
    }
}

// 使用示例
getQuote('${selectedRepo}').then(data => {
    if (data) {
        console.log('语句:', data.content);
        console.log('链接:', data.link);
    }
});`)}
                      >
                        复制代码
                      </button>
                    </div>
                    <pre className="code-block">{`// 使用 Fetch API 访问受限仓库
const API_KEY = 'qak_your_api_key_here';

async function getQuote(repoName) {
    try {
        const response = await fetch(\`${baseUrl}/api/random/\${repoName}\`, {
            headers: {
                'X-API-Key': API_KEY
            }
        });

        if (!response.ok) {
            throw new Error(\`HTTP error! status: \${response.status}\`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('获取语句失败:', error);
        return null;
    }
}

// 使用示例
getQuote('${selectedRepo}').then(data => {
    if (data) {
        console.log('语句:', data.content);
        console.log('链接:', data.link);
    }
});`}</pre>
                  </div>

                  {/* Python 示例 */}
                  <div className="example-block">
                    <div className="example-header">
                      <div className="example-title">
                        <span className="lang-badge">PY</span>
                        <h3>Python - 完整封装</h3>
                      </div>
                      <button
                        className="copy-btn"
                        onClick={() => copyToClipboard(`import requests
from typing import Optional, Dict

class QuoteAPI:
    """QuoteAPI 客户端"""

    def __init__(self, base_url: str = "${baseUrl}", api_key: Optional[str] = None):
        self.base_url = base_url
        self.api_key = api_key
        self.session = requests.Session()

        if api_key:
            self.session.headers['X-API-Key'] = api_key

    def get_random_quote(self, repo_name: str) -> Optional[Dict]:
        """从指定仓库获取随机语句"""
        try:
            url = f"{self.base_url}/api/random/{repo_name}"
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"请求失败: {e}")
            return None

    def run_endpoint(self, endpoint_name: str) -> Optional[Dict]:
        """执行指定端口"""
        try:
            url = f"{self.base_url}/endpoints/run/{endpoint_name}"
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"请求失败: {e}")
            return None

# 使用示例
if __name__ == "__main__":
    # 公开仓库（无需 API KEY）
    client = QuoteAPI()
    quote = client.get_random_quote("${selectedRepo}")
    if quote:
        print(f"语句: {quote['content']}")

    # 受限仓库（需要 API KEY）
    auth_client = QuoteAPI(api_key="qak_your_api_key_here")
    private_quote = auth_client.get_random_quote("private-repo")
    if private_quote:
        print(f"私有语句: {private_quote['content']}")`)}
                      >
                        复制代码
                      </button>
                    </div>
                    <pre className="code-block">{`import requests
from typing import Optional, Dict

class QuoteAPI:
    """QuoteAPI 客户端"""

    def __init__(self, base_url: str = "${baseUrl}", api_key: Optional[str] = None):
        self.base_url = base_url
        self.api_key = api_key
        self.session = requests.Session()

        if api_key:
            self.session.headers['X-API-Key'] = api_key

    def get_random_quote(self, repo_name: str) -> Optional[Dict]:
        """从指定仓库获取随机语句"""
        try:
            url = f"{self.base_url}/api/random/{repo_name}"
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"请求失败: {e}")
            return None

# 使用示例
client = QuoteAPI()
quote = client.get_random_quote("${selectedRepo}")
if quote:
    print(f"语句: {quote['content']}")`}</pre>
                  </div>

                  {/* cURL 示例 */}
                  <div className="example-block">
                    <div className="example-header">
                      <div className="example-title">
                        <span className="lang-badge">CURL</span>
                        <h3>cURL - 命令行</h3>
                      </div>
                      <button
                        className="copy-btn"
                        onClick={() => copyToClipboard(`# 获取公开仓库的随机语句
curl ${baseUrl}/api/random/${selectedRepo}

# 使用 API KEY 访问受限仓库
curl -H "X-API-Key: qak_your_api_key_here" \\
  ${baseUrl}/api/random/private-repo

# 调用端口
curl ${baseUrl}/endpoints/run/daily-greeting

# 格式化输出
curl -s ${baseUrl}/api/random/${selectedRepo} | jq .`)}
                      >
                        复制代码
                      </button>
                    </div>
                    <pre className="code-block">{`# 获取公开仓库的随机语句
curl ${baseUrl}/api/random/${selectedRepo}

# 使用 API KEY 访问受限仓库
curl -H "X-API-Key: qak_your_api_key_here" \\
  ${baseUrl}/api/random/private-repo

# 调用端口
curl ${baseUrl}/endpoints/run/daily-greeting

# 格式化输出
curl -s ${baseUrl}/api/random/${selectedRepo} | jq .`}</pre>
                  </div>
                </section>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocs;
