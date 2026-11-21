// Leonida Trophy Guide — GTA 6 trophy guide app.
// Static offline web app. Serves ./app over HTTP using only the Node.js
// standard library. No network calls, no file writes at runtime.
//
// Run:  node main.ts            (then open http://localhost:8080)
//   or: PORT=3000 node main.ts

import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT: string = resolve(join(fileURLToPath(new URL(".", import.meta.url))));
const APP_DIR: string = join(ROOT, "app");
const SHOTS_DIR: string = join(ROOT, "screenshots");
const PORT: number = Number(process.env.PORT ?? 8080);

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function isInside(dir: string, target: string): boolean {
  const rel: string = target.slice(dir.length);
  return target.startsWith(dir) && (rel === "" || rel.startsWith(sep));
}

function contentType(path: string): string {
  return MIME[extname(path).toLowerCase()] ?? "application/octet-stream";
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", "http://localhost");
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === "/") pathname = "/app/index.html";

    // Only serve files from ./app and ./screenshots, nothing else.
    let filePath: string;
    if (pathname.startsWith("/app/")) {
      filePath = resolve(join(APP_DIR, normalize(pathname.slice(5))));
      if (!isInside(APP_DIR, filePath)) throw new Error("forbidden");
    } else if (pathname.startsWith("/screenshots/")) {
      filePath = resolve(join(SHOTS_DIR, normalize(pathname.slice(13))));
      if (!isInside(SHOTS_DIR, filePath)) throw new Error("forbidden");
    } else {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("Not found\n");
      return;
    }

    const body = await readFile(filePath);
    res.writeHead(200, {
      "content-type": contentType(filePath),
      "cache-control": "no-cache",
      "content-length": body.length,
    });
    res.end(body);
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT" || code === "EISDIR") {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("Not found\n");
    } else {
      res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      res.end("Server error\n");
    }
  }
});

server.listen(PORT, () => {
  console.log(`Leonida Trophy Guide running at http://localhost:${PORT}/`);
});
