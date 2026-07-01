import React, { useState, useRef, useEffect } from 'react';
import { Play, ArrowUpRight, FolderDown, PlayCircle, ShieldCheck, Plus, Minus, User, Zap } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  isLoggedIn?: boolean;
  username?: string;
  onDashboardClick?: () => void;
  onLogout?: () => void;
  onViewPrivacy: () => void;
  onViewTerms: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, isLoggedIn, username, onDashboardClick, onLogout, onViewPrivacy, onViewTerms }) => {
  const faqs = [
    {
      question: "Do I need to upload my video files to the cloud?",
      answer: "No! Your large video files stay completely local on your hard drive. We only sync your course structure and viewing progress to the cloud, which means zero upload times and total privacy."
    },
    {
      question: "Is CourseMaker really free?",
      answer: "Yes. Because you provide your own local storage for the heavy video files, our server costs are near zero, allowing us to offer the platform for free."
    },
    {
      question: "What file formats are supported?",
      answer: "Currently, we support .mp4, .mkv, .mov, .webm, and .ogg for video, .pdf for documents, and all standard image formats (.jpg, .png, .gif, .webp)."
    },
    {
      question: "How do I sync my progress across devices?",
      answer: "Just log in to your account on any device. Your dashboard will show your courses. To resume watching, simply click 'Add Course' and select the folder on your new device to re-link the local files."
    }
  ];

  const [openFaq, setOpenFaq] = useState<number | 0>(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="logo" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => window.scrollTo(0,0)} role="button" aria-label="Go to top">
          <Zap size={24} fill="var(--accent-color)" style={{ color: 'var(--accent-color)', filter: 'drop-shadow(0 0 8px var(--accent-color))' }} aria-hidden="true" />
          <span className="logo-text">COURSEMAKER.</span>
        </div>
        <nav className="header-nav">
          <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Home</a>
          <a href="#features" className="nav-link" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}>Features</a>
          <a href="#about" className="nav-link" onClick={(e) => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }}>About</a>
          <a href="#faq" className="nav-link" onClick={(e) => { e.preventDefault(); document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }); }}>FAQ</a>
        </nav>
        
        {isLoggedIn ? (
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowDropdown(!showDropdown)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: '1px solid var(--border-color)', background: 'transparent' }}
            >
              <User size={16} />
              <span style={{ fontWeight: 600 }}>{username}</span>
            </button>
            {showDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '8px 0',
                minWidth: '150px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                zIndex: 100
              }}>
                <button 
                  onClick={onDashboardClick}
                  style={{
                    width: '100%',
                    padding: '8px 16px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Dashboard
                </button>
                <button 
                  onClick={onLogout}
                  style={{
                    width: '100%',
                    padding: '8px 16px',
                    background: 'transparent',
                    border: 'none',
                    color: '#ff4444',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,68,68,0.1)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="btn btn-primary" onClick={onStart}>
            Explore now
          </button>
        )}
      </header>

      <main className="landing-main">
        {/* Hero Section */}
        <section className="hero-section">
          <span className="hero-subtitle-top animate-fade-in delay-1">ORGANIZE YOUR LEARNING !</span>
          
          <h1 className="hero-title animate-fade-in delay-2">
            Best course <br />
            <span className="text-accent">viewing platform</span> <br />
            for your future.
          </h1>
          
          <p className="hero-subtitle animate-fade-in delay-3">
            CourseMaker unites and organizes a growing ecosystem of local course files.
            Drag and drop your folders and instantly get a premium learning experience locally.
          </p>
          
          <div className="animate-fade-in delay-4" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
            <button className="btn btn-primary btn-large" onClick={onStart} style={{ padding: '16px 32px' }}>
              <ArrowUpRight size={24} style={{ marginRight: '8px' }}/>
              {isLoggedIn ? 'Continue Learning' : 'Start Learning'}
            </button>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="about-section animate-fade-in delay-4">
          <div className="about-content">
            <h2>Your <span className="text-accent">trusted</span> partner for local learning.</h2>
            <p>
              We believe your purchased courses should be easy to navigate without relying on external websites. 
              Our platform reads your local directories and constructs a beautiful, fast, and fully private viewing experience.
            </p>
            <p>
              Your files never leave your device. Progress is saved directly to your browser.
            </p>
          </div>
          <div className="about-visual">
            <div className="about-card">
              <div className="about-stat">100%</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Local & Private</h3>
              <p style={{ color: 'var(--text-secondary)' }}>No uploads. No servers. Total privacy for your files.</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="features-section">
          <div className="features-header">
            <h2>Why choose us?</h2>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-number">01.</div>
              <h3>Instant Organization</h3>
              <p>Drag and drop any folder. We parse the structure and instantly generate readable modules and lessons.</p>
            </div>
            
            <div className="feature-card highlight">
              <div className="feature-number">02.</div>
              <h3>Industry best practices.</h3>
              <p>We use modern web technologies to ensure a seamless, lag-free video playback experience with progress tracking.</p>
              <div style={{ marginTop: '24px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                Learn More <ArrowUpRight size={18} />
              </div>
            </div>
            
            <div className="feature-card">
              <div className="feature-number">03.</div>
              <h3>Protected by Privacy</h3>
              <p>Because everything runs entirely in your browser cache, your sensitive course materials are safe.</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="faq-section" style={{ width: '100%', maxWidth: '800px', margin: '0 auto 160px', padding: '0 24px', scrollMarginTop: '100px' }}>
          <div className="features-header">
            <h2>Frequently Asked Questions</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '16px', fontSize: '1.1rem' }}>Got questions? We've got answers.</p>
          </div>
          
          <div className="faq-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="faq-item" 
                style={{ 
                  background: 'var(--bg-secondary)', 
                  border: `1px solid ${openFaq === index ? 'var(--accent-color)' : 'var(--border-color)'}`,
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                  style={{ 
                    width: '100%', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '24px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  {faq.question}
                  <div style={{ color: openFaq === index ? '#000' : 'var(--accent-color)', background: openFaq === index ? 'var(--accent-color)' : 'transparent', borderRadius: '50%', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease' }}>
                    {openFaq === index ? <Minus size={20} /> : <Plus size={20} />}
                  </div>
                </button>
                
                <div 
                  style={{ 
                    maxHeight: openFaq === index ? '200px' : '0', 
                    opacity: openFaq === index ? 1 : 0,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease-in-out'
                  }}
                >
                  <p style={{ padding: '0 24px 24px', color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '1.05rem' }}>
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer / Contact */}
      <footer className="footer-section">
        <div className="footer-content">
          <div className="footer-col" style={{ maxWidth: '300px' }}>
            <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Zap size={24} fill="var(--accent-color)" style={{ color: 'var(--accent-color)', filter: 'drop-shadow(0 0 8px var(--accent-color))' }} />
              <span className="logo-text">COURSEMAKER.</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              A modern ecosystem for specialized local file viewing. Organize your files beautifully.
            </p>
          </div>
          
          <div className="footer-col">
            <h4>Quick Links</h4>
            <a href="#">Home</a>
            <a href="#">Features</a>
            <a href="#">About Us</a>
          </div>
          
          <div className="footer-col">
            <h4>Legal</h4>
            <a href="#" onClick={(e) => { e.preventDefault(); onViewPrivacy(); }}>Privacy Policy</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onViewTerms(); }}>Terms of Service</a>
          </div>
          
          <div className="footer-col">
            <h4>Ready to start?</h4>
            <button className="btn btn-primary" onClick={onStart} style={{ marginTop: '8px' }}>
              Launch App <ArrowUpRight size={18} style={{ marginLeft: '8px' }}/>
            </button>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '16px' }}>
              Ask question?
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
