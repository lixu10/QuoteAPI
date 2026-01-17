// 将UTC时间转换为东八区（UTC+8 / 北京时间）并格式化

// 格式化为中文日期时间字符串（使用东八区时间）
export const formatBeijingDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);

  // 使用toLocaleString with Asia/Shanghai时区
  return date.toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

// 格式化为中文日期字符串（使用东八区时间）
export const formatBeijingDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);

  return date.toLocaleDateString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};
