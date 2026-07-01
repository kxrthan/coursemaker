import React from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

interface ErrorPageProps {
  title?: string;
  message?: string;
  onGoHome: () => void;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({ 
  title = "404 - Page Not Found", 
  message = "The page you're looking for doesn't exist or has been moved.", 
  onGoHome 
}) => {
  return (
    <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div className="upload-card animate-fade-in" style={{ padding: '60px 40px', maxWidth: '500px', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          borderRadius: '50%', 
          background: 'rgba(255, 68, 68, 0.1)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginBottom: '32px'
        }}>
          <AlertTriangle size={40} color="#ff4444" />
        </div>
        
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
          {title}
        </h1>
        
        <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', fontSize: '1.1rem', lineHeight: '1.6' }}>
          {message}
        </p>

        <button 
          onClick={onGoHome}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 32px' }}
        >
          <ArrowLeft size={20} />
          Back to Home
        </button>
      </div>
    </div>
  );
};
