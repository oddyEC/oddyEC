# Diego Márquez AI Engineering Portfolio

Static technical portfolio for AI Engineering roles. It is built with Astro, TypeScript, Content Collections, and a GitHub Pages deployment workflow.

## Requirements

- Node.js 22 or newer.
- npm 10 or newer.

## Install

```bash
npm install
```

## Local Development

```bash
npm run dev
```

Astro will print the local URL, usually `http://localhost:4321`.

## Validate

```bash
npm run check
npm run build
npm run check:links
```

Or run the full validation pipeline:

```bash
npm run validate
```

## Personal Configuration

Edit [src/config/profile.ts](src/config/profile.ts) to replace placeholders:

- `YOUR_GITHUB_URL`
- `YOUR_LINKEDIN_URL`
- `YOUR_EMAIL`
- `YOUR_SITE_URL`

The résumé link is disabled by default because this repository does not include a real `resume.pdf`. To enable it:

1. Add the real PDF at `public/resume.pdf`.
2. Set `resume.enabled` to `true` in [src/config/profile.ts](src/config/profile.ts).
3. Keep `resume.path` as `/resume.pdf`, or replace it with another real URL.

Do not add a fake résumé file.

## Add Or Edit Projects

Project case studies live in [src/content/projects](src/content/projects). Each file is a Markdown entry with frontmatter for:

- `title`
- `status`
- `description`
- `tags`
- `architecture`
- `metrics`
- `decisions`
- optional `repoUrl`
- optional `disclosure`

The route is generated from the filename. For example:

```text
src/content/projects/repository-intelligence.md
```

becomes:

```text
/projects/repository-intelligence/
```

## Add Or Edit Notes

Engineering notes live in [src/content/notes](src/content/notes). The filename becomes the route:

```text
src/content/notes/rag-for-code.md
```

becomes:

```text
/notes/rag-for-code/
```

## GitHub Pages Deployment

The workflow in [.github/workflows/deploy.yml](.github/workflows/deploy.yml) installs dependencies, runs `npm run check`, builds the site, uploads the artifact, and deploys to GitHub Pages.

In GitHub:

1. Push this repository to GitHub.
2. Open **Settings -> Pages**.
3. Under **Build and deployment**, choose **GitHub Actions**.
4. Push to `main` to deploy.

The workflow automatically handles both:

- User or organization site: `username.github.io`
- Project site: `username.github.io/repository-name`

It sets `BASE_PATH` and `SITE_URL` during the build so internal links, canonical URLs, and the sitemap work under either deployment shape.

## Custom Domain

If you use a custom domain:

1. Add a `public/CNAME` file containing the domain, for example `diego.example.com`.
2. Set the repository Pages custom domain in GitHub.
3. Optionally set `SITE_URL=https://diego.example.com` in the workflow environment if you want canonical URLs to use the custom domain immediately.

## Production Build

```bash
npm run build
```

The static site is written to `dist/`.
