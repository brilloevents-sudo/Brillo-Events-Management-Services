import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const nextAppDir = path.join(rootDir, ".next", "server", "app");
const nextStaticDir = path.join(rootDir, ".next", "static");
const publicDir = path.join(rootDir, "public");

function copyRecursive(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

function copyAppHtml(dir: string, relParts: string[] = []) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Route groups like (public) don't add to URL path
      const nextRel = entry.startsWith("(") && entry.endsWith(")") ? relParts : [...relParts, entry];
      copyAppHtml(fullPath, nextRel);
    } else if (entry.endsWith(".html")) {
      const baseName = path.basename(entry, ".html");
      if (baseName === "_not-found") {
        fs.copyFileSync(fullPath, path.join(rootDir, "404.html"));
        continue;
      }

      if (baseName === "index" && relParts.length === 0) {
        fs.copyFileSync(fullPath, path.join(rootDir, "index.html"));
      } else if (baseName === "page") {
        const targetDir = path.join(rootDir, ...relParts);
        fs.mkdirSync(targetDir, { recursive: true });
        fs.copyFileSync(fullPath, path.join(targetDir, "index.html"));
      } else {
        const targetDir = path.join(rootDir, ...relParts, baseName);
        fs.mkdirSync(targetDir, { recursive: true });
        fs.copyFileSync(fullPath, path.join(targetDir, "index.html"));
        // Also write flat .html for direct match
        const flatPath = path.join(rootDir, ...relParts, `${baseName}.html`);
        fs.mkdirSync(path.dirname(flatPath), { recursive: true });
        fs.copyFileSync(fullPath, flatPath);
      }
    }
  }
}

console.log("1. Copying _next/static assets...");
copyRecursive(nextStaticDir, path.join(rootDir, "_next", "static"));

console.log("2. Copying public assets (talents, brand, proofs, static-db-snapshot.json)...");
copyRecursive(path.join(publicDir, "talents"), path.join(rootDir, "talents"));
copyRecursive(path.join(publicDir, "brand"), path.join(rootDir, "brand"));
copyRecursive(path.join(publicDir, "proofs"), path.join(rootDir, "proofs"));
if (fs.existsSync(path.join(publicDir, "static-db-snapshot.json"))) {
  fs.copyFileSync(
    path.join(publicDir, "static-db-snapshot.json"),
    path.join(rootDir, "static-db-snapshot.json")
  );
}

console.log("3. Copying pre-rendered Next.js route HTML files to root...");
copyAppHtml(nextAppDir);

console.log("Done preparing GitHub Pages static bundle in root!");
