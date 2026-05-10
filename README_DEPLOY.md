Deployment checklist

1. Required environment variables (set these in Vercel or your host):

- `QDRANT_URL` - your Qdrant REST endpoint
- `QDRANT_API_KEY` - Qdrant API key

At least one embedding/generation provider must be configured for production:

- `OPENAI_API_KEY` (recommended)
- or `GROK_API_KEY` and `GROK_BASE_URL` (both required for Grok)
- or `GOOGLE_API_KEY` (if you have project access and appropriate models)

2. Local development

Copy `.env.local` (do NOT commit):

```
GOOGLE_API_KEY=...
OPENAI_API_KEY=...
GROK_API_KEY=...
GROK_BASE_URL=https://api.grok.ai/v1
QDRANT_URL=...
QDRANT_API_KEY=...
```

3. Deploy to Vercel

- Create a new project in Vercel and link this repo.
- Add the environment variables above in the Vercel dashboard (Project Settings → Environment Variables).
- Deploy via the Vercel UI or CLI:

```bash
npx vercel --prod
```

4. Health check

After deployment, check the health endpoint:

- `GET /.netlify/functions/health` for some hosts (if configured)
- For this app: `GET /api/health` — it returns which env vars are detected.

5. Troubleshooting

- If uploads work locally but production returns errors, ensure the provider keys are set in the production environment.
- If you see Google 403/404 errors, prefer using `OPENAI_API_KEY` or Grok.

6. Security

- Never commit `.env.local` or API keys to the repo. `.gitignore` already excludes `.env*`.

If you want, I can add a small GitHub Actions workflow to automatically deploy to Vercel on push. 7. GitHub Actions (optional auto-deploy)

- This repo includes a GitHub Actions workflow `.github/workflows/ci-deploy.yml` that:
  - runs `npm ci` and `npm run build` on push to `main`;
  - deploys to Vercel if the following GitHub repository secrets are set: `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, and `VERCEL_ORG_ID`.

- To enable auto-deploy via GitHub Actions:
  1.  Add repository secrets: `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, `VERCEL_ORG_ID`.
  2.  Push to `main`. The workflow will build and deploy automatically.
