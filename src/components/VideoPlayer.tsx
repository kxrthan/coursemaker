import React, { useEffect, useRef } from 'react';
import type { CourseFile } from '../types';
import { CheckCircle, Circle, ArrowRight, ArrowLeft } from 'lucide-react';
import { QuizGenerator } from './QuizGenerator';

interface VideoPlayerProps {
  file: CourseFile;
  onComplete: (fileId: string) => void;
  onNext: () => void;
  onPrevious?: () => void;
  onOpenSettings?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ file, onComplete, onNext, onPrevious, onOpenSettings }) => {
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
    <div className="video-player-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', overflowY: 'auto' }}>
      <div className="video-player-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
        <h2 className="video-player-title" title={file.name}>
          {file.name}
        </h2>
        <div className="video-player-actions" style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
          {file.path.toLowerCase().endsWith('.pdf') && onOpenSettings && (
            <QuizGenerator file={file.file} onOpenSettings={onOpenSettings} />
          )}

          {onPrevious && (
            <button 
              className="btn btn-primary"
              onClick={onPrevious}
              style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                fontSize: '0.85rem'
              }}
            >
              <ArrowLeft size={16} />
              Previous
            </button>
          )}

          <button 
            className="btn btn-primary"
            onClick={onNext}
            style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              fontSize: '0.85rem'
            }}
          >
            Next
            <ArrowRight size={16} />
          </button>
          
          <button 
            className="btn btn-secondary"
            onClick={() => onComplete(file.id)}
            style={{ 
              backgroundColor: file.completed ? 'var(--success-color)' : 'transparent',
              borderColor: file.completed ? 'var(--success-color)' : 'var(--border-color)',
              color: file.completed ? '#fff' : 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '0.85rem'
            }}
          >
            {file.completed ? <CheckCircle size={16} /> : <Circle size={16} />}
            {file.completed ? 'Completed' : 'Mark Complete'}
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
        <div className="pdf-container glass-panel animate-fade-in">
          <iframe 
            src={file.url} 
            title={file.name}
            className="pdf-iframe"
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
