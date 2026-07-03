import React, { useState, useEffect, useRef } from 'react';
import { LogOut, ArrowLeft, AlignRight, Bot, Settings } from 'lucide-react';
import type { Course, CourseFile } from './types';
import { parseFilesToCourse } from './utils/fileParser';
import { saveDirectoryHandle, getDirectoryHandle, verifyPermission, readDirectoryAsFiles } from './utils/fileSystem';
import { CourseSidebar } from './components/CourseSidebar';
import { VideoPlayer } from './components/VideoPlayer';
import { Auth } from './components/Auth';
import { LandingPage } from './components/LandingPage';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { ErrorPage } from './components/ErrorPage';
import { Dashboard } from './components/Dashboard';
import { AITutorPanel } from './components/AITutorPanel';
import { SettingsModal } from './components/SettingsModal';
import { parseFileText } from './utils/aiClient';
import { extractTextFromPdf } from './utils/pdfParser';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabase';
import './App.css';
import './landing.css';

function App() {
  const { user, logout, loading, updateUsername } = useAuth();
  
  const [showLanding, setShowLanding] = useState(true);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isNotFound, setIsNotFound] = useState(window.location.pathname !== '/');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [dbLoading, setDbLoading] = useState(false);
  const [modalState, setModalState] = useState<{
    title: string;
    message: React.ReactNode;
    type: 'success' | 'error' | 'warning';
  } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isAITutorOpen, setIsAITutorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [contextText, setContextText] = useState<string>('');
  const [contextImage, setContextImage] = useState<File | undefined>();

  useEffect(() => {
    const handleLocationChange = () => {
      setIsNotFound(window.location.pathname !== '/');
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Load courses from Supabase when user logs in
  useEffect(() => {
    if (user) {
      setDbLoading(true);
      const fetchCourses = async () => {
        const { data, error } = await supabase
          .from('user_courses')
          .select('course_id, course_data')
          .eq('user_id', user.id);

        if (error) {
          console.error("Error fetching courses from Supabase", error);
        } else if (data) {
          const loadedCourses = data.map(row => row.course_data as Course);
          setCourses(loadedCourses);
        }
        setDbLoading(false);
      };
      fetchCourses();
    } else {
      setCourses([]);
    }
  }, [user]);

  useEffect(() => {
    const active = courses.find(c => c.id === activeCourseId);
    const currFile = active?.modules.flatMap(m => m.files).find(f => f.id === currentFileId);
    
    setContextText('');
    setContextImage(undefined);

    if (!currFile) return;

    if (currFile.type === 'video' && currFile.subtitleFile) {
      parseFileText(currFile.subtitleFile).then(setContextText).catch(console.error);
    } else if (currFile.type === 'material' && currFile.path.toLowerCase().endsWith('.pdf')) {
      extractTextFromPdf(currFile.file).then(text => setContextText(text.substring(0, 15000))).catch(console.error);
    } else if (currFile.type === 'image') {
      setContextImage(currFile.file);
    }
  }, [courses, activeCourseId, currentFileId]);

  // Helper to save a single course to Supabase
  const saveCourseToSupabase = async (courseToSave: Course) => {
    if (!user) return;
    
    // Strip out the File objects before saving to JSON (they can't be stringified)
    const safeCourse = {
      ...courseToSave,
      modules: courseToSave.modules.map(m => ({
        ...m,
        files: m.files.map(f => ({
          ...f,
          file: undefined,
          url: '' // Reset the blob URL since it won't be valid on reload
        }))
      }))
    };

    const { error } = await supabase
      .from('user_courses')
      .upsert({
        user_id: user.id,
        course_id: safeCourse.id,
        course_data: safeCourse
      }, { onConflict: 'user_id, course_id' });

    if (error) {
      console.error("Error saving course to Supabase", error);
    }
  };

  const deleteCourseFromSupabase = async (courseId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('user_courses')
      .delete()
      .eq('user_id', user.id)
      .eq('course_id', courseId);
      
    if (error) {
      console.error("Error deleting course from Supabase", error);
    }
  };

  const handleAddCourseFiles = (files: FileList | File[], handle?: any, autoOpen = false) => {
    const parsedCourse = parseFilesToCourse(files as unknown as FileList);
    if (parsedCourse && parsedCourse.modules.length > 0) {
      const existingCourseIndex = courses.findIndex(c => c.name === parsedCourse.name);
      
      if (existingCourseIndex >= 0) {
        // We are RELINKING local files to a cloud-synced course
        const existingCourse = courses[existingCourseIndex];
        
        const updatedCourse = { ...existingCourse };
        updatedCourse.modules = updatedCourse.modules.map(mod => {
          const newMod = parsedCourse.modules.find(m => m.name === mod.name);
          return {
            ...mod,
            files: mod.files.map(file => {
              const newFile = newMod?.files.find(f => f.name === file.name);
              return {
                ...file,
                file: newFile?.file || file.file,
                url: newFile?.url || file.url,
                subtitleFile: newFile?.subtitleFile || file.subtitleFile
              };
            })
          };
        });
        
        setCourses(prev => {
          const next = [...prev];
          next[existingCourseIndex] = updatedCourse;
          return next;
        });
        if (handle) {
          saveDirectoryHandle(updatedCourse.id, handle);
        }
        
        if (autoOpen) {
          setActiveCourseId(updatedCourse.id);
          if (updatedCourse.modules.length > 0 && updatedCourse.modules[0].files.length > 0) {
            const firstUncompleted = updatedCourse.modules.flatMap(m => m.files).find(f => !f.completed);
            setCurrentFileId(firstUncompleted ? firstUncompleted.id : updatedCourse.modules[0].files[0].id);
          }
          setModalState(null);
        } else {
          setModalState({
            title: 'Files Re-linked',
            message: `Successfully re-linked local files for: ${updatedCourse.name}`,
            type: 'success'
          });
        }
      } else {
        // It's a completely new course
        parsedCourse.id = `course-${Date.now()}`;
        if (handle) {
          saveDirectoryHandle(parsedCourse.id, handle);
        }
        setCourses(prev => [...prev, parsedCourse]);
        saveCourseToSupabase(parsedCourse);
      }
    } else {
      setModalState({
        title: 'No Valid Files Found',
        message: 'No valid video, PDF, or image files found in the selected folder. Make sure the folder contains .mp4, .pdf, .jpg, or .png files.',
        type: 'warning'
      });
    }
  };

  const handleSelectCourse = async (course: Course) => {
    const totalFiles = course.modules.reduce((acc, mod) => acc + mod.files.length, 0);
    if (totalFiles === 0) {
       setModalState({
         title: 'Course Empty',
         message: 'This course is empty.',
         type: 'warning'
       });
       return;
    }

    // Check if the FIRST file in the FIRST module has a valid Blob URL or File object.
    // If it doesn't, it means we loaded from DB and need relinking.
    const hasFiles = !!course.modules[0]?.files[0]?.url;
    
    if (!hasFiles) {
      const handle = await getDirectoryHandle(course.id);
      
      if (handle) {
        setModalState({
          title: 'Permission Required',
          message: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p>We found the saved folder for this course. Click below to instantly grant read access so we can play the videos.</p>
              <button 
                className="btn btn-primary"
                onClick={async () => {
                  try {
                    const hasPermission = await verifyPermission(handle);
                    if (hasPermission) {
                      const newFiles = await readDirectoryAsFiles(handle);
                      handleAddCourseFiles(newFiles, handle, true);
                    }
                  } catch (e) {
                    console.error(e);
                  }
                }}
              >
                Grant Permission
              </button>
            </div>
          ),
          type: 'warning'
        });
      } else {
        setModalState({
          title: 'Local Files Needed',
          message: (
            <>This course is synced from the cloud, but the local video files are not linked yet. Please click <strong>'Add Course'</strong> and select the folder for this course on this computer to resume playback.</>
          ),
          type: 'warning'
        });
      }
      return;
    }

    setActiveCourseId(course.id);
    if (course.modules.length > 0 && course.modules[0].files.length > 0) {
      const firstUncompleted = course.modules.flatMap(m => m.files).find(f => !f.completed);
      setCurrentFileId(firstUncompleted ? firstUncompleted.id : course.modules[0].files[0].id);
    }
  };

  const confirmDeleteCourse = (courseId: string) => {
    setConfirmDeleteId(courseId);
  };

  const executeDeleteCourse = () => {
    if (!confirmDeleteId) return;
    setCourses(prev => prev.filter(c => c.id !== confirmDeleteId));
    deleteCourseFromSupabase(confirmDeleteId);
    if (activeCourseId === confirmDeleteId) {
      setActiveCourseId(null);
      setCurrentFileId(null);
    }
    setConfirmDeleteId(null);
  };

  const handleComplete = (fileId: string) => {
    setCourses(prev => {
      const next = prev.map(c => {
        if (c.id !== activeCourseId) return c;
        const updatedCourse = {
          ...c,
          modules: c.modules.map(mod => ({
            ...mod,
            files: mod.files.map(f => f.id === fileId ? { ...f, completed: !f.completed } : f)
          }))
        };
        // Background save to Supabase
        saveCourseToSupabase(updatedCourse);
        return updatedCourse;
      });
      return next;
    });
  };

  const handleNext = () => {
    const activeCourse = courses.find(c => c.id === activeCourseId);
    if (!activeCourse || !currentFileId) return;

    let allFiles: CourseFile[] = [];
    activeCourse.modules.forEach(m => allFiles.push(...m.files));
    
    const currentIndex = allFiles.findIndex(f => f.id === currentFileId);
    if (currentIndex >= 0 && currentIndex < allFiles.length - 1) {
      setCurrentFileId(allFiles[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    const activeCourse = courses.find(c => c.id === activeCourseId);
    if (!activeCourse || !currentFileId) return;

    let allFiles: CourseFile[] = [];
    activeCourse.modules.forEach(m => allFiles.push(...m.files));
    
    const currentIndex = allFiles.findIndex(f => f.id === currentFileId);
    if (currentIndex > 0) {
      setCurrentFileId(allFiles[currentIndex - 1].id);
    }
  };

  const activeCourse = courses.find(c => c.id === activeCourseId);

  if (loading) return null;

  if (isNotFound) {
    return (
      <ErrorPage 
        onGoHome={() => {
          window.history.pushState({}, '', '/');
          setIsNotFound(false);
          setShowLanding(true);
          setShowPrivacy(false);
          setShowTerms(false);
        }} 
      />
    );
  }

  if (showPrivacy) {
    return <PrivacyPolicy onBack={() => setShowPrivacy(false)} />;
  }

  if (showTerms) {
    return <TermsOfService onBack={() => setShowTerms(false)} />;
  }

  if (showLanding) {
    return (
      <LandingPage 
        onStart={() => setShowLanding(false)} 
        isLoggedIn={!!user}
        username={user?.username || user?.email?.split('@')[0]}
        onDashboardClick={() => setShowLanding(false)}
        onLogout={logout}
        onViewPrivacy={() => setShowPrivacy(true)}
        onViewTerms={() => setShowTerms(true)}
      />
    );
  }

  if (!user) {
    return <Auth onGoHome={() => setShowLanding(true)} />;
  }

  if (dbLoading) {
    return <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-secondary)' }}>Loading your cloud courses...</p>
    </div>;
  }

  if (!activeCourse) {
    return (
      <>
        <Dashboard 
          username={user.username || user.email.split('@')[0]} 
          courses={courses} 
          onSelectCourse={handleSelectCourse} 
          onDeleteCourse={confirmDeleteCourse}
          onLogout={logout}
          onAddCourseFiles={handleAddCourseFiles}
          onGoHome={() => setShowLanding(true)}
          onUpdateUsername={updateUsername}
        />
        {modalState && (
          <div className="modal-overlay animate-fade-in" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}>
            <div className="modal-content" style={{
              background: 'var(--bg-secondary)',
              padding: '32px',
              borderRadius: '16px',
              maxWidth: '400px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              textAlign: 'center'
            }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: modalState.type === 'success' ? 'rgba(204, 255, 0, 0.1)' : 'rgba(255, 68, 68, 0.1)',
                color: modalState.type === 'success' ? 'var(--accent-color)' : '#ff4444',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px'
              }}>
                {modalState.type === 'success' ? (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                )}
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>{modalState.title}</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
                {modalState.message}
              </p>
              <button 
                className="btn btn-primary" 
                onClick={() => setModalState(null)}
                style={{ width: '100%' }}
              >
                Got it
              </button>
            </div>
          </div>
        )}

        {confirmDeleteId && (
          <div className="modal-overlay animate-fade-in" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}>
            <div className="modal-content" style={{
              background: 'var(--bg-secondary)',
              padding: '32px',
              borderRadius: '16px',
              maxWidth: '400px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              textAlign: 'center'
            }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'rgba(255, 68, 68, 0.1)',
                color: '#ff4444',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Delete Course</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
                Are you sure you want to remove this course? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setConfirmDeleteId(null)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={executeDeleteCourse}
                  style={{ flex: 1, background: '#ff4444', color: 'white' }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Udemy Layout: Main Content (Video) on LEFT, Sidebar on RIGHT
  const totalFiles = activeCourse.modules.reduce((acc, mod) => acc + mod.files.length, 0);
  const completedFiles = activeCourse.modules.reduce((acc, mod) => acc + mod.files.filter(f => f.completed).length, 0);
  const progressPercentage = totalFiles > 0 ? Math.round((completedFiles / totalFiles) * 100) : 0;

  const currentFile = activeCourse.modules
    .flatMap(m => m.files)
    .find(f => f.id === currentFileId);

  return (
    <div className="app-container" style={{ flexDirection: 'row' }}>
      
      {/* LEFT SIDE: Main Content (Video Player) */}
      <div className="main-content" style={{ minWidth: 0 }}>
        <header className="header" style={{ padding: '0 24px', flexWrap: 'nowrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
            <button className="btn btn-secondary" onClick={() => setActiveCourseId(null)} style={{ padding: '8px', border: 'none', flexShrink: 0 }}>
              <ArrowLeft size={20} />
            </button>
            <h1 style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '1.1rem', paddingRight: '16px' }} title={activeCourse.name}>
              {activeCourse.name}
            </h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '150px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{progressPercentage}%</span>
              <div className="progress-container">
                <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
              </div>
            </div>
            <button className="btn btn-secondary" onClick={() => setIsAITutorOpen(!isAITutorOpen)} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <Bot size={16} />
              AI Tutor
            </button>
            <button className="btn btn-secondary" onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <AlignRight size={16} />
              {isSidebarOpen ? 'Hide' : 'Show'} Content
            </button>
            <button className="btn btn-secondary" onClick={() => setIsSettingsOpen(true)} style={{ padding: '8px', border: 'none', background: 'transparent' }}>
              <Settings size={20} />
            </button>
          </div>
        </header>
        
        {currentFile ? (
          <VideoPlayer 
            file={currentFile} 
            onComplete={handleComplete}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Select a lesson to start</p>
          </div>
        )}
      </div>

      {/* RIGHT SIDE: Sidebar (Course Content) */}
      <CourseSidebar 
        course={activeCourse} 
        currentFileId={currentFileId} 
        isOpen={isSidebarOpen}
        onSelectFile={(file) => setCurrentFileId(file.id)}
        onToggleComplete={handleComplete}
      />
      
      {/* AI TUTOR PANEL */}
      <AITutorPanel 
        isOpen={isAITutorOpen}
        onClose={() => setIsAITutorOpen(false)}
        contextTitle={currentFile?.name || activeCourse.name}
        contextText={contextText}
        contextImage={contextImage}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default App;
