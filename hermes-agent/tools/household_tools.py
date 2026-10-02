"""
Household OS · Custom Tools for Hermes Agent
Author: Jigar Bhanushali · GrowthX
Repository: https://github.com/jnbbest/household-os

These tools allow the native Hermes Agent (running via WhatsApp Baileys or Telegram)
to read and mutate your personal Household OS Google Sheet in real time.
"""

import os
import json
import urllib.request
import urllib.parse
from datetime import datetime

# Read from environment or fallback
SHEET_WEBHOOK_URL = os.environ.get("HOUSEHOLD_SHEET_URL", "")

def _call_webhook(payload: dict) -> dict:
    if not SHEET_WEBHOOK_URL:
        return {"status": "error", "message": "HOUSEHOLD_SHEET_URL environment variable is not set."}
    
    try:
        req = urllib.request.Request(
            SHEET_WEBHOOK_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            res_data = response.read().decode("utf-8")
            return json.loads(res_data)
    except Exception as e:
        return {"status": "error", "message": str(e)}


def log_expense(amount: float, bucket: str = "Variable", item_name: str = "Expense", notes: str = "") -> str:
    """
    Log an expense into the Household OS Google Sheet Money Pool.
    
    Args:
        amount: Number in INR (e.g. 1200)
        bucket: "Fixed" (Rent, EMIs, Staff Salary) or "Variable" (Groceries, Dining, Blinkit)
        item_name: Description of the expense (e.g. "Blinkit Doodh Dahi")
        notes: Additional context (e.g. "Split 50/50 with partner")
    """
    normalized_bucket = "Fixed" if "fix" in bucket.lower() else "Variable"
    payload = {
        "tab": "Money_Pool",
        "action": "append_row",
        "row": {
            "id": f"exp-{int(datetime.now().timestamp())}",
            "bucket": normalized_bucket,
            "itemName": item_name,
            "amount": amount,
            "notes": notes or f"Logged via Hermes Agent at {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        }
    }
    res = _call_webhook(payload)
    if res.get("status") == "success":
        return f"Successfully logged ₹{amount:,.2f} under {normalized_bucket} ({item_name}) to Google Sheet."
    return f"Failed to sync with Google Sheet: {res.get('message')}"


def update_chore(task_name: str, status: str = "completed") -> str:
    """
    Mark a chore as completed or pending in Household OS.
    
    Args:
        task_name: Keyword of the task (e.g. "water filter", "deep clean", "grocery")
        status: "completed" or "pending"
    """
    payload = {
        "tab": "Ownership",
        "action": "append_row",
        "row": {
            "id": f"task-upd-{int(datetime.now().timestamp())}",
            "title": task_name,
            "status": status.lower(),
            "lastCompletedDate": datetime.now().strftime("%Y-%m-%d")
        }
    }
    res = _call_webhook(payload)
    if res.get("status") == "success":
        return f"Updated chore '{task_name}' to status: {status.upper()}."
    return f"Error updating chore: {res.get('message')}"


def get_household_summary() -> str:
    """
    Fetch the latest status summary from Household OS Google Sheet.
    """
    if not SHEET_WEBHOOK_URL:
        return "Google Sheet URL is not configured."
    
    try:
        url = f"{SHEET_WEBHOOK_URL}?tab=all"
        req = urllib.request.Request(url, headers={"User-Agent": "HermesAgent/1.0"})
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode("utf-8"))
            if data.get("status") == "success":
                money = data.get("data", {}).get("Money_Pool", [])
                tasks = data.get("data", {}).get("Ownership", [])
                total_spend = sum(float(x.get("amount", 0)) for x in money)
                pending_tasks = len([t for t in tasks if t.get("status") != "completed"])
                return f"Household Summary: Total Logged Expenses: ₹{total_spend:,.2f} across {len(money)} items. Pending Chores: {pending_tasks} remaining."
    except Exception as e:
        return f"Could not fetch summary: {str(e)}"
    return "Summary unavailable."
