import { Endpoint } from '../models/Endpoint.js';
import { Repository } from '../models/Repository.js';
import { Quote } from '../models/Quote.js';
import systemConfig from '../models/SystemConfig.js';
import { spawn } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

export class EndpointService {
  constructor() {
    this.endpointModel = new Endpoint();
    this.repoModel = new Repository();
    this.quoteModel = new Quote();
  }

  getUserEndpoints(userId) {
    return this.endpointModel.findByUserId(userId);
  }

  getEndpoint(id) {
    return this.endpointModel.findById(id);
  }

  createEndpoint(name, userId, description, code, visibility = 'public', metadata = '{}') {
    const existing = this.endpointModel.findByName(name);
    if (existing) {
      throw new Error('端口名称已存在');
    }

    return this.endpointModel.createEndpoint(name, userId, description, code, visibility, metadata);
  }

  updateEndpoint(id, userId, data) {
    const endpoint = this.endpointModel.findById(id);
    if (!endpoint) {
      throw new Error('端口不存在');
    }

    if (endpoint.user_id !== userId) {
      throw new Error('无权修改此端口');
    }

    // 检查名称冲突
    if (data.name && data.name !== endpoint.name) {
      const existing = this.endpointModel.findByName(data.name);
      if (existing) {
        throw new Error('端口名称已存在');
      }
    }

    return this.endpointModel.updateEndpoint(id, data);
  }

  deleteEndpoint(id, userId) {
    const endpoint = this.endpointModel.findById(id);
    if (!endpoint) {
      throw new Error('端口不存在');
    }

    if (endpoint.user_id !== userId) {
      throw new Error('无权删除此端口');
    }

    return this.endpointModel.delete(id);
  }

  toggleEndpoint(id, userId) {
    const endpoint = this.endpointModel.findById(id);
    if (!endpoint) {
      throw new Error('端口不存在');
    }

    if (endpoint.user_id !== userId) {
      throw new Error('无权操作此端口');
    }

    return this.endpointModel.toggleActive(id);
  }

  // 执行端口代码
  async executeEndpoint(name, requestData) {
    const endpoint = this.endpointModel.findByName(name);

    if (!endpoint) {
      throw new Error('端口不存在');
    }

    if (!endpoint.is_active) {
      throw new Error('端口已禁用');
    }

    // 增加调用计数
    this.endpointModel.incrementCallCount(endpoint.id);

    // 准备执行环境，传入端口所有者的 user_id
    const context = this.buildContext(requestData, endpoint.user_id);
    const result = await this.runPythonCode(endpoint.code, context);

    return result;
  }

  // 构建执行上下文
  buildContext(requestData, endpointUserId) {
    // 使用东八区时间（UTC+8）
    const now = new Date();
    const chinaTime = new Date(now.getTime() + (8 * 60 * 60 * 1000) + (now.getTimezoneOffset() * 60 * 1000));

    // 获取 AI 配置
    const aiConfig = systemConfig.getAiConfig();

    return {
      // 时间相关（东八区）
      current_date: chinaTime.toISOString().split('T')[0],
      current_time: chinaTime.toTimeString().split(' ')[0],
      current_datetime: chinaTime.toISOString(),
      current_timestamp: chinaTime.getTime(),
      current_year: chinaTime.getUTCFullYear(),
      current_month: chinaTime.getUTCMonth() + 1,
      current_day: chinaTime.getUTCDate(),
      current_hour: chinaTime.getUTCHours(),
      current_minute: chinaTime.getUTCMinutes(),
      current_second: chinaTime.getUTCSeconds(),
      current_weekday: chinaTime.getUTCDay(), // 0-6, 0=Sunday
      current_weekday_name: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][chinaTime.getUTCDay()],
      current_weekday_cn: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][chinaTime.getUTCDay()],
      is_weekend: chinaTime.getUTCDay() === 0 || chinaTime.getUTCDay() === 6,
      is_weekday: chinaTime.getUTCDay() >= 1 && chinaTime.getUTCDay() <= 5,

      // 请求相关
      ip_address: requestData.ip || '',
      user_agent: requestData.userAgent || '',
      referer: requestData.referer || '',

      // 端口输入参数（新增）
      params: requestData.params || {},

      // 端口所有者ID，用于权限检查
      endpoint_user_id: endpointUserId,

      // AI 配置
      ai_api_url: aiConfig.apiUrl || '',
      ai_api_key: aiConfig.apiKey || '',
      ai_model: aiConfig.model || '',
      ai_configured: !!(aiConfig.apiUrl && aiConfig.apiKey && aiConfig.model),

      // 随机数相关（通过Python的random模块）
      // 这些会在Python代码中实现
    };
  }

  // 获取Python命令（Windows使用python，Linux/Mac使用python3）
  getPythonCommand() {
    return process.platform === 'win32' ? 'python' : 'python3';
  }

  // 运行Python代码（沙箱环境）
  async runPythonCode(userCode, context) {
    return new Promise((resolve, reject) => {
      // 构建完整的Python代码
      const fullCode = this.buildPythonScript(userCode, context);

      // 创建临时文件
      const tempFile = join(tmpdir(), `endpoint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.py`);

      try {
        writeFileSync(tempFile, fullCode, 'utf8');

        // 执行Python代码（根据系统选择命令）
        const pythonCmd = this.getPythonCommand();
        const python = spawn(pythonCmd, [tempFile], {
          timeout: 5000, // 5秒超时
          env: { ...process.env, PYTHONPATH: '' }
        });

        let stdout = '';
        let stderr = '';

        python.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        python.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        python.on('close', (code) => {
          // 删除临时文件
          try {
            unlinkSync(tempFile);
          } catch (e) {
            // 忽略删除错误
          }

          if (code !== 0) {
            reject(new Error(stderr || '代码执行失败'));
          } else {
            try {
              const result = JSON.parse(stdout.trim());
              resolve(result);
            } catch (e) {
              reject(new Error('返回值格式错误，必须返回有效的JSON'));
            }
          }
        });

        python.on('error', (err) => {
          try {
            unlinkSync(tempFile);
          } catch (e) {
            // 忽略
          }
          reject(new Error('Python执行错误: ' + err.message));
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  // 构建完整的Python脚本
  buildPythonScript(userCode, context) {
    // 给用户代码添加缩进（4个空格）
    const indentedUserCode = userCode.split('\n').map(line => '    ' + line).join('\n');

    // 将 params 对象转换为 Python 字典
    const paramsJson = JSON.stringify(context.params || {});

    return `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import random
import hashlib
import base64
import uuid as uuid_module
import string
import re
import html
import ssl
from datetime import datetime, timedelta
import urllib.request
import urllib.parse

# 上下文变量
${Object.entries(context).map(([key, value]) => {
  if (key === 'params') {
    return `params = json.loads('${paramsJson.replace(/'/g, "\\'")}')`;
  } else if (typeof value === 'string') {
    return `${key} = ${JSON.stringify(value)}`;
  } else if (typeof value === 'boolean') {
    return `${key} = ${value ? 'True' : 'False'}`;
  } else {
    return `${key} = ${value}`;
  }
}).join('\n')}

# ============ 辅助函数库 ============

# ------------ API 调用相关 ------------
def get_random_quote(repo_name):
    """从指定仓库获取随机语句，返回包含content和link的字典"""
    try:
        url = f'http://localhost:3077/api/random/{urllib.parse.quote(repo_name)}'
        # 创建请求并添加端口所有者ID到头部，用于权限检查
        req = urllib.request.Request(url)
        req.add_header('X-Forwarded-For', ip_address)
        req.add_header('User-Agent', user_agent)
        req.add_header('X-Endpoint-User-Id', str(endpoint_user_id))
        if referer:
            req.add_header('Referer', referer)

        with urllib.request.urlopen(req, timeout=3) as response:
            data = json.loads(response.read().decode('utf-8'))
            return {
                'content': data.get('content', ''),
                'link': data.get('link', '')
            }
    except Exception as e:
        return {'content': f'Error: {str(e)}', 'link': ''}

def call_endpoint(endpoint_name, endpoint_params=None):
    """调用系统中的其他端口，返回端口执行结果。支持传递参数"""
    try:
        base_url = f'http://localhost:3077/endpoints/run/{urllib.parse.quote(endpoint_name)}'

        if endpoint_params:
            # POST 请求带参数
            data = json.dumps(endpoint_params).encode('utf-8')
            req = urllib.request.Request(base_url, data=data, method='POST')
            req.add_header('Content-Type', 'application/json')
        else:
            req = urllib.request.Request(base_url)

        req.add_header('X-Forwarded-For', ip_address)
        req.add_header('User-Agent', user_agent)
        req.add_header('X-Endpoint-User-Id', str(endpoint_user_id))
        if referer:
            req.add_header('Referer', referer)

        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))
            return data
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8') if e.fp else ''
        try:
            error_data = json.loads(error_body)
            return {'error': error_data.get('error', f'HTTP {e.code}')}
        except:
            return {'error': f'HTTP {e.code}: {error_body[:100]}'}
    except Exception as e:
        return {'error': f'调用端口失败: {str(e)}'}

def fetch_json(url, method='GET', body=None, headers=None, timeout=10):
    """调用外部 API，返回 JSON 数据

    Args:
        url: 请求 URL
        method: HTTP 方法 (GET/POST/PUT/DELETE)
        body: POST 请求体（字典或列表）
        headers: 额外的请求头（字典）
        timeout: 超时时间（秒），默认10秒，最大30秒

    Returns:
        dict: 解析后的 JSON 数据，出错时返回 {'error': '错误信息'}
    """
    try:
        # 安全限制
        timeout = min(timeout, 30)  # 最大30秒

        # 构建请求
        if body:
            data = json.dumps(body).encode('utf-8')
            req = urllib.request.Request(url, data=data, method=method)
            req.add_header('Content-Type', 'application/json')
        else:
            req = urllib.request.Request(url, method=method)

        req.add_header('User-Agent', 'QuoteAPI-Endpoint/1.0')
        req.add_header('Accept', 'application/json')

        # 添加自定义 headers
        if headers:
            for key, value in headers.items():
                req.add_header(key, value)

        # 创建 SSL 上下文
        ssl_context = ssl.create_default_context()

        with urllib.request.urlopen(req, timeout=timeout, context=ssl_context) as response:
            response_data = response.read()
            # 限制响应大小为 1MB
            if len(response_data) > 1024 * 1024:
                return {'error': '响应数据过大（超过1MB）'}
            return json.loads(response_data.decode('utf-8'))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')[:500] if e.fp else ''
        try:
            error_data = json.loads(error_body)
            return {'error': f'HTTP {e.code}', 'details': error_data}
        except:
            return {'error': f'HTTP {e.code}: {error_body[:200]}'}
    except urllib.error.URLError as e:
        return {'error': f'网络错误: {str(e.reason)}'}
    except json.JSONDecodeError:
        return {'error': '响应不是有效的 JSON 格式'}
    except Exception as e:
        return {'error': f'请求失败: {str(e)}'}

def ask_ai(prompt, max_tokens=1000):
    """调用AI大模型，传入prompt，返回模型响应内容"""
    if not ai_configured:
        return 'Error: AI 未配置，请联系管理员在后台配置 AI 参数'

    if not prompt or not isinstance(prompt, str):
        return 'Error: prompt 必须是非空字符串'

    try:
        # 构建请求数据
        request_data = json.dumps({
            'model': ai_model,
            'messages': [{'role': 'user', 'content': prompt}],
            'max_tokens': max_tokens
        }).encode('utf-8')

        # 创建请求
        req = urllib.request.Request(ai_api_url, data=request_data)
        req.add_header('Content-Type', 'application/json')
        req.add_header('Authorization', f'Bearer {ai_api_key}')

        with urllib.request.urlopen(req, timeout=30) as response:
            data = json.loads(response.read().decode('utf-8'))
            # 提取响应内容
            if 'choices' in data and len(data['choices']) > 0:
                message = data['choices'][0].get('message', {})
                return message.get('content', '')
            return 'Error: 无法解析 AI 响应'
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8') if e.fp else ''
        try:
            error_data = json.loads(error_body)
            error_msg = error_data.get('error', {})
            if isinstance(error_msg, dict):
                return f"Error: {error_msg.get('message', f'HTTP {e.code}')}"
            return f"Error: {error_msg}"
        except:
            return f'Error: HTTP {e.code}'
    except Exception as e:
        return f'Error: AI 调用失败 - {str(e)}'

# ------------ 随机数相关 ------------
def random_int(min_val=0, max_val=100):
    """生成随机整数"""
    return random.randint(min_val, max_val)

def random_float(min_val=0.0, max_val=1.0):
    """生成随机浮点数"""
    return random.uniform(min_val, max_val)

def random_choice(items):
    """从列表中随机选择一项"""
    return random.choice(items)

def shuffle_list(items):
    """打乱列表顺序"""
    shuffled = items.copy()
    random.shuffle(shuffled)
    return shuffled

# ------------ 加密编码相关 ------------
def md5(text):
    """计算MD5哈希"""
    return hashlib.md5(text.encode()).hexdigest()

def sha256(text):
    """计算SHA256哈希"""
    return hashlib.sha256(text.encode()).hexdigest()

def base64_encode(text):
    """Base64编码"""
    return base64.b64encode(text.encode()).decode()

def base64_decode(text):
    """Base64解码"""
    return base64.b64decode(text.encode()).decode()

# ------------ 实用工具函数 ------------
def uuid():
    """生成 UUID"""
    return str(uuid_module.uuid4())

def short_id(length=8):
    """生成短随机ID"""
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

def url_encode(text):
    """URL 编码"""
    return urllib.parse.quote(text, safe='')

def url_decode(text):
    """URL 解码"""
    return urllib.parse.unquote(text)

def time_ago(timestamp):
    """计算时间距离，返回中文描述

    Args:
        timestamp: 时间戳（秒或毫秒）或 ISO 格式日期字符串

    Returns:
        str: 如 '3天前', '刚刚', '2小时前'
    """
    try:
        if isinstance(timestamp, str):
            dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            target_ts = dt.timestamp()
        else:
            # 如果是毫秒级时间戳，转换为秒
            target_ts = timestamp / 1000 if timestamp > 10000000000 else timestamp

        now_ts = datetime.now().timestamp()
        diff = now_ts - target_ts

        if diff < 0:
            return '未来'
        elif diff < 60:
            return '刚刚'
        elif diff < 3600:
            return f'{int(diff / 60)}分钟前'
        elif diff < 86400:
            return f'{int(diff / 3600)}小时前'
        elif diff < 2592000:
            return f'{int(diff / 86400)}天前'
        elif diff < 31536000:
            return f'{int(diff / 2592000)}个月前'
        else:
            return f'{int(diff / 31536000)}年前'
    except Exception as e:
        return f'Error: {str(e)}'

def countdown_to(date_str):
    """计算距离指定日期的倒计时

    Args:
        date_str: 目标日期，格式 'YYYY-MM-DD' 或 'YYYY-MM-DD HH:MM:SS'

    Returns:
        dict: {'days': 天数, 'hours': 小时, 'minutes': 分钟, 'seconds': 秒, 'total_seconds': 总秒数}
    """
    try:
        if len(date_str) == 10:
            target = datetime.strptime(date_str, '%Y-%m-%d')
        else:
            target = datetime.strptime(date_str, '%Y-%m-%d %H:%M:%S')

        now = datetime.now()
        diff = target - now
        total_seconds = int(diff.total_seconds())

        if total_seconds < 0:
            return {'days': 0, 'hours': 0, 'minutes': 0, 'seconds': 0, 'total_seconds': 0, 'passed': True}

        days = diff.days
        hours = diff.seconds // 3600
        minutes = (diff.seconds % 3600) // 60
        seconds = diff.seconds % 60

        return {
            'days': days,
            'hours': hours,
            'minutes': minutes,
            'seconds': seconds,
            'total_seconds': total_seconds,
            'passed': False
        }
    except Exception as e:
        return {'error': str(e)}

def generate_password(length=16, include_special=True):
    """生成随机密码

    Args:
        length: 密码长度，默认16
        include_special: 是否包含特殊字符

    Returns:
        str: 随机密码
    """
    chars = string.ascii_letters + string.digits
    if include_special:
        chars += '!@#$%^&*'

    # 确保包含各类字符
    password = [
        random.choice(string.ascii_lowercase),
        random.choice(string.ascii_uppercase),
        random.choice(string.digits),
    ]
    if include_special:
        password.append(random.choice('!@#$%^&*'))

    # 填充剩余长度
    password.extend(random.choice(chars) for _ in range(length - len(password)))
    random.shuffle(password)
    return ''.join(password)

def get_constellation(month, day):
    """获取星座

    Args:
        month: 月份 (1-12)
        day: 日期 (1-31)

    Returns:
        str: 星座名称
    """
    dates = [
        (1, 20, '水瓶座'), (2, 19, '双鱼座'), (3, 21, '白羊座'),
        (4, 20, '金牛座'), (5, 21, '双子座'), (6, 21, '巨蟹座'),
        (7, 23, '狮子座'), (8, 23, '处女座'), (9, 23, '天秤座'),
        (10, 23, '天蝎座'), (11, 22, '射手座'), (12, 22, '摩羯座')
    ]

    for i, (m, d, name) in enumerate(dates):
        if month == m and day < d:
            return dates[i - 1][2]
        if month == m and day >= d:
            return name
    return '摩羯座'

# ------------ 文本处理函数 ------------
def word_count(text):
    """统计字数

    Returns:
        dict: {'chars': 总字符数, 'chars_no_space': 非空格字符数, 'words': 英文单词数, 'lines': 行数, 'chinese': 中文字符数}
    """
    lines = len(text.split('\\n'))
    chars = len(text)
    chars_no_space = len(text.replace(' ', '').replace('\\n', '').replace('\\t', ''))
    words = len(text.split())
    chinese = len(re.findall(r'[\\u4e00-\\u9fff]', text))

    return {
        'chars': chars,
        'chars_no_space': chars_no_space,
        'words': words,
        'lines': lines,
        'chinese': chinese
    }

def truncate(text, length, suffix='...'):
    """截断文本

    Args:
        text: 原始文本
        length: 最大长度
        suffix: 截断后缀，默认 '...'

    Returns:
        str: 截断后的文本
    """
    if len(text) <= length:
        return text
    return text[:length - len(suffix)] + suffix

def regex_match(pattern, text, flags=0):
    """正则匹配，返回所有匹配结果

    Args:
        pattern: 正则表达式
        text: 待匹配文本
        flags: 正则标志（可选）

    Returns:
        list: 匹配结果列表
    """
    try:
        return re.findall(pattern, text, flags)
    except Exception as e:
        return {'error': str(e)}

def regex_replace(pattern, repl, text, count=0):
    """正则替换

    Args:
        pattern: 正则表达式
        repl: 替换内容
        text: 原始文本
        count: 最大替换次数，0表示全部替换

    Returns:
        str: 替换后的文本
    """
    try:
        return re.sub(pattern, repl, text, count=count)
    except Exception as e:
        return f'Error: {str(e)}'

def html_escape(text):
    """HTML 转义"""
    return html.escape(text)

def remove_html(text):
    """移除 HTML 标签"""
    return re.sub(r'<[^>]+>', '', text)

# ------------ 日期时间相关 ------------
def format_date(date_str, format='%Y-%m-%d'):
    """格式化日期"""
    dt = datetime.fromisoformat(date_str)
    return dt.strftime(format)

def add_days(date_str, days):
    """日期加天数"""
    dt = datetime.fromisoformat(date_str)
    new_dt = dt + timedelta(days=days)
    return new_dt.isoformat()

def get_season():
    """获取当前季节"""
    month = current_month
    if month in [3, 4, 5]:
        return '春季'
    elif month in [6, 7, 8]:
        return '夏季'
    elif month in [9, 10, 11]:
        return '秋季'
    else:
        return '冬季'

def is_holiday():
    """判断是否是节假日（示例：仅判断一些固定节日）"""
    month_day = f'{current_month:02d}-{current_day:02d}'
    holidays = ['01-01', '05-01', '10-01', '12-25']
    return month_day in holidays

def chinese_zodiac():
    """获取生肖"""
    zodiacs = ['猴', '鸡', '狗', '猪', '鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊']
    return zodiacs[current_year % 12]

def days_until_weekend():
    """距离周末还有几天"""
    if current_weekday == 0:  # Sunday
        return 6
    elif current_weekday == 6:  # Saturday
        return 0
    else:
        return 6 - current_weekday

def greeting():
    """根据时间返回问候语"""
    hour = current_hour
    if 5 <= hour < 12:
        return '早上好'
    elif 12 <= hour < 14:
        return '中午好'
    elif 14 <= hour < 18:
        return '下午好'
    elif 18 <= hour < 22:
        return '晚上好'
    else:
        return '夜深了'

# ------------ 中国特色功能 ------------
def get_lunar_date():
    """获取农历日期（简化版，基于公式估算）

    Returns:
        dict: {'year': 干支年, 'month': 农历月, 'day': 农历日, 'zodiac': 生肖}
    """
    # 天干地支
    heavenly_stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
    earthly_branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
    zodiacs = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']

    lunar_months = ['正月', '二月', '三月', '四月', '五月', '六月',
                    '七月', '八月', '九月', '十月', '冬月', '腊月']
    lunar_days = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
                  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
                  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十']

    year = current_year
    stem_index = (year - 4) % 10
    branch_index = (year - 4) % 12

    # 简化估算农历月日（实际需要完整农历算法）
    month_offset = (current_month + 10) % 12
    day_offset = (current_day - 1) % 30

    return {
        'year': heavenly_stems[stem_index] + earthly_branches[branch_index],
        'month': lunar_months[month_offset],
        'day': lunar_days[day_offset],
        'zodiac': zodiacs[branch_index]
    }

def get_solar_term():
    """获取当前/最近节气

    Returns:
        dict: {'name': 节气名称, 'date': 日期}
    """
    solar_terms = [
        ('小寒', 1, 6), ('大寒', 1, 20),
        ('立春', 2, 4), ('雨水', 2, 19),
        ('惊蛰', 3, 6), ('春分', 3, 21),
        ('清明', 4, 5), ('谷雨', 4, 20),
        ('立夏', 5, 6), ('小满', 5, 21),
        ('芒种', 6, 6), ('夏至', 6, 21),
        ('小暑', 7, 7), ('大暑', 7, 23),
        ('立秋', 8, 8), ('处暑', 8, 23),
        ('白露', 9, 8), ('秋分', 9, 23),
        ('寒露', 10, 8), ('霜降', 10, 23),
        ('立冬', 11, 7), ('小雪', 11, 22),
        ('大雪', 12, 7), ('冬至', 12, 22)
    ]

    # 找到最近的节气
    current = (current_month, current_day)
    prev_term = solar_terms[-1]

    for name, month, day in solar_terms:
        if (month, day) > current:
            return {
                'current': prev_term[0],
                'current_date': f'{current_year}-{prev_term[1]:02d}-{prev_term[2]:02d}',
                'next': name,
                'next_date': f'{current_year}-{month:02d}-{day:02d}'
            }
        prev_term = (name, month, day)

    # 年末情况
    return {
        'current': prev_term[0],
        'current_date': f'{current_year}-{prev_term[1]:02d}-{prev_term[2]:02d}',
        'next': solar_terms[0][0],
        'next_date': f'{current_year + 1}-{solar_terms[0][1]:02d}-{solar_terms[0][2]:02d}'
    }

def get_chinese_festival():
    """获取今天是否是中国传统节日

    Returns:
        dict 或 None: {'name': 节日名称, 'date': 日期} 或 None
    """
    # 固定日期节日
    fixed_festivals = {
        '01-01': '元旦',
        '02-14': '情人节',
        '03-08': '妇女节',
        '04-01': '愚人节',
        '05-01': '劳动节',
        '05-04': '青年节',
        '06-01': '儿童节',
        '07-01': '建党节',
        '08-01': '建军节',
        '09-10': '教师节',
        '10-01': '国庆节',
        '12-25': '圣诞节'
    }

    today = f'{current_month:02d}-{current_day:02d}'
    if today in fixed_festivals:
        return {'name': fixed_festivals[today], 'date': current_date}

    return None

def is_workday():
    """判断是否工作日（简化版，只判断周一至周五）

    Returns:
        bool: True 表示工作日，False 表示休息日
    """
    # 简化版：周一到周五为工作日
    return 1 <= current_weekday <= 5

def chinese_number(num):
    """数字转中文

    Args:
        num: 整数（支持负数，范围 -99999999 到 99999999）

    Returns:
        str: 中文数字
    """
    digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
    units = ['', '十', '百', '千', '万', '十', '百', '千', '亿']

    if num == 0:
        return '零'

    result = ''
    if num < 0:
        result = '负'
        num = -num

    num_str = str(int(num))
    length = len(num_str)

    for i, digit in enumerate(num_str):
        d = int(digit)
        pos = length - i - 1

        if d != 0:
            result += digits[d] + units[pos]
        elif not result.endswith('零') and pos > 0:
            result += '零'

    # 处理特殊情况
    result = result.rstrip('零')
    if result.startswith('一十'):
        result = result[1:]

    return result or '零'

def text_to_pinyin(text):
    """汉字转拼音（简化版，仅支持常用字）

    注意：完整功能需要 pypinyin 库，这里提供简化实现

    Args:
        text: 中文文本

    Returns:
        str: 拼音（用空格分隔）
    """
    # 简化版：常用字拼音映射
    common_pinyin = {
        '你': 'nǐ', '好': 'hǎo', '我': 'wǒ', '是': 'shì', '的': 'de',
        '了': 'le', '在': 'zài', '有': 'yǒu', '和': 'hé', '人': 'rén',
        '这': 'zhè', '中': 'zhōng', '大': 'dà', '来': 'lái', '上': 'shàng',
        '国': 'guó', '个': 'gè', '到': 'dào', '说': 'shuō', '们': 'men',
        '为': 'wéi', '子': 'zǐ', '时': 'shí', '道': 'dào', '年': 'nián',
        '得': 'de', '就': 'jiù', '那': 'nà', '要': 'yào', '下': 'xià',
        '以': 'yǐ', '生': 'shēng', '会': 'huì', '自': 'zì', '着': 'zhe',
        '去': 'qù', '之': 'zhī', '过': 'guò', '家': 'jiā', '学': 'xué',
        '对': 'duì', '可': 'kě', '她': 'tā', '里': 'lǐ', '后': 'hòu',
        '小': 'xiǎo', '么': 'me', '心': 'xīn', '多': 'duō', '天': 'tiān',
        '而': 'ér', '能': 'néng', '好': 'hǎo', '都': 'dōu', '然': 'rán',
        '没': 'méi', '日': 'rì', '于': 'yú', '起': 'qǐ', '还': 'hái',
        '发': 'fā', '成': 'chéng', '事': 'shì', '只': 'zhǐ', '作': 'zuò',
        '当': 'dāng', '想': 'xiǎng', '看': 'kàn', '文': 'wén', '无': 'wú',
        '开': 'kāi', '手': 'shǒu', '十': 'shí', '用': 'yòng', '主': 'zhǔ',
        '行': 'xíng', '方': 'fāng', '又': 'yòu', '如': 'rú', '前': 'qián',
        '所': 'suǒ', '本': 'běn', '见': 'jiàn', '经': 'jīng', '头': 'tóu',
        '面': 'miàn', '公': 'gōng', '同': 'tóng', '三': 'sān', '己': 'jǐ',
        '老': 'lǎo', '从': 'cóng', '动': 'dòng', '两': 'liǎng', '长': 'cháng',
        '知': 'zhī', '民': 'mín', '样': 'yàng', '现': 'xiàn', '分': 'fēn',
        '将': 'jiāng', '外': 'wài', '但': 'dàn', '身': 'shēn', '些': 'xiē',
        '与': 'yǔ', '高': 'gāo', '意': 'yì', '进': 'jìn', '把': 'bǎ',
        '法': 'fǎ', '此': 'cǐ', '实': 'shí', '回': 'huí', '二': 'èr',
        '理': 'lǐ', '美': 'měi', '点': 'diǎn', '月': 'yuè', '明': 'míng'
    }

    result = []
    for char in text:
        if char in common_pinyin:
            result.append(common_pinyin[char])
        elif '\\u4e00' <= char <= '\\u9fff':
            result.append(char)  # 未知汉字保留原字
        else:
            result.append(char)  # 非汉字保留

    return ' '.join(result)

# 用户代码
try:
${indentedUserCode}

    # 确保用户代码返回了result
    if 'result' not in locals():
        result = {'error': '代码必须定义result变量'}

    # 输出JSON结果
    print(json.dumps(result, ensure_ascii=False))
except Exception as e:
    print(json.dumps({'error': str(e)}, ensure_ascii=False))
`;
  }
}
