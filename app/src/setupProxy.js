const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5001',
      changeOrigin: true,
      onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        
        // Проверяем тип ошибки
        const errorMessage = err.code === 'ECONNREFUSED' 
          ? 'Не удалось подключиться к серверу. Сервер не запущен или недоступен.'
          : 'Сервер временно недоступен';

        // Отправляем ответ с ошибкой
        if (!res.headersSent) {
          res.writeHead(503, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          });
          res.end(JSON.stringify({ 
            error: errorMessage,
            code: err.code,
            details: err.message
          }));
        }
      },
      logLevel: 'error',
      pathRewrite: {
        '^/api': '', // Убираем /api из URL при проксировании
      }
    })
  );
}; 