import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Loader2, Sparkles } from 'lucide-react';
import { generateAIResponse, hasApiKey } from '../utils/aiClient';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AITutorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  contextTitle: string;
  contextText?: string;
  contextImage?: File;
  onOpenSettings: () => void;
}

export const AITutorPanel: React.FC<AITutorPanelProps> = ({ isOpen, onClose, contextTitle, contextText, contextImage, onOpenSettings }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Hi! I'm your AI Tutor. I can answer questions about "${contextTitle}". What would you like to know?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset messages when context changes
  useEffect(() => {
    setMessages([
      { role: 'assistant', content: `Hi! I'm your AI Tutor. I can answer questions about "${contextTitle}". What would you like to know?` }
    ]);
  }, [contextTitle]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    if (!hasApiKey()) {
      onOpenSettings();
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // Build a conversation history block for the AI to have context of previous messages
      const historyContext = messages.map(m => `${m.role === 'user' ? 'User' : 'Tutor'}: ${m.content}`).join('\n');
      
      let typeDescription = 'transcript';
      if (contextTitle.toLowerCase().endsWith('.pdf')) typeDescription = 'PDF document';

      const systemContext = `You are an expert tutor helping a student understand a course. 
The current lesson/file is titled: "${contextTitle}".
${contextText ? `[SYSTEM NOTE TO AI]: The user may ask you to read a file or PDF. You DO NOT need to open any files because the text has already been extracted for you. Here is the exact text content of the ${typeDescription}:\n\n${contextText}\n\n` : ''}
${contextImage ? `[SYSTEM NOTE TO AI]: An image has been provided to you in this prompt using Gemini Vision. You CAN see the image. Please analyze it if the user asks.\n\n` : ''}
Conversation History:\n${historyContext}`;

      const response = await generateAIResponse(userMessage, systemContext, contextImage);
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}. Please check your API key.` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = () => {
    setInput('Can you provide a detailed summary of this lesson?');
    setTimeout(handleSend, 100);
  };

  if (!isOpen) return null;

  return (
    <div className="ai-tutor-panel" style={{
      flexShrink: 0,
      backgroundColor: 'var(--bg-secondary)',
      borderLeft: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      zIndex: 20
    }}>
      <div style={{
        padding: '20px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-color)' }}>
          <Bot size={24} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>AI Tutor</h3>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <X size={20} />
        </button>
      </div>

      <div style={{ 
        padding: '8px 20px', 
        backgroundColor: 'rgba(255,255,255,0.02)', 
        borderBottom: '1px solid var(--border-color)',
        fontSize: '0.8rem', 
        color: 'var(--text-secondary)', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px' 
      }}>
        <Sparkles size={14} color="var(--accent-color)" />
        {contextImage 
          ? 'Looking at image...' 
          : contextText 
            ? 'Reading document/transcript...' 
            : 'Aware of current lesson title...'}
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            backgroundColor: msg.role === 'user' ? 'var(--accent-color)' : 'var(--bg-tertiary)',
            color: msg.role === 'user' ? '#000' : 'var(--text-primary)',
            padding: '12px 16px',
            borderRadius: '16px',
            borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
            borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '16px',
            maxWidth: '85%',
            fontSize: '0.9rem',
            lineHeight: 1.5
          }}>
            {msg.content}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start', color: 'var(--text-secondary)' }}>
            <Loader2 className="animate-spin" size={20} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
        {contextText && (
          <button 
            onClick={handleSummarize}
            className="btn btn-secondary"
            style={{ width: '100%', marginBottom: '12px', display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '0.85rem', padding: '8px' }}
          >
            <Sparkles size={16} color="var(--accent-color)" />
            Summarize Lesson
          </button>
        )}
        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={hasApiKey() ? "Ask a question..." : "Setup API Key to chat..."}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)'
            }}
          />
          <button 
            onClick={handleSend}
            style={{
              backgroundColor: 'var(--accent-color)',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              width: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
