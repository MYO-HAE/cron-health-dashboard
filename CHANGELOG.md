# Cron Health Dashboard

**OpenClaw Nightly Build - February 28, 2026**

A visual dashboard for monitoring OpenClaw cron job health status. Built to address the repeated failures seen in outcomes.jsonl.

---

## What I Built

A React-based dashboard that displays all OpenClaw cron jobs with:
- **Health status indicators** (Healthy/Warning/Critical)
- **Stats overview** showing total jobs, healthy count, warnings, and critical issues
- **Detailed job cards** with expandable error details
- **Filtering** by status (All, Healthy, Warning, Critical)
- **Real timestamps** showing last run and next scheduled run in KST

## Why It Helps

outcomes.jsonl repeatedly showed cron failures:
- 5 crons failing with Slack channel ID errors
- Morning Brief and Heartbeat timeouts
- Consecutive errors accumulating without visibility

This dashboard gives David a single view to see which automations are healthy vs broken, without checking logs or waiting for alerts.

---

## Live URL

**GitHub Repo:** https://github.com/MYO-HAE/cron-health-dashboard

**Cloudflare Pages URL:** (To be deployed manually - see instructions below)

---

## How to Deploy to Cloudflare Pages

Since the API token had permission issues, deploy manually:

1. Go to https://dash.cloudflare.com
2. Navigate to **Pages** → **Create a project**
3. Choose **Upload assets** (direct upload)
4. Project name: `cron-health-dashboard`
5. Upload the `dist/` folder from this repo
6. Get your live URL

Or use Git integration:
1. In Cloudflare Pages, choose **Connect to Git**
2. Select the `MYO-HAE/cron-health-dashboard` repo
3. Build command: `npm run build`
4. Build output directory: `dist`
5. Deploy

---

## How to Test

1. Clone the repo
2. `npm install`
3. `npm run dev` (local development)
4. `npm run build` (production build)

---

## Next Optimization

1. **Connect to live API** - Pull real-time cron data from OpenClaw Gateway instead of static data
2. **Add webhook integration** - Auto-refresh when jobs run
3. **Mobile responsiveness** - Optimize card layout for phone viewing
4. **Historical trends** - Show error rates over time

---

## Tech Stack

- React 19 + Vite 7
- Tailwind CSS v4
- Framer Motion (animations)
- Lucide React (icons)

---

## Data Source

Current data is from the cron list snapshot taken during build. Jobs are defined in `src/App.jsx` in the `initialCronData` array.

To update with latest cron data, run `openclaw cron list` and update the array.
