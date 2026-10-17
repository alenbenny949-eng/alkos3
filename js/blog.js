/* Blog loader: reads blog/posts/posts.json and renders Markdown posts.
   To publish: add blog/posts/<slug>.md and a line in blog/posts/posts.json. */
(function () {
  "use strict";
  var base = location.pathname.replace(/[^\/]*$/, "") + "posts/";
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fmt(d) { var x = new Date(d + "T00:00:00"); return isNaN(x) ? "" : x.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
  function safeUrl(u) { return /^(https?:|mailto:|\/|\.|#|[\w-])/i.test(u) && !/^javascript:/i.test(u) ? u : "#"; }

  function inline(t) {
    t = esc(t);
    t = t.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, function (m, a, u) { return '<img src="' + safeUrl(u) + '" alt="' + a + '" loading="lazy">'; });
    t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, a, u) { return '<a href="' + safeUrl(u) + '" target="_blank" rel="noopener">' + a + "</a>"; });
    t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/(^|[\s(])\*([^*]+)\*/g, "$1<em>$2</em>");
    return t;
  }
  function md(src) {
    var lines = src.replace(/\r/g, "").split("\n"), out = [], i = 0;
    while (i < lines.length) {
      var l = lines[i], m;
      if (!l.trim()) { i++; continue; }
      if ((m = l.match(/^(#{1,3})\s+(.*)/))) { var n = Math.max(2, m[1].length); out.push("<h" + n + ">" + inline(m[2]) + "</h" + n + ">"); i++; continue; }
      if (/^>\s?/.test(l)) { var q = []; while (i < lines.length && /^>\s?/.test(lines[i])) q.push(lines[i++].replace(/^>\s?/, "")); out.push("<blockquote>" + inline(q.join(" ")) + "</blockquote>"); continue; }
      if (/^[-*]\s+/.test(l)) { var u = []; while (i < lines.length && /^[-*]\s+/.test(lines[i])) u.push("<li>" + inline(lines[i++].replace(/^[-*]\s+/, "")) + "</li>"); out.push("<ul>" + u.join("") + "</ul>"); continue; }
      if (/^\d+\.\s+/.test(l)) { var o = []; while (i < lines.length && /^\d+\.\s+/.test(lines[i])) o.push("<li>" + inline(lines[i++].replace(/^\d+\.\s+/, "")) + "</li>"); out.push("<ol>" + o.join("") + "</ol>"); continue; }
      var p = []; while (i < lines.length && lines[i].trim() && !/^(#{1,3}\s|>|[-*]\s|\d+\.\s)/.test(lines[i])) p.push(lines[i++]);
      out.push("<p>" + inline(p.join(" ")) + "</p>");
    }
    return out.join("\n");
  }
  function getPosts() {
    return fetch(base + "posts.json", { cache: "no-cache" }).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (a) {
      return a.sort(function (x, y) { return String(y.date).localeCompare(String(x.date)); });
    });
  }
  function cover(p, cls) { return p.cover ? '<img src="' + esc(p.cover.indexOf("http") === 0 ? p.cover : "../" + p.cover) + '" alt="" loading="lazy">' : "<span>" + esc(p.title) + "</span>"; }

  var grid = document.getElementById("post-grid");
  if (grid) {
    getPosts().then(function (posts) {
      if (!posts.length) { grid.innerHTML = '<li class="post-empty">New posts are coming soon.</li>'; return; }
      grid.innerHTML = posts.map(function (p) {
        return '<li class="post-card"><a href="post.html?p=' + encodeURIComponent(p.slug) + '"><div class="post-card__cover">' + cover(p) + '</div>' +
          '<p class="post-meta">' + esc(fmt(p.date)) + (p.tag ? " · " + esc(p.tag) : "") + '</p><h2 class="post-card__title">' + esc(p.title) + '</h2><p class="post-card__excerpt">' + esc(p.excerpt || "") + "</p></a></li>";
      }).join("");
    }).catch(function () { grid.innerHTML = '<li class="post-empty">Posts could not be loaded. Open the site through a web server (or your host) rather than as a local file.</li>'; });
  }

  var root = document.getElementById("post-root");
  if (root) {
    var slug = (new URLSearchParams(location.search).get("p") || "").replace(/[^\w-]/g, "");
    if (!slug) { root.innerHTML = '<p class="post-empty">Post not found. <a href="./">Back to the blog</a>.</p>'; return; }
    Promise.all([getPosts(), fetch(base + slug + ".md", { cache: "no-cache" }).then(function (r) { if (!r.ok) throw 0; return r.text(); })]).then(function (res) {
      var p = res[0].filter(function (x) { return x.slug === slug; })[0] || { title: slug, date: "" };
      document.title = p.title + " | Alkos Media";
      root.innerHTML = '<p class="post-meta">' + esc(fmt(p.date)) + (p.tag ? " · " + esc(p.tag) : "") + '</p><h1 class="post__title">' + esc(p.title) + "</h1>" +
        (p.cover ? '<img class="post__cover" src="' + esc(p.cover.indexOf("http") === 0 ? p.cover : "../" + p.cover) + '" alt="">' : "") +
        '<div class="post__body">' + md(res[1].replace(/^---[\s\S]*?\n---\s*/, "")) + '</div><div class="post__cta"><p><strong>Want results like this for your business?</strong></p><a class="btn btn--dark btn--arrow" href="../#contact">Get a free audit</a></div>';
    }).catch(function () { root.innerHTML = '<p class="post-empty">Post not found. <a href="./">Back to the blog</a>.</p>'; });
  }
})();
