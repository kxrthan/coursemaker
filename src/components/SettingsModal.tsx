import React, { useState, useEffect } from 'react';
import { getApiKey, setApiKey } from '../utils/aiClient';
import { Key, X, Save } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setLocalApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocalApiKey(getApiKey() || '');
      setSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiKey(apiKey);
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '500px',
        padding: '32px',
        borderRadius: '16px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
        >
          <X size={24} />
        </button>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Key size={24} color="var(--accent-color)" />
          AI Settings
        </h2>

        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem' }}>
          To enable the AI Tutor and Quiz Generator, please enter your Google Gemini API key. Your key is stored securely in your browser and never sent to our servers.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Google Gemini API Key</label>
          <input 
            type="password"
            value={apiKey}
            onChange={e => setLocalApiKey(e.target.value)}
            placeholder="AIzaSy..."
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              fontSize: '1rem'
            }}
          />
        </div>

        <button 
          className="btn btn-primary" 
          onClick={handleSave}
          style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
        >
          {saved ? 'Saved!' : 'Save Settings'}
          {!saved && <Save size={18} />}
        </button>
      </div>
    </div>
  );
};
