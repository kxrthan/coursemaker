import React, { useRef, useState, useEffect } from 'react';
import { Plus, BookOpen, LogOut, ArrowUpRight, Trash2, Edit3, Check, User, Zap } from 'lucide-react';
import type { Course } from '../types';

interface DashboardProps {
  username: string;
  courses: Course[];
  onSelectCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  onLogout: () => void;
  onAddCourseFiles: (files: File[] | FileList, handle?: any) => void;
  onGoHome: () => void;
  onUpdateUsername: (newUsername: string) => Promise<any>;
}

export const Dashboard: React.FC<DashboardProps> = ({ username, courses, onSelectCourse, onDeleteCourse, onLogout, onAddCourseFiles, onGoHome, onUpdateUsername }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(username);
  const [isUpdating, setIsUpdating] = useState(false);
  const [savedHandles, setSavedHandles] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let mounted = true;
    const checkHandles = async () => {
      const { getDirectoryHandle } = await import('../utils/fileSystem');
      const handles: Record<string, boolean> = {};
      for (const course of courses) {
        if (!course.modules[0]?.files[0]?.url) {
          try {
            const handle = await getDirectoryHandle(course.id);
            if (handle) handles[course.id] = true;
          } catch(e) {}
        }
      }
      if (mounted) setSavedHandles(handles);
    };
    checkHandles();
    return () => { mounted = false; };
  }, [courses]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddCourseFiles(e.target.files);
    }
  };

  const handleAddCourseClick = async () => {
    try {
      // @ts-ignore
      if (window.showDirectoryPicker) {
        // @ts-ignore
        const dirHandle = await window.showDirectoryPicker();
        const { readDirectoryAsFiles } = await import('../utils/fileSystem');
        const files = await readDirectoryAsFiles(dirHandle);
        onAddCourseFiles(files, dirHandle);
      } else {
        // Fallback for older browsers
        fileInputRef.current?.click();
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error("Failed to select directory:", err);
      }
    }
  };

  const handleSaveUsername = async () => {
    if (newUsername.trim() === '' || newUsername === username) {
      setIsEditingUsername(false);
      return;
    }
    setIsUpdating(true);
    await onUpdateUsername(newUsername.trim());
    setIsUpdating(false);
    setIsEditingUsername(false);
  };

  return (
    <div className="app-container" style={{ display: 'block', overflowY: 'auto' }}>
      <header className="header" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="logo" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '16px' }} onClick={onGoHome}>
          <Zap size={24} fill="var(--accent-color)" style={{ color: 'var(--accent-color)', filter: 'drop-shadow(0 0 8px var(--accent-color))' }} />
          <span className="logo-text">COURSEMAKER.</span>
        </div>
        <div className="dashboard-user-actions">
          {isEditingUsername ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} style={{ color: 'var(--text-secondary)' }} />
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Welcome,</span>
              <input 
                type="text" 
                value={newUsername} 
                onChange={e => setNewUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveUsername()}
                autoFocus
                disabled={isUpdating}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  color: 'var(--accent-color)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  width: '120px',
                  outline: 'none'
                }}
              />
              <button 
                onClick={handleSaveUsername} 
                disabled={isUpdating}
                style={{ background: 'var(--accent-color)', color: '#000', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', display: 'flex' }}
              >
                <Check size={14} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} style={{ color: 'var(--text-secondary)' }} />
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Welcome, <span style={{ color: 'white', fontWeight: 600 }}>{username}</span></span>
              <button 
                onClick={() => setIsEditingUsername(true)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: '4px' }}
                title="Edit Username"
              >
                <Edit3 size={14} className="hover:text-white transition-colors" />
              </button>
            </div>
          )}
          <button className="btn btn-secondary" onClick={onLogout} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-top">
          <div>
            <h1 className="dashboard-title">Your Dashboard</h1>
          </div>
          
          <button className="btn btn-primary" onClick={handleAddCourseClick}>
            <Plus size={20} />
            Add Course
          </button>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            // @ts-expect-error - webkitdirectory is non-standard but widely supported
            webkitdirectory="" 
            directory=""
            multiple
            style={{ display: 'none' }}
          />
        </div>

        {courses.length === 0 ? (
          <div className="upload-card animate-fade-in" style={{ margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(204, 255, 0, 0.1)', color: 'var(--accent-color)', marginBottom: '24px' }}>
              <BookOpen size={40} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '16px' }}>
              No courses yet.
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
              Upload a course directory to start your learning journey.
            </p>
            <button className="btn btn-primary" onClick={handleAddCourseClick}>
              Browse Folder <ArrowUpRight size={20} style={{ marginLeft: '8px' }}/>
            </button>
          </div>
        ) : (
          <div className="features-grid">
            {courses.map(course => {
              const totalFiles = course.modules.reduce((acc, mod) => acc + mod.files.length, 0);
              const completedFiles = course.modules.reduce((acc, mod) => acc + mod.files.filter(f => f.completed).length, 0);
              const progress = totalFiles > 0 ? Math.round((completedFiles / totalFiles) * 100) : 0;

              const hasFiles = !!course.modules[0]?.files[0]?.url;

              return (
                <div key={course.id} className="feature-card animate-fade-in" style={{ cursor: 'pointer', padding: '32px', position: 'relative', border: hasFiles ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255, 170, 0, 0.3)' }} onClick={() => onSelectCourse(course)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className={`feature-icon ${hasFiles ? 'bg-green' : ''}`} style={!hasFiles && !savedHandles[course.id] ? { background: 'transparent', color: '#ffaa00' } : (!hasFiles && savedHandles[course.id] ? { background: 'transparent', color: 'var(--accent-color)' } : {})}>
                      <BookOpen size={24} />
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCourse(course.id);
                      }}
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        color: 'var(--text-secondary)', 
                        cursor: 'pointer',
                        padding: '8px'
                      }}
                      className="hover:text-red-500 transition-colors"
                      title="Remove Course"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <h3 style={{ marginBottom: '8px' }}>{course.name}</h3>
                  <p style={{ marginBottom: '16px', fontSize: '0.9rem' }}>{totalFiles} Lessons</p>
                  
                  {!hasFiles && (
                    savedHandles[course.id] ? (
                      <div style={{ padding: '8px 12px', background: 'rgba(204, 255, 0, 0.1)', color: 'var(--accent-color)', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-color)' }}></div>
                        Needs Permission
                      </div>
                    ) : (
                      <div style={{ padding: '8px 12px', background: 'rgba(255, 170, 0, 0.1)', color: '#ffaa00', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffaa00' }}></div>
                        Needs Local Folder
                      </div>
                    )
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Progress</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--accent-color)', fontWeight: 600 }}>{progress}%</span>
                  </div>
                  <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
