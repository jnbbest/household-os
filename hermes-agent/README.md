# Track 2 · Native Hermes Agent Gateway (Always-On CLI & VPS)

> **For Power Builders, Hackers & 24/7 Self-Hosters.**  
> Transform Household OS into a living background daemon. Family members, maids, cooks, and drivers text or voice memo your existing WhatsApp or Telegram, and Hermes autonomously runs your home.

---

## ⚡ How It Works

Unlike Track 1 (which runs inside the web browser), **Track 2 runs the official Nous Research Hermes Agent CLI** directly on an always-on machine (your home laptop or a \$4/month Linux VPS like DigitalOcean, Hetzner, or Railway).

Hermes features **native, built-in gateway support** for both WhatsApp and Telegram:

### 📱 1. WhatsApp Connection (Baileys Web Bridge)
- **Zero Meta Business Approval:** Instead of enterprise Meta WhatsApp Cloud API credentials, Hermes leverages a built-in Node.js bridge using **Baileys**.
- **How It Connects:** It emulates a WhatsApp Web multi-device session.
- **The Setup:** You run `hermes gateway setup`, select WhatsApp, and a QR code prints directly inside your terminal. Open WhatsApp on your phone $\rightarrow$ **Linked Devices** $\rightarrow$ **Link a Device** $\rightarrow$ Scan the QR code.
- **Instant Status:** Your Hermes agent is immediately online on WhatsApp under your phone number.
- ⚠️ **Ban-Risk & Compliance Note:** Because Baileys emulates a web client, automated session bans can occur if you spam broadcast lists or send unsolicited marketing. For running a personal household (where only you, your partner, and domestic staff converse), it is exceptionally smooth and completely free.

### 🤖 2. Telegram Bot Connection (@BotFather)
- **Deeply Integrated:** Hermes has native Telegram bot polling and webhook support.
- **Setup:** Create a bot via `@BotFather` in 60 seconds, copy the HTTP API token, and paste it into `config.yaml`.
- **Capabilities:** Voice notes are auto-transcribed via Whisper, photo receipts are parsed with vision models, and task confirmations are sent back in real time.

---

## 🚀 Step-by-Step Setup Guide

### Step 1: Install Hermes Agent CLI
Ensure you have Node.js 18+ and Python 3.10+ installed.

```bash
# Clone and install Hermes Agent
npm install -g @nousresearch/hermes-agent
# or using pip if using Python variant
pip install hermes-agent
```

### Step 2: Configure OpenRouter or Groq Model
Open `~/.hermes/config.yaml` (or copy `config.example.yaml` from this directory):

```yaml
model_provider: openrouter
model: nousresearch/hermes-3-llama-3.1-405b:free
api_key: sk-or-v1-YOUR_OPENROUTER_KEY

# *Note: OpenRouter free tier has a 50 req/day limit as of 1st Oct 2026.
# Tip (Option A): Deposit $1–$5 on OpenRouter to unlock unlimited priority requests.

# Point to your Household OS Google Sheet Webhook:
custom_env:
  HOUSEHOLD_SHEET_URL: "https://script.google.com/macros/s/YOUR_APPS_SCRIPT_ID/exec"
```

### Step 3: Connect Your WhatsApp Gateway
Run the gateway setup wizard:

```bash
hermes gateway setup
```

1. Select **WhatsApp** from the menu.
2. A QR code will render in your terminal.
3. Open WhatsApp on your smartphone:
   - **Android:** Tap 3 dots (top right) $\rightarrow$ **Linked Devices** $\rightarrow$ **Link a Device**.
   - **iPhone:** Tap **Settings** (bottom right) $\rightarrow$ **Linked Devices** $\rightarrow$ **Link a Device**.
4. Scan the terminal QR code.
5. You will see: `[Hermes Gateway] WhatsApp session authenticated and active.`

### Step 4: Register Household OS Google Sheets Tools
Copy `household_tools.py` into your Hermes custom tools directory:

```bash
cp tools/household_tools.py ~/.hermes/tools/
```

This equips Hermes with 3 tools:
- `log_expense(amount, bucket, item_name, notes)`
- `update_chore(task_name, status)`
- `get_household_summary()`

---

## 💬 Everyday Family Interactions (Live Examples)

Once online, send a WhatsApp or Telegram message to your agent:

* **Texting an Expense:**
  > *You:* "Paid 1400 for Blinkit groceries split with Aditi"  
  > *Hermes:* "Done! Logged ₹1,400 under Variable Pool. Synced to Google Sheet."

* **Completing a Chore:**
  > *You:* "Water filter service is done"  
  > *Hermes:* "Updated 'Water Filter & Ro Service' to Completed in Ownership Matrix."

* **Checking Pool Status:**
  > *You:* "How much do we have left in variable pool?"  
  > *Hermes:* "Total variable spend this month is ₹24,800. Estimated buffer remaining: ₹15,200."

---

## 🖥️ Running 24/7 on a Linux VPS ($4/Month)

To keep your WhatsApp agent online even when your laptop is closed:

```bash
# 1. Install PM2 process manager
npm install -g pm2

# 2. Start Hermes Gateway under PM2
pm2 start "hermes gateway start" --name "household-butler"

# 3. Enable start on system boot
pm2 startup
pm2 save
```

Your Ghar Butler is now running 24/7/365 with zero downtime!
