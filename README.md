# Household OS

> **The Minimum Viable Household Operating System.**  
> *Get the house out of your head, into a system in 3 hours.*

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjnbbest%2Fhousehold-os&project-name=my-household-os&repository-name=household-os)

---

## ⚡ What is Household OS?

Household OS is an open-source, local-first web application designed to eliminate the invisible mental load of running a home (the *"default partner trap"*).

It replaces 40 Splitwise transactions, forgotten bills, misplaced passports, and "what's for dinner" arguments with **four explicit, living operational blocks**:

1. **Block 1 · The Ownership Map:** 25 standard recurring chores with single Primary accountability (Conceive, Plan, Execute), a designated Backup, and an explicit Definition of Done.
2. **Block 2 · Money in One Place:** The 3-Bucket Pool (Fixed Base, Variable Living, 15% Shock Buffer) with a single 1st-of-the-month UPI transfer and 50/50 or income-weighted split.
3. **Block 3 · The 10-Second Documents Index:** Zero-knowledge physical pointer model (color-coded binder sleeves) and a 1-tap lock screen Emergency ICE Card generator.
4. **Block 4 · The 15-Minute Sunday Reset:** A 4-step weekly sync at 09:00 AM with Google Calendar integration and a reusable Master AI briefing prompt.

---

## 🚀 1-Click Deployment (2 Minutes)

Click the **Deploy with Vercel** button above:
1. Vercel will create a private fork in your GitHub account (`github.com/your-username/household-os`).
2. Your app is built and live at `https://my-household-os.vercel.app` in ~30 seconds.

---

## 📊 Connecting Your Free Google Sheets Database

1. Open the [Master Google Sheet Setup Guide](./google-sheets/README.md).
2. Create your copy of the Google Sheet and deploy the 20-line Apps Script webhook.
3. In your Vercel Project Settings, add:
   - **Key:** `VITE_GOOGLE_SHEET_URL`
   - **Value:** `https://script.google.com/macros/s/.../exec`
4. Click **Redeploy**.

*Once set in Vercel, every household member who opens your site is automatically connected to your Google Sheet with zero setup required on their device!*

---

## 📱 Installing on Mobile (Progressive Web App)

- **On iPhone (Safari):** Open your Vercel URL -> Tap the **Share** button -> Tap **Add to Home Screen**.
- **On Android (Chrome):** Open your Vercel URL -> Tap the **3-dots menu** -> Tap **Install app** or **Add to Home Screen**.

The app runs full screen like a native iOS / Android application, with offline-first speed and zero app store downloads.

---

## 🛠️ Local Development & AI Customization

Want to expand the app with new tabs (e.g. Pet Care, Grocery Barcode Scanner, Staff Attendance)?

```bash
# 1. Clone your private fork
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

### High-Value Prompts to Customize Your Fork:
- *"Add a Pet Health tab tracking rabies vaccines, vet visits, and monthly tick treatments."*
- *"Add a domestic staff attendance calendar with 1-tap leave marking and pro-rata salary deductions."*
- *"Add an automated pantry inventory with quick-commerce reorder buttons."*

---

## 📜 License & Credit

Built with ❤️ for the **GrowthX Live Sprint** by **Jigar Bhanushali**.  
Open source under the MIT License.
