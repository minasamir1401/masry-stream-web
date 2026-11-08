# Masry Stream - Frontend (Web)

Arabic RTL Streaming Web Interface built with Next.js 14, Tailwind CSS, and TypeScript.

## Features

- High performance SSR & Streaming with Next.js 14 App Router
- Modern Dark-themed Cinematic UI with Arabic RTL direction
- Responsive Video Player with HLS.js streaming support and subtitle toggling
- Dynamic catalog browsing, genre filters, and weekly airing schedule
- Native integration with Dokploy via Standalone Docker output

## AnimeClover updates

The frontend includes an Arabic-first bilingual catalog, dynamic cinematic anime artwork, live search suggestions, responsive discovery/footer layouts, Arabic story metadata and watch pages, refreshed episode ratings/comments, persistent public work links, and server-rendered episode navigation and sitemap corrections.

Deploy the matching [backend update](https://github.com/minasamir1401/masry-stream-api-) for the Arabic name/description fields, autocomplete endpoint, and stored canonical paths. The backend repository also contains the [complete change and validation notes](https://github.com/minasamir1401/masry-stream-api-/blob/main/docs/AUDIT_FIXES.md) and [combined-workspace deployment templates](https://github.com/minasamir1401/masry-stream-api-/tree/main/deployment).

Validation: `npm run test:audit`, `npm run test:seo`, and `npm run build`.

## Getting Started

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env.local
   ```
   Set `INTERNAL_BACKEND_URL` to point to your local FastAPI backend (e.g. `http://localhost:8000`).

3. Run development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

### Docker Deployment

```bash
docker build -t masry-stream-web .
docker run -p 3000:3000 -e INTERNAL_BACKEND_URL=http://backend:8000 masry-stream-web
```

