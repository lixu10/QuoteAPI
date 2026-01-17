/**
 * 获取客户端真实IP地址
 * 优先从X-Forwarded-For或X-Real-IP头获取（Nginx代理环境）
 * @param {Request} req - Express请求对象
 * @returns {string} 客户端IP地址
 */
export function getClientIp(req) {
  // 1. 尝试从 X-Forwarded-For 获取（Nginx proxy_set_header）
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    // X-Forwarded-For 可能包含多个IP，取第一个（真实客户端IP）
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    return ips[0];
  }

  // 2. 尝试从 X-Real-IP 获取（Nginx proxy_set_header）
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return realIp;
  }

  // 3. 回退到 req.ip（Express提供）
  if (req.ip) {
    // 移除IPv6前缀 "::ffff:"
    return req.ip.replace(/^::ffff:/, '');
  }

  // 4. 最后尝试从 connection 获取
  if (req.connection && req.connection.remoteAddress) {
    return req.connection.remoteAddress.replace(/^::ffff:/, '');
  }

  // 5. 默认返回
  return 'unknown';
}
