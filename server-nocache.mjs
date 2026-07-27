// 本地预览服务器：页面资源始终刷新，媒体资源支持缓存与按需字节读取。
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, 'dist');
const PORT = Number(process.env.PORT || 5173);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const NO_CACHE_EXTENSIONS = new Set(['.html', '.js', '.mjs', '.css', '.json']);

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    res.end();
    return;
  }

  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400);
    res.end('Bad request');
    return;
  }

  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.resolve(ROOT, `.${urlPath}`);
  if (filePath !== ROOT && !filePath.startsWith(`${ROOT}${path.sep}`)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (error, stat) => {
    if (error || !stat.isFile()) {
      // SPA 回退到 index.html（仅对无扩展名的路由）。
      if (!path.extname(urlPath)) {
        serveFile(req, res, path.join(ROOT, 'index.html'));
        return;
      }
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    serveFile(req, res, filePath, stat);
  });
});

function serveFile(req, res, filePath, knownStat) {
  const handleStat = (error, stat) => {
    if (error || !stat.isFile()) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const etag = `\"${stat.size.toString(16)}-${Math.trunc(stat.mtimeMs).toString(16)}\"`;
    const headers = {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Accept-Ranges': 'bytes',
      'Last-Modified': stat.mtime.toUTCString(),
      ETag: etag,
      'X-Content-Type-Options': 'nosniff',
      ...cacheHeaders(ext),
    };

    if (isNotModified(req, etag, stat)) {
      res.writeHead(304, headers);
      res.end();
      return;
    }

    const rangeHeader = shouldHonorRange(req, etag, stat) ? req.headers.range : undefined;
    if (rangeHeader) {
      const range = parseRange(rangeHeader, stat.size);
      if (!range) {
        res.writeHead(416, {
          ...headers,
          'Content-Range': `bytes */${stat.size}`,
          'Content-Length': '0',
        });
        res.end();
        return;
      }

      const { start, end } = range;
      headers['Content-Range'] = `bytes ${start}-${end}/${stat.size}`;
      headers['Content-Length'] = String(end - start + 1);
      res.writeHead(206, headers);
      if (req.method === 'HEAD') {
        res.end();
        return;
      }
      streamFile(filePath, res, { start, end });
      return;
    }

    headers['Content-Length'] = String(stat.size);
    res.writeHead(200, headers);
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    streamFile(filePath, res);
  };

  if (knownStat) handleStat(null, knownStat);
  else fs.stat(filePath, handleStat);
}

function streamFile(filePath, res, options) {
  const stream = fs.createReadStream(filePath, options);
  stream.on('error', () => {
    if (!res.headersSent) res.writeHead(500);
    res.destroy();
  });
  stream.pipe(res);
}

function parseRange(value, size) {
  if (size <= 0 || !value.startsWith('bytes=') || value.includes(',')) return null;

  const match = /^bytes=(\d*)-(\d*)$/.exec(value.trim());
  if (!match || (!match[1] && !match[2])) return null;

  let start;
  let end;
  if (!match[1]) {
    const suffixLength = Number(match[2]);
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) return null;
    start = Math.max(size - suffixLength, 0);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Number(match[2]) : size - 1;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end)) return null;
    if (start >= size || end < start) return null;
    end = Math.min(end, size - 1);
  }

  return { start, end };
}

function shouldHonorRange(req, etag, stat) {
  if (!req.headers.range) return false;
  const ifRange = req.headers['if-range'];
  if (!ifRange) return true;
  if (ifRange.startsWith('W/') || ifRange.startsWith('"')) return ifRange === etag;
  const ifRangeTime = Date.parse(ifRange);
  return Number.isFinite(ifRangeTime) && stat.mtimeMs <= ifRangeTime + 999;
}

function isNotModified(req, etag, stat) {
  if (req.headers['if-none-match']) return req.headers['if-none-match'] === etag;
  const modifiedSince = Date.parse(req.headers['if-modified-since']);
  return Number.isFinite(modifiedSince) && stat.mtimeMs <= modifiedSince + 999;
}

function cacheHeaders(ext) {
  if (NO_CACHE_EXTENSIONS.has(ext)) {
    return {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      Pragma: 'no-cache',
      Expires: '0',
    };
  }
  return { 'Cache-Control': 'public, max-age=3600, must-revalidate' };
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[portfolio preview] http://127.0.0.1:${PORT}/  (serving ${ROOT})`);
});
