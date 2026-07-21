const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname);
let currentPort = parseInt(process.env.PORT || '5500', 10);

const mime = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  const filePath = path.join(ROOT, reqPath);
  if (!filePath.startsWith(ROOT)) return res.writeHead(403).end('Forbidden');
  fs.stat(filePath, (err, st) => {
    if (err) return res.writeHead(404).end('Not found');
    if (st.isDirectory()) return res.writeHead(302, { Location: reqPath + '/' }).end();
    const ext = path.extname(filePath).toLowerCase();
    const type = mime[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Access-Control-Allow-Origin': '*' });
    fs.createReadStream(filePath).pipe(res);
  });
});

function startServer(port) {
  server.listen(port, '127.0.0.1', () => {
    console.log(`\n🚀 Static server running at http://127.0.0.1:${port}/\n`);
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`Port ${currentPort} in use. Trying port ${currentPort + 1}...`);
    currentPort++;
    startServer(currentPort);
  } else {
    console.error('Server error:', err);
  }
});

startServer(currentPort);

// Allow graceful exit
process.on('SIGINT', () => process.exit(0));
