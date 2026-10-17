# Alkos Media site

Pages: index.html (home), blog/index.html (/blog), blog/post.html (post viewer).

## Add a blog post
1. Write blog/posts/<slug>.md (Markdown: ## headings, lists, **bold**, [links](url), ![img](url)).
2. Add a line to blog/posts/posts.json: slug, title, date (YYYY-MM-DD), tag, excerpt, cover (optional image path like images/x.jpg).
Host on Netlify or any web host (posts load via fetch, so don't open as a local file).

## Images
Drop files into images/ with the names in index.html (hero-workspace.jpg, service-*.jpg, portfolio-*.jpg, process-architecture.jpg).

## Admin panel (/admin)
1. Put this folder in a GitHub repo and deploy it from that repo on Netlify.
2. Edit admin/config.yml: set `repo: your-username/your-repo`.
3. Netlify: Site settings > Access control > OAuth > Install provider > GitHub.
4. Open yourdomain.com/admin and log in with GitHub. Only GitHub users with write access to the repo can log in; add teammates as repo collaborators.
New posts are saved as Markdown in blog/posts/, and every deploy rebuilds posts.json (build-posts.js).
