import React, { useEffect, useRef } from 'react';
import type { CourseFile } from '../types';
import { CheckCircle, Circle, ArrowRight, ArrowLeft } from 'lucide-react';

interface VideoPlayerProps {
  file: CourseFile;
  onComplete: (fileId: string) => void;
  onNext: () => void;
  onPrevious?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ file, onComplete, onNext, onPrevious }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // When file changes, reload video
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(e => console.log('Autoplay prevented:', e));
    }
  }, [file]);

  const handleEnded = () => {
    onComplete(file.id);
    // Optional delay before moving to next
    setTimeout(() => {
      onNext();
    }, 1500);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ 
          fontSize: '1.1rem', 
          fontWeight: 600,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          marginRight: '16px',
          flex: 1
        }} title={file.name}>
          {file.name.length > 70 ? `${file.name.substring(0, 70)}...` : file.name}
        </h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          {onPrevious && (
            <button 
              className="btn btn-primary"
              onClick={onPrevious}
              style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
              }}
            >
              <ArrowLeft size={18} />
              Previous
            </button>
          )}

          <button 
            className="btn btn-primary"
            onClick={onNext}
            style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
            }}
          >
            Next
            <ArrowRight size={18} />
          </button>
          
          <button 
            className="btn btn-secondary"
            onClick={() => onComplete(file.id)}
            style={{ 
              backgroundColor: file.completed ? 'var(--success-color)' : 'transparent',
              borderColor: file.completed ? 'var(--success-color)' : 'var(--border-color)',
              color: file.completed ? '#fff' : 'var(--text-primary)'
            }}
          >
            {file.completed ? <CheckCircle size={18} /> : <Circle size={18} />}
            {file.completed ? 'Completed' : 'Mark as Complete'}
          </button>
        </div>
      </div>

      {file.type === 'video' ? (
        <div className="video-container animate-fade-in">
          <video 
            ref={videoRef}
            controls
            onEnded={handleEnded}
            style={{ width: '100%', height: '100%', backgroundColor: '#000' }}
          >
            <source src={file.url} type={file.file.type} />
            Your browser does not support HTML video.
          </video>
        </div>
      ) : file.type === 'material' ? (
        <div className="glass-panel animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <iframe 
            src={file.url} 
            title={file.name}
            style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px', minHeight: '600px' }}
          />
        </div>
      ) : file.type === 'image' ? (
        <div className="glass-panel animate-fade-in" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden' }}>
          <img 
            src={file.url} 
            alt={file.name} 
            style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
          />
        </div>
      ) : (
        <div className="glass-panel animate-fade-in" style={{ textAlign: 'center', padding: '60px' }}>
          <p>This file type is not supported for inline viewing.</p>
        </div>
      )}
    </div>
  );
};
