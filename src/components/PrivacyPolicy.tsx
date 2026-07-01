import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="app-container" style={{ display: 'block', overflowY: 'auto' }}>
      <header className="header" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button 
            onClick={onBack}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', margin: 0 }}>Privacy Policy</h1>
        </div>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px', lineHeight: '1.7' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', marginBottom: '24px', color: 'var(--accent-color)' }}>
          Privacy Policy
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>Last updated: {new Date().toLocaleDateString()}</p>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>1. Introduction</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Welcome to CourseMaker. We respect your privacy and are committed to protecting your personal data. 
            This Privacy Policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights.
          </p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>2. Local First Architecture</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            CourseMaker is designed with privacy at its core. <strong>Your large course files (videos, PDFs, images) are never uploaded to our servers.</strong> 
            They remain entirely local on your device. We use browser APIs to securely read these files locally to provide the playback experience.
          </p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>3. What Data We Collect</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>We only collect the absolute minimum data required to sync your progress across devices:</p>
          <ul style={{ color: 'var(--text-secondary)', paddingLeft: '24px' }}>
            <li style={{ marginBottom: '8px' }}><strong>Account Data:</strong> Your email address and username used for authentication.</li>
            <li style={{ marginBottom: '8px' }}><strong>Metadata:</strong> The names, directory structures, and your viewing progress of the courses you add.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>4. Data Security</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way. 
            All metadata syncing is handled securely via Supabase, employing industry-standard encryption and security protocols.
          </p>
        </section>
      </main>
    </div>
  );
};
