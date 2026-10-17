# Putting OpenDP online

This folder is the whole website: `index.html` (the site), and an `api` folder with two small
server functions (AI and feedback) that only switch on if you add keys. No coding needed.

## 1. Put the files on GitHub (5 minutes)

1. Sign in at github.com (or create a free account).
2. Click **New repository**. Name it e.g. `opendp-site`. Public or private both work. Click **Create repository**.
3. On the new repo page, click **uploading an existing file**.
4. Drag in **everything inside this folder**: `index.html`, `vercel.json`, `DEPLOY.md` and the `api` folder.
   (Drag the files themselves, not the folder that contains them, so `index.html` sits at the top level.)
5. Click **Commit changes**.

## 2. Publish it with Vercel (free, 3 minutes)

1. Go to vercel.com and **Sign up with GitHub**.
2. Click **Add New → Project**, find `opendp-site`, click **Import**.
3. Framework preset: **Other**. Leave everything else as it is. Click **Deploy**.
4. After about a minute you get a live address like `opendp-site.vercel.app`. Share it with anyone.

Everything works straight away: questions, markschemes, the syllabus, mock exams, the planner,
the score calculator. AI features show "AI isn't switched on for this site yet" until step 3.

## 3. (Optional) Switch on AI marking, Dee and feedback

AI on your own website runs on an Anthropic API key, and **you pay for every AI call your
visitors make**. Do this only when you're ready, and always set a spending limit.

1. Go to console.anthropic.com, create an account, add a small amount of credit.
2. In the Console, set a **monthly spend limit** (Settings → Limits) so costs can't run away.
3. Create an **API key** (Settings → API keys). Copy it. Never paste it into the website files.
4. In Vercel: your project → **Settings → Environment Variables** → add
   `ANTHROPIC_API_KEY` = your key. Save.
5. **Deployments → ⋯ → Redeploy.** AI marking, Dee, flashcards and IA/EE feedback now work for everyone.

Optional settings (Environment Variables):
- `AI_CALLS_PER_HOUR` — max AI calls per visitor per hour (default 40).
- `MODEL_DEFAULT`, `MODEL_QUICK`, `MODEL_COMPLEX` — which Claude models to use (defaults: Sonnet for marking, Haiku for Dee's quick replies).

## 4. (Optional) Get feedback and problem reports

1. In a Discord server you own: channel settings → **Integrations → Webhooks → New Webhook → Copy URL**.
2. In Vercel add the environment variable `FEEDBACK_WEBHOOK_URL` = that URL, then redeploy.
3. Every "Give feedback" form and "Report a problem" now arrives in that Discord channel.

## 5. Updating the site

When the site changes, replace `index.html` on GitHub (open the file → pencil/upload → commit).
Vercel redeploys automatically within a minute.

## 6. Your own domain (optional)

Buy a domain (around $10 a year), then in Vercel: **Settings → Domains → Add** and follow the
DNS instructions. Check the name isn't already used by another project before you buy it.
