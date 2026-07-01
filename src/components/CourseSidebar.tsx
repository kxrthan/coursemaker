import React, { useState } from 'react';
import type { Course, CourseFile, CourseModule } from '../types';
import { ChevronDown, ChevronRight, PlayCircle, FileText, CheckCircle2, Circle, Image } from 'lucide-react';

interface CourseSidebarProps {
  course: Course;
  currentFileId: string | null;
  isOpen: boolean;
  onSelectFile: (file: CourseFile) => void;
  onToggleComplete: (fileId: string) => void;
}

export const CourseSidebar: React.FC<CourseSidebarProps> = ({ course, currentFileId, isOpen, onSelectFile, onToggleComplete }) => {
  return (
    <div 
      className="sidebar" 
      style={{ 
        width: isOpen ? 'var(--sidebar-width)' : '0px',
        opacity: isOpen ? 1 : 0,
        overflow: 'hidden',
        borderLeftWidth: isOpen ? '1px' : '0px'
      }}
    >
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', minWidth: 'var(--sidebar-width)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{course.name}</h2>
      </div>
      <div style={{ overflowY: 'auto', flex: 1, minWidth: 'var(--sidebar-width)' }}>
        {course.modules.map(module => (
          <ModuleAccordion 
            key={module.id} 
            module={module} 
            currentFileId={currentFileId} 
            onSelectFile={onSelectFile}
            onToggleComplete={onToggleComplete}
          />
        ))}
      </div>
    </div>
  );
};

interface ModuleAccordionProps {
  module: CourseModule;
  currentFileId: string | null;
  onSelectFile: (file: CourseFile) => void;
  onToggleComplete: (fileId: string) => void;
}

const ModuleAccordion: React.FC<ModuleAccordionProps> = ({ module, currentFileId, onSelectFile, onToggleComplete }) => {
  const [isOpen, setIsOpen] = useState(true);

  // Determine if any file in this module is currently active
  const hasActiveFile = module.files.some(f => f.id === currentFileId);
  const completedCount = module.files.filter(f => f.completed).length;

  return (
    <div>
      <div className="module-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="module-title">
          {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          <span>{module.name}</span>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {completedCount} / {module.totalFiles}
        </div>
      </div>
      
      {isOpen && (
        <div className="module-content animate-fade-in">
          {module.files.map(file => {
            const isActive = file.id === currentFileId;
            return (
              <div 
                key={file.id} 
                className={`lesson-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectFile(file)}
              >
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleComplete(file.id);
                  }}
                  style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', zIndex: 2 }}
                >
                  {file.completed ? (
                    <CheckCircle2 size={16} color="var(--success-color)" />
                  ) : (
                    <Circle size={16} color="var(--text-secondary)" />
                  )}
                </div>
                
                {file.type === 'video' ? <PlayCircle size={16} /> : file.type === 'image' ? <Image size={16} /> : <FileText size={16} />}
                
                <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.75rem' }} title={file.name}>
                  {file.name.length > 70 ? `${file.name.substring(0, 70)}...` : file.name}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
