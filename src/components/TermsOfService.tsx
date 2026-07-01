import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

interface TermsOfServiceProps {
  onBack: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
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
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', margin: 0 }}>Terms of Service</h1>
        </div>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px', lineHeight: '1.7' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', marginBottom: '24px', color: 'var(--accent-color)' }}>
          Terms of Service
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>Last updated: {new Date().toLocaleDateString()}</p>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>1. Acceptance of Terms</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            By accessing and using CourseMaker, you accept and agree to be bound by the terms and provision of this agreement.
          </p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>2. Use License</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            CourseMaker is a tool to help you organize and view your legally acquired educational content. 
            You agree not to use the service for any illegal or unauthorized purpose, including but not limited to copyright infringement.
          </p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>3. Disclaimer</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            The materials on CourseMaker are provided on an 'as is' basis. CourseMaker makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>4. Limitations</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            In no event shall CourseMaker or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on CourseMaker's website.
          </p>
        </section>
      </main>
    </div>
  );
};
