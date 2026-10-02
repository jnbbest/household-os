import { AISettings, AgentActionCard, ToolName, WhatsAppActionPayload } from '../types/agent';
import { TaskOwnership, ExpenseItem, MoneyPoolState, EmergencyInfo } from '../types/household';

const STORAGE_KEY_AI = 'household_os_ai_settings';

export const DEFAULT_AI_SETTINGS: AISettings = {
  provider: 'openrouter',
  apiKey: '',
  model: 'nousresearch/hermes-3-llama-3.1-405b:free'
};

export function getAISettings(): AISettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AI);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_AI_SETTINGS, ...parsed };
    }
  } catch (e) {}

  // Fallback to env var if present
  const envKey = (import.meta.env.VITE_AI_API_KEY as string) || '';
  return {
    ...DEFAULT_AI_SETTINGS,
    apiKey: envKey.trim()
  };
}

export function saveAISettings(settings: AISettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_AI, JSON.stringify(settings));
  } catch (e) {}
}

const HERMES_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'tool_log_expense',
      description: 'Log an expense into the household money pool (Fixed vs Variable bucket). Use whenever the user mentions spending, buying items, ordering groceries (Blinkit, Zepto, Instamart), paying bills, or domestic staff salaries.',
      parameters: {
        type: 'object',
        properties: {
          itemName: {
            type: 'string',
            description: 'Name of the item or expense (e.g. "Blinkit Groceries", "Petrol", "Cook Salary")'
          },
          amount: {
            type: 'number',
            description: 'Amount in Indian Rupees (INR)'
          },
          bucket: {
            type: 'string',
            enum: ['Fixed', 'Variable'],
            description: 'Fixed (rent, EMIs, society maintenance, electricity, domestic staff salaries) vs Variable (groceries, dining out, transport, shopping, snacks)'
          },
          notes: {
            type: 'string',
            description: 'Any extra details, e.g. "split 50/50 with Rohan" or "paid via UPI"'
          }
        },
        required: ['itemName', 'amount', 'bucket']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'tool_update_chore',
      description: 'Mark a household chore as completed or update its ownership/status. Matches against existing chores like Dishwasher, Deep Clean, Grocery Run, Water Filter, etc.',
      parameters: {
        type: 'object',
        properties: {
          taskKeyword: {
            type: 'string',
            description: 'Keywords to identify the task (e.g. "dishes", "grocery", "maid", "water filter")'
          },
          status: {
            type: 'string',
            enum: ['completed', 'pending'],
            description: 'Target status of the chore'
          },
          notes: {
            type: 'string',
            description: 'Optional update note or timestamp'
          }
        },
        required: ['taskKeyword', 'status']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'tool_draft_staff_message',
      description: 'Draft a polite WhatsApp instruction for domestic staff (cook, maid, driver) or a spouse nudge. Translates instructions into conversational, respectful Hindi or Hinglish, and generates a 1-tap WhatsApp deep link.',
      parameters: {
        type: 'object',
        properties: {
          recipientName: {
            type: 'string',
            description: 'Name or role of recipient (e.g. "Ramu Bhaiya", "Cook", "Maid", "Partner")'
          },
          phoneNumber: {
            type: 'string',
            description: 'Optional 10-digit Indian mobile number (with or without 91 prefix)'
          },
          intent: {
            type: 'string',
            enum: ['cook_menu', 'maid_instruction', 'maintenance_reminder', 'spouse_nudge', 'general'],
            description: 'Intent of the message'
          },
          messageTextInHindi: {
            type: 'string',
            description: 'Polite, clear message drafted in natural conversational Hindi (Devanagari or Romanized Hinglish). E.g. "नमस्ते भैया, कल सुबह नाश्ते में पोहा बना दीजियेगा और चाय।"'
          }
        },
        required: ['recipientName', 'intent', 'messageTextInHindi']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'tool_query_household_status',
      description: 'Query current household stats like money pool balance, pending chores count, or emergency hospital contact.',
      parameters: {
        type: 'object',
        properties: {
          queryType: {
            type: 'string',
            enum: ['money_summary', 'pending_chores', 'emergency_ice'],
            description: 'The type of household information requested'
          }
        },
        required: ['queryType']
      }
    }
  }
];

export interface ProcessAgentInputOptions {
  prompt: string;
  tasks: TaskOwnership[];
  moneyState: MoneyPoolState;
  emergencyInfo: EmergencyInfo;
  onAddExpense: (expense: ExpenseItem) => void;
  onUpdateTasks: (updated: TaskOwnership[]) => void;
}

export interface AgentProcessResult {
  replyText: string;
  actionCards: AgentActionCard[];
  usedFallback?: boolean;
}

export async function processAgentCommand(
  options: ProcessAgentInputOptions
): Promise<AgentProcessResult> {
  const { prompt, tasks, moneyState, emergencyInfo, onAddExpense, onUpdateTasks } = options;
  const settings = getAISettings();

  // If no API key provided, run intelligent local heuristic mode
  if (!settings.apiKey) {
    return runLocalHeuristicMode(prompt, tasks, moneyState, onAddExpense, onUpdateTasks);
  }

  const endpoint = settings.provider === 'openrouter'
    ? 'https://openrouter.ai/api/v1/chat/completions'
    : 'https://api.groq.com/openai/v1/chat/completions';

  const model = settings.provider === 'openrouter'
    ? (settings.model || 'nousresearch/hermes-3-llama-3.1-405b:free')
    : 'llama-3.3-70b-versatile';

  const systemPrompt = `You are Ghar Butler, the autonomous AI Chief Operating Officer of Household OS, powered by Nous Research's Hermes 3.
You run the home efficiently, eliminate invisible mental load, and take proactive action.

Current Household Context:
- Active Chores Count: ${tasks.length} (${tasks.filter(t => t.status === 'pending').length} pending)
- Total Variable & Fixed Expenses Count: ${moneyState.items.length}
- Primary Household Currency: ₹ (INR)
- Partners: ${moneyState.partnerAName} & ${moneyState.partnerBName}

Guidelines:
1. When the user mentions spending money, grocery shopping, or staff payments, ALWAYS call tool_log_expense with appropriate amount and bucket.
2. When the user instructs domestic staff (e.g. cook meal prep, maid timing, driver instructions) or nudges partner, ALWAYS call tool_draft_staff_message to craft a polite, conversational Hindi/Hinglish message for WhatsApp.
3. When the user mentions doing a chore, ALWAYS call tool_update_chore.
4. Keep final responses crisp, warm, and structured. Speak natural Hinglish or English as used in urban Indian households.`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`,
        ...(settings.provider === 'openrouter' ? {
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Household OS'
        } : {})
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        tools: HERMES_TOOLS,
        tool_choice: 'auto',
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[GharButler] AI API error: ${response.status}`, errText);
      // If 429 rate limit on free tier, fallback gracefully with explanation
      if (response.status === 429) {
        return {
          replyText: `⏳ **OpenRouter Free Tier Rate Limit Reached** (50 requests/day limit on \`hermes-3-llama-3.1-405b:free\`).\n\n💡 **Tip:** To eliminate limits, deposit \$1 on OpenRouter for instant priority, or switch to Groq in Settings. In the meantime, I've processed your command via local heuristics below:`,
          actionCards: (await runLocalHeuristicMode(prompt, tasks, moneyState, onAddExpense, onUpdateTasks)).actionCards,
          usedFallback: true
        };
      }
      throw new Error(`API responded with ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    const message = choice?.message;

    const actionCards: AgentActionCard[] = [];

    // Process tool calls if Hermes executed functions
    if (message?.tool_calls && message.tool_calls.length > 0) {
      for (const call of message.tool_calls) {
        const fnName: ToolName = call.function.name;
        const args = JSON.parse(call.function.arguments || '{}');

        if (fnName === 'tool_log_expense') {
          const newExpense: ExpenseItem = {
            id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            bucket: args.bucket || 'Variable',
            itemName: args.itemName || 'Quick Expense',
            amount: Number(args.amount) || 0,
            notes: args.notes || 'Logged via Hermes Ghar Butler'
          };
          onAddExpense(newExpense);
          actionCards.push({
            id: `card-${Date.now()}-exp`,
            type: 'expense_logged',
            title: `₹${newExpense.amount.toLocaleString('en-IN')} Logged to ${newExpense.bucket}`,
            description: `${newExpense.itemName} ${args.notes ? `(${args.notes})` : ''}`,
            timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            details: { ...newExpense }
          });
        } else if (fnName === 'tool_update_chore') {
          const kw = (args.taskKeyword || '').toLowerCase();
          const targetTask = tasks.find(t => 
            t.title.toLowerCase().includes(kw) || t.domain.toLowerCase().includes(kw)
          );
          if (targetTask) {
            const updated = tasks.map(t => 
              t.id === targetTask.id 
                ? { ...t, status: args.status as 'completed' | 'pending', lastCompletedDate: new Date().toISOString() }
                : t
            );
            onUpdateTasks(updated);
            actionCards.push({
              id: `card-${Date.now()}-chore`,
              type: 'chore_updated',
              title: `Chore Updated: ${targetTask.title}`,
              description: `Marked as ${args.status.toUpperCase()} (${targetTask.primaryOwner})`,
              timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
            });
          }
        } else if (fnName === 'tool_draft_staff_message') {
          const payload: WhatsAppActionPayload = {
            recipientName: args.recipientName || 'Domestic Staff',
            phoneNumber: args.phoneNumber,
            messageText: args.messageTextInHindi || '',
            language: 'hi',
            intent: args.intent || 'general'
          };
          actionCards.push({
            id: `card-${Date.now()}-wa`,
            type: 'whatsapp_dispatch',
            title: `1-Tap WhatsApp to ${payload.recipientName}`,
            description: payload.messageText,
            timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            waPayload: payload
          });
        }
      }
    }

    const replyText = message?.content || (actionCards.length > 0 
      ? `Done! I've executed ${actionCards.length} action${actionCards.length > 1 ? 's' : ''} for your household.` 
      : 'Action completed.');

    return {
      replyText,
      actionCards
    };

  } catch (err: any) {
    console.warn('[GharButler] Falling back to heuristic parsing:', err);
    return runLocalHeuristicMode(prompt, tasks, moneyState, onAddExpense, onUpdateTasks);
  }
}

// Local smart heuristic processor (works with 0 API keys or during offline/network errors)
function runLocalHeuristicMode(
  prompt: string,
  tasks: TaskOwnership[],
  moneyState: MoneyPoolState,
  onAddExpense: (expense: ExpenseItem) => void,
  onUpdateTasks: (updated: TaskOwnership[]) => void
): AgentProcessResult {
  const p = prompt.trim();
  const lower = p.toLowerCase();
  const actionCards: AgentActionCard[] = [];
  let replyText = '';

  // 1. Detect Expense logging pattern: e.g. "Blinkit 1200", "bought milk 150", "petrol 850"
  const amountMatch = lower.match(/(?:rs\.?|inr|₹|\s)?\s*(\d{2,6})\s*(?:rs|rupees|ka|ke)?/i);
  const isExpenseIntent = lower.includes('bought') || lower.includes('paid') || lower.includes('spend') ||
    lower.includes('order') || lower.includes('blinkit') || lower.includes('zepto') || lower.includes('swiggy') ||
    lower.includes('zomato') || lower.includes('petrol') || lower.includes('grocer') || lower.includes('salary');

  if (amountMatch && isExpenseIntent) {
    const amt = parseInt(amountMatch[1], 10);
    const isFixed = lower.includes('rent') || lower.includes('maid') || lower.includes('cook') || lower.includes('salary') || lower.includes('emi') || lower.includes('maintenance');
    const bucket = isFixed ? 'Fixed' : 'Variable';
    
    // Clean name
    let cleanName = p.replace(/\d+/g, '').replace(/(?:rs\.?|inr|₹|ka|ke|bought|paid|for|split)/gi, '').trim();
    if (!cleanName || cleanName.length < 2) cleanName = 'Quick Expense';

    const newExp: ExpenseItem = {
      id: `exp-${Date.now()}`,
      bucket: bucket,
      itemName: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
      amount: amt,
      notes: 'Logged via Ghar Butler'
    };
    onAddExpense(newExp);

    actionCards.push({
      id: `card-${Date.now()}-exp`,
      type: 'expense_logged',
      title: `₹${amt.toLocaleString('en-IN')} Logged to ${bucket} Pool`,
      description: `${newExp.itemName} · Balance auto-recalculated`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      details: { ...newExp }
    });
    replyText += `Logged ₹${amt} under ${bucket} Pool (${newExp.itemName}). `;
  }

  // 2. Detect Staff Instruction -> WhatsApp Deep Link Card
  if (lower.includes('cook') || lower.includes('maid') || lower.includes('khana') || lower.includes('bhaiya') || lower.includes('didi') || lower.includes('breakfast') || lower.includes('poha') || lower.includes('dinner')) {
    const recipient = lower.includes('maid') ? 'Kamla Didi (Maid)' : 'Ramu Bhaiya (Cook)';
    let hindiDraft = 'नमस्ते भैया, कल सुबह नाश्ते में पोहा बना दीजियेगा।';
    if (lower.includes('leave') || lower.includes('chutti')) {
      hindiDraft = 'नमस्ते, कृपया ध्यान दें कि कल आपकी छुट्टी स्वीकृत है।';
    } else if (p.length > 5) {
      hindiDraft = `नमस्ते, ${p} (Household OS Update)`;
    }

    actionCards.push({
      id: `card-${Date.now()}-wa`,
      type: 'whatsapp_dispatch',
      title: `1-Tap WhatsApp to ${recipient}`,
      description: hindiDraft,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      waPayload: {
        recipientName: recipient,
        messageText: hindiDraft,
        language: 'hi',
        intent: 'cook_menu'
      }
    });
    replyText += `Drafted WhatsApp instruction for ${recipient}. Tap the button to send directly. `;
  }

  // 3. Detect Chore Completion
  if (lower.includes('done') || lower.includes('completed') || lower.includes('ho gaya') || lower.includes('clean') || lower.includes('dishes')) {
    const matchingTask = tasks.find(t => lower.includes(t.title.toLowerCase().slice(0, 5)));
    if (matchingTask) {
      const updated = tasks.map(t => t.id === matchingTask.id ? { ...t, status: 'completed' as const } : t);
      onUpdateTasks(updated);
      actionCards.push({
        id: `card-${Date.now()}-task`,
        type: 'chore_updated',
        title: `Task Completed: ${matchingTask.title}`,
        description: `Marked done by ${matchingTask.primaryOwner}`,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      });
      replyText += `Marked "${matchingTask.title}" as completed. `;
    }
  }

  if (!replyText) {
    replyText = `Ghar Butler received your note. (Tip: Configure your OpenRouter API Key in Settings to unlock the full Hermes 3 405B agentic loop).`;
  }

  return {
    replyText,
    actionCards,
    usedFallback: true
  };
}
