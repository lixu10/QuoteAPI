import { Endpoint } from '../models/Endpoint.js';
import { Repository } from '../models/Repository.js';
import { Quote } from '../models/Quote.js';
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

  createEndpoint(name, userId, description, code) {
    const existing = this.endpointModel.findByName(name);
    if (existing) {
      throw new Error('端口名称已存在');
    }

    return this.endpointModel.createEndpoint(name, userId, description, code);
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

    // 准备执行环境
    const context = this.buildContext(requestData);
    const result = await this.runPythonCode(endpoint.code, context);

    return result;
  }

  // 构建执行上下文
  buildContext(requestData) {
    // 使用东八区时间（UTC+8）
    const now = new Date();
    const chinaTime = new Date(now.getTime() + (8 * 60 * 60 * 1000) + (now.getTimezoneOffset() * 60 * 1000));

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

    return `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import random
import hashlib
import base64
from datetime import datetime, timedelta
import urllib.request
import urllib.parse

# 上下文变量
${Object.entries(context).map(([key, value]) => {
  if (typeof value === 'string') {
    return `${key} = ${JSON.stringify(value)}`;
  } else if (typeof value === 'boolean') {
    return `${key} = ${value ? 'True' : 'False'}`;
  } else {
    return `${key} = ${value}`;
  }
}).join('\n')}

# 辅助函数库
def get_random_quote(repo_name):
    """从指定仓库获取随机语句，返回包含content和link的字典"""
    try:
        url = f'http://localhost:3077/api/random/{urllib.parse.quote(repo_name)}'
        # 创建请求并添加真实客户端IP到头部
        req = urllib.request.Request(url)
        req.add_header('X-Forwarded-For', ip_address)
        req.add_header('User-Agent', user_agent)
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
