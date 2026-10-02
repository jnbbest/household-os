# Household OS · Autonomous AI Edition

> **The Minimum Viable Household Operating System.**  
> *Get the house out of your head, into an autonomous system in 3 hours.*

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjnbbest%2Fhousehold-os&project-name=my-household-os&repository-name=household-os)

---

## ⚡ What is Household OS?

Household OS is an open-source, ambient personal operating system designed to eliminate the invisible mental load of running a home (the *"default partner trap"*).

It sits at the intersection of **structured operational clarity** and **autonomous AI action** powered by Nous Research's **Hermes 3**:

1. **Block 1 · The Ownership Map:** 25 standard recurring chores with single Primary accountability (Conceive, Plan, Execute), a designated Backup, and explicit Definitions of Done.
2. **Block 2 · Money in One Place:** The 3-Bucket Pool (Fixed Base, Variable Living, 15% Shock Buffer) with a single 1st-of-the-month UPI transfer and 50/50 or income-weighted split.
3. **Block 3 · The 10-Second Documents Index:** Zero-knowledge physical pointer model (color-coded binder sleeves) and a 1-tap lock screen Emergency ICE Card generator.
4. **Block 4 · The 15-Minute Sunday Reset:** A 4-step weekly sync at 09:00 AM with Google Calendar integration and a reusable Master AI briefing prompt.
5. **🤖 Ambient Ghar Butler (Hermes 3):** Capture tasks, log expenses, and dispatch domestic staff instructions hands-free via text or voice in Hinglish.

---

## 🧠 Dual-Track AI Architecture

Household OS supports two complementary execution tracks depending on your technical preferences:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DUAL-TRACK ARCHITECTURE                         │
├───────────────────────────────────┬────────────────────────────────────┤
│ Track 1: Turnkey Cloud PWA        │ Track 2: Native Hermes Gateway     │
│ (Zero DevOps · 2-Min Vercel)      │ (Always-On CLI & 24/7 VPS)         │
├───────────────────────────────────┼────────────────────────────────────┤
│ • In-App Voice & Butler Bar       │ • Background Daemon (Node / Python)│
│ • Free Web Speech API (en-IN/hi)  │ • Baileys WhatsApp QR Web Bridge   │
│ • 1-Tap wa.me WhatsApp Cards      │ • Telegram Polling / Webhook       │
│ • Vercel Serverless /api/telegram │ • Custom Python Google Sheet Tools │
│ • 0% WhatsApp ban risk            │ • 24/7 autonomous staff interaction│
└───────────────────────────────────┴────────────────────────────────────┘
```

### 🏎️ Track 1 · Turnkey Cloud PWA (Recommended for Live Sprint)
Designed for 100% attendee success in the 3-hour workshop without touching a terminal:
- **Instant Voice Capture:** Speak naturally in Hinglish (*"Blinkit se 1200 ka saman mangwaya split with Aditi"*). Uses browser Web Speech API with zero latency and zero extra costs.
- **1-Tap WhatsApp Action Cards:** When giving instructions to domestic staff (cook, maid, driver), Hermes drafts the message in polite, conversational Hindi and renders a **[Send via WhatsApp]** button that deep-links directly into WhatsApp with pre-filled text.
- **Serverless Telegram Webhook:** Deploy `/api/telegram` to receive family voice notes while driving and automatically update Google Sheets.

### 🛠️ Track 2 · Native Hermes Agent Gateway (For Hackers & Self-Hosters)
Located in [`/hermes-agent`](./hermes-agent/README.md):
- **Native WhatsApp Web Bridge (Baileys):** Runs `hermes gateway setup` in your terminal to display a QR code. Scan with your phone's WhatsApp to place Hermes directly online under your phone number—**with zero Meta Business API approvals**.
- **Always-On Daemon:** Run under `pm2` on a \$4/month Linux VPS or home server.
- **Direct Sheet Tools:** Hermes calls `log_expense` and `update_chore` directly via your Google Apps Script webhook.

---

## 🔑 AI Inference & OpenRouter Option A

Household OS connects to Nous Research's **Hermes 3** via OpenRouter or Groq:

| Mode | Provider & Model | Daily Request Limits* | Best For |
| :--- | :--- | :--- | :--- |
| **Free Tier Baseline** | OpenRouter `nousresearch/hermes-3-llama-3.1-405b:free` | 50 req/day · 20 req/min | Quick exploration & testing |
| **Option A (Recommended)** | OpenRouter `nousresearch/hermes-3-llama-3.1-70b` (or 405B) | **Uncapped Priority Routing** | Production daily household use |
| **Ultra-Fast Fallback** | Groq `llama-3.3-70b-versatile` | 14,400 req/day | High-speed zero-latency backup |

> ### 💡 Option A Explained:
> Free models on OpenRouter are deprioritized during peak global traffic hours. Depositing **\$1 to \$5 on OpenRouter** unlocks standard production rate limits (100+ requests/minute, instant priority routing, and millions of tokens for pennies).
> 
> *\*Note: OpenRouter rates, model availability, and free tier limits as of 1st Oct 2026.*

---

## 🚀 1-Click Deployment (2 Minutes)

Click the **Deploy with Vercel** button above:
1. Vercel will create a private repository in your GitHub account (`github.com/your-username/household-os`).
2. Add the following **Environment Variables** in Vercel:
   * `VITE_GOOGLE_SHEET_URL`: Your deployed Google Apps Script Web App URL ([Setup Guide](./google-sheets/README.md)).
   * `VITE_AI_API_KEY`: Your OpenRouter (`sk-or-v1-...`) or Groq (`gsk_...`) API key.
   * `TELEGRAM_BOT_TOKEN` *(Optional)*: Your bot token from `@BotFather` to enable the Telegram bot.
3. Your app is live at `https://my-household-os.vercel.app` in ~30 seconds.

---

## 📱 Installing on Mobile (Progressive Web App)

- **On iPhone (Safari):** Open your Vercel URL $\rightarrow$ Tap **Share** $\rightarrow$ Tap **Add to Home Screen**.
- **On Android (Chrome):** Open your Vercel URL $\rightarrow$ Tap the **3-dots menu** $\rightarrow$ Tap **Install app** or **Add to Home Screen**.

Runs full screen like a native iOS / Android application with instant offline-first speed and zero app store downloads.

---

## 🛠️ Local Development & AI Customization

```bash
# 1. Clone your private repository
git clone https://github.com/your-username/household-os.git
cd household-os

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Open in your favorite AI tool:
# For Antigravity: agy .
# For Claude Code: claude
# For Cursor: cursor .
# For VS Code / Codex: code .
```

---

## 📜 License & Credit

Built with ❤️ for the **GrowthX Live Sprint** by **Jigar Bhanushali**.  
Open source under the MIT License.
