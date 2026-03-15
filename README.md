# Thine Personal Intelligence Diagnostic

A professional diagnostic tool designed to measure how effectively your current systems preserve recall, commitments, and relationship context. Inspired by the design language of Thine.

## Features

- **10-Question Diagnostic**: A focused 2-minute assessment of your professional "OS".
- **Dynamic Scoring & Tiers**: Instant feedback based on three tiers: *Flying Blind*, *Surviving on Talent*, and *Operating Elite*.
- **Edge OG Image Generation**: Dynamically generated social sharing images using Vercel's Edge Runtime for high performance.
- **Premium Aesthetic**: A minimalist, dark-themed UI with elegant typography (IM Fell Great Primer).

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS Modules
- **OG Images**: `@vercel/og` on Edge Runtime

## Getting Started

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the dev server**:
   ```bash
   npm run dev
   ```

3. **Open the app**:
   Navigate to [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
npm start
```

## Vercel Deployment

This project is optimized for deployment on the [Vercel Platform](https://vercel.com).

- The `app/api/og/route.tsx` will automatically deploy as an **Edge Function**.
- Static assets and pages will be served via Vercel's Global Edge Network.

To deploy:
1. Connect your GitHub repository to Vercel.
2. Select the `thine` project.
3. Deploy.

---
Built with attention to detail and a focus on personal intelligence productivity.
