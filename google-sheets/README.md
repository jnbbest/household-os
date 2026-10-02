# Master Google Sheet Setup Guide · Household OS

This Google Sheet acts as the **free, lifetime database** for your Household OS instance.

---

## 🚀 Quick Setup (3 Minutes)

### Step 1: Create a New Google Sheet
1. Open [sheets.new](https://sheets.new) in your Google account.
2. Title the sheet: **`Household OS Database`**.
3. Create exactly 4 tabs (rename the bottom tabs):
   - `Ownership`
   - `Money_Pool`
   - `Doc_Index`
   - `Sunday_Reset`

---

### Step 2: Set Up Columns & Headers

#### Tab 1: `Ownership`
Row 1 Headers:
| Col A | Col B | Col C | Col D | Col E | Col F | Col G | Col H | Col I |
|---|---|---|---|---|---|---|---|---|
| `id` | `domain` | `title` | `frequency` | `primaryOwner` | `backupOwner` | `definitionOfDone` | `status` | `lastCompletedDate` |

- **Domains:** `kitchen`, `staff`, `admin`, `repairs`, `laundry`, `family`
- **Frequencies:** `daily`, `weekly`, `monthly`, `as_needed`
- **Status:** `pending`, `completed`

---

#### Tab 2: `Money_Pool`
Row 1 Headers:
| Col A | Col B | Col C | Col D |
|---|---|---|---|
| `bucket` | `itemName` | `amountINR` | `notes` |

Add formulas in helper summary cells:
- **Total Fixed Base:** `=SUMIFS(C2:C20, A2:A20, "Fixed")`
- **Total Variable Pool:** `=SUMIFS(C2:C20, A2:A20, "Variable")`
- **15% Shock Buffer:** `=SUM(C2:C20) * 0.15`
- **Total Monthly Budget:** `=SUM(C2:C20) + (SUM(C2:C20)*0.15)`

---

#### Tab 3: `Doc_Index`
Row 1 Headers:
| Col A | Col B | Col C | Col D | Col E | Col F | Col G |
|---|---|---|---|---|---|---|
| `id` | `documentName` | `category` | `physicalLocation` | `digilockerSync` | `expiryDate` | `isEmergencyICE` |

- **Categories:** `identity`, `property`, `medical`, `vehicle`, `finance`
- **Sleeve Convention:**
  - 🔴 Red: Medical & Emergency Cards
  - 🔵 Blue: Passports & Government Identity
  - 🟢 Green: Property Deeds & Tenancy Agreements
  - 🟡 Yellow: Vehicle Registration & Appliance Warranties

---

#### Tab 4: `Sunday_Reset`
Row 1 Headers:
| Col A | Col B | Col C | Col D | Col E | Col F |
|---|---|---|---|---|---|
| `weekStarting` | `choresReviewed` | `staffLedgerCleared` | `billsAutodebitVerified` | `weeklyAIMenuGenerated` | `notes` |

---

### Step 3: Deploy the Webhook (Apps Script)
1. In your Google Sheet, click **Extensions > Apps Script**.
2. Replace any existing code with the contents of `Code.gs`.
3. Click **Save 💾**.
4. Click **Deploy > New deployment**:
   - Click the gear icon next to "Select type" and choose **Web app**.
   - **Description:** `Household OS Webhook v1`
   - **Execute as:** `Me` (your Google account)
   - **Who has access:** `Anyone` *(Crucial: allows your Vercel app to sync with the sheet)*
5. Click **Deploy**.
6. Google will ask for authorization. Click **Authorize access** -> select your Google account -> Click **Advanced** -> Click **Go to Household OS (unsafe)** -> Click **Allow**.
7. Copy the generated **Web app URL** (starts with `https://script.google.com/macros/s/...`).

---

### Step 4: Link to Vercel
1. Go to your project on [vercel.com](https://vercel.com).
2. Navigate to **Settings > Environment Variables**.
3. Add:
   - **Key:** `VITE_GOOGLE_SHEET_URL`
   - **Value:** *Your copied Apps Script URL*
4. Go to the **Deployments** tab and click **Redeploy**.

🎉 **Your Household OS is now permanently connected to your private Google Sheet!**
