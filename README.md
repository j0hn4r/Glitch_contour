<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1kzDKnOvAhLVJiqxkQl1sj21Yk-uoGlDL

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploying to GitHub Pages

### GitHub Actions workflow

This repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds
and deploys the site to GitHub Pages whenever changes are pushed to `main` (or when manually
triggered via the **Run workflow** button in the Actions tab). The workflow assumes that Pages is
configured to serve from the `GitHub Pages` environment.

No additional secrets are required, but you can override the base path used during the build by
setting a `VITE_BASE_PATH` environment variable in the workflow or repository settings if you plan
to deploy under a different subpath.

### Manual build

The Vite configuration is set to serve assets from the repository subpath (`/Glitch_contour/`). If
you deploy under a different path (for example, an organization page), set `VITE_BASE_PATH` in your
environment to the desired base URL before running `npm run build`.
