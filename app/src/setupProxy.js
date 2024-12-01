const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5001',
      changeOrigin: true,
      onError: (err, req, res) => {
        console.error('Proxy Error:', err);
      },
      logLevel: 'debug'
    })
  );
}; 