import fs from "node:fs";
import path from "node:path";

const root = path.resolve("dist");
const htmlFiles = [];
const configuredBase = process.env.BASE_PATH || "/";
const basePath = configuredBase === "/" ? "" : configuredBase.replace(/\/$/, "");

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(filePath);
    } else if (entry.name.endsWith(".html")) {
      htmlFiles.push(filePath);
    }
  }
}

function isExternal(url) {
  return /^(https?:|mailto:|tel:|data:)/.test(url);
}

function stripBasePath(url) {
  if (!basePath || !url.startsWith("/")) return url;
  if (url === basePath) return "/";
  if (url.startsWith(`${basePath}/`) || url.startsWith(`${basePath}#`)) {
    const stripped = url.slice(basePath.length);
    return stripped || "/";
  }
  return url;
}

function targetExists(url) {
  const cleanUrl = stripBasePath(url.split("#")[0].split("?")[0]);
  if (!cleanUrl || cleanUrl.startsWith("#") || isExternal(cleanUrl)) return true;

  const relativePath = cleanUrl.startsWith("/") ? cleanUrl.slice(1) : cleanUrl;
  let target = path.join(root, relativePath);

  if (cleanUrl.endsWith("/")) {
    target = path.join(root, relativePath, "index.html");
  }

  if (fs.existsSync(target) && fs.statSync(target).isFile()) return true;
  if (fs.existsSync(path.join(target, "index.html"))) return true;

  return false;
}

if (!fs.existsSync(root)) {
  console.error("dist does not exist. Run npm run build first.");
  process.exit(1);
}

walk(root);

const attrPattern = /\b(?:href|src)=["']([^"']+)["']/g;
const missing = [];

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  let match;

  while ((match = attrPattern.exec(html))) {
    const url = match[1];
    if (!targetExists(url)) {
      missing.push(`${path.relative(root, file)} -> ${url}`);
    }
  }
}

if (missing.length > 0) {
  console.error(`Broken internal links:\n${missing.join("\n")}`);
  process.exit(1);
}

const baseLabel = basePath || "/";
console.log(`Checked ${htmlFiles.length} HTML files with BASE_PATH=${baseLabel}: no broken internal href/src links.`);