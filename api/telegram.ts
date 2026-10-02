/**
 * Vercel Serverless Function: Telegram Webhook for Household OS
 * Routes incoming family Telegram voice notes and messages to Hermes 3.
 * Automatically updates Google Sheets and replies back with markdown & 1-tap WhatsApp action buttons.
 */

export const config = {
  maxDuration: 30,
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'Household OS Telegram Webhook Active' });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const aiApiKey = process.env.VITE_AI_API_KEY || process.env.OPENROUTER_API_KEY || process.env.GROQ_API_KEY;
  const sheetUrl = process.env.VITE_GOOGLE_SHEET_URL;

  if (!botToken) {
    console.warn('[Telegram Webhook] TELEGRAM_BOT_TOKEN is not configured.');
    return res.status(200).json({ error: 'TELEGRAM_BOT_TOKEN missing in Vercel environment' });
  }

  const update = req.body;
  if (!update || !update.message) {
    return res.status(200).json({ status: 'No message to process' });
  }

  const message = update.message;
  const chatId = message.chat.id;
  const senderName = message.from?.first_name || 'Family Member';
  let userText = message.text || '';

  // 1. Handle Voice Note / Audio if present
  if (message.voice && aiApiKey) {
    try {
      // Get file URL from Telegram
      const fileRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${message.voice.file_id}`);
      const fileData: any = await fileRes.json();
      if (fileData.ok && fileData.result?.file_path) {
        const audioUrl = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
        const audioBlobRes = await fetch(audioUrl);
        const audioBuffer = await audioBlobRes.arrayBuffer();

        // Transcribe via Groq Whisper API
        const formData = new FormData();
        const file = new Blob([audioBuffer], { type: 'audio/ogg' });
        formData.append('file', file, 'voice.ogg');
        formData.append('model', 'whisper-large-v3-turbo');
        formData.append('language', 'hi'); // Indian audio / Hinglish

        const whisperRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${aiApiKey}` },
          body: formData
        });
        const whisperData: any = await whisperRes.json();
        if (whisperData.text) {
          userText = whisperData.text;
        }
      }
    } catch (voiceErr) {
      console.warn('[Telegram Webhook] Voice transcription error:', voiceErr);
    }
  }

  if (!userText.trim()) {
    await sendTelegramMessage(botToken, chatId, "🎙️ I received your audio, but couldn't transcribe it. Please send text or check Groq API configuration.");
    return res.status(200).json({ status: 'Empty text' });
  }

  // 2. Process query with Hermes 3 / AI Engine
  let replyText = `✅ Logged: "${userText}"`;
  let inlineKeyboard: any = null;

  if (aiApiKey) {
    try {
      const isGroq = aiApiKey.startsWith('gsk_');
      const endpoint = isGroq 
        ? 'https://api.groq.com/openai/v1/chat/completions' 
        : 'https://openrouter.ai/api/v1/chat/completions';
      const model = isGroq 
        ? 'llama-3.3-70b-versatile' 
        : 'nousresearch/hermes-3-llama-3.1-405b:free';

      const aiRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiApiKey}`,
          'X-Title': 'Household OS Telegram Bot'
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are Ghar Butler, the AI assistant of Household OS. Respond in friendly Hinglish/English. If user mentions spending or chores, confirm the update clearly.'
            },
            {
              role: 'user',
              content: `Message from ${senderName}: ${userText}`
            }
          ],
          temperature: 0.3
        })
      });

      if (aiRes.ok) {
        const aiData: any = await aiRes.json();
        replyText = aiData.choices?.[0]?.message?.content || replyText;
      }
    } catch (e: any) {
      console.warn('[Telegram Webhook] Hermes AI error:', e.message);
    }
  }

  // 3. Simple Heuristic Check for Sheet Mutation (if sheet URL present)
  const lower = userText.toLowerCase();
  const amtMatch = lower.match(/(?:rs\.?|inr|₹|\s)?\s*(\d{2,6})\s*(?:rs|rupees|ka|ke)?/i);
  if (amtMatch && sheetUrl) {
    const amt = parseInt(amtMatch[1], 10);
    const bucket = (lower.includes('rent') || lower.includes('maid') || lower.includes('salary')) ? 'Fixed' : 'Variable';
    try {
      await fetch(sheetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tab: 'Money_Pool',
          action: 'append_row',
          row: {
            id: `exp-${Date.now()}`,
            bucket: bucket,
            itemName: userText.slice(0, 30),
            amount: amt,
            notes: `Logged via Telegram by ${senderName}`
          }
        })
      });
      replyText += `\n\n📊 *Synced to Google Sheet:* ₹${amt} added under ${bucket} Pool.`;
    } catch (sheetErr) {
      console.warn('[Telegram Webhook] Sheet sync error:', sheetErr);
    }
  }

  // 4. Staff instruction -> WhatsApp 1-tap deep link button
  if (lower.includes('cook') || lower.includes('maid') || lower.includes('khana') || lower.includes('poha')) {
    const waText = encodeURIComponent(`नमस्ते भैया, ${userText}`);
    inlineKeyboard = {
      inline_keyboard: [
        [
          {
            text: '📲 Forward to Cook on WhatsApp',
            url: `https://wa.me/?text=${waText}`
          }
        ]
      ]
    };
  }

  // Send message to Telegram
  await sendTelegramMessage(botToken, chatId, replyText, inlineKeyboard);
  return res.status(200).json({ status: 'ok' });
}

async function sendTelegramMessage(token: string, chatId: number, text: string, replyMarkup?: any) {
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown',
        reply_markup: replyMarkup
      })
    });
  } catch (err) {
    console.warn('[Telegram Webhook] sendMessage failed:', err);
  }
}
