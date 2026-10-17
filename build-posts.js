// Builds blog/posts/posts.json from the front matter of blog/posts/*.md.
// Runs automatically on every Netlify deploy (see netlify.toml).
const fs = require("fs"), path = require("path");
const dir = path.join(__dirname, "blog", "posts");
const posts = [];
for (const f of fs.readdirSync(dir).filter(f => f.endsWith(".md"))) {
  const raw = fs.readFileSync(path.join(dir, f), "utf8").replace(/\r/g, "");
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) { console.warn("skip (no front matter):", f); continue; }
  const meta = {};
  for (const line of m[1].split("\n")) {
    const k = line.match(/^(\w+):\s*(.*)$/);
    if (k) meta[k[1]] = k[2].trim().replace(/^["']|["']$/g, "");
  }
  posts.push({
    slug: f.replace(/\.md$/, ""), title: meta.title || f, date: String(meta.date || "").slice(0, 10),
    tag: meta.tag || "", excerpt: meta.excerpt || "", cover: (meta.cover || "").replace(/^\//, "")
  });
}
posts.sort((a, b) => b.date.localeCompare(a.date));
fs.writeFileSync(path.join(dir, "posts.json"), JSON.stringify(posts, null, 2) + "\n");
console.log("posts.json:", posts.length, "posts");
