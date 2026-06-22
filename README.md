<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.
https://ai.studio/apps/2d2ae240-4502-497e-b77f-ee9b4bab43f7

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Vercel

The project has been configured for easy self-hosting on Vercel. 

### Steps to Deploy:
1. **Push your code to GitHub** (make sure your `.env` file is in `.gitignore` so your API key stays secure).
2. **Import the repository** into your Vercel Dashboard.
3. Vercel will automatically detect the Vite project and configure the build settings.
4. **Configure Environment Variables**:
   In your Vercel project settings, add the environment variable:
   * `GEMINI_API_KEY`: *[Your secured Gemini API key]*
5. Click **Deploy**. Vercel will serve your React frontend on `/` and route all API requests `/api/*` to the serverless Express function.