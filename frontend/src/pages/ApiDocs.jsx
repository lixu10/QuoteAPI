import React, { useState } from 'react';
import './ApiDocs.css';

const ApiDocs = () => {
  const [selectedRepo, setSelectedRepo] = useState('诗词');
  const baseUrl = window.location.origin;

  const codeExamples = {
    curl: `curl ${baseUrl}/api/random/${selectedRepo}`,

    javascript: `// 使用 Fetch API
fetch('${baseUrl}/api/random/${selectedRepo}')
  .then(response => response.json())
  .then(data => {
    console.log(data.content);
    document.getElementById('quote').textContent = data.content;
  })
  .catch(error => console.error('错误:', error));

// 使用 Axios
import axios from 'axios';

axios.get('${baseUrl}/api/random/${selectedRepo}')
  .then(response => {
    console.log(response.data.content);
  })
  .catch(error => console.error('错误:', error));`,

    htmlBasic: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>每日一句</title>
</head>
<body>
    <div id="quote">加载中...</div>

    <script>
        fetch('${baseUrl}/api/random/${selectedRepo}')
            .then(res => res.json())
            .then(data => {
                document.getElementById('quote').textContent = data.content;
            });
    </script>
</body>
</html>`,

    htmlStyled: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>每日一句</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .quote-container {
            background: white;
            border-radius: 20px;
            padding: 60px 40px;
            max-width: 600px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            text-align: center;
        }

        #quote {
            font-size: 24px;
            line-height: 1.8;
            color: #333;
            margin-bottom: 30px;
            white-space: pre-wrap;
        }

        button {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s;
        }

        button:hover {
            background: #5568d3;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
    </style>
</head>
<body>
    <div class="quote-container">
        <div id="quote">加载中...</div>
        <button onclick="loadQuote()">换一句</button>
    </div>

    <script>
        function loadQuote() {
            document.getElementById('quote').textContent = '加载中...';

            fetch('${baseUrl}/api/random/${selectedRepo}')
                .then(res => res.json())
                .then(data => {
                    document.getElementById('quote').textContent = data.content;
                })
                .catch(error => {
                    document.getElementById('quote').textContent = '加载失败，请重试';
                });
        }

        // 页面加载时获取第一句
        loadQuote();
    </script>
</body>
</html>`,

    python: `import requests

# 基本使用
response = requests.get('${baseUrl}/api/random/${selectedRepo}')
data = response.json()
print(data['content'])

# 完整示例
def get_random_quote(repo_name='${selectedRepo}'):
    """获取随机语句"""
    try:
        url = f'${baseUrl}/api/random/{repo_name}'
        response = requests.get(url, timeout=10)
        response.raise_for_status()

        data = response.json()
        return {
            'content': data['content'],
            'link': data['link']
        }
    except requests.RequestException as e:
        print(f'请求失败: {e}')
        return None

# 使用示例
quote = get_random_quote()
if quote:
    print(f"语句: {quote['content']}")
    print(f"链接: {quote['link']}")`,

    java: `import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class QuoteAPI {
    private static final String BASE_URL = "${baseUrl}/api/random";

    public static void main(String[] args) {
        try {
            String quote = getRandomQuote("${selectedRepo}");
            System.out.println("语句: " + quote);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static String getRandomQuote(String repoName) throws Exception {
        HttpClient client = HttpClient.newHttpClient();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/" + repoName))
                .GET()
                .build();

        HttpResponse<String> response = client.send(request,
                HttpResponse.BodyHandlers.ofString());

        // 解析JSON响应
        JsonObject jsonObject = JsonParser.parseString(response.body())
                .getAsJsonObject();

        return jsonObject.get("content").getAsString();
    }
}`,

    php: `<?php
// 基本使用
$url = '${baseUrl}/api/random/${selectedRepo}';
$response = file_get_contents($url);
$data = json_decode($response, true);
echo $data['content'];

// 使用 cURL（推荐）
function getRandomQuote($repoName = '${selectedRepo}') {
    $url = '${baseUrl}/api/random/' . urlencode($repoName);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200) {
        $data = json_decode($response, true);
        return [
            'content' => $data['content'],
            'link' => $data['link']
        ];
    }

    return null;
}

// 使用示例
$quote = getRandomQuote();
if ($quote) {
    echo "语句: " . $quote['content'] . "\\n";
    echo "链接: " . $quote['link'] . "\\n";
}
?>`,

    go: `package main

import (
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
    "time"
)

type QuoteResponse struct {
    Content string \`json:"content"\`
    Link    string \`json:"link"\`
}

func getRandomQuote(repoName string) (*QuoteResponse, error) {
    url := fmt.Sprintf("${baseUrl}/api/random/%s", repoName)

    client := &http.Client{
        Timeout: 10 * time.Second,
    }

    resp, err := client.Get(url)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        return nil, err
    }

    var quote QuoteResponse
    err = json.Unmarshal(body, &quote)
    if err != nil {
        return nil, err
    }

    return &quote, nil
}

func main() {
    quote, err := getRandomQuote("${selectedRepo}")
    if err != nil {
        fmt.Println("错误:", err)
        return
    }

    fmt.Println("语句:", quote.Content)
    fmt.Println("链接:", quote.Link)
}`,

    csharp: `using System;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;

class QuoteAPI
{
    private static readonly HttpClient client = new HttpClient();
    private const string BASE_URL = "${baseUrl}/api/random";

    static async Task Main(string[] args)
    {
        try
        {
            var quote = await GetRandomQuote("${selectedRepo}");
            Console.WriteLine($"语句: {quote}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"错误: {ex.Message}");
        }
    }

    static async Task<string> GetRandomQuote(string repoName)
    {
        var url = $"{BASE_URL}/{repoName}";
        var response = await client.GetStringAsync(url);

        var json = JObject.Parse(response);
        return json["content"].ToString();
    }
}`,

    ruby: `require 'net/http'
require 'json'
require 'uri'

def get_random_quote(repo_name = '${selectedRepo}')
  url = URI("${baseUrl}/api/random/#{repo_name}")

  response = Net::HTTP.get_response(url)

  if response.is_a?(Net::HTTPSuccess)
    data = JSON.parse(response.body)
    {
      content: data['content'],
      link: data['link']
    }
  else
    nil
  end
end

# 使用示例
quote = get_random_quote
if quote
  puts "语句: #{quote[:content]}"
  puts "链接: #{quote[:link]}"
end`
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('代码已复制到剪贴板');
  };

  return (
    <div className="api-docs">
      <div className="container">
        <div className="docs-header">
          <h1>API 使用教程</h1>
          <p className="docs-subtitle">
            简单易用的语句API，支持多种编程语言和场景
          </p>
        </div>

        <section className="docs-section">
          <h2>快速开始</h2>
          <div className="card">
            <h3>API 端点</h3>
            <code className="api-endpoint">GET /api/random/{'{'}仓库名{'}'}</code>

            <h3 className="mt-20">响应格式</h3>
            <pre className="code-block">
{`{
  "content": "语句内容",
  "link": "/quote/123"
}`}
            </pre>

            <h3 className="mt-20">示例请求</h3>
            <div className="repo-input">
              <label>仓库名：</label>
              <input
                type="text"
                className="input"
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
                placeholder="输入仓库名"
              />
            </div>
            <code className="api-url-example">{baseUrl}/api/random/{selectedRepo}</code>
          </div>
        </section>

        <section className="docs-section">
          <h2>代码示例</h2>

          <div className="example-card card">
            <div className="example-header">
              <h3>命令行 (cURL)</h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => copyToClipboard(codeExamples.curl)}
              >
                复制代码
              </button>
            </div>
            <pre className="code-block">{codeExamples.curl}</pre>
          </div>

          <div className="example-card card">
            <div className="example-header">
              <h3>HTML 示例（无样式版）</h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => copyToClipboard(codeExamples.htmlBasic)}
              >
                复制代码
              </button>
            </div>
            <pre className="code-block">{codeExamples.htmlBasic}</pre>
          </div>

          <div className="example-card card">
            <div className="example-header">
              <h3>HTML 示例（带样式版）</h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => copyToClipboard(codeExamples.htmlStyled)}
              >
                复制代码
              </button>
            </div>
            <pre className="code-block">{codeExamples.htmlStyled}</pre>
          </div>

          <div className="example-card card">
            <div className="example-header">
              <h3>JavaScript</h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => copyToClipboard(codeExamples.javascript)}
              >
                复制代码
              </button>
            </div>
            <pre className="code-block">{codeExamples.javascript}</pre>
          </div>

          <div className="example-card card">
            <div className="example-header">
              <h3>Python</h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => copyToClipboard(codeExamples.python)}
              >
                复制代码
              </button>
            </div>
            <pre className="code-block">{codeExamples.python}</pre>
          </div>

          <div className="example-card card">
            <div className="example-header">
              <h3>Java</h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => copyToClipboard(codeExamples.java)}
              >
                复制代码
              </button>
            </div>
            <pre className="code-block">{codeExamples.java}</pre>
          </div>

          <div className="example-card card">
            <div className="example-header">
              <h3>PHP</h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => copyToClipboard(codeExamples.php)}
              >
                复制代码
              </button>
            </div>
            <pre className="code-block">{codeExamples.php}</pre>
          </div>

          <div className="example-card card">
            <div className="example-header">
              <h3>Go</h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => copyToClipboard(codeExamples.go)}
              >
                复制代码
              </button>
            </div>
            <pre className="code-block">{codeExamples.go}</pre>
          </div>

          <div className="example-card card">
            <div className="example-header">
              <h3>C#</h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => copyToClipboard(codeExamples.csharp)}
              >
                复制代码
              </button>
            </div>
            <pre className="code-block">{codeExamples.csharp}</pre>
          </div>

          <div className="example-card card">
            <div className="example-header">
              <h3>Ruby</h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => copyToClipboard(codeExamples.ruby)}
              >
                复制代码
              </button>
            </div>
            <pre className="code-block">{codeExamples.ruby}</pre>
          </div>
        </section>

        <section className="docs-section">
          <h2>获取语句详情页链接</h2>
          <p className="section-desc">
            API返回的<code>link</code>字段包含该语句的详情页面链接，您可以将其用作"查看详情"或"阅读更多"的跳转地址。
          </p>

          <div className="card">
            <h3>响应示例</h3>
            <pre className="code-block">{`{
  "content": "床前明月光，疑是地上霜。",
  "link": "${baseUrl}/repository/1"
}`}</pre>
          </div>

          <div className="example-card card">
            <div className="example-header">
              <h3>在HTML中使用link字段</h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => copyToClipboard(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>每日一句</title>
    <style>
        .quote-box {
            padding: 30px;
            background: #f8f9fa;
            border-radius: 12px;
            max-width: 600px;
            margin: 50px auto;
        }
        #quote {
            font-size: 20px;
            line-height: 1.8;
            margin-bottom: 20px;
            color: #333;
            white-space: pre-wrap;
        }
        .detail-link {
            display: inline-block;
            padding: 10px 20px;
            background: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            transition: background 0.3s;
        }
        .detail-link:hover {
            background: #0056b3;
        }
    </style>
</head>
<body>
    <div class="quote-box">
        <div id="quote">加载中...</div>
        <a id="detailLink" href="#" class="detail-link" target="_blank">查看详情</a>
    </div>

    <script>
        fetch('${baseUrl}/api/random/${selectedRepo}')
            .then(res => res.json())
            .then(data => {
                document.getElementById('quote').textContent = data.content;
                document.getElementById('detailLink').href = data.link;
            })
            .catch(error => {
                document.getElementById('quote').textContent = '加载失败';
            });
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
    <title>每日一句</title>
    <style>
        .quote-box {
            padding: 30px;
            background: #f8f9fa;
            border-radius: 12px;
            max-width: 600px;
            margin: 50px auto;
        }
        #quote {
            font-size: 20px;
            line-height: 1.8;
            margin-bottom: 20px;
            color: #333;
            white-space: pre-wrap;
        }
        .detail-link {
            display: inline-block;
            padding: 10px 20px;
            background: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            transition: background 0.3s;
        }
        .detail-link:hover {
            background: #0056b3;
        }
    </style>
</head>
<body>
    <div class="quote-box">
        <div id="quote">加载中...</div>
        <a id="detailLink" href="#" class="detail-link" target="_blank">查看详情</a>
    </div>

    <script>
        fetch('${baseUrl}/api/random/${selectedRepo}')
            .then(res => res.json())
            .then(data => {
                document.getElementById('quote').textContent = data.content;
                document.getElementById('detailLink').href = data.link;
            })
            .catch(error => {
                document.getElementById('quote').textContent = '加载失败';
            });
    </script>
</body>
</html>`}</pre>
          </div>
        </section>

        <section className="docs-section">
          <h2>使用场景</h2>
          <div className="use-cases">
            <div className="use-case-card card">
              <h3>网站每日一句</h3>
              <p>在网站首页展示随机诗词或名言，提升用户体验</p>
            </div>
            <div className="use-case-card card">
              <h3>微信公众号</h3>
              <p>定时推送精选语句，增加粉丝互动</p>
            </div>
            <div className="use-case-card card">
              <h3>桌面小部件</h3>
              <p>开发桌面插件，显示励志名言或诗词</p>
            </div>
            <div className="use-case-card card">
              <h3>APP开屏页</h3>
              <p>应用启动时展示随机语句</p>
            </div>
          </div>
        </section>

        <section className="docs-section">
          <h2>注意事项</h2>
          <div className="card">
            <ul className="note-list">
              <li>API 完全免费，无需认证即可使用</li>
              <li>建议合理控制请求频率，避免频繁调用</li>
              <li>返回的语句内容可能包含换行符</li>
              <li>如果仓库不存在或没有语句，会返回错误信息</li>
              <li>支持跨域请求（CORS）</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ApiDocs;
