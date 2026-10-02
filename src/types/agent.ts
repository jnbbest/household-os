export type AIProvider = 'openrouter' | 'groq';

export interface AISettings {
  provider: AIProvider;
  apiKey: string;
  model: string;
  telegramBotToken?: string;
}

export type ToolName = 
  | 'tool_log_expense' 
  | 'tool_update_chore' 
  | 'tool_draft_staff_message' 
  | 'tool_query_household_status';

export interface WhatsAppActionPayload {
  recipientName: string;
  phoneNumber?: string;
  messageText: string;
  language: 'hi' | 'en' | 'hinglish';
  intent: 'cook_menu' | 'maid_instruction' | 'maintenance_reminder' | 'spouse_nudge' | 'general';
}

export interface AgentActionCard {
  id: string;
  type: 'expense_logged' | 'chore_updated' | 'whatsapp_dispatch' | 'status_summary';
  title: string;
  description: string;
  timestamp: string;
  details?: Record<string, any>;
  waPayload?: WhatsAppActionPayload;
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  actionCards?: AgentActionCard[];
  error?: string;
}
