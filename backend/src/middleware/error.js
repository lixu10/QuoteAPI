export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    error: err.message || '服务器内部错误'
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({ error: '请求的资源不存在' });
};
