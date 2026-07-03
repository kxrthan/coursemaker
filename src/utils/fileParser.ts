import type { Course, CourseModule, CourseFile } from '../types';

export const parseFilesToCourse = (files: FileList): Course | null => {
  if (files.length === 0) return null;

  // Find the root folder name from the first file's path
  const firstPathParts = files[0].webkitRelativePath.split('/');
  const courseName = firstPathParts.length > 0 ? firstPathParts[0] : 'My Course';

  const modulesMap = new Map<string, CourseModule>();
  const subtitlesMap = new Map<string, File>();

  Array.from(files).forEach((file, index) => {
    const pathParts = file.webkitRelativePath.split('/');
    if (pathParts.length < 2 || file.name.startsWith('.')) return;

    let moduleName = 'Other';
    if (pathParts.length >= 3) {
      moduleName = pathParts[pathParts.length - 2];
    } else {
      moduleName = 'Root Content';
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'vtt' || ext === 'srt') {
      subtitlesMap.set(file.webkitRelativePath, file);
      return;
    }

    const fileType = determineFileType(file.name, file.type);
    
    // Only include videos, pdfs, and images
    if (fileType === 'other') return;

    const courseFile: CourseFile = {
      id: `${file.name}-${index}`,
      name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension for display
      path: file.webkitRelativePath,
      url: URL.createObjectURL(file), // Create local URL for playback
      type: fileType,
      completed: false,
      file: file
    };

    if (!modulesMap.has(moduleName)) {
      modulesMap.set(moduleName, {
        id: `mod-${moduleName}`,
        name: moduleName,
        files: [],
        completedFiles: 0,
        totalFiles: 0
      });
    }

    const mod = modulesMap.get(moduleName)!;
    mod.files.push(courseFile);
    mod.totalFiles += 1;
  });

  // Attach subtitles to matching videos
  for (const mod of modulesMap.values()) {
    for (const courseFile of mod.files) {
      if (courseFile.type === 'video') {
        const basePath = courseFile.path.replace(/\.[^/.]+$/, "");
        for (const [subPath, subFile] of subtitlesMap.entries()) {
          if (subPath.startsWith(basePath + '.')) {
            courseFile.subtitleFile = subFile;
            break;
          }
        }
      }
    }
  }

  // Sort modules alphabetically
  const sortedModules = Array.from(modulesMap.values()).sort((a, b) => 
    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
  );

  // Sort files within modules
  sortedModules.forEach(mod => {
    mod.files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
  });

  return {
    id: 'course-1',
    name: courseName,
    modules: sortedModules.filter(m => m.files.length > 0)
  };
};

const determineFileType = (fileName: string, mimeType: string): 'video' | 'material' | 'image' | 'other' => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  if (mimeType.startsWith('video/') || ['mp4', 'webm', 'ogg', 'mkv', 'mov'].includes(ext || '')) {
    return 'video';
  }
  
  if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
    return 'image';
  }
  
  if (mimeType === 'application/pdf' || ['pdf'].includes(ext || '')) {
    return 'material';
  }
  
  return 'other';
};
