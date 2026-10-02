import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  Send, 
  ArrowUpRight, 
  CheckCircle2, 
  ExternalLink, 
  MessageSquare, 
  X, 
  ChevronDown, 
  Zap,
  Volume2
} from 'lucide-react';
import { TaskOwnership, MoneyPoolState, EmergencyInfo, ExpenseItem } from '../types/household';
import { AgentActionCard, AgentMessage } from '../types/agent';
import { processAgentCommand, getAISettings } from '../lib/hermesClient';

interface GharButlerProps {
  tasks: TaskOwnership[];
  moneyState: MoneyPoolState;
  emergencyInfo: EmergencyInfo;
  onAddExpense: (expense: ExpenseItem) => void;
  onUpdateTasks: (updated: TaskOwnership[]) => void;
  onOpenSettings: () => void;
}

export const GharButler: React.FC<GharButlerProps> = ({
  tasks,
  moneyState,
  emergencyInfo,
  onAddExpense,
  onUpdateTasks,
  onOpenSettings
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: 'Namaste! I am your Ghar Butler powered by Hermes 3. Speak or text anything in Hinglish — like "Blinkit 1200 log karo" or "Cook ko kal subah poha banane bolo".',
      timestamp: 'Just now'
    }
  ]);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiSettings = getAISettings();

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Setup Web Speech API for zero-cost ambient voice
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN'; // Indian English / Hinglish acoustics

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          handleSend(transcript);
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in this browser. Please use Chrome, Safari, or Edge.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsOpen(true);
      try {
        recognitionRef.current.start();
      } catch (e) {
        recognitionRef.current.stop();
      }
    }
  };

  const handleSend = async (manualText?: string) => {
    const query = manualText || inputText;
    if (!query.trim() || isProcessing) return;

    setInputText('');
    const userMsg: AgentMessage = {
      id: `msg-${Date.now()}-u`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);
    setIsOpen(true);

    try {
      const result = await processAgentCommand({
        prompt: query,
        tasks,
        moneyState,
        emergencyInfo,
        onAddExpense,
        onUpdateTasks
      });

      const assistantMsg: AgentMessage = {
        id: `msg-${Date.now()}-a`,
        role: 'assistant',
        content: result.replyText,
        actionCards: result.actionCards,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}-err`,
          role: 'assistant',
          content: 'Sorry, I hit an error executing that request. Please verify your OpenRouter API key in Settings.',
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          error: err.message
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const openWhatsApp = (phoneNumber: string | undefined, messageText: string) => {
    const encoded = encodeURIComponent(messageText);
    const cleanPhone = phoneNumber ? phoneNumber.replace(/\D/g, '') : '';
    const url = cleanPhone 
      ? `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* Floating Bottom Ambient Butler Trigger Bar */}
      <div className="fixed bottom-5 right-4 sm:right-8 z-50 flex items-center gap-2">
        {!isOpen && (
          <div className="flex items-center gap-2 bg-plate/95 backdrop-blur-md border border-rule-2 p-1.5 pl-3 rounded-full shadow-lg">
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 text-xs font-mono font-medium text-ink hover:text-terra transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-terra animate-pulse" />
              <span className="hidden sm:inline">Ghar Butler (Hermes 3)</span>
              <span className="sm:hidden">Butler</span>
            </button>

            <button
              onClick={toggleListening}
              title={isListening ? "Listening..." : "Speak command in Hinglish"}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                isListening 
                  ? 'bg-terra text-white shadow-md animate-bounce ring-4 ring-terra/20' 
                  : 'bg-paper text-terra hover:bg-plate border border-rule hover:border-terra/40'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      {/* Expanded Butler Drawer / Panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:right-8 z-50 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[580px] bg-plate border border-ink shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Header */}
          <div className="bg-ink text-paper px-4 py-3 flex items-center justify-between border-b border-rule-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-terra flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-mono font-semibold tracking-wide uppercase">Ghar Butler</h3>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 bg-paper/15 text-paper rounded">
                    {aiSettings.apiKey ? 'Hermes 3 Active' : 'Heuristic Mode'}
                  </span>
                </div>
                <p className="text-[10px] text-faint">Ambient Family Operating System</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {!aiSettings.apiKey && (
                <button
                  onClick={onOpenSettings}
                  className="text-[10px] font-mono text-terra-lt underline mr-2 hover:text-white"
                >
                  Add Key
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-faint hover:text-paper rounded transition-colors"
                title="Minimize Butler"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Conversation History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-paper/50 min-h-[260px] max-h-[380px] text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3 rounded-xl leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-terra text-white rounded-br-none shadow-sm'
                      : 'bg-plate border border-rule text-ink rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>

                  {/* Render Autonomous Action Cards */}
                  {m.actionCards && m.actionCards.length > 0 && (
                    <div className="mt-3 space-y-2 pt-2 border-t border-rule/50">
                      {m.actionCards.map((card) => (
                        <div
                          key={card.id}
                          className="bg-paper border border-rule rounded-lg p-2.5 text-ink space-y-1.5 shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] font-semibold text-terra uppercase flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              {card.title}
                            </span>
                            <span className="text-[9px] text-faint font-mono">{card.timestamp}</span>
                          </div>

                          <p className="text-[11px] text-body">{card.description}</p>

                          {/* 1-Tap WhatsApp Action Card Button */}
                          {card.type === 'whatsapp_dispatch' && card.waPayload && (
                            <button
                              onClick={() => openWhatsApp(card.waPayload?.phoneNumber, card.waPayload?.messageText || '')}
                              className="w-full mt-2 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd5a] text-white py-1.5 px-3 rounded text-[11px] font-semibold shadow-xs transition-colors"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Send on WhatsApp</span>
                              <ArrowUpRight className="w-3 h-3 ml-auto opacity-75" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-faint mt-1 px-1 font-mono">{m.timestamp}</span>
              </div>
            ))}

            {isProcessing && (
              <div className="flex items-center gap-2 text-muted text-xs p-2">
                <div className="w-2 h-2 rounded-full bg-terra animate-ping" />
                <span className="font-mono text-[11px]">Hermes 3 is reasoning and executing tools...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Intent Prompts */}
          <div className="px-3 py-1.5 bg-plate border-t border-rule flex gap-1.5 overflow-x-auto text-[10px] font-mono text-muted">
            <button
              onClick={() => handleSend('Blinkit se doodh dahi 450 log karo')}
              className="px-2 py-0.5 rounded bg-paper border border-rule hover:border-terra whitespace-nowrap"
            >
              ₹450 Blinkit
            </button>
            <button
              onClick={() => handleSend('Cook ko bolo kal subah aloo paratha banaye')}
              className="px-2 py-0.5 rounded bg-paper border border-rule hover:border-terra whitespace-nowrap"
            >
              Cook Menu
            </button>
            <button
              onClick={() => handleSend('Mark water filter chore as completed')}
              className="px-2 py-0.5 rounded bg-paper border border-rule hover:border-terra whitespace-nowrap"
            >
              Chore Done
            </button>
          </div>

          {/* Input Box */}
          <div className="p-3 bg-plate border-t border-ink/10 flex items-center gap-2">
            <button
              onClick={toggleListening}
              className={`p-2 rounded-lg transition-all ${
                isListening 
                  ? 'bg-terra text-white animate-pulse' 
                  : 'bg-paper text-muted hover:text-terra border border-rule'
              }`}
              title={isListening ? "Listening..." : "Click to Speak"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? "Listening in Hinglish..." : "Type or speak to Ghar Butler..."}
              className="flex-1 bg-paper border border-rule rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-terra font-sans"
              disabled={isProcessing}
            />

            <button
              onClick={() => handleSend()}
              disabled={!inputText.trim() || isProcessing}
              className="p-2 bg-ink hover:bg-terra disabled:opacity-40 text-white rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}
    </>
  );
};
